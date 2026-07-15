# MoonFlexForceAbilities v2 — Visual North Star

## The promise

MoonFlex should look like a treasured storybook cartridge that somehow came
alive: warm, handmade, surprising, and lavish without losing the clarity of a
great 16-bit platformer. Josie's dream logic is the identity. Every visual
choice should make that identity easier to read, not sand it into generic
fantasy polish.

## Pillars

1. **Handmade, not sterile.** Use irregular silhouettes, colored-pencil grain,
   waxy highlights, paper-like skies, and slightly imperfect repetition.
2. **Animation is acting.** Every important character needs anticipation,
   contact, follow-through, recovery, blinking, and a personality-rich idle.
3. **Each dream has a material.** The lake is watercolor and crayon; moonlight
   is ink and silver pencil; the deep is translucent gouache; candy is chalk
   and frosting; fever is torn paper and neon pastel; the finale is metallic
   foil over a child's drawing.
4. **Gameplay reads first.** Interactive edges remain crisp. Background detail
   loses contrast near the play plane. Hazards never share the player's value
   and hue at the same time.
5. **Big moments earn spectacle.** Boss reveals, transformations, rescues, and
   dream clears get bespoke staging instead of simply adding more particles.

## World 1 vertical slice

The Dream Lake establishes the complete production grammar before the other
worlds are rebuilt.

- Swan: 12-frame locomotion family, 6-frame swim, 5-frame jump/flap, blink and
  preen idles, distinct takeoff/landing silhouettes.
- Frog: squash-and-stretch hop with a readable crouch and soft landing.
- Grumpis: breathing mass, eye direction, arm anticipation, impact recovery,
  and a hurt pose that preserves dignity and comedy.
- Terrain: 16 px collision cells may assemble into larger 32–64 px motifs so
  the grid disappears. Add edge variants, roots, stones, flowers, and reeds.
- Lake: three depth layers, broken sunset reflections, bank shadows, drifting
  pollen, foreground reeds, and ripples tied to movement.
- HUD: illustrated icons and frames with quieter inactive states. Keep the
  playfield clear and preserve immediate health/happiness recognition.

## Technical rules

- Preserve the 384×240 gameplay viewport during the vertical slice.
- Preserve entity hitboxes and level JSON geometry.
- Keep source generation reproducible; generated sheets are committed, but
  their source definitions remain authoritative.
- Add animation frames through manifest metadata rather than positional magic.
- Use deterministic ambient animation so screenshots and replays are stable.
- Treat reference images as private mood boards. Do not copy or ship them.

## Acceptance bar

At gameplay scale, the player should understand the scene in one glance. At a
paused close look, every major surface should reward attention. In motion, the
game should feel more alive even when the player is standing still.
