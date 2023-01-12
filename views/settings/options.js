// In-page cache of the user's options
import { applyLoadOptions, getDefaults, initUserOptions } from "./common.js";

const options = await initUserOptions();

const optionsForm = document.getElementById("optionsForm");

setFormValues(optionsForm, options);

initEvents();

function setFormValues(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    const input = form[key];
    if (input) {
      input.value = value;
    }
  });
}

function previewStyles(options) {
  return chrome.runtime.sendMessage({
    action: "previewRootStyles",
    payload: options
  });
}

async function saveStyles(options) {
  await chrome.storage.sync.set({ options });
  await closeTab();
}

function closeTab() {
  return chrome.runtime.sendMessage({
    action: "closeSettingsTab"
  });
}

function initEvents() {
  Object.entries(options).forEach(([key, value]) => {
    const input = optionsForm[key];
    if (input) {
      input.addEventListener("change", event => {
        const input = event.target;
        if (input.checkValidity()) {
          options[input.name] = input.value;
          previewStyles(options);
        }
      });
    }
  });

  optionsForm.addEventListener("submit", async e => {
    e.preventDefault();
    await saveStyles(options);
  });

  document.getElementById("settings-actions").addEventListener("click", async e => {
    if (e.target.matches(".action-btn")) {
      const action = e.target.getAttribute("data-key");
      switch (action) {
        case "defaults": {
          Object.assign(options, getDefaults());
          setFormValues(optionsForm, options);
          previewStyles(options);
          break;
        }
        case "cancel": {
          await applyLoadOptions(options);
          await previewStyles(options);
          closeTab();
          break;
        }
      }
    }
  });
}
