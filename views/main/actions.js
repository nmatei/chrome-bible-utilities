const isMac = /(Mac)/i.test(navigator.platform);

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
        🔤 <strong>Project selected verses</strong>
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
          💬 <strong>Project "live text"</strong>
          <ul>
            <li>input any text to be projected (<a href="https://github.com/markedjs/marked" target="_blank">Markdown</a> format)</li>
            <li><strong class="key-code">${isMac ? "⌘" : "CTRL"} + Enter</strong> to project live text (inside title or textarea)</li>
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

function getVerseRow(verse, i) {
  return `<tr>
    <td><a data-key="remove" class="action-btn" data-idx="${i}">✖</a></td>
    <td><a data-key="open">${verse}</a></td>
  </tr>`;
}

function mapPinnedVerses(verses) {
  const pinnedVerses = splitVerses(verses);
  return pinnedVerses.map(getVerseRow);
}

function createPinVersesBox(verses) {
  const form = addVersesBox(verses);
  form.addEventListener("submit", e => {
    e.preventDefault();
    console.warn("TODO %o", "add");
  });
  form.querySelector("tbody").addEventListener("click", e => {
    const target = e.target;
    if (target.matches("a")) {
      const action = target.dataset.key;
      switch (action) {
        case "remove": {
          console.warn("TODO %o", "remove", target.dataset.idx);
          break;
        }
        case "open": {
          const value = target.innerText;
          const match = getVerseInfo(value);
          console.warn("open", value, match);
          if (match) {
            openChapter(match.book, match.chapter);
          }
          break;
        }
      }
    }
  });
  form.querySelector('button[data-key="edit"]').addEventListener("click", () => {
    $("#pinned-verses-list").style.display = "none";
    const editor = $("#pinned-verses-editor");
    editor.value = verses;
    editor.style.display = "block";
  });
  form.querySelector('button[data-key="save"]').addEventListener("click", () => {
    const editor = $("#pinned-verses-editor");
    editor.style.display = "none";
    $("#pinned-verses-list").style.display = "table";
    const rows = mapPinnedVerses(editor.value).join("");
    $("#pinned-verses-list tbody").innerHTML = rows;
  });
  return form;
}

function addVersesBox(verses) {
  const rows = mapPinnedVerses(verses).join("");
  const form = document.createElement("form");
  form.className = "info-fixed-box hide-view arrow-up";
  form.id = "verses-text-box";
  form.method = "GET";
  form.action = "#";
  form.innerHTML = `
    <div class="actions row-actions form-field">
      <input placeholder="pin verse" type="text" name="verse" id="pin-add-verse" class="fill"/>
      <button type="submit" class="action-btn" data-key="add" title="Add new Verse">➕</button>
    </div>
    <div>
      <textarea id="pinned-verses-editor" cols="22" rows="10" style="display: none"></textarea>
      <table id="pinned-verses-list">
       <colgroup>
          <col span="1" style="width: 30px" />
          <col span="1" />
        </colgroup>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="actions row-actions footer-bar">
      <span class="fill"></span>
      <button type="button" class="action-btn" data-key="edit" title="Edit All">Edit</button>
      <button type="button" class="action-btn" data-key="save" title="Save">💾 Save</button>
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
          // TODO read it in chrome storage
          const verses = `Ioan 3 16\nMat 5 15; Evr 10 25; Fapte 2 42, Rom 5:1`;
          versesBox = versesBox || createPinVersesBox(verses);
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
