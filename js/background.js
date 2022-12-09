function cleaunUp() {
  // remove all notes
  document.querySelectorAll(".note").forEach(n => {
    n.innerHTML = "";
    n.className = "";
  });

  // add spaces after label
  document.querySelectorAll(".verse .label").forEach(l => {
    l.innerHTML = l.innerHTML.trim() + " ";
  });
}

function selectVersesToProjectInitEvents() {
  const showProject = false;

  function printSelectedVerses(tab) {
    const selectedVerses = [...document.querySelectorAll(".verse.selected")];

    tab.document.body.innerHTML = selectedVerses.map(v => `<p>${v.innerText}</p>`).join("\n");
  }

  if (!window.selectVersesToProject) {
    let projectTab;
    console.warn("window.selectVersesToProject");
    window.selectVersesToProject = function (e) {
      if (e.target.matches(".verse .label")) {
        const multiSelect = e.ctrlKey;
        const verse = e.target.closest(".verse");
        const cls = "." + verse.className.split(/\s+/).join(".");
        console.warn("click on verse number", cls);
        const verses = document.querySelectorAll(cls);

        const selected = verse.classList.contains("selected");
        console.warn("multiSelect", multiSelect, "selected", selected);

        if (!multiSelect) {
          document.querySelectorAll(".verse.selected").forEach(v => {
            v.classList.remove("selected");
          });
        }

        if (!selected) {
          verses.forEach(v => {
            v.classList.toggle("selected");
          });
        }

        //verse.scrollIntoView(false);

        if (showProject) {
          if (!projectTab) {
            projectTab = window.open("", "_blank", "toolbar=no,location=no,directories=no,status=no,menubar=no");
            const styles = `
            body {
              background: #000;
              color: #fff;
            }
          `;
            const styleSheet = projectTab.document.createElement("style");
            styleSheet.id = "bible-projector";
            styleSheet.innerText = styles;
            projectTab.document.head.appendChild(styleSheet);
          }

          printSelectedVerses(projectTab);
        }
      }
    };
  }

  function addBodyStyles() {
    if (document.querySelector("#bible-projector")) {
      return;
    }
    // TODO more space (left - right)
    const styles = `
    .row,
    body.c_pages.a_privacy .privacy_content {
      max-width: 90rem;
    }
    .bible-reader-arrows-container {
      max-width: 100%;
    }
    .verse .label {
      cursor: pointer;
      padding: 5px 5px 5px 8px;
      border-radius: 4px;
    }
    .verse.selected .label {
      background: #000;
      color: #fff;
    }
    
    body .chapter-picker-modal .chapter-container .chapter-list li {
      height: 40px;
    }
    body .bible-reader .verse {
      display: block;
    }
    body .bible-reader.primary-chapter .label,
    body .bible-reader.parallel-chapter .label {
      display: inline;
    }
    
    @media screen and (min-width: 992px) {
      body .yv-footer {
        padding: 30px;
      }
    }
  `;
    const styleSheet = document.createElement("style");
    styleSheet.id = "bible-projector";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }

  addBodyStyles();

  document.querySelector("#react-app-Bible").removeEventListener("click", selectVersesToProject);
  document.querySelector("#react-app-Bible").addEventListener("click", selectVersesToProject);
}

chrome.action.onClicked.addListener(tab => {
  if (tab.url.startsWith("https://my.bible.com/bible")) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: cleaunUp
    });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: selectVersesToProjectInitEvents
    });
  } else {
    chrome.tabs.create({ url: "https://my.bible.com/bible" });
  }
});
