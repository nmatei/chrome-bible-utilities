import { formatVerseRef, getVerseInfo, getVerseStr } from "../../views/common/bible-mappings";
import { splitVerses } from "../../views/common/utilities";
import { getUrlMatch } from "../../views/bibles/bible.com/common";

type VerseInfo = {
  book?: string;
  chapter?: string;
  verse?: string;
};

function testMatch(
  match: VerseInfo,
  book: string,
  chapter: number | string,
  verse?: number | string,
  to?: number | string
) {
  expect(match).toBeDefined();
  to = to || "";
  //expect(match).toEqual({ book, chapter, verse, to });
  const actual = { book, chapter, verse, to };
  expect(actual).toMatchObject(match);
}

describe("Test regular expression matches for getVerseInfo", () => {
  it("[Space] as verse separator", () => {
    const match = getVerseInfo("Ioan 3 16");
    testMatch(match, "Ioan", 3, 16);
  });
  it("[:] as verse separator", () => {
    const match = getVerseInfo("Ioan 3:16");
    testMatch(match, "Ioan", 3, 16);
  });
  it("[.] as verse separator", () => {
    const match = getVerseInfo("Ioan 3.16");
    testMatch(match, "Ioan", 3, 16);
  });

  // ===
  it("[Space] in Chapter & [Space] as verse separator", () => {
    const match = getVerseInfo("Faptele Apostolilor 2 42");
    testMatch(match, "Faptele Apostolilor", 2, 42);
  });
  it("[Space] in Chapter & [:] as verse separator", () => {
    const match = getVerseInfo("Faptele Apostolilor 2:42");
    testMatch(match, "Faptele Apostolilor", 2, 42);
  });
  it("[Space] in Chapter & [.] as verse separator", () => {
    const match = getVerseInfo("Faptele Apostolilor 2.42");
    testMatch(match, "Faptele Apostolilor", 2, 42);
  });

  // ===
  it("[Numbers] in Chapter & [Space] as verse separator", () => {
    const match = getVerseInfo("1 Corinteni 2 5");
    testMatch(match, "1 Corinteni", 2, 5);
  });
  it("[Numbers] in Chapter & [:] as verse separator", () => {
    const match = getVerseInfo("1 Corinteni 2:5");
    testMatch(match, "1 Corinteni", 2, 5);
  });
  it("[Numbers] in Chapter & [.] as verse separator", () => {
    const match = getVerseInfo("1 Corinteni 2.5");
    testMatch(match, "1 Corinteni", 2, 5);
  });

  // ===
  it("[no verse] when get verse info", () => {
    const match = getVerseInfo("Ioan 3");
    testMatch(match, "Ioan", "3");
  });

  // ===
  it("[more verses] when get verse info", () => {
    const match = getVerseInfo("Mat 17:24-27");
    testMatch(match, "Mat", 17, 24, 27);
  });

  // ===
  it("trim text before in verse separator", () => {
    const match = getVerseInfo("  Ioan 3 16  ");
    testMatch(match, "Ioan", 3, 16);
  });

  // ===
  it("no chapter -> null match", () => {
    const match = getVerseInfo("Ioan");
    expect(match).toBeNull();
  });
});

describe("Test splitVerses", () => {
  it("[Enter] as verses separator", () => {
    const verses = splitVerses("Ioan 3 16\nFapte 2 3");
    expect(verses).toEqual(["Ioan 3 16", "Fapte 2 3"]);
  });
  it("[,] as verses separator", () => {
    const verses = splitVerses("Ioan 3 16, Fapte 2 3");
    expect(verses).toEqual(["Ioan 3 16", "Fapte 2 3"]);
  });
  it("[;] as verses separator", () => {
    const verses = splitVerses("Ioan 3 16 ;   Fapte 2 3");
    expect(verses).toEqual(["Ioan 3 16", "Fapte 2 3"]);
  });
  it("[;] as verses separator with ending separator", () => {
    const verses = splitVerses("Ioan 3 16 ;   Fapte 2 3;");
    expect(verses).toEqual(["Ioan 3 16", "Fapte 2 3"]);
  });
  it("[;] as verses separator with more separators", () => {
    const verses = splitVerses("Ioan 3 16 ;;   Fapte 2 3;");
    expect(verses).toEqual(["Ioan 3 16", "Fapte 2 3"]);
  });

  it("[,][;][Enter] as verses separator", () => {
    const verses = splitVerses("Ioan 3 16, Fapte 2 3; Rom 2 1\n John 3:16");
    expect(verses).toEqual(["Ioan 3 16", "Fapte 2 3", "Rom 2 1", "John 3:16"]);
  });

  it("[Multiple separators] in the same time", () => {
    const verses = splitVerses("Ioan 3 16,\nFapte 2 3; Rom 2 1\n;\n John 3:16");
    expect(verses).toEqual(["Ioan 3 16", "Fapte 2 3", "Rom 2 1", "John 3:16"]);
  });

  it("[Trim spaces] when split Verses", () => {
    const verses = splitVerses("    Ioan 3 16, Fapte 2 3; Rom 2 1\n John 3:16\n\n");
    expect(verses).toEqual(["Ioan 3 16", "Fapte 2 3", "Rom 2 1", "John 3:16"]);
  });

  it("[Only spaces] should return empty array when split Verses", () => {
    const verses = splitVerses("    ");
    expect(verses).toEqual([]);
  });
});

describe("Get reference [preview] tests", () => {
  it("[Full] info for formatVerseRef", () => {
    const preview = formatVerseRef("Ioan 3 16");
    expect(preview).toEqual("Ioan 3:16");
  });

  it("[No verse] for formatVerseRef", () => {
    const preview = formatVerseRef("Ioan 3");
    expect(preview).toEqual("Ioan 3");
  });

  it("[No chapter] for formatVerseRef", () => {
    const preview = formatVerseRef("Ioan");
    expect(preview).toEqual("");
  });

  it("[more verses] info for formatVerseRef", () => {
    const preview = formatVerseRef("Ioan 3 16-17");
    expect(preview).toEqual("Ioan 3:16-17");
  });

  it("[missing to] info for formatVerseRef", () => {
    const preview = formatVerseRef("Ioan 3 16-");
    expect(preview).toEqual("Ioan 3:16");
  });
});

describe("Test URL Url Matches", () => {
  it("getUrlMatch 1", () => {
    const match = getUrlMatch("https://my.bible.com/bible/191/PSA.23.VDC?parallel=186");
    expect(match).toBeDefined();
    expect(match.groups).toEqual({
      primary: "191",
      book: "PSA",
      chapter: "23",
      parallel: "186",
      version: "VDC"
    });
  });

  it("getUrlMatch 2", () => {
    const match = getUrlMatch("https://my.bible.com/bible/191/JOB.40.VDC?parallel=186");
    expect(match).toBeDefined();
    expect(match.groups).toEqual({
      primary: "191",
      book: "JOB",
      chapter: "40",
      parallel: "186",
      version: "VDC"
    });
  });
});

describe("Get verse string tests", () => {
  it("should format simple verse reference correctly", () => {
    const result = getVerseStr({ book: "Ioan", chapter: 3, verse: 16 });
    expect(result).toEqual("Ioan 3:16");
  });

  it("should format verse range correctly", () => {
    const result = getVerseStr({ book: "Psalmi", chapter: 23, verse: 1, to: 6 });
    expect(result).toEqual("Psalmi 23:1-6");
  });

  it("should format reference with multi-word book name", () => {
    const result = getVerseStr({ book: "Faptele Apostolilor", chapter: 2, verse: 42 });
    expect(result).toEqual("Faptele Apostolilor 2:42");
  });

  it("should format reference with numeric book name", () => {
    const result = getVerseStr({ book: "1 Corinteni", chapter: 13, verse: 4, to: 7 });
    expect(result).toEqual("1 Corinteni 13:4-7");
  });

  it("should handle reference with empty 'to' value", () => {
    const result = getVerseStr({ book: "Romani", chapter: 8, verse: 28, to: "" });
    expect(result).toEqual("Romani 8:28");
  });

  it("should return string input unchanged", () => {
    const result = getVerseStr("Ioan 3:16");
    expect(result).toEqual("Ioan 3:16");
  });
});
