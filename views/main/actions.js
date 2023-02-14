const isMac = /(Mac)/i.test(navigator.platform);

let pinnedVerses = [];

async function getPinnedVerses() {
  const storageData = await chrome.storage.sync.get("pinnedVerses");
  return storageData.pinnedVerses || "Mat 5:1";
}

async function setPinnedVerses(pinnedVerses) {
  await chrome.storage.sync.set({ pinnedVerses: pinnedVerses.join("\n") });
}

function addLiveTextBox() {
  const form = document.createElement("form");
  form.className = "info-fixed-box hide-view arrow-left";
  form.id = "live-text-box";
  form.method = "GET";
  form.action = "#";
  form.innerHTML = `
    <div class="actions row-actions">
      <label for="realTimeUpdates" title="Live updates">Live
        <input type="checkbox" name="realTimeUpdates" id="realTimeUpdates"/>
      </label>
      <span data-key="fill" class="fill"></span>
      <button type="submit" class="action-btn">💬 Project</button>
      <button type="button" class="action-btn" data-key="hide" title="Hide text">🔳</button>
    </div>
    <div class="form-field">
      <input type="text" name="liveTextTitle" id="liveTextTitle" placeholder="Title"/>
    </div>
    <div>
      <textarea name="liveText" id="liveText" cols="30" rows="6" placeholder="Enter Text to be projected (Markdown format)"></textarea>
    </div>
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
        <div class="title">🔤 <strong>Project selected verses</strong></div>
        <ul>
          <li>🔎 <strong class="key-code">Search</strong> - Book and Chapter</li>
          <li><strong class="key-code">Click</strong> on verse number to display it on projector</li>
          <li><strong class="key-code">Up/Down/Left/Right</strong> arrows to navigate to next/preview verses</li>
          <li><strong class="key-code">${isMac ? "⌘" : "CTRL"} + Click</strong> to add verse to selection (multi select)</li>
          <li><strong class="key-code">Shift + Click</strong> to multi select between last selection</li>
          <li><strong class="key-code">ALT + Click</strong> to force project window to be on top (in case is not visible)</li>
          <li><strong class="key-code">ESC</strong> to show blank page (hide all selected verses)</li>
          <li><strong class="key-code">${isMac ? "⌃⌘F" : "F11"}</strong> to enter/exit fullscreen projector window (first focus it)</li>
        </ul>
        <li>
          <div class="title">💬 <strong>Project "live text"</strong></div>
          <ul>
            <li>input any text to be projected (<a href="https://github.com/markedjs/marked" target="_blank">Markdown</a> format). <a href="https://raw.githubusercontent.com/nmatei/chrome-bible-utilities/master/screens/README.md" target="_blank">Examples</a></li>
            <li><strong class="key-code">${isMac ? "⌘" : "CTRL"} + Enter</strong> to project live text (inside title or textarea)</li>
          </ul>
        </li>
        <li>
          <div class="title">2️⃣ open <strong>Multiple chrome tabs</strong> with different chapters</div>
          <ul>
            <li>all windows will project to the same projector page</li>
            <li>projector page will close only when all tabs from my.bible.com are closed</li>          
          </ul>
        </li>
        <li>
          <div class="title">✨ <strong>Improvements</strong></div>
          <ul>
            <li>🔎 Search 1 (part of Book + chapter: <strong class="key-code">Heb 11</strong> / Ioan 3) + Enter</li>
            <li>🔎 Search 2 (part of Book + chapter + verse: Heb 11 1 / <strong class="key-code">Ioan 3 16</strong>) + Enter</li>
          </ul>
        </li>
        <li>
          <div class="title">👋 GitHub Project 
            <a href="https://github.com/nmatei/chrome-bible-utilities/blob/master/README.md" target="_blank">README</a> & 
            <a href="https://github.com/nmatei/chrome-bible-utilities" target="_blank">Code</a></div>
          <ul>
            <li>📩 Support <a href="https://github.com/nmatei/chrome-bible-utilities/issues" target="_blank">tikets</a></li>          
          </ul>
        </li>
      </li>
    </ul>
  `;
  document.body.appendChild(helpBox);
  return helpBox;
}

function getVerseRow(verse, i) {
  return `<tr>
    <td><a data-key="remove" class="action-btn remove-btn" data-idx="${i}" title="Remove">✖</a></td>
    <td><a data-key="open">${verse}</a></td>
  </tr>`;
}

function createPinVersesBox() {
  const form = addVersesBox();
  form.querySelector("tbody").addEventListener("click", e => {
    const target = e.target;
    if (target.matches("a")) {
      const action = target.dataset.key;
      switch (action) {
        case "remove": {
          pinnedVerses.splice(target.dataset.idx, 1);
          updatePinnedRows(pinnedVerses);
          setPinnedVerses(pinnedVerses);
          break;
        }
        case "open": {
          const value = target.innerText;
          const match = getVerseInfo(value);
          if (match) {
            openChapter(match.book, match.chapter);
            // TODO click on same bok & chapter will not project selected verse
            waitAndSelectVerse(match.verse);
          }
          break;
        }
      }
    }
  });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const input = $("#pin-add-verse");
    const editor = $("#pinned-verses-editor");
    if (editor.style.display !== "none") {
      pinnedVerses = splitVerses(editor.value);
    }
    pinnedVerses.push(input.value);
    editor.value = pinnedVerses.join("\n");
    updatePinnedRows(pinnedVerses);
    setPinnedVerses(pinnedVerses);
    input.value = "";
    input.focus(); // focus in case we clicked on add '+'
  });
  form.querySelector('button[data-key="edit"]').addEventListener("click", e => {
    $("#pinned-verses-list").style.display = "none";
    const editor = $("#pinned-verses-editor");
    editor.value = pinnedVerses.join("\n");
    editor.style.display = "block";
    e.target.style.display = "none";
    $('#verses-text-box button[data-key="save"]').style.display = "inline-block";
  });
  form.querySelector('button[data-key="save"]').addEventListener("click", async e => {
    const editor = $("#pinned-verses-editor");
    editor.style.display = "none";
    $("#pinned-verses-list").style.display = "table";
    pinnedVerses = splitVerses(editor.value);
    updatePinnedRows(pinnedVerses);
    setPinnedVerses(pinnedVerses);
    e.target.style.display = "none";
    $('#verses-text-box button[data-key="edit"]').style.display = "inline-block";
  });
  getPinnedVerses().then(verses => {
    pinnedVerses = splitVerses(verses);
    updatePinnedRows(pinnedVerses);
  });
  return form;
}

function updatePinnedRows(pinnedVerses) {
  const rows = pinnedVerses.map(getVerseRow).join("");
  $("#pinned-verses-list tbody").innerHTML = rows;
}

function addVersesBox() {
  const form = document.createElement("form");
  form.className = "info-fixed-box hide-view arrow-up";
  form.id = "verses-text-box";
  form.method = "GET";
  form.action = "#";
  form.innerHTML = `
    <div class="actions row-actions form-field">
      <input required placeholder="pin verse" type="text" name="verse" id="pin-add-verse" class="fill"/>
    </div>
    <div class="actions row-actions form-field">
      <button type="button" class="action-btn" data-key="edit" title="Edit All">📝</button>
      <button type="button" class="action-btn" data-key="save" title="Save" style="display: none">💾</button>
      <span class="fill"></span>
      <button type="submit" class="action-btn" data-key="add" title="Add new Verse [Enter]">➕</button>
    </div>
    <div id="pinned-verses-wrapper">
      <textarea id="pinned-verses-editor" cols="14" rows="6" style="display: none"></textarea>
      <table id="pinned-verses-list">
       <colgroup>
          <col span="1" style="width: 25px" />
          <col span="1" />
        </colgroup>
        <tbody></tbody>
      </table>
    </div>
  `;
  document.body.appendChild(form);
  return form;
}

function addActionsBox() {
  const actions = document.createElement("div");
  actions.id = "project-actions";
  actions.className = "actions";
  // verses possible icons? 📑 📚 📖
  actions.innerHTML = `
    <button data-key="live-text" class="action-btn" title="Live Text">💬</button>
    <button data-key="settings" class="action-btn" title="Settings">🛠</button>
    <button data-key="help" class="action-btn" title="Help">❔</button>
    <button data-key="verses" class="action-btn" title="List/Pin some verses">📌</button>
  `;
  document.body.appendChild(actions);
  return actions;
}

function createLiveTextForm() {
  const liveBoxForm = addLiveTextBox();
  const liveTextTitle = document.getElementById("liveTextTitle");
  const liveText = document.getElementById("liveText");

  liveBoxForm.addEventListener("submit", e => {
    e.preventDefault();
    projectLiveText(liveTextTitle.value, liveText.value);
  });
  liveBoxForm.querySelector('button[data-key="hide"]').addEventListener("click", () => {
    projectText("");
  });
  liveBoxForm.addEventListener("reset", () => {
    projectText("");
  });
  liveTextTitle.addEventListener(
    "input",
    debounce(() => {
      if (liveBoxForm.realTimeUpdates.checked) {
        projectLiveText(liveTextTitle.value, liveText.value);
      }
    }, 200)
  );
  liveTextTitle.addEventListener(
    "keydown",
    debounce(e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        projectLiveText(liveTextTitle.value, liveText.value);
      }
    }, 100)
  );
  liveText.addEventListener(
    "input",
    debounce(() => {
      if (liveBoxForm.realTimeUpdates.checked) {
        projectLiveText(liveTextTitle.value, liveText.value);
      }
    }, 200)
  );
  liveText.addEventListener(
    "keydown",
    debounce(e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        projectLiveText(liveTextTitle.value, liveText.value);
      }
    }, 100)
  );

  return liveBoxForm;
}

/**
 *
 */
function createSettingsActions() {
  const actions = addActionsBox();
  let liveBoxForm;
  let helpBox;
  let versesBox;

  actions.addEventListener("click", e => {
    const target = e.target;
    if (target.matches(".action-btn")) {
      actions.querySelectorAll(".action-btn").forEach(btn => {
        btn.classList.remove("active");
      });
      const action = target.getAttribute("data-key");
      switch (action) {
        case "settings": {
          createSettingsWindow();
          break;
        }
        case "live-text": {
          if (helpBox) {
            helpBox.classList.add("hide-view");
          }
          if (!liveBoxForm) {
            liveBoxForm = createLiveTextForm();
          }
          showBy(liveBoxForm, target);
          liveBoxForm.classList.toggle("hide-view");
          if (liveBoxForm.classList.contains("hide-view")) {
            target.classList.remove("active");
          } else {
            target.classList.add("active");
            getProjectTab().then(() => {
              const liveText = document.getElementById("liveText");
              liveText.focus();
            });
          }
          break;
        }
        case "help": {
          if (liveBoxForm) {
            liveBoxForm.classList.add("hide-view");
          }
          helpBox = helpBox || addHelpBox();
          showBox(helpBox, target);
          break;
        }
        case "verses": {
          versesBox = versesBox || createPinVersesBox();
          showBox(versesBox, target);
          break;
        }
      }
    }
  });
}

function showBox(box, target) {
  showBy(box, target);
  box.classList.toggle("hide-view");
  if (box.classList.contains("hide-view")) {
    target.classList.remove("active");
  } else {
    target.classList.add("active");
  }
}

function showBy(el, target) {
  if (el.classList.contains("arrow-up")) {
    el.style.top = target.offsetTop + target.offsetHeight + 10 + "px";
    el.style.left = target.offsetLeft;
  } else {
    // 17 anchor size
    el.style.top = target.offsetTop + target.offsetHeight / 2 - 17 + "px";
    el.style.left = target.offsetLeft + target.offsetWidth + 10 + "px";
  }
}

function projectLiveText(title, text) {
  title = title ? `# ${title}\n` : "";
  const display = title || text;
  projectText(display ? title + text : "", true);
}
