import { latinizeText } from "../../views/common/latinizeText";

describe("Test replaceDiacritics", () => {
  it("Test chars with [includeUpperCase]", () => {
    const texts = [
      // real diacritics examples from bible.com
      "Judecătorii 1",
      "1 Împăraţilor 1",
      "Cântarea Cântărilor 2",
      "Plângerile 1",
      "Ţefania 1"
    ];
    const results = texts.map(text => latinizeText(text, true));
    expect(results).toEqual(["Judecatorii 1", "1 Imparatilor 1", "Cantarea Cantarilor 2", "Plangerile 1", "Tefania 1"]);
  });

  it("strips comma-below diacritics (modern Romanian ș/ț)", () => {
    // ș U+0219 / ț U+021B — the forms bible.com actually uses
    const texts = ["Țefania", "1 Împărați", "Galateni", "Apocalipsa"];
    const results = texts.map(text => latinizeText(text));
    expect(results).toEqual(["Tefania", "1 Imparati", "Galateni", "Apocalipsa"]);
  });

  it("strips comma-below and cedilla forms identically", () => {
    expect(latinizeText("șț")).toBe("st"); // U+0219 U+021B (comma-below)
    expect(latinizeText("şţ")).toBe("st"); // U+015F U+0163 (cedilla)
  });

  it("strips uppercase diacritics by default", () => {
    expect(latinizeText("ȚEFANIA")).toBe("TEFANIA");
    expect(latinizeText("ÎMPĂRAȚI")).toBe("IMPARATI");
  });
});
