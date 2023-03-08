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

// TODO Fix help arrow - not visible because of 'overflow'
function addHelpBox() {
  const helpBox = document.createElement("div");
  helpBox.className = "info-fixed-box hide-view arrow-left";
  helpBox.id = "help-text-box";
  helpBox.innerHTML = `
    <h2><span class="key-code">❔</span> Help / Usage</h2>
    <div class="info-text-content-wrapper">
    <ul>
      <li>
        <div class="title">🔤 <strong>Project selected verses</strong></div>
        <ul>
          <li>🔎 <strong class="key-code">Search</strong> - Book and Chapter</li>
          <li><strong class="key-code">Click</strong> on verse number to display it on projector</li>
          <li><strong class="key-code">Up / Down / Left / Right</strong> arrows to navigate to next/preview verses</li>
          <li><strong class="key-code">${isMac ? "⌘" : "CTRL"} + Click</strong> to add verse to selection (multi select)</li>
          <li><strong class="key-code">Shift + Click</strong> to multi select between last selection</li>
          <li><strong class="key-code">ALT + Click</strong> on verse number or Pinned reference, <br/>to force project window to be on top (in case is not visible)</li>
          <li><strong class="key-code">ESC</strong> to show blank page (hide all selected verses)</li>
          <li><strong class="key-code">${isMac ? "⌃⌘F" : "F11"}</strong> to enter/exit fullscreen projector window (first focus it)</li>
        </ul>
        <li>
          <div class="title">💬 <strong>Project "live text"</strong> (fast and simple slide)</div>
          <ul>
            <li>input any text to be projected (<a href="https://github.com/markedjs/marked" target="_blank">Markdown</a> format). <a href="https://raw.githubusercontent.com/nmatei/chrome-bible-utilities/master/screens/README.md" target="_blank">Examples</a></li>
            <li><strong class="key-code">${isMac ? "⌘" : "CTRL"} + Enter</strong> to project live text (inside title or textarea)</li>
          </ul>
        </li>
        <li>
          <div class="title">📌 <strong>List/Pin some references</strong> (verses)</div>
          <ul>
            <li>Store references for future selection and project them faster</li>
            <li><strong class="key-code">Enter</strong> to add references (<strong class="key-code">,</strong> or <strong class="key-code">;</strong> as separator) in 'Pin verses' input 🔍</li>
            <li><strong class="key-code">Enter + Enter</strong> to project added reference to List/Pin</li>
            <li><strong class="key-code">ALT + Click</strong> on Reference - force project (on top)</li>
            <li>📝 <strong>Edit All</strong> to Copy/Paste/Edit multiple References</li>
            <li>➕ will pin current Reference if search input is empty</li>
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
          <div class="title">👋 GitHub Project</div>
          <ul>
            <li>📃 External <a href="https://github.com/nmatei/chrome-bible-utilities/blob/master/README.md" target="_blank">README</a> & Screenshots</li>
            <li>👩‍💻 Source <a href="https://github.com/nmatei/chrome-bible-utilities" target="_blank">Code</a></li>
            <li>📩 Support <a href="https://github.com/nmatei/chrome-bible-utilities/issues" target="_blank">tikets</a></li>          
          </ul>  
        </li>
      </li>
    </ul>
    </div>
  `;
  document.body.appendChild(helpBox);
  return helpBox;
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
    el.style.left = target.offsetLeft + "px";
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
