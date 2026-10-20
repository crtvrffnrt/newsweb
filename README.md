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

## Editorial research prompt — Microsoft Cloud / identity weighting

The scheduled news researcher MUST apply this editorial selection policy on every research run. This is **not** a change to the article schema, daily publishing limits, GitHub write scope, 10-day deduplication, German ransomware monitoring, deployment, or Cloudflare configuration. Other established operational and validation constraints remain authoritative.

**Reader profile and purpose:** Curate for a hands-on offensive-security researcher and consultant focused on real attack paths in Microsoft Entra ID, Azure and Microsoft 365, while retaining the defensive perspective of incident response, SOC architecture, threat hunting and KQL-based detection engineering. Favor evidence that helps a practitioner **validate an attack path, identify exposure, investigate compromise, or improve a detection/control**, rather than generic platform announcements or marketing.

**Editorial balance (not additional content):** Across the **latest 10 primary cybersecurity news items**, aim for **approximately 2–3 relevant Microsoft cloud / identity / hybrid-identity security items (20–30%)**, with the remaining ~7–8 selected on their own security merit from the existing broad cyber-news scope. This is a **rolling editorial target, not a daily minimum, not a hard cap and never a reason to invent or publish filler**. Continue publishing only the existing **1–3 primary items per run**, plus the unchanged optional German ransomware entry. The ransomware.live supplement is separate and does not count toward the primary-news ratio. When multiple candidates are similarly impactful and well evidenced, favor a qualifying Microsoft-focused item if the rolling share is below the target; if no strong, fresh Microsoft item exists, publish the strongest general cybersecurity stories. Never displace an urgent, actively exploited, widespread incident to satisfy a quota, and do not publish old research just to fill a slot.

**High-signal Microsoft / identity research themes** (positive selection signals, not a keyword checklist):

- **Entra ID authentication and authorization:** OAuth/OIDC, app registrations, enterprise and multitenant applications, delegated and application permissions, consent grants, token theft/replay, PRT and device identity, Conditional Access/PIM/MFA bypasses, service principals, workload identities, managed identities, federated credentials, Microsoft Graph authorization, administrative units, B2B/cross-tenant access and synchronization, external trust and third-party SaaS blast radius.
- **Hybrid identities and attack paths:** Entra Connect/Cloud Sync, AD DS, AD FS, dMSA, Golden SAML, synchronization accounts, on-premises-to-cloud/cloud-to-on-premises lateral movement, privilege escalation, persistence, credential exposure, tenant takeover and trust-boundary failures.
- **Azure / Microsoft 365 attack surface:** Azure RBAC, subscriptions, management-plane APIs, Key Vault, storage, APIM, automation/Logic Apps, Windows and web authentication flows, Microsoft 365/Exchange Online/SharePoint/Teams identity abuse, exposed endpoints, tenant or cross-tenant exploitation and meaningful security-control bypasses.
- **Blue-team response to the same techniques:** Entra sign-in/audit logs, token and session forensics, Defender XDR, Defender for Identity/Endpoint/Cloud Apps, Microsoft Sentinel, KQL detections, incident-response case studies, log visibility gaps, detection bypasses, threat hunting, mitigation validation and measurable control improvements.
- **Emerging attack research and tooling:** Credible red-/purple-team techniques, Microsoft-cloud privilege and attack-path research, relevant open-source tooling, identity threats in agentic AI, OAuth-based agent access, software supply-chain compromise and exploitable cross-service delegation. Include these only when novel and operationally significant; routine tooling releases and hypothetical attacks are insufficient.

**Retain strong coverage of other cyber events:** Actively exploited zero-days, critical exposure in broadly deployed enterprise products, ransomware and German victims, APT operations, credential theft, supply-chain compromise, AI/agent security, major vendor incidents, high-impact vulnerabilities, detection engineering and incident response. A Microsoft component is **not required** for an article to rank first.

**Evidence and selection test:** Use current original publications/advisories/research and corroborated reporting. Prefer the established freshness window (normally the last 55 hours; older only for material new developments). Evaluate exploitability, attack prerequisites, privileges reached, blast radius (especially single-tenant versus cross-tenant), prevalence, observed exploitation, patch/mitigation status, and investigation/detection relevance. Separate confirmed exploitation, PoC-only research, vendor assertions and unverified claims; avoid speculative tenant-wide impact or treating laboratory bypasses as universally exploitable. For each chosen item, the English summary should communicate the **technical security impact** and **practical defensive implication** in the existing required 45–90 words, without inventing KQL, IOCs, CVEs or mitigations. Keep the existing supported categories and data fields; do not add website-specific tags or new schema properties.

At selection time, compare the latest available **10 primary items** in the current production feed (identify supplemental ransomware.live Germany entries separately) to orient the rolling balance. This lookback is **only** for editorial distribution; retain the existing 10-day canonical-URL/story deduplication rules and never rewrite existing records to retroactively rebalance.
