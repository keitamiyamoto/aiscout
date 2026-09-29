/**
 * 診断の質問定義。質問の追加・文言変更はこのファイルだけで完結します。
 * (選択肢の value を増やしたときは src/lib/engine.ts の係数表にも追加してください。テストで検出されます)
 */

export type Opt = { readonly value: string; readonly label: string; readonly sub?: string };

type Base = { key: AnswerKey; section: SectionKey; title: string; hint?: string };
export type SingleQuestion = Base & { kind: "single"; options: readonly Opt[]; columns?: 1 | 2 };
export type MultiQuestion = Base & { kind: "multi"; options: readonly Opt[]; noneValue?: string; min?: number; max?: number };
export type IncomeQuestion = Base & { kind: "income"; min: number; max: number; step: number; initial: number };
export type PrefectureQuestion = Base & { kind: "prefecture" };
/** 複数スキルを 0〜5 で自己評価する (1画面にスライダーを並べる) */
export type LevelsQuestion = Base & { kind: "levels"; items: readonly Opt[]; scale: readonly string[] };
export type Question = SingleQuestion | MultiQuestion | IncomeQuestion | PrefectureQuestion | LevelsQuestion;

export const SECTIONS = {
  work: "いまのお仕事",
  skill: "経験・スキル",
  style: "あなたの志向",
  future: "これからのこと",
} as const;
export type SectionKey = keyof typeof SECTIONS;

export const PREFECTURE_REGIONS = [
  { region: "北海道・東北", list: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { region: "関東", list: ["東京都", "神奈川県", "埼玉県", "千葉県", "茨城県", "栃木県", "群馬県"] },
  { region: "中部", list: ["愛知県", "静岡県", "岐阜県", "三重県", "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県"] },
  { region: "関西", list: ["大阪府", "兵庫県", "京都府", "滋賀県", "奈良県", "和歌山県"] },
  { region: "中国・四国", list: ["広島県", "岡山県", "山口県", "鳥取県", "島根県", "香川県", "愛媛県", "徳島県", "高知県"] },
  { region: "九州・沖縄", list: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
] as const;
export const PREFECTURES = PREFECTURE_REGIONS.flatMap((r) => r.list);

export const OPTIONS = {
  age: [
    { value: "u25", label: "24歳以下" },
    { value: "25", label: "25〜29歳" },
    { value: "30", label: "30〜34歳" },
    { value: "35", label: "35〜39歳" },
    { value: "40", label: "40〜44歳" },
    { value: "45", label: "45〜49歳" },
    { value: "50", label: "50歳以上" },
  ],
  education: [
    { value: "high", label: "中学・高校卒" },
    { value: "vocational", label: "専門学校・短大・高専卒" },
    { value: "university", label: "大学卒" },
    { value: "graduate", label: "大学院卒" },
  ],
  jobCategory: [
    { value: "sales", label: "営業", sub: "法人・個人営業、ルート営業など" },
    { value: "service", label: "販売・接客", sub: "店舗スタッフ、ホテル、アパレルなど" },
    { value: "food", label: "飲食", sub: "ホール、キッチン、店舗運営など" },
    { value: "office", label: "事務・アシスタント", sub: "一般事務、営業事務、受付など" },
    { value: "backoffice", label: "経理・人事・総務", sub: "管理部門" },
    { value: "engineer", label: "ITエンジニア", sub: "開発、インフラ、社内SEなど" },
    { value: "creative", label: "Web・クリエイティブ", sub: "デザイナー、編集、ディレクターなど" },
    { value: "marketing", label: "企画・マーケティング", sub: "広報、商品企画、Web広告など" },
    { value: "manufacturing", label: "製造・技術", sub: "工場、生産管理、品質管理、整備など" },
    { value: "construction", label: "建築・施工管理", sub: "現場監督、設計、設備など" },
    { value: "medical", label: "医療・介護・福祉", sub: "介護職、看護助手、保育など" },
    { value: "logistics", label: "物流・ドライバー", sub: "倉庫、配送、運行管理など" },
    { value: "consultant", label: "コンサルタント・専門職", sub: "コンサル、士業、金融専門職など" },
    { value: "other", label: "その他" },
  ],
  industry: [
    { value: "it", label: "IT・通信・Web" },
    { value: "maker", label: "メーカー" },
    { value: "trading", label: "商社" },
    { value: "finance", label: "金融・保険" },
    { value: "realestate", label: "不動産・建設" },
    { value: "retail", label: "小売・流通" },
    { value: "service", label: "サービス・飲食・レジャー" },
    { value: "medical", label: "医療・介護・福祉" },
    { value: "media", label: "人材・広告・メディア" },
    { value: "logistics", label: "運輸・物流" },
    { value: "public", label: "公務員・団体" },
    { value: "other", label: "その他" },
  ],
  employmentType: [
    { value: "fulltime", label: "正社員" },
    { value: "contract", label: "契約社員" },
    { value: "dispatch", label: "派遣社員" },
    { value: "parttime", label: "アルバイト・パート" },
    { value: "freelance", label: "業務委託・フリーランス" },
    { value: "none", label: "現在は働いていない" },
  ],
  companySize: [
    { value: "s", label: "〜50人" },
    { value: "m", label: "51〜300人" },
    { value: "l", label: "301〜1,000人" },
    { value: "xl", label: "1,001人以上" },
    { value: "unknown", label: "わからない" },
  ],
  jobYears: [
    { value: "0", label: "1年未満" },
    { value: "1", label: "1〜3年" },
    { value: "3", label: "3〜5年" },
    { value: "5", label: "5〜10年" },
    { value: "10", label: "10年以上" },
  ],
  management: [
    { value: "none", label: "なし" },
    { value: "leader", label: "リーダー・後輩指導 (〜4人)" },
    { value: "manager", label: "5〜9人のマネジメント" },
    { value: "senior", label: "10人以上のマネジメント" },
  ],
  jobChanges: [
    { value: "0", label: "0回" },
    { value: "1", label: "1回" },
    { value: "2", label: "2回" },
    { value: "3", label: "3回" },
    { value: "4+", label: "4回以上" },
  ],
  skillLevels: [
    { value: "sales", label: "営業・提案" },
    { value: "hospitality", label: "接客・販売" },
    { value: "office", label: "事務・PC操作" },
    { value: "accounting", label: "会計・財務" },
    { value: "marketing", label: "マーケティング" },
    { value: "writing", label: "ライティング" },
    { value: "design", label: "デザイン" },
    { value: "programming", label: "プログラミング" },
    { value: "project", label: "プロジェクト管理" },
    { value: "management", label: "マネジメント" },
    { value: "english", label: "英語" },
  ],
  skills: [
    { value: "license", label: "普通自動車免許" },
    { value: "mos", label: "MOS (Excel・Word)" },
    { value: "itcert", label: "IT系の資格" },
    { value: "toeic", label: "TOEIC 700点以上" },
    { value: "boki", label: "簿記" },
    { value: "takken", label: "宅建・FPなど" },
    { value: "care", label: "介護・医療・保育系の資格" },
    { value: "tech", label: "電気・建築・機械系の資格" },
    { value: "noneSkill", label: "特になし" },
  ],
  achievements: [
    { value: "target", label: "目標達成・社内表彰" },
    { value: "project", label: "プロジェクト・新規事業の立ち上げ" },
    { value: "improve", label: "業務改善・コスト削減" },
    { value: "training", label: "後輩・新人の育成" },
    { value: "customer", label: "お客様から指名・感謝された" },
    { value: "noneAchievement", label: "特になし" },
  ],
  motivation: [
    { value: "thanks", label: "人に喜ばれた・感謝されたとき" },
    { value: "numbers", label: "目標を達成して数字で成果が出たとき" },
    { value: "create", label: "形あるものを作り上げたとき" },
    { value: "solve", label: "難しい問題を解決できたとき" },
    { value: "accurate", label: "ミスなく正確にやり切ったとき" },
  ],
  strength: [
    { value: "talk", label: "初対面の人とも話せる" },
    { value: "analyze", label: "調べる・分析する" },
    { value: "steady", label: "コツコツ続ける" },
    { value: "idea", label: "アイデアを出す" },
    { value: "lead", label: "人をまとめる" },
    { value: "move", label: "手や体を動かす" },
  ],
  reputation: [
    { value: "listener", label: "話しやすい・聞き上手" },
    { value: "logical", label: "論理的・冷静" },
    { value: "careful", label: "几帳面・丁寧" },
    { value: "unique", label: "発想がユニーク" },
    { value: "reliable", label: "頼りになる・面倒見がいい" },
    { value: "active", label: "行動が早い・フットワークが軽い" },
  ],
  workStyle: [
    { value: "team", label: "チームで協力して進めたい" },
    { value: "solo", label: "ひとりで集中して取り組みたい" },
    { value: "field", label: "外に出たり現場で動いたりしたい" },
    { value: "any", label: "特にこだわりはない" },
  ],
  priority: [
    { value: "income", label: "年収アップ" },
    { value: "balance", label: "休日・残業などの働きやすさ" },
    { value: "growth", label: "スキルアップ・成長" },
    { value: "stability", label: "会社の安定性" },
    { value: "freedom", label: "裁量・リモートなど自由な働き方" },
  ],
  interests: [
    { value: "digital", label: "IT・デジタル" },
    { value: "making", label: "モノづくり" },
    { value: "people", label: "人・教育" },
    { value: "money", label: "お金・数字" },
    { value: "living", label: "住まい・暮らし" },
    { value: "health", label: "医療・健康" },
    { value: "trend", label: "流行・エンタメ" },
  ],
  timing: [
    { value: "now", label: "すぐにでも" },
    { value: "3m", label: "3ヶ月以内" },
    { value: "6m", label: "半年以内" },
    { value: "good", label: "良い求人があれば" },
    { value: "undecided", label: "まだ決めていない" },
  ],
  contactTimes: [
    { value: "weekday-am", label: "平日 午前" },
    { value: "weekday-pm", label: "平日 午後" },
    { value: "weekday-night", label: "平日 18時以降" },
    { value: "weekend", label: "土日祝" },
    { value: "anytime", label: "いつでも" },
  ],
  interviewTime: [
    { value: "am", label: "午前 (10〜12時)" },
    { value: "pm", label: "午後 (13〜17時)" },
    { value: "night", label: "夜 (18〜21時)" },
    { value: "any", label: "いつでも" },
  ],
} as const satisfies Record<string, readonly Opt[]>;

export type OptionKey = keyof typeof OPTIONS;

export const SKILL_SCALE = ["未経験", "少し触れた", "指示があればできる", "ひとりでできる", "人に教えられる", "エキスパート"] as const;

export const QUESTIONS = [
  { key: "age", section: "work", kind: "single", title: "あなたの年齢を教えてください", options: OPTIONS.age, columns: 2 },
  { key: "jobCategory", section: "work", kind: "single", title: "いまのお仕事の職種は？", hint: "いちばん近いものを選んでください", options: OPTIONS.jobCategory },
  { key: "industry", section: "work", kind: "single", title: "お勤め先の業界は？", options: OPTIONS.industry, columns: 2 },
  { key: "employmentType", section: "work", kind: "single", title: "いまの雇用形態は？", options: OPTIONS.employmentType },
  { key: "companySize", section: "work", kind: "single", title: "お勤め先の従業員数は？", options: OPTIONS.companySize },
  { key: "prefecture", section: "work", kind: "prefecture", title: "お住まいの都道府県は？", hint: "勤務地の相場を反映します" },
  { key: "currentIncome", section: "work", kind: "income", title: "いまの年収はどれくらいですか？", hint: "税込・賞与込みのおおよそで大丈夫です", min: 100, max: 1500, step: 10, initial: 350 },
  { key: "jobYears", section: "skill", kind: "single", title: "いまの職種での経験年数は？", options: OPTIONS.jobYears },
  { key: "management", section: "skill", kind: "single", title: "リーダーやマネジメントの経験は？", options: OPTIONS.management },
  { key: "jobChanges", section: "skill", kind: "single", title: "これまでの転職回数は？", options: OPTIONS.jobChanges, columns: 2 },
  { key: "education", section: "skill", kind: "single", title: "最終学歴を教えてください", options: OPTIONS.education },
  { key: "skillLevels", section: "skill", kind: "levels", title: "スキルを0〜5で自己評価してください", hint: "経験がないものは 0 のままで大丈夫です", items: OPTIONS.skillLevels, scale: SKILL_SCALE },
  { key: "skills", section: "skill", kind: "multi", title: "持っている資格は？", hint: "当てはまるものをすべて選んでください", options: OPTIONS.skills, noneValue: "noneSkill", min: 1 },
  { key: "achievements", section: "skill", kind: "multi", title: "お仕事での経験・実績は？", hint: "当てはまるものをすべて選んでください", options: OPTIONS.achievements, noneValue: "noneAchievement", min: 1 },
  { key: "motivation", section: "style", kind: "single", title: "仕事でいちばん「やりがい」を感じるのは？", options: OPTIONS.motivation },
  { key: "strength", section: "style", kind: "single", title: "自分の得意なことは？", options: OPTIONS.strength, columns: 2 },
  { key: "reputation", section: "style", kind: "single", title: "周りの人からよく言われるのは？", options: OPTIONS.reputation },
  { key: "workStyle", section: "style", kind: "single", title: "理想の働き方に近いのは？", options: OPTIONS.workStyle },
  { key: "interests", section: "style", kind: "multi", title: "興味のある分野は？", hint: "3つまで選べます", options: OPTIONS.interests, min: 1, max: 3 },
  { key: "priority", section: "future", kind: "single", title: "次の職場でいちばん重視したいことは？", options: OPTIONS.priority },
  { key: "desiredIncome", section: "future", kind: "income", title: "希望する年収は？", hint: "おおよそで大丈夫です", min: 100, max: 1500, step: 10, initial: 400 },
  { key: "timing", section: "future", kind: "single", title: "転職を考えている時期は？", options: OPTIONS.timing },
] as const satisfies readonly Question[];

export type AnswerKey =
  | "age"
  | "education"
  | "jobCategory"
  | "industry"
  | "employmentType"
  | "companySize"
  | "prefecture"
  | "currentIncome"
  | "jobYears"
  | "management"
  | "jobChanges"
  | "skillLevels"
  | "skills"
  | "achievements"
  | "motivation"
  | "strength"
  | "reputation"
  | "workStyle"
  | "interests"
  | "priority"
  | "desiredIncome"
  | "timing";

export function optionLabel(key: OptionKey, value: string): string {
  return (OPTIONS[key] as readonly Opt[]).find((o) => o.value === value)?.label ?? value;
}
