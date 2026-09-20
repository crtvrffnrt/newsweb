import { renderSearchControl } from "./search.js";

const assetVersion = "20260920-category-search-v1";

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
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function renderHeader() {
  const projectLinks = projects
    .map(([label, url]) => `<a class="project-link" role="menuitem" href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`)
    .join("");

  return `<nav class="site-header"><div class="nav-content">
    <a class="nav-brand" href="https://www.patrick-binder.de/">PBI // SECURITY NEWS</a>
    ${renderSearchControl()}
    <div class="nav-actions" aria-label="Profile links">
      <a class="nav-icon-link" href="https://github.com/crtvrffnrt" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><img src="/GitHub_Invertocat_White.png" alt=""></a>
      <a class="nav-icon-link" href="https://www.linkedin.com/in/patrick-binder-601021199/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><img src="/InBug-White.png" alt=""></a>
      <details class="projects-menu"><summary class="nav-icon-link projects-icon" aria-label="Open projects menu"></summary><div class="projects-menu-panel" role="menu" aria-label="Projects"><span class="projects-menu-title">Project Launchpad</span>${projectLinks}</div></details>
    </div>
  </div></nav>`;
}

function renderEntry(article, isAdditional = false) {
  const severity = article.severity ?? "intel";
  const cve = article.cve ? `<span class="meta-cve">${escapeHtml(article.cve)}</span>` : "";

  return `<article class="news-entry severity-${escapeHtml(severity)}${article.isRecent ? " recent-entry" : ""}${isAdditional ? " additional-news" : ""}" data-search-tags="${escapeHtml(JSON.stringify(Array.isArray(article.tags) ? article.tags : []))}"${isAdditional ? " hidden" : ""}>
    <time class="stream-date" datetime="${escapeHtml(article.publishedAt)}">${formatDate(article.publishedAt)}</time>
    <div class="stream-content">
      <div class="entry-meta">
        <span class="meta-severity"><i aria-hidden="true"></i>${escapeHtml(severity)}</span>
        <span class="meta-category">${escapeHtml(article.category)}</span>
        ${cve}
        <span class="meta-source">${escapeHtml(article.source)}</span>
      </div>
      <h2 class="headline"><a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title)}<span aria-hidden="true">↗</span></a></h2>
      <p class="entry-summary">${escapeHtml(article.summary)}</p>
    </div>
  </article>`;
}

function renderPanel(articles, panelId, category = "") {
  const visibleArticleCount = category ? articles.length : 8;
  const hiddenArticleCount = Math.max(0, articles.length - visibleArticleCount);
  const path = category ? `~/news/${category}` : "~/news";

  return `<div class="terminal-panel news-panel" id="${escapeHtml(panelId)}" role="tabpanel"${category ? " hidden" : ""}>
    <div class="terminal-body">
      <p class="prompt"><span class="prompt-user">root@news</span>:<b>${escapeHtml(path)}</b>$ <span class="prompt-command">tail -f security.log</span><span class="cursor" aria-hidden="true"></span></p>
      <section class="stream-list" aria-label="${category ? `${escapeHtml(category)} ` : ""}security news articles">
        ${articles.map((article, index) => renderEntry(article, index >= visibleArticleCount)).join("")}
      </section>
      ${hiddenArticleCount > 0 ? `<button class="news-expand-toggle" type="button" aria-expanded="false"><span>+ ${hiddenArticleCount} more news</span><b aria-hidden="true">⌄</b></button>` : ""}
    </div>
  </div>`;
}

export function renderPage(rawNews) {
  const ids = new Set();
  const articles = rawNews
    .filter((article) => {
      if (ids.has(article.id)) return false;
      ids.add(article.id);
      return true;
    })
    .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt) || right.addedAt.localeCompare(left.addedAt));

  const recentIds = new Set(
    [...articles]
      .sort((left, right) => right.addedAt.localeCompare(left.addedAt))
      .slice(0, 3)
      .map((article) => article.id),
  );

  const renderedArticles = articles.map((article) => ({ ...article, isRecent: recentIds.has(article.id) }));
  const recentKey = [...recentIds].sort().join("|");
  const categories = [...new Set(renderedArticles.map((article) => article.category))]
    .sort((left, right) => left.localeCompare(right, "en"));

  const categoryTabs = categories
    .map((category, index) => `<button class="terminal-tab category-tab" type="button" role="tab" aria-selected="false" aria-controls="category-panel-${index}" id="category-tab-${index}">${escapeHtml(category)}</button>`)
    .join("");

  const categoryPanels = categories
    .map((category, index) => {
      const categoryArticles = renderedArticles.filter((article) => article.category === category);
      return renderPanel(categoryArticles, `category-panel-${index}`, category).replace(
        `id="category-panel-${index}" role="tabpanel"`,
        `id="category-panel-${index}" role="tabpanel" aria-labelledby="category-tab-${index}"`,
      );
    })
    .join("");

  return `<!doctype html><html lang="en"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="description" content="Curated operational cybersecurity news from PBI."><meta name="theme-color" content="#05060a">
    <link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/news.css?v=${assetVersion}"><script src="/assets/news.js?v=${assetVersion}" defer></script><title>PBI // Security News</title>
  </head><body>${renderHeader()}<main data-recent-key="${escapeHtml(recentKey)}">
    <section class="terminal" aria-label="Security news terminal">
      <div class="terminal-header">
        <div class="window-lights" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="tab-strip" role="tablist" aria-label="News filters">
          <button class="terminal-tab active" type="button" role="tab" aria-selected="true" aria-controls="news-panel" id="news-tab">news</button>${categoryTabs}
        </div>
        <span class="terminal-title">zsh — ~/security-news</span>
      </div>
      ${renderPanel(renderedArticles, "news-panel").replace('role="tabpanel"', 'role="tabpanel" aria-labelledby="news-tab"')}
      ${categoryPanels}
    </section>
  </main></body></html>`;
}
