import { describe, expect, it } from "vitest";
import { diagnose } from "@/lib/engine";
import { PERSONAS } from "./personas";

describe("人物像ごとの診断結果", () => {
  for (const p of PERSONAS) {
    it(`${p.id} ${p.label}`, () => {
      const r = diagnose(p.a);
      expect(p.ranks, `スコア ${r.score}`).toContain(r.rank);
      expect(r.jobs.map((j) => j.key).some((k) => p.expectJobs.includes(k)), r.jobs.map((j) => j.name).join(",")).toBe(true);
    });
  }

  it("レイヤーが上の人ほどスコアが高い (平均)", () => {
    const avg = (layer: string) => {
      const s = PERSONAS.filter((p) => p.layer === layer).map((p) => diagnose(p.a).score);
      return s.reduce((x, y) => x + y, 0) / s.length;
    };
    expect(avg("high")).toBeGreaterThan(avg("middle") + 15);
    expect(avg("middle")).toBeGreaterThan(avg("low") + 25);
  });

  it("年収の高い人の1位の職種が、いまの年収より大きく下がらない", () => {
    for (const p of PERSONAS.filter((x) => x.layer === "high")) {
      const top = diagnose(p.a).jobs[0];
      expect(top.incomeHigh, `${p.id} ${top.name}`).toBeGreaterThanOrEqual(p.a.currentIncome * 0.9);
    }
  });
});
