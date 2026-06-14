"use strict";
/* =====================================================================
 *  MOONFLEX — LEVEL BUILDER  (buildless, like the rest of the project)
 *  Designs levels and exports the EXACT JSON the engine loads from levels/.
 *
 *  Source-of-truth mirrors (keep in sync if these change):
 *    - TILES            <- tools/levelgen.py  TILES
 *    - export key order <- tools/levelgen.py  L.out()
 *    - ENEMY_TYPES      <- js/enemies.js      ENEMY_DEFS
 *    - BOSS_TYPES       <- js/bosses.js       spawn()/make fns
 *    - PICKUP_SPRITE    <- js/world.js        PICKUP_SPRITE
 *    - SKIES/PARS/MUSIC <- assets/manifest.json + js/audio.js SONGS
 *  Sprites render with the same drawImage math as js/core.js drawFrame().
 * ===================================================================== */

const TS = 16;

/* ---- canonical tile vocabulary: index = grid value (mirror levelgen) ---- */
const TILES = [
  "grass_top","dirt","edge_left","edge_right","platform","lilypad","cattail","lantern",
  "water_surf1","water_deep","rock_top","rock_fill","seaweed1","coral","cloud_top",
  "cloud_fill","candy_top","candy_fill","gumdrop","spring1","night_grass","night_dirt",
  "fire1","tree_trunk","tree_leaves","mush_block","fence","flower","sign",
  "wall","paper","floor","window","door","bed_l","bed_r","shelf","lamp","plant","shaft",
  "roof_l","roof_r",
];

/* ---- enemies (hitbox w,h + sprite sheet) <- ENEMY_DEFS ---- */
const ENEMY_TYPES = {
  frog:      { w:20, h:16, sheet:"frog" },
  cockroach: { w:24, h:12, sheet:"cockroach" },
  dino:      { w:26, h:24, sheet:"dino" },
  alligator: { w:40, h:22, sheet:"alligator" },
  fish:      { w:12, h:8,  sheet:"fish" },
  wisp:      { w:14, h:14, sheet:"wisp" },
  fly:       { w:18, h:13, sheet:"fly" },
};

/* ---- bosses (sheet null = procedural) <- bosses.js ---- */
const BOSS_TYPES = {
  grumpis:      { w:52, h:48, sheet:"boss_grumpis", label:"Grumpis" },
  twins:        { w:52, h:48, sheet:"boss_grumpis", label:"Grumpis Twins (x2)" },
  papa:         { w:80, h:64, sheet:"boss_papa",    label:"Papa Grumpis" },
  family:       { w:80, h:64, sheet:"boss_papa",    label:"Whole Family" },
  hogdog:       { w:72, h:70, sheet:"boss_hogdog",  label:"Big Hog Dog" },
  hogdog_final: { w:72, h:70, sheet:"boss_hogdog",  label:"Hog Dog (finale)" },
  badcode:      { w:44, h:44, sheet:null,           label:"The Bad Dreams" },
};

/* ---- pickups: type -> [sheet, frame] <- world.js PICKUP_SPRITE ---- */
const PICKUP_SPRITE = {
  popcorn:["hud","popcorn"], star:["hud","star"], treat:["hud","treat"], trophy:["hud","trophy"],
  moon:["items","moon"], beads:["items","beads"],
  pickup_goosefeet:["items","pickup_goosefeet"], pickup_laser:["items","pickup_laser"],
  pickup_kirby:["items","icon_kirby"], pickup_spoon:["items","pickup_spoon"],
  pickup_mermaid:["items","pickup_mermaid"],
  chest:["tiles2","chest_closed"], chest_open:["tiles2","chest_open"],
  babyswan:["babyswan","bob1"],
};
const PLACEABLE_PICKUPS = ["popcorn","star","treat","babyswan","moon","beads","chest",
  "pickup_goosefeet","pickup_laser","pickup_kirby","pickup_spoon","pickup_mermaid"];

/* ---- options for metadata selects ---- */
const SKIES  = ["sky_lake","sky_night","sky_under","sky_candy","sky_fever","sky_hub","sky_finale"];
const PARS   = ["","par_lake","par_night","par_under","par_candy","par_fever","par_hub","par_finale"];
const MUSICS = ["lake","night","under","candy","fever","mecha","hub","title","boss","hogdog","store","ending",""];

/* tile -> atlas sheet (mirror core.js: scan tiles/tiles2/hub frame lists) */
let TILE_SHEET = {};

/* ===================================================================== */
/*  assets                                                               */
/* ===================================================================== */
let sheets = {};
async function loadAssets() {
  const manifest = await (await fetch("assets/manifest.json")).json();
  await Promise.all(Object.entries(manifest).map(([name, m]) => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => {
      sheets[name] = { img, fw:m.frame_w, fh:m.frame_h,
                       index:Object.fromEntries(m.frames.map((f,i)=>[f,i])) };
      res();
    };
    img.onerror = () => rej(new Error("failed: " + m.file));
    img.src = m.file;
  })));
  TILE_SHEET = {};
  for (const sh of ["tiles","tiles2","hub"])
    if (sheets[sh]) for (const f in sheets[sh].index) TILE_SHEET[f] = sh;
}

/* same atlas math as core.js drawFrame, but to an arbitrary ctx + scale */
function drawSprite(g, sheetName, frame, dx, dy, scale, flip) {
  const s = sheets[sheetName]; if (!s) return;
  const i = s.index[frame]; if (i == null) return;
  g.imageSmoothingEnabled = false;
  if (flip) {
    g.save();
    g.translate(Math.round(dx) + s.fw * scale, Math.round(dy));
    g.scale(-scale, scale);
    g.drawImage(s.img, i*s.fw, 0, s.fw, s.fh, 0, 0, s.fw, s.fh);
    g.restore();
  } else {
    g.drawImage(s.img, i*s.fw, 0, s.fw, s.fh,
                Math.round(dx), Math.round(dy), s.fw*scale, s.fh*scale);
  }
}

/* ===================================================================== */
/*  the level model                                                      */
/* ===================================================================== */
function blankLevel(w=120, h=17) {
  const grid = Array.from({length:h}, () => new Array(w).fill(-1));
  return {
    name:"NEW DREAM", world:9, sky:"sky_lake", par:"par_lake", music:"lake",
    w, h, grid, water:[],
    spawn:{x:32, y:8*TS}, enemies:[], pickups:[], boss:null,
    goalX:(w-4)*TS, doors:[], elevator:null,
    happinessDrain:0.04, letterCost:100, forceForm:null, next:null,
    startHappy:null, speedMult:1.0, finale:false, story:null,
  };
}
let L = blankLevel();

/* build the engine-exact JSON object (key order mirrors levelgen.out) */
function buildLevelObject() {
  const d = {
    name:L.name, world:numOr(L.world,0), sky:L.sky, par:L.par, music:L.music,
    tileSize:TS, tileNames:TILES, grid:L.grid, water:L.water,
    spawn:{x:Math.round(L.spawn.x), y:Math.round(L.spawn.y)},
    enemies:L.enemies, pickups:L.pickups, boss:L.boss, goalX:Math.round(L.goalX),
    doors:L.doors||[], elevator:L.elevator||null,
    happinessDrain:numOr(L.happinessDrain,0), letterCost:numOr(L.letterCost,100),
    forceForm:L.forceForm||null, next:(L.next===""||L.next==null)?null:numOr(L.next,null),
  };
  if (L.startHappy != null && L.startHappy !== "") d.startHappy = numOr(L.startHappy,null);
  if (numOr(L.speedMult,1) !== 1)                  d.speedMult  = numOr(L.speedMult,1);
  if (L.finale)                                    d.finale     = true;
  if (L.story && L.story.length)                   d.story      = L.story;
  return d;
}
const numOr = (v,f) => { const n = typeof v==="number"?v:parseFloat(v); return isNaN(n)?f:n; };

/* ===================================================================== */
/*  editor state                                                         */
/* ===================================================================== */
let tool = "paint";
let curTile = 0, curEnemy = "frog", curPickup = "star", curBoss = "grumpis";
let zoom = 2, scrollX = 0, scrollY = 0;
let mouseTX = -1, mouseTY = -1;
let painting = false, panning = false, panOX = 0, panOY = 0, panSX = 0, panSY = 0;
let spaceDown = false;
let dragWater = null;                 // {x0,y0} while drawing a water rect
let selected = null;                  // {kind:'enemy'|'pickup'|'boss'|'spawn'|'goal', ref}
let movingSel = false;

const canvas = document.getElementById("grid");
const ctx = canvas.getContext("2d");
const center = document.getElementById("center");

/* ===================================================================== */
/*  rendering                                                            */
/* ===================================================================== */
function resizeCanvas() {
  canvas.width = center.clientWidth;
  canvas.height = center.clientHeight;
}
function skyTint(sky) {
  return ({ sky_lake:"#7fb6e6", sky_night:"#222048", sky_under:"#1d5a86", sky_candy:"#f3b6e0",
            sky_fever:"#e06a4a", sky_hub:"#2a2440", sky_finale:"#3a2050" })[sky] || "#10101a";
}
function w2s(x){ return (x - scrollX) * zoom; }      // world px -> screen px
function s2w(x){ return x / zoom + scrollX; }

function render() {
  const cw = canvas.width, ch = canvas.height;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#0c0a14"; ctx.fillRect(0,0,cw,ch);

  // level "sky" backdrop within bounds
  ctx.fillStyle = skyTint(L.sky);
  ctx.fillRect(w2s(0), (0-scrollY)*zoom, L.w*TS*zoom, L.h*TS*zoom);

  const x0 = Math.max(0, Math.floor(scrollX/TS));
  const y0 = Math.max(0, Math.floor(scrollY/TS));
  const x1 = Math.min(L.w-1, Math.floor((scrollX + cw/zoom)/TS));
  const y1 = Math.min(L.h-1, Math.floor((scrollY + ch/zoom)/TS));

  // tiles
  for (let ty=y0; ty<=y1; ty++) for (let tx=x0; tx<=x1; tx++) {
    const t = L.grid[ty][tx];
    if (t < 0) continue;
    const name = TILES[t];
    drawSprite(ctx, TILE_SHEET[name], name, w2s(tx*TS), w2s2(ty*TS), zoom);
  }

  // grid lines
  if (zoom >= 2) {
    const top = w2s2(0), bot = w2s2(L.h*TS), lft = w2s(0), rgt = w2s(L.w*TS);
    ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let tx=x0; tx<=x1+1; tx++){ const sx=Math.round(w2s(tx*TS))+0.5; ctx.moveTo(sx,top); ctx.lineTo(sx,bot); }
    for (let ty=y0; ty<=y1+1; ty++){ const sy=Math.round(w2s2(ty*TS))+0.5; ctx.moveTo(lft,sy); ctx.lineTo(rgt,sy); }
    ctx.stroke();
  }

  // water rects (physics overlay)
  for (const r of L.water) {
    const [tx,ty,tw,th] = r;
    ctx.fillStyle = "rgba(86,134,219,0.30)";
    ctx.fillRect(w2s(tx*TS), w2s2(ty*TS), tw*TS*zoom, th*TS*zoom);
    ctx.strokeStyle = "rgba(120,180,255,0.8)";
    ctx.strokeRect(w2s(tx*TS)+0.5, w2s2(ty*TS)+0.5, tw*TS*zoom-1, th*TS*zoom-1);
  }
  if (dragWater) {
    const a = dragWater, b = {x:mouseTX, y:mouseTY};
    const tx=Math.min(a.x,b.x), ty=Math.min(a.y,b.y), tw=Math.abs(a.x-b.x)+1, th=Math.abs(a.y-b.y)+1;
    ctx.fillStyle = "rgba(86,134,219,0.45)";
    ctx.fillRect(w2s(tx*TS), w2s2(ty*TS), tw*TS*zoom, th*TS*zoom);
  }

  // pickups
  for (const pk of L.pickups) {
    const spr = PICKUP_SPRITE[pk.type];
    if (spr) drawSprite(ctx, spr[0], spr[1], w2s(pk.x), w2s2(pk.y), zoom);
    else { ctx.fillStyle="#ff66cc"; ctx.fillRect(w2s(pk.x),w2s2(pk.y),16*zoom,16*zoom); }
    if (pk.rescue) badge("R", pk.x, pk.y);
  }

  // enemies (centre + bottom-align like the game)
  for (const e of L.enemies) {
    const d = ENEMY_TYPES[e.type]; if (!d) continue;
    const s = sheets[d.sheet];
    if (s) {
      const dx = e.x + d.w/2 - s.fw/2, dy = e.y + d.h - s.fh;
      drawSprite(ctx, d.sheet, firstFrame(d.sheet), w2s(dx), w2s2(dy), zoom);
    }
    if (e.fly === false) badge("g", e.x, e.y);   // grounded dino
  }

  // boss
  if (L.boss) {
    const d = BOSS_TYPES[L.boss.type];
    if (d) {
      if (d.sheet && sheets[d.sheet]) {
        const s = sheets[d.sheet];
        const dx = L.boss.x + d.w/2 - s.fw/2, dy = L.boss.y + d.h - s.fh;
        drawSprite(ctx, d.sheet, "idle", w2s(dx), w2s2(dy), zoom);
      } else { // procedural badcode placeholder
        ctx.fillStyle = "#2a1f44";
        ctx.fillRect(w2s(L.boss.x), w2s2(L.boss.y), d.w*zoom, d.h*zoom);
        ctx.fillStyle = "#54ffd0"; ctx.font = `${7*zoom}px monospace`;
        ctx.fillText("01", w2s(L.boss.x)+3, w2s2(L.boss.y)+10*zoom);
      }
      label(d.label, L.boss.x, L.boss.y - 6, "#ff9a9a");
    }
  }

  // goal line
  {
    const sx = Math.round(w2s(L.goalX)) + 0.5;
    ctx.strokeStyle = "#9fe8a0"; ctx.setLineDash([4,3]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sx,(0-scrollY)*zoom); ctx.lineTo(sx,(L.h*TS-scrollY)*zoom); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#9fe8a0"; ctx.font = "11px monospace"; ctx.fillText("⚑ GOAL", sx+4, (0-scrollY)*zoom + 14);
  }

  // spawn marker
  {
    const sx = w2s(L.spawn.x), sy = w2s2(L.spawn.y);
    if (sheets.swan) {
      const s = sheets.swan;
      drawSprite(ctx, "swan", "idle", sx + (18/2 - s.fw/2)*zoom, sy + (26 - s.fh)*zoom, zoom);
    }
    ctx.strokeStyle = "#ffe48a"; ctx.lineWidth = 1.5;
    ctx.strokeRect(sx+0.5, sy+0.5, 18*zoom-1, 26*zoom-1);
    ctx.fillStyle = "#ffe48a"; ctx.font = "10px monospace"; ctx.fillText("☆ SPAWN", sx, sy-3);
  }

  // selection highlight
  if (selected) {
    const b = selBox(selected);
    if (b) {
      ctx.strokeStyle = "#ffffff"; ctx.setLineDash([3,2]); ctx.lineWidth = 1.5;
      ctx.strokeRect(w2s(b.x)+0.5, w2s2(b.y)+0.5, b.w*zoom-1, b.h*zoom-1);
      ctx.setLineDash([]);
    }
  }

  requestAnimationFrame(render);
}
function w2s2(y){ return (y - scrollY) * zoom; }      // (kept separate for clarity)
function firstFrame(sheet){ const s=sheets[sheet]; return s ? Object.keys(s.index)[0] : null; }
function badge(txt, x, y){
  ctx.fillStyle="rgba(20,12,28,.85)"; ctx.fillRect(w2s(x), w2s2(y), 9, 9);
  ctx.fillStyle="#ffe48a"; ctx.font="8px monospace"; ctx.fillText(txt, w2s(x)+1, w2s2(y)+8);
}
function label(txt, x, y, col){
  ctx.font="9px monospace"; ctx.fillStyle="rgba(12,10,20,.8)";
  const w = ctx.measureText(txt).width+4;
  ctx.fillRect(w2s(x), w2s2(y)-9, w, 10);
  ctx.fillStyle=col||"#fff"; ctx.fillText(txt, w2s(x)+2, w2s2(y)-1);
}

/* selection boxes */
function selBox(sel){
  if (sel.kind==="enemy"){ const d=ENEMY_TYPES[sel.ref.type]; return {x:sel.ref.x,y:sel.ref.y,w:d.w,h:d.h}; }
  if (sel.kind==="pickup") return {x:sel.ref.x,y:sel.ref.y,w:16,h:16};
  if (sel.kind==="boss"){ const d=BOSS_TYPES[sel.ref.type]; return {x:sel.ref.x,y:sel.ref.y,w:d.w,h:d.h}; }
  if (sel.kind==="spawn") return {x:L.spawn.x,y:L.spawn.y,w:18,h:26};
  return null;
}

/* ===================================================================== */
/*  canvas interaction                                                   */
/* ===================================================================== */
function evtCell(e){
  const r = canvas.getBoundingClientRect();
  const wx = s2w(e.clientX - r.left), wy = s2w2(e.clientY - r.top);
  return { tx:Math.floor(wx/TS), ty:Math.floor(wy/TS), wx, wy };
}
function s2w2(y){ return y/zoom + scrollY; }

function inBounds(tx,ty){ return tx>=0 && ty>=0 && tx<L.w && ty<L.h; }

function objAtCell(tx,ty){
  // priority: boss > enemy > pickup > spawn
  if (L.boss){ const d=BOSS_TYPES[L.boss.type];
    if (cellHit(L.boss.x,L.boss.y,d.w,d.h,tx,ty)) return {kind:"boss",ref:L.boss}; }
  for (let i=L.enemies.length-1;i>=0;i--){ const e=L.enemies[i],d=ENEMY_TYPES[e.type];
    if (cellHit(e.x,e.y,d.w,d.h,tx,ty)) return {kind:"enemy",ref:e}; }
  for (let i=L.pickups.length-1;i>=0;i--){ const p=L.pickups[i];
    if (cellHit(p.x,p.y,16,16,tx,ty)) return {kind:"pickup",ref:p}; }
  if (cellHit(L.spawn.x,L.spawn.y,18,26,tx,ty)) return {kind:"spawn",ref:L.spawn};
  return null;
}
function cellHit(x,y,w,h,tx,ty){
  return tx>=Math.floor(x/TS) && tx<=Math.floor((x+w-1)/TS) &&
         ty>=Math.floor(y/TS) && ty<=Math.floor((y+h-1)/TS);
}

canvas.addEventListener("contextmenu", e => e.preventDefault());
canvas.addEventListener("mousedown", e => {
  const c = evtCell(e);
  // pan: middle mouse or space-drag
  if (e.button===1 || (e.button===0 && spaceDown)) {
    panning = true; panSX=e.clientX; panSY=e.clientY; panOX=scrollX; panOY=scrollY;
    e.preventDefault(); return;
  }
  if (e.button===2) { rightAct(c); return; }   // right-click

  if (tool==="paint")      { painting=true; paintCell(c.tx,c.ty,curTile); }
  else if (tool==="erase") { painting=true; eraseAt(c); }
  else if (tool==="eyedrop"){ if(inBounds(c.tx,c.ty)&&L.grid[c.ty][c.tx]>=0){ setTile(L.grid[c.ty][c.tx]); setTool("paint"); } }
  else if (tool==="spawn") { L.spawn={x:c.tx*TS,y:c.ty*TS}; syncMeta(); }
  else if (tool==="goal")  { L.goalX=c.tx*TS; syncMeta(); }
  else if (tool==="enemy") { const d=ENEMY_TYPES[curEnemy]; L.enemies.push({type:curEnemy,x:c.tx*TS,y:c.ty*TS}); select({kind:"enemy",ref:L.enemies[L.enemies.length-1]}); }
  else if (tool==="pickup"){ L.pickups.push({type:curPickup,x:c.tx*TS,y:c.ty*TS}); select({kind:"pickup",ref:L.pickups[L.pickups.length-1]}); }
  else if (tool==="boss")  { const d=BOSS_TYPES[curBoss]; L.boss={type:curBoss,x:c.tx*TS,y:c.ty*TS}; select({kind:"boss",ref:L.boss}); }
  else if (tool==="water") { dragWater={x:c.tx,y:c.ty}; }
  else if (tool==="select"){ const o=objAtCell(c.tx,c.ty); select(o); if(o&&o.kind!=="goal"){ movingSel=true; } }
});
window.addEventListener("mousemove", e => {
  const c = evtCell(e);
  mouseTX=c.tx; mouseTY=c.ty;
  document.getElementById("coords").textContent =
    `tile ${c.tx},${c.ty}  ·  px ${Math.round(c.wx)},${Math.round(c.wy)}  ·  z${zoom}`;
  if (panning){ scrollX = panOX - (e.clientX-panSX)/zoom; scrollY = panOY - (e.clientY-panSY)/zoom; clampScroll(); return; }
  if (painting && tool==="paint") paintCell(c.tx,c.ty,curTile);
  else if (painting && tool==="erase") eraseAt(c);
  else if (movingSel && selected) moveSelected(c);
});
window.addEventListener("mouseup", e => {
  if (dragWater && tool==="water"){
    const a=dragWater, b={x:mouseTX,y:mouseTY};
    const tx=Math.min(a.x,b.x), ty=Math.min(a.y,b.y), tw=Math.abs(a.x-b.x)+1, th=Math.abs(a.y-b.y)+1;
    if (tw>0&&th>0){ L.water.push([tx,ty,tw,th]); renderWaterList(); }
    dragWater=null;
  }
  painting=false; panning=false; movingSel=false;
});

function rightAct(c){
  const o = objAtCell(c.tx,c.ty);
  if (o && o.kind!=="spawn") { deleteObj(o); return; }
  eraseAt(c);
}
function eraseAt(c){
  if (inBounds(c.tx,c.ty)) L.grid[c.ty][c.tx] = -1;
}
function paintCell(tx,ty,t){ if (inBounds(tx,ty)) L.grid[ty][tx]=t; }

function moveSelected(c){
  const s=selected;
  if (s.kind==="spawn"){ L.spawn.x=c.tx*TS; L.spawn.y=c.ty*TS; syncMeta(); }
  else { s.ref.x=c.tx*TS; s.ref.y=c.ty*TS; }
  renderInspector();
}
function deleteObj(o){
  if (o.kind==="enemy") L.enemies.splice(L.enemies.indexOf(o.ref),1);
  else if (o.kind==="pickup") L.pickups.splice(L.pickups.indexOf(o.ref),1);
  else if (o.kind==="boss") L.boss=null;
  if (selected && selected.ref===o.ref) select(null);
}

function clampScroll(){
  scrollX = Math.max(-40, Math.min(scrollX, L.w*TS - canvas.width/zoom + 40));
  scrollY = Math.max(-40, Math.min(scrollY, L.h*TS - canvas.height/zoom + 40));
}

/* zoom toward cursor with ctrl+wheel; plain wheel pans */
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  if (e.ctrlKey || e.metaKey) {
    const r=canvas.getBoundingClientRect();
    const mx=e.clientX-r.left, my=e.clientY-r.top;
    const wx=s2w(mx), wy=s2w2(my);
    zoom = Math.max(1, Math.min(8, zoom + (e.deltaY<0?1:-1)));
    scrollX = wx - mx/zoom; scrollY = wy - my/zoom; clampScroll();
  } else if (e.shiftKey) { scrollX += e.deltaY/zoom; clampScroll(); }
  else { scrollY += e.deltaY/zoom; scrollX += e.deltaX/zoom; clampScroll(); }
}, {passive:false});

window.addEventListener("keydown", e => {
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
  if (e.code==="Space"){ spaceDown=true; e.preventDefault(); }
  else if (e.key==="Delete"||e.key==="Backspace"){ if(selected&&selected.kind!=="spawn"&&selected.kind!=="goal"){ deleteObj(selected);} }
  else if (e.key==="b") setTool("paint");
  else if (e.key==="e") setTool("erase");
  else if (e.key==="v") setTool("select");
  else if (e.key==="i") setTool("eyedrop");
});
window.addEventListener("keyup", e => { if (e.code==="Space") spaceDown=false; });

/* ===================================================================== */
/*  UI wiring                                                            */
/* ===================================================================== */
function setTool(t){
  tool = t;
  document.querySelectorAll("#tools button").forEach(b=>b.classList.toggle("on", b.dataset.tool===t));
}
function setTile(i){
  curTile = i;
  document.querySelectorAll("#palette .swatch").forEach(s=>s.classList.toggle("on", +s.dataset.i===i));
}
function select(o){ selected=o; renderInspector(); }

function buildPalette(){
  const pal = document.getElementById("palette");
  pal.innerHTML = "";
  // erase swatch
  const er = document.createElement("div");
  er.className="swatch erase"; er.title="empty / erase"; er.textContent="⌫";
  er.dataset.i="-1";
  er.onclick=()=>{ setTool("erase"); };
  pal.appendChild(er);
  TILES.forEach((name,i)=>{
    const sw=document.createElement("div");
    sw.className="swatch"+(i===curTile?" on":""); sw.title=name; sw.dataset.i=i;
    const cv=document.createElement("canvas"); cv.width=16; cv.height=16;
    drawSprite(cv.getContext("2d"), TILE_SHEET[name], name, 0,0,1);
    sw.appendChild(cv);
    sw.onclick=()=>{ setTile(i); setTool("paint"); };
    pal.appendChild(sw);
  });
}
function fillSelect(id, opts, val){
  const s=document.getElementById(id); s.innerHTML="";
  opts.forEach(o=>{ const op=document.createElement("option"); op.value=o; op.textContent=o===""?"(none)":o; s.appendChild(op); });
  if (val!=null) s.value=val;
}
function drawTypeSwatch(cv, sheet, frame){
  const g=cv.getContext("2d"); g.clearRect(0,0,cv.width,cv.height);
  const s=sheets[sheet]; if(!s) return;
  const sc=Math.min(cv.width/s.fw, cv.height/s.fh);
  drawSprite(g, sheet, frame, (cv.width-s.fw*sc)/2, (cv.height-s.fh*sc)/2, sc);
}
function refreshTypeSwatches(){
  const ed=ENEMY_TYPES[curEnemy]; drawTypeSwatch(document.getElementById("enemySw"), ed.sheet, firstFrame(ed.sheet));
  const ps=PICKUP_SPRITE[curPickup]; drawTypeSwatch(document.getElementById("pickupSw"), ps[0], ps[1]);
  const bd=BOSS_TYPES[curBoss];
  const bcv=document.getElementById("bossSw"), bg=bcv.getContext("2d"); bg.clearRect(0,0,28,28);
  if (bd.sheet) drawTypeSwatch(bcv, bd.sheet, "idle");
  else { bg.fillStyle="#2a1f44"; bg.fillRect(4,4,20,20); bg.fillStyle="#54ffd0"; bg.font="8px monospace"; bg.fillText("01",8,16); }
}

/* metadata <-> model */
function syncMeta(){
  set("m_name",L.name); set("m_world",L.world); set("m_drain",L.happinessDrain);
  set("m_letterCost",L.letterCost); set("m_goalX",Math.round(L.goalX));
  set("m_spawnX",Math.round(L.spawn.x)); set("m_spawnY",Math.round(L.spawn.y));
  set("m_w",L.w); set("m_h",L.h);
  set("m_startHappy", L.startHappy==null?"":L.startHappy);
  set("m_speedMult", L.speedMult==null?1:L.speedMult);
  set("m_next", L.next==null?"":L.next);
  document.getElementById("m_finale").checked = !!L.finale;
  document.getElementById("m_forceForm").value = L.forceForm||"";
  document.getElementById("m_sky").value = L.sky;
  document.getElementById("m_par").value = L.par;
  document.getElementById("m_music").value = L.music;
}
const set=(id,v)=>{ document.getElementById(id).value=v; };
const getN=(id,f)=>{ const v=document.getElementById(id).value; return v===""?f:numOr(v,f); };

function bindMeta(){
  document.getElementById("m_name").oninput=e=>L.name=e.target.value;
  document.getElementById("m_world").oninput=e=>L.world=numOr(e.target.value,0);
  document.getElementById("m_sky").onchange=e=>L.sky=e.target.value;
  document.getElementById("m_par").onchange=e=>L.par=e.target.value;
  document.getElementById("m_music").onchange=e=>L.music=e.target.value;
  document.getElementById("m_drain").oninput=e=>L.happinessDrain=numOr(e.target.value,0);
  document.getElementById("m_letterCost").oninput=e=>L.letterCost=numOr(e.target.value,100);
  document.getElementById("m_goalX").oninput=e=>L.goalX=numOr(e.target.value,0);
  document.getElementById("m_spawnX").oninput=e=>L.spawn.x=numOr(e.target.value,0);
  document.getElementById("m_spawnY").oninput=e=>L.spawn.y=numOr(e.target.value,0);
  document.getElementById("m_startHappy").oninput=e=>L.startHappy = e.target.value===""?null:numOr(e.target.value,null);
  document.getElementById("m_speedMult").oninput=e=>L.speedMult = numOr(e.target.value,1);
  document.getElementById("m_next").oninput=e=>L.next = e.target.value===""?null:numOr(e.target.value,null);
  document.getElementById("m_finale").onchange=e=>L.finale=e.target.checked;
  document.getElementById("m_forceForm").onchange=e=>L.forceForm=e.target.value||null;
  document.getElementById("m_w").onchange=e=>resizeLevel(numOr(e.target.value,L.w), L.h);
  document.getElementById("m_h").onchange=e=>resizeLevel(L.w, numOr(e.target.value,L.h));
}
function resizeLevel(w,h){
  w=Math.max(8,Math.min(600,Math.round(w))); h=Math.max(6,Math.min(200,Math.round(h)));
  const g=Array.from({length:h},(_,r)=>Array.from({length:w},(_,c)=>
    (r<L.h&&c<L.w)?L.grid[r][c]:-1));
  L.grid=g; L.w=w; L.h=h;
  L.spawn.x=Math.min(L.spawn.x,(w-1)*TS); L.spawn.y=Math.min(L.spawn.y,(h-1)*TS);
  L.goalX=Math.min(L.goalX,(w-1)*TS);
  syncMeta();
}

/* inspector */
function renderInspector(){
  const el=document.getElementById("inspector");
  if (!selected){ el.innerHTML='<span class="empty">Nothing selected. Use ✦ Select.</span>'; return; }
  const s=selected;
  if (s.kind==="spawn"){ el.innerHTML=`<b>spawn</b><br>${numRow("spawn x","spawn.x")}${numRow("spawn y","spawn.y")}`; wireInspector(); return; }
  if (s.kind==="boss"){
    el.innerHTML=`<b>boss · ${s.ref.type}</b><br>${numRow("x","x")}${numRow("y","y")}
      ${chkRow("flees","flees")}<br><button class="mini" id="insDel">delete</button>`;
    wireInspector(); return;
  }
  if (s.kind==="enemy"){
    let extra = s.ref.type==="dino" ? chkRow("fly (grounded=off)","fly",true) : "";
    el.innerHTML=`<b>enemy · ${s.ref.type}</b><br>${numRow("x","x")}${numRow("y","y")}${extra}
      <br><button class="mini" id="insDel">delete</button>`;
    wireInspector(); return;
  }
  if (s.kind==="pickup"){
    let extra = s.ref.type==="babyswan" ? chkRow("rescue","rescue") : "";
    el.innerHTML=`<b>pickup · ${s.ref.type}</b><br>${numRow("x","x")}${numRow("y","y")}${extra}
      <br><button class="mini" id="insDel">delete</button>`;
    wireInspector(); return;
  }
}
function numRow(lbl,path){
  const v = Math.round(getPath(path));
  return `<div class="field"><label>${lbl}</label><input data-path="${path}" type="number" value="${v}"></div>`;
}
function chkRow(lbl,path,inv){
  const raw = getPath(path);
  const on = inv ? raw!==false : !!raw;
  return `<div class="field"><label>${lbl}</label><input data-path="${path}" data-chk="1" data-inv="${inv?1:0}" type="checkbox" ${on?"checked":""}></div>`;
}
function getPath(path){
  if (path.startsWith("spawn.")) return L.spawn[path.split(".")[1]];
  return selected.ref[path];
}
function setPath(path,val){
  if (path.startsWith("spawn.")) { L.spawn[path.split(".")[1]]=val; syncMeta(); }
  else selected.ref[path]=val;
}
function wireInspector(){
  document.querySelectorAll("#inspector input").forEach(inp=>{
    if (inp.dataset.chk){
      inp.onchange=()=>{ const inv=inp.dataset.inv==="1";
        const v = inv ? (inp.checked?undefined:false) : (inp.checked?true:undefined);
        if (v===undefined) delete selected.ref[inp.dataset.path]; else setPath(inp.dataset.path,v); };
    } else {
      inp.oninput=()=>setPath(inp.dataset.path, numOr(inp.value,0));
    }
  });
  const del=document.getElementById("insDel"); if(del) del.onclick=()=>deleteObj(selected);
}

/* water list */
function renderWaterList(){
  const el=document.getElementById("waterList");
  if (!L.water.length){ el.innerHTML="none"; return; }
  el.innerHTML="";
  L.water.forEach((r,i)=>{
    const d=document.createElement("div"); d.className="field";
    d.innerHTML=`<span>[${r.join(", ")}]</span>`;
    const b=document.createElement("button"); b.className="mini"; b.textContent="✕";
    b.onclick=()=>{ L.water.splice(i,1); renderWaterList(); };
    d.appendChild(b); el.appendChild(d);
  });
}

/* story cards */
function renderCards(){
  const wrap=document.getElementById("cards"); wrap.innerHTML="";
  const story = L.story || [];
  story.forEach((card,ci)=>{
    const d=document.createElement("div"); d.className="card";
    d.innerHTML=`<div class="row"><b>card ${ci+1}</b></div>`;
    const ta=document.createElement("textarea"); ta.rows=Math.max(3,card.length);
    ta.value=card.join("\n");
    ta.oninput=()=>{ L.story[ci]=ta.value.split("\n"); };
    d.appendChild(ta);
    const rm=document.createElement("button"); rm.className="mini"; rm.textContent="remove card";
    rm.style.marginTop="4px";
    rm.onclick=()=>{ L.story.splice(ci,1); if(!L.story.length)L.story=null; renderCards(); };
    d.appendChild(rm);
    wrap.appendChild(d);
  });
}

/* ===================================================================== */
/*  import / export / test                                               */
/* ===================================================================== */
// byte-exact match for levelgen's json.dump: whole-number floats keep a
// trailing ".0", and non-ASCII is \uXXXX-escaped (Python's ensure_ascii).
const pyFloat = n => Number.isInteger(n) ? n.toFixed(1) : String(n);
function exportJSON(){
  const d = buildLevelObject();
  const drainVal = pyFloat(numOr(d.happinessDrain,0)); d.happinessDrain = "@@DRAIN@@";
  const hasSpeed = "speedMult" in d; let speedVal;
  if (hasSpeed){ speedVal = pyFloat(d.speedMult); d.speedMult = "@@SPEED@@"; }
  let s = JSON.stringify(d)
            .replace('"@@DRAIN@@"', drainVal);
  if (hasSpeed) s = s.replace('"@@SPEED@@"', speedVal);
  return s.replace(/[-￿]/g, c => "\\u" + c.charCodeAt(0).toString(16).padStart(4,"0"));
}

function doExport(){
  const txt=exportJSON();
  const name=document.getElementById("exportName").value||"level.json";
  const blob=new Blob([txt],{type:"application/json"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=name; a.click();
  URL.revokeObjectURL(a.href);
}
async function doCopy(){
  try{ await navigator.clipboard.writeText(exportJSON()); flash("Copied JSON to clipboard"); }
  catch(e){ flash("Copy failed — exporting file instead"); doExport(); }
}

function loadFromObject(obj){
  // remap grid indices from the file's tileNames into our canonical TILES
  const names = obj.tileNames || TILES;
  const remap = names.map(n => { let i=TILES.indexOf(n); if(i<0){ TILES.push(n); i=TILES.length-1; } return i; });
  const grid = obj.grid.map(row => row.map(v => v<0?-1:(remap[v]??-1)));
  L = {
    name:obj.name??"NEW DREAM", world:obj.world??0, sky:obj.sky??"sky_lake",
    par:obj.par??"", music:obj.music??"",
    w:grid[0].length, h:grid.length, grid,
    water:(obj.water||[]).map(r=>r.slice()),
    spawn:{x:obj.spawn?.x??32, y:obj.spawn?.y??128},
    enemies:(obj.enemies||[]).map(e=>({...e})),
    pickups:(obj.pickups||[]).map(p=>({...p})),
    boss:obj.boss?{...obj.boss}:null,
    goalX:obj.goalX??(grid[0].length-4)*TS,
    doors:(obj.doors||[]).map(d=>({...d})), elevator:obj.elevator??null,
    happinessDrain:obj.happinessDrain??0.04, letterCost:obj.letterCost??100,
    forceForm:obj.forceForm??null, next:obj.next??null,
    startHappy:obj.startHappy??null, speedMult:obj.speedMult??1.0,
    finale:!!obj.finale, story:obj.story?obj.story.map(c=>c.slice()):null,
  };
  selected=null; scrollX=0; scrollY=0;
  buildPalette(); syncMeta(); renderWaterList(); renderCards(); renderInspector();
  flash("Loaded: "+L.name);
}
async function loadExisting(id){
  if (!id) return;
  try{
    const file = id==="hub" ? "levels/hub.json" : `levels/${id}.json`;
    const obj = await (await fetch(file)).json();
    loadFromObject(obj);
    document.getElementById("exportName").value = id+".json";
  }catch(e){ flash("Failed to load "+id+": "+e.message); }
}

/* test play: feed the real engine via the playtest.html fetch shim */
function testPlay(reloadOnly){
  window.__EDITOR_LEVEL__ = buildLevelObject();
  const dock=document.getElementById("playdock"); dock.classList.add("show");
  document.getElementById("btnTest").classList.add("on");
  document.getElementById("playframe").src = "playtest.html?level=1&_=" + Date.now();
}
function closePlay(){
  document.getElementById("playdock").classList.remove("show");
  document.getElementById("playframe").src = "about:blank";
  document.getElementById("btnTest").classList.remove("on");
}

function flash(msg){
  const el=document.getElementById("err");
  el.style.display="block"; el.style.background="#1a2a18"; el.style.borderColor="#9fe8a0"; el.style.color="#d8ffd0";
  el.textContent=msg; clearTimeout(flash._t); flash._t=setTimeout(()=>el.style.display="none",2200);
}
function fail(msg){
  const el=document.getElementById("err"); el.style.display="block"; el.textContent=msg;
  el.style.background="#3a1020"; el.style.borderColor="#ff9a9a"; el.style.color="#ffd0d0";
}

/* ===================================================================== */
/*  boot                                                                 */
/* ===================================================================== */
async function boot(){
  try { await loadAssets(); }
  catch(e){ fail("Could not load assets ("+e.message+"). Serve the project over http (e.g. `python -m http.server`) and open editor.html from there."); return; }

  resizeCanvas();
  window.addEventListener("resize", ()=>{ resizeCanvas(); });

  // tools
  document.querySelectorAll("#tools button").forEach(b=>b.onclick=()=>setTool(b.dataset.tool));
  setTool("paint");

  // type selects
  fillSelect("enemyType", Object.keys(ENEMY_TYPES), curEnemy);
  fillSelect("pickupType", PLACEABLE_PICKUPS, curPickup);
  const bsel=document.getElementById("bossType");
  bsel.innerHTML="<option value=''>(none)</option>";
  Object.entries(BOSS_TYPES).forEach(([k,v])=>{ const o=document.createElement("option"); o.value=k; o.textContent=v.label; bsel.appendChild(o); });
  bsel.value=curBoss;
  document.getElementById("enemyType").onchange=e=>{ curEnemy=e.target.value; setTool("enemy"); refreshTypeSwatches(); };
  document.getElementById("pickupType").onchange=e=>{ curPickup=e.target.value; setTool("pickup"); refreshTypeSwatches(); };
  bsel.onchange=e=>{ if(e.target.value){ curBoss=e.target.value; setTool("boss"); } else { L.boss=null; } refreshTypeSwatches(); };

  // metadata selects
  fillSelect("m_sky", SKIES, L.sky);
  fillSelect("m_par", PARS, L.par);
  fillSelect("m_music", MUSICS, L.music);
  bindMeta();

  buildPalette(); refreshTypeSwatches(); syncMeta(); renderWaterList(); renderCards(); renderInspector();

  // header actions
  document.getElementById("btnNew").onclick=()=>{
    const w=parseInt(prompt("Width in tiles?", "120"))||120;
    const h=parseInt(prompt("Height in tiles?", "17"))||17;
    L=blankLevel(w,h); selected=null; scrollX=scrollY=0;
    buildPalette(); syncMeta(); renderWaterList(); renderCards(); renderInspector();
  };
  document.getElementById("loadExisting").onchange=e=>loadExisting(e.target.value);
  document.getElementById("btnImport").onclick=()=>document.getElementById("fileInput").click();
  document.getElementById("fileInput").onchange=e=>{
    const f=e.target.files[0]; if(!f) return;
    const rd=new FileReader();
    rd.onload=()=>{ try{ loadFromObject(JSON.parse(rd.result)); document.getElementById("exportName").value=f.name; }
                    catch(err){ fail("Bad JSON: "+err.message); } };
    rd.readAsText(f);
  };
  document.getElementById("btnExport").onclick=doExport;
  document.getElementById("btnCopy").onclick=doCopy;
  document.getElementById("btnTest").onclick=()=>testPlay();
  document.getElementById("playClose").onclick=closePlay;
  document.getElementById("playReload").onclick=()=>testPlay();
  document.getElementById("zoomIn").onclick=()=>{ zoom=Math.min(8,zoom+1); };
  document.getElementById("zoomOut").onclick=()=>{ zoom=Math.max(1,zoom-1); };
  document.getElementById("zoomFit").onclick=()=>{ zoom=Math.max(1,Math.min(8,Math.floor(canvas.height/(L.h*TS))||2)); scrollX=0; scrollY=0; };
  document.getElementById("addCard").onclick=()=>{ if(!L.story)L.story=[]; L.story.push(["..."]); renderCards(); };

  requestAnimationFrame(render);
  flash("Builder ready — paint, place, and ▶ Test Play.");
}
boot();
