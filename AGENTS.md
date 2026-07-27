---
title: jbcom/pkgs — extended agent protocols
updated: 2026-07-25
status: current
domain: technical
---

# AGENTS.md

Extended operating protocols for agents working on `jbcom/pkgs`.
See [`CLAUDE.md`](CLAUDE.md) for the short-form entry point.

## Architecture

```text
┌───────────────────────────────────────────────────────────┐
│ Upstream jbcom/* projects (radioactive-ralph, paranoid-… )│
│                                                           │
│  GoReleaser (Go projects)   Bespoke workflow (non-Go)     │
│  ┌──────┐ ┌──────┐ ┌─────┐   ┌──────┐ ┌─────┐             │
│  │brews │ │scoops│ │choco│   │brew  │ │scoop│             │
│  └──┬───┘ └──┬───┘ └──┬──┘   └──┬───┘ └──┬──┘             │
└─────┼────────┼────────┼─────────┼────────┼────────────────┘
      │        │        │         │        │
      ▼        ▼        ▼         ▼        ▼
┌───────────────────────────────────────────────────────────┐
│ jbcom/pkgs repo (this repo)                               │
│                                                           │
│ Formula/*.rb Casks/*.rb bucket/*.json choco/**/*.nuspec   │
│        │          │          │              │              │
│        └──────────┴─────┬────┴──────────────┘              │
│               ▼               ▼                           │
│     scripts/generate-directory.mjs                        │
│               │                                           │
│               ▼                                           │
│     src/data/directory/directory.json                     │
│               │                                           │
│               ▼                                           │
│     Astro build (withastro/action@v6.1.0)                 │
│               │                                           │
│               ▼                                           │
│     dist/ → GitHub Pages → jbcom.github.io/pkgs/          │
└───────────────────────────────────────────────────────────┘
```

## Patterns

### Package manifest is append-only per packager

When a project releases v2.0.0:

- GoReleaser **overwrites** one of `Formula/<pkg>.rb` or
  `Casks/<pkg>.rb`, plus `bucket/<pkg>.json`
- Chocolatey publishes `.nupkg` to the community feed (not this repo)
- `choco/<pkg>/*.nuspec` is a snapshot of the most recent push

History is in git, not across parallel files. No `v1/` + `v2/` dirs.

### Formula and Cask tokens are mutually exclusive

The same token must never exist in both `Formula/` and `Casks/`.
`scripts/validate-homebrew.rb` and the directory generator both fail
closed on that collision. CLI software may intentionally ship as a cask;
use `brew install --cask <token>` so a stale formula can never shadow it.

`radioactive-ralph` uses two casks:

- `radioactive-ralph` for the CLI
- `radioactive-ralph-gui` for the desktop app

Its retired `Formula/radioactive-ralph.rb` must not be restored.

### Directory generator is deterministic

`scripts/generate-directory.mjs` produces a stable JSON shape sorted
by package name. Rerunning produces an identical file. Pre-commit
hooks rely on this.

### Astro content collection is single-source

`src/content.config.ts` has one directory collection fed by the JSON.
The glob/file/notion/airtable/sheets loaders from the upstream template
are **removed** — we only use the JSON path. Any new packager type
requires:

1. A reader in `scripts/generate-directory.mjs` that emits entries
   with the new `packager` tag
2. A matching tag entry in `src/config/settings.toml`
   (`[[directoryData.tags]]`)

### All Actions pinned to SHA + tagged comment

```yaml
uses: withastro/action@e84f40bd8d2caa9e768ec82ad30dd81f0b280853 # v6.1.2
```

Dependabot's weekly PR updates both the SHA and the comment. The
automerge workflow merges non-major PRs unattended.

## Testing

Verification is:

- `pnpm test` proves deterministic Formula/Cask indexing and collision handling
- `ruby test/validate_homebrew_test.rb` proves the Cask structural contract
- `ruby scripts/validate-homebrew.rb` validates all committed Formula/Cask files
- `pnpm build` succeeds locally and in CI
- Preview (`pnpm preview`) renders `/` and `/<package>/` without
  console errors
- `validate-packages.yml` catches syntax and structural regressions on PR

## When to escalate to the operator

- A package's release format changes incompatibly (e.g., Scoop changes
  required keys). Dependabot doesn't catch that; the
  `validate-packages.yml` check may start failing. Update the schema
  in `scripts/generate-directory.mjs` + `src/validation/directory.ts`.
- The upstream `minted-directory-astro` template publishes a new major
  version with breaking schema changes. Dependabot won't auto-merge
  major PRs; review and update `src/validation/settings.ts` +
  `src/config/settings.toml` accordingly.
- GitHub Pages deploy fails due to permissions changes. Re-check
  the `pages: write` + `id-token: write` scopes in `deploy.yml`.

## Skill profile

Adopt a **sonnet**-default posture for this repo. Use **haiku** for
bulk doc sweeps and SHA refreshes. Use **opus** only for architectural
changes to the publishing flow (rarely).
