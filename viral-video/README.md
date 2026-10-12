# What if SCP-173 was livestreamed? — 3D short

A ~58 s vertical (1080×1920, 30 fps) 3D video built on the same structure as the
viral "What if SCP-096 saw its own face?" clip, applied to a new situation.

Final file: `out/scp173-livestream.mp4`

## The formula it copies

| Beat | Original (096) | This video (173) |
| --- | --- | --- |
| Hook: "WHAT IF…" + a forbidden experiment | A mirror in the cell, "Nobody approved this" | A camera streaming the cell to the world, "Nobody approved this" |
| The rule, as a diagram | See face = become the target | Watched = frozen; blink = it moves |
| The loophole | "But if it sees itself? Its file says nothing" | "Does a screen count? Nobody has ever tested it" |
| Nickname / lore | "The Shy Guy", *sobbing* | "The Sculpture", *scraping* |
| The moment + live HUD stat | Target: NONE → ITSELF | Viewers: 0 → 1,000,000 |
| Three theories (comment bait) | Endless hunt / smash the mirror / nothing happens | Frozen forever / every lag is a blink / screens don't count |
| Twist that implicates the viewer | The camera filmed it, so you just saw its face | Streams run seconds behind, so you're watching the past |
| Payoff tied to the real file | "No video or optical tools… one more reason" | "Two persons must maintain *direct* eye contact… now you know why it says direct" |
| Loop | — | Final blink → its face in yours, cuts straight back to the hook |

Visual system: handle top-left, kicker card top-right (label / title / yellow
sub-line), red HUD stat chip, bottom block with yellow mono label + heavy
uppercase title + grey body, dark tiled cell, dips to black on every cut.

## Rebuild

```bash
cd viral-video
./build.sh                         # ~15 min on 4 CPUs (software WebGL); handle defaults to @versionzero.tv
HANDLE=@other ./build.sh           # same video, different handle
node tools/render.mjs --stills 1.5,30,56.8   # quick preview PNGs in build/stills/
```

- `assets/narration_raw.mp3`: ElevenLabs take (voice "Michael C. Vincent – Suspenseful Storyteller", eleven_v4) and `assets/narration_words.json`, its word timings.
- `tools/prepare_audio.py`: shortens pauses, speeds the read to 1.17×, writes `src/timeline.json` (scenes + cue times).
- `src/index.html`, `src/scene.js`: the three.js scene + text overlays; `window.renderFrame(t)` is deterministic.
- `tools/render.mjs`: headless Chromium renders each frame.
- `tools/sound.py`: synthesised drone and SFX, ducked under the voice, normalised to −14 LUFS.

To change the on-screen copy, edit `COPY` in `src/scene.js`. If you change the
narration, re-run the whole build so the timings follow it.

SCP-173 is from the SCP Foundation wiki (CC BY-SA 3.0). The statue design here is
original, not a copy of the sculpture photo used on the wiki.
