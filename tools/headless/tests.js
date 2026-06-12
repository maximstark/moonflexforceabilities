// Full-game headless scenarios. Appended after the game modules by run.js.
let passCount = 0, failCount = 0;
function check(label, cond, detail = "") {
  if (cond) { passCount++; console.log("  PASS  " + label); }
  else { failCount++; console.log("  FAIL  " + label + (detail ? "  [" + detail + "]" : "")); }
}
const tick = () => new Promise(r => setImmediate(r));
function step(n = 1) { for (let i = 0; i < n; i++) { update(); render(); } }
async function waitState(st, max = 600) {
  for (let i = 0; i < max; i++) { if (Game.state === st) return true; update(); await tick(); }
  return false;
}
function press(pad, a) { pad.pressed.add(a); pad.held[a] = true; }
function tap(pad, a) { pad.pressed.add(a); }
function releaseAll() {
  for (const k of Object.keys(pads[0].held)) pads[0].held[k] = false;
  for (const k of Object.keys(menuPad.held)) menuPad.held[k] = false;
  if (pads[1]) for (const k of Object.keys(pads[1].held)) pads[1].held[k] = false;
}
const P = () => players[0];
function groundY(p) { return p.y + p.h; }
async function gotoLevel(id) {
  const pr = Game.enterLevel(id);
  await pr; step(2);
}
async function stompUnit(b, maxTries = 40) {
  for (let t = 0; t < maxTries && b.hp > 0; t++) {
    const p = P();
    p.x = b.x + b.w / 2 - p.w / 2; p.y = b.y - p.h - 12; p.vx = 0; p.vy = 2;
    p.iframes = 0; p.dead = false; p.hearts = p.maxHearts;
    for (let i = 0; i < 30; i++) { step(); if (b.iframes > 0 || b.hp <= 0) break; }
    while (b.iframes > 0 && b.hp > 0) { P().y = b.y - 90; P().vy = 0; step(); }
  }
  return b.hp <= 0;
}

async function main() {
  /* ============ boot & title ============ */
  await Game.boot();
  check("boot reaches title", Game.state === "title");
  check("all sheets loaded (incl. forge2)", Object.keys(sheets).length >= 37, Object.keys(sheets).length);
  tap(menuPad, "confirm"); update();
  check("title starts a run (hub loads)", await waitState("play") && Game.levelId === "hub");

  /* ============ hub: floor, elevator, doors ============ */
  step(60);
  check("player stands in the hub", P().grounded, "y=" + P().y);
  check("hub does not drain happiness", Game.happiness === T.HAPPINESS_MAX);
  // ride the elevator up one stop
  const elevStops = level.elevator.stops;
  P().x = level.elevator.x + 6; P().y = elevStops[0] - P().h; P().vy = 0;
  step(3);
  tap(pads[0], "action"); step(2);
  let rode = false;
  for (let i = 0; i < 600; i++) { step(); if (Math.abs(groundY(P()) - elevStops[1]) < 3) { rode = true; break; } }
  check("elevator carries you up a floor", rode, "feetY=" + groundY(P()) + " want " + elevStops[1]);
  // locked door refuses
  const door2 = level.doors.find(d => d.level === 2);
  P().x = door2.x; P().y = door2.y - P().h + 14; P().vy = 0; step(5);
  tap(pads[0], "down"); step(3);
  check("locked floor 2 door refuses entry", Game.levelId === "hub");
  // unlocked door 1 enters
  const door1 = level.doors.find(d => d.level === 1);
  P().x = door1.x; P().y = door1.y; P().vy = 0; step(5);
  tap(pads[0], "down"); update();
  check("door 1 enters THE DREAM LAKE", await waitState("play", 900) && Game.levelId === 1, Game.levelId);

  /* ============ the sacred movement regression ============ */
  step(60);
  const baseY = groundY(P());
  check("L1 spawn ground intact (192)", P().grounded && baseY === 192, baseY);
  let minY = 999;
  press(pads[0], "jump");
  for (let i = 0; i < 50; i++) { step(); minY = Math.min(minY, P().y); }
  const fullJump = baseY - (minY + P().h);
  check("full jump height preserved (50-70px)", fullJump >= 50 && fullJump <= 70, fullJump);
  releaseAll(); step(60);
  minY = 999;
  tap(pads[0], "jump"); pads[0].held.jump = true; step(1); pads[0].held.jump = false;
  for (let i = 0; i < 50; i++) { step(); minY = Math.min(minY, P().y); }
  const tapJump = baseY - (minY + P().h);
  check("tap jump still a hop (<60% of full)", tapJump > 4 && tapJump < fullJump * 0.6, tapJump);
  step(40);
  // buffered jump near the ground still wins over the new flap
  P().x = 96; P().y = 120; P().vy = 0; P().flaps = 0;
  let buffered = false, jumped = false;
  for (let i = 0; i < 90; i++) {
    if (!buffered && P().vy > 0 && groundY(P()) > 178) { press(pads[0], "jump"); buffered = true; }
    step();
    if (buffered && P().vy < -4) { jumped = true; break; }
  }
  check("jump buffering survives the flap feature", jumped, "vy=" + P().vy.toFixed(2));
  releaseAll(); step(40);
  // flaps: two extra mid-air boosts high above ground
  P().x = 60; P().y = 160; P().vy = 0; step(2);
  press(pads[0], "jump"); step(12); releaseAll();
  const before = P().flaps;
  tap(pads[0], "jump"); step(2);
  check("mid-air flap fires when high up", P().flaps === before + 1, P().flaps);
  releaseAll(); step(80);

  /* ============ L1: lilypads are one-way, water works ============ */
  P().x = 57 * 16 + 2; P().y = 150; P().vy = 0;
  let landed = false;
  for (let i = 0; i < 60; i++) { step(); if (P().grounded) { landed = true; break; } }
  check("lilypad catches you from above (one-way)", landed && Math.abs(groundY(P()) - 192) < 2, groundY(P()));
  press(pads[0], "down"); tap(pads[0], "jump"); step(26); releaseAll();
  check("down+jump drops through the lilypad into the lake", P().inWater);
  tap(pads[0], "transform"); step(2);
  check("mermaid toggle still works", P().form === "mermaid");
  step(20);

  /* ============ L1 boss: Grumpis Jr ============ */
  P().x = 1500; P().y = 160; P().vy = 0; P().form = "swan"; step(8);
  check("grumpis activates", Bosses.activated);
  const g1 = Bosses.units[0];
  check("grumpis dies to stomps", await stompUnit(g1));
  let trophy = null;
  for (let i = 0; i < 200 && !trophy; i++) { step(); trophy = World.pickups.find(pk => pk.type === "trophy"); }
  check("trophy spawns at the goal", !!trophy);
  P().x = trophy.x; P().y = trophy.y - 4; P().vx = 0; P().vy = 0; P().iframes = 0; step(3);
  check("trophy triggers DREAM CLEAR", Game.state === "clear");
  check("clear unlocks floor 2", save.unlocked >= 2);
  while (Game.state === "clear") step();
  check("clear leads to the name store", Game.state === "store");
  tap(menuPad, "confirm"); step(2);                     // buy 'A' (cursor stays at 0)
  for (let i = 0; i < 27; i++) { tap(menuPad, "right"); step(1); }   // 0 -> 27 = END
  tap(menuPad, "confirm"); step(2);
  // whether END landed or letters ran out, we must be back in the hub eventually
  check("store completes back to the hub", await waitState("play", 900) && Game.levelId === "hub",
        Game.state + "/" + Game.levelId);
  check("high score recorded", save.highScores.length >= 1);

  /* ============ L2: goose feet, pound, tree rescue, twins ============ */
  await gotoLevel(2); step(20);
  check("L2 loads moonlight lake", level.name === "MOONLIGHT LAKE");
  const gf = World.pickups.find(pk => pk.type === "pickup_goosefeet");
  P().x = gf.x; P().y = gf.y; P().vy = 0; step(3);
  check("goose feet worn from pickup", has(P(), "goosefeet"));
  // moon -> moonflex (solo swan)
  const moon = World.pickups.find(pk => pk.type === "moon");
  P().x = moon.x; P().y = moon.y; P().vy = 0; step(3);
  check("moon grants MOONFLEX to the swan", P().moonTimer > 0);
  // tree rescue: stomp the three fires
  const scoreBeforeRescue = Game.score;
  let firesOut = 0;
  for (const [c, r] of [[77, 4], [80, 4], [83, 4]]) {
    P().x = c * 16 + 2; P().y = r * 16 - P().h - 10; P().vx = 0; P().vy = 2; P().iframes = 200;
    for (let i = 0; i < 40; i++) { step(); if (grid[r][c] === -1) { firesOut++; break; } }
  }
  check("all three tree fires stomped out", firesOut === 3, firesOut);
  check("rescue pays the bonus", Game.score >= scoreBeforeRescue + T.POINTS_RESCUE);
  const baby = World.pickups.find(pk => pk.type === "babyswan");
  P().x = baby.x; P().y = baby.y; P().vy = 0; step(3);
  check("baby swan rescued (carried)", P().carrying === 1);
  // shed: drop the goose feet
  P().moonTimer = 0;
  tap(pads[0], "shed"); step(3);
  check("shed jumps out of the costume", !has(P(), "goosefeet") &&
        World.pickups.some(pk => pk.type === "pickup_goosefeet" && !pk.taken && pk.grace > 0));
  // twins
  P().x = 1950; P().y = 150; P().vy = 0; step(10);
  const twins = Bosses.units;
  check("the twins are two grumpises", twins.length === 2);
  await stompUnit(twins[0]);
  const survivor = Bosses.units.find(b => b.hp > 0);
  check("surviving twin enrages", survivor && survivor.rage > 1);
  check("second twin falls", await stompUnit(survivor));
  step(120);
  check("twins clear spawns trophy", World.pickups.some(pk => pk.type === "trophy"));

  /* ============ L3: the deep — alligator gag, papa ============ */
  await gotoLevel(3); step(10);
  const gator = enemies.find(e => e.type === "alligator");
  P().x = gator.x - 30; P().y = gator.y; P().vx = 0; P().vy = 0; step(4);
  check("cat face reveals itself: AGH (alligator!)", gator.state !== "idle", gator.state);
  // chest chooser
  Game.stars = 3;
  const chest = World.pickups.find(pk => pk.type === "chest");
  P().x = chest.x; P().y = chest.y - 10; P().vy = 0; P().inWater = true; step(4);
  check("3 stars open the treasure box", Game.state === "chooser");
  tap(menuPad, "confirm"); step(2);                      // pick FIRE
  check("fire power chosen", P().power === "fire" && Game.state === "play");
  tap(pads[0], "action"); step(2);
  check("fireball flies", projectiles.some(pr => pr.kind === "fireball"));
  // papa
  P().x = 2200; P().y = 60; P().vy = 0; step(12);
  const papa = Bosses.units[0];
  check("papa grumpis stirs the deep", Bosses.activated && papa.sub === "papa");
  let surfaced = false;
  for (let i = 0; i < 900; i++) { step(); if (papa.state === "vulnerable" || papa.state === "spit" || papa.state === "swat") { surfaced = true; break; } }
  check("papa surfaces between the lilypads", surfaced, papa.state);
  let papaDead = false;
  for (let t = 0; t < 30 && !papaDead; t++) {
    while (!"vulnerable spit swat".includes(papa.state) && papa.state !== "dying") step();
    if (papa.state === "dying") break;
    await stompUnit(papa, 3);
    papaDead = papa.hp <= 0;
  }
  check("papa grumpis defeated", papaDead || papa.state === "dying");

  /* ============ L4: springs, mush vault, the family ============ */
  await gotoLevel(4); step(10);
  // spring bounce
  P().x = 13 * 16 + 2; P().y = 9 * 16 - P().h - 30; P().vx = 0; P().vy = 0;
  let sprung = false;
  for (let i = 0; i < 80; i++) { step(); if (P().vy < -7) { sprung = true; break; } }
  check("springs launch hard", sprung, "vy=" + P().vy.toFixed(1));
  // pound the mush vault open
  wearCostume(P(), "goosefeet");
  P().x = 60 * 16 + 1; P().y = 16; P().vx = 0; P().vy = 0; step(2);
  tap(pads[0], "down"); step(1);
  check("ground pound engages midair", P().pounding);
  let broke = false;
  for (let i = 0; i < 90; i++) { step(); if (grid[6][60] === -1) { broke = true; break; } }
  check("pound smashes the mush blocks", broke);
  // the whole family
  P().x = 2150; P().y = 120; P().vy = 0; step(12);
  check("family reunion: three bosses", Bosses.units.length === 3, Bosses.units.length);
  let famOK = true;
  for (const b of [...Bosses.units]) {
    if (b.sub === "papa") {
      for (let i = 0; i < 200 && !"windup spit".includes(b.state); i++) step();
      famOK = await stompUnit(b, 60) && famOK;
    } else famOK = await stompUnit(b, 60) && famOK;
  }
  check("the whole grumpis family goes home", famOK);

  /* ============ L5: swarm, spoon deflect, the hog dog flees ============ */
  await gotoLevel(5); step(10);
  check("the fever swarm is dense (30+ enemies)", enemies.length >= 30, enemies.length);
  wearCostume(P(), "spoon");
  P().x = 400; P().y = 100; P().vx = 0; P().vy = 0; P().iframes = 9999;
  spawnProjectile("mushroom", P().x + 30, P().y + 4, -1.5, 0, "enemy", 1);
  press(pads[0], "right"); tap(pads[0], "action"); step(3); releaseAll();
  check("the giant spoon deflects mushrooms", projectiles.some(pr => pr.kind === "mushroom" && pr.side === "player"));
  // hog dog
  P().x = 2480; P().y = 140; P().vy = 0; P().iframes = 0; step(12);
  const hog = Bosses.units[0];
  check("the BIG HOG DOG appears", Bosses.activated && hog.sub === "hog");
  await stompUnit(hog, 60);
  check("beaten, he grabs the babies and flees", hog.fleeing === true || Game.cardQueue.length > 0 || Game.state === "card");
  await waitState("card", 300);
  check("the steal cutscene plays", Game.state === "card");
  tap(menuPad, "confirm"); step(2);
  let trophy5 = null;
  for (let i = 0; i < 400 && !trophy5; i++) { step(); trophy5 = World.pickups.find(pk => pk.type === "trophy"); }
  check("the chase goal appears", !!trophy5);

  /* ============ L6: MECHA SWAN finale ============ */
  await gotoLevel(6); step(10);
  check("you are the GIANT MECHA SWAN", P().form === "mecha" && P().maxHearts === T.MECHA_HEARTS);
  const y0 = P().y; press(pads[0], "jump"); step(30);
  check("the mecha flies", P().y < y0 - 20, (y0 - P().y).toFixed(0));
  releaseAll();
  // smash through a mush wall by flying into it
  P().x = 19 * 16; P().y = 10 * 16; P().vx = 2; step(20);
  check("mecha smashes mush walls by existing", grid[10][20] === -1);
  // laser the final boss
  P().x = 2700; P().y = 120; P().vy = 0; step(12);
  const hogf = Bosses.units[0];
  check("final hog dog awaits (14 hp)", hogf && hogf.maxHp === T.HOGF_HP);
  let lasered = 0;
  for (let i = 0; i < 1200 && hogf.hp > 0; i++) {
    P().x = hogf.x - 160; P().y = hogf.y + 10; P().vy = 0; P().iframes = 9999;
    P().facing = 1;
    if (P().atkCD <= 0) { tap(pads[0], "action"); lasered++; }
    step();
  }
  check("laser eyes carve him down (power fantasy)", hogf.hp <= 0, "hp=" + hogf.hp + " shots=" + lasered);
  let beads = null;
  for (let i = 0; i < 400 && !beads; i++) { step(); beads = World.pickups.find(pk => pk.type === "beads"); }
  check("the Mardi Gras beads appear", !!beads);
  const scorePre = Game.score;
  P().x = beads.x; P().y = beads.y - 6; P().vx = 0; P().vy = 0; P().iframes = 0; step(4);
  check("beads pay TEN MILLION points", Game.score >= scorePre + T.POINTS_FINALE);
  check("the ending begins (turtles)", Game.state === "ending");
  step(340); tap(menuPad, "confirm"); step(2);
  check("credits roll", Game.state === "credits");
  tap(menuPad, "confirm"); step(2);
  check("final store opens with million-point letters", Game.state === "store");
  // buy 2 letters at 1,000,000 then END
  tap(menuPad, "confirm"); step(1);
  for (let i = 0; i < 27; i++) { tap(menuPad, "right"); step(1); }
  tap(menuPad, "confirm"); step(2);
  check("final score recorded in the hall", Game.state === "scores" && save.highScores.length >= 2,
        Game.state);
  tap(menuPad, "confirm"); step(2);
  check("back to title; the dream can begin again", Game.state === "title");

  /* ============ co-op ============ */
  tap(menuPad, "confirm"); update(); await waitState("play");
  joinP2(); step(2);
  check("charmgirl drops in", coop && players.length === 2 && players[1].character === "charmgirl");
  grantMoon(players[1]); step(2);
  check("moonlight makes her a T-REX", players[1].form === "trex");
  players[1].moonTimer = 1; step(2);
  check("the moon sets; small again", players[1].form === "charmgirl");
  players[0].hearts = 1; players[0].iframes = 0;
  hurtPlayer(players[0], players[0].x + 50); step(2);
  check("P1 down but P2 keeps the dream alive", players[0].dead && Game.state === "play");
  let revived = false;
  for (let i = 0; i < 200; i++) { step(); if (!players[0].dead) { revived = true; break; } }
  check("fallen player respawns beside the buddy", revived);

  console.log("\n" + passCount + " passed, " + failCount + " failed");
  process.exit(failCount ? 1 : 0);
}
main().catch(e => { console.error("HARNESS CRASH:", e); process.exit(2); });
