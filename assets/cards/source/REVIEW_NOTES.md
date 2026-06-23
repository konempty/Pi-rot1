Slot-ratio review notes.

Current objective:
- Preserve the existing illustration content as much as possible while adapting all inner images to the art-slot ratio.
- Final no-text cards have been rendered from the current candidate set.

Verified:
- `assets/tarot-cards-imagegen/inner-slot-ratio/` contains 78 PNG candidates.
- `tools/verify_slot_ratio_images.mjs` passes with 0 failures.
- Contact sheets were generated under `assets/tarot-cards-imagegen/contact-sheets/`.
- `slot_ratio_before_after_completed.png` and `.html` were regenerated for all 78 cards.
- 2026-06-21 retry pass resolved the previously open `57`, `64`, and `74` review items.

Subagent review and local verification:
- `30_wands_nine.png`: subagent flagged possible low wand count; enlarged review shows nine visible wands. No action.
- `40_cups_five.png`: subagent flagged out-of-family darkness. This is acceptable as Five of Cups emotional tone. No action.
- `44_cups_nine.png`: subagent flagged inflated cup count; enlarged review shows 5 + 4 = 9 cups. No action.
- `57_swords_eight.png`: regenerated after one wrong-count retry. Current candidate has four visible swords on the left and four visible swords on the right, exactly eight total.
- `58_swords_nine.png`: regenerated after user correctly identified the curtain ornament was not a sword. Earlier retries were superseded; accepted retry3 shows exactly nine wall swords in three groups of three, with curtain tassels/feathers reading as decoration rather than swords.
- `60_swords_page.png`: brighter than surrounding Swords, but acceptable for Page court energy. No action unless user wants stricter suit mood.
- `61_swords_knight.png`: dynamic horse/rider anatomy is busy but acceptable. No action unless user wants stricter anatomy refinement.
- `64_pentacles_ace.png`: symbol refined with ImageGen. Current candidate keeps exactly one coin and a clearer Pi Network-inspired emblem.
- `25_wands_four.png`: regenerated after user feedback that the previous character looked too young compared with Wands Three/Five. Current candidate keeps four wands and reads slightly more mature.
- `38_cups_three.png`: edited after user clarification that Cups Three was the Cups card with the wrong Pi icon. Current candidate keeps exactly three cups and improves the Pi-emblem styling.
- `71_pentacles_eight.png`: edited after user feedback that it showed eight completed table coins plus one in progress. Current candidate shows seven completed coins plus one coin being crafted, exactly eight total.
- `72_pentacles_nine.png`: regenerated after user feedback that the local expansion looked horizontally stretched. Current candidate preserves the nine-coin layout without the stretched look.
- `73_pentacles_ten.png`: ten coins correct; animal is stylized but acceptable. No action.
- `74_pentacles_page.png`: symbol refined with ImageGen. Current candidate keeps exactly one coin and a clearer Pi Network-inspired emblem.
- `77_pentacles_king.png`: relaxed hand is slightly soft but acceptable. No action.

ImageGen retry results:
- Earlier unrelated infographic failures are kept under `assets/tarot-cards-imagegen/attempts/slot-ratio/failed/` for reference.
- After user confirmation to retry, all three target cards produced normal card illustrations.
- Accepted retry artifacts:
  - `assets/tarot-cards-imagegen/attempts/slot-ratio/57_swords_eight_fix_retry2_candidate.png`
  - `assets/tarot-cards-imagegen/attempts/slot-ratio/58_swords_nine_count_retry3_candidate.png`
  - `assets/tarot-cards-imagegen/attempts/slot-ratio/64_pentacles_ace_symbol_retry1_candidate.png`
  - `assets/tarot-cards-imagegen/attempts/slot-ratio/74_pentacles_page_symbol_retry1_candidate.png`
  - `assets/tarot-cards-imagegen/attempts/slot-ratio/25_wands_four_mature_retry2_candidate.png`
  - `assets/tarot-cards-imagegen/attempts/slot-ratio/38_cups_three_pi_retry1_candidate.png`
  - `assets/tarot-cards-imagegen/attempts/slot-ratio/71_pentacles_eight_count_retry3_candidate.png`
  - `assets/tarot-cards-imagegen/attempts/slot-ratio/72_pentacles_nine_regen_retry2_candidate.png`

Local-fix attempts:
- `64_pentacles_ace.png` / `74_pentacles_page.png`: deterministic ImageMagick symbol overlays were generated under `assets/tarot-cards-imagegen/attempts/slot-ratio/local-fixes/`, but rejected because the overlay looked too graphic and lowered the coin quality.
- `57_swords_eight.png`: compared the original `assets/tarot-cards-imagegen/inner/57_swords_eight.png` and the slot-ratio candidate. The excess sword count is already present in the original image, not introduced by ratio conversion. Local removal is not recommended because swords, ribbons, and background architecture overlap heavily.

Prepared review-fix assets:
- Open issue card sheet: `assets/tarot-cards-imagegen/contact-sheets/open_review_issue_cards.png`
- Pi symbol local-fix comparison: `assets/tarot-cards-imagegen/contact-sheets/open_review_pi_symbol_comparison.png`
- Retry prompts:
  - `assets/tarot-cards-imagegen/prompts/review-fixes/57_swords_eight_fix.txt`
  - `assets/tarot-cards-imagegen/prompts/review-fixes/58_swords_nine_count_fix.txt`
  - `assets/tarot-cards-imagegen/prompts/review-fixes/64_pentacles_ace_symbol_fix.txt`
  - `assets/tarot-cards-imagegen/prompts/review-fixes/74_pentacles_page_symbol_fix.txt`
  - `assets/tarot-cards-imagegen/prompts/review-fixes/25_wands_four_mature_fix.txt`
  - `assets/tarot-cards-imagegen/prompts/review-fixes/38_cups_three_pi_fix.txt`
  - `assets/tarot-cards-imagegen/prompts/review-fixes/71_pentacles_eight_count_fix.txt`
  - `assets/tarot-cards-imagegen/prompts/review-fixes/72_pentacles_nine_unstretch_fix.txt`
