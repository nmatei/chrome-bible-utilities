importScripts("common/utilities.js");

const BIBLE_TABS_URL = ["https://www.bible.com/bible*", "https://www.bible.com/*/bible*"];
const BIBLE_DEFAULT_URL = "https://www.bible.com/bible";

const projectorPage = "views/projector/tab.html";
const settingsPage = "views/settings/options.html";

const projectorStorageKey = "projectorWindow";
const settingsStorageKey = "settingsWindow";
const allWindows = [projectorStorageKey, projectorStorageKey + "2", settingsStorageKey];

const postCreateWindowStates = ["maximized", "fullscreen"];
const ignoreCreateWindowStates = [...postCreateWindowStates, "minimized"];

// Remember the last bible.com page the user had open, so the toolbar popup
// can reopen exactly that page (see views/popup/popup.js).
function trackBibleUrl(url) {
  if (url && BIBLE_TABS_URL.some(pattern => url.match(pattern))) {
    chrome.storage.sync.set({ lastBibleUrl: url });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  // changeInfo.url also fires on bible.com SPA navigations
  if (changeInfo.url) {
    trackBibleUrl(changeInfo.url);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    trackBibleUrl(tab.url);
  } catch (e) {}
});

chrome.windows.onRemoved.addListener(windowId => {
  // in case window is closed from 'x' button / Alt+F4
  notifyOnWindowRemoved(windowId);
});

chrome.tabs.onRemoved.addListener(() => {
  checkIfLastTabClosed();
});

chrome.windows.onBoundsChanged.addListener(
  debounce(async win => {
    const updateWin = await changeWindowsBounds(win);
    //console.warn("updated", updateWin);
    if (updateWin) {
      const config = checkMinSize(win);
      if (config) {
        //console.warn("small window size detected", config, win);
        await chrome.windows.update(win.id, {
          ...config
        });
      }
    }
  }, 500)
);

async function changeWindowsBounds(win) {
  const windows = await chrome.storage.sync.get(allWindows);
  const updateWin = Object.entries(windows).find(([key, w]) => w.id === win.id);

  if (updateWin) {
    const [key, settings] = updateWin;
    Object.assign(settings, win);
    await setWindowSettings(key, win.id, settings);
    return updateWin;
  }
}

// https://stackoverflow.com/questions/11555051/chrome-extension-update-notification
// chrome.runtime.onInstalled.addListener(details => {
//   const version = chrome.runtime.getManifest().version;
//   setTimeout(async () => {
//     await notifyAllWindows({
//       action: "install",
//       payload: {
//         reason: details.reason,
//         previousVersion: details.previousVersion,
//         version: version
//       }
//     });
//   }, 5000);
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "createTab": {
      const index = request.payload.index || 1;
      const key = projectorStorageKey + (index === 1 ? "" : index);
      getWindow(key, settings => createProjectorTab(settings, index)).then(async (win, status) => {
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
        const config = checkMinSize(win);
        if (config) {
          chrome.windows.update(id, config).then(() => {
            sendResponse({ status: 200 });
          });
        } else {
          sendResponse({ status: 200 });
        }
      });
      return true;
    }
    case "openBibleAndProjector": {
      // Runs the whole sequence in the service worker so it isn't interrupted
      // when the toolbar popup closes (focusing another window dismisses it).
      openBibleAndProjector(request.payload && request.payload.targets).then(() => {
        sendResponse({ status: 200 });
      });
      return true;
    }
    case "fullscreen": {
      const index = request.payload.index || 1;
      const key = projectorStorageKey + (index === 1 ? "" : index);
      getWindowByKey(key).then(({ win }) => {
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
    case "backgroundSleep": {
      setTimeout(() => {
        sendResponse({ status: 200 });
      }, request.payload);
      return true;
    }
    case "showReleaseNotes": {
      chrome.tabs.create({
        url: "https://nmatei.github.io/chrome-bible-utilities/release-notes"
      });
      sendResponse({ status: 200 });
      break;
    }
    case "updateSlideSelection": {
      const { windowIndex } = request.payload;
      const key = projectorStorageKey + (windowIndex === 1 ? "" : windowIndex);

      getWindowByKey(key)
        .then(async ({ win }) => {
          if (!win) {
            sendResponse({ status: 404, error: "Window not found" });
            return;
          }

          if (!win.tabs || !win.tabs[0]) {
            sendResponse({ status: 404, error: "No tabs in window" });
            return;
          }

          chrome.tabs
            .sendMessage(win.tabs[0].id, {
              action: "slideSelectionChanged",
              payload: request.payload
            })
            .then(() => {
              sendResponse({ status: 200 });
            })
            .catch(error => {
              sendResponse({ status: 500, error: error.message });
            });
        })
        .catch(error => {
          sendResponse({ status: 500, error: error.message });
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

  const config = checkMinSize(settings);
  if (config) {
    Object.assign(settings, config);
  }

  chrome.storage.sync.set({
    [key]: {
      ...settings,
      id
    }
  });
}

function getWinMinSize() {
  return {
    width: 300,
    height: 200
  };
}

function getWinDefaultSize() {
  return {
    width: 850,
    height: 800,
    top: 200,
    left: 150
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
      // TODO review if we need { populate: true } and the impact of having it
      win = await chrome.windows.get(existingId, { populate: true });
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

function createProjectorTab(settings = {}, index = 1) {
  const url = chrome.runtime.getURL(projectorPage) + `?index=${index}`;
  return createWindow({
    url,
    ...settings
  });
}

// Focus an existing bible.com tab, or open one (reusing the last page the user
// had open). Mirrors the "Open bible.com" popup button.
async function focusBibleTab() {
  const tabs = await chrome.tabs.query({ url: BIBLE_TABS_URL });
  if (tabs.length) {
    const tab = tabs.find(t => t.active) || tabs[0];
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
  } else {
    const { lastBibleUrl } = await chrome.storage.sync.get("lastBibleUrl");
    await chrome.tabs.create({
      url: lastBibleUrl || BIBLE_DEFAULT_URL
    });
  }
}

// Open/focus the main bible.com page, bring the projection window(s) for the
// given displays to the front, then focus bible.com again at the end so the
// user lands back on the control page ready to type.
async function openBibleAndProjector(targets) {
  await focusBibleTab();
  const indexes = targets && targets.length ? targets : [1];
  for (const index of indexes) {
    const key = projectorStorageKey + (index === 1 ? "" : index);
    const win = await getWindow(key, settings => createProjectorTab(settings, index));
    await chrome.windows.update(win.id, { focused: true });
  }
  await focusBibleTab();
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

async function notifyRemoved(windowId, index) {
  const key = projectorStorageKey + (index === 1 ? "" : index);
  const settings = await getWindowSettings(key);
  if (settings && settings.id === windowId) {
    await setWindowSettings(key, null, settings);

    await notifyAllWindows({
      action: "windowRemoved",
      payload: {
        id: windowId,
        index
      }
    });
  }
}

async function notifyOnWindowRemoved(windowId) {
  await notifyRemoved(windowId, 1);
  await notifyRemoved(windowId, 2);
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
      for (const key of allWindows) {
        const settings = await getWindowSettings(key);
        const existingId = settings ? settings.id : "";
        if (existingId) {
          // TODO try to fix : Uncaught (in promise) Error: No window with id: 674002835. when i simple close any tab
          try {
            // TODO should we first 'get' the window to see if it still exists? (it may have been closed by user)
            chrome.windows.remove(existingId);
          } catch (e) {
            console.warn("error when chrome.windows.remove", e);
          }
        }
      }
    } else {
      console.info("There are %d tabs opened", tabs.length, tabs);
    }
  }, 100);
}

function checkMinSize(win) {
  const minSize = getWinMinSize();
  let defaultSize = getWinDefaultSize();
  const config = {};
  if (win.height < minSize.height) {
    config.height = minSize.height;
    if (win.top > 700) {
      config.top = defaultSize.top;
      config.left = defaultSize.left;
    }
  }
  if (win.width < minSize.width) {
    config.width = minSize.width;
  }

  return Object.keys(config).length ? config : null;
}

function getBibleTabs() {
  return chrome.tabs.query({
    url: BIBLE_TABS_URL
  });
}
