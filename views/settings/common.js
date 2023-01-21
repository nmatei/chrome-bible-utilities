export const BIBLE_TABS_URL = [
  "https://my.bible.com/bible*",
  "https://my.bible.com/*/bible*",
  "https://www.bible.com/bible*",
  "https://www.bible.com/*/bible*"
];

export function getCssDefaultProperties() {
  return {
    rootPaddingTop: "5",
    rootPaddingRight: "5",
    rootPaddingBottom: "5",
    rootPaddingLeft: "5",
    pageBackgroundColor: "#000000",
    referenceColor: "#d3d3d3",
    referenceFontSize: "40",
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
    maxFontSize: "100"
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
  return options;
}
