# Script — "What If the Entire Internet Disappeared for 5 Seconds?"

**Series:** Version Zero · What If · Episode 01
**Format:** 9:16, 1080 × 1920, 30 fps · **Runtime:** 39.7 s (1,192 frames)
**Voice:** ElevenLabs premade voice "Matilda" (model `eleven_v4`), played back at 1.05× (pitch preserved)

## The premise (stated precisely)

At T = 0, all public-internet packet forwarding stops worldwide for exactly five seconds. At T = 5 s the
infrastructure resumes. Nothing is damaged, no stored data is lost, electrical grids and private/offline
systems are unaffected. Apps may keep struggling after the network returns, because of timeouts, retries
and reconnection.

## Narration (final, as recorded)

Times are where each phrase sits in the finished video. They are generated from the real take by
`scripts/build_timeline.py`, and captions use the same times.

| # | Time (s) | Line | On-screen emphasis |
|---|---|---|---|
| 1 | 0.12 – 2.43 | What if the entire internet disappeared… | **entire internet** (cyan) |
| 2 | 2.88 – 4.26 | …for just five seconds? | **five seconds** (coral) |
| 3 | 4.81 – 5.46 | Instantly, | |
| 4 | 5.58 – 8.03 | billions of connections would stop responding. | **stop responding** (coral) |
| 5 | 8.43 – 9.30 | Mid-sentence. | coral |
| 6 | 9.62 – 10.33 | Mid-game. | coral |
| 7 | 10.65 – 11.40 | Mid-update. | coral |
| 8 | 11.90 – 13.27 | Card payments could stall. | **stall** (coral) |
| 9 | 13.56 – 15.27 | Online services could time out. | **time out** (coral) |
| 10 | 15.71 – 17.15 | But not everything would stop. | **not everything** (cyan) |
| 11 | 17.65 – 18.82 | The power would stay on. | **stay on** (cyan) |
| 12 | 19.12 – 20.87 | Offline systems would keep running. | **keep running** (cyan) |
| 13 | 21.17 – 23.12 | And some videos wouldn't even pause. | **wouldn't even pause** (cyan) |
| 14 | 23.38 – 25.68 | The next few seconds are already downloaded. | **already downloaded** (cyan) |
| 15 | 26.28 – 27.91 | Then, five seconds later, | |
| 16 | 28.02 – 29.20 | the internet comes back. | **comes back** (cyan) |
| 17 | 29.61 – 31.27 | Some apps recover right away. | **right away** (cyan) |
| 18 | 31.57 – 33.52 | Others are still waiting to retry. | **waiting to retry** (amber) |
| 19 | 33.97 – 38.12 | Because getting the connection back isn't the same as getting everything working again. | **connection back** (cyan) / **everything working** (amber) |

Word count: 87 · Speaking rate ≈ 165 wpm after the 1.05× tempo.

## On-screen text (non-caption)

Interface text that carries the explanation visually:

- Status pill: `INTERNET: ONLINE` → `INTERNET: OFFLINE` → `INTERNET: BACK ONLINE`
- Countdown `5.00 s` → `0.00 s`, labelled `◷ SLOWED DOWN ≈5×`. Five real seconds are stretched over about 26 s of screen time.
- Video call: `Connection unstable` / `frozen`. Online match: `P2 · NO UPDATES`, `PING ———`. Dashboard: `waiting for data`, `Last update 1.4 s ago`.
- Card terminal: `Authorizing… waiting for bank · 0.4 s`, with a `NO RESPONSE` break on the link to the card network.
- Cloud app: `Request timed out — Couldn't reach the server`.
- Legend: `APPS: online · waiting · timed out`.
- Split screen: `NEEDS THE INTERNET` / `WORKS WITHOUT IT` (power, notes on device, traffic signal, video).
- Buffer explainer: `VIDEO · ON DEMAND`, `still playing`, `ALREADY DOWNLOADED`, `download paused`.
- Recovery tiles: `resumed`, `snapped back`, `never paused`, `retrying`, `reconnecting`, `retry in 3s`.
- Payoff chart: `INTERNET CONNECTION` (`back instantly`) vs `APPLICATION RECOVERY` (`still catching up`), `5 s OFFLINE`.
- End card: `VERSION ZERO — WHAT IF · EPISODE 01`.

## Script decisions made for accuracy

- **"Billions of connections"**, not "billions of people". About 6 billion people use the internet (ITU 2025), but not all at once. Each active phone, PC and connected device holds one or more open connections, so billions of simultaneous connections is a conservative, defensible order of magnitude. See `sources.md` §11.
- **"Could stall / could time out / some videos / some apps"**: every application claim is qualified, because apps genuinely behave differently. The brief explicitly requires this.
- **No "approved offline" payment.** In the US most chip terminals are configured online-only (floor limit 0). The terminal only ever shows "Authorizing…" and later "Retrying…" (sources §6).
- **"Some videos"** means on-demand video with a buffer, labelled `ON DEMAND` on screen. Live and low-latency streams keep only a small buffer and might pause (sources §4).
- **"The power would stay on"** is part of the stated premise, and is consistent with how grids operate: protection acts locally and the grid doesn't run second-to-second over the public internet (sources §8). The city's windows, streetlights, cars and traffic signals never change during the outage. That's a deliberate "rewatch" detail.
- **"Others are still waiting to retry"** is the core payoff and maps to real mechanisms: TCP's doubling retransmission timer, app-level backoff such as Socket.IO's 1 s → 5 s reconnection delays, and the need to re-establish connections that timed out (sources §1, §10, §13).
