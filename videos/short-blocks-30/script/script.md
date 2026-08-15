# Short — Block 30: Latency Percentiles

**Status: LOCKED (Gate 1 passed, 2026-08-13). Hasan picked hook V2 (the scenario / proof-beat
exception) and locked B2–B7 as drafted, with B2's opener adapted per the variant spec. The
locked VO lines below are law — they go to ElevenLabs verbatim.**

## LOCKED VO (Gate 1)

| Beat | VO |
|---|---|
| B1 (cam, ~2.5s) | someone just told you your app is slow. |
| B2 (b-roll, ~9s) | you open it... loads in a blink. so you blame their wifi. don't. you built that app with Claude Code, you tested it, it was fast. for you. |
| B3 (TSX) | your page loaded a thousand times today. 900 came back in a tenth of a second. twenty of them took nine full seconds. and the average says 430. fine. nothing to fix. |
| B4 (cam) | there's a number that catches them. |
| B5 (TSX) | it's called latency percentiles. p50 is you. p99 is the person about to quit your app. |
| B6 (TSX) | one line to Claude: time every request, show me p50, p95, and p99. not the average. |
| B7 (cam) | that's the skill. knowing what to ask for. |
| B8 (end) | *(silence)* |

V2 consequences applied: the hook's second sentence ("you open it... loads in a blink.")
bridges over B2's b-roll, so the B1 cam burst stays ~2.5s (carries only the first sentence);
B2's b-roll scene becomes Hasan opening the page himself and it loading instantly (the
notification gag is spent in the hook).

Source post: `C:\Users\Malak\Documents\GitHub\my-x-growth-agent\blocks\block-30-latency-percentiles\post.txt`
Square diagram to adapt: `LatencyPercentilesV1Square.tsx` (same folder) — lift its computed
dot-rain core (BIN_COUNTS distribution, rankBin percentile walk, log scale) into vertical
narration-timed beats. Do NOT embed the rendered square mp4 in the final cut (X furniture,
self-timed) — but DO render one comparison frame of the embedded-square option for Hasan's
verdict on the reuse question.

Brand for TSX beats: **Vibe Engineering Blocks** (light, navy+coral, Claude mark) —
`C:\Users\Malak\Documents\GitHub\my-x-growth-agent\profile\visual-style.md`.

## Distillation record

- **Idea (fixed):** the average hides your slowest users; percentiles catch them.
- **Hook:** the post's angle line, adapted (variant 1 below; Hasan may swap).
- **Evidence carrier kept:** the 1000-loads breakdown — 900 in 100ms, 20 at nine seconds,
  average says 430ms. (Most visual; the diagram's dot-rain animates exactly this.)
- **Dropped:** Google/Core Web Vitals proof beat, the "1% of requests ≠ 1% of people" dice
  math, p95 as a spoken number (kept in the on-screen prompt only), enumeration bullets.
- **Payoff:** "latency percentiles."
- **Close:** the post's literal one-line prompt.

## Beat sheet (~37s, 1080×1920 @30fps, ~103 words)

| # | Type | Dur | VO | Visual | SFX intent |
|---|---|---|---|---|---|
| B1 | CAM | 2.5s | "one number decides if your app feels fast." | Hasan close, 9:16, caption chip | — |
| B2 | b-roll | 7s | "and it's not the average. you build an app with Claude Code, you test it, it's fast! then someone says it's slow." | Hasan-from-behind at desk, Claude Code on screen → phone notification "your app is slow" slides in | whoosh-soft on the cut; ui-click on the notification |
| B3 | TSX | 10s | "your page loaded a thousand times today. 900 came back in a tenth of a second. twenty of them took nine full seconds. and the average says 430. fine. nothing to fix." | Vertical dot-rain: dots fall + pile, tail glows red on "nine full seconds", calm dashed "avg 430ms" line lands in the empty middle on "430. fine." | riser-soft under the tail build → impact-soft on "nine full seconds" |
| B4 | CAM | 2s | "there's a number that catches them." | Hasan, slight lean-in (different framing than B1) | — |
| B5 | TSX | 6s | "it's called latency percentiles. p50 is you. p99 is the person about to quit your app." | NAME card stamps in (navy+coral); p50 marker on the pile's peak, p99 rising out of the red tail | **hero moment**: riser → impact on the stamp |
| B6 | TSX | 5.5s | "one line to Claude: time every request, show me p50, p95, and p99. not the average." | Claude Code / terminal mock, prompt types itself, send | ui-send on send |
| B7 | CAM | 2.5s | "that's the skill. knowing what to ask for." | Hasan, dry delivery, slow punch-in | — |
| B8 | end | 2s | *(silence)* | "BLOCK 30 · Vibe Engineering Blocks" + follow prompt | impact-deep-soft |

Note: B6 deliberately says p95 on screen and aloud even though B5 taught only p50/p99 — the
prompt is the screenshot-able real thing.

## Hook variants (B1) — complete alternates, not rewordings

1. **(default)** "one number decides if your app feels fast." → B2 opens "and it's not the average."
2. **Scenario:** "someone just told you your app is slow. you open it... loads in a blink." →
   B2 opens "so you blame their wifi. don't." (costs ~2s more cam)
3. **Direct callout:** "your app is slow for someone right now. your dashboard says it's fine."

## Production notes

- VO: Hasan-Pro `BTq6sz7H4zXMYN9OUp1X`, `eleven_multilingual_v2`, recipe #18 (SSML breaks,
  style 0.3, speed 0.95, stability 0.55, similarity 0.8). One mp3 per beat. Audition gate
  before any video generation.
- Cam: OmniHuman v1.5 (`fal-ai/bytedance/omnihuman/v1.5`) via `tools/gen_avatar.mjs`, ref
  `media/projects/short-ai-test/ref-vertical.png`. Three bursts, generated separately.
- B-roll: faceless-first (from behind / over-shoulder, olive tee, bright-room desk, Claude
  Code visible). Nano Banana Pro stills (Gemini key) → i2v on fal. ALSO generate one
  face-visible variant of the B2 scene for Hasan's A/B verdict.
- Assets → `media/projects/short-blocks-30/`; comp → `remotion/src/shots/short-blocks-30/`.
