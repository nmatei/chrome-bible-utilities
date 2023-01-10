/**
 * The difference between the numbering of the Russian and English Bible
 *
 *   https://www.ph4.org/biblia_ruennum.php
 *
 * TODO continue... make it more generic
 */

const BibleVersions = {
  // ro: {
  //   191: "VDC",
  //   126: "NTR",
  //   903: "BTF2015"
  // },
  ru: {
    143: "НРП",
    167: "СИНОД",
    //313: "BTI", // TODO ROM 13 is in sync with RO ...
    385: "CARS",
    840: "CARS-A",
    400: "SYNO"
  },
  ua: {
    186: "UBIO",
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

/**
 * info taken from
 *    https://www.ph4.org/biblia_ruennum.php
 */
function getRussianTranslationsMapping(book, chapter, nr, isParallel) {
  if (book === "NUM" && chapter === 13) {
    return nr + (isParallel ? -1 : 1);
  }
  if (book === "JOS" && chapter === 6) {
    return nr + (isParallel ? 1 : -1);
  }
  if (book === "1SA" && chapter === 24) {
    return nr + (isParallel ? -1 : 1);
  }
  if (book === "SNG" && chapter === 1) {
    return nr + (isParallel ? 1 : -1);
  }
  if (book === "SNG" && chapter === 7) {
    return nr + (isParallel ? -1 : 1);
  }
  if (book === "DAN" && chapter === 4) {
    return nr + (isParallel ? 3 : -3);
  }
  if (book === "HOS" && chapter === 14) {
    return nr + (isParallel ? -1 : 1);
  }
  if (book === "JON" && chapter === 2) {
    return nr + (isParallel ? -1 : 1);
  }
  if (book === "PSA" && chapter > 2 && chapter < 10) {
    return nr + (isParallel ? -1 : 1);
  }
  if (book === "PSA" && chapter > 9) {
    return 0;
  }
  return nr;
}
