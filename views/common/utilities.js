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

function swapElements(array, index1, index2) {
  [array[index1], array[index2]] = [array[index2], array[index1]];
}

function setFormValues(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    const input = form[key];
    if (input && input.type !== "file") {
      input.value = value;
      if (typeof input.setAttribute === "function") {
        // Ensure the attribute is updated
        input.setAttribute("value", value);
      }
    }
  });
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

function download(text, name, type) {
  const anchor = document.createElement("a");
  anchor.className = "download-js-link";
  anchor.id = "download-html";
  anchor.innerHTML = "downloading...";
  anchor.style.display = "none";
  document.body.appendChild(anchor);

  const file = new Blob([text], { type: type });
  anchor.href = URL.createObjectURL(file);
  anchor.download = name;
  anchor.click();
  document.body.removeChild(anchor);
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
// used to identify if the reference is having only [verses] only from current book
const searchVersesNrsRegExp = /^\s*\d+\s*(-\s*\d+)?\s*$/;
// used to identify if the reference is [chapter + verses] only from current book
const searchChapterNrRegExp = /^\s*\d+\s*[:\s]\s*\d+\s*(-\s*\d+)?\s*$/;

function splitVerses(verses) {
  verses = verses.trim();
  if (!verses) {
    return [];
  }
  return verses
    .split(referenceSplitterRegExp)
    .map(v => v.trim())
    .filter(v => v);
}

function findBookText(book, booksCache) {
  book = latinizeText(book.toLowerCase());
  return booksCache.find(e => latinizeText(e.toLowerCase()).includes(book));
}

// Resolve a localized/partial book name to its USFM url key (e.g. "ioan" -> "JHN").
function findBookKey(book, booksCacheObj) {
  book = latinizeText(book.toLowerCase());
  const found = booksCacheObj.find(e => e.name && latinizeText(e.name.toLowerCase()).includes(book));
  return found ? found.key : undefined;
}

// Build a pin item from raw text. Stamps the language-independent USFM `key`
// when the text parses as a reference AND its book resolves in the current cache.
// Custom text (or refs added before the cache loaded) come back as `{ text }`.
function makePinItem(text, booksCacheObj) {
  const item = { text };
  const match = getVerseInfo(text);
  if (match) {
    const key = findBookKey(match.book, booksCacheObj);
    if (key) {
      item.key = key;
    }
  }
  return item;
}

// Display text for a pin. References are rebuilt from their `key` using the
// current language's book name (so they relocalize on a version switch);
// numbers come from parsing the stored text (digits are language-independent).
function displayPinText(pin, booksCacheObj) {
  if (pin.key) {
    const match = getVerseInfo(pin.text);
    // Keep the user's stored shorthand (e.g. "Mat", "Ps") as long as it still
    // resolves to the same book in the current language. Only rebuild from the
    // key (full localized name) when the text no longer matches — i.e. the
    // source language/version was switched after the pin was added.
    if (match && findBookKey(match.book, booksCacheObj) === pin.key) {
      return pin.text;
    }
    const book = booksCacheObj.find(b => b.key === pin.key);
    if (book && book.name) {
      if (match) {
        return getVerseStr({
          book: book.name,
          chapter: match.chapter,
          verse: match.verse,
          to: match.to
        });
      }
      return book.name;
    }
  }
  return pin.text;
}

// True when a pin is a bible reference. Re-resolves against the cache so a ref
// added before the cache loaded still colors correctly once it is available.
function isPinReference(pin, booksCacheObj) {
  if (pin.key) {
    return true;
  }
  const match = getVerseInfo(pin.text);
  return !!(match && findBookKey(match.book, booksCacheObj));
}

// Identity used to dedupe pins (book key + numbers for refs, raw text otherwise).
function pinKey(pin) {
  if (pin.key) {
    const match = getVerseInfo(pin.text) || {};
    return `${pin.key}|${match.chapter || ""}:${match.verse || ""}-${match.to || ""}`;
  }
  return `t|${pin.text}`;
}

function improveBookName(book, bookText) {
  if (!bookText || bookText.startsWith(book)) {
    return book;
  }
  // diacritic-insensitive prefix check, so an accent-free shortcut ("1 imp") is completed
  // with the proper book name's diacritics & casing ("1 Împ") instead of expanding to the full name
  if (latinizeText(bookText.toLowerCase()).startsWith(latinizeText(book.toLowerCase()))) {
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
    const ref = improved + from.substring(book.length);
    return formatVerseRef(ref);
  }
  return from;
}

function fixSplitedRefereces(verses) {
  if (verses.length < 2) {
    return verses;
  }
  // fix if we have referece in simplified format
  // make sure to add them to pinned list using Book name
  // search book name from preview reference (first available)

  let lastBookReference = null;

  return verses.map(v => {
    // Check if the verse has a book name reference
    const match = getVerseInfo(v);

    // If this is a full reference with a book name, remember it and return as is
    if (match && match.book) {
      lastBookReference = match;
      return v;
    }

    // If it's just a chapter:verse format (no book name), use the last book reference
    if (lastBookReference && searchChapterNrRegExp.test(v)) {
      return `${lastBookReference.book} ${v}`;
    }

    return v;
  });
}

function initShiftKeyEvents() {
  window.addEventListener("keydown", e => {
    if (e.key === "Shift") {
      isShiftKeyPressed = true;
      document.body.classList.add("shift-pressed");
    }
  });
  window.addEventListener("keyup", e => {
    if (e.key === "Shift") {
      isShiftKeyPressed = false;
      document.body.classList.remove("shift-pressed");
    }
  });
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    splitVerses,
    improveReference,
    improveBookName,
    findBookText,
    findBookKey,
    makePinItem,
    displayPinText,
    isPinReference,
    pinKey,
    fixSplitedRefereces,
    searchVersesNrsRegExp,
    searchChapterNrRegExp
  };
}
