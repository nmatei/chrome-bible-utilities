/**
 * Backup for a bible.com deploy that changes the verse markup completely (eg. new class names format),
 *   before an extension update with the new selectors is published.
 *
 * After every chapter load, when the selectors from selectors.js find no verse numbers,
 *   the verses are looked up in the page and their current classes are used instead (until they work again):
 *   1. by `data-usfm="PSA.1.1"` - the YouVersion reference of each verse (the same one used in urls)
 *   2. by the verse numbers - elements with the same class with the texts 1, 2, 3... in order
 */

const verseUsfmRegExp = /^[1-4A-Z]{3}\.\d+\.(\d+)/; // "PSA.1.1", or grouped "PSA.1.1+PSA.1.2"
const verseNumberRegExp = /^(\d+)(?:-\d+)?$/; // "1", or grouped "43-47"
const stampedVerseAttr = "data-pv-verse";
const stampedViewAttr = "data-pv-view";
const fallbackStyleId = "pv-verse-selectors-fallback";

let verseSelectorsFallback = null;

function classSelector(token) {
  // [class~=] needs no escaping (class names can start with a digit)
  return `[class~="${token}"]`;
}

/**
 * The class shared by (almost) all elements - the most specific one when more classes are shared.
 * @returns {string} selector, or "" when the elements have no common class
 */
function commonClassSelector(els, doc, minShare = 0.8) {
  const counts = {};
  els.forEach(el => new Set(el.classList).forEach(c => (counts[c] = (counts[c] || 0) + 1)));
  const shared = Object.keys(counts).filter(c => counts[c] >= els.length * minShare);
  const [best] = shared
    .map(c => ({ c, total: doc.querySelectorAll(classSelector(c)).length }))
    .sort((a, b) => a.total - b.total);
  return best ? classSelector(best.c) : "";
}

function getVerseRoots(doc) {
  const roots = [...doc.querySelectorAll('[data-testid="chapter-content"]')];
  if (roots.length) {
    return roots;
  }
  const main = doc.querySelector("#main, main");
  return main ? [main] : [];
}

function getLabelNumber(label) {
  const match = (label.textContent || "").trim().match(verseNumberRegExp);
  return match ? parseInt(match[1]) : 0;
}

/**
 * the notes (footnotes / cross references) of a verse start with a label too, but not a number ("#")
 *   - only these, the other children of a verse can be text to project (eg. the words of Jesus)
 */
function detectNotesSelector(verses, label, doc) {
  const notes = verses.flatMap(v =>
    [...v.children].filter(
      c => c.firstElementChild && c.firstElementChild.matches(label) && !getLabelNumber(c.firstElementChild)
    )
  );
  return (notes.length && commonClassSelector(notes, doc)) || "";
}

function detectSelectors(source, verses, labels, doc) {
  const verse = commonClassSelector(verses, doc);
  const label = commonClassSelector(labels, doc);
  if (!verse || !label) {
    return null;
  }
  const contents = verses.flatMap(v => [...v.children].filter(c => !labels.includes(c) && c.textContent.trim()));
  const content = (contents.length && commonClassSelector(contents, doc, 0.5)) || `:not(${label})`;
  return { source, verse, label, content, notes: detectNotesSelector(verses, label, doc) };
}

/**
 * 1. verse elements found by their data-usfm, the label is the child showing the verse number
 */
function detectByUsfm(roots, doc) {
  const verses = roots
    .flatMap(root => [...root.querySelectorAll("[data-usfm]")])
    .filter(el => verseUsfmRegExp.test(el.dataset.usfm))
    // not the cross references inside the notes of a verse (also data-usfm, eg. "PRO.4.14")
    .filter(el => {
      const parent = el.parentElement.closest("[data-usfm]");
      return !parent || !verseUsfmRegExp.test(parent.dataset.usfm);
    });
  if (verses.length < 3) {
    return null;
  }
  const labels = verses
    .map(v => {
      const nr = parseInt(v.dataset.usfm.match(verseUsfmRegExp)[1]);
      return [...v.children].find(c => getLabelNumber(c) === nr);
    })
    .filter(Boolean);
  return labels.length < 3 ? null : detectSelectors("data-usfm", verses, labels, doc);
}

/**
 * 2. the verse numbers: the group of elements (same tag & class) with the most texts 1, 2, 3... in order
 */
function detectByNumbers(roots, doc) {
  const groups = new Map();
  roots.forEach(root =>
    root.querySelectorAll("[class]").forEach(el => {
      if (el.children.length || el.closest("a, button, h1, h2, h3") || !getLabelNumber(el)) {
        return;
      }
      const key = `${el.tagName}.${el.className}`;
      groups.set(key, [...(groups.get(key) || []), el]);
    })
  );
  const ordered = els => {
    let steps = 0;
    for (let i = 1; i < els.length; i++) {
      // parallel view: each root starts again from 1
      const sameRoot = roots.find(r => r.contains(els[i])) === roots.find(r => r.contains(els[i - 1]));
      if (!sameRoot || getLabelNumber(els[i]) > getLabelNumber(els[i - 1])) {
        steps++;
      }
    }
    return steps >= (els.length - 1) * 0.9;
  };
  const [labels] = [...groups.values()]
    .filter(els => els.length >= 3 && ordered(els))
    // the verse holds more text than its number
    .filter(els => els.every(el => el.parentElement.textContent.trim().length > el.textContent.trim().length))
    .sort((a, b) => b.length - a.length);
  if (!labels) {
    return null;
  }
  return detectSelectors(
    "verse numbers",
    labels.map(el => el.parentElement),
    labels,
    doc
  );
}

/**
 * @returns {{source: string, verse: string, label: string, content: string, notes: string} | null} selectors that find
 *   the verses in the current page, or null when the verses could not be identified
 */
function detectVerseSelectors(doc = document) {
  const roots = getVerseRoots(doc);
  if (!roots.length) {
    return null;
  }
  return detectByUsfm(roots, doc) || detectByNumbers(roots, doc);
}

function commonAncestor(a, b) {
  let el = a;
  while (el && !el.contains(b)) {
    el = el.parentElement;
  }
  return el;
}

/**
 * The containers of the versions shown (primary, parallel) - the verse numbers start again from 1 in each one.
 * @returns {Element[]} [primary, parallel]
 */
function getVersionViews({ verse, label }, doc = document) {
  const labels = [...doc.querySelectorAll(`${verse} > ${label}`)];
  const groups = [];
  labels.forEach((el, i) => {
    if (!i || getLabelNumber(el) < getLabelNumber(labels[i - 1])) {
      groups.push([]);
    }
    groups[groups.length - 1].push(el);
  });
  return groups.slice(0, 2).map(g => commonAncestor(g[0].parentElement, g[g.length - 1]));
}

function hasVerseLabels({ verse, label }, doc = document) {
  return !!doc.querySelector(`${verse} > ${label}`);
}

/**
 * the main rules of overrides.css, for the detected selectors
 */
function getFallbackCss({ verse, label, notes }) {
  const hideNotes = notes ? `\n${notes} {\n  display: none !important;\n}` : "";
  return `
${verse} > ${label} {
  cursor: pointer;
  padding: 2px 5px;
  border-radius: 4px;
  border: 2px solid var(--verseNumberBorderColor);
  font-weight: bold;
}
${verse} > ${label}:hover {
  background: var(--verseNumberBackgroundHover);
  border-color: var(--verseNumberBorderColorHover);
}
${verse}.${projected} > ${label} {
  background: var(--verseNumberBackgroundProjected) !important;
  color: var(--verseNumberColorProjected) !important;
}
.focus-lost ${verse}.${projected} > ${label} {
  background: var(--verseNumberBackgroundProjectedFocusLost) !important;
}${hideNotes}`;
}

function useVerseSelectors({ verse, label, content, primaryView, parallelView, notes }) {
  notesSelector = notes;
  verseSelectorMatch = verse;
  verseLabelSelectorMatch = label;
  verseContentSelector = content;
  primaryViewSelector = primaryView;
  parallelViewSelector = parallelView;
}

/**
 * Marks the current chapter for the fallback selectors, again after every chapter render:
 *  - the primary / parallel version containers (their classes are unknown as well)
 *  - the verse numbers, when the verses have no data-usfm (used by getVerseSelector)
 */
function stampVerses() {
  $$(`[${stampedViewAttr}]`).forEach(el => el.removeAttribute(stampedViewAttr));
  const [primary, parallel] = getVersionViews({ verse: verseSelectorMatch, label: verseLabelSelectorMatch });
  if (primary) {
    primary.setAttribute(stampedViewAttr, "primary");
  }
  if (parallel) {
    parallel.setAttribute(stampedViewAttr, "parallel");
  }

  verseNumberAttr = "";
  const labels = $$(`${verseSelectorMatch}:not([data-usfm]) > ${verseLabelSelectorMatch}`);
  if (labels.length) {
    verseNumberAttr = stampedVerseAttr;
    labels.forEach(label => label.parentElement.setAttribute(stampedVerseAttr, getLabelNumber(label)));
  }
}

function restoreVerseSelectors() {
  useVerseSelectors(defaultVerseSelectors);
  verseNumberAttr = "";
  verseSelectorsFallback = null;
  const style = document.getElementById(fallbackStyleId);
  if (style) {
    style.remove();
  }
  console.info("bible.com verse selectors work again");
}

function applyVerseSelectorsFallback(detected) {
  useVerseSelectors({
    ...detected,
    // nothing to hide when no note was found (an empty selector is invalid)
    notes: detected.notes || defaultVerseSelectors.notes,
    primaryView: `[${stampedViewAttr}="primary"]`,
    parallelView: `[${stampedViewAttr}="parallel"]`
  });
  let style = document.getElementById(fallbackStyleId);
  if (!style) {
    style = document.createElement("style");
    style.id = fallbackStyleId;
    document.head.appendChild(style);
  }
  style.textContent = getFallbackCss(detected);

  const changed = !verseSelectorsFallback || verseSelectorsFallback.verse !== detected.verse;
  verseSelectorsFallback = detected;
  if (changed) {
    console.warn(
      "bible.com verse markup changed, the verse selectors need an update (update-selectors skill).\n" +
        "  Using the selectors found by %s for now: %o",
      detected.source,
      detected
    );
  }
}

/**
 * Call after every chapter load: switches to the detected verse selectors when the default ones find
 *   no verses, and back to the default ones once they work again.
 * @returns {Promise<boolean>} true when verse numbers can be clicked (with the default or the detected selectors)
 */
async function checkVerseSelectors(timeout = 3000) {
  const defaults = `${defaultVerseSelectors.verse} > ${defaultVerseSelectors.label}`;
  // the current fallback still matches the new chapter (same deploy) - no need to wait for the defaults
  if (verseSelectorsFallback && !$(defaults) && hasVerseLabels(verseSelectorsFallback)) {
    stampVerses();
    return true;
  }
  if (await waitElement(defaults, timeout, 200)) {
    if (verseSelectorsFallback) {
      restoreVerseSelectors();
    }
    return true;
  }
  const detected = detectVerseSelectors();
  if (!detected) {
    // also a chapter without verses (eg. a book introduction)
    console.info("no verses found on this page");
    return false;
  }
  applyVerseSelectorsFallback(detected);
  stampVerses();
  return true;
}

if (typeof document === "object") {
  // a chapter rendered after the last check: stamp it before the extension handles the click / key
  ["click", "contextmenu", "keydown"].forEach(type =>
    document.addEventListener(type, () => verseSelectorsFallback && stampVerses(), true)
  );
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = { detectVerseSelectors, getVersionViews };
}
