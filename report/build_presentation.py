"""
Presentation builder for the EV Auto Parts graduation defence.

Generates a 16:9 PowerPoint deck (right-to-left Arabic, project brand colours
from frontend/tailwind.config.js, Tajawal typeface) reusing the diagrams and
screenshots produced for the written report.

Usage (from the repository root):
    py report/build_presentation.py
"""

import glob
import os
import re

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Cm, Pt

ROOT = os.path.dirname(os.path.abspath(__file__))
DIAGRAMS = os.path.join(ROOT, "diagrams")
SHOTS = os.path.join(ROOT, "screenshots")
OUTPUT = os.path.join(ROOT, "EV-Auto-Parts-Presentation.pptx")

FONT = "Tajawal"
PRIMARY = RGBColor(0x25, 0x63, 0xEB)
PRIMARY_DARK = RGBColor(0x1E, 0x3A, 0x8A)
DARK = RGBColor(0x0F, 0x17, 0x2A)
MUTED = RGBColor(0x47, 0x55, 0x69)
LIGHT = RGBColor(0xF8, 0xFA, 0xFC)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
SUCCESS = RGBColor(0x16, 0xA3, 0x4A)
ERROR = RGBColor(0xDC, 0x26, 0x26)

SLIDE_W, SLIDE_H = Cm(33.867), Cm(19.05)

STUDENTS = [
    ("مهند محمد ماهر السقر", "192707"),
    ("عمر محمد زياد السقر", "130862"),
    ("كامل أحمد", "[الرقم الجامعي]"),
]


def diagram(fig_no):
    """Return the rendered PNG for a report figure number (fig01 ... fig12)."""
    matches = sorted(glob.glob(os.path.join(DIAGRAMS, f"fig{fig_no:02d}-*.png")))
    return matches[-1] if matches else None


def set_rtl(paragraph, align=PP_ALIGN.RIGHT, bullet=False):
    pPr = paragraph._p.get_or_add_pPr()
    pPr.set("rtl", "1")
    paragraph.alignment = align
    if bullet:
        # Native bullet so PowerPoint places the glyph on the right side in RTL
        from pptx.oxml import parse_xml
        pPr.set("marL", str(Cm(0.6)))
        pPr.set("indent", str(-Cm(0.6)))
        pPr.append(parse_xml('<a:buClr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:srgbClr val="2563EB"/></a:buClr>'))
        pPr.append(parse_xml('<a:buChar xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" char="•"/>'))


_OPEN = {"(": ")", "[": "]", "{": "}", "“": "”", "«": "»"}
_CLOSE = {v: k for k, v in _OPEN.items()}


def split_bidi_runs(text):
    """
    Split mixed text into (segment, is_arabic) runs.

    Neutral characters are attached to a side so PowerPoint renders them at the
    right place: brackets follow the run of the text they enclose, other neutrals
    (space, colon, comma) follow the preceding strong character. Trailing spaces
    of a Latin run are moved to the following run because PowerPoint drops them
    at a language boundary.
    """
    def strong(ch):
        if "\u0600" <= ch <= "\u06FF":
            return "A"
        if ch.isalnum():
            return "L"
        return None

    classes = [strong(ch) for ch in text]
    # Resolve brackets first: opening -> class of next strong char, closing -> opener's class
    stack = []
    for i, ch in enumerate(text):
        if ch in _OPEN:
            # Bracketed group is Arabic if it contains any Arabic letter, else Latin
            close_at = text.find(_OPEN[ch], i + 1)
            inner = text[i + 1:close_at if close_at != -1 else None]
            classes[i] = "A" if re.search(r"[\u0600-\u06FF]", inner) else "L"
            stack.append((ch, classes[i]))
        elif ch in _CLOSE:
            if stack and stack[-1][0] == _CLOSE[ch]:
                classes[i] = stack.pop()[1]
            else:
                classes[i] = "A"
    # Remaining neutrals follow the previous strong char (or the next one at line start)
    prev = None
    for i, c in enumerate(classes):
        if c:
            prev = c
        else:
            classes[i] = prev or next((x for x in classes[i + 1:] if x), "A")
    # Group into runs
    runs = []
    for ch, c in zip(text, classes):
        if runs and runs[-1][1] == c:
            runs[-1][0] += ch
        else:
            runs.append([ch, c])
    # Move trailing whitespace of Latin runs to the next run
    for i in range(len(runs) - 1):
        if runs[i][1] == "L":
            stripped = runs[i][0].rstrip()
            if stripped != runs[i][0]:
                runs[i + 1][0] = runs[i][0][len(stripped):] + runs[i + 1][0]
                runs[i][0] = stripped
    return [(seg, cls == "A") for seg, cls in runs if seg]


def style_run(run, size, bold=False, color=DARK, font=FONT):
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    # Complex-script font so Arabic glyphs use the brand typeface too
    rPr = run._r.get_or_add_rPr()
    for tag in ("a:latin", "a:cs", "a:ea"):
        el = rPr.find(qn(tag))
        if el is None:
            from pptx.oxml import parse_xml
            el = parse_xml(f'<{tag} xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" typeface="{font}"/>')
            rPr.append(el)
        el.set("typeface", font)


class Deck:
    def __init__(self):
        self.prs = Presentation()
        self.prs.slide_width = SLIDE_W
        self.prs.slide_height = SLIDE_H
        self.blank = self.prs.slide_layouts[6]
        self.logo = os.path.join(DIAGRAMS, "ev-logo.png")
        self.count = 0

    # -- primitives --------------------------------------------------------
    def rect(self, slide, x, y, w, h, fill, shape=MSO_SHAPE.RECTANGLE):
        s = slide.shapes.add_shape(shape, x, y, w, h)
        s.fill.solid()
        s.fill.fore_color.rgb = fill
        s.line.fill.background()
        s.shadow.inherit = False
        return s

    def text(self, slide, x, y, w, h, lines, size=18, color=DARK, bold=False,
             align=PP_ALIGN.RIGHT, anchor=MSO_ANCHOR.TOP, bullets=False, line_gap=6):
        tb = slide.shapes.add_textbox(x, y, w, h)
        tf = tb.text_frame
        tf.word_wrap = True
        tf.vertical_anchor = anchor
        first = True
        for item in lines:
            if isinstance(item, tuple):
                txt, kw = item
            else:
                txt, kw = item, {}
            p = tf.paragraphs[0] if first else tf.add_paragraph()
            first = False
            set_rtl(p, align, bullet=bullets and not kw.get("heading"))
            p.space_after = Pt(line_gap)
            # Split into Arabic / non-Arabic runs: Arabic runs carry lang="ar-SY" so
            # PowerPoint applies proper bidi; Latin+digit runs carry lang="en-US" so
            # digits stay Western (PowerPoint would otherwise show Arabic-Indic digits).
            for segment, is_arabic in split_bidi_runs(txt):
                run = p.add_run()
                run.text = segment
                style_run(run, kw.get("size", size), kw.get("bold", bold), kw.get("color", color))
                run._r.get_or_add_rPr().set("lang", "ar-SY" if is_arabic else "en-US")
        return tb

    def frame(self, title, subtitle=None):
        """Standard content slide: white body, blue title band on the right, footer."""
        slide = self.prs.slides.add_slide(self.blank)
        self.count += 1
        self.rect(slide, 0, 0, SLIDE_W, Cm(2.6), PRIMARY_DARK)
        self.rect(slide, 0, Cm(2.6), SLIDE_W, Cm(0.12), PRIMARY)
        slide.shapes.add_picture(self.logo, SLIDE_W - Cm(2.9), Cm(0.45), height=Cm(1.7))
        self.text(slide, Cm(1.0), Cm(0.35), SLIDE_W - Cm(4.2), Cm(2.0), [title],
                  size=26, color=WHITE, bold=True, anchor=MSO_ANCHOR.MIDDLE)
        if subtitle:
            self.text(slide, Cm(1.0), Cm(2.9), SLIDE_W - Cm(2.0), Cm(1.2), [subtitle],
                      size=15, color=MUTED)
        # footer
        self.rect(slide, 0, SLIDE_H - Cm(0.9), SLIDE_W, Cm(0.9), LIGHT)
        self.text(slide, Cm(1.0), SLIDE_H - Cm(0.9), SLIDE_W - Cm(2.0), Cm(0.9),
                  [f"EV Auto Parts  |  BPR 602  |  S25  |  {self.count}"], size=10, color=MUTED,
                  align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.MIDDLE)
        return slide

    def picture_fit(self, slide, path, x, y, w, h):
        """Place an image inside a box keeping aspect ratio (centred)."""
        from PIL import Image
        with Image.open(path) as im:
            iw, ih = im.size
        scale = min(w / iw, h / ih)
        pw, ph = int(iw * scale), int(ih * scale)
        pic = slide.shapes.add_picture(path, x + (w - pw) // 2, y + (h - ph) // 2, width=pw, height=ph)
        pic.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
        pic.line.width = Pt(0.75)
        return pic

    def bullets_and_image(self, title, bullets, image, subtitle=None, image_side="left", size=16):
        slide = self.frame(title, subtitle)
        top = Cm(4.3) if subtitle else Cm(3.4)
        body_h = SLIDE_H - top - Cm(1.3)
        if image and os.path.exists(image):
            img_w = SLIDE_W * 0.55
            txt_w = SLIDE_W - img_w - Cm(2.5)
            if image_side == "left":
                self.picture_fit(slide, image, Cm(0.8), top, img_w, body_h)
                self.text(slide, img_w + Cm(1.6), top, txt_w, body_h, bullets, size=size, bullets=True, line_gap=10)
            else:
                self.picture_fit(slide, image, SLIDE_W - img_w - Cm(0.8), top, img_w, body_h)
                self.text(slide, Cm(1.0), top, txt_w, body_h, bullets, size=size, bullets=True, line_gap=10)
        else:
            self.text(slide, Cm(1.5), top, SLIDE_W - Cm(3.0), body_h, bullets, size=size + 2, bullets=True, line_gap=12)
        return slide

    def cards(self, title, items, subtitle=None, cols=3):
        """Grid of rounded cards (like the site's stat cards)."""
        slide = self.frame(title, subtitle)
        top = Cm(4.3) if subtitle else Cm(3.5)
        gap = Cm(0.6)
        rows = (len(items) + cols - 1) // cols
        card_w = (SLIDE_W - Cm(2.0) - gap * (cols - 1)) / cols
        card_h = (SLIDE_H - top - Cm(1.4) - gap * (rows - 1)) / rows
        for idx, (head, body) in enumerate(items):
            r, c = divmod(idx, cols)
            # RTL grid: first card at the right
            x = SLIDE_W - Cm(1.0) - card_w - c * (card_w + gap)
            y = top + r * (card_h + gap)
            card = self.rect(slide, x, y, card_w, card_h, LIGHT, MSO_SHAPE.ROUNDED_RECTANGLE)
            card.adjustments[0] = 0.08
            card.line.color.rgb = RGBColor(0xE2, 0xE8, 0xF0)
            self.rect(slide, x + card_w - Cm(0.9), y + Cm(0.5), Cm(0.25), Cm(1.0), PRIMARY)
            self.text(slide, x + Cm(0.4), y + Cm(0.3), card_w - Cm(1.6), Cm(1.5), [head],
                      size=17, bold=True, color=PRIMARY_DARK)
            self.text(slide, x + Cm(0.4), y + Cm(1.8), card_w - Cm(0.8), card_h - Cm(2.0),
                      body if isinstance(body, list) else [body], size=13, color=MUTED, bullets=isinstance(body, list), line_gap=5)
        return slide

    # -- slides --------------------------------------------------------------
    def title_slide(self):
        slide = self.prs.slides.add_slide(self.blank)
        self.count += 1
        self.rect(slide, 0, 0, SLIDE_W, SLIDE_H, PRIMARY_DARK)
        self.rect(slide, 0, SLIDE_H * 0.62, SLIDE_W, SLIDE_H * 0.38, WHITE)
        self.rect(slide, 0, SLIDE_H * 0.62 - Cm(0.15), SLIDE_W, Cm(0.15), PRIMARY)
        slide.shapes.add_picture(self.logo, SLIDE_W / 2 - Cm(1.6), Cm(1.3), height=Cm(3.2))
        self.text(slide, Cm(2), Cm(4.8), SLIDE_W - Cm(4), Cm(2.2), ["EV Auto Parts"],
                  size=44, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        self.text(slide, Cm(2), Cm(7.0), SLIDE_W - Cm(4), Cm(1.4),
                  ["منصة إلكترونية ذكية لبيع قطع غيار السيارات الكهربائية بالبحث باللغة الطبيعية والتحقق من التوافق"],
                  size=18, color=RGBColor(0xBF, 0xDB, 0xFE), align=PP_ALIGN.CENTER)
        self.text(slide, Cm(2), Cm(8.8), SLIDE_W - Cm(4), Cm(1.2),
                  ["الجامعة الافتراضية السورية  |  كلية هندسة المعلوماتية  |  BPR 602 – مشروع التخرج  |  S25"],
                  size=14, color=RGBColor(0x93, 0xC5, 0xFD), align=PP_ALIGN.CENTER)
        # students row (RTL: first student at the right)
        col_w = (SLIDE_W - Cm(4)) / 3
        for i, (name, sid) in enumerate(STUDENTS):
            x = SLIDE_W - Cm(2) - col_w * (i + 1)
            y = SLIDE_H * 0.62 + Cm(1.2)
            self.rect(slide, x + Cm(0.5), y, col_w - Cm(1.0), Cm(3.0), LIGHT, MSO_SHAPE.ROUNDED_RECTANGLE)
            self.text(slide, x + Cm(0.6), y + Cm(0.3), col_w - Cm(1.2), Cm(1.3), [name],
                      size=17, bold=True, color=DARK, align=PP_ALIGN.CENTER)
            self.text(slide, x + Cm(0.6), y + Cm(1.6), col_w - Cm(1.2), Cm(1.0), [f"الرقم الجامعي: {sid}"],
                      size=13, color=MUTED, align=PP_ALIGN.CENTER)
        self.text(slide, Cm(2), SLIDE_H - Cm(1.6), SLIDE_W - Cm(4), Cm(1.0), ["تاريخ التسليم: 14-09-2026"],
                  size=13, color=MUTED, align=PP_ALIGN.CENTER)

    def closing_slide(self):
        slide = self.prs.slides.add_slide(self.blank)
        self.count += 1
        self.rect(slide, 0, 0, SLIDE_W, SLIDE_H, PRIMARY_DARK)
        slide.shapes.add_picture(self.logo, SLIDE_W / 2 - Cm(1.5), Cm(4.5), height=Cm(3.0))
        self.text(slide, Cm(2), Cm(8.2), SLIDE_W - Cm(4), Cm(2), ["شكراً لحسن استماعكم"],
                  size=40, bold=True, color=WHITE, align=PP_ALIGN.CENTER)
        self.text(slide, Cm(2), Cm(10.6), SLIDE_W - Cm(4), Cm(1.5), ["EV Auto Parts  —  أسئلتكم ومناقشتكم"],
                  size=18, color=RGBColor(0xBF, 0xDB, 0xFE), align=PP_ALIGN.CENTER)

    def build(self):
        self.title_slide()

        self.cards("المشكلة", [
            ("صعوبة التعبير عن الحاجة", "المستخدم يعرف حاجته بلغة طبيعية لكنه لا يعرف تصنيف القطعة أو رقمها"),
            ("غياب التحقق من التوافق", "المتاجر التقليدية تعرض القطعة دون التأكد من ملاءمتها لمركبة المستخدم"),
            ("تشتّت المعلومات", "التوافق يعتمد على الماركة والموديل والسنة ونوع الموصل وفئة الجهد"),
            ("انقطاع تجربة الزائر", "فرض التسجيل قبل تكوين السلة يُفقد الزائر ما جمعه"),
            ("خصوصية قطع EV", "بطاريات جهد عالٍ، شواحن OBC، كابلات CCS2، محوّلات DC-DC"),
            ("ضعف البحث التقليدي", "الكلمات المفتاحية لا تفهم القصد: \"Need a fast charger\""),
        ], subtitle="لماذا يختلف سوق قطع غيار السيارات الكهربائية؟")

        self.bullets_and_image("الفكرة والأهداف", [
            "بحث بعبارة طبيعية إنجليزية يستخرج نوع القطعة والماركة والموديل والسنة",
            "تراجع تدرجي بأربع استراتيجيات يضمن إرجاع نتائج مفيدة",
            "تسجيل مركبات المستخدم والتحقق الحتمي من توافق أي قطعة معها",
            "سلة زائر تُدمج آلياً عند تسجيل الدخول أو إنشاء الحساب",
            "مساعد محادثة يعرف سياق المستخدم مع مسار بديل قائم على القواعد",
            "توصيات مبنية على بيانات المنصة ولوحة إدارة كاملة",
            "ممارسات أمنية: bcrypt، JWT، تفويض حسب الدور، تحقق من المدخلات",
        ], diagram(1), subtitle="حالات الاستخدام الرئيسية للأدوار الأربعة (الشكل 1 في التقرير)")

        self.bullets_and_image("المعمارية العامة", [
            "معمارية ثلاثية الطبقات: React 18 SPA ← REST API ← MongoDB",
            "الخادم بطبقات: Routes → Middleware → Controllers → Services → Models",
            "OpenAI (gpt-4o-mini) لطبقة الفهم فقط؛ Redis اختياري للتخزين المؤقت",
            "الخادم مصدر الحقيقة: الأسعار والضرائب والمخزون تُحسب على الخادم",
            "تدهور رشيق: كل اعتماد خارجي له مسار بديل لا يوقف الخدمة",
            "11 مجموعة بيانات و9 وحدات API و27 صفحة عميل و13 صفحة إدارة",
        ], diagram(6), subtitle="مخطط المكوّنات (الشكل 6)")

        self.bullets_and_image("تصميم قاعدة البيانات", [
            "نموذج وثائقي: تضمين التوافق والمواصفات داخل المنتج",
            "GuestCart بمعرّف جلسة وفهرس TTL يحذفها بعد 30 يوماً",
            "Order يحفظ لقطة (Snapshot) من المنتج وقت الشراء",
            "Settings مستند وحيد: EUR، ضريبة 19%، شحن 12 €، مجاني من 150 €",
            "حذف ناعم بعلم isActive حفاظاً على الطلبات التاريخية",
        ], diagram(7), subtitle="مخطط الصفوف لنماذج المجال (الشكل 7)")

        self.bullets_and_image("البحث الذكي: LLM في الفهم فقط، والقرار حتمي", [
            ("LLM-Assisted", {"bold": True, "color": PRIMARY, "heading": True}),
            "استخراج JSON (partType, brand, model, year) من العبارة",
            "مسار بديل بالكلمات المفتاحية بثقة 30 عند تعطّل الخدمة",
            ("Deterministic", {"bold": True, "color": SUCCESS, "heading": True}),
            "تطبيع الماركات والموديلات بقواميس الأسماء البديلة",
            "تراجع تدرجي: strict → no_year → no_model → no_brand",
            "ترتيب موزون: توافق المركبة 30، نص 20، ماركة 15، موديل 10، شعبية 10 …",
            "توافق صريح: brand == && model == && yearFrom ≤ year ≤ yearTo",
        ], diagram(4), subtitle="مخطط النشاط للبحث الذكي مع المسار البديل (الشكل 4)", size=15)

        self.bullets_and_image("سلة الزائر ودمجها عند المصادقة", [
            "المتصفح يولّد cart_session_id ويرسله في ترويسة X-Cart-Session",
            "الخادم يُخزّن سلة الزائر في GuestCart مع التحقق من المخزون",
            "الإجماليات تُحسب على الخادم بالضريبة والشحن باليورو",
            "عند login/register يُمرَّر cartSessionId فتُدمج الكميات وتُحذف سلة الزائر",
            "نتيجة الاختبار الفعلي: المنتج انتقل بكمية 2 وسلة الزائر أصبحت فارغة",
        ], diagram(5), subtitle="مخطط النشاط لسلة الزائر (الشكل 5)")

        self.cards("التقنيات المستخدمة", [
            ("الواجهة الأمامية", ["React 18 + Vite 4", "React Router 6", "Tailwind CSS 3 (وضع ليلي)", "Axios، react-hook-form، react-hot-toast", "Recharts للوحة الإدارة"]),
            ("الواجهة الخلفية", ["Node.js ≥ 18 + Express 4", "Mongoose 7 / MongoDB", "JWT + bcrypt (معامل 12)", "express-validator، Helmet، CORS", "express-rate-limit"]),
            ("الذكاء الاصطناعي والبنية", ["OpenAI SDK v4 – gpt-4o-mini", "ioredis (اختياري، اتصال كسول)", "PlantUML للنمذجة", "Git: 42 إيداعاً", "مجموعة بذر: 8 ماركات، 25 موديلاً، 48 منتجاً"]),
        ], subtitle="MERN Stack مع طبقة ذكاء اصطناعي هجينة")

        self.bullets_and_image("النظام العامل: البحث الذكي", [
            "الاستعلام: \"Battery for Tesla Model 3 2022\"",
            "مفتاح OpenAI غير صالح عمداً → المسار البديل (fallback = true)",
            "الاستخراج: battery / Tesla / 2022، الاستراتيجية strict",
            "5 نتائج، أوّلها Tesla Model 3 12V Auxiliary Battery بدرجة 65",
            "زمن الاستجابة 657 ملّي ثانية",
        ], os.path.join(SHOTS, "fig13b-search-results.png"), subtitle="لقطة حقيقية من النظام (الشكل 14 في التقرير)")

        slide = self.frame("النظام العامل: التحقق الحتمي من التوافق", "المنتج نفسه مع مركبتَين مختلفتَين للمستخدم (الشكلان 15 و16)")
        half = (SLIDE_W - Cm(2.4)) / 2
        self.picture_fit(slide, os.path.join(SHOTS, "fig14-product-compatible.png"), SLIDE_W - Cm(0.8) - half, Cm(4.3), half, Cm(11.5))
        self.picture_fit(slide, os.path.join(SHOTS, "fig14b-product-incompatible.png"), Cm(0.8), Cm(4.3), half, Cm(11.5))
        self.text(slide, SLIDE_W - Cm(0.8) - half, Cm(16.0), half, Cm(1.2), ["Tesla Model 3 (2022) ← متوافق"], size=15, bold=True, color=SUCCESS, align=PP_ALIGN.CENTER)
        self.text(slide, Cm(0.8), Cm(16.0), half, Cm(1.2), ["BYD Atto 3 (2023) ← غير متوافق"], size=15, bold=True, color=ERROR, align=PP_ALIGN.CENTER)

        slide = self.frame("النظام العامل: المساعد الذكي ولوحة الإدارة", "المحادثة بالمسار البديل عند تعطّل OpenAI (الشكل 17) ولوحة القيادة بمؤشّرات حقيقية (الشكل 18)")
        self.picture_fit(slide, os.path.join(SHOTS, "fig15-chatbot-fallback.png"), SLIDE_W - Cm(0.8) - half, Cm(4.3), half, Cm(12.8))
        self.picture_fit(slide, os.path.join(SHOTS, "fig16-admin-overview.png"), Cm(0.8), Cm(4.3), half, Cm(12.8))

        self.cards("الاختبارات المنفّذة فعلياً", [
            ("16 حالة اختبار API", ["14 ناجحة (3 بملاحظات)", "2 فاشلة: البحث العربي (500)، مسار غير موجود (500)"]),
            ("11 عيباً مكتشفاً", ["1 حرج أُصلح (خطأ صياغة evCatalog)", "10 مفتوحة موثّقة بالخطورة والمصدر"]),
            ("ما ثبت عمله", ["التراجع التدرجي والترتيب", "سلة الزائر والدمج", "التوافق وفحص الملكية (401/404)", "دورة الطلب: 687.82 € ومخزون 80→78→80", "التفويض: 403 للعميل والمورّد"]),
            ("أبرز العيوب المفتوحة", ["الخادم يتوقف بلا OPENAI_API_KEY", "قبول انتقال cancelled → confirmed", "field: undefined في أخطاء التحقق", "نص شحن مجاني €500 مقابل إعداد €150"]),
        ], subtitle="نتائج حقيقية على النظام العامل بتاريخ 2026-09-13", cols=2)

        self.cards("القيود والآفاق المستقبلية", [
            ("القيود الحالية", ["الاعتماد على OpenAI مع مسار بديل محدود", "الواجهة إنجليزية فقط؛ البحث العربي يفشل", "التوافق لا يستخدم الخصائص الكهربائية", "لا معاملات في إنشاء الطلب؛ لا اختبارات آلية"]),
            ("أولوية عالية", ["إصلاح D-02 إلى D-05", "إنشاء الطلب ضمن معاملة MongoDB", "اختبارات Jest + Supertest للحالات المنفّذة"]),
            ("أولوية متوسطة وتوسعية", ["الموصل وفئة الجهد في قرار التوافق", "كتالوج ماركات قابل للإدارة", "واجهة عربية RTL، لوحة مورّد، بوابة دفع", "تقييم كمّي لدقّة الاستخراج"]),
        ], subtitle="نموذج أكاديمي عملي وخارطة طريق واضحة")

        self.closing_slide()
        self.prs.save(OUTPUT)
        print(f"Written: {OUTPUT} ({self.count} slides)")


if __name__ == "__main__":
    Deck().build()
