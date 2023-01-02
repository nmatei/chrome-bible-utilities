const projected = "projected";
let projectTab;
let selectedVersesNr = [];
let selectParallel = true;
let focusChapter = null;

window.addEventListener("load", () => {
  setTimeout(() => {
    cleanUp();
    createSettingsActions();
    initEvents();
  }, 100);
});

function createSettingsActions() {
  const actions = document.createElement("div");
  actions.id = "project-actions";
  actions.className = "actions";
  actions.innerHTML = `
    <button data-key="settings" class="action-btn" title="Settings">🛠</button>
    <button data-key="live-text" class="action-btn" title="Live Text">💬</button>
  `;
  document.body.appendChild(actions);

  const liveBoxForm = createLiveTextForm();
  const liveText = document.getElementById("liveText");

  actions.addEventListener("click", async e => {
    const target = e.target;
    if (target.matches(".action-btn")) {
      const action = target.getAttribute("data-key");
      switch (action) {
        case "settings": {
          chrome.runtime.sendMessage({ action: "createSettingsTab" });
          break;
        }
        case "live-text": {
          liveBoxForm.style.top = target.offsetTop + target.offsetHeight + 10;
          liveBoxForm.style.left = target.offsetLeft;
          liveBoxForm.classList.toggle("hide-view");
          if (!liveBoxForm.classList.contains("hide-view")) {
            await getProjectTab();
            liveText.focus();
          }
          break;
        }
      }
    }
  });
}

function addLiveTextBox() {
  const form = document.createElement("form");
  form.className = "hide-view arrow-up";
  form.id = "live-text-box";
  form.innerHTML = `
    <div class="actions">
      <label for="realTimeUpdates" title="Live updates">Live
        <input type="checkbox" name="realTimeUpdates" id="realTimeUpdates" checked/>
      </label>
      <span data-key="fill" class="fill"></span>
      <button type="submit" class="action-btn">💬 Project</button>
      <button type="reset" class="action-btn">Clear</button>
    </div>
    <input type="text" name="liveTextTitle" id="liveTextTitle" placeholder="Title"/>
    <textarea name="liveText" id="liveText" cols="30" rows="6" placeholder="Enter Text to be projected"></textarea>
  `;
  document.body.appendChild(form);
  return form;
}

function createLiveTextForm() {
  const liveBoxForm = addLiveTextBox();
  const liveTextTitle = document.getElementById("liveTextTitle");
  const liveText = document.getElementById("liveText");

  liveBoxForm.addEventListener("submit", e => {
    e.preventDefault();
    projectLiveText(liveTextTitle.value, liveText.value);
  });
  liveBoxForm.addEventListener("reset", () => {
    projectText("");
  });
  liveTextTitle.addEventListener(
    "input",
    debounce(e => {
      e.stopPropagation();
      if (liveBoxForm.realTimeUpdates.checked) {
        projectLiveText(liveTextTitle.value, liveText.value);
      }
    }, 200)
  );
  liveText.addEventListener(
    "input",
    debounce(e => {
      e.stopPropagation();
      if (liveBoxForm.realTimeUpdates.checked) {
        projectLiveText(liveTextTitle.value, liveText.value);
      }
    }, 200)
  );
  return liveBoxForm;
}

function projectLiveText(title, text) {
  const displayTitle = `<h1>💬 ${title}</h1>`;
  const display = title || text;
  text = text.replaceAll(/\n/gi, "<br/>");
  projectText(display ? displayTitle + `<p>${text}</p>` : "");
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
  return !!document.querySelector(".parallel-chapter");
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

  chapters = chapters
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

  const versesContent = versesInfo.map(({ cls, verseNr, content }) => {
    return `<p class="${cls}">${verseNr ? `<sup>${verseNr}</sup>` : ""}${content}</p>`;
  });

  return `<h1>${chapters.join(" / ")}</h1>` + versesContent.join("\n");
}

function printSelectedVerses(tab, verses) {
  cleanUp();
  const text = verses.length ? getDisplayText(verses) : "";
  projectText(text);
}

function projectText(text) {
  return chrome.runtime.sendMessage({ action: "updateText", payload: text });
}

async function createProjectTab() {
  const response = await createChromeWindow();
  return response ? response.id : null;
}

function createChromeWindow() {
  return chrome.runtime.sendMessage({ action: "createTab" });
}

async function getProjectTab() {
  let tab = projectTab;
  if (!tab) {
    tab = projectTab = await createProjectTab();
  }
  return tab;
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

    if (primary === 191 && parallel === 143 && book === "NUM" && chapter === 13) {
      return nr + (isParallel ? -1 : 1);
    }
    if (primary === 191 && parallel === 143 && book === "PSA" && chapter < 10) {
      return nr + (isParallel ? -1 : 1);
    }
    if (primary === 191 && parallel === 143 && book === "PSA" && chapter > 9) {
      return 0;
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

async function doSelectVerses(verseNumber, isParallel, wasProjected, multiSelect) {
  const focusOrder = ["primary-chapter", "parallel-chapter"];
  if (isParallel) {
    focusOrder.reverse();
  }

  const selectors = [`.row .${focusOrder[0]} .verse.v${verseNumber}`];
  if (isParallel || hasParallelView()) {
    const parallelNr = mapParallelVerse(verseNumber, isParallel);
    if (parallelNr) {
      selectors.push(`.row .${focusOrder[1]} .verse.v${parallelNr}`);
    }
  }

  const verses = document.querySelectorAll(selectors.join(","));

  setFocusChapter(isParallel);

  if (!multiSelect) {
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

    const multiSelect = e.ctrlKey;
    const verse = target.closest(".verse");
    const verseNumber = getVerseNumber(verse);
    const isParallel = target.closest(".parallel-chapter");
    const wasProjected = verse.classList.contains(projected);

    await doSelectVerses(verseNumber, isParallel, wasProjected, multiSelect);

    if (e.altKey) {
      await bringTabToFront();
      document.body.classList.add("focus-lost");
      return;
    }
  }
  document.body.classList.remove("focus-lost");
}

async function bringTabToFront() {
  const tab = await getProjectTab();
  if (tab) {
    await chrome.runtime.sendMessage({ action: "focusTab", payload: { id: tab } });
  }
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

    let next = selectedVersesNr.map(v => v + dir);
    const [primary, parallel] = next;

    if (!parallel && focusChapter === "parallel") {
      focusOrder.reverse();
    }

    const selectors = [`.row .${focusOrder[0]} .verse.v${primary}`];

    if (parallel) {
      selectors.push(`.row .${focusOrder[1]} .verse.v${parallel}`);
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

function initEvents() {
  let app = document.querySelector("#react-app-Bible");
  if (!app) {
    console.warn("no app found %o, must be logged in", "#react-app-Bible");
    app = document.querySelector(".bible-reader-sticky-container");
  }
  if (app) {
    improveSearch();

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

function debounce(fn, delay) {
  let timer = null;
  return function () {
    const context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

/**

 // TODO sync verses in same 'line'
 var v = 39
 var verses = document.querySelectorAll(`.row .primary-chapter .verse.v${v}, .row .parallel-chapter .verse.v${v}`);
 console.info(verses[0].offsetTop, verses[1].offsetTop)
 var primary = document.querySelector('.primary-chapter');
 primary.style.paddingTop = `${verses[1].offsetTop - verses[0].offsetTop - 0 + primary.style.paddingTop.replace('px', '') * 1}px`

 */

function improveSearch() {
  document.querySelector(".chapter-picker-container input").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const value = e.target.value;
      const numbersMatch = value.match(/\s+(\d+)/gi);

      if (numbersMatch) {
        setTimeout(async () => {
          const numbers = numbersMatch.map(n => parseInt(n));
          const list = document.querySelector(".chapter-picker-container .chapter-list");
          const chapterNr = [...list.querySelectorAll("a")].find(a => a.innerText == numbers[0]);
          if (chapterNr) {
            chapterNr.querySelector("li").classList.add("active");
            chapterNr.click();

            if (numbers.length > 1) {
              // wait until chapter is loaded then select verse
              const oldChapters = getChapterTitles();
              await waitNewTitles(oldChapters);
              const selectedVerses = await doSelectVerses(numbers[1], false, false, false);
              if (selectedVerses && selectedVerses.length) {
                selectedVerses[0].scrollIntoViewIfNeeded(true);
              }
            }
          }
        }, 200);
      }
    }
  });
}

function getChapterTitles() {
  return [...document.querySelectorAll(".reader h1")].map(h => h.innerHTML.trim());
}

function waitNewTitles(oldChapters) {
  return new Promise(resolve => {
    const refreshIntervalId = setInterval(() => {
      const chapters = getChapterTitles();
      // console.info(oldChapters, "vs", chapters);
      if (oldChapters.every((c, i) => c !== chapters[i])) {
        clearInterval(refreshIntervalId);
        setTimeout(() => {
          resolve();
        }, 200);
      }
    }, 300);
  });
}
