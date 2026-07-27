# PB Security Feed

Cloudflare Worker serving the latest The Hacker News entries at `news.patrick-binder.de`.

The Worker fetches the RSS feed on request and caches the rendered page at Cloudflare for five minutes. The only public page is `/`.

## Validate

```bash
npm install
npm run check
```

## Deploy

Authenticate first if needed:

```bash
npx wrangler login
npx wrangler whoami
```

Deploy and attach the configured Custom Domain:

```bash
npm run deploy
```

Cloudflare Custom Domains create the required DNS record and certificate automatically. Deployment will report a conflict if `news.patrick-binder.de` already has an incompatible DNS record.
