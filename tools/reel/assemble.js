/* =====================================================================
 *  PROMO REEL — assemble.js
 *  ffmpeg pipeline: per-scene 9:16 normalization (close-up crops,
 *  slide-pans, zoompan push-ins), beat-snapped hard cuts (the bed is
 *  "biggest" at 144bpm — 1 beat = 0.41667s), game SFX over a continuous
 *  chiptune bed, loud-but-limited mix. Outputs:
 *    tools/reel/out/reel_1080x1920.mp4   (Instagram/TikTok vertical)
 *    tools/reel/out/reel_1080x1080.mp4   (square, center crop — cards
 *                                         are designed center-safe)
 *  Usage: node tools/reel/capture.js && node tools/reel/shoot_cards.js
 *         && node tools/reel/assemble.js
 * ===================================================================== */
const { execFileSync } = require("child_process");
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "out");
const SEG = path.join(OUT, "seg"), CARDS = path.join(OUT, "cards");
const CHUNK = path.join(OUT, "chunk");
fs.mkdirSync(CHUNK, { recursive: true });

const BEAT = 60 / 144;                       // the "biggest" bed's beat
const PLUM = "0x16131f";
const BED_GAIN = 2.4, SFX_GAIN = 1.5;

/* the cut list — durations in beats so every cut lands on the music.
 * styles: closeup (2.67x center crop) | pan (close-up that slides)
 *         full (whole canvas boxed on plum + push-in) | card (still + push-in) */
const TIMELINE = [
  { name: "dash",   src: "seg/dash.webm",    style: "pan",     ss: 0.8, beats: 8 },
  { name: "card1",  src: "cards/card1.png",  style: "card",             beats: 4 },
  { name: "title",  src: "seg/title.webm",   style: "full",    ss: 0.3, beats: 6 },
  { name: "boss",   src: "seg/boss.webm",    style: "closeup", ss: 0.4, beats: 8 },
  { name: "candy",  src: "seg/candy.webm",   style: "pan",     ss: 0.8, beats: 6 },
  { name: "card2",  src: "cards/card2.png",  style: "card",             beats: 4 },
  { name: "flag",   src: "seg/flag.webm",    style: "closeup", ss: 0.4, beats: 5 },
  { name: "bigguy", src: "seg/bigguy.webm",  style: "full",    ss: 0.3, beats: 8 },
  { name: "clear",  src: "seg/clear.webm",   style: "full",    ss: 0.5, beats: 7 },
  { name: "card3",  src: "cards/card3.png",  style: "card",             beats: 6 },
];

function ff(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
}

/* ---- 1. normalize every scene to a 1080x1920/30fps/48k chunk ---- */
const D2 = n => n.toFixed(4);
TIMELINE.forEach((s, i) => {
  const D = s.beats * BEAT;
  const dur = D2(D);
  const out = path.join(CHUNK, String(i).padStart(2, "0") + "_" + s.name + ".mp4");
  let vf, inputs;
  if (s.style === "card") {
    inputs = ["-loop", "1", "-framerate", "30", "-t", dur, "-i", path.join(OUT, s.src),
              "-f", "lavfi", "-t", dur, "-i", "anullsrc=r=48000:cl=stereo"];
    vf = `zoompan=z='1+0.06*on/(30*${dur})':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s=1080x1920:fps=30,setsar=1`;
  } else {
    inputs = ["-ss", D2(s.ss), "-t", dur, "-i", path.join(OUT, s.src)];
    if (s.style === "closeup")
      vf = `fps=30,crop=405:720:x=(iw-405)/2+30:y=0,scale=1080:1920:flags=neighbor,setsar=1`;
    else if (s.style === "pan")
      vf = `fps=30,crop=405:720:x='clip((iw-405)/2-100+200*t/${dur},0,iw-405)':y=0,` +
           `scale=1080:1920:flags=neighbor,setsar=1`;
    else  // full: crisp upscale, gentle push-in, boxed on plum
      vf = `fps=30,scale=1080:676:flags=neighbor,` +
           `zoompan=z='1+0.10*on/(30*${dur})':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s=1080x676:fps=30,` +
           `pad=1080:1920:0:622:color=${PLUM},setsar=1`;
  }
  const af = s.style === "card"
    ? "anull"
    : "aresample=48000,aformat=channel_layouts=stereo,apad,atrim=0:" + dur + ",asetpts=PTS-STARTPTS";
  ff([...inputs,
      "-filter_complex", `[0:v]${vf}[v];[${s.style === "card" ? 1 : 0}:a]${af}[a]`,
      "-map", "[v]", "-map", "[a]",
      "-t", dur, "-r", "30",
      "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "192k", "-ar", "48000",
      out]);
  console.log("chunk", s.name, dur + "s");
});

/* ---- 2. hard cuts on the beat: concat all chunks ---- */
const listFile = path.join(OUT, "concat.txt");
fs.writeFileSync(listFile,
  TIMELINE.map((s, i) =>
    "file '" + path.join(CHUNK, String(i).padStart(2, "0") + "_" + s.name + ".mp4").replace(/\\/g, "/") + "'"
  ).join("\n"));
const cuts = path.join(OUT, "cuts.mp4");
ff(["-f", "concat", "-safe", "0", "-i", listFile, "-c", "copy", cuts]);

/* ---- 3. lay the continuous chiptune bed under the SFX ---- */
const TOTAL = TIMELINE.reduce((a, s) => a + s.beats, 0) * BEAT;
console.log("total", TOTAL.toFixed(2) + "s (" + TIMELINE.reduce((a, s) => a + s.beats, 0) + " beats)");
const vertical = path.join(OUT, "reel_1080x1920.mp4");
ff(["-i", cuts, "-i", path.join(SEG, "bed.webm"),
    "-filter_complex",
    `[0:a]volume=${SFX_GAIN}[sfx];` +
    `[1:a]atrim=0.2:${D2(0.2 + TOTAL)},asetpts=PTS-STARTPTS,aresample=48000,` +
    `aformat=channel_layouts=stereo,volume=${BED_GAIN},` +
    `afade=t=in:d=0.25,afade=t=out:st=${D2(TOTAL - 1.5)}:d=1.5[bed];` +
    `[sfx][bed]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.9:level=false[a]`,
    "-map", "0:v", "-map", "[a]",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
    "-movflags", "+faststart",
    vertical]);

/* ---- 4. the square variant: center crop (cards are center-safe) ---- */
const square = path.join(OUT, "reel_1080x1080.mp4");
ff(["-i", vertical,
    "-vf", "crop=1080:1080:0:420",
    "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-pix_fmt", "yuv420p",
    "-c:a", "copy", "-movflags", "+faststart",
    square]);

console.log("\nDONE:\n  " + vertical + "\n  " + square);
