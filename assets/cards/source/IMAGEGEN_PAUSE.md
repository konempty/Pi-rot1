ImageGen pause checkpoint.

Current completed candidate range:
- Major 00-21
- Wands Ace-King
- Cups Ace-King
- Swords Ace-Four

Current candidate count:
- 54 PNG files in `assets/tarot-cards-imagegen/inner-slot-ratio/`

Next card to generate:
- `54_swords_five.png`

Pause reason:
- Built-in ImageGen produced unrelated infographic outputs for three different cards in a row:
  - `54_swords_five`: unrelated drugs/medicine infographic
  - `55_swords_six`: unrelated calculus infographic
  - `56_swords_seven`: unrelated MBTI infographic
- A later user-approved retry also produced unrelated infographic outputs for three different cards in a row:
  - `54_swords_five`: unrelated greenhouse-effect infographic
  - `55_swords_six`: unrelated Indian dance infographic
  - `56_swords_seven`: unrelated photosynthesis infographic
- Per user instruction, generation must stop when three different card attempts all fail this way.
- Do not use OpenAI API keys, CLI fallback, or custom API scripts to bypass this.

Failed outputs saved for reference:
- `assets/tarot-cards-imagegen/attempts/slot-ratio/failed/54_swords_five_unrelated_drugs_infographic_attempt1.png`
- `assets/tarot-cards-imagegen/attempts/slot-ratio/failed/55_swords_six_unrelated_calculus_infographic_attempt1.png`
- `assets/tarot-cards-imagegen/attempts/slot-ratio/failed/56_swords_seven_unrelated_mbti_infographic_attempt1.png`
- `assets/tarot-cards-imagegen/attempts/slot-ratio/failed/54_swords_five_unrelated_greenhouse_effect_retry_v2.png`
- `assets/tarot-cards-imagegen/attempts/slot-ratio/failed/55_swords_six_unrelated_indian_dance_infographic_retry_v2.png`
- `assets/tarot-cards-imagegen/attempts/slot-ratio/failed/56_swords_seven_unrelated_photosynthesis_infographic_retry_v2.png`

Resume criteria:
- Resume only after the user explicitly confirms to try ImageGen again, or after a later user message clearly asks to retry.
- On resume, start with `54_swords_five.png`.
- If `54_swords_five.png` alone keeps failing but other unrelated cards are normal, skip it temporarily and continue later.
- If three different cards again produce unrelated outputs, stop again.

Important next-card constraints:
- `54_swords_five.png`: should have exactly five swords total: two held by the foreground protagonist and three lying on the ground. Keep the original windswept courtyard, two figures walking away, and non-stealing conflict mood.
- `55_swords_six.png`: should have exactly six upright swords mounted around the boat.
- `56_swords_seven.png`: original has too many swords; regenerate with exactly seven swords total, preferably six upright around the map table and one single sword in the lower foreground. Avoid theft imagery; keep strategy/planning mood.
Pause update 2026-06-20:

- Current accepted candidate count: 60.
- Accepted through: Swords Ace-Ten (`59_swords_ten.png`).
- Next candidate to retry: `60_swords_page.png`.
- Pause reason: three consecutive unrelated infographic outputs from built-in ImageGen on three different Swords court cards.
- Failed outputs saved:
  - `assets/tarot-cards-imagegen/attempts/slot-ratio/failed/60_swords_page_unrelated_plant_kingdom_infographic_attempt1.png`
  - `assets/tarot-cards-imagegen/attempts/slot-ratio/failed/61_swords_knight_unrelated_workout_plan_infographic_attempt1.png`
  - `assets/tarot-cards-imagegen/attempts/slot-ratio/failed/62_swords_queen_unrelated_states_of_matter_infographic_attempt1.png`
- Do not use API/CLI fallback. Resume only when the user explicitly asks to retry built-in ImageGen.
