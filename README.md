# Chrome extension to for Bible.com

![icon](views/icons/icon-48.png)

This extension will help you **project Bible verses in your Church**,
You decide which version to display and also can project parallel versions
or in **2 different languages**.

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [💠 Features & Usage](#-features--usage)
- [🎞 Results](#-results)
- [⚙ Install Plugin](#-install-plugin)
- [🎫 QR Code](#-qr-code)
- [👋 Support my Work](#-support-my-work)
- [💠 Advanced Features](#-advanced-features)
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
  - [x] `CTRL + Click` project all verses from pin (Mat 6:7-13)
  - [x] 📝 **Edit All** to Copy/Paste/Edit multiple references
  - [x] ➕ will pin current Reference if search input is empty
  - [x] 'Search pin': `16`, `2-4`, `2:4`, `2 4`, `+Enter` - pin current chapter or verses
  - [x] ↕ **drag & drop** to reorder verses
  - [x] 📄 **Copy** all pin verses to clipboard
- [x] 2️⃣ open **Multiple chrome tabs** with different chapters
  - [x] all windows will project to the same projector page
  - [x] projector page will close only when all tabs from my.bible.com are closed
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
- [x] ✔ Install Chrome plugin from **Chrome web store** [Project verses from bible.com](https://chrome.google.com/webstore/detail/project-verses-from-bible/fklnkmnlobkpoiifnbnemdpamheoanpj)
- [x] 📌 **Pin** extension to see it after search bar for fast access
  - [x] ![icon](views/icons/icon-16.png) Click on **Extension** icon


## 🎫 QR Code

[bit.ly/project-bible](https://bit.ly/project-bible)

![bit.ly_project-bible](screens/bit.ly_project-bible.jpg)

## 👋 Support my Work

A simple way to **support my work** & to **improve** your programming skills is to buy **My course on Udemy**

- [x] ‍💻 [Become a WEB Developer from Scratch, step by step Guide](https://www.udemy.com/course/become-a-web-developer-from-scratch-step-by-step-guide/?couponCode=2023-START-WEB-DEV) - by [Nicolae Matei](https://nmatei.github.io/)


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
  - [x] ![icon](views/icons/icon-16.png) Click on **Extension** icon
  - [x] Will open https://my.bible.com/bible if not opened
- [x] Sign in to YouVersion on https://my.bible.com/sign-in
  - [x] Must be logged in to have parallel view and to enable this plugin

## 💠 Advanced Features

- [x] User Settingsfix bug when drag/drop pin - remove will not remove correct pin.
  - [x] Clock position (or hide)
  - [x] hide/show arrows (actions) from projecting screen
  - [x] Upload multiple background images and allow to easy switch them

## 📋 Developers TODOs (items to improve)

- [ ] Check if verses are not in sync
  - [x] Available Language mappings and version
    - [x] Russian (НРП/СИНОД/SYNO/CARS/CARS-A)
    - [x] Ukrainian (UBIO)
  - [ ] Review Translations and create other [mappings](views/common/bible-mappings.js)
    - [ ] Especially for 🟨🟦 Ukrainian & ⬜🟦🟥 Russian
    - [x] 🙏 [mappings tests](test/bible-mappings.test.ts)
    - [x] 🙏 need some external help here (if you find issues please create a [tiket](../../issues) with link you've seen)
- [ ] User Settings
  - [ ] Allow Multiple layouts (to easy switch between them)
  - [ ] Allow to display on **2 different screens** (primary => Screen 1, parallel => Screen 2)
  - [ ] Allow display inline/block for main screen
  - [ ] Display Reference version (VDC, НРП)
  - [ ] Empty Text display (ex. Church name, verse, motto, etc.)
    - [ ] Customize size & color
- [ ] Add WebHooks configs (ex. to publish to wireless monitors)
  - [ ] create integration app that can be installed
- [ ] after update - add notification about new features.
- [ ] while copy references - use percentage or {count}/{total}
- [ ] i18n
- [ ] when 1&2 are not selected to project -> add a 'bullet' on settings button so we know
- [ ] cleanup chars when add ref from copy/paste
  - [ ] ‭‭Filipeni‬ 

### 🐛 Known bugs

- [ ] check when parallel chapter is not loaded for RO - RU (Psalms) - add 5sec timeout