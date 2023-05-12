let selectedVersesNr = [];
let focusChapter = null;
let isLoggedIn = false;
let booksCache;

window.addEventListener("load", () => {
  setTimeout(async () => {
    cleanUp();
    createSettingsActions();
    await loadDisplaySettings();
    await initEvents();
  }, 100);
});

function cleanUp() {
  // remove all notes
  $$(".note").forEach(n => {
    n.innerHTML = "";
    n.className = "";
  });

  // add spaces after label
  $$(".verse .label").forEach(l => {
    l.innerHTML = l.innerHTML.trim() + " ";
  });
}

function hasParallelView() {
  return isLoggedIn && !!$(".parallel-chapter");
}

/**
 * if verse is on multiple line (more paragraphs), merge them in 1 (eg. Mica 5:2)
 * @param versesInfo
 * @returns {*}
 */
function mergeParagraphs(versesInfo) {
  return versesInfo.reduce((verses, verse) => {
    if (verse.verseNr) {
      verses.push(verse);
    } else {
      verses[verses.length - 1].content += " " + verse.content;
    }
    return verses;
  }, []);
}

function getReferences(chapters, versesInfo) {
  return chapters
    .map(chapter => {
      let numbers = versesInfo.filter(verse => verse.verseNr && chapter.parallel === verse.parallel).map(verse => parseInt(verse.verseNr.trim()));

      const groupedNumbers = numbers
        .reduce((acc, n) => {
          const prev = acc[acc.length - 1];
          if (prev && prev[1] + 1 === n) {
            prev[1] = n;
          } else {
            acc.push([n, n]);
          }
          return acc;
        }, [])
        .map(p => (p[0] === p[1] ? p[0] : `${p[0]}-${p[1]}`))
        .join(",");

      return groupedNumbers ? `${chapter.content}:${groupedNumbers}` : "";
    })
    .filter(Boolean);
}

//TODO continue
function getOtherChapter(url) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    iframe.onload = function () {
      const doc = iframe.contentWindow.document;
      const verses = [...doc.querySelectorAll(".row .verse")];
      console.warn("doc", verses);
      const versesInfo = getVersesInfo(verses, false);
      resolve(versesInfo);
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    };
    document.body.appendChild(iframe);
  });
}

function getVersesInfo(verses, showParallel) {
  let separator = " separator";
  let versesInfo = verses.map(v => {
    const verseNr = getVerseNr(v);
    let cls = "";
    let parallel = false;
    if (showParallel) {
      if (v.closest(".parallel-chapter")) {
        cls = `parallel${separator}`;
        separator = ""; // only first parallel verse will have separator
        parallel = true;
      }
    }
    return {
      verseNr,
      content: v.innerText.substring(verseNr.length),
      parallel,
      cls
    };
  });

  return mergeParagraphs(versesInfo);
}

function getDisplayText(verses) {
  const showParallel = hasParallelView();
  let chapters = getTitles();
  let versesInfo = getVersesInfo(verses, showParallel);
  const displays = displaySettings;
  // TODO make it more general/nice
  if (displays !== 3) {
    chapters = chapters.filter(({ parallel }) => displays && parallel === (displays === 2));
    versesInfo = versesInfo.filter(({ parallel }) => displays && parallel === (displays === 2));
  }

  const references = getReferences(chapters, versesInfo);
  const versesContent = versesInfo.map(({ cls, verseNr, content }) => {
    return `<p class="verse ${cls}">${verseNr ? `<sup>${verseNr}</sup>` : ""}${content}</p>`;
  });

  const reference = references.length ? `<h1 class="reference">${references.join(" / ")}</h1> ` : "";
  return reference + versesContent.join("\n");
}

async function printSelectedVerses(verses) {
  cleanUp();
  const text = verses.length ? getDisplayText(verses) : "";
  let tab = projectTab;
  if (text || tab) {
    tab = await getProjectTab();
    projectText(text);
  }
  return tab;
}

function deselectAll() {
  $$(selectedSelector()).forEach(v => {
    v.classList.remove(projected);
  });
}

function selectVerses(verses, deselect) {
  if (deselect === true) {
    deselectAll();
  }
  return verses
    .map(v => {
      v.classList.toggle(projected);

      const label = v.querySelector(":scope > .label");
      return label ? parseInt(label.innerText) : 0;
    })
    .filter(Boolean);
}

function getVerseNumber(verse) {
  const match = Array.from(verse.className.matchAll(/v(?<nr>\d+)/gi))[0];
  if (match) {
    return match.groups.nr * 1;
  }
  return 1;
}

function setFocusChapter(isParallel) {
  const nextFocusChapter = isParallel ? "parallel" : "primary";
  if (nextFocusChapter !== focusChapter) {
    document.body.classList.remove(`focus-${focusChapter}`);
    document.body.classList.add(`focus-${nextFocusChapter}`);
    focusChapter = nextFocusChapter;
  }
}

function getBulkNumbers(verseNumber, isParallel, selectedVersesNr) {
  let numbers = [verseNumber];
  let [primary] = selectedVersesNr;
  if (isParallel) {
    if (selectedVersesNr.length % 2 === 0) {
      primary = selectedVersesNr[selectedVersesNr.length / 2];
    } else {
      // TODO test more cases..
      //console.debug("selectedVersesNr.length", selectedVersesNr.length);
    }
  }
  numbers.push(primary);
  numbers.sort((a, b) => a - b);
  const [first, last] = numbers;
  numbers = new Array(last - first + 1).fill(0).map((n, i) => first + i);
  return numbers;
}

async function doSelectVerses(verseNumber, isParallel, wasProjected, multiSelect, bulkSelect) {
  const focusOrder = ["primary-chapter", "parallel-chapter"];
  if (isParallel) {
    focusOrder.reverse();
  }

  let numbers = [verseNumber];

  if (bulkSelect) {
    numbers = getBulkNumbers(verseNumber, isParallel, selectedVersesNr);
  }

  const isParallelViewEnabled = hasParallelView();
  const selectors = [];
  const urlMatch = isParallel || isParallelViewEnabled ? getUrlMatch(window.location.href) : undefined;
  numbers.forEach(number => {
    selectors.push(getVerseSelector(focusOrder[0], number));
    if (isParallel || isParallelViewEnabled) {
      const parallelNr = mapParallelVerse(number, isParallel, urlMatch);
      if (parallelNr) {
        selectors.push(getVerseSelector(focusOrder[1], parallelNr));
      }
    }
  });

  // TODO cache results...
  // console.time("getOtherChapter");
  // getOtherChapter("https://my.bible.com/bible/143/PSA.1.НРП").then(v => {
  //   console.info("verses info", v);
  //   console.timeEnd("getOtherChapter");
  // });

  const verses = $$(selectors.join(","));

  setFocusChapter(isParallel);

  if (!multiSelect || bulkSelect) {
    deselectAll();
  }

  if (!wasProjected || multiSelect) {
    selectedVersesNr = selectVerses(verses);
  }

  const selectedVerses = $$(selectedSelector());
  await displayVerses(selectedVerses);
  return selectedVerses;
}

async function selectVersesToProject(e) {
  const target = e.target;
  if (target.matches(".verse .label")) {
    e.stopPropagation();
    e.preventDefault();

    const multiSelect = e.ctrlKey || e.metaKey; // metaKey for MacOs
    const bulkSelect = e.shiftKey;
    const altKey = e.altKey;

    const verse = target.closest(".verse");
    const verseNumber = getVerseNumber(verse);
    const isParallel = target.closest(".parallel-chapter");
    const wasProjected = altKey ? false : verse.classList.contains(projected);

    await doSelectVerses(verseNumber, !!isParallel, wasProjected, multiSelect, bulkSelect);

    if (altKey) {
      await bringTabToFront();
    }
  }
}

async function displayVerses(verses) {
  return printSelectedVerses(verses);
}

async function selectByKeys(key) {
  let dir = 0;
  switch (key) {
    case "Escape": {
      deselectAll();
      await displayVerses([]);
      return;
    }
    case "ArrowLeft":
    case "ArrowUp": {
      dir = -1;
      break;
    }
    case "ArrowRight":
    case "ArrowDown": {
      dir = 1;
      break;
    }
  }

  if (dir) {
    const focusOrder = ["primary-chapter", "parallel-chapter"];

    const next = selectedVersesNr.map(v => v + dir);
    let [primary] = next;
    let parallel;

    const isParallelViewEnabled = hasParallelView();
    if (isParallelViewEnabled) {
      const urlMatch = getUrlMatch(window.location.href);
      parallel = mapParallelVerse(primary, false, urlMatch);
    }

    if (!parallel && focusChapter === "parallel") {
      focusOrder.reverse();
    }

    const selectors = [getVerseSelector(focusOrder[0], primary)];

    if (parallel) {
      selectors.push(getVerseSelector(focusOrder[1], parallel));
    }

    const verses = $$(selectors.join(","));
    if (verses.length) {
      selectedVersesNr = next;
    } else {
      return;
    }
    selectVerses(verses, true);
    await displayVerses(verses);
    const focusEl = focusChapter === "primary" ? verses[0] : verses[1] || verses[0];
    if (focusEl) {
      setTimeout(() => {
        // focusEl.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        // focusEl.scrollIntoViewIfNeeded(false);
        focusEl.scrollIntoViewIfNeeded(true);
      }, 600);
    }
  }
}

async function waitBooksElements() {
  if (isLoggedIn) {
    await waitElement(booksSelector(), 5000);
  } else {
    const arrow = chapterPickerArrow();
    if (arrow) {
      arrow.click();
      // works only after 'first' expand
      await waitElement(booksSelector(), 5000);
      const cancel = await waitElement(notLoggedInBookListCancel(), 500);
      if (cancel) {
        cancel.click();
      }
    }
  }
}

function cacheBooks() {
  booksCache = getBooks().map(e => e.innerText);
}

async function initEvents() {
  const app = await Promise.any([waitElement("#react-app-Bible", 5000, 200), waitElement(".bible-reader-sticky-container", 5000, 200)]);

  if (app && app.id === "react-app-Bible") {
    isLoggedIn = true;
  } else {
    console.info("user not loggedIn", app);
  }

  await waitBooksElements();
  cacheBooks();

  if (app) {
    if (isLoggedIn) {
      improveSearch();

      $(versionSelector()).addEventListener(
        "click",
        debounce(e => {
          if (e.target.closest("a")) {
            console.info("version changed");
            cacheBooks();
          }
        }, 5000)
      );
    }

    app.addEventListener("click", selectVersesToProject);

    document.addEventListener("keydown", e => {
      if (!e.target.matches("input,textarea")) {
        selectByKeys(e.key);
      }
    });

    window.addEventListener("blur", () => {
      document.body.classList.add("focus-lost");
    });
    window.addEventListener("focus", () => {
      document.body.classList.remove("focus-lost");
    });

    window.addEventListener("resize", debounce(syncParallelLines, 200));

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case "tabkeydown": {
          selectByKeys(request.payload);
          sendResponse({ status: "keydown" });
          break;
        }
        case "windowRemoved": {
          deselectAll();
          projectTab = null;
          sendResponse({ status: 200 });
          break;
        }
      }
    });
  }
}

function syncParallelLines() {
  //console.warn("syncParallelLines");
  if (!hasParallelView()) {
    return;
  }
  const primary = $$(".row .primary-chapter .verse > .label").map(l => l.closest(".verse"));
  const parallel = $$(".row .parallel-chapter .verse > .label").map(l => l.closest(".verse"));
  if (primary.length !== parallel.length) {
    console.info("difference in nr of verses");
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

async function improveSearch() {
  const searchInput = await waitElement(".chapter-picker-container input", 5000);
  if (!searchInput) {
    console.info("searchInput not found");
    return;
  }
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const value = e.target.value;
      const match = getVerseInfo(value);
      if (match) {
        setTimeout(async () => {
          await selectChapter(match.chapter);
          await waitAndSelectVerse(match);
        }, 10);
      }
    }
  });
}

function findBookText(book) {
  book = latinizeText(book.toLowerCase());
  return booksCache.find(e => latinizeText(e.toLowerCase()).includes(book));
}

function findBookEl(book) {
  const bookListItems = getBooks();
  book = latinizeText(book.toLowerCase());
  return bookListItems.find(e => latinizeText(e.innerText.toLowerCase()).includes(book));
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
      dropDownArrow.click();
      //console.debug("second try of search bookEl", bookEl);
    } else {
      console.warn("dropDownArrow not present");
    }
  }
  if (bookEl) {
    bookEl.click();
    result = bookEl.innerText;
    result += " " + (await selectChapter(chapter));
    dropDownArrow.click();
  }
  return result;
}

async function getMatchChapter(chapter) {
  if (!isLoggedIn) {
    await waitElement(chaptersSelector(), 1000);
  }
  const chapters = getChapters();
  let chapterEl = chapters.find(e => e.innerText == chapter);
  if (!chapterEl) {
    chapterEl = chapters[0];
  }
  return chapterEl;
}

async function selectChapter(chapter) {
  const chapterEl = await getMatchChapter(chapter);
  const activeEl = chapterEl.querySelector("li");
  activeEl && activeEl.classList.add("active");
  chapterEl.click();
  return chapterEl.innerText;
}

async function waitAndSelectVerse(match, title) {
  const verse = match.verse;
  const [chapter] = getChapterTitles();
  const changed = chapter === title || (await waitNewTitles());
  syncParallelLines();
  if (verse && changed) {
    const selectedVerses = await doSelectVerses(parseInt(verse), false, false, false);
    if (selectedVerses && selectedVerses.length) {
      selectedVerses[0].scrollIntoViewIfNeeded(true);
      return true;
    }
  }
  return false;
}

/**
 * wait until chapter is loaded then select verse
 * @param timeout
 * @returns {Promise<Boolean>} - changed - true, expired - false
 */
function waitNewTitles(timeout = 10000) {
  const oldChapters = getChapterTitles();
  const endTime = Date.now() + timeout;
  return new Promise(resolve => {
    const refreshIntervalId = setInterval(() => {
      const chapters = getChapterTitles();
      const expired = endTime < Date.now();
      if (expired || oldChapters.every((c, i) => c !== chapters[i])) {
        clearInterval(refreshIntervalId);
        setTimeout(() => {
          if (expired) {
            console.info("waitNewTitles.timeout", oldChapters, chapters);
          }
          resolve(!expired);
        }, 200);
      }
    }, 300);
  });
}

// TODO https://www.bible.com/bible/111/GEN.2.NIV
//  select v3 => error if not logged in
//    verses[verses.length - 1].content += " " + verse.content;
//    Cannot read properties of undefined (reading 'content')

// TODO https://www.bible.com/bible/111/GEN.1.NIV
//  can't select verses if not logged in
