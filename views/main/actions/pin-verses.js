let pinnedVerses = [];

//let isShiftKeyPressed = false;

async function getPinnedVerses() {
  const storageData = await chrome.storage.sync.get("pinnedVerses");
  const stored = storageData.pinnedVerses;
  if (Array.isArray(stored)) {
    // new format: array of pin objects ({ text, key? })
    return stored;
  }
  // legacy format: newline/`,`/`;`-joined string -> migrate to pin objects
  return splitVerses(stored || "Mat 5:1").map(t => makePinItem(t, booksCacheObj));
}

async function setPinnedVerses(pinnedVerses) {
  await chrome.storage.sync.set({
    pinnedVerses
  });
  // TODO notify other tabs to update values
}

function getVerseRow(pin, index) {
  const cls = isPinReference(pin, booksCacheObj) ? "verse-ref" : "custom-text";
  return `<tr draggable="true" data-index="${index}">
    <td class="remove-cell">
      <a tabindex="0" data-key="remove" class="action-btn remove-btn" title="Remove">✖</a>
    </td>
    <td>
      <a tabindex="0" data-key="open" class="${cls}">${displayPinText(pin, booksCacheObj)}</a>
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
    // rebuild order from each row's original index (pins are objects now);
    // scope to tbody rows so the tfoot preview row (no data-index) is excluded
    const order = $$("tr", tbody)
      .map(tr => parseInt(tr.dataset.index, 10))
      .filter(i => !isNaN(i));
    save(order);
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
      shortcut: "Shift + Click",
      itemId: "projectAll",
      handler: () => {
        onReferenceClick(e.target, {
          ctrlKey: true
        });
      }
    });
    actions.push({
      text: "Force Project (bring to front)",
      icon: icons.bringToFront,
      itemId: "bringToFront",
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
    if (hasParallelView()) {
      actions.push({
        text: `Copy ${e.target.innerText} (Parallel)`,
        icon: icons.copyIcon,
        itemId: "copyParallel",
        handler: async () => {
          // TODO check Parallel refs for Russian
          await onReferenceCopy([e.target], parallelViewSelector);
        }
      });
    }
  }

  actions.push({
    text: "Copy all to clipboard",
    icon: icons.copyAll,
    itemId: "copyAll",
    handler: async () => {
      await onReferenceCopy();
    }
  });
  if (hasParallelView()) {
    actions.push({
      text: "Copy all to clipboard (Parallel)",
      icon: icons.copyAll,
      itemId: "copyAllParallel",
      handler: async () => {
        // TODO check Parallel refs for Russian
        await onReferenceCopy(undefined, parallelViewSelector);
      }
    });
  }
  actions.push({
    text: "Save all to json",
    icon: icons.export,
    itemId: "saveJson",
    handler: async () => {
      await onReferenceSaveJson();
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
        pinnedVerses.splice(getRowIndex(e.target), 1);
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
        pinnedVerses = [pinnedVerses[getRowIndex(e.target)]];
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
  initDragDrop($("tbody", form), async order => {
    pinnedVerses = order.map(i => pinnedVerses[i]);
    updatePinnedRows(pinnedVerses);
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
    pinnedVerses = verses;
    updatePinnedRows(pinnedVerses);
  });
  return form;
}

function onReferenceClick(target, e) {
  const action = target.dataset.key;
  switch (action) {
    case "remove": {
      pinnedVerses.splice(getRowIndex(target), 1);
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

function getRowIndex(target) {
  return parseInt(target.closest("tr").dataset.index, 10);
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
  preview.scrollIntoViewIfNeeded(true);
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

  pinnedVerses.forEach(pin => {
    if (shortMatch) {
      return;
    }
    const similarMatch = getVerseInfo(displayPinText(pin, booksCacheObj));
    if (!similarMatch) {
      return;
    }
    const book = similarMatch.book;
    const bookText = findBookText(book, booksCache);
    // compare diacritic/case-insensitively so a pinned shortcut still matches the current book
    if (similarMatch && bookText && latinizeText(bookText.toLowerCase()) === latinizeText(match.book.toLowerCase())) {
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
  let simplified = value;
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
  let newVerses = splitVerses(value).map(v => improveReference(v, booksCache));
  if (!newVerses.length) {
    return;
  }
  newVerses = fixSplitedRefereces(newVerses);
  const newPins = newVerses.map(t => makePinItem(t, booksCacheObj));
  const editor = $("#pinned-verses-editor");
  if (editor.style.display !== "none") {
    pinnedVerses = splitVerses(editor.value).map(t => makePinItem(t, booksCacheObj));
  }
  // dedupe by reference identity (book key + numbers) / raw text for custom pins
  const byKey = new Map();
  [...pinnedVerses, ...newPins].forEach(pin => {
    if (!byKey.has(pinKey(pin))) {
      byKey.set(pinKey(pin), pin);
    }
  });
  pinnedVerses = [...byKey.values()];
  editor.value = pinnedVerses.map(p => displayPinText(p, booksCacheObj)).join("\n");
  updatePinnedRows(pinnedVerses);
  setPinnedVerses(pinnedVerses);
  input.value = "";
  input.focus(); // focus in case we clicked on add '+'
  const firstAddedText = displayPinText(newPins[0], booksCacheObj);
  const firstAddedRow = $$("#pinned-verses-list tbody td").find(e => e.innerText === firstAddedText);
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
  // edit-all shows plain (localized) text; refs are converted back on save
  editor.value = pinnedVerses.map(p => displayPinText(p, booksCacheObj)).join("\n");
  editor.style.display = "block";
  e.target.closest(".action-btn").classList.add("hidden-action");
  $('#verses-text-box button[data-key="save"]').classList.remove("hidden-action");
}

function onReferenceSave(e) {
  const editor = $("#pinned-verses-editor");
  editor.style.display = "none";
  $("#pinned-verses-list").style.display = "table";
  pinnedVerses = splitVerses(editor.value).map(t => makePinItem(t, booksCacheObj));
  updatePinnedRows(pinnedVerses);
  setPinnedVerses(pinnedVerses);
  e.target.closest(".action-btn").classList.add("hidden-action");
  $('#verses-text-box button[data-key="edit"]').classList.remove("hidden-action");
}

function getAllVersesContent(numbers, view = primaryViewSelector) {
  return numbers.reduce((verses, number) => {
    const [verseInfo] = getVersesContent(number, view);
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

async function onReferenceCopy(verses, view = primaryViewSelector) {
  const maskWrapper = $("#verses-text-box .info-text-content-wrapper");
  maskWrapper.classList.add("loading-mask", "text-mask");
  const targets = verses || $$("[data-key=open]");
  try {
    // 1) convert each pin to a concrete ref (incl. parallel verse-mapping), then
    // 2) fetch every chapter from the API in parallel by language-independent key.
    const refs = targets.map(target => resolveCopyRef(target, view));
    const allVerses = await copyRefs(refs, maskWrapper);
    copyToClipboard(allVerses);
  } catch (e) {
    // any failure (network, missing key/version, mapping) -> DOM-navigation fallback
    console.warn("API copy failed, falling back to opening references", e);
    await copyByOpeningReferences(targets, view, maskWrapper);
  }
  maskWrapper.dataset.text = "";
  maskWrapper.classList.remove("loading-mask", "text-mask");
}

// Convert a pinned row into a concrete ref to fetch:
//   { versionId, book (USFM key), chapter, numbers|null, label }  or  { custom, label }
// For the parallel view the chapter/verses are mapped from the primary version's
// numbering to the parallel version's (e.g. VDC Psalm 23:1 -> НРП Psalm 22:1) so
// we fetch the right chapter; the label stays the reference the user pinned.
function resolveCopyRef(target, view) {
  const pin = pinnedVerses[getRowIndex(target)];
  const match = pin && pin.key ? getVerseInfo(pin.text) : null;
  const label = target.innerText;
  if (!match) {
    // custom text (or a ref we couldn't resolve to a key) -> copy verbatim
    return { custom: true, label };
  }
  const urlParams = getUrlParams();
  if (!urlParams || !urlParams.primary) {
    throw new Error("no primary version in url");
  }
  if (view !== parallelViewSelector) {
    return {
      versionId: urlParams.primary,
      book: pin.key,
      chapter: match.chapter,
      numbers: copyVerseNumbers(match),
      label
    };
  }
  // parallel view: map the reference into the parallel version's numbering
  if (!urlParams.parallel) {
    throw new Error("no parallel version in url");
  }
  const from = getVersionById(urlParams.primary);
  const to = getVersionById(urlParams.parallel);
  const start = bibleReferenceMap({ book: pin.key, chapter: match.chapter, verse: match.verse || 1 }, from, to, false);
  let numbers = null;
  if (match.verse) {
    const end = match.to
      ? bibleReferenceMap({ book: pin.key, chapter: match.chapter, verse: match.to }, from, to, false)
      : start;
    numbers = match.to ? fillNumbers(start.verse, end.verse) : [start.verse];
  }
  return {
    versionId: urlParams.parallel,
    book: pin.key,
    chapter: start.chapter,
    numbers,
    label
  };
}

function copyVerseNumbers(match) {
  if (!match.verse) {
    return null; // whole chapter
  }
  return match.to ? fillNumbers(match.verse, match.to) : [match.verse];
}

// Fetch every ref's chapter from the API in parallel and build the clipboard text.
// Progress (done / total) updates as each request settles. Throws on any failure
// so the caller can fall back to the DOM-navigation flow.
async function copyRefs(refs, maskWrapper) {
  let done = 0;
  const total = refs.length;
  maskWrapper.dataset.text = `0 / ${total}`;
  const blocks = await Promise.all(
    refs.map(async ref => {
      const block = await fetchRefBlock(ref);
      maskWrapper.dataset.text = `${++done} / ${total}`;
      return block;
    })
  );
  return blocks.join("\n");
}

async function fetchRefBlock(ref) {
  if (ref.custom) {
    return `📋 ${ref.label}\n`;
  }
  const versesInfo = await getChapterFromAPI({ primary: ref.versionId, book: ref.book, chapter: ref.chapter });
  if (!versesInfo) {
    throw new Error(`empty chapter for ${ref.book}.${ref.chapter}`);
  }
  const content = ref.numbers
    ? extractVersesFromInfo(versesInfo, ref.numbers)
    : versesInfo.map(v => `${v.verseNr} ${v.content}`).join("\n"); // whole chapter
  return `📌 ${ref.label}\n${content}\n`;
}

// Save all pinned references (custom text filtered out) of the current primary
// version to a downloaded JSON file. A reference without a verse (whole chapter)
// is expanded into one item per verse; a single verse or a range stays one item.
async function onReferenceSaveJson() {
  const maskWrapper = $("#verses-text-box .info-text-content-wrapper");
  maskWrapper.classList.add("loading-mask", "text-mask");
  try {
    const refs = $$("[data-key=open]")
      .map(target => resolveCopyRef(target, primaryViewSelector))
      .filter(ref => !ref.custom);
    let done = 0;
    const total = refs.length;
    maskWrapper.dataset.text = `0 / ${total}`;
    const items = await Promise.all(
      refs.map(async ref => {
        const refItems = await fetchRefItems(ref);
        maskWrapper.dataset.text = `${++done} / ${total}`;
        return refItems;
      })
    );
    download(JSON.stringify(items.flat(), null, 2), "bible-pinned-references.json", "application/json");
  } catch (e) {
    console.warn("Save to json failed", e);
  }
  maskWrapper.dataset.text = "";
  maskWrapper.classList.remove("loading-mask", "text-mask");
}

// Build the JSON items for a single ref: { ref, text }.
// Whole-chapter refs (no verse) become one item per verse; an explicit verse or
// range stays a single item (verse-number prefixed when it spans more than one).
async function fetchRefItems(ref) {
  const versesInfo = await getChapterFromAPI({ primary: ref.versionId, book: ref.book, chapter: ref.chapter });
  if (!versesInfo) {
    throw new Error(`empty chapter for ${ref.book}.${ref.chapter}`);
  }
  if (!ref.numbers) {
    // whole chapter -> every verse as its own item
    return versesInfo.map(v => ({
      ref: `${ref.label}:${v.verseNr}`,
      text: v.content
    }));
  }
  return [
    {
      ref: ref.label,
      text: extractVersesFromInfo(versesInfo, ref.numbers)
    }
  ];
}

// Pull the requested verse numbers out of an API chapter result, handling
// grouped verses (e.g. a "43-47" label covers each number in that range once).
function extractVersesFromInfo(versesInfo, numbers) {
  const used = new Set();
  const lines = [];
  numbers.forEach(number => {
    const info = versesInfo.find(v => {
      const nr = String(v.verseNr).trim();
      if (nr === String(number)) {
        return true;
      }
      const group = parseGroupedVerseLabel(nr);
      return group && number >= group.from && number <= group.to;
    });
    if (info && !used.has(info)) {
      used.add(info);
      const prefix = numbers.length > 1 ? info.verseNr + " " : "";
      lines.push(prefix + info.content);
    }
  });
  return lines.join("\n");
}

// Fallback: open each reference in the page and scrape verse content from the DOM.
async function copyByOpeningReferences(targets, view, maskWrapper) {
  const primaryText = [];
  await asyncForEach(targets, async (target, i, all) => {
    maskWrapper.dataset.text = `${i} / ${all.length}`;
    const { title, match } = await openPinReference(target, false);

    if (title && match) {
      let ref = title;
      if (view === parallelViewSelector) {
        const titles = getChapterTitles();
        ref = titles[1];
      }
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

      const verses = getAllVersesContent(numbers, view);
      primaryText.push(`📌 ${ref}`);
      primaryText.push(verses.join("\n") + "\n");
    } else {
      primaryText.push(`📋 ${target.innerText}\n`);
    }
  });

  const allVerses = primaryText.join("\n");
  copyToClipboard(allVerses);
}

async function openPinReference(target, project = true) {
  const value = target.innerText;
  const match = getVerseInfo(value);
  if (match) {
    setAutoSelectVerse(match);
    const icon = target.closest("tr").querySelector('a[data-key="remove"]');
    icon.classList.add("spin");
    const title = await openChapter(match.book, match.chapter);
    await checkCacheVersesInfo();
    await waitAndSelectVerse(match, title, project);
    // if code reaches this point it means that verse is already selected,
    //   so we can clear auto select verse to avoid,
    //   in case code does not reach this point (eg. page reloads durring selection)
    //   checkAutoProject will be called after page reload.
    // Then => clear auto select verse since we already used it in waitAndSelectVerse
    icon.classList.remove("spin");
    getAutoSelectVerse();
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
  const rows = pinnedVerses.map((pin, index) => getVerseRow(pin, index)).join("");
  $("#pinned-verses-list tbody").innerHTML = rows;
}

// Re-render pins against the current book cache. Upgrades items that were added
// before the cache loaded (or in a different language) so refs relocalize and
// color correctly after a version switch. Persists when any key was resolved.
function refreshPinnedVerses() {
  if (!pinnedVerses.length || !$("#pinned-verses-list")) {
    return;
  }
  let changed = false;
  pinnedVerses = pinnedVerses.map(pin => {
    if (pin.key) {
      return pin;
    }
    const upgraded = makePinItem(pin.text, booksCacheObj);
    if (upgraded.key) {
      changed = true;
    }
    return upgraded;
  });
  updatePinnedRows(pinnedVerses);
  if (changed) {
    setPinnedVerses(pinnedVerses);
  }
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
