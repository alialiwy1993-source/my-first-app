برنامج حجز السلف - نسخة Windows Desktop

الرابط المركزي المستخدم داخل البرنامج:
https://app-cw59bw.v2.appdeploy.ai/

المميزات:
- لا يحتاج المستخدم إلى تسجيل الدخول في GPT أو ChatGPT.
- تسجيل الدخول يكون فقط بحسابات برنامج حجز السلف نفسه.
- جميع أجهزة الحاسوب تستخدم نفس قاعدة البيانات المركزية.
- يلزم اتصال بالإنترنت لأن البيانات موجودة على الخادم المركزي.

البناء اليدوي على Windows:
1) ثبت Node.js 22 أو أحدث.
2) افتح مجلد المشروع في Terminal.
3) نفذ: npm install
4) نفذ: npm run dist
5) ستجد النسخ داخل:
   dist/installer
   dist/portable

GitHub Actions:
الملف .github/workflows/build-windows.yml يبني تلقائيا:
- Installer EXE
- Portable EXE
ثم يرفعهما كـ Artifact باسم Loan-Booking-Windows.
