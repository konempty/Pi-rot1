#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cardsBase = path.join(root, "assets", "cards");
const metadataPath = path.join(cardsBase, "metadata.json");
const labelsPath = path.join(cardsBase, "labels", "card-labels.json");
const cardImageDir = path.join(cardsBase, "output", "text-webp");
const cardBack = path.join(cardsBase, "output", "card-back.webp");
const publicTarotDir = path.join(root, "public", "tarot");
const publicCardsDir = path.join(publicTarotDir, "cards");
const srcDataDir = path.join(root, "src", "data");

function readCards() {
  const raw = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  return Array.isArray(raw) ? raw : raw.cards || raw.deck || [];
}

function romanFromLabel(label) {
  const match = label.match(/^([0IVXLCDM]+)\.\s+(.+)$/);
  return match ? match[1] : "";
}

fs.rmSync(publicCardsDir, { recursive: true, force: true });
fs.mkdirSync(publicCardsDir, { recursive: true });
fs.mkdirSync(srcDataDir, { recursive: true });

const labels = new Map(
  JSON.parse(fs.readFileSync(labelsPath, "utf8")).labels.map((item) => [item.filename, item.label]),
);

const manifest = readCards().map((card, index) => {
  const filename = card.filename.replace(/\.png$/i, ".webp");
  const source = path.join(cardImageDir, filename);
  if (!fs.existsSync(source)) throw new Error(`Missing card image: ${source}`);
  fs.copyFileSync(source, path.join(publicCardsDir, filename));
  const label = labels.get(card.filename) || card.name;
  return {
    id: index,
    filename,
    image: `tarot/cards/${filename}`,
    label,
    roman: romanFromLabel(label),
    name: card.name,
    arcana: card.arcana,
    suit: card.suit || null,
    rank: card.rank || null,
  };
});

if (!fs.existsSync(cardBack)) throw new Error(`Missing card back: ${cardBack}`);
fs.copyFileSync(cardBack, path.join(publicTarotDir, "card-back.webp"));

const json = `${JSON.stringify(manifest, null, 2)}\n`;
fs.writeFileSync(path.join(publicTarotDir, "card-manifest.json"), json);
fs.writeFileSync(path.join(srcDataDir, "tarot-cards.json"), json);

console.log(JSON.stringify({
  cards: manifest.length,
  publicCardsDir,
  cardBack: path.join(publicTarotDir, "card-back.webp"),
  manifest: path.join(srcDataDir, "tarot-cards.json"),
}, null, 2));
