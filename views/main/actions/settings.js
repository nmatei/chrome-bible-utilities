/**
 * 0 [00] - none
 * 1 [01] - primary
 * 2 [10] - parallel
 * 3 [11] - primary & parallel
 * @type {number}
 */
let displaySettings = 3;

async function getDisplaySettings() {
  const storageData = await chrome.storage.sync.get("displaySettings");
  const settings = storageData.displaySettings;
  return typeof settings === "number" ? settings : 3;
}

async function toggleDisplaySettings(toggleSettings) {
  displaySettings += toggleSettings;
  await chrome.storage.sync.set({
    displaySettings
  });
  // TODO notify other tabs to update values
}

async function loadDisplaySettings() {
  const settings = parseInt(await getDisplaySettings());
  displaySettings = settings;
  updateDisplaySettings(settings);
  return settings;
}

async function setDisplaySettings(e) {
  const btn = e.target;
  btn.classList.toggle("active");
  const value = btn.dataset.display * 1;
  const toggle = btn.classList.contains("active") ? value : -value;
  await toggleDisplaySettings(toggle);
}

/**
 *
 * @returns {HTMLDivElement}
 */
function createSettingsBox() {
  const box = addSettingsBox();
  $('[data-key="primary-display"]', box).addEventListener("click", setDisplaySettings);
  $('[data-key="parallel-display"]', box).addEventListener("click", setDisplaySettings);
  $('[data-key="settings"]', box).addEventListener("click", () => {
    createSettingsWindow();
  });
  updateDisplaySettings(displaySettings);
  return box;
}

function addSettingsBox() {
  const box = document.createElement("div");
  box.className = "info-fixed-box hide-view arrow-left";
  box.id = "display-settings-box";
  box.innerHTML = `
    <div class="displays actions row-actions">
      <button class="action-btn" data-display="1" data-key="primary-display" title="Toggle Display for Primary Chapter">1️⃣</button>
      <button class="action-btn" data-display="2" data-key="parallel-display" title="Toggle Display for Secondary Chapter">2️⃣</button>
    </div>
    <div class="actions row-actions">
      <span data-key="fill" class="fill"></span>
      <button class="action-btn" data-key="settings" title="Projector Screen Settings (Advanced)">🛠</button>
    </div>      
  `;
  document.body.appendChild(box);
  return box;
}

function updateDisplaySettings(settings) {
  //console.warn("displaySettings", settings);
  $$("#display-settings-box .displays [data-display]").forEach(btn => {
    const display = btn.dataset.display * 1;
    //console.warn("display", btn, display);
    // TODO try to improve using boolean checks
    if (display === 1) {
      if (settings === 1 || settings === 3) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    } else if (display === 2) {
      if (settings === 2 || settings === 3) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    }
  });
}
