import assert from "node:assert/strict";
import test from "node:test";
import { Script } from "node:vm";
import { readFileSync } from "node:fs";
import { searchSource, searchClient, searchStyles, renderSearchControl } from "../src/search.js";
import { renderPage } from "../src/template.js";
import { clientScript } from "../src/client.js";

// Exercise the exact source shipped to the browser, not a server-side duplicate.
const { normalizeSearchText, parseSearchQuery, matchesSearch } = new Script(
  "(() => {\n" + searchSource + "\nreturn { normalizeSearchText, parseSearchQuery, matchesSearch }; })()",
).runInThisContext();
const match = (query, fields) => matchesSearch(fields.map(normalizeSearchText), parseSearchQuery(query));
const sample = {
  id: "search-test", title: "Azure credential exposure", summary: "Investigate token theft.",
  url: "https://example.com/article", source: "Example", sourceDomain: "example.com",
  publishedAt: "2026-09-01", addedAt: "2026-09-02T07:00:00Z",
  category: "Cloud Security", tags: ["Entra ID", "T1528"], severity: "high",
};

test("case-insensitive AND matching across title, summary and tags", () => {
  assert.ok(match("AZURE token entra", [sample.title, sample.summary, ...sample.tags]));
  assert.equal(match("azure ransomware", [sample.title, sample.summary, ...sample.tags]), false);
});
test("quoted phrases stay contiguous and cannot span separate fields or tags", () => {
  assert.ok(match('"Entra ID"', sample.tags));
  assert.equal(match('"entra id"', ["Entra", "ID"]), false);
  assert.equal(match('"token theft"', ["token investigation and theft"]), false);
});
test("exclusions support both words and phrases, including exclusion-only searches", () => {
  assert.equal(match('azure -"token theft"', [sample.title, sample.summary]), false);
  assert.ok(match("azure -ransomware", [sample.title, sample.summary]));
  assert.ok(match("-ransomware", [sample.title]));
});
test("CVE IDs, ATT&CK IDs, IPs, domains and filenames retain their punctuation", () => {
  for (const term of ["CVE-2026-58138", "T1528", "192.0.2.10", "example.com", "win64.exe", "pre-auth"]) {
    assert.ok(match(term, ["Observed " + term + " in telemetry."]));
  }
  assert.ok(match("cve–2026–58138", ["CVE-2026-58138"]));
});
test("smart quotes, whitespace, empty queries and unfinished phrases are handled", () => {
  assert.ok(match('“TOKEN   THEFT”', [sample.summary]));
  assert.deepEqual(parseSearchQuery('  "" - '), []);
  assert.ok(match("", []));
  assert.deepEqual(parseSearchQuery('"token theft'), [{ text: "token theft", exclude: false }]);
});
test("input is bounded and query characters are never evaluated as regex or code", () => {
  assert.equal(parseSearchQuery("a".repeat(1000))[0].text.length, 256);
  assert.equal(match(".*", ["any text"]), false);
  assert.ok(match(".*", ["literal .* text"]));
  assert.doesNotThrow(() => parseSearchQuery('<script>alert(1)</script> [ ('));
});
test("search control is visible in server HTML before any JavaScript executes", () => {
  const html = renderSearchControl();
  const button = html.match(/<button[^>]*id="news-search-toggle"[^>]*>/)?.[0];
  assert.ok(button);
  assert.doesNotMatch(button, /\shidden(?:\s|=|>)/);
  assert.match(html, /class="news-search-label">Search</);
  assert.match(html, /stroke="currentColor"/);
  assert.match(html, /type="search"/);
  assert.match(html, /enterkeyhint="search"/);
  assert.match(html, /id="news-search-form"[^>]*hidden/);
  assert.match(html, /type="submit"/);
});
test("all records including older entries expose tags without changing the JSON schema", () => {
  const records = Array.from({ length: 12 }, (_, i) => ({ ...sample, id: `story-${i}`, tags: [`private-tag-${i}`] }));
  const before = JSON.stringify(records);
  const html = renderPage(records);
  assert.equal(JSON.stringify(records), before);
  assert.match(html, /data-search-tags="\[&quot;private-tag-11&quot;\]"/);
  assert.match(html, /additional-news/);
  assert.equal((html.match(/role="search"/g) || []).length, 1);
});
test("tag content is HTML-escaped rather than injected as attributes or scripts", () => {
  const html = renderPage([{ ...sample, tags: ['"><script>alert(1)</script>'] }]);
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('&lt;script&gt;'));
});
test("optional tags are backward-compatible", () => {
  const { tags, ...withoutTags } = sample;
  assert.match(renderPage([withoutTags]), /data-search-tags="\[\]"/);
});
test("hidden articles, panels and buttons override desktop and mobile display rules", () => {
  assert.match(searchStyles, /\.news-entry\[hidden\]/);
  assert.match(searchStyles, /\.news-panel\[hidden\]/);
  assert.match(searchStyles, /display:none!important/);
});
test("search is served separately from legacy JavaScript using versioned same-origin assets", () => {
  assert.doesNotThrow(() => new Script(clientScript));
  assert.doesNotThrow(() => new Script(searchClient));
  const worker = readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  assert.ok(worker.includes('"/assets/news.js": { body: clientScript'));
  assert.ok(worker.includes('"/assets/search.js": { body: searchClient'));
  assert.ok(worker.includes('${styles}\\n${updateStatusStyles}\\n${searchStyles}'));
  const html = renderPage([sample]);
  assert.match(html, /search\.js\?v=20260920-visible-search-v2/);
  assert.ok(html.indexOf('src="/assets/news.js') < html.indexOf('src="/assets/search.js'));
});
test("short acronyms and complete indicators do not match larger words or identifiers", () => {
  assert.equal(match("rce", ["source control"]), false);
  assert.equal(match("ai", ["supply chain"]), false);
  assert.ok(match("rce", ["Pre-auth RCE in a gateway."]));
  assert.ok(match("ai", ["AI-assisted development"]));
  assert.equal(match("CVE-2026-58138", ["CVE-2026-581380"]), false);
  assert.equal(match("T1528", ["T15280"]), false);
  assert.equal(match("192.0.2.1", ["192.0.2.10"]), false);
  assert.ok(match("conduc", ["Orkes Conductor"]));
});
test("browser source has no dependency on function serialization or Worker helpers", () => {
  const source = readFileSync(new URL("../src/search.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /\.toString\s*\(/);
  assert.doesNotMatch(searchClient, /\b(?:__name|__pow|eval)\s*\(/);
  // Function serialization is unavailable in this simulated build environment.
  const moduleSource = source.replace(/^export /gm, "");
  const result = new Script(
    'Function.prototype.toString = function () { throw new Error("serialization forbidden"); };\n'
    + moduleSource + '\nsearchClient;',
  ).runInNewContext();
  assert.equal(result, searchClient);
});
test("search waits for the DOM when loaded early", () => {
  let registered = false;
  new Script(searchClient).runInNewContext({
    document: {
      readyState: "loading",
      addEventListener(event, callback, options) {
        assert.equal(event, "DOMContentLoaded");
        assert.equal(typeof callback, "function");
        assert.equal(options.once, true);
        registered = true;
      },
    },
  });
  assert.ok(registered);
});
test("search initializes immediately after document loading without external helpers", () => {
  let queried = false;
  new Script(searchClient).runInNewContext({
    document: {
      readyState: "interactive",
      querySelector() { queried = true; return null; },
      getElementById() { return null; },
    },
  });
  assert.ok(queried);
});
