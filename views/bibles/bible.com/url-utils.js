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

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    getUrlMatch,
    getUrlParams
  };
}
