// TODO seems to work only when I click from extension
let projectorPageId;

const projectorPage = "views/projector/tab.html";

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
    url: chrome.runtime.getURL(projectorPage),
    // state: "maximized",
    // state: "fullscreen",
    width: 800,
    height: 600,
    top: 200,
    left: 100,
    type: "popup"
  });
}

function getProjectorPageWindow(sendResponse) {
  if (projectorPageId) {
    chrome.windows
      .get(projectorPageId)
      .then(win => {
        console.warn("windows", projectorPageId, win);
        setTimeout(() => {
          sendResponse({
            status: "existing",
            id: win.id
          });
        }, 100);
      })
      .catch(e => {
        console.warn("error in getProjectorPageWindow", e);
      });
  } else {
    createTab().then(w => {
      projectorPageId = w.id;
      setTimeout(() => {
        sendResponse({
          status: "created",
          id: w.id
        });
      }, 100);
    });
  }
}

chrome.windows.onRemoved.addListener(async windowId => {
  if (projectorPageId === windowId) {
    projectorPageId = null;
  }
  const tabs = await chrome.tabs.query({
    url: ["https://my.bible.com/bible/*"]
  });
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
      console.warn("projectorPageId", projectorPageId);
      getProjectorPageWindow(sendResponse);
      return true;
    }
    case "removeTab": {
      // wait until is removed then do tabs.query
      setTimeout(async () => {
        const tabs = await chrome.tabs.query({
          url: ["https://my.bible.com/bible/*"]
        });
        if (!tabs.length) {
          chrome.windows.remove(request.payload);
        } else {
          console.info("There are %d tabs opened", tabs.length, tabs);
        }
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
