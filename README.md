# Chrome extension to for Bible.com

![icon](icon-48.png)

This extension will help you **project Bible verses in your Church**,
You decide which version to display and also can project parallel versions
or in **2 different languages**.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [💠 Features & Usage](#-features--usage)
- [🎞 Results](#-results)
- [⚙ Install Plugin](#-install-plugin)
- [⚙ Setup Plugin as Developer](#-setup-plugin-as-developer)
- [📋 Developers TODOs (items to improve)](#-developers-todos-items-to-improve)

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
  - [ ] Select any text from page and allow it to be projected
- [x] 📌 **List/Pin some references** (verses)
  - [x] Store references for future selection and project them faster
  - [x] `Enter` to add references (`,` or `;` as separator) in 'Pin verses' input 🔍
  - [x] `Enter + Enter` to project added reference
  - [x] `ALT + Click` on Reference - force project (on top)
  - [x] 📝 **Edit All** to Copy/Paste/Edit multiple references
  - [x] ➕ will pin current Reference if search input is empty
  - [x] 'Search pin': `16`, `2-4`, `2:4`, `2 4`, `+Enter` - pin current chapter or verses
  - [ ] 📄 **Copy** all pin verses to clipboard
  - [ ] ↕ **drag & drop** to reorder verses
- [x] 2️⃣ open **Multiple chrome tabs** with different chapters
  - [x] all windows will project to the same projector page
  - [x] projector page will close only when all tabs from my.bible.com are closed
- [x] ✨ **Improvements**
  - [x] 🔎 Search 1 (part of Book + chapter: **Heb 11** / Ioan 3) + Enter
  - [x] 🔎 Search 2 (part of Book + chapter + verse: Heb 11 1 / **Ioan 3 16**) + Enter
  - [x] text for copy (hide notes and add space after verse number)
- [x] 🛠 **User Settings** (top-left actions)
  - [x] Toggle 1️⃣ primary OR 2️⃣ parallel verses to be projected
  - [x] Adjust css variables (spacing, colors)
  - [x] remember last windows position (projector & settings)

## 🎞 Results

**1️⃣ Primary** View + projected

![Primary](screens/primary.jpg)

**2️⃣ Parallel** View + projected

![Parallel](screens/parallel.jpg)

**💬 Actions**

![Actions](screens/actions.jpg)

**🛠 Settings**

![Actions](screens/settings.jpg)

## ⚙ Install Plugin

- [x] Create account on [my.bible.com](https://my.bible.com)
- [x] Install Chrome plugin from **Chrome web store** [Project verses from bible.com](https://chrome.google.com/webstore/detail/project-verses-from-bible/fklnkmnlobkpoiifnbnemdpamheoanpj)
- [x] 📌 **Pin** extension to see it after search bar for fast access
  - [x] ![icon](icon-16.png) Click on **Extension** icon

## ⚙ Setup Plugin as Developer

If you want to try the latest versions before they are released, or to change code as you wish, try to install it as Developer

- [x] **Download/Clone** this repo
  - [ ] as zip & Unzip it
  - [x] or `git clone https://github.com/nmatei/chrome-bible-utilities.git`
  - [x] to update use `git pull`
- [x] Open [chrome://extensions/](chrome://extensions/)
  - [x] Activate `Developer mode`
- [x] **Load unpacked** Extension
- [x] Select `chrome-bible-utilities` folder
- [x] 📌 **Pin** extension to see it after search bar for fast access
  - [x] ![icon](icon-16.png) Click on **Extension** icon
  - [x] Will open https://my.bible.com/bible if not opened
- [x] Sign in to YouVersion on https://my.bible.com/sign-in
  - [x] Must be logged in to have parallel view and to enable this plugin

## 📋 Developers TODOs (items to improve)

- [ ] Appears as not logged in (but I'm logged in)
  - [ ] https://www.bible.com/bible/191/PSA.9.VDC
    - [ ] pin cursor pointer for links
    - [ ] new line for verses
  - [ ] https://www.bible.com/ro/bible/191/EXO.12.VDC
  - [ ] https://www.bible.com/ro/bible/191/PSA.103.VDC
- [ ] not all words are displayed from verse
  - [ ] Ps 106:7 https://my.bible.com/bible/191/PSA.106.VDC?parallel=114
- [ ] Check if verses are not in sync
  - [x] Available Language mappings and version
    - [x] Russian (НРП/СИНОД/SYNO/CARS/CARS-A)
    - [x] Ukrainian (UBIO)
      - [ ] Chapters in `Psalms 10-150` in \* vs UA have different numbers
  - [ ] Review Translations and create other [mappings](views/common/bible-mappings.js) 
    - [x] 🙏 need some external help here (if you find issues please create a [tiket](../../issues) with link you've seen)
    - [ ] Especially for Ukrainian & Russian
- [ ] User Settings
  - [ ] Allow to display on **2 different screens** (primary => Screen 1, parallel => Screen 2)
  - [ ] Allow display inline/block for main screen
  - [ ] Remember last url (or if parallel was opened - store it in storage.sync)
  - [ ] Display Reference version (VDC, НРП)
  - [ ] Empty Text display (ex. Church name, verse, motto, etc.)
    - [ ] Customize size & color
- [ ] Add WebHooks configs (ex. to publish to wireless monitors)
  - [ ] create integration app that can be installed 
- [ ] More tests when user is not logged (before release) 
- [ ] highlight current book & chapter in Pin list (current slide)
- [ ] store most used versions to fast access them
- [ ] after update - add notification about new features.
- [ ] clock config position
- [ ] i18n
- [ ] Show title on pinned verse (if is not full name)