---
name: release-notes
description: Use when adding or updating entries in release-notes.md for this Chrome extension — "add next release notes", "add current changes to release notes", "prepare the next version". Covers how the version in package.json/manifest.json relates to the top section, how to turn commits and working-tree changes into user-facing bullets, and when to also touch screens/Store Listing.md.
---

# Release notes

`release-notes.md` is the public changelog (linked from the README and the Chrome Web Store
listing). It is written **for users of the extension**, not for developers: every bullet says
what changed _for the person projecting verses_, not which function was refactored.

## Where the version comes from

`package.json` and `manifest.json` hold the **same** version (kept in sync by
`scripts/sync-version.js`, run by `yarn v` / `npm run deploy`). The version is bumped
**before** the notes are written, by a commit named `increase version to vX.Y.Z`.

So the normal state while working on a release is:

- `package.json` / `manifest.json` → `2.19.0`
- `release-notes.md` → newest section is still `## 2.18.0 (2026-07-27)`

That means **2.19.0 has no section yet and you must add it**. Check first:

```bash
grep '"version"' package.json manifest.json
grep -n "^## " release-notes.md | head -3
```

- Top section version **older** than package.json → add a new `## X.Y.Z (soon)` section.
- Top section version **equal** to package.json → append bullets to that existing section.

## Dates

- While unreleased the heading is `## X.Y.Z (soon)`.
- On release day it becomes `## X.Y.Z (2026-07-27)` (`YYYY-MM-DD`, commit: `update release date`).
  Do not invent a date for an unreleased version — leave `(soon)`.

## What goes into the new section

Collect everything that is not yet released:

```bash
# commits made after the version bump
git log --oneline "$(git log --format=%H -1 --grep='increase version to v')"..HEAD
# plus not-yet-committed work
git diff --stat && git diff
```

Read the actual diff — commit subjects alone are usually too technical. Then group related
commits/changes into **one bullet each**; a single user-visible improvement that took four
commits is still one bullet.

Skip entirely: test-only changes, README TODO/known-bug checkboxes, comments, formatting,
and changes to `release-notes.md` itself.

## Bullet format

```markdown
- [x] 🐛 Fixed the **page refresh** when opening a pinned reference (📌) after verse navigation: the chapter is now opened **directly by url** — keeping your language, version and parallel version (eg. `/ro/bible/191/PSA.23.VDC?parallel=143`) — instead of relying on a reload
```

Conventions used throughout the file:

- Always a `- [x] ` checkbox — released items are checked.
- **Start with an emoji** matching the kind of change, reusing the ones already in the file:
  🐛 bug fix · ⚡ speed/behaviour improvement · 🖥️ 🪟 windows/projection · 🎨 UI ·
  🔤 🌍 language & references · 💾 📦 data/dependencies · 🔒 security · 🔌 external API ·
  ⏰ 🧰 🧹 🙈 🎯 features & polish.
- **Bold** the feature name or the key phrase; use `code` for references, urls, versions.
- Use `eg.` (this file's style), `—` for asides, `_italics_` (never `*italics*`; prettier
  normalizes those).
- One line per bullet, no hard wrapping. Nested ` -` sub-bullets only for multi-part features.
- Link GitHub issues when the change fixes one:
  `https://github.com/nmatei/chrome-bible-utilities/issues/2`.
- Order bullets biggest-user-impact first.

## Also update the Store Listing?

`screens/Store Listing.md` is the Chrome Web Store copy. Update it **only for notable new
features** (a new button, a new mode) — not for bug fixes. Add or adjust a `•` line in the
feature list, and the getting-started steps if the flow changed.

## Checklist

1. Compare `package.json` version with the top `## ` heading in `release-notes.md`.
2. Add `## X.Y.Z (soon)` (or extend the matching section).
3. Turn commits + working-tree diff into user-facing `- [x] <emoji> …` bullets.
4. For notable features, update `screens/Store Listing.md` too.
5. Leave version files alone — `yarn v` / `npm run deploy` bumps them.
