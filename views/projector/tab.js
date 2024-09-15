import { applyRootStyles, BIBLE_TABS_URL, initUserOptions } from "../settings/common.js";

const animateKeys = {
  //"⌃⌘F": "F11", // TODO test on mac Os (isMac)
  F11: "F11",
  ArrowLeft: "ArrowLeft",
  ArrowUp: "ArrowLeft",
  ArrowRight: "ArrowRight",
  ArrowDown: "ArrowRight"
};

const isMac = /(Mac)/i.test(navigator.platform);

const options = await initUserOptions();
let maxFontSize = getMaxFontSize();

setRootStyles(options);

initEvents();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "updateText": {
      updateText(request.payload.text, request.payload.markdown);
      sendResponse({ status: 200 });
      break;
    }
    case "previewRootStyles": {
      setRootStyles(request.payload);
      adjustBodySize();
      sendResponse({ status: 200 });
      break;
    }
  }
});

function updateText(text, markdown) {
  const root = document.getElementById("root");
  if (markdown) {
    text = marked.parse(text);
  }
  text = text.replaceAll("-", "&#8209;");
  root.innerHTML = text;
  adjustBodySize();
}

function initEvents() {
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
      maxFontSize = getMaxFontSize();
      adjustBodySize();
      animateFocusBtn("F11");
    }, 300)
  );

  initShiftKeyEvents();

  document.addEventListener("keydown", e => {
    selectByKeys(e.key);
    animateFocusBtn(e.key);
  });
  if (options.actionsDisplay === "false") {
    document.body.classList.add("focus-lost");
  }
  window.addEventListener("blur", () => {
    document.body.classList.add("focus-lost");
  });
  window.addEventListener("focus", () => {
    if (options.actionsDisplay === "true") {
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
    toggleFullScreen();
  });

  setTimeout(() => {
    animateFocusBtn("F11");
  }, 1000);
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

function toggleFullScreen() {
  chrome.runtime.sendMessage({
    action: "fullscreen"
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

function getMaxFontSize() {
  const fontSize = parseInt(options.maxFontSize);
  // calculate browser width and minimum font size
  const zoom = Math.round(window.innerWidth / 10);
  // console.debug("max font size %o -> %o", { fontSize, zoom }, Math.min(fontSize, zoom));
  return Math.min(fontSize, zoom);
}

function adjustBodySize() {
  const minFontSize = 10;
  let fontSize = maxFontSize;
  const body = document.body;
  do {
    body.style.fontSize = fontSize + "px";
    const zoom = Math.round(body.offsetHeight / window.innerHeight);
    const step = Math.max(1, Math.min(zoom, fontSize - minFontSize, 20));
    //console.debug({ step, zoom, fontSize });
    fontSize = fontSize - step;
  } while (fontSize >= minFontSize && body.offsetHeight > window.innerHeight);

  // TODO add one more class for font-size-less-70
  if (fontSize < 52) {
    body.classList.add("font-size-less-50");
  } else {
    body.classList.remove("font-size-less-50");
  }
}

function setRootStyles(styles) {
  Object.assign(options, styles);
  applyRootStyles(styles);
}

function initClock() {
  const root = document.getElementById("root");
  const date = new Date();
  root.dataset.text = date.toTimeString().substring(0, 5);
  setTimeout(initClock, (60 - date.getSeconds()) * 1000);
}
