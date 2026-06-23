function getVersionsName() {
  return $$(versionsNameSelector)
    .slice(0, 2)
    .map(e => e.innerText);
}

function getBooks() {
  return $$(booksSelector());
}

function getChapters() {
  return $$(chaptersSelector());
}

function getTitles() {
  return $$(titlesSelector).map(h => {
    const parallel = !!h.closest(parallelViewSelector);
    // getUrlParams().version
    return {
      version: parallel ? getVersionsName()[1] : getVersionsName()[0],
      content: h.innerHTML.trim(),
      parallel
    };
  });
}

function getChapterTitles() {
  return $$(titlesSelector).map(h => h.innerHTML.trim());
}

// TODO let comments visible in main app,
//  and remove them only in project tab
function cleanUp(parent) {
  // remove all notes
  $$(notesSelector, parent || document).forEach(n => {
    n.innerHTML = "";
    n.className = "";
  });
}

async function fetchVersionBooks(primary) {
  const baseUrl = `https://nodejs.bible.com/api/bible/version/3.1?id=${primary}`;
  const response = await fetch(baseUrl);
  const json = await response.json();
  return (json.books || []).map(b => ({
    key: b.usfm,
    name: b.human,
    chapters: b.chapters.length
  }));
}

async function getChapterFromAPI({ primary, book, chapter }) {
  const baseUrl = "https://nodejs.bible.com/api/bible/chapter/3.1";
  const response = await fetch(`${baseUrl}?id=${primary}&reference=${book}.${chapter}`);
  const json = await response.json();

  if (json) {
    const div = document.createElement("div");
    div.innerHTML = json.content;
    // console.warn("json.content", json.content);
    delete json.content; // memory optimization, we don't need it anymore
    //console.warn('div.querySelectorAll(".note")', div.querySelectorAll(".note"));
    div.querySelectorAll(".note").forEach(n => {
      n.style.display = "none";
      n.innerHTML = "";
    });

    // TODO check if we have to use global selector for '.verse'
    const verses = [...div.querySelectorAll(".verse")];
    // console.warn("verses", verses);
    const versesInfo = getVersesInfo(verses, false, ".label");
    // console.warn("versesInfo", versesInfo);
    div.innerHTML = "";
    return versesInfo;
  } else {
    console.warn("can't load chapter", arguments);
    return undefined;
  }
}
