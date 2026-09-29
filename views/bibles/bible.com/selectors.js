const projected = "projected";

const appReadySelector = '[class*="__bible-reader"]';
const titlesSelector = '[class*="__reader"] h1';
const verseSelectorMatch = '[class*="__verse"]';
const verseLabelSelectorMatch = '[class*="__label"]';
const verseContentSelector = '[class*="__content"]';
const primaryViewSelector = '[class*="__chapter"]';
const parallelViewSelector = '.md\\:block [class*="__yv-bible-text"]';
const notesSelector = '[class*="__note"]';
const versionsNameSelector = '.z-docked [id^="headlessui-popover-button"] div';

// local app class
const hideCls = "hide-popovers";

// the book/chapter picker (BibleUsfmPicker) is a headlessui Dialog, not a popover any more
const chapterPickerSelector = 'button[aria-haspopup="dialog"]';
const chapterPickerDialogSelector = '[role="dialog"]';

function chapterPickerArrow() {
  // rendered twice: with the chapter title as text, and as an icon only button ("Books"),
  //   both open the same picker (and both work while hidden by css)
  // only the icon one has an aria-label - match its presence, the value is translated
  const iconButton = $(`${chapterPickerSelector}[aria-label]`);
  if (iconButton) {
    return iconButton;
  }
  const buttons = $$(chapterPickerSelector);
  const titleEl = $(titlesSelector);
  const button = titleEl ? buttons.find(b => b.innerText.trim() === titleEl.innerHTML.trim()) : null;
  return button || buttons[0] || null;
}

function booksSelector() {
  return `${chapterPickerDialogSelector} li > button`;
}

function chaptersSelector() {
  // the chapter grid holds the only links of the picker (next/link => client side navigation)
  return `${chapterPickerDialogSelector} a[href*="/bible/"]`;
}

/**
 * On wide screens the books and the chapter grid are shown side by side, and the grid starts
 *   with the chapters of the current book - so after clicking a book, wait for the grid title.
 * @returns {string} bookName - name of the book the chapter grid is showing
 */
function getChapterGridBook() {
  const chapterEl = $(chaptersSelector());
  const header = chapterEl ? chapterEl.parentElement.previousElementSibling : null;
  const title = header ? $("p", header) : null;
  return title ? title.innerText.trim() : "";
}

function isChapterPickerOpen() {
  return !!$(chapterPickerDialogSelector);
}

/**
 * headlessui closes the dialog on Escape (listener on window), there is no toggle button
 */
function closeChapterPickerDialog() {
  const dialog = $(chapterPickerDialogSelector);
  if (dialog) {
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  }
}

async function openChapter(book, chapter) {
  // a reference past the end of the book (eg. 'Matei 44') has no chapter to click
  chapter = limitChapter(book, chapter, booksCacheObj);

  // if book/chapter already opened, then do not click on it again
  const [title] = getChapterTitles();
  const bookText = findBookText(book, booksCache);
  const ref = getVerseStr({ book: bookText, chapter: chapter });
  if (title === ref) {
    return title;
  }

  const dropDownArrow = chapterPickerArrow();
  if (!dropDownArrow) {
    console.warn("dropDownArrow not present");
    return "";
  }

  // keep the popovers invisible for the whole simulation, including when it fails and we
  //   still have to close the picker - removing the class earlier makes it flash on screen
  document.body.classList.add(hideCls);
  let selected = false;
  try {
    // the picker opens on the book list; when it is already open (eg. a previous attempt
    //   left it that way) reuse it instead of toggling it closed
    let bookEl = findBookEl(book);
    if (!bookEl) {
      dropDownArrow.click();
      bookEl = await waitBook(book);
    }
    if (!bookEl) {
      return "";
    }

    const bookName = bookEl.innerText.trim();
    bookEl.click();
    if (!(await waitChapter(chapter, bookName))) {
      return "";
    }
    const chapterText = selectChapter(chapter, bookName);
    selected = !!chapterText;
    return selected ? bookName + " " + chapterText : "";
  } finally {
    await closeChapterPicker(selected);
    document.body.classList.remove(hideCls);
  }
}

/**
 * The book list is rendered by a lazy loaded chunk (a spinner shows until it arrives),
 *   so a fixed delay misses it the first time the picker is opened.
 * @returns {Promise<HTMLElement|undefined>} bookEl - undefined when the list never rendered
 */
async function waitBook(book, timeout = 500, retryInterval = 50) {
  const endTime = Date.now() + timeout;
  let bookEl = findBookEl(book);
  while (!bookEl && Date.now() < endTime) {
    await backgroundSleep(retryInterval);
    bookEl = findBookEl(book);
  }
  return bookEl;
}

/**
 * Selecting a chapter closes the picker on its own (with a leave transition, the dialog stays in
 *   the DOM meanwhile). Anything else (book not found, chapter list never rendered) leaves it
 *   open, and it has to be closed before it becomes visible again.
 */
async function closeChapterPicker(selected) {
  if (selected) {
    await backgroundSleep(200);
  }
  if (isChapterPickerOpen()) {
    closeChapterPickerDialog();
    await backgroundSleep(250);
  }
}

function selectChapter(chapter, bookName) {
  const chapterEl = getMatchChapter(chapter, bookName);
  if (chapterEl) {
    chapterEl.click();
    return chapterEl.innerText.trim();
  }
  console.info("chapter %o not found", chapter);
  return "";
}

/**
 * The chapter grid re-renders a moment after the book is clicked - a fixed sleep would miss it.
 * @returns {Promise<HTMLElement|null>} chapterEl - null when the grid never showed the book
 */
async function waitChapter(chapter, bookName, timeout = 1000, retryInterval = 50) {
  const endTime = Date.now() + timeout;
  let chapterEl = getMatchChapter(chapter, bookName);
  while (!chapterEl && Date.now() < endTime) {
    await backgroundSleep(retryInterval);
    chapterEl = getMatchChapter(chapter, bookName);
  }
  return chapterEl;
}

function getMatchChapter(chapter, bookName) {
  // the grid still showing another book (eg. the current one) would open the wrong chapter
  //   => don't click anything, let the caller fall back to loading the chapter url
  if (bookName && getChapterGridBook() !== bookName) {
    return null;
  }
  return getChapters().find(e => e.innerText.trim() == chapter) || null;
}

function selectedSelector() {
  return `.${projected}${verseSelectorMatch}`;
}

function getVerseNr(verseEl, labelSelector = verseLabelSelectorMatch) {
  const label = verseEl ? $(`:scope > ${labelSelector}`, verseEl) : null;
  return label ? label.innerText : "";
}

function getVerseContents(verseEl) {
  return $$(verseContentSelector, verseEl);
}

function getVerseSelector(number) {
  // Match single verse (ends with .N) or grouped verse where N is the first in the group (contains .N+)
  return `${verseSelectorMatch}[data-usfm$=".${number}"], ${verseSelectorMatch}[data-usfm*=".${number}+"]`;
}

/**
 * Parses a grouped verse label like "43-47" into { from, to }.
 * Returns null for regular single-verse labels.
 * @param {string} labelText
 * @returns {{ from: number, to: number } | null}
 */
function parseGroupedVerseLabel(labelText) {
  const match = (labelText || "").trim().match(/^(\d+)-(\d+)$/);
  return match ? { from: parseInt(match[1]), to: parseInt(match[2]) } : null;
}

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = { getVerseSelector, parseGroupedVerseLabel };
}

function findLastVerseNumber() {
  const lastVerse = $$(`${verseSelectorMatch} > ${verseLabelSelectorMatch}`)
    .reverse()
    .find(l => l.innerText);
  return lastVerse ? parseInt(lastVerse.innerText) : 1;
}

function getVerseEls(view, number) {
  return $$(getVerseSelector(number), $(view));
}

async function cacheBooks() {
  const primary = getUrlParams()?.primary;
  if (primary) {
    try {
      booksCacheObj = await fetchVersionBooks(primary);
    } catch (e) {
      console.warn("books API failed, falling back to popover", e);
    }
  }
  if (!booksCacheObj.length) {
    console.info("books API did not return results, falling back to UI");
    // fallback: scrape the book picker popover — names only, key left empty
    const arrow = chapterPickerArrow();
    if (arrow) {
      document.body.classList.add(hideCls);
      arrow.click();
      // rendered locally (no backend call), so it shows up fast - poll instead of a fixed
      //   sleep only to not miss it, not to wait for it
      await waitElement(booksSelector(), 1000, 50);
      booksCacheObj = getBooks().map(e => ({
        name: e.innerText.trim()
      }));
      console.info('books', booksCacheObj);
      await closeChapterPicker(false);
      document.body.classList.remove(hideCls);
    }
  }
  booksCache = booksCacheObj.map(b => b.name);
  // logCurrentBookInfo();
}

// Used for developer debugging: logs all chapters of the current book to the console, so you can copy/paste them into a test case.
function logCurrentBookInfo() {
  console.info("booksCacheObj", booksCacheObj);
  const [title] = getChapterTitles();
  const match = getVerseInfo(title);
  const bookName = match?.book || "Geneza";
  const book = booksCacheObj.find(b => b.name === bookName);
  const text = new Array(book?.chapters || 0)
    .fill(0)
    .map((_, i) => bookName + " " + (i + 1))
    .join(", ");

  console.info("All %o Chapters:", bookName);
  console.info(text);
  console.info("- - - - - - - - -");
}

function createChapterUrl({ book, chapter, primary }) {
  return `https://www.bible.com/bible/${primary}/${book}.${chapter}`;
}

/**
 * Url of the chapter a parsed reference points to, reusing the versions from the address bar.
 * @param {*} match - reference info (book name in the current language, chapter)
 * The chapter is capped to the last one of the book, so a reference past its end still opens
 *   a real chapter instead of a 'not found' page.
 * @returns {string|null} url - null when the book can't be resolved,
 *   eg. books cache is empty or was scraped from the popover (names without usfm key)
 */
function createMatchUrl(match) {
  const book = match ? findBookKey(match.book, booksCacheObj) : undefined;
  return book
    ? createChapterNavigationUrl(window.location.href, {
        book,
        chapter: limitChapter(match.book, match.chapter, booksCacheObj)
      })
    : null;
}

function syncParallelLines() {
  if (!hasParallelView()) {
    return;
  }
  const v1 = $(primaryViewSelector);
  const v2 = $(parallelViewSelector);
  const versesSelector = `${verseSelectorMatch} > ${verseLabelSelectorMatch}`;
  const primary = $$(versesSelector, v1).map(l => l.closest(verseSelectorMatch));
  const parallel = $$(versesSelector, v2).map(l => l.closest(verseSelectorMatch));
  if (primary.length !== parallel.length) {
    // TODO find
    //console.info("difference in nr of verses");
    return;
  }
  primary.forEach((v1, i) => {
    const v2 = parallel[i];
    v1.style.marginTop = "0px"; // reset
    v2.style.marginTop = "0px"; // reset
    const diff = v1.offsetTop - v2.offsetTop;
    //console.warn("%o - %o = %o", v1.offsetTop, v2.offsetTop, diff);
    if (diff < 0) {
      v1.style.marginTop = `${diff * -1}px`;
    } else {
      v2.style.marginTop = `${diff}px`;
    }
  });
}
