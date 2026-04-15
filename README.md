# jbcom/pkgs

Unified package repository for every `jbcom/*` project. Ships Homebrew,
Scoop, and Chocolatey packages from a single git tree. Publishing is
automated — maintainers of individual projects don't edit this repo by
hand; their project's GoReleaser (or equivalent) writes package
manifests here on every release.

## Install

Pick the format that matches your OS.

### Homebrew (macOS, Linux, WSL2+Linuxbrew)

```bash
brew tap jbcom/tap
brew install <package>
```

`brew tap jbcom/tap` shorthand resolves to `github.com/jbcom/homebrew-tap`,
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

Packages are published to the Chocolatey community feed directly by
GoReleaser; the `choco/` directory here holds the package sources for
reproducibility and manual audit.

## Repository layout

```text
.
├── Formula/           # Homebrew formulae (*.rb)
├── bucket/            # Scoop manifests (*.json)
├── choco/             # Chocolatey package sources (*.nuspec, tools/)
├── index.html         # GitHub Pages landing page
└── .github/workflows/
    └── validate-packages.yml   # CI: syntax + schema checks
```

## How releases land here

Individual project repos use GoReleaser (or equivalent) to publish into
this repo on every tagged release. For example, `radioactive-ralph`'s
`.goreleaser.yaml` writes to `Formula/radioactive-ralph.rb`,
`bucket/radioactive-ralph.json`, and the Chocolatey community feed as
part of its release pipeline.

Direct edits to `Formula/`, `bucket/`, or `choco/` are rare. When they
happen, CI validates them on every PR.

## Publishing standards

- Package definitions live in-repo and are reviewable by pull request.
- Every PR runs CI validation (`.github/workflows/validate-packages.yml`).
- Versions are semantic. Architecture metadata is explicit wherever the
  packager supports it.
- Download URLs and checksums are pinned to the release artifacts on
  the upstream project's GitHub release.

## Validation

CI checks:

- **Homebrew** — Ruby syntax check (`ruby -c`) on every `Formula/*.rb`
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

## GitHub Pages

`index.html` at the repo root is served via GitHub Pages. The page
lists the packages currently published in this repo and links to each
project's canonical home.

## License

MIT. See [LICENSE](LICENSE).
