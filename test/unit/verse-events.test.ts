const { getVerseEvent } = require("../../views/main/runtime-messages");

describe("getVerseEvent", () => {
  test("plain text reference (tags stripped) and one verse per line, without verse numbers", () => {
    const references = ['<span class="version">VDC</span> Ioan 3:16-17'];
    const versesInfo = [
      { verseNr: "16", content: "Fiindcă atât de mult a iubit Dumnezeu lumea...", parallel: false, cls: "" },
      { verseNr: "17", content: "Dumnezeu, în adevăr, n-a trimis...", parallel: false, cls: "" }
    ];
    expect(getVerseEvent(1, { references, versesInfo })).toEqual({
      index: 1,
      reference: "VDC Ioan 3:16-17",
      text: "Fiindcă atât de mult a iubit Dumnezeu lumea...\nDumnezeu, în adevăr, n-a trimis..."
    });
  });

  test("parallel view: both references joined with a space, like the header", () => {
    const references = ['<span class="version">VDC</span> Ioan 3:16', '<span class="version">NTR</span> Ioan 3:16'];
    const versesInfo = [
      { verseNr: "16", content: "Fiindcă atât de mult...", parallel: false },
      { verseNr: "16", content: "Fiindcă atât de mult a iubit...", parallel: true }
    ];
    expect(getVerseEvent(2, { references, versesInfo })).toEqual({
      index: 2,
      reference: "VDC Ioan 3:16 NTR Ioan 3:16",
      text: "Fiindcă atât de mult...\nFiindcă atât de mult a iubit..."
    });
  });

  test("without a version the reference is the title and verses", () => {
    expect(
      getVerseEvent(1, {
        references: ["Psalmii 23:1"],
        versesInfo: [{ verseNr: "1", content: "Domnul este Păstorul meu" }]
      }).reference
    ).toBe("Psalmii 23:1");
  });

  test.each([
    ["nothing projected", undefined],
    ["no verses for this window", { references: [], versesInfo: [] }]
  ])("cleared window (%s): reference null, empty text", (_, verses) => {
    expect(getVerseEvent(2, verses)).toEqual({ index: 2, reference: null, text: "" });
  });
});
