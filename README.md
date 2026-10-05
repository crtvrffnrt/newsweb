# PBI Security News

Cloudflare Worker for `news.patrick-binder.de`. It renders a curated, terminal-style security news listing with the PBI navigation. The public news page may be embedded from any origin.

## Architecture

- `src/data/news/chunk-XXXX.json` contains the news store in fixed 100-record chunks. `src/data/news/index.js` aggregates the preallocated chunks for rendering and search. `publishedAt` controls feed sorting; `addedAt` controls the one-time highlight for the latest three added entries.
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

The scheduled news agent updates exactly one preallocated `src/data/news/chunk-XXXX.json` file per successful run. Each chunk is capped at 100 records. It appends to the highest populated chunk when the additions fit; otherwise it writes the complete daily batch to the next empty chunk. It must never edit or reorder existing records. The GitHub Contents API update uses the fetched blob SHA and commits directly to `main` with `Add daily security news for YYYY-MM-DD`.

Duplicate research is intentionally bounded to the most recent 10 days to keep connector reads small. IDs remain globally unique; canonical/story duplicate checks for new research use only that 10-day window. The repository validator checks all chunk structure and required fields, and the GitHub Action additionally verifies that scheduled daily commits modify exactly one chunk and only append 1–4 records.

For consolidated `ransomware.live` Germany entries that use the country page, keep a stable unique fragment such as `https://ransomware.live/country/DEU#YYYY-MM-DD`. Search and rendering still operate over the complete aggregated archive through `src/data/news/index.js`.

A push to `main` triggers the repository validation workflow and the existing Cloudflare Workers Git build integration. GitHub Actions does not store or require a Cloudflare API token for this repository; Cloudflare performs the production build/deploy from the same `main` push.
