"use strict";
/* =====================================================================
 *  STORY — opening cards for the worlds whose JSON doesn't carry any
 *  (1–6 and 9). Used as a fallback by Game.enterLevel: a level.story
 *  in the JSON always wins, so the levelgen pipeline stays untouched.
 *  House style: dream logic, four-year-old canon, never more than a
 *  few cards — the mystery is fun only if it never blocks the game.
 * ===================================================================== */
const STORY = {
  1: [
    ["THE DREAM LAKE", "",
     "one night the moon leaned in very close",
     "and said: YOU ARE THE SWAN.",
     "FLEX ACCORDINGLY."],
    ["the baby swans were sleeping on the lake.",
     "something grumpy was watching them.", "",
     "(you can feel it. it has a jr.)"],
  ],
  2: [
    ["MOONLIGHT LAKE", "",
     "the same lake, but at night —",
     "which makes it a different lake.", "",
     "the fireflies know the way."],
  ],
  3: [
    ["THE DEEP", "",
     "it turns out the lake has a downstairs.",
     "hold the unvisible button to be a mermaid.", "",
     "(something big lives down here.", "it has a dad voice.)"],
  ],
  4: [
    ["CANDY CLOUDS", "",
     "this part of the dream is made of sugar.",
     "do not eat the platforms.", "",
     "(okay. eat a few.)"],
  ],
  5: [
    ["THE FEVER SWARM", "",
     "the dream got too warm and started buzzing.",
     "the BIG HOG DOG is here somewhere,",
     "breathing his hot dog breath.", "",
     "we hate him."],
  ],
  6: [
    ["MOONFLEX FINALE", "",
     "the moon said: okay. NOW.",
     "now you may be THE GIANT MECHA SWAN.", "",
     "go get the babies back."],
  ],
  9: [
    ["SECRET COVE", "",
     "shhh. this cove is not on the map.",
     "(you are on the map. the cove isn't.)", "",
     "the bad dreams hide here when they lose."],
  ],
};
