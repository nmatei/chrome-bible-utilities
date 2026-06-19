// Toolbar popup — quick access to the most common features.
// Self-contained extension page: reads/writes chrome.storage.sync directly and
// reuses existing runtime messages. It does NOT load the bible.com content
// scripts, so it has no dependency on the in-page #project-actions toolbar.

const BIBLE_TABS_URL = ["https://www.bible.com/bible*", "https://www.bible.com/*/bible*"];
const DEFAULT_URL = "https://www.bible.com/bible";

// Display states mirror views/main/actions/settings.js:
//   0 [00] none, 1 [01] parallel, 2 [10] primary, 3 [11] primary & parallel
const DISPLAY_MODES = [
  { state: 0, label: "Off" },
  { state: 2, label: "Primary" },
  { state: 1, label: "Parallel" },
  { state: 3, label: "Both" }
];

let displaySettings = [3, 0];
let userOptions = { selected: [0, 0], slides: [{ slideName: "Main", slideDescription: "Default Slide" }] };

// ----- storage accessors (same shapes as settings.js) -----

async function getDisplaySettings() {
  const data = await chrome.storage.sync.get("displaySettings");
  const settings = data.displaySettings;
  if (typeof settings === "number") {
    return [settings, 0];
  } else if (Array.isArray(settings)) {
    return settings;
  }
  return [3, 0];
}

async function saveDisplaySettings(settings) {
  await chrome.storage.sync.set({ displaySettings: settings });
}

async function getUserOptions() {
  const data = await chrome.storage.sync.get("options");
  const options = data.options;
  if (!options || !options.slides) {
    return {
      selected: [0, 0],
      slides: [{ slideName: "Main", slideDescription: "Default Slide" }]
    };
  }
  if (typeof options.selected === "number") {
    options.selected = [options.selected, options.selected];
  } else if (!Array.isArray(options.selected)) {
    options.selected = [0, 0];
  }
  return options;
}

async function saveSelectedSlide(windowIndex, slideIndex) {
  userOptions.selected[windowIndex - 1] = slideIndex;
  await chrome.storage.sync.set({ options: userOptions });
  // Notify an open projector window (handled in views/background.js)
  return chrome.runtime.sendMessage({
    action: "updateSlideSelection",
    payload: { windowIndex, slideIndex }
  });
}

// ----- actions -----

async function openBible() {
  const tabs = await chrome.tabs.query({ url: BIBLE_TABS_URL });
  if (tabs.length) {
    const tab = tabs.find(t => t.active) || tabs[0];
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  } else {
    const { lastBibleUrl } = await chrome.storage.sync.get("lastBibleUrl");
    await chrome.tabs.create({ url: lastBibleUrl || DEFAULT_URL });
  }
  window.close();
}

function openAdvancedSettings() {
  chrome.runtime.sendMessage({ action: "createSettingsTab" });
  window.close();
}

// ----- rendering -----

function renderWindows() {
  const container = document.getElementById("windowCols");
  container.innerHTML = "";

  [1, 2].forEach(windowIndex => {
    const i = windowIndex - 1;
    const col = document.createElement("div");
    col.className = "win-col";

    const header = document.createElement("div");
    header.className = "win-col-header";
    header.innerHTML = `<span class="screen-badge" data-display="${windowIndex}" data-state="${displaySettings[i]}">Window</span>`;
    col.appendChild(header);

    const seg = document.createElement("div");
    seg.className = "seg";
    DISPLAY_MODES.forEach(mode => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.innerHTML = `<span class="ic screen-source" data-state="${mode.state}">${icons.screenSources}</span><span class="seg-label">${mode.label}</span>`;
      if (displaySettings[i] === mode.state) {
        btn.classList.add("active");
      }
      btn.addEventListener("click", async () => {
        if (displaySettings[i] === mode.state) return;
        displaySettings[i] = mode.state;
        await saveDisplaySettings(displaySettings);
        renderWindows();
      });
      seg.appendChild(btn);
    });
    col.appendChild(seg);

    const select = document.createElement("select");
    select.className = "slide-select";
    select.title = "Slide for this window";
    const selectedIndex = userOptions.selected[i] || 0;
    userOptions.slides.forEach((slide, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = slide.slideName;
      if (index === selectedIndex) {
        option.selected = true;
      }
      select.appendChild(option);
    });
    select.addEventListener("change", () => {
      saveSelectedSlide(windowIndex, parseInt(select.value, 10));
    });
    col.appendChild(select);

    container.appendChild(col);
  });
}

function wireStaticControls() {
  document.getElementById("openBible").addEventListener("click", openBible);
  document.getElementById("advancedBtn").addEventListener("click", openAdvancedSettings);

  document.getElementById("windowsIcon").innerHTML = icons.screenSources;
  document.getElementById("advancedIcon").innerHTML = icons.lightSettings;
  document.getElementById("helpSummaryIcon").innerHTML = icons.question;
  document.getElementById("helpChevron").innerHTML = icons.rightArrow;

  const versionLink = document.getElementById("helpVersion");
  versionLink.textContent = `[ v.${chrome.runtime.getManifest().version} ]`;
  // don't toggle the <details> when opening the release-notes link
  versionLink.addEventListener("click", e => e.stopPropagation());

  document.getElementById(
    "helpBody"
  ).innerHTML = `<div id="help-text-box" class="info-fixed-box"><div class="info-text-content-wrapper">${getHelpContent()}</div></div>`;
}

// Keep the popup in sync when settings change elsewhere (an open bible.com
// tab or another popup). The content scripts react to the same storage event.
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "sync") return;
  if (changes.displaySettings || changes.options) {
    [displaySettings, userOptions] = await Promise.all([getDisplaySettings(), getUserOptions()]);
    renderWindows();
  }
});

async function init() {
  wireStaticControls();
  [displaySettings, userOptions] = await Promise.all([getDisplaySettings(), getUserOptions()]);
  renderWindows();
}

init();
