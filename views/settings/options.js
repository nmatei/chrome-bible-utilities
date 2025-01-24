import {
  getDefaults,
  cleanOptions,
  initUserOptions,
  storeFile,
  applyRootStyles,
  mapPreviewValue,
  retrieveFiles,
  removeFile,
  retrieveFile
} from "./common.js";
import { createColorPicker } from "../common/color/picker.js";
import { simpleAlert, simpleConfirm } from "../common/simplePrompt/simplePrompt.js";

// ================================
//    C o n s t a n t s
// ================================

const optionsForm = $("#optionsForm");

let options = await initUserOptions();

// ================================
//   Helper functions
// ================================

function getSlideSelector(selected = ".selected") {
  return $(`#slides-master-list .background-preview${selected}`);
}

function createColorFields() {
  [
    {
      id: "pageBackgroundColor",
      label: "Background Color"
    },
    {
      id: "referenceColor",
      label: "Reference/Title Color"
    },
    "verseNumberColor",
    "parallelVerseNumberColor",
    "verseColor",
    "parallelVerseColor",
    "parallelSeparatorTopColor",
    "parallelSeparatorMiddleColor",
    "parallelSeparatorBottomColor"
  ].forEach(field => {
    field = typeof field === "string" ? { id: field } : field;
    createColorPicker({
      value: "#000000",
      name: field.id,
      required: true,
      ...field
    });
  });
}

const mapPreviewSelectors = {
  slideName: '.selected [data-preview="slideName"]',
  slideDescription: '.selected [data-preview="slideDescription"]'
};

function updateFormPreviewValues(values) {
  Object.entries(values).forEach(([key, value]) => {
    const preview = $(mapPreviewSelectors[key] || `[data-preview="${key}"]`);
    if (preview) {
      preview.innerText = mapPreviewValue(key, value);
    }
  });
}

function previewStyles(slide) {
  applyRootStyles(slide, getSlideSelector());
  updateFormPreviewValues(slide);
  return chrome.runtime.sendMessage({
    action: "previewRootStyles",
    payload: slide
  });
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject("wrong file type selected");
      return;
    }
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        resolve({
          data: reader.result,
          fileName: file.name
        });
      },
      false
    );
    reader.readAsDataURL(file);
  });
}

async function readUploadedFiles(event) {
  const files = Array.from(event.target.files);
  const promises = files.map(file => readImageFile(file));
  const results = await Promise.allSettled(promises);
  return results.filter(r => r.status === "fulfilled").map(r => r.value);
}

async function saveStyles(options, close = true) {
  const saveOptions = {
    ...options,
    //selected: options.selected,
    slides: options.slides.map(slide => ({
      ...slide,
      // don't store 'files'
      pageBackgroundImage: "none"
    }))
  };
  await chrome.storage.sync.set({ options: saveOptions });
  if (close) {
    await sleep(1000); // wait until file is saved
    await closeTab();
  }
}

function closeTab() {
  return chrome.runtime.sendMessage({
    action: "closeSettingsTab"
  });
}

async function displayBackgroundImages(slide) {
  const files = await retrieveFiles();
  // TODO make tiles selectable with keyboard...
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

  selectBackgroundImage(slide);
}

function selectBackgroundImage(slide) {
  const list = $("#background-previews");

  const preview = $(".selected", list);
  preview && preview.classList.remove("selected");

  let selected = $(`.background-preview[data-image-key="${slide.pageBackgroundImageKey}"]`, list);
  if (!selected) {
    selected = $(".background-preview", list);
  }
  selected.classList.add("selected");
  selected.scrollIntoView(true);
}

// make sure we retrieve the current slide
function getCurrentSlide(options) {
  return options.slides[options.selected];
}

function selectSlide(slideEl) {
  const prevSlideEl = $("#slides-master-list .selected");
  prevSlideEl && prevSlideEl.classList.remove("selected");
  slideEl.classList.add("selected");
  slideEl.scrollIntoView(true);
}

function updateCurrentSlide(options) {
  const slide = getCurrentSlide(options);
  setFormValues(optionsForm, slide);
  previewStyles(slide);
  selectBackgroundImage(slide);
  focusFirstInput(); // scroll to top
  return slide;
}

async function importFiles(files) {
  const savedFiles = await retrieveFiles();
  const fileObjects = files.map(({ content }) => ({
    data: content.data,
    fileName: content.fileName
  }));
  const results = await Promise.allSettled(
    fileObjects.map(fileObject => {
      const savedFile = savedFiles.find(file => file.content.data === fileObject.data);
      if (savedFile) {
        //console.warn("Duplicate content", savedFile);
        return Promise.resolve(savedFile.key);
      }
      return storeFile(fileObject);
    })
  );
  return results.map((result, i) => ({
    importKey: files[i].key,
    key: result.value,
    data: files[i].content.data
  }));
}

function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      async function (event) {
        const optionsStr = event.target.result;
        try {
          const content = JSON.parse(optionsStr);
          if (content.slides && content.files) {
            resolve(content);
          }
        } catch (error) {
          reject(error);
        }
      },
      false
    );
    reader.readAsText(file);
  });
}

async function inportSettings(e) {
  const [file] = e.target.files;
  if (!file || !file.type.startsWith("application/json")) {
    return;
  }
  try {
    const content = await readJsonFile(file);
    const fileKeys = await importFiles(content.files);
    content.slides.forEach(slide => {
      const file = fileKeys.find(file => file.importKey === slide.pageBackgroundImageKey);
      const duplicate = options.slides.find(s => s.slideName === slide.slideName);
      const newSlide = {
        ...getDefaults(),
        ...cleanOptions(slide),
        pageBackgroundImageKey: file ? file.key : -1,
        pageBackgroundImage: file ? `url(${file.data})` : "none"
      };

      if (duplicate && JSON.stringify(duplicate) === JSON.stringify(newSlide)) {
        return;
      }

      options.slides.push({
        ...newSlide,
        slideName: duplicate ? `${slide.slideName} (copy)` : slide.slideName
      });
    });

    const slide = getCurrentSlide(options);
    await displayBackgroundImages(slide);

    displaySlides(options);
    await saveStyles(options, false);
  } catch (e) {
    console.warn("Error parsing imported content", e);
    await simpleAlert("Error parsing imported content!");
  }
}

function getFileName(name) {
  return (name || "filename").replace(/\\|\:|\/|\*|\?|\<|\>\|/gi, "_");
}

async function exportSettings(slides, all = true) {
  const files = await retrieveFiles();
  const content = {
    slides: slides.map(slide => ({
      ...slide,
      // don't store 'files' they will be stored separately
      pageBackgroundImage: "none"
    })),
    files: all ? files : files.filter(file => slides.some(slide => slide.pageBackgroundImageKey === file.key))
  };

  const optionsStr = JSON.stringify(content, null, 2);
  const name = all ? "bible-settings.json" : `bible-settings-${slides[0].slideName}.json`;
  download(optionsStr, getFileName(name), "application/json");
}

async function removeSlide(index) {
  let slide = getCurrentSlide(options);
  if (options.slides.length > 1) {
    const answer = await simpleConfirm("Do you want to remove selected Slide?");
    if (answer) {
      options.slides.splice(index, 1);
      const sel = options.selected;
      options.selected = sel === index ? 0 : sel > index ? sel - 1 : sel;
      displaySlides(options);
      slide = updateCurrentSlide(options);
    }
  }
  return slide;
}

function duplicateSlide(slide) {
  options.slides.push({
    ...slide,
    slideName: slide.slideName + " (copy)"
  });
  options.selected = options.slides.length - 1;
  displaySlides(options);
  return updateCurrentSlide(options);
}

function swapSlides(options, index1, index2) {
  swapElements(options.slides, index1, index2);
  const sel = options.selected;
  options.selected = sel === index1 ? index2 : sel === index2 ? index1 : sel;
  displaySlides(options);
}

function showSlidesContextMenu(e, slideEl) {
  const children = Array.from(slideEl.closest("#slides-master-list").children);
  const index = children.indexOf(slideEl);

  const actions = [
    {
      text: "Move Up",
      icon: icons.up,
      disabled: index === 0,
      handler: () => {
        swapSlides(options, index, index - 1);
      }
    },
    {
      text: "Move Down",
      icon: icons.down,
      disabled: index === children.length - 1,
      handler: () => {
        swapSlides(options, index, index + 1);
      }
    },
    "-",
    {
      text: "Copy / Duplicate",
      icon: icons.copy,
      handler: () => {
        const slide = options.slides[index];
        duplicateSlide(slide);
      }
    },
    {
      text: "Export Slide",
      icon: icons.export,
      handler: () => {
        const slide = options.slides[index];
        exportSettings([slide], false);
      }
    },
    "-",
    {
      text: "Remove",
      icon: icons.removeSlide,
      cls: "alert-color",
      disabled: options.slides.length === 1,
      handler: async () => {
        await removeSlide(index);
      }
    }
  ];
  const menu = getContextMenu(actions);
  showByCursor(menu, e);
}

function initEvents() {
  let slide = getCurrentSlide(options);

  Object.entries(slide).forEach(([key, value]) => {
    const input = optionsForm[key];
    if (input) {
      input.addEventListener("change", async event => {
        slide = getCurrentSlide(options);
        const input = event.target;
        if (input.type === "file") {
          const images = await readUploadedFiles(event);
          await Promise.allSettled(images.map(file => storeFile(file)));
          previewStyles(slide);
          await displayBackgroundImages(slide);
        } else if (input.checkValidity()) {
          slide[input.name] = input.value;
          previewStyles(slide);
        }
      });
    }
  });

  optionsForm.addEventListener("submit", async e => {
    e.preventDefault();
    await saveStyles(options);
  });

  $("#uploadSettings").addEventListener("change", e => {
    inportSettings(e);
  });

  $("#settings-actions").addEventListener("click", async e => {
    const btn = e.target.closest("button.action-btn");
    if (!btn) {
      return;
    }
    const action = btn.getAttribute("data-key");
    switch (action) {
      case "import": {
        $("#uploadSettings").click();
        break;
      }
      case "export": {
        exportSettings(options.slides, true);
        break;
      }
      case "defaults": {
        onApplyDefaults(slide);
        break;
      }
      case "cancel": {
        onCancel();
        break;
      }
    }
  });

  $("#slides-master .actions").addEventListener(
    "click",
    debounce(async e => {
      const btn = e.target.closest("button.action-btn");
      if (!btn) {
        return;
      }
      const action = btn.getAttribute("data-key");
      switch (action) {
        case "copy": {
          slide = getCurrentSlide(options);
          slide = duplicateSlide(slide);
          break;
        }
        case "add": {
          const slideEl = addSlideEl("New Slide", "Description");
          selectSlide(slideEl);
          options.slides.push({
            ...getDefaults(),
            slideName: "New Slide",
            slideDescription: "Description"
          });
          options.selected = options.slides.length - 1;
          slide = updateCurrentSlide(options);
          break;
        }
        case "remove": {
          slide = await removeSlide(options.selected);
          break;
        }
      }
    }, 200)
  );

  $("#slides-master-list").addEventListener("click", function (e) {
    const slideEl = e.target.closest(".background-preview");
    if (slideEl) {
      selectSlide(slideEl);
      options.selected = Array.from(slideEl.closest("#slides-master-list").children).indexOf(slideEl);
      slide = updateCurrentSlide(options);
    }
  });

  $("#slides-master-list").addEventListener("contextmenu", function (e) {
    const slideEl = e.target.closest(".background-preview");
    if (slideEl) {
      e.preventDefault();
      showSlidesContextMenu(e, slideEl);
    }
  });

  $("#background-previews").addEventListener("click", async function (e) {
    const preview = e.target.closest(".background-preview");
    if (preview) {
      const fileKey = preview.dataset.imageKey * 1;
      if (e.target.closest("button.action-btn")) {
        const action = e.target.getAttribute("data-key");
        switch (action) {
          case "remove": {
            e.preventDefault();
            const usedInSlide = options.slides.find(slide => slide.pageBackgroundImageKey === fileKey);
            if (usedInSlide) {
              await simpleAlert(
                `This image is used in a slide (<code>${usedInSlide.slideName}</code>). You have to replace it first.`
              );
              return;
            }
            const answer = await simpleConfirm("This action can't be reverted. Continue?");
            if (answer) {
              await removeFile(fileKey);
              await displayBackgroundImages(options);
              if (preview.classList.contains("selected")) {
                slide.pageBackgroundImageKey = -1;
                slide.pageBackgroundImage = "none";
                previewStyles(slide);
              }
            }
            return;
          }
        }
      } else {
        $(".selected", this).classList.remove("selected");
        preview.classList.add("selected");
        const file = await retrieveFile(fileKey);
        slide.pageBackgroundImageKey = fileKey;
        slide.pageBackgroundImage = file ? `url(${file.data})` : "none";
        previewStyles(slide);
      }
    }
  });
}

function onApplyDefaults(slide) {
  const { slideName, slideDescription, ...defaults } = getDefaults();
  Object.assign(slide, defaults);
  setFormValues(optionsForm, slide);
  previewStyles(slide);
  // TODO reselect current background image
}

async function onCancel() {
  options = await initUserOptions();
  const slide = getCurrentSlide(options);
  await previewStyles(slide);
  closeTab();
}

function addSlideEl(name, description) {
  const slideEl = document.createElement("div");
  slideEl.classList.add("background-preview", "page-background-image", "clock-container", "clock-top-right");
  slideEl.dataset.text = "10:00";
  slideEl.dataset.id = name;
  slideEl.innerHTML = `<h2 class="reference" data-preview="slideName">${name}</h2><p data-preview="slideDescription">${description}</p>`;
  $("#slides-master-list").appendChild(slideEl);
  return slideEl;
}

function displaySlides(options) {
  $("#slides-master-list").innerHTML = "";
  let currentSlideEl;
  options.slides.forEach((slide, index) => {
    const slideEl = addSlideEl(slide.slideName, slide.slideDescription);
    if (index === options.selected) {
      currentSlideEl = slideEl;
    }
    applyRootStyles(slide, slideEl);
  });
  selectSlide(currentSlideEl);
}

function focusFirstInput() {
  const firstInput = $("input", optionsForm);
  firstInput && firstInput.focus();
}

function updateIcons() {
  $$("[data-icon]").forEach(function (el) {
    const icon = icons[el.dataset.icon];
    if (icon) {
      el.innerHTML = icon + " " + el.innerHTML;
    }
  });
}

async function start() {
  updateIcons();
  //console.debug("initial options", options);
  createColorFields();
  const slide = getCurrentSlide(options);
  displaySlides(options);
  setFormValues(optionsForm, slide);
  updateFormPreviewValues(slide);
  await displayBackgroundImages(slide);
  focusFirstInput();

  initEvents();
}

// ================================
//   S t a r t
// ================================

await start();
