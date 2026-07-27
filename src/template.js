const projects = [
  ["AGENTS.md - Agent Instructions", "https://github.com/crtvrffnrt/AGENTS.md"],
  ["APIMSpray - Entra Spray Toolkit", "https://github.com/crtvrffnrt/apimspray"],
  ["Browser Fingerprint Collector - Client Intel", "https://github.com/crtvrffnrt/Browser-Fingerprint-Collector"],
  ["Bounty Helper Scripts - Recon Helpers", "https://github.com/crtvrffnrt/BountyHelperScripts"],
  ["C3PO Shodan Codex - EASM Reports", "https://github.com/crtvrffnrt/C3PO-Shodan-codex"],
  ["C3PO Shodan Gemini - EASM Reports", "https://github.com/crtvrffnrt/C3PO-Shodan"],
  ["CyberSlides - Security Decks", "https://github.com/crtvrffnrt/cyberslides"],
  ["Domain IP Scan - DNS Lookup", "https://domain.ipscan.info/"],
  ["Evilian - Azure Kali Bootstrap", "https://github.com/crtvrffnrt/evilian"],
  ["Incident Response Scripts - IR Helpers", "https://github.com/crtvrffnrt/IncidentResponseScripts"],
  ["IP Scan - IP Intelligence", "https://ipscan.info/"],
  ["Joiner - Entra Device Lab", "https://github.com/crtvrffnrt/joiner"],
  ["JWT Inspector - Token Decoder", "https://jwt.ipscan.info/"],
  ["KQL - Detection Queries", "https://github.com/crtvrffnrt/KQL"],
  ["MDE Live Response - Triage Scripts", "https://github.com/crtvrffnrt/MDE-Live-Response-Scripts"],
  ["Multi-Tenant Scripts - M365 Ops", "https://github.com/crtvrffnrt/multitenantscripts"],
  ["Offensive Script Library - Attack Tools", "https://github.com/crtvrffnrt/OffensiveScriptLibrary"],
  ["OSCP Checklist - Exam Notes", "https://github.com/crtvrffnrt/OSCP-Checklist-Cheatsheet2024"],
  ["Skills - Agent Skillpacks", "https://github.com/crtvrffnrt/skills"],
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character]);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "2-digit", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function renderHeader() {
  const projectLinks = projects.map(([label, url]) => `<a class="project-link" role="menuitem" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`).join("");
  return `<nav><div class="nav-content">
    <a class="nav-brand" href="https://www.patrick-binder.de/">PBI | Offensive &amp; Defensive Security | Pentest | Detection | Response</a>
    <div class="nav-actions" aria-label="Profile links">
      <a class="nav-icon-link github-icon" href="https://github.com/crtvrffnrt" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><span aria-hidden="true">GH</span></a>
      <a class="nav-icon-link linkedin-icon" href="https://www.linkedin.com/in/patrick-binder-601021199/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><span aria-hidden="true">in</span></a>
      <details class="projects-menu"><summary class="nav-icon-link projects-icon" aria-label="Open projects menu"></summary><div class="projects-menu-panel" role="menu" aria-label="Projects"><span class="projects-menu-title">Project Launchpad</span>${projectLinks}</div></details>
    </div>
  </div></nav>`;
}

function renderEntry(article) {
  const severity = article.severity ?? "intel";
  return `<article class="news-entry severity-${escapeHtml(severity)}">
    <a class="article-link" href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer" aria-describedby="summary-${escapeHtml(article.id)}">
      <span class="permissions" aria-hidden="true">-rw-r--r--</span>
      <span class="links" aria-hidden="true">1</span>
      <span class="source">${escapeHtml(article.source)}</span>
      <span class="category">${escapeHtml(article.category)}</span>
      <span class="risk">${escapeHtml(article.severity ?? article.cve ?? "intel")}</span>
      <time datetime="${escapeHtml(article.publishedAt)}">${formatDate(article.publishedAt)}</time>
      <span class="headline">${escapeHtml(article.title)} <b aria-hidden="true">↗</b></span>
    </a>
    <div class="entry-actions"><button class="summary-toggle" type="button" aria-expanded="false" aria-controls="summary-${escapeHtml(article.id)}">summary</button><a class="touch-open" href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">open article ↗</a></div>
    <p class="entry-summary" id="summary-${escapeHtml(article.id)}">${escapeHtml(article.summary)}</p>
  </article>`;
}

export function renderPage(rawNews) {
  const ids = new Set();
  const urls = new Set();
  const articles = rawNews.filter((article) => {
    if (ids.has(article.id) || urls.has(article.url)) return false;
    ids.add(article.id); urls.add(article.url); return true;
  }).sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));

  return `<!doctype html><html lang="en"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Curated operational cybersecurity news from PBI."><meta name="theme-color" content="#000000">
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/news.css"><script src="/assets/news.js" defer></script><title>PBI // Security News</title>
  </head><body>${renderHeader()}<main><section class="terminal" aria-labelledby="feed-title">
    <div class="terminal-header"><span class="terminal-mark" aria-hidden="true">K</span><span class="terminal-tab">news@pbi: ~</span><span class="terminal-title">Security News Terminal</span><span class="terminal-dot" aria-hidden="true"></span></div>
    <div class="terminal-body"><p class="terminal-intro" id="feed-title">PBI // curated operational threat intelligence</p><p class="prompt"><span>root@news</span>:<b>~/news</b>$ ls -lah news/</p>
    <section class="listing" aria-label="Security news articles">${articles.map(renderEntry).join("")}</section>
    <p class="terminal-footer">total ${articles.length} · hover or focus an entry for 5s to inspect summary</p></div>
  </section></main></body></html>`;
}
