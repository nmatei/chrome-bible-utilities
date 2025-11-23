/**
 * @global marked
 * @global DOMPurify
 */

// Get displayIndex from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const displayIndex = parseInt(urlParams.get("index")) || 1;

import { applyRootStyles, BIBLE_TABS_URL, initUserOptions } from "../settings/common.js";

// ================================
//    C o n s t a n t s
// ================================

const animateKeys = {
  //"⌃⌘F": "F11", // TODO test on mac Os (isMac)
  F11: "F11",
  ArrowLeft: "ArrowLeft",
  ArrowUp: "ArrowLeft",
  ArrowRight: "ArrowRight",
  ArrowDown: "ArrowRight"
};

const isMac = /(Mac)/i.test(navigator.platform);

let slide;
let maxFontSize;

// Load slide after displayIndex is properly set
async function loadSlideForWindow() {
  slide = await initUserOptions(true, displayIndex);
  maxFontSize = getMaxFontSize(slide);
  applyRootStyles(slide);
}

// ================================
//   Helper functions
// ================================

function updateText(text, markdown) {
  const root = document.getElementById("root");
  if (markdown) {
    text = window.marked.parse(text);
    text = text.replaceAll("  ", " &nbsp;"); // replace double spaces with non-breaking space
  }
  text = window.DOMPurify.sanitize(text);
  text = text.replaceAll("-", "&#8209;");
  root.innerHTML = text;

  if (markdown) {
    $$('input[type="checkbox"]').forEach(checkbox => {
      checkbox.disabled = false;
    });
  }

  adjustRefFontSize();
  adjustBodySize();
}

// Reload the slide for this window
function reloadSlide(sendResponse) {
  loadSlideForWindow()
    .then(() => {
      adjustRefFontSize();
      adjustBodySize();
      sendResponse({ status: 200 });
    })
    .catch(error => {
      sendResponse({ status: 500, error: error.message });
    });
}

function updateTextEvent({ index, text, markdown }, sendResponse) {
  // TODO sanity check (DOMPurify.sanitize?)
  if (typeof index === "undefined" || index === displayIndex) {
    updateText(text, markdown);
    sendResponse({ status: 200 });
  } else {
    sendResponse({ status: 201 });
  }
}

function initRuntimeEvents() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case "updateText": {
        updateTextEvent(request.payload, sendResponse);
        break;
      }
      case "previewRootStyles": {
        setRootStyles(request.payload);
        maxFontSize = getMaxFontSize(slide);
        adjustRefFontSize();
        adjustBodySize();
        sendResponse({ status: 200 });
        break;
      }
      case "slideSelectionChanged": {
        const { windowIndex } = request.payload;

        if (windowIndex === displayIndex) {
          reloadSlide(sendResponse);
          return true; // Will respond asynchronously
        } else {
          sendResponse({ status: 200 });
        }
        break;
      }
      case "resetRootStyles": {
        reloadSlide(sendResponse);
        return true; // Will respond asynchronously
      }
    }
  });

  // Allow external extensions to send updateText messages
  chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    switch (request.action) {
      case "updateText": {
        updateTextEvent(request.payload, sendResponse);
        break;
      }
      case "help": {
        sendResponse({
          status: 200,
          availableActions: {
            updateText: {
              description: "Update the projection window content",
              payload: {
                index: "number (optional) - Window index (1 or 2). If omitted, updates current window",
                text: "string (required) - Content to display",
                markdown: "boolean (optional) - Parse text as Markdown. Supports tables, lists, checkboxes, etc."
              },
              notes: [
                "Use .singlelines class on container for non-wrapping paragraphs that auto-fit screen width",
                "Non-breaking hyphens are automatically applied",
                "Double spaces are preserved in markdown mode"
              ]
            }
          }
        });
        break;
      }
      default: {
        sendResponse({
          status: 403,
          error: "Action not allowed from external extensions",
          hint: 'Send action: "help" for available commands'
        });
      }
    }
  });
}

function initEvents() {
  initRuntimeEvents();
  // TODO check if we want to have clock?
  initClock();
  const dockBar = createDockBar();
  dockBar.addEventListener("submit", e => {
    e.preventDefault();
    onReferenceSubmit(dockBar);
    dockBar.classList.remove("focused");
  });

  window.addEventListener(
    "resize",
    debounce(() => {
      maxFontSize = getMaxFontSize(slide);
      adjustRefFontSize();
      adjustBodySize();
      animateFocusBtn("F11");
    }, 300)
  );

  initShiftKeyEvents();

  document.addEventListener("keydown", e => {
    selectByKeys(e.key);
    animateFocusBtn(e.key);
  });
  if (slide.actionsDisplay === "false") {
    document.body.classList.add("focus-lost");
  }
  window.addEventListener("blur", () => {
    document.body.classList.add("focus-lost");
  });
  window.addEventListener("focus", () => {
    if (slide.actionsDisplay === "true") {
      document.body.classList.remove("focus-lost");
    }
  });

  document.querySelector(".actions").addEventListener("click", e => {
    if (e.target.matches(".action-btn")) {
      selectByKeys(e.target.getAttribute("data-key"));
    }
  });

  const fullScreenBtn = document.querySelector('.action-btn[data-key="F11"]');
  if (isMac) {
    fullScreenBtn.innerText = "⌃⌘F";
  }
  fullScreenBtn.addEventListener("click", () => {
    // TODO need to support multiple projectors
    toggleFullScreen(1);
  });

  setTimeout(() => {
    animateFocusBtn("F11");
  }, 1000);

  // Add listener for checkbox clicks in the document
  document.addEventListener("click", async function (e) {
    const checkbox = e.target;
    if (!(checkbox.tagName === "INPUT" && checkbox.type === "checkbox")) {
      return;
    }
    const li = checkbox.closest("li");
    if (!li) {
      return;
    }
    const index = $$('li input[type="checkbox"]').findIndex(input => input === checkbox);

    const tab = await getTab();
    chrome.tabs.sendMessage(tab.id, {
      action: "checkboxUpdate",
      index: index,
      checked: checkbox.checked
    });
    // focus checked checkbox (as it was replaced)
    setTimeout(() => {
      $$('li input[type="checkbox"]')[index]?.focus();
    }, 100);
  });
}

function animateFocusBtn(key) {
  key = animateKeys[key];
  if (key) {
    const btn = document.querySelector(`.action-btn[data-key="${key}"]`);
    if (btn) {
      btn.classList.remove("focus");
      btn.classList.add("focus");
      setTimeout(() => {
        btn.classList.remove("focus");
      }, 200);
    }
  }
}

function toggleFullScreen(index) {
  chrome.runtime.sendMessage({
    action: "fullscreen",
    payload: {
      index
    }
  });
}

async function selectByKeys(key) {
  const tab = await getTab();
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {
      action: "tabkeydown",
      payload: key
    });
  } else {
    if (key === "Escape") {
      updateText("");
    }
  }
}

async function getTab() {
  let [tab] = await chrome.tabs.query({
    active: true,
    url: BIBLE_TABS_URL
  });
  if (!tab) {
    [tab] = await chrome.tabs.query({
      url: BIBLE_TABS_URL
    });
  }
  return tab;
}

async function onReferenceSubmit(dockBar) {
  const tab = await getTab();
  if (tab) {
    const input = $("[name=reference]", dockBar);
    const reference = input.value;
    input.value = "";
    await chrome.tabs.sendMessage(tab.id, {
      action: "referencerequest",
      shiftKey: isShiftKeyPressed,
      payload: reference
    });
  }
}

function getMaxFontSize(slide) {
  const fontSize = parseInt(slide.maxFontSize);
  // calculate browser width and minimum font size
  const zoom = Math.round(window.innerWidth / 12);
  // console.debug("max font size %o -> %o", { fontSize, zoom }, Math.min(fontSize, zoom));
  return Math.min(fontSize, zoom);
}

const shadowBreakpoints = {
  35: [1, 1, 1],
  50: [1, 1, 2],
  70: [4, 2, 4]
};

function getIntervalValue(intervals, limit) {
  const keys = Object.keys(intervals);
  const [first] = keys;
  let value = intervals[first];
  keys.forEach(function (key) {
    if (limit >= key) {
      value = intervals[key];
    }
  });
  return value;
}

function updateShadows(fontSize) {
  const [shadowX, shadowY, shadowBlur] = getIntervalValue(shadowBreakpoints, fontSize);
  const root = $(":root");
  root.style.setProperty("--shadowOffsetX", shadowX + "px");
  root.style.setProperty("--shadowOffsetY", shadowY + "px");
  root.style.setProperty("--shadowBlur", shadowBlur + "px");
}

function decreaseFontSize(el) {
  if (el && el.scrollWidth > el.offsetWidth) {
    const computedStyle = window.getComputedStyle(el);
    const fontSize = computedStyle.fontSize;
    const newFontSize = parseInt(fontSize) - 1;
    el.style.fontSize = newFontSize + "px";
    return true;
  }
  return false;
}

function adjustRefFontSize() {
  const ref = $("h1.reference");
  if (ref && ref.style.fontSize) {
    // reset it to initial value from css then let it decrease to fit the screen if needed
    ref.style.fontSize = "";
  }
  while (decreaseFontSize(ref)) {}
}

function adjustBodySize() {
  const minFontSize = 10;
  let fontSize = maxFontSize;
  const body = document.body;
  // elements that could exceed screen width
  const wideElements = $$("table, .singlelines p");
  const padding = 1 * slide.rootPaddingLeft + 1 * slide.rootPaddingRight;
  let shouldDecrease = false;
  do {
    body.style.fontSize = fontSize + "px";
    const zoom = Math.round(body.offsetHeight / window.innerHeight);
    const step = Math.max(1, Math.min(zoom, fontSize - minFontSize, 20));
    //console.debug({ step, zoom, fontSize });
    fontSize = fontSize - step;
    shouldDecrease = body.offsetHeight > window.innerHeight;
    if (fontSize >= minFontSize && !shouldDecrease) {
      const hasWideElement = wideElements.some(el => el.scrollWidth > window.innerWidth - padding);
      if (hasWideElement) {
        shouldDecrease = true;
      }
    }
  } while (fontSize >= minFontSize && shouldDecrease);

  updateShadows(fontSize + 1);
}

function setRootStyles(styles) {
  Object.assign(slide, styles);
  applyRootStyles(styles);
}

function initClock() {
  const root = document.getElementById("root");
  const date = new Date();
  root.dataset.text = date.toTimeString().substring(0, 5);
  setTimeout(initClock, (60 - date.getSeconds()) * 1000);
}

async function start() {
  // Set title based on displayIndex
  document.title = `📖 Bible ${displayIndex === 2 ? "②" : "①"}`;

  // Load slide for this window
  await loadSlideForWindow();

  initEvents();
}

// ================================
//   S t a r t
// ================================

start();
