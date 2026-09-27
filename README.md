# Chrome extension to for Bible.com

![icon](views/icons/icon-48.png)

This extension will help you **project Bible verses in your Church**,
You decide which version to display and also can project parallel versions
or in **2 different languages**.

## ⚙ Install Plugin

- [x] ✔ Install Chrome plugin from **Chrome web store** [Project verses from bible.com](https://chrome.google.com/webstore/detail/project-verses-from-bible/fklnkmnlobkpoiifnbnemdpamheoanpj)
- [x] visit [https://bible.com/bible](https://bible.com/bible)
  - [x] new actions (💬, 🛠, ❔, 📌) should be visible in top/left corner
- [ ] 📌 **Pin** extension to see it after search bar for fast access
  - [ ] ![icon](views/icons/icon-16.png) Click on **Extension** icon

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [⚙ Install Plugin](#-install-plugin)
- [💠 Features & Usage](#-features--usage)
- [📈 Release Notes](#-release-notes)
- [🎞 Results](#-results)
- [👋 Support my Work](#-support-my-work)
- [💠 Advanced Features](#-advanced-features)
- [🔌 External API (for other extensions)](#-external-api-for-other-extensions)
- [⚙ Setup Plugin as Developer](#-setup-plugin-as-developer)
- [▶ Build procedure](#-build-procedure)
- [📋 Developers TODOs (items to improve)](#-developers-todos-items-to-improve)
- [🎫 QR Code](#-qr-code)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## 💠 Features & Usage

- [x] 🔤 **Project selected verses** (+/- parallel text)
  - [x] 🔎 `Search` Book and Chapter
  - [x] `Click` on verse number to **display** it on projector
  - [x] `Up / Down / Left / Right` arrows to navigate to **next/preview** verses
  - [x] `CTRL + Click` to **add verse** to selection (multi select)
  - [x] `Shift + Click` to multi select between last selection
  - [x] `ALT + Click` on verse number or Pinned reference, to force project window to be on top (in case is not visible)
  - [x] `ESC` to show **blank page** (hide all selected verses)
  - [x] `F11` to enter/exit **fullscreen** projector window (first focus it)
- [x] 💬 **Project "live text"** (fast and simple slide)
  - [x] input any text to be projected ([Markdown](https://github.com/markedjs/marked) format)
  - [x] `CTRL + Enter` to project live text (inside title or textarea)
  - [x] `iframe: https://...` (as the only text) to project an **external web page** (full size) - see [updateFrame](#updateframe--project-an-external-web-page) for security notes
    - [x] with **Live** updates on, the page is loaded only on `CTRL + Enter` / submit (not while typing the url)
  - [ ] Select any text from page and allow it to be projected
- [x] 📌 **List/Pin some references** (verses)
  - [x] Store references for future selection and project them faster
  - [x] `Enter` to add references (`,` or `;` as separator) in **Pin verses 🔍** input
  - [x] `Enter + Enter` to project added reference
  - [x] `Shift + Enter` to add and project full reference (Mat 6:7-13)
  - [x] `ALT + Click` on Reference - force project (on top)
  - [x] `CTRL + Click` project all verses from pin (Mat 6:7-13)
  - [x] 📝 **Edit All** to Copy/Paste/Edit multiple references
  - [x] ➕ will pin current Reference if search input is empty
  - [x] 'Search pin': `16`, `2-4`, `2:4`, `2 4`, `+Enter` - pin current chapter or verses
  - [x] ↕ **drag & drop** to reorder verses
  - [x] 🖱 **Context menu** (right click) for more actions inside pin list
    - [x] 📄 **Copy** selected verse to clipboard
    - [x] 📄 **Copy** all pin verses to clipboard
    - [x] ✖ Clear all
  - [x] **Change Reference 🔍** from Projector tab - works same as **Add Ref's 🔍**
    - [x] `Tab` inside projector tab to see bottom dock-bar
    - [x] 🖱 move mouse at the bottom edge of projector tab
    - [x] Type any reference and use same shortcuts to project it (`Enter` or `Shift + Enter` for multiple verses)
- [x] 2️⃣ open **Multiple chrome tabs** with different chapters
  - [x] all windows will project to the same projector page
  - [x] projector page will close only when all tabs from bible.com are closed
- [x] 🛠 **User Settings** (top-left actions)
  - [x] Toggle 1️⃣ primary OR 2️⃣ parallel verses to be projected
  - [x] Adjust css variables (spacing, colors)
  - [x] remember last windows position (projector & settings)
  - [x] ☽ Try [Night mode](https://github.com/JosNun/night-mode-bible) extension

## 📈 Release Notes

Check [release-notes.md](release-notes.md) changelog

💚 Love this extension? Share [feedback](https://chromewebstore.google.com/detail/project-verses-from-bible/fklnkmnlobkpoiifnbnemdpamheoanpj) and help us make it even better!

## 🎞 Results

**1️⃣ Primary** View + projected

![Primary](screens/primary.jpg)

**2️⃣ Parallel** View + projected

![Parallel](screens/parallel.jpg)

**💬 Actions**

![Actions](screens/actions.jpg)

**🛠 Settings**

![Actions](screens/settings.jpg)

## 👋 Support my Work

A simple way to **support my work** & to **improve** your programming skills is to buy **My course on Udemy**.
(Or you can **Gift this course** to someone that will benefit from it).

- [x] ‍💻 [Become a WEB Developer from Scratch, step by step Guide](https://nmatei.github.io/web) - by [Nicolae Matei](https://nmatei.github.io/)

Or **support development** of this extension directly:

- [x] ☕ [Buy me a coffee](https://www.buymeacoffee.com/nmatei)
- [x] 💳 [PayPal](https://paypal.me/mateinick)
- [x] ❤️ [GitHub Sponsors](https://github.com/sponsors/nmatei)

## 💠 Advanced Features

- [x] **Slide master** - allow **Multiple layouts** (easy switch between them)
  - [x] 🕒 **Clock** position (or hide)
  - [x] Upload multiple **background images** and allow to easy switch them
  - [x] Background Opacity (make image lighter or darker)
- [x] Allow other extensions to send data to be projected
  - [x] via `Chrome Runtime Messages` (chrome.runtime.sendMessage)
  - [x] example how to project songs on this extension: [github.com/unu-unu-ro/norless-improvements-extension](https://github.com/unu-unu-ro/norless-improvements-extension)
  - [x] project text/Markdown (`updateText`) or a full size **external web page** (`updateFrame`)
  - [x] see [🔌 External API](#-external-api-for-other-extensions)

## 🔌 External API (for other extensions)

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

### `help` – list available actions

```js
const help = await chrome.runtime.sendMessage(PROJECTOR_ID, { action: "help" });
// { status: 200, availableActions: { updateText: {...}, updateFrame: {...} }, statusCodes: {...} }
```

### `updateText` – project text or Markdown

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

### `updateFrame` – project an external web page

Shows any web page as a **full size** iframe over the projection window (eg. an online slide deck, a video, a countdown, a live stream).

```js
// show a page
await project("updateFrame", { index: 1, url: "https://www.youtube.com/embed/VIDEO_ID?autoplay=1" });

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
- it is `sandbox`-ed: it **can't navigate/redirect** the projector window, open dialogs (`alert`) or start downloads
- no referrer is sent, and only `autoplay`, `fullscreen`, `encrypted-media`, `picture-in-picture` are allowed (no camera, microphone, geolocation, clipboard ...)

**Notes**

- sites that forbid embedding (`X-Frame-Options` / CSP `frame-ancestors`) will show an empty/error page — use their _embed_ url when available (eg. `youtube.com/embed/...`)
- while the iframe has focus, keyboard shortcuts (arrows, `ESC`, `F11`) go to the external page — click outside it or use bible.com to control the projector

### Response status codes

| `status` | Meaning                                                   |
| -------- | --------------------------------------------------------- |
| `200`    | Done                                                      |
| `400`    | Invalid payload (eg. url/index not allowed) – see `error` |
| `403`    | Unknown action – send `{ action: "help" }` for the list   |
| `404`    | Window (`index`) is disabled in projector settings        |
| `500`    | Projection window did not respond – see `error`           |

## ⚙ Setup Plugin as Developer

If you want to try the latest versions before they are released, or to change code as you wish, try to install it as Developer

- [x] **Download/Clone** this repository
  - [x] `< > Code` (green button) then `Download ZIP`
    - [x] unzip it and you will have `chrome-bible-utilities` folder
  - [x] or `git clone https://github.com/nmatei/chrome-bible-utilities.git`
    - [x] to update use `git pull`
- [x] _(optional)_ If you have **Slide Master** configured in the production extension, preserve your settings:
  - [x] Open 🛠 **Settings** in the production extension
  - [x] Go to **Slide Master** and click **Export** to save your slides configuration
- [x] Open [chrome://extensions/](chrome://extensions/)
  - [x] **Disable** the production extension
  - [x] Activate `Developer mode`
- [x] **Load unpacked** Extension
- [x] Select `chrome-bible-utilities` folder (from unzipped or cloned repo)
  - [x] _(optional)_ If you exported slides earlier: open 🛠 **Settings**, go to **Slide Master** and click **Import** to restore your slides configuration
- [x] Visit [https://bible.com/bible](https://bible.com/bible) and enjoy the latest version!

> **Note:** Once the fix you needed is officially released on the Chrome Web Store, don't forget to:
>
> - **Disable** the dev extension in [chrome://extensions/](chrome://extensions/)
> - **Re-enable** the production extension to benefit from latest stable releases
> - Turn off `Developer mode` in [chrome://extensions/](chrome://extensions/) — it is only needed when running unpacked extensions or actively developing

## ▶ Build procedure

- make sure all files are commited and pushed
- `npm install`
- `npm run deploy`
- under /build folder you will find latest zip file
- upload it to [chrome web store](https://chrome.google.com/webstore/developer/dashboard)

## 📋 Developers TODOs (items to improve)

- [ ] Multi slides to project content (same as live text but with multiple slides)
  - [ ] Add/Edit/Remove slides
- [ ] shortcuts for bold / italic - inside live text
- [ ] 🔳 Generate a **QR code on the main projector screen** from live text (eg. project a link or verse reference as a scannable QR)
- [ ] Check if verses are not in sync
  - [x] Available Language mappings and version
    - [x] Russian (НРП/СИНОД/SYNO/CARS/CARS-A)
    - [x] Ukrainian (UBIO)
      - [ ] Check `[RO] Ioel` mapping for Ukrainian (UBIO) - is it correct? (ex. Ioel 3:10 => Іоіл ?)
  - [ ] Review Translations and create other [mappings](views/common/bible-mappings.js)
    - [ ] Especially for 🟨🟦 Ukrainian & ⬜🟦🟥 Russian
    - [x] 🙏 [mappings tests](test/bible-mappings.test.ts)
    - [x] 🙏 need some external help here (if you find issues please create a [tiket](../../issues) with link you've seen)
- [ ] 🛠 **User Settings**
  - [ ] Allow video as background image...
  - [ ] Allow to easy select font family from drop down (or add your own)
  - [ ] Add config for body / verses text shadow.
  - [ ] Allow display inline/block for main screen
  - [ ] Empty Text display (ex. Church name, verse, motto, etc.)
    - [ ] Customize size & color
- [ ] Add WebHooks configs (ex. to publish to wireless monitors)
  - [ ] create integration app that can be installed
- [ ] i18n
- [ ] cleanup chars when add ref from copy/paste
  - [ ] ‭‭Filipeni‬
- [ ] use TypeScript and a build system?
  - [ ] https://medium.com/@tharshita13/creating-a-chrome-extension-with-react-a-step-by-step-guide-47fe9bab24a1
- [ ] when Books are not loaded even after second try, seems that clicking on 'next' chapter will load them - need to investigate more and find a better solution
- [ ] see if there is a new version of https://nodejs.bible.com/api/bible/chapter/3.1 and update the code to use it (if is better than current one)

### 🐛 Known bugs

- [x] https://www.bible.com/bible/191/EXO.15.VDC (v.2 - custom background color in dark mode - text not fully visible)
- [x] Select verse from parallel view then press right/left arrows - will not project the correct format
- [x] Page refresh after openPinReference (after verse navigation) - not sure yet why it happens
  - [x] Temporary fix: select `Parallel` view then `Exit Parallel Mode`

## 🎫 QR Code

[bit.ly/project-bible](https://bit.ly/project-bible)

![bit.ly_project-bible](screens/bit.ly_project-bible.jpg)
