#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cardsBase = path.join(root, "assets", "cards");
const metadataPath = path.join(cardsBase, "metadata.json");
const layersDir = path.join(cardsBase, "prompts", "layers");
const currentDir = path.join(cardsBase, "prompts", "current");

function usage() {
  console.error("Usage: node tools/compose_imagegen_prompt.mjs [all|<filename>.png ...]");
}

function readMetadata() {
  const data = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  return Array.isArray(data) ? data : data.cards || data.deck || [];
}

function readRequired(file) {
  if (!fs.existsSync(file)) throw new Error(`Missing prompt layer: ${file}`);
  return fs.readFileSync(file, "utf8").trim();
}

function arcanaPathFor(card) {
  const name = card.filename.replace(/\.png$/i, ".txt");
  return card.arcana === "major"
    ? path.join(layersDir, "arcana", "major", name)
    : path.join(layersDir, "arcana", card.suit, name);
}

function compose(card) {
  const parts = [readRequired(path.join(layersDir, "root.txt"))];
  if (card.arcana !== "major") {
    parts.push(readRequired(path.join(layersDir, "suits", `${card.suit}.txt`)));
  }
  parts.push(readRequired(arcanaPathFor(card)));
  return `${parts.filter(Boolean).join("\n\n")}\n`;
}

const args = process.argv.slice(2);
if (!args.length) {
  usage();
  process.exit(2);
}

const cards = readMetadata();
const byBase = new Map(cards.map((card) => [card.filename.replace(/\.png$/i, ""), card]));
const targets = args.includes("all")
  ? cards
  : args.map((arg) => {
      const key = arg.replace(/\.png$/i, "");
      const card = byBase.get(key);
      if (!card) throw new Error(`Unknown card filename: ${arg}`);
      return card;
    });

fs.mkdirSync(currentDir, { recursive: true });
const written = [];
for (const card of targets) {
  const out = path.join(currentDir, card.filename.replace(/\.png$/i, ".txt"));
  fs.writeFileSync(out, compose(card));
  written.push(out);
}

console.log(JSON.stringify({
  count: written.length,
  currentDir,
  written,
}, null, 2));
