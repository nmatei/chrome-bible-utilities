// In-page cache of the user's options
import {
  applyLoadOptions,
  getDefaults,
  initUserOptions,
  storeFile,
  applyRootStyles,
  retrieveFiles,
  removeFile,
  retrieveFile
} from "./common.js";

const options = await initUserOptions();
const optionsForm = $("#optionsForm");

setFormValues(optionsForm, options);
applyRootStyles(options);

await displayBackgroundImages(options);
initEvents();

function setFormValues(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    const input = form[key];
    if (input && input.type !== "file") {
      input.value = value;
    }
  });
}

function previewStyles(options) {
  applyRootStyles(options);
  return chrome.runtime.sendMessage({
    action: "previewRootStyles",
    payload: options
  });
}

function readUploadedFile(event) {
  return new Promise((resolve, reject) => {
    const input = event.target;
    const file = input.files[0];
    const reader = new FileReader();
    if (file && /\.(jpe?g|png|gif)$/i.test(file.name)) {
      reader.addEventListener(
        "load",
        () => {
          // convert image file to base64 string
          const fileData = reader.result;
          resolve({
            data: fileData,
            fileName: file.name
          });
        },
        false
      );
      reader.readAsDataURL(file);
    } else {
      reject("wrong file selected");
    }
  });
}

async function saveStyles(options) {
  options.pageBackgroundImage = "none"; // don't store 'files'
  await chrome.storage.sync.set({ options });
  await sleep(1000); // wait until file is saved
  await closeTab();
}

function closeTab() {
  return chrome.runtime.sendMessage({
    action: "closeSettingsTab"
  });
}

async function displayBackgroundImages(options) {
  const files = await retrieveFiles();
  const tiles = [
    `<div class="background-preview" data-image-key="-1" title="No background image">
      <h2>None</h2>
    </div>`,
    ...files.map(
      file => `
      <div class="background-preview file" data-image-key="${file.key}" title="${file.content.fileName}">
        <div class="actions">
          <span data-key="fill" class="fill"></span>
          <button type="button" data-key="remove" class="action-btn" title="Remove">✖</button>
        </div>
      </div>`
    )
  ];
  const list = $("#background-previews");
  list.innerHTML = tiles.join("");

  const targets = $$(`.background-preview.file`, list);
  targets.forEach((target, i) => {
    const file = files[i];
    target.style.backgroundImage = `url(${file.content.data})`;
  });

  let selected = $(`.background-preview[data-image-key="${options.pageBackgroundImageKey}"]`, list);
  if (!selected) {
    selected = $(".background-preview", list);
  }
  selected.classList.add("selected");
  selected.scrollIntoView(true);
}

function initEvents() {
  Object.entries(options).forEach(([key, value]) => {
    const input = optionsForm[key];
    if (input) {
      input.addEventListener("change", async event => {
        const input = event.target;
        if (input.type === "file") {
          const fileObject = await readUploadedFile(event);
          const fileKey = await storeFile(fileObject);
          options.pageBackgroundImageKey = fileKey;
          options[input.name] = `url(${fileObject.data})`; // used for preview and display
          previewStyles(options);
          await displayBackgroundImages(options);
        } else if (input.checkValidity()) {
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

  $("#settings-actions").addEventListener("click", async e => {
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

  $("#background-previews").addEventListener("click", async e => {
    const preview = e.target.closest(".background-preview");
    if (preview) {
      const fileKey = preview.dataset.imageKey * 1;
      if (e.target.closest("button.action-btn")) {
        const action = e.target.getAttribute("data-key");
        switch (action) {
          case "remove": {
            e.preventDefault();
            if (confirm("This action can't be reverted. Continue?")) {
              await removeFile(fileKey);
              await displayBackgroundImages(options);
              if (preview.classList.contains("selected")) {
                options.pageBackgroundImageKey = -1;
                options.pageBackgroundImage = "none";
                previewStyles(options);
              }
            }
            return;
          }
        }
      } else {
        $(".selected").classList.remove("selected");
        preview.classList.add("selected");
        const file = await retrieveFile(fileKey);
        options.pageBackgroundImageKey = fileKey;
        options.pageBackgroundImage = file ? `url(${file.data})` : "none";
        previewStyles(options);
      }
    }
  });
}
