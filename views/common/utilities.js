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
  //  example
  //     ["1 John 3:2", "Acts 2:21", "4:12", "15:11"] ->
  //     ["1 John 3:2", "Acts 2:21", "Acts 4:12", "Acts 15:11"]

  console.warn("multiple references", verses);
  // TODO implement this
  return verses.map(v => {
    // TODO check if we have a book name in the reference
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
    fixSplitedRefereces,
    searchVersesNrsRegExp,
    searchChapterNrRegExp
  };
}
