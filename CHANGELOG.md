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

## [0.2.0](https://github.com/jbcom/pkgs/compare/pkgs-site-v0.1.0...pkgs-site-v0.2.0) (2026-04-16)


### Features

* establish jbcom/pkgs foundation ([#1](https://github.com/jbcom/pkgs/issues/1)) ([5e60871](https://github.com/jbcom/pkgs/commit/5e6087117fc1ee19545f62e064072b8e1a0d4831))
* **paranoid-passwd:** bump to 3.5.2 ([#9](https://github.com/jbcom/pkgs/issues/9)) ([dff3103](https://github.com/jbcom/pkgs/commit/dff310349000f4eff04dd6861eda78d02ea74353))


### Bug Fixes

* **ci:** accept multi-arch Scoop manifests in validator ([#11](https://github.com/jbcom/pkgs/issues/11)) ([287dc53](https://github.com/jbcom/pkgs/commit/287dc531df808230c976759164f95991d3ab2544))


### Documentation

* canonical URL is https://jonbogaty.com/pkgs/ ([#7](https://github.com/jbcom/pkgs/issues/7)) ([1a16fe1](https://github.com/jbcom/pkgs/commit/1a16fe1985cb8ac2b2ac8834d549718217333d47))

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
