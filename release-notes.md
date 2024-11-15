# 📈 Release Notes (Changelog)

for [Chrome extension to for Bible.com](README.md).

💚 Love this extension? Share [feedback](https://chromewebstore.google.com/detail/project-verses-from-bible/fklnkmnlobkpoiifnbnemdpamheoanpj) and help us make it even better!

## 2.0.0 (🔜 coming soon)

- [ ] Allow Multiple layouts (to easy switch between them)

## 1.34.0
- [x] Improve color picker to allow copy/paste hex color.
- [x] Add config for body / verses font family.
- [x] decrease max font size based on win size (for smaller screens or windows)
- [x] improve text-shadow for better visibility of text (when background image is used)
- [x] Night mode integration with (https://github.com/JosNun/night-mode-bible)

## 1.33.0

- [x] display current app version in help title
- [x] when screen 1 & 2 are not selected to project -> add a 'bullet' on settings button so we know

## 1.32.0

- [x] don't let share verse tooltip appear when click on verse number
- [x] fix scroll into view when selected verse is already loaded (scrolls only if chapter not loaded)

## 1.31.0

- [x] Visual improvements for Shift key when press
- [x] Display Reference version (VDC, НРП) in the projector tab
- [x] Bug fixing (issue when chapter was not loaded => auto refresh page and try to select verse again)

## 1.30.0

- [x] **Shift + Enter** to add and project full reference (Mat 6:7-13)
- [x] Force Project (bring to front) within right click menu (ContextMenu)
- [x] bug fix for MacOs - make sure projector window is not hidden when minimized

## 1.29.0

- [x] Request reference from Project TAB (press TAB inside projector tab to request reference, or move to bottom screen)

## 1.28.0

- [x] Fix bug when inputs in live updates did not work when input was empty and pin was opened
- [x] UX improvements when inside bible.com

## 1.27.0

- [x] Add config for title / chapters font family.
- [x] UX improvements for pin verses (left border, hover effect)

## 1.26.0

- [x] UX changes - Add Opacity for all boxes (eg. help, pin items)
- [x] fix ContextMenu position when is out of window bounds

## 1.25.0

- [x] Copy selected verse to clipboard within right click menu (ContextMenu)
- [x] Clear all except selected verse within right click menu (ContextMenu)

## 1.24.0

- [x] Show Notification Badge after app updates
- [x] Bug fixing

## 1.23.0

- [x] Use slider input range for Background Opacity
- [x] Save opened state for each main action button (will open view after refresh)

## 1.22.0

- [x] Background Opacity (make image lighter or darker)

## 1.21.0

- [x] allow copy from page (disable auto focus when ctrlKey or metaKey are pressed)
- [x] use text shadow and for list items in live text
- [x] allow navigation using keys when focus is on input but empty

## 1.20.0

- [x] Add Context menu (right click) inside pin list
- [x] Improve UX for focus inputs

## 1.19.0

- [x] Easy focus in search field when type outside
- [x] Improve UX for focus elements by Tab key
- [x] Make sure content is not in new line and last char is verse number

## 1.18.0

- [x] Add Russian mappings for RSP - Святая Библия: Современный перевод
- [x] Visual improvements

## 1.17.0

- [x] Visual improvements while selecting chapter in bible.com
- [x] UI improvements in Settings page
- [x] Fix loading Parallel chapter for RU (Psalms)

## 1.16.0

- [x] Settings - clock position
- [x] `CTRL + Click` project all verses from pin (Mat 6:7-13)
- [x] Fix a bug on drag and drop references

## 1.15.0

- [x] improvements when add reference
- [x] background images

## 1.14.0

- [x] Fix mappings for UBIO (Ukrainian)
- [x] Fix more RU mappings (DAN.4, HOS.14, JON.2)
- [x] Fix error when parallel verse not found

## 1.13.0

- [x] 📄 **Copy** all pin verses to clipboard

## 1.12.0

- [x] ↕ **drag & drop** to reorder verses
- [x] highlight current Pin

## 1.11.0

- [x] Improved search in pin verses
- [x] Improved Russian mappings (Psalms 10-150, eg. `[VDC] PSA 23:1  -> [НРП] PSA 22:1`)
- [x] Add 2 implementations (bible.com & my.bible.com)