"use strict";
/* =====================================================================
 *  SHELL — the NEMTENBO handheld. On-screen buttons feed the very same
 *  input buses as the keyboard (core.js pads + menuPad), so touch and
 *  click play identically. Multi-touch works: each button captures its
 *  own pointer, so "move + jump" is two fingers, no conflict.
 * ===================================================================== */
(() => {
  // button -> { pad: gameplay action, menu: ui action }
  const MAP = {
    up:    { pad: "jump",   menu: "up" },
    down:  { pad: "down",   menu: "down" },
    left:  { pad: "left",   menu: "left" },
    right: { pad: "right",  menu: "right" },
    a:     { pad: "jump",   menu: "confirm" },   // A = jump / OK
    b:     { pad: "action", menu: "rub" },       // B = X-action / delete-in-store
    select:{ pad: "transform" },                 // the invisible phone
    shed:  { pad: "shed" },
    mute:  { menu: "mute" },
    // START is contextual (handled in press/release)
  };

  function press(btn) {
    AudioSys.init();                             // first gesture unlocks WebAudio
    if (btn === "start") {                        // pause while playing, else confirm
      const m = (Game.state === "play" || Game.state === "pause") ? "pause" : "confirm";
      menuPad.held[m] = true; menuPad.pressed.add(m);
      return;
    }
    const m = MAP[btn]; if (!m) return;
    if (m.pad)  { pads[0].held[m.pad]  = true; pads[0].pressed.add(m.pad); }
    if (m.menu) { menuPad.held[m.menu] = true; menuPad.pressed.add(m.menu); }
  }
  function release(btn) {
    if (btn === "start") { menuPad.held.pause = false; menuPad.held.confirm = false; return; }
    const m = MAP[btn]; if (!m) return;
    if (m.pad)  pads[0].held[m.pad]  = false;
    if (m.menu) menuPad.held[m.menu] = false;
  }

  document.querySelectorAll("[data-btn]").forEach(el => {
    const btn = el.dataset.btn;
    const down = e => {
      e.preventDefault();
      el.classList.add("on");
      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      press(btn);
    };
    const up = e => { e.preventDefault(); el.classList.remove("on"); release(btn); };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("lostpointercapture", up);
    el.addEventListener("contextmenu", e => e.preventDefault());
  });

  // belt-and-suspenders against mobile zoom/scroll gestures
  ["gesturestart", "gesturechange", "dblclick"].forEach(ev =>
    document.addEventListener(ev, e => e.preventDefault(), { passive: false }));

  // desktop keyboard users don't need the touch hint
  if (matchMedia("(pointer:fine)").matches) {
    const k = document.getElementById("kbd");
    if (k) k.textContent = "keyboard or buttons — both play";
  }
})();
