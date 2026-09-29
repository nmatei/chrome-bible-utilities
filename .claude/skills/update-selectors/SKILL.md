---
name: update-selectors
description: Use when bible.com changed its DOM and the extension stopped working — verse selection, book/chapter switching, version names or parallel view. Covers saving a page capture into test/integration/bible.com.content/, running npm run check-selectors against it, mining the saved JS bundles for lazy-rendered markup, and which file each selector lives in.
---

# Update bible.com selectors

Every selector the extension uses against bible.com lives in
`views/bibles/bible.com/selectors.js`. bible.com is a Next.js app whose CSS-module class names
carry a **build hash** (`ChapterContent-module__cat7xG__verse`), so the repo matches on the
stable suffix — `[class*="__verse"]` — never on a prefix. The rest of the page is Tailwind
utility classes, which change freely between deploys.

Captures of the live page are kept in `test/integration/bible.com.content/` — **gitignored**
(each is ~450 KB of HTML plus a `_files/` bundle directory), and deliberately outside `views/`,
because `npm run zip` packs the whole `views/` tree into the Chrome Web Store bundle.

## Save a capture

**Automatically** (preferred) — no manual save needed:

```bash
npm run capture-pages      # node scripts/capture-bible-pages.mjs
node scripts/capture-bible-pages.mjs --version 191 --parallel 1 --ref MAT.5 --abbr VDC --width 1400
```

It drives the installed Chrome headless over the DevTools protocol (`CHROME_PATH` to override),
and writes `auto - <ref> - chapter`, `auto - <ref> - parallel` and
`auto - <ref> - parallel - books dialog open` (`.html` + `_files/` with every js/css bundle the
page loaded, lazy picker chunks included). The dialog is opened with the extension's own
`chapterPickerArrow()` / `booksSelector()` injected from `selectors.js`, so the script **fails**
when those are broken — that is itself the first check. Re-running overwrites the `auto - …`
files; `--parallel ""` skips the parallel captures.

**By hand**, for a state the script doesn't cover (eg. the version popover): in Chrome on the
page `Ctrl+S` → **Webpage, Complete** → save into `test/integration/bible.com.content/`. Save it
*in the state you need to inspect* — the picker lists are rendered only while open, and are
lazy-loaded chunks, so a closed picker is simply absent from the DOM.

States worth capturing, and what each one validates:

| State | Validates |
|---|---|
| A plain chapter | verse / label / content / chapter / note / reader selectors |
| `?parallel=<id>` (two versions) | `parallelViewSelector`, `versionsNameSelector[1]`, `syncParallelLines` |
| **Books dialog open**, wide window (books + chapter grid side by side) | `booksSelector()`, `chaptersSelector()`, `getChapterGridBook()`, `selectChapter()` |
| Version popover open | version switching |

One capture can cover several states at once (e.g. a `?parallel=` page saved with the Books
dialog open covers all three rows) — which is why `SKIP` lines on the other captures are fine
as long as every selector is `ok` in at least one of them. By hand, `Ctrl+S` can't be used while
the dialog is open (it has focus): in DevTools `copy(document.documentElement.outerHTML)` and
paste it into a `.html` file in the capture directory — jsdom only needs the markup.

## Check

```bash
npm run check-selectors    # node scripts/check-selectors.mjs
```

It loads `selectors.js` into a `vm` sandbox — the selectors are read from the source, never
copied — then runs each one over every `*.html` in the capture directory with jsdom, and prints
a match count per selector. Exit code is non-zero on any `FAIL`.

Read the report carefully:

- `ok` — the selector matched at least the expected minimum.
- `FAIL` — zero (or too few) matches; the selector is broken.
- `SKIP` — that capture doesn't contain the page state the selector needs (eg. a plain chapter
  has no open picker). Fine as long as another capture covers it.
- The summary (`0 failed, 13/13 selectors validated (5 per-capture skips)`) counts selectors
  validated in **at least one** capture; anything below `N/N` is listed under
  **NOT validated in any capture** — nothing is proven about those until the state is saved.

It also reports the current CSS-module hash and fails on any `[class^=…]` left in
`views/**/*.css`, which can never match once bible.com rebuilds.

## Live check

For anything that can't be captured (or to confirm a fix without re-saving), paste this in
DevTools on bible.com — it uses the page's own live DOM, with the Books dialog open:

```js
["[class*=\"__bible-reader\"]", "[class*=\"__reader\"] h1", "[class*=\"__verse\"]",
 "[class*=\"__label\"]", "[class*=\"__content\"]", "[class*=\"__chapter\"]",
 ".md\\:block [class*=\"__yv-bible-text\"]",
 ".z-docked [id^=\"headlessui-popover-button\"] div",
 "button[aria-haspopup=\"dialog\"]",
 "[role=\"dialog\"] li > button",
 "[role=\"dialog\"] a[href*=\"/bible/\"]"
].forEach(s => console.log(document.querySelectorAll(s).length, s));
```

## Where selectors live

| File | What |
|---|---|
| `views/bibles/bible.com/selectors.js` | every selector constant and picker/navigation function |
| `views/bibles/bible.com/common.js` | consumers: `getVersionsName`, `getBooks`, `getChapters`, `getTitles`, `cleanUp` |
| `views/bibles/bible.com/overrides.css` | styling injected over bible.com (`__verse`, `__label`, `__note`, `.hide-popovers`) |
| `views/bibles/bible.com/common-overrides.css`, `views/main/actions.css` | more rules keyed on bible.com classes |
| `views/main/index.js` | `hasParallelView`, `findBookEl`, `bookArrowExpandAndCollapse`, `watchLocationChange`, chapter loading |

## Selector rules for this repo

- **`[class*="__part"]`, never `[class^=…]`** — the CSS-module hash changes every bible.com build.
- **Prefer ARIA attributes, `data-testid` and structure over Tailwind chains.** `.w-full .z-popover li button`
  depended on a layout class that could vanish; `aria-haspopup="dialog"`, `role="dialog"` and
  `<a href>` come from the component (headlessui / next/link) and are stable.
- **Never fall back to "the first element"** when a lookup fails. `getMatchChapter` used to
  return `chapters[0]`, which would click the wrong chapter — or the wrong *book*, once the
  selector was widened. Return `null` and let the url fallback handle it.
- Keep selectors usable from `document` — the content script has no framework state to lean on.

## Mining the saved JS bundles

When a list is lazy-rendered and you can't capture it, its markup is often still readable in
the saved `_files/*.js` chunks. Grep for the component name:

```bash
cd "test/integration/bible.com.content/<capture>_files"
grep -l "BibleUsfmPicker" *.js
```

`BibleUsfmPicker` is the button + headlessui `Dialog`; the dialog content
(`BibleUsfmPickerPanel`: book list + chapter grid) is a separate chunk that is only downloaded
once the dialog opens, so it is absent unless the capture was taken in that state. The loader
next to the component names the chunk (`e.A(818840)` → search `818840,` for
`static/chunks/<hash>.js`), and it can be fetched straight from
`https://www.bible.com/_next/static/chunks/<hash>.js` to read the JSX.

## The two navigation paths — why a broken chapter selector is silent

Opening a pinned reference ([`openChapter`](../../../views/bibles/bible.com/selectors.js)) tries:

1. **Simulated clicks, no page load.** `chapterPickerArrow().click()` opens the Books dialog,
   `document.body.classList.add("hide-popovers")` makes it invisible while the script works
   (`.hide-popovers .z-modal { opacity: 0 }` in `overrides.css`), then the book is clicked, the
   script waits until the chapter grid shows that book (`getChapterGridBook()` — on wide screens
   it starts on the *current* book) and `selectChapter()` clicks the chapter link. A failed
   attempt closes the dialog with an `Escape` keydown (`closeChapterPickerDialog()`).
2. **Url + refresh, as backup.** If the title never changes, `waitNewTitles()` times out and
   `index.js` calls `loadChapter(match, true)`; the verse is selected after the reload via
   `checkAutoProject`.

A broken picker selector therefore throws **no error** — everything still works, just with a
full page refresh every time. Symptoms: a `waitNewTitles.timeout` line in the console and a
visible reload when opening a pinned verse. Always verify path 1 explicitly; never conclude
"it works" from the UI alone.

## Update a selector

1. `npm run capture-pages` (or save the broken state by hand, see the table above).
2. `npm run check-selectors` — confirm the `FAIL`, and that the state is no longer `SKIP`.
3. Inspect the real markup in the capture (or the `_files/*.js` chunk) and pick a stable hook.
4. Edit `views/bibles/bible.com/selectors.js`; add a check to `CHECKS` in
   `scripts/check-selectors.mjs` if you introduced a new selector.
5. `npm run check-selectors && npm test`.
6. Reload the unpacked extension on bible.com and confirm **path 1** works — open a pinned
   reference in another book and watch that the page does not reload.
7. **Add a release notes entry.** A selector fix almost always ships as a release — users on
   the store version are broken until it does. Add a user-facing `- [x] 🔄 …` bullet to
   `release-notes.md` (follow the `release-notes` skill: new `## X.Y.Z (soon)` section, or the
   existing one if it matches `package.json`). Frame it as a **feature kept up to date** with
   bible.com, not as a bug: 🔄 + what now works (eg. "🔄 **Up to date with bible.com's new
   Books dialog** — switching book & chapter works without page refresh again"), never the
   selector itself.
