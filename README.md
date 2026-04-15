# pkgs

`pkgs` is the source repository for:

- Homebrew tap formulas (`/Formula`)
- Scoop bucket manifests (`/bucket`)
- Chocolatey package metadata (`/choco`)
- A GitHub Pages landing page (`/index.html`)

## Repository layout

```text
.
├── Formula/           # Homebrew formulae (*.rb)
├── bucket/            # Scoop manifests (*.json)
├── choco/             # Chocolatey package folders (*.nuspec, tools/*)
└── .github/workflows/ # CI validation
```

## Publishing standards (2026)

- Keep package definitions in-repo and reviewable by pull request.
- Validate package metadata on every pull request.
- Keep the GitHub Pages index current so humans can browse packages quickly.
- Prefer reproducible URLs and checksums in package definitions.
- Use semantic versions and explicit architecture metadata where supported.

## Validation

CI validates package metadata:

- Homebrew: Ruby syntax check for all `Formula/*.rb`
- Scoop: JSON parse + required keys check for all `bucket/*.json`
- Chocolatey: XML parse for all `choco/**/*.nuspec`

Run local validation with:

```bash
ruby -c Formula/*.rb
python3 - <<'PY'
import glob, json
for path in glob.glob('bucket/*.json'):
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    for key in ("version", "description", "homepage", "license", "url", "hash"):
        if key not in data:
            raise SystemExit(f"{path}: missing {key}")
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

This repository serves `index.html` from the default branch using GitHub Pages.
