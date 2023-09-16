import { latinizeText } from "../views/common/latinizeText";
import { searchVersesNrsRegExp, searchChapterNrRegExp, improveReference } from "../views/common/utilities";
import { getVerseInfo } from "../views/common/bible-mappings";

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
    "Mat 8 2   -> Mat 8 2",
    // --
    "ps 8      -> Ps 8",
    "rom 2 4   -> Rom 2 4",
    "1 sam 2 3 -> 1 Sam 2 3",
    // --
    "sam 2 3   -> 1 Samuel 2 3",
    "cor 2 4   -> 1 Corinteni 2 4",
    "Cor 2 4   -> 1 Corinteni 2 4",
    "cu 1 3    -> Leviticul 1 3",
    "lev 1 3   -> Lev 1 3"
  ];

  global["latinizeText"] = latinizeText;
  global["getVerseInfo"] = getVerseInfo;

  test.each(improvements)("improve search: %o", search => {
    const [from, to] = search.split(targetSplitter);
    const target = improveReference(from, booksCache);
    expect(target).toBe(to);
  });
});
