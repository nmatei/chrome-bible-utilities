const BIBLE_TABS_URL = [
  "https://my.bible.com/bible*",
  "https://my.bible.com/*/bible*",
  "https://www.bible.com/bible*",
  "https://www.bible.com/*/bible*"
];
const DEFAULT_URL = "https://my.bible.com/bible";

const projectorPage = "views/projector/tab.html";
const settingsPage = "views/settings/options.html";

const projectorStorageKey = "projectorWindow";
const settingsStorageKey = "settingsWindow";
const allWindows = [projectorStorageKey, settingsStorageKey];

const postCreateWindowStates = ["maximized", "fullscreen"];
const ignoreCreateWindowStates = [...postCreateWindowStates, "minimized"];

chrome.action.onClicked.addListener(tab => {
  if (tab.url === "chrome://newtab/") {
    chrome.tabs.remove(tab.id);
  }

  if (!BIBLE_TABS_URL.some(url => tab.url.match(url))) {
    chrome.tabs.create({ url: DEFAULT_URL });
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

// https://stackoverflow.com/questions/11555051/chrome-extension-update-notification
// chrome.runtime.onInstalled.addListener(details => {
//   setTimeout(async () => {
//     await notifyAllWindows({
//       action: "install",
//       payload: {
//         reason: details.reason,
//         previousVersion: details.previousVersion,
//         version: chrome.runtime.getManifest().version
//       }
//     });
//   }, 5000);
// });

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
      const id = request.payload.id;
      chrome.windows.update(id, { focused: true }).then(win => {
        if (win.height < 300 || win.width < 300) {
          chrome.windows.update(id, getWinDefaultSize()).then(() => {
            sendResponse({ status: 200 });
          });
        } else {
          sendResponse({ status: 200 });
        }
      });
      return true;
    }
    case "fullscreen": {
      getWindowByKey(projectorStorageKey).then(({ win }) => {
        if (win) {
          chrome.windows
            .update(win.id, {
              state: win.state === "fullscreen" ? "normal" : "fullscreen"
            })
            .then(() => {
              sendResponse({ status: 200 });
            });
        }
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

  if (settings.height < 300 || settings.width < 300) {
    Object.assign(settings, getWinDefaultSize());
  }

  chrome.storage.sync.set({
    [key]: {
      ...settings,
      id
    }
  });
}

function getWinDefaultSize() {
  return {
    width: 800,
    height: 600,
    top: 200,
    left: 100
  };
}

function createWindow(config) {
  return chrome.windows.create({
    ...getWinDefaultSize(),
    type: "popup",
    ...config
  });
}

async function getWindowByKey(key) {
  const settings = await getWindowSettings(key);
  const existingId = settings ? settings.id : "";
  let win;
  if (existingId) {
    try {
      win = await chrome.windows.get(existingId);
    } catch (e) {}
  }
  return {
    settings,
    win
  };
}

function getWindow(key, createWindowFn) {
  return new Promise(async resolve => {
    let { win, settings } = await getWindowByKey(key);

    if (win) {
      setTimeout(() => {
        resolve(win, "existing");
      }, 100);
      return;
    }

    const createSettings = mapWindowsSettings(settings);
    try {
      win = await createWindowFn(createSettings);
    } catch (er) {
      // fix causes:
      //  - Error: Invalid value for bounds. Bounds must be at least 50% within visible screen space
      win = await createWindowFn({});
    }
    await setWindowSettings(key, win.id, settings);
    if (settings && postCreateWindowStates.includes(settings.state)) {
      await chrome.windows.update(win.id, {
        state: settings.state
      });
    }
    // TODO find best solution for this timeout:
    //  tmp: simulate onload right after window is created
    setTimeout(() => {
      resolve(win, "created");
    }, 500);
  });
}

function mapWindowsSettings(settings = {}) {
  // exclude not allowed props
  const { id, alwaysOnTop, state, ...createSettings } = settings;
  if (!ignoreCreateWindowStates.includes(state)) {
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
    width: 700,
    height: 650,
    ...settings
  });
}

async function notifyAllWindows(message) {
  const tabs = await getBibleTabs();
  tabs.forEach(tab => {
    chrome.tabs.sendMessage(tab.id, message);
  });
}

async function notifyOnWindowRemoved(windowId) {
  const settings = await getWindowSettings(projectorStorageKey);
  if (settings && settings.id === windowId) {
    await setWindowSettings(projectorStorageKey, null, settings);

    await notifyAllWindows({
      action: "windowRemoved",
      payload: { id: windowId }
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
      for (const key of [projectorStorageKey, settingsStorageKey]) {
        const settings = await getWindowSettings(key);
        const existingId = settings ? settings.id : "";
        if (existingId) {
          chrome.windows.remove(existingId);
        }
      }
    } else {
      console.info("There are %d tabs opened", tabs.length, tabs);
    }
  }, 100);
}

function getBibleTabs() {
  return chrome.tabs.query({
    url: BIBLE_TABS_URL
  });
}
