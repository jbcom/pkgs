---
title: Security policy
updated: 2026-04-15
status: current
domain: ops
---

# Security Policy

## Supported versions

`jbcom/pkgs` is a package manifest aggregator. Its own versioning follows
the site and CI tooling. Only the current `main` branch receives security
updates.

## Reporting a vulnerability

**Do not open a public issue for security reports.**

To report a vulnerability in this repo (site, CI, packaging flow):

- Email: <security@jonbogaty.com>
- Or use [GitHub private vulnerability reporting](https://github.com/jbcom/pkgs/security/advisories/new).

Please include:

- A description of the issue and its impact
- Steps to reproduce
- Affected commit SHA or release tag
- Suggested mitigation, if known

We aim to acknowledge reports within **3 business days** and to publish
a fix (or a clear rationale if no fix is warranted) within **14 days**
for non-trivial issues.

## Scope

### In scope

- The site source under `src/`, its build pipeline, and deployment
- CI workflows under `.github/workflows/` (including supply-chain
  vectors such as unpinned actions or script injection)
- The directory generator script (`scripts/generate-directory.mjs`)
- Package-manifest validation logic

### Out of scope

- Vulnerabilities in the **upstream projects** whose manifests this
  repo hosts (report those to the respective project repositories,
  e.g., `jbcom/radioactive-ralph`).
- Vulnerabilities in the **packagers themselves** (Homebrew, Scoop,
  Chocolatey) — report to their respective maintainers.
- Vulnerabilities in third-party dependencies that do not affect this
  repo's operation — the repo's Dependabot workflow tracks those.

## Supply-chain hygiene

- All GitHub Actions are pinned to full commit SHAs (never tag refs
  alone). Dependabot auto-updates the SHAs weekly.
- `pnpm-lock.yaml` is committed and enforced via
  `pnpm install --frozen-lockfile` in CI.
- Node is pinned to the current LTS (24.x) in CI and locally.
