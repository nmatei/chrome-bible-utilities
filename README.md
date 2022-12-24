# Chrome extension to for Bible.com (display verses on external Projector/Screen)

![icon](icon-48.png)

This extension will help you project any verses in your Church,
You decide which version to display and also can project parallel versions
or project in 2 different languages

## Features

- [x] improve text for copy
- [x] project selected verses (+/- parallel text)

## Results

Primary View + projected
![Primary](screens/primary.jpg)

Parallel View + projected
![Parallel](screens/parallel.jpg)

## Usage

- [x] 📌 Pin extension to see it after search bar
  - [x] ![icon](icon-16.png) Click on **This Extension**
  - [x] Will open https://my.bible.com/bible if not opened
- [x] `Click` on verse number to 'project' it
- [x] `Up/Down/Left/Right` arrows to navigate to next/preview verses
- [x] `CTRL + Click` to add verse to selection (multi select)
- [x] `ALT + Click` to force project window to be on top (in case is not visible)
- [x] `ESC` to show blank page (hide all selected verses)

## Setup Plugin as Developer

- [x] **Download/Clone** this repo
  - [ ] as zip & Unzip it
  - [x] or `git clone https://github.com/nmatei/chrome-bible-utilities.git`
  - [x] to update use `git pull`
- [x] Open [chrome://extensions/](chrome://extensions/)
  - [x] Activate `Developer mode`
- [x] **Load unpacked** Extension
- [x] Select chrome-bible-utilities folder

## TODO

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