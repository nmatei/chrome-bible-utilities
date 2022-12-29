const projectorPage = "views/projector/tab.html";
const settingsPage = "views/settings/options.html";

const projectorStorageKey = "projectorWindow";
const settingsStorageKey = "settingsWindow";
const allWindows = [projectorStorageKey, settingsStorageKey];

const updateWindowStates = ["maximized", "fullscreen"];

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

chrome.windows.onBoundsChanged.addListener(win => {
  changeWindowsBounds(win);
});

chrome.tabs.onRemoved.addListener(() => {
  checkIfLastTabClosed();
});

async function changeWindowsBounds(win) {
  const windows = await chrome.storage.sync.get(allWindows);
  const updateWin = Object.entries(windows).find(([key, w]) => w.id === win.id);

  if (updateWin) {
    const [key, settings] = updateWin;
    Object.assign(settings, win);
    await setWindowSettings(key, win.id, settings);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "createTab": {
      // TODO https://developer.chrome.com/articles/multi-screen-window-placement/
      getWindow(projectorStorageKey, createProjectorTab).then((win, status) => {
        sendResponse({
          status,
          id: win.id
        });
      });
      return true;
    }
    case "focusTab": {
      chrome.windows.update(request.payload.id, { focused: true }).then(() => {
        sendResponse({ status: 200 });
      });
      return true;
    }
    case "createSettingsTab": {
      getWindow(settingsStorageKey, createSettingsTab).then(async (win, status) => {
        await chrome.windows.update(win.id, { focused: true });
        sendResponse({
          status,
          id: win.id
        });
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

async function getWindowSettings(key) {
  const result = await chrome.storage.sync.get(key);
  return result[key];
}

async function setWindowSettings(key, id, settings) {
  if (!settings) {
    settings = await getWindowSettings(key);
  }
  if (!settings) {
    settings = {};
  }
  chrome.storage.sync.set({
    [key]: {
      ...settings,
      id
    }
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

async function getWindow(key, createWindowFn) {
  return new Promise(async resolve => {
    const settings = await getWindowSettings(key);
    let existingId = settings ? settings.id : "";
    let win;
    if (existingId) {
      try {
        win = await chrome.windows.get(existingId);
      } catch (e) {}
      if (win) {
        setTimeout(() => {
          resolve(win, "existing");
        }, 100);
        return;
      }
    }

    const createSettings = getCreateSettings(settings);
    win = await createWindowFn(createSettings);
    await setWindowSettings(key, win.id, settings);
    if (settings && updateWindowStates.includes(settings.state)) {
      await chrome.windows.update(win.id, {
        state: settings.state
      });
    }
    setTimeout(() => {
      resolve(win, "created");
    }, 200);
  });
}

function getCreateSettings(settings = {}) {
  const { id, alwaysOnTop, state, ...createSettings } = settings;
  if (!updateWindowStates.includes(state)) {
    createSettings.state = state;
  }
  return createSettings;
}

function createProjectorTab(settings = {}) {
  return createWindow({
    url: chrome.runtime.getURL(projectorPage),
    ...settings
  });
}

function createSettingsTab(settings = {}) {
  return createWindow({
    url: chrome.runtime.getURL(settingsPage),
    width: 600,
    height: 500,
    ...settings
  });
}

async function notifyOnWindowRemoved(windowId) {
  const settings = await getWindowSettings(projectorStorageKey);
  if (settings && settings.id === windowId) {
    await setWindowSettings(projectorStorageKey, null, settings);

    const tabs = await getBibleTabs();
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: "windowRemoved",
        payload: { id: windowId }
      });
    });
  }
}

async function closeSettingsWindow() {
  const settings = await getWindowSettings(settingsStorageKey);
  if (settings && settings.id) {
    await setWindowSettings(settingsStorageKey, null, settings);
    chrome.windows.remove(settings.id);
  }
}

/**
 * wait until is removed then do tabs.query
 * to see if we should also close projector window (if is last)
 */
function checkIfLastTabClosed() {
  setTimeout(async () => {
    const tabs = await getBibleTabs();
    if (!tabs.length) {
      const settings = await getWindowSettings(projectorStorageKey);
      const existingId = settings ? settings.id : "";
      if (existingId) {
        chrome.windows.remove(existingId);
      }
    } else {
      console.info("There are %d tabs opened", tabs.length, tabs);
    }
  }, 100);
}

function getBibleTabs() {
  return chrome.tabs.query({
    url: ["https://my.bible.com/bible*", "https://my.bible.com/*/bible*"]
  });
}
