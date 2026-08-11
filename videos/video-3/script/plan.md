# video-3 — plan

**Working title:** How I Make Animated X Posts at Scale (the pattern, not the tool)
**Target runtime:** 14–16 min · **Register:** `identity/voice.md` → YouTube (spoken) block
**Subject repo:** `D:\repos\my-x-growth-agent` (private) · book source: `D:\repos\school-sheets\books\blocks`

---

## The spine

> **The bottleneck moved.**

Writing was never the hard part. The **visual** was. Animated diagrams are what stop a scroll,
and nobody can make one per day by hand. TSX killed that cost, so the constraint moved one step
upstream: **now the only thing that limits you is knowing what to post.** That is what a content
**pattern** solves.

Every beat must build or pay off that move. The test:

| Beat says | Keep? |
|---|---|
| "here is how the animation gets made for free" | ✅ kills bottleneck 1 |
| "here is where the ideas come from, forever" | ✅ kills bottleneck 2 |
| "here is a cool Claude Code feature" | ❌ cut |

**Runtime split (pattern-heavy, as decided):**

```
ACT 1  the bottleneck moved     ~3:30   (visual is the hook, the turn is the thesis)
ACT 2  the pattern              ~6:00   ← the transferable idea, biggest teach
ACT 3  the machine at scale     ~5:30   (vidtsx two-step · batch of 7 · scheduler · close)
```

Act 2 is the longest on purpose. The visual pipeline is the *hook*; the pattern is the *lesson*
they can use tomorrow without any of my code.

---

## What the viewer leaves with

1. **A content pattern is a machine, not a topic list.** Three parts: a source that refills
   itself, a fixed unit, a locked shape. (Act 2 — the money beat, B8.)
2. **Two working examples of a pattern**, so they can see the shape twice and generalize:
   a book (Blocks) and their own git commits (ToolerBox). Two very different sources, same machine.
3. **Sketch before TSX.** Verify the diagram as a Mermaid sketch, *then* build and render. Wrong
   archetype caught in seconds instead of after an hour of build-and-validate.
4. **Batch when the system is verified**, not before. 7 at once only works because the axes get
   reserved upfront.
5. **The scheduler is free.** Playwright drives X's own native scheduler with two cookies. No API,
   no third-party tool, no X API bill.

---

## Beat map

### ACT 1 — THE BOTTLENECK MOVED (0:00–3:30)

| # | Beat | Screen | ~ |
|---|---|---|---|
| B1 | Cold open: a real rendered diagram plays. Then the wall of 28. | real mp4s, then a grid | 0:50 |
| B2 | Writing was never the hard part. The picture was. | feed sim: text posts vs one moving | 0:45 |
| B3 | The kill: the diagram is code. Claude writes it, the machine renders it. | TSX → rendered mp4, side by side | 0:50 |
| B4 | **The turn.** So I hit the real bottleneck: I ran out of ideas. | full-screen statement | 0:35 |

### ACT 2 — THE PATTERN (3:30–9:30)

| # | Beat | Screen | ~ |
|---|---|---|---|
| B5 | The wrong question: "what do I post today?" You lose that fight daily. | full-screen statement | 0:30 |
| B6 | **Pattern 1 — building blocks.** A book of 373 entries. One entry = one post, numbered. | book → PIPELINE queue → post | 1:40 |
| B7 | **Pattern 2 — git commits.** ToolerBox: the work already writes the content. | terminal `build_in_public --json` → post | 1:30 |
| B8 | **The generalization.** A pattern = source that refills + fixed unit + locked shape. Find yours. | full-screen 3-part diagram | 1:30 |
| B9 | The pattern decides WHAT. The voice decides HOW. Optional: wire it to the brain. | voice.md → post; video-1 callback | 0:50 |

### ACT 3 — THE MACHINE AT SCALE (9:30–15:30)

| # | Beat | Screen | ~ |
|---|---|---|---|
| B10 | **The two-step.** Sketch (Mermaid) → verify → TSX → render. Why the gate exists. | sketch, then the rendered thing | 1:40 |
| B11 | **THE DEMO — 7 at once.** Axes reserved upfront, 7 parallel builds, 7 real previews. | hybrid: TSX session → real grid | 1:50 |
| B12 | The scheduler. Two cookies, X's own scheduler, parks and never clicks. | fake-screencast of X compose | 1:10 |
| B13 | The honest caveats, volunteered. | full-screen list | 0:30 |
| B14 | Close + the two downloads + outro. | end card | 0:50 |

---

## Lead magnets

| # | What | State | Where it lands |
|---|---|---|---|
| 1 | **The generic repo** — the engine + skills + vidtsx skill + the scheduler, profile-swappable | ⚠️ **does not exist yet.** Hasan cuts it from `my-x-growth-agent` before launch. Public `claude-x-content-creator` is the older create-only version and is **not** what the video promises. | B11 tease → B14 give |
| 2 | **The building blocks book** — 373 blocks | exists at `D:\repos\school-sheets\books\blocks` (built editions in `complete-edition/`) | pitched *inside* B6 as the source of pattern 1, not bolted on at the end |

Magnet 2 is the better pitch because it is load-bearing: the book *is* the source that makes
pattern 1 refill itself. The viewer wants it as evidence, not as a bribe.

---

## Verified numbers (safe to say on camera)

Pulled from the repos on 2026-08-10. Voice rule: exact numbers only, never vague quantities.

| Claim | Value | Source |
|---|---|---|
| Blocks in the book | **373** | `####` headings across `02-*.md`…`12-*.md` |
| Chapters | **11** | same |
| Pieces in the scheduler ledger | **30** (17 posted, 13 scheduled) | `schedule/state.json` |
| Blocks posted vs scheduled | **9 posted** (12–20), **7 scheduled** (21–27) | `schedule/state.json` |
| Current block number | **27** (not "27 published") | `schedule/state.json` |
| Rendered animated diagrams | **28** (15 blocks + 13 toolerbox) | `find -name "*.mp4"` |
| Cookies the scheduler needs | **2** (`auth_token`, `ct0`) | `.env.example` |
| Blocks in the batch | **7** (21–27) | `blocks/BLOCKS-21-27-PLAN.md` |
| Design axes per diagram | **4** | `engine/diagram-method.md` §2 |

## ⚠️ Numbers that are NOT verified — do not say them until measured

- **How long one post takes now.** No timing on file. Time a real `create-post` run end to end
  and say the measured number, or cut the comparison entirely.
- **How long a diagram used to take by hand.** Same. If there is no honest before-number, drop the
  before/after framing and let the batch of 7 carry the argument instead.
- **ToolerBox tool count.** `toolerbox/PIPELINE.md` records 188 as of 2026-07-27. Re-run
  `python manage.py build_in_public --json` before recording; do not quote the stale number.

`identity/voice.md` → Accuracy guardrails: *"Never fabricate. A missing fact is asked for or
omitted, never filled in."* These three are the only places this script is tempted.

---

## Shot dependencies

| Beat | Needs | Who |
|---|---|---|
| B1 | 3 real rendered `.mp4` diagrams + a 28-tile grid | assets exist; grid is a TSX build |
| B3 | one TSX file and its rendered output, matched frame | assets exist |
| B6 | book page render + the PIPELINE queue table | TSX |
| B7 | terminal shot of `build_in_public --json` | TSX (`remotion/src/lib/` terminal) |
| B10 | one Mermaid sketch + the final render of the *same* diagram | pick a real block from `blocks/` |
| B11 | **7 real post previews + 7 real rendered mp4s** | ⚠️ **Hasan prepares before recording** |
| B12 | X compose screenshots → `/fake-screencast` | ⚠️ **Hasan captures before recording** |

Full prep list: `prep.md`.

---

## Open calls

1. **Which 7 for the demo?** Blocks 21–27 are already built and scheduled, so their previews and
   mp4s are real and on disk. Cheapest credible option. Alternative is a fresh batch, which costs
   a real build run but lets the demo be genuinely "today."
2. **How much of the brain (video-1) to show in B9.** Current draft keeps it to ~20s as an
   *optional* upgrade so viewers who skipped video-1 do not stall. Can expand to a full callback
   if the retention read on video-1 was good.
3. **Naming.** "Building blocks" is the series name *and* the book name *and* the generic word
   used to describe a pattern unit. B8 must not collapse them. Current fix: call the general
   concept **"the unit"** and reserve "building block" for Hasan's specific series.
