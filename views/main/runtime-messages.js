let projectTab1;
let projectTab2;

/**
 *
 * @returns {Promise}
 */
function createChromeWindow(index) {
  return chrome.runtime.sendMessage({
    action: "createTab",
    payload: {
      index
    }
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
 * @param {Number} index
 */
function projectText(text, markdown = false, index) {
  return chrome.runtime.sendMessage({
    action: "updateText",
    payload: {
      text,
      markdown,
      index
    }
  });
}

async function bringTabToFront() {
  const tabs = await getProjectTab();
  await Promise.allSettled(
    tabs
      .filter(t => t)
      .map(tab =>
        chrome.runtime.sendMessage({
          action: "focusTab",
          payload: {
            id: tab
          }
        })
      )
  );
}

async function getProjectTab() {
  let tab1 = projectTab1;
  let tab2 = projectTab2;
  const [display1, display2] = displaySettings;
  if (display1 && !tab1) {
    tab1 = projectTab1 = await createProjectTab(1);
  }
  if (display2 && !tab2) {
    tab2 = projectTab2 = await createProjectTab(2);
  }
  return [tab1, tab2];
}

function closeProjectTab(index) {
  if (index === 1) {
    projectTab1 = null;
  } else {
    projectTab2 = null;
  }
}

async function createProjectTab(index) {
  const response = await createChromeWindow(index);
  return response ? response.id : null;
}
