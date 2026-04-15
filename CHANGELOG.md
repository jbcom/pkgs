---
title: Changelog
updated: 2026-04-15
status: current
domain: context
---

# Changelog

All notable changes to `jbcom/pkgs` are documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Repository scaffold: `Formula/`, `bucket/`, `choco/` directories with
  `.gitkeep` anchors and CI validation (`validate-packages.yml`).
- Astro 5 static site built from the `minted-directory-astro` template,
  customized for a package index:
  - Custom content loader `scripts/generate-directory.mjs` scans
    `Formula/`, `bucket/`, and `choco/` into one unified JSON index on
    `predev` / `prebuild`.
  - Tailwind v4 styling with the `brookmint` theme.
  - Per-package detail pages that link out to each project's own docs
    site (e.g., `jonbogaty.com/<project>/`).
- GitHub Pages deployment (`deploy.yml`) using
  `withastro/action@44706356` (v6.1.0), published to
  <https://jbcom.github.io/pkgs/>.
- Dependabot config for weekly npm and GitHub Actions updates, grouped
  to reduce PR noise; companion automerge workflow
  (`dependabot-automerge.yml`) that auto-approves and auto-merges
  non-major Dependabot PRs.
- Full governance docs: `AGENTS.md`, `CLAUDE.md`, `STANDARDS.md`,
  `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`.
- Seed manifests for `radioactive-ralph` to exercise all three
  packager loaders end-to-end before the first upstream release
  overwrites them.

### Changed

- `.gitignore` replaced with a minimal packager-repo–appropriate set
  (macOS dotfiles, editor state, Astro build output) instead of the
  Node/JS template inherited from the initial scaffold.

[Unreleased]: https://github.com/jbcom/pkgs/compare/main...HEAD
