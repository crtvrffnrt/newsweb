import news from "./data/news.json" with { type: "json" };
import { clientScript } from "./client.js";
import { styles } from "./styles.js";
import { searchClient, searchStyles } from "./search.js";
import { renderPage } from "./template.js";

const updateStatusStyles = `
.update-status { display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:8px; padding:12px 4px 0; color:#8f9aa3; font:700 .68rem/1.4 var(--mono); letter-spacing:.06em; text-transform:uppercase; }
.update-status-dot { width:7px; height:7px; flex:none; border-radius:50%; background:#35d07f; box-shadow:0 0 12px rgb(53 208 127 / 70%); }
.update-status-label { color:#b9c2c9; }
.update-status time { color:#dff7ff; letter-spacing:.02em; text-transform:none; }
.update-status-source { padding-left:8px; border-left:1px solid rgb(255 255 255 / 14%); color:#6f7a82; }
@media (max-width:620px) { .update-status { justify-content:center; padding-top:10px; font-size:.62rem; } .update-status-source { display:none; } }
`;

const ASSETS = {
  "/assets/news.css": { body: `${styles}\n${updateStatusStyles}\n${searchStyles}`, type: "text/css; charset=utf-8" },
  "/assets/news.js": { body: clientScript, type: "application/javascript; charset=utf-8" },
  "/assets/search.js": { body: searchClient, type: "application/javascript; charset=utf-8" },
};
const KALI_TERMINAL_URL = "https://www.patrick-binder.de/kali_terminal";

const securityHeaders = {
  "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; base-uri 'none'; frame-ancestors *",
  "Cross-Origin-Resource-Policy": "cross-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
};

function renderUpdateStatus(articles) {
  const latestAddedAt = articles.reduce((latest, article) => {
    if (typeof article.addedAt !== "string") return latest;
    return article.addedAt > latest ? article.addedAt : latest;
  }, "");

  const parsed = new Date(latestAddedAt);
  const formatted = Number.isNaN(parsed.getTime())
    ? "Unknown"
    : new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: "Europe/Berlin",
        timeZoneName: "short",
      }).format(parsed);

  return `<div class="update-status" role="status" aria-label="Last content update">
    <span class="update-status-dot" aria-hidden="true"></span>
    <span class="update-status-label">Last content update</span>
    <time datetime="${latestAddedAt}">${formatted}</time>
    <span class="update-status-source">GitHub / main</span>
  </div>`;
}

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    const { pathname } = new URL(request.url);
    if (pathname === "/kali_terminal") {
      const upstream = await fetch(KALI_TERMINAL_URL);
      const headers = new Headers(upstream.headers);
      headers.delete("X-Frame-Options");
      headers.delete("Content-Security-Policy");
      headers.delete("Set-Cookie");
      headers.set("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
      headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      return new Response(request.method === "HEAD" ? null : upstream.body, { status: upstream.status, headers });
    }
    const asset = ASSETS[pathname];
    if (asset) {
      return new Response(request.method === "HEAD" ? null : asset.body, {
        headers: { ...securityHeaders, "Cache-Control": "public, max-age=300, s-maxage=300, must-revalidate", "Content-Type": asset.type },
      });
    }
    if (pathname !== "/") return new Response("Not Found", { status: 404 });

    const page = renderPage(news).replace("</main>", `${renderUpdateStatus(news)}</main>`);
    return new Response(request.method === "HEAD" ? null : page, {
      headers: { ...securityHeaders, "Cache-Control": "no-store, max-age=0", "Content-Type": "text/html; charset=utf-8" },
    });
  },
};
