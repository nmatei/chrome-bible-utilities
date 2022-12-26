const projectorPage = "views/projector/tab.html";
const settingsPage = "views/settings/options.html";

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
  notifyOnWindowRemoved(windowId);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "createTab": {
      getProjectorPageWindow(sendResponse);
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
    case "showSettingsTab": {
      createSettingsTab();
      sendResponse({ status: 200 });
      break;
    }
  }
});

async function getProjectorPageId() {
  const { projectorWindowId } = await chrome.storage.session.get("projectorWindowId");
  return projectorWindowId;
}

function setProjectorPageId(id) {
  chrome.storage.session.set({
    projectorWindowId: id
  });
}

function createProjectorTab() {
  return chrome.windows.create({
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

function createSettingsTab() {
  return chrome.windows.create({
    url: chrome.runtime.getURL(settingsPage),
    width: 800,
    height: 600,
    top: 200,
    left: 100,
    type: "popup"
  });
}

async function getProjectorPageWindow(sendResponse) {
  let id = await getProjectorPageId();
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
      }, 100);
      return;
    }
  }

  win = await createProjectorTab();
  setProjectorPageId(win.id);
  setTimeout(() => {
    sendResponse({
      status: "created",
      id: win.id
    });
  }, 100);
}

async function notifyOnWindowRemoved(windowId) {
  const previewId = await getProjectorPageId();
  if (previewId === windowId) {
    setProjectorPageId(null);
  }
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
