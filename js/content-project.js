const showProject = true;
const projected = "projected";
let projectTab;
let selectedVersesNr = [];
let selectParallel = true;
let focusChapter = null;

addBodyStyles();

window.addEventListener("load", () => {
  cleanUp();
  initEvents();
});

// = = = utilities = = =

function cleanUp() {
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

function addBodyStyles() {
  if (document.querySelector("#bible-projector")) {
    return;
  }
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
      border: 2px solid #dcdcdc;
    }
    .verse .label:hover {
      background: #eaf3fc;
    }
    .verse.projected .label {
      background: #000 !important;
      color: #fff !important;
    }
    .focus-lost .verse.projected .label {
      background: #999 !important;
    }
    .focus-parallel .parallel-chapter .verse.projected .label,
    .focus-primary .primary-chapter .verse.projected .label {
      border-color: #d7237c !important;      
    }
    
    body #current-ui-view {
      padding: 110px 0 20px 0;
    }
    body .yv-header .yv-sticky-header-content {
      height: 60px;
    }
    body .reader-header {
      height: 50px
    }
    body #react-app-Bible {
      padding-bottom: 20px;
    }
    
    body .chapter-picker-modal .chapter-container .chapter-list li {
      height: 40px;
    }
    body .bible-reader .verse {
      display: block;
      line-height: 1.6em;
    }
    body .bible-reader .verse.projected {
      background: #cccccc80;
    }
    body .bible-reader.primary-chapter .label,
    body .bible-reader.parallel-chapter .label {
      display: inline;
    }
    
    #react-app-Footer {
      /* display: none; */
    }
    body .verse-action-footer.open {
      /* display: none; */
    }
    body .yv-footer .yv-footer-vertical-link-list li:first-child {
      margin-top: 10px;
    }
    body .yv-footer .yv-footer-vertical-link-list li {
      margin-top: 2px;
    }
    body .yv-footer hr {
      margin: 5px 0 5px;
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
    
    /* primary only */
    @media only screen and (min-width: 64em) {
      .large-6 {
        width: 80%;
      }
    }
    
  `;
  const styleSheet = document.createElement("style");
  styleSheet.id = "bible-projector";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

function adjustBodySize(tab) {
  let fontSize = 100;
  const body = tab.document.body;
  do {
    body.style.fontSize = fontSize + "px";
    fontSize--;
  } while (fontSize > 10 && body.offsetHeight > tab.window.innerHeight);
}

function getDisplayText(verses) {
  let chapters = [...document.querySelectorAll(".reader h1")].map(h => h.innerHTML.trim());
  const selectedVerses = [...verses];
  const showParallel = !!document.querySelector(".parallel-chapter");
  let separator = " separator";
  const versesInfo = selectedVerses.map(v => {
    const label = v.querySelector(":scope > .label");
    const verseNr = label ? label.innerText : "";
    let cls = "";
    let parallel = false;
    if (showParallel) {
      if (v.closest(".parallel-chapter")) {
        cls = `parallel${separator}`;
        separator = ""; // only first well be separator
        parallel = true;
      }
    }
    return {
      verseNr,
      content: v.innerText.substring(verseNr.length),
      parallel,
      cls
    };
  });

  // if (verses.length < 3) {
  chapters = chapters.map((c, i) => {
    const numbers = versesInfo
      .filter(v => v.verseNr && (i ? v.parallel : !v.parallel))
      .map(v => parseInt(v.verseNr.trim()));

    const groupedNumbers = numbers.reduce((acc, n) => {
      const prev = acc[acc.length-1];
      if (prev && (prev[1] + 1) === n) {
        prev[1] = n;
      } else {
        acc.push([n, n])
      }
      return acc;
    }, []).map(p => (p[0] === p[1] ? p[0] : `${p[0]}-${p[1]}`)).join(',')

    return `${c}:${groupedNumbers}`;
  });
  // }

  const versesContent = versesInfo.map(({ cls, verseNr, content }) => {
    return `<p class="${cls}">${verseNr ? `<sup>${verseNr}</sup>` : ""}${content}</p>`;
  });

  return `<h1>📘 ${chapters.join(" / ")}</h1>` + versesContent.join("\n");
}

function printSelectedVerses(tab, verses) {
  cleanUp();

  tab.document.body.innerHTML = verses.length ? getDisplayText(verses) : "";

  if (verses.length) {
    adjustBodySize(tab);
  }
}

function createProjectTab() {
  const tab = window.open("", "_blank", "toolbar=no,location=no,directories=no,status=no,menubar=no,fullscreen=yes,width=800,height=600,top=200,left=100");
  const styles = `
    html {
      height: 100%;
      overflow: hidden;
    }
    body {
      font-family: Calibri, Arial, sans-serif;
      font-weight: bold;
      min-height: 100%;
      background: #000;
      color: #fff;
      margin: 0;
	    padding: 0;
    }
    h1 {
      color: gray;
      /*font-size: 0.7em;*/
      font-size: 40px;
      margin: 0.2em 0.4em 0 0.4em;
    }
    h2 {
      color: gray;
      font-size: 0.6em;
      margin: 0.2em 0.4em 0 0.4em;
    }
    p.parallel.separator {
      border-top: 2px solid gray;
    }
    p {
      margin: 0;
      padding: 0.2em;
    }
    p > sup {
      color: gray;
      font-size: 0.7em;
    }
    `;
  const styleSheet = tab.document.createElement("style");
  styleSheet.id = "bible-projector";
  styleSheet.innerText = styles;
  tab.document.head.appendChild(styleSheet);
  tab.document.body.innerHTML = `
    <h2>press <strong>F11</strong> to fullscreen</h2>
  `;
  tab.document.title = "Bible Verses";

  const iconLink = tab.document.createElement("link");
  iconLink.setAttribute("rel", "shortcut icon");
  iconLink.setAttribute("href", "https://my.bible.com/favicon.ico");
  tab.document.querySelector("head").appendChild(iconLink);

  return tab;
}

function getProjectTab() {
  let tab = projectTab;
  if (!tab) {
    tab = projectTab = createProjectTab();
    window.onbeforeunload = function () {
      tab.close();
    };
    tab.window.addEventListener("resize", () => {
      adjustBodySize(tab);
    });
    tab.onbeforeunload = function () {
      deselectAll();
      projectTab = null;
    };
    tab.document.body.addEventListener("keydown", e => {
      //console.info("keydown");
      selectByKeys(e);
    });
  }
  return tab;
}

function deselectAll() {
  document.querySelectorAll(`.verse.${projected}`).forEach(v => {
    v.classList.remove(projected);
  });
}

function selectVerses(verses, deselect) {
  if (deselect === true) {
    deselectAll();
  }
  return [...verses]
    .map(v => {
      v.classList.toggle(projected);

      const label = v.querySelector(":scope > .label");
      return label ? parseInt(label.innerText) : 0;
    })
    .filter(Boolean);
}

function selectVersesToProject(e) {
  const target = e.target;
  if (target.matches(".verse .label")) {
    e.stopPropagation();
    e.preventDefault();
    const multiSelect = e.ctrlKey;
    const verse = target.closest(".verse");
    const cls = ".row ." + verse.className.split(/\s+/).join(".");
    const verses = document.querySelectorAll(cls);

    const projectedVerses = verse.classList.contains(projected);

    const nextFocusChapter = target.closest(".parallel-chapter") ? "parallel" : "primary";
    if (nextFocusChapter !== focusChapter) {
      document.body.classList.remove(`focus-${focusChapter}`);
      document.body.classList.add(`focus-${nextFocusChapter}`);
      focusChapter = nextFocusChapter;
    }

    if (!multiSelect) {
      deselectAll();
    }

    if (!projectedVerses || multiSelect) {
      selectedVersesNr = selectVerses(verses);
    }

    displayVerses(document.querySelectorAll(`.verse.${projected}`));

    if (e.altKey) {
      bringTabToFront();
      document.body.classList.add("focus-lost");
      return;
    }
  }
  document.body.classList.remove("focus-lost");
}

function bringTabToFront() {
  const tab = getProjectTab();
  if (tab) {
    window.blur();
    tab.focus();
  }
  setTimeout(() => {
    // TODO focus back not working...
    // tab.opener.focus();
    //tab.opener.document.body.focus();
    window.focus();
  }, 1000);
}

function displayVerses(verses) {
  let tab;
  if (showProject) {
    tab = getProjectTab();
    printSelectedVerses(tab, verses);
  }
  return tab;
}

function selectByKeys(e) {
  let dir = 0;
  switch (e.keyCode) {
    case 27: {
      // ESC
      deselectAll();
      displayVerses([]);
      break;
    }
    case 37:
    case 38: {
      // up
      dir = -1;
      break;
    }
    case 39:
    case 40: {
      //down
      dir = 1;
      break;
    }
  }

  if (dir) {
    let next = selectedVersesNr.map(v => v + dir);
    const [primary, parallel] = next;
    const verses = document.querySelectorAll(`.row .primary-chapter .verse.v${primary}, .row .parallel-chapter .verse.v${parallel}`);
    if (verses.length) {
      selectedVersesNr = next;
    } else {
      return;
    }
    selectVerses(verses, true);
    displayVerses(verses);
    const focusEl = focusChapter === "primary" ? verses[0] : verses[1] || verses[0];
    if (focusEl) {
      setTimeout(() => {
        // focusEl.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
        // focusEl.scrollIntoViewIfNeeded(false);
        focusEl.scrollIntoViewIfNeeded(true);
      }, 600);
    }
  }
}

function initEvents() {
  const app = document.querySelector("#react-app-Bible");
  if (app) {
    app.addEventListener("click", selectVersesToProject);
    document.addEventListener("keydown", selectByKeys);
    window.addEventListener("blur", () => {
      document.body.classList.add("focus-lost");
    });
    window.addEventListener("focus", () => {
      document.body.classList.remove("focus-lost");
    });
  }
}

/**

 // TODO sync verses in same 'line'
 var v = 39
 var verses = document.querySelectorAll(`.row .primary-chapter .verse.v${v}, .row .parallel-chapter .verse.v${v}`);
 console.info(verses[0].offsetTop, verses[1].offsetTop)
 var primary = document.querySelector('.primary-chapter');
 primary.style.paddingTop = `${verses[1].offsetTop - verses[0].offsetTop - 0 + primary.style.paddingTop.replace('px', '') * 1}px`

 */
