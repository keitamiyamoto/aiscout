import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENT_BONUS,
  AGE_FACTOR,
  BASE_INCOME,
  CAREERS,
  type CareerKey,
  COMPANY_SIZE_FACTOR,
  EDUCATION_FACTOR,
  EMPLOYMENT_FACTOR,
  INDUSTRY_FACTOR,
  JOB_CHANGES_FACTOR,
  JOB_YEARS_FACTOR,
  MANAGEMENT_FACTOR,
  QUALIFICATION_BONUS,
  AGE_AVERAGE_INCOME,
  SKILL_WEIGHT,
  diagnose,
} from "@/lib/engine";
import { OPTIONS, QUESTIONS } from "@/lib/questions";
import { answersSchema, type Answers } from "@/lib/schemas";
import { SAMPLE, randomAnswers, resetSeed } from "./fixtures";


const tables: Array<[string, Record<string, number>, keyof typeof OPTIONS]> = [
  ["BASE_INCOME", BASE_INCOME, "jobCategory"],
  ["AGE_FACTOR", AGE_FACTOR, "age"],
  ["JOB_YEARS_FACTOR", JOB_YEARS_FACTOR, "jobYears"],
  ["MANAGEMENT_FACTOR", MANAGEMENT_FACTOR, "management"],
  ["COMPANY_SIZE_FACTOR", COMPANY_SIZE_FACTOR, "companySize"],
  ["INDUSTRY_FACTOR", INDUSTRY_FACTOR, "industry"],
  ["EDUCATION_FACTOR", EDUCATION_FACTOR, "education"],
  ["EMPLOYMENT_FACTOR", EMPLOYMENT_FACTOR, "employmentType"],
  ["JOB_CHANGES_FACTOR", JOB_CHANGES_FACTOR, "jobChanges"],
  ["QUALIFICATION_BONUS", QUALIFICATION_BONUS, "skills"],
  ["ACHIEVEMENT_BONUS", ACHIEVEMENT_BONUS, "achievements"],
  ["SKILL_WEIGHT", SKILL_WEIGHT, "skillLevels"],
];

describe("係数表", () => {
  it.each(tables)("%s は全ての選択肢をカバーしている", (_name, table, key) => {
    for (const o of OPTIONS[key]) expect(table[o.value], `${key}.${o.value}`).toBeTypeOf("number");
  });

  it("全ての質問に回答キーがある", () => {
    const keys = Object.keys(answersSchema.shape);
    for (const q of QUESTIONS) expect(keys).toContain(q.key);
    expect(QUESTIONS.length).toBe(keys.length);
  });
});

describe("diagnose", () => {
  it("サンプル回答で妥当な範囲の結果を返す", () => {
    const r = diagnose(SAMPLE);
    expect(r.marketValue).toBeGreaterThan(350);
    expect(r.marketValue).toBeLessThan(700);
    expect(r.low).toBeLessThan(r.marketValue);
    expect(r.high).toBeGreaterThan(r.marketValue);
    expect(r.marketValue % 10).toBe(0);
    expect(r.jobs).toHaveLength(3);
    expect(r.jobs[0].match).toBeGreaterThanOrEqual(r.jobs[2].match);
    expect(["S", "A", "B", "C", "D"]).toContain(r.rank);
    expect(r.persona.name).toBeTruthy();
    expect(r.comment).toContain("万円");
  });

  it("営業志向の回答では営業系の職種が上位に来る", () => {
    const r = diagnose(SAMPLE);
    expect(["corporateSales", "itSales", "careerAdvisor", "realEstateSales"]).toContain(r.jobs[0].key);
  });

  it("分析志向のエンジニアには開発・分析系が上位に来る", () => {
    const r = diagnose({
      ...SAMPLE,
      jobCategory: "engineer",
      motivation: "solve",
      strength: "analyze",
      reputation: "logical",
      workStyle: "solo",
      interests: ["digital"],
      priority: "growth",
      skillLevels: { programming: 4 },
      skills: ["itcert"],
    });
    expect(["engineer", "infraEngineer", "dataAnalyst"]).toContain(r.jobs[0].key);
    expect(r.persona.key).toBe("analytic");
  });

  it("経験・マネジメント・スキルが多いほど市場価値が上がる", () => {
    const junior = diagnose({ ...SAMPLE, jobYears: "0", management: "none", skillLevels: {}, achievements: ["noneAchievement"] });
    const senior = diagnose({ ...SAMPLE, jobYears: "10", management: "senior", skillLevels: { sales: 5, management: 5, english: 4 }, achievements: ["target", "project"] });
    expect(senior.marketValue).toBeGreaterThan(junior.marketValue);
    expect(senior.score).toBeGreaterThan(junior.score);
  });

  it("働いていない場合も結果を返す", () => {
    const r = diagnose({ ...SAMPLE, employmentType: "none", currentIncome: 0 });
    expect(r.marketValue).toBeGreaterThan(200);
    expect(r.comment).not.toContain("NaN");
  });

  it("全職種 × 全年代で NaN を出さない", () => {
    for (const job of OPTIONS.jobCategory) {
      for (const age of OPTIONS.age) {
        const r = diagnose({ ...SAMPLE, jobCategory: job.value, age: age.value });
        expect(Number.isFinite(r.marketValue)).toBe(true);
        expect(r.jobs.every((j) => j.match >= 60 && j.match <= 98 && j.incomeLow > 0)).toBe(true);
      }
    }
  });

  it("適職の候補はそれぞれ名前を持つ", () => {
    for (const c of Object.values(CAREERS)) expect(c.name).toBeTruthy();
  });
});

describe("スコアの分布", () => {
  const sample = (n: number, tweak?: (a: Answers) => void) => {
    resetSeed();
    const count: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    for (let i = 0; i < n; i++) {
      const a = randomAnswers();
      tweak?.(a);
      count[diagnose(a).rank] += 1;
    }
    return Object.fromEntries(Object.entries(count).map(([k, v]) => [k, v / n]));
  };

  it("ランダムな回答で S は1割未満、どのランクも出る", () => {
    const p = sample(5000);
    expect(p.S).toBeGreaterThan(0.02);
    expect(p.S).toBeLessThan(0.12);
    expect(p.A).toBeGreaterThan(0.12);
    expect(p.B).toBeGreaterThan(0.25);
    expect(p.C).toBeGreaterThan(0.12);
    expect(p.D).toBeGreaterThan(0.005);
  });

  it("年収が高い人のスコアが極端に低くならない (同年代と比べる)", () => {
    // 以前は「同職種・同エリアの経歴が平均的な人」と狭い幅で比べていたため、年収650万でも8点前後になっていた
    const r = diagnose({ ...SAMPLE, age: "35", prefecture: "大阪府", currentIncome: 650, jobYears: "1", management: "none", companySize: "s", industry: "retail", desiredIncome: 800, skillLevels: {}, skills: ["noneSkill"], achievements: ["noneAchievement"] });
    expect(r.score).toBeGreaterThanOrEqual(60);
  });

  it("同年代の平均と同じくらいの市場価値なら真ん中あたりのスコア", () => {
    for (const age of Object.keys(AGE_AVERAGE_INCOME) as Answers["age"][]) {
      const avg = AGE_AVERAGE_INCOME[age];
      // 現在年収と想定年収の両方を平均に寄せる
      let best = { diff: Infinity, score: 0 };
      for (const jobCategory of ["office", "sales", "engineer"] as const) {
        for (let inc = 100; inc <= 900; inc += 10) {
          const r = diagnose({ ...SAMPLE, age, jobCategory, prefecture: "北海道", currentIncome: inc });
          if (Math.abs(r.marketValue - avg) < best.diff) best = { diff: Math.abs(r.marketValue - avg), score: r.score };
        }
      }
      expect(best.diff).toBeLessThanOrEqual(10);
      expect(best.score).toBeGreaterThanOrEqual(45);
      expect(best.score).toBeLessThanOrEqual(65);
    }
  });

  it("いまの年収が高いほどスコアも高い", () => {
    const scores = [300, 450, 600, 800].map((inc) => diagnose({ ...SAMPLE, currentIncome: inc }).score);
    expect([...scores].sort((x, y) => x - y)).toEqual(scores);
    expect(scores[3]).toBeGreaterThan(scores[0] + 30);
  });

  it("スキルを全部0にした人は S にほぼならない", () => {
    const p = sample(3000, (a) => {
      a.skillLevels = {};
    });
    expect(p.S).toBeLessThan(0.05);
  });

  it("同年代の平均は年代ごとの統計値", () => {
    for (const age of Object.keys(AGE_AVERAGE_INCOME) as Answers["age"][]) {
      expect(diagnose({ ...SAMPLE, age }).peerAverage).toBe(AGE_AVERAGE_INCOME[age]);
    }
  });

  it("上位% はスコアと対応する", () => {
    const r = diagnose(SAMPLE);
    expect(r.topPercent).toBe(Math.max(1, 100 - r.score));
  });
});

describe("適職の分布", () => {
  const N = 5000;
  const run = () => {
    resetSeed();
    const out: Array<{ a: Answers; keys: CareerKey[] }> = [];
    for (let i = 0; i < N; i++) {
      const a = randomAnswers();
      out.push({ a, keys: diagnose(a).jobs.map((j) => j.key) });
    }
    return out;
  };

  it("どの職種も TOP3 の4割以上を占めない (いつも同じ職種が出ない)", () => {
    const count: Record<string, number> = {};
    for (const { keys } of run()) for (const k of keys) count[k] = (count[k] ?? 0) + 1;
    for (const [k, v] of Object.entries(count)) expect(v / N, k).toBeLessThan(0.4);
    // 20職種のうち、ほとんどの職種がどこかで出てくる
    expect(Object.keys(count).length).toBeGreaterThanOrEqual(18);
  });

  it("いまの職種の経験を活かせる職種が、たいてい TOP3 に入る", () => {
    const rows = run().filter(({ a }) => a.jobCategory !== "other");
    const hit = rows.filter(({ a, keys }) => keys.some((k) => (CAREERS[k].from as readonly string[]).includes(a.jobCategory)));
    expect(hit.length / rows.length).toBeGreaterThan(0.85);
  });

  it("相性 % は1位から順に下がる", () => {
    for (const { a } of run().slice(0, 1000)) {
      const m = diagnose(a).jobs.map((j) => j.match);
      expect([...m].sort((x, y) => y - x)).toEqual(m);
    }
  });

  it("TOP3 が同じグループの職種だけにならない (3つとも経験を活かせる職種の場合を除く)", () => {
    for (const { a, keys } of run()) {
      const families = new Set(keys.map((k) => CAREERS[k].family));
      const allExperienced = keys.every((k) => (CAREERS[k].from as readonly string[]).includes(a.jobCategory));
      if (!allExperienced) expect(families.size).toBeGreaterThanOrEqual(2);
    }
  });
});
