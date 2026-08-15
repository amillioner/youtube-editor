# Shorts Factory — bulk YouTube Shorts from the X posts

**Status: FORMAT LOCKED (2026-08-13).** The Block 30 pilot ran end to end through all four gates
and Hasan passed the final cut (after one b-roll re-work round — see "Production decisions").
Scaling in waves of ~5 may begin. Pilot receipts: `videos/short-blocks-30/`
(cost log in `work/cost-log.md`), experiment write-up in `docs/ai-clone-guide.md` E05.

## Mission

Turn the finished X posts in `C:\Users\Malak\Documents\GitHub\my-x-growth-agent` into 30–40s
vertical YouTube Shorts, bulk, with Hasan appearing only as short AI-generated bursts (the
proven ShortAiTest beat technique). Source inventory: **22 Vibe Engineering Blocks posts**
(`blocks/`), **20 Building ToolerBox in Public posts** (`toolerbox/`). The 2 `youtube/` posts have
no diagrams and are weak Short sources — excluded. Real count: **42**.

Each post folder has `post.txt` + a square (1080×1080) diagram TSX + rendered mp4.

## The distillation method (the hard problem)

A post is ~1000 words; a 35s Short holds ~90–110 words. The Short is a **re-performance of the
post's spine at speech tempo**, not a summary. The spine is near-mechanical because the X
pipeline already did the editorial work ("one post, one block", drawn hook angles, named
concepts):

1. **IDEA — fixed by the post.** One post, one block. Never a choice.
2. **HOOK — the post's angle line**, adapted for the ear. (It was A/B-engineered for a
   scroll-stop already.)
3. **EVIDENCE — pick ONE carrier.** Each post proves its idea 3–5 ways (numbers, proof beats,
   observations). The Short keeps exactly one — the most visual, most "wait, what?" when spoken.
   This is the only genuinely editorial per-post decision.
4. **PAYOFF — the name.** "this has a name: X" always survives; it's the bookmarkable moment.
5. **CLOSE — the ask.** The post's literal one-line "ask Claude for it" prompt.

What dies every time: `→` enumeration bullets, proof-beat stories (Microsoft/Wiz-length),
secondary numbers, nuance paragraphs. One sanctioned exception per post: if the proof beat is
STRONGER than the angle line as a hook, it may take the hook slot — explicit call at the script
gate, never a default.

## Per-Short anatomy (~35–40s, 1080×1920 @30fps)

| Beat | Type | Dur | Carries |
|---|---|---|---|
| B1 | CAM | 2–2.5s | the hook (angle line) |
| B2 | b-roll | ~7s | the scene: Hasan-as-character building with Claude Code |
| B3 | TSX | ~10s | the EVIDENCE turn, in the series' diagram language |
| B4 | CAM | ~2s | the pivot to the name |
| B5 | TSX | ~6s | the NAME card + concept in one visual move |
| B6 | TSX | ~5.5s | the ASK: the literal prompt, typed on screen |
| B7 | CAM | 2.5s | the close ("that's the skill…") |
| B8 | end card | 2s | series stamp + follow |

Rules: cam ≈ 20% of runtime, 3 bursts, none over ~2.5s, never a long hold (viewers get no time
to detect the AI face). Each cam burst generated separately = independently re-rollable. VO can
bridge across cuts (a sentence starting on cam may finish over the next beat's visuals). SFX
per `brand.md` §10 — sparse, one layered hero moment per Short (usually the NAME stamp).

## Production decisions

- **Voice:** ElevenLabs Hasan-Pro (`BTq6sz7H4zXMYN9OUp1X`) on `eleven_multilingual_v2`,
  **recipe #18**: SSML breaks + style 0.3 + speed 0.95 + stability 0.55 + similarity 0.8.
  Per-beat mp3s. Never v3 (falls back to raw-sample reconstruction — drifts off-identity).
- **Cam bursts:** OmniHuman v1.5 on fal (`fal-ai/bytedance/omnihuman/v1.5`, $0.16/s) with the
  9:16 ref `media/projects/short-ai-test/ref-vertical.png`, driven by `tools/gen_avatar.mjs`.
  Upgrade path (researched, untested): lipsync on real footage (HeyGen `/v3/lipsyncs`, sync-3)
  once Hasan records a 15–25s vertical clip.
- **B-roll — LOCKED by the pilot (and it reversed the plan): face-forward, in the real-room
  workspace kit.** Faceless-first is DEAD — Hasan killed it at the v1 final watch ("show me
  more, more personal, connects with me"). The locked recipe (Gate 4, 2026-08-13):
  1. Identity anchor = a REAL photo of Hasan from `media/library/faces/` (a single synthetic
     selfie could not hold identity through scene generations — the v2 failure).
  2. Set = the canonical workspace kit `media/library/workspace/w3-establishing.png` (his real
     room: grey-blue wall, dracaena, AC unit, WHITE desk; see that folder's README for the
     full recipe). Generated workspaces drift over-styled unless prompted for ordinary.
  3. Stills via Gemini API (`tools/gen_thumbnail.py`), refs in order: real photo → w3 plate →
     best prior person-still. NOT via the agy skill — it fails on person-photo refs (person-free
     plates only, where it's free on the Ultra sub).
  4. **Hasan verdicts the STILLS before any video spend**, then Kling 2.5 turbo animates 5s
     clips ($0.35 each) with static-camera / subtle-motion / no-scene-change prompts. Kling
     held face + room with zero morphing in the pilot.
- **Brand:** each Short wears its **series** brand — Blocks = light navy+coral+Claude mark
  (`profile/visual-style.md` in the X repo); ToolerBox = dark emerald-on-zinc
  (`profile/series/toolerbox/visual.md`). The repo's indigo brand stays long-form only.
  (PENDING Hasan's confirmation.)
- **Square diagram reuse:** reuse the SOURCE, not the render. The rendered squares are 8s
  self-timed loops with X-post furniture (BLOCK pill, @handle footer) and don't sync to
  narration. But their computed cores (e.g. block-30's dot-rain distribution) lift into fresh
  vertical narration-timed beats. Pilot shows both options as frames for verdict.
- **VO script voice:** written per the X repo's `profile/voice.md` — contractions always, no
  em-dashes, simple vocabulary, uneven rhythm, dry anti-hype. Hasan's edits are law.

## Pipeline per Short, with human gates

1. **Distill** → beat sheet + VO lines → **GATE 1: Hasan locks the script** (batchable: waves
   of ~5 on one review page).
2. **VO** (recipe #18, per-beat) → **GATE 2: audition before any video spend.**
3. **Assets:** person stills (Gemini API, refs: real photo → w3 plate → cascade) →
   **GATE 3a: Hasan verdicts the STILLS** (no video spend before this) → b-roll i2v (Kling on
   fal) + cam bursts (OmniHuman) → **GATE 3b: identity verdict on clips** on a verdict page
   (`tools/make_verdict_page.mjs`, supports stills + clips) — Hasan judges, never Claude.
4. **TSX comp** in `remotion/src/shots/<short-id>/` (per-video assets in
   `media/projects/<short-id>/`), `npm run gen`, QA by reading rendered frames.
5. **SFX** plan + audit + mix.
6. **Final render + verify** → **GATE 4: Hasan watches** → upload private draft
   (`tools/yt_upload.py`).

## Cost model (verify prices at generation time)

Per Short: cam ~7s × $0.16 ≈ $1.15 · b-roll 2 Kling clips ≈ $0.70 · Nano Banana stills
~$0.13 each ×3 (Gemini key, not fal) · VO+SFX pennies. **Pilot-verified: ≈ $2.20/Short clean**
(Block 30 actual: fal $2.86 including two failed b-roll iterations); 42 Shorts ≈ $90–120 fal
+ re-roll buffer. fal topped up 2026-08-13 (was locked 2026-08-12).

## Scaling plan (after pilot locks the format)

Waves of ~5: batch script gate on one review page → generate → batch identity verdicts →
publish. After ~10 are live, read retention curves and let them bend the format before the
remaining ~30 render. Track per-Short costs against the model above.

## Pilot answers (Block 30, 2026-08-13)

- **B-roll faceless vs face-visible → FACE-FORWARD.** Hasan rejected faceless at the final
  watch; the locked recipe is in "Production decisions" above.
- **Runtime:** the 35–40s target became **~50s in practice** once recipe #18's tempo met the
  locked ~115 words. Hasan accepted ~50s for the pilot; retention curves on the first wave
  decide whether scripts get shorter or ~50s becomes the format number.
- **Square diagram reuse → fresh vertical rebuild**, confirmed by side-by-side verdict: lift
  the computed core, retime to narration, drop the X furniture.
- **Series brand per Short:** pilot shipped in the Blocks brand and passed; unchanged.
- **Close/CTA:** pure series CTA ("BLOCK 30 · Vibe Engineering Blocks · follow") shipped.
- **Cam bursts:** OmniHuman v1.5 off the synthetic selfie ref — all three passed Hasan's
  identity bar unchanged. (Consider testing the real photo as cam ref in wave 1 — untested.)
- **Actual pilot cost:** fal $2.86 total including the two failed b-roll iterations; a clean
  run prices ≈ **$2.20/Short** (cams ~$1.12 + b-roll ~$0.70 + stills ~$0.40).

## Open questions

- Lipsync-on-real-footage upgrade (needs Hasan to record the 15–25s vertical clip).
- ToolerBox anatomy delta (different furniture, different brand, no Claude mark) — design when
  the first ToolerBox Short is piloted.
- Real photo as the OmniHuman cam ref (vs the current synthetic selfie) — try in wave 1.

## Pilot

**Block 30 — latency percentiles.** Draft script: `videos/short-blocks-30/script/script.md`.
Chosen for the strongest spoken number-turn and the best diagram to test the reuse question.
