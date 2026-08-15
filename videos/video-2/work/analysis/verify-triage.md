# Verify triage — video-2

`verify_cut.py` findings are advisory: they say *where to listen*, not *what is wrong*.
The skill's rule is that no line may be left unexplained. This is that accounting.

## Pass 1 — preview-tight (before the phantom fix)

`Extra: 3 · missing: 12 · heard differently: 11 · big interior pauses: 64 · low-confidence: 23 · A/V drift flags: 0`

**One real defect found. Everything else is second-pass ASR variance.**

The discriminator used throughout: *does the finding sit at a cut join, and does the
rendered audio span match the raw span?* A genuine clip/ghost shows up at a join with a
duration mismatch. Variance shows up mid-keep with matching duration.

### The real defect — FIXED

| where | what |
|---|---|
| interior pause **1.46s** between `Google` and `knows` (render 419.43s) | **Phantom token.** `Google` was timestamped 0275 224.85-225.55, a span that is **0% hot** (peak +1.7 dB over floor) — it sits inside a real 3.30s silence. Envelope: speech 221.36-223.14 ("No guide on Google"), silence, speech 226.44-227.21 ("knows this."). `split_atoms` built a single-word atom around pure silence, so the renderer emitted ~0.9s of dead air mid-sentence. |

Fixed in `token-time-fixes.json` (`retimed_groups`, clip 0275): `Google` pulled back to
223.00-223.14, the tail of the real run, so it merges into the preceding atom and leaves
one honest 3.41s pause for the engine to compress. `on` shortened to 222.94-223.00 (it
also overran the run end by 0.19s). Both previews re-rendered after the fix.

**Why the earlier detectors missed it:** a phantom has a normal duration and normal
neighbouring gaps, so the LONG / GAP_AFTER scan cannot see it. Added
`scratchpad/phantoms.py`, which flags any kept word whose span is <20% hot. It found
exactly one phantom in all 2,265 words — this one.

### Extras (3) — all explained

| at | finding | explanation |
|---|---|---|
| 433.36s | `$0.35.` (2 tokens) | The render ASR formatted the spoken "35 cents" as "$0.35". Pairs with the missing `cents.` below — one event, not two. Context proves it is the KEPT take: the render reads "the total bill is **like** $0.35", while the cut take said "a total server bill **around** $0.35". No leak from the cut. |
| 109.17s | `a` | "to use AI as **a** writing assistant" (conf 0.57). Raw pass heard "as writing assistant". Sits mid-keep — the nearest cut join in 0272 is >20s away — so no ghost path exists. |

### Missing (12) — all explained

| at (raw) | word | explanation |
|---|---|---|
| 0275 218.28/218.43/218.60 | `or` `your` `pool` | Mangled into the single token `Oriopoulos` (see below), not dropped. Render span 415.36-415.99 = 0.63s vs raw 218.28-218.94 = 0.66s — the audio is all there. Caused by a short 0.66s atom isolated between two compressed joins, which starves the recognizer of context. |
| 0275 271.11 | `cents.` | Same event as the `$0.35.` extra above. |
| 0272 21.51 | `needed` | Raw conf 0.50, render conf 0.51 — both passes struggle with the same word. Mid-keep, continuous audio. |
| 0272 35.69 | `one` | Render formatted it as the digit `1` ("2022, 1 year later"). |
| 0273 146.98 | `I` | Raw conf 0.50; render heard "the AI" where raw heard "I". Mid-keep. |
| 0273 259.96 | `WinCoding` | The ebook title, actually **"Vibe Coding"**; raw conf 0.48. Render heard "when coding". Both wrong, differently. Already logged under `transcription_errors_not_time`. |
| 0274 152.65 | `tell` | Render heard the more grammatical "tells". Raw conf 0.51. |
| 0275 139.40 | `here` | Render heard "here's" ("And here's where it's really super difficult"). Mid-keep. |
| 0271 63.69 | `you` | A 0.09s function word; render merged it into "you'll". Mid-keep. |
| 0277 192.07 | `really` | Render heard "real" ("Not skimming, real reading"). Combined span matches raw to within 0.04s — nothing clipped. |

### Heard differently (11) — all explained

Every one is a mid-keep recognition difference, listed above under its paired
missing word: `you'll`, `need`, `1`, `the`, `AI`, `when`, `coding`, `tells`, `here's`,
`Oriopoulos`, `real`. None sits at a cut join.

### Big interior pauses (64) — 63 expected, 1 real

Tight compresses a join to `tail + head`, up to `0.40 + 0.15 = 0.55s`, and the check
fires at >= 0.40s — so joins landing 0.40-0.60s are the design target, not a fault.
63 of the 64 are in that band. The 1.46s outlier was the phantom, now fixed.

### Low confidence (23) and A/V drift (0)

Low-confidence rendered tokens are the same set already listed in `qa-report.md` for the
raw pass (quiet function words plus the known `drinking` / `WinCoding` mis-hearings) —
they mark audio to listen to, not cut errors. **A/V drift flags: 0**, and the container
check on the render gave v:0 = 613.278s vs a:0 = 613.279s — 0.5 ms apart, confirming the
MPEG-TS intermediate concat is not accumulating the per-segment padding drift.

## Pass 2 — after the phantom fix (both styles re-rendered from scratch)

```
preview-tight    Extra: 3 · missing: 12 · heard differently: 11 · big interior pauses: 63  · low-conf: 24 · A/V drift: 0
preview-natural  Extra: 0 · missing: 14 · heard differently: 15 · big interior pauses: 170 · low-conf: 21 · A/V drift: 0
```

**The phantom is gone.** Tight's interior pauses dropped 64 -> 63 and the 1.46s
`Google ⟂ knows` join no longer appears anywhere in the report. Max interior pause on
tight is now **0.61s**; every join sits inside the design band (`tail 0.40 + head 0.15 =
0.55s`, plus ASR boundary variance).

**Tight's word-level findings are byte-identical to pass 1** — the same 3 extras, 12
missing and 11 differences, at the same timestamps. That reproducibility is itself
evidence: these are deterministic recognizer behaviours on the same audio, not random
noise, so the pass-1 triage above holds without revision.

**Natural's 170 interior pauses are structural, not a fault.** Natural's minimum join is
`min_tail 0.26 + head 0.17 = 0.43s` and the check fires at >= 0.40s, so essentially every
join in that style trips it by construction. What matters is the distribution, and it is
tight: **max 0.66s, zero joins above 0.70s**, against a soft ceiling of
`soft_max_tail 0.95 + head 0.17 = 1.12s`. No outliers.

Natural reports 0 extras (vs tight's 3) only because its longer tails give the recognizer
more context around the "$0.35" / "a" spots — same audio, different segmentation.

**A/V drift flags: 0 on both.** Container check on the deliverables:

| render | v:0 | a:0 | delta | frames |
|---|---|---|---|---|
| preview-tight | 612.093967s | 612.095000s | 1.0 ms | 36,689 |
| preview-natural | 637.519478s | 637.520000s | 0.5 ms | 38,213 |

## Verdict

No unexplained lines remain in either report. One real defect existed (the phantom) and
it is fixed and re-verified. Both cuts are machine-clean and ready for the ear.

## Pass 3 — after audit round 1 (natural only; 4 doublings Hasan caught by ear)

```
preview-natural  Extra: 0 · missing: 14 · heard differently: 16 · big interior pauses: 161 · low-conf: 16 · A/V drift: 0
```
v:0 632.180800s vs a:0 632.181000s (0.2 ms), 37,893 frames, **10:32**.

**The one finding a machine could not have made.** At ~1:44 Hasan heard a repeated
phrase where the transcript showed none. Re-transcribing the two hot runs in ISOLATION
proved it: run 1 (55.30-57.00) = *"Around 300,000."*, run 2 (58.20-61.40) = *"Around
300,000 people watched the video."* The recognizer had merged **two deliveries into one
`300,000` token** (55.89-59.77) — 6 tokens for 8 spoken words. No duration, gap, phantom
or energy check can see this, because the duplicate is destroyed at recognition time;
only an ear, or an isolated re-transcription, recovers it. This also means the pass-1
"inflated span" diagnosis was half-wrong: the token did span a silence, but the reason
was a swallowed retake, not a stretched word.

All 6 tokens were re-pointed at the second (complete) delivery using the isolated pass's
own word times, leaving run 1 with no tokens — so it falls between atoms and never
renders. An `EXTRA_CUT` at 55.30-57.00 records the intent in cuts.json.

**All four fixes confirmed present in the render** (duplicate scan over the rendered
transcript now returns only the `my beliefs` doubling Hasan chose to keep):

| flagged | render now reads |
|---|---|
| ~1:44 | "…with the help of AI. Around 300,000 people watched the video, and it was really fast, yes" |
| ~2:21 | "…but this is reality and you should adapt." |
| ~6:22 | "…and 20 seconds later, Supabase was up." |
| ~8:33 | "…in my voice, and backed by its evidence." |

**The two tight splices did not clip.** Cutting the first `Supabase,` left only 0.137s of
tail on `later,`, and cutting the first `and backed by,` left 0.081s on `voice,` — both
below natural's 0.26s `min_tail`. Neither word appears in the render's MISSING list, so
both survived. (For the `and backed by` cut, removing the SECOND copy instead was
considered and rejected: it would have left a 0.035s head on `its`, and a clipped word
ONSET is far more audible than a clipped release.)

Missing/different counts stay in the established ASR-variance band; the new entries
(`One`, `gigabyte` -> render heard "4GB", `guy`/`drinking`, `command,`) are all mid-keep
recognition differences, none at a splice.

## Trap worth remembering

`render_cuts.py` caches segments at `work/render/<style>-<mode>/seg_NNN.mp4` keyed on
**index alone**, and skips any that already exist. The phantom fix changed the atom count
273 -> 272, and the first re-render printed `resuming: 272 segments already encoded, 0 to
go` — it would have stitched stale segments against a correctly rebuilt audio track and
looked fine. **After any edit to cuts.json or the transcripts, `rm -rf
videos/<project>/work/render` before re-rendering.** A genuinely fresh render prints
`N segments` with no `resuming:` line.
