#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(import.meta.dirname, "..");
const base = path.join(root, "assets", "cards");
const inputDir = path.join(base, "source");
const finalDir = path.join(base, "output");
const outDir = path.join(finalDir, "no-text");
const previewDir = path.join(base, "previews");
const templateDir = path.join(base, "template");
const metadataPath = path.join(base, "metadata.json");
const overlay = path.join(templateDir, "card-template-overlay.png");
const mask = path.join(templateDir, "art-slot-mask.png");
const tmpDir = path.join(finalDir, ".no-text-tmp");

const cardW = 1024;
const cardH = 1536;

function runMagick(args, options = {}) {
  return execFileSync("magick", args, { encoding: "utf8", ...options });
}

function parseGeometry(geometry) {
  const match = geometry.trim().match(/^(\d+)x(\d+)\+(\d+)\+(\d+)$/);
  if (!match) throw new Error(`Unexpected mask geometry: ${geometry}`);
  const [, w, h, x, y] = match;
  return { w: Number(w), h: Number(h), x: Number(x), y: Number(y) };
}

function ensureCleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function makeContactSheet(files) {
  const cols = 8;
  const tw = 128;
  const th = 192;
  const pad = 16;
  const rows = Math.ceil(files.length / cols);
  const sheet = path.join(previewDir, "imagegen-no-text-contact-sheet.png");
  const thumbs = path.join(tmpDir, "thumbs");
  ensureCleanDir(thumbs);

  const rowPaths = [];
  for (let rowStart = 0; rowStart < files.length; rowStart += cols) {
    const rowFiles = files.slice(rowStart, rowStart + cols);
    const thumbPaths = rowFiles.map((file, index) => {
      const out = path.join(thumbs, `${rowStart + index}_${path.basename(file)}`);
      runMagick([
        file,
        "-resize",
        `${tw}x${th}`,
        "-background",
        "#EFE7FF",
        "-gravity",
        "center",
        "-extent",
        `${tw}x${th}`,
        out,
      ]);
      return out;
    });
    const rowPath = path.join(thumbs, `row_${rowPaths.length}.png`);
    runMagick([
      "-size",
      `${cols * tw + (cols + 1) * pad}x${th + pad * 2}`,
      "xc:#EFE7FF",
      ...thumbPaths.flatMap((thumb, index) => [
        thumb,
        "-geometry",
        `+${pad + index * (tw + pad)}+${pad}`,
        "-composite",
      ]),
      rowPath,
    ]);
    rowPaths.push(rowPath);
  }

  runMagick([
    "-size",
    `${cols * tw + (cols + 1) * pad}x${rows * th + (rows + 1) * pad}`,
    "xc:#EFE7FF",
    ...rowPaths.flatMap((row, index) => [
      row,
      "-geometry",
      `+0+${index * (th + pad)}`,
      "-composite",
    ]),
    sheet,
  ]);
}

if (!fs.existsSync(metadataPath)) throw new Error(`Missing metadata: ${metadataPath}`);
if (!fs.existsSync(overlay)) throw new Error(`Missing template overlay: ${overlay}`);
if (!fs.existsSync(mask)) throw new Error(`Missing art slot mask: ${mask}`);

const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
const cards = metadata.cards;
if (!Array.isArray(cards) || cards.length !== 78) {
  throw new Error(`Expected 78 cards in metadata, got ${cards?.length ?? "none"}`);
}

ensureCleanDir(tmpDir);
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(previewDir, { recursive: true });

const slot = parseGeometry(runMagick(["identify", "-format", "%@", mask]));
const rendered = [];
const missing = [];

for (const card of cards) {
  const input = path.join(inputDir, card.filename);
  if (!fs.existsSync(input)) {
    missing.push(card.filename);
    continue;
  }

  const fitted = path.join(tmpDir, `fit_${card.filename}`);
  const masked = path.join(tmpDir, `masked_${card.filename}`);
  const output = path.join(outDir, card.filename);

  runMagick([
    input,
    "-auto-orient",
    "-resize",
    `${slot.w}x${slot.h}^`,
    "-gravity",
    "center",
    "-extent",
    `${slot.w}x${slot.h}`,
    fitted,
  ]);

  runMagick([
    "-size",
    `${cardW}x${cardH}`,
    "xc:none",
    fitted,
    "-geometry",
    `+${slot.x}+${slot.y}`,
    "-composite",
    mask,
    "-alpha",
    "off",
    "-compose",
    "CopyOpacity",
    "-composite",
    masked,
  ]);

  runMagick([
    "-size",
    `${cardW}x${cardH}`,
    "xc:none",
    masked,
    "-composite",
    overlay,
    "-composite",
    "-define",
    "png:color-type=6",
    output,
  ]);
  rendered.push(output);
}

makeContactSheet(rendered);

const updated = {
  ...metadata,
  card_size: { width: cardW, height: cardH },
  art_box: { x: slot.x, y: slot.y, width: slot.w, height: slot.h },
  template_files: {
    mask,
    overlay,
  },
  generated_count: {
    no_text: rendered.length,
  },
  rendered_variant: "no-text",
  output_dirs: {
    no_text: outDir,
    source_art: inputDir,
  },
  missing_inner_images: missing,
};
fs.writeFileSync(metadataPath, `${JSON.stringify(updated, null, 2)}\n`);

console.log(JSON.stringify({
  rendered: rendered.length,
  missing,
  inputDir,
  outDir,
  contactSheet: path.join(previewDir, "imagegen-no-text-contact-sheet.png"),
  artBox: slot,
}, null, 2));

fs.rmSync(tmpDir, { recursive: true, force: true });
