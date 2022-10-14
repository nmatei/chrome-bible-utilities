function cleaunUp() {
  // remove all notes
  document.querySelectorAll(".note.f").forEach(n => {
    n.innerHTML = "";
    n.className = "";
  });

  // add spaces after label
  document.querySelectorAll(".verse .label").forEach(l => {
    l.innerHTML = l.innerHTML.trim() + " ";
  });
}

chrome.action.onClicked.addListener(tab => {
  if (tab.url.startsWith("https://my.bible.com/")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: cleaunUp
    });
  } else {
    chrome.tabs.create({ url: "https://my.bible.com/" });
  }
});
