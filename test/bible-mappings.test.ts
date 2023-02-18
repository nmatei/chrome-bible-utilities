import { BibleVersionsMappings, getDiffMapping, mapParallelVerse } from "../views/common/bible-mappings";
import { getUrlMatch } from "../views/main/selectors";

describe("Test RU BibleVersions Mappings", () => {
  it("Numbers in НРП vs VDC", () => {
    const mapping = getDiffMapping(BibleVersionsMappings[143].mapping, "NUM", "13", false);
    expect(mapping).toBe(1);
  });

  it("Numbers in [ro].VDC vs [ru].НРП", () => {
    const mapping = getDiffMapping(BibleVersionsMappings[143].mapping, "NUM", "13", true);
    expect(mapping).toBe(-1);
  });

  // ===
  it("Numbers 13.1 [ro].VDC is Numbers 13.2 in [ru].НРП", () => {
    const urlMatch = getUrlMatch("https://my.bible.com/bible/191/NUM.13.VDC?parallel=143");
    const nr = mapParallelVerse(1, false, urlMatch);
    expect(nr).toBe(2);
  });

  it("Numbers 13.1 [ro].VDC is Numbers 13.1 in [en].NIV", () => {
    const urlMatch = getUrlMatch("https://my.bible.com/bible/191/NUM.13.VDC?parallel=111");
    const nr = mapParallelVerse(1, false, urlMatch);
    expect(nr).toBe(1);
  });
});
