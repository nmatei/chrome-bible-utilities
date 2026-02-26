let indexedDBInstance;

export const BIBLE_TABS_URL = [
  "https://www.bible.com/bible*",
  // if we have language in the url...
  "https://www.bible.com/*/bible*"
];

function getCssDefaultProperties() {
  return {
    rootPaddingTop: "5",
    rootPaddingRight: "5",
    rootPaddingBottom: "5",
    rootPaddingLeft: "5",
    pageBackgroundColor: "#000000",
    pageBackgroundImgOpacity: "0",
    referenceColor: "#d3d3d3",
    referenceFontSize: "40",
    referenceFontFamily: "Calibri",
    verseNumberColor: "#d3d3d3",
    verseFontFamily: "Calibri",
    verseColor: "#ffffff",
    parallelVerseNumberColor: "#ededb4",
    parallelVerseColor: "#eded33",
    verseFontWeight: "bold",
    versesDisplay: "inline",
    parallelSeparatorTopHeight: "1",
    parallelSeparatorMiddleHeight: "1",
    parallelSeparatorBottomHeight: "1",
    parallelSeparatorTopColor: "#d3d3d3",
    parallelSeparatorMiddleColor: "#ffffff",
    parallelSeparatorBottomColor: "#d3d3d3"
  };
}

export function getUserSettingsDefaults() {
  return {
    slideName: "Main",
    slideDescription: "Default Slide",
    maxFontSize: "200",
    actionsDisplay: "true",
    clockPosition: "top-right",
    pageBackgroundImage: "none",
    pageBackgroundImageKey: -1
  };
}

export function getDefaults() {
  const cssDefaults = getCssDefaultProperties();
  const defaults = getUserSettingsDefaults();
  return {
    ...cssDefaults,
    ...defaults
  };
}

function mapValue(key, value) {
  if (key.startsWith("rootPadding") || key.endsWith("FontSize") || key.endsWith("Height")) {
    return value + "px";
  }
  return value;
}

const mapPreview = {
  pageBackgroundImgOpacity: value => `${Math.floor(value * 100)}%`
};

export function mapPreviewValue(key, value) {
  return mapPreview[key] ? mapPreview[key](value) : value;
}

export function cleanOptions(slide) {
  const defaults = getDefaults();
  return Object.entries(defaults).reduce((acc, [key]) => {
    if (defaults.hasOwnProperty(key) && slide.hasOwnProperty(key)) {
      acc[key] = slide[key];
    }
    return acc;
  }, {});
}

/**
 * map only css properties from user options
 * @param styles
 * @returns {{}}
 */
function mapStyles(styles) {
  const cssDefaults = getCssDefaultProperties();
  return Object.entries(styles).reduce((acc, [key, value]) => {
    if (cssDefaults.hasOwnProperty(key)) {
      acc[key] = mapValue(key, value);
    }
    return acc;
  }, {});
}

export function applyRootStyles(slide, el) {
  const styles = mapStyles(slide);
  const root = el || $(":root");
  Object.entries(styles).forEach(([key, value]) => {
    root.style.setProperty("--" + key, value);
  });
  (el || $(".page-background-image")).style.backgroundImage = slide.pageBackgroundImage;
  const clockClasses = (el || $(".clock-container")).classList;
  clockClasses.remove("clock-none", "clock-top-right", "clock-bottom-right", "clock-bottom-left");
  clockClasses.add(`clock-${slide.clockPosition}`);
}

/**
 * Initialize the form with the user's option settings
 * @param {Boolean} currentSlide
 * @param {Number} windowIndex - for projector tabs (1 or 2), used to get correct slide
 * @returns {Promise<Object>}
 */
export async function initUserOptions(currentSlide, windowIndex) {
  const options = await applyLoadOptions(getDefaults(), currentSlide, windowIndex);
  if (currentSlide && windowIndex) {
    // For projector tabs, get the slide for the specific window
    const selectedIndex = Array.isArray(options.selected)
      ? options.selected[windowIndex - 1] || 0
      : options.selected || 0;
    return options.slides[selectedIndex] || options.slides[0];
  }
  return currentSlide ? options.slides[0] : options; // Fallback for settings
}

async function applyBackgroundImage(options, currentSlide, windowIndex) {
  indexedDBInstance = indexedDBInstance || (await initFilesDB());

  if (currentSlide && windowIndex) {
    // For projector tabs, load background image for the specific slide
    const selectedIndex = Array.isArray(options.selected)
      ? options.selected[windowIndex - 1] || 0
      : options.selected || 0;
    const slide = options.slides[selectedIndex];

    if (slide && slide.pageBackgroundImageKey !== undefined) {
      const file = await retrieveFile(slide.pageBackgroundImageKey);
      slide.pageBackgroundImage = file ? `url(${file.data})` : "none";
    } else {
      if (slide) {
        slide.pageBackgroundImage = "none";
      }
    }
  } else {
    // For settings window, load all background images
    const files = await Promise.all(
      options.slides.map(slide => {
        return retrieveFile(slide.pageBackgroundImageKey);
      })
    );
    options.slides.forEach((slide, index) => {
      const file = files[index];
      slide.pageBackgroundImage = file ? `url(${file.data})` : "none";
    });
  }
}

export async function applyLoadOptions(defaultSlideOptions, currentSlide, windowIndex) {
  const storageData = await chrome.storage.sync.get("options");
  let options = storageData.options;

  // TODO after all clients have the new version of the extension, remove this block
  //    migrate the data to multiple slides
  if (!options || !options.slides) {
    options = {
      selected: [0, 0],
      slides: [
        {
          ...storageData.options
        }
      ]
    };
  }

  // Migrate old settings from number to array (similar to displaySettings migration)
  if (typeof options.selected === "number") {
    const oldSelected = options.selected;
    options.selected = [oldSelected, oldSelected];
    await chrome.storage.sync.set({ options });
  } else if (!Array.isArray(options.selected)) {
    options.selected = [0, 0];
    await chrome.storage.sync.set({ options });
  }

  options.slides = options.slides.map(slide => ({
    ...defaultSlideOptions,
    ...slide
  }));

  await applyBackgroundImage(options, currentSlide, windowIndex);

  return options;
}

export function initFilesDB() {
  // https://blog.bitsrc.io/different-ways-to-store-data-in-browser-706a2afb4e58#:~:text=IndexedDB%20is%20powerful%20and%20can,has%20a%20limited%20storage%20capacity.
  const openRequest = indexedDB.open("fileDB", 1);
  openRequest.onupgradeneeded = event => {
    const db = event.target.result;
    // Create an object store to store the file
    const fileStore = db.createObjectStore("files", { autoIncrement: true });
  };

  return new Promise(resolve => {
    openRequest.onsuccess = event => {
      const db = event.target.result;
      resolve(db);
    };
  });
}

/**
 * Retrieve the file from IndexedDB and display it
 */
export function retrieveFile(fileKey) {
  if (fileKey === -1) {
    return Promise.resolve(null);
  }
  const transaction = indexedDBInstance.transaction("files", "readonly");
  const fileStore = transaction.objectStore("files");
  const getRequest = fileStore.get(fileKey);

  return new Promise(resolve => {
    getRequest.onsuccess = event => {
      const file = event.target.result;
      if (file) {
        resolve(file);
      } else {
        resolve(null);
      }
    };
  });
}

/**
 * Retrieve the file from IndexedDB and display it
 */
export function retrieveFiles() {
  return new Promise(resolve => {
    const transaction = indexedDBInstance.transaction("files", "readonly");
    const fileStore = transaction.objectStore("files");
    const getRequest = fileStore.openCursor();
    const allFiles = [];

    getRequest.onsuccess = event => {
      const cursor = event.target.result;
      if (cursor) {
        allFiles.push({
          key: cursor.key,
          content: cursor.value
        });
        cursor.continue();
      } else {
        // All files have been collected
        //console.log("All files retrieved:", allFiles);
        resolve(allFiles);
      }
    };
  });
}

/**
 * Store the file in IndexedDB
 * @param fileObject
 */
export function storeFile(fileObject) {
  return new Promise((resolve, reject) => {
    const transaction = indexedDBInstance.transaction("files", "readwrite");
    const fileStore = transaction.objectStore("files");
    const addRequest = fileStore.add(fileObject);
    addRequest.onsuccess = e => {
      const fileKey = e.target.result;
      resolve(fileKey);
    };
    addRequest.onerror = () => {
      reject("Error storing file in IndexedDB.");
    };
  });
}

export function removeFile(fileKey) {
  return new Promise((resolve, reject) => {
    const transaction = indexedDBInstance.transaction("files", "readwrite");
    const fileStore = transaction.objectStore("files");
    const deleteRequest = fileStore.delete(fileKey);

    deleteRequest.onsuccess = () => {
      //console.log("File removed from IndexedDB.");
      resolve();
    };
    deleteRequest.onerror = () => {
      reject("Error removing file from IndexedDB.");
    };
  });
}
