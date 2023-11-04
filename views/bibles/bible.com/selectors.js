const projected = "projected";

const appReadySelector = '[class^="ChapterContent_bible-reader"]';
const titlesSelector = '[class^="ChapterContent_reader"] h1';
const verseSelectorMatch = '[class^="ChapterContent_verse"]';
const verseLabelSelectorMatch = '[class^="ChapterContent_label"]';
const verseContentSelector = '[class^="ChapterContent_content"]';
const primaryViewSelector = '[class^="ChapterContent_chapter"]';
const parallelViewSelector = '.md\\:block [class^="ChapterContent_yv-bible-text"]';
const notesSelector = '[class^="ChapterContent_note"]';

function chapterPickerArrow() {
  const title = $(titlesSelector).innerHTML;
  const buttons = $$('.z-docked [id^="headlessui-popover-button"]');
  return buttons.find(b => b.innerText === title);
}

function versionSelector() {
  //TODO
  return ".version-list";
}

function bookListCancel() {
  return ".z-popover .justify-center button";
}

function booksSelector() {
  return ".w-full .z-popover li button";
}

function chaptersSelector() {
  return ".z-popover li a";
}

async function openChapter(book, chapter) {
  let result = "";
  let bookEl = findBookEl(book);
  const dropDownArrow = chapterPickerArrow();
  if (!bookEl) {
    // fixing search one single book
    // then and click outside => will remove all 'books li' from DOM
    if (dropDownArrow) {
      dropDownArrow.click();
      await sleep(100);
      bookEl = findBookEl(book);
      //console.warn("bookEl", bookEl);

      if (bookEl) {
        bookEl.click();
        result = bookEl.innerText;
        await sleep(200);
        result += " " + (await selectChapter(chapter));
      }

      //console.warn("bookEl", bookEl, result);
      //dropDownArrow.click();
    } else {
      console.warn("dropDownArrow not present");
    }
  }
  return result;
}

async function selectChapter(chapter) {
  const chapterEl = await getMatchChapter(chapter);
  if (chapterEl) {
    const activeEl = chapterEl.querySelector("li");
    activeEl && activeEl.classList.add("active");
    chapterEl.click();
    return chapterEl.innerText;
  }
  console.info("chapter %o not found", chapter);
  return "";
}

async function getMatchChapter(chapter) {
  const chapters = getChapters();
  let chapterEl = chapters.find(e => e.innerText == chapter);
  if (!chapterEl) {
    chapterEl = chapters[0];
  }
  return chapterEl;
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
  return `${verseSelectorMatch}[data-usfm$=".${number}"]`;
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
  const arrow = chapterPickerArrow();
  if (arrow) {
    arrow.click();
    await sleep(200);
    booksCache = getBooks().map(e => e.innerText);
    const cancel = await waitElement(bookListCancel(), 500);
    if (cancel) {
      cancel.click();
    }
  }
}

function createChapterUrl({ book, chapter, primary }) {
  return `https://www.bible.com/bible/${primary}/${book}.${chapter}`;
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
