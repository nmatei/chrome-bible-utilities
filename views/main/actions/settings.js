/**
 * 0 [00] - none
 * 1 [01] - parallel
 * 2 [10] - primary
 * 3 [11] - parallel & primary
 * @type {number}[]
 */
let displaySettings = [3, 0];

async function getDisplaySettings() {
  const storageData = await chrome.storage.sync.get("displaySettings");
  const settings = storageData.displaySettings;
  if (typeof settings === "number") {
    // migrate old settings from number to array
    await saveDisplaySettings([settings, 0]);
    return [settings, 0];
  } else if (Array.isArray(settings)) {
    return settings;
  }
  return [3, 0];
}

async function saveDisplaySettings(settings) {
  await chrome.storage.sync.set({
    displaySettings: settings
  });
  // TODO notify other tabs to update values
}

async function loadDisplaySettings() {
  const settings = await getDisplaySettings();
  displaySettings = settings;
  updateDisplaySettingsButtons(settings);
  return settings;
}

function showScreenSourcesActions(e, btn) {
  e.stopPropagation();
  e.preventDefault();
  const state = btn.dataset.state * 1;
  async function handler(el, item) {
    const newState = item.data.state;
    btn.dataset.state = newState;
    displaySettings[btn.dataset.display - 1] = newState;
    await saveDisplaySettings(displaySettings);
    updateProjectorBadge(displaySettings);
  }

  const actions = [
    // TODO add title?
    {
      text: "Don't display verses on this window",
      cls: "screen-source",
      icon: icons.screenSources,
      data: { state: 0 },
      active: state === 0,
      handler
    },
    {
      text: "<strong>Primary</strong> verses only",
      cls: "screen-source",
      icon: icons.screenSources,
      data: { state: 2 },
      active: state === 2,
      handler
    },
    {
      text: "<strong>Parallel</strong> verses only",
      cls: "screen-source",
      icon: icons.screenSources,
      data: { state: 1 },
      active: state === 1,
      handler
    },
    {
      text: "<strong>Primary</strong> & <strong>Parallel</strong> verses",
      cls: "screen-source",
      icon: icons.screenSources,
      data: { state: 3 },
      active: state === 3,
      handler
    }
  ];
  const menu = getContextMenu(actions);
  showBy(menu, btn);
}

/**
 *
 * @returns {HTMLDivElement}
 */
function createSettingsBox() {
  const box = addSettingsBox();
  box.addEventListener("click", e => {
    const btn = e.target.closest(".screen-source");
    if (btn) {
      showScreenSourcesActions(e, btn);
    }
  });
  $('[data-key="settings"]', box).addEventListener("click", () => {
    createSettingsWindow();
  });
  updateDisplaySettingsButtons(displaySettings);
  return box;
}

function addSettingsBox() {
  const box = document.createElement("div");
  box.className = "info-fixed-box hide-view arrow-left";
  box.id = "display-settings-box";
  box.innerHTML = `
    <div class="actions row-actions">
      <button class="action-btn screen-source scale-large" data-display="1" data-state="0" title="Window [1]">
        ${icons.screenSources}
      </button>
      <button class="action-btn screen-source scale-large" data-display="2" data-state="0" title="Window [2]">
        ${icons.screenSources}
      </button>
      <span data-key="fill" class="fill"></span>
      <button class="action-btn" data-key="settings" title="Projector Screen Settings (Advanced)">
        ${icons.lightSettings}
      </button>
    </div>      
  `;
  document.body.appendChild(box);
  return box;
}

function updateDisplaySettingsButtons(settings) {
  settings.forEach((state, i) => {
    const btn = $(`#display-settings-box [data-display="${i + 1}"]`);
    if (!btn) return;
    btn.dataset.state = state;
  });
  updateProjectorBadge(settings);
}

function updateProjectorBadge(settings) {
  $("#project-actions [data-key='settings']").classList.toggle(
    "abp-badge",
    settings.every(s => s === 0)
  );
}
