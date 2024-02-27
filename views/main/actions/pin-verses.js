let pinnedVerses = [];

const copyIcon = `<svg width="24px" height="24px" viewBox="100 100 800 800" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M589.3 260.9v30H371.4v-30H268.9v513h117.2v-304l109.7-99.1h202.1V260.9z" fill="#E1F0FF" /><path d="M516.1 371.1l-122.9 99.8v346.8h370.4V371.1z" fill="#E1F0FF" /><path d="M752.7 370.8h21.8v435.8h-21.8z" fill="#446EB1" /><path d="M495.8 370.8h277.3v21.8H495.8z" fill="#446EB1" /><path d="M495.8 370.8h21.8v124.3h-21.8z" fill="#446EB1" /><path d="M397.7 488.7l-15.4-15.4 113.5-102.5 15.4 15.4z" fill="#446EB1" /><path d="M382.3 473.3h135.3v21.8H382.3z" fill="#446EB1" /><path d="M382.3 479.7h21.8v348.6h-21.8zM404.1 806.6h370.4v21.8H404.1z" fill="#446EB1" /><path d="M447.7 545.1h261.5v21.8H447.7zM447.7 610.5h261.5v21.8H447.7zM447.7 675.8h261.5v21.8H447.7z" fill="#6D9EE8" /><path d="M251.6 763h130.7v21.8H251.6z" fill="#446EB1" /><path d="M251.6 240.1h21.8v544.7h-21.8zM687.3 240.1h21.8v130.7h-21.8zM273.4 240.1h108.9v21.8H273.4z" fill="#446EB1" /><path d="M578.4 240.1h130.7v21.8H578.4zM360.5 196.5h21.8v108.9h-21.8zM382.3 283.7h196.1v21.8H382.3zM534.8 196.5h65.4v21.8h-65.4z" fill="#446EB1" /><path d="M360.5 196.5h65.4v21.8h-65.4zM404.1 174.7h152.5v21.8H404.1zM578.4 196.5h21.8v108.9h-21.8z" fill="#446EB1" /></svg>`;

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

function getVerseRow(verse) {
  return `<tr draggable="true">
    <td class="remove-cell">
      <a tabindex="0" data-key="remove" class="action-btn remove-btn" title="Remove">✖</a>
    </td>
    <td>
      <a tabindex="0" data-key="open">${verse}</a>
    </td>
  </tr>`;
}

function getFocusReference() {
  return $('#pinned-verses-list a.focus[data-key="open"]');
}

function initDragDrop(tbody, save) {
  let row;
  tbody.addEventListener("dragstart", e => {
    row = e.target;
    row.classList.add("drag-row");
    e.dataTransfer.effectAllowed = "move";
    // TODO ... display only a part of text
    //e.dataTransfer.setData("text", row.querySelector("a[data-key=open]").innerText);
  });
  tbody.addEventListener("drop", e => {
    const text = $$("#pinned-verses-list a[data-key=open]")
      .map(a => a.innerText)
      .join("\n");
    save(text);
  });
  tbody.addEventListener("dragend", e => {
    row.classList.remove("drag-row");
  });
  tbody.addEventListener("dragover", e => {
    const tr = e.target.closest("tr");
    e.preventDefault();
    const tbody = tr.closest("tbody");
    const children = Array.from(tbody.children);
    if (children.indexOf(tr) > children.indexOf(row)) {
      tr.after(row);
    } else {
      tr.before(row);
    }
  });
}

/**
 *
 * @returns {HTMLFormElement}
 */
function createPinVersesBox() {
  const form = addVersesBox();
  const preview = $("#ref-preview");
  $("tbody", form).addEventListener("keypress", e => {
    const target = e.target;
    if (target.matches("a") && e.key === "Enter") {
      onReferenceClick(target, e);
    }
  });
  $("tbody", form).addEventListener("click", e => {
    const target = e.target;
    if (target.matches("a")) {
      onReferenceClick(target, e);
    }
  });
  $(".info-text-content-wrapper", form).addEventListener("contextmenu", e => {
    e.preventDefault();

    const actions = [];
    if (e.target.matches("a[data-key=open]")) {
      actions.push({
        text: "Project entire reference",
        icon: "🔠",
        handler: () => {
          onReferenceClick(e.target, { ctrlKey: true });
        }
      });
      actions.push({
        text: `Copy ${e.target.innerText}`,
        icon: copyIcon,
        itemId: "copy",
        handler: async () => {
          await onReferenceCopy([e.target]);
        }
      });
    }

    const menu = getContextMenu([
      ...actions,
      {
        text: "Copy all to clipboard",
        icon: copyIcon,
        itemId: "copyAll",
        handler: async () => {
          await onReferenceCopy();
        }
      },
      {
        text: "Clear all",
        icon: "✖",
        itemId: "clear",
        handler: () => {
          pinnedVerses = [];
          updatePinnedRows(pinnedVerses);
          setPinnedVerses(pinnedVerses);
        }
      }
    ]);
    showByCursor(menu, e);
  });
  initDragDrop($("tbody", form), async verses => {
    pinnedVerses = splitVerses(verses);
    await setPinnedVerses(pinnedVerses);
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
      const tr = target.closest("tr");
      const tbody = tr.closest("tbody");
      const children = Array.from(tbody.children);
      const idx = children.indexOf(tr);
      pinnedVerses.splice(idx, 1);
      updatePinnedRows(pinnedVerses);
      setPinnedVerses(pinnedVerses);
      break;
    }
    case "open": {
      const multiSelect = e.ctrlKey || e.metaKey; // metaKey for MacOs
      openPinReference(target).then(async ({ match }) => {
        if (multiSelect && match.to) {
          await doSelectVerses(match.to, false, false, false, true);
        }
        if (e.altKey) {
          await bringTabToFront();
        }
      });
      selectPinned(target.closest("tr"));
      break;
    }
  }
}

function selectPinned(row) {
  $$("#pinned-verses-list tr").forEach(row => {
    row.classList.remove("selected");
  });
  row.classList.add("selected");
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
  const bookText = findBookText(book, booksCache);
  if (bookText) {
    preview.classList.add("matched");
  } else {
    preview.classList.remove("matched");
  }
  adjustMatch(match, search.chapterAndVerses, search.verses);
  preview.innerText =
    "➕ " + getReferencePreview(bookText || book, match ? match.chapter : "", match ? match.verse : "");
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
  const newVerses = splitVerses(value).map(v => improveReference(v, booksCache));
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
    selectPinned(link.closest("tr"));
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

async function onReferenceCopy(verses) {
  const primaryText = [];
  const maskWrapper = $("#verses-text-box .info-text-content-wrapper");
  maskWrapper.classList.add("loading-mask", "text-mask");
  verses = verses || $$("[data-key=open]");
  await asyncForEach(verses, async (target, i, all) => {
    maskWrapper.dataset.text = `${i} / ${all.length}`;
    const { title, match } = await openPinReference(target, false);

    if (title && match) {
      let ref = title;
      const verses = [];
      let numbers = [];
      if (match.verse) {
        ref += `:${match.verse}`;
        numbers = [match.verse];
        if (match.to) {
          ref += `-${match.to}`;
          numbers = fillNumbers(match.verse, match.to);
        }
      } else {
        const to = findLastVerseNumber();
        numbers = fillNumbers(1, to);
      }

      numbers.forEach(number => {
        const [verseInfo] = getVersesContent(number);
        if (verseInfo) {
          let vNumber = "";
          if (numbers.length > 1) {
            vNumber = verseInfo.verseNr + " ";
          }
          verses.push(vNumber + verseInfo.content);
        }
      });

      primaryText.push(`📌 ${ref}`);
      primaryText.push(verses.join("\n") + "\n");
    } else {
      //console.log("no match");
      primaryText.push(`📋 ${target.innerText}\n`);
    }
  });

  const allVerses = primaryText.join("\n");
  copyToClipboard(allVerses);
  maskWrapper.dataset.text = "";
  maskWrapper.classList.remove("loading-mask", "text-mask");
}

async function openPinReference(target, project = true) {
  const value = target.innerText;
  const match = getVerseInfo(value);
  if (match) {
    const icon = target.closest("tr").querySelector('a[data-key="remove"]');
    icon.classList.add("spin");
    const title = await openChapter(match.book, match.chapter);
    await checkCacheVersesInfo();
    await waitAndSelectVerse(match, title, project);
    icon.classList.remove("spin");
    return { title, match };
  }
  return {};
}

async function checkCacheVersesInfo() {
  const parallelEnabled = hasParallelView();
  const urlParams = parallelEnabled ? getUrlParams() : undefined;
  if (urlParams) {
    const targetRef = youVersionReferenceMap(urlParams, 1, false);
    if (targetRef.chapter !== urlParams.chapter) {
      //console.info(urlParams, " -> target", targetRef);
      const ref = {
        primary: urlParams.parallel,
        book: urlParams.book,
        chapter: targetRef.chapter
      };
      const loadUrl = createChapterUrl(ref);
      if (loadUrl) {
        await cacheVersesInfo(loadUrl, ref);
      }
    }
  }
}

async function cacheVersesInfo(loadUrl, ref) {
  if (loadUrl && !getCacheVerses(loadUrl)) {
    const verseNr = $(selectedSelector() + " > .label");
    if (verseNr) {
      verseNr.classList.add("spin");
    }
    try {
      const versesInfo = await getChapterFromAPI(ref);
      cacheVerses(loadUrl, versesInfo);
    } catch (e) {
      console.debug("Can't get other chapter", e);
    }
    if (verseNr) {
      verseNr.classList.remove("spin");
    }
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
    <div id="pin-search-bar" class="actions row-actions form-field form-field-wrapper">
      <input placeholder="Add Ref's" type="text" autocomplete="off" id="pin-add-verse" class="fill" 
        title="for Multiple References use [ , ] or [ ; ] then press [ Enter ]"
      />
    </div>
    <div class="actions row-actions">
      <button type="button" class="action-btn" data-key="edit" title="Edit All">📝</button>
      <button type="button" class="action-btn" data-key="save" title="Save" style="display: none">💾</button>
      <span class="fill"></span>
      <button type="submit" class="action-btn" data-key="add" title="Add new Verse [ Enter ] (second [ Enter ] to project)">➕</button>
    </div>
    <div class="info-text-content-wrapper">
      <textarea id="pinned-verses-editor" cols="14" rows="6" style="display: none"></textarea>
      <table id="pinned-verses-list">
       <colgroup>
          <col style="width: 25px" />
          <col />
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
