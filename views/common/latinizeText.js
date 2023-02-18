// https://github.com/dundalek/latinize/blob/master/latinize.js
// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
const latinizeText = (() => {
  // TODO add more DIACRITICS
  const DIACRITICS_MAP = {
    a: "ăàáâãäå",
    i: "ìíîï",
    s: "ş",
    t: "ţ"
  };

  const lowerCaseMap = Object.entries(DIACRITICS_MAP).reduce((map, [key, accents]) => {
    map[key] = new RegExp(`[${accents}]`, "g");
    return map;
  }, {});
  const upperCaseMap = Object.entries(DIACRITICS_MAP).reduce((map, [key, accents]) => {
    map[key.toUpperCase()] = new RegExp(`[${accents.toUpperCase()}]`, "g");
    return map;
  }, {});

  return function (text, includeUpperCase = false) {
    Object.entries(lowerCaseMap).forEach(([key, regExp]) => {
      text = text.replace(regExp, key);
    });
    if (includeUpperCase) {
      Object.entries(upperCaseMap).forEach(([key, regExp]) => {
        text = text.replace(regExp, key);
      });
    }
    return text;
  };
})();

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    latinizeText
  };
}
