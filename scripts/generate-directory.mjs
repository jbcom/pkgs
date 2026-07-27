#!/usr/bin/env node
// Reads Formula/*.rb, Casks/*.rb, bucket/*.json, and choco/**/*.nuspec and emits
// src/data/directory/directory.json in the shape minted-directory-astro
// expects (id, title, description, tags, link, featured?).
//
// Runs on prebuild and predev. Zero Astro dependencies — plain Node
// so it also works standalone: `node scripts/generate-directory.mjs`.

import { readdir, readFile, stat, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseXml } from "@rgrove/parse-xml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/data/directory/directory.json");

function extract(src, key) {
  const re = new RegExp(`\\b${key}\\s+["']([^"']+)["']`);
  return src.match(re)?.[1];
}

async function readRubyPackages(directory, packager) {
  let entries;
  try {
    entries = await readdir(directory);
  } catch {
    return [];
  }

  const out = [];
  for (const file of entries.filter((f) => f.endsWith(".rb")).sort()) {
    const src = await readFile(join(directory, file), "utf8");
    const name = file.replace(/\.rb$/, "");
    const url = extract(src, "url");
    const versionMatch = extract(src, "version") ?? url?.match(/v?(\d+\.\d+\.\d+)/)?.[1];

    out.push({
      name,
      version: versionMatch ?? "unknown",
      description: extract(src, "desc") ?? "",
      homepage: extract(src, "homepage"),
      license: extract(src, "license"),
      packager,
    });
  }
  return out;
}

async function readScoopBuckets(directory) {
  let entries;
  try {
    entries = await readdir(directory);
  } catch {
    return [];
  }

  const out = [];
  for (const file of entries.filter((f) => f.endsWith(".json")).sort()) {
    const raw = await readFile(join(directory, file), "utf8");
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

async function readChocoPackages(directory) {
  const paths = (await findNuspecs(directory)).sort();
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
  const jbcomRepository = homepage.match(
    /^https:\/\/github\.com\/jbcom\/([^/#]+)\/?$/,
  )?.[1];
  if (jbcomRepository) return `https://jonbogaty.com/${jbcomRepository}/`;
  return homepage;
}

export async function generateDirectory({
  root = ROOT,
  out = join(root, "src/data/directory/directory.json"),
} = {}) {
  const [formulas, casks, scoops, chocos] = await Promise.all([
    readRubyPackages(join(root, "Formula"), "homebrew-formula"),
    readRubyPackages(join(root, "Casks"), "homebrew-cask"),
    readScoopBuckets(join(root, "bucket")),
    readChocoPackages(join(root, "choco")),
  ]);

  const byName = new Map();
  for (const entry of [...formulas, ...casks, ...scoops, ...chocos]) {
    const existing = byName.get(entry.name);
    if (existing) {
      if (
        (entry.packager === "homebrew-formula" &&
          existing.packagers.has("homebrew-cask")) ||
        (entry.packager === "homebrew-cask" &&
          existing.packagers.has("homebrew-formula"))
      ) {
        throw new Error(
          `${entry.name} exists as both a Homebrew formula and cask; retire one delivery path`,
        );
      }
      if (existing.packagers.has(entry.packager)) {
        throw new Error(
          `${entry.name} has more than one ${entry.packager} manifest`,
        );
      }
      existing.packagers.add(entry.packager);
      existing.versions.set(entry.packager, entry.version);
      existing.description ||= entry.description;
      existing.homepage ||= entry.homepage;
      existing.license ||= entry.license;
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
      packagers: Object.fromEntries(
        [...pkg.versions].sort(([a], [b]) => a.localeCompare(b)),
      ),
      license: pkg.license ?? undefined,
    }));

  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(directory, null, 2) + "\n", "utf8");

  console.log(
    `✓ Wrote ${directory.length} package${directory.length === 1 ? "" : "s"} to ${out.startsWith(root + "/") ? out.replace(root + "/", "") : out}`,
  );
  if (directory.length === 0) {
    console.log("  (no packages yet; upstream releases will populate this)");
  }
  return directory;
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined;
if (invokedPath === fileURLToPath(import.meta.url)) {
  await generateDirectory({ root: ROOT, out: OUT });
}
