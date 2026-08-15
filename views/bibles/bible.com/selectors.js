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

function chapterPickerArrow() {
  const buttons = $$('.z-docked [id^="headlessui-popover-button"]');
  const titleEl = $(titlesSelector);
  const button = titleEl ? buttons.find(b => b.innerText === titleEl.innerHTML) : null;
  // the version & reader settings buttons render their content in a <div>,
  //   the book/chapter picker is the only one with the title as direct text
  return button || buttons.find(b => !$(":scope > div", b)) || null;
}

function bookListCancel() {
  return ".z-popover .justify-center button";
}

function booksSelector() {
  return '.z-popover li button[data-testid="chapter"]';
}

function chaptersSelector() {
  // chapters used to be <a>, the current picker (BibleUsfmPickerChapter) renders <button>
  return ".z-popover li a, .z-popover li button";
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

    // read the name first, clicking it swaps the list and detaches the element
    const bookName = bookEl.innerText;
    bookEl.click();
    if (!(await waitChapter(chapter))) {
      return "";
    }
    const chapterText = selectChapter(chapter);
    selected = !!chapterText;
    return selected ? bookName + " " + chapterText : "";
  } finally {
    await closeChapterPicker(dropDownArrow, selected);
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
 * Selecting a chapter closes the picker on its own, but with a leave transition - toggling it
 *   in that window would reopen it. Anything else (book not found, chapter list never rendered)
 *   leaves it open, and it has to be closed before it becomes visible again.
 */
async function closeChapterPicker(dropDownArrow, selected) {
  if (selected) {
    await backgroundSleep(200);
  }
  if ($(".z-popover")) {
    dropDownArrow.click();
    await backgroundSleep(100);
  }
}

function selectChapter(chapter) {
  const chapterEl = getMatchChapter(chapter);
  if (chapterEl) {
    const activeEl = chapterEl.closest("li");
    activeEl && activeEl.classList.add("active");
    chapterEl.click();
    return chapterEl.innerText;
  }
  console.info("chapter %o not found", chapter);
  return "";
}

/**
 * The chapter list is rendered by a lazy loaded chunk, so it shows up a moment after the book
 *   is clicked (a spinner until then) - a fixed sleep would miss it on the first open.
 * @returns {Promise<HTMLElement|null>} chapterEl - null when the list never rendered
 */
async function waitChapter(chapter, timeout = 1000, retryInterval = 50) {
  const endTime = Date.now() + timeout;
  let chapterEl = getMatchChapter(chapter);
  while (!chapterEl && Date.now() < endTime) {
    await backgroundSleep(retryInterval);
    chapterEl = getMatchChapter(chapter);
  }
  return chapterEl;
}

function getMatchChapter(chapter) {
  // chapter items are numbers, so nothing matching means the picker is still on the book list
  //   => don't click anything, let the caller fall back to loading the chapter url
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
    console.info("books API did not return results, falling back to popover");
    // fallback: scrape the book picker popover — names only, key left empty
    const arrow = chapterPickerArrow();
    if (arrow) {
      document.body.classList.add(hideCls);
      arrow.click();
      // rendered locally (no backend call), so it shows up fast - poll instead of a fixed
      //   sleep only to not miss it, not to wait for it
      await waitElement(booksSelector(), 1000, 50);
      booksCacheObj = getBooks().map(e => ({
        name: e.innerText
      }));
      const cancel = await waitElement(bookListCancel(), 500);
      if (cancel) {
        cancel.click();
      }
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
