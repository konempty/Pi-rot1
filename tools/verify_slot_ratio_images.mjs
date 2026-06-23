#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const base = path.join(root, "assets", "cards");
const slotDir = path.join(base, "source");
const slotRatio = 817 / 1014;
const portraitRatio = 2 / 3;
const tolerance = 0.01;

function identify(file) {
  const result = spawnSync(
    "identify",
    ["-format", "%w %h %[colorspace]", file],
    { encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `identify failed: ${file}`);
  }
  const [w, h, colorspace] = result.stdout.trim().split(/\s+/);
  return { w: Number(w), h: Number(h), colorspace };
}

if (!fs.existsSync(slotDir)) {
  throw new Error(`Missing directory: ${slotDir}`);
}

const files = fs
  .readdirSync(slotDir)
  .filter((name) => name.endsWith(".png"))
  .sort();

const rows = [];
let failures = 0;

for (const name of files) {
  const file = path.join(slotDir, name);
  const info = identify(file);
  const ratio = info.w / info.h;
  const slotDelta = Math.abs(ratio - slotRatio);
  const portraitDelta = Math.abs(ratio - portraitRatio);
  const mode = slotDelta <= tolerance ? "slot" : portraitDelta <= tolerance ? "portrait" : "invalid";
  const ok = mode !== "invalid";
  if (!ok) failures += 1;
  rows.push({
    file: name,
    size: `${info.w}x${info.h}`,
    ratio: ratio.toFixed(6),
    slot_delta: slotDelta.toFixed(6),
    portrait_delta: portraitDelta.toFixed(6),
    mode,
    colorspace: info.colorspace,
    ok,
  });
}

console.log(JSON.stringify({
  directory: slotDir,
  count: files.length,
  accepted_ratios: {
    slot: Number(slotRatio.toFixed(6)),
    portrait: Number(portraitRatio.toFixed(6)),
  },
  tolerance,
  failures,
  rows,
}, null, 2));

if (failures > 0) {
  process.exit(1);
}
