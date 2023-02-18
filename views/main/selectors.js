function getDropDownArrow() {
  if (isLoggedIn) {
    return $(".dropdown-arrow-container");
  }
  return $('[data-vars-event-category="Chapter Picker"]');
}

function getBooks() {
  if (isLoggedIn) {
    return $$(".book-list li");
  }
  // works only after 'first' expand
  return $$(noLoggedInBookSelector());
}

function noLoggedInBookSelector() {
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

function getChapters() {
  return $$(chaptersSelector());
}

function getChapterTitles() {
  return $$(".reader h1").map(h => h.innerHTML.trim());
}

function getVerseSelector(focusOrder, number) {
  if (isLoggedIn) {
    return `.row .${focusOrder} .verse.v${number}`;
  }
  return `.chapter > div .verse.v${number}`;
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
