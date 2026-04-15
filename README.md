# jbcom/pkgs

Unified package repository for every `jbcom/*` project — Homebrew,
Scoop, and Chocolatey from one git tree. Public package index at
<https://jbcom.github.io/pkgs/>.

## Install

Pick the format that matches your OS.

### Homebrew (macOS, Linux, WSL2+Linuxbrew)

```bash
brew tap jbcom/tap
brew install <package>
```

The `jbcom/tap` shorthand resolves to `github.com/jbcom/homebrew-tap`,
a GoReleaser-managed mirror of this repo's `Formula/` directory. Both
locations stay in sync on every release.

### Scoop (Windows)

```powershell
scoop bucket add jbcom https://github.com/jbcom/pkgs
scoop install <package>
```

### Chocolatey (Windows)

```powershell
choco install <package>
```

Chocolatey packages are published to the community feed directly on
release; the `choco/` directory here holds the package sources for
reproducibility.

## Repository layout

```text
.
├── Formula/                  # Homebrew formulas (*.rb) — written by release CI
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
│   └── generate-directory.mjs   # Scans Formula/ bucket/ choco/ → JSON
├── astro.config.mjs
├── package.json              # pnpm + node 24
└── .github/workflows/
    ├── validate-packages.yml # Validates Formula / bucket / choco on PR
    └── deploy.yml            # Deploys site to GitHub Pages on push to main
```

## How releases land here

Each upstream project's release pipeline publishes into this repo:

- **Go projects** (e.g., `radioactive-ralph`) use GoReleaser. The
  `brews:`, `scoops:`, and `chocolateys:` blocks in their
  `.goreleaser.yaml` write to `jbcom/pkgs` directly. See
  [the radioactive-ralph config](https://github.com/jbcom/radioactive-ralph/blob/main/.goreleaser.yaml)
  for a reference implementation.

- **Non-Go projects** (e.g., `paranoid-passwd`) use a dedicated
  publishing workflow in their own repo that commits manifests here
  via `gh` CLI on every tagged release.

Direct edits to `Formula/`, `bucket/`, or `choco/` are rare; when they
happen, CI validates them on every PR.

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
from the current `Formula/`, `bucket/`, and `choco/` content. Runs
automatically on `predev` and `prebuild`.

## Publishing standards

- Package definitions live in-repo and are reviewable by pull request
- Every PR runs CI validation (`.github/workflows/validate-packages.yml`)
- Versions are semantic
- Download URLs and checksums are pinned to GitHub release artifacts
- Architecture metadata is explicit wherever the packager supports it

## Validation

CI runs three checks on every PR:

- **Homebrew** — Ruby syntax (`ruby -c`) on every `Formula/*.rb`
- **Scoop** — JSON parse + required keys (`version`, `description`,
  `homepage`, `license`, `url`, `hash`) on every `bucket/*.json`
- **Chocolatey** — XML parse on every `choco/**/*.nuspec`

Run locally:

```bash
ruby -c Formula/*.rb

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
<https://jbcom.github.io/pkgs/>.

## License

MIT. See [LICENSE](LICENSE).
