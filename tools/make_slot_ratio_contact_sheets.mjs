#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const inputDir = path.join(root, "assets/cards/source");
const outDir = path.join(root, "assets/cards/review");
const tmpDir = path.join(outDir, ".contact-tmp");

const groups = [
  { name: "slot_ratio_all_78", start: 0, end: 77, cols: 13, width: 140, height: 174 },
  { name: "slot_ratio_major", start: 0, end: 21, cols: 11, width: 170, height: 211 },
  { name: "slot_ratio_wands", start: 22, end: 35, cols: 7, width: 190, height: 236 },
  { name: "slot_ratio_cups", start: 36, end: 49, cols: 7, width: 190, height: 236 },
  { name: "slot_ratio_swords", start: 50, end: 63, cols: 7, width: 190, height: 236 },
  { name: "slot_ratio_pentacles", start: 64, end: 77, cols: 7, width: 190, height: 236 },
];

function listFiles() {
  return fs
    .readdirSync(inputDir)
    .filter((file) => file.endsWith(".png"))
    .sort();
}

function ensureCleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function runMagick(args) {
  execFileSync("magick", args, { stdio: "inherit" });
}

fs.mkdirSync(outDir, { recursive: true });
ensureCleanDir(tmpDir);

const files = listFiles();
const written = [];

for (const group of groups) {
  const selected = files.slice(group.start, group.end + 1);
  if (selected.length !== group.end - group.start + 1) {
    throw new Error(`Group ${group.name} expected ${group.end - group.start + 1} files, got ${selected.length}`);
  }

  const rowPaths = [];
  for (let rowStart = 0; rowStart < selected.length; rowStart += group.cols) {
    const rowFiles = selected.slice(rowStart, rowStart + group.cols);
    const thumbs = [];

    for (const file of rowFiles) {
      const thumb = path.join(tmpDir, `${group.name}_${rowStart}_${file}`);
      runMagick([
        path.join(inputDir, file),
        "-resize",
        `${group.width}x${group.height}`,
        "-background",
        "#171325",
        "-gravity",
        "center",
        "-extent",
        `${group.width}x${group.height}`,
        thumb,
      ]);
      thumbs.push(thumb);
    }

    const rowPath = path.join(tmpDir, `${group.name}_row_${rowPaths.length}.png`);
    runMagick([...thumbs, "+append", rowPath]);
    rowPaths.push(rowPath);
  }

  const outPath = path.join(outDir, `${group.name}.png`);
  runMagick([...rowPaths, "-append", outPath]);
  written.push(path.relative(root, outPath));
}

console.log(JSON.stringify({ count: written.length, written }, null, 2));
