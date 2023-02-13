function $(selector) {
  return document.querySelector(selector);
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

function matchNumbers(value) {
  return value.match(/\s+(\d+)/gi);
}

function splitVerses(verses) {
  return verses.trim().split(/\s*[;,\n]\s*/);
}

function getVerseInfo(search) {
  const fullMatch = Array.from(search.matchAll(/(?<book>.+)(\s+)(?<chapter>\d+)([\:\s\.]+)(?<verse>\d+)/gi))[0];
  if (fullMatch) {
    return fullMatch.groups;
  }
  const match = Array.from(search.matchAll(/(?<book>.+)(\s+)(?<chapter>\d+)/gi))[0];
  return match ? match.groups : null;
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    $,
    debounce,
    waitElement,
    matchNumbers,
    splitVerses,
    getVerseInfo
  };
}
