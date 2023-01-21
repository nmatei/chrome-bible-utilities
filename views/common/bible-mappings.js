/**
 * The difference between the numbering of the Russian and English Bible
 *
 *   https://www.ph4.org/biblia_ruennum.php
 *
 *   Important link to Test when change mappings:
 *
 *    - https://my.bible.com/bible/191/JOB.40.VDC?parallel=186
 *    - https://my.bible.com/bible/191/PSA.23.VDC?parallel=186
 *    - https://my.bible.com/bible/143/PSA.22.%D0%9D%D0%A0%D0%9F?parallel=186
 *    - https://my.bible.com/bible/143/PSA.7.%D0%9D%D0%A0%D0%9F?parallel=186
 *    - https://my.bible.com/bible/186/PSA.7.UBIO?parallel=191
 *    - https://my.bible.com/bible/186/PSA.23.UBIO?parallel=191
 *    - https://my.bible.com/bible/191/NUM.13.%D0%BD%D1%80%D0%BF?parallel=143
 *    - https://my.bible.com/bible/143/NUM.13.%D0%BD%D1%80%D0%BF?parallel=191
 *    - https://my.bible.com/bible/191/JOS.6.%D0%BD%D1%80%D0%BF?parallel=186
 *    - https://my.bible.com/bible/191/JOS.6.%D0%BD%D1%80%D0%BF?parallel=143
 *
 */
const BASIC_RU_MAPPING = {
  "NUM.13": 1,
  "JOS.6": -1,
  "1SA.24": 1,
  "JOB.40": -5,
  "JOB.41": -8,
  PSA: [
    { from: 3, to: 9, add_verses: 1, add_chapters: 0 },
    // for PSA:10-150 are more cases, add_chapters: -1 will ignore entire chapter for now
    { from: 10, to: 150, add_verses: 0, add_chapters: -1 }
  ],
  "SNG.1": -1,
  "SNG.7": 1,
  "DAN.4": -3,
  "HOS.14": 1,
  "JON.2": 1
};

// TODO get one EN version as 'basic' and use all others as 'diff'
//   diff from EN version
const BibleVersionsMappings = {
  143: {
    language: "ru",
    version: "НРП",
    mapping: {
      ...BASIC_RU_MAPPING
    }
  },
  167: {
    language: "ru",
    version: "СИНОД",
    mapping: {
      ...BASIC_RU_MAPPING
    }
  },
  385: {
    language: "ru",
    version: "CARS",
    mapping: {
      ...BASIC_RU_MAPPING
    }
  },
  840: {
    language: "ru",
    version: "CARS-A",
    mapping: {
      ...BASIC_RU_MAPPING
    }
  },
  400: {
    language: "ru",
    version: "SYNO",
    mapping: {
      ...BASIC_RU_MAPPING
    }
  },
  // 313: {language: "ru", version: "BTI"}, // TODO ROM 13 is in sync with RO ...

  186: {
    language: "ua",
    version: "UBIO",
    // TODO check all mappigns
    mapping: {
      "1SA.24": 1,
      //"JOB.40": -5,
      "JOB.41": -8,
      PSA: [
        { from: 3, to: 9, add_verses: 1, add_chapters: 0 },
        { from: 10, to: 150, add_verses: 0, add_chapters: -1 }
      ],
      "SNG.1": -1,
      "SNG.7": 1,
      "DAN.4": -3,
      "HOS.2": 2,
      "HOS.14": 1,
      "JON.2": 1
    }
  }

  // 186: "UBIO", // TODO Check NUM.13 they are in sync...
  // // 188: "UKRK", // TODO PS 23 is in sync with RO ...
  // // TODO PS 23 is in sync with RO ... while ps 9 has +1 verse
  // // 204: "UMT",
  // 3269: "НПУ",
  // 1755: "УТТ",
  // 3149: "НУП" // check
};

function getDiffMapping(MAPPING, book, chapter, isParallel) {
  let diff = MAPPING[`${book}.${chapter}`];
  if (diff) {
    return diff * (isParallel ? -1 : 1);
  }
  diff = MAPPING[book]; // should be Array or undefined
  if (diff) {
    const matchDiff = diff.find(match => match.from <= chapter && chapter <= match.to);
    if (matchDiff) {
      if (matchDiff.add_chapters) {
        return matchDiff;
      }
      const diffNr = matchDiff.add_verses;
      return diffNr * (isParallel ? -1 : 1);
    }
  }
  return 0;
}
