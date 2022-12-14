import { applyLoadOptions, getCssDefaultProperties } from "../settings/common.js";

// Initialize the form with the user's option settings
const options = await applyLoadOptions(getCssDefaultProperties());
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
  let fontSize = 100;
  const body = document.body;
  do {
    body.style.fontSize = fontSize + "px";
    const step = Math.max(1, Math.round(body.offsetHeight / window.innerHeight));
    fontSize = fontSize - step;
  } while (fontSize > 10 && body.offsetHeight > window.innerHeight);
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
  return Object.entries(styles).reduce((acc, [key, value]) => {
    acc[key] = mapValue(key, value);
    return acc;
  }, {});
}

function setRootStyles(styles) {
  styles = mapStyles(styles);
  const root = document.querySelector(":root");
  Object.entries(styles).forEach(([key, value]) => {
    root.style.setProperty("--" + key, value);
  });
}
