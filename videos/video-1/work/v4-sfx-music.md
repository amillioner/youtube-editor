# video-1 — v4: SFX + music pass (separate stems + silent 4K picture track)

Everything below is delivered as **separate tracks for CapCut**, all starting at master 0.000
and all exactly **931.900s / 44,731,200 samples** so they line up at zero with no nudging.

| deliverable | what it is |
|---|---|
| `output/video-4k-silent.mp4` | the composited picture, 3840x2160 @60000/1001, **no audio** |
| `output/voice-track.wav` | **the master cut's voice**, unprocessed, -17.6 LUFS. Required: the picture ships SILENT, so the voice has to be its own track |
| `output/sfx-track.wav` | 120 cues at master time, silence between, 48k/24-bit stereo, **no ducking** |
| `output/music-track.wav` | the 10-section bed, same format, **no ducking** |
| `output/pickup-side.wav` | the owed voice graft, padded from 0 so it drops in at zero |
| `output/pickup-side-bare.wav` | the same 0.52s word alone, for manual placement at 857.640 |
| `output/scratch-audition-v4.mp4` | SCRATCH: preview + all three stems at the recommended levels, for listening only |

Reproduce any stem with `venv/Scripts/python tools/make_stems.py videos/video-1 --all`.

## THE CLOCK (read this before touching any cue)

`timeline.json` shot **spans** (`master_in_s`/`master_out_s`) are the CURRENT clock.
The cue seconds inside `timeline.json` **notes** and inside the **shot headers** are the **v1 clock**
and are stale. Conversion, verified against `edited-transcript.json` across the whole video:

```
v1_note_time  <   3.787117            ->  current = note                 (before the V2 splice)
v1_note_time  in [4.955, 352.085)     ->  current = note - 1.167833      (V2 only)
v1_note_time  >=  353.920             ->  current = note - 3.003000      (R7 + V2)
```

Spot-proofs: note `'AI slop' 28.81` -> 27.645 = the word's exact start · note `mind-reader 355.83`
-> 352.827 vs word 352.830 · note `'Okay,' 883.74` -> 880.737 vs word 880.740.

## SFX — how the cues are placed and levelled

Two things were measured rather than assumed, and both changed the result:

### 1. Alignment is to the clip's AUDIBLE moment, not its file start

Every clip was profiled for its own onset and peak. Placing a clip at the beat puts its *file*
start there, which is wrong for anything that does not begin at full level:

| clip | onset | peak | correction applied |
|---|---:|---:|---|
| `whoosh-reverse` | 0.145s | **0.815s** | peak-aligned: starts 0.815s BEFORE the beat, or its climax lands most of a second late |
| `riser-soft` | 0.820s | **1.225s** | peak-aligned: starts 1.225s before the beat |
| `ui-toggle-on` | 0.105s | 0.105s | onset-aligned: 105ms of lead-in would have put the signature click late |
| `ui-send` | 0.165s | 0.250s | onset-aligned |
| `whoosh-wind` | 0.045s | 0.210s | peak-aligned (0.210s) |
| `whoosh-soft` | 0.005s | 0.090s | peak-aligned (0.090s) |
| everything else | ~0 | ~0 | onset-aligned, correction under 15ms |

The plan therefore records **`beat_s`** (the visual/word moment) and **`at_s`** (the playback start,
= `beat_s` - offset) separately, plus an `align` field. **Edit `beat_s`, then re-run the
recalibration** - editing `at_s` by hand silently breaks the relationship.

### 2. Gains are per-CLIP constants set from measured level, not per-cue

Each clip's window-RMS at unity gain was measured, then gain set so every cue of a given FUNCTION
lands at the same absolute level. Per-clip and not per-cue on purpose: a cue tuned against a loud
passage spikes in the next pause.

| class | target window-RMS | clips | measured result |
|---|---:|---|---|
| gag | -20 dBFS | `zap-electric` (+8.0), `sting-scare-comic` (+3.2) | -20.0 / -22.0 |
| hero | -22 dBFS | `impact-deep-soft` (-4.9) | -22.0 |
| payoff | -24 dBFS | `impact-soft` (-5.6), `stamp-hit` (-5.9), `chime-reward` (-2.5) | -24.0 |
| transition | -27 dBFS | `whoosh-soft` (-8.6), `whoosh-wind` (-6.2), `whoosh-reverse` (-4.4), `riser-soft` (-6.4) | -27.0 |
| snap | -30 dBFS | `pop-reveal` (-8.0), `ui-click-soft` (-2.9), `ui-send` (-4.9), `trap-snap` (-7.5), `ui-toggle-on` (-2.5) | -30.0 (except below) |

**One clip misses its target: `ui-toggle-on` lands at -34.8 dBFS, ~5 dB under the other snaps.**
It catalogs at -27.9 LUFS (8 dB below the library norm) and is already peak-limited at -1.5 dBFS,
so it cannot be raised without clipping. It is the *signature motif* (`approve` at 336.755 and
585.592), so it is the one cue most likely to want re-generating at a healthier level.

First pass had the gags at -2 dB, which measured **+0.1 dB** over the voice - inaudible. Brand §10
sanctions positive gain for meme gags and that is what the measurement forced.

### Verification (measured on the finished stem, not the plan)

- **Length**: 931.900000s / 44,731,200 samples. **Peak -3.8 dBFS**, mean -37.9 dB - no clipping.
- **Alignment**: 114/120 cues detected within +/-12ms. The 6 flagged are the detector's threshold
  disagreeing with the profiler's on soft-attack clips, not placement error - `adelay` is
  sample-exact and every cue was shifted by exactly its profiled offset.
- **Audibility in the window each cue actually lives in:**

| cue | window | voice | sfx | lift |
|---|---|---:|---:|---:|
| zap 1/3 62.780 | gap before 'No,' | -21.4 | -20.0 | **+3.8 dB** |
| zap 2/3 82.990 | gap before 'No,' | -41.4 | -19.9 | **+21.6 dB** |
| zap 3/3 400.843 | under 'shock?' | -20.4 | -20.0 | **+3.3 dB** |
| scare sting 801.464 | under 'scary.' | -18.8 | -20.6 | **+2.2 dB** |
| HERO B morph 847.280 | the pause before 'same voice' | -47.6 | -17.5 | **+30.1 dB** |
| HERO A 60.546 | gap before 'Yes,' | -19.8 | -22.7 | +1.8 dB |
| HERO D 908.264 | under 'you,' | -20.2 | -21.2 | +2.5 dB |
| HERO C 549.131 | under 'online.' | -18.0 | -21.8 | +1.5 dB |
| B14 payoff 875.927 | under 'all' | -15.9 | -21.8 | +1.0 dB |

The clicks and whooshes measure +0.1..+0.9 dB against continuous speech. That is arithmetic, not a
fault: a cue 10-13 dB under the voice cannot add more, and brand §10's own level table lands
exactly there. They are felt-not-heard by design and the ear separates them by timbre. Do NOT
chase them with gain - they would spike in the next pause.

## SFX — the cue sheet (120 cues, 7.7/min)

`beat` = the visual/word moment · `at` = playback start · **NEW** = generated this pass.


### Section 1 — Cold open / the problem  (0s -> 91s)

| beat | at | shot | sound | gain | src | cue |
|---:|---:|---|---|---:|:-:|---|
| 3.931 | 3.841 | B1ColdOpenReal | `whoosh-soft` | -8.6 | lib | cut into the X screencast on 'Let's say' 3.917 |
| 8.233 | 8.218 | B1ColdOpenReal | `ui-click-soft` | -2.9 | lib | X reply box opens on 'posts' |
| 9.917 | 9.902 | B1ColdOpenReal | `ui-click-soft` | -2.9 | lib | Gmail compose opens on 'emails.' |
| 12.032 | 11.942 | B1ReplyCompare | `whoosh-soft` | -8.6 | lib | cut to the A/B reply compare ('We have the same post' 12.099) |
| 27.645 | 27.645 | B1ReplyCompare | `stamp-hit` | -5.9 | lib | verdict lands on 'AI slop.' |
| 29.762 | 29.747 | B1ReplyCompare | `ui-click-soft` | -2.9 | lib | figure 1 on '16 seconds' |
| 31.992 | 31.977 | B1ReplyCompare | `ui-click-soft` | -2.9 | lib | figure 2 on 'twice a year' |
| 33.372 | 33.357 | B1ReplyCompare | `ui-click-soft` | -2.9 | lib | figure 3 on '$700 a month' |
| 59.190 | 57.965 | B1BrainReveal | `riser-soft` | -6.4 | lib | HERO A build: link draws / brain node / stamp |
| 60.546 | 60.546 | B1BrainReveal | `impact-deep-soft` | -4.9 | lib | HERO A drop: stamp on 'brain.' 60.546 |
| 62.780 | 62.780 | B1ShockClip1 | `zap-electric` | +8.0 | **NEW** | GAG 1/3 - the zap fires 0.30s into the clip, before 'No,' 62.952 |
| 82.990 | 82.990 | B1ShockClip2 | `zap-electric` | +8.0 | **NEW** | GAG 2/3 - clip snaps in already zapping (jumper clamps) |

### Section 2 — The warning (proof)  (91s -> 132s)

| beat | at | shot | sound | gain | src | cue |
|---:|---:|---|---|---:|:-:|---|
| 100.232 | 100.142 | B15ContextPackGaps | `whoosh-soft` | -8.6 | lib | cut into the real context pack |
| 105.709 | 105.694 | B15ContextPackGaps | `impact-soft` | -5.6 | lib | warn sweep on 'Do not invent this number.' |
| 118.179 | 118.164 | B15ReadThatAgain | `impact-soft` | -5.6 | lib | 'Read that again.' full-screen lands on the word |
| 129.301 | 128.486 | B15Opposite | `whoosh-reverse` | -4.4 | lib | the flip on 'This project does the opposite.' |

### Section 3 — What it is / the naming  (132s -> 198s)

| beat | at | shot | sound | gain | src | cue |
|---:|---:|---|---|---:|:-:|---|
| 146.635 | 146.635 | B2NameLockup | `pop-reveal` | -8.0 | lib | the product name rises on 'BrainOutside.' |
| 151.691 | 151.676 | B2KnowsList | `ui-click-soft` | -2.9 | lib | pill 1 'how I write' |
| 153.456 | 153.441 | B2KnowsList | `ui-click-soft` | -2.9 | lib | pill 2 'what I believe' |
| 154.821 | 154.806 | B2KnowsList | `ui-click-soft` | -2.9 | lib | pill 3 'my philosophy' |
| 156.024 | 156.009 | B2KnowsList | `ui-click-soft` | -2.9 | lib | pill 4 'my projects' |
| 170.032 | 169.822 | B2bMirrorOutside | `whoosh-wind` | -6.2 | lib | glide into the mirror-outside diagram |
| 191.117 | 191.102 | B2bDisagreeMyself | `impact-soft` | -5.6 | lib | payoff on 'weird.' |

### Section 4 — The repo, two heads  (198s -> 279s)

| beat | at | shot | sound | gain | src | cue |
|---:|---:|---|---|---:|:-:|---|
| 197.632 | 197.542 | B3RepoEscalation | `whoosh-soft` | -8.6 | lib | cut in: 'And the idea is really simple.' |
| 211.164 | 211.164 | B3RepoEscalation | `pop-reveal` | -8.0 | lib | escalation lands on 'GitHub repo' |
| 227.432 | 227.222 | B3TwoHeads | `whoosh-wind` | -6.2 | lib | glide into THE two-heads diagram |
| 232.715 | 232.700 | B3TwoHeads | `impact-soft` | -5.6 | lib | reveal on '2 heads' |
| 235.423 | 235.408 | B3TwoHeads | `ui-click-soft` | -2.9 | lib | head 1 on 'local,' |
| 242.878 | 242.863 | B3TwoHeads | `ui-click-soft` | -2.9 | lib | head 2 on 'online.' |
| 262.451 | 262.436 | B3OnlineAccess | `ui-click-soft` | -2.9 | lib | 'MCP' attaches to the online head |
| 263.734 | 263.719 | B3OnlineAccess | `ui-click-soft` | -2.9 | lib | 'API' attaches to the online head |
| 277.381 | 277.366 | B3SameBrain | `impact-soft` | -5.6 | lib | section resolves on 'anywhere.' |

### Section 5 — The local build  (279s -> 404s)

| beat | at | shot | sound | gain | src | cue |
|---:|---:|---|---|---:|:-:|---|
| 287.032 | 286.942 | B5TemplateRepo | `whoosh-soft` | -8.6 | lib | cut in: 'You just open the template repo' |
| 291.190 | 291.175 | B5TemplateRepo | `ui-click-soft` | -2.9 | lib | click 'Use this template' |
| 304.693 | 304.678 | B5TwoSkills | `ui-click-soft` | -2.9 | lib | mind-feeder on 'writes' |
| 307.037 | 307.022 | B5TwoSkills | `ui-click-soft` | -2.9 | lib | mind-reader on 'reads.' |
| 308.832 | 308.742 | B5bFeedPaste | `whoosh-soft` | -8.6 | lib | cut in: 'Watch what feeding looks like.' |
| 319.060 | 318.895 | B5cFeedRun | `ui-send` | -4.9 | lib | SEND - the paste goes to mind-feeder |
| 328.201 | 328.201 | B5bProposal | `stamp-hit` | -5.9 | lib | PROPOSAL stamp on 'proposal' |
| 334.038 | 334.038 | B5bProposal | `trap-snap` | -7.5 | lib | MOTIF 1/3 - the GATE shuts on 'stops' |
| 336.860 | 336.755 | B5bProposal | `ui-toggle-on` | -2.5 | lib | SIGNATURE MOTIF - flips teal on 'approve,' |
| 352.297 | 352.207 | B5bReadingPull | `whoosh-soft` | -8.6 | lib | cut in: 'Let's move into reading.' |
| 360.795 | 360.780 | B5bReadingPull | `ui-click-soft` | -2.9 | lib | real note 1 'cost story,' |
| 362.240 | 362.225 | B5bReadingPull | `ui-click-soft` | -2.9 | lib | real note 2 'downtime number,' |
| 364.151 | 364.136 | B5bReadingPull | `ui-click-soft` | -2.9 | lib | real note 3 'my voice.' |
| 376.351 | 376.351 | B5bWhyItMatters | `stamp-hit` | -5.9 | lib | stamp on 'results.' |
| 379.658 | 379.658 | B6LocalDone | `pop-reveal` | -8.0 | lib | teal check on 'It's finished.' |
| 392.177 | 391.967 | B6GiveItADoor | `whoosh-wind` | -6.2 | lib | the wall opens into a door on 'door' |
| 400.843 | 400.843 | B6ShockClip3 | `zap-electric` | +8.0 | **NEW** | GAG 3/3 - the hair pops on 'shock?' |

### Section 6 — The B7 setup run  (404s -> 577s)

| beat | at | shot | sound | gain | src | cue |
|---:|---:|---|---|---:|:-:|---|
| 409.597 | 409.507 | B7VpsPick | `whoosh-soft` | -8.6 | lib | cut in: the setup run begins |
| 416.315 | 416.300 | B7VpsPick | `ui-click-soft` | -2.9 | lib | cheapest plan clicked on 'cheapest' |
| 429.820 | 429.820 | B7CoolifyUp | `pop-reveal` | -8.0 | lib | green status on 'running' |
| 435.979 | 435.964 | B7SevenHundred | `impact-soft` | -5.6 | lib | the one number he quotes: '$700' wipe |
| 449.921 | 449.906 | B7CoolifyDeploy | `ui-click-soft` | -2.9 | lib | New Project |
| 451.864 | 451.849 | B7CoolifyDeploy | `ui-click-soft` | -2.9 | lib | New Resource |
| 459.024 | 459.009 | B7CoolifyDeploy | `ui-click-soft` | -2.9 | lib | Save |
| 468.721 | 468.706 | B7EnvDeploy | `ui-click-soft` | -2.9 | lib | Deploy |
| 477.472 | 477.472 | B7BuildOpen | `pop-reveal` | -8.0 | lib | the wizard paints on 'wizard.' |
| 491.039 | 491.024 | B7Wizard12 | `ui-click-soft` | -2.9 | lib | Create (the repo) on 'create.' |
| 496.915 | 496.900 | B7Wizard3 | `ui-click-soft` | -2.9 | lib | Verify on 'verify' |
| 499.208 | 499.208 | B7Wizard3 | `pop-reveal` | -8.0 | lib | real clone lands on 'clone.' |
| 510.525 | 510.525 | B7ReadOnlyWrite | `trap-snap` | -7.5 | lib | MOTIF 2/3 - the write lock refuses the approved note |
| 516.520 | 516.505 | B7TokenNav | `ui-click-soft` | -2.9 | lib | click the token deep link on 'click' |
| 527.675 | 527.660 | B7TokenPerms | `ui-click-soft` | -2.9 | lib | permission set on 'read and write.' |
| 530.544 | 530.529 | B7TokenPaste | `ui-click-soft` | -2.9 | lib | 'Generate,' the token |
| 534.470 | 534.470 | B7TokenPaste | `pop-reveal` | -8.0 | lib | token pastes and turns green on 'here,' |
| 547.769 | 546.544 | B7Steps56 | `riser-soft` | -6.4 | lib | HERO C build: the build ramp + push into the live dashboard |
| 549.131 | 549.131 | B7Steps56 | `impact-deep-soft` | -4.9 | lib | HERO C drop: status flips on 'online.' - payoff of the whole 165s run |
| 565.183 | 565.183 | B7GuideCta | `chime-reward` | -2.5 | lib | MOTIF - the free guide, teal FREE on 'free' |

### Section 7 — The payoff tour (B8/B9/B10)  (577s -> 703s)

| beat | at | shot | sound | gain | src | cue |
|---:|---:|---|---|---:|:-:|---|
| 579.597 | 579.387 | B8Compose | `whoosh-wind` | -6.2 | lib | cut in: 'Now the part I actually love.' |
| 585.697 | 585.592 | B8Compose | `ui-toggle-on` | -2.5 | lib | SIGNATURE MOTIF callback - 'approve' |
| 588.681 | 588.516 | B8Compose | `ui-send` | -4.9 | lib | teal packet flies UP the local branch on 'push.' |
| 598.450 | 598.450 | B8Compose | `pop-reveal` | -8.0 | lib | the note is 'live' on the online brain |
| 612.499 | 612.484 | B8Compose | `impact-soft` | -5.6 | lib | payoff headline 'One source, two doors.' |
| 619.897 | 619.807 | B9DashboardTour | `whoosh-soft` | -8.6 | lib | cut in: the app tour |
| 626.249 | 626.234 | B9DashboardTour | `ui-click-soft` | -2.9 | lib | page 2 'browser,' |
| 632.753 | 632.738 | B9DashboardTour | `ui-click-soft` | -2.9 | lib | page 3 'graph,' |
| 637.234 | 637.234 | B9DashboardTour | `pop-reveal` | -8.0 | lib | both notes light into the self-hosting lens |
| 643.818 | 643.803 | B9DashboardTour | `ui-click-soft` | -2.9 | lib | page 4 'queue,' |
| 650.660 | 650.645 | B9DashboardTour | `ui-click-soft` | -2.9 | lib | page 5 'consumers' |
| 657.067 | 657.052 | B9DashboardTour | `ui-click-soft` | -2.9 | lib | page 6 'chat.' |
| 670.197 | 670.107 | B10ConnectMCP | `whoosh-soft` | -8.6 | lib | cut in: connecting Claude to the brain |
| 676.013 | 676.013 | B10ConnectMCP | `pop-reveal` | -8.0 | lib | status flips connected, the 9 real tools stream in |
| 693.123 | 693.123 | B10AssembleContext | `pop-reveal` | -8.0 | lib | the context pack panel opens on 'pack' |
| 698.082 | 698.067 | B10AssembleContext | `impact-soft` | -5.6 | lib | callback to 105.709 - warn rail on 'gaps.' |
| 699.542 | 698.727 | B10ThatsTheCall | `whoosh-reverse` | -4.4 | lib | the cold-open callback: B1's reply card returns |

### Section 8 — Use cases + THE LOOP  (703s -> 795s)

| beat | at | shot | sound | gain | src | cue |
|---:|---:|---|---|---:|:-:|---|
| 708.597 | 708.507 | B11WriteAsMe | `whoosh-soft` | -8.6 | lib | cut in: 'back to where we started' |
| 714.852 | 714.837 | B11WriteAsMe | `impact-soft` | -5.6 | lib | indigo wipe on 'as me' |
| 724.176 | 724.176 | B11DrafterNotGhostwriter | `pop-reveal` | -8.0 | lib | 'A drafter.' + indigo wipe |
| 725.460 | 725.460 | B11DrafterNotGhostwriter | `stamp-hit` | -5.9 | lib | 'A ghostwriter.' struck through |
| 733.997 | 733.907 | B12WritingABook | `whoosh-soft` | -8.6 | lib | cut in: 'it's not only for content' |
| 747.286 | 747.196 | B12WritingABook | `whoosh-soft` | -8.6 | lib | the arc travels chapter 9 to 1 on 'contradict' |
| 764.137 | 764.137 | B12EverySession | `pop-reveal` | -8.0 | lib | 'your brain already has it' lands on 'or project.' |
| 768.897 | 768.807 | B13AttachEverything | `whoosh-soft` | -8.6 | lib | cut in: THE RULE |
| 770.940 | 770.925 | B13AttachEverything | `impact-soft` | -5.6 | lib | wipe on 'everything.' |
| 775.913 | 775.898 | B13TheLoop | `ui-click-soft` | -2.9 | lib | node 1 'Read' |
| 777.052 | 777.037 | B13TheLoop | `ui-click-soft` | -2.9 | lib | node 2 'feed' |
| 785.299 | 785.284 | B13TheLoop | `impact-soft` | -5.6 | lib | the circuit CLOSES and runs on 'loop.' |

### Section 9 — The B14 ladder  (795s -> 881s)

| beat | at | shot | sound | gain | src | cue |
|---:|---:|---|---|---:|:-:|---|
| 801.464 | 801.464 | B14ScaryFace | `sting-scare-comic` | +3.2 | **NEW** | GAG 4 - the comic mock-scare peaks on 'scary.' 801.464 |
| 802.197 | 802.107 | B14TodayItsText | `whoosh-soft` | -8.6 | lib | cut in: the base of the ladder |
| 809.974 | 809.959 | B14L1AnyVoice | `ui-click-soft` | -2.9 | lib | rail slot 1 fills on 'voice?' |
| 816.364 | 816.349 | B14L2VoiceClone | `ui-click-soft` | -2.9 | lib | rail slot 2 fills on 'clone' |
| 830.486 | 830.471 | B14L3PhotoWaves | `ui-click-soft` | -2.9 | lib | rail slot 3 fills on 'audio' waves |
| 836.744 | 836.729 | B14L4Lipsync | `ui-click-soft` | -2.9 | lib | rail slot 4 fills on 'lipsync,' |
| 845.920 | 844.695 | B14L5Humanoid | `riser-soft` | -6.4 | lib | HERO B build: under 'And then eventually this-' |
| 847.280 | 847.280 | B14L5Humanoid | `impact-deep-soft` | -4.9 | lib | HERO B drop: THE MORPH at local f80, 0.16s before 'same voice' |
| 859.629 | 859.629 | B14TagHold | `stamp-hit` | -5.9 | lib | the SIMULATED tag drops into the band on 'Okay,' |
| 875.927 | 875.927 | B14SameFolder | `impact-deep-soft` | -4.9 | lib | THE PAYOFF - power pulses root to levels, wipe on 'all' |

### Section 10 — The close / thesis  (881s -> 932s)

| beat | at | shot | sound | gain | src | cue |
|---:|---:|---|---|---:|:-:|---|
| 880.697 | 880.607 | B15CloseFree | `whoosh-soft` | -8.6 | lib | cut in: the close |
| 882.200 | 882.200 | B15CloseFree | `chime-reward` | -2.5 | lib | MOTIF - teal 'free,' |
| 899.994 | 899.979 | B15CloseCommodity | `ui-click-soft` | -2.9 | lib | Claude chip |
| 900.813 | 900.798 | B15CloseCommodity | `ui-click-soft` | -2.9 | lib | Gemini chip |
| 901.375 | 901.360 | B15CloseCommodity | `ui-click-soft` | -2.9 | lib | dashed 'whatever' chip |
| 906.900 | 905.675 | B15CloseOnlyYou | `riser-soft` | -6.4 | lib | HERO D build: 'The only unique thing left...' |
| 908.264 | 908.264 | B15CloseOnlyYou | `impact-deep-soft` | -4.9 | lib | HERO D drop: 'is you.' at 156px + underline wipe |
| 910.993 | 910.993 | B15CloseOnlyYou | `trap-snap` | -7.5 | lib | MOTIF 3/3 - the locked, redacted you.md card |
| 914.044 | 914.044 | B15ClosePutItOutside | `pop-reveal` | -8.0 | lib | THE NAME PAYS OFF - the card UNLOCKS on 'outside' |
| 920.547 | 920.547 | B15CloseOutro | `pop-reveal` | -8.0 | lib | 'Hit like' badge |
| 924.428 | 924.428 | B15CloseOutro | `pop-reveal` | -8.0 | lib | star-the-repo badge on 'GitHub.' |
| 930.239 | 930.224 | B15CloseOutro | `impact-soft` | -5.6 | lib | the BrainOutside lockup, held to the final frame |

## Music — the bed

Library-first: nothing generated. Three things had to be measured:

**1. Every bed fades in and out at its own edges** (tails to -45..-77 dBFS), so a naive
`-stream_loop` butt-loop dips every 63s. Each bed is crossfade-looped across its BODY only.

**2. Finding that body needs a SUSTAINED test.** The first attempt used a single-bin threshold;
one transient inside `cinematic-min`'s quiet intro passed it, so `body_in` came out 0.0 and
**sections 3, 8 and 10 opened on 13 seconds of near-silence.** The fix is a 3s rolling median.

| bed | body window | body RMS | match gain |
|---|---|---:|---:|
| `tech-pulse` | 0.0 -> 57.0s | -21.2 dB | -2.8 dB |
| `ambient-pad` | 12.5 -> 56.5s | -24.7 dB | +0.7 dB |
| `cinematic-min` | 13.0 -> 56.5s | -18.7 dB *(post-compression)* | -5.3 dB |
| `docu-pluck` | 3.0 -> 58.0s | -23.3 dB | -0.7 dB |

**3. `cinematic-min` swings 17 dB** peak-to-trough over 1s windows (felt piano with space between
phrases) against 2.6-7.4 dB for the others, so as a continuous bed it read as dropping out. A
gentle compressor brings it to 9.4 dB. Its makeup gain then made sections 3/8/10 land 5.2 dB hot,
so `body_rms_db` for that bed is the POST-compression figure (-18.7, not the raw -23.9).

| # | section | span | bed | why | rel | **measured median** |
|---:|---|---|---|---|---:|---:|
| 1 | Cold open / the problem | 0.0 -> 91.0 | `tech-pulse` | forward motion under the hook | +0 dB | -23.9 dB |
| 2 | The warning (proof) | 91.0 -> 132.3 | `ambient-pad` | energy drops, the scene turns serious | -3 dB | -27.2 dB |
| 3 | What it is / the naming | 132.3 -> 197.6 | `cinematic-min` | reflective, the concept lands | -3 dB | -26.8 dB |
| 4 | The repo, two heads | 197.6 -> 278.9 | `docu-pluck` | explainer energy under the diagrams | -1 dB | -25.5 dB |
| 5 | The local build | 278.9 -> 404.0 | `tech-pulse` | hands on the keyboard | -1 dB | -24.9 dB |
| 6 | The B7 setup run | 404.0 -> 577.0 | `docu-pluck` | keeps 173s of procedure moving without fatigue | +0 dB | -24.0 dB |
| 7 | The payoff tour (B8/B9/B10) | 577.0 -> 703.2 | `tech-pulse` | confidence, the thing works | +0 dB | -23.9 dB |
| 8 | Use cases + THE LOOP | 703.2 -> 794.7 | `cinematic-min` | reflective again, the thesis is being built | -2 dB | -25.9 dB |
| 9 | The B14 ladder | 794.7 -> 880.6 | `ambient-pad` | spacious and faintly uneasy under the escalation | -2 dB | -26.2 dB |
| 10 | The close / thesis | 880.6 -> 931.9 | `cinematic-min` | felt piano, the emotional close | +1 dB | -23.2 dB |

Every section lands within **0.5 dB** of its intended level (reference -24 dB + the artistic
offset). Loop seams verified notch-free (identical profiles at 455.0 / 506.0 / 557.0s). Section
boundaries all sit in a narration gap, 2.5s equal-power (`qsin`) crossfades, 1.5s fade in at 0,
3.0s fade out to 931.900.

## Levels for CapCut (nothing is ducked in the stems)

Measured: **voice -17.6 LUFS** · music stem **-21.6 LUFS** · SFX stem -23.2 LUFS (gated; it is
mostly silence).

| track | fader | duck under voice | result |
|---|---:|---:|---|
| picture / voice | 0 dB | - | the spine |
| `sfx-track.wav` | **0 dB** | 3-4 dB (optional) | already at final level; the gags are meant to be the loud ones |
| `music-track.wav` | **-7 dB** | **6-9 dB** | ~-34 LUFS under speech, breathing up to ~-28 in the gaps |
| `pickup-side.wav` | 0 dB | - | already RMS-matched to the line |

`output/scratch-audition-v4.mp4` is rendered at exactly these settings if you want to hear it
before committing. It is a scratch artifact - the stems are the deliverable.

## The owed voice graft

`work/pickups/side-0264-492.20.wav` (0.520s) decodes as **raw clip 0264 at its own 492.20s**, not
a master time: `work/analysis/takes-0264.txt` take **#97** reads `[490.55 - 492.60] but maybe
without the spiritual side.` The take that shipped is **#106**, and in the master the final word is
**swallowed entirely** - `edited-transcript.json` ends that sentence at `spiritual.` **856.930 ->
857.605** with no `side` at all.

Envelope at the seam (25ms bins): speech decays through 857.605 -> 857.66, room-tone floor
(~-48 dB) until 858.06, `Looks` starts at **858.199** (energy from 858.075). A **0.40s** hole.

**Graft placed at master 857.640**, gain **+1.5 dB**. The level was checked word-for-word, not
phrase-for-phrase: against the whole phrase `maybe without the spiritual` the pickup looked 6.3 dB
down, but against the single word `spiritual.` (-21.5 dB) it is only 1.4 dB down - a phrase match
would have overshot by ~5 dB. Its body runs 0.00 -> 0.44s so it occupies 857.64 -> 858.08; only its
-40 dB tail touches the onset of `Looks`. Starting at 857.640 rather than 857.660 lets the attack
overlap the decaying `-al` of `spiritual`, which is how `spiritual side` joins in connected speech.

**The master is not spliced.**

## The 4K picture track

**All 77 shots were re-rendered at scale 2.** They had been rendered at 1080p for the preview
workflow, and **74.5% of the runtime is TSX cutaway** - upscaling the 1080p bake would have been
three-quarters fake 4K. `render-all.mjs` already defaults to scale 2, so no TSX changed.

**The 4K master's PTS clock is wrong and had to be rebuilt.** `master-natural.mp4` carries 55872
frames, which at a true 60000/1001 is 932.1312s, but its last video PTS is **931.2126s** - the
hevc_nvenc fast-stamp the v3 log warned about. `bake.py` seeks the master by TIME, so baking
against it would have drifted the picture ~0.9s ahead of the audio by the end and desynced every
stem. Two fixes were tried and measured:

| attempt | last video PTS | error vs true 932.1145 |
|---|---:|---:|
| original `master-natural.mp4` | 931.2126 | **-0.902s** |
| `-r 60000/1001` + `-c:v copy` | 931.2459 | -0.869s (a stream copy keeps the container's stamps; `-r` is ignored for mp4 demuxing) |
| annexb elementary-stream remux | 932.0311 | -0.083s (5 frames still short) |
| **`setpts=N/(60000/1001)/TB` + NVENC re-encode** | **932.114517** | **0.000s** |

`output/master-natural-4k-cfr.mp4` (8.4 GB) is that corrected master: 55872 frames kept,
`avg_frame_rate` exactly 60000/1001, video duration == audio duration == 932.131s. NVENC works
again after the reboot the v3 log asked for, so this is a GPU encode, not libx264.

**Content was verified, not assumed.** A frame was pulled at seven master timecodes from each
candidate and compared against `master-natural-h264.mp4` (the trusted true-CFR 1080p comp source),
both scaled to 480x270, mean absolute luma difference:

| master t | raw 4K | **CFR 4K** |
|---:|---:|---:|
| 20s | 3.49 | **0.48** |
| 100s | 5.55 | **0.51** |
| 300s | 13.28 | **0.51** |
| 500s | 12.24 | **0.48** |
| 700s | 15.56 | **0.50** |
| 900s | 16.31 | **0.50** |
| 930s | 15.07 | **0.47** |

The raw file drifts away as time advances; the CFR file is flat at ~0.5 (residual scaling/codec
noise between a 4K->480 and a 1080p->480 downscale) at every timecode. Same frame throughout.

`work/timeline-4k.json` is GENERATED from `work/timeline.json` so the two cannot drift - only the
preview block and the master path differ. `bake.py` gained two backward-compatible knobs it needed
for this: `preview.vcodec_seg` / `preview.vcodec_out` (its hardcoded libx264 is hours per pass at
4K60, and it encodes twice) and `preview.audio: false`.

### The baked picture track — verified

`output/video-4k-silent.mp4`: 3840x2160, **60/1**, **55914 frames = 931.900000s**, 2.05 GB,
**video stream only** (no audio track at all, not a silent one). Same length and same clock as the
three WAVs, so all four drop onto the timeline at zero.

It is a true **60.000** fps file, not 59.94: the master's 55872 frames at 60000/1001 are resampled
to 55914 slots (~42 duplicated frames, one per ~22s, invisible on talking-head content). That is
deliberate - it locks the picture to the 931.900s wall clock the stems use.

**Frame accuracy, measured against its own master** (`master-natural-4k-cfr.mp4`) at 12
master-passthrough timecodes spread across the runtime, mean absolute luma difference at 480x270:

| master t | 53 | 115 | 183 | 281 | 346 | 408 | 479 | 553 | 618 | 704 | 766 | 888 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| diff | 0.19 | 0.22 | 0.17 | 0.13 | 0.21 | 0.47 | 0.19 | 0.20 | 0.14 | 0.14 | **3.37** | 0.17 |

Eleven are sub-frame and, critically, **flat from 53s to 888s - there is no cumulative drift**.
The two apparent outliers were probed by sliding the bake +/-3 frames against the master:

- **766.0** - the master's own frame-to-frame motion there is 3.06-3.36, and the bake reads 3.37 at
  offset 0 and 3.09 at +1. The minimum is flat and inside the motion yardstick: no real offset,
  just a fast-motion frame.
- **100.0** - the master itself changes by 15.69 between 99.967 and 100.000 (a hard visual change),
  so a one-frame difference reads enormous. The bake sits **1 frame (16.7ms)** early there.

So the picture is **sub-frame accurate away from segment boundaries and within +/-1 frame (16.7ms)
at them, with zero drift**. That +/-1 frame is inherent to `bake.py`'s method (`round(b*FPS) -
round(a*FPS)` per segment, plus `fps=60` resampling a 59.94 source) and is the same tolerance the
1080p preview has always had.

### A note on the shot re-render

`render-all.mjs` logged `ProtocolError: Protocol error (Page.bringToFront): Target closed` 17 times.
It is Remotion's browser-page teardown noise, not a render failure - every shot that emitted it
still wrote its file, all 77 came out 3840x2160, and spot-checked 4K frames (B14L5Humanoid,
B10AssembleContext) are correct. Do not treat it as a failure signal when watching this log.

## The voice track (added after the picture went silent)

Delivering the picture with no audio stream left the voice with nowhere to live - the first build
shipped picture + SFX + music and **no dialogue at all**. `output/voice-track.wav` closes that.

It is taken from the **master** (`master-natural-h264.mp4`, whose audio is a stream copy of the cut)
rather than from `preview-full.mp4`, which is a second AAC generation. Trimmed to 931.900s, upmixed
to dual-mono stereo, otherwise untouched: no level change, no EQ, no de-noise, and **not spliced** -
the "side" pickup stays a separate file per the original instruction.

Verified against the preview's own audio (the track the picture was baked against):

- **best time offset +0.00 ms** - sample-locked to the picture, checked by cross-correlating a loud
  transient at 62.9s over +/-10 ms in 0.5 ms steps.
- **-17.6 LUFS**, identical to `master-natural-h264.mp4` and to `preview-full.mp4`.
- A 1s-bin RMS comparison shows a flat 3.009-3.012 dB difference across all 931 bins. That is an
  artifact of downmixing the stereo stem to mono for the comparison, not a property of the file -
  the constant spread (0.003 dB) proves it is a gain offset in the measurement, and the LUFS figures
  above are equal. Do not "correct" it.

## Music rebuild - per-bed taming

`cinematic-min` swings ~17 dB peak-to-trough over 1s windows (felt piano with space between the
phrases) against 2.6-7.4 dB for the other beds, so as a continuous bed it read as dropping out.
`music-plan.json` now carries an optional per-bed `compress` filter, applied after the loop sum and
before the match gain; `body_rms_db` for such a bed is the POST-compression level.

Re-measured after the rebuild, median 1s RMS inside each section against `reference_rms_db + gain_db`:

| sec | s1 | s2 | s3 | s4 | s5 | s6 | s7 | s8 | s9 | s10 |
|---|---|---|---|---|---|---|---|---|---|---|
| err | +0.1 | -0.3 | +0.2 | -0.5 | +0.2 | -0.0 | +0.1 | +0.1 | -0.2 | -0.2 |

All ten within 0.5 dB, and cinematic-min's swing is now 6.1-6.5 dB, in line with the other beds.

## v4.1 - Hasan's cuts and the FINAL bake

**`output/video-4k-final.mp4`** - picture + voice + SFX, **no music**, 2.03 GB.

### Cues removed on review (4 of 120 -> 116 remain)

| # | at_s | sound | what it was |
|---|---:|---|---|
| 11 | 62.780 | `zap-electric` | GAG 1/3 |
| 12 | 82.990 | `zap-electric` | GAG 2/3 |
| 16 | 128.486 | `whoosh-reverse` | the flip on "does the opposite" (heard at ~2:08 because it is peak-aligned and plays from 128.486) |
| 49 | 400.843 | `zap-electric` | GAG 3/3 |

**All three electrocution gags are gone**, so `zap-electric` is no longer used by this video (it stays
in the library as a generic asset). The only gag left is `sting-scare-comic` at 801.464. Surviving
cues KEEP their original review-sheet ids, so `work/sfx-cue-review.md` stays valid. The removals are
recorded in `sfx-plan.json` under `_removed_v4_1`.

### Two mixing bugs the final bake surfaced

Both were in `alimiter` defaults, and both were caught by measuring the delivered file rather than
trusting the graph:

1. **`level` defaults to TRUE - auto-normalizes back up to the ceiling whenever limiting engages.**
   First bake came out at **+0.4 dBTP** (clipping on decode), and *lowering* the limit made it
   **louder** (-15.5 LUFS, +0.7 dBTP), which is how the bug announced itself. Fixed with
   `level=disabled`; the ceiling is now real.
2. **`latency` defaults to FALSE - the output sits delayed by the limiter's lookahead.** Measured
   at exactly **-239 samples (-4.98 ms), identical at three separate transients** with a sharp
   minimum (79000x error ratio), so it was a real constant delay, not correlation noise. Fixed with
   `latency=true`.

The same two flags were applied to `build_music`, so `music-track.wav` was rebuilt (it carried the
same 239-sample delay; harmless for a bed, wrong all the same).

### Final QA, measured on the delivered file

| check | result |
|---|---|
| container | 3840x2160, 60/1, 55914 frames, **931.900000s** |
| audio | AAC 384k, 48 kHz stereo, 931.900000s |
| loudness | **-17.5 LUFS**, LRA 2.6 LU |
| true peak | **-1.3 dBTP** (inside the -1 dBTP delivery convention) |
| A/V sync | **+0.00 ms at 5 points** spanning 20s to 881s, 1-sample resolution |
| removed cues | all four windows measure -180 dB in the SFX stem |
| kept cues | spot-checked 8 across the runtime, all firing |
| "side" pickup | present: **+27.5 dB** over the un-grafted master in 857.70-858.05 |

### What is in the final that was a judgement call

- **No ducking.** Per-clip gains already sit the SFX under a -17.6 LUFS voice; the clicks add ~+0.1 dB.
- **The "side" pickup IS folded in** at 857.640. The master itself was never spliced.

Rebuild with: `venv/Scripts/python tools/make_stems.py videos/video-1 --final`
(`--with-music` to include the bed, `--no-pickup` to leave the flub in.)
