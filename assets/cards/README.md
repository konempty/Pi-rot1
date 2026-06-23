# PI Tarot Cards

This is the active production asset folder for the Pi-inspired 78-card tarot deck.

## Pipeline

1. Generate inner illustration art only with the built-in ImageGen tool.
2. Edit prompt layers under `prompts/layers/`, then compose the current prompt:

   ```bash
   node tools/compose_imagegen_prompt.mjs <metadata filename>.png
   ```

3. Save accepted source art to `source/<metadata filename>.png`.
4. Render all no-text fronts:

   ```bash
   node tools/render_imagegen_no_text_magick.mjs
   ```

5. Render scripted lower nameplate text and alpha WebP outputs:

   ```bash
   node tools/render_script_text_deck.mjs all
   ```

## Structure

- `metadata.json`: card order, names, filenames, template geometry, and output paths.
- `source/`: accepted 1024x1536 inner illustration source art.
- `template/`: active fixed template files. Only `card-template-overlay.png` and `art-slot-mask.png` are required.
- `output/no-text/`: 78 card fronts without lower nameplate text.
- `output/text-webp/`: 78 final compressed WebP cards with scripted lower nameplate text and alpha.
- `output/card-back.webp`: matching compressed WebP card back with transparent outside corners.
- `labels/card-labels.json`: filename-to-label data for scripted nameplate rendering.
- `prompts/layers/root.txt`: root prompt shared by all 78 arcana.
- `prompts/layers/suits/`: suit prompts for Wands, Cups, Swords, and Pentacles. Major Arcana do not use this layer.
- `prompts/layers/arcana/`: one card-specific prompt file per arcana.
- `prompts/current/`: composed prompts generated from root + optional suit + arcana layers.
- `prompts/revisions/`: accepted revision prompts kept for regeneration history.
- `previews/`: current preview images.
- `review/`: current contact sheets.
- `back/`, `reference/`: card-back source and PI reference assets.

## Active Tools

- `tools/save_imagegen_result.mjs`
- `tools/compose_imagegen_prompt.mjs`
- `tools/split_prompt_layers.mjs`
- `tools/render_imagegen_no_text_magick.mjs`
- `tools/render_script_text_deck.mjs`
- `tools/verify_slot_ratio_images.mjs`
- `tools/make_slot_ratio_contact_sheets.mjs`
- `tools/render_card_back.py`

## Guardrails

All PI emblems should use the Pi Network-like mark: straight top bar, two square dots, two vertical stems, and a short squared upward hook on the far right. Avoid pig-nose marks, Roman numeral II, generic pi symbols, and rounded balloon-like right hooks.

For minor arcana, Ace through Ten should read as a continuous suit story. Court cards can stand outside the plot but should match the suit palette and polish.

Do not edit `prompts/current/` directly. Edit the appropriate file under `prompts/layers/`, then run `tools/compose_imagegen_prompt.mjs` for the affected card or `all`.
