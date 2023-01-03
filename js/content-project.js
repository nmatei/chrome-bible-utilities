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
    <button data-key="live-text" class="action-btn" title="Live Text">💬</button>
    <button data-key="settings" class="action-btn" title="Settings">🛠</button>
    <button data-key="help" class="action-btn" title="Help">❔</button>
  `;
  document.body.appendChild(actions);

  const liveBoxForm = createLiveTextForm();
  const liveText = document.getElementById("liveText");
  let helpBox;

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
          // 17 anchor size
          liveBoxForm.style.top = target.offsetTop + target.offsetHeight / 2 - 17;
          liveBoxForm.style.left = target.offsetLeft + target.offsetWidth + 10;
          liveBoxForm.classList.toggle("hide-view");
          if (!liveBoxForm.classList.contains("hide-view")) {
            await getProjectTab();
            liveText.focus();
          }
          target.classList.toggle("active");
          break;
        }
        case "help": {
          if (!helpBox) {
            helpBox = addHelpBox();
          }
          helpBox.style.top = target.offsetTop + target.offsetHeight / 2 - 17;
          helpBox.style.left = target.offsetLeft + target.offsetWidth + 10;
          helpBox.classList.toggle("hide-view");
          target.classList.toggle("active");
          break;
        }
      }
    }
  });
}

function addLiveTextBox() {
  const form = document.createElement("form");
  // form.className = "hide-view arrow-up";
  form.className = "info-fixed-box hide-view arrow-left";
  form.id = "live-text-box";
  form.innerHTML = `
    <div class="actions row-actions">
      <label for="realTimeUpdates" title="Live updates">Live
        <input type="checkbox" name="realTimeUpdates" id="realTimeUpdates"/>
      </label>
      <span data-key="fill" class="fill"></span>
      <button type="submit" class="action-btn">💬 Project</button>
      <button type="reset" class="action-btn">Clear</button>
    </div>
    <input type="text" name="liveTextTitle" id="liveTextTitle" placeholder="Title"/>
    <textarea name="liveText" id="liveText" cols="30" rows="6" placeholder="Enter Text to be projected (Markdown format)"></textarea>
  `;
  document.body.appendChild(form);
  return form;
}

function addHelpBox() {
  const helpBox = document.createElement("div");
  helpBox.className = "info-fixed-box hide-view arrow-left";
  helpBox.id = "help-text-box";
  helpBox.innerHTML = `
    <h2><span class="key-code">❔</span> Help / Usage</h2>
    <ul>
      <li>
        🔤 <strong>Project selected verses</strong>
        <ul>
          <li>🔎 <strong class="key-code">Search</strong> - Book and Chapter</li>
          <li><strong class="key-code">Click</strong> on verse number to display it on projector</li>
          <li><strong class="key-code">Up/Down/Left/Right</strong> arrows to navigate to next/preview verses</li>
          <li><strong class="key-code">CTRL + Click</strong> to add verse to selection (multi select)</li>
          <li><strong class="key-code">ALT + Click</strong> to force project window to be on top (in case is not visible)</li>
          <li><strong class="key-code">ESC</strong> to show blank page (hide all selected verses)</li>
          <li><strong class="key-code">F11</strong> to enter/exit fullscreen projector window (first focus it)</li>
        </ul>
        <li>
          💬 <strong>Project "live text"</strong>
          <ul>
            <li>input any text to be projected (<a href="https://github.com/markedjs/marked" target="_blank">Markdown</a> format)</li>
            <li><strong class="key-code">CTRL + Enter</strong> to project live text (inside textarea)</li>
          </ul>
        </li>
        <li>
          2️⃣ open <strong>Multiple chrome tabs</strong> with different chapters
          <ul>
            <li>all windows will project to the same projector page</li>
            <li>projector page will close only when all tabs from my.bible.com are closed</li>          
          </ul>
        </li>
        <li>
          ✨ <strong>Improvements</strong>
          <ul>
            <li>🔎 Search 1 (part of Book + chapter: <strong class="key-code">Heb 11</strong> / Ioan 3) + Enter</li>
            <li>🔎 Search 2 (part of Book + chapter + verse: Heb 11 1 / <strong class="key-code">Ioan 3 16</strong>) + Enter</li>
          </ul>
        </li>
      </li>
    </ul>
  `;
  document.body.appendChild(helpBox);
  return helpBox;
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
  liveText.addEventListener(
    "keydown",
    debounce(e => {
      if (e.ctrlKey && e.key === "Enter") {
        projectLiveText(liveTextTitle.value, liveText.value);
      }
    }, 200)
  );

  return liveBoxForm;
}

function projectLiveText(title, text) {
  const displayTitle = `# 💬 ${title}\n`;
  const display = title || text;
  projectText(display ? displayTitle + text : "", true);
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
    return `<p class="verse ${cls}">${verseNr ? `<sup>${verseNr}</sup>` : ""}${content}</p>`;
  });

  return `<h1 class="reference">${chapters.join(" / ")}</h1>` + versesContent.join("\n");
}

function printSelectedVerses(tab, verses) {
  cleanUp();
  const text = verses.length ? getDisplayText(verses) : "";
  projectText(text);
}

function projectText(text, markdown = false) {
  return chrome.runtime.sendMessage({
    action: "updateText",
    payload: {
      text,
      markdown
    }
  });
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

async function initEvents() {
  let app = await waitElement("#react-app-Bible", 5000);
  if (!app) {
    console.warn("no app found %o, must be logged in", "#react-app-Bible");
    app = await waitElement(".bible-reader-sticky-container", 2000);
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

async function improveSearch() {
  const searchInput = await waitElement(".chapter-picker-container input");
  searchInput.addEventListener("keydown", e => {
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
      if (oldChapters.every((c, i) => c !== chapters[i])) {
        clearInterval(refreshIntervalId);
        setTimeout(() => {
          resolve();
        }, 200);
      }
    }, 300);
  });
}

/**
 *
 * @param {String} selector
 * @param {Number} timeout
 * @returns {Promise<null | HTMLElement>}
 */
function waitElement(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    let el = document.querySelector(selector);
    if (el) {
      resolve(el);
      return;
    }
    const endTime = Date.now() + timeout;
    const refreshIntervalId = setInterval(() => {
      el = document.querySelector(selector);
      if (el) {
        clearInterval(refreshIntervalId);
        resolve(el);
      } else if (endTime < Date.now()) {
        clearInterval(refreshIntervalId);
        //reject("timeout");
        resolve(null);
      }
    }, 100);
  });
}
