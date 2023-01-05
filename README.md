# Chrome extension to for Bible.com

![icon](icon-48.png)

This extension will help you **project Bible verses in your Church**,
You decide which version to display and also can project parallel versions
or in **2 different languages**.

## 💠 Features & Usage

- [x] 🔤 **Project selected verses** (+/- parallel text)
  - [x] 🔎 `Search` Book and Chapter
  - [x] `Click` on verse number to **display** it on projector
  - [x] `Up/Down/Left/Right` arrows to navigate to **next/preview** verses
  - [x] `CTRL + Click` to **add verse** to selection (multi select)
  - [x] `CTRL + Shift + Click` to multi select between last selection
  - [x] `ALT + Click` to force project window to be on top (in case is not visible)
  - [x] `ESC` to show **blank page** (hide all selected verses)
  - [x] `F11` to enter/exit **fullscreen** projector window (first focus it)
- [x] 🛠 User Settings (top-left actions)
  - [x] Adjust css variables (padding, colors)
  - [x] remember last windows position (projector & settings)
- [x] 💬 **Project "live text"**
  - [x] input any text to be projected ([Markdown](https://github.com/markedjs/marked) format)
  - [x] `CTRL + Enter` to project live text (inside textarea)
  - [ ] Select any text from page and allow it to be projected
- [x] 2️⃣ open **Multiple chrome tabs** with different chapters
  - [x] all windows will project to the same projector page
  - [x] projector page will close only when all tabs from my.bible.com are closed
- [x] ✨ **Improvements**
  - [x] 🔎 Search 1 (part of Book + chapter: **Heb 11** / Ioan 3) + Enter
  - [x] 🔎 Search 2 (part of Book + chapter + verse: Heb 11 1 / **Ioan 3 16**) + Enter
  - [x] text for copy (hide notes and add space after verse number)

## 🎞 Results

**Primary** View + projected

![Primary](screens/primary.jpg)

**Parallel** View + projected

![Parallel](screens/parallel.jpg)

**Actions**

![Actions](screens/actions.jpg)

## ⚙ Install Plugin

- [x] Install Chrome plugin from **Chrome web store** [📖 Project verses from bible.com](https://chrome.google.com/webstore/detail/%F0%9F%93%96-project-verses-from-bi/fklnkmnlobkpoiifnbnemdpamheoanpj)
- [x] 📌 **Pin** extension to see it after search bar for fast access
  - [x] ![icon](icon-16.png) Click on **Extension** icon

## ⚙ Setup Plugin as Developer (one time only)

If you want to try the latest versions before they are released, or to change code as you wish, try to install it as Developer

- [x] **Download/Clone** this repo
  - [ ] as zip & Unzip it
  - [x] or `git clone https://github.com/nmatei/chrome-bible-utilities.git`
  - [x] to update use `git pull`
- [x] Open [chrome://extensions/](chrome://extensions/)
  - [x] Activate `Developer mode`
- [x] **Load unpacked** Extension
- [x] Select chrome-bible-utilities folder
- [x] 📌 **Pin** extension to see it after search bar for fast access
  - [x] ![icon](icon-16.png) Click on **Extension** icon
  - [x] Will open https://my.bible.com/bible if not opened
- [x] Sign in to YouVersion on https://my.bible.com/sign-in
  - [x] Must be logged in to have parallel view and to enable this plugin

## 📋 Developers TODOs (items to improve)

- [ ] Check if verses are not in sync 
  - [x] `Numbers 13` in `RO` vs `RU` has more verses
  - [x] Chapters in `Psalms` in RO vs RU have different numbers
  - [ ] Check more chapters
- [ ] Sync primary verses to be in same 'line' with parallel
  - [ ] If parallel/primary is selected (focused) - second view primary/parallel should scroll
- [ ] User Settings
  - [ ] Allow to display on **2 different screens** (primary => Screen 1, parallel => Screen 2)
  - [ ] Allow display inline/block for main screen or projected screen
  - [ ] Adjust font-size & line-height main screen or projected screen
  - [ ] Remember last url (or if parallel was opened - store it in storage.sync)
  - [ ] Display Reference version (VDC, НРП)
  - [ ] Customize styles for parallel vs primary
  - [ ] Empty Text display (ex. Church name, verse, motto, etc.)
    - [ ] Customize size & color
- [ ] Add host_permissions/matches https://bible.com/bible* https://www.bible.com/bible*
  - [ ] to be able to use it even not logged in