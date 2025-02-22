const isMac = /(Mac)/i.test(navigator.platform);

let liveBoxForm;
let helpBox;
let settingsBox;
let versesBox;

async function getOpenStates() {
  const storageData = await chrome.storage.sync.get("openStates");
  return storageData.openStates || {};
}

async function setOpenStates(openStates) {
  await chrome.storage.sync.set({
    openStates
  });
}

async function getPreviousVersion() {
  const data = await chrome.storage.sync.get("previousVersion");
  return data ? data.previousVersion : null;
}
async function setPreviousVersion(version) {
  await chrome.storage.sync.set({
    previousVersion: version
  });
}

async function getLiveText() {
  const storageData = await chrome.storage.sync.get("liveText");
  return storageData.liveText || { title: "", text: "", live: false };
}

async function saveLiveText(title, text, live) {
  await chrome.storage.sync.set({
    liveText: { title, text, live }
  });
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
      <button type="submit" class="action-btn">
        ${icons.liveChat}
        Project
      </button>
      <button type="button" class="action-btn" data-key="hide" title="Hide text">
        ${icons.lightStop}
      </button>
      <button type="button" class="action-btn" data-key="close" title="Close">${icons.close}</button>
    </div>
    <div class="form-field form-field-wrapper">
      <input type="text" name="liveTextTitle" id="liveTextTitle" placeholder="Title"/>
    </div>
    <div class="form-field-wrapper">
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
    <button data-key="live-text" class="action-btn" title="Live Text">
      ${icons.liveChat}
    </button>
    <button data-key="settings" class="action-btn abp-badge-off" title="Settings">
      ${icons.lightSettings}
    </button>
    <button data-key="help" class="action-btn" title="Help">
      ${icons.question}
    </button>
    <button data-key="verses" class="action-btn" title="List/Pin some verses">
      ${icons.lightFavorite}
    </button>
  `;
  document.body.appendChild(actions);
  return actions;
}

function createLiveTextForm() {
  const liveBoxForm = addLiveTextBox();
  const liveTextTitle = $("#liveTextTitle");
  const liveText = $("#liveText");
  const realTimeUpdates = $("#realTimeUpdates");

  // Load saved text and checkbox state when form is created
  getLiveText().then(({ title, text, live }) => {
    liveTextTitle.value = title;
    liveText.value = text;
    realTimeUpdates.checked = live;
  });

  realTimeUpdates.addEventListener("change", () => {
    saveLiveText(liveTextTitle.value, liveText.value, realTimeUpdates.checked);
    if (realTimeUpdates.checked) {
      projectLiveText(liveTextTitle.value, liveText.value);
    }
  });
  liveBoxForm.addEventListener("submit", e => {
    e.preventDefault();
    projectLiveText(liveTextTitle.value, liveText.value);
    saveLiveText(liveTextTitle.value, liveText.value, realTimeUpdates.checked);
  });
  $('button[data-key="hide"]', liveBoxForm).addEventListener("click", () => {
    projectText("");
  });
  $('button[data-key="close"]', liveBoxForm).addEventListener("click", () => {
    $(`#project-actions button[data-key="live-text"]`).click();
  });
  liveBoxForm.addEventListener("reset", () => {
    projectText("");
  });
  liveTextTitle.addEventListener(
    "input",
    debounce(() => {
      if (realTimeUpdates.checked) {
        projectLiveText(liveTextTitle.value, liveText.value);
      }
      saveLiveText(liveTextTitle.value, liveText.value, realTimeUpdates.checked);
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
      if (realTimeUpdates.checked) {
        projectLiveText(liveTextTitle.value, liveText.value);
      }
      saveLiveText(liveTextTitle.value, liveText.value, realTimeUpdates.checked);
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

function actionsClick(target) {
  const btn = target.closest(".action-btn");
  if (btn) {
    const action = btn.dataset.key;
    switch (action) {
      case "settings": {
        settingsBox = settingsBox || createSettingsBox();
        showBox(settingsBox, btn);
        break;
      }
      case "live-text": {
        liveBoxForm = liveBoxForm || createLiveTextForm();
        showBoxBy(liveBoxForm, btn);
        liveBoxForm.classList.toggle("hide-view");
        if (liveBoxForm.classList.contains("hide-view")) {
          btn.classList.remove("active");
        } else {
          btn.classList.add("active");
          getProjectTab().then(() => {
            const liveText = $("#liveText");
            liveText.focus();
          });
        }
        break;
      }
      case "help": {
        helpBox = helpBox || addHelpBox();
        showBox(helpBox, btn);
        if (btn.classList.contains("abp-badge")) {
          $(".abp-badge", helpBox).scrollIntoView({ behavior: "smooth" });
          setTimeout(hideVersionBadge, 5000);
        }
        break;
      }
      case "verses": {
        versesBox = versesBox || createPinVersesBox();
        showBox(versesBox, btn);
        break;
      }
    }
  }
}

function showVersesBox() {
  const btn = $(`#project-actions button[data-key="verses"]`);
  if (!btn.classList.contains("active")) {
    actionsClick(btn);
  }
}

/**
 *
 */
async function createSettingsActions() {
  const openStates = await getOpenStates();
  const actions = addActionsBox();

  actions.addEventListener("click", e => {
    actionsClick(e.target);

    $$(".action-btn", actions).forEach(btn => {
      const action = btn.dataset.key;
      const active = btn.classList.contains("active");
      openStates[action] = active ? 1 : 0;
    });
    setOpenStates(openStates);
  });

  Object.entries(openStates).forEach(([key, value]) => {
    if (value === 1) {
      const target = $(`button[data-key="${key}"]`, actions);
      actionsClick(target);
    }
  });

  const previousVersion = await getPreviousVersion();
  const version = chrome.runtime.getManifest().version;

  //console.info("%o vs %o", previousVersion, version);
  if (previousVersion !== version) {
    setTimeout(() => showNewVersionBadge(version), 2000);
  }
}

async function showNewVersionBadge(version) {
  const helpBtn = $('button[data-key="help"]');
  helpBtn.classList.add("abp-badge");
  helpBtn.title = "Help. Plugin updated... check 📈 Release Notes";

  const result = await simpleConfirm("Would you like to see the Release Notes?", {
    title: `<strong class='abp-badge'>${icons.update}</strong> Plugin has been updated to v.${version}.`,
    ok: "Yes",
    cancel: "No",
    focus: "yes"
  });
  if (result) {
    chrome.runtime.sendMessage({
      action: "showReleaseNotes"
    });
    setTimeout(() => {
      hideVersionBadge();
    }, 5000);
  }
}

async function hideVersionBadge() {
  const helpBtn = $('button[data-key="help"]');
  helpBtn.classList.remove("abp-badge");
  helpBtn.title = "Help";
  const version = chrome.runtime.getManifest().version;
  await setPreviousVersion(version);
}
// used to simulate updates
// setPreviousVersion("1.0.0");

function showBox(box, target) {
  showBoxBy(box, target);
  box.classList.toggle("hide-view");
  if (box.classList.contains("hide-view")) {
    target.classList.remove("active");
  } else {
    target.classList.add("active");
  }
}

// TODO reuse showBy?
function showBoxBy(el, target) {
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
