function addLiveTextBox() {
  const form = document.createElement("form");
  form.className = "info-fixed-box hide-view arrow-left";
  form.id = "live-text-box";
  form.innerHTML = `
    <div class="actions row-actions">
      <label for="realTimeUpdates" title="Live updates">Live
        <input type="checkbox" name="realTimeUpdates" id="realTimeUpdates"/>
      </label>
      <span data-key="fill" class="fill"></span>
      <button type="submit" class="action-btn">💬 Project</button>
      <button type="button" class="action-btn" data-key="hide" title="Hide text">🔳</button>
    </div>
    <input type="text" name="liveTextTitle" id="liveTextTitle" placeholder="Title"/>
    <textarea name="liveText" id="liveText" cols="30" rows="6" placeholder="Enter Text to be projected (Markdown format)"></textarea>
  `;
  document.body.appendChild(form);
  return form;
}

function addHelpBox() {
  const isMac = /(Mac)/i.test(navigator.platform);
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
          <li><strong class="key-code">${isMac ? "ˆ⌘F" : "F11"}</strong> to enter/exit fullscreen projector window (first focus it)</li>
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

function addActionsBox() {
  const actions = document.createElement("div");
  actions.id = "project-actions";
  actions.className = "actions";
  actions.innerHTML = `
    <button data-key="live-text" class="action-btn" title="Live Text">💬</button>
    <button data-key="settings" class="action-btn" title="Settings">🛠</button>
    <button data-key="help" class="action-btn" title="Help">❔</button>
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

  actions.addEventListener("click", e => {
    const target = e.target;
    if (target.matches(".action-btn")) {
      const action = target.getAttribute("data-key");
      switch (action) {
        case "settings": {
          createSettingsWindow();
          break;
        }
        case "live-text": {
          if (!liveBoxForm) {
            liveBoxForm = createLiveTextForm();
          }
          // 17 anchor size
          liveBoxForm.style.top = target.offsetTop + target.offsetHeight / 2 - 17;
          liveBoxForm.style.left = target.offsetLeft + target.offsetWidth + 10;
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
          if (!helpBox) {
            helpBox = addHelpBox();
          }
          helpBox.style.top = target.offsetTop + target.offsetHeight / 2 - 17;
          helpBox.style.left = target.offsetLeft + target.offsetWidth + 10;
          helpBox.classList.toggle("hide-view");
          if (helpBox.classList.contains("hide-view")) {
            target.classList.remove("active");
          } else {
            target.classList.add("active");
          }
          break;
        }
      }
    }
  });
}

function projectLiveText(title, text) {
  title = title ? `# ${title}\n` : "";
  const display = title || text;
  projectText(display ? title + text : "", true);
}
