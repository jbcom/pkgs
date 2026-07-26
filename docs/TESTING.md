---
title: Testing
updated: 2026-07-25
status: current
domain: quality
---

# Testing

## Strategy

`jbcom/pkgs` keeps focused contract tests around its package seam:

- A deterministic generator script (`scripts/generate-directory.mjs`)
  that reads well-known file formats and emits sorted JSON
- An Astro template with its own upstream tests
- Homebrew syntax and Cask structure validation in
  `scripts/validate-homebrew.rb`
- Scoop JSON and Chocolatey XML validators in CI

The tests use the Node and Ruby standard libraries; no test framework
dependency is added.

## What CI verifies

`ci.yml` (on every PR):

- `pnpm install --frozen-lockfile` — lockfile integrity
- `pnpm test` — deterministic index output and Formula/Cask collision
  handling (runs through `prebuild`)
- `astro check` — TypeScript + Astro type checking
- `pnpm build` — full static build must succeed

`validate-packages.yml` (on every PR):

- Ruby syntax validity for every Formula and Cask
- Cask token, version, SHA-256, URL, metadata, artifact, and
  Formula/Cask collision contract
- Ruby unit tests for accepted CLI/GUI Cask shapes and rejected
  structural failures
- JSON parse + required-key check on every `bucket/*.json`
- XML parse on every `choco/**/*.nuspec`

## What to verify manually before a PR

1. `pnpm dev` — landing renders, search filters work, tag
   links (Homebrew Formula/Homebrew Cask/Scoop/Chocolatey) navigate
   correctly
2. Visit a package detail page (e.g., `/pkgs/radioactive-ralph/`) —
   install snippets render, links to the project's own docs work
3. Toggle light/dark mode — no broken colors or unreadable text
4. Resize window — mobile + tablet + desktop layouts all work

## How to run validators locally

```bash
# Homebrew
ruby scripts/validate-homebrew.rb
ruby test/validate_homebrew_test.rb

# Directory generator
pnpm test

# Scoop
python3 - <<'PY'
import glob, json
required = {"version", "description", "homepage", "license", "url", "hash"}
for path in glob.glob('bucket/*.json'):
    with open(path) as f:
        data = json.load(f)
    missing = required - set(data)
    if missing:
        raise SystemExit(f"{path}: missing {', '.join(sorted(missing))}")
print('scoop manifests ok')
PY

# Chocolatey
python3 - <<'PY'
import glob, xml.etree.ElementTree as ET
for path in glob.glob('choco/**/*.nuspec', recursive=True):
    ET.parse(path)
print('nuspec files ok')
PY
```

## When to escalate

If a valid manifest from an upstream project fails validation here,
we have a schema drift problem. Update `scripts/generate-directory.mjs`
OR `.github/workflows/validate-packages.yml` to accommodate, and
file an issue so the upstream project knows about the change.
