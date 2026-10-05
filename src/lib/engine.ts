/**
 * 市場価値 (想定年収) と適職の診断ロジック。
 * 純粋関数のみ (DB や外部 API に依存しない) なので、係数はこのファイルだけで調整できます。
 * 数値は公的統計・求人相場をもとにした「目安」です。
 */
import type { Answers } from "@/lib/schemas";

/**
 * 2: スコアを同条件の人の中でのパーセンタイルに変更
 * 3: スコアを「同年代 (全職種・全国)」の年収分布の中での順位に変更、いまの年収の重みを上げる、
 *    適職は現職の経験を重く見て、似た職種ばかり並ばないようにする
 */
export const ENGINE_VERSION = 3;

/* ------------------------------------------------------------------ */
/* 係数表                                                              */
/* ------------------------------------------------------------------ */

/** 職種ごとの基準年収 (万円): 30代前半・経験3〜5年・正社員・中堅企業・大卒 */
export const BASE_INCOME: Record<Answers["jobCategory"], number> = {
  sales: 460,
  service: 340,
  food: 330,
  office: 330,
  backoffice: 430,
  engineer: 530,
  creative: 430,
  marketing: 500,
  manufacturing: 400,
  construction: 480,
  medical: 360,
  logistics: 410,
  consultant: 620,
  other: 380,
};

export const AGE_FACTOR: Record<Answers["age"], number> = { u25: 0.8, "25": 0.92, "30": 1, "35": 1.08, "40": 1.14, "45": 1.18, "50": 1.18 };
export const JOB_YEARS_FACTOR: Record<Answers["jobYears"], number> = { "0": 0.88, "1": 0.95, "3": 1, "5": 1.07, "10": 1.12 };
export const MANAGEMENT_FACTOR: Record<Answers["management"], number> = { none: 1, leader: 1.04, manager: 1.12, senior: 1.22 };
export const COMPANY_SIZE_FACTOR: Record<Answers["companySize"], number> = { s: 0.94, m: 0.98, l: 1.03, xl: 1.08, unknown: 1 };
export const INDUSTRY_FACTOR: Record<Answers["industry"], number> = {
  it: 1.06,
  maker: 1.03,
  trading: 1.1,
  finance: 1.1,
  realestate: 1.05,
  retail: 0.96,
  service: 0.93,
  medical: 0.97,
  media: 1.02,
  logistics: 0.98,
  public: 1,
  other: 1,
};
export const EDUCATION_FACTOR: Record<Answers["education"], number> = { high: 0.95, vocational: 0.97, university: 1, graduate: 1.04 };
/** 正社員として転職した場合を想定するため、非正規の係数は控えめにしている */
export const EMPLOYMENT_FACTOR: Record<Answers["employmentType"], number> = { fulltime: 1, contract: 0.97, dispatch: 0.96, parttime: 0.9, freelance: 1, none: 0.92 };
export const JOB_CHANGES_FACTOR: Record<Answers["jobChanges"], number> = { "0": 1, "1": 1.01, "2": 1, "3": 0.98, "4+": 0.95 };

const REGION_FACTOR: Record<string, number> = {
  東京都: 1.12,
  神奈川県: 1.05,
  大阪府: 1.04,
  愛知県: 1.04,
  埼玉県: 1,
  千葉県: 1,
  京都府: 1,
  兵庫県: 1,
  福岡県: 0.98,
  静岡県: 0.98,
  茨城県: 0.98,
  宮城県: 0.97,
  広島県: 0.97,
};
export function regionFactor(prefecture: string): number {
  return REGION_FACTOR[prefecture] ?? 0.93;
}

/** 資格 1つあたりの上乗せ率 */
export const QUALIFICATION_BONUS: Record<Answers["skills"][number], number> = {
  license: 0.01,
  mos: 0.01,
  itcert: 0.03,
  toeic: 0.03,
  boki: 0.02,
  takken: 0.03,
  care: 0.02,
  tech: 0.03,
  noneSkill: 0,
};
const QUALIFICATION_CAP = 0.08;

export const ACHIEVEMENT_BONUS: Record<Answers["achievements"][number], number> = {
  target: 0.03,
  project: 0.03,
  improve: 0.02,
  training: 0.02,
  customer: 0.02,
  noneAchievement: 0,
};
const ACHIEVEMENT_CAP = 0.07;

type SkillKey = keyof Answers["skillLevels"] & string;
/** スキル自己評価 1ポイントあたりの上乗せ率 (市場で評価されやすいスキルほど大きい) */
export const SKILL_WEIGHT: Record<SkillKey, number> = {
  programming: 0.012,
  english: 0.01,
  marketing: 0.008,
  project: 0.008,
  management: 0.008,
  accounting: 0.006,
  sales: 0.006,
  design: 0.005,
  writing: 0.004,
  office: 0.003,
  hospitality: 0.002,
};
const SKILL_CAP = 0.15;

/* ------------------------------------------------------------------ */
/* 適職                                                                */
/* ------------------------------------------------------------------ */

export const TRAITS = {
  people: { label: "対人コミュニケーション力", short: "対人力" },
  analytic: { label: "分析力・論理的思考", short: "分析力" },
  precise: { label: "正確さ・継続力", short: "正確さ" },
  creative: { label: "企画力・発想力", short: "発想力" },
  lead: { label: "リーダーシップ", short: "統率力" },
  hands: { label: "行動力・現場力", short: "行動力" },
} as const;
export type Trait = keyof typeof TRAITS;
type TraitScore = Record<Trait, number>;

export const PERSONA: Record<Trait, { name: string; description: string }> = {
  people: { name: "人に寄り添うコミュニケーター", description: "相手の気持ちをくみ取り、信頼関係をつくるのが得意なタイプ。お客様や仲間から頼られる場面で力を発揮します。" },
  analytic: { name: "論理で解決するアナリスト", description: "情報を整理し、筋道を立てて答えを出すのが得意なタイプ。課題の原因を見つけて改善する仕事で評価されます。" },
  precise: { name: "信頼を積み上げるスペシャリスト", description: "決められたことを正確に、最後までやり切れるタイプ。ミスが許されない仕事や専門性を磨く仕事で重宝されます。" },
  creative: { name: "アイデアで形にするクリエイター", description: "新しい発想で「こうしたら面白い」を形にできるタイプ。企画やものづくりで持ち味が活きます。" },
  lead: { name: "チームを動かすリーダー", description: "目標に向かって周りを巻き込み、成果を出せるタイプ。任される範囲が広いほど伸びていきます。" },
  hands: { name: "現場で輝くアクションタイプ", description: "考えるより先に動き、現場で結果を出せるタイプ。スピード感と行動量が武器になります。" },
};

const ANSWER_TRAITS: Partial<Record<keyof Answers, Record<string, Partial<TraitScore>>>> = {
  motivation: {
    thanks: { people: 2 },
    numbers: { lead: 1, people: 1 },
    create: { creative: 2 },
    solve: { analytic: 2 },
    accurate: { precise: 2 },
  },
  strength: {
    talk: { people: 2 },
    analyze: { analytic: 2 },
    steady: { precise: 2 },
    idea: { creative: 2 },
    lead: { lead: 2 },
    move: { hands: 2 },
  },
  reputation: {
    listener: { people: 2 },
    logical: { analytic: 2 },
    careful: { precise: 2 },
    unique: { creative: 2 },
    reliable: { lead: 2 },
    active: { hands: 1, people: 1 },
  },
  workStyle: {
    team: { people: 1, lead: 1 },
    solo: { analytic: 1, precise: 1, creative: 1 },
    field: { hands: 2 },
    any: {},
  },
};

const SKILL_TRAITS: Record<SkillKey, Partial<TraitScore>> = {
  sales: { people: 1 },
  hospitality: { people: 1 },
  office: { precise: 1 },
  accounting: { precise: 0.5, analytic: 0.5 },
  marketing: { analytic: 0.5, creative: 0.5 },
  writing: { creative: 1 },
  design: { creative: 1 },
  programming: { analytic: 1 },
  project: { lead: 1 },
  management: { lead: 1 },
  english: {},
};

/** 職種のグループ。TOP3 が同じグループばかりにならないようにする */
type CareerFamily = "sales" | "support" | "backoffice" | "it" | "creative" | "field" | "store" | "care" | "consulting";

type Career = {
  name: string;
  family: CareerFamily;
  weights: Partial<TraitScore>;
  base: number;
  /** 経験を活かせる現職の職種 */
  from: readonly Answers["jobCategory"][];
  priorities: readonly Answers["priority"][];
  interests: readonly Answers["interests"][number][];
  qualifications?: readonly Answers["skills"][number][];
  skills?: readonly SkillKey[];
  /** 未経験からでも採用されやすい */
  entry: boolean;
};

export const CAREERS = {
  corporateSales: { name: "法人営業", family: "sales", weights: { people: 3, lead: 1 }, base: 480, from: ["sales", "service"], priorities: ["income", "growth"], interests: ["money", "digital", "living"], skills: ["sales"], entry: true },
  itSales: { name: "IT営業・インサイドセールス", family: "sales", weights: { people: 2, analytic: 1 }, base: 500, from: ["sales"], priorities: ["income", "growth", "freedom"], interests: ["digital"], skills: ["sales"], entry: true },
  customerSuccess: { name: "カスタマーサクセス", family: "support", weights: { people: 2, analytic: 1, precise: 1 }, base: 450, from: ["sales", "service", "office"], priorities: ["balance", "growth"], interests: ["digital", "people"], skills: ["sales", "hospitality"], entry: true },
  careerAdvisor: { name: "キャリアアドバイザー", family: "sales", weights: { people: 3, lead: 1 }, base: 430, from: ["sales", "service"], priorities: ["growth", "income"], interests: ["people"], skills: ["sales", "hospitality"], entry: true },
  storeManager: { name: "店長・エリアマネージャー", family: "store", weights: { lead: 3, people: 2, hands: 1 }, base: 420, from: ["service", "food"], priorities: ["income"], interests: ["trend", "living"], skills: ["hospitality", "management"], entry: false },
  realEstateSales: { name: "不動産営業", family: "sales", weights: { people: 2, lead: 1, hands: 1 }, base: 470, from: ["sales"], priorities: ["income"], interests: ["living", "money"], qualifications: ["takken"], skills: ["sales"], entry: true },
  webMarketer: { name: "Webマーケター", family: "creative", weights: { analytic: 2, creative: 2 }, base: 480, from: ["marketing", "creative"], priorities: ["growth", "freedom"], interests: ["digital", "trend"], skills: ["marketing", "writing"], entry: false },
  planner: { name: "企画・商品開発", family: "creative", weights: { creative: 3, analytic: 1 }, base: 520, from: ["marketing", "creative", "manufacturing"], priorities: ["growth"], interests: ["making", "trend"], skills: ["marketing"], entry: false },
  engineer: { name: "ITエンジニア (開発)", family: "it", weights: { analytic: 3, creative: 1, precise: 1 }, base: 520, from: ["engineer"], priorities: ["income", "growth", "freedom"], interests: ["digital"], qualifications: ["itcert"], skills: ["programming"], entry: true },
  infraEngineer: { name: "インフラエンジニア", family: "it", weights: { analytic: 2, precise: 2 }, base: 480, from: ["engineer"], priorities: ["stability", "growth"], interests: ["digital"], qualifications: ["itcert"], skills: ["programming"], entry: true },
  dataAnalyst: { name: "データアナリスト", family: "it", weights: { analytic: 3, precise: 1 }, base: 540, from: ["engineer", "marketing"], priorities: ["growth", "freedom"], interests: ["digital", "money"], skills: ["programming", "marketing"], entry: false },
  webDesigner: { name: "Webデザイナー", family: "creative", weights: { creative: 3, precise: 1 }, base: 420, from: ["creative"], priorities: ["freedom", "growth"], interests: ["digital", "trend"], skills: ["design"], entry: false },
  hr: { name: "人事・採用", family: "backoffice", weights: { people: 2, lead: 1, precise: 1 }, base: 460, from: ["backoffice"], priorities: ["stability", "balance"], interests: ["people"], entry: false },
  accounting: { name: "経理・財務", family: "backoffice", weights: { precise: 3, analytic: 1 }, base: 450, from: ["backoffice", "office"], priorities: ["stability", "balance"], interests: ["money"], qualifications: ["boki"], skills: ["accounting"], entry: false },
  officeWork: { name: "営業事務・一般事務", family: "support", weights: { precise: 2, people: 1 }, base: 330, from: ["office", "backoffice"], priorities: ["balance", "stability"], interests: ["people", "money"], qualifications: ["mos"], skills: ["office"], entry: true },
  constructionManager: { name: "施工管理", family: "field", weights: { lead: 2, hands: 2, precise: 1 }, base: 500, from: ["construction"], priorities: ["income", "stability"], interests: ["living", "making"], qualifications: ["tech"], entry: true },
  qualityControl: { name: "生産管理・品質管理", family: "field", weights: { precise: 2, analytic: 1, hands: 1 }, base: 440, from: ["manufacturing"], priorities: ["stability", "balance"], interests: ["making"], qualifications: ["tech"], entry: true },
  consultant: { name: "コンサルタント", family: "consulting", weights: { analytic: 3, people: 1, lead: 1 }, base: 650, from: ["consultant"], priorities: ["income", "growth"], interests: ["money", "digital"], skills: ["project", "english"], entry: false },
  careWorker: { name: "介護・福祉職", family: "care", weights: { people: 3, hands: 1 }, base: 360, from: ["medical"], priorities: ["stability"], interests: ["health", "people"], qualifications: ["care"], entry: true },
  logistics: { name: "物流・運行管理", family: "field", weights: { hands: 2, precise: 1 }, base: 420, from: ["logistics"], priorities: ["stability", "balance"], interests: ["living"], qualifications: ["license"], entry: true },
} as const satisfies Record<string, Career>;
export type CareerKey = keyof typeof CAREERS;

/* ------------------------------------------------------------------ */
/* 結果                                                                */
/* ------------------------------------------------------------------ */

export type Rank = "S" | "A" | "B" | "C" | "D";
export const RANK_LABEL: Record<Rank, string> = { S: "トップクラス", A: "かなり高い", B: "平均的", C: "平均よりやや下", D: "伸びしろ大" };

/**
 * 同年代 (全職種・全国・フルタイム) の平均年収 (万円)。
 * 賃金構造基本統計調査 (一般労働者・男女計) の所定内給与 × 12 + 賞与 をもとにした目安。
 */
export const AGE_AVERAGE_INCOME: Record<Answers["age"], number> = { u25: 310, "25": 380, "30": 440, "35": 490, "40": 530, "45": 560, "50": 590 };
/** 同年代の中での年収のばらつき (対数の標準偏差)。上位10% ≒ 平均の約1.4倍、下位10% ≒ 平均の約0.6倍 */
export const AGE_INCOME_LOG_SD = 0.33;

/** スコア (パーセンタイル) からランク。S=上位10% / A=上位30% / B=上位60% / C=上位85% / D=それ以外 */
export function rankOf(score: number): Rank {
  return score >= 90 ? "S" : score >= 70 ? "A" : score >= 40 ? "B" : score >= 15 ? "C" : "D";
}

/** 標準正規分布の累積分布関数 (Abramowitz-Stegun 近似) */
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export type Factor = { label: string; text: string; delta: number };
export type JobMatch = { key: CareerKey; name: string; match: number; incomeLow: number; incomeHigh: number; reason: string; experienced: boolean };

export type DiagnosisResult = {
  version: number;
  marketValue: number;
  low: number;
  high: number;
  currentIncome: number;
  diff: number;
  peerAverage: number;
  /** 同年代 (全職種・全国) の中でのパーセンタイル (1〜99) */
  score: number;
  rank: Rank;
  /** 上位何% か (旧バージョンの結果には無い) */
  topPercent?: number;
  desiredIncome: number;
  desiredVerdict: string;
  plus: Factor[];
  minus: Factor[];
  traits: Array<{ key: Trait; label: string; value: number }>;
  persona: { key: Trait; name: string; description: string };
  jobs: JobMatch[];
  comment: string;
};

const round10 = (n: number) => Math.round(n / 10) * 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function skillBonus(levels: Answers["skillLevels"]): number {
  let sum = 0;
  for (const [k, v] of Object.entries(levels) as [SkillKey, number][]) sum += (SKILL_WEIGHT[k] ?? 0) * (v ?? 0);
  return Math.min(SKILL_CAP, sum);
}

function listBonus<K extends string>(values: readonly K[], table: Record<K, number>, cap: number): number {
  return Math.min(cap, values.reduce((s, v) => s + (table[v] ?? 0), 0));
}

export function traitScores(a: Answers): TraitScore {
  const t: TraitScore = { people: 0, analytic: 0, precise: 0, creative: 0, lead: 0, hands: 0 };
  const add = (p: Partial<TraitScore>, scale = 1) => {
    for (const [k, v] of Object.entries(p) as [Trait, number][]) t[k] += v * scale;
  };
  for (const [key, table] of Object.entries(ANSWER_TRAITS) as [keyof Answers, Record<string, Partial<TraitScore>>][]) {
    add(table[a[key] as string] ?? {});
  }
  for (const [k, v] of Object.entries(a.skillLevels) as [SkillKey, number][]) add(SKILL_TRAITS[k] ?? {}, (v ?? 0) * 0.3);
  if (a.management === "manager" || a.management === "senior") t.lead += 1;
  if (a.achievements.includes("customer")) t.people += 0.5;
  if (a.achievements.includes("improve")) t.analytic += 0.5;
  if (a.achievements.includes("project")) t.creative += 0.5;
  return t;
}

const PRIORITY_LABEL: Record<Answers["priority"], string> = {
  income: "年収アップ",
  balance: "働きやすさ",
  growth: "スキルアップ",
  stability: "安定性",
  freedom: "自由な働き方",
};

function careerIncome(c: Career, a: Answers, experienced: boolean, bonus: number): [number, number] {
  const v =
    c.base *
    AGE_FACTOR[a.age] *
    regionFactor(a.prefecture) *
    EDUCATION_FACTOR[a.education] *
    (experienced ? JOB_YEARS_FACTOR[a.jobYears] * MANAGEMENT_FACTOR[a.management] : 0.88 * (1 + (MANAGEMENT_FACTOR[a.management] - 1) / 2)) *
    (1 + bonus * 0.7);
  return [round10(v * 0.9), round10(v * 1.1)];
}

export function matchJobs(a: Answers, traits: TraitScore, bonus: number, limit = 3): JobMatch[] {
  const maxTrait = Math.max(1, ...Object.values(traits));
  const scored = (Object.entries(CAREERS) as [CareerKey, Career][]).map(([key, c]) => {
    const wSum = Object.values(c.weights).reduce((s, w) => s + (w ?? 0), 0);
    const fit = (Object.entries(c.weights) as [Trait, number][]).reduce((s, [t, w]) => s + (traits[t] / maxTrait) * w, 0) / wSum;
    const experienced = c.from.includes(a.jobCategory);
    const priorityHit = c.priorities.includes(a.priority);
    const interestHits = c.interests.filter((i) => a.interests.includes(i));
    const qualHit = (c.qualifications ?? []).some((q) => a.skills.includes(q));
    const skillHit = (c.skills ?? []).some((s) => (a.skillLevels[s] ?? 0) >= 3);
    const total =
      fit +
      (priorityHit ? 0.12 : 0) +
      Math.min(2, interestHits.length) * 0.08 +
      (experienced ? 0.35 : 0) +
      (qualHit ? 0.08 : 0) +
      (skillHit ? 0.08 : 0) +
      (!experienced && !c.entry ? -0.1 : 0) +
      // 未経験で、興味分野にも資格にも結びつかない職種は控えめに出す
      (!experienced && interestHits.length === 0 && !qualHit ? -0.1 : 0);

    const topTraits = (Object.entries(c.weights) as [Trait, number][])
      .sort((x, y) => traits[y[0]] * y[1] - traits[x[0]] * x[1])
      .slice(0, 2)
      .filter(([t]) => traits[t] > 0)
      .map(([t]) => `「${TRAITS[t].short}」`);
    const parts: string[] = [];
    if (topTraits.length) parts.push(`あなたの${topTraits.join("と")}がそのまま活きる仕事です。`);
    if (experienced) parts.push("いまの経験を評価されやすく、年収アップも狙えます。");
    else if (c.entry) parts.push("未経験からの採用も多く、挑戦しやすい職種です。");
    if (priorityHit) parts.push(`「${PRIORITY_LABEL[a.priority]}」の希望とも相性が良いです。`);
    else if (qualHit) parts.push("お持ちの資格が評価されます。");

    const [incomeLow, incomeHigh] = careerIncome(c, a, experienced, bonus);
    return { key, name: c.name, family: c.family, total, incomeLow, incomeHigh, reason: parts.join(""), experienced };
  });
  // 上から順に選ぶ。すでに選んだのと同じグループの職種は減点し、TOP3 が似た職種だけにならないようにする
  const picked: typeof scored = [];
  const remaining = [...scored];
  while (picked.length < limit && remaining.length) {
    const adjusted = (j: (typeof scored)[number]) => j.total - FAMILY_REPEAT_PENALTY * picked.filter((p) => p.family === j.family).length;
    remaining.sort((x, y) => adjusted(y) - adjusted(x));
    picked.push(remaining.shift()!);
  }
  // 似た職種を避けて順番を入れ替えたときも、表示する相性 % が上から順に下がるようにする
  let prev = 98;
  return picked.map(({ key, name, incomeLow, incomeHigh, reason, experienced, total }) => {
    const match = (prev = Math.min(prev, clamp(Math.round(68 + total * 20), 60, 98)));
    return { key, name, incomeLow, incomeHigh, reason, experienced, match };
  });
}
/** 同じグループの職種を2つ目以降に選ぶときの減点 */
const FAMILY_REPEAT_PENALTY = 0.25;

/** 係数を掛け合わせた想定年収 (現在の年収を加味する前) */
function modelIncome(a: Answers, bonus: number): number {
  return (
    BASE_INCOME[a.jobCategory] *
    AGE_FACTOR[a.age] *
    JOB_YEARS_FACTOR[a.jobYears] *
    MANAGEMENT_FACTOR[a.management] *
    COMPANY_SIZE_FACTOR[a.companySize] *
    INDUSTRY_FACTOR[a.industry] *
    EDUCATION_FACTOR[a.education] *
    EMPLOYMENT_FACTOR[a.employmentType] *
    JOB_CHANGES_FACTOR[a.jobChanges] *
    regionFactor(a.prefecture) *
    (1 + bonus)
  );
}

export function diagnose(a: Answers): DiagnosisResult {
  const region = regionFactor(a.prefecture);
  const qualification = listBonus(a.skills, QUALIFICATION_BONUS, QUALIFICATION_CAP);
  const achievement = listBonus(a.achievements, ACHIEVEMENT_BONUS, ACHIEVEMENT_CAP);
  const skill = skillBonus(a.skillLevels);

  const factors: Factor[] = [
    { label: "年齢", delta: AGE_FACTOR[a.age] - 1, text: AGE_FACTOR[a.age] >= 1 ? "年齢相応の経験が評価されます" : "ポテンシャル採用の対象になりやすい年代です" },
    { label: "経験年数", delta: JOB_YEARS_FACTOR[a.jobYears] - 1, text: JOB_YEARS_FACTOR[a.jobYears] >= 1 ? "今の職種での経験が武器になります" : "経験を積むほど年収が伸びやすい段階です" },
    { label: "マネジメント経験", delta: MANAGEMENT_FACTOR[a.management] - 1, text: "人をまとめた経験は高く評価されます" },
    { label: "業界", delta: INDUSTRY_FACTOR[a.industry] - 1, text: INDUSTRY_FACTOR[a.industry] >= 1 ? "年収水準の高い業界での経験です" : "年収水準の高い業界へ移ると伸びやすくなります" },
    { label: "企業規模", delta: COMPANY_SIZE_FACTOR[a.companySize] - 1, text: COMPANY_SIZE_FACTOR[a.companySize] >= 1 ? "規模の大きい組織での経験が評価されます" : "規模の大きい企業へ移ると年収が上がりやすい傾向です" },
    { label: "勤務エリア", delta: region - 1, text: region >= 1 ? "求人が多く年収相場の高いエリアです" : "リモート求人や都市部の求人で上振れが狙えます" },
    { label: "学歴", delta: EDUCATION_FACTOR[a.education] - 1, text: "学歴不問の求人も多く、経験次第で十分カバーできます" },
    { label: "雇用形態", delta: EMPLOYMENT_FACTOR[a.employmentType] - 1, text: "正社員になるだけで年収が上がる可能性があります" },
    { label: "転職回数", delta: JOB_CHANGES_FACTOR[a.jobChanges] - 1, text: "転職理由の伝え方で印象を大きく変えられます" },
    { label: "スキル", delta: skill, text: "市場で評価されやすいスキルをお持ちです" },
    { label: "資格", delta: qualification, text: "お持ちの資格が評価されます" },
    { label: "実績", delta: achievement, text: "具体的な実績はアピール材料になります" },
  ];

  const model = modelIncome(a, skill + qualification + achievement);

  // 現在の年収も加味する。実際にもらっている年収は市場の評価そのものなので半分の重みで見る
  // (働いていない・パートの場合は重みを下げる)。
  // 年収の額で重みを切り替えると「年収が低い方が市場価値が高い」逆転が起きるので、雇用形態だけで決める
  const current = a.currentIncome;
  const currentWeight = a.employmentType === "none" || a.employmentType === "parttime" ? 0.15 : 0.5;
  const marketValue = round10(model * (1 - currentWeight) + current * currentWeight);
  const low = round10(marketValue * 0.9);
  const high = round10(marketValue * 1.12);
  // 同年代 (全職種・全国) の年収分布の中での順位 (パーセンタイル)。例: 70 なら上位30%
  // 平均年収から対数正規分布の中央値を出して比べる
  const peerAverage = AGE_AVERAGE_INCOME[a.age];
  const peerMedian = peerAverage * Math.exp(-(AGE_INCOME_LOG_SD ** 2) / 2);
  const score = clamp(Math.round(100 * normalCdf(Math.log(marketValue / peerMedian) / AGE_INCOME_LOG_SD)), 1, 99);
  const rank = rankOf(score);
  const topPercent = Math.max(1, 100 - score);


  const plus = factors.filter((f) => f.delta >= 0.02).sort((x, y) => y.delta - x.delta).slice(0, 3);
  const minus = factors.filter((f) => f.delta <= -0.02).sort((x, y) => x.delta - y.delta).slice(0, 2);

  const traits = traitScores(a);
  const traitMax = Math.max(1, ...Object.values(traits));
  // 表示用 (0〜100)。どの強みも最低30から始めてチャートが極端な形にならないようにする
  const traitList = (Object.keys(TRAITS) as Trait[]).map((key) => ({ key, label: TRAITS[key].label, value: Math.round(30 + (traits[key] / traitMax) * 70) }));
  const top = [...traitList].sort((x, y) => y.value - x.value)[0].key;
  const persona = { key: top, ...PERSONA[top] };
  const jobs = matchJobs(a, traits, skill + qualification + achievement);

  const diff = marketValue - current;
  const best = jobs[0];
  const ceiling = Math.max(high, best?.incomeHigh ?? 0);
  const upside = ceiling - current;
  const desired = a.desiredIncome;
  const desiredVerdict =
    desired <= ceiling ? "十分に狙える水準です" : desired <= ceiling * 1.15 ? "条件交渉やキャリアの見せ方次第で狙えます" : "職種・業界を選べば中長期で目指せます";
  const comment =
    `${persona.name}のあなたの市場価値は年収${low}〜${high}万円が目安です。` +
    (best ? `${best.name}なら${best.incomeLow}〜${best.incomeHigh}万円も目指せます。` : "") +
    (current > 0 && upside > 0
      ? `転職の進め方次第で、いまより最大+${upside}万円の年収アップが見込めます。`
      : "いまの年収は市場水準より高めです。条件を落とさずに、より働きやすい職場を選べる可能性があります。");

  return {
    version: ENGINE_VERSION,
    marketValue,
    low,
    high,
    currentIncome: current,
    diff,
    peerAverage,
    score,
    rank,
    topPercent,
    desiredIncome: desired,
    desiredVerdict,
    plus,
    minus,
    traits: traitList,
    persona,
    jobs,
    comment,
  };
}
