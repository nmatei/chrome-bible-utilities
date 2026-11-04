#!/usr/bin/env node
/**
 * Saves bible.com pages into test/integration/bible.com.content/ for `npm run check-selectors`,
 * replacing the manual Ctrl+S → "Webpage, Complete". See the `update-selectors` skill.
 *
 * Drives the locally installed Chrome over the DevTools protocol - no extra dependency. The
 * window is visible: bible.com's bot check blocks headless Chrome, so when it shows up it is
 * solved by hand, and the dedicated profile (~/.cache/bible-capture-chrome) keeps its cookie
 * for the next runs (`--headless 1` for the old behavior).
 *
 * The book picker is opened with the extension's own chapterPickerArrow()
 * (views/bibles/bible.com/selectors.js is injected in the page), so a capture proves the
 * extension finds the button too.
 *
 *   node scripts/capture-bible-pages.mjs                 # or: npm run capture-pages
 *   node scripts/capture-bible-pages.mjs --version 191 --parallel 1 --ref MAT.5 --width 1400
 *   CHROME_PATH=/path/to/chrome node scripts/capture-bible-pages.mjs
 *
 * Each capture is `auto - <ref> - <state>.html` plus a `_files/` directory with the js/css
 * bundles the page loaded (including the lazy chunks of an open picker), for mining the JSX.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "test/integration/bible.com.content");
const SELECTORS_JS = path.join(ROOT, "views/bibles/bible.com/selectors.js");
const PROFILE_DIR = path.join(os.homedir(), ".cache/bible-capture-chrome");
const PORT = 9335;

function readArgs() {
  const args = { version: "191", parallel: "1", ref: "PSA.1", abbr: "VDC", width: 1400, headless: "" };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "");
    if (!(key in args)) {
      console.error(`unknown option --${key}, known: ${Object.keys(args).join(", ")}`);
      process.exit(1);
    }
    args[key] = argv[i + 1];
  }
  return args;
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium"
  ];
  const chrome = candidates.find(c => c && fs.existsSync(c));
  if (!chrome) {
    console.error("Chrome not found, set CHROME_PATH");
    process.exit(1);
  }
  return chrome;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function connect(chromePath, width, headless) {
  // bible.com is behind a bot check (Fastly "Client Challenge") that headless Chrome can't pass:
  // the window is visible and the profile is kept, so the check is solved by hand once and its
  // cookie reused. Chrome refuses remote debugging on the default profile, hence a dedicated one.
  const profile = headless ? fs.mkdtempSync(path.join(os.tmpdir(), "bible-capture-")) : PROFILE_DIR;
  const chrome = spawn(
    chromePath,
    [
      ...(headless ? ["--headless=new"] : []),
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${profile}`,
      `--window-size=${width},900`,
      "--no-first-run",
      "--no-default-browser-check",
      "about:blank"
    ],
    { stdio: "ignore" }
  );
  let targets;
  for (let i = 0; i < 50 && !targets; i++) {
    try {
      targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
    } catch {
      await sleep(200);
    }
  }
  if (!targets) {
    chrome.kill();
    throw new Error("Chrome did not start the DevTools endpoint");
  }
  const ws = new WebSocket(targets.find(t => t.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let id = 0;
  const pending = {};
  ws.onmessage = msg => {
    const data = JSON.parse(msg.data);
    if (data.id && pending[data.id]) {
      pending[data.id](data);
      delete pending[data.id];
    }
  };
  const send = (method, params = {}) =>
    new Promise(resolve => {
      const i = ++id;
      pending[i] = resolve;
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  const evaluate = async expression => {
    const { result } = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    }
    return result.result.value;
  };
  const close = () => {
    ws.close();
    chrome.kill();
    if (headless) {
      // Chrome still holds the profile for a moment after kill
      setTimeout(() => fs.rmSync(profile, { recursive: true, force: true }), 500);
    }
  };
  return { send, evaluate, close, headless };
}

/** Polls an expression in the page until it is truthy. */
async function waitFor(evaluate, expression, timeout = 20000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await evaluate(`!!(${expression})`)) {
      return true;
    }
    await sleep(250);
  }
  return false;
}

// the extension helpers selectors.js relies on (the real ones live in views/common/)
const SHIMS = `
  window.$ = (s, p = document) => p.querySelector(s);
  window.$$ = (s, p = document) => [...p.querySelectorAll(s)];
  window.backgroundSleep = ms => new Promise(r => setTimeout(r, ms));
`;

async function injectSelectors(evaluate) {
  // the module.exports guard is the only statement that is not a declaration
  const source = fs.readFileSync(SELECTORS_JS, "utf8").replace(/if \(typeof module[\s\S]*?\n}\n/, "");
  const names = [...source.matchAll(/^(?:const|let|function)\s+(\w+)/gm)].map(m => m[1]);
  await evaluate(`${SHIMS}\n${source}\n;window.__S = { ${names.join(", ")} }; true`);
}

async function save(evaluate, name) {
  const file = path.join(CONTENT_DIR, `${name}.html`);
  const filesDir = path.join(CONTENT_DIR, `${name}_files`);
  fs.writeFileSync(file, "<!DOCTYPE html>\n" + (await evaluate("document.documentElement.outerHTML")));

  // every js/css the page loaded so far, lazy chunks included - fetched by the page itself,
  // so the requests carry the bot check cookie (a plain node fetch gets a 403)
  const bundles = await evaluate(`Promise.all(
    [...new Set(performance.getEntriesByType("resource").map(e => e.name))]
      .filter(u => /^https:\\/\\/[^/]*bible\\.com\\/.*\\.(js|css)(\\?|$)/.test(u))
      .map(url => fetch(url)
        .then(res => res.ok ? res.text() : Promise.reject(new Error(res.status)))
        .then(text => ({ url, text }), e => ({ url, error: e.message })))
  )`);
  fs.rmSync(filesDir, { recursive: true, force: true });
  fs.mkdirSync(filesDir);
  let saved = 0;
  bundles.forEach(({ url, text, error }) => {
    if (error) {
      console.warn("   could not download %s: %s", url, error);
      return;
    }
    fs.writeFileSync(path.join(filesDir, path.basename(new URL(url).pathname)), text);
    saved++;
  });
  console.log(`   saved ${path.relative(ROOT, file)} (+${saved} bundles)`);
}

async function capture(browser, url, name, withPicker) {
  const { send, evaluate } = browser;
  console.log(`── ${url}`);
  await send("Page.navigate", { url });
  await sleep(1000);
  if (await evaluate(`document.title === "Client Challenge"`)) {
    if (browser.headless) {
      throw new Error("bible.com bot check (Client Challenge) - run without --headless and solve it in the window");
    }
    console.log("   bible.com bot check - solve it in the Chrome window (waiting up to 3 min)...");
    await waitFor(evaluate, `document.title !== "Client Challenge"`, 180000);
  }
  if (!(await waitFor(evaluate, `document.querySelector('[class*="_verse"]')`))) {
    throw new Error(`no verses rendered on ${url}`);
  }
  // let the client side rendering (version names, parallel view) settle
  await sleep(2000);
  await save(evaluate, name);

  if (withPicker) {
    await injectSelectors(evaluate);
    const button = await evaluate(`(() => { const b = __S.chapterPickerArrow(); b && b.click(); return !!b })()`);
    if (!button) {
      throw new Error("chapterPickerArrow() found no button - the picker selector is broken");
    }
    const opened = await waitFor(evaluate, `document.querySelector(__S.booksSelector())`, 10000);
    if (!opened) {
      throw new Error("the books list never rendered after clicking chapterPickerArrow()");
    }
    await sleep(500);
    await save(evaluate, `${name} - books dialog open`);
  }
}

const args = readArgs();
fs.mkdirSync(CONTENT_DIR, { recursive: true });
const browser = await connect(findChrome(), args.width, !!args.headless);
try {
  const base = `https://www.bible.com/bible/${args.version}/${args.ref}.${args.abbr}`;
  await capture(browser, base, `auto - ${args.ref} - chapter`, false);
  if (args.parallel) {
    // parallel + open picker covers the always, parallel, books and chapters states at once
    await capture(browser, `${base}?parallel=${args.parallel}`, `auto - ${args.ref} - parallel`, true);
  }
  console.log("\nnext: npm run check-selectors");
} catch (e) {
  console.error("\ncapture failed:", e.message);
  process.exitCode = 1;
} finally {
  browser.close();
}
