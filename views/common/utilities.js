let isShiftKeyPressed = false;

function $(selector, parent) {
  return (parent || document).querySelector(selector);
}

function $$(selector, parent) {
  return [...(parent || document).querySelectorAll(selector)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * use when sleep is needed in background script to be sure is executed correctly.
 * when a tab is inactive in Chrome it will trotle the setTimeout to 1000ms
 */
async function backgroundSleep(ms) {
  return chrome.runtime.sendMessage({
    action: "backgroundSleep",
    payload: ms
  });
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 *
 * @param fn
 * @param delay
 * @returns {(function(): void)|*}
 */
function debounce(fn, delay) {
  let timer = null;
  return function () {
    const context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

/**
 *
 * @param {String} selector
 * @param {Number} timeout
 * @param {Number} retryInterval
 * @returns {Promise<null | HTMLElement>}
 */
function waitElement(selector, timeout = 30000, retryInterval = 100) {
  return new Promise((resolve, reject) => {
    let el = $(selector);
    if (el) {
      resolve(el);
      return;
    }
    const endTime = Date.now() + timeout;
    const refreshIntervalId = setInterval(() => {
      el = $(selector);
      if (el) {
        clearInterval(refreshIntervalId);
        resolve(el);
      } else if (endTime < Date.now()) {
        clearInterval(refreshIntervalId);
        //reject("timeout");
        resolve(null);
      }
    }, retryInterval);
  });
}

function fillNumbers(from, to) {
  let numbers = [from, to];
  numbers.sort((a, b) => a - b);
  const [first, last] = numbers;
  numbers = new Array(last - first + 1).fill(0).map((n, i) => first + i);
  return numbers;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

const referenceSplitterRegExp = /\s*[;,\n]\s*/;

const multiSpaceRegExp = /\s+/g;
const searchVersesNrsRegExp = /^\s*\d+\s*(-\s*\d+)?\s*$/;
const searchChapterNrRegExp = /^\s*\d+\s*[:\s]\s*\d+\s*(-\s*\d+)?\s*$/;

function splitVerses(verses) {
  verses = verses.trim();
  if (!verses) {
    return [];
  }
  return verses.split(referenceSplitterRegExp);
}

function findBookText(book, booksCache) {
  book = latinizeText(book.toLowerCase());
  return booksCache.find(e => latinizeText(e.toLowerCase()).includes(book));
}

function improveBookName(book, bookText) {
  if (!bookText || bookText.startsWith(book)) {
    return book;
  }
  if (bookText.toLowerCase().startsWith(book.toLowerCase())) {
    return bookText.substring(0, book.length);
  }
  return bookText;
}

function improveReference(from, booksCache) {
  const match = getVerseInfo(from);
  if (match) {
    const book = match.book;
    const bookText = findBookText(book, booksCache);
    const improved = improveBookName(book, bookText);
    return improved + from.substring(book.length);
  }
  return from;
}

function initShiftKeyEvents() {
  window.addEventListener("keydown", e => {
    if (e.key === "Shift") {
      isShiftKeyPressed = true;
    }
  });
  window.addEventListener("keyup", e => {
    if (e.key === "Shift") {
      isShiftKeyPressed = false;
    }
  });
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    splitVerses,
    improveReference,
    searchVersesNrsRegExp,
    searchChapterNrRegExp
  };
}
