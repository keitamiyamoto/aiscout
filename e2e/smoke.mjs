// End-to-end smoke test. Usage: npm run build && npm run start -- -p 3100 & then `node e2e/smoke.mjs`
// Env: BASE_URL (default http://localhost:3100), PW_CHROMIUM (path to a Chromium binary, optional),
//      ADMIN_USER / ADMIN_PASSWORD (admin screen check; skipped when ADMIN_PASSWORD is empty)
import { chromium } from "playwright";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3100";
const OUT = new URL("./output/", import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const ok = (name, cond, extra = "") => {
  results.push(`${cond ? "PASS" : "FAIL"} ${name} ${extra}`);
  if (!cond) console.error("FAIL", name, extra);
};
const shot = (page, name) => page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });

const browser = await chromium.launch({ headless: true, ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}) });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: "ja-JP", deviceScaleFactor: 2, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const heading = () => page.locator("main h1").first().innerText();
const qNo = async () => Number((await page.url().match(/q=(\d+)/))?.[1] ?? 0);
const pick = async (label) => {
  const before = await qNo();
  await page.getByRole("radio", { name: label }).first().click();
  await page.waitForFunction((b) => Number(new URL(location.href).searchParams.get("q")) > b, before, { timeout: 5000 });
};
const pickPill = async (label) => {
  const before = await qNo();
  await page.getByRole("button", { name: label, exact: true }).click();
  await page.waitForFunction((b) => Number(new URL(location.href).searchParams.get("q")) > b, before, { timeout: 5000 });
};
const next = async () => {
  const before = await qNo();
  await page.locator("button:has-text('次へ')").last().click();
  await page.waitForFunction((b) => Number(new URL(location.href).searchParams.get("q")) > b, before, { timeout: 5000 });
};

// 1. top
await page.goto(`${BASE}/?utm_source=smoke&utm_medium=e2e`);
ok("top headline", (await page.locator("h1").innerText()).includes("年収"));
ok("no horizontal scroll on top", await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
await shot(page, "01-top");
await page.locator("text=無料で診断をはじめる").first().click();
await page.waitForURL(/\/diagnosis/);
await page.waitForSelector("text=あなたの年齢を教えてください");
ok("Q1 shown", true);
await shot(page, "02-q1");

// 2. answer a few, test back
await pick("30〜34歳");
ok("auto-advance to Q2", (await heading()).includes("職種"), await heading());
await page.goBack();
await page.waitForSelector("text=あなたの年齢を教えてください");
ok("browser back returns to Q1 with answer kept", (await page.getByRole("radio", { name: "30〜34歳" }).getAttribute("aria-checked")) === "true");
await page.click("button:has-text('次へ')");
await page.waitForSelector("text=いまのお仕事の職種は？");
await shot(page, "03-q2-job");
await pick("営業");
await pick("IT・通信・Web");
await pick("正社員");
await pick("51〜300人");
ok("prefecture question", (await heading()).includes("都道府県"));
await shot(page, "04-prefecture");
await pickPill("東京都");
ok("income question", (await heading()).includes("年収"));
await page.locator("input[type=range]").fill("450");
ok("slider value shown", (await page.locator("main").innerText()).includes("450"));
await shot(page, "05-income");
await next();

// 3. reload mid-way keeps progress
await page.reload();
await page.waitForSelector("text=いまの職種での経験年数は？");
ok("reload keeps progress", true);
await pick("3〜5年");
await pick("リーダー・後輩指導 (〜4人)");
await pick("1回");
await pick("大学卒");

// skill levels
ok("skill levels question", (await heading()).includes("スキル"));
const sliders = page.locator("input[type=range]");
ok("11 skill sliders", (await sliders.count()) === 11, String(await sliders.count()));
await sliders.nth(0).fill("4");
await sliders.nth(10).fill("2");
await shot(page, "06-skills");
await next();

// multi
ok("multi next disabled before pick", await page.locator("button:has-text('1つ以上選んでください')").isDisabled());
await page.getByRole("checkbox", { name: "普通自動車免許" }).click();
await page.getByRole("checkbox", { name: "MOS (Excel・Word)" }).click();
await page.getByRole("checkbox", { name: "特になし" }).click();
ok("none is exclusive", (await page.getByRole("checkbox", { name: "普通自動車免許" }).getAttribute("aria-checked")) === "false");
await page.getByRole("checkbox", { name: "普通自動車免許" }).click();
await shot(page, "07-multi");
await next();
await page.getByRole("checkbox", { name: "目標達成・社内表彰" }).click();
await next();

await pick("目標を達成して数字で成果が出たとき");
await pick("初対面の人とも話せる");
await pick("頼りになる・面倒見がいい");
await pick("チームで協力して進めたい");
await page.getByRole("checkbox", { name: "IT・デジタル" }).click();
await page.getByRole("checkbox", { name: "お金・数字" }).click();
await page.getByRole("checkbox", { name: "人・教育" }).click();
await page.getByRole("checkbox", { name: "住まい・暮らし" }).click();
ok("interests capped at 3", (await page.getByRole("checkbox", { name: "住まい・暮らし" }).getAttribute("aria-checked")) === "false");
await next();
await pick("年収アップ");
await next(); // desired income default
await pick("3ヶ月以内");

// 4. contact
ok("contact step", (await heading()).includes("連絡先"));
await shot(page, "08-contact");
await page.click("text=診断結果を見る");
await page.waitForSelector("text=氏名を入力してください");
ok("contact validation", (await page.locator("text=利用規約・プライバシーポリシーへの同意が必要です").count()) > 0);
await page.fill('input[name="name"]', "山田 太郎");
await page.fill('input[name="nameKana"]', "yamada");
await page.fill('input[name="phone"]', "0000000000");
await page.fill('input[name="email"]', "taro@example.com");
await page.getByRole("button", { name: "平日 18時以降" }).click();
await page.check('input[name="consent"]');
await page.click("text=診断結果を見る");
await page.waitForSelector("text=ひらがな・カタカナで入力");
ok("kana + phone validation", (await page.locator("text=電話番号が正しくありません").count()) > 0);
await page.fill('input[name="nameKana"]', "やまだ たろう");
await page.fill('input[name="phone"]', `090-${String(Date.now()).slice(-8, -4)}-${String(Date.now()).slice(-4)}`);
await page.click("text=診断結果を見る");
await page.waitForSelector("text=診断しています", { timeout: 5000 });
ok("analyzing overlay", true);
await page.waitForURL(/\/result\//, { timeout: 20000 });
const resultUrl = page.url();
await page.waitForTimeout(1600);

// 5. result
const main = await page.locator("main").innerText();
ok("result: market value", /あなたの市場価値は/.test(main) && /万円/.test(main));
ok("result: jobs top3", main.includes("向いている職種 TOP3"));
ok("result: persona", main.includes("あなたのタイプ"));
ok("result: casual interview CTA", main.includes("まずはカジュアル面談してみませんか"));
ok("result: sticky CTA on mobile", await page.locator("text=まずはカジュアル面談してみる (無料)").isVisible());
ok("no horizontal scroll on result", await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
await shot(page, "09-result");

// 6. interview
await page.getByRole("button", { name: "オンライン (Zoom・Google Meet)" }).click();
await page.fill("textarea", "未経験からIT営業に挑戦できるか相談したい");
await page.click("text=無料でカジュアル面談を申し込む");
await page.waitForSelector("text=お申し込みを受け付けました", { timeout: 10000 });
ok("interview requested", true);
await page.waitForTimeout(800);
ok("sticky CTA hidden after request", (await page.locator("text=まずはカジュアル面談してみる (無料)").count()) === 0);
await shot(page, "10-interview-done");

// 7. revisit keeps state, top shows last result link
await page.goto(resultUrl);
ok("revisit shows requested state", (await page.locator("text=お申し込みを受け付けました").count()) === 1);
await page.goto(`${BASE}/`);
ok("top shows last result link", (await page.locator("text=前回の診断結果を見る").count()) >= 1);
ok("draft cleared after submit", (await page.locator("text=続きから再開する").count()) === 0);

// 8. unknown token
const nf = await page.goto(`${BASE}/result/doesnotexist123`);
ok("unknown token 404", nf.status() === 404);

// 9. deep link past unanswered questions is clamped
const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 }, locale: "ja-JP" });
const p2 = await ctx2.newPage();
await p2.goto(`${BASE}/diagnosis?q=15`);
await p2.waitForSelector("text=あなたの年齢を教えてください");
ok("deep link clamped to first unanswered", true);
await p2.screenshot({ path: `${OUT}/11-desktop-q1.png` });

// 10. admin
if (process.env.ADMIN_PASSWORD) {
  const un = await p2.request.get(`${BASE}/admin`);
  ok("admin requires auth", un.status() === 401);
  const ctx3 = await browser.newContext({ viewport: { width: 1400, height: 900 }, httpCredentials: { username: process.env.ADMIN_USER || "admin", password: process.env.ADMIN_PASSWORD } });
  const p3 = await ctx3.newPage();
  await p3.goto(`${BASE}/admin`);
  ok("admin lists lead", (await p3.locator("text=山田 太郎").count()) > 0);
  ok("admin shows interview", (await p3.locator("text=申込あり").count()) > 0);
  await p3.locator("select[name=status]").first().selectOption("called");
  await p3.locator("textarea[name=memo]").first().fill("初回架電 不在");
  await p3.locator("button:has-text('保存')").first().click();
  await p3.waitForSelector("text=保存 (架電済み)", { timeout: 10000 });
  ok("admin status update", true);
  await p3.screenshot({ path: `${OUT}/12-admin.png`, fullPage: true });
  const csv = await p3.request.get(`${BASE}/admin/export`);
  const body = await csv.text();
  ok("csv export", csv.ok() && body.includes("山田 太郎") && body.includes("市場価値(万円)") && body.includes("smoke"), body.slice(0, 80));
  await ctx3.close();
}

ok("no page errors", errors.length === 0, errors.join(" | "));
await browser.close();
console.log(results.join("\n"));
console.log(`\n${results.filter((r) => r.startsWith("PASS")).length}/${results.length} passed`);
if (results.some((r) => r.startsWith("FAIL"))) process.exit(1);
