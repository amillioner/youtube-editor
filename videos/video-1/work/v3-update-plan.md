# video-1 — v3 revision pass (round-2 feedback) — EXECUTION LOG (2026-08-07)

Source: Hasan's round-2 notes on the v2 `preview-full.mp4` (933.066s, 76 shots). Items V1-V5.
Baseline being revised: the v2 state (see `v2-update-plan.md`, its execution log is the prior art
for every technique reused here).

**Result: `output/preview-full.mp4`, 931.900s, 77 shots.** All five items landed. Master is now
**932.1312s** (55872 frames @59.94 in 4K, 27964 @30 in the comp source, video and audio clocks
equal within one AAC frame).

## The V2 splice — second master re-cut, measured

**Δ2 = 1.167833s (70 frames @60000/1001). Removed master 3.787117 → 4.954950** (the first
"Look at this.", 3 words). Every v2 timecode after 4.955 moved by −Δ2. Preview end:
933.0648 → **931.896967**.

Same pipeline as R7, same proofs:

- `cuts.json` stays the source of truth: clip 0258's keep `{10.85, 11.56, "Look at this."}` moved
  into its `cuts` as `cat:"user_cut"`. Backups: `cuts.v2.json`, `edited-transcript.v2.json`,
  `master-natural-h264.v2.mp4` (timeline.v2.json already matched the live file byte-for-byte).
- **Pure-deletion proof before touching anything**: old and new job lists built through
  `cutlib.plan_clip` differ by exactly one segment at job index **2** (469 → 468); every surviving
  segment's `(source, start, end)` byte-identical. Δ2 read off the cached segment's real frame
  count, not estimated. Neither neighbour's tail/head moves (the preceding atom's tail was already
  below its clamp; the next atom is 10s away).
- **Cache renumber → 0 GPU encodes.** `natural-final/seg_002.mp4` parked as
  `work/render/v3-removed-seg_002.mp4` (the r7-removed convention), 003..468 shifted down,
  regenerable derivatives (.ts/.wav/lists/concats) cleared. `render_cuts.py --style natural
  --mode final` resumed: "468 segments already encoded, 0 to go".
- **`natural-preview` (470 segs) and `tight-preview` (488 segs) were DELETED**: both predated R7,
  so any future `--mode preview` resume would have silently produced garbage against the renumbered
  reality. Re-rendering a preview cache from scratch is cheap; a wrong one is not.
- Comp source re-derived: `-r 60000/1001` before `-i`, `scale=1920:1080,fps=30`, `-c:a copy`.
  **NVENC refused all session ("No capable devices found") — encoded with libx264 crf 18.** If a
  future pass needs NVENC for this, try again after a reboot; the file is equivalent either way.
- **Transcript DERIVED, not re-transcribed** (exact arithmetic on the v2 spine): dropped exactly
  `Look at this.`, 2323 → 2320 words, monotonic, no word straddled either bound.
- **Seam ASR** (targeted, first 12s of the rendered master): reads *"…built this week. Let's say
  I want to build…"*, seam gap 0.209s, no ghost speech, and exactly ONE look cue remains
  ("Look at this example." at 10.727, within ASR jitter of the derived 10.655).
- All 75 surviving shots shifted by −Δ2 in `timeline.json`. **B1ColdOpen straddled the splice and
  was deleted** — the variant-B pair (`B1ColdOpen.tsx` + `_shared/ColdOpenScene.tsx`) is parked in
  `work/retired/` (the shots dir is not yet committed, so deleting would have been unrecoverable).
- 73 shot headers retimed by script (comment lines only; `Master span` floats + the `(t - X)`
  formula constants, value-matched against timeline.v2.json with ±0.02 tolerance, never blind
  substring). One clock-note line inserted per file. Verified: `tsc` clean, no retimed number
  outside a comment. B1ShockClip2 and B14ScaryFace were hand-rewritten instead.

## fal.ai — recharged, verified properly, all three generations landed (~$2.30)

Per last session's lesson, verification = a REAL job polled to a terminal state, not a queue 200:
the V4 kling job itself was the probe, and it reached `COMPLETED` + downloaded. One caveat for the
future: **the veo submit 403'd ("Exhausted balance") immediately after the kling charge, then
succeeded verbatim on retry ~2 minutes later** — fal's balance check appears to lag a fresh charge.
A single 403 right after a completed job is not proof the account is dry; retry once before
declaring blockage.

## Status per item

| | Status |
|---|---|
| V1 | **DONE.** `B1ColdOpenReal` (3.931067 → 10.864367). Hasan chose TSX clones, @hassancs91, hasan@learnwithhasan.com (asked in-session). See below. |
| V2 | **DONE + verified** (above). |
| V3 (R14+R13) | **DONE.** veo re-roll passed all three gates; R13's 14.6s span APPLIED (out 859.196967). See below. |
| V4 (R3) | **DONE.** New kling clip, jumper clamps on his own ears; span 82.982167 → 84.382167 (1.40s). |
| V5 (R12) | **DONE.** `B14ScaryFace` activated, span 800.896967 → 802.196967. |

## V1 — the realistic cold open (variant-C structure)

`B1ColdOpenReal` covers exactly *"Let's say I want to build an AI agent that can reply to my X
posts or maybe my emails."* — he stays on camera through "built this week" (the removed "Look at
this." is what made that possible) and gets his face back for "Look at this example." before
B1ReplyCompare at 12.032167.

- **TSX clones over screenshots, by decision**: the post the whole video replies to (Startup
  Notes, "Self hosting sounds cheap until it breaks at 3am…") is fabricated, so a real screenshot
  of his feed could never contain it. The clone plants the SAME post (copy + metrics identical to
  B1ReplyCompare's card) in his home feed — the cold open plants it, the compare beat pays it off.
- Choreography: X home (his chrome: real avatar from `l3-photo.jpg`, Hasan Aboul Hasan /
  @hassancs91) → ken-burns INTO the post (f56-84) → click → post detail (hard cut, URL path
  changes) → click the reply field → reply box opens with a blinking caret (crossfade, same URL)
  landing on "my X posts" → hard cut to Gmail (per-page favicon + tab title flip;
  hasan@learnwithhasan.com) → click the unread podcast mail → opened mail (hard cut) → click
  Reply → inline compose opens with caret on "emails.", holds while he pivots.
- Real third-party hex throughout (X true black, Gmail palette), NOT the brand indigo.
- `appearAt={-30}`: the hard cut must land on a browser that is already up — the default entrance
  read as a blank first frame (caught on the f0 still).
- **Two lib promotions in `lib/screencast.tsx`** (backward compatible): `ScreencastPage.node`
  (DOM pages — TSX clones instead of screenshots, all drift/zoom/cursor machinery unchanged) and
  per-page `favicon` (multi-site walkthroughs).
- **B1ReplyCompare's pair contract with the retired B1ColdOpen is dissolved**: its post entrance
  was restored (`postOp`/`postY` animate from `POST_IN` again) since it now cuts in from a Gmail
  screen, not from a handoff. Re-rendered.

## V3 — the L5 humanoid re-roll (R14) + the hold (R13)

veo 3.1 i2v 1080p from the committed `l5-ref-845.165.jpg` (content at that master position is
untouched by the splice, so no re-extract was needed). Raw clip: `l5-humanoid-v2.mp4` (8.00s @24).

All three gates from the shot header, verified on stills:
1. **Identity survives**: beard, jaw width, heavy brow and nose all carry through the morph —
   it reads as HIM. Two deviations Hasan should sanity-check on the preview: the android is
   **bald** and the eyes go **glowing blue** (prompt asked for his hairline and brown eyes; the
   model resolved "android surface" this way). It reads as "him as the iRobot version", which is
   the line — v1's different-person failure is gone.
2. **Morph timing**: the raw clip's flip sat at source 2.79-2.87s → slot f84-86, ONE frame late
   against "same voice" f85. Fixed with **0.1s of head trim** (there IS slack, despite the 8s=8s
   arithmetic, because the tail is frozen by design): morph now lands at slot **f80-81 = 2.70s**,
   in the pause, four frames before the word. Tail clone-padded (`tpad`) back to exactly 240
   frames so `F_FREEZE=239` and the shot code needed zero changes.
3. **Freeze frame**: f239 is camera-facing, eyes open, calm, straight down the lens — held 6.6s
   it reads as the android looking at you, not a powered-down mannequin.

R13 applied: `B14L5Humanoid` span → 844.596967 → 859.196967 (14.6s). `B14TagHold` untouched
(852.596967 → 862.196967) — the cutaway×overlay overlap is BY DESIGN (bake picks the cutaway per
segment; TagHold's cues are pinned to master offset; the shot draws its own SIMULATED tag).

## V4 — the second shock gag is a different failure now

kling i2v from `shock2-ref-84.15.jpg`: **car jumper cable clamps clipped onto his own ears**, arcs
across the head, hair standing, smoke — same electrocution punchline (the line puns on "shock"),
visibly dumber method. Slot = source 3.40-4.80s (peak only, 42f): it snaps in already zapping —
anticipation was clip 1's job, this is the "ALSO" callback. Span grew 0.5s → 1.40s so the gag
covers the line that labels it. `shock-clip-v1.mp4` untouched (B1ShockClip1 + B6ShockClip3).
One defect caught by reading stills: the first render still pointed at the OLD slot file — the
header was updated but not the `src`. Fixed, re-rendered, re-verified.

## V5 — the scary-humour face

kling i2v from `scary-ref-802.065.jpg`: comic mock-scared face, claw hands, clearly a joke. Slot =
source 1.55-2.85s → 39f: claws still rising at f0, peak ~f17 on "scary.", last ~0.3s holds the
peak (the silent hold is the joke). `B14ScaryFace` activated (compositionConfig added), span
butted against B14TodayItsText per the shot header's reasoning. No tag/rail/chips — punctuation,
not a rung; it does not pre-empt the SIMULATED framing.

## Carried over / open

- The audio graft at the MIX step: the word "side" pickup (`work/pickups/side-0264-492.20.wav`) —
  its master timecode moves by **−Δ2 again** (it was already −Δ1 from R7).
- Outro badge "Star the repo" vs transcript "start a project on GitHub" — still one string in
  `B15CloseOutro.tsx` if the audio disagrees on a listen.
- Contabo plan names/prices and the Coolify mark are still reconstructions.
- fal balance after this session: unknown but low (three jobs cleared, one 403 was balance-lag).
  Any future re-roll (e.g. if Hasan rejects the bald/blue-eyed android) needs a top-up check via
  the poll-to-terminal method.
- NVENC refused sessions all day ("No capable devices found") — segment cache still resumes
  (0 encodes), but the comp-source derive fell back to libx264. Worth a reboot before the next
  4K render that actually needs GPU encodes.
