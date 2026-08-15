#!/usr/bin/env node
/**
 * Validates the bible.com DOM selectors against the pages saved in
 * test/integration/bible.com.content/ (gitignored, and kept out of views/ so `npm run zip`
 * can't ship it). Save them with Ctrl+S, "Webpage, Complete".
 * See the `update-selectors` skill for the full workflow.
 *
 * The selectors are not copied here: views/bibles/bible.com/selectors.js is loaded into a
 * vm sandbox so every constant/function is read straight from the source and the report can
 * never drift from what the extension actually ships.
 *
 *   node scripts/check-selectors.mjs          # or: npm run check-selectors
 *
 * Exits non-zero when a selector that should match finds nothing.
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "test/integration/bible.com.content");
const SELECTORS_JS = path.join(ROOT, "views/bibles/bible.com/selectors.js");

/**
 * Reads the selector values out of selectors.js without duplicating them.
 * Its top level is only `const`/`function` declarations, so running it in a bare context
 * declares everything without executing any function body.
 */
function loadSelectors() {
  const source = fs.readFileSync(SELECTORS_JS, "utf8");
  const context = vm.createContext({ console });
  vm.runInContext(source, context, { filename: SELECTORS_JS });

  // Top-level const/function stay in the context's lexical scope instead of on the global
  // object, so collect the declared names and read them back with one expression.
  const names = [...source.matchAll(/^(?:const|function)\s+(\w+)/gm)].map(m => m[1]);
  return vm.runInContext(`({ ${names.join(", ")} })`, context);
}

const S = loadSelectors();

// What each selector must find, and in which page state it can be validated at all.
//   always          — any saved chapter page
//   parallel        — a page opened with ?parallel=<id> (two versions side by side)
//   books-popover   — saved with the book picker open (the list of Bible books)
//   chapters-popover— saved with the chapter grid open (click the picker, then a book)
const CHECKS = [
  { name: "appReadySelector", selector: S.appReadySelector, min: 1, state: "always" },
  { name: "titlesSelector", selector: S.titlesSelector, min: 1, state: "always" },
  { name: "verseSelectorMatch", selector: S.verseSelectorMatch, min: 10, state: "always" },
  { name: "verseLabelSelectorMatch", selector: S.verseLabelSelectorMatch, min: 10, state: "always" },
  { name: "verseContentSelector", selector: S.verseContentSelector, min: 10, state: "always" },
  { name: "primaryViewSelector", selector: S.primaryViewSelector, min: 1, state: "always" },
  { name: "notesSelector", selector: S.notesSelector, min: 0, state: "always" },
  { name: "versionsNameSelector", selector: S.versionsNameSelector, min: 1, state: "always" },
  { name: "getVerseSelector(1)", selector: S.getVerseSelector(1), min: 1, state: "always" },
  { name: "chapterPickerArrow (candidates)", selector: '.z-docked [id^="headlessui-popover-button"]', min: 1, state: "always" },
  { name: "parallelViewSelector", selector: S.parallelViewSelector, min: 1, state: "parallel" },
  { name: "booksSelector()", selector: S.booksSelector(), min: 30, state: "books-popover" },
  { name: "bookListCancel()", selector: S.bookListCancel(), min: 1, state: "books-popover" },
  { name: "chaptersSelector()", selector: S.chaptersSelector(), min: 1, state: "chapters-popover" }
];

const STATE_HINT = {
  parallel: "save a page opened with ?parallel=<versionId>",
  "books-popover": "save a page with the book picker open",
  "chapters-popover": "save a page with the chapter grid open (picker → click a book)"
};

/** Which page states this capture can validate. */
function detectStates(doc) {
  const items = [...doc.querySelectorAll(".z-popover li a, .z-popover li button")];
  const text = el => (el.textContent || "").trim();
  return {
    always: true,
    parallel: doc.querySelectorAll('[data-testid="chapter-content"]').length > 1,
    "books-popover": items.some(el => text(el) && !/^\d+$/.test(text(el))),
    "chapters-popover": items.some(el => /^\d+$/.test(text(el)))
  };
}

function cssModuleHashes(html) {
  return [...new Set([...html.matchAll(/ChapterContent-module__(\w+)__/g)].map(m => m[1]))];
}

/** CSS files that hardcode bible.com class names — a `^=` there is broken by design. */
function scanStaleCssPatterns() {
  const files = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".css")) {
        files.push(full);
      }
    }
  })(path.join(ROOT, "views"));

  const stale = [];
  for (const file of files) {
    fs.readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        // the CSS-module hash changes on every bible.com build, so ^= can never match
        if (/\[class\^=/.test(line)) {
          stale.push({ file: path.relative(ROOT, file), line: i + 1, text: line.trim() });
        }
      });
  }
  return stale;
}

const pad = (s, n) => String(s).padEnd(n);
let failures = 0;
let skipped = 0;

console.log("bible.com selector check\n");

if (!fs.existsSync(CONTENT_DIR)) {
  console.error(`No capture directory: ${path.relative(ROOT, CONTENT_DIR)}`);
  console.error("Save a bible.com chapter page there with Ctrl+S (Webpage, Complete).");
  process.exit(1);
}

const captures = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith(".html"));

if (!captures.length) {
  console.error(`No *.html captures in ${path.relative(ROOT, CONTENT_DIR)}`);
  console.error("Save a bible.com chapter page there with Ctrl+S (Webpage, Complete).");
  process.exit(1);
}

for (const capture of captures) {
  const html = fs.readFileSync(path.join(CONTENT_DIR, capture), "utf8");
  const { window } = new JSDOM(html); // no scripts, no external resources — static parse only
  const doc = window.document;
  const states = detectStates(doc);

  const available = Object.entries(states)
    .filter(([, on]) => on)
    .map(([name]) => name)
    .join(", ");

  console.log(`── ${capture}`);
  console.log(`   css-module hash: ${cssModuleHashes(html).join(", ") || "none"}`);
  console.log(`   states captured: ${available}\n`);

  for (const check of CHECKS) {
    if (!states[check.state]) {
      skipped++;
      console.log(`   SKIP  ${pad(check.name, 32)} needs ${check.state} — ${STATE_HINT[check.state]}`);
      continue;
    }
    let count;
    try {
      count = doc.querySelectorAll(check.selector).length;
    } catch (e) {
      failures++;
      console.log(`   FAIL  ${pad(check.name, 32)} invalid selector: ${e.message}`);
      continue;
    }
    const ok = count >= check.min;
    if (!ok) failures++;
    console.log(
      `   ${ok ? "ok  " : "FAIL"}  ${pad(check.name, 32)} ${pad(count, 5)} (min ${check.min})  ${check.selector}`
    );
  }
  console.log();
  window.close();
}

const stale = scanStaleCssPatterns();
if (stale.length) {
  failures += stale.length;
  console.log("── stale [class^=…] rules (the CSS-module hash changes every build, use [class*=…])");
  for (const s of stale) {
    console.log(`   FAIL  ${s.file}:${s.line}  ${s.text}`);
  }
  console.log();
}

console.log(`${failures} failed, ${skipped} skipped`);
if (skipped) {
  console.log("Skipped checks are NOT validated — save the missing page states to cover them.");
}
process.exit(failures ? 1 : 0);
