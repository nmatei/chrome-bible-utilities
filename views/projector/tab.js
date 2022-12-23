chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "update": {
      // const root = document.body;
      const root = document.getElementById("root");
      root.innerHTML = request.payload;
      adjustBodySize();
      sendResponse({ status: 200 });
      break;
    }
  }
});

window.addEventListener("load", () => {
  initEvents();
});

function initEvents() {
  window.addEventListener("resize", () => {
    adjustBodySize();
  });
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
    if (e.target.matches("a")) {
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
    fontSize--;
  } while (fontSize > 10 && body.offsetHeight > window.innerHeight);
}
