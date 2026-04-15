---
title: Deployment
updated: 2026-04-15
status: current
domain: ops
---

# Deployment

## Environments

| Env | URL | Trigger |
|-----|-----|---------|
| Production | <https://jbcom.github.io/pkgs/> | Push to `main` |
| Preview | Local (`pnpm dev`) | `localhost:4321/pkgs/` |

There is no staging environment. Previews happen locally.

## Secrets

None currently required. The `cd.yml` workflow uses only
`GITHUB_TOKEN` (auto-provisioned).

If a future integration needs a secret (e.g., pushing to an external
registry), add it via `gh secret set <NAME> --repo jbcom/pkgs`, never
commit it, and reference it via `${{ secrets.NAME }}` in the workflow.

## Deploy flow

1. PR merged to `main`
2. `cd.yml` fires on `push: main`
3. `withastro/action@v6.1.0` checks out, installs pnpm deps, runs
   `pnpm build`, uploads the `dist/` directory as a GitHub Pages artifact
4. `actions/deploy-pages@v5.0.0` publishes the artifact

End-to-end typically ~90 seconds.

## Rollback

Redeploy a prior commit:

```bash
gh workflow run cd.yml --repo jbcom/pkgs --ref <prior-commit-sha>
```

Or:

1. `git revert <bad-commit>` locally
2. Push the revert commit to `main`
3. `cd.yml` fires automatically

## Monitoring

- GitHub Pages build status: <https://github.com/jbcom/pkgs/deployments>
- Workflow runs: <https://github.com/jbcom/pkgs/actions>
- Site health: manual check at <https://jbcom.github.io/pkgs/>

No uptime SLA. If the site is down for more than an hour during a
release window, escalate via the upstream project's issue tracker.

## DNS / custom domain

Currently served on the GitHub-issued subdomain
(`jbcom.github.io/pkgs`). To serve `jonbogaty.com/pkgs` in the future:

1. Configure Cloudflare (or equivalent CDN) to proxy
   `jonbogaty.com/pkgs/*` → `jbcom.github.io/pkgs/*`
2. Do NOT add a `public/CNAME` file — per Astro docs, that converts
   the site to apex-domain mode and breaks the `/pkgs` base path

## Broken-build triage

If `cd.yml` fails:

1. Check workflow logs on Actions tab — usually a pnpm/Astro issue
2. `pnpm install && pnpm build` locally on the same commit
3. If local build succeeds, CI is likely using stale cache — rerun the
   workflow with "Re-run all jobs → Re-run failed jobs"
4. If local build fails too, the commit genuinely broke; revert
