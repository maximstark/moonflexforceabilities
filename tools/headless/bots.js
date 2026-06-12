// Traversal bots: actually walk/swim/fly every level with real physics.
// Mercy rules: 99 hearts, enemies cleared (combat is covered by tests.js);
// falls still teleport to lastSafe, so we count them as stumbles.
let passCount = 0, failCount = 0;
function check(label, cond, detail = "") {
  if (cond) { passCount++; console.log("  PASS  " + label); }
  else { failCount++; console.log("  FAIL  " + label + (detail ? "  [" + detail + "]" : "")); }
}
const tick = () => new Promise(r => setImmediate(r));
let stepCount = 0;
function step(n = 1) { for (let i = 0; i < n; i++) { update(); if (++stepCount % 4 === 0) render(); } }
const P = () => players[0];
function releaseAll() { for (const k of Object.keys(pads[0].held)) pads[0].held[k] = false; }

async function runBot(id, opts) {
  await Game.enterLevel(id);
  step(5);
  for (const e of enemies) e.alive = false;
  P().hearts = P().maxHearts = 99;
  level.happinessDrain = 0; Game.happiness = 100;   // no panic, no 1e8-segment HUD bars
  let frames = 0, falls = 0, jumpHold = 0, strokeCD = 0, diveTimer = 0, lastHearts = 99;
  const targetX = opts.targetX;
  while (P().x < targetX && frames < opts.maxFrames) {
    frames++;
    if (frames % 1200 === 0)
      console.log("    ...", opts.label.split(":")[0], "f=" + frames, "x=" + Math.round(P().x));
    if (P().hearts < lastHearts) { falls += lastHearts - P().hearts; lastHearts = P().hearts; }
    pads[0].held.right = true;
    if (P().form === "mecha") {
      // pulse the thrusters to cruise at mid height
      pads[0].held.jump = P().y > opts.cruiseY;
    } else if (P().inWater) {
      pads[0].held.jump = false; pads[0].held.down = false; jumpHold = 0;
      if (P().hitWall) {                                        // wall: surface and leap onto it
        if (--strokeCD <= 0) { pads[0].pressed.add("jump"); strokeCD = 5; }
      } else if (--strokeCD <= 0 && P().y > (opts.swimY || 110)) {
        pads[0].pressed.add("jump"); strokeCD = 9;
      }
    } else {
      pads[0].held.down = false;
      if (jumpHold > 0) { if (--jumpHold === 0) pads[0].held.jump = false; }
      if (P().grounded && jumpHold <= 0) {
        const ftx = Math.floor((P().x + P().w + 6) / TS);
        const fty = Math.floor((P().y + P().h + 2) / TS);
        const wtx = Math.floor((P().x + P().w + 3) / TS);
        const wty = Math.floor((P().y + P().h - 4) / TS);
        const gap = !isSolid(ftx, fty) && !isOneway(ftx, fty) && !isSolid(ftx, fty + 1);
        const wall = isSolid(wtx, wty) || isSolid(wtx, wty - 1);
        if (gap || wall) { pads[0].pressed.add("jump"); pads[0].held.jump = true; jumpHold = 18; }
      } else if (!P().grounded && jumpHold <= 0 && P().vy > 1.2 && P().flaps < T.FLAPS_MAX &&
                 !groundWithin(P(), 48)) {
        pads[0].pressed.add("jump");        // flap only over true void — never above a landing
      }
    }
    step();
  }
  releaseAll();
  const made = P().x >= targetX;
  check(opts.label + " (" + (frames / 60).toFixed(1) + "s, " + falls + " stumbles)",
        made && falls <= opts.maxFalls,
        "x=" + Math.round(P().x) + "/" + targetX + " falls=" + falls);
}

async function main() {
  await Game.boot();
  menuPad.pressed.add("confirm"); update();
  while (Game.state !== "play") { update(); await tick(); }

  await runBot(1, { label: "L1 dream lake: spawn -> boss arena", targetX: 1500, maxFrames: 6000, maxFalls: 2 });
  await runBot(2, { label: "L2 moonlight: spawn -> twins arena", targetX: 1950, maxFrames: 9000, maxFalls: 3 });
  await runBot(3, { label: "L3 the deep: swim across -> papa", targetX: 2150, maxFrames: 9000, maxFalls: 3, swimY: 120 });
  await runBot(4, { label: "L4 candy clouds: spawn -> reunion", targetX: 2100, maxFrames: 12000, maxFalls: 8 });
  await runBot(5, { label: "L5 fever swarm: spawn -> hog dog", targetX: 2450, maxFrames: 9000, maxFalls: 4 });
  await runBot(6, { label: "L6 finale: mecha flight -> final boss", targetX: 2700, maxFrames: 9000, maxFalls: 3, cruiseY: 130 });

  console.log("\n" + passCount + " passed, " + failCount + " failed");
  process.exit(failCount ? 1 : 0);
}
main().catch(e => { console.error("HARNESS CRASH:", e); process.exit(2); });
