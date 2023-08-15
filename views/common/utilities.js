function $(selector, parent) {
  return (parent || document).querySelector(selector);
}

function $$(selector, parent) {
  return [...(parent || document).querySelectorAll(selector)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

function copyToClipboard_v2(text) {
  const iframe = document.createElement("iframe");
  iframe.onload = function () {
    const doc = iframe.contentWindow.document;
    execCopy(text, doc);
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 100);
  };
  document.body.appendChild(iframe);
}

function execCopy(text, doc) {
  if (doc.queryCommandSupported && doc.queryCommandSupported("copy")) {
    const textarea = doc.createElement("textarea");
    textarea.textContent = text;
    // Prevent scrolling to bottom of page in MS Edge.
    textarea.style.position = "fixed";
    doc.body.appendChild(textarea);
    textarea.select();
    try {
      // Security exception may be thrown by some browsers.
      return doc.execCommand("copy");
    } catch (ex) {
      //<debug>
      console.warn("Copy to clipboard failed.", ex);
      //</debug>
      return false;
    } finally {
      doc.body.removeChild(textarea);
    }
  }
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

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    splitVerses,
    searchVersesNrsRegExp,
    searchChapterNrRegExp
  };
}
