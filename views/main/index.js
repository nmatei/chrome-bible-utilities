const projected = "projected";
let selectedVersesNr = [];
let focusChapter = null;
let isLoggedIn = false;

window.addEventListener("load", () => {
  setTimeout(() => {
    cleanUp();
    createSettingsActions();
    initEvents();
  }, 100);
});

function getVerseSelector(focusOrder, number) {
  if (isLoggedIn) {
    return `.row .${focusOrder} .verse.v${number}`;
  }
  return `.chapter .p .verse.v${number}`;
}

function cleanUp() {
  // remove all notes
  document.querySelectorAll(".note").forEach(n => {
    n.innerHTML = "";
    n.className = "";
  });

  // add spaces after label
  document.querySelectorAll(".verse .label").forEach(l => {
    l.innerHTML = l.innerHTML.trim() + " ";
  });
}

function hasParallelView() {
  return isLoggedIn && !!document.querySelector(".parallel-chapter");
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
    .map((c, i) => {
      const numbers = versesInfo.filter(v => v.verseNr && (i ? v.parallel : !v.parallel)).map(v => parseInt(v.verseNr.trim()));

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

      return groupedNumbers ? `${c}:${groupedNumbers}` : "";
    })
    .filter(Boolean);
}

function getDisplayText(verses) {
  let chapters = getChapterTitles();
  let selectedVerses = [...verses];
  const showParallel = hasParallelView();
  let separator = " separator";
  let versesInfo = selectedVerses.map(v => {
    const label = v.querySelector(":scope > .label");
    const verseNr = label ? label.innerText : "";
    let cls = "";
    let parallel = false;
    if (showParallel) {
      if (v.closest(".parallel-chapter")) {
        cls = `parallel${separator}`;
        separator = ""; // only first well be separator
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

  versesInfo = mergeParagraphs(versesInfo);

  const references = getReferences(chapters, versesInfo);

  const versesContent = versesInfo.map(({ cls, verseNr, content }) => {
    return `<p class="verse ${cls}">${verseNr ? `<sup>${verseNr}</sup>` : ""}${content}</p>`;
  });

  return `<h1 class="reference">${references.join(" / ")}</h1>` + versesContent.join("\n");
}

function printSelectedVerses(tab, verses) {
  cleanUp();
  const text = verses.length ? getDisplayText(verses) : "";
  projectText(text);
}

function deselectAll() {
  document.querySelectorAll(`.verse.${projected}`).forEach(v => {
    v.classList.remove(projected);
  });
}

function selectVerses(verses, deselect) {
  if (deselect === true) {
    deselectAll();
  }
  return [...verses]
    .map(v => {
      v.classList.toggle(projected);

      const label = v.querySelector(":scope > .label");
      return label ? parseInt(label.innerText) : 0;
    })
    .filter(Boolean);
}

// TODO make it more generic
function mapParallelVerse(nr, isParallel) {
  const match = Array.from(window.location.href.matchAll(/(?<primary>\d+)\/(?<book>\w+)\.(?<chapter>\d+)\.(.+)\?parallel\=(?<parallel>\d+)/gi))[0];
  if (match) {
    // console.debug("groups", match.groups);
    let { primary, book, chapter, parallel } = match.groups;
    primary = parseInt(primary);
    parallel = parseInt(parallel);
    chapter = parseInt(chapter);

    const primaryVersion = BibleVersionsMappings[primary];
    const parallelVersion = BibleVersionsMappings[parallel];
    if (primaryVersion || parallelVersion) {
      let substract = 0,
        add = 0;
      if (primaryVersion) {
        substract = getDiffMapping(primaryVersion.mapping, book, chapter, isParallel);
      }
      if (parallelVersion) {
        add = getDiffMapping(parallelVersion.mapping, book, chapter, isParallel);
      }
      if (typeof add === "object" || typeof substract === "object") {
        if (typeof add === typeof substract) {
          if (add.add_chapters === substract.add_chapters) {
            return nr + add.add_verses - substract.add_verses;
          }
        }
        // can't print from different chapters for now
        return 0;
      }
      const diff = add - substract;
      return nr + diff;
    }
  }
  return nr;
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
  numbers.forEach(number => {
    selectors.push(getVerseSelector(focusOrder[0], number));
    if (isParallel || isParallelViewEnabled) {
      const parallelNr = mapParallelVerse(number, isParallel);
      if (parallelNr) {
        selectors.push(getVerseSelector(focusOrder[1], parallelNr));
      }
    }
  });

  const verses = document.querySelectorAll(selectors.join(","));

  setFocusChapter(isParallel);

  if (!multiSelect || bulkSelect) {
    deselectAll();
  }

  if (!wasProjected || multiSelect) {
    selectedVersesNr = selectVerses(verses);
  }

  const selectedVerses = document.querySelectorAll(`.verse.${projected}`);
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
      document.body.classList.add("focus-lost");
      return;
    }
  }
  document.body.classList.remove("focus-lost");
}

async function displayVerses(verses) {
  const tab = await getProjectTab();
  printSelectedVerses(tab, verses);
  return tab;
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
      parallel = mapParallelVerse(primary, false);
    }

    if (!parallel && focusChapter === "parallel") {
      focusOrder.reverse();
    }

    const selectors = [getVerseSelector(focusOrder[0], primary)];

    if (parallel) {
      selectors.push(getVerseSelector(focusOrder[1], parallel));
    }

    const verses = document.querySelectorAll(selectors.join(","));
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

async function initEvents() {
  const app = await Promise.any([waitElement("#react-app-Bible", 5000, 200), waitElement(".bible-reader-sticky-container", 5000, 200)]);
  if (app && app.id === "react-app-Bible") {
    isLoggedIn = true;
  } else {
    console.info("user not loggedIn", app);
  }
  if (app) {
    if (isLoggedIn) {
      improveSearch();
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

/**

 // TODO sync verses in same 'line'
 var v = 39
 var verses = document.querySelectorAll(`.row .primary-chapter .verse.v${v}, .row .parallel-chapter .verse.v${v}`);
 console.info(verses[0].offsetTop, verses[1].offsetTop)
 var primary = document.querySelector('.primary-chapter');
 primary.style.paddingTop = `${verses[1].offsetTop - verses[0].offsetTop - 0 + primary.style.paddingTop.replace('px', '') * 1}px`

 */

async function improveSearch() {
  const searchInput = await waitElement(".chapter-picker-container input", 5000);
  if (!searchInput) {
    console.warn("searchInput not found");
    return;
  }
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const value = e.target.value;
      const numbersMatch = matchNumbers(value);
      if (numbersMatch) {
        setTimeout(async () => {
          selectChapter(numbersMatch[0]);
          if (numbersMatch.length > 1) {
            waitAndSelectVerse(numbersMatch[1]);
          }
        }, 200);
      }
    }
  });
}

function openChapter(book, chapter) {
  book = book.toLowerCase();
  let result = "";
  const bookListItems = document.querySelectorAll(".book-list li");
  const bookEl = [...bookListItems].find(e => e.innerText.toLowerCase().includes(book));
  if (bookEl) {
    bookEl.click();
    result = bookEl.innerText;
    result += " " + selectChapter(chapter);
    document.querySelector(".dropdown-arrow-container").click();
  }
  return result;
}

function selectChapter(chapter) {
  const chapters = document.querySelectorAll(".chapter-picker-modal .chapter-container .chapter-list a");
  let chapterEl = [...chapters].find(e => e.innerText == chapter);
  if (!chapterEl) {
    chapterEl = chapters[0];
  }
  chapterEl.querySelector("li").classList.add("active");
  chapterEl.click();
  return chapterEl.innerText;
}

async function waitAndSelectVerse(verse) {
  const changed = await waitNewTitles();
  if (changed) {
    const selectedVerses = await doSelectVerses(parseInt(verse), false, false, false);
    if (selectedVerses && selectedVerses.length) {
      selectedVerses[0].scrollIntoViewIfNeeded(true);
    }
  }
}

function getChapterTitles() {
  return [...document.querySelectorAll(".reader h1")].map(h => h.innerHTML.trim());
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
