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
 * @param {Boolean} nonBreakingHyphens
 */
function projectText(text, markdown = false, index, nonBreakingHyphens = false) {
  return chrome.runtime.sendMessage({
    action: "updateText",
    payload: {
      text,
      markdown,
      index,
      nonBreakingHyphens
    }
  });
}

/**
 * "verse" message for the extensions connected to background.js (chrome.runtime.connect):
 *   what a projection window shows after bible.com projected (or cleared) its verses
 * @param {Number} index - window 1 or 2
 * @param {{ references: String[], versesInfo: Array }} [verses] - see getDisplayVerses, none = cleared
 * @returns {{ index: Number, reference: String|null, text: String }}
 */
function getVerseEvent(index, { references = [], versesInfo = [] } = {}) {
  const text = versesInfo
    .map(v => v.content)
    .filter(Boolean)
    .join("\n");
  const reference = references
    .join(" ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return { index, reference: (text && reference) || null, text };
}

function notifyVersesProjected(events) {
  return chrome.runtime.sendMessage({
    action: "versesProjected",
    payload: events
  });
}

function projectFrame(url, index) {
  return chrome.runtime.sendMessage({
    action: "updateFrame",
    payload: {
      url,
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

async function getProjectTab(displays = displaySettings) {
  let tab1 = projectTab1;
  let tab2 = projectTab2;
  const [display1, display2] = displays;
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

if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = {
    getVerseEvent
  };
}
