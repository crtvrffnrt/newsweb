const FEED_URL = "https://feeds.feedburner.com/TheHackersNews";

const FALLBACK_ITEMS = [
  {
    title: "Security news is temporarily unavailable",
    link: "https://thehackernews.com/",
    date: "",
    summary: "Open The Hacker News directly while the feed refreshes.",
  },
];

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function rssTag(xml, name) {
  return xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] ?? "";
}

function parseFeed(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
    .slice(0, 30)
    .map((match) => {
      const item = match[1];
      const date = new Date(decodeXml(rssTag(item, "pubDate")));
      return {
        title: decodeXml(rssTag(item, "title")),
        link: decodeXml(rssTag(item, "link")),
        date: Number.isNaN(date.valueOf())
          ? ""
          : new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date),
        summary: decodeXml(rssTag(item, "description")),
      };
    })
    .filter((item) => item.title && item.link);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[char]);
}

function renderPage(items) {
  const entries = items.map((item) => `
    <a class="entry" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">
      <div class="entry-meta"><time>${escapeHtml(item.date)}</time><span>THN // INTEL</span></div>
      <h2>${escapeHtml(item.title)} <b aria-hidden="true">↗</b></h2>
      <p>${escapeHtml(item.summary)}</p>
      <span class="read">[ READ_FULL_REPORT ]</span>
    </a>`).join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Latest cybersecurity news.">
    <meta name="theme-color" content="#000000">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <title>PBI // Security News</title>
    <style>
      :root { color-scheme: dark; --bg: #000; --panel: rgba(70, 70, 70, .55); --text: #fff; --muted: #c7c7c7; --accent: #00c8ff; --border: #1a1a1a; }
      * { box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { min-height: 100vh; margin: 0; background: radial-gradient(circle at 75% -10%, rgba(0, 200, 255, .11), transparent 35rem), radial-gradient(circle at 8% 45%, rgba(68, 76, 105, .10), transparent 32rem), var(--bg); color: var(--text); font: 400 16px/1.6 Inter, -apple-system, BlinkMacSystemFont, sans-serif; }
      nav { position: sticky; top: 0; z-index: 2; border-bottom: 1px solid var(--border); background: rgba(0, 0, 0, .8); backdrop-filter: blur(10px); }
      .nav-content, main { width: min(1100px, calc(100% - 48px)); margin: auto; }
      .nav-content { min-height: 74px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
      .brand { color: var(--text); font-size: .95rem; font-weight: 800; letter-spacing: .015em; text-decoration: none; text-transform: uppercase; }
      .brand b { color: var(--accent); }
      .home { border: 1px solid rgba(255,255,255,.14); border-radius: 999px; padding: 7px 12px; color: var(--muted); font: 700 .67rem/1 "JetBrains Mono", monospace; text-decoration: none; letter-spacing: .06em; }
      .home:hover, .home:focus-visible { border-color: var(--accent); color: var(--accent); }
      header { padding: clamp(56px, 10vw, 112px) 0 38px; }
      .eyebrow, .entry-meta, .read, footer { font: 700 .7rem/1.5 "JetBrains Mono", monospace; letter-spacing: .08em; }
      .eyebrow { color: var(--accent); text-transform: uppercase; }
      h1 { max-width: 820px; margin: 13px 0; font-size: clamp(2.7rem, 7vw, 5.3rem); line-height: .98; letter-spacing: -.055em; }
      header p { max-width: 650px; margin: 0; color: var(--muted); font-size: 1.08rem; }
      .feed { display: grid; gap: 14px; padding-bottom: 42px; }
      .entry { display: block; padding: clamp(22px, 4vw, 34px); border: 1px solid var(--border); border-radius: 8px; background: linear-gradient(135deg, rgba(50,50,50,.6), rgba(18,18,18,.72)); color: inherit; text-decoration: none; transition: transform .2s ease, border-color .2s ease, background .2s ease; }
      .entry:hover, .entry:focus-visible { transform: translateY(-2px); border-color: rgba(0,200,255,.65); background: rgba(0,200,255,.08); outline: none; }
      .entry-meta { display: flex; justify-content: space-between; gap: 16px; color: var(--muted); text-transform: uppercase; }
      .entry-meta span, .read { color: var(--accent); }
      h2 { margin: 11px 0 12px; font-size: clamp(1.35rem, 3vw, 2rem); line-height: 1.18; letter-spacing: -.03em; }
      h2 b { color: var(--accent); font-size: .8em; font-weight: 400; }
      .entry p { display: -webkit-box; margin: 0 0 16px; overflow: hidden; color: var(--muted); -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
      footer { padding: 28px 0 46px; border-top: 1px solid var(--border); color: var(--muted); }
      footer b { color: var(--accent); }
      @media (max-width: 620px) { .nav-content, main { width: min(100% - 32px, 1100px); } .brand { font-size: .73rem; } .home { padding: 6px 9px; font-size: .58rem; } .entry-meta { font-size: .6rem; } }
    </style>
  </head>
  <body>
    <nav><div class="nav-content"><a class="brand" href="https://www.patrick-binder.de/"><b>PBI</b> // Offensive &amp; Defensive Security</a><a class="home" href="https://www.patrick-binder.de/">[ RETURN_TO_MAIN ]</a></div></nav>
    <main>
      <header><div class="eyebrow">Worker // Live Threat Intel</div><h1>Security<br>News.</h1><p>Current cybersecurity reporting, selected for operators, defenders, and offensive security practitioners.</p></header>
      <section class="feed" aria-label="Latest security news">${entries}</section>
      <footer><b>PBI</b> // SECURITY NEWS NODE · news.patrick-binder.de</footer>
    </main>
  </body>
</html>`;
}

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/") return new Response("Not Found", { status: 404 });

    let items = FALLBACK_ITEMS;
    try {
      const response = await fetch(FEED_URL);
      if (response.ok) items = parseFeed(await response.text());
    } catch {
      // The fallback keeps the site useful if the upstream feed is unavailable.
    }

    return new Response(request.method === "HEAD" ? null : renderPage(items), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
        "Content-Security-Policy": "default-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; base-uri 'none'; frame-ancestors 'none'",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
};
