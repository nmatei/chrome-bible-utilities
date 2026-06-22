import { latinizeText } from "../../views/common/latinizeText";
import { findBookKey } from "../../views/common/utilities";

// utilities.js relies on latinizeText being a content-script global (loaded via manifest);
// expose it here so findBookKey resolves it the same way at runtime.
(global as any).latinizeText = latinizeText;

// Real Romanian (VDC) book cache as built by fetchVersionBooks from the bible.com API
const booksCacheObj: { key: string; name: string; chapters: number }[] = require("./bookCacheObj.ro.json");

describe("findBookKey", () => {
  it("resolves an exact localized name to its USFM key", () => {
    expect(findBookKey("Ioan", booksCacheObj)).toBe("JHN");
    expect(findBookKey("Geneza", booksCacheObj)).toBe("GEN");
  });

  it("is case-insensitive", () => {
    expect(findBookKey("ioan", booksCacheObj)).toBe("JHN");
    expect(findBookKey("GENEZA", booksCacheObj)).toBe("GEN");
  });

  it("matches diacritic-free input against accented names", () => {
    // names: "Judecătorii", "Cântarea Cântărilor", "Ţefania" (cedilla form)
    expect(findBookKey("judecatorii", booksCacheObj)).toBe("JDG");
    expect(findBookKey("cantarea cantarilor", booksCacheObj)).toBe("SNG");
    expect(findBookKey("tefania", booksCacheObj)).toBe("ZEP");
  });

  it("resolves numbered books", () => {
    expect(findBookKey("1 Samuel", booksCacheObj)).toBe("1SA");
    expect(findBookKey("2 Samuel", booksCacheObj)).toBe("2SA");
  });

  it("matches on substring and returns the first matching book", () => {
    // "samuel" is contained in both "1 Samuel" and "2 Samuel" — first wins
    expect(findBookKey("samuel", booksCacheObj)).toBe("1SA");
  });

  it("returns undefined when no book matches", () => {
    expect(findBookKey("xyz", booksCacheObj)).toBeUndefined();
  });
});
