import { readFile } from "node:fs/promises";

const requiredFields = ["id", "title", "source", "sourceDomain", "url", "publishedAt", "category", "tags", "summary"];
const categories = new Set(["CVE", "Vulnerability", "Exploit", "Ransomware", "Malware", "Malvertising", "APT", "Threat Actor", "Phishing", "Cloud Security", "AI Security", "Incident Response", "General Intel"]);
const data = JSON.parse(await readFile(new URL("../src/data/news.json", import.meta.url), "utf8"));
const ids = new Set();
const urls = new Set();
const errors = [];

for (const [index, article] of data.entries()) {
  const label = `entry ${index + 1}`;
  for (const field of requiredFields) if (!(field in article) || article[field] === "") errors.push(`${label}: missing ${field}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.id ?? "")) errors.push(`${label}: id must be a normalized lowercase slug`);
  if (ids.has(article.id)) errors.push(`${label}: duplicate id ${article.id}`);
  ids.add(article.id);
  try { new URL(article.url); } catch { errors.push(`${label}: invalid URL`); }
  if (urls.has(article.url)) errors.push(`${label}: duplicate URL ${article.url}`);
  urls.add(article.url);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.publishedAt ?? "") || Number.isNaN(Date.parse(`${article.publishedAt}T00:00:00Z`))) errors.push(`${label}: invalid publishedAt`);
  if (!categories.has(article.category)) errors.push(`${label}: unsupported category ${article.category}`);
  if (!Array.isArray(article.tags)) errors.push(`${label}: tags must be an array`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${data.length} news entries: unique IDs, URLs, dates, and categories.`);
