# Production notes — Version Zero, Episode 01

## Deliverables (this folder)

| File | What it is |
|---|---|
| `version-zero-internet-5-seconds.mp4` | Final video: 1080×1920 (9:16), 30 fps, 39.73 s / 1,192 frames, H.264 (yuv420p, CRF 17, x264 *slow*) + AAC 192 kb/s 48 kHz stereo, −14 LUFS |
| `version-zero-internet-5-seconds-thumbnail.png` | 1080×1920 thumbnail: the blackout moment (frame 76) with captions hidden |
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
node scripts/stills.mjs --frames 76 --scale 1 --props '{"hideCaptions":true}' --out out/thumb
```

In the cloud container (4 vCPU, no GPU, WebGL through ANGLE/SwiftShader) the final render took about 9
minutes. On a machine with a GPU, set `chromiumOptions.gl` in `scripts/render-config.mjs` to suit
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
2. `build_timeline.py` decodes the take, finds speech segments, and **fails loudly** if their count doesn't match the cues. It then places each phrase at its cue time and resolves every event to absolute seconds. A cue can span several segments (`"segments": 2`) when a phrase has an internal pause; that also gives exact caption split points.
3. Visuals (`useEvents()`), captions (cue times) and sound (`audio/<episode>.py`) all read the same `timeline.json`. Change a gap or re-record the voice, rebuild, and everything follows.
4. All animation is a pure function of the frame: seeded randomness, no `Math.random()` and no wall-clock time. Any frame renders identically in isolation, which Remotion's parallel tabs require. R3F uniforms and cameras are set in `useLayoutEffect` so they apply before `@remotion/three` calls `advance()`.

### Making the next episode
1. Copy `src/episodes/internet-5-seconds/` to `src/episodes/<new-id>/` and rewrite `episode.json` (cues + events).
2. Record narration (one take with paragraph breaks between cues), drop it in `assets/narration/`, and run `build_timeline.py --episode <new-id>`.
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
| Narration | ElevenLabs, premade voice "Matilda", `eleven_v4`, generated for this project. **ElevenLabs' rights depend on the account plan**: free-tier output requires attribution and is not licensed for commercial use. Confirm the plan before monetizing. |
| Music & SFX | Original, synthesized from code in `scripts/audio/`. No samples, no third-party audio. |
| Land data | Natural Earth (public domain) via `world-atlas` (ISC) |
| Fonts | Space Grotesk, JetBrains Mono: SIL Open Font License |
| Remotion | Free for individuals, non-profits and companies with ≤3 employees. Larger companies need a Remotion company licence (remotion.dev/license). |
| Everything else | Original procedural graphics. No logos or third-party product UIs are imitated. |

## Quality control performed

- **Research pass**: 13 technical claims checked; the script was adjusted where needed (payments, live video, "billions", the recovery claim). See `sources.md`.
- **Narration check**: the take's speech segments matched the 19 script cues one-to-one (21 segments, two cues spanning two). Per-cue voice-to-bed ratio is ≥10 dB everywhere and 12–21 dB on all but the reconnect hit. Integrated loudness is −14.3 LUFS. The sub-bass drone was moved up an octave after spectrogram review.
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

- **One narration take.** The ElevenLabs account had quota for one take; three of the four requested variations failed, uncharged, with a quota error. About 167 credits remain. No alternative reads were compared.
- **No human listening or phone viewing.** Audio was validated by measurement: segmentation, loudness, voice-to-bed ratios, spectrogram, sync. Visuals were checked by frame inspection. A human pass on headphones and a real phone is recommended before publishing.
- **Procedural score.** The music and SFX are original and functional, but a composer or sound-library pass would raise polish. Stems are exported (`public/audio/<ep>/music.wav`, `sfx.wav`, `narration.wav`) to make that easy.
- **Phrase-level captions.** Word-level timestamps weren't available from the TTS route used. Captions reveal per phrase, and the first phrase is on screen from frame 0.
- **Stylization.** The countdown is slowed about 5× while cars, signals and video playback move at natural speed. The traffic-signal cycle is sped up. The recovery chart and beacon timings are illustrative. All of this is labelled in `sources.md`.
- **Software WebGL.** Rendering in a GPU-less container uses SwiftShader. It is deterministic and validated, but slower than GPU rendering.
- **Thumbnail text.** The thumbnail carries only in-scene text (`INTERNET: OFFLINE`, `5.00 s`). Platform title overlays are left to the uploader.

## Opportunities for future episodes

- Word-level caption timing: request ElevenLabs timestamps, or run forced alignment, and feed `splits` automatically.
- A `Scene` primitive with declarative enter/exit transitions to reduce per-scene boilerplate.
- More series assets: a reusable vehicle and airport kit, a weather layer, and a satellite/orbit kit (good for GPS or space episodes).
- Automated safe-zone linting: render a debug overlay of TikTok's UI and flag elements crossing it.
- Optional alternate cuts from the same timeline: 16:9 for YouTube, and 15 s teasers.
- A GPU render node to cut render time for longer episodes.
