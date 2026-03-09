import { getVerseSelector, parseGroupedVerseLabel } from "../../views/bibles/bible.com/selectors";

describe("getVerseSelector", () => {
  it("matches a single verse by end of data-usfm", () => {
    const selector = getVerseSelector(16);
    expect(selector).toContain('[data-usfm$=".16"]');
  });

  it("matches a grouped verse where the number is the first in the group", () => {
    const selector = getVerseSelector(43);
    expect(selector).toContain('[data-usfm*=".43+"]');
  });

  it("includes both single and grouped selectors", () => {
    const selector = getVerseSelector(43);
    const parts = selector.split(",").map(s => s.trim());
    expect(parts).toHaveLength(2);
    expect(parts[0]).toContain('[data-usfm$=".43"]');
    expect(parts[1]).toContain('[data-usfm*=".43+"]');
  });
});

describe("parseGroupedVerseLabel", () => {
  it("returns null for a regular single verse label", () => {
    expect(parseGroupedVerseLabel("5")).toBeNull();
    expect(parseGroupedVerseLabel("16")).toBeNull();
  });

  it("parses a grouped verse label like '43-47'", () => {
    const result = parseGroupedVerseLabel("43-47");
    expect(result).toEqual({ from: 43, to: 47 });
  });

  it("parses a grouped verse label with surrounding whitespace", () => {
    const result = parseGroupedVerseLabel(" 38-42 ");
    expect(result).toEqual({ from: 38, to: 42 });
  });

  it("returns null for empty or nullish input", () => {
    expect(parseGroupedVerseLabel("")).toBeNull();
    expect(parseGroupedVerseLabel(null)).toBeNull();
  });

  it("navigating forward: last number in group is used as base", () => {
    const parsed = parseGroupedVerseLabel("43-47");
    // dir > 0 → next verse after group = to + 1 = 48
    expect(parsed.to + 1).toBe(48);
  });

  it("navigating backward: first number in group is used as base", () => {
    const parsed = parseGroupedVerseLabel("43-47");
    // dir < 0 → prev verse before group = from - 1 = 42
    expect(parsed.from - 1).toBe(42);
  });
});
