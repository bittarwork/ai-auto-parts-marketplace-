# دليل التثبيت والتشغيل — منصة قطع غيار السيارات الصينية

> هذا الدليل موجه للأشخاص غير التقنيين لتحميل وتشغيل المشروع على جهازهم المحلي.

---

## ما الذي ستحتاجه؟

قبل البدء، تحتاج إلى تثبيت الأدوات التالية على جهازك:

| البرنامج | الوظيفة | الإصدار المطلوب |
|----------|---------|------------------|
| **Node.js** | تشغيل البرمجيات الخلفية والواجهة | 18 أو أحدث |
| **MongoDB** | قاعدة بيانات المنتجات والمستخدمين | أي إصدار حديث |
| **Redis** | تخزين مؤقت للجلسات والبيانات السريعة | أي إصدار حديث |
| **Git** | تحميل المشروع من الإنترنت | أي إصدار حديث |

---

## الخطوة 1: تحميل وتثبيت البرامج

### 1.1 Node.js
1. اذهب إلى: [https://nodejs.org](https://nodejs.org)
2. اختر الإصدار **LTS** (المستقر) — عادة يكون الزر الأخضر
3. حمّل الملف المناسب لنظامك (Windows / Mac / Linux)
4. شغّل المثبت واتبع التعليمات (اضغط Next حتى النهاية)
5. أعد تشغيل الجهاز أو افتح نافذة أوامر جديدة

### 1.2 MongoDB
**طريقة سهلة — استخدام MongoDB Atlas (مجاني على الإنترنت):**
1. اذهب إلى: [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. سجّل حسابًا مجانيًا
3. أنشئ قاعدة بيانات مجانية
4. احصل على رابط الاتصال (Connection String) — سنستخدمه لاحقًا في الإعدادات

**أو التثبيت المحلي (على جهازك):**
1. اذهب إلى: [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. اختر إصدار Windows / Mac / Linux
3. ثبّت واتبع التعليمات

### 1.3 Redis
**طريقة سهلة — استخدام Redis Cloud (مجاني):**
1. اذهب إلى: [https://redis.com/try-free](https://redis.com/try-free)
2. سجّل حسابًا واحصل على رابط Redis المجاني
3. سنستخدم هذا الرابط لاحقًا في الإعدادات

**أو التثبيت المحلي (Windows):**
1. حمّل من: [https://github.com/microsoftarchive/redis/releases](https://github.com/microsoftarchive/redis/releases)
2. أو استخدم **WSL** على ويندوز وتثبيت Redis بداخله

### 1.4 Git
1. اذهب إلى: [https://git-scm.com/downloads](https://git-scm.com/downloads)
2. حمّل المثبت لنظامك
3. ثبّت باستخدام الإعدادات الافتراضية

---

## الخطوة 2: تحميل المشروع

### من GitHub
1. افتح المتصفح واذهب إلى صفحة المشروع على GitHub
2. اضغط زر **Code** الأخضر
3. اختر **Download ZIP**
4. فك الضغط في مجلد مناسب (مثلاً: `C:\Projects` أو سطح المكتب)

**أو باستخدام Git من سطر الأوامر:**
```bash
git clone https://github.com/YOUR_USERNAME/ai-auto-parts-marketplace-.git
cd ai-auto-parts-marketplace-
```

---

## الخطوة 3: إعداد ملف الإعدادات

1. اذهب إلى مجلد المشروع
2. افتح مجلد **backend**
3. أنشئ ملفًا جديدًا باسم `.env` (انتبه: يبدأ بنقطة)
4. انسخ المحتوى التالي وضع قيمك الفعلية:

```
PORT=5000
NODE_ENV=development

# رابط MongoDB — استبدل بالرابط من Atlas أو استخدم المحلي:
MONGODB_URI=mongodb://localhost:27017/chinese-auto-parts

# رابط Redis — استبدل بالرابط من Redis Cloud أو استخدم المحلي:
REDIS_URL=redis://localhost:6379

# مفتاح سري للتسجيل — اكتب أي نص عشوائي طويل:
JWT_SECRET=اكتب_هنا_نص_طويل_عشوائي_للأمان
JWT_EXPIRES_IN=7d

# مفتاح OpenAI — احصل عليه من platform.openai.com:
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

# رابط الواجهة:
FRONTEND_URL=http://localhost:5173
```

### الحصول على مفتاح OpenAI
1. اذهب إلى: [https://platform.openai.com](https://platform.openai.com)
2. سجّل أو سجّل الدخول
3. اذهب إلى **API Keys** وأنشئ مفتاحًا جديدًا
4. انسخ المفتاح وضعه في `OPENAI_API_KEY` (ملاحظة: قد تحتاج اشتراكًا مدفوعًا لاستخدام الـ API)

---

## الخطوة 4: تشغيل المشروع

### افتح نافذتين من سطر الأوامر

**النافذة الأولى — تشغيل الخلفية (Backend):**
```
cd مسار_المشروع\backend
npm install
npm run seed
npm run dev
```
انتظر حتى تظهر رسالة مثل: `Server running on port 5000`

**النافذة الثانية — تشغيل الواجهة (Frontend):**
```
cd مسار_المشروع\frontend
npm install
npm run dev
```
انتظر حتى تظهر رسالة مثل: `Local: http://localhost:5173`

---

## الخطوة 5: فتح الموقع

1. افتح المتصفح
2. اكتب في شريط العنوان: **http://localhost:5173**
3. يجب أن تظهر لك الصفحة الرئيسية للمتجر

### حسابات تجريبية (بعد تشغيل `npm run seed`)

| الدور | البريد | كلمة المرور |
|-------|--------|-------------|
| مدير | admin@autoparts.com | Admin@2024! |
| مزود | supplier1@autoparts.com | Supplier@2024! |
| عميل | ahmed@example.com | Customer@2024! |

لوحة الإدارة: **http://localhost:5173/admin**

---

## مشاكل شائعة وحلولها

| المشكلة | الحل |
|---------|------|
| `npm` غير معروف | أعد تثبيت Node.js وأغلق وافتح نافذة الأوامر من جديد |
| خطأ في الاتصال بـ MongoDB | تحقق من أن MongoDB يعمل وأن الرابط في `.env` صحيح |
| خطأ في الاتصال بـ Redis | تحقق من أن Redis يعمل أو استخدم Redis Cloud |
| الصفحة لا تفتح | تأكد أن النافذتين (backend و frontend) تعملان دون أخطاء |
| خطأ في OpenAI | تحقق من صحة المفتاح ووجود رصيد في حساب OpenAI |

---

## ملخص سريع

1. ثبّت: Node.js، MongoDB (أو Atlas)، Redis (أو Redis Cloud)، Git  
2. حمّل المشروع (ZIP أو git clone)  
3. أنشئ ملف `.env` في مجلد backend وضع الإعدادات  
4. شغّل `npm install` ثم `npm run seed` ثم `npm run dev` في backend  
5. شغّل `npm install` ثم `npm run dev` في frontend  
6. افتح المتصفح على: http://localhost:5173  

---

*آخر تحديث: فبراير 2025*
