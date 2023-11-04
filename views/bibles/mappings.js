const BibleVersionsMappingsIds = {
  // [RU]
  143: "НРП",
  167: "СИНОД",
  201: "RSP",
  385: "CARS",
  840: "CARS-A",
  400: "SYNO",
  // [UA]
  186: "UBIO",
  // [RO]
  191: "VDC"
};

function getVersionById(id) {
  return BibleVersionsMappingsIds[id];
}

/**
 *
 * @param {{}} urlParams
 * @param {number} verse
 * @param {boolean} isParallel
 * @returns {{chapter: (number|string), book: string, verse: (number|string)}|string}
 */
function youVersionReferenceMap(urlParams, verse, isParallel) {
  const ref = {
    book: urlParams.book,
    chapter: urlParams.chapter,
    verse: verse
  };
  const from = getVersionById(isParallel ? urlParams.parallel : urlParams.primary);
  const to = getVersionById(isParallel ? urlParams.primary : urlParams.parallel);
  //console.warn("Reference [%o] -> [%o]", from, to, ref);
  return bibleReferenceMap(ref, from, to, false);
}
