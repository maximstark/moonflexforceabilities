# MoonFlexForceAbilities — Build Kit
*Two things: (1) the wrapper prompt that sits on top of the GDD when you hand it to Fable, and (2) ChatGPT mockup prompts to lock the aesthetic before Claude draws real pixel assets.*

---

## PART 1 — Fable one-shot wrapper prompt

> Paste this **above** the full GDD. It tells Fable how to read the doc. The GDD is the spec; this is the priority filter.

---

You are building a **vertical slice**, not the whole game. The attached design document describes the full vision — treat it as the long-term target, **not** the scope of this build. Your job is to make one small part feel incredible, not to gesture at all 18 sections.

**Hard rule: feel before features.** This game lives or dies on movement (GDD §4). If the swan doesn't feel better than the original Super Mario Bros. to control, nothing else matters. Spend your effort budget there first and protect it.

### Priority stack (build in this order; stop and polish, don't race ahead)

1. **Movement & physics on a gray-box level.** Acceleration/friction curves, variable jump height, coyote time (~5 frames), jump buffering (~6 frames), apex float, corner correction. Player hurt-box smaller than the sprite; stomp-box slightly larger. Get this *feeling* right before drawing anything.
2. **One complete level, start to boss.** Ground/platforms, a few frogs + cockroaches + one dinosaur, popcorn (points) and stars (collectible) pickups, a single **Grumpis Scrumption** boss at the end.
3. **Happiness meter.** A second bar that constantly depletes; refilled by the plastic-ball sweet-treat pickups. At zero: player slows, enemies speed up. This is the soul of the pacing — implement it fully.
4. **Swan ⇄ Mermaid toggle.** A single transform button that swaps between walking-swan and swimming-mermaid in water. **One toggle. Two forms. That's it** (see "do NOT build" below).
5. **End-of-level name-entry store.** Spend points to spell your name on a high-score list; letters cost points, run out and the name truncates.

### Definition of done (the slice is finished when ALL of these are true)
- Runs at a steady 60fps in a single self-contained HTML file, no external dependencies, keyboard controls.
- Variable jump, coyote time, and jump buffering are all present and tunable via named constants at the top of the file.
- One level playable from spawn to a beatable Grumpis Scrumption boss.
- Happiness depletes, refills from treats, and visibly changes player/enemy speed at zero.
- Swan↔Mermaid toggle works in water.
- Death + respawn loop works; name-entry screen appears on level clear.
- All physics tuning values live in one clearly labeled constants block.

### Do NOT build in this slice (these are the sprawl traps — stub or omit)
- **The costume-shedding / upgrade-layering system (GDD §5.2, §6.1).** Do not build stacking layers or "jump out of your upgrades." The Swan↔Mermaid toggle is the *only* transform mechanic in the slice. This system is a rabbit hole; leave a `// TODO: layered upgrade system` and move on.
- **Co-op and the two-player camera (§3, §15).** Single player only. No second character, no tether camera. Hardest thing to get right, lowest slice value.
- **Treasure-box powers (§6.2).** At most stub one (Fire). Don't build the chooser UI.
- **Hub house + elevator level select (§12).** Replace with a single "Start" screen.
- **Charmgirl / T-Rex moonlight, Mecha Swan finale, Big Hog Dog, the tree rescue, the giant spoon, the cat-face alligator.** All out of scope. Leave TODO hooks where the GDD mentions them, but build none of them.

### Style of code
- One HTML file, canvas-based, no build step.
- A clearly labeled **TUNING constants** block at the very top (gravity, jump force, accel, friction, coyote frames, buffer frames, happiness drain rate, etc.) so the feel can be adjusted in one place.
- Placeholder rectangles/shapes for art are fine — **do not** spend effort on graphics in this pass. Art comes later from real pixel assets.

Build the slice. Make the swan feel amazing. Leave everything else as labeled TODOs.

---

## PART 2 — ChatGPT mockup prompts (aesthetic lock)

**Read this first.** ChatGPT/DALL·E produces *pixel-art-style illustrations*, not tile-aligned, palette-locked sprites. So these mockups are **concept and mood targets** — Claude (or you) redraws real tile-true assets from them afterward. Two tips that make a huge difference:

1. **Generate the Style Key (Prompt A) first.** Then feed that image back in as a reference for every subsequent prompt so the palette and proportions stay consistent. Consistency across gens is the hard part.
2. **Don't trust rendered text.** It'll garble HUD words. Ask for icons and bars, not labels; you'll add real text later.

### Shared style anchor (paste at the top of every prompt)
> 16-bit SNES-era pixel art, side-scrolling platformer screenshot, soft and cute but with a charming slightly-bootleg homemade quality. Chunky readable sprites with dark outlines, limited palette per object, gentle dithering. Dreamlike, cozy, golden-hour lighting. Palette: warm gold, cream-white swans, teal lake water, twilight purple-and-pink sky, hot-pink accents. Horizontal 16:9 framing with parallax background layers and a clear tiled ground line. No real text — use simple icon/bar shapes for any UI.

---

### Prompt A — Style Key / hero frame *(make this one first)*
> [shared style anchor] A graceful white swan character mid-jump over a golden lake at sunrise, wings slightly spread. Lily pads and reeds as foreground platforms, distant tall whimsical house silhouette in the parallax background. Top-left HUD: a red heart health bar and a yellow smiley "happiness" bar, plus small popcorn and star counter icons. Bright, inviting, the single most appealing frame of a beloved cult platformer. This is the canonical look of the whole game.

### Prompt B — Charmgirl, day vs moonlight *(side-by-side)*
> [shared style anchor] A two-panel comparison. Left panel, daytime: a small cute pink baby T-Rex character with a heart-shaped charm on her belly, standing in the lake level, friendly and round. Right panel, night under a big glowing moon: the same pink T-Rex transformed into a large powerful T-Rex, mid-stomp, dust kicking up, eyes glowing — werewolf-style transformation. Same palette and proportions across both panels.

### Prompt C — Grumpis Scrumption boss arena
> [shared style anchor] A boss-fight screenshot: a gigantic goofy-but-scary horned monster filling the right side of the screen — big curled horns, comically stinky armpits with little green stink-cloud puffs, a grumpy face that's more silly than terrifying. The small white swan hero stands on the left on a platform looking up at it. A boss health bar across the top as a simple segmented bar. Cute-menacing, dreamlike, slightly absurd.

### Prompt D — The tall house hub (calm contrast)
> [shared style anchor] An impossibly tall, narrow whimsical house shown in cross-section like a dollhouse, many floors stacked vertically, a little elevator car visible in a central shaft. Every room is impossibly neat and tidy and cozy — warm lamplight, made beds, organized shelves. Calm, serene, storybook. This is the peaceful home base, deliberately the opposite of the chaotic dream levels.

### Prompt E — Mermaid underwater section
> [shared style anchor] An underwater level screenshot: the swan hero transformed into a cute mermaid form, swimming through teal water with sunbeams from above, bubbles, seaweed platforms. Lurking nearby, a deceptively friendly floating cat face — and a second beat where it's revealed to actually be a sneaky alligator with the same cat-like face, jaws starting to open. Dreamy, slightly eerie, still cute.

### Prompt F — Mecha Swan finale vs the Big Hog Dog
> [shared style anchor] Epic final-boss screenshot: the hero transformed into a GIANT armored mecha-swan robot, glowing power core, laser eyes, towering and heroic on the left. On the right, the final boss "Big Hog Dog" — a huge mean hog-dog creature hurling yucky purple mushrooms. Dramatic dreamlike sky, energy beams, debris. Maximum power-fantasy, the hero clearly stronger. Over-the-top and triumphant.

### Prompt G — Asset & HUD mood sheet
> [shared style anchor] A clean asset reference sheet on a neutral dark background, arranged in a grid: the swan in idle/walk/jump poses, a popcorn pickup, a star, a sweet-treat in a clear plastic capsule, a frog enemy, a cockroach enemy, a small dinosaur enemy, a giant spoon weapon, Mardi-Gras-bead "gold medal" trophy, and HUD elements (heart bar, happiness smiley bar). Consistent palette and lighting, sprite-sheet style, individual items clearly separated.

---

### Suggested generation order
A (lock the look) → G (lock the components) → B, C, D, E, F (scenes). Feed A back in as a reference image on every later prompt for consistency.

*Once these land, hand the favorites to Claude and I'll redraw them as actual tile-aligned, palette-locked pixel sprites the game engine can use.*
