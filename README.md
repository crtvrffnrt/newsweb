# PBI Security News

Cloudflare Worker for `news.patrick-binder.de`. It renders a curated, terminal-style security news listing with the PBI navigation. The public news page may be embedded from any origin.

## Architecture

- `src/data/news.json` is the sole news store. `publishedAt` controls feed sorting; `addedAt` controls the one-time highlight for the latest three added entries.
- `src/template.js` renders sorted, de-duplicated semantic HTML. `/kali_terminal` streams the existing interactive terminal same-origin so its two tabs can be framed despite the upstream frame policy.
- `src/styles.js` and `src/client.js` keep presentation and delayed-summary interaction separate from the Worker handler.
- `scripts/validate-news.js` rejects malformed entries, duplicates, invalid dates/URLs, and unsupported categories.
- `cloudflare/security-rules.md` contains the required Free-tier Bot Fight Mode, WAF and rate-limiting configuration for the Cloudflare zone.

## Local preview and checks

```bash
npm install
npm test
npm run dev
```

Open `http://localhost:8787`. To validate the Worker bundle and configuration without deploying:

```bash
npx wrangler@latest deploy --dry-run
```

## Deploy

```bash
npm run deploy
```

The configured custom domain is retained in `wrangler.jsonc`; deployment is intentionally not performed by local validation.

## Caching and embedding

The news document uses `Cache-Control: no-store`, so a deployment containing new articles is visible immediately. Static CSS/JS and the proxied Kali terminal are cached separately. The response uses `frame-ancestors *` and does not send `X-Frame-Options`, allowing it to be embedded in an iframe by any origin. Apply the edge protections in [`cloudflare/security-rules.md`](cloudflare/security-rules.md) after deployment.

## Automated news updates

A future scheduled agent must update **only** `src/data/news.json`. For each of its three new articles, it must use stable fields `id`, `title`, `source`, `sourceDomain`, `url`, `publishedAt`, `addedAt`, `category`, `tags`, and `summary` (optionally `severity` and `cve`). `publishedAt` is the original publication date; `addedAt` is the ISO timestamp when the record enters this file. Before writing, it must deduplicate against existing `id` and canonical `url`; IDs must be normalized lowercase slugs. Historical entries must never be deleted or rewritten. Append the new entries, run `npm run validate:news` and `npm test`, inspect the local result, and commit only after those checks succeed.
