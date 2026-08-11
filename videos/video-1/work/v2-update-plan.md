# video-1 — v2 update plan (round-1 feedback)

Source: Hasan's round-1 notes on `videos/video-1/output/preview-full.mp4` (934.90s, 71 shots).
All timecodes below are **v1 master seconds**, verified against `work/edited-transcript.json`.

**Baseline being revised:** 71 shots, 74.4% visuals / 25.6% talking head, baked 2026-08-07.
Backup of the v1 timeline: `work/timeline.v1.json` (make this before touching anything).

---

## The one structural change, and why it reorders the work

**R7 removes audio from the master.** Everything after the splice shifts earlier by Δ ≈ 1.7-1.9s.
That moves **43 of the 71 shots** and every word time after 352s in `edited-transcript.json`.

So the work splits cleanly at the splice:

| | Items | Affected by Δ? |
|---|---|---|
| Before the cut (0 → 352s) | R1 R2 R3 R4 R5 R6 | no |
| The cut itself | **R7** | — |
| After the cut (352 → 935s) | R8 R9 R10 R11 R12 R13 R14 | **yes, subtract Δ** |

**Do R7 FIRST.** Then the post-cut items are authored once against final timings instead of being
re-derived. The feedback timecodes for R8-R14 are v1 numbers, so locate them at `t − Δ` afterwards.
The alternative (cut last) means re-timing 43 shots and re-verifying every one, which is strictly
more work and more risk.

---

## Prerequisites, both blocking

1. **fal.ai is out of balance.** `403 User is locked. Reason: Exhausted balance.` Account-wide,
   confirmed against the cheapest endpoint. **R3, R12, R13, R14 cannot start** until it is topped up.
   There is no balance endpoint on a locked key, so the first call is the only signal.
2. **R1 needs a conversation, not a build.** Hasan wrote "we should discuss this part." Do not
   unilaterally design it.

---

## The items

### R1 · Cold open has no visual, and two unpaid "look" cues — DISCUSS FIRST
**0:00 → 0:13.2.** Currently pure talking head; the first cutaway is `B1ReplyCompare` at 13.20.

Narration:
- 0.45 "I'm super excited to show you what I built this week."
- **3.95 "Look at this."** ← nothing on screen to look at
- 5.08 "Let's say I want to build an AI agent that can reply to my X posts or maybe my emails."
- **11.82 "Look at this example."** ← still nothing until 13.20

Two problems: the hook is visually dead for 13 seconds, and he says "look at this" twice with nothing
under either. Options to put to him (his call, not yours):
- (a) Bring `B1ReplyCompare`'s post card in at ~4.0 so the first "Look at this" pays off, and let the
  second reveal the replies. Costs nothing, no re-cut.
- (b) Build a separate cold-open visual for 4-11 (the agent-replying-to-X idea) and keep
  `B1ReplyCompare` where it is.
- (c) Cut one of the two "look" lines. This is a second audio splice and a second Δ. Only worth it
  if he actively dislikes the repetition.

### R2 · 0:57 the second reply renders as a skeleton
**`B1BrainReveal`, 55.90-62.30.** At 57.20 the "02" card is grey placeholder bars. He wants the **real
post text** back, scaled down to fit the animation. The full copy already exists in
`B1ReplyCompare.tsx` — reuse it, do not retype it. Cue: "the second one" 56.02, "connected" 59.77.

### R3 · 1:25 the second shock clip must be a different take — NEEDS fal
**`B1ShockClip2`, 84.15-84.65.** Today it is a 0.5s recut of the same generated clip as
`B1ShockClip1`. He says **"No, not this way ALSO"** (84.29), which only reads if the second gag is a
*different* failure. He wants a humorous shocked reaction, newly generated.
Same technique as before: pull the reference frame out of the master at the cut point so wardrobe,
room and light continue the take. Note `B6ShockClip3` (403.35) is a third use of the *original* clip
and stays as-is.

### R4 · 2:13-3:17 too long on camera
The **39.7s unbroken talking-head run at 159.1-198.8** is the longest in the video (plus 133.0-147.2
before it). Rich narration, nothing built:
- 161.30 "It's my clone, and some people call it second brain."
- 165.62 "maybe you used one, but what you will see today is something really different"
- **171.69 "So think about it like my mirror outside."** ← the product name, visually
- 174.26 "it answers like me, which is useful most of the days and sometimes becomes strange"
- **187.09 "sometimes I disagree with its answers, which is myself."** 191.74 "That's really weird."
- 193.02 "every human being working with AI should have this brain configured"
Do not carpet all 39.7s. Two or three shots with real gaps between them.

### R5 · 5:03 don't cut away to explain the skills
**`B5TwoSkills`, 304.60-310.00.** Today it is a standalone light diagram with no VS Code. He wants the
VS Code frame to stay, with the explanation in the right pane. `B5OpenInVSCode` (297.80-304.60)
already establishes that frame, so this becomes a continuation, not a new scene.
Cues: mind-feeder 305.86, mind-reader 308.20, "It's that simple." 308.77.

### R6 · 5:19-5:41 stay in VS Code through the proposal
Today: `B5bFeedPaste` 310.00-320.10 → **talking head 320.10-328.40** → `B5bProposal` 328.40-342.40.
He wants no cut back to camera at 320.10. Keep VS Code + Claude Code running continuously from 310
through ~341, with the proposal appearing **inside a real-looking Claude session** rather than as a
composed artifact card. At ~341-342 the full-screen rule card (`B5bProposeApprove`) takes over as-is.
Net effect: one continuous ~31s screen sequence. Watch pacing so it does not go static.

### R7 · 5:51 cut "if you fill it with junk" — THE SPLICE
Exact word times: `if` **352.23** → `junk.` ends **353.62**. Preceding word `use` ends 351.93; next
sentence `Let's` starts 354.23.
Suggested splice window **352.05 → 353.90** (Δ ≈ 1.85s), which also takes the trailing pause.
Resulting line: *"Because in simple words, a brain you don't trust is a brain you will not use."*
Then straight into *"Let's move into reading."* Grammatical and clean.

Do it through the pipeline, not by hand: add the cut to `work/analysis/cuts.json` and re-render, so
`cuts.json` stays the reproducible source of truth. Then regenerate `edited-transcript.json` and
apply `−Δ` to every shot span after the splice.

### R8 · 8:35 the approved-note pill collides with the lock
**`B7ReadOnlyWrite.tsx`** — the travelling pill is at `:144-153`, the lock at `:157-163`. The pill
slides under the lock circle and its right edge is swallowed; it also overruns the GitHub card's left
border. Stop the pill short of the lock with a visible gap, and keep the lock reading as a barrier the
note cannot pass. The beat is "it gets blocked", so the collision should look deliberate, not like a
z-index accident. Lock must still be shut at the end.

### R9 · 9:12 the ring around the "online" pill is mis-fitted
**`B7Steps56.tsx:174`** — `<Ring>` at `left:372, top:122, width:224, height:72`. It does not sit on
the pill. He does not want it re-fitted, he wants it **replaced**: make the online pill itself glow /
pulse on "online." (552.13). Delete the Ring rather than nudging its geometry.

### R10 · 10:50 queue column highlights are clipped at the bottom
**`B9DashboardTour.tsx:553-554`** — two `Hilite` boxes, `top:62 height:452`. Their bottom stroke falls
outside the visible page area, so they read as open-ended rectangles. Either shorten them to close
inside the viewport or reduce the queue to fewer rows so the column ends on screen.

### R11 · 10:57 consumers column highlight, same defect
**`B9DashboardTour.tsx:619`** — `Hilite` at `top:62 height:444`. Same fix as R10.

### R12 · 13:24 a scary-humour face on "scary" — NEEDS fal
Narration 801.58 "…what you'll see now is really shocking and **somehow scary**" (ends 805.27).
Currently talking head 797.80-805.20. He wants a generated humorous-scary face here. Keep it short;
this is a beat, not a level of the ladder. It sits *before* `B14TodayItsText` (805.20) so it must not
pre-empt the SIMULATED ladder framing.

### R13 · 14:10-14:22 hold the humanoid longer
**`B14L5Humanoid` is 847.60-855.60 (8.0s).** He wants it held to ~862s, i.e. **~14.4s**, through
"That's me, the iRobot version" (856.14) and "Looks scary, huh?" (861.20).
veo caps at 8s, so this needs either a second generated clip continuing the shot, or a designed hold
(slow push / freeze-and-drift) on the existing one. **A naive loop will read as a loop — do not.**
This overlaps `B14TagHold` (overlay, 855.60-865.20), which currently sits over talking head; it would
become an overlay over the humanoid instead. The SIMULATED tag must stay on every frame either way.

### R14 · L5 identity re-roll (already owed) — NEEDS fal
The robot loses the beard, narrows the jaw and lightens the skin, so it reads as a **different person**
under "Same voice, same takes, same opinions, same beliefs" (850.44-854.71) and "That's me" (856.14).
The drift starts *during* the morph, so the prompt must constrain face geometry through the
transformation, not just the end state.
Full drop-in recipe is in the header of `remotion/src/shots/video-1/B14L5Humanoid.tsx`; reference
frame is at `media/projects/video-1/l5-ref-847.00.jpg`. Overwrite `l5-humanoid-slot.mp4` and
re-render. **Keep the on-camera morph at ~2.7s into the clip** — that lands in the pause after
"eventually this." and it is the best thing in the segment. Do R13 and R14 together; they are the same
clip.

---

## Suggested sequencing

0. Discuss **R1**. Confirm the fal top-up. Back up `timeline.json` → `timeline.v1.json`.
1. **R7** the splice, regenerate the transcript, apply `−Δ` to all 43 downstream spans, validate.
2. Parallel: **A** = R2 R3 (cold open) · **B** = R4 (the long gap) · **C** = R5 R6 (VS Code continuity)
   · **D** = R8 R9 R10 R11 (four TSX defects, no new spans) · **E** = R12 R13 R14 (the ladder, fal).
3. Merge spans, validate, re-bake, read composited frames at every changed beat.

Group D touches no timeline spans at all, so it can land independently of everything else.

## Carried over from round 1, still open
- Outro badge reads "Star the repo"; transcript hears "start a project on GitHub", `script.md:448`
  says "star". One string in `B15CloseOutro.tsx` if the audio disagrees.
- Contabo plan names/prices and the Coolify mark are reconstructions, not scraped.
- `tools/gen_video.py`: `--model veo` sends `duration:"8"` but veo3.1 needs `'4s'|'6s'|'8s'`;
  `--duration 8s` then crashes at `:134` on `float()`; no `resolution` param so veo output is 720p.
- An audio graft is owed at the MIX step: the word "side" at 14:20, clean take at
  `work/pickups/side-0264-492.20.wav`. **R7 changes its timecode by −Δ.**

---

# v2 EXECUTION LOG (2026-08-07)

**Result: `output/preview-full.mp4`, 933.066s, 27992 frames, 76 shots, 78.9% visuals**
(v1 was 934.90s / 71 shots / 74.4%). Timeline validates: no overlaps, nothing past `preview.end_s`,
every rendered file at least as long as its span. Composited frames read at every changed beat.

The two standing warnings are expected and intentional: `B14L5Humanoid`'s composition is 14.6s while
its span is 8.0s, because R13 is built but deliberately not applied (see below). bake takes the head.

## The measured splice — every v1 timecode moves by this

**Δ = 1.835167s.** R7 removed master **352.085067 → 353.920233**.
Master: 935.1342s → **933.299033s**. Preview end: 934.90 → **933.0648**.

`cuts.json` is still the source of truth: the keep `{s:154.73, e:156.16, "if you fill it with junk"}`
moved out of clip 0261's `keeps` and into its `cuts` as `cat:"user_cut"`. Backups:
`work/analysis/cuts.v1.json`, `work/edited-transcript.v1.json`,
`output/master-natural-h264.v1.mp4`, `work/timeline.v1.json`.

**Why the re-render was cheap.** Before touching anything, the new job list was diffed against the
old one through `cutlib.plan_clip`: they differ by **exactly one deletion** (job index 174) and every
surviving segment's `(source, start, end)` is byte-identical. Neither neighbour's tail or head moves,
because the tail clamp never reaches the removed span and no cut sits in the next atom's lead-in. So
the 469 cached 4K60 segment encodes were **renumbered** rather than re-encoded, and `render_cuts.py`
resumed with 0 GPU encodes. Δ was then read off the deleted segment's real frame count
(110 frames @ 60000/1001), not estimated.

**The transcript was DERIVED, not re-transcribed.** The new master is the old one minus one
contiguous span, so the new spine is exact arithmetic: drop the 6 words inside the span, shift later
words by −Δ. A fresh ASR pass would have re-worded things and invalidated the verified cue times in
all 71 shots plus the `keyterms.txt` fixes. Verified: exactly `if you fill it with junk.` dropped,
2323 of 2329 words kept, monotonic, no word straddled the seam.

**Join QA.** 344-362s of the *rendered* master was re-transcribed: it reads
*"...a brain you will not use. Let's move into reading."* No inserted words, no ghost speech, seam gap
0.45s (a normal sentence boundary). New comp source `master-natural-h264.mp4` = 27999 frames @30
(= 28054 − 55), audio 933.299s.

**Shot header comments:** 48 post-splice shots had v1 spans in their headers. Each header's
`Master span X -> Y` (and its `(t - X)` formula constant) was rewritten to current master time, with
an explicit note that the *cue seconds* further down are still v1 and that **local frame numbers are
unchanged** (shot start and cues moved by the same Δ, so `cue − shot_in` is invariant). Verified
comment-only: no retimed number appears outside a comment, `tsc` clean.

## fal.ai is STILL LOCKED — correcting a bad call made this session

The first probe submitted to the queue and got `200 IN_QUEUE`, and that was read as "topped up".
**That was wrong**: the queue accepts a submission without checking balance; the worker rejects it.
Fetching that request's own response returns `403 User is locked. Reason: Exhausted balance`, and a
fresh submit with a real image payload returns the same 403. **Any future check must poll a submitted
request to a terminal state, not just look at the submit status code.** fal spend this session: $0.00.

## Status per item

| | Status |
|---|---|
| R1 | 3 variants BUILT as 20s auditions, `output/r1-coldopen-{A,B,C}.mp4`. Awaiting Hasan's pick. Nothing applied to the real timeline. |
| R2 | DONE. Real reply-02 copy extracted programmatically from `B1ReplyCompare.tsx`; card grew 320x200 → 700x344. Span unchanged. |
| R3 | **BLOCKED** (fal). Reference frame committed at `media/projects/video-1/shock2-ref-84.15.jpg`, recipe in the shot header. Shot still renders the old clip so the bake is not broken. Proposed span once regenerated: 84.15 → **85.55** (not 84.65). |
| R4 | DONE. 3 shots, camera still live for 17.1s of the 39.7s in four gaps; longest unbroken run 39.7s → 5.8s. |
| R5 R6 | DONE. One continuous 48.2s screen sequence, 297.80 -> 346.00, no gaps. See below. |
| R7 | DONE + verified (above). |
| R8-R11 | DONE, no span changes, all four verified by reading stills. |
| R12 R14 | **BLOCKED** (fal). Both reference frames are extracted and committed and both recipes are now literal copy-pasteable `gen_video.py` invocations, so each is one command after a top-up. `B14ScaryFace.tsx` exists but is deliberately **unregistered** (no `compositionConfig`), so it cannot reach a bake half-built. |
| R13 | BUILT (14.6s composition, verified) but **DEFERRED — span left at 8.0s**. See below. |

## R1 — Hasan picked variant B (of three auditioned)

Three 20s auditions were baked rather than designing it unilaterally
(`output/r1-coldopen-{A,B,C}.mp4`, kept as the record of the decision). Variant A exposed its own
cost on screen: the post card is up at 3.99 and then nothing changes until 16.63, ~12.6s on one
static card. Variant C needed a second master splice. **B won.**

Landed as `B1ColdOpen` (3.9333 -> 13.2000), built on the new `_shared/ColdOpenScene.tsx`. The three
losing variant shots and their renders were deleted so they cannot pollute the registry.

**`B1ColdOpen` and `B1ReplyCompare` are now a PAIR.** The cold open leaves the post card in
B1ReplyCompare's exact opening geometry, and B1ReplyCompare's post entrance was removed
(`postOp = 1`) so the handoff does not flash. Verified pixel-identical across the join, both in
isolation and in the composite. Do not reorder them or use one without the other.

One defect was caught by reading the contact sheet and fixed: the first cut ran the agent branches
UPWARD and the chips landed on top of the post card's metrics row. They now hang below the node.

## R5 + R6 — one continuous 48.2s screen sequence

`B5TwoSkills`, `B5bFeedPaste` and `B5bProposal` were rewritten and one new shot `B5cFeedRun`
(320.10 -> 328.40) fills the stretch that used to cut back to camera. The run now tiles
**297.80 -> 346.00 with no gaps**. The proposal plays inside a real-looking Claude Code session
(coral CLI treatment, the real numbered permission prompt) instead of a composed artifact card.

All four joins verified **pixel-identical by PSNR on lossless PNG stills** (`inf` at every join), not
by eyeballing h264 frames. Two real defects were found that way and fixed: flow dots that popped at
310.00 because they travel on `frame - cue`, and a Chrome subpixel-to-grayscale antialiasing flip at
two joins, fixed by making the DOM structurally identical across each boundary (mount/unmount rather
than fading opacity).

Shared state that must survive a join lives in `_shared/B5cSession.tsx` (not a shot; gen-registry
skips it).

## R13 is built but deliberately not applied

The 14.6s `B14L5Humanoid` exists and is verified: clip plays 1:1 to f239, a slow push-in starts at
f234, then `<Freeze frame={239}>` carries it to f437. The freeze is content-agnostic (it references
the slot's last frame, not anything in it), so the R14 re-roll drops into the same slot with zero
changes. SIMULATED tag verified present and undipped on f0/f239/f240/f437.

It is **not** applied, for two independent reasons:
1. It puts the wrong-identity android on screen 6.6s longer, precisely under "That's me, the iRobot
   version" — the callback whose whole job is to assert it is him. R14 exists to fix that.
2. **Independently of R14:** slot frame 239 has the android with eyes closed, head down, looking
   away. Held 6.6s under "Looks scary, huh?" that reads as a powered-down mannequin. The re-roll
   prompt now carries an added requirement (settle facing camera, eyes open in the final second)
   plus matching negatives, so the freeze frame is usable next time.

Deferring costs nothing: bake takes the first 240 frames, no cue moves, and the only difference in
those frames is a sub-1.3px push over the last 6. To ship it later, change one span to 860.3648.

**Correction to the brief I gave agent E:** I told it `B14TagHold` would need shortening because a
cutaway beats an overlay in `bake.py`. The first half is right (a cutaway does suppress an overlay,
which is why the extended humanoid must draw its own SimTag) but the conclusion was wrong.
`bake.py:120` seeks an overlay by MASTER offset (`off = a - ov["in"]`), so its cues stay pinned to
absolute master time however much of its head a cutaway covers. **Shortening `B14TagHold` would have
broken it.** Its span stays 853.7648 -> 863.3648.

## tools/gen_video.py — the three carried-over bugs are fixed
`duration_field()` emits `'8s'` for veo and bare `'8'` for kling/seedance, accepting either spelling
on the CLI; `duration_seconds()` strips a trailing `s` before `float()` (the cost-estimate crash);
`--resolution` is optional and only sent when given (veo defaults to 720p without it). Backward
compatible: `--model kling --duration 5` produces a byte-identical payload.
