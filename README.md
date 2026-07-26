# jbcom/pkgs

Unified package repository for every `jbcom/*` project — Homebrew and
Scoop manifests plus Chocolatey packaging sources in one git tree.
Public package index at
<https://jonbogaty.com/pkgs/>.

## Install

Pick the format that matches your OS.

### Homebrew (macOS, Linux, WSL2+Linuxbrew)

```bash
brew tap jbcom/pkgs https://github.com/jbcom/pkgs
brew install <formula>
brew install --cask <cask>
```

The explicit URL form is required because this repo isn't named
`homebrew-pkgs`. Homebrew serves `Formula/` (and `Casks/`) straight from
this repo — the old `jbcom/homebrew-tap` mirror is retired; this is the
single distribution repo.

### Scoop (Windows)

```powershell
scoop bucket add jbcom https://github.com/jbcom/pkgs
scoop install <package>
```

### Chocolatey packaging source (Windows)

The `choco/` directory holds package sources for reproducibility.
Chocolatey installs use the independent community feed, so a committed
nuspec here does not assert that its version is live. Confirm feed
availability before installing a package with Chocolatey.

## Repository layout

```text
.
├── Formula/                  # Homebrew formulas (*.rb) — written by release CI
├── Casks/                    # Homebrew casks (*.rb) — written by release CI
├── bucket/                   # Scoop manifests (*.json) — written by release CI
├── choco/                    # Chocolatey package sources (*.nuspec, tools/)
├── src/                      # Astro site source
│   ├── content.config.ts     # Content collection wiring
│   ├── data/
│   │   ├── directory/        # Auto-generated: directory.json
│   │   │                     # Run `pnpm generate-directory` to rebuild
│   │   └── pages/            # Hand-written MDX (landing + static pages)
│   ├── config/settings.toml  # Site title, nav, tag colors, theme
│   ├── components/           # UI components (cards, search, grid)
│   ├── layouts/              # Page layouts
│   ├── pages/                # Astro routes
│   └── styles/               # Global Tailwind theme overrides
├── scripts/
│   ├── generate-directory.mjs   # Scans Formula/ Casks/ bucket/ choco/ → JSON
│   └── validate-homebrew.rb     # Syntax + versioned Cask contract
├── astro.config.mjs
├── package.json              # pnpm + node 24
└── .github/workflows/
    ├── validate-packages.yml # Validates Formula / Cask / bucket / choco on PR
    └── deploy.yml            # Deploys site to GitHub Pages on push to main
```

## How releases land here

Each upstream project's release pipeline publishes into this repo:

- **Go projects** use GoReleaser for Formula or Cask output plus Scoop
  and Chocolatey manifests. `radioactive-ralph` intentionally publishes
  a CLI cask and a GUI cask instead of a formula. See
  [the radioactive-ralph config](https://github.com/jbcom/radioactive-ralph/blob/main/.goreleaser.yaml)
  for a reference implementation.

- **Non-Go projects** (e.g., `paranoid-passwd`) use a dedicated
  publishing workflow in their own repo that commits manifests here
  via `gh` CLI on every tagged release.

Direct edits to `Formula/`, `Casks/`, `bucket/`, or `choco/` are rare;
when they happen, CI validates them on every PR. A package token cannot
exist in both `Formula/` and `Casks/`.

## Local development

Requires Node 24 LTS (Homebrew: `brew install node@24 && brew link node@24`)
and pnpm 10 (`brew install pnpm`).

```bash
pnpm install
pnpm dev       # live-reload at http://localhost:4321/pkgs/
pnpm build     # static build in dist/
pnpm preview   # serve the built site
```

`pnpm generate-directory` rebuilds `src/data/directory/directory.json`
from the current `Formula/`, `Casks/`, `bucket/`, and `choco/` content.
Formula and Cask delivery receive distinct index tags. The generator
merges cross-platform manifests by package token and rejects a
Formula/Cask collision. It runs automatically on `predev` and
`prebuild`.

## Publishing standards

- Package definitions live in-repo and are reviewable by pull request
- Every PR runs CI validation (`.github/workflows/validate-packages.yml`)
- Versions are semantic
- Download URLs and checksums are pinned to GitHub release artifacts
- Architecture metadata is explicit wherever the packager supports it

## Validation

CI runs four package-format checks on every PR:

- **Homebrew Formula** — Ruby syntax on every `Formula/*.rb`
- **Homebrew Cask** — Ruby syntax plus required token, pinned semantic
  version, SHA-256, HTTPS URL/homepage, metadata, artifact, and
  Formula/Cask collision checks on every `Casks/*.rb`
- **Scoop** — JSON parse + required keys (`version`, `description`,
  `homepage`, `license`, `url`, `hash`) on every `bucket/*.json`
- **Chocolatey** — XML parse on every `choco/**/*.nuspec`

Run locally:

```bash
ruby scripts/validate-homebrew.rb
ruby test/validate_homebrew_test.rb
pnpm test

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

python3 - <<'PY'
import glob, xml.etree.ElementTree as ET
for path in glob.glob('choco/**/*.nuspec', recursive=True):
    ET.parse(path)
print('nuspec files ok')
PY
```

## Deployment

`deploy.yml` runs on every push to `main` using `withastro/action@v6`.
The built site is deployed to GitHub Pages at
<https://jonbogaty.com/pkgs/>.

## License

MIT. See [LICENSE](LICENSE).
