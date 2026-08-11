Working in `d:\repos\claude-youtube-editor`. Project: `videos/video-1` — the BrainOutside launch video.

**Step 1 (the cut) is locked. Do not re-cut anything.** Start step 2: the visual beats.

Read `CLAUDE.md`, then invoke the `/make-tsx` skill — it owns this step.

## What's ready for you

| Artifact | Path |
|---|---|
| Master cut, 4K60 10-bit HEVC | `videos/video-1/output/master-natural.mp4` |
| Playable / comp-source H.264 | `videos/video-1/output/master-natural-h264.mp4` |
| Word-level spine (ms, master timeline) | `videos/video-1/work/edited-transcript.json` |
| Script + beat plan | `videos/video-1/script/script.md` |
| Cut decisions + ~35 flags | `videos/video-1/work/analysis/{cuts.json,review.md}` |

Master runtime is **15:35** (last word ends 15:34.90). The H.264 handoff is already comp-native
(1920x1080@30, 8-bit) so Remotion can use it directly. The 4K60 10-bit HEVC is the archival master —
do not feed it to Remotion, it starves OffthreadVideo's decoder.

**All timecodes below are real, read out of `edited-transcript.json`.** Do not compute times from
`cuts.json` + `plan_clip`: each rendered segment rounds up to a whole 59.94fps frame, and over 470
segments that accumulates ~+3.9s by the end of the video (~+1.3s by the 5-minute mark). The planned
timeline and the actual master are NOT the same clock. `edited-transcript.json` is the only spine.

## The task

Build the Remotion TSX visual beats for the **first 5 minutes only**, into `remotion/src/shots/video-1/`.

Spawn **five agents in parallel**, one per script beat. Each owns its own shot files so they will not
collide. All timecodes below are in the MASTER timeline — confirm each against `edited-transcript.json`
before timing anything to it.

1. **B1 — cold open · 00:00–01:31.** The A/B reply comparison, which is the whole hook. Two replies side
   by side, neither labeled, then the reveal. Cues: "Read the first one" **00:24.93** · "It is generic...
   AI slop" **00:26.18** · "Now the second one" **00:29.61** · the real numbers "16 seconds of downtime
   twice a year, $700 a month" **00:30.93** · "So we have the same model / same prompt / same post"
   **00:43.76** · "but we have one big difference" **00:48.56** · "connected to my brain" **00:59.77**.
   Two shock-clip slots: after "Yes, my brain" **01:02.42** and after "is going to shock you" **01:22.89**
   — **that generated clip does not exist yet**, so leave labeled placeholder spans in the timeline, do
   not fake it. Beat ends on "let's get started" **01:30.68**.

2. **B1.5 — the leash · 01:31–02:12.** The real `gaps` field from a context pack, highlighted.
   "do not invent this number" **01:46.56** · "Read that again" **01:59.35** · "told the AI model what is
   not allowed" **02:01.34** · "To make up." **02:04.69** · then the hallucination pivot.

3. **B2 — the mirror · 02:12–03:17.** Deliberately the lightest beat — the script says let it be a human
   moment, so mostly clean talking head. Minimum: the BrainOutside wordmark on "I called it BrainOutside"
   **02:26.94**. The "It knows how I write / what I believe / my philosophy / my projects" run starts
   **02:32.41** and can take a restrained list build. "And some people call it second brain" **02:42.74**.

4. **B3 — what it actually is · 03:17–04:37.** ← the shot everything else calls back to. Full-screen.
   "And the idea is really simple" **03:19.03** → "a folder" **03:22.72** → "with markdown files, text
   files" **03:23.82** → inside a Git repo. What goes in it: "Who you are, how you write..." **03:35.84**.
   **The two-heads diagram**: "has 2 heads" **03:53.55** → "The first head is local" **03:55.16** → "The
   second head is online" **04:02.62**. Then "can be accessed with both MCP and API endpoints"
   **04:21.55**. Build the two-heads diagram as a reusable component — B8 calls back to it later.

5. **B5 — local brain, opening · 04:38–05:20.** VS Code mockup via `remotion/src/lib/vscode`.
   "Okay, enough theory" **04:40.15** · "You just open the template repo" **04:48.50** · "click Use this
   template" **04:51.81** · "open it in VS Code" **04:57.18** · "Inside there are 2 skills" **05:00.80**
   (mind-feeder writes / mind-reader reads). Stop before "Watch what feeding looks like" **05:10.36** —
   the feed flow belongs to the next chunk.

## Hard rules

- Every shot exports `compositionConfig = { id, durationInSeconds, fps: 30, width: 1920, height: 1080 }`.
  This video is **16:9 landscape**, not vertical.
- **Library-first.** Read `remotion/src/lib/{kit,browser,screencast,vscode}.tsx` and several of the 37 real
  shots in `remotion/src/shots/example/` before authoring anything. Do not reinvent what the kit has.
- Color and type come from `remotion/src/brand.ts` + `fonts.ts` only. Never hardcode a hex value.
- Sync every reveal to real word times from `edited-transcript.json`. Do not eyeball timings.
- After adding or renaming shots: `cd remotion && npm run gen` (the render scripts do NOT run it).
- **QA is not optional:** render frames and actually READ them before declaring a shot done.
- Per-video media goes in `media/projects/video-1/`, referenced as `staticFile('projects/video-1/x')`.
  `media/library/` is for cross-video assets only.

## Coordination

You (the parent) own `videos/video-1/work/timeline.json` — the agents must not write it. Have each agent
return its proposed spans (`cutaway` vs `overlay`, start/end in master seconds), merge them yourself, then
bake a composited preview with `python tools/bake.py`.

## Things you need to know before you start

- **`/brand-setup` has never been run on this repo.** `brand.md`, `brand.ts` and `fonts.ts` are still the
  shipped house default, so anything you build will look like the example channel rather than his. Ask
  whether to run `/brand-setup` FIRST — doing it after the shots exist means reworking them.
- Three ASR errors survive in the transcripts. Use the corrected wording for any on-screen text:
  **"cost story"** (not "code story"), **"the real quotes"** (not "the real codes"), **"every note,
  filterable"** (not "Evernote").
- Two scripted beats were never recorded: **B10 privacy/tier split** and **B8 reverse direction**. Both are
  outside the first 5 minutes, but they are real holes later in the video.
- One audio graft is owed at the mix step (flagged in `cuts.json`): the word "side" at 14:20, with the clean
  take already extracted to `videos/video-1/work/pickups/side-0264-492.20.wav`.
- Run everything from the repo root, with the venv: `venv/Scripts/python tools/<tool>.py` on Windows.
