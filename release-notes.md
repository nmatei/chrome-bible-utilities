# 📈 Release Notes (Changelog)

for [Chrome extension to for Bible.com](README.md) by [@Matei Nicolae](https://nmatei.github.io) - Source [github.com/nmatei/chrome-bible-utilities](https://github.com/nmatei/chrome-bible-utilities)

💚 **Love this extension?** Share [feedback](https://chromewebstore.google.com/detail/project-verses-from-bible/fklnkmnlobkpoiifnbnemdpamheoanpj) and help us make it even better + helps others to find this resource.

## 2.9.0 (coming soon)

- [x] while typing in the search field, ignore last char if is '-' (e.g. "Mat 6:7-" => "Mat 6:7")
- [x] copy parallel verses to clipboard
- [ ] when change to different slide master, update font-size (it could be different, depends on slide Screen Padding, etc.)

## 2.8.0 (2025-04-07)

- [x] in projector page if there are checkboxes from live text "[x] / [ ]", allow to 'check/uncheck' (+ improve UX for them)
- [x] when add new ref using short ref (ex. "2:4") - add it to the list using existing book short name (ex. "Exo 2:4"), search for book name in list
- [x] Context menu on verses number (right click) - copy verse
- [x] Fix bug where force project window will not be on top for second screen

## 2.7.0 (2025-03-05)

- [x] Store state of help/live when is closed with X button
- [x] Fix notification popup when new version updated and user press 'No' button

## 2.6.0 (2025-02-16)

- [x] Add close buttons for "Help" and "Live Text"
- [x] Add [1] or [2] on windows for projection (so we know which one is backstage or live)
- [x] Save live preview state in storage (text, title and live checkbox - restores content after page refresh)
- [x] Add a notification when new version updated (with release notes link)

## 2.5.0

- [x] Possibility to Display on **2 different screens** (primary => Screen 1, parallel => Screen 2)
- [x] Export Selected Slide (right click on slide)
- [x] Allow to upload multiple images for Backgrounds

## 2.4.0

- [x] Duplicate Slide with Context Menu (right click)
- [x] Check duplicate content when import settings
- [x] Improve tables design in projector view (live text with markdown - add borders, padding)
- [x] Allow more spaces to be displayed in live text markdown
- [x] Update [markdown](https://marked.js.org/#usage) library to latest version

## 2.3.0

- [x] Context menu on verses number (right click) - Add to list & project
- [x] Reordering slides master layouts (right click) - Move up / down

## 2.2.0

- [x] Update all **icons with new design**
- [x] **Export & Import settings** (for easy backup/restore/share)
- [x] Don't allow to remove images from settings if they are used in slides

## 2.1.0

- [x] Duplicate Slide in Slide Master
- [x] Fix missing options bug, that will not project any verses

## 2.0.0

- [x] **Slide master** - allow **Multiple layouts** (easy switch between them)
- [x] Improved Shift key visibility (when press)

## 1.34.0

- [x] Improve color picker to allow copy/paste hex color.
- [x] Add config for body / verses font family.
- [x] When screen 1 & 2 are not selected to project -> add a 'bullet' on settings button so we know

## 1.32.0

- [x] Don't let share verse tooltip appear when click on verse number
- [x] Fix scroll into view when selected verse is already loaded (scrolls only if chapter not loaded)

## 1.31.0

- [x] Visual improvements for Shift key when press
- [x] Display Reference version (VDC, НРП) in the projector tab
- [x] Bug fixing (issue when chapter was not loaded => auto refresh page and try to select verse again)

## 1.30.0

- [x] **Shift + Enter** to add and project full reference (Mat 6:7-13)
- [x] Force Project (bring to front) within right click menu (ContextMenu)
- [x] Bug fix for MacOs - make sure projector window is not hidden when minimized

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
- [x] Fix ContextMenu position when is out of window bounds

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

- [x] Allow copy from page (disable auto focus when ctrlKey or metaKey are pressed)
- [x] Use text shadow and for list items in live text
- [x] Allow navigation using keys when focus is on input but empty

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

- [x] Improvements when add reference
- [x] Background images

## 1.14.0

- [x] Fix mappings for UBIO (Ukrainian)
- [x] Fix more RU mappings (DAN.4, HOS.14, JON.2)
- [x] Fix error when parallel verse not found

## 1.13.0

- [x] 📄 **Copy** all pin verses to clipboard

## 1.12.0

- [x] ↕ **drag & drop** to reorder verses
- [x] Highlight current Pin

## 1.11.0

- [x] Improved search in pin verses
- [x] Improved Russian mappings (Psalms 10-150, eg. `[VDC] PSA 23:1  -> [НРП] PSA 22:1`)
- [x] Add 2 implementations (bible.com & my.bible.com)
