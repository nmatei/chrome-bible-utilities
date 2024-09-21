import { latinizeText } from "../../views/common/latinizeText";

describe("Test replaceDiacritics", () => {
  it("Test chars with [includeUpperCase]", () => {
    const texts = ["Judecătorii 1", "1 Împăraţilor 1", "Cântarea Cântărilor 2", "Plângerile 1", "Ţefania 1"];
    const results = texts.map(text => latinizeText(text, true));
    expect(results).toEqual(["Judecatorii 1", "1 Imparatilor 1", "Cantarea Cantarilor 2", "Plangerile 1", "Tefania 1"]);
  });
});
