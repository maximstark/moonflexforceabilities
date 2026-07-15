# MoonFlexForceAbilities v2 — Concept Library Review

These are review-only source boards. None of them replace playable assets until
the visual direction, character identity, pose coverage, and scale are approved.
Private mood references are intentionally excluded from this directory.

Open `review.html` for the single-page visual gallery; click any board to inspect
its full-resolution transparent source.

## Review key

- `READY` — generated, background removed, visually inspected, and complete enough for review.
- `REVISE` — generated but visibly missing a requested subject, pose, or separation requirement.
- `TODO` — not generated yet.
- `APPROVED` — reserved for the owner; ready to enter the production-atlas pipeline.

## Characters and companions

| Status | Board | Required coverage |
|---|---|---|
| APPROVED | `../source/swan_pose_board.png` | Swan idle, preen, locomotion, flap, surface swim |
| READY | `characters/playable_forms.png` | Mermaid, Charmgirl, moonlight T-Rex, Mecha Swan |
| READY | `characters/swans_and_turtles.png` | Baby swan animation, rescued flock, mother turtle and babies |
| READY | `characters/nice_place_npcs.png` | World 10 friendly NPC cast and readable idle gestures |

## Enemies

| Status | Board | Required coverage |
|---|---|---|
| READY | `enemies/world1_roster.png` | Frog, cockroach, little dinosaur, Grumpis; three poses each |
| READY | `enemies/water_roster.png` | Cat-face/alligator reveal, fish, dream wisp |
| READY | `enemies/air_roster.png` | Fly and airborne dinosaur variants |
| READY | `enemies/bad_dreams.png` | Bad Dreams idle chase, sphere/sweep, hurt/dissolve |

## Bosses and giants

| Status | Board | Required coverage |
|---|---|---|
| READY | `bosses/grumpis_family.png` | Grumpis twins and Papa Grumpis idle/attack/hurt |
| READY | `bosses/hogdog.png` | Big Hog Dog idle, mushroom volley, steal/flee, hurt |
| READY | `bosses/giant_progression.png` | Sandaled giant, colossus foot, complete Biggest Dream giant |
| READY | `bosses/finale_showdown.png` | Mecha Swan combat keys and finale boss staging/scale study |

## Pickups, equipment, effects, HUD, and UI

| Status | Board | Required coverage |
|---|---|---|
| READY | `items-ui/equipment.png` | Goose feet, visor, spoon poses, original dream cap, spin mace |
| READY | `items-ui/powers_and_pickups.png` | Moon, beads, phone, stars, treats, chest powers, later-world toys |
| READY | `effects/combat_fx.png` | Fire, nuts, mushrooms, stink, laser, rings, sticky hand, shell, egg |
| READY | `effects/movement_fx.png` | Splash, spark, feather, poof, bubble, moon spark, landing, confetti |
| READY | `items-ui/hud.png` | Hearts, happiness, collectibles, baby/charm icons, boss bar pieces |
| READY | `items-ui/ui_panels.png` | Title mark, story cards, pause, chooser, store, clear, credits panels |

## Environments

| Status | Board | Required coverage |
|---|---|---|
| READY | `environments/lake_tiles.png` | Grass/soil edges, platforms, lilies, cattails, lanterns, flowers, fence |
| READY | `environments/water_deep_tiles.png` | Water surface/depth, rock, seaweed, coral, treasure chest |
| READY | `environments/night_rescue_tiles.png` | Night ground, fire, tree, leaves, rescue staging |
| READY | `environments/candy_cloud_tiles.png` | Clouds, candy, gumdrops, springs, mush blocks |
| READY | `environments/hub_house_tiles.png` | Wall/floor/paper, windows, doors, furniture, shaft, roof, elevator |
| READY | `environments/world_backdrops_1.png` | Dream Lake, Moonlight, The Deep environment keys and parallax layers |
| READY | `environments/world_backdrops_2.png` | Candy, Fever, Hub environment keys and parallax layers |
| READY | `environments/world_backdrops_3.png` | Finale, Broken Ascent, Long Fall, Secret Cove environment keys |
| READY | `environments/world_backdrops_4.png` | Nice Place, Long Way Up, Biggest Dream environment keys |
| READY | `environments/overworld.png` | Top-down lake map, islands, paths, nodes, boat/wake, trophy room |

## Validation record

### `enemies/world1_roster.png`

- Coverage: frog, cockroach, dinosaur, and Grumpis are present in three rows.
- Consistency: each character retains palette and proportions across its column.
- Separation: subjects remain isolated with no cross-cell overlap.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: generated Grumpis is a cleaner redesign than the existing sprite;
  owner approval is still required before atlas integration.

### `characters/playable_forms.png`

- Coverage: four poses each for Mermaid Swan, Charmgirl, moonlight T-Rex, and
  Giant Mecha Swan are present in stable columns.
- Consistency: heart marks, eyes, flowers, armor, and energy-core details remain
  identifiable across poses.
- Separation: all sixteen forms remain inside their cells; the final Mecha laser
  reaches the right edge and will need effect/body separation during production.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: Mermaid bubbles and transformation sparkles are concept effects,
  not permanent body pixels; extract them separately if approved.

### `characters/swans_and_turtles.png`

- Coverage: three baby-Swan expressions, three mother-turtle poses, and three
  mother-with-babies ending groups are present.
- Consistency: shell pattern, eye language, and warm reflected-light palette
  remain stable across the turtle columns.
- Separation: all nine cells are isolated; no water or scenery is embedded.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: the generated family groups vary between four and five visible
  babies; production extraction must lock the shipped ending count explicitly.

### `characters/nice_place_npcs.png`

- Coverage: the six actual Level 10 dialogue placements are represented: two
  praising baby Swans, cheering Charmgirl, generous turtle, warm Mermaid, and
  the final winking baby Swan.
- Consistency: established Charmgirl, Mermaid, turtle, and Swan-family visual
  language is retained.
- Separation: six isolated cells; only the requested turtle cell includes a
  treasure chest.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: baby Swan scale is intentionally larger for emote readability;
  production should normalize it against the companion board.

### `enemies/water_roster.png`

- Coverage: cat face, partial reveal, full alligator; two fish strokes and dart;
  three wisp energy states.
- Consistency: the cat mask remains attached through the alligator reveal, and
  fish/wisp palettes remain stable within their columns.
- Separation: all nine subjects remain isolated; speed lines and wisp sparkles
  can be extracted as optional effects.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: the alligator grows substantially across reveal frames by design;
  production needs fixed mask anchoring while allowing the body hitbox reveal.

### `enemies/air_roster.png`

- Coverage: wing-up, wing-down, and attack/bank keys for both fly and flying
  dinosaur.
- Consistency: fly body/eyes and dinosaur belly/spikes remain stable; the dream
  wings share one lavender material language.
- Separation: six subjects are isolated with no scenery or embedded trails.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: dinosaur hue is darker than the World 1 ground roster; production
  color grading should unify both variants if approved.

### `enemies/bad_dreams.png`

- Coverage: sleeping, chase, hurt, transform, sphere, sweep, giant armored idle,
  giant lunge, and defeated dissolve states are present.
- Consistency: crescent eyes, scribble body, and pink-violet core persist across
  all phases and scales.
- Separation: nine cells remain distinct; the longest sweep arms stay within
  the source canvas.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: this is a major redesign of the code-drawn placeholder and should
  be reviewed for the right balance of menace and family-friendly tone.

### `bosses/grumpis_family.png`

- Coverage: idle, attack/enrage, and hurt keys for both twins and Papa.
- Consistency: purple fur, gold horns, cream belly, yellow eyes, and family gem
  unite all three while horn/hair shapes distinguish the siblings.
- Separation: all nine cells are isolated; attack stink clouds remain separable.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: Papa is framed more closely than the twins to communicate scale;
  production must choose whether gameplay uses full-body or imposing crop art.

### `bosses/hogdog.png`

- Coverage: idle, mushroom windup, mushroom throw, charge, hurt, dazed, two-baby
  theft, two-baby escape, and safe surrender keys are present.
- Consistency: patched jacket, pink belly, tusks, mushroom prop, and bulky
  silhouette remain stable across all nine states.
- Separation: each action remains inside its cell; mushrooms and baby Swans can
  be extracted as independent attachments for animation and gameplay timing.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: the lower row deliberately carries exactly two babies throughout;
  production should rig them as attachments so the boss body can reuse movement.

### `bosses/giant_progression.png`

- Coverage: friendly sandaled scale cues, raised/walking/kneeling motion, colossus
  windup/stomp/recoil, and full dream-titan taunt/face-dip/defeat keys are present.
- Consistency: crescent-and-flower sandals, patched plum pajamas, moon ornament,
  lavender hair, and warm skin link all three encounter scales.
- Separation: nine cells remain readable; impact debris and defeat dream smoke are
  optional effect layers rather than required body pixels.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: the friendly and colossus columns reveal more of the same titan than
  the original code placeholder; production crops should preserve the intended
  mystery while using the complete art for transitions and cinematic framing.

### `bosses/finale_showdown.png`

- Coverage: Mecha hover/laser/shield, giant tracking/face-hit/stagger, close-orbit,
  hand-dodge, and palm-resolution choreography are all present.
- Consistency: pearl-lavender Swan armor and the titan's moon-pajama identity stay
  stable while matching their separate character source boards.
- Separation: all nine cells are distinct; muzzle flare, hit crescent, orbit trail,
  and the hero in paired cells can be extracted onto independent layers.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: bottom-row Swan scale is intentionally tiny relative to the titan;
  production should retain separate high-resolution Swan art for close camera cuts.

### `items-ui/equipment.png`

- Coverage: standalone goose-feet boots, visor, original dream cap, and spin mace,
  plus equipped boot, visor, spoon, and cap poses are present.
- Consistency: crescent hardware, lavender-and-gold trim, pink magic, and soft
  hand-crafted materials unify the equipment without erasing item silhouettes.
- Separation: nine cells are distinct; attachment cuffs, visor band, spoon grip,
  cap opening, chain, ball, and optional motion accents remain readable.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: the legacy franchise-referencing cap has been replaced with an
  original plush dream cap suitable for a future commercial release.

### `items-ui/powers_and_pickups.png`

- Coverage: sixteen isolated cells cover moon, beads, phone, star, two treats,
  closed/open chest, gum, sticky hand, shell, egg-a-rang, mace, heart, happiness,
  and the baby-Swan rescue emblem.
- Consistency: crescent clasps, plum-gold hardware, pearly highlights, and pink-
  lavender magic make the full reward language feel authored as one set.
- Separation: every object stays within its 4x4 cell; the open-chest glow and small
  token glints remain optional detachable effect pixels.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: the phone uses symbols only, and each later-world toy power has a
  unique silhouette intended to survive both HUD and in-world reductions.

### `effects/combat_fx.png`

- Coverage: paired frames cover fire, nut, mushroom, stink, moon laser, rings,
  sticky hand, mermaid shell, egg-a-rang, and universal hit feedback.
- Consistency: pink-white energy cores, plum edges, warm-gold sparks, and compact
  hand-clustered shapes match the broader visual language without homogenizing FX.
- Separation: all twenty 5x4 cells remain isolated; debris, bubbles, cords, arcs,
  motes, and impact particles can be split further during production.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: two keys per family define timing and shape language; production
  animation should add authored in-betweens rather than simply scaling either key.

### `effects/movement_fx.png`

- Coverage: paired keys cover splash, speed spark, feather drift, transformation
  poof, bubble/pop, moon spark, landing dust/feathers, and celebration confetti.
- Consistency: ivory feathers, pink-gold energy, aqua water, and lavender dream
  smoke keep feedback legible while connecting it to characters and collectibles.
- Separation: all sixteen cells are isolated with compact negative space; individual
  droplets, motes, feathers, and confetti pieces can be split if production needs.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: recovery keys deliberately spread wider than their starts; production
  should anchor splash/landing pairs at a shared bottom-center contact point.

### `items-ui/hud.png`

- Coverage: full/half/empty heart states and container, happiness states/frame/fill,
  moon/bead/baby/Charmgirl counters, boss frame/fill, ability slot, and checkpoint
  emblem occupy sixteen dedicated cells.
- Consistency: pearl feathers, plum insets, pink gems, crescent gold, and restrained
  faceting create one HUD family with clear functional silhouette differences.
- Separation: every component is isolated; meter frames and fills are independent,
  and all medallions retain clear boundaries for counter overlays.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: state geometry is closely matched but requires exact pixel alignment
  during atlas cleanup; all numerals and labels should remain font-rendered in code.

### `items-ui/ui_panels.png`

- Coverage: title crest, storybook, pause menu, four-slot chooser, store, level-clear,
  credits scroll, dialogue box, and two-choice confirmation panel are present.
- Consistency: feather corners, crescent clasps, plum framing, parchment fields, and
  pearl-pink gems make all nine screen families feel native to the same game.
- Separation: panels remain in isolated 3x3 cells; all functional fields and button
  recesses are blank, allowing text, portraits, and item icons to stay code-driven.
- Background: chroma-key removal completed successfully; alpha retained.
- Review note: the title crest intentionally contains no rasterized lettering;
  production should layer a separately authored title font/mark for exact spelling.

### `environments/lake_tiles.png`

- Coverage: grass top/fill/outer/inner corners, floating and dock platforms, lily
  variants, cattails, flowers, lantern, fence segment/end, and shore rock are present.
- Consistency: matching soil strata, top thickness, teal foliage, lavender wood and
  stone, pink flora, and crescent hardware establish one Dream Lake terrain family.
- Separation: all sixteen modules stay isolated and uncropped at a shared implied
  scale; terrain silhouettes expose the edge types needed for later tile cleanup.
- Background: border-connected chroma removal completed; external alpha is clean
  while enclosed mint/teal vegetation remains opaque.
- Review note: this is concept geometry, not a guaranteed seamless tileset; production
  must normalize tile dimensions and hand-match boundary pixels after approval.

### `environments/water_deep_tiles.png`

- Coverage: water surface/edges/depth fill, rock top/corners/fill, seaweed, coral,
  bioluminescent garden, vent, closed/open chest, shell reward, and ruin column exist.
- Consistency: sapphire-aqua water, rounded violet rock, pink/ivory reef life, gold-
  plum treasure, algae, and crescent carvings define one submerged material family.
- Separation: all sixteen modules stay isolated; water is bounded as source pieces,
  bubbles and chest glow remain detachable, and terrain faces expose useful edges.
- Background: border-connected chroma removal completed; external alpha is clean
  while enclosed aqua/teal sea vegetation remains opaque.
- Review note: production must make surface/depth bands loop and reconcile generated
  rock corner widths at the chosen native tile grid after visual approval.

### `environments/night_rescue_tiles.png`

- Coverage: night terrain top/corners/fill, trunk base/segment/branch/canopy, three
  fire sizes, smoke, scorched ground, empty rescue nest, beacon, and leaf scatter exist.
- Consistency: indigo-teal foliage, plum earth/bark, lavender moonlight, and peach-
  pink flame/beacon light build a coherent rescue-night contrast hierarchy.
- Separation: all sixteen modules are isolated; tree parts can be recombined, fire
  frames share a base region, and rescue objects contain no embedded characters.
- Background: border-connected chroma removal completed; external alpha is clean
  while enclosed teal leaves and grass remain opaque.
- Review note: production should register the three fire frames to one bottom-center
  anchor and normalize terrain/tree pieces to the final native collision grid.

### `environments/candy_cloud_tiles.png`

- Coverage: cloud/taffy top/corners/fill, cloud/gumdrop/wafer/marshmallow platforms,
  compressed/extended spring, idle/squashed mush block, and four decor/hazard cells exist.
- Consistency: ivory cloud tops, pink-lavender taffy, sugar facets, plum structure,
  and warm-gold hardware create a tactile but gameplay-readable candy world.
- Separation: all sixteen modules remain isolated; paired spring and mush states are
  similarly framed, and no decorative object is baked into terrain or backdrop art.
- Background: border-connected chroma removal completed; external alpha is clean.
- Review note: production should align paired-state anchors exactly and hand-author
  seamless taffy/cloud boundaries at the final native tile resolution.

### `environments/hub_house_tiles.png`

- Coverage: wall/floor/paper/roof modules, closed/open doors, two window scales, bed,
  table, chair, wardrobe, elevator car, shaft, console, and staircase are present.
- Consistency: ivory paper/feathers, plum-lavender wood, pink gems/fabric, and warm-
  gold hardware form a cozy architectural extension of the HUD and UI language.
- Separation: all sixteen cells are isolated; door states and vertical-travel parts
  remain independent, while blank paper surfaces contain no rasterized text.
- Background: border-connected chroma removal completed; external alpha is clean.
- Review note: production must make wall/floor/shaft pieces repeat seamlessly and
  reconcile the elevator car, guide rails, console, and gameplay collision scale.

### `environments/world_backdrops_1.png`

- Coverage: Dream Lake, Moonlight Rescue, and The Deep each receive a bounded sky/
  depth wash, far-silhouette band, and richer midground parallax band.
- Consistency: each world's horizon, lighting, palette, and recurring motifs persist
  vertically while far-to-mid contrast and detail increase appropriately.
- Separation: all nine matrix cells are isolated; washes are bounded rectangles and
  far/mid bands expose clean silhouettes with no gameplay terrain or characters.
- Background: border-connected chroma removal completed; external alpha is clean
  around every layer while enclosed teal/aqua artwork remains opaque.
- Review note: production should split cells to individual files, make horizontal
  boundaries loop, then tune per-layer scroll factors against actual level cameras.

### `environments/world_backdrops_2.png`

- Coverage: Candy Clouds, Fever Swarm, and Tall Hub House each receive ambient wash,
  distant silhouette/architecture, and richer midground parallax treatments.
- Consistency: confection pink/ivory, fever magenta/plum, and hub parchment/wood
  identities persist vertically while layer contrast/detail step forward by row.
- Separation: all nine bounded cells remain isolated with no characters, gameplay
  collision tiles, readable text, or cross-cell effects.
- Background: border-connected chroma removal completed; external alpha is clean
  around the full matrix and its rectangular layer boundaries.
- Review note: several bands are painterly environment keys rather than finished
  loops; production should crop, simplify, and hand-loop them for camera parallax.

### `environments/world_backdrops_3.png`

- Coverage: Finale, Broken Ascent, Long Fall, and Secret Cove each receive ambient,
  far-structure, and midground framing layers in a complete 4x3 matrix.
- Consistency: celebratory pearl-gold, fractured lavender, falling indigo-rose, and
  cove aqua-plum identities persist through all three depth tiers.
- Separation: all twelve cells are bounded and isolated; Long Fall preserves an open
  gameplay center, while ascent/finale/cove motifs remain non-collision framing art.
- Background: border-connected chroma removal completed; external alpha is clean
  while Secret Cove water/foliage color ranges remain opaque.
- Review note: production should preserve the vertical scroll logic for Ascent/Fall,
  hand-loop horizontal layers where used, and separate decorative spark/leaf passes.

### `environments/world_backdrops_4.png`

- Coverage: Nice Place, Long Way Up, and Biggest Dream each receive ambient wash,
  distant environment, and richer midground/parallax framing layers.
- Consistency: homecoming sunset/garden, monumental lavender interior, and stitched
  plum-cosmic dream motifs persist vertically with suitable depth progression.
- Separation: all nine cells are bounded and isolated; vertical-climb and dream
  midgrounds preserve open gameplay centers and depict no character body parts.
- Background: border-connected chroma removal completed; external alpha is clean
  around every bounded wash and silhouette/framing layer.
- Review note: production should keep Long Way Up's side-framing open, split floating
  Biggest Dream ornaments into optional passes, and hand-loop garden/dream bands.

### `environments/overworld.png`

- Coverage: complete lake/island geography, detachable route network, node-state and
  themed node set, idle/moving boat with wake, dock, trophy pavilion/island, twelve-
  socket trophy interior, compass, flourishes, ribbon, cloud, and wave ornaments exist.
- Consistency: top-down pearl/aqua/mint geography, plum architecture, pink-gold route
  language, and feather/crescent framing align map navigation with HUD and hub art.
- Separation: nine source cells remain distinct; boat/wake, routes, node medallions,
  exterior, interior, and ornaments can all be extracted independently.
- Background: border-connected chroma removal completed; external alpha is clean
  while enclosed mint island foliage and aqua water remain opaque.
- Review note: the generated node group includes extra useful state/theme medallions;
  production should select the canonical count and align routes/nodes over the map.

## Production boundary

Concept approval does not imply implementation approval. Production work still
requires pose extraction, stable per-character scale, baseline/anchor metadata,
attachment points, cleanup at native source resolution, real gameplay captures,
the complete headless suite, and explicit owner review before publishing.

## Library audit — 2026-07-15

- Inventory: 28 total boards; 1 owner-approved benchmark and 27 review-ready boards.
- Status gate: 0 `TODO` and 0 `REVISE` entries remain.
- File gate: every indexed PNG exists; the gallery resolves all 28 unique images.
- Alpha gate: every board is RGBA and all four canvas corners are transparent.
- Chroma gate: 27 intermediate `_chroma.png` files exist locally for provenance and
  are ignored by Git; none appear as track candidates.
- Privacy gate: no private mood-reference file or directory is present in the
  concept library or Git track candidates.
- Scope gate: the worktree changes are limited to `.gitignore`, `art/concepts/`,
  and the reusable `tools/remove_connected_chroma.py` cleanup utility; gameplay,
  atlases, manifests, levels, and published demo files are untouched.
