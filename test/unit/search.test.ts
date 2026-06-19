import { latinizeText } from "../../views/common/latinizeText";
import {
  searchVersesNrsRegExp,
  searchChapterNrRegExp,
  improveReference,
  improveBookName,
  findBookText,
  splitVerses,
  fixSplitedRefereces
} from "../../views/common/utilities";
import { getVerseInfo, formatVerseRef } from "../../views/common/bible-mappings";

describe("Number Format Regex", () => {
  const validVersesFormats = [
    "2",
    "5",
    "2 ",
    "2  ",
    " 2",
    "  2",
    " 2 ",
    "2-5",
    "2-7 ",
    " 2-7",
    "  2-7",
    " 2-7 ",
    "2 -7",
    "2 -7  ",
    " 2 -  7 ",
    "  2   -       7  "
  ];

  const invalidVersesFormats = [
    "invalid format",
    "invalid",
    "d",
    "{ 3 }",
    "Ioan 1:3",
    "Mat 1 : 3",
    "abc:123",
    "2s",
    "d5",
    "2: ",
    ":2  ",
    "-2",
    "  2 -  2  3   "
  ];

  const validChapterAndVersesFormats = [
    "3:2",
    " 3:2",
    "3:2 ",
    " 3:2 ",
    "3 :2 ",
    "3: 2",
    "3 : 2",
    " 3 : 2",
    "3:6-9",
    "2 3",
    "2 7-6",
    "2:4-7",
    " 2 3 ",
    "   2 7 -6",
    "3:6 - 9",
    " 2  :  4 - 7 "
  ];

  const invalidChapterAndVersesFormats = [
    "invalid format",
    "Ioan 1:3",
    "Mat 1 : 3",
    "3:2:",
    "2 3 4",
    "2 7--6",
    "3:6-9:",
    "2::4-7",
    "abc:123",
    "1 2 3",
    "1-2-3"
  ];

  // = = = searchVersesNrsRegExp = = =

  test.each(validVersesFormats)("valid search verses format: %s", format => {
    expect(searchVersesNrsRegExp.test(format)).toBe(true);
  });

  test.each(invalidVersesFormats)("invalid search verses format: %s", format => {
    expect(searchVersesNrsRegExp.test(format)).toBe(false);
  });

  test.each(validChapterAndVersesFormats)("chapter search can't be used for verse search: %s", format => {
    expect(searchVersesNrsRegExp.test(format)).toBe(false);
  });

  // = = = searchChapterNrRegExp = = =

  test.each(validChapterAndVersesFormats)("valid search chapter format: %s", format => {
    expect(searchChapterNrRegExp.test(format)).toBe(true);
  });

  test.each(invalidChapterAndVersesFormats)("invalid search chapter format: %s", format => {
    expect(searchChapterNrRegExp.test(format)).toBe(false);
  });

  test.each(validVersesFormats)("verse search can't be used for chapter search: %s", format => {
    expect(searchChapterNrRegExp.test(format)).toBe(false);
  });
});

describe("Improve reference", () => {
  const targetSplitter = /\s*->\s*/;

  // prettier-ignore
  const booksCache = ['Geneza', 'Exodul', 'Leviticul', 'Numeri', 'Deuteronomul', 'Iosua', 'Judecătorii', 'Rut', '1 Samuel', '2 Samuel', '1 Împăraţilor', '2 Împăraţilor', '1 Cronici', '2 Cronici', 'Ezra', 'Neemia', 'Estera', 'Iov', 'Psalmul', 'Proverbele', 'Eclesiastul', 'Cântarea Cântărilor', 'Isaia', 'Ieremia', 'Plângerile', 'Ezechiel', 'Daniel', 'Osea', 'Ioel', 'Amos', 'Obadia', 'Iona', 'Mica', 'Naum', 'Habacuc', 'Ţefania', 'Hagai', 'Zaharia', 'Maleahi', 'Matei', 'Marcu', 'Luca', 'Ioan', 'Faptele Apostolilor', 'Romani', '1 Corinteni', '2 Corinteni', 'Galateni', 'Efeseni', 'Filipeni', 'Coloseni', '1 Tesaloniceni', '2 Tesaloniceni', '1 Timotei', '2 Timotei', 'Tit', 'Filimon', 'Evrei', 'Iacov', '1 Petru', '2 Petru', '1 Ioan', '2 Ioan', '3 Ioan', 'Iuda', 'Apocalipsa']

  const improvements = [
    "Ps 8      -> Ps 8",
    "Mat 8 2   -> Mat 8:2",
    // --
    "ps 8      -> Ps 8",
    "rom 2 4   -> Rom 2:4",
    "1 sam 2 3 -> 1 Sam 2:3",
    // --
    "sam 2 3   -> 1 Samuel 2:3",
    "cor 2 4   -> 1 Corinteni 2:4",
    "Cor 2 4   -> 1 Corinteni 2:4",
    "cu 1 3    -> Leviticul 1:3",
    "lev 1 3   -> Lev 1:3",
    // --
    "imp 5 3   -> 1 Împăraţilor 5:3",
    // -- book + chapter only (no verse):
    // keep accent-free abbreviation, fix diacritics & casing
    "1 imp 2   -> 1 Împ 2",
    "mat 2 3   -> Mat 2:3"
  ];

  // map used functions as globals
  global["latinizeText"] = latinizeText;
  global["getVerseInfo"] = getVerseInfo;
  global["formatVerseRef"] = formatVerseRef;

  test.each(improvements)("improve search: %o", search => {
    const [from, to] = search.split(targetSplitter);
    const target = improveReference(from, booksCache);
    expect(target).toBe(to);
  });
});

describe("Improve reference with comma-below diacritics", () => {
  const targetSplitter = /\s*->\s*/;

  // modern Romanian spellings as rendered by bible.com — comma-below ș (U+0219) / ț (U+021B)
  // prettier-ignore
  const booksCache = ['Geneza', 'Iosua', 'Judecători', '1 Samuel', '2 Samuel', '1 Împărați', '2 Împărați', 'Psalmul', 'Cântarea Cântărilor', 'Plângerile', 'Țefania', 'Matei', 'Galateni', 'Apocalipsa'];

  const improvements = [
    // accent-free abbreviation is kept, but completed with the correct diacritics & casing
    "tef 1      -> Țef 1",
    "1 imp 11 9 -> 1 Împ 11:9",
    // not a prefix of the proper name -> expand to the full book name
    "imparati 2 4 -> 1 Împărați 2:4"
  ];

  test.each(improvements)("improve search: %o", search => {
    const [from, to] = search.split(targetSplitter);
    const target = improveReference(from, booksCache);
    expect(target).toBe(to);
  });
});

describe("findBookText / improveBookName with diacritics", () => {
  it("findBookText matches accent-free input against comma-below book name", () => {
    expect(findBookText("tef", ["Țefania"])).toBe("Țefania");
    expect(findBookText("1 imp", ["1 Împărați", "2 Împărați"])).toBe("1 Împărați");
  });

  it("improveBookName completes an accent-free prefix with proper diacritics", () => {
    // user typed accent-free prefix -> keep abbreviation length, fix diacritics & casing
    expect(improveBookName("1 imp", "1 Împărați")).toBe("1 Împ");
    expect(improveBookName("tef", "Țefania")).toBe("Țef");
    // existing behavior unchanged for accent-free books
    expect(improveBookName("lev", "Leviticul")).toBe("Lev");
  });
});

describe("Improve add multiple references", () => {
  it("fixSplitedRefereces", () => {
    const refs = fixSplitedRefereces(["1 John 3:2", "Acts 2:21", "4:12", "15:11"]);
    expect(refs).toEqual(["1 John 3:2", "Acts 2:21", "Acts 4:12", "Acts 15:11"]);
  });

  it("fixSplitedRefereces one book split by comma", () => {
    const refs = fixSplitedRefereces(splitVerses("1 John 3:2, 4:12, 15:11"));
    expect(refs).toEqual(["1 John 3:2", "1 John 4:12", "1 John 15:11"]);
  });

  it("fixSplitedRefereces one book split by semicolon", () => {
    const refs = fixSplitedRefereces(splitVerses("1 John 3:2; 4:12; 15:11"));
    expect(refs).toEqual(["1 John 3:2", "1 John 4:12", "1 John 15:11"]);
  });
});
