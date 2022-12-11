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
  const showProject = true;
  const projected = "projected";

  function adjustBodySize(tab) {
    let fontSize = 150;
    const body = tab.document.body;
    do {
      body.style.fontSize = fontSize + "px";
      fontSize--;
    } while (fontSize > 12 && body.offsetHeight > tab.window.innerHeight);
    console.warn("body: %o, window: %o, fontSize: %o", body.offsetHeight, tab.window.innerHeight, fontSize + 1);
  }

  function printSelectedVerses(tab) {
    // add spaces after label
    document.querySelectorAll(".verse .label").forEach(l => {
      l.innerHTML = l.innerHTML.trim() + " ";
    });

    const selectedVerses = [...document.querySelectorAll(`.verse.${projected}`)];

    // tab.document.body.innerHTML = selectedVerses.map(v => `<p>${v.innerText}</p>`).join("\n");
    tab.document.body.innerHTML = selectedVerses
      .map(v => {
        const label = v.querySelector(":scope > .label");
        const verseNr = label ? label.innerText : "";
        const nr = label ? `<span>${verseNr}</span>` : "";
        return `<p>${nr}${v.innerText.substring(verseNr.length)}</p>`;
      })
      .join("\n");

    setTimeout(() => {
      adjustBodySize(tab);
    }, 10);
  }

  if (!window.selectVersesToProject) {
    let projectTab;
    //console.warn("window.selectVersesToProject");
    window.selectVersesToProject = function (e) {
      if (e.target.matches(".verse .label")) {
        e.stopPropagation();
        e.preventDefault();
        const multiSelect = e.ctrlKey;
        const verse = e.target.closest(".verse");
        const cls = ".row ." + verse.className.split(/\s+/).join(".");
        console.warn("click on verse number", cls);
        const verses = document.querySelectorAll(cls);

        const projectedVerses = verse.classList.contains(projected);
        //console.warn("multiSelect", multiSelect, projected, projectedVerses);

        if (!multiSelect) {
          document.querySelectorAll(".verse.projected").forEach(v => {
            v.classList.remove(projected);
          });
        }

        if (!projectedVerses || multiSelect) {
          verses.forEach(v => {
            v.classList.toggle(projected);
          });
        }

        //verse.scrollIntoView(false);

        if (showProject) {
          if (!projectTab) {
            projectTab = window.open("", "_blank", "toolbar=no,location=no,directories=no,status=no,menubar=no");
            const styles = `
            html {
              height: 100%;
              overflow: hidden;
            }
            body {
              min-height: 100%;
              background: #000;
              color: #fff;
              margin: 0;
	            padding: 0;
            }
            p {
              margin: 0;
              padding: 0.2em;
            }
            p > span {
              color: gray;
              font-size: 0.7em;
            }
          `;
            const styleSheet = projectTab.document.createElement("style");
            styleSheet.id = "bible-projector";
            styleSheet.innerText = styles;
            projectTab.document.head.appendChild(styleSheet);

            projectTab.document.body.innerHTML = "";

            window.onbeforeunload = function () {
              projectTab.close();
            };
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
    .verse.projected .label {
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
    
    #react-app-Footer {
      display: none;
    }
    
    body .verse-action-footer.open {
      display: none;
    }
    @media only screen and (min-width: 37.5em) {
      body .verse-action-footer {
        padding: 5px;
      }
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
