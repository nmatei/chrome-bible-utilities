let indexedDBInstance;

export const BIBLE_TABS_URL = [
  "https://my.bible.com/bible*",
  "https://my.bible.com/*/bible*",
  "https://www.bible.com/bible*",
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

export function applyRootStyles(options) {
  const styles = mapStyles(options);
  const root = $(":root");
  Object.entries(styles).forEach(([key, value]) => {
    root.style.setProperty("--" + key, value);
  });

  $(".page-background-image").style.backgroundImage = options.pageBackgroundImage;
  const clockClasses = $(".clock-container").classList;
  clockClasses.remove("clock-none", "clock-top-right", "clock-bottom-right", "clock-bottom-left");
  clockClasses.add(`clock-${options.clockPosition}`);
}

/**
 * Initialize the form with the user's option settings
 * @returns {Promise<Object>}
 */
export async function initUserOptions() {
  return applyLoadOptions(getDefaults());
}

export async function applyLoadOptions(options) {
  const storageData = await chrome.storage.sync.get("options");
  //console.warn("loadOptions", options, storageData.options);
  Object.assign(options, storageData.options);

  indexedDBInstance = indexedDBInstance || (await initFilesDB());
  const file = await retrieveFile(options.pageBackgroundImageKey);
  options.pageBackgroundImage = file ? `url(${file.data})` : "none";
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
