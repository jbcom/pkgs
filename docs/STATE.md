---
title: Current state
updated: 2026-07-25
status: current
domain: context
---

# Current state

## Published manifests

- `paranoid-passwd` v3.6.5: Formula, Scoop, and Chocolatey source
- `radioactive-ralph`: Scoop v0.8.2 and historical Chocolatey source

The stale `radioactive-ralph` v0.8.2 Formula is retired. Its next
Homebrew release is intentionally blocked on the upstream workflow
publishing reviewed `radioactive-ralph` CLI and
`radioactive-ralph-gui` Casks.

## What works

- Formula/Cask/bucket/choco validation CI
- Deterministic Formula/Cask index tags and token-collision rejection
- Astro build + GitHub Pages deploy
- Directory generator → landing → per-package pages
- Dark/light mode via the `brookmint` theme
- Search + tag filtering
- Dependabot + automerge for non-major bumps
- release-please wired for site-package releases

## What's pending

- First repaired `radioactive-ralph` release to publish both Casks and
  refresh Scoop/Chocolatey metadata
- A non-Go publishing workflow template for `jbcom/paranoid-passwd`
  and other CMake/C projects (no GoReleaser equivalent)

## Active owners

- Maintenance: `@jbcom`
- Upstream projects feeding here:
  - `jbcom/radioactive-ralph` (Go, GoReleaser)
  - `jbcom/paranoid-passwd` (C/CMake, bespoke workflow — not yet wired)
