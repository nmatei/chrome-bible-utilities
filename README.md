# Chrome extension to for Bible.com (display verses on external Projector/Screen)

![icon](icon-48.png)

This extension will help you project any verses in your Church,
You decide which version to display and also can project parallel versions
or in 2 different languages.

## Features

- [x] **Project** selected verses (+/- parallel text)
  - [x] `Search` Book and Chapter
  - [x] `Click` on verse number to display it on projector
  - [x] `Up/Down/Left/Right` arrows to navigate to next/preview verses
  - [x] `CTRL + Click` to add verse to selection (multi select)
  - [x] `ALT + Click` to force project window to be on top (in case is not visible)
  - [x] `ESC` to show blank page (hide all selected verses)
- [x] improved text for copy (hide notes and add space after verse number)

## Results

Primary View + projected
![Primary](screens/primary.jpg)

Parallel View + projected
![Parallel](screens/parallel.jpg)


## Setup Plugin as Developer (one time only)

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

## Developers TODOs (items to improve)

- [ ] Improve search
  - [ ] Type full verse reference (+shorcuts: Rom 2.2) and press enter to display it automatically
- [ ] Check if verses are not in sync 
  - [x] Numbers 13 in RO vs RU has more verses
  - [x] Chapters in Psalms in RO vs RU have different numbers
- [ ] Sync primary verses to be in same 'line' with parallel
  - [ ] If parallel/primary is selected (focused) - second view primary/parallel should scroll
- [ ] User Settings
  - [ ] Select what verses to display on main screen
  - [ ] Allow to display on 2 different screens (more than 2 even better)
  - [ ] Allow display inline/block for main screen or projected screen
  - [ ] Adjust font-size & line-height for main page
  - [ ] Adjust css variables (--rootPadding, --referenceColor, --referenceFontSize, --verseNumberColor)
  - [ ] Remember last url (or if parallel was opened)
  - [ ] Display Reference version (VDC, НРП)
  - [ ] Empty Text display (ex. Church name, verse, motto, etc.)
    - [ ] Customize size & color