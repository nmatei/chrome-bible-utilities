//let selectedVerses = {};
let selectedVersesNr = [];
let focusChapter = null;
let booksCache = [];

window.addEventListener("load", () => {
  setTimeout(async () => {
    await createSettingsActions();
    await loadDisplaySettings();
    await initEvents();
    makeVerseFocusable();
    syncParallelLines();
    await checkAutoProject();
  }, 100);
});

function makeVerseFocusable() {
  // TODO extract selector
  const versesSelector = `${verseSelectorMatch} > ${verseLabelSelectorMatch}`;
  $$(versesSelector).forEach(label => {
    label.tabIndex = 0;
    // TODO make them selectable on enter...
  });
}

function hasParallelView() {
  return !!$(parallelViewSelector);
}

/**
 * if verse is on multiple line (more paragraphs), merge them in 1 (eg. Mica 5:2)
 * @param versesInfo
 * @returns {array} verses
 */
function mergeParagraphs(versesInfo) {
  return versesInfo.reduce((verses, v) => {
    const prev = verses[verses.length - 1];
    if (v.verseNr) {
      if (prev && prev.parallel === v.parallel && prev.verseNr === v.verseNr) {
        // fixing the case where some verses are 2 times
        // https://www.bible.com/bible/191/PSA.23.VDC?parallel=143
        prev.content = v.content;
      } else {
        verses.push(v);
      }
    } else {
      prev.content += " " + v.content;
    }
    return verses;
  }, []);
}

function getReferences(chapters, versesInfo) {
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

      let baseRef = chapter.content;
      const v1 = verses[0];
      if (v1 && v1.chapter) {
        baseRef = baseRef.replace(/\d+\s*$/, v1.chapter);
        //console.info("title chapter changed to %o", baseRef);
      }
      return groupedNumbers
        ? `${chapter.version ? `<span class="version">${chapter.version}</span> ` : ""}${baseRef}:${groupedNumbers}`
        : "";
    })
    .filter(Boolean);
}

// TODO https://stackoverflow.com/questions/15532791/getting-around-x-frame-options-deny-in-a-chrome-extension
async function getOtherChapter(url, ref) {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    iframe.onload = function () {
      try {
        const doc = iframe.contentWindow.document;
        cleanUp(doc);
        const verses = [...doc.querySelectorAll(`${verseSelectorMatch}`)];
        const versesInfo = getVersesInfo(verses, false);
        resolve(versesInfo);
      } catch (e) {
        console.debug("read iframe error", e);
        reject("Could not load");
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    };
    document.body.appendChild(iframe);
  });
}

function getVersesInfo(verses, showParallel, labelSelector) {
  let separator = " separator";
  let versesInfo = verses.map(v => {
    const verseNr = getVerseNr(v, labelSelector);
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
      ...versesInfo
        .map((v, i) => {
          // for multi select
          const targetRef = youVersionReferenceMap(urlParams, parseInt(v.verseNr), isParallel);
          const element = cache[Math.max(0, targetRef.verse - 1)];
          if (element) {
            return {
              ...{
                ...element,
                cls: (isParallel ? "" : "parallel") + (i ? "" : " separator"),
                parallel: !isParallel,
                chapter: targetRef.chapter
              }
            };
          } else {
            // TODO Iosua 6:1
            // https://www.bible.com/bible/191/JOS.6.VDC?parallel=201
            console.log("!ref not found", targetRef);
          }
        })
        .filter(Boolean),
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

function getDisplayText(verses, displays) {
  const parallelEnabled = hasParallelView();
  let versesInfo = getVersesInfo(verses, parallelEnabled);
  let chapters = getTitles();

  if ((displays === 1 || displays === 3) && parallelEnabled) {
    versesInfo = addVersesFromCache(versesInfo);
  }
  if (displays !== 3) {
    chapters = chapters.filter(({ parallel }) => displays && parallel === (displays === 1));
    versesInfo = versesInfo.filter(({ parallel }) => displays && parallel === (displays === 1));
  }

  const references = getReferences(chapters, versesInfo);
  const versesContent = versesInfo.map(
    ({ cls, verseNr, content }) =>
      `<p class="verse ${cls}">${verseNr ? `<sup>${verseNr}</sup>&nbsp;` : ""}${content}</p>`
  );

  const reference = references.length ? `<h1 class="reference">${references.join(" ")}</h1> ` : "";
  return reference + versesContent.join("\n");
}

async function printSelectedVerses(verses) {
  const [display1, display2] = displaySettings;
  const text = display1 && verses.length ? getDisplayText(verses, display1) : "";

  let parallelText = display2 ? text : "";
  if (display2 !== display1) {
    parallelText = display2 && verses.length ? getDisplayText(verses, display2) : "";
  }
  if (text || parallelText) {
    // create projector windows first
    await getProjectTab();
  }
  projectText(text, false, 1);
  projectText(parallelText, false, 2);
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
  let [primary] = selectedVersesNr;
  if (isParallel) {
    if (selectedVersesNr.length % 2 === 0) {
      primary = selectedVersesNr[selectedVersesNr.length / 2];
    } else {
      // TODO test more cases..
      //console.debug("selectedVersesNr.length", selectedVersesNr.length);
    }
  }
  return fillNumbers(verseNumber, primary);
}

/**
 *
 * @param {number} number - verse number
 * @param {string} view - (primaryViewSelector or parallelViewSelector)
 * @returns {*}
 */
function getVersesContent(number, view = primaryViewSelector) {
  const verses = getVerseEls(view, number);
  return getVersesInfo(verses, false);
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

  let ref;
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
          ref = {
            primary: isParallel ? urlParams.primary : urlParams.parallel,
            book: urlParams.book,
            chapter: targetRef.chapter
          };
          loadUrl = createChapterUrl(ref);
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

  await cacheVersesInfo(loadUrl, ref);

  const selectedVerses = $$(selectedSelector());
  await displayVerses(selectedVerses);
  return selectedVerses;
}

function showVerseContextMenu(e) {
  const target = e.target;
  const verse = target.closest(verseSelectorMatch);
  const verseNumber = getVerseNumber(verse);
  // TODO check if it's parallel
  //const isParallel = target.closest(parallelViewSelector);

  const actions = [
    {
      text: "Add to list & project",
      icon: icons.bringToFront,
      handler: () => {
        onReferenceRequest({ payload: verseNumber, shiftKey: true, altKey: true });
      }
    },
    {
      text: "Add to list",
      icon: icons.favorite,
      handler: () => {
        onReferenceRequest({ payload: verseNumber, project: false });
      }
    }
  ];
  const menu = getContextMenu(actions);
  showByCursor(menu, e);
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
  } else {
    return false;
  }
}

function onReferenceRequest(request) {
  // make sure pin box is visible
  showVersesBox();

  const input = $("#pin-add-verse");
  input.value = request.payload;
  onReferenceSubmit();
  const focused = getFocusReference();
  if (focused && request.project !== false) {
    openPinReference(focused).then(async ({ match }) => {
      focused.classList.remove("focus");
      if (request.shiftKey && match && match.to) {
        await doSelectVerses(match.to, false, false, false, true);
        if (request.altKey) {
          await bringTabToFront();
        }
      }
    });
  }
}

async function initEvents() {
  await Promise.any([
    waitElement(appReadySelector, 5000, 200),
    waitElement(".bible-reader-sticky-container", 5000, 200)
  ]);

  await cacheBooks();
  if (booksCache.length === 0) {
    console.info("loading books again");
    setTimeout(async () => {
      await cacheBooks();
      console.info("second try to read books", booksCache);
    }, 2000);
  }

  const versionEl = $(versionSelector());
  versionEl &&
    versionEl.addEventListener(
      "click",
      debounce(async e => {
        if (e.target.closest("a")) {
          // console.info("version changed");
          // UI not changed if we don't expand
          await bookArrowExpandAndCollapse();
          await cacheBooks();
        }
      }, 2000)
      // 2 sec to make sure books are reloaded
    );

  document.addEventListener(
    "click",
    async e => {
      if (e.detail !== 0) {
        document.body.classList.remove("key-focus");
      }
      await selectVersesToProject(e);
    },
    true
  );

  document.addEventListener("contextmenu", e => {
    if (e.target.matches(verseLabelSelectorMatch)) {
      e.preventDefault();
      showVerseContextMenu(e);
    }
  });

  document.addEventListener("keydown", async e => {
    const target = e.target;
    if (e.key === "Tab") {
      document.body.classList.add("key-focus");
    } else if (!target.matches("input,textarea") || (target.matches("#pin-add-verse") && !target.value)) {
      // - allow navigation using keys when focus is on input but empty
      const consumed = await selectByKeys(e.key);
      if (consumed === false) {
        if (e.key === "Enter") {
          await selectVersesToProject(e);
        } else if (!(e.ctrlKey || e.metaKey) && !["CapsLock", "Shift", "Control", " "].some(k => k === e.key)) {
          // TODO see how to use it as private var from 'actions'
          const versesBox = $("#verses-text-box");
          if (versesBox && !versesBox.classList.contains("hide-view")) {
            const search = $("#pin-add-verse");
            search.focus();
          }
        }
      }
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
        closeProjectTab(request.payload.index);
        sendResponse({ status: 200 });
        break;
      }
      case "referencerequest": {
        onReferenceRequest(request);
        sendResponse({ status: 200 });
        break;
      }
      // case "install": {
      //   showNewVersionBadge();
      //   sendResponse({ status: 200 });
      //   break;
      // }
    }
  });
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

async function waitAndSelectVerse(match, title, project = true) {
  const verse = match.verse;
  const [chapter] = getChapterTitles();
  const changed = chapter === title || (await waitNewTitles());
  syncParallelLines();
  if (verse) {
    if (changed) {
      if (project) {
        const selectedVerses = await doSelectVerses(parseInt(verse), false, false, false);
        if (selectedVerses && selectedVerses.length) {
          await backgroundSleep(100);
          selectedVerses[0].scrollIntoViewIfNeeded(true);
          return true;
        }
      } else {
        return true;
      }
    } else {
      if (project) {
        console.warn(`${chapter} -> ${title} not changed (page refreshed to get new titles)`);
        setAutoSelectVerse(match);
        window.location.reload();
      }
      return false;
    }
  }
  return false;
}

async function checkAutoProject() {
  const match = getAutoSelectVerse();
  if (match) {
    const title = getChapterTitles()[0];
    await waitAndSelectVerse(match, title);
  }
}

/**
 * wait until chapter is loaded then select verse
 * @param timeout
 * @returns {Promise<Boolean>} - changed - true, expired - false
 */
function waitNewTitles(timeout = 5000) {
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
            console.warn("waitNewTitles.timeout", oldChapters, chapters);
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
