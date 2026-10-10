#!/usr/bin/env node
// Fails (exit 1) if any content file or i18n key exists in only one language.
//
// Rules:
//  - Every Markdown file under content/ must carry a language suffix
//    (*.de.md or *.en.md) and have its counterpart in the other language.
//  - i18n/de.toml and i18n/en.toml must define the same set of keys, and no
//    value may be empty.
// Usage: node scripts/check-language-parity.mjs   (no dependencies)

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const LANGS = ["de", "en"];
const root = new URL("..", import.meta.url).pathname;
const errors = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

// --- content files ---------------------------------------------------------
const mdFiles = walk(join(root, "content"))
  .filter((p) => p.endsWith(".md"))
  .map((p) => relative(root, p));
const present = new Set(mdFiles);
const suffix = new RegExp(`\\.(${LANGS.join("|")})\\.md$`);

for (const file of mdFiles) {
  const m = file.match(suffix);
  if (!m) {
    errors.push(`${file}: missing language suffix (use .de.md / .en.md)`);
    continue;
  }
  for (const other of LANGS.filter((l) => l !== m[1])) {
    const counterpart = file.replace(suffix, `.${other}.md`);
    if (!present.has(counterpart)) errors.push(`${file}: no ${other} counterpart (${counterpart})`);
  }
}

// --- i18n keys -------------------------------------------------------------
// The i18n files use flat `key = "value"` entries (no tables).
function readKeys(lang) {
  const file = join(root, "i18n", `${lang}.toml`);
  const keys = new Map();
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return;
    const m = t.match(/^([A-Za-z0-9_-]+)\s*=\s*"(.*)"\s*$/);
    if (!m) {
      errors.push(`i18n/${lang}.toml:${i + 1}: unsupported syntax (use key = "value")`);
      return;
    }
    if (keys.has(m[1])) errors.push(`i18n/${lang}.toml:${i + 1}: duplicate key ${m[1]}`);
    if (m[2].trim() === "") errors.push(`i18n/${lang}.toml:${i + 1}: empty value for ${m[1]}`);
    keys.set(m[1], m[2]);
  });
  return keys;
}

const i18n = Object.fromEntries(LANGS.map((l) => [l, readKeys(l)]));
for (const lang of LANGS) {
  for (const other of LANGS.filter((l) => l !== lang)) {
    for (const key of i18n[lang].keys()) {
      if (!i18n[other].has(key)) errors.push(`i18n: key "${key}" exists in ${lang} but not in ${other}`);
    }
  }
}

if (errors.length) {
  console.error(`Language parity check failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`Language parity OK: ${mdFiles.length} content files, ${i18n.de.size} i18n keys.`);
