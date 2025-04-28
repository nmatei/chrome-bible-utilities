let pinnedVerses = [];

//let isShiftKeyPressed = false;

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

function showPinContextMenu(e) {
  const isVerse = e.target.matches("a[data-key=open]");
  const actions = [];
  if (isVerse) {
    actions.push({
      text: "Project entire reference",
      icon: icons.projectAll,
      handler: () => {
        onReferenceClick(e.target, {
          ctrlKey: true
        });
      }
    });
    actions.push({
      text: "Force Project (bring to front)",
      icon: icons.bringToFront,
      handler: () => {
        onReferenceClick(e.target, {
          ctrlKey: true,
          altKey: true
        });
      }
    });
    actions.push("-");
    actions.push({
      text: `Copy ${e.target.innerText}`,
      icon: icons.copyIcon,
      itemId: "copy",
      handler: async () => {
        await onReferenceCopy([e.target]);
      }
    });
  }

  actions.push({
    text: "Copy all to clipboard",
    icon: icons.copyAll,
    itemId: "copyAll",
    handler: async () => {
      await onReferenceCopy();
    }
  });

  actions.push("-");
  if (isVerse) {
    actions.push({
      text: `Remove ${e.target.innerText}`,
      itemId: "remove",
      icon: icons.remove,
      cls: "alert-color",
      handler: () => {
        pinnedVerses = pinnedVerses.filter(v => v !== e.target.innerText);
        updatePinnedRows(pinnedVerses);
        setPinnedVerses(pinnedVerses);
      }
    });
    actions.push({
      text: `Clear all except ${e.target.innerText}`,
      icon: icons.remove,
      itemId: "clear",
      cls: "alert-color",
      handler: () => {
        pinnedVerses = [e.target.innerText];
        updatePinnedRows(pinnedVerses);
        setPinnedVerses(pinnedVerses);
      }
    });
  }

  actions.push({
    text: "Clear all",
    icon: icons.removeAll,
    itemId: "clearAll",
    cls: "alert-color",
    handler: () => {
      pinnedVerses = [];
      updatePinnedRows(pinnedVerses);
      setPinnedVerses(pinnedVerses);
    }
  });

  const menu = getContextMenu(actions);

  showByCursor(menu, e);
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
    showPinContextMenu(e);
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
    // TODO add reference to list even if is empty
    //  (eg. click on add/preview button)
    // console.warn("submit", e);
    e.preventDefault();
    onReferenceSubmit(preview);
    if (isShiftKeyPressed) {
      await onReferenceKeydown({
        key: "Enter",
        shiftKey: true,
        target: { value: "" }
      });
    }
  });

  $("#pin-add-verse", form).addEventListener("keydown", onReferenceKeydown);
  $('button[data-key="edit"]', form).addEventListener("click", onReferenceEdit);
  $('button[data-key="save"]', form).addEventListener("click", onReferenceSave);

  initShiftKeyEvents();

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
      const multiSelect = e.ctrlKey || e.metaKey || e.shiftKey; // metaKey for MacOs
      openPinReference(target).then(async ({ match }) => {
        if (multiSelect && match && match.to) {
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

function onReferenceSearch(e, preview) {
  let value = cleanSpaces(e.target.value);
  value = getSearchShortcuts(value);
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
  const prevText = getVerseStr({
    book: bookText || book,
    chapter: match?.chapter || "",
    verse: match?.verse || "",
    to: match?.to || ""
  });
  preview.innerText = "➕ " + prevText;
}

function cleanSpaces(text) {
  return text.replaceAll(multiSpaceRegExp, " ").trim();
}

// finds shortcuts (used in saved pin list) for book names, and use this instead of full name
function findBookNameShortcuts(title, value, versesOnly) {
  const match = getVerseInfo(title);
  if (!match) {
    return title;
  }
  let shortMatch;

  pinnedVerses.forEach(v => {
    if (shortMatch) {
      return;
    }
    const similarMatch = getVerseInfo(v);
    if (!similarMatch) {
      return;
    }
    const book = similarMatch.book;
    const bookText = findBookText(book, booksCache);
    if (similarMatch && bookText === match.book) {
      const newTitle = similarMatch.book + (versesOnly ? ` ${match.chapter}:${value}` : " " + value);
      shortMatch = getVerseInfo(newTitle);
    }
  });
  if (!shortMatch) {
    const newTitle = match.book + (versesOnly ? ` ${match.chapter}:${value}` : " " + value);
    shortMatch = getVerseInfo(newTitle);
  }
  return shortMatch;
}

function getSearchShortcuts(value) {
  let simplified = value
  if (value.endsWith("-")) {
    // if value ends with "-" while typing... ignore "-"
    simplified = value.substring(0, value.length - 1);
  }
  if (searchVersesNrsRegExp.test(simplified)) {
    const titles = getChapterTitles();
    if (titles && titles[0]) {
      const titleMatch = findBookNameShortcuts(titles[0], simplified, true);
      value = getVerseStr(titleMatch);
    }
  } else if (searchChapterNrRegExp.test(simplified)) {
    const titles = getChapterTitles();
    if (titles && titles[0]) {
      const titleMatch = findBookNameShortcuts(titles[0], simplified, false);
      value = getVerseStr(titleMatch);
    }
  }
  return value;
}

function onReferenceSubmit(preview) {
  if (preview) {
    preview.innerText = "";
  }
  const input = $("#pin-add-verse");
  let value = cleanSpaces(input.value);
  value = getSearchShortcuts(value);
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
      const { match } = await openPinReference(focused);
      // check e.shiftKey in case isShiftKeyPressed is false set (eg. keyup before pin opened)
      if ((isShiftKeyPressed || e.shiftKey) && match && match.to) {
        // multiSelect
        await doSelectVerses(match.to, false, false, false, true);
      }

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
  e.target.closest(".action-btn").classList.add("hidden-action");
  $('#verses-text-box button[data-key="save"]').classList.remove("hidden-action");
}

function onReferenceSave(e) {
  const editor = $("#pinned-verses-editor");
  editor.style.display = "none";
  $("#pinned-verses-list").style.display = "table";
  pinnedVerses = splitVerses(editor.value);
  updatePinnedRows(pinnedVerses);
  setPinnedVerses(pinnedVerses);
  e.target.closest(".action-btn").classList.add("hidden-action");
  $('#verses-text-box button[data-key="edit"]').classList.remove("hidden-action");
}

function getAllVersesContent(numbers) {
  return numbers.reduce((verses, number) => {
    const [verseInfo] = getVersesContent(number);
    if (verseInfo) {
      let vNumber = "";
      if (numbers.length > 1) {
        vNumber = verseInfo.verseNr + " ";
      }
      verses.push(vNumber + verseInfo.content);
    }
    return verses;
  }, []);
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

      const verses = getAllVersesContent(numbers);
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
      <div class="input-trigger">${icons.search}</div>
    </div>
    <div class="actions row-actions">
      <button type="button" class="action-btn" data-key="edit" title="Edit All">
        ${icons.edit}
      </button>
      <button type="button" class="action-btn hidden-action" data-key="save" title="Save">
        ${icons.save}
      </button>
      <span class="fill"></span>
      <button type="submit" class="action-btn" data-key="add" title="Add new Verse [ Enter ] (second [ Enter ] to project)">
        ${icons.add}
      </button>
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
