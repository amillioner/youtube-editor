# video-2 — The Content Factory · PLAN

**Target:** 9:30 (hard ceiling 10:00) · **Spine:** one line in, one published page out
**Subject:** `D:\repos\learnwithhasan-new\.claude\skills\content-factory`
**Voice:** brain `identity/voice.md` YouTube block — same register rules as video-1
(no em dashes, exact numbers only, short sentences, concession-then-pivot, honest caveat early)

**This is a PLAN, not the script.** Narration is written AFTER the demo piece runs, because
half the good lines are real numbers (boot time, cost, the recon gap, the claim count) and
the accuracy rule bans inventing them. See §Pre-record.

---

## 1. The thesis

The audience's default reaction to "AI writes my blog posts" is *slop*. That objection dies
in the first 30 seconds, and the factory has an unusually good answer:

> **It does the work before it writes.**

It rents a real server, deploys the real thing, measures it, screenshots it, destroys the box,
and only then drafts — in a voice that comes from a file it does not own. Every factual claim
maps to an evidence file or it does not ship.

**Deliberate rhyme with video-1.** Video-1: *same model, same prompt, one difference — it's
connected to my brain.* Video-2: *same model, same prompt, one difference — this one did the
work first.* Same shape, so the BrainOutside callback at the end reads as a sibling video,
not an ad.

## 2. Altitude (locked)

**Building blocks and vocabulary, not code.** Nobody is taught to write a skill file on camera.
What the viewer leaves with:

- the five blocks and what each one *is for*
- the vocabulary: recon, gap, evidence manifest, checkpoint, lab, capture, claims map,
  verification loop, ship, seed
- the conviction that they could assemble one for their own niche

Anatomy and detail go to a **written companion guide** (also not code — the pattern), linked
in the description. That is the second CTA.

**Allowed on screen:** outputs and artifacts — the ledger, a recon report, a claims table, a
terminal doing a real thing, the published page.
**Not on screen:** source files, function names, folder trees of the skill.

## 3. The five blocks (the B3 card, and the video's skeleton)

| Block | What it is | Named in video as | Beat |
|---|---|---|---|
| **The contract** | A written spec the agent follows: stages, rules, gates | "a skill — plain English, not code" | B4 |
| **The senses** | External APIs that tell it what the world already ranks | "keyword + SERP data" | B5 |
| **The hands** | A browser it drives itself | "Playwright" | B8 |
| **The proof** | Disposable real infrastructure | "a lab — a real server, rented by the minute" | B7 |
| **The voice** | A file of who you are, that it is not allowed to invent around | "your brain" | B9 |

Everything else in the pipeline (the checkpoints, the claims map, the verify loops) is
presented as **the leash** — the thing that makes the output trustworthy.

## 4. Beat sheet

### ACT 1 — WHY (0:00–1:45)

**B1 · Cold open: it rents a server (0:00–0:45)** — talking head, then terminal.
Ask it for a guide. It does not write. A real VPS boots, deploys, gets measured, gets
destroyed. *Then* it writes. Hard cut to the finished published page.
Line to land: *"Before it wrote a single sentence, it rented a server."*

**B2 · The receipt (0:45–1:20)** — full-screen. The LEDGER, real rows, pieces in flight.
Then the live site. Not a demo I built for a video — the thing that publishes my guides.
⭐ **Strongest opener available now that video-1 is out:** *"the free guide I linked in the
last video? I didn't write it. This did."* Anyone who came from video-1 has already read it,
so the proof is verified before I make a claim. Five seconds, then move.

**B3 · The map (1:20–1:45)** — the five-block diagram from §3. Each block lands on its word.
This card returns as a progress spine: the current block lights up at B5/B7/B8/B9.

### ACT 2 — THE RUN (1:45–7:15) · one real piece, start to finish

**B4 · One line in (1:45–2:05)** — the entire input is a paragraph of intent. No prompt
engineering. The contract already knows the stages. *"That's the input. All of it."*

**B5 · Recon — the senses (2:05–2:55)** — it reads the top 15 results before it has an
opinion. What they cover, what they miss, what an answer engine would quote.
⭐ **If the real recon moves the target off my first instinct, that beat goes in the video
verbatim.** A pipeline that overrules me on camera is the most convincing 15 seconds available.
Also the honest caveat, volunteered here: *"if it can't find a gap, it tells me the topic is
weak, before anything is written."*

**B6 · The plan, and the stop (2:55–3:35)** — thesis, what it will prove, what it will cost.
Then it stops and waits for me. Callback to video-1's rule: **agents propose, you approve.**

**B7 · The lab ← HERO (3:35–4:45)** — speed-ramped terminal, `sped up` corner tag.
A server exists. It runs the experiment. Failures are evidence too. The box is destroyed at
the end of the stage — teardown is part of the work, not cleanup.
Real numbers only: boot time, run time, actual dollars.

**B8 · The hands (4:45–5:25)** — it drives a browser and takes the screenshots itself.
The rule worth 10 seconds: **it never blurs a secret, it re-shoots with a fake one.** Blur is
an admission; a re-shoot is a screenshot.

**B9 · The voice (5:25–6:10)** — now it writes. The voice file is not in this repo.
⚡ **BrainOutside seed, ~10s only:** *"that file lives in my brain, and I made a whole video
about that — hold that thought."* Do not explain it here. B14 pays it off.

**B10 · The leash (6:10–6:50)** — the claims table, rendered. Every factual claim → an
evidence file or a source it actually fetched. Zero orphans or it does not ship.
Then the verification loops, as a checklist going green. This is the anti-slop beat.

**B11 · Ship (6:50–7:15)** — the page gets built, checked, rendered, and committed.

### ACT 3 — SO WHAT (7:15–9:30)

**B12 · Live publish (7:15–7:50)** — real browser, real URL, on camera, right now.
*"Pause the video and go read it. Link below. Then come back and tell me it's AI slop."*

**B13 · Parallel (7:50–8:20)** — several pieces at once, in separate sessions, one shared
ledger, locks so they never collide. Short. This is the "industrial, not a toy" beat.

**B14 · The flywheel → video-1 (8:20–9:05)** — the diagram the video ends on.
Stage one of the pipeline is *read the brain*. The last stage is *feed the brain*. So it is a
closed loop: every guide it publishes makes the brain better, which makes the next guide
better. The factory is the consumer; the brain is the supply. That is video-1, and it is why
that one comes first.

**B15 · Close (9:05–9:30)** — the pattern generalizes. Five blocks, your niche.
Guide link, video-1 link, like, comments.

---

## 5. Honesty rule for the TSX (non-negotiable)

The factory's entire pitch is evidence over invention, and its own capture module bans
terminal output that was typed from memory. **So the video does not simulate the run — it
replays it.** Every terminal line, ledger row, recon number, claim row and filename on screen
is pasted from the real run's artifacts. Compression only: speed ramps with a `sped up` tag,
same as video-1 B7.

One line on camera, early (end of B1 or top of B4):
> *"Everything you're about to see is the real run, replayed. I compressed it. I didn't fake it."*

That converts the biggest credibility risk in the video into a credibility beat.

## 6. The demo piece — pre-record dependency

**Locked:** a fresh self-hosting piece with a real droplet run, published on camera at B12.
It cannot be `ai-second-brain` — that one's ship gate is brainoutside.com going live, so it
publishes with video-1.

**Topic must clear three bars:**
1. genuinely needs a server, so B7 is literally true
2. lands on an AI-builder topic, so this audience actually clicks the link at B12
3. not already in `content-lab/`

**Locked: self-hosting Supabase.** (n8n ruled out by Hasan.)

The deciding argument is **B7**. It is the hero beat and it only earns its 70 seconds if the
lab actually *finds* something. A happy-path deploy turns B7 into a progress bar. Self-hosting
Supabase is genuinely painful — real memory floor vs what the docs imply, services that fall
over, undocumented config — so the run produces failures, and **failures are evidence**. That
is the factory's whole argument, and it is what makes B10 land instead of feeling abstract.

It also clears the three bars hard: every AI-assisted app builder touches Supabase, so B12
converts with exactly this audience; it is evergreen and commercial rather than video-shaped;
it sits in the Solo Builder hub beside the boilerplates; and the cost lens is already in the
brain (Supabase Pro is per-project, against a box already paid for).

**Seeds for S2:** `self host supabase`, `supabase self hosted`, `supabase self host cost`.

**Alternates if the flavor needs to change:** **Open WebUI** maximizes raw click-through
(self-hosted ChatGPT for a team, dramatic cost math) but costs the hero beat — the deploy is
too easy. **Langfuse** is the differentiator play, nobody has covered self-hosting it well,
at lower volume.

**Do not pre-pick the exact keyword.** Give the factory the seeds above and let S2 decide with
real volume data. If it narrows to something other than the first instinct, that is B5's best
shot.

## 7. Pre-record checklist

- [ ] Run the demo piece S1→S7. Stop before S8. **S8 happens on camera.**
- [ ] Keep the artifacts: recon report, evidence manifest, droplet log, claims table,
      the four V6 captures. These are the source material for every TSX shot.
- [ ] Record the real numbers: droplet boot, lab wall-clock, dollars spent, claim count,
      credits used. Narration quotes these, nothing else.
- [ ] Screen-caps for B5/B8/B12 via the factory's own capture harness (consistent spec).
- [ ] Decide: does the companion guide ship before recording, or same week with the URL
      reserved? (Recommendation: same week — it is not needed to record.)
- [x] Release order — **video-1 is out and brainoutside.com is live.** B14 pays off a video
      the audience can already watch, and B2 can point at a guide they may already have read.

## 8. Open

- Companion guide topic/slug for the description CTA (the pattern, not code).
- Whether B13 (parallel) survives if the cut runs long. It is the first thing to drop.
