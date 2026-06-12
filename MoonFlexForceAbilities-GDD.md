# MoonFlexForceAbilities
### A 2D 16-bit Side-Scrolling Platformer
*Game design document, v0.1 — translated from the original brief by Josie (age 4), structured by Dad*

---

## 0. How to read this document

Everything Josie asked for is in here. Nothing was cut. Where her brief was dream-logic, I treated the dream-logic as the *premise* rather than a problem to solve — so the parts that "don't make sense" are now load-bearing. Designer's notes in *italics* flag where I invented connective tissue to make her ideas buildable; you can overrule any of them and the rest still stands.

A glossary at the end translates her original vocabulary (grumpis scrumption, the unvisible button, etc.) so you never lose the source.

---

## 1. One-paragraph pitch

Every morning a family wakes in their impossibly tall house, and every morning the children go down to the lake to play with the golden swans. Using the **invisible phone** — whose single button you can only see when it's invisible — any family member can press it and *become a swan*, diving out of the waking world and into the dream-lake beyond. **MoonFlexForceAbilities** is the dream: a tight, responsive, two-player 16-bit platformer where you swim, fly, transform, and stack absurd power-ups, fighting a boss at the end of every level, rescuing baby swans, keeping your **Happiness** from running out, and ultimately becoming a **giant mecha swan** to defeat the Big Hog Dog who wants to steal your babies.

---

## 2. Tone & framing

- **The dream conceit.** Each level is a stranger dream than the last. Level 1 is recognizable (the lake, the family). By the final level it's full-on Vampire-Survivors fever-dream — too much on screen, too many powers, gleeful chaos. The escalating strangeness Josie asked for *is* the difficulty curve.
- **Cute, and a little bit bad, on purpose.** The art and the chiptune score lean intentionally "homemade NES bootleg" — earnest, slightly off, charming. (Josie's exact spec: *"comically cute and simultaneously a little bit bad retro nes style music."*)
- **Home is calm; the dream is mayhem.** The house is always neat, the room is always tidy, the elevator always works. That contrast makes the dream-lake feel wilder.

---

## 3. Players & characters

Two-player local co-op. Drop-in / drop-out.

| Slot | Character | Notes |
|---|---|---|
| **P1** | **The Swan (You)** | The family member who pressed the invisible button. Default form. All transformations stack on top of this base. |
| **P2** | **Charmgirl** | A friendly pink girl T-Rex with a charm on her belly. Playable from the start. |

**Charmgirl's werewolf mechanic.** Charmgirl is small and quick by day, but when **moonlight** falls on her (night sections, moon-pickups, or the final act) she transforms into a full **T-Rex** — bigger hitbox, heavier, can smash blocks and stun bosses with a stomp. *Designer's note: I made the moon a collectible/level-state so the transformation is something players can trigger and build around, not just a cutscene.*

*Single-player:* P2 becomes an AI buddy or you swap between the two with a button (Josie said "we have a friend to help us," so co-op is the intended mode; solo is the accommodation).

---

## 4. Core mechanics & physics (the part Dad over-engineers)

Josie's father's spec, honored literally: **"play as well as the original Super Mario Bros. or better,"** with tight hitboxes and responsive, dynamic controls. This section is the one we polish until it's embarrassing how much time we spent.

### 4.1 Movement model
- **Acceleration/friction curves**, not instant velocity. Hold-to-accelerate, decelerate on release, with separate ground vs. air friction.
- **Variable jump height** — tap for a hop, hold for full arc. Jump force ramps for the first ~12 frames of hold, then cuts.
- **Coyote time** (~5 frames of jump-grace after leaving a ledge) so edges feel fair.
- **Jump buffering** (~6 frames) so a slightly-early jump press still fires on landing.
- **Apex control** — slightly reduced gravity at the top of the jump for that floaty-but-precise SMB feel.

### 4.2 Hitboxes ("edge box and hit box")
- **Tight, forgiving-to-the-player** collision: player *hurt* boxes are smaller than the sprite; player *attack/stomp* boxes are slightly larger. Enemies get the reverse. This is the standard "feels fair" asymmetry.
- **Pixel-accurate ledge grabs** and corner correction (nudge the player around a 1–2px corner snag instead of stopping them dead).

### 4.3 Swan-specific physics
- On land: walks/jumps like a platformer character.
- On/over water: can **paddle-swim** (buoyant, momentum-based) and **short-flap glide** (a few flaps of lift before gravity wins) — distinct from a true flight so platforming still matters.

*Designer's note: the brief never says the swan flies freely; "glide" keeps levels designable.*

---

## 5. The transformation system (invisible phone)

The **invisible phone** is the transformation menu. Its **invisible button** becomes visible only when you're holding the transform input — Josie's "you can only see the unvisible button when it's unvisible" becomes a clean UI rule: *the toggle appears on-screen only while the transform button is held.*

Transformations are **costumes that stack**, and you literally **jump out of each costume** to shed it (her "you jump out of the mermaid like it's a costume… you have to jump out of all the upgrades before you get to the end").

### 5.1 Forms
| Form | How you get it | What it does |
|---|---|---|
| **Swan** (base) | Default | Walk, jump, paddle-swim, short glide. |
| **Mermaid** | Mermaid costume pickup | Full underwater swimming, faster in water, can breathe underwater. Toggle Mermaid ⇄ Swan on the invisible phone. |
| **Mecha Swan** | Final-act transformation | The endgame super-form (see §11). |

### 5.2 The "jump out of your upgrades" mechanic
Each costume/upgrade you wear is a **layer**. Pressing the shed-input makes you **jump up out of the topmost layer**, dropping it as a pickup you can re-grab. Before certain end-of-level doors you must shed down to base Swan — a small, satisfying "unstack yourself" puzzle.

### 5.3 The cat-face / alligator gag
While in **Mermaid** form, a **cat face** sometimes appears and looks at you. Touch it / look back and it's revealed to be an **alligator** — startle moment ("AGH!"). *Implemented as a fake-friendly enemy: reads as a harmless cat face, snaps into an alligator if you get close. Cute jump-scare, very Josie.*

---

## 6. Power-ups & upgrades

Two streams: **stackable upgrades** (worn, shed-able) and **treasure-box powers** (chosen, Kirby-style).

### 6.1 Stackable upgrades (collected in levels)
- **Giant Goose Feet** — higher jump + ground-pound stomp; slower turn.
- **Laser Beam Eyes** — fire a horizontal laser; aim slightly with up/down.
- **Mermaid Costume** — see §5.
- (Room to add more; the system is "wear it, stack it, shed it.")

### 6.2 Treasure-box powers (earned with stars — Kirby-style)
Collect enough **stars** in a level to open the **Treasure Box** and *choose* one special power. Josie's list, kept verbatim as the menu:
- **Fire** — shoot fireballs.
- **Pink** — a pink screen-clearing burst / shield. *(Designer's note: "pink" was listed as a power; I made it a cute area-effect so it earns its slot.)*
- **Tree** — root in place and **shoot out nuts** as projectiles; immovable but powerful while planted.
- **Kirby Costume** — copy-ability cosmetic; pairs with whatever you just absorbed.

These are how you **"beat that beast"** — bosses are tuned so the right treasure-box power trivializes the right boss, rewarding choice.

---

## 7. Happiness meter (the survival layer)

A second resource bar beside health. **Happiness constantly depletes.**

- **Refill it** by collecting **sweet treats in little plastic balls** (gachapon-style capsules) scattered through levels.
- **At zero Happiness:** *you* move very slowly and **the bad guys move fast** — a panic state, not instant death. Get a treat to recover.
- *Designer's note: this is the cleverest thing in the brief. It's a built-in pacing/tension system that punishes dawdling without a hard timer. We tune depletion rate per level; it ramps with the strangeness curve.*

---

## 8. Scoring, collectibles & the high-score name screen

- **Popcorn** and **Stars** are the two pickups.
  - **Popcorn → points.**
  - **Stars → Treasure Box access** (§6.2) and treasure unlocks.
- **Points feel huge** — beating a boss grants a giant payout (Josie: *"ten million points"*). Numbers are intentionally cartoonishly large.
- **End-of-level store / name entry.** You **spend your earned coins/points to save your name** on the high-score list. Mechanic, exactly as briefed: *if you have enough points you can afford to spell each character of your name* — each letter costs points, so a great run literally buys you a longer name on the board. Run out and your name gets truncated. (Delightful, and a real incentive loop.)

---

## 9. Enemies

Standard roster (per brief): **dinosaurs, cockroaches, frogs.** Each gets a distinct behavior so levels can mix them:
- **Frogs** — hop in arcs, telegraphed; good intro enemy.
- **Cockroaches** — fast, low, swarm in numbers (these carry the late-game Vampire-Survivors density).
- **Dinosaurs** — bigger, tankier, mini-threats; some are mini-boss-tier.

---

## 10. Bosses

**A boss at the end of every level**, escalating.

### 10.1 The Grumpis Scrumption (recurring family of bosses)
The big stinky horned monster from Josie's brief. Crucially, **it has a family** — so the Grumpis Scrumptions recur as a *clan*:
- **Papa Grumpis** — gigantic, horns, infamously stinky armpits (a **stink cloud** attack — area-denial gas you must platform around).
- **The big babies** — *"almost a grownup,"* so they're near-full-size mini-bosses, not easy adds. They fight in pairs.

*Designer's note: turning "he has a family too" into a recurring boss family gives the early/mid game structure and pathos — these are creatures with babies, just like the player.*

### 10.2 The Big Hog Dog (final boss)
- Launches **yucky mushrooms** as projectiles (avoid or deflect; touching them hurts/poisons).
- **Wants to steal your babies** — the stakes. *We hate him.* (Josie was clear.)

### 10.3 Mecha Swan finale
At the very end you transform into a **Giant Mecha Swan** with **more powers and more strength than the boss** — a deliberately over-powered victory-lap fight. The brief wants you to *feel* stronger than him here, so this fight is a power-fantasy crescendo, not a fair duel.

---

## 11. Level progression & difficulty curve

- **Worlds escalate in strangeness and difficulty.** Early levels read normal; later ones pile on enemies, hazards, and screen-chaos in the **Vampire Survivors** sense Dad asked for — *and your powers become intensely overpowered in parallel*, so the screen is mayhem on both sides.
- **The lake gauntlet.** Josie's core loop ("press the button, be a swan, go to the end of the lake, fight the boss") is the **template for every level**: traverse → escalate → boss → reward.
- **Rewards between levels.** Beating the big boss yields the gold medal, the giant point payout, and *"lots more games with lots of upgrades"* — i.e., **New Game+ / unlockable harder remixes** and a deeper upgrade pool open up after the first clear.

---

## 12. The home hub (tall house + elevator)

- The **impossibly tall house** is the **hub / level select**. The **elevator** travels between floors; **each floor is a world**. Ride up to choose where to dive.
- **The room is always neat** — a calm, tidy home base between dream-runs (and a gentle running joke, since the dream is the opposite of tidy). *Designer's note: Josie wanted the neat room "to happen in the game," so the hub literally enforces tidiness — a small place that's always in order.*
- The lake sits at the base of the house; pressing the invisible button at the lake launches a run.

---

## 13. Special event: the tree rescue ("Call 911")

A scripted **rescue beat** that can appear in any level: *a fire up a tree, and a **baby swan stuck** in it.* "Yay, mobilize" becomes a co-op micro-objective:
- Put out the fire (water/Mermaid splash, or Tree-power, or stomp the flame source) and **carry the baby swan to safety** for a big Happiness + points bonus.
- *Designer's note: great co-op moment — one player clears the fire, the other catches the swan.*

---

## 14. The giant spoon

A **melee weapon** that appears in **some sections** — a big swingable spoon for whacking enemies and deflecting Hog-Dog mushrooms. *Implemented as a stage-specific pickup so it stays special, per "in some parts of the game."*

---

## 15. Co-op design

- Two players, shared screen, drag-scroll camera that frames both (with a tether limit).
- Players can **carry / toss** each other and **share treasure-box choices** (one picks Fire, one picks Tree — combos).
- Charmgirl's T-Rex form and the Swan's transformations are designed to **complement**: tank + ranged, smash + glide.

---

## 16. Audio

- **Per-level chiptune** that is *cute and intentionally a little bad* — earnest bootleg-NES energy.
- Tracks get **stranger each level** to match the visuals; the final level's theme is overdriven and unhinged.
- Sweet-treat pickup, transform, boss-stagger, and the "AGH alligator" sting all get signature SFX.

---

## 17. Win condition & ending

1. Beat the **Big Hog Dog** as the **Mecha Swan**, saving the babies.
2. Receive the **Gold Medal** — rendered as **Mardi Gras beads** (the literal trophy Josie chose).
3. Massive point payout (**ten million+**).
4. **The ending image:** a **momma sea turtle and her baby sea turtles** at the lake — calm after the storm. Fade out. That's the ending.

---

## 18. Build order (suggested, so this is actually shippable)

1. **Core movement/physics + tight hitboxes** (§4) on a gray-box test level. Get it feeling better than SMB before any art.
2. **Swan ⇄ Mermaid transform + costume-shed mechanic** (§5).
3. **Happiness meter + sweet-treat capsules** (§7) — the pacing system.
4. **One full level**: frogs/roaches/dinos, popcorn/stars, a Grumpis Scrumption boss, end-of-level name-spelling store (§8).
5. **Co-op + Charmgirl/T-Rex moonlight** (§3, §15).
6. **Treasure-box powers** (§6.2), then **stackable upgrades** (§6.1).
7. **Hub house + elevator level select** (§12).
8. **Difficulty escalation, swarm density, Hog-Dog finale, Mecha Swan** (§10–§11).
9. Audio pass (§16), the tree-rescue event (§13), the spoon (§14), polish.

---

## Appendix A — Josie-to-build glossary

| Josie's word | In the game |
|---|---|
| The unvisible button / invisible phone | Transform menu; toggle UI appears only while transform is held |
| Grumpis Scrumption | Recurring stinky horned boss family (Papa + near-grown babies) |
| Big hog dog | Final boss; throws yucky mushrooms; steals babies |
| Goose feet / laser eyes | Stackable upgrades |
| Treasure box (fire / pink / tree / Kirby) | Star-gated chosen powers |
| Cat face that's actually an alligator | Fake-friendly mermaid-zone enemy ("AGH!") |
| Popcorn / stars | Points / treasure currency |
| Sweet treats in plastic balls | Happiness refills (gachapon capsules) |
| Mardi Gras beads | The gold-medal victory trophy |
| Charmgirl | Pink T-Rex co-op character; werewolf-style moon transform |
| Mecha swan | Endgame super-form |
| Momma + baby sea turtles | The ending |

---

*Designed by Josie. Made coherent (and over-engineered, as requested) for Josie.*
