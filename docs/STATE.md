---
title: Current state
updated: 2026-04-15
status: current
domain: context
---

# Current state

## Published packages

One: `radioactive-ralph` (seeded from a v0.6.0-era placeholder with
`0000…` checksums). Will be overwritten by the first real GoReleaser
publish from `jbcom/radioactive-ralph`.

## What works

- Formula/bucket/choco validation CI
- Astro build + GitHub Pages deploy
- Directory generator → landing → per-package pages
- Dark/light mode via the `brookmint` theme
- Search + tag filtering
- Dependabot + automerge for non-major bumps
- release-please wired for site-package releases

## What's pending

- First real GoReleaser push from `jbcom/radioactive-ralph` to replace
  the seeded manifests
- A non-Go publishing workflow template for `jbcom/paranoid-passwd`
  and other CMake/C projects (no GoReleaser equivalent)
- Reverse-proxy setup for `jonbogaty.com/pkgs` → `jbcom.github.io/pkgs`
  (optional; current deploy works at the GitHub-issued subdomain)

## Active owners

- Maintenance: `@jbcom`
- Upstream projects feeding here:
  - `jbcom/radioactive-ralph` (Go, GoReleaser)
  - `jbcom/paranoid-passwd` (C/CMake, bespoke workflow — not yet wired)
