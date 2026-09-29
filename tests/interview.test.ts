import { describe, expect, it } from "vitest";
import { SELECTABLE_DAYS, candidateDates, formatInterviewDate, isSelectableDate } from "@/lib/interview-dates";
import { interviewSchema } from "@/lib/schemas";

// 2026-09-28 23:30 JST (= 14:30 UTC)
const NOW = new Date("2026-09-28T14:30:00Z");

describe("candidateDates", () => {
  it("日本時間の翌日から14日分を返す", () => {
    const d = candidateDates(NOW);
    expect(d).toHaveLength(SELECTABLE_DAYS);
    expect(d[0]).toMatchObject({ value: "2026-09-29", month: 9, day: 29, weekday: "火" });
    expect(d.at(-1)?.value).toBe("2026-10-12");
  });

  it("UTC では前日でも JST の日付で数える", () => {
    // 2026-09-28 00:30 JST (= 09-27 15:30 UTC)
    expect(candidateDates(new Date("2026-09-27T15:30:00Z"))[0].value).toBe("2026-09-29");
  });
});

describe("isSelectableDate", () => {
  it("範囲内だけ true", () => {
    expect(isSelectableDate("2026-09-29", NOW)).toBe(true);
    expect(isSelectableDate("2026-10-12", NOW)).toBe(true);
    expect(isSelectableDate("2026-09-01", NOW)).toBe(false);
    expect(isSelectableDate("2026-12-01", NOW)).toBe(false);
    expect(isSelectableDate("not-a-date", NOW)).toBe(false);
  });
});

describe("interviewSchema", () => {
  const future = candidateDates().map((d) => d.value);
  it("日付1〜3件 + 時間帯で通る", () => {
    expect(interviewSchema.safeParse({ dates: future.slice(0, 3), time: "night" }).success).toBe(true);
  });
  it("日付なし・4件以上・重複・時間帯なしは弾く", () => {
    expect(interviewSchema.safeParse({ dates: [], time: "am" }).success).toBe(false);
    expect(interviewSchema.safeParse({ dates: future.slice(0, 4), time: "am" }).success).toBe(false);
    expect(interviewSchema.safeParse({ dates: [future[0], future[0]], time: "am" }).success).toBe(false);
    expect(interviewSchema.safeParse({ dates: future.slice(0, 1) }).success).toBe(false);
  });
});

it("formatInterviewDate", () => {
  expect(formatInterviewDate("2026-10-01")).toBe("10月1日(木)");
});
