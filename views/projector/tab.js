import { BIBLE_TABS_URL, getCssDefaultProperties, initUserOptions } from "../settings/common.js";

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
  root.innerHTML = text;
  adjustBodySize();
}

function initEvents() {
  window.addEventListener(
    "resize",
    debounce(() => {
      adjustBodySize();
      animateFocusBtn("F11");
    }, 200)
  );
  document.addEventListener("keydown", e => {
    selectByKeys(e.key);
    animateFocusBtn(e.key);
  });
  window.addEventListener("blur", () => {
    document.body.classList.add("focus-lost");
  });
  window.addEventListener("focus", () => {
    document.body.classList.remove("focus-lost");
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
  const [tab] = await chrome.tabs.query({
    active: true,
    url: BIBLE_TABS_URL
  });
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

function adjustBodySize() {
  const minFontSize = 10;
  let fontSize = parseInt(options.maxFontSize);
  const body = document.body;
  do {
    body.style.fontSize = fontSize + "px";
    const zoom = Math.round(body.offsetHeight / window.innerHeight);
    const step = Math.max(1, Math.min(zoom, fontSize - minFontSize, 20));
    //console.debug({ step, zoom, fontSize });
    fontSize = fontSize - step;
  } while (fontSize >= minFontSize && body.offsetHeight > window.innerHeight);
  if (fontSize < 52) {
    body.classList.add("font-size-less-50");
  } else {
    body.classList.remove("font-size-less-50");
  }
}

function mapValue(key, value) {
  if (key.startsWith("rootPadding") || key.endsWith("FontSize") || key.endsWith("Height")) {
    return value + "px";
  }
  return value;
}

function mapStyles(styles) {
  const cssDefaults = getCssDefaultProperties();
  return Object.entries(styles).reduce((acc, [key, value]) => {
    if (cssDefaults.hasOwnProperty(key)) {
      acc[key] = mapValue(key, value);
    }
    return acc;
  }, {});
}

function setRootStyles(styles) {
  Object.assign(options, styles);
  styles = mapStyles(styles);
  const root = document.querySelector(":root");
  Object.entries(styles).forEach(([key, value]) => {
    root.style.setProperty("--" + key, value);
  });
}
