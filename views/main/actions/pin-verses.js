let pinnedVerses = [];

async function getPinnedVerses() {
  const storageData = await chrome.storage.sync.get("pinnedVerses");
  return storageData.pinnedVerses || "Mat 5:1";
}

async function setPinnedVerses(pinnedVerses) {
  await chrome.storage.sync.set({ pinnedVerses: pinnedVerses.join("\n") });
  // TODO notify other tabs to update values
}

function getVerseRow(verse, i) {
  return `<tr>
    <td><a data-key="remove" class="action-btn remove-btn" data-idx="${i}" title="Remove">✖</a></td>
    <td><a data-key="open">${verse}</a></td>
  </tr>`;
}

function createPinVersesBox() {
  const form = addVersesBox();
  const preview = $("#ref-preview");
  form.querySelector("tbody").addEventListener("click", e => {
    const target = e.target;
    if (target.matches("a")) {
      const action = target.dataset.key;
      switch (action) {
        case "remove": {
          pinnedVerses.splice(target.dataset.idx, 1);
          updatePinnedRows(pinnedVerses);
          setPinnedVerses(pinnedVerses);
          break;
        }
        case "open": {
          openPinReference(target);
          break;
        }
      }
    }
  });
  $("#pin-add-verse").addEventListener(
    "input",
    debounce(e => {
      const newVerses = splitVerses(e.target.value);
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
      preview.innerText = getReferencePreview(bookText || book, match ? match.chapter : "", match ? match.verse : "");
    }, 100)
  );
  form.addEventListener("submit", async e => {
    e.preventDefault();
    preview.innerText = "";
    const input = $("#pin-add-verse");
    const newVerses = splitVerses(input.value);
    if (!newVerses.length) {
      return;
    }
    const editor = $("#pinned-verses-editor");
    if (editor.style.display !== "none") {
      pinnedVerses = splitVerses(editor.value);
    }
    pinnedVerses = [...pinnedVerses, ...newVerses];
    editor.value = pinnedVerses.join("\n");
    updatePinnedRows(pinnedVerses);
    setPinnedVerses(pinnedVerses);
    input.value = "";
    input.focus(); // focus in case we clicked on add '+'
    const firstAddedRow = $$("#pinned-verses-list tbody td").find(e => e.innerText === newVerses[0]);
    if (firstAddedRow) {
      const link = firstAddedRow.querySelector('[data-key="open"]');
      link.classList.add("focus");
      setTimeout(() => {
        link.classList.remove("focus");
      }, 5000);
    }
  });
  form.querySelector("#pin-add-verse").addEventListener("keydown", async e => {
    if (e.key === "Enter" && !e.target.value) {
      const focused = $('#pinned-verses-list a.focus[data-key="open"]');
      if (focused) {
        await openPinReference(focused);
        focused.classList.remove("focus");
        setTimeout(() => {
          const input = $("#pin-add-verse");
          input.focus();
        }, 10);
      }
    }
  });
  form.querySelector('button[data-key="edit"]').addEventListener("click", e => {
    $("#pinned-verses-list").style.display = "none";
    const editor = $("#pinned-verses-editor");
    editor.value = pinnedVerses.join("\n");
    editor.style.display = "block";
    e.target.style.display = "none";
    $('#verses-text-box button[data-key="save"]').style.display = "inline-block";
  });
  form.querySelector('button[data-key="save"]').addEventListener("click", async e => {
    const editor = $("#pinned-verses-editor");
    editor.style.display = "none";
    $("#pinned-verses-list").style.display = "table";
    pinnedVerses = splitVerses(editor.value);
    updatePinnedRows(pinnedVerses);
    setPinnedVerses(pinnedVerses);
    e.target.style.display = "none";
    $('#verses-text-box button[data-key="edit"]').style.display = "inline-block";
  });
  getPinnedVerses().then(verses => {
    pinnedVerses = splitVerses(verses);
    updatePinnedRows(pinnedVerses);
  });
  return form;
}

async function openPinReference(target) {
  const value = target.innerText;
  const match = getVerseInfo(value);
  if (match) {
    const icon = target.closest("tr").querySelector('a[data-key="remove"]');
    icon.classList.add("spin");
    await openChapter(match.book, match.chapter);
    // TODO click on same book & chapter will not project selected verse
    await waitAndSelectVerse(match.verse);
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
    <div class="actions row-actions form-field">
      <input placeholder="Pin verses" type="text" autocomplete="off" id="pin-add-verse" class="fill" title="for Multiple references use [ , ] or [ ; ]"/>
    </div>
    <div class="actions row-actions form-field">
      <button type="button" class="action-btn" data-key="edit" title="Edit All">📝</button>
      <button type="button" class="action-btn" data-key="save" title="Save" style="display: none">💾</button>
      <span class="fill"></span>
      <button type="submit" class="action-btn" data-key="add" title="Add new Verse [ Enter ]">➕</button>
    </div>
    <div id="pinned-verses-wrapper">
      <textarea id="pinned-verses-editor" cols="14" rows="6" style="display: none"></textarea>
      <table id="pinned-verses-list">
       <colgroup>
          <col span="1" style="width: 25px" />
          <col span="1" />
        </colgroup>
        <tbody></tbody>
        <tfoot>
          <tr><td colspan="2" id="ref-preview"></td></tr>
        </tfoot>
      </table>
    </div>
  `;
  document.body.appendChild(form);
  return form;
}
