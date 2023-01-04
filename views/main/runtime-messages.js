let projectTab;

/**
 *
 * @returns {Promise}
 */
function createChromeWindow() {
  return chrome.runtime.sendMessage({
    action: "createTab"
  });
}

function createSettingsWindow() {
  return chrome.runtime.sendMessage({
    action: "createSettingsTab"
  });
}

/**
 * @param {String} text
 * @param {Boolean} markdown
 */
function projectText(text, markdown = false) {
  return chrome.runtime.sendMessage({
    action: "updateText",
    payload: {
      text,
      markdown
    }
  });
}

async function bringTabToFront() {
  const tab = await getProjectTab();
  if (tab) {
    await chrome.runtime.sendMessage({
      action: "focusTab",
      payload: { id: tab }
    });
  }
}

async function getProjectTab() {
  let tab = projectTab;
  if (!tab) {
    tab = projectTab = await createProjectTab();
  }
  return tab;
}
async function createProjectTab() {
  const response = await createChromeWindow();
  return response ? response.id : null;
}
