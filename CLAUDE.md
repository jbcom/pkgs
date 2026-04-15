---
title: jbcom/pkgs — agent entry point
updated: 2026-04-15
status: current
domain: technical
---

# jbcom/pkgs — Agent Entry Point

Unified package repository for every `jbcom/*` project. Ships Homebrew,
Scoop, and Chocolatey packages from one git tree plus an auto-generated
Astro static site at <https://jbcom.github.io/pkgs/>.

## Critical rules

- **Never edit `Formula/*.rb`, `bucket/*.json`, or
  `choco/**/*.nuspec` by hand.** These are written by upstream projects'
  release pipelines (GoReleaser for Go projects, bespoke workflows for
  non-Go). Operator edits collide with auto-writes.
- **All GitHub Actions pinned to full commit SHAs.** Never `@v4` alone.
  Dependabot updates SHAs weekly via `dependabot-automerge.yml`.
- **Node 24 LTS only.** Locally: `brew install node@24 && brew link --force node@24`.
  CI uses `node-version: "24"` in `withastro/action`.
- **pnpm 10 only.** Lockfile committed. CI enforces `--frozen-lockfile`.
- **Conventional Commits.** release-please generates releases from them.
- **SSH remotes only** (`git@github.com:`, never `https://`).

## Commands

```bash
# Local dev — directory generator runs on predev/prebuild automatically
pnpm install
pnpm dev                       # http://localhost:4321/pkgs/
pnpm build                     # static output in dist/
pnpm preview                   # serve the built site

# Directory generator on demand
pnpm generate-directory        # rewrites src/data/directory/directory.json

# Validation (mirrors CI)
ruby -c Formula/*.rb
# Scoop + Chocolatey validators shown in README.md
```

## Layout

```text
Formula/        # Homebrew formulas (*.rb) — written by upstream release CI
bucket/         # Scoop manifests (*.json) — written by upstream release CI
choco/          # Chocolatey package sources — written by upstream release CI
src/            # Astro site (forked from minted-directory-astro)
scripts/        # generate-directory.mjs scans all three dirs → JSON
.github/
  workflows/
    ci.yml                    # Astro build + type check on every PR
    cd.yml                    # Deploy to GitHub Pages on push to main
    validate-packages.yml     # Formula/bucket/choco syntax validation on PR
    dependabot-automerge.yml  # Auto-merge non-major Dependabot PRs
    release.yml               # release-please
  dependabot.yml              # Weekly npm + actions
release-please-config.json    # Node package, Conventional Commits
```

## Publishing flow

Upstream projects write manifests here on every tagged release:

- **Go projects** use GoReleaser's `brews:`, `scoops:`,
  `chocolateys:` blocks.
- **Non-Go projects** use a bespoke workflow that calls `gh` CLI to
  commit manifests here.

The Astro site rebuilds automatically on every push to `main`, so
new packages appear on <https://jbcom.github.io/pkgs/> within minutes
of the upstream release landing here.

## What jbcom/pkgs is NOT

- A monolith or meta-package that installs multiple projects.
  Each entry is a standalone package that projects release independently.
- A general-purpose docs site. Each project has its own docs at
  `jonbogaty.com/<project>/`; this repo only lists + routes to them.
- A Chocolatey package server. `choco/` is source-of-truth for
  nuspec/tools; the actual distribution happens via the Chocolatey
  community feed.

## Model selection

- Governance file sweeps, manifest rewrites, doc cleanup → `haiku`
- Astro/TS component work, workflow design → `sonnet`
- Architectural decisions about the publishing flow → `opus`
