import { latinizeText } from "../../views/common/latinizeText";
import { getVerseInfo } from "../../views/common/bible-mappings";
import { findBook } from "../../views/common/utilities";
import { parseGroupedVerseLabel } from "../../views/bibles/bible.com/selectors";

// content-script globals (loaded via manifest) used by external-verses.js
Object.assign(global as any, {
  latinizeText,
  getVerseInfo,
  findBook,
  parseGroupedVerseLabel,
  fillNumbers: (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
});

const { findExternalBook, parseExternalReference, pickVerses } = require("../../views/main/actions/external-verses");

// Real Romanian (VDC) book cache as built by fetchVersionBooks from the bible.com API
const books: { key: string; name: string; chapters: number }[] = require("./bookCacheObj.ro.json");

describe("findExternalBook", () => {
  it("resolves a USFM key (any case)", () => {
    expect(findExternalBook("JHN", books).key).toBe("JHN");
    expect(findExternalBook("psa", books).key).toBe("PSA");
  });

  it("resolves a localized (partial) name", () => {
    expect(findExternalBook("Ioan", books).key).toBe("JHN");
    expect(findExternalBook("geneza", books).key).toBe("GEN");
  });

  it("returns undefined for an unknown book", () => {
    expect(findExternalBook("Xyz", books)).toBeUndefined();
  });
});

describe("parseExternalReference", () => {
  it("parses a verse range", () => {
    const result = parseExternalReference("Ioan 3:16-18", books);
    expect(result.status).toBe(200);
    expect(result.book.key).toBe("JHN");
    expect(result.match).toEqual({ book: "Ioan", chapter: 3, verse: 16, to: 18 });
    expect(result.numbers).toEqual([16, 17, 18]);
  });

  it("uses the localized book name for a USFM reference", () => {
    const result = parseExternalReference("JHN 3:16", books);
    expect(result.status).toBe(200);
    expect(result.match.book).toBe("Ioan");
    expect(result.numbers).toEqual([16]);
  });

  it("returns the whole chapter for a chapter reference", () => {
    const result = parseExternalReference("Psalmul 23", books);
    expect(result.status).toBe(200);
    expect(result.book.key).toBe("PSA");
    expect(result.numbers).toBeNull();
  });

  it("rejects an invalid format with 400", () => {
    expect(parseExternalReference("hello", books).status).toBe(400);
    expect(parseExternalReference("", books).status).toBe(400);
    expect(parseExternalReference(undefined, books).status).toBe(400);
  });

  it("rejects a reversed range with 400", () => {
    expect(parseExternalReference("Ioan 3:18-16", books).status).toBe(400);
  });

  it("rejects an unknown book with 422", () => {
    expect(parseExternalReference("Xyz 3:16", books).status).toBe(422);
  });

  it("rejects a chapter past the end of the book with 422", () => {
    const result = parseExternalReference("Ioan 22:1", books);
    expect(result.status).toBe(422);
    expect(result.error).toContain("21");
  });
});

describe("pickVerses", () => {
  const chapter = [
    { verseNr: "1", content: "one" },
    { verseNr: "2", content: "two" },
    { verseNr: "3-5", content: "three to five" },
    { verseNr: "6", content: "six" }
  ];

  it("returns the requested verses", () => {
    expect(pickVerses(chapter, [1, 2])).toEqual({
      verses: [
        { verse: "1", text: "one" },
        { verse: "2", text: "two" }
      ],
      missing: []
    });
  });

  it("returns a grouped verse once", () => {
    expect(pickVerses(chapter, [3, 4, 5, 6]).verses).toEqual([
      { verse: "3-5", text: "three to five" },
      { verse: "6", text: "six" }
    ]);
  });

  it("reports missing verses", () => {
    expect(pickVerses(chapter, [6, 7, 8]).missing).toEqual([7, 8]);
  });

  it("returns the whole chapter when numbers is null", () => {
    expect(pickVerses(chapter, null).verses).toHaveLength(4);
  });
});
