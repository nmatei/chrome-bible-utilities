// =======================
// External API: getVerses / projectVerses (other extensions -> background.js -> this tab)
// =======================

// window index (1 or 2) an external projectVerses is limited to, 0 = all enabled windows (see printSelectedVerses)
let externalProjectIndex = 0;

/**
 * Book of a reference: a USFM key (eg. "JHN") or a (partial) localized name (eg. "Ioan", "ioan")
 * @param {String} book
 * @param {Array} books - [{ key, name, chapters }]
 * @returns {{ key, name, chapters }|undefined}
 */
function findExternalBook(book, books) {
  const usfm = book.trim().toUpperCase();
  return books.find(b => b.key && b.key === usfm) || findBook(book.trim(), books);
}

/**
 * Validate a reference against a books list (no DOM / network).
 * @param {String} reference - eg. "Ioan 3:16-18", "JHN 3:16", "Psalmii 23"
 * @param {Array} books - [{ key, name, chapters }]
 * @returns {{ status, error? , match?, book?, numbers? }}
 *   numbers - verses to return (null = whole chapter)
 */
function parseExternalReference(reference, books) {
  const match = typeof reference === "string" ? getVerseInfo(reference) : null;
  if (!match) {
    return {
      status: 400,
      error: 'Invalid reference format. Use "Book chapter:verse[-to]", eg. "John 3:16-18"'
    };
  }
  const book = findExternalBook(match.book, books || []);
  if (!book || !book.key) {
    return {
      status: 422,
      error: `Book not found: ${match.book.trim()}`
    };
  }
  const chapter = parseInt(match.chapter);
  if (!chapter || (book.chapters && chapter > book.chapters)) {
    return {
      status: 422,
      error: `Chapter not found: ${book.name} ${match.chapter} (last chapter is ${book.chapters})`
    };
  }
  const verse = match.verse ? parseInt(match.verse) : 0;
  const to = match.to ? parseInt(match.to) : 0;
  if (to && to < verse) {
    return {
      status: 400,
      error: `Invalid verse range: ${verse}-${to}`
    };
  }
  return {
    status: 200,
    // book name in the current language, so it opens the chapter on bible.com (also for USFM keys)
    match: { book: book.name, chapter, verse: verse || "", to: to || "" },
    book,
    numbers: verse ? (to ? fillNumbers(verse, to) : [verse]) : null
  };
}

/**
 * Verses with the requested numbers from a chapter, grouped verses (eg. "43-47") counted once.
 * @param {Array} versesInfo - [{ verseNr, content }] see getChapterFromAPI
 * @param {Array|null} numbers - null = whole chapter
 * @returns {{ verses: [{ verse, text }], missing: Number[] }}
 */
function pickVerses(versesInfo, numbers) {
  if (!numbers) {
    return {
      verses: versesInfo.map(v => ({ verse: String(v.verseNr).trim(), text: v.content })),
      missing: []
    };
  }
  const used = new Set();
  const verses = [];
  const missing = [];
  numbers.forEach(number => {
    const info = versesInfo.find(v => {
      const nr = String(v.verseNr).trim();
      if (nr === String(number)) {
        return true;
      }
      const group = parseGroupedVerseLabel(nr);
      return group && number >= group.from && number <= group.to;
    });
    if (!info) {
      missing.push(number);
    } else if (!used.has(info)) {
      used.add(info);
      verses.push({ verse: String(info.verseNr).trim(), text: info.content });
    }
  });
  return { verses, missing };
}

/**
 * Resolve a reference and load its verses from the bible.com API.
 * @param {String} reference
 * @param {Number} [version] - bible.com version id, defaults to the primary version of this tab
 */
async function resolveExternalReference(reference, version) {
  const urlParams = getUrlParams();
  const primary = urlParams ? urlParams.primary : undefined;
  const versionId = parseInt(version) || primary;
  if (!versionId) {
    return {
      status: 500,
      error: "bible.com is not on a chapter page (no version)"
    };
  }
  const books =
    versionId === primary && booksCacheObj.some(b => b.key) ? booksCacheObj : await fetchVersionBooks(versionId);
  const parsed = parseExternalReference(reference, books);
  if (parsed.status !== 200) {
    return parsed;
  }
  const { match, book, numbers } = parsed;
  const versesInfo = await getChapterFromAPI({ primary: versionId, book: book.key, chapter: match.chapter });
  if (!versesInfo || !versesInfo.length) {
    return {
      status: 422,
      error: `Chapter not found: ${book.name} ${match.chapter}`
    };
  }
  const { verses, missing } = pickVerses(versesInfo, numbers);
  if (missing.length) {
    return {
      status: 422,
      error: `Verse not found: ${book.name} ${match.chapter}:${missing.join(",")}`
    };
  }
  const usfm = `${book.key}.${match.chapter}${match.verse ? "." + match.verse : ""}${match.to ? "-" + match.to : ""}`;
  return {
    status: 200,
    match,
    reference: getVerseStr(match),
    usfm,
    version: {
      id: versionId,
      name: (versionId === primary ? urlParams.version : getVersionById(versionId)) || ""
    },
    verses,
    text: verses.map(v => (verses.length > 1 ? `${v.verse} ${v.text}` : v.text)).join("\n")
  };
}

/**
 * Handle "externalVerses" sent by background.js (getVerses / projectVerses from other extensions)
 * @param {{ reference, project, index, version }} payload
 */
async function onExternalVersesRequest({ reference, project, index, version } = {}) {
  const result = await resolveExternalReference(reference, project ? undefined : version);
  if (result.status !== 200) {
    return result;
  }
  const { match, ...response } = result;
  if (project) {
    if (!match.verse) {
      return {
        status: 400,
        error: 'A verse is required to project, eg. "John 3:16"'
      };
    }
    // don't wait: opening another chapter can reload the page (checkAutoProject projects it after load)
    projectExternalReference({ ...match, range: !!match.to, index: index || 0 });
  }
  return response;
}

/**
 * Open the reference on bible.com, select & project its verses (like a pinned reference, without pinning it)
 * @param {*} match - { book, chapter, verse, to, range, index }
 */
async function projectExternalReference(match) {
  externalProjectIndex = match.index || 0;
  try {
    const { match: opened } = await openReference(match);
    if (opened && opened.range && opened.to && isChapterLoaded(opened)) {
      await doSelectVerses(opened.to, false, false, false, true);
    }
  } catch (e) {
    console.warn("external reference not projected", match, e);
  } finally {
    externalProjectIndex = 0;
  }
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = { findExternalBook, parseExternalReference, pickVerses };
}
