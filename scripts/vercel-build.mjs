// Vercel のビルド: DB の接続設定があればテーブルを最新にしてから next build する。
// DATABASE_URL が無い間 (プレビュー版) はマイグレーションを飛ばす。
import { execSync } from "node:child_process";

const run = (cmd) => execSync(cmd, { stdio: "inherit" });

if (process.env.DATABASE_URL) {
  if (!process.env.DIRECT_URL) {
    console.error("DATABASE_URL はあるのに DIRECT_URL がありません。Supabase の Direct connection (5432) を DIRECT_URL に設定してください。");
    process.exit(1);
  }
  run("npx prisma migrate deploy");
} else {
  console.log("DATABASE_URL が未設定のため、マイグレーションを飛ばします (プレビュー版としてビルド)。");
}
run("npx next build");
