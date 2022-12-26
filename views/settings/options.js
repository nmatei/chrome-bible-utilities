// In-page cache of the user's options
const options = {
  pageBackgroundColor: "#000",
  rootPadding: "65px 0px 40px 0px",
  referenceColor: "#ffffff",
  referenceFontSize: "40px",
  verseNumberColor: "#ffffff",
  verseColor: "#ffffff"
};

const optionsForm = document.getElementById("optionsForm");

// Initialize the form with the user's option settings
const storageData = await chrome.storage.sync.get("options");
Object.assign(options, storageData.options);
console.warn("options", options, storageData.options);
Object.entries(options).forEach(([key, value]) => {
  optionsForm[key].value = value;
});

Object.entries(options).forEach(([key, value]) => {
  optionsForm[key].addEventListener("change", event => {
    const target = event.target;
    options[target.name] = target.value;
    //chrome.storage.sync.set({ options });

    chrome.runtime.sendMessage({
      action: "previewRootStyles",
      payload: options
    });
  });
});
