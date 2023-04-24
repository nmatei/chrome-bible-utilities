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
  let settingsBox;
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
          settingsBox = settingsBox || createSettingsBox();
          showBox(settingsBox, target);
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
