import { readdir, readFile } from "node:fs/promises";

const requiredFields = ["id", "title", "source", "sourceDomain", "url", "publishedAt", "addedAt", "category", "tags", "summary"];
const categories = new Set(["CVE", "Vulnerability", "Exploit", "Ransomware", "Malware", "Malvertising", "APT", "Threat Actor", "Phishing", "Cloud Security", "AI Security", "Incident Response", "General Intel"]);
const chunkPattern = /^chunk-(\d{4})\.json$/;
const chunkLimit = 100;
const dataDirectory = new URL("../src/data/news/", import.meta.url);
const filenames = (await readdir(dataDirectory)).filter((name) => chunkPattern.test(name)).sort();
const errors = [];
const articles = [];
let sawEmptyChunk = false;
let lastPopulatedChunk = null;

if (filenames.length === 0) errors.push("no news chunk files found");

for (const filename of filenames) {
  let chunk;
  try {
    chunk = JSON.parse(await readFile(new URL(filename, dataDirectory), "utf8"));
  } catch (error) {
    errors.push(`${filename}: invalid JSON (${error.message})`);
    continue;
  }

  if (!Array.isArray(chunk)) {
    errors.push(`${filename}: root must be a JSON array`);
    continue;
  }
  if (chunk.length > chunkLimit) errors.push(`${filename}: exceeds ${chunkLimit}-entry chunk limit`);
  if (chunk.length === 0) {
    sawEmptyChunk = true;
  } else {
    if (sawEmptyChunk) errors.push(`${filename}: non-empty chunk follows an empty preallocated chunk`);
    lastPopulatedChunk = filename;
  }

  for (const [index, article] of chunk.entries()) {
    articles.push({ article, filename, index });
  }
}

const ids = new Set();
for (const { article, filename, index } of articles) {
  const label = `${filename} entry ${index + 1}`;
  for (const field of requiredFields) if (!(field in article) || article[field] === "") errors.push(`${label}: missing ${field}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.id ?? "")) errors.push(`${label}: id must be a normalized lowercase slug`);
  if (ids.has(article.id)) errors.push(`${label}: duplicate id ${article.id}`);
  ids.add(article.id);
  try {
    const url = new URL(article.url);
    if (!["http:", "https:"].includes(url.protocol)) errors.push(`${label}: URL must use http or https`);
  } catch {
    errors.push(`${label}: invalid URL`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.publishedAt ?? "") || Number.isNaN(Date.parse(`${article.publishedAt}T00:00:00Z`))) errors.push(`${label}: invalid publishedAt`);
  if (Number.isNaN(Date.parse(article.addedAt ?? ""))) errors.push(`${label}: invalid addedAt`);
  if (!categories.has(article.category)) errors.push(`${label}: unsupported category ${article.category}`);
  if (!Array.isArray(article.tags)) errors.push(`${label}: tags must be an array`);
}

const newestAddedAt = articles.reduce((latest, { article }) => typeof article.addedAt === "string" && article.addedAt > latest ? article.addedAt : latest, "");
if (newestAddedAt) {
  const cutoff = new Date(new Date(newestAddedAt).getTime() - 10 * 24 * 60 * 60 * 1000);
  const recentUrls = new Set();
  for (const { article, filename, index } of articles) {
    const added = new Date(article.addedAt);
    if (Number.isNaN(added.getTime()) || added < cutoff) continue;
    const label = `${filename} entry ${index + 1}`;
    if (recentUrls.has(article.url)) errors.push(`${label}: duplicate URL within 10-day dedup window ${article.url}`);
    recentUrls.add(article.url);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`Validated ${articles.length} news entries across ${filenames.length} chunks (max ${chunkLimit} each; active ${lastPopulatedChunk ?? "none"}).`);
