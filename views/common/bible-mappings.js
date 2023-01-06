// TODO continue... make it more generic
const BibleVersions = {
  ro: {
    191: "VDC",
    126: "NTR",
    903: "BTF2015"
  },
  ru: {
    143: "НРП",
    167: "СИНОД",
    //313: "BTI", // TODO ROM 13 is in sync with RO ...
    385: "CARS",
    840: "CARS-A",
    400: "SYNO"
  }
};

function isBibleInLanguage(languageCode, id) {
  languageCode = languageCode.toLowerCase();
  return Object.keys(BibleVersions[languageCode]).some(n => n == id);
}
