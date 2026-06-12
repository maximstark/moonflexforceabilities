"use strict";
/* =====================================================================
 *  PHYSICS — tile collision (with one-way platforms, springs, breakable
 *  blocks, fire), water volumes, and the corner-corrected mover.
 *  The mover is byte-for-byte the slice's feel; new tile classes only
 *  add behaviors, never change the response curve.
 * ===================================================================== */
let level = null, grid = null, gridW = 0, gridH = 0, waterRects = [];
let tileIdx = null;       // name -> grid index for the current level
let SOLID = new Set(), ONEWAY = new Set(), BOUNCE = new Set(), HAZARD = new Set(), BREAK = new Set();

const SOLID_NAMES = ["grass_top","dirt","edge_left","edge_right","rock_top","rock_fill",
                     "cloud_top","cloud_fill","candy_top","candy_fill","night_grass",
                     "night_dirt","tree_trunk","wall","floor","roof_l","roof_r","mush_block"];
// fire is one-way so it can be stomped out from above (the rescue verb);
// springs are one-way so you can hop up through and bounce off the top
const ONEWAY_NAMES = ["platform","lilypad","fire1","spring1"];
const BOUNCE_NAMES = ["spring1"];
const HAZARD_NAMES = ["fire1"];
const BREAK_NAMES  = ["mush_block"];

function buildTileSets() {
  tileIdx = {};
  level.tileNames.forEach((n, i) => tileIdx[n] = i);
  const mk = names => new Set(names.filter(n => n in tileIdx).map(n => tileIdx[n]));
  SOLID = mk(SOLID_NAMES); ONEWAY = mk(ONEWAY_NAMES); BOUNCE = mk(BOUNCE_NAMES);
  HAZARD = mk(HAZARD_NAMES); BREAK = mk(BREAK_NAMES);
  waterRects = level.water.map(([tx, ty, tw, th]) => ({ x: tx*TS, y: ty*TS, w: tw*TS, h: th*TS }));
}

function tileAt(tx, ty) {
  if (tx < 0 || tx >= gridW) return -2;            // -2 = world edge (solid)
  if (ty < 0 || ty >= gridH) return -1;
  return grid[ty][tx];
}
function isSolid(tx, ty) {
  const t = tileAt(tx, ty);
  return t === -2 || (t >= 0 && SOLID.has(t));
}
function isOneway(tx, ty) {
  const t = tileAt(tx, ty);
  return t >= 0 && ONEWAY.has(t);
}
function rectHitsSolid(x, y, w, h) {
  const x0 = Math.floor(x / TS), x1 = Math.floor((x + w - 0.001) / TS);
  const y0 = Math.floor(y / TS), y1 = Math.floor((y + h - 0.001) / TS);
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++)
      if (isSolid(tx, ty)) return true;
  return false;
}
function groundWithin(e, d) {
  const x0 = Math.floor(e.x / TS), x1 = Math.floor((e.x + e.w - 0.001) / TS);
  const y0 = Math.floor((e.y + e.h) / TS), y1 = Math.floor((e.y + e.h + d) / TS);
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++)
      if (isSolid(tx, ty) || isOneway(tx, ty)) return true;
  return false;
}
function pointInWater(x, y) {
  for (const r of waterRects)
    if (x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h) return r;
  return null;
}

/* Axis-separated AABB mover.
 * opts.corner  -> player corner correction (ledge-lip + ceiling-edge)
 * opts.oneway  -> land on one-way platforms (drop through with down+jump handled by caller)
 * opts.dropThrough -> skip one-way landings this frame
 * After: e.grounded, e.hitWall, e.bounced (spring), e.standTile {tx,ty,t}
 */
function moveAndCollide(e, opts = {}) {
  e.hitWall = false; e.bounced = false; e.standTile = null;

  // --- X axis ---
  e.x += e.vx;
  if (e.vx !== 0) {
    const dir = Math.sign(e.vx);
    const tx = Math.floor((dir > 0 ? e.x + e.w - 0.001 : e.x) / TS);
    const ty0 = Math.floor(e.y / TS), ty1 = Math.floor((e.y + e.h - 0.001) / TS);
    const hits = [];
    for (let ty = ty0; ty <= ty1; ty++) if (isSolid(tx, ty)) hits.push(ty);
    if (hits.length) {
      let resolved = false;
      if (opts.corner && !e.grounded && hits.length === 1 && hits[0] === ty1) {
        const pen = (e.y + e.h) - ty1 * TS;
        if (pen > 0 && pen <= T.CORNER_CORRECTION_PX &&
            !rectHitsSolid(e.x, ty1 * TS - e.h, e.w, e.h)) {
          e.y = ty1 * TS - e.h;
          resolved = true;
        }
      }
      if (!resolved) {
        e.x = dir > 0 ? tx * TS - e.w : (tx + 1) * TS;
        e.vx = 0; e.hitWall = true;
      }
    }
  }

  // --- Y axis ---
  const prevBottom = e.y + e.h;
  e.y += e.vy;
  e.grounded = false;
  if (e.vy !== 0) {
    const dir = Math.sign(e.vy);
    const ty = Math.floor((dir > 0 ? e.y + e.h - 0.001 : e.y) / TS);
    const tx0 = Math.floor(e.x / TS), tx1 = Math.floor((e.x + e.w - 0.001) / TS);
    const hits = [];
    for (let tx = tx0; tx <= tx1; tx++) {
      if (isSolid(tx, ty)) { hits.push(tx); continue; }
      // one-way: only when falling, only if we were above the lip last frame
      if (dir > 0 && opts.oneway && !opts.dropThrough && isOneway(tx, ty) &&
          prevBottom <= ty * TS + 4) hits.push(tx);
    }
    if (hits.length) {
      let resolved = false;
      if (dir < 0 && opts.corner && hits.length === 1) {
        if (hits[0] === tx0) {
          const pen = (tx0 + 1) * TS - e.x;
          if (pen <= T.CORNER_CORRECTION_PX && !rectHitsSolid((tx0 + 1) * TS, e.y, e.w, e.h)) {
            e.x = (tx0 + 1) * TS; resolved = true;
          }
        } else if (hits[0] === tx1) {
          const pen = (e.x + e.w) - tx1 * TS;
          if (pen <= T.CORNER_CORRECTION_PX && !rectHitsSolid(tx1 * TS - e.w, e.y, e.w, e.h)) {
            e.x = tx1 * TS - e.w; resolved = true;
          }
        }
      }
      if (!resolved) {
        if (dir > 0) {
          e.y = ty * TS - e.h; e.grounded = true;
          const stx = clamp(Math.floor((e.x + e.w / 2) / TS), 0, gridW - 1);
          const st = tileAt(stx, ty);
          e.standTile = { tx: stx, ty, t: st };
          if (st >= 0 && BOUNCE.has(st)) e.bounced = true;
        } else {
          e.y = (ty + 1) * TS;
        }
        e.vy = 0;
      }
    }
  }
}

/* breakable blocks */
function breakBlockAt(tx, ty) {
  const t = tileAt(tx, ty);
  if (t >= 0 && BREAK.has(t)) {
    grid[ty][tx] = -1;
    World.burstAt(tx * TS + 8, ty * TS + 8, "poof", 4);
    AudioSys.sfx("breakblock");
    return true;
  }
  return false;
}
function breakBlocksInRect(x, y, w, h) {
  let n = 0;
  const x0 = Math.floor(x / TS), x1 = Math.floor((x + w) / TS);
  const y0 = Math.floor(y / TS), y1 = Math.floor((y + h) / TS);
  for (let ty = y0; ty <= y1; ty++)
    for (let tx = x0; tx <= x1; tx++)
      if (breakBlockAt(tx, ty)) n++;
  return n;
}
/* fire tiles: stomp from above puts them out (the rescue mechanic) */
function fireAt(tx, ty) {
  const t = tileAt(tx, ty);
  return t >= 0 && HAZARD.has(t);
}
function extinguishAt(tx, ty) {
  if (fireAt(tx, ty)) {
    grid[ty][tx] = -1;
    World.burstAt(tx * TS + 8, ty * TS + 4, "poof", 5);
    AudioSys.sfx("fire");
    World.onFirePutOut();
    return true;
  }
  return false;
}
