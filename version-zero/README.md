# Version Zero — animated "What If" pipeline

A reusable, deterministic pipeline for 9:16 animated science explainers in one consistent visual identity:
Remotion + React Three Fiber for picture, Python for timing and sound.

**Episode 01 — "What If the Entire Internet Disappeared for 5 Seconds?"**
→ final video, thumbnail, script, storyboard, sources and production notes in
[`deliverables/internet-5-seconds/`](deliverables/internet-5-seconds/).

## Quick start

```bash
npm install && pip install numpy scipy
python3 scripts/build_timeline.py   # narration take → timeline.json (cues + events)
npm run audio                       # procedural score + SFX + mix (−14 LUFS)
npm run studio                      # scrub in Remotion Studio
npm run render:preview              # half-res check
npm run render                      # final 1080×1920 MP4 → deliverables/<episode>/
npm run validate                    # automated output checks
```

The architecture, timing model, dependencies, licensing, known limitations and how to make the next
episode are in [`deliverables/internet-5-seconds/production-notes.md`](deliverables/internet-5-seconds/production-notes.md).

| Path | Role |
|---|---|
| `src/series/` | Reusable series kit: theme, animation/camera helpers, captions & HUD, effects, 3D globe/city/network, device UIs |
| `src/episodes/<id>/` | One episode: `episode.json` (script + event anchors), generated `timeline.json`, scenes |
| `scripts/` | Timeline builder, audio synthesis/mix, render, stills, contact sheets, validation |
| `assets/narration/` | Source narration takes |
