/**
 * 現実にいそうな人物像 (ハイ / ミドル / ロー) の回答一式。
 * スコアと適職が「その人らしい」結果になるかを確かめる回帰テスト用。
 */
import type { Answers } from "@/lib/schemas";

export type Persona = {
  id: string;
  layer: "high" | "middle" | "low";
  label: string;
  a: Answers;
  /** 想定するランクの範囲 */
  ranks: readonly ("S" | "A" | "B" | "C" | "D")[];
  /** TOP3 に入っていてほしい職種 (どれか1つ) */
  expectJobs: readonly string[];
};

const base = { desiredIncome: 0, timing: "3m" } as const;

export const PERSONAS: Persona[] = [
  // ---------------- ハイレイヤー ----------------
  {
    id: "H1", layer: "high", label: "45歳 ITエンジニア部長 東京 1100万",
    ranks: ["S"], expectJobs: ["engineer", "dataAnalyst", "infraEngineer", "consultant"],
    a: { ...base, age: "45", jobCategory: "engineer", industry: "it", employmentType: "fulltime", companySize: "xl", prefecture: "東京都", currentIncome: 1100, jobYears: "10", management: "senior", jobChanges: "2", education: "graduate", skillLevels: { programming: 5, project: 4, management: 4, english: 3 }, skills: ["itcert", "toeic"], achievements: ["project", "improve", "training"], motivation: "solve", strength: "analyze", reputation: "logical", workStyle: "solo", interests: ["digital"], priority: "income", desiredIncome: 1300 },
  },
  {
    id: "H2", layer: "high", label: "38歳 総合商社 営業課長 東京 1000万",
    ranks: ["S"], expectJobs: ["corporateSales", "itSales", "consultant"],
    a: { ...base, age: "35", jobCategory: "sales", industry: "trading", employmentType: "fulltime", companySize: "xl", prefecture: "東京都", currentIncome: 1000, jobYears: "10", management: "manager", jobChanges: "0", education: "university", skillLevels: { sales: 5, english: 4, management: 3 }, skills: ["toeic", "license"], achievements: ["target", "project"], motivation: "numbers", strength: "talk", reputation: "reliable", workStyle: "team", interests: ["money", "trend"], priority: "income", desiredIncome: 1200 },
  },
  {
    id: "H3", layer: "high", label: "42歳 戦略コンサル マネージャー 東京 1200万",
    ranks: ["S"], expectJobs: ["consultant"],
    a: { ...base, age: "40", jobCategory: "consultant", industry: "other", employmentType: "fulltime", companySize: "l", prefecture: "東京都", currentIncome: 1200, jobYears: "10", management: "senior", jobChanges: "1", education: "university", skillLevels: { project: 5, english: 4, marketing: 3, management: 4 }, skills: ["toeic"], achievements: ["target", "project", "improve"], motivation: "solve", strength: "analyze", reputation: "logical", workStyle: "team", interests: ["money", "digital"], priority: "growth", desiredIncome: 1400 },
  },
  {
    id: "H4", layer: "high", label: "36歳 金融 経理マネージャー 大阪 800万",
    ranks: ["S", "A"], expectJobs: ["accounting"],
    a: { ...base, age: "35", jobCategory: "backoffice", industry: "finance", employmentType: "fulltime", companySize: "xl", prefecture: "大阪府", currentIncome: 800, jobYears: "10", management: "manager", jobChanges: "1", education: "university", skillLevels: { accounting: 5, english: 3, office: 4 }, skills: ["boki", "toeic"], achievements: ["improve", "training"], motivation: "accurate", strength: "steady", reputation: "careful", workStyle: "solo", interests: ["money"], priority: "stability", desiredIncome: 900 },
  },
  {
    id: "H5", layer: "high", label: "52歳 メーカー工場長 愛知 850万 高卒",
    ranks: ["S", "A"], expectJobs: ["qualityControl", "planner"],
    a: { ...base, age: "50", jobCategory: "manufacturing", industry: "maker", employmentType: "fulltime", companySize: "xl", prefecture: "愛知県", currentIncome: 850, jobYears: "10", management: "senior", jobChanges: "0", education: "high", skillLevels: { management: 4, project: 4, office: 2 }, skills: ["tech", "license"], achievements: ["improve", "training"], motivation: "accurate", strength: "lead", reputation: "reliable", workStyle: "field", interests: ["making"], priority: "stability", desiredIncome: 900 },
  },
  {
    id: "H6", layer: "high", label: "32歳 Webマーケター リーダー 東京 750万",
    ranks: ["S", "A"], expectJobs: ["webMarketer", "dataAnalyst", "planner"],
    a: { ...base, age: "30", jobCategory: "marketing", industry: "it", employmentType: "fulltime", companySize: "m", prefecture: "東京都", currentIncome: 750, jobYears: "5", management: "leader", jobChanges: "2", education: "university", skillLevels: { marketing: 5, writing: 4, programming: 2 }, skills: ["noneSkill"], achievements: ["project", "target"], motivation: "create", strength: "idea", reputation: "unique", workStyle: "solo", interests: ["digital", "trend"], priority: "freedom", desiredIncome: 900 },
  },
  // ---------------- ミドルレイヤー ----------------
  {
    id: "M1", layer: "middle", label: "30歳 IT企業の法人営業 大阪 480万",
    ranks: ["A", "B"], expectJobs: ["corporateSales", "itSales"],
    a: { ...base, age: "30", jobCategory: "sales", industry: "it", employmentType: "fulltime", companySize: "m", prefecture: "大阪府", currentIncome: 480, jobYears: "3", management: "leader", jobChanges: "1", education: "university", skillLevels: { sales: 4, hospitality: 2 }, skills: ["license"], achievements: ["target"], motivation: "numbers", strength: "talk", reputation: "active", workStyle: "team", interests: ["digital", "money"], priority: "income", desiredIncome: 550 },
  },
  {
    id: "M2", layer: "middle", label: "28歳 メーカーの一般事務 東京 380万",
    ranks: ["B", "C"], expectJobs: ["officeWork", "accounting", "customerSuccess", "hr"],
    a: { ...base, age: "25", jobCategory: "office", industry: "maker", employmentType: "fulltime", companySize: "l", prefecture: "東京都", currentIncome: 380, jobYears: "3", management: "none", jobChanges: "0", education: "university", skillLevels: { office: 4 }, skills: ["mos", "license"], achievements: ["improve"], motivation: "thanks", strength: "steady", reputation: "careful", workStyle: "team", interests: ["people"], priority: "balance", desiredIncome: 420 },
  },
  {
    id: "M3", layer: "middle", label: "34歳 SE 福岡 520万",
    ranks: ["A", "B"], expectJobs: ["engineer", "infraEngineer", "dataAnalyst"],
    a: { ...base, age: "30", jobCategory: "engineer", industry: "it", employmentType: "fulltime", companySize: "m", prefecture: "福岡県", currentIncome: 520, jobYears: "5", management: "leader", jobChanges: "1", education: "university", skillLevels: { programming: 4, project: 2 }, skills: ["itcert"], achievements: ["improve"], motivation: "solve", strength: "analyze", reputation: "logical", workStyle: "solo", interests: ["digital"], priority: "growth", desiredIncome: 600 },
  },
  {
    id: "M4", layer: "middle", label: "37歳 施工管理 埼玉 580万 専門卒",
    ranks: ["A", "B"], expectJobs: ["constructionManager"],
    a: { ...base, age: "35", jobCategory: "construction", industry: "realestate", employmentType: "fulltime", companySize: "m", prefecture: "埼玉県", currentIncome: 580, jobYears: "10", management: "manager", jobChanges: "1", education: "vocational", skillLevels: { project: 4, management: 3 }, skills: ["tech", "license"], achievements: ["target", "training"], motivation: "create", strength: "lead", reputation: "reliable", workStyle: "field", interests: ["living", "making"], priority: "income", desiredIncome: 650 },
  },
  {
    id: "M5", layer: "middle", label: "41歳 メーカー人事 愛知 520万",
    ranks: ["B", "C"], expectJobs: ["hr"],
    a: { ...base, age: "40", jobCategory: "backoffice", industry: "maker", employmentType: "fulltime", companySize: "l", prefecture: "愛知県", currentIncome: 520, jobYears: "5", management: "leader", jobChanges: "1", education: "university", skillLevels: { office: 3, management: 2 }, skills: ["mos"], achievements: ["training"], motivation: "thanks", strength: "talk", reputation: "listener", workStyle: "team", interests: ["people"], priority: "stability", desiredIncome: 550 },
  },
  {
    id: "M6", layer: "middle", label: "33歳 介護リーダー 神奈川 380万",
    ranks: ["B", "C"], expectJobs: ["careWorker"],
    a: { ...base, age: "30", jobCategory: "medical", industry: "medical", employmentType: "fulltime", companySize: "m", prefecture: "神奈川県", currentIncome: 380, jobYears: "10", management: "leader", jobChanges: "2", education: "vocational", skillLevels: { hospitality: 3, office: 2 }, skills: ["care", "license"], achievements: ["customer", "training"], motivation: "thanks", strength: "talk", reputation: "listener", workStyle: "team", interests: ["health", "people"], priority: "balance", desiredIncome: 430 },
  },
  {
    id: "M7", layer: "middle", label: "29歳 Webデザイナー 東京 400万",
    ranks: ["A", "B"], expectJobs: ["webDesigner", "webMarketer", "planner"],
    a: { ...base, age: "25", jobCategory: "creative", industry: "media", employmentType: "fulltime", companySize: "s", prefecture: "東京都", currentIncome: 400, jobYears: "3", management: "none", jobChanges: "1", education: "vocational", skillLevels: { design: 4, writing: 2 }, skills: ["noneSkill"], achievements: ["customer"], motivation: "create", strength: "idea", reputation: "unique", workStyle: "solo", interests: ["digital", "trend"], priority: "freedom", desiredIncome: 480 },
  },
  // ---------------- ローレイヤー ----------------
  {
    id: "L1", layer: "low", label: "23歳 アパレル販売 契約社員 静岡 260万",
    ranks: ["B", "C", "D"], expectJobs: ["storeManager", "customerSuccess", "corporateSales", "careerAdvisor"],
    a: { ...base, age: "u25", jobCategory: "service", industry: "retail", employmentType: "contract", companySize: "l", prefecture: "静岡県", currentIncome: 260, jobYears: "1", management: "none", jobChanges: "0", education: "high", skillLevels: { hospitality: 3 }, skills: ["license"], achievements: ["customer"], motivation: "thanks", strength: "talk", reputation: "listener", workStyle: "team", interests: ["trend"], priority: "income", desiredIncome: 320 },
  },
  {
    id: "L2", layer: "low", label: "26歳 飲食アルバイト 北海道 200万",
    ranks: ["C", "D"], expectJobs: ["storeManager", "corporateSales", "customerSuccess"],
    a: { ...base, age: "25", jobCategory: "food", industry: "service", employmentType: "parttime", companySize: "s", prefecture: "北海道", currentIncome: 200, jobYears: "3", management: "none", jobChanges: "1", education: "high", skillLevels: { hospitality: 4 }, skills: ["noneSkill"], achievements: ["customer"], motivation: "thanks", strength: "move", reputation: "active", workStyle: "field", interests: ["trend", "living"], priority: "income", desiredIncome: 300 },
  },
  {
    id: "L3", layer: "low", label: "31歳 倉庫作業 派遣 茨城 280万",
    ranks: ["C", "D"], expectJobs: ["logistics", "qualityControl"],
    a: { ...base, age: "30", jobCategory: "logistics", industry: "logistics", employmentType: "dispatch", companySize: "m", prefecture: "茨城県", currentIncome: 280, jobYears: "1", management: "none", jobChanges: "3", education: "high", skillLevels: { office: 1 }, skills: ["license"], achievements: ["noneAchievement"], motivation: "accurate", strength: "move", reputation: "careful", workStyle: "field", interests: ["living"], priority: "stability", desiredIncome: 330 },
  },
  {
    id: "L4", layer: "low", label: "47歳 ブランク中 元事務 大阪",
    ranks: ["C", "D"], expectJobs: ["officeWork", "accounting", "customerSuccess"],
    a: { ...base, age: "45", jobCategory: "office", industry: "other", employmentType: "none", companySize: "unknown", prefecture: "大阪府", currentIncome: 100, jobYears: "5", management: "none", jobChanges: "2", education: "vocational", skillLevels: { office: 3 }, skills: ["mos"], achievements: ["noneAchievement"], motivation: "accurate", strength: "steady", reputation: "careful", workStyle: "any", interests: ["people"], priority: "balance", desiredIncome: 300 },
  },
  {
    id: "L5", layer: "low", label: "24歳 介護パート 長野 220万",
    ranks: ["C", "D"], expectJobs: ["careWorker"],
    a: { ...base, age: "u25", jobCategory: "medical", industry: "medical", employmentType: "parttime", companySize: "m", prefecture: "長野県", currentIncome: 220, jobYears: "1", management: "none", jobChanges: "1", education: "high", skillLevels: { hospitality: 2 }, skills: ["care"], achievements: ["customer"], motivation: "thanks", strength: "steady", reputation: "listener", workStyle: "team", interests: ["health", "people"], priority: "stability", desiredIncome: 280 },
  },
  {
    id: "L6", layer: "low", label: "52歳 ドライバー 転職4回 鹿児島 380万",
    ranks: ["C", "D"], expectJobs: ["logistics"],
    a: { ...base, age: "50", jobCategory: "logistics", industry: "logistics", employmentType: "fulltime", companySize: "s", prefecture: "鹿児島県", currentIncome: 380, jobYears: "10", management: "none", jobChanges: "4+", education: "high", skillLevels: {}, skills: ["license"], achievements: ["noneAchievement"], motivation: "accurate", strength: "move", reputation: "active", workStyle: "field", interests: ["living"], priority: "balance", desiredIncome: 400 },
  },
];
