export function getDefaults() {
  return {
    rootPaddingTop: "65",
    rootPaddingRight: "0",
    rootPaddingBottom: "40",
    rootPaddingLeft: "0",
    pageBackgroundColor: "#000000",
    referenceColor: "#ffffff",
    referenceFontSize: "40",
    verseNumberColor: "#ffffff",
    verseColor: "#ffffff"
  };
}

export async function applyLoadOptions(options) {
  const storageData = await chrome.storage.sync.get("options");
  //console.warn("loadOptions", options, storageData.options);
  Object.assign(options, storageData.options);
  return options;
}
