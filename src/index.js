import news from "./data/news.json" with { type: "json" };
import { clientScript } from "./client.js";
import { styles } from "./styles.js";
import { renderPage } from "./template.js";

const ASSETS = {
  "/assets/news.css": { body: styles, type: "text/css; charset=utf-8" },
  "/assets/news.js": { body: clientScript, type: "application/javascript; charset=utf-8" },
};
const KALI_TERMINAL_URL = "https://www.patrick-binder.de/kali_terminal";

const securityHeaders = {
  "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'; base-uri 'none'; frame-ancestors *",
  "Cross-Origin-Resource-Policy": "cross-origin",
  "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
};

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
        headers: { ...securityHeaders, "Cache-Control": "public, max-age=86400, s-maxage=86400", "Content-Type": asset.type },
      });
    }
    if (pathname !== "/") return new Response("Not Found", { status: 404 });

    return new Response(request.method === "HEAD" ? null : renderPage(news), {
      headers: { ...securityHeaders, "Cache-Control": "no-store, max-age=0", "Content-Type": "text/html; charset=utf-8" },
    });
  },
};
