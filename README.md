# AIスカウト 年収・適職診断 (aiscout)

いまのお仕事について1問ずつ答えるだけで、**転職市場での想定年収 (市場価値)** と **向いている職種 TOP3** がわかる診断 Web アプリ。
結果ページから **カジュアル面談** を申し込めるようにし、人材紹介の架電リストを獲得することが目的です。
デザインは「AIサポート 履歴書作る君」(ai-resume-builder) と同じトークン・部品を使っています。サービス名は `src/lib/brand.ts` で変更できます。

## 画面の流れ

1. `/` トップ … 最小限のファーストビュー + 「無料で診断をはじめる」(途中保存があれば「続きから再開」)
2. `/diagnosis?q=1〜` … **1画面1問**で遷移 (全22問 + 連絡先)。選択肢はタップで自動的に次へ進む
   - いまのお仕事: 年齢 / 職種 / 業界 / 雇用形態 / 従業員数 / 都道府県 / 現在年収 (スライダー)
   - 経験・スキル: 経験年数 / マネジメント / 転職回数 / 学歴 / **スキル自己評価 0〜5** (11項目のスライダー) / 資格 / 実績
   - あなたの志向: やりがい / 得意なこと / 周りからの評価 / 働き方 / 興味分野
   - これからのこと: 重視すること / 希望年収 / 転職時期
   - 連絡先: 氏名 / ふりがな / 電話 / メール / 連絡のつきやすい時間帯 / 同意 (**結果を見る前に必須**)
3. 「診断しています…」の演出 → `/result/[token]`
   - **あなたの市場価値は ◯◯万円** (想定レンジ・いまの年収との差・同年代平均との比較・スコア/ランク)
   - 市場価値を押し上げている要素 / 伸ばすとさらに上がる要素、希望年収の実現度
   - あなたのタイプ (6つの強みのレーダーチャート)
   - **向いている職種 TOP3** (相性%・想定年収・理由)
   - **まずはカジュアル面談してみませんか？** → 面談方法と相談内容を選んで申込 → 「担当から2営業日以内にご連絡します」
4. `/admin` 管理画面 (Basic 認証) … 診断リスト、面談申込の絞り込み、対応状況 (未対応 / 架電済み / 面談設定 / 面談済み / 対象外) とメモ、CSV ダウンロード

- 回答は途中でブラウザに自動保存 (閉じても続きから)。ブラウザの戻る/進むでも質問を行き来できます
- いたずら防止: 電話番号の桁数・同一数字、ふりがな、メール形式、同じ電話番号からの連続送信 (1時間3件まで)、ボット用の隠し入力欄
- 広告の `utm_source / utm_medium / utm_campaign` を保存し、管理画面・CSV・シートに出します

## 診断ロジック

`src/lib/engine.ts` (純粋関数。DB・外部APIなし)。

- 想定年収 = 職種ごとの基準年収 × 年齢 × 経験年数 × マネジメント × 企業規模 × 業界 × 学歴 × 雇用形態 × 転職回数 × 勤務エリア × (1 + スキル・資格・実績の上乗せ)。これに現在の年収を 35% 加味
- 適職 = 回答から6つの強み (対人力・分析力・正確さ・発想力・統率力・行動力) を算出し、20職種と照合。経験の活かしやすさ・重視すること・興味分野・資格も加点
- 係数はすべてこのファイルの表で調整できます。質問の文言・選択肢は `src/lib/questions.ts`

## 技術構成

| 領域 | 採用 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router) / React 19 / TypeScript |
| UI | Tailwind CSS v4 (履歴書作る君と同じデザイントークン) |
| DB | PostgreSQL + Prisma 6 (`prisma/schema.prisma` の `Lead`) |
| 転記 | Google スプレッドシート (任意) |
| テスト | Vitest (ユニット) / Playwright (E2E スモーク) |

## セットアップ (ローカル)

```bash
npm install
cp .env.example .env        # DATABASE_URL などを設定
npx prisma migrate dev      # テーブル作成
npm run dev                 # http://localhost:3000
```

| 変数 | 説明 |
| --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | PostgreSQL。Supabase なら pooler (6543, `?pgbouncer=true`) / 直接接続 (5432) |
| `APP_URL` | 公開 URL。シートと CSV の「結果URL」に使う |
| `ADMIN_USER` / `ADMIN_PASSWORD` | 管理画面の Basic 認証。`ADMIN_PASSWORD` が空なら `/admin` は 404 |
| `GOOGLE_SHEETS_ID` / `GOOGLE_SERVICE_ACCOUNT_EMAIL` / `GOOGLE_PRIVATE_KEY` / `GOOGLE_SHEETS_RANGE` | スプレッドシート転記 (任意)。手順は履歴書作る君の README と同じ |

スプレッドシートには「診断完了」と「面談申込」のたびに1行ずつ追記されます (列は `src/lib/lead-columns.ts` の `LEAD_COLUMNS`。1行目の見出しもこの順で入れてください)。

## 検証コマンド

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run start -- -p 3100 &
ADMIN_PASSWORD=... node e2e/smoke.mjs   # スクリーンショットは e2e/output/
```

## デプロイ (Vercel + Supabase)

1. Supabase でプロジェクトを作成 (Tokyo リージョン推奨) し、接続文字列を2本取得
2. Vercel にこのリポジトリを Import。環境変数に `DATABASE_URL` / `DIRECT_URL` / `APP_URL` / `ADMIN_PASSWORD` (+ シート用) を設定
3. Build Command を `prisma migrate deploy && next build` に変更して Deploy

## 公開前の確認事項

- 利用規約・プライバシーポリシー (`src/content/legal.ts`) の法務確認。提携紹介会社への第三者提供の文言
- 基準年収・係数の妥当性 (社内の成約データで補正するのがおすすめ)
- GA / 広告タグ、独自ドメイン、面談申込時の社内通知 (Slack・メール) は未実装
