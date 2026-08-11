# video-3 — prep before recording

Everything here has to be true before the camera turns on. Grouped by who does it.

---

## 1. Hasan — must do (blocking)

### 1.1 Time a real run · unblocks B3, B11

There is **no timing on file** for how long one post takes. The script currently has two
`⚠️ VERIFY` slots where a number would go, and both are written so the beat still works with no
number at all.

Do one of these:

- **Time a real `create-post` run**, gate to gate, and write the number here. Then the B3 line
  becomes a real before/after.
- **Or decide there is no honest before-number** (how long did a hand-made animation take? if the
  answer is "I never made one by hand," say that instead) and cut the comparison. The 28-tile wall
  in B1 and the 7-up grid in B11 already carry the argument without any clock.

Do not estimate. `identity/voice.md`: *a missing fact is asked for or omitted, never filled in.*

```
measured: one post, plan gate → rendered mp4 = ______
measured: batch of 7                          = ______
before (hand-made animation), if honest       = ______
```

### 1.2 Re-run the ToolerBox fact bridge · unblocks B7

The tool count in `toolerbox/PIPELINE.md` is **188 as of 2026-07-27**. Stale.

```
cd D:\repos\toolerbox-mcp-new
PYTHONIOENCODING=utf-8 python manage.py build_in_public --json > out.json
```

Redirect to a file. Printing to the Windows console crashes on encoding.

### 1.3 Prepare the batch-of-7 artifacts · unblocks B11 (the centerpiece)

The demo is **hybrid**: the session is simulated in TSX, the output is real. So the output has to
actually exist and look good on screen.

Blocks 21–27 are already built and scheduled, so the cheapest path is to use them:

```
blocks/block-21-connection-pooling/   post.txt + .mp4
blocks/block-22-request-id/
blocks/block-23-dependency-scanning/
blocks/block-24-backup-restore/
blocks/block-25-embeddings/
blocks/block-26-feature-flags/
blocks/block-27-idempotency/
```

Confirm for each: `post.txt` present, `.mp4` present and renders cleanly, the preview HTML opens.
If any of the seven looks weak on camera, swap it and tell me which, so the axis table in the shot
matches what the grid shows.

**Open call:** use these seven, or run a fresh batch so the demo is genuinely "today"? Cheaper is
the existing seven. More honest-feeling is a fresh run. Your call.

### 1.4 Capture the X scheduler screens · unblocks B12

`/fake-screencast` builds the walkthrough from stills, so capture these as clean screenshots at a
consistent window size:

1. X home, composer closed
2. Composer open, empty
3. Composer with the post text pasted, video attached (thumbnail visible)
4. The schedule picker open, a date and time selected
5. The composer parked, **Schedule button visible and not pressed**

Blur or crop anything with a real DM, a real notification count, or another person's handle.

### 1.5 Decide the lead magnet repo · unblocks B14

The video promises a repo with **the engine + skills + the vidtsx skill + the scheduler**, profile
swappable. That repo **does not exist yet**.

`D:\repos\claude-x-content-creator` is the older public version. It has `create-post`,
`create-thread`, `create-article`, `setup-profile`, `vidtsx-2d-generator` — but **no `schedule/`
and no `schedule-posts` skill**. If the video ships pointing at it, B12 promises something the
download does not contain.

Pick one:

- **Cut the new generic repo** from `my-x-growth-agent` (strip the private profile, keep the engine,
  add `schedule/` + `schedule-posts`, ship a template profile). This is what the script assumes.
- **Or rewrite B14** to point at the existing repo and say plainly that the scheduler is not in it.

Whichever, the link has to be live before publish.

### 1.6 Record

Standard delivery per `brand.md` §7. Notes specific to this one:

- **B4 is the thesis.** Slow down. It is the only beat that earns a pause.
- **B8 is the money shot.** Three parts, named clearly, no rush. A viewer who skips everything else
  should be able to act on this beat alone.
- **B11**, when scrolling the seven, do not perform speed. The point is that you *read* them.
- **B14 outro is deliberately loose.** Do not read it. Say it.

---

## 2. Claude — builds after the cut

Runs in pipeline order, so nothing here starts until the master cut exists.

| Step | Skill | Output |
|---|---|---|
| 1 | `/clean-cut` | master cut + `work/analysis/cuts.json` + `edited-transcript.json` |
| 2 | `/make-tsx` | 14 beats into `remotion/src/shots/video-3/` |
| 2b | `/fake-screencast` | B12 from the stills in 1.4 |
| 3 | `/clean-audio` | if the room needs it |
| 4 | `/suggest-sfx` | `work/sfx-plan.json` |
| 5 | `/packaging` + `/thumbnail` | `packaging/` |
| 6 | `tools/yt_upload.py` | private draft |
| 7 | `tools/notion_sync.py --apply` | tracker row |

**Assets to gather into `media/projects/video-3/`** before step 2:

- 3 hero `.mp4` diagrams for B1 (pick the three best-looking of the 28)
- all 28 `.mp4`s for the B1 grid
- one `.tsx` file + its rendered output, frame-matched, for B3
- a book page render + the `blocks/PIPELINE.md` queue table for B6
- one real commit message + the post it produced for B7
- one Mermaid sketch + the final render of the **same** diagram for B10
- the 7 post previews + 7 mp4s from 1.3 for B11
- the X screenshots from 1.4 for B12

**Custom builds** (no existing kit component):

- **B1 28-tile grid.** 28 videos looping at once is heavy. Build it as a staggered reveal with the
  tiles as stills, and only 3 or 4 actually playing at any moment.
- **B2 feed simulation.** Two passes at identical scroll speed, one all-text, one with a single
  moving card. The eye-tracking point only lands if the speed is genuinely identical.
- **B8 three-part diagram.** The hero shot. Give it real design time.
- **B11 simulated Claude Code session.** Terminal + a table that fills row by row + seven staggered
  progress lines.

---

## 3. Facts locked for this script

Verified 2026-08-10 against the repos. Re-check anything marked stale.

| Claim | Value | Where it came from |
|---|---|---|
| Blocks in the book | 373 | `####` count across `02-*.md`…`12-*.md` |
| Chapters | 11 | same |
| Current block number | 27 | `schedule/state.json` (highest block key) |
| Blocks **posted** | 9 (blocks 12–20) | `schedule/state.json` |
| Blocks **scheduled, not yet out** | 7 (blocks 21–27) | `schedule/state.json` |
| Rendered animated diagrams | 28 | 15 in `blocks/` + 13 in `toolerbox/` |
| Ledger, both series | 30 pieces, 17 posted, 13 scheduled | `schedule/state.json` |

> ⚠️ **Do not say "I published 27 blocks."** 27 is the block *number* reached, not the count
> published. Nine are out. Seven are scheduled and waiting. The script says "I'm on block twenty
> seven right now" for exactly this reason.
| Cookies needed | 2 | `.env.example` |
| Design axes | 4 | `engine/diagram-method.md` §2 |
| No-repeat window | last 3 pieces | `engine/diagram-method.md` §3 |
| Batch size | 7 (blocks 21–27) | `blocks/BLOCKS-21-27-PLAN.md` |
| ToolerBox tools | 188 ⚠️ **stale, 2026-07-27** | `toolerbox/PIPELINE.md` |

If a number changes between now and record day, change it here first, then in `script.md`.
