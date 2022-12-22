chrome.action.onClicked.addListener(tab => {
  if (!tab.url.startsWith("https://my.bible.com/bible")) {
    chrome.tabs.create({ url: "https://my.bible.com/bible" });

    // chrome.windows.create({
    //   url: chrome.runtime.getURL("views/tab.html"),
    //   type: "popup",
    //   state: "fullscreen"
    // });
  }
});
