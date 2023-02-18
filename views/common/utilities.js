function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return [...document.querySelectorAll(selector)];
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

const referenceSplitterRegExp = /\s*[;,\n]\s*/;
const verseRefRegExp = /(?<book>.+)(\s+)(?<chapter>\d+)([\:\s\.]+)(?<verse>\d+)/gi;
const chapterRefRegExp = /(?<book>.+)(\s+)(?<chapter>\d+)/gi;

function splitVerses(verses) {
  verses = verses.trim();
  if (!verses) {
    return [];
  }
  return verses.split(referenceSplitterRegExp);
}

function getVerseInfo(search) {
  search = search.trim();
  const fullMatch = Array.from(search.matchAll(verseRefRegExp))[0];
  if (fullMatch) {
    return fullMatch.groups;
  }
  const match = Array.from(search.matchAll(chapterRefRegExp))[0];
  return match ? match.groups : null;
}

function getReferencePreview(book, chapter = "", verse = "") {
  return `${book} ${chapter}${verse ? ":" + verse : ""}`.trim();
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    splitVerses,
    getVerseInfo,
    getReferencePreview
  };
}
