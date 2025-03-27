/**
 * The difference between the numbering of the
 *      Russian and English Bible
 *
 *   https://www.ph4.org/biblia_ruennum.php
 *
 * TODO consider to create an npm package
 */

const verseRefRegExp = /(?<book>.+)(\s+)(?<chapter>\d+)([\:\s\.]+)(?<verse>\d+)(\s*-\s*)?(?<to>\d+)?/gi;
const chapterRefRegExp = /(?<book>.+)(\s+)(?<chapter>\d+)/gi;

function getVerseInfo(search) {
  search = search.trim();
  const fullMatch = Array.from(search.matchAll(verseRefRegExp))[0];
  if (fullMatch) {
    const groups = fullMatch.groups;
    return {
      book: groups.book,
      chapter: parseInt(groups.chapter),
      verse: parseInt(groups.verse),
      to: groups.to ? parseInt(groups.to) : ""
    };
  }
  const match = Array.from(search.matchAll(chapterRefRegExp))[0];
  return match ? match.groups : null;
}

function getVerseStr(match) {
  if (!match || typeof match !== "object") {
    return match || "";
  }
  const { book, chapter, verse, to } = match;
  return `${book} ${chapter}${verse ? ":" + verse : ""}${to ? "-" + to : ""}`;
}

function formatVerseRef(ref) {
  const match = getVerseInfo(ref);
  return getVerseStr(match);
}

function applyReversedMapping(mapping) {
  mapping = structuredClone(mapping);
  Object.entries(mapping).forEach(([book, value]) => {
    if (typeof value === "object") {
      if (value.source) {
        value.target = Object.entries(value.source).reduce((target, [chapters, entries]) => {
          //console.warn("calc %o", chapters, entries);
          let [start, end] = chapters.split(/\s*-\s*/).map(c => parseInt(c));
          const single = typeof end === "undefined";
          if (single) {
            end = start;
          }
          while (start <= end) {
            if (!single) {
              // clone values for individual chapters
              value.source[start] = entries;
            }
            entries.forEach(entry => {
              const targetChapter = start + entry.diff[0];
              target[targetChapter] = target[targetChapter] || [];
              const targetEntry = {
                diff: [parseInt(-entry.diff[0]), parseInt(-entry.diff[1])]
              };
              if (entry.from) {
                targetEntry.from = [entry.from[0] + entry.diff[1], entry.from[1] + entry.diff[1]];
              }
              target[targetChapter].push(targetEntry);
            });
            start++;
          }

          if (!single) {
            // delete pair, leave only single chapter
            delete value.source[chapters];
          }

          return target;
        }, {});
      }
    }
  });
  return mapping;
}

const basicRuMapping = {
  NUM: {
    source: {
      12: [{ from: [16, 16], diff: [1, -15] }],
      13: [{ from: [1, 33], diff: [0, 1] }]
    }
  },
  JOS: {
    source: {
      6: [
        { from: [1, 1], diff: [-1, 15] },
        { from: [2, 27], diff: [0, -1] }
      ]
    }
  },
  "1SA": {
    source: {
      23: [{ from: [29, 29], diff: [1, -28] }],
      24: [{ from: [1, 22], diff: [0, 1] }]
    }
  },
  JOB: {
    source: {
      40: [
        { from: [1, 5], diff: [-1, 30] }, // 40:1-5  -> 39:31-35
        { from: [6, 24], diff: [0, -5] } //  40:6-24 -> 40:-5
      ],
      41: [
        { from: [1, 8], diff: [-1, 19] }, // 41:1-8	  -> 40:20-27
        { from: [9, 34], diff: [0, -8] } //  41:9-34	-> 41:-8
      ]
    }
  },
  PSA: {
    source: {
      "3-8": [{ diff: [0, 1] }],
      9: [{ from: [1, 20], diff: [0, 1] }],
      10: [{ from: [1, 18], diff: [-1, 21] }],
      11: [{ diff: [-1, 0] }],
      "12-13": [{ diff: [-1, 1] }],
      "14-17": [{ diff: [-1, 0] }],
      "18-22": [{ diff: [-1, 1] }],
      "23-29": [{ diff: [-1, 0] }],
      "30-31": [{ diff: [-1, 1] }],
      "32-33": [{ diff: [-1, 0] }],
      34: [{ diff: [-1, 1] }],
      35: [{ diff: [-1, 0] }],
      36: [{ diff: [-1, 1] }],
      37: [{ diff: [-1, 0] }],
      "38-42": [{ diff: [-1, 1] }],
      43: [{ diff: [-1, 0] }],
      "44-49": [{ diff: [-1, 1] }],
      50: [{ diff: [-1, 0] }],
      "51-52": [{ diff: [-1, 2] }],
      53: [{ diff: [-1, 1] }],
      54: [{ diff: [-1, 2] }],
      "55-59": [{ diff: [-1, 1] }],
      60: [{ diff: [-1, 2] }],
      "61-65": [{ diff: [-1, 1] }],
      66: [{ diff: [-1, 0] }],
      "67-70": [{ diff: [-1, 1] }],
      "71-74": [{ diff: [-1, 0] }],
      "75-77": [{ diff: [-1, 1] }],
      "78-79": [{ diff: [-1, 0] }],
      "80-81": [{ diff: [-1, 1] }],
      82: [{ diff: [-1, 0] }],
      "83-85": [{ diff: [-1, 1] }],
      86: [{ diff: [-1, 0] }],
      87: [
        { from: [1, 1], diff: [-1, 1] },
        { from: [2, 2], diff: [-1, 0] },
        { from: [3, 7], diff: [-1, 0] }
      ],
      "88-89": [{ diff: [-1, 1] }],
      90: [
        { from: [1, 5], diff: [-1, 1] },
        { from: [6, 17], diff: [-1, 0] }
      ],
      91: [{ diff: [-1, 0] }],
      92: [{ diff: [-1, 1] }],
      "93-101": [{ diff: [-1, 0] }],
      102: [{ diff: [-1, 1] }],
      "103-107": [{ diff: [-1, 0] }],
      108: [{ diff: [-1, 1] }],
      "109-112": [{ diff: [-1, 0] }],
      113: [{ from: [1, 9], diff: [-1, 0] }],
      114: [{ from: [1, 8], diff: [-1, 0] }],
      115: [{ from: [1, 18], diff: [-2, 8] }],
      116: [
        { from: [1, 9], diff: [-2, 0] },
        { from: [10, 19], diff: [-1, -9] }
      ],
      "117-146": [{ diff: [-1, 0] }],
      147: [
        { from: [1, 11], diff: [-1, 0] },
        { from: [12, 20], diff: [0, -11] }
      ]
    }
  },
  SNG: {
    source: {
      1: [{ diff: [0, -1] }],
      6: [{ from: [13, 13], diff: [1, -12] }],
      7: [{ from: [1, 13], diff: [0, 1] }]
    }
  },
  ISA: {
    source: {
      3: [{ from: [20, 26], diff: [0, -1] }]
    }
  },
  DAN: {
    source: {
      4: [
        { from: [1, 3], diff: [-1, 30] },
        { from: [4, 37], diff: [0, -3] }
      ]
    }
  },
  HOS: {
    source: {
      13: [{ from: [16, 16], diff: [1, -15] }],
      14: [{ from: [1, 9], diff: [0, 1] }]
    }
  },
  JON: {
    source: {
      1: [{ from: [17, 17], diff: [1, -16] }],
      2: [{ from: [1, 10], diff: [0, 1] }]
    }
  },
  "2CO": {
    source: {
      11: [{ from: [33, 33], diff: [0, -1] }],
      13: [{ from: [14, 14], diff: [0, -1] }]
    }
  }
};

const BASIC_RU_MAPPING = applyReversedMapping(basicRuMapping);

const BASIC_UA_MAPPING = applyReversedMapping({
  "1SA": basicRuMapping["1SA"],
  JOB: {
    source: {
      41: [
        { from: [1, 8], diff: [-1, 24] },
        { from: [9, 34], diff: [0, -8] }
      ]
    }
  },
  PSA: basicRuMapping.PSA, // TODO check PSA
  SNG: basicRuMapping.SNG,
  DAN: basicRuMapping.DAN,
  HOS: {
    source: {
      1: [{ from: [10, 11], diff: [1, -9] }],
      2: [{ from: [1, 23], diff: [0, 2] }], // added in UA not RU
      13: [{ from: [16, 16], diff: [1, -15] }],
      14: [{ from: [1, 9], diff: [0, 1] }]
    }
  },
  JON: basicRuMapping.JON,
  "2CO": {
    source: {
      13: [{ from: [14, 14], diff: [0, -1] }]
    }
  }
});

const BibleMappings = {
  НРП: {
    language: "ru",
    version: "НРП",
    name: "Новый русский перевод",
    mapping: {
      ...BASIC_RU_MAPPING
    }
  },
  RSP: {
    language: "ru",
    version: "RSP",
    name: "Святая Библия: Современный перевод",
    mapping: {
      ...BASIC_RU_MAPPING
    }
  },
  СИНОД: {
    language: "ru",
    version: "СИНОД",
    mapping: {
      ...BASIC_RU_MAPPING
    }
  },
  CARS: {
    language: "ru",
    version: "CARS",
    mapping: {
      ...BASIC_RU_MAPPING
    }
  },
  "CARS-A": {
    language: "ru",
    version: "CARS-A",
    mapping: {
      ...BASIC_RU_MAPPING
    }
  },
  SYNO: {
    language: "ru",
    version: "SYNO",
    mapping: {
      ...BASIC_RU_MAPPING
    }
  },
  // [UA]
  UBIO: {
    language: "ua",
    version: "UBIO",
    mapping: {
      ...BASIC_UA_MAPPING
    }
  }
};

function findChapterDiff(mapping, chapter, verse, isParallel) {
  const chapterDiff = mapping[isParallel ? "target" : "source"][chapter];
  if (chapterDiff) {
    //console.warn("chapterDiff %o", `${chapter}:${verse}`, chapterDiff);
    const match = chapterDiff.find(({ from }) => {
      if (from) {
        const [start, end] = from;
        //console.debug("search verse %o", `${chapter}:${verse}`, start, end);
        return start <= verse && verse <= end;
      } else {
        // entire chapter
        return true;
      }
    });
    if (match) {
      return {
        chapters: match.diff[0],
        verses: match.diff[1]
      };
    }
  }
  return null;
}

function getDiffMappings(MAPPING, book, chapter, verse, isParallel = false) {
  let mapping = MAPPING[`${book}.${chapter}`];
  if (mapping) {
    return mapping * (isParallel ? -1 : 1);
  }
  mapping = MAPPING[book];
  if (typeof mapping === "object") {
    const matchDiff = findChapterDiff(mapping, chapter, verse, isParallel);
    if (matchDiff) {
      if (matchDiff.chapters) {
        return matchDiff;
      }
      return matchDiff.verses;
    }
  }
  return 0;
}

function addDiffOperation(target, to, operation = "add") {
  target = structuredClone(target);
  if (to) {
    const add = getDiffMappings(to.mapping, target.book, target.chapter, target.verse, operation === "subtract");
    //console.debug("%o to %o = %o", operation, structuredClone(target), add);
    if (typeof add === "number") {
      target.verse += add;
    } else {
      target.chapter += add.chapters;
      target.verse += add.verses;
    }
  }
  return target;
}

/**
 *
 * @param {string|{book: string,chapter: string, verse: string, to: number}} ref
 * @param {string} from
 * @param {string} to
 * @param {boolean} [asString]
 * @returns {{chapter: (number|string), book: string, verse: (number|string)}|string}
 */
function bibleReferenceMap(ref, from, to, asString = true) {
  if (typeof ref === "string") {
    ref = getVerseInfo(ref);
  }
  let target = { ...ref };
  //console.info("%o -> %o", from, to, ref);
  target = addDiffOperation(target, BibleMappings[from], "subtract");
  target = addDiffOperation(target, BibleMappings[to], "add");

  //return JSON.stringify({ ref, add, target });
  if (asString) {
    return getVerseStr(target);
  }
  return target;
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    BASIC_RU_MAPPING,
    BASIC_UA_MAPPING,
    getVerseInfo,
    getVerseStr,
    formatVerseRef,
    bibleReferenceMap
  };
}
