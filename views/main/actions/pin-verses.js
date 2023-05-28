let pinnedVerses = [];

async function getPinnedVerses() {
  const storageData = await chrome.storage.sync.get("pinnedVerses");
  return storageData.pinnedVerses || "Mat 5:1";
}

async function setPinnedVerses(pinnedVerses) {
  await chrome.storage.sync.set({
    pinnedVerses: pinnedVerses.join("\n")
  });
  // TODO notify other tabs to update values
}

function getVerseRow(verse, i) {
  return `<tr>
    <td><a data-key="remove" class="action-btn remove-btn" data-idx="${i}" title="Remove">✖</a></td>
    <td><a data-key="open">${verse}</a></td>
  </tr>`;
}

function getFocusReference() {
  return $('#pinned-verses-list a.focus[data-key="open"]');
}

/**
 *
 * @returns {HTMLFormElement}
 */
function createPinVersesBox() {
  const form = addVersesBox();
  const preview = $("#ref-preview");
  $("tbody", form).addEventListener("click", e => {
    const target = e.target;
    if (target.matches("a")) {
      onReferenceClick(target, e);
    }
  });
  $("#pin-add-verse").addEventListener(
    "input",
    debounce(e => {
      onReferenceSearch(e, preview);
    }, 100)
  );
  form.addEventListener("submit", async e => {
    e.preventDefault();
    onReferenceSubmit(preview);
  });
  $("#pin-add-verse", form).addEventListener("keydown", onReferenceKeydown);
  $('button[data-key="edit"]', form).addEventListener("click", onReferenceEdit);
  $('button[data-key="save"]', form).addEventListener("click", onReferenceSave);

  // TODO think of a better solution to improve this flow
  //   I don't like it know
  // form.querySelector('button[data-key="add"]').addEventListener("click", async e => {
  //   const input = $("#pin-add-verse");
  //   if (!input.value) {
  //     // Pin current Reference if 'input' is empty
  //     const [chapter] = getChapterTitles();
  //     const v = $(selectedSelector());
  //     const verseNr = getVerseNr(v);
  //     input.value = (chapter + " " + verseNr).trim();
  //     e.preventDefault();
  //   }
  // });

  getPinnedVerses().then(verses => {
    pinnedVerses = splitVerses(verses);
    updatePinnedRows(pinnedVerses);
  });
  return form;
}

function onReferenceClick(target, e) {
  const action = target.dataset.key;
  switch (action) {
    case "remove": {
      pinnedVerses.splice(target.dataset.idx, 1);
      updatePinnedRows(pinnedVerses);
      setPinnedVerses(pinnedVerses);
      break;
    }
    case "open": {
      openPinReference(target).then(() => {
        e.altKey && bringTabToFront();
      });
      break;
    }
  }
}

function getBookName(title) {
  const match = getVerseInfo(title);
  return match ? match.book : "";
}

function onReferenceSearch(e, preview) {
  let value = cleanSpaces(e.target.value);
  const search = getSearchShortcuts(value);
  value = search.value;
  const newVerses = splitVerses(value);
  if (!newVerses.length) {
    preview.innerText = "^ search ^";
    return;
  }
  const match = getVerseInfo(newVerses[0]);
  const book = match ? match.book : newVerses[0];
  const bookText = findBookText(book);
  if (bookText) {
    preview.classList.add("matched");
  } else {
    preview.classList.remove("matched");
  }
  adjustMatch(match, search.chapterAndVerses, search.verses);
  preview.innerText = getReferencePreview(bookText || book, match ? match.chapter : "", match ? match.verse : "");
}

function adjustMatch(match, chapterAndVerses, verses) {
  if (match) {
    if (chapterAndVerses) {
      //console.warn("match.chapter %s:%s => %o", match.chapter, match.verse, chapterAndVerses);
      match.chapter = chapterAndVerses;
      match.verse = "";
    } else if (verses) {
      //console.warn("match.verses %s:%s => %s:%s", match.chapter, match.verse, match.chapter, verses);
      match.verse = verses;
    }
  }
}

function cleanSpaces(text) {
  return text.replaceAll(multiSpaceRegExp, " ").trim();
}

function getSearchShortcuts(value) {
  let verses, chapterAndVerses;
  if (searchVersesNrsRegExp.test(value)) {
    const titles = getChapterTitles();
    if (titles && titles[0]) {
      verses = value;
      value = titles[0] + ":" + verses;
    }
  } else if (searchChapterNrRegExp.test(value)) {
    const titles = getChapterTitles();
    if (titles && titles[0]) {
      const book = getBookName(titles[0]);
      chapterAndVerses = value;
      value = book + " " + chapterAndVerses;
    }
  }
  return { value, verses, chapterAndVerses };
}

function onReferenceSubmit(preview) {
  preview.innerText = "";
  const input = $("#pin-add-verse");
  let value = cleanSpaces(input.value);
  value = getSearchShortcuts(value).value;
  const newVerses = splitVerses(value);
  if (!newVerses.length) {
    return;
  }
  const editor = $("#pinned-verses-editor");
  if (editor.style.display !== "none") {
    pinnedVerses = splitVerses(editor.value);
  }
  pinnedVerses = [...new Set([...pinnedVerses, ...newVerses])];
  editor.value = pinnedVerses.join("\n");
  updatePinnedRows(pinnedVerses);
  setPinnedVerses(pinnedVerses);
  input.value = "";
  input.focus(); // focus in case we clicked on add '+'
  const firstAddedRow = $$("#pinned-verses-list tbody td").find(e => e.innerText === newVerses[0]);
  if (firstAddedRow) {
    const link = firstAddedRow.querySelector('[data-key="open"]');
    link.classList.add("focus");
    link.scrollIntoViewIfNeeded(true);
    setTimeout(() => {
      link.classList.remove("focus");
    }, 5000);
  }
}

async function onReferenceKeydown(e) {
  if (e.key === "Enter" && !e.target.value) {
    const focused = getFocusReference();
    if (focused) {
      await openPinReference(focused);
      focused.classList.remove("focus");
      setTimeout(async () => {
        const input = $("#pin-add-verse");
        input.focus();
        e.altKey && (await bringTabToFront());
      }, 10);
    }
  }
}

function onReferenceEdit(e) {
  $("#pinned-verses-list").style.display = "none";
  const editor = $("#pinned-verses-editor");
  editor.value = pinnedVerses.join("\n");
  editor.style.display = "block";
  e.target.style.display = "none";
  $('#verses-text-box button[data-key="save"]').style.display = "inline-block";
}

function onReferenceSave(e) {
  const editor = $("#pinned-verses-editor");
  editor.style.display = "none";
  $("#pinned-verses-list").style.display = "table";
  pinnedVerses = splitVerses(editor.value);
  updatePinnedRows(pinnedVerses);
  setPinnedVerses(pinnedVerses);
  e.target.style.display = "none";
  $('#verses-text-box button[data-key="edit"]').style.display = "inline-block";
}

async function openPinReference(target) {
  const value = target.innerText;
  const match = getVerseInfo(value);
  if (match) {
    const icon = target.closest("tr").querySelector('a[data-key="remove"]');
    icon.classList.add("spin");
    const title = await openChapter(match.book, match.chapter);
    await waitAndSelectVerse(match, title);
    icon.classList.remove("spin");
  }
}

function updatePinnedRows(pinnedVerses) {
  const rows = pinnedVerses.map(getVerseRow).join("");
  $("#pinned-verses-list tbody").innerHTML = rows;
}

function addVersesBox() {
  const form = document.createElement("form");
  form.className = "info-fixed-box hide-view arrow-up";
  form.id = "verses-text-box";
  form.method = "GET";
  form.action = "#";
  form.innerHTML = `
    <div id="pin-search-bar" class="actions row-actions form-field">
      <input placeholder="Add Ref's" type="text" autocomplete="off" id="pin-add-verse" class="fill" title="for Multiple References use [ , ] or [ ; ] then press [ Enter ]"/>
    </div>
    <div class="actions row-actions form-field">
      <button type="button" class="action-btn" data-key="edit" title="Edit All">📝</button>
      <button type="button" class="action-btn" data-key="save" title="Save" style="display: none">💾</button>
      <span class="fill"></span>
      <button type="submit" class="action-btn" data-key="add" title="Add new Verse [ Enter ] (second [ Enter ] to project)">➕</button>
    </div>
    <div class="info-text-content-wrapper">
      <textarea id="pinned-verses-editor" cols="14" rows="6" style="display: none"></textarea>
      <table id="pinned-verses-list">
       <colgroup>
          <col span="1" style="width: 25px" />
          <col span="1" />
        </colgroup>
        <tbody></tbody>
        <tfoot>
          <tr>
            <td colspan="2">
              <button type="submit" class="action-btn" id="ref-preview" title="Click to Add it in List"></button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
  document.body.appendChild(form);
  return form;
}
