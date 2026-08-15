# Cloning Myself: the AI Avatar + Voice Lab Notebook

**Goal:** find the combination of AI avatar + AI voice that passes one brutal test — *does it look
and sound like ME?* — and build a fully automated YouTube Shorts pipeline around it. Everything
below is a real experiment with real costs and real verdicts, logged as we go. Written to be
shareable: if you're a creator trying to clone yourself, this is the map.

**Who's judging:** Hasan (learnwithhasan) — English with an Arabic accent, which turns out to be
the hardest thing for these tools to preserve. The bar is strict: an impressive result that drifts
off-identity loses to a boring result that's *him*. Every verdict here is his, by eye and ear.

**How it's run:** Claude Code drives everything — API calls, renders, QA — from a Windows machine.
No video editor, no dashboards where an API exists.

---

## Status

| Piece | State | Winner so far |
|---|---|---|
| Voice clone | ✅ Locked (2026-08-12) | ElevenLabs Hasan-Pro (PVC) on `eleven_multilingual_v2`, recipe #18 |
| Avatar (per-clip, image+audio) | ✅ First pass done (2026-08-12) | OmniHuman v1.5 on fal |
| Avatar (per-clip, challenger) | 🔬 Researched, untested | LongCat-Video-Avatar 1.5 (claims a win over OmniHuman) |
| Avatar (trained platforms) | 🔬 Researched, untested | HeyGen Avatar V (only one clean on all four criteria) |
| Lipsync on real footage | 🔬 Researched, untested | HeyGen `/v3/lipsyncs` + sync-3 |
| Full automated Short | ✅ Proof built (ShortAiTest) | OmniHuman bursts + TSX beats |
| Shorts factory format | ✅ **LOCKED** (2026-08-13, Block 30 pilot) | ~50s · face-forward b-roll (real-photo anchor + workspace kit) · fresh vertical TSX |

---

## Experiment log

### E01 — Voice lab: 23 samples to find "me" (2026-08-12)

**Question:** which ElevenLabs voice + settings actually sound like Hasan, accent intact?

**Setup:** 23 samples in `media/projects/voice-lab/`, same script, varied across: professional
clone (Hasan-Pro, PVC) vs instant clones (IVC), `eleven_multilingual_v2` vs `eleven_v3`, style /
stability / speed / SSML-break variations, and speech-to-speech chains. Auditioned side-by-side on
a comparison page with per-sample verdict buttons.

**Result:**
- **Only Hasan-Pro on `eleven_multilingual_v2` passed.** Approved: #01 (default), #02 (style .35),
  #12 (SSML breaks), #14 (speed .93). Pipeline pick: **#18 "recipe"** — SSML breaks + style 0.3 +
  speed 0.95 + stability 0.55 + similarity 0.8 (with #12 and #14 as alternates).
- **Every v3 sample failed**, and not because of settings: the Hasan-Pro fine-tuning covers 8
  v2-family models but not `eleven_v3`, so v3 silently falls back to reconstructing the voice from
  raw samples — it drifts to "not him" no matter what. Lesson: **check `fine_tuning_state` before
  blaming your prompt.** (Recheck periodically whether ElevenLabs ships PVC fine-tuning for v3.)
- Both instant clones failed the identity bar. PVC is worth it.
- Long scripts: chunk + stitch via `previous_request_ids` keeps prosody consistent (#21). Emotion
  on v2 is steerable just by *writing* — exclamations, CAPS, ellipses (#19).
- Self-STS (record rough take on phone → convert to Hasan-Pro, #22/#23) works mechanically;
  verdict pending.

**Cost:** a few dollars of ElevenLabs credits. **Verdict: LOCKED** — this is the voice until
something beats it in a blind A/B.

### E02 — Per-clip avatar models on fal.ai (2026-08-12)

**Question:** image + audio → talking me. Which model keeps my face?

**Setup:** same reference image + same ElevenLabs VO through four models on fal
(`media/projects/video-1/ai-self-test/`, ~10s landscape clips, request JSONs saved alongside).

**Result (Hasan's ranking):**
1. **OmniHuman v1.5** (`fal-ai/bytedance/omnihuman/v1.5`, $0.16/s, 1080p, <30s per gen) —
   **identity winner**, used for the real Short.
2. **Kling AI Avatar v1 Pro / v2 Pro** ($0.115/s) — most expressive and alive, but borderline
   theatrical; expressiveness ≠ identity.
3. **Aurora** (`fal-ai/creatify/aurora`, $0.14/s, 720p) — decent.
4. **InfiniteTalk** — weakest; identity drift, 720p.

**Gotchas worth money:** fal rejects base64 audio — upload to fal CDN first
(`POST rest.fal.ai/storage/upload/initiate`). Aurora outputs yuv444p H.264 that Windows can't
play — always re-encode to yuv420p. These models follow the *input image's* aspect ratio: for
vertical you need a 9:16 reference (we outpainted a selfie with Nano Banana Pro →
`media/projects/short-ai-test/ref-vertical.png`; it kept identity well).

**Cost:** ≈$6 total. **Verdict: OmniHuman v1.5 is the baseline to beat.**

### E03 — The ShortAiTest proof: hiding the AI in the cut (2026-08-12)

**Question:** can an AI-Hasan carry a whole Short *today*?

**The trick (this is the key idea):** don't let the avatar hold the screen. A ~40s vertical Short
where AI-Hasan appears only in **2–4s bursts** (~15s total) between full-screen animated beats
(80–90% of runtime). Viewers never get enough continuous face-time to detect the AI. Each camera
burst is generated separately, so a bad one is independently re-rollable.

**Built:** `remotion/src/shots/short-ai-test/ShortAiTest.tsx` (+ an Aurora variant), per-beat VO in
`media/projects/short-ai-test/vo/`, rendered to `remotion/out/ShortAiTest.mp4`.

**Cost:** ~$2.50 per Short in generation. **Verdict: the format works** — now make the avatar
itself good enough for longer holds.

### E04 — Rechecking the v3 wall, and a harness that survives the machine (2026-08-12, later)

**Question:** before spending on new tools, what's actually still true?

**Checked the voice first.** Queried Hasan-Pro's fine-tuning state live. It reports eight
fine-tuned models — `eleven_multilingual_v2`, `eleven_turbo_v2`/`v2_5`, the flash family — and
**`eleven_v3` is still not among them.** So the v3 drift from E01 has not been fixed by the
platform; v3 would still fall back to raw-sample reconstruction. The locked v2 recipe stands.
(Also confirmed: the accent label `en-arabic` is intact, and `eleven_multilingual_sts_v2` shows
`not_started`, meaning speech-to-speech runs off the base clone rather than the fine-tune —
worth remembering when judging the STS samples.)

**Then built the driver.** `tools/gen_avatar.mjs` — one command to run any avatar or lipsync
endpoint on fal: uploads local files to the fal CDN (base64 audio is rejected, the mistake that
cost us a session), submits, polls, downloads, optionally re-encodes to yuv420p for the models
that emit unplayable yuv444p, and writes a `.fal.json` receipt next to every clip so any result
can be traced to its exact inputs. It's Node rather than Python because this machine has no
Python — a deliberate twin of `tools/gen_video.py`.

**Then hit a wall worth publishing:** the first real generation returned
`User is locked. Reason: Exhausted balance.` **The fal account is out of credit.** Nothing
generates until it's topped up. Cheap lesson: smoke-test your harness on the *cheapest possible
call* before planning a twenty-clip matrix around it.

**Cost:** $0 (nothing generated). **Verdict: harness ready, wallet isn't.**

### E05 — The Block 30 pilot: one X post → one Short, end to end (2026-08-13)

**Question:** can the whole Shorts factory run gate-by-gate on a real post — script → voice →
visuals → comp → SFX → final — and what does the format actually lock as?

**Setup:** Block 30 (latency percentiles) from the X repo. Four human gates: script lock, VO
audition, identity verdicts, final watch. Everything logged in
`videos/short-blocks-30/work/cost-log.md`.

**What happened, in order:**
- **Script:** Hasan took hook V2 (the scenario/proof-beat exception, not the default angle
  line) — evidence the "sanctioned exception" rule earns its place. Runtime came out ~51s vs
  the 35–40s target once recipe #18's pacing met the locked words; Hasan chose to ship ~50s
  and let retention data judge. **The 35–40s anatomy number was a guess; the pilot's real
  number is ~50s.**
- **VO:** recipe #18, 7 beats, zero re-rolls. Prosody stitching via `previous_request_ids`
  across beats worked. New tool: `tools/gen_vo.mjs`.
- **Cams:** OmniHuman v1.5 off the synthetic selfie ref, 3 bursts, ~$1.12. **All passed
  Hasan's identity bar.**
- **B-roll was the drama.** v1 followed the plan's faceless-first hypothesis (over-shoulder /
  from-behind, Nano Banana still → Kling i2v). At the final watch Hasan killed it: **he wants
  his face ON screen in b-roll — "more personal, connects with me."** The faceless-first
  hypothesis is dead. v2 (face-forward, still anchored to the *synthetic* selfie) failed
  identity — one AI-generated selfie can't hold a face through scene generations; drift
  compounds. **The fix that locked: a REAL photo.** Hasan dropped one real webcam photo into
  `media/library/faces/`, and every generation re-anchored to it passed on the next try.
- **The workspace is now a kit.** Hasan's actual room (grey-blue wall, dracaena, AC unit,
  white desk) became a reusable no-people set plate — `media/library/workspace/w3-establishing.png`
  — generated from his real photo. First draft was rejected as "too impressive" (fairy lights,
  curated shelf): **generated workspaces drift Pinterest-ward unless you prompt for ordinary.**
- **Tool finding:** the `google-sdk-gen-img` skill (Antigravity CLI, free on the Google Ultra
  sub) generates people-free plates fine but **consistently fails when a person photo is a
  reference** (silent denials + capacity errors). Person stills go through the metered Gemini
  API (`tools/gen_thumbnail.py`, ~$0.13/still); set plates stay free on the sub.
- **Diagram verdict:** fresh vertical TSX rebuild of the square's computed core (narration-
  timed) over embedding the rendered square. The X furniture and self-timed loop killed the
  reuse option.
- **SFX:** 8 cues, all from the shared library, one layered hero on the name stamp. Cue sheet
  approved unchanged at the audit gate.

**The locked b-roll recipe (v3):** real photo (identity, ref 1) → `w3` set plate (ref 2) →
best prior person-still (composition cascade, ref 3) → Nano Banana still → Hasan verdicts the
STILL → Kling 2.5 turbo animates 5s ($0.35) with "static camera, subtle motion, no scene
change" prompts. Kling held face and room through motion with zero morphing.

**Cost (whole pilot, including the failed v1/v2 b-roll iterations):** fal **$2.86** (cams
$1.12, b-roll $1.74) + Gemini ~$1.43 + ElevenLabs pennies. A clean production run without the
pilot's experiments prices at **≈ $2.20/Short**.

**Verdict: FORMAT LOCKED at Gate 4 (2026-08-13).** Cam bursts: all passed. B-roll: face-forward
in the real-room set, image-first with the still gate before any video spend. The factory can
scale in waves of 5.

---

## The landscape, mid-2026 (research pass)

Four research fronts, then every load-bearing price and endpoint verified by hand against the
vendor's own pages. Full scored comparison and the test plan:
**https://claude.ai/code/artifact/b7fb1060-38e9-4a1a-aa7a-d407db4feb76**

**1. Per-clip generation: OmniHuman has no successor, but it has a challenger.** There is no
OmniHuman 2.x. What changed is **LongCat-Video-Avatar 1.5** (Meituan), the only model with a
published head-to-head claim against OmniHuman 1.5 on *identity preservation specifically* — a
61.1% human-preference win over 500+ cases including English, with identity holding across an
82-second clip in an independent hands-on. It's on fal today at $0.30/s for 720p. The catch: **no
1080p at all.** Also newly interesting: **Kling AI Avatar v2 Standard** at $0.0562/s — a third of
OmniHuman's price, and its documented weakness is *stiffness*, which is the exact opposite of the
theatricality complaint that knocked out Kling Pro.

**2. Trained-avatar platforms: one filter eliminates most of the field.** Since we already own a
professional ElevenLabs clone, the only question that matters is *can I feed it my own audio?* That
one filter kills Captions.ai (no audio parameter at all, and no documented way to use your own twin
via API — stock actors only), Synthesia (unconfirmed, plus a live in-app consent recording that
breaks CLI automation), and D-ID ($5.90/min for a model built for real-time agents). **HeyGen
Avatar V** survives cleanly on all four criteria: BYO audio via `voice.type: "audio"`, your own
avatar addressable by `avatar_id`, native 9:16, $3/min — and it trains from a **15-second phone
selfie in about 90 seconds**. Argil is cheaper per minute (~$1.10–1.50) and purpose-built for
vertical short-form, but caps BYO audio at 20 seconds per segment, so narration has to be chunked
and stitched — and segment boundaries are exactly where lipsync artifacts live.

**3. Lipsync on real footage may be the identity cheat code.** The argument is structural, not
empirical: with image-to-video the model *reconstructs* what you look like every frame, so identity
is an inference that can be subtly wrong in a hundred ways. With lipsync on real footage there is
no identity to drift, **because the footage is you** — the generated surface is confined to a mouth.
The failure mode trades places rather than vanishing: the risk becomes the *seam*, and it gets worse
the more of the frame your face fills. The number that decides it, from sync's own docs: lipsync-2
and lipsync-2-pro generate faces at **512×512**, with an explicit hedge that large faces "may notice
some resolution differences." A face filling a 1080×1920 vertical frame is that case. So the cheap
tier is disqualified before we start, and the real contenders are **sync-3** (native 4K, whole-shot
generation) and — the surprise of the research — **HeyGen's `/v3/lipsyncs`**, a first-class
lipsync endpoint that is neither translation nor avatars, at $4/min precision mode, 9:16 confirmed,
watermark off by default, and **no consent-video gate** (that applies to their Digital Twin product,
not this one). It also uniquely offers `start_time`/`end_time` to redub *only* seconds 42–58 of a
take and leave the rest byte-identical — which maps straight onto this repo's `cuts.json` model.

**4. Voice: the recipe holds — and de-accenting turns out to be an industry default, not an
ElevenLabs defect.** `eleven_v3` still isn't fine-tuned on Hasan-Pro (see E04), and the model
roster confirms why: v3 reports `can_be_finetuned: false` outright. `eleven_multilingual_v2` is
*not* deprecated, so the locked recipe is safe to build on, and **nothing found justifies changing
it.**

The reframe is worth more than any vendor comparison. Two peer-reviewed 2026 studies found that
cloned voices get rated *more intelligible than the original speakers*, with the effect
significantly larger for accented speech — the statistical fingerprint of an accent being sanded
off. A second paper, "Voice Cloning is Style Transfer", measured speaker distinguishability
collapsing from 85% to 53% as clones drift toward dominant Anglophone varieties. Two consequences:
in the one study that tested it head-to-head, **ElevenLabs measured *best* on accent retention** of
the systems compared, so the incumbent isn't the weak link; and **embedding similarity metrics
provably fail to detect accent loss** even when listeners hear it plainly. Every vendor similarity
score is inadmissible here, and the public speech leaderboards rank blind *naturalness* — the exact
axis that pulls a voice toward generic American English. Judging by ear isn't a limitation of this
process. It's the only valid instrument that exists.

**The free win hiding in the locked stack:** `eleven_multilingual_sts_v2` *can* be fine-tuned, but
on Hasan-Pro it reads `not_started`. The self-STS chain (samples 22/23) has therefore been running
on raw-sample reconstruction — **the identical root cause as the v3 drift already rejected by ear.**
There's an endpoint that may train it at no cost. Not fired yet: the docs say only "starts PVC
training process for a voice" and are silent on whether it touches the eight existing fine-tunes,
and Hasan-Pro is the one asset that passed the bar. That's a decision for Hasan, not a default.

**Two rivals earn an experiment.** **Cartesia** is the only structural rival — a genuine 30-min-plus
fine-tune, an explicit "Arabic English" accent target nobody else surfaces, ~3× cheaper per million
characters, and clones that **carry forward to future models**, which is precisely the trap v3
sprang. ($49/mo; its voice changer retires 20 Aug, so it's a TTS-only bet.) **Camb.ai** is worth a
free hour purely because it's the only service anywhere exposing a `maintain_source_accent` switch
plus a Levantine dialect — one A/B of that flag teaches more about this specific accent than
anything published. Ruled out for instructive reasons: **MiniMax** ships a "Fluent LoRA" built to
make non-native recordings sound fluent; **Inworld** normalizes accent by design; **Chatterbox** has
two open unanswered accent bugs and watermarks output; **Qwen** defaults to American; **PlayHT is
dead** and users lost clones with no export. Re-check in six months: **Zonos2**, which topped the
only quantitative accent-retention benchmark found, at 99% of the human ceiling.

### What the research honestly could not find

No verifiable example of an accented, non-US creator shipping full avatar videos — and no credible
first-hand account of anyone cloning **Arabic-accented English** on any voice platform either. This
use case is publicly unvalidated, which is either a warning or a content opportunity. The published
layer of this topic is almost entirely SEO review-farm content — one fabricated benchmark
("Dubly.AI 96.4 vs HeyGen 76.8") is quoted across a dozen sites with no methodology and no dataset
anywhere. We discarded it rather than repeat it. **The one hard finding is unwelcome and directly
relevant:** platforms trained mostly on neutral American/British English misread phonemes on
non-native inflection and map the wrong mouth shapes, with reported lipsync quality dropping
**20–30% for Arabic-influenced speech**. The accent is a *lipsync* risk, not only a voice risk.
Watch the mouth on plosives.

### Ruled out, and why it's worth knowing

**Sora 2 cameos** never shipped to the API and face uploads were banned at the API level in early
2026. **Veo 3.1** holds identity well but generates its own speech from prompt text — no way to
drive it with your voice clone. **Runway Act-Two** is the cheapest and arguably highest-fidelity
thing in the whole survey, but it lipsyncs to a *driving performance video*, so you'd have to
re-perform every burst to playback — which defeats automation entirely. **Higgsfield** is an
aggregator reselling models you can call directly on fal for less. The pattern: three of the most
impressive video models in the world are useless here for the same boring reason — they won't take
your audio as input.

---

## Next: the matrix

Eight candidates, same 9:16 reference, same Hasan-Pro narration, same script, two clips each — a
4-second burst (the real format) and a deliberately unfair 12-second hold (to find where each one
breaks). About $26 of fal generation plus a $5 HeyGen wallet. Blocked on three things: the fal
top-up, a real 15–25s vertical clip of Hasan (this repo has none — raw footage is git-ignored), and
sign-off on the one new signup.

---

*Receipts live in this repo: `media/projects/voice-lab/`, `media/projects/video-1/ai-self-test/`,
`media/projects/short-ai-test/`, `remotion/src/shots/short-ai-test/`. Raw footage and rendered
outputs are git-ignored; the configs and plans that reproduce them are committed.*
