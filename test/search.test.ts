import { searchVersesNrsRegExp, searchChapterNrRegExp } from "../views/common/utilities";

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
