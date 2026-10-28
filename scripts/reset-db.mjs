#!/usr/bin/env node
/**
 * إعادة تهيئة قاعدة البيانات — يحذف ملف قاعدة البيانات وملف بيانات الدخول الأولية،
 * فتُعاد التهيئة والبذر تلقائيًا عند أول تشغيل للتطبيق.
 *
 * الاستخدام:  npm run reset-db
 * تحذير: يحذف كل الطلبات والمستخدمين والإعدادات المخصّصة.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

const root = process.cwd();
const dbPath = process.env.PRONET_DB_PATH
  ? path.resolve(root, process.env.PRONET_DB_PATH)
  : path.resolve(root, "data", "pronet.db");
const credsPath = path.resolve(root, "data", "INITIAL_CREDENTIALS.txt");

const targets = [dbPath, `${dbPath}-journal`, `${dbPath}-wal`, `${dbPath}-shm`, credsPath];

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim().toLowerCase());
  }));
}

async function main() {
  console.log("\nقاعدة البيانات المستهدفة:", dbPath, "\n");
  const answer = await ask("سيتم حذف كل البيانات. اكتب «نعم» للتأكيد: ");
  if (answer !== "نعم" && answer !== "yes" && answer !== "y") {
    console.log("تم الإلغاء — لم يُحذف أي شيء.");
    return;
  }

  let removed = 0;
  for (const target of targets) {
    if (fs.existsSync(target)) {
      fs.rmSync(target, { force: true });
      console.log("حُذف:", target);
      removed += 1;
    }
  }

  console.log(
    removed > 0
      ? "\n✅ تم. شغّل التطبيق (npm run dev) لتُعاد التهيئة، وستجد كلمات المرور الجديدة في data/INITIAL_CREDENTIALS.txt\n"
      : "\nلا توجد ملفات لحذفها — قاعدة البيانات غير موجودة أصلًا.\n",
  );
}

main().catch((error) => {
  console.error("فشل تنفيذ السكربت:", error);
  process.exit(1);
});
