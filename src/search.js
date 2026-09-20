/** Normalize case, spacing and typographic hyphens without stripping technical punctuation. */
export function normalizeSearchText(value) {
  return String(value ?? "").normalize("NFKC")
    .replace(/[\u2010-\u2014\u2212]/g, "-")
    .toLowerCase().replace(/\s+/g, " ").trim();
}

/** All terms are ANDed; quotes group a phrase and a leading minus excludes it. */
export function parseSearchQuery(value) {
  const query = normalizeSearchText(value).slice(0, 256).replace(/[\u201c\u201d]/g, '"');
  const terms = [];
  let cursor = 0;
  while (cursor < query.length) {
    if (query[cursor] === " ") { cursor++; continue; }
    const exclude = query[cursor] === "-";
    if (exclude) cursor++;
    let text;
    if (query[cursor] === '"') {
      const start = ++cursor;
      const end = query.indexOf('"', start);
      text = query.slice(start, end === -1 ? query.length : end);
      cursor = end === -1 ? query.length : end + 1;
    } else {
      const start = cursor;
      while (cursor < query.length && query[cursor] !== " ") cursor++;
      text = query.slice(start, cursor);
    }
    if (text?.trim()) terms.push({ text: text.trim(), exclude });
  }
  return terms;
}

/** Keep short acronyms and complete indicators exact; allow longer word fragments. */
export function containsSearchTerm(field, text) {
  const ip = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(text);
  const precise = ip || /^[a-z0-9]{1,4}$/.test(text)
    || /^cve-\d{4}-\d+$/.test(text) || /^t\d{4}(?:\.\d{3})?$/.test(text);
  if (!precise) return field.includes(text);
  const continuation = ip ? /[\p{L}\p{N}_.]/u : /[\p{L}\p{N}_]/u;
  let offset = field.indexOf(text);
  while (offset !== -1) {
    if (!continuation.test(field[offset - 1] || "")
      && !continuation.test(field[offset + text.length] || "")) return true;
    offset = field.indexOf(text, offset + 1);
  }
  return false;
}

/** Fields are normalized separately so a quoted phrase cannot bridge unrelated fields. */
export function matchesSearch(fields, terms) {
  return terms.every(({ text, exclude }) => {
    const found = fields.some((field) => containsSearchTerm(field, text));
    return exclude ? !found : found;
  });
}

function initializeNewsSearch() {
  const header = document.querySelector(".site-header");
  const toggle = document.getElementById("news-search-toggle");
  const form = document.getElementById("news-search-form");
  const input = document.getElementById("news-search-input");
  const clear = document.getElementById("news-search-clear");
  const status = document.getElementById("news-search-status");
  if (!header || !toggle || !form || !input || !clear || !status || form.dataset.ready) return;
  form.dataset.ready = "true";
  let terms = [];

  // Index the full summaries and tags, including entries hidden behind More News.
  const panels = [...document.querySelectorAll(".news-panel")].map((panel) => {
    const more = panel.querySelector(".news-expand-toggle");
    const state = { panel, more, expanded: !more };
    state.entries = [...panel.querySelectorAll(".news-entry")].map((entry) => {
      let tags = [];
      try { tags = JSON.parse(entry.dataset.searchTags || "[]"); } catch { /* Older markup has no tags. */ }
      const fields = [
        entry.querySelector(".headline")?.textContent,
        entry.querySelector(".entry-summary")?.textContent,
        entry.querySelector(".meta-cve")?.textContent,
        ...(Array.isArray(tags) ? tags : []),
      ].map(normalizeSearchText);
      return { entry, fields, additional: entry.classList.contains("additional-news") };
    });
    const empty = document.createElement("p");
    empty.className = "search-empty";
    empty.textContent = "No matching articles in this category.";
    empty.hidden = true;
    panel.querySelector(".stream-list")?.append(empty);
    state.empty = empty;
    // The original handler reveals entries and removes the button. Remember that choice.
    more?.addEventListener("click", () => { state.expanded = true; });
    return state;
  });

  function applySearch(announce = true) {
    const active = panels.find(({ panel }) => !panel.hidden);
    if (!active) return;
    const filtering = terms.length > 0;
    let count = 0;
    for (const record of active.entries) {
      const visible = filtering
        ? matchesSearch(record.fields, terms)
        : active.expanded || !record.additional;
      record.entry.hidden = !visible;
      if (visible) count++;
    }
    if (active.more?.isConnected) active.more.hidden = filtering || active.expanded;
    active.empty.hidden = !filtering || count > 0;
    header.classList.toggle("search-active", filtering);
    const selected = document.querySelector('.terminal-tab[aria-selected="true"]');
    const category = active.panel.id === "news-panel" ? "all news" : selected?.textContent.trim() || "this category";
    input.placeholder = "Search " + category + "…";
    input.setAttribute("aria-label", "Search " + category + ": titles, summaries, tags and CVEs");
    if (announce) status.textContent = count + (count === 1 ? " article" : " articles") + " shown in " + category + ".";
  }

  function resetSearch() {
    input.value = "";
    clear.hidden = true;
    terms = [];
    applySearch();
  }

  function closeSearch() {
    resetSearch();
    form.hidden = true;
    header.classList.remove("search-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open news search");
    toggle.focus();
  }

  toggle.addEventListener("click", () => {
    if (!form.hidden) { closeSearch(); return; }
    header.querySelectorAll("details[open]").forEach((menu) => { menu.open = false; });
    form.hidden = false;
    header.classList.add("search-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close and clear news search");
    input.focus();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    terms = parseSearchQuery(input.value);
    applySearch();
    // Leave typing alone; update the feed only on Enter or the submit button.
    window.scrollTo({ top: 0, behavior: "auto" });
  });
  form.addEventListener("reset", (event) => {
    event.preventDefault();
    resetSearch();
    input.focus();
  });
  input.addEventListener("input", () => { clear.hidden = input.value.length === 0; });
  form.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeSearch(); }
  });
  // Existing tab handlers run first; apply the submitted query to the new category.
  document.querySelectorAll(".terminal-tab").forEach((tab) => {
    tab.addEventListener("click", () => applySearch());
  });
  toggle.hidden = false;
  applySearch(false);
}

// Serve through the existing same-origin script endpoint; no inline handlers or new API.
export const searchClient = `;(() => {
${normalizeSearchText.toString()}
${parseSearchQuery.toString()}
${containsSearchTerm.toString()}
${matchesSearch.toString()}
(${initializeNewsSearch.toString()})();
})();`;

export function renderSearchControl() {
  return `<div class="news-search">
    <button class="news-search-toggle" id="news-search-toggle" type="button" aria-label="Open news search" aria-expanded="false" aria-controls="news-search-form" hidden>
      <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m16 16 4.5 4.5"></path></svg>
    </button>
    <form class="news-search-form" id="news-search-form" role="search" aria-label="Filter news articles" hidden>
      <input id="news-search-input" name="q" type="search" maxlength="256" placeholder="Search all news…" aria-label="Search titles, summaries, tags and CVEs" aria-describedby="news-search-help" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="search">
      <button id="news-search-clear" type="reset" aria-label="Clear search" hidden>×</button>
      <button type="submit" aria-label="Search news">↵</button>
    </form>
    <span class="search-sr-only" id="news-search-help">All words must match. Use double quotes for a phrase and -word to exclude. Press Enter to filter the selected category, including older articles.</span>
    <span class="search-sr-only" id="news-search-status" role="status" aria-live="polite" aria-atomic="true"></span>
  </div>`;
}

export const searchStyles = `
/* Author display rules must not override filtering or the existing More News state. */
.news-entry[hidden], .news-panel[hidden], .news-expand-toggle[hidden],
.news-search [hidden], .search-empty[hidden] { display:none!important; }
.search-sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip-path:inset(50%); white-space:nowrap; border:0; }
.site-header .nav-content { justify-content:flex-start; }
.site-header .nav-actions { margin-left:auto; flex:none; }
.site-header .nav-brand::after { content:none; }
.news-search { display:flex; align-items:center; gap:6px; min-width:0; flex:none; }
.news-search-toggle { display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; padding:0; border:1px solid transparent; border-radius:8px; background:transparent; color:var(--green); cursor:pointer; flex:none; touch-action:manipulation; }
.news-search-toggle svg { fill:none; stroke:currentColor; stroke-width:1.7; stroke-linecap:round; }
.news-search-toggle:hover, .news-search-toggle[aria-expanded="true"] { background:rgb(92 255 176 / 7%); border-color:rgb(92 255 176 / 20%); }
.search-open .news-search { flex:1; max-width:440px; }
.news-search-form { display:flex; align-items:center; min-width:0; height:40px; flex:1; border:1px solid rgb(92 255 176 / 24%); border-radius:8px; background:rgb(7 10 14 / 94%); }
.news-search-form:focus-within { border-color:var(--green); }
.news-search-form input { min-width:0; width:100%; flex:1; height:100%; padding:0 10px; border:0; outline:0; color:var(--text); background:transparent; font:400 16px/1.3 var(--mono); }
.news-search-form input::placeholder { color:#81948a; font-size:12px; }
.news-search-form input::-webkit-search-cancel-button, .news-search-form input::-webkit-search-decoration { -webkit-appearance:none; }
.news-search-form button { align-self:stretch; width:36px; flex:none; padding:0; border:0; border-radius:6px; background:transparent; color:#9bb2a6; cursor:pointer; font:500 20px/1 var(--mono); touch-action:manipulation; }
.news-search-form button[type="submit"] { color:var(--green); }
.news-search-form button:hover { background:rgb(92 255 176 / 8%); }
.news-search button:focus-visible { outline:2px solid var(--green); outline-offset:2px; }
.search-active .news-search-toggle { color:var(--cyan); }
.search-empty { margin:0; padding:32px 16px; color:var(--muted); font:400 .82rem/1.6 var(--mono); }
@media (min-width:761px) and (max-width:1100px) {
  .site-header.search-open .nav-brand::before { content:none; }
  .site-header.search-open .nav-brand { white-space:nowrap; font-size:.75rem; }
}
@media (max-width:760px) {
  .site-header { min-height:calc(61px + env(safe-area-inset-top)); }
  .site-header .nav-content { min-height:44px; }
  .terminal-header { top:calc(61px + env(safe-area-inset-top)); }
  .news-search-toggle { width:44px; height:44px; }
  .site-header.search-open .nav-brand, .site-header.search-open .nav-actions { display:none; }
  .site-header.search-open .news-search { width:100%; max-width:none; }
  .news-search-form { height:44px; }
  .news-search-form button { width:40px; }
  .search-empty { border:1px solid var(--line); border-radius:14px; background:var(--panel); }
}
`;
