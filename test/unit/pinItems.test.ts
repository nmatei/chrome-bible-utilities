import { latinizeText } from "../../views/common/latinizeText";
import { getVerseInfo, getVerseStr } from "../../views/common/bible-mappings";
import { makePinItem, displayPinText, isPinReference, pinKey } from "../../views/common/utilities";

// utilities.js / bible-mappings.js rely on these being content-script globals
// (loaded via manifest); expose them so the pin helpers resolve them at runtime.
(global as any).latinizeText = latinizeText;
(global as any).getVerseInfo = getVerseInfo;
(global as any).getVerseStr = getVerseStr;

// Real Romanian (VDC) book cache as built by fetchVersionBooks from the bible.com API
const booksCacheObj: { key: string; name: string; chapters: number }[] = require("./bookCacheObj.ro.json");

// A second-language cache: same USFM keys, different localized names (e.g. Russian).
const ruCacheObj = [
  { key: "JHN", name: "Иоанна", chapters: 21 },
  { key: "GEN", name: "Бытие", chapters: 50 }
];

describe("makePinItem", () => {
  it("stamps the USFM key for a bible reference", () => {
    expect(makePinItem("Ioan 3:16", booksCacheObj)).toEqual({ text: "Ioan 3:16", key: "JHN" });
    expect(makePinItem("Geneza 1", booksCacheObj)).toEqual({ text: "Geneza 1", key: "GEN" });
  });

  it("leaves custom text without a key", () => {
    expect(makePinItem("🙏 Prayer", booksCacheObj)).toEqual({ text: "🙏 Prayer" });
    expect(makePinItem("1️⃣ Welcome", booksCacheObj)).toEqual({ text: "1️⃣ Welcome" });
  });

  it("treats a reference whose book is unknown as custom text", () => {
    expect(makePinItem("Frodo 3:16", booksCacheObj)).toEqual({ text: "Frodo 3:16" });
  });
});

describe("displayPinText", () => {
  it("returns the stored text when the cache matches the original language", () => {
    const pin = makePinItem("Ioan 3:16", booksCacheObj);
    expect(displayPinText(pin, booksCacheObj)).toBe("Ioan 3:16");
  });

  it("preserves the user's shorthand book name (does not expand to full name)", () => {
    expect(displayPinText(makePinItem("Mat 3:5", booksCacheObj), booksCacheObj)).toBe("Mat 3:5");
    expect(displayPinText(makePinItem("Ps 23:1", booksCacheObj), booksCacheObj)).toBe("Ps 23:1");
  });

  it("relocalizes a reference to the current language via its key", () => {
    const pin = makePinItem("Ioan 3:16", booksCacheObj); // added in Romanian
    expect(displayPinText(pin, ruCacheObj)).toBe("Иоанна 3:16"); // shown in Russian
  });

  it("preserves chapter/verse ranges when relocalizing", () => {
    const pin = makePinItem("Geneza 1:1-3", booksCacheObj);
    expect(displayPinText(pin, ruCacheObj)).toBe("Бытие 1:1-3");
  });

  it("falls back to stored text when the key is absent from the cache", () => {
    const pin = { text: "Ioan 3:16", key: "JHN" };
    expect(displayPinText(pin, [])).toBe("Ioan 3:16");
  });

  it("returns the raw text for custom pins", () => {
    expect(displayPinText({ text: "🙏 Prayer" }, ruCacheObj)).toBe("🙏 Prayer");
  });
});

describe("isPinReference", () => {
  it("is true for refs (by stored key)", () => {
    expect(isPinReference({ text: "Ioan 3", key: "JHN" }, booksCacheObj)).toBe(true);
  });

  it("re-resolves a keyless ref against the cache (added before cache loaded)", () => {
    expect(isPinReference({ text: "Ioan 3" }, booksCacheObj)).toBe(true);
  });

  it("is false for custom text", () => {
    expect(isPinReference({ text: "🙏 Prayer" }, booksCacheObj)).toBe(false);
  });
});

describe("pinKey", () => {
  it("dedupes equal references regardless of stored text spacing", () => {
    const a = makePinItem("Ioan 3:16", booksCacheObj);
    const b = makePinItem("Ioan 3 16", booksCacheObj);
    expect(pinKey(a)).toBe(pinKey(b));
  });

  it("distinguishes different references and custom text", () => {
    const ref = makePinItem("Ioan 3:16", booksCacheObj);
    const other = makePinItem("Ioan 4:1", booksCacheObj);
    const custom = makePinItem("🙏 Prayer", booksCacheObj);
    expect(pinKey(ref)).not.toBe(pinKey(other));
    expect(pinKey(custom)).not.toBe(pinKey(ref));
  });
});
