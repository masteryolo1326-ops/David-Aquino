# Sources & fact-check — "What If the Entire Internet Disappeared for 5 Seconds?"

## How this was checked

The claims were researched in a dedicated fact-check pass during production. From the production
environment, many primary sites could not be opened directly: the egress proxy blocked them, or DNS
failed. Each source therefore carries a verification tag:

- **[V]**: the text was read directly, from the official source, the official repository, or a faithful
  mirror of an RFC.
- **[S]**: the quoted text was matched to the official URL through search results, but the page itself
  could not be opened. **Click through every [S] item before publishing or citing it.**

## 0. The premise (an assumption, not a claim)

At T = 0 all public-internet packet forwarding stops worldwide for exactly 5 s, then resumes. Hardware,
stored data, power grids and private/offline systems are unaffected. This premise is hypothetical. A real
global outage of any length would have messier causes and effects. See §12 for one way reality would
differ.

## 1. TCP waits on a doubling retransmission timer — **supported**

TCP resends unacknowledged data when its retransmission timer (RTO) expires, and doubles the timer after
each timeout. A connection that had data in flight during the outage only resumes when its next backed-off
timer fires. That moment can be a second or more **after** the path is restored.
- With an idealized 0.2 s minimum RTO, retries come at about 0.2, 0.6, 1.4, 3.0 and 6.2 s, so data resumes about 1.2 s after a 5 s outage.
- With RFC 6298's 1 s floor, retries come at 1, 3 and 7 s.
- The figures are illustrative: real RTOs depend on measured round-trip time.

- RFC 6298, IETF, https://www.rfc-editor.org/rfc/rfc6298 **[V]**: "(2.1) … the sender SHOULD set RTO <- 1 second"; "(2.4) … if it is less than 1 second, then the RTO SHOULD be rounded up to 1 second"; "(5.5) The host MUST set RTO <- RTO * 2 ("back off the timer")."
- Linux kernel `ip-sysctl` docs, https://docs.kernel.org/networking/ip-sysctl.html **[V]**: `tcp_rto_min_us` "Default: 200000"; `tcp_rto_max_ms` "Default: 120,000".
- Linux source **[V]**:
  - `include/net/tcp.h`: `#define TCP_RTO_MIN ((unsigned)(HZ / 5))`.
  - `net/ipv4/tcp_timer.c`: `icsk->icsk_rto = min(icsk->icsk_rto << 1, tcp_rto_max(sk));`
- RFC 9002 (QUIC), https://www.rfc-editor.org/rfc/rfc9002 **[V]**: "When a PTO timer expires, the PTO backoff MUST be increased, resulting in the PTO period being set to twice its current value."

## 2. Five seconds won't make TCP itself give up — **supported**

Linux keeps retransmitting for at least about 15 minutes by default. Keepalive only starts after 2 hours of
idle, and NAT state survives too. Individual applications can still set their own, shorter timeouts.
- Linux `ip-sysctl` docs **[V]**: "The default value of 15 yields a hypothetical timeout of 924.6 seconds and is a lower bound for the effective timeout"; `tcp_keepalive_time` "Default: 2hours".
- man tcp(7), https://man7.org/linux/man-pages/man7/tcp.7.html **[V]**: "approximately between 13 to 30 minutes, depending on the retransmission timeout."
- Linux `nf_conntrack-sysctl` docs **[V]**: `tcp_timeout_established` "default 432000 (5 days)".

## 3. Video calls freeze but usually survive — **supported**

Media stops during the gap. WebRTC only abandons a path after 30 s without consent responses. Some stacks
mark the connection "disconnected" after about 5 s, so a "Reconnecting…" UI is possible.
- RFC 7675, https://www.rfc-editor.org/rfc/rfc7675 **[V]**: "Consent expires after 30 seconds."
- Pion ICE, https://github.com/pion/ice/blob/main/agent_options.go **[V]**: `defaultDisconnectedTimeout = 5 * time.Second`, `defaultFailedTimeout = 25 * time.Second`.
- MDN, RTCPeerConnection.iceConnectionState **[V]**: "disconnected … may trigger intermittently and resolve just as spontaneously … during temporary disconnections."
- W3C webrtc-stats `freezeCount` definition **[V]**: a freeze is when frame duration ≥ Max(3 × average frame duration, average + 150 ms).

## 4. Buffered video can keep playing — **supported for on-demand, partial for live**

Players aim to download well ahead of the playhead. These are targets, not guarantees: a just-started,
just-seeked or slow-link video may have little buffered. Live and low-latency streams keep only a few
seconds, so the video is labelled **ON DEMAND** and the narration says **"some videos"**.
- hls.js API docs, https://github.com/video-dev/hls.js/blob/master/docs/API.md **[V]**: `maxBufferLength` "(default: `30` seconds)"; `liveSyncDurationCount` "(default: `3`)".
- dash.js Settings, https://github.com/Dash-Industry-Forum/dash.js/blob/development/src/core/Settings.js **[V]**: `bufferTimeDefault=18`, `bufferTimeAtTopQuality=30`, `bufferTimeAtTopQualityLongForm=60` (v5).

## 5. Online games: other players freeze, then snap — **supported (engine-specific values)**

In Source-engine-style networking, clients interpolate about 100 ms behind the server and extrapolate for at
most 0.25 s of missing updates. After that, remote players stop updating. Your own character keeps
responding (client-side prediction), then gets corrected when snapshots return. "Rubber-banding" is player
slang, not an official term.
- Valve Developer Community, "Source Multiplayer Networking", https://developer.valvesoftware.com/wiki/Source_Multiplayer_Networking **[S]**: "The extrapolation is done only for 0.25 seconds of packet loss (cl_extrapolate_amount)".
- Valve Source SDK 2013, https://github.com/ValveSoftware/source-sdk-2013 **[V]**:
  - `cl_extrapolate_amount "0.25"` (interpolatedvar.cpp).
  - `cl_smoothtime "0.1" "Smooth client's view after prediction error"` (c_baseplayer.cpp).

## 6. Card payments could stall — **supported; offline approval deliberately not shown**

Card-present payments normally wait for online authorization. In the US most chip terminals are online-only
(EMV floor limit 0), so the visual only shows "Authorizing…" and later "Retrying…". Some merchants enable
store-and-forward modes that take the card now and authorize later, at their own risk. These are not shown,
to avoid implying payments generally go through.
- Visa, "Minimum U.S. Online-Only Terminal Configuration", https://usa.visa.com/dam/VCOM/download/merchants/visa-minimum-us-online-only-terminal-configuration.pdf **[S]**: Terminal Floor Limit (tag 9F1B) set to zero.
- Stripe Docs, "Collect card payments while offline", https://docs.stripe.com/terminal/features/operate-offline/collect-card-payments **[S]**: "authorization is only attempted after connectivity is restored and the payment is forwarded".

## 7. Traffic signals keep running locally — **supported in substance**

Timing plans live in each intersection's controller. Agency specifications require continued operation from
stored plans if communications fail. The cycle shown on screen is sped up for readability.
- FHWA, Traffic Signal Timing Manual (FHWA-HOP-08-024), https://ops.fhwa.dot.gov/publications/fhwahop08024/chapter5.htm **[S]**: time-of-day plan selection can be done "locally at the controller".
- NJDOT signal system specification, https://nj-dot.nj.gov/transportation/eng/elec/TSS/english/pdf/Ebcl2.pdf **[S]**: "backup capabilities which will allow for a satisfactory level of system operation from stored timing plans should either the communication link or on-street master fail."

## 8. The power stays on — **premise + partially supported (indirect evidence)**

Grid protection acts on local measurements, and losing control-centre EMS functions has not historically
dropped load. No source states outright that grids "don't use the public internet". NIST notes that SCADA
links are often shared and increasingly IP-based, and some grid-edge devices (solar aggregators, smart
thermostats) do use the internet. Under this episode's stated premise, local electrical grids are unaffected.
- NERC, "Risks and Mitigations for Losing EMS Functions", https://www.nerc.com/comm/RSTC_Reliability_Guidelines/Risks_Mitigations_Losing_EMS_Functions_RefDoc.pdf **[S]**: "the loss of EMS functions did not lead to the loss of generators, transmission lines, or customer load."
- PNNL-29663, "Cybersecurity for Distance Relay Protection", https://www.pnnl.gov/main/publications/external/technical_reports/PNNL-29663.pdf **[S, paraphrase]**: stepped-zone distance protection uses local measurements with no communication channel.
- Contrary nuance: NIST CSRC glossary "SCADA", https://csrc.nist.gov/glossary/term/supervisory_control_and_data_acquisition **[S]**.

## 9. GPS works without the internet — **supported** (rewatch context, not narrated)

- FAA, GPS User Segment, https://www.faa.gov/about/office_org/headquarters_offices/ato/service_units/techops/navservices/gnss/gps/usersegments **[S]**: "the GPS user does not need to communicate with the satellite".

## 10. Recovery lag, retries and jitter — **supported**

If many clients retry at the same moment they can overload services. Well-built clients add randomized
backoff (jitter) to spread out retries. The Meta 2021 example was a multi-hour outage, so it is cited only
for *why recovery is staged*, not to imply a 5 s outage would cause a power or traffic surge. The episode
makes no surge claim.
- AWS Builders' Library, "Timeouts, retries, and backoff with jitter", https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/ **[S]**: "If all the failed calls back off to the same time, they cause contention or overload again when they are retried. Our solution is jitter."
- Meta Engineering, "More details about the October 4 outage", https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/ **[S]**: "flipping our services back on all at once could potentially cause a new round of crashes due to a surge in traffic."

## 11. "Billions of connections" — **supported as an order of magnitude**

ITU estimates about 6 billion internet users in 2025. That counts people active over a period, not
simultaneous sessions. Phones, computers and connected devices each keep one or more connections open, so
"billions of connections" at any instant is a conservative estimate. No source counts simultaneous
connections directly.
- ITU press release (17 Nov 2025), https://www.itu.int/en/mediacentre/Pages/PR-2025-11-17-Facts-and-Figures.aspx **[S]**: "an estimated 6 billion people – about three-quarters of the world's population – are using the Internet in 2025".

## 12. Where reality would differ: routing — **partially supported (caveat, not in the video)**

Default BGP hold timers (90 s suggested) would not expire in 5 s. But BFD can detect failures in under a
second, and RFC 5882 says to tear down the eBGP session. That would force route re-convergence, which has
historically taken seconds to minutes. So in a real event, parts of the internet could take longer to
return than the premise allows. The premise (infrastructure resumes at T = 5 s) sets this aside.
- RFC 4271, https://www.rfc-editor.org/rfc/rfc4271 **[V]**: "The suggested default value for the HoldTime is 90 seconds."
- RFC 5880, https://www.rfc-editor.org/rfc/rfc5880 **[V]**; RFC 5882, https://www.rfc-editor.org/rfc/rfc5882 **[V]**: "If Graceful Restart is not taking place on an EBGP session, and the corresponding BFD session fails, the EBGP session should be torn down".
- Labovitz et al., "Delayed Internet Routing Convergence", ACM SIGCOMM 2000, https://conferences2.sigcomm.org/sigcomm/2000/conf/abstract/5-2.htm **[S]** (old data).

## 13. Apps show "reconnecting" and back off — **partially supported**

Reconnect logic commonly backs off. Socket.IO's client defaults are a 1 s delay, doubling, capped at 5 s,
with ±50% jitter. But a socket with default heartbeats may not even notice a 5 s blip, and browsers don't
flag upstream outages. So the video shows "reconnecting"-type states on only **some** apps, and uses
"waiting for data" / "Authorizing…" where nothing would announce a failure.
- Socket.IO client source, https://github.com/socketio/socket.io/blob/main/packages/socket.io-client/lib/manager.ts **[V]**: `reconnectionDelay(opts.reconnectionDelay || 1000)`, `reconnectionDelayMax(opts.reconnectionDelayMax || 5000)`, `randomizationFactor(opts.randomizationFactor ?? 0.5)`.
- Engine.IO server defaults **[V]**: `pingTimeout: 20000, pingInterval: 25000`.
- MDN Navigator.onLine **[V]**: "connection to LAN is considered online, even though the LAN may not have Internet access."

---

## Illustrative (not measured) elements in the video
- **Countdown speed.** The countdown runs about 5× slow motion. Local animations (cars, traffic signals, video playback) keep a natural speed for readability.
- **Timing scatter.** When each rooftop "app" notices the outage and recovers is randomized for illustration.
- **Recovery chart.** The shape is qualitative: a step for connectivity, a staircase for recovery. Its values are not data.
- **Network arcs.** Globe and city arcs are an abstraction of connectivity, not a map of real cables or routes.
- **App screens.** Video call, game, dashboard, terminal and photo app screens are generic, original illustrations, not real products.
