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
    versesDisplay: "inline",
    parallelSeparatorTopHeight: "1",
    parallelSeparatorMiddleHeight: "1",
    parallelSeparatorBottomHeight: "1",
    parallelSeparatorTopColor: "#d3d3d3",
    parallelSeparatorMiddleColor: "#ffffff",
    parallelSeparatorBottomColor: "#d3d3d3"
  };
}

export async function applyLoadOptions(options) {
  const storageData = await chrome.storage.sync.get("options");
  //console.warn("loadOptions", options, storageData.options);
  Object.assign(options, storageData.options);
  return options;
}
