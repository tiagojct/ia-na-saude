import { describe, it, expect } from "vitest";
import {
  SECTIONS,
  SECTION_IDS,
  SECTION_IDS_SET,
  getTocItems,
  totalReadingTime,
  sectionsInSlot,
  slotReadingTime,
} from "../../src/lib/sections";

describe("sections module · pt-PT only", () => {
  it("has exactly 14 sections", () => {
    expect(SECTIONS.length).toBe(14);
    expect(SECTION_IDS.length).toBe(14);
  });

  it("section IDs are unique", () => {
    expect(SECTION_IDS_SET.size).toBe(SECTION_IDS.length);
  });

  it("first is 'abertura', last is 'aprofundar'", () => {
    expect(SECTION_IDS[0]).toBe("abertura");
    expect(SECTION_IDS[13]).toBe("aprofundar");
  });

  it("every section has label, sub, icon, time, num, slots", () => {
    for (const s of SECTIONS) {
      expect(s.label).toBeTruthy();
      expect(s.sub).toBeTruthy();
      expect(s.icon).toBeTruthy();
      expect(s.time).toBeGreaterThan(0);
      expect(s.num).toMatch(/^\d{2}$/);
      expect(s.slots.length).toBeGreaterThan(0);
    }
  });

  it("totalReadingTime is sum of all section times", () => {
    const sum = SECTIONS.reduce((a, s) => a + s.time, 0);
    expect(totalReadingTime()).toBe(sum);
    expect(totalReadingTime()).toBeGreaterThan(60);
    expect(totalReadingTime()).toBeLessThan(120);
  });

  it("getTocItems returns 14 entries", () => {
    expect(getTocItems()).toHaveLength(14);
    expect(getTocItems()[0].label).toBe("Abertura");
  });

  it("slot 90 includes every section", () => {
    expect(sectionsInSlot("90").length).toBe(14);
  });

  it("slot 30 is the rump core (subset of all)", () => {
    const s30 = sectionsInSlot("30");
    expect(s30.length).toBeGreaterThan(0);
    expect(s30.length).toBeLessThan(14);
    expect(slotReadingTime("30")).toBeLessThanOrEqual(35);
  });

  it("slot reading times are non-decreasing 30 < 60 < 90", () => {
    expect(slotReadingTime("30")).toBeLessThan(slotReadingTime("60"));
    expect(slotReadingTime("60")).toBeLessThan(slotReadingTime("90"));
  });
});
