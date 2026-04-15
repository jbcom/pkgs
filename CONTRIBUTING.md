---
title: Contributing
updated: 2026-04-15
status: current
domain: context
---

# Contributing to jbcom/pkgs

Thanks for your interest. `jbcom/pkgs` is the package registry for the
`jbcom/*` project family; most content here is auto-generated from
upstream releases, but human contributions are welcome for:

- Site UX improvements (landing, search, package detail pages)
- Validation enhancements (`validate-packages.yml`)
- Documentation corrections
- New packager integrations

**What to not send**: hand-edited `Formula/*.rb`, `bucket/*.json`, or
`choco/**/*.nuspec` files. These are written by the upstream project's
release pipeline. If you spot a bug in a formula, fix it in that
project's repo, not here.

## Setup

```bash
brew install node@24 pnpm
brew link --force node@24
git clone git@github.com:jbcom/pkgs.git
cd pkgs
pnpm install
pnpm dev      # http://localhost:4321/pkgs/
```

## Development loop

1. Make your change on a feature branch.
2. Run `pnpm build` locally — CI will run this again on your PR.
3. If you changed validation logic, also run the snippets in
   [`README.md`](README.md#validation) against real manifests.
4. Open a PR; conventional-commits title (`feat:`, `fix:`, `docs:`,
   etc.).
5. CI must pass before merge. We squash-merge; your commit history
   within the branch can be messy.

## Adding a new packager (e.g., Nix, Flatpak, AUR)

1. Add a reader function to `scripts/generate-directory.mjs` that
   normalizes that packager's manifest format into the unified entry
   shape (see `readFormulas`, `readScoopBuckets`,
   `readChocoPackages`).
2. Add the packager tag to `src/config/settings.toml` under
   `[[directoryData.tags]]`.
3. Add a validation step to `.github/workflows/validate-packages.yml`.
4. Update `CLAUDE.md` / `AGENTS.md` to mention the new packager.
5. Add an install snippet to `src/data/pages/index.mdx`.

## Reporting a bug

Use [GitHub issues](https://github.com/jbcom/pkgs/issues). Include:

- The affected page URL (if a site issue) or manifest filename
- Expected vs actual behavior
- Node + pnpm versions if reproducing locally

## Reporting a security issue

See [SECURITY.md](SECURITY.md). **Do not open a public issue for
security reports.**

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Short version: be kind,
assume good intent, don't derail threads.
