import { execFileSync } from "node:child_process";

const [before, after] = process.argv.slice(2);
if (!before || !after) { console.error("usage: node scripts/validate-news-append.js <before-sha> <after-sha>"); process.exit(2); }
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const message = git("log", "-1", "--pretty=%s", after);
if (!/^Add daily security news for \d{4}-\d{2}-\d{2}$/.test(message)) {
  console.log("Not a scheduled daily-news commit; rolling-window commit check skipped."); process.exit(0);
}
const changed = git("diff", "--name-only", before, after).split("\n").filter(Boolean);
const expectedPath = "src/data/news/chunk-0003.json";
if (changed.length !== 1 || changed[0] !== expectedPath) {
  console.error("Daily news commit must change exactly " + expectedPath + "; changed: " + (changed.join(", ") || "none")); process.exit(1);
}
const previous = JSON.parse(git("show", before + ":" + expectedPath));
const current = JSON.parse(git("show", after + ":" + expectedPath));
if (!Array.isArray(previous) || !Array.isArray(current)) { console.error("News root must remain a JSON array."); process.exit(1); }
if (current.length > 100) { console.error("Daily news commit exceeded the 100-entry history limit."); process.exit(1); }
const previousIds = new Set(previous.map(x => x.id));
const additions = current.filter(x => !previousIds.has(x.id));
if (additions.length < 1 || additions.length > 4) { console.error("Daily news commit must add 1-4 records; got " + additions.length + "."); process.exit(1); }
const removedCount = previous.length + additions.length - current.length;
if (removedCount < 0 || removedCount > additions.length) { console.error("Invalid rolling-window removal count: " + removedCount + "."); process.exit(1); }
const retainedPrevious = previous.slice(removedCount);
const retainedCurrent = current.slice(0, retainedPrevious.length);
if (JSON.stringify(retainedPrevious) !== JSON.stringify(retainedCurrent)) {
  console.error("Only the oldest records may be removed; retained historical records must remain unchanged and ordered."); process.exit(1);
}
const appended = current.slice(retainedPrevious.length);
if (JSON.stringify(appended) !== JSON.stringify(additions)) { console.error("New records must be appended after retained history."); process.exit(1); }
console.log("Rolling-window check passed: " + additions.length + " new record(s), " + removedCount + " oldest record(s) removed, " + current.length + " total.");
