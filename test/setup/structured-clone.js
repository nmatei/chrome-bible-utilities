// jest-environment-jsdom (eg. selector-fallback.test.ts) has no structuredClone, used by views/common/bible-mappings.js
if (typeof structuredClone === "undefined") {
  const v8 = require("node:v8");
  globalThis.structuredClone = value => v8.deserialize(v8.serialize(value));
}
