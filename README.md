# MoonFlexForceAbilities — vertical slice v0.1

A buildless 2D 16-bit platformer slice: one level, spawn → Grumpis Scrumption,
played as a swan who can become a mermaid underwater. The whole game is one
`index.html` (vanilla JS + canvas, no dependencies), all art loaded from
`assets/` via `manifest.json`.

## Run it

```sh
python3 -m http.server 8000     # from the repo root (python on Windows)
```

Open **http://localhost:8000** — that's it. (A server is required because the
game `fetch`es the manifest and level; `file://` won't work.)

## Controls

| Action | Keys |
|---|---|
| Move | `←`/`→` or `A`/`D` |
| Jump (variable height: tap = hop, hold = full arc) | `Space` / `↑` / `W` |
| Swim stroke (in water) | same as jump; stroke near the surface to leap out |
| Transform swan ⇄ mermaid (in water only) | `Shift` or `E` |
| Pause | `Esc` |
| Name-entry store | arrows to move, `Enter` to buy a letter, `Backspace` to refund |

## The slice

- **Movement first.** Accel/friction curves (separate ground vs air), skid
  grip on turnarounds, variable jump with jump-cut, **coyote time** (6 frames),
  **jump buffering** (7 frames), **apex float** (reduced gravity at the peak),
  **corner correction** (≤3 px ledge-lip step-up and ceiling-edge slip), and
  asymmetric hitboxes (hurt-box 3 px smaller than the body, stomp-box 3 px
  wider).
- **One level** (`level1.json`): flat start → platform hops → two pits → a
  cockroach gauntlet → a swimmable lake (mermaid playground) → a dino ridge →
  boss arena with two stomp platforms.
- **Happiness** drains constantly (~42 s full-to-empty). Treats refill it.
  At zero you don't die — you **panic**: you move at 0.5×, enemies at 1.5×.
- **Boss:** Grumpis telegraphs (shaking windup) → lunges → rests. Stomp it
  3 times. Killing it pays 5000 and spawns the **trophy** at the arena exit;
  touching the trophy wins.
- **Name-entry store:** spend your points to spell your name, 100 pts per
  letter. **Unspent points are your recorded score** — a longer name costs you
  leaderboard position. Run out mid-name and it truncates. Scores live in
  memory only (refresh wipes them).

## The TUNING block

Every feel number lives in the `TUNING` constant at the very top of the
`<script>` in `index.html`, grouped and commented: display scale, player box
and hitbox insets, ground/air acceleration and friction, all jump constants
(gravity rise/fall, jump-cut multiplier, apex float, coyote/buffer frames,
corner-correction depth, stomp bounces), water physics for both forms, health
and i-frames, happiness drain/refill and panic multipliers, per-enemy stats,
the full boss pattern timing, scoring, letter cost, and camera lerp/lookahead.
Units are px/frame (fixed 60 Hz simulation) or frames. Change a number,
refresh, replay.

## level1.json schema

As suggested in the brief, with these specifics:

- `grid`: rows top→bottom, 120×17 tiles of indexes into `tileNames` (−1 = empty).
  17 rows (one screen is 15) so the lake could be dug 4 tiles deep; the camera
  follows vertically within the extra 32 px.
- Solid: `grass_top`, `dirt`, `edge_left`, `edge_right`, `platform`.
  Decorative (no collision): `lilypad`, `cattail`, `lantern`.
- `water`: rects in tile units `[startX, topY, widthTiles, heightTiles]`;
  being inside one switches to swim physics.
- `goalX`: the post-boss exit. When the boss dies, the trophy spawns on the
  ground at `goalX`; touching it (or crossing `goalX` after the boss is dead)
  triggers the win flow. Crossing it with the boss alive does nothing.
- Enemy/pickup `x,y` are top-left px; enemies drop to the ground on spawn.

## Decisions made (and why)

- **Level length:** the brief said ~2 screens, but its own example schema put
  the boss at x=900+. A literal 2 screens (768 px) can't fit ground → water →
  ridge → arena, so the level is 1920 px (~5 internal screens, ~2 minutes).
- **Water is a translucent tint** + surface line — there is no water tile in
  the manifest, and invisible water is unplayable. This, the flat sky color,
  and UI text are the only non-sprite pixels; every sprite/tile comes from
  `manifest.json` (blinks and the death-squash are transforms of those
  sprites, not new art).
- **Mermaid auto-reverts to swan when leaving water** — the mermaid sheet has
  no land frames.
- **Boss attack is a lunge, not a projectile** — no projectile art exists and
  the no-drawn-art rule wins.
- **Death loop:** hearts hit 0 → fall off, respawn at spawn with full hearts
  and happiness; defeated enemies stay defeated, but the boss resets to full
  HP. Pit falls cost one heart and return you to the last safe ground.
- **`tools/forge.py`** was moved from `assets/` to match the target layout
  (contents untouched; art remains reproducible).
- Verified headlessly before shipping: a Node harness drove the real game
  script through 30 scripted scenarios (jump heights, coyote/buffer windows,
  water/transform, panic, stomps, pit/death loops, the full boss → trophy →
  name-store flow) plus a traversal bot that walked/swam spawn → arena with
  real physics; rendering confirmed via headless-browser screenshots.

## Out of scope (TODO hooks live in the code)

Co-op/Charmgirl, costume-shedding upgrade stacking, treasure-box power
chooser, hub house + elevator, moonlight T-Rex, Mecha Swan, Big Hog Dog,
audio. Search `TODO(` in `index.html` for the seams.
