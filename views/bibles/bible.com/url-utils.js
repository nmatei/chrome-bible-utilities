// ?parallel= is optional so this matches both parallel and single-version chapter urls,
// e.g. /bible/191/JHN.15.VDC?parallel=143 and /bible/191/JHN.15.VDC
const urlMatchRegExp = /(?<primary>\d+)\/(?<book>\w+)\.(?<chapter>\d+)\.(?<version>[^?]+)(?:\?parallel=(?<parallel>\d+))?/gi;

function getUrlMatch(url) {
  return Array.from(url.matchAll(urlMatchRegExp))[0];
}

function parseUrlMatch(urlMatch) {
  if (urlMatch) {
    // console.debug("groups", urlMatch.groups);
    const { primary, book, chapter, parallel, version } = urlMatch.groups;
    return {
      book: book,
      version: version,
      primary: parseInt(primary),
      parallel: parallel ? parseInt(parallel) : undefined,
      chapter: parseInt(chapter)
    };
  }
  return null;
}

function getUrlParams(href) {
  const urlMatch = getUrlMatch(href || window.location.href);
  return parseUrlMatch(urlMatch);
}

/**
 * Url of another chapter, keeping everything else from the given url:
 *   the language prefix (eg. /ro/bible/...), the versions and the ?parallel= version id.
 * eg. ("https://www.bible.com/ro/bible/191/JHN.15.VDC?parallel=143", { book: "PSA", chapter: 23 })
 *   -> "https://www.bible.com/ro/bible/191/PSA.23.VDC?parallel=143"
 * @param {string} href - current chapter url
 * @param {*} ref - usfm book key & chapter to load
 * @returns {string|null} url - null when href is not a chapter url or the reference is incomplete
 */
function createChapterNavigationUrl(href, { book, chapter } = {}) {
  const urlMatch = getUrlMatch(href || "");
  if (!urlMatch || !book || !chapter) {
    return null;
  }
  const { primary, version, parallel } = urlMatch.groups;
  const parallelParam = parallel ? `?parallel=${parallel}` : "";
  return `${href.slice(0, urlMatch.index)}${primary}/${book}.${chapter}.${version}${parallelParam}`;
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    getUrlMatch,
    getUrlParams,
    createChapterNavigationUrl
  };
}
