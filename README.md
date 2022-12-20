# Chrome extension to mark **Open** Bible.com or Cleanup notes

![icon](icon-48.png)
This extension will remove comments (from current page only),
and will add space after the verse number
so when you copy the text to have paste it in a better format.

## Features

- [x] improve text for copy the text.
- [x] project selected verses (+/- parallel text)

## Results

Primary View + projected
![Primary](screens/primary.jpg)

Parallel View + projected
![Parallel](screens/parallel.jpg)

## Usage

- [x] Click on **This Extension** ![icon](icon-16.png)
  - [x] Will open https://my.bible.com/bible if not opened
- [x] `Click` on verse number to 'project' it
- [x] `CTRL + Click` to add verse to selection (multi select)
- [x] `ALT + Click` to force project window to be on top (in case is not visible)

## Setup

- [x] **Download** this repo
  - [ ] as zip & Unzip it
  - [ ] or `git clone https://github.com/nmatei/chrome-bible-utilities.git`
- [x] Open [chrome://extensions/](chrome://extensions/)
  - [x] Activate `Developer mode`
- [x] **Load unpacked** Extension
- [x] Select chrome-bible-utilities folder

## TODO

- [ ] Improve search
  - [ ] Type full verse reference (+shorcuts: Rom 2.2) and press enter to display it automatically
- [ ] Check if verses are not in sync 
  - [ ] Numbers 13 in RO vs RU has more verses
  - [ ] Chapters in Psalms in RO vs RU have different numbers
- [ ] Sync primary verses to be in same 'line' with parallel
  - [ ] If parallel/primary is selected (focused) - second view primary/parallel should scroll 
- [ ] User Settings
  - [ ] Select what verses to display on main screen
  - [ ] Allow to display on 2 different screens (more than 2 even better)