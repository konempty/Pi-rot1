---
name: pi-tarot-card-pipeline
description: Project-specific workflow for the PI tarot deck. Use when Codex is asked to regenerate one or more tarot card illustrations, review PI-logo/card-art correctness, compare minor arcana against the same suit, render fixed-template no-text cards, add scripted lower nameplate text, export final PNG/WebP cards with alpha, or validate outputs in /Users/kakao/Documents/PI 타로/assets/cards.
---

# PI Tarot Card Pipeline

Use this skill for `/Users/kakao/Documents/PI 타로`. Use the system `imagegen` skill for image creation. Do not use OpenAI API keys, custom SDK scripts, or CLI fallback unless the user explicitly asks for that path.

## Paths

- Metadata: `assets/cards/metadata.json`
- Source art: `assets/cards/source/<filename>.png`
- Prompt root layer: `assets/cards/prompts/layers/root.txt`
- Prompt suit layers: `assets/cards/prompts/layers/suits/<suit>.txt`
- Prompt arcana layers: `assets/cards/prompts/layers/arcana/<major-or-suit>/<filename>.txt`
- Current composed prompts: `assets/cards/prompts/current/<filename>.txt`
- Revision prompts: `assets/cards/prompts/revisions/<date-or-topic>/<filename>.txt`
- Labels: `assets/cards/labels/card-labels.json`
- No-text cards: `assets/cards/output/no-text/<filename>.png`
- Final labeled cards: `assets/cards/output/text-webp/<filename>.webp`
- Card back: `assets/cards/output/card-back.webp`
- Template: `assets/cards/template/card-template-overlay.png`, `assets/cards/template/art-slot-mask.png`

## Scripts

- Save ImageGen output: `node tools/save_imagegen_result.mjs <out.png> --after <UTC timestamp> --sessions 160`
- Compose ImageGen prompt: `node tools/compose_imagegen_prompt.mjs <filename>.png`
- Compose all ImageGen prompts: `node tools/compose_imagegen_prompt.mjs all`
- Split legacy current prompts into layers: `node tools/split_prompt_layers.mjs`
- Verify source art: `node tools/verify_slot_ratio_images.mjs`
- Render no-text deck: `node tools/render_imagegen_no_text_magick.mjs`
- Render all labels: `node tools/render_script_text_deck.mjs all`
- Render selected labels: `node tools/render_script_text_deck.mjs <filename1>.png <filename2>.png`
- Make contact sheets: `node tools/make_slot_ratio_contact_sheets.mjs`
- Render card back: `python3 tools/render_card_back.py`

Do not use removed legacy scripts, ImageGen text-compositing helpers, old labeled-card outputs, or pre-cleanup asset paths.

Do not manually edit `prompts/current`; it is a generated prompt output. Edit `prompts/layers/*` and rebuild `prompts/current` with `tools/compose_imagegen_prompt.mjs`.

## Workflow

1. Identify the card from `metadata.json`; do not infer filenames from memory.
2. Edit the layered prompt source:
   - global changes go in `prompts/layers/root.txt`
   - minor-suit continuity or element changes go in `prompts/layers/suits/<suit>.txt`
   - card-specific changes go in `prompts/layers/arcana/<major-or-suit>/<filename>.txt`
3. Save a copy of the revised arcana prompt under `prompts/revisions/<date-or-topic>/` when changing a card.
4. Run `node tools/compose_imagegen_prompt.mjs <filename>.png` to rebuild `prompts/current/<filename>.txt`.
5. Read the composed prompt from `prompts/current/<filename>.txt` and use that exact combined prompt for ImageGen.
6. Capture a UTC timestamp before ImageGen: `date -u +%Y-%m-%dT%H:%M:%SZ`.
7. Generate inner illustration only: no full card, frame, border, nameplate, title, rank label, watermark, signature, Korean text, or English text.
8. Save the generated result into a project path with `tools/save_imagegen_result.mjs`.
9. Review the candidate with `view_image` before replacing `source/<filename>.png`.
10. Copy the accepted candidate to `assets/cards/source/<filename>.png`.
11. Run the no-text renderer, then the scripted text renderer.
12. Review the changed final WebP and verify dimensions and alpha.

## First Review Checklist

Check every candidate:

- image is an inner illustration, not an infographic, UI, full tarot card, or text poster
- image is `1024x1536`; regenerate if the ratio is materially wrong
- important faces, hands, objects, and PI emblems are away from edges enough for template masking
- PI emblems are not pig-nose shapes, Roman numeral II, generic mathematical pi, or swollen balloon-like marks
- hands, arms, faces, held objects, mounts, clothing, and occlusion are plausible
- countable suit objects are correct and no extra object can reasonably be counted as the suit item
- no unwanted Korean/English words, labels, numbers, signatures, or watermarks

For minor arcana, compare against the same suit before accepting:

- Ace through Ten should read as one continuous suit story with clear progression
- protagonist age, hair, outfit family, mood, palette, and rendering quality should not abruptly diverge from neighboring numbered cards unless intentional
- suit element should be present but not excessive: Wands/fire, Cups/water, Swords/air, Pentacles/earth
- court cards do not need strict plot continuity, but should match the suit palette, polish, and PI tarot style

## Final Validation

Use these checks after rendering:

```bash
find assets/cards/output/no-text -maxdepth 1 -name '*.png' | wc -l
find assets/cards/output/text-webp -maxdepth 1 -name '*.webp' | wc -l
identify -format '%f %m %wx%h %[channels] %b\n' <changed files>
magick <changed-webp> -format '%[pixel:p{0,0}]\n' info:
```

Expected transparent corner: `srgba(0,0,0,0)`.

If ImageGen produces unrelated/infographic/broken images across 2-3 clearly different card prompts, stop and report possible image service instability. Do not switch to API-key generation without explicit user approval.
