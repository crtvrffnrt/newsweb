import { execFileSync } from "node:child_process";

const [before, after] = process.argv.slice(2);
if (!before || !after) {
  console.error("usage: node scripts/validate-news-append.js <before-sha> <after-sha>");
  process.exit(2);
}

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const message = git("log", "-1", "--pretty=%s", after);
if (!/^Add daily security news for \d{4}-\d{2}-\d{2}$/.test(message)) {
  console.log("Not a scheduled daily-news commit; append-only commit check skipped.");
  process.exit(0);
}

const changed = git("diff", "--name-only", before, after).split("\n").filter(Boolean);
if (changed.length !== 1 || !/^src\/data\/news\/chunk-\d{4}\.json$/.test(changed[0])) {
  console.error(`Daily news commit must change exactly one chunk file; changed: ${changed.join(", ") || "none"}`);
  process.exit(1);
}

const path = changed[0];
const previous = JSON.parse(git("show", `${before}:${path}`));
const current = JSON.parse(git("show", `${after}:${path}`));
if (!Array.isArray(previous) || !Array.isArray(current)) {
  console.error("Chunk root must remain a JSON array.");
  process.exit(1);
}
const addedCount = current.length - previous.length;
if (addedCount < 1 || addedCount > 4) {
  console.error(`Daily news commit must append 1-4 records; got ${addedCount}.`);
  process.exit(1);
}
if (current.length > 100) {
  console.error("Daily news commit exceeded the 100-entry chunk limit.");
  process.exit(1);
}
for (let index = 0; index < previous.length; index++) {
  if (JSON.stringify(previous[index]) !== JSON.stringify(current[index])) {
    console.error(`Historical entry ${index + 1} in ${path} was modified or reordered.`);
    process.exit(1);
  }
}
console.log(`Append-only check passed: ${addedCount} new record(s) in ${path}.`);
