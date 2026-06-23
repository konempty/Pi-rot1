#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const cardsBase = path.join(root, "assets", "cards");
const metadataPath = path.join(cardsBase, "metadata.json");
const currentDir = path.join(cardsBase, "prompts", "current");
const layersDir = path.join(cardsBase, "prompts", "layers");

const genericScene = "Scene/backdrop: match the card scene; fantasy environment with depth, atmosphere, and polished detail";
const genericSubject = "Subject: tarot archetype or suit-story character described in the primary request";
const genericPalette = "Color palette: deep purple, lavender, warm gold, cream highlights, with suit-specific accent colors";
const baseConstraints =
  "Constraints: inner illustration only; no tarot card frame, no border, no nameplate, no UI, no poster layout. Preserve classic tarot symbolism while making it Pi-inspired through purple-gold coins, charms, seals, and square sparkles.";
const baseAvoid =
  "Avoid: full tarot card, card frame, border, nameplate, caption, typography, English text, Korean text, rank text, number text, watermark, logo wordmark, blurry emblem, pig-nose symbol, two round nostrils, Roman numeral II, number 2, malformed pi mark, bulbous balloon-shaped pi hook, rounded swollen pi right stroke, extra fingers, distorted face, low resolution";

const rootPrompt = `Use case: illustration-story
Asset type: 1024x1536 tarot inner illustration source art, later cropped into the fixed card art slot
Style/medium: high-quality kawaii fantasy, polished anime-inspired tarot illustration, youthful premium mobile tarot service mood, soft cinematic lighting, clean readable silhouettes, rich detail
Composition/framing: vertical inner illustration only, centered and readable, important faces and symbols away from the edges, generous safe margin
Color palette: deep purple, lavender, warm gold, cream highlights, with suit-specific accent colors
Materials/textures: polished gold coins and jewelry, soft cloth, glowing magic, painterly anime detail
Text (verbatim): none. No English words, no Korean, no card titles, no rank labels, no numbers, no watermark, no signature. Decorative pi-emblem medallions are allowed.
Pi emblem accuracy: Whenever a coin, pendant, medallion, charm, seal, or emblem shows a Pi-inspired mark, use the saved Pi Network icon reference. Make a clear lowercase pi emblem with a mostly straight horizontal top bar, two vertical stems connected to the bar, two small square dots above the bar, and a short squared upward hook at the far right end. The right hook should be a crisp raised corner, not a round inflated balloon or bulb. The mark must be angular and glyph-like, not a pig nose, not two round nostrils, not two rounded parallel rods, not the Roman numeral II, not the number 2, not a horseshoe, and not a generic omega shape.
Global constraints: inner illustration only; no tarot card frame, no border, no nameplate, no UI, no poster layout. Preserve classic tarot symbolism while making it Pi-inspired through purple-gold coins, charms, seals, and square sparkles.
Global avoid: full tarot card, card frame, border, nameplate, caption, typography, English text, Korean text, rank text, number text, watermark, logo wordmark, blurry emblem, pig-nose symbol, two round nostrils, Roman numeral II, number 2, malformed pi mark, bulbous balloon-shaped pi hook, rounded swollen pi right stroke, extra fingers, distorted face, low resolution`;

const suitPrompts = {
  wands: `Suit prompt: Wands
Suit story continuity: One continuous fire-and-initiative journey. A young male purple-cloaked maker discovers a living wand spark at dawn, builds momentum with friends through a bright day, faces rivalry and pressure near sunset, then becomes a mature leader of a glowing creative guild by night.
Protagonist continuity: For Ace through Ten, keep the main Wands protagonist male, dark violet-black-haired, wearing a deep purple guild cloak, and visually continuous unless the arcana prompt explicitly says otherwise.
Subtle alchemical element: Fire element should feel natural and not excessive: warm rim light, ember motes, safe wand sparks, sunset glow, creative heat, sunlight glow where appropriate, and small flame-like accents woven into the action.
Suit visual language: guild-city architecture, warm gold light, purple banners, creative tools, wand sparks, refined fantasy-oil polish, and leadership growth. Countable wands must be exact when the arcana rank requires a number.
Court card direction: Page, Knight, Queen, and King may stand outside the Ace-through-Ten plot; prioritize the court role's traditional meaning, personality, and fire element while keeping visual harmony with the suit.`,

  cups: `Suit prompt: Cups
Suit story continuity: One continuous Ace-through-Ten water-and-heart story. A lavender-haired seer discovers a golden cup spring, learns trust and community, suffers emotional loss, recovers through memory and discernment, leaves shallow comfort to find the true source, then returns that water to a chosen-family festival. Court cards can stand outside this plot and should prioritize their traditional meanings.
Protagonist continuity: For Ace through Ten, keep the Cups protagonist lavender-haired with a pearl-lavender cloak and gentle emotional presence unless the arcana prompt explicitly says otherwise.
Subtle alchemical element: Water element should feel natural and not excessive: streams, fountains, reflections, droplets, mist, moonlit pools, soft wave shapes, and emotional flow woven into the scene.
Suit visual language: cups, fountains, moonlit water, pearls, lilies, reflective surfaces, gentle lavender-gold palette, and emotional storytelling. Countable cups must be exact when the arcana rank requires a number.
Court card direction: Page, Knight, Queen, and King may stand outside the Ace-through-Ten plot; prioritize the court role's traditional meaning, personality, and water element while keeping visual harmony with the suit.`,

  swords: `Suit prompt: Swords
Suit story continuity: One continuous Ace-through-Ten air-and-clarity story. A silver-haired sky-temple student awakens to truth, faces a difficult choice, learns that sharp truth can wound, rests and recovers, loses friends through hollow victory, leaves for calmer air, uses strategy, confronts self-imposed restriction and anxiety, then releases an old identity at pre-dawn. Court cards can stand outside this plot and should prioritize their traditional meanings.
Protagonist continuity: For Ace through Ten, keep the Swords protagonist silver-haired with sky-temple visual language and a refined purple-white palette unless the arcana prompt explicitly says otherwise.
Subtle alchemical element: Air element should feel natural and not excessive: wind ribbons, clouds, open sky, feathers, drifting petals, light blades, clear atmosphere, and motion lines woven into the scene.
Suit visual language: sky temples, windows, feathers, wind, clear moonlight, violet-white blades, disciplined poses, and clarity under pressure. Countable swords must be exact and unmistakable when the arcana rank requires a number.
Court card direction: Page, Knight, Queen, and King may stand outside the Ace-through-Ten plot; prioritize the court role's traditional meaning, personality, and air element while keeping visual harmony with the suit.`,

  pentacles: `Suit prompt: Pentacles
Suit story continuity: One continuous Ace-through-Ten earth-and-value story. An auburn-haired young merchant-gardener receives a single Pi coin seed, learns to balance resources, builds value with collaborators, clings too tightly to early success, passes through hardship, restores fairness through generosity, waits for planted value to grow, masters craft through repetition, enjoys earned independence, then turns prosperity into lasting multi-generation city legacy. Court cards can stand outside this plot and should prioritize their traditional meanings.
Protagonist continuity: For Ace through Ten, keep the Pentacles protagonist auburn-haired with merchant-gardener styling, grounded posture, and practical earth-gold palette unless the arcana prompt explicitly says otherwise.
Subtle alchemical element: Earth element should feel natural and not excessive: soil, gardens, roots, stone, market produce, minerals, harvest light, and grounded textures woven into the scene.
Suit visual language: Pi coin seeds, gardens, stone markets, craft tables, harvest light, rooted architecture, prosperity earned through work, and grounded gold-green accents. Countable pentacles/coins must be exact when the arcana rank requires a number.
Court card direction: Page, Knight, Queen, and King may stand outside the Ace-through-Ten plot; prioritize the court role's traditional meaning, personality, and earth element while keeping visual harmony with the suit.`,
};

function readMetadata() {
  const data = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  return Array.isArray(data) ? data : data.cards || data.deck || [];
}

function parsePrompt(text) {
  const map = new Map();
  for (const line of text.trim().split(/\n+/)) {
    const match = line.match(/^([^:]+):\s*(.*)$/);
    if (!match) continue;
    map.set(match[1], `${match[1]}: ${match[2]}`.trim());
  }
  return map;
}

function arcanaDirFor(card) {
  return card.arcana === "major"
    ? path.join(layersDir, "arcana", "major")
    : path.join(layersDir, "arcana", card.suit);
}

function stripBaseAvoid(line) {
  if (!line || line === baseAvoid) return null;
  if (line.startsWith(baseAvoid + ",")) {
    return `Card-specific avoid: ${line.slice(baseAvoid.length + 1).trim()}`;
  }
  return line.replace(/^Avoid:/, "Card-specific avoid:");
}

function arcanaPromptFor(card, parsed) {
  const lines = [];
  const push = (value) => {
    if (value && !lines.includes(value)) lines.push(value);
  };

  push(parsed.get("Primary request"));
  push(parsed.get("Card identity for scene only"));

  const scene = parsed.get("Scene/backdrop");
  if (scene && scene !== genericScene) push(scene);

  const subject = parsed.get("Subject");
  if (subject && subject !== genericSubject) push(subject);

  const palette = parsed.get("Color palette");
  if (palette && palette !== genericPalette) push(palette);

  const subtle = parsed.get("Subtle alchemical element");
  const suit = card.suit && suitPrompts[card.suit];
  if (subtle && (!suit || !suit.includes(subtle))) {
    push(subtle.replace(/^Subtle alchemical element:/, "Arcana-specific element note:"));
  }

  push(parsed.get("Sword count rule"));

  const constraints = parsed.get("Constraints");
  if (constraints && constraints !== baseConstraints) {
    push(constraints.replace(/^Constraints:/, "Card-specific constraints:"));
  }

  const avoid = stripBaseAvoid(parsed.get("Avoid"));
  push(avoid);

  return `${lines.join("\n")}\n`;
}

fs.rmSync(layersDir, { recursive: true, force: true });
fs.mkdirSync(path.join(layersDir, "suits"), { recursive: true });
fs.mkdirSync(path.join(layersDir, "arcana", "major"), { recursive: true });
for (const suit of Object.keys(suitPrompts)) {
  fs.mkdirSync(path.join(layersDir, "arcana", suit), { recursive: true });
}

fs.writeFileSync(path.join(layersDir, "root.txt"), `${rootPrompt}\n`);
for (const [suit, text] of Object.entries(suitPrompts)) {
  fs.writeFileSync(path.join(layersDir, "suits", `${suit}.txt`), `${text}\n`);
}

const cards = readMetadata();
for (const card of cards) {
  const currentPath = path.join(currentDir, card.filename.replace(/\.png$/i, ".txt"));
  const parsed = parsePrompt(fs.readFileSync(currentPath, "utf8"));
  const outDir = arcanaDirFor(card);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, card.filename.replace(/\.png$/i, ".txt")), arcanaPromptFor(card, parsed));
}

console.log(JSON.stringify({
  root: path.join(layersDir, "root.txt"),
  suits: Object.keys(suitPrompts).length,
  arcana: cards.length,
}, null, 2));
