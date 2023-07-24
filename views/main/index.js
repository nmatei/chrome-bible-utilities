//let selectedVerses = {};
let selectedVersesNr = [];
let focusChapter = null;
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
  // $$(".note").forEach(n => {
  //   n.innerHTML = "";
  //   n.className = "";
  // });

  // add spaces after label
  $$(".verse .label").forEach(l => {
    l.innerHTML = l.innerHTML.trim() + " ";
  });
}

function hasParallelView() {
  return !!$(parallelViewSelector);
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
  //console.warn("chapters %o, versesInfo %o", chapters, versesInfo);
  return chapters
    .map(chapter => {
      const verses = versesInfo.filter(verse => verse.verseNr && chapter.parallel === verse.parallel);
      let numbers = verses.map(verse => parseInt(verse.verseNr.trim()));

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

      // console.warn("%o -> grouped %o", numbers, groupedNumbers, verses);
      let baseRef = chapter.content;
      const v1 = verses[0];
      if (v1.chapter) {
        baseRef = baseRef.replace(/\d+\s*$/, v1.chapter);
        //console.info("title chapter changed to %o", baseRef);
      }
      return groupedNumbers ? `${baseRef}:${groupedNumbers}` : "";
    })
    .filter(Boolean);
}

function getOtherChapter(url) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    iframe.onload = function () {
      const doc = iframe.contentWindow.document;
      const verses = [...doc.querySelectorAll(".row .verse")];
      //console.warn("doc", verses);
      // TODO cleanup comments
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
      if (v.closest(parallelViewSelector)) {
        cls = `parallel${separator}`;
        separator = ""; // only first parallel verse will have separator
        parallel = true;
      }
    }
    return {
      verseNr,
      content: v.innerText.substring(verseNr.length) || "",
      parallel,
      cls
    };
  });

  return mergeParagraphs(versesInfo);
}

function addMissingVerses(versesInfo, isParallel) {
  const urlParams = getUrlParams();
  const targetRef = youVersionReferenceMap(urlParams, parseInt(versesInfo[0].verseNr), isParallel);
  const loadUrl = createChapterUrl({
    primary: isParallel ? urlParams.primary : urlParams.parallel,
    book: urlParams.book,
    chapter: targetRef.chapter
  });
  const cache = getCacheVerses(loadUrl);
  if (cache) {
    versesInfo = [
      ...(isParallel ? [] : versesInfo),
      ...versesInfo.map((v, i) => {
        // for multi select
        const targetRef = youVersionReferenceMap(urlParams, parseInt(v.verseNr), isParallel);
        return {
          ...{
            ...cache[targetRef.verse - 1],
            cls: (isParallel ? "" : "parallel") + (i ? "" : " separator"),
            parallel: !isParallel,
            chapter: targetRef.chapter
          }
        };
      }),
      ...(isParallel ? versesInfo : [])
    ];
  }
  return versesInfo;
}

function addVersesFromCache(versesInfo) {
  // will enter only when parallel version is other chapter
  if (!versesInfo.some(v => v.parallel === true)) {
    versesInfo = addMissingVerses(versesInfo, false);
  } else if (!versesInfo.some(v => v.parallel === false)) {
    versesInfo = addMissingVerses(versesInfo, true);
  }
  return versesInfo;
}

function getDisplayText(verses) {
  const parallelEnabled = hasParallelView();
  let versesInfo = getVersesInfo(verses, parallelEnabled);
  let chapters = getTitles();
  const displays = displaySettings;

  if (displays > 1 && parallelEnabled) {
    versesInfo = addVersesFromCache(versesInfo);
  }
  // TODO make it more general/nice
  if (displays !== 3) {
    chapters = chapters.filter(({ parallel }) => displays && parallel === (displays === 2));
    versesInfo = versesInfo.filter(({ parallel }) => displays && parallel === (displays === 2));
  }

  const references = getReferences(chapters, versesInfo);
  const versesContent = versesInfo.map(({ cls, verseNr, content }) => {
    return `<p class="verse ${cls}">
      ${verseNr ? `<sup>${verseNr}</sup>` : ""}
      ${content}
    </p>`;
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

      const label = v.querySelector(`:scope > ${verseLabelSelectorMatch}`);
      return label ? parseInt(label.innerText) : 0;
    })
    .filter(Boolean);
}

function getVerseNumber(verse) {
  const label = verse.querySelector(verseLabelSelectorMatch);
  return label ? label.innerText.trim() * 1 : 1;
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
  const views = [primaryViewSelector, parallelViewSelector];
  if (isParallel) {
    views.reverse();
  }

  let numbers = [verseNumber];

  if (bulkSelect) {
    numbers = getBulkNumbers(verseNumber, isParallel, selectedVersesNr);
  }

  const parallelEnabled = hasParallelView();
  const verses = [];
  const urlParams = isParallel || parallelEnabled ? getUrlParams() : undefined;

  let loadUrl = "";
  numbers.forEach(number => {
    verses.push(...getVerseEls(views[0], number));
    if (isParallel || parallelEnabled) {
      const targetRef = youVersionReferenceMap(urlParams, number, isParallel);
      //console.warn("target reference %o", targetRef);
      if (targetRef.chapter === urlParams.chapter) {
        verses.push(...getVerseEls(views[1], targetRef.verse));
      } else {
        if (!loadUrl) {
          loadUrl = createChapterUrl({
            primary: isParallel ? urlParams.primary : urlParams.parallel,
            book: urlParams.book,
            chapter: targetRef.chapter
          });
          //console.warn("missing %o", isParallel ? "primary" : "parallel", targetRef, loadUrl);
        }
      }
    }
  });

  setFocusChapter(isParallel);

  if (!multiSelect || bulkSelect) {
    deselectAll();
  }

  if (!wasProjected || multiSelect) {
    selectedVersesNr = selectVerses(verses);
  }

  await cacheVersesInfo(loadUrl);

  const selectedVerses = $$(selectedSelector());
  await displayVerses(selectedVerses);
  return selectedVerses;
}

async function selectVersesToProject(e) {
  const target = e.target;
  if (target.matches(verseLabelSelectorMatch)) {
    e.stopPropagation();
    e.preventDefault();

    const multiSelect = e.ctrlKey || e.metaKey; // metaKey for MacOs
    const bulkSelect = e.shiftKey;
    const altKey = e.altKey;

    const verse = target.closest(verseSelectorMatch);
    const verseNumber = getVerseNumber(verse);
    const isParallel = target.closest(parallelViewSelector);
    const wasProjected = altKey ? false : verse.classList.contains(projected);

    await doSelectVerses(verseNumber, !!isParallel, wasProjected, multiSelect, bulkSelect);

    // const parallelEnabled = hasParallelView();
    // const verses = $$(selectedSelector());
    // const versesInfo = getVersesInfo(verses, parallelEnabled);
    // selectedVerses[verseNumber] = versesInfo;
    // console.warn("selectedVerses", selectedVerses);

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
    const view = [primaryViewSelector, parallelViewSelector];

    const next = selectedVersesNr.map(v => v + dir);
    let [primary] = next;
    let parallel;

    const parallelEnabled = hasParallelView();
    if (parallelEnabled) {
      const urlParams = getUrlParams();
      // TODO find 'correct' value for last param
      const targetRef = youVersionReferenceMap(urlParams, primary, focusChapter === "parallel");
      //console.debug("key %o", targetRef);
      if (targetRef.chapter === urlParams.chapter) {
        parallel = targetRef.verse;
      }
    }

    if (focusChapter === "parallel") {
      view.reverse();
    }

    const verses = getVerseEls(view[0], primary);

    if (typeof parallel === "number") {
      verses.push(...getVerseEls(view[1], parallel));
    }

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
  await Promise.any([waitElement(appReadySelector, 5000, 200), waitElement(".bible-reader-sticky-container", 5000, 200)]);

  await cacheBooks();
  //console.info("books", booksCache);

  const versionEl = $(versionSelector());
  versionEl &&
    versionEl.addEventListener(
      "click",
      debounce(async e => {
        if (e.target.closest("a")) {
          console.info("version changed");
          // UI not changed if we don't expand
          await bookArrowExpandAndCollapse();
          await cacheBooks();
        }
      }, 2000)
      // 2 sec to make sure books are reloaded
    );

  document.addEventListener("click", selectVersesToProject);

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

function findBookText(book) {
  book = latinizeText(book.toLowerCase());
  return booksCache.find(e => latinizeText(e.toLowerCase()).includes(book));
}

function findBookEl(book) {
  const bookListItems = getBooks();
  book = latinizeText(book.toLowerCase());
  return bookListItems.find(e => latinizeText(e.innerText.toLowerCase()).includes(book));
}

async function bookArrowExpandAndCollapse() {
  const dropDownArrow = chapterPickerArrow();
  if (dropDownArrow) {
    dropDownArrow.click();
    await sleep(100);
    dropDownArrow.click();
  }
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
