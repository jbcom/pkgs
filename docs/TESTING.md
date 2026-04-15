---
title: Testing
updated: 2026-04-15
status: current
domain: quality
---

# Testing

## Strategy

`jbcom/pkgs` has no unit tests. The repo is thin:

- A deterministic generator script (`scripts/generate-directory.mjs`)
  that reads well-known file formats and emits sorted JSON
- An Astro template with its own upstream tests
- Three packager validators that shell out to `ruby -c`, `python3`
  JSON parse, and `python3` XML parse

Adding a unit-test framework would be cost-negative for this surface.

## What CI verifies

`ci.yml` (on every PR):

- `pnpm install --frozen-lockfile` — lockfile integrity
- `astro check` — TypeScript + Astro type checking
- `pnpm build` — full static build must succeed

`validate-packages.yml` (on every PR):

- `ruby -c Formula/*.rb` — Ruby syntax validity for every formula
- JSON parse + required-key check on every `bucket/*.json`
- XML parse on every `choco/**/*.nuspec`

## What to verify manually before a PR

1. `pnpm dev` — landing renders, search filters work, tag
   links (Homebrew/Scoop/Chocolatey) navigate correctly
2. Visit a package detail page (e.g., `/pkgs/radioactive-ralph/`) —
   install snippets render, links to the project's own docs work
3. Toggle light/dark mode — no broken colors or unreadable text
4. Resize window — mobile + tablet + desktop layouts all work

## How to run validators locally

```bash
# Homebrew
ruby -c Formula/*.rb

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
