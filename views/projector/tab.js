import { getCssDefaultProperties, getDefaults, initUserOptions } from "../settings/common.js";

const options = await initUserOptions();
setRootStyles(options);

initEvents();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "updateText": {
      const root = document.getElementById("root");
      let text = request.payload.text;
      if (request.payload.markdown) {
        text = marked.parse(text);
      }
      root.innerHTML = text;
      adjustBodySize();
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

function initEvents() {
  window.addEventListener(
    "resize",
    debounce(() => {
      adjustBodySize();
    }, 200)
  );
  document.addEventListener("keydown", e => {
    selectByKeys(e.key);
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
}

async function selectByKeys(key) {
  const [tab] = await chrome.tabs.query({ active: true, url: ["https://my.bible.com/bible/*"] });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {
      action: "tabkeydown",
      payload: key
    });
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
