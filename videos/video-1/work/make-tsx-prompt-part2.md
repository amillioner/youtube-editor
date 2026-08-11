# video-1 — step 2, part 2: the rest of the video (05:10 → end)

Working in `d:\repos\claude-youtube-editor`. Project: `videos/video-1` — the BrainOutside launch video.

**Step 1 (the cut) is FINAL. Do not run `tools/render_cuts.py` again — see "Traps" below.**
The first 5 minutes of step 2 are DONE. Your job is everything after **310.0s**.

Read `CLAUDE.md`, then invoke the `/make-tsx` skill — it owns this step.

## What's ready

| Artifact | Path |
|---|---|
| **Comp source — use THIS** (1920×1080@30, v/a aligned) | `videos/video-1/output/master-natural-h264.mp4` |
| 4K60 10-bit HEVC master (delivery only, has PTS skew) | `videos/video-1/output/master-natural.mp4` |
| Word spine (ms, master timeline, 2329 words) | `videos/video-1/work/edited-transcript.json` |
| Script + beat plan | `videos/video-1/script/script.md` |
| Cut decisions + ~35 flags | `videos/video-1/work/analysis/{cuts.json,review.md}` |
| **Timeline (18 shots, 0–310s) — ADD to it, don't replace** | `videos/video-1/work/timeline.json` |
| Existing shots | `remotion/src/shots/video-1/` |
| Baked preview of part 1 | `videos/video-1/output/preview-step2.mp4` |

Master runtime **15:34.90** (934.90s). Confirm the comp source and `edited-transcript.json` exist before starting.

## The task

Build the Remotion TSX visual beats for **310.0s → 934.90s** into `remotion/src/shots/video-1/`.

Spawn **six agents in parallel**, one per chunk. Each owns a distinct filename prefix so they cannot
collide. **Every timecode below was verified against `edited-transcript.json`** — trust these, not the
parenthetical timings in `script.md` (those are the *planned* script and are off by minutes).

| # | Beat | Master window | Prefix | What it is |
|---|---|---|---|---|
| 1 | **B5b feed flow + B6 rehook** | 310.0 – 406.0 | `B5b*`,`B6*` | feeding → proposal → approve → one commit; "Why so strict?" 344.67; the reading half; then "that's the local version" 380.41 → **"Remember the shock? It starts here." 403.37** |
| 2 | **B7 the online brain** | 406.0 – 580.0 | `B7*` | the biggest beat (~3 min). VPS/Contabo 412–421, `install Coolify` 421.74, deploy, the 6-step wizard, GitHub fine-grained token 520.66. Heavy `/fake-screencast` + terminal |
| 3 | **B8 they compose + B9 dashboard** | 580.0 – 665.7 | `B8*`,`B9*` | ★ money shot 580.12; feed→commit→push 586.86; **webhook 592.39** → pull → reindex → live 600.43; "one source and 2 doors" 614.96. Then the 6-page tour: dashboard 623.39, browser 629.17, graph 635.42, queue 646.34, consumers 653.02, chat 658.95 |
| 4 | **B10 MCP + B11 content** | 665.7 – 733.6 | `B10*`,`B11*` | connect Claude once 673.41, "Claude can now read my brain" 680.70, `get-index` 685.62, `assemble-context` 690.52, "the real quotes, and the gaps" 698.60, callback to the cold open 702.05. Then daily use 709.12, "drafter, not a ghostwriter" 726.60 |
| 5 | **B12 writers + B13 the rule** | 733.6 – 797.8 | `B12*`,`B13*` | book/chapter 9 737.03–751.85, course 752.28, building with AI 756.13. Then ★ **"Attach your brain to simply everything" 771.97 · "Read always and feed always" 778.92 · "That's the loop" 787.90** |
| 6 | **B14 the ladder + B15 close** | 797.8 – 934.90 | `B14*`,`B15*` | 5 simulated levels (see "Generated media" below): voice 809.35, clone 816.72, photo+waves 830.68, lipsync 837.50, humanoid 847.61; disclaimer 862.63; then the close 883.74 → 934.90 |

## Hard rules

- Every shot exports `compositionConfig = { id, durationInSeconds, fps: 30, width: 1920, height: 1080 }`.
  **16:9 landscape.** `id` MUST equal the filename stem and be unique across all 56+ existing compositions.
  Add `transparent: true` ONLY for an alpha overlay (renders `.mov`); no flag = full-screen cutaway (`.mp4`).
- **Library-first.** Read `remotion/src/lib/{kit,browser,screencast,vscode}.tsx` and several of the 37 shots
  in `remotion/src/shots/example/` before authoring. Also read the **part-1 shots in
  `remotion/src/shots/video-1/`** — match their established look.
- Color and type come from `remotion/src/brand.ts` + `fonts.ts` only. Never hardcode a brand hex.
  (Replicating real third-party UI — GitHub, VS Code, Coolify chrome — with literal hex IS correct and
  is existing house practice; see `lib/browser.tsx` and `B5TemplateRepo.tsx`.)
- Frame-based animation only: `useCurrentFrame()` + `interpolate`. No `useState`/`useEffect`/`setTimeout`/
  `Math.random()`/`Date.now()`. Strictly monotonic interpolate ranges. `EASINGS.*`, never `Easing.out(...)`.
- Sync every reveal to real word times. `frame = round((cue_s − shot.master_in_s) × 30)`. **Do not eyeball.**
- No em-dashes in on-screen text.
- After adding/renaming shots: `cd remotion && npm run gen`.
- **QA is not optional:** render stills and actually READ them. `npm run still <Id>` → `remotion/out/<Id>.png`.
  Cheap trick that saves context: tile 8 frames into one contact sheet with `ffmpeg ... -filter_complex tile=4x2`
  and read that instead of 8 separate images.
- Per-video media → `media/projects/video-1/`, referenced as `staticFile('projects/video-1/x')`.

## ★ Reuse the two-heads diagram

`remotion/src/shots/video-1/_shared/TwoHeads.tsx` is a **plain exported component with props** (no
`compositionConfig`, no `useCurrentFrame()` inside — all timing via props). Its header has a full prop
table. **B8 must call back to it** — that is the whole point of the video's spine ("one repo, two heads").
Passing any cue prop `<= -90` renders that element already-finished at frame 0, which is how a callback
shot reuses the picture on a different clock. Also in `_shared/`: `OneRepoTwoHeads`, `LayerFrame`, `marks`.

## Generated media

`tools/gen_video.py` exists (fal.ai; `FAL_KEY` is in `.env`). `--list-models`. Image-to-video is billed per
second of output — kling ~$0.07/s, so a 5s attempt is ~$0.35 and iterating is cheap.

**Technique that worked:** pull the reference frame **out of the master at the cut point**
(`ffmpeg -ss <t> -i videos/video-1/output/master-natural-h264.mp4 -frames:v 1 ref.jpg`), so the generated
clip continues the real take — same wardrobe, room, light, framing. Then pre-trim with ffmpeg to the exact
slot length at 30fps and have a thin TSX shot play it from frame 0 via `OffthreadVideo` + `staticFile`
(avoids `startFrom`/fps-mismatch semantics). See `B1ShockClip1.tsx` for the pattern.

Two jobs:

1. **Shock clip, 3rd use — 403.37 ("Remember the shock? It starts here.").** The clip already exists:
   `media/projects/video-1/shock-clip-v1.mp4`. Zap onset is 1.80s in; peak 2.30–2.80s. Make a third trim.
   Script calls for "quick fun video again". Do NOT regenerate.
2. **B14 ladder — 5 levels, none of it exists.** Generic TTS voice, cloned voice, still avatar + audio
   waves, lipsynced face, humanoid. This is the largest generation job in the video and needs endpoints
   beyond i2v (TTS, voice clone, lipsync). **Scope this and report cost before generating.** The whole
   segment carries a persistent `SIMULATED · roadmap, not shipped` tag per script B14, and he says so out
   loud at 862.63 — honour that, it is an honesty commitment, not decoration.

## Things you need to know

- **All three ASR errors are already FIXED** in the current `edited-transcript.json` — it reads "every note
  filterable" (630.20), "my cost story" (638.09), "the real quotes" (698.60). On-screen text can follow the
  transcript directly. Ignore the stale warnings in `review.md` FLAG 51.
- **Two scripted beats were never recorded.** Verify before designing around them:
  - **B10 privacy/tier split** — absent. Narration runs 705.75 → 706.30 straight into B11. There is no
    "same question, different tier" audio, so there is nothing to sync a tier-split visual to.
  - **B8 reverse direction** — reduced to one throwaway line, "And this works too in the other direction"
    (603.79–605.93). The scripted walkthrough and the planned "5 seconds of me talking to Claude on my
    phone" insert do not exist. Do not build a full reverse-flow sequence against 2 seconds of audio.
- **B7 install time:** script flags "under 10 minutes" as an unverified design target. Check whether he
  quotes a number on camera; if he does not, do not put one on screen.
- **An audio graft is owed at the MIX step** (not yours): the word "side" at 14:20, clean take already at
  `videos/video-1/work/pickups/side-0264-492.20.wav`.
- `B1ShockSlate1.tsx` / `B1ShockSlate2.tsx` are retired placeholders, superseded by `B1ShockClip1/2`.
  Safe to delete once part 1 is signed off.

## Traps that cost the last session hours

1. **NEVER run `tools/render_cuts.py` on this project.** The master is final. A concurrent run overwrites
   `output/master-natural*.mp4` in place with no locking, and silently truncated a file that another job
   was reading. If you think the master is missing or broken, STOP and ask.
2. **Check for a running process before concluding a render is dead.** A directory of segment files with a
   few 0-byte entries is what an *in-progress* render looks like, not a crashed one.
3. **The GPU caps concurrent NVENC sessions.** Two encodes do not run at half speed, they both crawl.
   Never run a second GPU encode alongside one already going.
4. **Use `master-natural-h264.mp4` as the comp source.** `master-natural.mp4` is HEVC with an ~885ms PTS
   skew (`hevc_nvenc` stamps ~0.1% fast — documented at `tools/render_cuts.py:145-152`); `bake.py` seeks by
   time, so that skew misaligns cutaways progressively.
5. **Git Bash `/tmp` is not visible to the Windows venv Python.** Use the scratchpad path for anything
   handed between them. Also: a `C:` drive letter breaks ffmpeg's filter-option parser (`metadata=print:file=`).
6. **`npm run gen` can race** when six agents run it concurrently. It is idempotent — just re-run.
7. **Use background tasks' own completion notifications.** A hand-rolled `until <process gone>` watcher hung
   for 90 minutes on lingering shell wrappers after the real work had finished.

## Coordination

You (the parent) own `videos/video-1/work/timeline.json`. **Agents must not write it.** Have each agent
return its proposed spans (`cutaway` vs `overlay`, `master_in_s`/`master_out_s` in master seconds), merge
them into the EXISTING 18 shots yourself, then validate: no overlaps, no shot past `preview.end_s`, and
every rendered file's duration matching its span (a short render freezes or blacks at the tail).

Then set `preview.end_s` to **934.9** and bake the FULL video:

```
venv/Scripts/python tools/bake.py videos/video-1/work/timeline.json
```

Run everything from the repo root with the venv: `venv/Scripts/python tools/<tool>.py`.

Deliver a full-length composited preview, then report what you built, what you deliberately left as clean
talking head, and anything you could not sync because the audio was not recorded.
