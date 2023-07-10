import { BASIC_RU_MAPPING, bibleReferenceMap } from "../views/common/bible-mappings";

describe("Bible reference map for [RU][НРП]", () => {
  const targetSplitter = /\s*->\s*/;
  const versionSplitter = /\[(.*?)\]\s(.*)/;

  const noChangesMatches = [
    "[VDC] NUM 9:2 -> [НРП] NUM 9:2",
    "[VDC] JOB 1:5 -> [НРП] JOB 1:5",
    "[VDC] PSA 1:3 -> [НРП] PSA 1:3",
    "[VDC] PSA 1:5 -> [НРП] PSA 1:5"
  ];

  const changesMatches = [
    "[VDC] NUM 13:1  -> [НРП] NUM 13:2",
    "[VDC] NUM 13:33 -> [НРП] NUM 13:34",
    // JOB (VDC -> НРП)
    "[VDC] JOB 40:1 -> [НРП] JOB 39:31",
    "[VDC] JOB 40:3 -> [НРП] JOB 39:33",
    "[VDC] JOB 40:5 -> [НРП] JOB 39:35",
    "[VDC] JOB 40:6  -> [НРП] JOB 40:1",
    "[VDC] JOB 40:20 -> [НРП] JOB 40:15",
    "[VDC] JOB 40:24 -> [НРП] JOB 40:19",
    // PSA 3 (VDC -> НРП)
    "[VDC] PSA 3:1 -> [НРП] PSA 3:2",
    "[VDC] PSA 3:5 -> [НРП] PSA 3:6",
    "[VDC] PSA 3:8 -> [НРП] PSA 3:9",
    // PSA 9 (VDC -> НРП)
    "[VDC] PSA 9:1  -> [НРП] PSA 9:2",
    "[VDC] PSA 9:5  -> [НРП] PSA 9:6",
    "[VDC] PSA 9:20 -> [НРП] PSA 9:21",
    // PSA 10 (VDC -> НРП)
    "[VDC] PSA 10:1  -> [НРП] PSA 9:22",
    "[VDC] PSA 10:5  -> [НРП] PSA 9:26",
    "[VDC] PSA 10:18 -> [НРП] PSA 9:39",
    // PSA 23 (VDC -> НРП)
    "[VDC] PSA 23:1  -> [НРП] PSA 22:1",
    "[VDC] PSA 22:1  -> [НРП] PSA 21:2"
  ];

  test.each(noChangesMatches)("Reference should not be changed: %s", match => {
    const [fromVerse, toVerse] = match.split(targetSplitter);
    const [, from, fromRef] = fromVerse.match(versionSplitter);
    const [, to, toRef] = toVerse.match(versionSplitter);

    const ref = bibleReferenceMap(fromRef, from, to);
    expect(ref).toBe(toRef);
  });

  test.each(noChangesMatches)("Reverse reference should not be changed: %s", match => {
    const [toVerse, fromVerse] = match.split(targetSplitter); // intentionally changed
    const [, from, fromRef] = fromVerse.match(versionSplitter);
    const [, to, toRef] = toVerse.match(versionSplitter);

    const ref = bibleReferenceMap(fromRef, from, to);
    expect(ref).toBe(toRef);
  });

  test.each(changesMatches)("Reference changed: %s", match => {
    const [fromVerse, toVerse] = match.split(targetSplitter);
    const [, from, fromRef] = fromVerse.match(versionSplitter);
    const [, to, toRef] = toVerse.match(versionSplitter);

    const ref = bibleReferenceMap(fromRef, from, to);
    expect(ref).toBe(toRef);
  });

  test.each(changesMatches)("Reverse reference: %s", match => {
    const [toVerse, fromVerse] = match.split(targetSplitter); // intentionally changed
    const [, from, fromRef] = fromVerse.match(versionSplitter);
    const [, to, toRef] = toVerse.match(versionSplitter);

    const ref = bibleReferenceMap(fromRef, from, to);
    expect(ref).toBe(toRef);
  });
});

describe("Bible applyReversedMapping for RU [НРП]", () => {
  it("check calculated [НРП] JOB.target", () => {
    //console.warn("BASIC_RU_MAPPING.JOB.target %o", BASIC_RU_MAPPING.JOB.target);
    // TODO check that all values are matching
    // console.warn("PSA.source %o", BASIC_RU_MAPPING.PSA.source);
    // console.warn("PSA.target %o", BASIC_RU_MAPPING.PSA.target);
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
