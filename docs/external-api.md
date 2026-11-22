# 🔌 External API (for other extensions)

[⬅ Back to README](../README.md)

| Action / message                                                               | What it does                                 |
| ------------------------------------------------------------------------------ | -------------------------------------------- |
| [`help`](#help--list-available-actions)                                        | list available actions                       |
| [`updateText`](#updatetext--project-text-or-markdown)                          | project text or Markdown                     |
| [`updateFrame`](#updateframe--project-an-external-web-page)                    | project an external web page                 |
| [`getVerses`](#getverses--get-the-text-of-a-reference-no-projection)           | get the text of a reference (no projection)  |
| [`projectVerses`](#projectverses--open-a-reference-on-biblecom-and-project-it) | open a reference on bible.com and project it |
| [`verse`](#verse--hear-the-verses-projected-from-biblecom)                     | hear the verses projected from bible.com     |
| [Response status codes](#response-status-codes)                                | `status` values of the responses             |

Example of an extension using it (projecting songs): [github.com/unu-unu-ro/norless-improvements-extension](https://github.com/unu-unu-ro/norless-improvements-extension)

Other Chrome extensions can send content to the **projection windows** with
[`chrome.runtime.sendMessage`](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#external).
If the target projection window is not open, it is **opened automatically** — but only windows
enabled in the projector settings (toolbar popup: window ① / ②). bible.com is also opened (in background, without focus)
when no bible.com tab is open. Removing an external page (`updateFrame` with `url: ""`)
never opens a window.

- **Extension ID**: `fklnkmnlobkpoiifnbnemdpamheoanpj` (Chrome Web Store)
  - for an unpacked (developer) install, copy the ID from [chrome://extensions/](chrome://extensions/)
- Without `index` the message goes to all enabled windows (window ① by default); send `index` to target only one of them.

```js
const PROJECTOR_ID = "fklnkmnlobkpoiifnbnemdpamheoanpj";

async function project(action, payload) {
  return chrome.runtime.sendMessage(PROJECTOR_ID, { action, payload });
}
```

## `help` – list available actions

```js
const help = await chrome.runtime.sendMessage(PROJECTOR_ID, { action: "help" });
// { status: 200, availableActions: { updateText: {...}, updateFrame: {...} }, statusCodes: {...} }
```

## `updateText` – project text or Markdown

```js
await project("updateText", {
  index: 1,
  text: "# Amazing Grace\n\nAmazing grace! How sweet the sound\n\nThat saved a wretch like me!",
  markdown: true
});
```

| Payload              | Type              | Description                                                                                |
| -------------------- | ----------------- | ------------------------------------------------------------------------------------------ |
| `text`               | string (required) | Content to display (HTML is sanitized with DOMPurify). `""` = blank screen                 |
| `markdown`           | boolean           | Parse `text` as [Markdown](https://github.com/markedjs/marked) (tables, lists, checkboxes) |
| `index`              | `1` \| `2`        | Projection window. If omitted, all enabled windows are updated                             |
| `nonBreakingHyphens` | boolean           | Replace `-` with non-breaking hyphens (in text nodes only)                                 |

- tip: wrap paragraphs in a `.singlelines` container to keep each line on one row (font auto-fits screen width)
- an `updateText` message (or a verse selected on bible.com, or `ESC`) replaces an external page shown with `updateFrame`

## `updateFrame` – project an external web page

Shows any web page as a **full size** iframe over the projection window (eg. an online slide deck, a video, a countdown, a live stream).

```js
// show a page
await project("updateFrame", { index: 1, url: "https://docs.google.com/presentation/d/PRESENTATION_ID/embed" });

// remove it (back to verses / clock)
await project("updateFrame", { index: 1, url: "" });
```

| Payload | Type              | Description                                                                  |
| ------- | ----------------- | ---------------------------------------------------------------------------- |
| `url`   | string (required) | `https://` url (or `http://localhost` for local apps). `""` removes the page |
| `index` | `1` \| `2`        | Projection window. If omitted, all enabled windows are updated               |

**Security** – the external page is isolated from the projector:

- only `https://` urls (or `http://localhost` / `127.0.0.1`) without credentials are accepted — `javascript:`, `data:`, `file:`, `chrome-extension:` ... are rejected (`status: 400`)
- the page is always cross-origin, so it **can't read anything** from the projector window (DOM, settings, storage, `chrome.*` APIs)
- Chrome blocks it from redirecting the projector window unless someone clicks inside the page first (the url is chosen by you anyway)
- only the origin is sent as referrer (never the full url), and only `autoplay`, `fullscreen`, `encrypted-media`, `picture-in-picture` are allowed (no camera, microphone, geolocation, clipboard ...)

**Notes**

- sites that forbid embedding (`X-Frame-Options` / CSP `frame-ancestors`) will show an empty/error page — use their _embed_ url when available
- while the iframe has focus, keyboard shortcuts (arrows, `ESC`, `F11`) go to the external page — click outside it or use bible.com to control the projector

## `getVerses` – get the text of a reference (no projection)

```js
const response = await project("getVerses", { reference: "John 3:16-17" });
// {
//   status: 200,
//   reference: "John 3:16-17",
//   usfm: "JHN.3.16-17",
//   version: { id: 1, name: "KJV" },
//   verses: [{ verse: "16", text: "For God so loved the world..." }, { verse: "17", text: "..." }],
//   text: "16 For God so loved the world...\n17 ..."
// }
```

| Payload     | Type              | Description                                                                                                      |
| ----------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `reference` | string (required) | `"John 3:16-18"`, `"JHN 3:16"` or a whole chapter `"Psalm 23"`. Book name in the bible.com language or USFM code |
| `version`   | number            | bible.com version id (eg. `111` for NIV). Defaults to the version open on bible.com                              |

## `projectVerses` – open a reference on bible.com and project it

```js
await project("projectVerses", { reference: "PSA 23:1-3" });
```

Works like a 📌 pinned reference: bible.com opens the chapter, selects the verses and projects them
(with the parallel version, arrow keys continue from there). The reference is not added to the pinned list.

| Payload     | Type              | Description                                                    |
| ----------- | ----------------- | -------------------------------------------------------------- |
| `reference` | string (required) | `"John 3:16-18"` or `"JHN 3:16"` (a verse is required)         |
| `index`     | `1` \| `2`        | Projection window. If omitted, all enabled windows are updated |

- the reference is checked first: nothing is projected when it is not valid (`status: 400` / `422`)
- the response (same as `getVerses`) comes when the projection has started
- bible.com is opened in background if no bible.com tab is open (both `getVerses` and `projectVerses`)

## `verse` – hear the verses projected from bible.com

Connect with [`chrome.runtime.connect`](https://developer.chrome.com/docs/extensions/develop/concepts/messaging#external)
(from a service worker or a content script) to get a message each time **bible.com projects or clears verses** in a window:
a verse click, arrows, `ESC`, a 📌 pinned reference or a `projectVerses`. Text sent by extensions (`updateText` / `updateFrame`) sends nothing.

```js
function listenVerses() {
  const port = chrome.runtime.connect(PROJECTOR_ID, { name: "my-extension" });
  port.onMessage.addListener(({ action, payload }) => {
    if (action === "verse") {
      // { index: 1, reference: "VDC Ioan 3:16-17", text: "Fiindcă atât de mult...\nDumnezeu, în adevăr..." }
      // { index: 2, reference: null, text: "" } - window 2 cleared
      console.info(payload);
    }
  });
  // the port closes when this extension's service worker stops (eg. idle): connect again
  port.onDisconnect.addListener(() => setTimeout(listenVerses, 1000));
}
listenVerses();
```

One message per window that changed (an external `projectVerses` with an `index` changes only that window):

| Payload     | Type           | Description                                                                                     |
| ----------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `index`     | `1` \| `2`     | Projection window                                                                               |
| `reference` | string \| null | The reference in the window header as plain text, eg. `"VDC Ioan 3:16-18"`; `null` when cleared |
| `text`      | string         | The verses as plain text, one verse per line, without verse numbers; `""` when cleared          |

## Response status codes

| `status` | Meaning                                                        |
| -------- | -------------------------------------------------------------- |
| `200`    | Done                                                           |
| `400`    | Invalid payload (eg. url/index/reference format) – see `error` |
| `403`    | Unknown action – send `{ action: "help" }` for the list        |
| `404`    | Window (`index`) is disabled in projector settings             |
| `422`    | Reference not found (book, chapter or verse) – see `error`     |
| `500`    | Projection window did not respond – see `error`                |
