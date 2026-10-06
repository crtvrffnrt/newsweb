import { readFile } from "node:fs/promises";

const requiredFields = ["id", "title", "source", "sourceDomain", "url", "publishedAt", "addedAt", "category", "tags", "summary"];
const categories = new Set(["CVE", "Vulnerability", "Exploit", "Ransomware", "Malware", "Malvertising", "APT", "Threat Actor", "Phishing", "Cloud Security", "AI Security", "Incident Response", "General Intel"]);
const historyLimit = 100;
const filename = "chunk-0003.json";
const dataFile = new URL("../src/data/news/" + filename, import.meta.url);
const errors = [];
let articles;

try {
  articles = JSON.parse(await readFile(dataFile, "utf8"));
} catch (error) {
  console.error(filename + ": invalid JSON (" + error.message + ")");
  process.exit(1);
}
if (!Array.isArray(articles)) errors.push(filename + ": root must be a JSON array");
if (Array.isArray(articles) && articles.length > historyLimit) errors.push(filename + ": exceeds " + historyLimit + "-entry history limit");

const ids = new Set();
const urls = new Set();
for (const [index, article] of (Array.isArray(articles) ? articles : []).entries()) {
  const label = filename + " entry " + (index + 1);
  for (const field of requiredFields) if (!(field in article) || article[field] === "") errors.push(label + ": missing " + field);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.id ?? "")) errors.push(label + ": id must be a normalized lowercase slug");
  if (ids.has(article.id)) errors.push(label + ": duplicate id " + article.id);
  ids.add(article.id);
  try {
    const url = new URL(article.url);
    if (url.protocol !== "https:") errors.push(label + ": URL must use https");
  } catch { errors.push(label + ": invalid URL"); }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.publishedAt ?? "") || Number.isNaN(Date.parse((article.publishedAt ?? "") + "T00:00:00Z"))) errors.push(label + ": invalid publishedAt");
  if (Number.isNaN(Date.parse(article.addedAt ?? ""))) errors.push(label + ": invalid addedAt");
  if (!categories.has(article.category)) errors.push(label + ": unsupported category " + article.category);
  if (!Array.isArray(article.tags)) errors.push(label + ": tags must be an array");
}

const newestAddedAt = (Array.isArray(articles) ? articles : []).reduce((latest, article) => typeof article.addedAt === "string" && article.addedAt > latest ? article.addedAt : latest, "");
if (newestAddedAt) {
  const cutoff = new Date(new Date(newestAddedAt).getTime() - 10 * 24 * 60 * 60 * 1000);
  for (const [index, article] of articles.entries()) {
    const added = new Date(article.addedAt);
    if (Number.isNaN(added.getTime()) || added < cutoff) continue;
    if (urls.has(article.url)) errors.push(filename + " entry " + (index + 1) + ": duplicate URL within 10-day dedup window " + article.url);
    urls.add(article.url);
  }
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log("Validated " + articles.length + " production news entries (max " + historyLimit + ").");
