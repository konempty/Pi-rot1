#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";

const root = path.resolve(import.meta.dirname, "..");
const base = path.join(root, "assets", "cards");
const labelsPath = path.join(base, "labels", "card-labels.json");
const noTextDir = path.join(base, "output", "no-text");
const webpDir = path.join(base, "output", "text-webp");
const tmpDir = path.join(base, "output", `.text-tmp-${process.pid}`);

const fontPath = "/System/Library/Fonts/Supplemental/Bodoni 72.ttc";
const inkColor = "#3A1B61";
const renderScale = 4;
const textBox = { x: 112, y: 1206, w: 800, h: 148 };
const fit = { maxW: 735, maxH: 74 };
const strokePx = 0.7;
const webpQuality = 82;
const concurrency = Math.max(
  1,
  Number(process.env.SCRIPT_TEXT_JOBS || Math.min(os.availableParallelism?.() ?? 4, 6)),
);

const execFileAsync = promisify(execFile);

function runMagick(args, options = {}) {
  return execFileSync("magick", args, { encoding: "utf8", ...options });
}

async function runMagickAsync(args, options = {}) {
  const result = await execFileAsync("magick", args, { encoding: "utf8", ...options });
  return result.stdout;
}

function ensureCleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function measure(label, pointSize) {
  const tmp = path.join(tmpDir, `measure_${process.pid}.png`);
  runMagick([
    "-background",
    "none",
    "-fill",
    inkColor,
    "-stroke",
    inkColor,
    "-strokewidth",
    String(Math.max(1, Math.round(strokePx * renderScale))),
    "-font",
    fontPath,
    "-pointsize",
    String(pointSize * renderScale),
    `label:${label}`,
    "-trim",
    "+repage",
    tmp,
  ]);
  const [w, h] = runMagick(["identify", "-format", "%w %h", tmp]).trim().split(/\s+/).map(Number);
  fs.rmSync(tmp, { force: true });
  return { w: w / renderScale, h: h / renderScale };
}

function findPointSize(labels) {
  let lo = 12;
  let hi = 120;
  let best = lo;
  for (let i = 0; i < 18; i += 1) {
    const mid = (lo + hi) / 2;
    const tooLarge = labels.some((item) => {
      const size = measure(item.label, mid);
      return size.w > fit.maxW || size.h > fit.maxH;
    });
    if (tooLarge) {
      hi = mid;
    } else {
      best = mid;
      lo = mid;
    }
  }
  return Math.floor(best * 10) / 10;
}

async function renderLabelLayer(item, pointSize) {
  const largeLayer = path.join(tmpDir, `large_${item.filename}`);
  const layer = path.join(tmpDir, `layer_${item.filename}`);
  await runMagickAsync([
    "-size",
    `${textBox.w * renderScale}x${textBox.h * renderScale}`,
    "xc:none",
    "-font",
    fontPath,
    "-pointsize",
    String(pointSize * renderScale),
    "-fill",
    inkColor,
    "-stroke",
    inkColor,
    "-strokewidth",
    String(Math.max(1, Math.round(strokePx * renderScale))),
    "-gravity",
    "center",
    "-annotate",
    "+0+0",
    item.label,
    largeLayer,
  ]);
  await runMagickAsync([
    largeLayer,
    "-filter",
    "Lanczos",
    "-resize",
    `${textBox.w}x${textBox.h}`,
    layer,
  ]);
  return layer;
}

async function renderCard(item, pointSize) {
  const source = path.join(noTextDir, item.filename);
  if (!fs.existsSync(source)) throw new Error(`Missing no-text card: ${source}`);
  const layer = await renderLabelLayer(item, pointSize);
  const webpOutput = path.join(webpDir, item.filename.replace(/\.png$/i, ".webp"));
  await runMagickAsync([
    source,
    layer,
    "-geometry",
    `+${textBox.x}+${textBox.y}`,
    "-compose",
    "over",
    "-composite",
    "-define",
    "webp:lossless=false",
    "-define",
    "webp:method=6",
    "-define",
    "webp:alpha-quality=100",
    "-quality",
    String(webpQuality),
    webpOutput,
  ]);
  return { webp: webpOutput };
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

const targets = process.argv.slice(2);
const renderAll = targets.length === 0 || targets.includes("all");
const targetSet = new Set(targets.map((target) => target.replace(/\.png$/i, "")));
const data = JSON.parse(fs.readFileSync(labelsPath, "utf8"));
const labels = renderAll
  ? data.labels
  : data.labels.filter((item) => targetSet.has(item.filename.replace(/\.png$/i, "")));

if (!labels.length) {
  console.error("Usage: node tools/render_script_text_deck.mjs [filename ...|all]");
  process.exit(2);
}

fs.mkdirSync(webpDir, { recursive: true });
ensureCleanDir(tmpDir);

const pointSize = findPointSize(data.labels);
const written = await mapLimit(labels, concurrency, (item) => renderCard(item, pointSize));

console.log(JSON.stringify({
  count: written.length,
  webpDir,
  fontPath,
  inkColor,
  pointSize,
  textBox,
  fit,
  webpQuality,
  concurrency,
  written,
}, null, 2));

fs.rmSync(tmpDir, { recursive: true, force: true });
