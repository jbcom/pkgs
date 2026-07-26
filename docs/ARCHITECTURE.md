---
title: Architecture
updated: 2026-07-25
status: current
domain: technical
---

# Architecture

## Overview

`jbcom/pkgs` is two systems sharing one git tree:

1. **A package manifest registry** — `Formula/`, `Casks/`, `bucket/`,
   and `choco/` committed directly. Packagers (Homebrew, Scoop,
   Chocolatey) consume these files as-is.
2. **A static index site** — Astro 5, built from those same files,
   deployed to GitHub Pages.

The two are decoupled: packagers never need the site, and the site
never blocks a package install. If GitHub Pages is down, `brew tap
jbcom/pkgs https://github.com/jbcom/pkgs && brew install <pkg>` still
works because brew reads the tap git tree directly.

## Data flow

```text
┌─ Upstream project repo (e.g. jbcom/radioactive-ralph) ─┐
│                                                        │
│  git tag v1.2.3  →  GoReleaser (or bespoke workflow)   │
│                                                        │
└────────────────────┬───────────────────────────────────┘
                     │ pushes commits to jbcom/pkgs
                     ▼
┌─ jbcom/pkgs ────────────────────────────────────────────┐
│                                                         │
│  Formula/<pkg>.rb ──┐                                    │
│  Casks/<pkg>.rb ────┤                                    │
│  bucket/<pkg>.json ─┼─→ scripts/generate-directory.mjs   │
│  choco/<pkg>/.nuspec┘          │                         │
│                                ▼                        │
│                    src/data/directory/directory.json    │
│                                │                        │
│                                ▼                        │
│                    withastro/action@v6 (CI)             │
│                                │                        │
│                                ▼                        │
│                    GitHub Pages: jbcom.github.io/pkgs/  │
└─────────────────────────────────────────────────────────┘
```

## Packager-specific notes

### Homebrew Formula and Cask

- Canonical sources: `Formula/<pkg>.rb` and `Casks/<pkg>.rb` in this
  repo.
- One token may use one Homebrew delivery type only. Both validation
  and index generation reject a token present in both directories.
- Formulae are indexed as `homebrew-formula`; Casks are indexed as
  `homebrew-cask`. Scoop and Chocolatey entries with the same token
  still merge into one package card.
- Operators tap with `brew tap jbcom/pkgs https://github.com/jbcom/pkgs`
  (explicit URL form — the repo isn't named `homebrew-pkgs`). The old
  `jbcom/homebrew-tap` mirror is retired; each upstream's release
  pipeline publishes to this repo only.
- Formula installs use `brew install <formula>`. Cask installs use the
  explicit `brew install --cask <cask>` form.

`radioactive-ralph` deliberately uses `radioactive-ralph` (CLI) and
`radioactive-ralph-gui` (desktop app) Casks. Its v0.8.2 formula was
retired because that independent Formula line could shadow the current
Cask release path.

### Scoop

- Canonical source: `bucket/<pkg>.json` in this repo.
- Operators add with `scoop bucket add jbcom https://github.com/jbcom/pkgs`.
  Scoop auto-discovers the `bucket/` subdir.

### Chocolatey

- Canonical distribution: the Chocolatey community feed (chocolatey.org).
- `choco/<pkg>/*.nuspec` in this repo is source-of-truth for
  reproducibility and audit, but `choco install <pkg>` does NOT hit this
  repo — it hits the central feed.

## Site build

- **Astro 5** with Vue 3 integration (template dependency; a few
  internal components use Vue islands for the search and grid filtering)
- **Tailwind 4** via `@tailwindcss/vite`
- **Content collections** fed by a custom `file()` loader pointed at
  `src/data/directory/directory.json`
- **Static output** — no SSR, no server needed
- **Deployed** via `withastro/action@v6` (auto-detects pnpm) to GitHub
  Pages with base path `/pkgs`

## Site serves at jonbogaty.com/pkgs/

The operator's apex domain `jonbogaty.com` already CNAMEs to
`jbcom.github.io`, so GitHub Pages transparently serves `/pkgs/` at
`https://jonbogaty.com/pkgs/`. `jbcom.github.io/pkgs/` 301-redirects
to the canonical URL.

Astro's `astro.config.mjs` uses `site: 'https://jonbogaty.com'` +
`base: '/pkgs'` — this feeds correct absolute URLs into sitemap and OG
metadata while internal routing stays subpath-relative.

No CNAME file is needed in `public/` because the apex-domain CNAME is
configured repo-wide (pages settings), not per-repo via file. Adding a
`public/CNAME` would *break* the `/pkgs` base path by treating the
repo as apex-mode.

## Dependencies

See `package.json`. Notable pins:

- `astro@^5.5.2` (template upstream)
- `vue@^3.5` (template internal)
- `tailwindcss@^4` (template styling)
- `@rgrove/parse-xml` (Chocolatey nuspec parser — pure ESM)
- `zod@^3.24` (schema validation via the template's content config)

Dev dependencies keep the template's astro-icon + vite-plugin-toml.
