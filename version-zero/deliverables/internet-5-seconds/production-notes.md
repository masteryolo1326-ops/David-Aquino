# Production notes — Version Zero, Episode 01

## Deliverables (this folder)

| File | What it is |
|---|---|
| `version-zero-internet-5-seconds.mp4` | Final video: 1080×1920 (9:16), 30 fps, 39.67 s / 1,190 frames, H.264 (yuv420p, CRF 21, x264 *slow*) + AAC 192 kb/s 48 kHz stereo, −14 LUFS. Narrated by ElevenLabs "Dan Dan". |
| `version-zero-internet-5-seconds-thumbnail.png` | 1080×1920 thumbnail: the blackout moment (frame 71) with captions hidden |
| `script.md` | Final narration with timings, on-screen text, accuracy decisions |
| `storyboard.md` | Shot-by-shot plan with timecodes, camera, text and sound |
| `sources.md` | Fact-check, with each source tagged by how it was verified |
| `production-notes.md` | This file |

The editable source project is `version-zero/` (one level up).

## How to render

Prerequisites:
- Node 18+ (built with Node 22).
- Python 3.10+ with `numpy` and `scipy`.
- `ffmpeg`/`ffprobe`.
- A Chromium build. Remotion downloads one automatically. In the original cloud container the preinstalled headless shell was used, via `scripts/render-config.mjs`; set `BROWSER_EXECUTABLE` to override it.

```bash
cd version-zero
npm install
pip install numpy scipy

# 1) timeline: split the narration take at its pauses, map phrases to script cues, resolve all events
python3 scripts/build_timeline.py            # → src/episodes/internet-5-seconds/timeline.json + public/audio/.../narration.wav
# 2) soundtrack: procedural music + SFX, ducking, mix, loudness normalisation
npm run audio                                # → public/audio/internet-5-seconds/{music,sfx,mix}.wav
# 3) look-dev
npm run studio                               # Remotion Studio (interactive scrubbing)
node scripts/stills.mjs --times 0,8.6,24 --out out/stills
# 4) render
npm run render:preview                       # half-res check → out/preview.mp4 (~6 min in a 4-vCPU container)
npm run render                               # final → deliverables/internet-5-seconds/version-zero-internet-5-seconds.mp4
# 5) validate
npm run validate                             # codec/res/fps/frames/decode/black/frozen/silence/loudness/AV-sync
# thumbnail
node scripts/stills.mjs --frames 71 --scale 1 --props '{"hideCaptions":true}' --out out/thumb
```

In the cloud container (4 vCPU, no GPU, WebGL through ANGLE/SwiftShader) the final render takes about 8–9
minutes. CRF 21 was chosen after measuring SSIM 0.990 against a CRF 17 master at about 60% of the size;
the CRF 17 master was 79 MB. On a machine with a GPU, set `chromiumOptions.gl` in `scripts/render-config.mjs` to suit
(`angle` usually works; `null` uses the default).

## Architecture (the reusable pipeline)

```
version-zero/
├─ src/series/                 ← reusable across every episode
│  ├─ theme.ts                 palette (navy/indigo bg, cyan live, coral disruption, amber waiting, cream text), fonts, TikTok safe zones
│  ├─ anim.ts                  deterministic easing, keyframes, seeded RNG, value noise
│  ├─ camera.ts                time-keyed Catmull-Rom camera splines (continuous, non-robotic moves)
│  ├─ timeline.ts              Timeline types, context, useTime()/useEvents()
│  ├─ fonts.ts                 bundled Space Grotesk + JetBrains Mono (@fontsource, OFL), delayRender until loaded
│  ├─ hud/                     Captions (phrase-synced, keyword highlights, frame-0 safe), Countdown, Pill, Brand (V0 monogram + wordmark)
│  ├─ fx/Effects.tsx           Glitch, Flash, Vignette, glitchOffset
│  ├─ three/                   Globe (dot-matrix Earth, warm city lights, atmosphere, stars, orbit camera),
│  │                           City (procedural instanced night city, windows w/ AA, roads, cars, signals, beacons),
│  │                           ArcNetwork (one-draw-call glowing links + packets; live/dead/alarm/flash/frozen-time),
│  │                           geo.ts (lat/lon, great-circle arcs)
│  └─ devices/                 Card chrome + icons, VideoCall (avatar), GameView, Dashboard, PaymentTerminal,
│                              Phone + CloudApp, LocalTiles (power, notes, traffic signal, VideoPlayer w/ buffer explainer)
├─ src/episodes/internet-5-seconds/
│  ├─ episode.json             SCRIPT + EVENT ANCHORS (single source of truth for timing)
│  ├─ timeline.json            generated: absolute cue + event times
│  ├─ state.ts                 episode "physics": countdown, link state, packet clock, beacon states — pure functions of t
│  ├─ World.tsx                3D layer scheduling: globe → city → globe with zoom-through transitions
│  ├─ Hud.tsx, Episode.tsx     composition: world, scene overlays, HUD, captions, audio
│  └─ scenes/                  FirstSecond, Ripple, Surprise, Return, Payoff, StatusLegend
├─ scripts/
│  ├─ build_timeline.py        narration take → speech segments → cues → timeline.json (+ re-spaced narration)
│  ├─ build_audio.py           stems → sidechain ducking → mix → two-pass loudnorm (−14 LUFS / −1.5 dBTP)
│  ├─ audio/synth.py           deterministic synthesis toolkit (pads, plucks, bells, risers, glitches, reverb)
│  ├─ audio/internet_5_seconds.py   the episode's score + SFX cue sheet, keyed to timeline events
│  ├─ render.mjs, stills.mjs, render-config.mjs, contact-sheet.sh
│  ├─ validate.sh, av_sync.py  automated output validation
│  └─ gen-globe-data.mjs       Natural Earth land → dot positions (output committed in src/data)
└─ assets/narration/           the ElevenLabs take (source of truth for the voice)
```

### The timing model: why nothing can drift
1. `episode.json` holds the script as **cues**: text, the gap before each, a caption group and highlights. It also holds **events** anchored to cue edges, for example `"reconnect": {cue: "c16", edge: "start", offset: 0.72}`.
2. `build_timeline.py` decodes the take and finds its speech segments. Different voices pause in different places, so the segments are **aligned** to the cues by a small dynamic program. It matches each cue's expected speaking time (from its character count) and keeps long pauses between cues rather than inside them. The script prints a per-cue duration ratio so a skipped or misread line stands out. It then places each phrase at its cue time and resolves every event to absolute seconds.
   - If the take has word timings (`narration.words`, for example an ElevenLabs Scribe transcript), events can anchor to a **word**: `"reconnect": {cue: "c16", word: "back"}` puts the reconnection hit exactly on "back". Caption splits snap to a real pause near the proportional point.
3. Visuals (`useEvents()`), captions (cue times) and sound (`audio/<episode>.py`) all read the same `timeline.json`. Change a gap or re-record the voice, rebuild, and everything follows.
4. All animation is a pure function of the frame: seeded randomness, no `Math.random()` and no wall-clock time. Any frame renders identically in isolation, which Remotion's parallel tabs require. R3F uniforms and cameras are set in `useLayoutEffect` so they apply before `@remotion/three` calls `advance()`.

### Making the next episode
1. Copy `src/episodes/internet-5-seconds/` to `src/episodes/<new-id>/` and rewrite `episode.json` (cues + events).
2. Record narration (one take with blank lines between cue paragraphs), drop it in `assets/narration/`, optionally add its word timings, and run `build_timeline.py --episode <new-id>`. Re-voicing an existing episode is the same: point `narration.source` at the new take, rebuild the timeline and audio, then re-render. The narration is levelled by its spoken RMS (`normalize_voice`), so the music/SFX balance carries over to any voice.
3. Write `scripts/audio/<new_id>.py` with a `render(timeline)` that returns `{music, sfx}`, reusing `synth.py` and the instruments in the episode-01 module.
4. Compose scenes from `src/series/*`, register the composition in `src/Root.tsx`, then preview, inspect, render and validate.

## Dependencies (pinned)

| Package | Version | Why |
|---|---|---|
| remotion, @remotion/cli, @remotion/renderer, @remotion/bundler | 4.0.535 | deterministic frame rendering, encoding |
| @remotion/three | 4.0.535 | R3F canvas synced to Remotion frames |
| three | 0.186.1 | 3D (globe, city, network) |
| @react-three/fiber | 9.8.1 | React renderer for three |
| react / react-dom | 19.2.0 | |
| @fontsource/space-grotesk, @fontsource/jetbrains-mono | 5.3.0 | bundled OFL fonts (no network fonts at render) |
| dev: world-atlas 2.0.2, d3-geo 3.1.1, topojson-client 3.1.0 | | only for regenerating `globe-dots.json` |
| dev: typescript 5.9.3, @types/* | | typecheck |
| Python: numpy, scipy | | audio synthesis & analysis |

## Assets & licensing

| Asset | Source / licence |
|---|---|
| Narration | ElevenLabs library voice "Dan Dan" (`9F4C8ztpNUmXkdDDbz3J`), `eleven_v4`, generated for this project after the account was upgraded to a paid plan. Commercial use is governed by your ElevenLabs plan and the library voice's terms; confirm both before monetizing. An earlier take with the premade voice "Matilda" (`assets/narration/narration-take1.mp3`) was generated on the Free Tier, which is non-commercial and requires attribution. It is kept only as a reference and is not used in the final video. |
| Music & SFX | Original, synthesized from code in `scripts/audio/`. No samples, no third-party audio. |
| Land data | Natural Earth (public domain) via `world-atlas` (ISC) |
| Fonts | Space Grotesk, JetBrains Mono: SIL Open Font License |
| Remotion | Free for individuals, non-profits and companies with ≤3 employees. Larger companies need a Remotion company licence (remotion.dev/license). |
| Everything else | Original procedural graphics. No logos or third-party product UIs are imitated. |

## Quality control performed

- **Research pass**: 13 technical claims checked; the script was adjusted where needed (payments, live video, "billions", the recovery claim). See `sources.md`.
- **Narration check (Dan Dan)**:
  - An ElevenLabs Scribe transcript of the take matches the script word-for-word (89 tokens, in order).
  - The aligner mapped its 21 speech segments onto the 19 cues with every duration ratio in range. The ×1.6 on "Mid-game." is an expected stretch on a very short emphatic phrase.
  - Per-cue voice-to-bed ratio is 12.6–21.5 dB; integrated loudness is −14 LUFS.
  - The sub-bass drone was moved up an octave after spectrogram review.
  - Moving to RMS-based voice levelling fixed a bed that sat 18–26 dB under this denser voice.
- **Visual inspection**: stills from every scene at half and full resolution, plus a half-res preview sampled every 0.42 s. Fixes made:
  - Globe overlapped the captions; land dots were too dim.
  - The first city aerial was too dark and flat.
  - Distant window grids would shimmer (fixed with derivative-based anti-aliasing).
  - Buffer-explainer labels collided.
  - The countdown was unreadable over the bright reconnect frame.
  - The recovery dashboard tile was empty.
  - **Frame 0 had no HUD or caption** (fade-ins). The first frame now reads on its own.
  - Added the app-status legend so rooftop rings are understandable.
  - Moved the reconnect hit onto the word "back"; at mid-phrase it masked the narration.
- **Automated validation** (`scripts/validate.sh`): codec, resolution, fps, pixel format, duration, full decode, exact frame count, no black frames, no frozen segments, no silent gaps, loudness, and audio/timeline sync by cross-correlation. Results for the final file are at the end of this document.

## Known limitations & incomplete elements

- **One narration take per voice.** No alternative reads were compared. Dan Dan is tagged as a Spanish-language voice, so the English read carries a Spanish accent; this was the requested voice. One first attempt failed, uncharged, when ElevenLabs disabled the Free Tier on the account for "unusual activity" (likely the cloud session's proxy). It succeeded after the upgrade.
- **No human listening or phone viewing.** Audio was validated by measurement: segmentation, loudness, voice-to-bed ratios, spectrogram, sync. Visuals were checked by frame inspection. A human pass on headphones and a real phone is recommended before publishing.
- **Procedural score.** The music and SFX are original and functional, but a composer or sound-library pass would raise polish. Stems are exported (`public/audio/<ep>/music.wav`, `sfx.wav`, `narration.wav`) to make that easy.
- **Phrase-level captions.** Captions reveal per phrase, and the first phrase is on screen from frame 0. Word timings now exist for the Dan Dan take, but they are only used for event anchors; per-word caption animation was intentionally not used.
- **Stylization.** The countdown is slowed about 5× while cars, signals and video playback move at natural speed. The traffic-signal cycle is sped up. The recovery chart and beacon timings are illustrative. All of this is labelled in `sources.md`.
- **Software WebGL.** Rendering in a GPU-less container uses SwiftShader. It is deterministic and validated, but slower than GPU rendering.
- **Thumbnail text.** The thumbnail carries only in-scene text (`INTERNET: OFFLINE`, `5.00 s`). Platform title overlays are left to the uploader.

## Opportunities for future episodes

- Word-level caption styles (karaoke highlight) driven by the word timings that now flow through `timeline.json`.
- A `Scene` primitive with declarative enter/exit transitions to reduce per-scene boilerplate.
- More series assets: a reusable vehicle and airport kit, a weather layer, and a satellite/orbit kit (good for GPS or space episodes).
- Automated safe-zone linting: render a debug overlay of TikTok's UI and flag elements crossing it.
- Optional alternate cuts from the same timeline: 16:9 for YouTube, and 15 s teasers.
- A GPU render node to cut render time for longer episodes.

## Validation results: final file

`npm run validate` on `version-zero-internet-5-seconds.mp4` (Dan Dan narration, rendered in 446 s, 48 MB):

```
PASS file exists (48M)
PASS video codec h264
PASS audio codec aac (48000 Hz, 2 ch)
PASS resolution 1080x1920 (9:16)
PASS frame rate 30 fps
PASS pixel format yuv420p
PASS duration 39.68 s (expected 39.67 s)
PASS duration within 30–40 s target
PASS full decode: no errors
PASS frame count 1190
PASS no black frames
PASS no frozen (static >1.2 s) segments
PASS audio present throughout (no silence >1.2 s)
info integrated loudness: -14.0 LUFS (target -14)
PASS audio in sync with timeline mix (offset_ms=0.0 correlation=1.000)
ALL CHECKS PASSED
```
