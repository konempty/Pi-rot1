Slot-ratio generation status.

Target art-slot ratio: 817:1014.

Completed candidates:
- Major 00-21
- Wands Ace-King
- Cups Ace-King
- Swords Ace-King
- Pentacles Ace-King

Prepared retry inputs:
- Padded edit inputs for `60_swords_page.png` through `77_pentacles_king.png` are in `assets/tarot-cards-imagegen/attempts/slot-ratio/edit-inputs/`.
- Per-card retry prompts for `60_swords_page.png` through `77_pentacles_king.png` are in `assets/tarot-cards-imagegen/prompts/slot-ratio/`.

ImageGen pause rule:
- If output is unrelated infographic/diagram content for three different cards, pause ImageGen and wait for user confirmation.
- If output is a plausible card image but has wrong object count, weak composition, wrong Pi icon, or anatomy issues, treat it as that arcana needing regeneration, not a global ImageGen failure.

Current status:
- User confirmed ImageGen retry on 2026-06-21.
- `57_swords_eight.png` was corrected to exactly eight visible swords.
- `64_pentacles_ace.png` and `74_pentacles_page.png` were refined so the single coin symbol reads more clearly as a Pi Network-inspired emblem.
- `25_wands_four.png` was regenerated so the protagonist reads slightly more mature and closer to Wands Three/Five while preserving four wands.
- `38_cups_three.png` was edited to correct the visible Pi emblems while preserving exactly three cups.
- `58_swords_nine.png` was regenerated again after the curtain ornament clarification. The accepted retry3 has exactly nine clearly countable swords, arranged three groups of three.
- `71_pentacles_eight.png` was edited to show exactly eight coins total: seven completed coins plus one being crafted.
- `72_pentacles_nine.png` was regenerated to remove the horizontally stretched/local-expand look while preserving nine coins.
- Earlier unrelated infographic failures remain saved under `assets/tarot-cards-imagegen/attempts/slot-ratio/failed/` for reference.

Current candidate set:
- 78 files exist in `assets/tarot-cards-imagegen/inner-slot-ratio/`.
- `tools/verify_slot_ratio_images.mjs` reports 78 files, 0 ratio failures.

Open review items before text rendering:
- No known blocking issues after the 2026-06-21 retry pass.
- Final no-text cards have been rendered; wait for user visual review before adding text.
