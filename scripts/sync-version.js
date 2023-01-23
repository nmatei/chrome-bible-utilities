const fs = require("fs");
const manifest = require("./../manifest.json");
const version = process.env.npm_package_version;

console.info("%o: %o => %o: %o", "package.version", version, "manifest.version", manifest.version);

manifest.version = version;
const content = JSON.stringify(manifest, null, 2);
fs.writeFileSync("./manifest.json", content, "utf8");
console.info("updated %o: %o", "manifest.version", version);
