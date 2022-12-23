chrome.action.onClicked.addListener(tab => {
  const url = "https://my.bible.com/bible";
  if (tab.url === "chrome://newtab/") {
    chrome.tabs.remove(tab.id);
  }
  if (!tab.url.startsWith(url)) {
    chrome.tabs.create({ url: url });
  }
});

async function createTab() {
  return await chrome.windows.create({
    url: chrome.runtime.getURL("views/projector/tab.html"),
    // state: "maximized",
    // state: "fullscreen",
    width: 800,
    height: 600,
    top: 200,
    left: 100,
    type: "popup"
  });
}

chrome.windows.onRemoved.addListener(async windowId => {
  const tabs = await chrome.tabs.query({ url: ["https://my.bible.com/bible/*"] });
  tabs.forEach(async tab => {
    chrome.tabs.sendMessage(tab.id, {
      action: "windowRemoved",
      payload: { id: windowId }
    });
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "createTab": {
      chrome.windows.getAll({ windowTypes: ["popup"] }).then(windows => {
        if (windows.length) {
          setTimeout(() => {
            sendResponse({
              status: "existing",
              id: windows[0].id
            });
          }, 100);
        } else {
          createTab().then(w => {
            setTimeout(() => {
              sendResponse({
                status: "created",
                id: w.id
              });
            }, 100);
          });
        }
      });
      return true;
    }
    case "removeTab": {
      // wait until is removed then do tabs.query
      setTimeout(() => {
        chrome.tabs.query({ url: ["https://my.bible.com/bible/*"] }).then(tabs => {
          if (!tabs.length) {
            chrome.windows.remove(request.payload);
          } else {
            console.info("There are %d tabs opened", tabs.length, tabs);
          }
        });
      }, 100);
      sendResponse({ status: 200 });
      break;
    }
    case "focus": {
      chrome.windows.update(request.payload.id, { focused: true }).then(() => {
        sendResponse({ status: 200 });
      });
      return true;
    }
  }
});
