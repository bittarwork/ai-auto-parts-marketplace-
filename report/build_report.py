"""
Report builder for the EV Auto Parts graduation report.

Reads the chapter source files (plain-text mini-markup) from report/src/,
renders PlantUML diagrams to PNG (via the public PlantUML server when
reachable, otherwise keeps the source as a code block), and writes a
right-to-left Arabic .docx document using python-docx.

Usage (from the repository root):
    py report/build_report.py

Mini-markup supported in the source files:
    #PAGEBREAK                 -> hard page break
    # Title                    -> chapter title page (level-1 heading on its own page)
    ## / ### / ####            -> heading levels 2-4
    - text                     -> bullet item
    1. text                    -> numbered item
    TABLE: caption             -> caption for the pipe table that follows
    | a | b |                  -> pipe table row (first row = header)
    FIGURE: caption            -> caption for the figure that follows
    IMG: relative/path.png     -> image figure (relative to report/)
    ```plantuml ... ```        -> PlantUML figure (rendered or kept as source)
    ```code ... ```            -> LTR monospace block (any other language tag)
    @COVER / @TOC / @LOF / @LOT -> generated front-matter blocks
    **bold**                   -> inline bold
    Any other line             -> body paragraph
"""

import base64
import hashlib
import os
import re
import sys
import urllib.request
import zlib

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(ROOT, "src")
DIAGRAM_DIR = os.path.join(ROOT, "diagrams")
OUTPUT = os.path.join(ROOT, "EV-Auto-Parts-Graduation-Report.docx")

# Brand identity taken from frontend/tailwind.config.js (primary / secondary palettes,
# Tajawal as the Arabic typeface). Latin fallback is Segoe UI when Tajawal lacks a glyph.
ARABIC_FONT = "Tajawal"
CODE_FONT = "Consolas"
BODY_SIZE = Pt(11)  # Tajawal has a tall x-height; 11 pt reads like 12 pt Arial
BRAND_PRIMARY = RGBColor(0x25, 0x63, 0xEB)      # primary-600
BRAND_PRIMARY_DARK = RGBColor(0x1E, 0x3A, 0x8A) # primary-900
BRAND_DARK = RGBColor(0x0F, 0x17, 0x2A)         # secondary-900 (dark text)
BRAND_MUTED = RGBColor(0x47, 0x55, 0x69)        # secondary-600
BRAND_HEADER_FILL = "DBEAFE"                    # primary-100
BRAND_ROW_FILL = "F8FAFC"                       # secondary-50
BRAND_PRIMARY_HEX = "2563EB"

# ---------------------------------------------------------------------------
# Cover page data (no supervisor / no committee by explicit request)
# ---------------------------------------------------------------------------
COVER = {
    "university": "الجامعة الافتراضية السورية",
    "faculty": "كلية هندسة المعلوماتية",
    "course": "المقرر: BPR 602 – مشروع التخرج",
    "report_type": "التقرير النهائي لمشروع التخرج",
    "title_ar": "EV Auto Parts",
    "subtitle_ar": "منصة إلكترونية ذكية لبيع قطع غيار السيارات الكهربائية مدعومة بالبحث باللغة الطبيعية والتحقق من التوافق",
    # (student name, university ID)
    "students": [
        ("مهند محمد ماهر السقر", "192707"),
        ("عمر محمد زياد السقر", "130862"),
        ("كامل أحمد", "[الرقم الجامعي]"),
    ],
    "semester": "الفصل الدراسي S25",
    "date": "تاريخ التسليم: 14-09-2026",
}


# ---------------------------------------------------------------------------
# Low-level XML helpers
# ---------------------------------------------------------------------------
def set_rtl(paragraph, rtl=True):
    """Mark a paragraph as bidirectional (right-to-left)."""
    pPr = paragraph._p.get_or_add_pPr()
    bidi = pPr.find(qn("w:bidi"))
    if bidi is None:
        bidi = OxmlElement("w:bidi")
        pPr.append(bidi)
    bidi.set(qn("w:val"), "1" if rtl else "0")


def set_run_font(run, name=ARABIC_FONT, size=BODY_SIZE, bold=None, color=None):
    """Apply a font to both the Latin and complex-script slots of a run."""
    run.font.name = name
    run.font.size = size
    if bold is not None:
        run.font.bold = bold
    if color is not None:
        run.font.color.rgb = color
    rPr = run._r.get_or_add_rPr()
    rFonts = rPr.find(qn("w:rFonts"))
    if rFonts is None:
        rFonts = OxmlElement("w:rFonts")
        rPr.append(rFonts)
    rFonts.set(qn("w:ascii"), name)
    rFonts.set(qn("w:hAnsi"), name)
    rFonts.set(qn("w:cs"), name)
    rFonts.set(qn("w:eastAsia"), name)
    # Complex-script size / bold so Arabic glyphs follow the same styling
    szCs = rPr.find(qn("w:szCs"))
    if szCs is None:
        szCs = OxmlElement("w:szCs")
        rPr.append(szCs)
    szCs.set(qn("w:val"), str(int(size.pt * 2)))
    if bold:
        bCs = rPr.find(qn("w:bCs"))
        if bCs is None:
            bCs = OxmlElement("w:bCs")
            rPr.append(bCs)


def add_field(paragraph, instr):
    """Insert a Word field (TOC, SEQ, PAGE ...) into a paragraph."""
    run = paragraph.add_run()
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    fld_begin.set(qn("w:dirty"), "true")
    instr_el = OxmlElement("w:instrText")
    instr_el.set(qn("xml:space"), "preserve")
    instr_el.text = instr
    fld_sep = OxmlElement("w:fldChar")
    fld_sep.set(qn("w:fldCharType"), "separate")
    placeholder = OxmlElement("w:t")
    placeholder.text = "…"
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.append(fld_begin)
    run._r.append(instr_el)
    run._r.append(fld_sep)
    run._r.append(placeholder)
    run._r.append(fld_end)
    return run


def enable_update_fields_on_open(document):
    """Ask Word to refresh TOC/SEQ fields when the file is opened."""
    settings = document.settings.element
    upd = OxmlElement("w:updateFields")
    upd.set(qn("w:val"), "true")
    settings.append(upd)


def add_page_break(document):
    document.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


def add_page_number_footer(section):
    """Branded footer: project / course label plus a centred PAGE field."""
    footer = section.footer
    p = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_rtl(p)
    add_paragraph_border(p, "top", BRAND_PRIMARY_HEX, size=6)
    label = p.add_run("EV Auto Parts  |  BPR 602  |  S25      ")
    set_run_font(label, size=Pt(9), color=BRAND_MUTED)
    add_field(p, "PAGE")


def add_paragraph_border(paragraph, side, color_hex, size=8, space=1):
    """Add a single border line (top/bottom) to a paragraph."""
    pPr = paragraph._p.get_or_add_pPr()
    pBdr = pPr.find(qn("w:pBdr"))
    if pBdr is None:
        pBdr = OxmlElement("w:pBdr")
        pPr.append(pBdr)
    el = OxmlElement(f"w:{side}")
    el.set(qn("w:val"), "single")
    el.set(qn("w:sz"), str(size))
    el.set(qn("w:space"), str(space))
    el.set(qn("w:color"), color_hex)
    pBdr.append(el)


def make_logo(path):
    """Draw the EV Auto Parts logo mark (blue rounded square with 'EV') like the site header."""
    from PIL import Image, ImageDraw, ImageFont
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=110, fill=(0x25, 0x63, 0xEB, 255))
    font = None
    for candidate in ("arialbd.ttf", "segoeuib.ttf", "Tajawal-Bold.ttf"):
        try:
            font = ImageFont.truetype(candidate, 260)
            break
        except OSError:
            continue
    if font is None:
        font = ImageFont.load_default()
    text = "EV"
    bbox = draw.textbbox((0, 0), text, font=font)
    w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(((size - w) / 2 - bbox[0], (size - h) / 2 - bbox[1]), text, font=font, fill="white")
    img.save(path)
    return path


# ---------------------------------------------------------------------------
# PlantUML rendering
# ---------------------------------------------------------------------------
_PLANTUML_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"


def _plantuml_encode(text):
    """Deflate + PlantUML custom base64 (used by the public server URLs)."""
    data = zlib.compress(text.encode("utf-8"))[2:-4]  # raw deflate
    b64 = base64.b64encode(data).decode("ascii")
    std = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    return b64.translate(str.maketrans(std, _PLANTUML_ALPHABET)).rstrip("=")


def render_plantuml(source, name_hint):
    """Return a PNG path for the diagram, or None when rendering is impossible."""
    os.makedirs(DIAGRAM_DIR, exist_ok=True)
    digest = hashlib.sha1(source.encode("utf-8")).hexdigest()[:10]
    png_path = os.path.join(DIAGRAM_DIR, f"{name_hint}-{digest}.png")
    puml_path = os.path.join(DIAGRAM_DIR, f"{name_hint}.puml")
    with open(puml_path, "w", encoding="utf-8") as fh:
        fh.write(source)
    if os.path.exists(png_path):
        return png_path
    encoded = _plantuml_encode(source)
    # Try the official server first, then the Kroki mirror.
    candidates = [
        "https://www.plantuml.com/plantuml/png/" + encoded,
        "https://kroki.io/plantuml/png/" + encoded,
    ]
    for url in candidates:
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (report-builder)"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            if data[:8] != b"\x89PNG\r\n\x1a\n":
                continue
            with open(png_path, "wb") as fh:
                fh.write(data)
            return png_path
        except Exception as exc:  # network failure -> try next / keep source block
            print(f"  [warn] PlantUML render failed for {name_hint} via {url.split('/')[2]}: {exc}")
    return None


# ---------------------------------------------------------------------------
# Document builder
# ---------------------------------------------------------------------------
class ReportBuilder:
    def __init__(self):
        self.doc = Document()
        self.fig_no = 0
        self.tab_no = 0
        self.chapter_no = 0
        self.h2_no = 0
        self.h3_no = 0
        self.h4_no = 0
        self.unnumbered = False
        self.puml_sources = []
        os.makedirs(DIAGRAM_DIR, exist_ok=True)
        self.logo_path = make_logo(os.path.join(DIAGRAM_DIR, "ev-logo.png"))
        self._setup_page()
        self._setup_styles()

    # -- setup -------------------------------------------------------------
    def _setup_page(self):
        section = self.doc.sections[0]
        section.orientation = WD_ORIENT.PORTRAIT
        section.page_width = Cm(21.0)
        section.page_height = Cm(29.7)
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(3.0)
        add_page_number_footer(section)

    def _setup_styles(self):
        styles = self.doc.styles
        normal = styles["Normal"]
        normal.font.name = ARABIC_FONT
        normal.font.size = BODY_SIZE
        rPr = normal.element.get_or_add_rPr()
        rFonts = rPr.find(qn("w:rFonts"))
        if rFonts is None:
            rFonts = OxmlElement("w:rFonts")
            rPr.append(rFonts)
        for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
            rFonts.set(qn(attr), ARABIC_FONT)
        normal.paragraph_format.line_spacing = 1.0
        normal.paragraph_format.space_after = Pt(4)
        normal.font.color.rgb = BRAND_DARK
        # Right-to-left as the DOCUMENT default (every paragraph inherits it)
        pPr = normal.element.get_or_add_pPr()
        bidi = OxmlElement("w:bidi")
        bidi.set(qn("w:val"), "1")
        pPr.append(bidi)
        for list_style in ("List Bullet", "List Number", "Caption"):
            lp = styles[list_style].element.get_or_add_pPr()
            lb = OxmlElement("w:bidi")
            lb.set(qn("w:val"), "1")
            lp.append(lb)
        for level, size in ((1, 20), (2, 15), (3, 13), (4, 11.5)):
            st = styles[f"Heading {level}"]
            st.font.name = ARABIC_FONT
            st.font.size = Pt(size)
            st.font.bold = True
            st.font.color.rgb = BRAND_PRIMARY_DARK if level == 1 else BRAND_PRIMARY
            hr = st.element.get_or_add_rPr()
            hf = hr.find(qn("w:rFonts"))
            if hf is None:
                hf = OxmlElement("w:rFonts")
                hr.append(hf)
            for attr in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"):
                hf.set(qn(attr), ARABIC_FONT)
            st.paragraph_format.space_before = Pt(12)
            st.paragraph_format.space_after = Pt(6)

    # -- primitives --------------------------------------------------------
    def _para(self, text="", align=WD_ALIGN_PARAGRAPH.JUSTIFY, style=None, rtl=True):
        p = self.doc.add_paragraph(style=style)
        p.alignment = align
        set_rtl(p, rtl)
        if text:
            self._add_inline(p, text)
        return p

    def _add_inline(self, paragraph, text, size=BODY_SIZE):
        """Handle **bold** and `inline code` markup."""
        parts = re.split(r"(\*\*[^*]+\*\*|`[^`]+`)", text)
        for part in parts:
            if not part:
                continue
            if part.startswith("**") and part.endswith("**"):
                run = paragraph.add_run(part[2:-2])
                set_run_font(run, size=size, bold=True)
            elif part.startswith("`") and part.endswith("`"):
                run = paragraph.add_run(part[1:-1])
                set_run_font(run, name=CODE_FONT, size=Pt(max(size.pt - 1.5, 8)))
            else:
                run = paragraph.add_run(part)
                set_run_font(run, size=size)

    def heading(self, level, text):
        if level == 1:
            self.unnumbered = False
            self.chapter_no += 1
            self.h2_no = self.h3_no = self.h4_no = 0
            add_page_break(self.doc)
            # Chapter title page: logo mark, then centred title framed by brand rules
            for _ in range(7):
                self._para("", align=WD_ALIGN_PARAGRAPH.CENTER)
            logo_p = self.doc.add_paragraph()
            logo_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            logo_p.add_run().add_picture(self.logo_path, width=Cm(1.8))
            p = self.doc.add_paragraph(style="Heading 1")
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            set_rtl(p)
            add_paragraph_border(p, "top", BRAND_PRIMARY_HEX, size=12, space=10)
            add_paragraph_border(p, "bottom", BRAND_PRIMARY_HEX, size=12, space=10)
            # Chapter number and title in ONE heading paragraph (line break between)
            # so the table of contents shows "الفصل الأول: <title>".
            run = p.add_run(f"الفصل {self._ordinal(self.chapter_no)}:\u200F")  # RLM keeps ':' on the RTL side
            set_run_font(run, size=Pt(22), bold=True, color=BRAND_PRIMARY)
            run.add_break(WD_BREAK.LINE)
            run2 = p.add_run(text)
            set_run_font(run2, size=Pt(24), bold=True, color=BRAND_DARK)
            add_page_break(self.doc)
            return
        if level == 2:
            self.h2_no += 1
            self.h3_no = self.h4_no = 0
            number = f"{self.chapter_no}-{self.h2_no}"
        elif level == 3:
            self.h3_no += 1
            self.h4_no = 0
            number = f"{self.chapter_no}-{self.h2_no}-{self.h3_no}"
        else:
            self.h4_no += 1
            number = f"{self.chapter_no}-{self.h2_no}-{self.h3_no}-{self.h4_no}"
        if self.chapter_no == 0 or self.unnumbered:
            number = ""  # front/back matter and introduction headings are unnumbered
        p = self.doc.add_paragraph(style=f"Heading {level}")
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        set_rtl(p)
        if level == 2:
            add_paragraph_border(p, "bottom", "BFDBFE", size=6, space=2)  # primary-200 rule
        # U+200F (RLM) keeps the digit group anchored at the right edge of the RTL line
        run = p.add_run(("\u200F" + f"{number} {text}").strip())
        set_run_font(run, size=p.style.font.size, bold=True,
                     color=BRAND_PRIMARY if level <= 2 else BRAND_PRIMARY_DARK)

    def front_heading(self, text):
        """Unnumbered level-1 heading used for front/back matter sections."""
        self.unnumbered = True
        add_page_break(self.doc)
        p = self.doc.add_paragraph(style="Heading 1")
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        set_rtl(p)
        add_paragraph_border(p, "bottom", BRAND_PRIMARY_HEX, size=12, space=6)
        run = p.add_run(text)
        set_run_font(run, size=Pt(20), bold=True, color=BRAND_PRIMARY_DARK)

    @staticmethod
    def _ordinal(n):
        return ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن"][n - 1]

    def bullet(self, text, numbered=False):
        style = "List Number" if numbered else "List Bullet"
        p = self._para(text, align=WD_ALIGN_PARAGRAPH.RIGHT, style=style)
        p.paragraph_format.right_indent = Cm(0.8)
        return p

    def code_block(self, lines):
        for line in lines:
            p = self.doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            set_rtl(p, False)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.0
            run = p.add_run(line if line else " ")
            set_run_font(run, name=CODE_FONT, size=Pt(8.5))
        self.doc.add_paragraph()

    def caption(self, label, number, text):
        p = self._para("", align=WD_ALIGN_PARAGRAPH.CENTER)
        run = p.add_run(f"{label} ")
        set_run_font(run, size=Pt(11), bold=True, color=BRAND_PRIMARY)
        # SEQ field so that Word's "List of Figures/Tables" fields can collect captions
        fld = add_field(p, f"SEQ {label} \\* ARABIC")
        set_run_font(fld, size=Pt(11), bold=True, color=BRAND_PRIMARY)
        run2 = p.add_run(f": {text}")
        set_run_font(run2, size=Pt(11), bold=True, color=BRAND_MUTED)
        p.style = self.doc.styles["Caption"]
        set_rtl(p)

    def puml_appendix(self):
        """Emit every PlantUML source collected so far as LTR code blocks."""
        for fig_no, caption_text, source in self.puml_sources:
            self.heading(3, f"مصدر الشكل {fig_no}: {caption_text}")
            self.code_block(source.splitlines())

    def figure(self, caption_text, image_path=None, plantuml_source=None, name_hint="diagram"):
        self.fig_no += 1
        rendered = None
        if plantuml_source:
            self.puml_sources.append((self.fig_no, caption_text, plantuml_source))
            rendered = render_plantuml(plantuml_source, name_hint)
        elif image_path:
            rendered = image_path if os.path.isabs(image_path) else os.path.join(ROOT, image_path)
            if not os.path.exists(rendered):
                rendered = None
        if rendered:
            p = self.doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            # Wide diagrams get the full text width so that labels stay legible.
            from PIL import Image  # bundled with python-docx's dependency set
            with Image.open(rendered) as im:
                aspect = im.width / max(im.height, 1)
            p.add_run().add_picture(rendered, width=Cm(15.0 if aspect > 1.6 else 12.0))
        else:
            self._para("[الشكل غير مُصيَّر: مصدر PlantUML أدناه]", align=WD_ALIGN_PARAGRAPH.CENTER)
            self.code_block(plantuml_source.splitlines())
        self.caption("شكل", self.fig_no, caption_text)

    def table(self, caption_text, rows, numbered=True):
        if numbered:
            self.tab_no += 1
            self.caption("جدول", self.tab_no, caption_text)
        elif caption_text:
            p = self._para("", align=WD_ALIGN_PARAGRAPH.CENTER)
            run = p.add_run(caption_text)
            set_run_font(run, size=Pt(11), bold=True)
        header, body = rows[0], rows[1:]
        table = self.doc.add_table(rows=1, cols=len(header))
        table.style = "Table Grid"
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        tblPr = table._tbl.tblPr
        bidi = OxmlElement("w:bidiVisual")
        tblPr.append(bidi)
        # Stretch to the full text width instead of Word's narrow auto-fit
        table.autofit = False
        tblW = tblPr.find(qn("w:tblW"))
        if tblW is None:
            tblW = OxmlElement("w:tblW")
            tblPr.append(tblW)
        tblW.set(qn("w:type"), "pct")
        tblW.set(qn("w:w"), "5000")
        for i, cell_text in enumerate(header):
            cell = table.rows[0].cells[i]
            cell.text = ""
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            set_rtl(p)
            run = p.add_run(cell_text)
            set_run_font(run, size=Pt(8.5), bold=True, color=BRAND_PRIMARY_DARK)
            shading = OxmlElement("w:shd")
            shading.set(qn("w:fill"), BRAND_HEADER_FILL)
            cell._tc.get_or_add_tcPr().append(shading)
        for r_idx, row in enumerate(body):
            cells = table.add_row().cells
            for i, cell_text in enumerate(row[: len(header)]):
                cell = cells[i]
                cell.text = ""
                if r_idx % 2 == 1:  # zebra striping in secondary-50
                    shd = OxmlElement("w:shd")
                    shd.set(qn("w:fill"), BRAND_ROW_FILL)
                    cell._tc.get_or_add_tcPr().append(shd)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                p.paragraph_format.space_after = Pt(0)
                set_rtl(p)
                self._add_inline(p, cell_text, size=Pt(8.5))
        spacer = self.doc.add_paragraph()
        spacer.paragraph_format.space_after = Pt(0)

    # -- front matter blocks ----------------------------------------------
    def cover(self):
        c = COVER

        def line(text, size, bold=False, color=BRAND_DARK, border=None):
            p = self._para("", align=WD_ALIGN_PARAGRAPH.CENTER)
            if border:
                add_paragraph_border(p, border, BRAND_PRIMARY_HEX, size=12, space=8)
            run = p.add_run(text)
            set_run_font(run, size=Pt(size), bold=bold, color=color)
            return p

        line(c["university"], 18, True, BRAND_PRIMARY_DARK)
        line(c["faculty"], 15, True, BRAND_MUTED)
        line(c["course"], 13, False, BRAND_MUTED, border="bottom")
        for _ in range(2):
            line("", 12)
        # Logo mark (same visual as the site header)
        lp = self.doc.add_paragraph()
        lp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        lp.add_run().add_picture(self.logo_path, width=Cm(3.2))
        line(c["title_ar"], 30, True, BRAND_PRIMARY)
        line("Smart Auto Parts", 13, False, BRAND_MUTED)
        line(c["subtitle_ar"], 13, False, BRAND_DARK)
        line("", 12)
        line(c["report_type"], 15, True, BRAND_PRIMARY_DARK, border="top")
        line("", 12)
        line("إعداد الطلاب", 14, True, BRAND_PRIMARY)
        # Student table: name + university ID, styled like the site cards
        table = self.doc.add_table(rows=1, cols=2)
        table.style = "Table Grid"
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table._tbl.tblPr.append(OxmlElement("w:bidiVisual"))
        for i, head in enumerate(("اسم الطالب", "الرقم الجامعي")):
            cell = table.rows[0].cells[i]
            cell.text = ""
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            set_rtl(p)
            run = p.add_run(head)
            set_run_font(run, size=Pt(12), bold=True, color=BRAND_PRIMARY_DARK)
            shd = OxmlElement("w:shd")
            shd.set(qn("w:fill"), BRAND_HEADER_FILL)
            cell._tc.get_or_add_tcPr().append(shd)
        for name, sid in c["students"]:
            cells = table.add_row().cells
            for i, val in enumerate((name, sid)):
                cells[i].text = ""
                p = cells[i].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                set_rtl(p)
                run = p.add_run(val)
                set_run_font(run, size=Pt(13), bold=(i == 0))
        for _ in range(2):
            line("", 12)
        line(c["semester"], 13, True, BRAND_MUTED)
        line(c["date"], 13, False, BRAND_MUTED)

    def toc(self, title, instr):
        self.front_heading(title)
        p = self._para("", align=WD_ALIGN_PARAGRAPH.RIGHT)
        add_field(p, instr)
        self._para("(يُحدَّث هذا الفهرس تلقائياً عند فتح الملف في Microsoft Word أو بالضغط على F9)", align=WD_ALIGN_PARAGRAPH.CENTER)

    # -- parser --------------------------------------------------------------
    def render_source(self, text):
        lines = text.splitlines()
        i = 0
        pending_table_caption = None
        pending_table_numbered = True
        pending_figure_caption = None
        table_rows = []

        def flush_table():
            nonlocal table_rows, pending_table_caption, pending_table_numbered
            if table_rows:
                self.table(pending_table_caption or "", table_rows, numbered=pending_table_numbered)
                table_rows = []
                pending_table_caption = None
                pending_table_numbered = True

        while i < len(lines):
            raw = lines[i]
            line = raw.rstrip()
            if line.startswith("|"):
                cells = [c.strip() for c in line.strip().strip("|").split("|")]
                if not all(re.fullmatch(r":?-{2,}:?", c) for c in cells if c):
                    table_rows.append(cells)
                i += 1
                continue
            flush_table()
            if not line.strip():
                i += 1
                continue
            if line.startswith("```"):
                lang = line[3:].strip().lower()
                block = []
                i += 1
                while i < len(lines) and not lines[i].startswith("```"):
                    block.append(lines[i])
                    i += 1
                i += 1
                if lang == "plantuml":
                    hint = re.sub(r"[^a-z0-9]+", "-", (pending_figure_caption or "diagram").lower())[:40]
                    hint = f"fig{self.fig_no + 1:02d}"
                    self.figure(pending_figure_caption or "", plantuml_source="\n".join(block), name_hint=hint)
                    pending_figure_caption = None
                else:
                    self.code_block(block)
                continue
            if line == "#PAGEBREAK":
                add_page_break(self.doc)
            elif line == "@COVER":
                self.cover()
            elif line == "@TOC":
                self.toc("فهرس المحتويات", 'TOC \\o "1-2" \\h \\z \\u')
            elif line == "@LOF":
                self.toc("فهرس الأشكال", 'TOC \\h \\z \\c "شكل"')
            elif line == "@LOT":
                self.toc("فهرس الجداول", 'TOC \\h \\z \\c "جدول"')
            elif line.startswith("@FRONT "):
                self.front_heading(line[7:].strip())
            elif line == "@PUML_APPENDIX":
                self.puml_appendix()
            elif re.match(r"^\[\d+\] ", line):
                # Bibliography entry: Latin text, left-to-right
                p = self._para("", align=WD_ALIGN_PARAGRAPH.LEFT, rtl=False)
                self._add_inline(p, line.strip(), size=Pt(11))
            elif line.startswith("#### "):
                self.heading(4, line[5:].strip())
            elif line.startswith("### "):
                self.heading(3, line[4:].strip())
            elif line.startswith("## "):
                self.heading(2, line[3:].strip())
            elif line.startswith("# "):
                self.heading(1, line[2:].strip())
            elif line.startswith("TABLE!: "):
                # Unnumbered table (e.g. glossary in the front matter)
                pending_table_caption = line[8:].strip()
                pending_table_numbered = False
            elif line.startswith("TABLE: "):
                pending_table_caption = line[7:].strip()
            elif line.startswith("FIGURE: "):
                pending_figure_caption = line[8:].strip()
            elif line.startswith("IMG: "):
                self.figure(pending_figure_caption or "", image_path=line[5:].strip())
                pending_figure_caption = None
            elif line.startswith("- "):
                self.bullet(line[2:].strip())
            elif re.match(r"^\d+\. ", line):
                self.bullet(re.sub(r"^\d+\. ", "", line).strip(), numbered=True)
            else:
                self._para(line.strip())
            i += 1
        flush_table()

    def save(self, path):
        enable_update_fields_on_open(self.doc)
        self.doc.save(path)


def main():
    builder = ReportBuilder()
    files = sorted(f for f in os.listdir(SRC_DIR) if f.endswith(".txt"))
    for name in files:
        print(f"  rendering {name}")
        with open(os.path.join(SRC_DIR, name), encoding="utf-8") as fh:
            builder.render_source(fh.read())
    builder.save(OUTPUT)
    print(f"Written: {OUTPUT}")
    print(f"Figures: {builder.fig_no}, Tables: {builder.tab_no}")


if __name__ == "__main__":
    sys.exit(main())
