import type { Answers } from "@/lib/schemas";
import { OPTIONS, PREFECTURES } from "@/lib/questions";
import { AGE_FACTOR, BASE_INCOME, regionFactor } from "@/lib/engine";

export const SAMPLE: Answers = {
  age: "30",
  jobCategory: "sales",
  industry: "it",
  employmentType: "fulltime",
  companySize: "m",
  prefecture: "東京都",
  currentIncome: 420,
  jobYears: "3",
  management: "leader",
  jobChanges: "1",
  education: "university",
  skillLevels: { sales: 4, hospitality: 2, office: 2 },
  skills: ["license"],
  achievements: ["target"],
  motivation: "numbers",
  strength: "talk",
  reputation: "reliable",
  workStyle: "team",
  interests: ["digital", "money"],
  priority: "income",
  desiredIncome: 500,
  timing: "3m",
};

let seed = 42;
/** mulberry32 (以前の線形合同法は浮動小数の桁あふれで 2万回中 300通り程度しか出ていなかった) */
const rnd = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T,>(a: readonly T[]) => a[Math.floor(rnd() * a.length)];
const vals = (k: keyof typeof OPTIONS) => OPTIONS[k].map((o) => o.value);

export function resetSeed(s = 42) {
  seed = s;
}

/** 年代ごとにありえる経験年数・役職 (24歳で経験10年、のような組み合わせを作らない) */
const YEARS_BY_AGE: Record<string, string[]> = {
  u25: ["0", "1", "1", "3"],
  "25": ["0", "1", "3", "3", "5"],
  "30": ["1", "3", "3", "5", "5", "10"],
  "35": ["1", "3", "5", "5", "10"],
  "40": ["1", "3", "5", "10", "10"],
  "45": ["3", "5", "10", "10"],
  "50": ["3", "5", "10", "10"],
};
const MGMT_BY_AGE: Record<string, string[]> = {
  u25: ["none", "none", "none", "leader"],
  "25": ["none", "none", "leader"],
  "30": ["none", "leader", "leader", "manager"],
  "35": ["none", "leader", "manager", "manager", "senior"],
  "40": ["none", "leader", "manager", "senior"],
  "45": ["none", "leader", "manager", "senior"],
  "50": ["none", "leader", "manager", "senior"],
};

/**
 * 再現できる乱数で、現実にありそうな回答を作る (分布テスト用)。
 * スキルは半分以上が0、資格・実績は少なめ、現在年収はその年代・職種の相場の前後。
 */
export function randomAnswers(): Answers {
  const age = pick(vals("age"));
  const jobCategory = pick(vals("jobCategory"));
  const prefecture = pick(PREFECTURES);
  const levels: Record<string, number> = {};
  for (const s of vals("skillLevels")) levels[s] = rnd() < 0.55 ? 0 : 1 + Math.floor(rnd() * (rnd() < 0.9 ? 4 : 5));
  const skills = vals("skills").filter((v) => v !== "noneSkill" && rnd() < 0.15);
  const ach = vals("achievements").filter((v) => v !== "noneAchievement" && rnd() < 0.25);
  const going = BASE_INCOME[jobCategory as Answers["jobCategory"]] * AGE_FACTOR[age as Answers["age"]] * regionFactor(prefecture);
  const employmentType = rnd() < 0.7 ? "fulltime" : pick(vals("employmentType"));
  return {
    age,
    jobCategory,
    industry: pick(vals("industry")),
    employmentType,
    companySize: pick(vals("companySize")),
    prefecture,
    currentIncome: employmentType === "none" ? 0 : Math.round((going * (0.7 + rnd() * 0.6)) / 10) * 10,
    jobYears: pick(YEARS_BY_AGE[age]),
    management: pick(MGMT_BY_AGE[age]),
    jobChanges: pick(vals("jobChanges")),
    education: pick(vals("education")),
    skillLevels: levels,
    skills: skills.length ? skills : ["noneSkill"],
    achievements: ach.length ? ach : ["noneAchievement"],
    motivation: pick(vals("motivation")),
    strength: pick(vals("strength")),
    reputation: pick(vals("reputation")),
    workStyle: pick(vals("workStyle")),
    interests: [pick(vals("interests"))],
    priority: pick(vals("priority")),
    desiredIncome: 400,
    timing: pick(vals("timing")),
  } as Answers;
}
