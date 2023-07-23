function getBooks() {
  return $$(booksSelector());
}

function getChapters() {
  return $$(chaptersSelector());
}

function getTitles() {
  return $$(titlesSelector).map(h => ({
    content: h.innerHTML.trim(),
    parallel: !!h.closest(parallelViewSelector)
  }));
}

function getChapterTitles() {
  return $$(titlesSelector).map(h => h.innerHTML.trim());
}

const urlMatchRegExp = /(?<primary>\d+)\/(?<book>\w+)\.(?<chapter>\d+)\.(.+)\?parallel\=(?<parallel>\d+)/gi;

function getUrlMatch(url) {
  return Array.from(url.matchAll(urlMatchRegExp))[0];
}

function parseUrlMatch(urlMatch) {
  if (urlMatch) {
    // console.debug("groups", urlMatch.groups);
    const { primary, book, chapter, parallel } = urlMatch.groups;
    return {
      book: book,
      primary: parseInt(primary),
      parallel: parseInt(parallel),
      chapter: parseInt(chapter)
    };
  }
  return null;
}

function getUrlParams(href) {
  const urlMatch = getUrlMatch(href || window.location.href);
  return parseUrlMatch(urlMatch);
}

function createChapterUrl({ book, chapter, primary }) {
  return `https://my.bible.com/bible/${primary}/${book}.${chapter}`;
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    getUrlMatch,
    getUrlParams
  };
}
