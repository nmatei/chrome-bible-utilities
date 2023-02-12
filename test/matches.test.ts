import { getVerseInfo, splitVerses } from "../views/common/utilities";

type VerseInfo = {
  book?: string;
  chapter?: string;
  verse?: string;
};

function testMatch(match: VerseInfo, book: string, chapter: string, verse: string) {
  expect(match).toBeDefined();
  expect(match.book).toBe(book);
  expect(match.chapter).toBe(chapter);
  expect(match.verse).toBe(verse);
}

describe("Test regular expression matches for getVerseInfo", () => {
  it("[Space] as verse separator", () => {
    const match = getVerseInfo("Ioan 3 16");
    testMatch(match, "Ioan", "3", "16");
  });
  it("[:] as verse separator", () => {
    const match = getVerseInfo("Ioan 3:16");
    testMatch(match, "Ioan", "3", "16");
  });
  it("[.] as verse separator", () => {
    const match = getVerseInfo("Ioan 3.16");
    testMatch(match, "Ioan", "3", "16");
  });

  // ===
  it("[Space] in Chapter & [Space] as verse separator", () => {
    const match = getVerseInfo("Faptele Apostolilor 2 42");
    testMatch(match, "Faptele Apostolilor", "2", "42");
  });
  it("[Space] in Chapter & [:] as verse separator", () => {
    const match = getVerseInfo("Faptele Apostolilor 2:42");
    testMatch(match, "Faptele Apostolilor", "2", "42");
  });
  it("[Space] in Chapter & [.] as verse separator", () => {
    const match = getVerseInfo("Faptele Apostolilor 2.42");
    testMatch(match, "Faptele Apostolilor", "2", "42");
  });

  // ===
  it("[Numbers] in Chapter & [Space] as verse separator", () => {
    const match = getVerseInfo("1 Corinteni 2 5");
    testMatch(match, "1 Corinteni", "2", "5");
  });
  it("[Numbers] in Chapter & [:] as verse separator", () => {
    const match = getVerseInfo("1 Corinteni 2:5");
    testMatch(match, "1 Corinteni", "2", "5");
  });
  it("[Numbers] in Chapter & [.] as verse separator", () => {
    const match = getVerseInfo("1 Corinteni 2.5");
    testMatch(match, "1 Corinteni", "2", "5");
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

  it("[,][;][Enter] as verses separator", () => {
    const verses = splitVerses("Ioan 3 16, Fapte 2 3; Rom 2 1\n John 3:16");
    expect(verses).toEqual(["Ioan 3 16", "Fapte 2 3", "Rom 2 1", "John 3:16"]);
  });

  it("Multiple separators in the same time", () => {
    const verses = splitVerses("Ioan 3 16,\nFapte 2 3; Rom 2 1\n;\n John 3:16");
    expect(verses).toEqual(["Ioan 3 16", "Fapte 2 3", "Rom 2 1", "John 3:16"]);
  });

  it("Trim spaces when split Verses", () => {
    const verses = splitVerses("    Ioan 3 16, Fapte 2 3; Rom 2 1\n John 3:16\n\n");
    expect(verses).toEqual(["Ioan 3 16", "Fapte 2 3", "Rom 2 1", "John 3:16"]);
  });
});
