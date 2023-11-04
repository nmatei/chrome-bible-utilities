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

// TODO let comments visible in main app,
//  and remove them only in project tab
function cleanUp(parent) {
  // remove all notes
  $$(notesSelector, parent || document).forEach(n => {
    n.innerHTML = "";
    n.className = "";
  });
}

async function getChapterFromAPI({ primary, book, chapter }) {
  const baseUrl = "https://nodejs.bible.com/api/bible/chapter/3.1";
  const response = await fetch(`${baseUrl}?id=${primary}&reference=${book}.${chapter}`);
  const json = await response.json();

  if (json) {
    const div = document.createElement("div");
    div.innerHTML = json.content;
    delete json.content;
    //console.warn('div.querySelectorAll(".note")', div.querySelectorAll(".note"));
    div.querySelectorAll(".note").forEach(n => {
      n.style.display = "none";
      n.innerHTML = "";
    });

    const verses = [...div.querySelectorAll(".verse")];
    //console.warn("verses", verses);
    const versesInfo = getVersesInfo(verses, false, ".label");
    //console.warn("versesInfo", versesInfo);
    div.innerHTML = "";
    return versesInfo;
  } else {
    console.warn("can't load chapter", arguments);
    return undefined;
  }
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    getUrlMatch,
    getUrlParams
  };
}
