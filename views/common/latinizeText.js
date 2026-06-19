// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
// Decompose every accented character (NFD) and drop the combining marks. This covers all
// Latin diacritics regardless of case or form — both the cedilla (ş U+015F / ţ U+0163) and the
// modern Romanian comma-below (ș U+0219 / ț U+021B) variants bible.com uses — in one pass.
// The `includeUpperCase` arg is kept for backward compatibility but is now a no-op: NFD
// normalizes upper- and lower-case alike.
const COMBINING_MARKS_REGEXP = /[̀-ͯ]/g;
const latinizeText = (text, includeUpperCase = false) => text.normalize("NFD").replace(COMBINING_MARKS_REGEXP, "");

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    latinizeText
  };
}
