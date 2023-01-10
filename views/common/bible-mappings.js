/**
 * The difference between the numbering of the Russian and English Bible
 *
 *   https://www.ph4.org/biblia_ruennum.php
 *
 * - TODO consider to create Ukrainians and More RU Mappings
 * - TODO make relationships between *_MAPPING and BibleVersions
 */
const BASIC_RU_MAPPING = {
  "NUM-13": 1,
  "JOS-6": -1,
  "1SA-24": 1,
  "JOB-40": -5,
  "JOB-41": -8,
  PSA: [
    { from: 3, to: 9, add_verses: 1, add_chapters: 0 },
    // for PSA:10-150 are more cases, add_chapters: -1 will ignore entire chapter for now
    { from: 10, to: 150, add_verses: 0, add_chapters: -1 }
  ],
  "SNG-1": -1,
  "SNG-7": 1,
  "DAN-4": -3,
  "HOS-14": 1,
  "JON-2": 1
};

// used only for differences
const BibleVersions = {
  ru: {
    143: "НРП",
    167: "СИНОД",
    //313: "BTI", // TODO ROM 13 is in sync with RO ...
    385: "CARS",
    840: "CARS-A",
    400: "SYNO"
  },
  ua: {
    186: "UBIO", // TODO Check NUM.13 they are in sync...
    // 188: "UKRK", // TODO PS 23 is in sync with RO ...
    // TODO PS 23 is in sync with RO ... while ps 9 has +1 verse
    // 204: "UMT",
    3269: "НПУ",
    1755: "УТТ",
    3149: "НУП" // check
  }
};

function isBibleInLanguage(languageCode, id) {
  languageCode = languageCode.toLowerCase();
  return Object.keys(BibleVersions[languageCode]).some(n => n == id);
}

function isBibleInAnyLanguages(languageCodes, id) {
  return languageCodes.some(code => isBibleInLanguage(code.toLowerCase(), id));
}

function getTranslationsMapping(MAPPING, book, chapter, nr, isParallel) {
  let diff = MAPPING[`${book}-${chapter}`];
  if (diff) {
    return nr + diff * (isParallel ? -1 : 1);
  }
  diff = MAPPING[book]; // should be Array or undefined
  if (diff) {
    const matchDiff = diff.find(match => match.from <= chapter && chapter <= match.to);
    if (matchDiff) {
      if (matchDiff.add_chapters) {
        // can't print from different chapters for now
        return 0;
      }
      const diffNr = matchDiff.add_verses;
      return nr + diffNr * (isParallel ? -1 : 1);
    }
  }
  return nr;
}
