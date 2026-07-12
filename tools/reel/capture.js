/* =====================================================================
 *  PROMO REEL — capture.js
 *  Drives the live game with Playwright and records hero moments as
 *  webm segments WITH the game's own WebAudio sound:
 *    canvas.captureStream(60)  +  a MediaStreamAudioDestinationNode
 *  tapped off AudioSys's master gain (grabbed via a createGain hook —
 *  the first gain the page ever makes IS the master), muxed into one
 *  MediaRecorder per scene.
 *
 *  In-game MUSIC is silenced during gameplay scenes (SFX stay!) so a
 *  separately-recorded continuous chiptune bed ("biggest", 144bpm) can
 *  carry the whole reel without two songs fighting.
 *
 *  Usage:  node tools/reel/capture.js
 *  Needs:  the game served at http://127.0.0.1:8099 (python -m http.server 8099)
 *          Playwright installed at C:\Users\Mercardib\pw-drive
 *  Output: tools/reel/out/seg/*.webm  (gitignored)
 * ===================================================================== */
const { chromium } = require("C:/Users/Mercardib/pw-drive/node_modules/playwright");
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "out", "seg");
fs.mkdirSync(OUT, { recursive: true });
const BASE = "http://127.0.0.1:8099";

const errors = [];

/* ---- record ms of canvas(+audio) on the current page -> webm file ---- */
async function record(page, ms, file, audioOnly = false) {
  const b64 = await page.evaluate(async ({ ms, audioOnly }) => {
    const tap = window.__audioTap || {};
    const tracks = [];
    if (!audioOnly)
      tracks.push(...document.getElementById("game").captureStream(60).getVideoTracks());
    let dest = null;
    if (tap.ac && tap.master) {
      dest = tap.ac.createMediaStreamDestination();
      tap.master.connect(dest);
      tracks.push(...dest.stream.getAudioTracks());
    }
    const rec = new MediaRecorder(new MediaStream(tracks), {
      mimeType: audioOnly ? "audio/webm;codecs=opus" : "video/webm;codecs=vp8,opus",
      videoBitsPerSecond: 14e6,
    });
    const chunks = [];
    rec.ondataavailable = e => chunks.push(e.data);
    const done = new Promise(r => (rec.onstop = r));
    rec.start();
    await new Promise(r => setTimeout(r, ms));
    rec.stop();
    await done;
    if (dest) tap.master.disconnect(dest);
    const buf = await new Blob(chunks).arrayBuffer();
    const u8 = new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < u8.length; i += 32768)
      s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
    return btoa(s);
  }, { ms, audioOnly });
  fs.writeFileSync(path.join(OUT, file), Buffer.from(b64, "base64"));
  console.log("  saved", file, (fs.statSync(path.join(OUT, file)).size / 1e6).toFixed(1) + "MB");
}

/* ---- boot a level: dismiss story cards, silence MUSIC (keep SFX) ---- */
async function boot(page, url, muteMusic = true) {
  await page.goto(BASE + url);
  await page.waitForTimeout(2000);
  await page.keyboard.press("KeyZ");                 // any key: wakes WebAudio
  for (let i = 0; i < 10; i++) {
    const st = await page.evaluate(() => Game.state);
    if (st !== "card") break;
    await page.keyboard.press("Enter");
    await page.waitForTimeout(280);
  }
  if (muteMusic)
    await page.evaluate(() => { AudioSys.playSong = () => {}; AudioSys.stopSong(); });
  // keep the star alive without the permanent i-frame blink
  await page.evaluate(() => {
    window.__god = setInterval(() => {
      if (typeof players !== "undefined" && players[0]) players[0].hearts = players[0].maxHearts;
    }, 300);
  });
  await page.waitForTimeout(200);
}

(async () => {
  const browser = await chromium.launch({
    headless: false,                                  // headed: solid 60fps rAF + audio clock
    args: ["--autoplay-policy=no-user-gesture-required", "--hide-scrollbars"],
  });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  // grab AudioSys's private master gain: the FIRST gain a page creates is it
  await ctx.addInitScript(() => {
    const AC = window.AudioContext || window.webkitAudioContext;
    const orig = AC.prototype.createGain;
    AC.prototype.createGain = function () {
      const g = orig.call(this);
      if (!window.__audioTap) window.__audioTap = { ac: this, master: g };
      return g;
    };
  });
  const page = await ctx.newPage();
  page.on("pageerror", e => errors.push("PAGEERROR: " + e.message));

  /* ============ 0. the music bed: THE BIGGEST DREAM, 28s, audio only ============ */
  console.log("bed: biggest (28s, audio only)");
  await page.goto(BASE + "/index.html");
  await page.waitForTimeout(1500);
  await page.keyboard.press("KeyZ");
  await page.waitForTimeout(300);
  await page.evaluate(() => { AudioSys.stopSong(); AudioSys.playSong("biggest", true); });
  await page.waitForTimeout(400);
  await record(page, 28000, "bed.webm", true);

  /* ============ 1. title screen: waving logo, stars, the paddling cast ============ */
  console.log("scene: title");
  await page.goto(BASE + "/index.html");
  await page.waitForTimeout(1800);
  await page.keyboard.press("KeyZ");
  await page.waitForTimeout(200);
  await page.evaluate(() => { AudioSys.playSong = () => {}; AudioSys.stopSong(); });
  await record(page, 3400, "title.webm");

  /* ============ 2. world 1 dash: hop-run with afterimages + dust ============ */
  console.log("scene: dash");
  await boot(page, "/index.html?level=1");
  await page.keyboard.down("ArrowRight");
  await page.keyboard.down("KeyC");
  const dashRec = record(page, 4400, "dash.webm");
  for (let i = 0; i < 5; i++) {                       // SMW hop-run
    await page.waitForTimeout(750);
    await page.keyboard.press("Space");
  }
  await dashRec;
  await page.keyboard.up("ArrowRight");
  await page.keyboard.up("KeyC");

  /* ============ 3. boss hits: stomping Grumpis Jr, sparks everywhere ============ */
  console.log("scene: boss");
  await page.evaluate(() => {                         // walk into the arena, wake him
    players[0].x = 1430; players[0].y = 140; players[0].vx = 0; players[0].vy = 0;
  });
  await page.waitForTimeout(700);                     // roar + shake land before the tape rolls
  await page.evaluate(() => {
    window.__stomper = setInterval(() => {            // real stomps: drop onto his head
      const b = Bosses.units[0];
      if (!b) return;
      b.hp = Math.max(b.hp, 2);                       // he suffers, but survives the shoot
      const p = players[0];
      if (p.vy >= 0 && p.y > b.y - 120) {
        p.x = b.x + b.w / 2 - p.w / 2; p.y = b.y - p.h - 30; p.vx = 0; p.vy = 3; p.iframes = 0;
      }
    }, 800);
  });
  await record(page, 4200, "boss.webm");
  await page.evaluate(() => clearInterval(window.__stomper));

  /* ============ 4. candy clouds: springs + sprinkles ============ */
  console.log("scene: candy");
  await boot(page, "/index.html?level=4");
  await page.keyboard.down("ArrowRight");
  await page.keyboard.down("KeyC");
  const candyRec = record(page, 3600, "candy.webm");
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(700);
    await page.keyboard.press("Space");
  }
  await candyRec;
  await page.keyboard.up("ArrowRight");
  await page.keyboard.up("KeyC");

  /* ============ 5. the checkpoint flag rises ============ */
  console.log("scene: flag");
  await boot(page, "/index.html?level=7");
  await page.evaluate(() => {                         // stand two steps left of the flag
    const f = World.pickups.find(pk => pk.type === "flag");
    const p = players[0];
    p.x = f.x - 52; p.y = f.y - 10; p.vx = 0; p.vy = 0;
  });
  await page.waitForTimeout(400);
  const flagRec = record(page, 3000, "flag.webm");
  await page.waitForTimeout(500);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(900);
  await page.keyboard.up("ArrowRight");
  await flagRec;

  /* ============ 6. world 12: the big guy's face dips low ============ */
  console.log("scene: bigguy");
  await boot(page, "/index.html?level=12");
  await page.evaluate(() => {                         // up to the flag ledge under the head
    const f = World.pickups.find(pk => pk.type === "flag" || pk.type === "flag_up");
    const p = players[0];
    p.x = f.x; p.y = f.y + 20 - p.h; p.vx = 0; p.vy = 0;
  });
  // wait for the fight to wake and the face to start a dip, then roll
  await page.waitForTimeout(800);
  for (let i = 0; i < 40; i++) {
    const st = await page.evaluate(() =>
      Game.state === "card" ? "card" : (Bosses.units[0] || {}).state);
    if (st === "card") { await page.keyboard.press("Enter"); await page.waitForTimeout(250); continue; }
    if (st === "dip") break;
    await page.waitForTimeout(200);
  }
  const bigRec = record(page, 4400, "bigguy.webm");
  await page.waitForTimeout(600);
  await page.evaluate(() => {                         // one clean face-bonk for the sparks
    const b = Bosses.units[0];
    if (b && b.state === "dip") { b.iframes = 0; Bosses.hitByBox({ x: b.x, y: b.y, w: b.w, h: b.h }, 1); }
  });
  await bigRec;

  /* ============ 7. DREAM CLEAR: fireworks over the tally ============ */
  console.log("scene: clear");
  await boot(page, "/index.html?level=1");
  await page.evaluate(() => {
    Game.score = 48250; Game.stars = 4; Game.babiesThisLevel = 1;   // a lived-in tally
    World.spawnTrophy("trophy");
    const t = World.pickups.find(pk => pk.type === "trophy");
    const p = players[0];
    p.x = t.x - 60; p.y = t.y - 10; p.vx = 0; p.vy = 0;
  });
  await page.waitForTimeout(300);
  const clearRec = record(page, 3800, "clear.webm");
  await page.waitForTimeout(300);
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(800);
  await page.keyboard.up("ArrowRight");
  await clearRec;

  console.log(errors.length ? "PAGE ERRORS:\n" + errors.join("\n") : "no page errors");
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})();
