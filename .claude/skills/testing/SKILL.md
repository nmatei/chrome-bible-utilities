---
name: testing
description: Use when adding, running, or editing unit tests for this Chrome extension — Jest + ts-jest tests under test/unit/ that import functions from views/common/*. Covers the test commands, the ts-jest/setupFiles config, and this repo's test conventions.
---

# Testing (Jest + ts-jest)

This repo tests pure logic extracted from the extension's content/background scripts. Tests
are **TypeScript** run through **Jest** with the `ts-jest` preset. There is no browser/DOM
environment — `testEnvironment` is `node`, so only framework-agnostic functions are tested
(verse parsing, reference formatting, Bible mappings, text latinization), not Chrome APIs or
DOM behavior.

## Run

```bash
npm test            # or: yarn test   → runs `jest` once
npm run watch-test  # → `jest --watch`, re-runs on change (use while iterating)
```

`npm run deploy` runs `yarn test` first, so a broken test blocks a release. Run a single file
with `npx jest test/unit/search.test.ts`, or a single case with `-t "<name pattern>"`.

## Config (lives in `package.json`)

```jsonc
"jest": {
  "preset": "ts-jest",
  "testEnvironment": "node",
  "setupFiles": [
    "<rootDir>/views/common/utilities.js",
    "<rootDir>/views/common/bible-mappings.js"
  ]
}
```

The `setupFiles` are loaded **before** the test framework. The extension's source files are
plain browser scripts that attach functions to the global scope, so loading them in setup
makes those helpers available as globals during tests. If a test or the code under test calls
a helper that isn't a global yet, assign it explicitly (see conventions below).

## Location & naming

- Unit tests: `test/unit/<feature>.test.ts` — these are what `jest` picks up.
- Integration helpers/fixtures: `test/integration/` (e.g. `storage.sync.js`, `color/`).
- `test/unit/settings.te_st._js` is **intentionally disabled** — the mangled extension keeps
  it from matching Jest's `*.test.*` pattern so it won't run. Rename it back to `*.test.ts`
  only when it's ready to be revived.

## Conventions (see `test/unit/search.test.ts`)

- **Import the unit under test** from the source with a relative path:
  ```ts
  import { improveReference, splitVerses } from "../../views/common/utilities";
  import { getVerseInfo, formatVerseRef } from "../../views/common/bible-mappings";
  import { latinizeText } from "../../views/common/latinizeText";
  ```
- Group with `describe(...)`; write cases with `test(...)` or `it(...)`.
- Prefer **`test.each([...])`** for table-driven cases (the suite tests many verse-format
  strings this way):
  ```ts
  test.each(validVersesFormats)("valid search verses format: %s", format => {
    expect(searchVersesNrsRegExp.test(format)).toBe(true);
  });
  ```
- **When the code under test expects a helper as a global**, assign it onto `global[...]`
  inside the `describe` before the cases run:
  ```ts
  global["latinizeText"] = latinizeText;
  global["getVerseInfo"] = getVerseInfo;
  global["formatVerseRef"] = formatVerseRef;
  ```
- Assertions: `toBe` for primitives/string output, `toEqual` for arrays/objects.

## Add or edit a test

1. Create `test/unit/<feature>.test.ts`.
2. Import the target function(s) from `views/common/` (or the relevant source file).
3. If the function references other helpers as globals at runtime, wire them via
   `global["<name>"] = <imported>` first.
4. Follow the `describe` + `test.each` + `expect(...).toBe/.toEqual` style above.
5. Run `npm run watch-test` while iterating, then `npm test` once to confirm the full suite
   is green before committing.
