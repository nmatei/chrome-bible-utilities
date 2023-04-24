const projected = "projected";

function chapterPickerArrow() {
  if (isLoggedIn) {
    return $(".dropdown-arrow-container");
  }
  return $('[data-vars-event-category="Chapter Picker"]');
}

function booksSelector() {
  if (isLoggedIn) {
    return ".book-list li";
  }
  return "#bible-book-list .list li";
}

function notLoggedInBookListCancel() {
  return '#bible-book-list [data-vars-event-action="Cancel"]';
}

function chaptersSelector() {
  if (isLoggedIn) {
    return ".chapter-picker-modal .chapter-container .chapter-list a";
  }
  return '#bible-chapter-list a[data-vars-event-action="Select Chapter"]';
}

function getVerseSelector(focusOrder, number) {
  if (isLoggedIn) {
    return `.row .${focusOrder} .verse.v${number}`;
  }
  return `.chapter > div .verse.v${number}`;
}

function getBooks() {
  return $$(booksSelector());
}

function getChapters() {
  return $$(chaptersSelector());
}

function getTitles() {
  return $$(".reader h1").map(h => ({
    content: h.innerHTML.trim(),
    parallel: !!h.closest(".parallel-chapter")
  }));
}

function getChapterTitles() {
  return $$(".reader h1").map(h => h.innerHTML.trim());
}

function selectedSelector() {
  return `.verse.${projected}`;
}

function getVerseNr(verseEl) {
  const label = verseEl ? verseEl.querySelector(":scope > .label") : null;
  return label ? label.innerText : "";
}

const urlMatchRegExp = /(?<primary>\d+)\/(?<book>\w+)\.(?<chapter>\d+)\.(.+)\?parallel\=(?<parallel>\d+)/gi;

function getUrlMatch(url) {
  return Array.from(url.matchAll(urlMatchRegExp))[0];
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    getUrlMatch
  };
}
