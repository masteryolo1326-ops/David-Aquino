# Storyboard — "What If the Entire Internet Disappeared for 5 Seconds?"

Every timecode below comes from `src/episodes/internet-5-seconds/timeline.json`. Visual events are
anchored to narration phrases in `episode.json`, so this board, the picture and the sound all share one
clock. Frame = seconds × 30.

**Visual language**
- Cyan = live internet links. Coral = disruption. Amber = waiting/retrying. Warm light = electricity. Cream = explanation.
- The countdown is the episode's spine: hero-sized in the hook, docked at the top while we examine the outage, hero again for the last moments.
- Two separate light layers make the central idea visible before it's said. **Warm** window and street light (power) never changes. **Cyan** links (internet) die and return.

**Safe zones (1080 × 1920):** HUD at y 170–360; action at y 330–1210; captions at y 1236–1450; nothing important right of x 930 between y 760 and 1500 (TikTok's buttons) or below y 1480 (caption/handle block).

---

## Scene 1 — The Hook (0:00.00 – 0:04.14)

| # | Time | Picture | Camera | Text | Sound |
|---|---|---|---|---|---|
| 1.1 | 0.00 | **First frame:** stylized night Earth (dot-matrix land, warm city lights, ~75 cyan arcs with travelling packets). Pill `INTERNET: ONLINE`; giant `5.00 s`. | Slow orbit + push-in (distance 9.4 → 8.7). | Caption "What if the **entire internet** disappeared…" already on screen at frame 0. | D-minor pulse at 120 bpm, arpeggio, soft kick; network "chatter" blips. VO starts at 0.12. |
| 1.2 | 1.08 | Single 2-frame flicker of all arcs (anticipation). | — | — | — |
| 1.3 | **2.33 blackout** | Arcs flash coral, then die (faint dashed lines). Packets freeze mid-flight. Glitch tear + scanlines for 0.36 s; timer shakes with chromatic split and turns coral; pill → `INTERNET: OFFLINE`. **City lights stay on.** | 0.3 s glitch offset. | Countdown starts: 5.00 → … | Glitch burst + 1400→60 Hz power-down sweep + sub thump. Music tape-stops into a low D drone (sudden drop in ambience). |
| 1.4 | 2.81 → 4.14 | Dive: Earth rushes toward the US East Coast lights. Countdown docks to the top HUD; `◷ SLOWED DOWN ≈5×` appears. | Accelerating dive (ease-in-cubic), distance → 1.07. | "…for just **five seconds**?" | Rising whoosh into a soft low impact. |
| 1.5 | 4.08 | Cyan punch-through flash: globe scales out, city scales in. | Zoom-through transition. | — | — |

## Scene 2 — The First Second (0:04.14 – 0:11.10)

| # | Time | Picture | Camera | Text | Sound |
|---|---|---|---|---|---|
| 2.1 | 4.14 | Aerial night city: lit windows, streetlights, moving cars, cycling traffic signals. Rooftop internet links are dead dashed lines. Rooftop rings = apps, all cyan. | Descend from 31 m-equivalent height toward a glide (Catmull-Rom spline). | "Instantly, billions of connections would **stop responding**." | Drone, glassy high pad, slowed-clock ticks at 4.5 / 4.0. |
| 2.2 | 4.6 – 7.4 | Rings flip amber at **random** moments: each app notices the same outage at a different time. Legend `APPS: online · waiting · timed out`. | Glide. | — | — |
| 2.3 | 7.00 | **Video call** card rises out of the city with overshoot. Sam is mid-sentence, self-view bottom-right. | Lateral drift. | — | UI pop. |
| 2.4 | **8.11** | Sam's video **freezes** with mouth open: desaturation, macroblocks, `Connection unstable`, header `frozen`. **Self-view keeps moving** because your camera is local. | — | "**Mid-sentence.**" | Bit-crushed stutter. |
| 2.5 | 8.59 | Card pushes left; **Online match** pushes in. YOU (cyan) and P2 (violet) both moving. | Push matches camera drift. | — | Swipe. |
| 2.6 | **9.21** | P2 freezes with a coral ring and `P2 · NO UPDATES`; `PING ———`. **YOU keep moving** (client-side prediction). | — | "**Mid-game.**" | Glitch pop. |
| 2.7 | 9.69 | Push to **Live dashboard** (orders/min, active users, scrolling line). | — | — | Swipe. |
| 2.8 | **10.30** | Data stops: line ends, amber "no data" region, `waiting for data`; `Last update 0.6 s ago…` counts in real (slowed) seconds, matching the countdown. | — | "**Mid-update.**" | Descending two-note amber chime. |

## Scene 3 — The Ripple (0:11.10 – 0:16.70)

| # | Time | Picture | Camera | Text | Sound |
|---|---|---|---|---|---|
| 3.1 | 11.10 | **Card terminal** rises in (`$12.40 · Tap card to pay`). Dotted link to `CARD NETWORK` icon. | Glide right. | "Card payments could **stall**." | Swipe. |
| 3.2 | 11.39 | Card taps, contactless rings → `Authorizing…`, `waiting for bank · 0.x s`. Link shows coral ✕ `NO RESPONSE`. | — | — | Contactless beep; quiet pending pulse every 0.45 s. |
| 3.3 | 12.77 | Terminal shrinks left; **phone with a cloud Photos app** slides in, loading skeleton shimmer. | — | "Online services could **time out**." | Swipe. |
| 3.4 | **14.33** (on "time") | `Request timed out — Couldn't reach the server`, coral border. Meanwhile about 45% of city rings turn coral at scattered times. It's a scatter, not a wave: nothing physical is spreading. | — | — | Soft error "bonk". |
| 3.5 | **15.28** | Devices drop away. The city's warm light swells: windows, streetlights, cars and signals are all still going. | Pull up and back to reveal the city. | "But **not everything** would stop." | Inverse whoosh; the music turns from drone to a warm F-major pad. |

## Scene 4 — The Surprise (0:16.70 – 0:25.50) · central reveal

| # | Time | Picture | Camera | Text | Sound |
|---|---|---|---|---|---|
| 4.1 | 16.70 | Split screen slides in. Top: `NEEDS THE INTERNET` (coral) with minis of the timed-out cloud app, the stalled terminal and the frozen call. Bottom: `WORKS WITHOUT IT` (cyan). | City orbits slowly behind a 72% dim. | — | Panel whoosh. |
| 4.2 | **17.14** | Tile **POWER · on**: glowing bulb, lit building. | — | "The power would **stay on**." | Warm pluck + 60 Hz hum. |
| 4.3 | **18.76** | Tiles **NOTES · ON DEVICE** (list typing itself) and **TRAFFIC SIGNAL · local** ("runs its own timing plan", cycling). | — | "Offline systems would **keep running**." | Two plucks; soft typing. |
| 4.4 | **20.89** | Tile **VIDEO · playing**: sunset clip with progress and buffer bar. | — | "And some videos **wouldn't even pause**." | Pluck. |
| 4.5 | **22.89** | Video tile expands to fill the split. The progress bar zooms around the playhead: cyan = played, cream = buffered, bracket `ALREADY DOWNLOADED`, amber `download paused ▲` at the buffer edge, pill `still playing`. The playhead keeps moving into the buffer. | Expand transition (0.6 s, in-out cubic). | "The next few seconds are **already downloaded**." | Zoom whoosh + shimmer bell. |

## Scene 5 — The Internet Returns (0:25.50 – 0:33.42)

| # | Time | Picture | Camera | Text | Sound |
|---|---|---|---|---|---|
| 5.1 | 25.50 | Panels fly out. New low angle over the city. The countdown grows back to hero size over a dark radial backdrop: `0.44 … 0.04`. | Low glide toward the towers. | "Then, five seconds later," | Riser builds; final ticks accelerate (0.5, 0.3, 0.15). |
| 5.2 | **28.62 reconnect** | `0.00` turns cyan with a pop; cyan flash. **Every rooftop link relights at the same instant** (the premise: simultaneous). Packets resume. Pill → `INTERNET: BACK ONLINE`. About 40% of rings go cyan immediately; the rest turn amber (retrying). | Slight push-in. | "the internet **comes back**." (anchored to the word "back" via the take's word timings) | D-major bell sparkle + sub hit; the pulse and chatter return. |
| 5.3 | 29.57 | Recovery grid, first row: **VIDEO CALL ✓ resumed** (Sam unfreezes and talks), **ONLINE GAME ✓ snapped back** (P2 rubber-bands to the server position), **VIDEO ✓ never paused**. | — | "Some apps recover **right away**." | Three ascending success bells. |
| 5.4 | 31.36 | Amber tiles: **CARD PAYMENT ↻ retrying**, **DASHBOARD ↻ reconnecting** (stale chart), **CLOUD PHOTOS ↻ retry in 3s** (counting down). Remaining city rings recover one by one at scattered times. | — | "Others are still **waiting to retry**." | Low amber plucks. |

## Scene 6 — The Payoff (0:33.42 – 0:39.67)

| # | Time | Picture | Camera | Text | Sound |
|---|---|---|---|---|---|
| 6.1 | 33.42 | Tiles fly up; cream flash; the camera rises out of the city into a pull-back from Earth. All arcs live, packets flowing. | Zoom-out transition; globe distance 1.1 → 10.4 (ease-out). | — | Riser into a reverse whoosh. |
| 6.2 | **33.87** | Chart card rises below Earth. Lane **INTERNET CONNECTION** (cyan) draws: full → drops at 0 → flat through the coral `5 s OFFLINE` band → **straight back up at 5 s**, tagged `back instantly`. | — | "Because getting the **connection back**" | Two pitched plucks on the step down and back up. |
| 6.3 | **35.62** | Lane **APPLICATION RECOVERY** (amber) draws as a staircase. It steps down over the first second as apps notice, stays low, then climbs in steps **after** 5 s with ✓ marks, and a dashed `still catching up` span covers 5 → ~11 s. | — | "isn't the same as getting **everything working** again." | A rising bell for each ✓. |
| 6.4 | **38.20 → 39.67** | End card: `VERSION ZERO · WHAT IF · EPISODE 01` above a slowly turning, fully connected Earth and the finished chart. The last frame mirrors the first (Earth + network), so the video loops cleanly. | Slow drift. | — | Final bell pair + soft low thump; the mix fades out. |

---

### Rewatch details (deliberately unexplained)
- The city's warm lights, cars and traffic signals never change once: electricity and local systems.
- Your self-view never freezes; your game character never stops (client-side prediction).
- The dashboard's "last update" age and the payment terminal's wait counter use real seconds, so they agree with the slowed countdown.
- Rooftop rings flip at scattered, uncoordinated moments, both going down and coming back.
- The chart's ✓ steps correspond to the amber tiles from Scene 5 finishing their retries.
