# the promo reel kit

Makes the ~26s vertical (1080×1920) Instagram/TikTok reel — real gameplay
with the game's own chiptune + SFX, close-up slide-ins, title cards in the
house palette, cuts on the beat of THE BIGGEST DREAM.

## recipe

```
# from the repo root
python -m http.server 8099 --bind 127.0.0.1     # serve the game (leave running)
node tools/reel/capture.js                       # records hero moments (opens a browser window)
node tools/reel/shoot_cards.js                   # screenshots the 3 title cards
node tools/reel/assemble.js                      # ffmpeg -> out/reel_1080x1920.mp4 + out/reel_1080x1080.mp4
```

Needs: ffmpeg on PATH, Playwright at `C:\Users\Mercardib\pw-drive`.

- `capture.js` tapes canvas.captureStream(60) + the WebAudio master gain
  into one MediaRecorder per scene. Gameplay scenes silence the *music*
  (SFX stay) so the continuous "biggest" bed recorded separately doesn't
  fight the per-world songs.
- `cards/*.html` are the title cards (gold `#ffe48a` / pink `#ffd9f0` /
  plum `#16131f`), content kept in the center 1080×1080 so the square
  crop loses nothing.
- `assemble.js` holds the cut list (`TIMELINE`) — durations are in beats
  (144bpm) so every hard cut lands on the music. Tweak, re-run.

`out/` is gitignored; videos never get committed.
