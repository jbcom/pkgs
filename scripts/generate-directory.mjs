#!/usr/bin/env node
// Reads Formula/*.rb, bucket/*.json, and choco/**/*.nuspec and emits
// src/data/directory/directory.json in the shape minted-directory-astro
// expects (id, title, description, tags, link, featured?).
//
// Runs on prebuild and predev. Zero Astro dependencies — plain Node
// so it also works standalone: `node scripts/generate-directory.mjs`.

import { readdir, readFile, stat, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseXml } from "@rgrove/parse-xml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/directory/directory.json");

const FORMULA_DIR = join(ROOT, "Formula");
const BUCKET_DIR = join(ROOT, "bucket");
const CHOCO_DIR = join(ROOT, "choco");

function extract(src, key) {
  const re = new RegExp(`\\b${key}\\s+["']([^"']+)["']`);
  return src.match(re)?.[1];
}

async function readFormulas() {
  let entries;
  try {
    entries = await readdir(FORMULA_DIR);
  } catch {
    return [];
  }

  const out = [];
  for (const file of entries.filter((f) => f.endsWith(".rb"))) {
    const src = await readFile(join(FORMULA_DIR, file), "utf8");
    const name = file.replace(/\.rb$/, "");
    const url = extract(src, "url");
    const versionMatch = extract(src, "version") ?? url?.match(/v?(\d+\.\d+\.\d+)/)?.[1];

    out.push({
      name,
      version: versionMatch ?? "unknown",
      description: extract(src, "desc") ?? "",
      homepage: extract(src, "homepage"),
      license: extract(src, "license"),
      packager: "homebrew",
    });
  }
  return out;
}

async function readScoopBuckets() {
  let entries;
  try {
    entries = await readdir(BUCKET_DIR);
  } catch {
    return [];
  }

  const out = [];
  for (const file of entries.filter((f) => f.endsWith(".json"))) {
    const raw = await readFile(join(BUCKET_DIR, file), "utf8");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.warn(`Skipping malformed Scoop manifest ${file}: ${err.message}`);
      continue;
    }

    const license =
      typeof parsed.license === "string"
        ? parsed.license
        : parsed.license?.identifier;

    out.push({
      name: file.replace(/\.json$/, ""),
      version: parsed.version ?? "unknown",
      description: parsed.description ?? "",
      homepage: parsed.homepage,
      license,
      packager: "scoop",
    });
  }
  return out;
}

async function findNuspecs(root) {
  const results = [];
  let entries;
  try {
    entries = await readdir(root);
  } catch {
    return results;
  }

  for (const entry of entries) {
    const path = join(root, entry);
    const s = await stat(path);
    if (s.isDirectory()) {
      results.push(...(await findNuspecs(path)));
    } else if (entry.endsWith(".nuspec")) {
      results.push(path);
    }
  }
  return results;
}

function pickText(el) {
  if (!el) return undefined;
  const t = el.text.trim();
  return t ? t : undefined;
}

function childByName(parent, name) {
  return parent.children.find(
    (c) => c.type === "element" && c.name === name,
  );
}

async function readChocoPackages() {
  const paths = await findNuspecs(CHOCO_DIR);
  const out = [];

  for (const path of paths) {
    const raw = await readFile(path, "utf8");
    let metadata;
    try {
      const doc = parseXml(raw);
      metadata = childByName(doc.root, "metadata");
    } catch (err) {
      console.warn(`Skipping malformed nuspec ${path}: ${err.message}`);
      continue;
    }
    if (!metadata) continue;

    const read = (name) => pickText(childByName(metadata, name));
    const id = read("id");
    if (!id) {
      console.warn(`${path} missing <id> — skipping`);
      continue;
    }

    out.push({
      name: id,
      version: read("version") ?? "unknown",
      description: read("summary") ?? read("description") ?? read("title") ?? "",
      homepage: read("projectUrl"),
      license: read("licenseUrl"),
      packager: "chocolatey",
    });
  }
  return out;
}

function docsUrl(homepage, name) {
  const dflt = `https://jonbogaty.com/${name}/`;
  if (!homepage) return dflt;
  if (/github\.com\/jbcom\//.test(homepage)) return dflt;
  return homepage;
}

async function main() {
  const [formulas, scoops, chocos] = await Promise.all([
    readFormulas(),
    readScoopBuckets(),
    readChocoPackages(),
  ]);

  const byName = new Map();
  for (const entry of [...formulas, ...scoops, ...chocos]) {
    const existing = byName.get(entry.name);
    if (existing) {
      existing.packagers.add(entry.packager);
      existing.versions.set(entry.packager, entry.version);
    } else {
      byName.set(entry.name, {
        name: entry.name,
        description: entry.description,
        homepage: entry.homepage,
        license: entry.license,
        packagers: new Set([entry.packager]),
        versions: new Map([[entry.packager, entry.version]]),
      });
    }
  }

  const directory = [...byName.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((pkg) => ({
      id: pkg.name,
      title: pkg.name,
      description: pkg.description,
      tags: [...pkg.packagers].sort(),
      link: docsUrl(pkg.homepage, pkg.name),
      featured: false,
      // Extra fields the template ignores but our custom components read.
      packagers: Object.fromEntries(pkg.versions),
      license: pkg.license ?? undefined,
    }));

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(directory, null, 2) + "\n", "utf8");

  console.log(
    `✓ Wrote ${directory.length} package${directory.length === 1 ? "" : "s"} to ${OUT.replace(ROOT + "/", "")}`,
  );
  if (directory.length === 0) {
    console.log("  (no packages yet; upstream releases will populate this)");
  }
}

await main();
