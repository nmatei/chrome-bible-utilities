const projectorPage = "views/projector/tab.html";
const settingsPage = "views/settings/options.html";

const projectorStorageKey = "projectorWindowId";
const settingsStorageKey = "settingsWindowId";

chrome.action.onClicked.addListener(tab => {
  const url = "https://my.bible.com/bible";
  if (tab.url === "chrome://newtab/") {
    chrome.tabs.remove(tab.id);
  }
  if (!tab.url.startsWith(url)) {
    chrome.tabs.create({ url: url });
  }
});

chrome.windows.onRemoved.addListener(windowId => {
  // in case window is closed from 'x' button / Alt+F4
  notifyOnWindowRemoved(windowId);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "createTab": {
      getWindow(projectorStorageKey, createProjectorTab, sendResponse);
      return true;
    }
    case "removeTab": {
      checkIfLastTabClosed(request.payload);
      sendResponse({ status: 200 });
      break;
    }
    case "focusTab": {
      chrome.windows.update(request.payload.id, { focused: true }).then(() => {
        sendResponse({ status: 200 });
      });
      return true;
    }
    case "createSettingsTab": {
      getWindow(settingsStorageKey, createSettingsTab, sendResponse).then(win => {
        chrome.windows.update(win.id, { focused: true });
      });
      return true;
    }
    case "closeSettingsTab": {
      closeSettingsWindow().then(() => {
        sendResponse({ status: 200 });
      });
      return true;
    }
  }
});

async function getWindowId(key) {
  const result = await chrome.storage.session.get(key);
  return result[key];
}

function setWindowId(key, id) {
  chrome.storage.session.set({
    [key]: id
  });
}

function createWindow(config) {
  return chrome.windows.create({
    width: 800,
    height: 600,
    top: 200,
    left: 100,
    type: "popup",
    ...config
  });
}

async function getWindow(key, createWindowFn, sendResponse) {
  return new Promise(async resolve => {
    let id = await getWindowId(key);
    let win;
    if (id) {
      try {
        win = await chrome.windows.get(id);
      } catch (e) {}
      if (win) {
        setTimeout(() => {
          sendResponse({
            status: "existing",
            id: win.id
          });
          resolve(win);
        }, 100);
        return;
      }
    }

    win = await createWindowFn();
    setWindowId(key, win.id);
    setTimeout(() => {
      sendResponse({
        status: "created",
        id: win.id
      });
      resolve(win);
    }, 200);
  });
}

function createProjectorTab() {
  return createWindow({
    url: chrome.runtime.getURL(projectorPage)
    // state: "maximized",
    // state: "fullscreen",
  });
}

function createSettingsTab() {
  return createWindow({
    url: chrome.runtime.getURL(settingsPage),
    width: 600,
    height: 500,
    left: 500
  });
}

async function notifyOnWindowRemoved(windowId) {
  const previewId = await getWindowId(projectorStorageKey);
  if (previewId === windowId) {
    setWindowId(projectorStorageKey, null);

    const tabs = await chrome.tabs.query({
      url: ["https://my.bible.com/bible/*"]
    });
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: "windowRemoved",
        payload: { id: windowId }
      });
    });
  }
}

async function closeSettingsWindow() {
  const id = await getWindowId(settingsStorageKey);
  if (id) {
    setWindowId(settingsStorageKey, null);
    chrome.windows.remove(id);
  }
}

/**
 * wait until is removed then do tabs.query
 * to see if we should also close projector window (if is last)
 * @param id
 */
function checkIfLastTabClosed(id) {
  setTimeout(async () => {
    const tabs = await chrome.tabs.query({
      url: ["https://my.bible.com/bible/*"]
    });
    if (!tabs.length) {
      chrome.windows.remove(id);
    } else {
      console.info("There are %d tabs opened", tabs.length, tabs);
    }
  }, 100);
}
