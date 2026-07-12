"use strict";
/* =====================================================================
 *  ATMO — the dream's atmosphere. Far ridges, ambient drift (fireflies,
 *  sprinkles, embers, bubbles, dream motes), sky grades, the vignette.
 *  Stateless on purpose: everything is a pure function of Game.frame and
 *  the camera, so there is nothing to reset and it all freezes with the
 *  dream when the game pauses.
 * ===================================================================== */
const Atmo = (() => {
  const SPAN_X = T.VIEW_W + 48, SPAN_Y = T.VIEW_H + 48;
  const wrap = (v, m) => ((v % m) + m) % m;
  // cheap deterministic per-mote hash in [0,1)
  const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  function theme() { return level && level.sky ? level.sky.slice(4) : "lake"; }

  /* one drifting mote field; calls plot(sx, sy, i, h1, h2) per mote */
  function field(n, cx, cy, par, vx, vy, sway, plot) {
    const f = Game.frame;
    for (let i = 0; i < n; i++) {
      const h1 = hash(i), h2 = hash(i + 57.3);
      const sx = wrap(h1 * SPAN_X + f * vx * (0.6 + h2 * 0.8) - cx * par
                      + Math.sin((f + i * 47) / 36) * sway, SPAN_X) - 24;
      const sy = wrap(h2 * SPAN_Y + f * vy * (0.6 + h1 * 0.8) - cy * par * 0.6, SPAN_Y) - 24;
      plot(sx, sy, i, h1, h2);
    }
  }

  /* ---------------- far layer (behind the near parallax strip) -------- */
  function drawFar(cx, cy) {
    const th = theme();
    // a second, hazier ridge of the same strip — atmospheric perspective
    if (level && level.par && sheets[level.par]) {
      const off = Math.floor(cx * 0.16) % 192;
      const py = T.VIEW_H - 146 - Math.round(cy * 0.1);
      ctx.globalAlpha = 0.4;
      for (let x = -off - 96; x < T.VIEW_W; x += 192) drawFrame(level.par, "s", x, py);
      ctx.globalAlpha = 1;
    }
    if (th === "night") {                       // twinkling stars, barely parallaxed
      field(26, cx, cy, 0.06, 0, 0, 0, (sx, sy, i, h1, h2) => {
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(Game.frame / 30 + i * 2.7));
        ctx.fillStyle = `rgba(232,224,255,${(0.25 + h1 * 0.5) * tw})`;
        ctx.fillRect(Math.round(sx), Math.round(sy * 0.7), h2 > 0.85 ? 2 : 1, 1);
      });
    } else if (th === "under") {                // slow diagonal light shafts
      ctx.save();
      for (let i = 0; i < 4; i++) {
        const bx = wrap(i * 130 + Math.sin((Game.frame + i * 200) / 260) * 30 - cx * 0.3, SPAN_X) - 24;
        const a = 0.05 + 0.03 * Math.sin(Game.frame / 90 + i * 1.9);
        ctx.fillStyle = `rgba(190,235,255,${a})`;
        ctx.beginPath();
        ctx.moveTo(bx, -8); ctx.lineTo(bx + 34, -8);
        ctx.lineTo(bx - 30, T.VIEW_H + 8); ctx.lineTo(bx - 58, T.VIEW_H + 8);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    } else if (th === "finale") {               // far cloud puffs adrift
      field(6, cx, cy, 0.22, 0.04, 0, 0, (sx, sy, i, h1) => {
        ctx.fillStyle = "rgba(236,230,255,0.10)";
        ctx.beginPath(); ctx.ellipse(sx, sy, 26 + h1 * 18, 8 + h1 * 4, 0, 0, Math.PI * 2); ctx.fill();
      });
    }
  }

  /* ---------------- mid ambient field (behind the tiles) -------------- */
  function drawBack(cx, cy) {
    const th = theme(), f = Game.frame;
    if (th === "lake" || th === "hub") {        // warm pollen motes in the light
      field(12, cx, cy, 0.55, 0.05, -0.06, 4, (sx, sy, i) => {
        const tw = 0.3 + 0.5 * Math.abs(Math.sin(f / 24 + i * 1.3));
        ctx.fillStyle = `rgba(255,240,190,${tw})`;
        ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
      });
    } else if (th === "night") {                // fireflies, wandering and blinking
      field(9, cx, cy, 0.8, 0.06, -0.03, 12, (sx, sy, i) => {
        const blink = Math.sin(f / 16 + i * 2.1);
        if (blink < -0.2) return;
        ctx.fillStyle = `rgba(190,255,140,${0.10 + blink * 0.10})`;
        ctx.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 3, 3);
        ctx.fillStyle = `rgba(230,255,190,${0.5 + blink * 0.5})`;
        ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
      });
    } else if (th === "under") {                // little bubbles on their way up
      field(12, cx, cy, 0.9, 0.02, -0.4, 6, (sx, sy, i, h1) => {
        ctx.strokeStyle = "rgba(210,240,255,0.35)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(sx, sy, 1 + h1 * 1.6, 0, Math.PI * 2); ctx.stroke();
      });
    } else if (th === "candy") {                // sugar sprinkles snowing down
      const cols = ["#ff6ea8", "#7ee0ff", "#ffe48a", "#b5f78e", "#d8a6ff"];
      field(16, cx, cy, 0.75, 0.03, 0.28, 8, (sx, sy, i, h1) => {
        ctx.fillStyle = cols[i % cols.length];
        ctx.globalAlpha = 0.5 + h1 * 0.4;
        if (h1 > 0.5) ctx.fillRect(Math.round(sx), Math.round(sy), 2, 1);
        else ctx.fillRect(Math.round(sx), Math.round(sy), 1, 2);
        ctx.globalAlpha = 1;
      });
    } else if (th === "fever") {                // embers climbing out of the heat
      field(14, cx, cy, 0.8, 0.04, -0.5, 8, (sx, sy, i, h1) => {
        const flick = 0.4 + 0.6 * Math.abs(Math.sin(f / 7 + i * 3.3));
        ctx.fillStyle = h1 > 0.6 ? `rgba(255,180,80,${flick})` : `rgba(255,90,40,${flick * 0.8})`;
        ctx.fillRect(Math.round(sx), Math.round(sy), 1, h1 > 0.85 ? 2 : 1);
      });
    } else if (th === "finale") {               // dream motes, soft and patient
      field(14, cx, cy, 0.6, 0.03, -0.05, 10, (sx, sy, i, h1) => {
        const tw = 0.25 + 0.45 * Math.abs(Math.sin(f / 28 + i * 1.7));
        ctx.fillStyle = h1 > 0.5 ? `rgba(255,220,245,${tw})` : `rgba(220,215,255,${tw})`;
        ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
      });
    }
  }

  /* -------- foreground bokeh (in front of the cast, big and soft) ----- */
  const FRONT_TINT = {
    lake: "255,236,180", hub: "255,236,180", night: "170,190,255",
    under: "170,225,255", candy: "255,190,225", fever: "255,140,70", finale: "225,205,255",
  };
  function drawFront(cx, cy) {
    const tint = FRONT_TINT[theme()] || "255,236,180";
    field(5, cx, cy, 1.35, 0.08, -0.05, 6, (sx, sy, i, h1) => {
      ctx.fillStyle = `rgba(${tint},${0.05 + h1 * 0.05})`;
      ctx.beginPath(); ctx.arc(sx, sy, 3 + h1 * 4, 0, Math.PI * 2); ctx.fill();
    });
  }

  /* ---------------- sky grade + vignette (cached gradients) ----------- */
  const TOP_GRADE = {   // color the top of every sky a little deeper
    lake:   "255,214,170,0.14", night: "24,16,72,0.30",  under: "8,40,96,0.32",
    candy:  "255,170,220,0.13", fever: "255,60,30,0.15", finale: "120,80,200,0.18",
    hub:    "255,230,180,0.10",
  };
  const gradCache = {};
  function topGrade(th) {
    if (!gradCache[th]) {
      const g = ctx.createLinearGradient(0, 0, 0, 104);
      const c = TOP_GRADE[th] || TOP_GRADE.lake;
      g.addColorStop(0, `rgba(${c})`);
      const parts = c.split(",");
      g.addColorStop(1, `rgba(${parts[0]},${parts[1]},${parts[2]},0)`);
      gradCache[th] = g;
    }
    return gradCache[th];
  }
  let vig = null, vigRed = null;
  function vignettes() {
    if (!vig) {
      vig = ctx.createRadialGradient(T.VIEW_W / 2, T.VIEW_H / 2, 95, T.VIEW_W / 2, T.VIEW_H / 2, 250);
      vig.addColorStop(0, "rgba(12,8,20,0)");
      vig.addColorStop(1, "rgba(12,8,20,0.32)");
      vigRed = ctx.createRadialGradient(T.VIEW_W / 2, T.VIEW_H / 2, 80, T.VIEW_W / 2, T.VIEW_H / 2, 240);
      vigRed.addColorStop(0, "rgba(255,40,60,0)");
      vigRed.addColorStop(1, "rgba(255,40,60,0.28)");
    }
  }
  function drawSkyGrade() {
    ctx.fillStyle = topGrade(theme());
    ctx.fillRect(0, 0, T.VIEW_W, 104);
  }
  function drawGrade() {
    vignettes();
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, T.VIEW_W, T.VIEW_H);
    // danger pulse: one heart left, or full panic
    const p1 = players && players[0];
    const scared = (p1 && !p1.dead && p1.hearts === 1 && p1.maxHearts > 1) || Game.happiness <= 0;
    if (scared && Game.state !== "clear") {
      ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Game.frame / 9);
      ctx.fillStyle = vigRed;
      ctx.fillRect(0, 0, T.VIEW_W, T.VIEW_H);
      ctx.globalAlpha = 1;
    }
  }

  return { drawFar, drawBack, drawFront, drawSkyGrade, drawGrade };
})();
