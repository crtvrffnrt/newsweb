# Cloudflare Free-tier security configuration

Apply these settings in the **`patrick-binder.de` zone** after deploying the Worker route for `news.patrick-binder.de`. They intentionally live at Cloudflare's edge, before the Worker, so abusive traffic does not consume Worker invocations.

## Enable platform protections

1. **Security > Settings > Bot Fight Mode:** turn it on. It is the Free-plan bot control and automatically challenges known automated traffic.
2. **Security > Settings > Block AI Bots:** turn it on if search/AI crawler discovery is not desired.
3. Leave Cloudflare's HTTP and network DDoS protection enabled; it is automatic on every plan.

## WAF custom rules

Create these zone-level rules in **Security > WAF > Custom rules**, in this order.

| Name | Expression | Action |
| --- | --- | --- |
| `news: only public routes` | `(http.host eq "news.patrick-binder.de" and not (http.request.uri.path in {"/" "/kali_terminal" "/assets/news.css" "/assets/news.js"} or starts_with(http.request.uri.path, "/cdn-cgi/")))` | Block |
| `news: read-only methods` | `(http.host eq "news.patrick-binder.de" and not http.request.method in {"GET" "HEAD"})` | Block |

These rules match the Worker’s explicit read-only route set and stop path scanners and non-read requests before they reach it. Do not add a WAF challenge for the root page: it would also challenge legitimate visitors loading the site through an iframe.

## Free rate-limiting rule

The Free plan permits one rate-limiting rule with a Block action. Create it in **Security > WAF > Rate limiting rules**:

| Setting | Value |
| --- | --- |
| Name | `news: per-IP request cap` |
| Matching expression | `http.host eq "news.patrick-binder.de"` |
| Characteristics | IP address |
| Threshold | 120 requests per 10 seconds |
| Action | Block for 1 minute |

This permits normal page and iframe asset loads while putting a ceiling on per-IP bursts. Tune only from Security Events data: lower thresholds can block visitors behind corporate NATs.

## Embedding and cache contract

- The Worker sends `Content-Security-Policy: frame-ancestors *` and no `X-Frame-Options`, so any HTTPS site can embed the news page in an iframe.
- `/` is `no-store`; the latest deployed `news.json` is never served from browser or edge cache.
- `/assets/news.css` and `/assets/news.js` cache for one day. `/kali_terminal` caches at the edge for one hour and can serve stale content while refreshing. Neither can make the news list stale.
- Do not add a Cache Rule that overrides the `/` response to **Cache Everything** or an Edge TTL. It would override this freshness guarantee.
