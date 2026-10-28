# Pronet Store — Deployment Package

## متطلبات الاستضافة
- Node.js >= 22.5 (موصى به: 22.x LTS)
- npm

## خطوات النشر (VPS / خادم ذاتي)
1. ارفع محتويات هذا المجلد (بدون `node_modules` — سيتم تثبيتها على الخادم).
2. على الخادم:
   ```bash
   npm install
   npm run build        # 선택ي: إذا أردت إعادة البناء (المجلد .next موجود مسبقاً)
   npm run start        # تشغيل production على المنفذ 3000
   ```
3. (اختياري) عيّن متغيرات البيئة في `.env`:
   ```
   PRONET_DB_PATH=./data/pronet.db
   PRONET_SEED_ADMIN_PASSWORD=
   ```
   إن تركت `PRONET_SEED_ADMIN_PASSWORD` فارغة، سيُولَّد كلمة مرور عشوائية وتُحفظ في `data/INITIAL_CREDENTIALS.txt`.

## ملاحظات
- قاعدة البيانات `data/pronet.db` (SQLite) مضمّنة (8 فئات، 982 منتج، 4 مستخدمين).
- مجلد `.next` (build إنتاج) مضمّن — يمكن تشغيل `npm start` مباشرة بعد `npm install`.
- للاستضافة على Vercel/Netlify: ارفع الكود (بدون `.next`) ودع المنصة تبني تلقائياً (`npm run build`).
- لتسريع الإقلاع: استخدم PM2: `pm2 start npm --name pronet -- start`

## بيانات لوحة التحكم (أولية)
| المستخدم | اسم الدخول | كلمة المرور |
|----------|------------|-------------|
| المصمم/المطور | designer | AFefk3iEc#UPVZGh |
| الإدارة | management | 6C&T^!5iYJkofdvt |
| المبيعات | sales | i45s%nUEo@RFu8pw |
| الدعم الفني | support | 65qRiiw8nYhob%EY |

> ⚠️ غيّر كلمات المرور فوراً من `/admin/password`.
