import { BASIC_RU_MAPPING, bibleReferenceMap } from "../../views/common/bible-mappings";

describe("Bible reference map for [RU][НРП]", () => {
  const targetSplitter = /\s*->\s*/;
  const versionSplitter = /\[(.*?)\]\s(.*)/;

  const noChanges = [
    "[VDC] NUM 9:2   -> [НРП] NUM 9:2",
    "[VDC] 1SA 23:1  -> [НРП] 1SA 23:1",
    "[VDC] 1SA 23:28 -> [НРП] 1SA 23:28",
    "[VDC] JOB 1:5   -> [НРП] JOB 1:5",
    "[VDC] PSA 1:3   -> [НРП] PSA 1:3",
    "[VDC] PSA 1:5   -> [НРП] PSA 1:5",
    "[VDC] ISA 3:1   -> [НРП] ISA 3:1",
    "[VDC] ISA 3:18  -> [НРП] ISA 3:18",
    "[VDC] ECC 4:1  -> [НРП] ECC 4:1",
    "[VDC] ECC 4:16  -> [НРП] ECC 4:16"
  ];

  const RO_References = {
    NUM: "Numeri",
    JOS: "Iosua",
    "1SA": "1 Samuel",
    JOB: "Iov",
    PSA: "Psalm",
    SNG: "Cântarea Cânt",
    ISA: "Isaia",
    DAN: "Daniel",
    HOS: "Osea",
    JON: "Iona",
    "2CO": "2 Corinteni"
  };

  // https://www.ph4.org/biblia_ruennum.php
  // 🟦🟨🟥 vs ⬜🟦🟥
  const RO_vs_RU = [
    // NUMBERS
    "[VDC] NUM 12:16 -> [НРП] NUM 13:1",
    "[VDC] NUM 13:1  -> [НРП] NUM 13:2",
    "[VDC] NUM 13:33 -> [НРП] NUM 13:34",
    // JOSUA
    "[VDC] JOS 6:1   -> [НРП] JOS 5:16",
    "[VDC] JOS 6:2   -> [НРП] JOS 6:1",
    "[VDC] JOS 6:27  -> [НРП] JOS 6:26",
    // 1 SAMUEL
    "[VDC] 1SA 23:29 -> [НРП] 1SA 24:1",
    "[VDC] 1SA 24:1  -> [НРП] 1SA 24:2",
    "[VDC] 1SA 24:22 -> [НРП] 1SA 24:23",
    // JOB
    "[VDC] JOB 40:1  -> [НРП] JOB 39:31",
    "[VDC] JOB 40:3  -> [НРП] JOB 39:33",
    "[VDC] JOB 40:5  -> [НРП] JOB 39:35",
    "[VDC] JOB 40:6  -> [НРП] JOB 40:1",
    "[VDC] JOB 40:20 -> [НРП] JOB 40:15",
    "[VDC] JOB 40:24 -> [НРП] JOB 40:19",
    "[VDC] JOB 41:1  -> [НРП] JOB 40:20",
    "[VDC] JOB 41:8  -> [НРП] JOB 40:27",
    "[VDC] JOB 41:9  -> [НРП] JOB 41:1",
    "[VDC] JOB 41:34 -> [НРП] JOB 41:26",
    // PSALMS
    "[VDC] PSA 3:1   -> [НРП] PSA 3:2",
    "[VDC] PSA 3:5   -> [НРП] PSA 3:6",
    "[VDC] PSA 3:8   -> [НРП] PSA 3:9",
    "[VDC] PSA 9:1   -> [НРП] PSA 9:2",
    "[VDC] PSA 9:5   -> [НРП] PSA 9:6",
    "[VDC] PSA 9:20  -> [НРП] PSA 9:21",
    "[VDC] PSA 10:1  -> [НРП] PSA 9:22",
    "[VDC] PSA 10:5  -> [НРП] PSA 9:26",
    "[VDC] PSA 10:18 -> [НРП] PSA 9:39",
    "[VDC] PSA 23:1  -> [НРП] PSA 22:1",
    "[VDC] PSA 22:1  -> [НРП] PSA 21:2",
    // TODO PSALMS more Tests
    // ECCLESIASTES
    // ECC
    "[VDC] ECC 5:1   -> [НРП] ECC 4:17",
    "[VDC] ECC 5:2   -> [НРП] ECC 5:1",
    "[VDC] ECC 5:20   -> [НРП] ECC 5:19",

    //The SONG of SOLOMON
    "[VDC] SNG 1:2   -> [НРП] SNG 1:1",
    "[VDC] SNG 1:17  -> [НРП] SNG 1:16",
    "[VDC] SNG 6:13  -> [НРП] SNG 7:1",
    "[VDC] SNG 7:1   -> [НРП] SNG 7:2",
    "[VDC] SNG 7:13  -> [НРП] SNG 7:14",
    // ISAIAH
    "[VDC] ISA 3:20  -> [НРП] ISA 3:19",
    "[VDC] ISA 3:26  -> [НРП] ISA 3:25",
    // DANIEL
    "[VDC] DAN 4:1   -> [НРП] DAN 3:31",
    "[VDC] DAN 4:3   -> [НРП] DAN 3:33",
    "[VDC] DAN 4:4   -> [НРП] DAN 4:1",
    "[VDC] DAN 4:37  -> [НРП] DAN 4:34",
    // HOSEA
    "[VDC] HOS 13:16 -> [НРП] HOS 14:1",
    "[VDC] HOS 14:1  -> [НРП] HOS 14:2",
    "[VDC] HOS 14:9  -> [НРП] HOS 14:10",
    // JONA
    "[VDC] JON 1:17  -> [НРП] JON 2:1",
    "[VDC] JON 2:1   -> [НРП] JON 2:2",
    "[VDC] JON 2:10  -> [НРП] JON 2:11",
    // ROMANS 16:25-27	-> 14:24-26 TODO not sure
    // 2 CORINTHIANS
    //"[VDC] 2CO 11:32 -> [НРП] 2CO 11:32", // TODO does not work for reversed
    "[VDC] 2CO 11:33 -> [НРП] 2CO 11:32",
    "[VDC] 2CO 13:12 -> [НРП] 2CO 13:12",
    //"[VDC] 2CO 13:13 -> [НРП] 2CO 13:13", // TODO does not work for reversed
    "[VDC] 2CO 13:14 -> [НРП] 2CO 13:13"
  ];

  // https://bible.com/bible/191/JOB.40.VDC?parallel=186
  // 🟦🟨🟥 vs 🟨🟦
  const RO_vs_UA = [
    // JOB
    "[VDC] JOB 41:1  -> [UBIO] JOB 40:25",
    "[VDC] JOB 41:8  -> [UBIO] JOB 40:32",
    "[VDC] JOB 41:9  -> [UBIO] JOB 41:1",
    "[VDC] JOB 41:34 -> [UBIO] JOB 41:26",
    // PSALMS TODO copy from RU, make sure they are correct
    "[VDC] PSA 3:1   -> [UBIO] PSA 3:2",
    "[VDC] PSA 3:5   -> [UBIO] PSA 3:6",
    "[VDC] PSA 3:8   -> [UBIO] PSA 3:9",
    "[VDC] PSA 9:1   -> [UBIO] PSA 9:2",
    "[VDC] PSA 9:5   -> [UBIO] PSA 9:6",
    "[VDC] PSA 9:20  -> [UBIO] PSA 9:21",
    "[VDC] PSA 10:1  -> [UBIO] PSA 9:22",
    "[VDC] PSA 10:5  -> [UBIO] PSA 9:26",
    "[VDC] PSA 10:18 -> [UBIO] PSA 9:39",
    "[VDC] PSA 23:1  -> [UBIO] PSA 22:1",
    "[VDC] PSA 22:1  -> [UBIO] PSA 21:2",
    // TODO PSALMS more Tests
    // HOSEA
    "[VDC] HOS 1:1   -> [UBIO] HOS 1:1",
    "[VDC] HOS 1:9   -> [UBIO] HOS 1:9",
    "[VDC] HOS 1:10  -> [UBIO] HOS 2:1",
    "[VDC] HOS 1:11  -> [UBIO] HOS 2:2",
    "[VDC] HOS 2:1   -> [UBIO] HOS 2:3",
    "[VDC] HOS 2:23  -> [UBIO] HOS 2:25",
    "[VDC] HOS 13:16 -> [UBIO] HOS 14:1",
    "[VDC] HOS 14:1  -> [UBIO] HOS 14:2",
    "[VDC] HOS 14:9  -> [UBIO] HOS 14:10",
    // 2 CORINTHIANS
    "[VDC] 2CO 13:12 -> [НРП] 2CO 13:12",
    //"[VDC] 2CO 13:13 -> [НРП] 2CO 13:13", // TODO does not work for reversed
    "[VDC] 2CO 13:14 -> [НРП] 2CO 13:13"
  ];

  // https://bible.com/bible/143/JOB.41.НРП?parallel=186
  // ⬜🟦🟥 vs 🟨🟦
  const RU_vs_UA = [
    "[НРП] 1SA 24:1  -> [UBIO] 1SA 24:1",
    "[НРП] 1SA 24:2  -> [UBIO] 1SA 24:2",
    "[НРП] 1SA 24:22 -> [UBIO] 1SA 24:22",
    "[НРП] 1SA 24:23 -> [UBIO] 1SA 24:23",
    // JOB
    "[НРП] JOB 39:30 -> [UBIO] JOB 39:30",
    "[НРП] JOB 39:31 -> [UBIO] JOB 40:1",
    "[НРП] JOB 39:35 -> [UBIO] JOB 40:5",
    "[НРП] JOB 41:1  -> [UBIO] JOB 41:1",
    "[НРП] JOB 41:26 -> [UBIO] JOB 41:26",
    "[НРП] JOB 40:1  -> [UBIO] JOB 40:6",
    "[НРП] JOB 40:15 -> [UBIO] JOB 40:20",
    "[НРП] JOB 40:27 -> [UBIO] JOB 40:32",
    // PSALMS
    "[НРП] PSA 22:1  -> [UBIO] PSA 22:1"
  ];

  const allMatches = [...noChanges, ...RO_vs_RU, ...RO_vs_UA, ...RU_vs_UA];

  test.each(allMatches)("Reference matches: %s", match => {
    const [fromVerse, toVerse] = match.split(targetSplitter);
    const [, from, fromRef] = fromVerse.match(versionSplitter);
    const [, to, toRef] = toVerse.match(versionSplitter);

    const ref = bibleReferenceMap(fromRef, from, to);
    expect(ref).toBe(toRef);
  });

  test.each(allMatches)("Reverse reference matches: %s", match => {
    const [toVerse, fromVerse] = match.split(targetSplitter); // intentionally changed
    const [, from, fromRef] = fromVerse.match(versionSplitter);
    const [, to, toRef] = toVerse.match(versionSplitter);

    const ref = bibleReferenceMap(fromRef, from, to);
    expect(ref).toBe(toRef);
  });

  test("!!! Manual Test RO this references in browser !!!", () => {
    const references = RO_vs_RU.map(match => {
      const [fromVerse, toVerse] = match.split(targetSplitter);
      const [, from, fromRef] = fromVerse.match(versionSplitter);
      const ref = fromRef.split(/\s+/i);
      return (RO_References[ref[0]] || ref[0]) + " " + ref[1];
    }).join("\n");

    console.info(
      [
        "👉 Manual Test RO this references in browser to see parallel version",
        "==========",
        references,
        "=========="
      ].join("\n")
    );
  });
});

describe("Bible applyReversedMapping for RU [НРП]", () => {
  it("check calculated [НРП] JOB.target", () => {
    //console.warn("BASIC_RU_MAPPING.JOB.target %o", BASIC_RU_MAPPING.JOB.target);
    // TODO check that all values are matching
    // console.warn("JOB.source %o", BASIC_RU_MAPPING.JOB.source);
    // console.warn("JOB.target %o", BASIC_RU_MAPPING.JOB.target);
    expect(BASIC_RU_MAPPING.JOB.target).toEqual({
      39: [{ from: [31, 35], diff: [1, -30] }],
      40: [
        { from: [1, 19], diff: [0, 5] },
        { from: [20, 27], diff: [1, -19] }
      ],
      41: [{ from: [1, 26], diff: [0, 8] }]
    });
  });
});
