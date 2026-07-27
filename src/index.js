import news from "./data/news.json";
import { clientScript } from "./client.js";
import { styles } from "./styles.js";
import { renderPage } from "./template.js";

const ASSETS = {
  "/assets/news.css": { body: styles, type: "text/css; charset=utf-8" },
  "/assets/news.js": { body: clientScript, type: "application/javascript; charset=utf-8" },
};

const securityHeaders = {
  "Cache-Control": "public, max-age=300, s-maxage=300",
  "Content-Security-Policy": "default-src 'none'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; base-uri 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
};

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    const { pathname } = new URL(request.url);
    const asset = ASSETS[pathname];
    if (asset) {
      return new Response(request.method === "HEAD" ? null : asset.body, {
        headers: { ...securityHeaders, "Content-Type": asset.type },
      });
    }
    if (pathname !== "/") return new Response("Not Found", { status: 404 });

    return new Response(request.method === "HEAD" ? null : renderPage(news), {
      headers: { ...securityHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  },
};
