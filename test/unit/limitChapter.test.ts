import { latinizeText } from "../../views/common/latinizeText";
import { limitChapter } from "../../views/common/utilities";

// utilities.js relies on latinizeText being a content-script global (loaded via manifest);
// expose it here so findBook resolves it the same way at runtime.
(global as any).latinizeText = latinizeText;

// Real Romanian (VDC) book cache as built by fetchVersionBooks from the bible.com API
const booksCacheObj: { key: string; name: string; chapters: number }[] = require("./bookCacheObj.ro.json");

describe("limitChapter", () => {
  test.each([
    ["Matei", 44, 28], // the bad reference that opened .../MAT.44.VDC
    ["Psalmul", 151, 150],
    ["Iuda", 2, 1], // single chapter book
    ["Geneza", 999, 50]
  ])("caps %s %s to its last chapter", (book, chapter, expected) => {
    expect(limitChapter(book, chapter, booksCacheObj)).toBe(expected);
  });

  test.each([
    ["Matei", 28], // exactly the last one
    ["Matei", 5],
    ["Ioan", 21],
    ["Geneza", 1]
  ])("leaves an existing chapter alone: %s %s", (book, chapter) => {
    expect(limitChapter(book, chapter, booksCacheObj)).toBe(chapter);
  });

  it("caps a chapter written as text", () => {
    // getVerseInfo returns the chapter as it was typed
    expect(limitChapter("Matei", "44", booksCacheObj)).toBe(28);
    expect(limitChapter("Matei", "5", booksCacheObj)).toBe("5");
  });

  it("resolves the book the same way findBookKey does", () => {
    expect(limitChapter("matei", 44, booksCacheObj)).toBe(28);
    expect(limitChapter("judecatorii", 30, booksCacheObj)).toBe(21);
  });

  it("keeps the chapter when the book is unknown", () => {
    expect(limitChapter("Nonexistent", 44, booksCacheObj)).toBe(44);
    expect(limitChapter("Matei", 44, [])).toBe(44);
  });

  it("keeps the chapter when the cache has no chapter counts", () => {
    // the popover fallback in cacheBooks() scrapes names only
    expect(limitChapter("Matei", 44, [{ name: "Matei" }] as any)).toBe(44);
  });
});
