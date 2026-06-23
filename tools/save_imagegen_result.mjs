#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import readline from "node:readline";

function usage() {
  console.error(
    [
      "Usage: node tools/save_imagegen_result.mjs <output.png> [options]",
      "",
      "Options:",
      "  --contains <text>     Require revised prompt to contain text. Repeatable.",
      "  --after <iso-date>     Require result timestamp >= this ISO timestamp.",
      "  --sessions <number>    Number of newest rollout files to scan. Default: 40.",
    ].join("\n"),
  );
}

const args = process.argv.slice(2);
const outArg = args.shift();
if (!outArg) {
  usage();
  process.exit(2);
}

const contains = [];
let after = null;
let sessionLimit = 40;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (arg === "--contains") {
    const value = args[++i];
    if (!value) {
      usage();
      process.exit(2);
    }
    contains.push(value.toLowerCase());
  } else if (arg === "--after") {
    const value = args[++i];
    if (!value) {
      usage();
      process.exit(2);
    }
    after = Date.parse(value);
    if (Number.isNaN(after)) {
      console.error(`Invalid --after timestamp: ${value}`);
      process.exit(2);
    }
  } else if (arg === "--sessions") {
    const value = Number(args[++i]);
    if (!Number.isInteger(value) || value < 1) {
      usage();
      process.exit(2);
    }
    sessionLimit = value;
  } else {
    console.error(`Unknown option: ${arg}`);
    usage();
    process.exit(2);
  }
}

const sessionsRoot = path.join(os.homedir(), ".codex", "sessions");
const sessionFiles = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.startsWith("rollout-") && entry.name.endsWith(".jsonl")) {
      sessionFiles.push(full);
    }
  }
}

walk(sessionsRoot);
sessionFiles.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

let best = null;

for (const sessionPath of sessionFiles.slice(0, sessionLimit)) {
  const rl = readline.createInterface({
    input: fs.createReadStream(sessionPath),
    crlfDelay: Infinity,
  });
  let lineNo = 0;
  for await (const line of rl) {
    lineNo += 1;
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      continue;
    }
    const payload = record?.payload;
    if (payload?.type !== "image_generation_call" || typeof payload.result !== "string") {
      continue;
    }
    const timestampMs = Date.parse(record.timestamp || "");
    if (after !== null && (Number.isNaN(timestampMs) || timestampMs < after)) {
      continue;
    }
    const prompt = String(payload.revised_prompt || payload.prompt || "").toLowerCase();
    if (!contains.every((needle) => prompt.includes(needle))) {
      continue;
    }
    if (!best || timestampMs > best.timestampMs) {
      best = {
        sessionPath,
        lineNo,
        timestamp: record.timestamp,
        timestampMs,
        id: payload.id,
        prompt: payload.revised_prompt || payload.prompt || "",
        b64: payload.result,
      };
    }
  }
}

if (!best) {
  console.error("No matching image_generation_call result found.");
  process.exit(1);
}

const outPath = path.resolve(outArg);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, Buffer.from(best.b64, "base64"));

console.log(JSON.stringify({
  out: outPath,
  bytes: fs.statSync(outPath).size,
  source: best.sessionPath,
  line: best.lineNo,
  timestamp: best.timestamp,
  image_call_id: best.id,
  prompt_preview: best.prompt.slice(0, 220),
}, null, 2));
