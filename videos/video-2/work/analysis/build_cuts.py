"""Build cuts.json for video-2 from word-index decisions.

Why word indices instead of hand-typed times: every cut boundary must land in the
QUIET BETWEEN WORDS (cutlib clamps a boundary placed inside speech, which hard-clips),
and keeps must be word-exact so the engine can add its own head/tail. Indices make
both mechanical instead of transcribed by hand.

SPEC format, per clip:  (first_word_idx, last_word_idx, kind, cat, note)
  kind "k" = keep, "c" = cut. cat only for cuts.

Usage: venv/Scripts/python videos/video-2/work/analysis/build_cuts.py videos/video-2
"""
import json
import sys
from pathlib import Path

HUG = 0.12  # how close a cut edge hugs the cut speech, when the gap allows

# ---------------------------------------------------------------- style knobs
# head measured for THIS speaker: onset ramp at atom starts is median 0.07-0.09s,
# p90 ~0.15, max 0.35 (video-1's speaker was 0.18 median, so this one is tighter).
#
# Swept against analyze_cut's hard-entry count (scratchpad/sweep_head.py), both styles:
#   head <= 0.14  ->  2-5 hard entries (lead-in clips late-token word onsets)
#   head 0.15-0.17 -> 0 hard entries
#   head >= 0.18  ->  1 hard entry at 0272@141.70 (the lead-in reaches back into the
#                     decay of the CUT word 'write,' 0.38s earlier)
# So the zero-entry window is narrow and two-sided. tight takes the smallest zero
# value (0.15, cheapest runtime); natural takes the largest (0.17) because more
# breathing room is the whole point of that style.
STYLES = {
    "tight":   {"internal_gap": 0.40, "min_tail": 0.14, "max_tail": 0.40, "head": 0.15,
                "margin": 5.0, "soft_gap": 1.20, "soft_max_tail": 0.90, "soft_margin": 3.0},
    "natural": {"internal_gap": 0.40, "min_tail": 0.26, "max_tail": 0.45, "head": 0.17,
                "margin": 5.0, "soft_gap": 1.20, "soft_max_tail": 0.95, "soft_margin": 3.0},
}

CLIP_FILES = {
    "0270": "raw/DJI_20260813142309_0270_D.MP4",
    "0271": "raw/DJI_20260813142610_0271_D.MP4",
    "0272": "raw/DJI_20260813142800_0272_D.MP4",
    "0273": "raw/DJI_20260813143053_0273_D.MP4",
    "0274": "raw/DJI_20260813143540_0274_D.MP4",
    "0275": "raw/DJI_20260813143841_0275_D.MP4",
    "0276": "raw/DJI_20260813144325_0276_D.MP4",
    "0277": "raw/DJI_20260813144456_0277_D.MP4",
    "0278": "raw/DJI_20260813145010_0278_D.MP4",
}

DURATIONS = {
    "0270": 139.02, "0271": 73.14, "0272": 158.02, "0273": 281.02, "0274": 175.92,
    "0275": 278.02, "0276": 84.42, "0277": 278.62, "0278": 174.42,
}

SPEC: dict[str, list] = {}

# Time-based cuts that cannot be expressed as a word range, because after the
# token-time fixes no token remains inside them. Recorded so cuts.json and the
# editor still show the intent.
EXTRA_CUTS: dict[str, list] = {
    "0272": [
        (55.30, 57.00, "retake",
         "First delivery 'Around 300,000.' — Hasan caught it by ear at ~1:44 of the "
         "natural preview. The ASR had MERGED both deliveries into one token, so no "
         "token remains here after the retime; this span is already excluded as "
         "inter-atom silence and the cut is recorded for the audit trail."),
    ],
}

# ============================================================ 0270 — cold open
SPEC["0270"] = [
    (0, 11, "k", None, "Watch this. A simple 2-line prompt to create a full technical guide"),
    (12, 13, "c", "false_start", "'with my,' — doubled by 14-15; cut the FIRST"),
    (14, 22, "k", None, "with my AI-powered content factory system. Let's run. First,"),
    (23, 25, "c", "false_start", "'it pulls the,' — doubled by 26-27; cut the FIRST"),
    (26, 41, "k", None, "it pulls real search data ... related to the topic."),
    (42, 42, "c", "false_start", "'Then,' abandoned; superseded by 'And now'"),
    (43, 67, "k", None, "And now it rents a real server in Frankfurt ... measuring everything."),
    (68, 70, "c", "false_start", "'Then it's taking—' doubled by 71-73; cut the FIRST"),
    (71, 98, "k", None, "then it's taking its own screenshots ... with numbers it tested itself."),
    (99, 104, "c", "false_start", "'And what's special and super impor—' doubled by 105+; cut the FIRST"),
    (105, 134, "k", None, "And what's really special ... my thoughts, everything about me."),
    (135, 138, "c", "retake", "'Look at this line.' delivered twice back to back; cut the FIRST"),
    (139, 159, "k", None, "Look at this line and this one. This is me talking ... the way I write."),
    (160, 174, "c", "retake", "intro line, superseded in-clip by the 'Another take.' at 125.03"),
    (175, 193, "c", "retake", "intro line take 2; superseded by 0271 ('I will repeat the final section')"),
]

# ====================================================== 0271 — intro, redone
# Take map: A=6-21 (killed by 'Repeat, repeat'), B=24-57 (killed by 'Other take'),
# C=60-75 (killed by 'Other take'), D=78-97 (self-slated), E=98-123 = FINAL.
# The 'In this video' sentence survives only in B (as a doubling), so B's first
# half is kept and its 'And by the end' tail is cut in favour of take E.
SPEC["0271"] = [
    (0, 5, "c", "false_start", "slate: 'I will repeat the final section.' — spoken editor instruction"),
    (6, 21, "c", "retake", "take A of the intro line; killed by the 'Repeat, repeat.' slate at 18.58. NOTE: only take with 'AI-powered' — see flag 1"),
    (22, 23, "c", "false_start", "slate: 'Repeat, repeat.'"),
    (24, 26, "c", "retake", "'In this video,' doubled by 27-29; cut the FIRST"),
    (27, 41, "k", None, "in this video, I'll show you the 5 building blocks of my content factory system."),
    (42, 45, "c", "retake", "take B's 'And by the end,' — superseded by take E"),
    (46, 53, "c", "retake", "take B: 'you'll know exactly how to build your own' — superseded by take E"),
    (54, 57, "c", "retake", "take B: 'for your own niche.' — superseded by take E"),
    (58, 59, "c", "false_start", "slate: 'Other take.'"),
    (60, 75, "c", "retake", "take C of the closing line; killed by the 'Other take.' at 50.52"),
    (76, 77, "c", "false_start", "slate: 'Other take.'"),
    (78, 81, "c", "retake", "take D start: 'And by the end,' — self-slated"),
    (82, 97, "c", "retake", "take D; ends in its own 'another take.' slate"),
    (98, 101, "c", "retake", "take E's doubled 'And by the end,'; cut the FIRST"),
    (102, 123, "k", None, "and by the end, you know exactly how to build one for your own niche. If you are ready, let's get started."),
]

# ================================================== 0272 — the why / backstory
SPEC["0272"] = [
    (0, 9, "c", "false_start", "'Back in 2021, I used to pay like—' + its own 'another take.' slate"),
    (10, 95, "k", None, "Back in 2021 ... Around 300,000 people watched the video."),
    (96, 99, "c", "retake", "'It was fast, yes.' doubled by 'And it was really fast, yes.'; cut the FIRST"),
    (100, 155, "k", None, "And it was really fast, yes ... with the new AI-powered content factory I built,"),
    (156, 160, "c", "retake", "'that you will see today,' doubled by 'and you will see today,'; cut the FIRST"),
    (161, 171, "k", None, "and you will see today, honestly, no writer I ever hired"),
    (172, 175, "c", "retake", "'could do the experiments,' doubled by 'could do the experiments and tests'; cut the FIRST"),
    (176, 181, "k", None, "could do the experiments and tests"),
    (182, 183, "c", "retake", "'and write,' doubled by 'and write like this system'; cut the FIRST"),
    (184, 194, "k", None, "and write like this system. Sorry writers, but this is reality"),
    (195, 198, "c", "retake", "AUDIT: 'and we should adapt' / 'and you should adapt.' — Hasan heard it as a repeat at ~2:21 and asked for the first to go. Was FLAG 3 (defaulted to keeping both as we/you escalation); his call overrides. Clean splice: 2.78s before, 2.73s after."),
    (199, 202, "k", None, "and you should adapt."),
]

# ========================================= 0273 — the 5 blocks + the ebook CTA
# The opener is 6 attempts at 'So how does it actually work?' separated by 5
# slates. Everything before the LAST delivery goes.
SPEC["0273"] = [
    (0, 43, "c", "retake", "5 slated attempts at the opener question ('other take.' x5) + an abandoned 'In simple words, it—'. The delivery at 27.98 supersedes all"),
    (44, 111, "k", None, "So how does it actually work? ... what related content, what other competitors"),
    (112, 137, "c", "retake", "3 attempts at 'what the internet already says', killed by the 'Another take.' slate at 93.04"),
    (138, 177, "k", None, "And what the internet already says about the topic. Number 3, the hands ... much more."),
    (178, 179, "c", "false_start", "'Then we—' superseded by 'then number 4'"),
    (180, 184, "k", None, "then number 4, the lab."),
    (185, 192, "c", "retake", "'In my case, it's like a real server.' doubled by 'In my case, it's a real server.'; cut the FIRST"),
    (193, 273, "k", None, "In my case, it's a real server ... see one piece go through the whole process."),
    (274, 280, "c", "false_start", "'But before that, and speaking—' + its own 'another take.' slate"),
    (281, 288, "k", None, "But before that, and speaking of building blocks,"),
    (289, 302, "c", "retake", "ebook take 1 ('the top 5 engineering building blocks'), killed by the 'Other take.' slate at 209.04"),
    (303, 333, "k", None, "I created a free ebook on the top vibe engineering building blocks ... It's totally free"),
    (334, 343, "c", "false_start", "'and designed in a way that you read and then—'"),
    (344, 356, "c", "retake", "'and designed in a way that you can read and understand.' killed by the 'Other take.' slate at 227.53"),
    (357, 357, "c", "false_start", "'And,' abandoned"),
    (358, 393, "k", None, "and I designed it in a way that you can read and understand one block on each page ... Trust me,"),
    (394, 407, "c", "retake", "two attempts at the 'complete mindset' line, killed by the 'Other take.' slate at 253.40"),
    (408, 427, "k", None, "You'll have a complete mind shift. [Vibe] Coding and Building with AI ... let's continue our work."),
]

# ================================== 0274 — one line in + recon + honest caveat
SPEC["0274"] = [
    (0, 7, "k", None, "Okay, so here's the input. One simple prompt"),
    (8, 9, "c", "false_start", "'about self-hosting—' abandoned lead-in; the prompt text follows"),
    (10, 33, "k", None, "self-host Supabase, focus on the hard parts nobody documents ... no outline, nothing."),
    (34, 54, "c", "retake", "'first building block in the factory system' take, killed by the 'Other take.' slate at 45.16"),
    (55, 56, "c", "false_start", "slate: 'Other take.'"),
    (57, 106, "k", None, "The contract, which is the first step in the content factory system ... what they cover, what they miss,"),
    (107, 112, "c", "retake", "'And look at this, super interesting.' killed by the 'Other take.' slate at 84.94"),
    (113, 114, "c", "false_start", "slate: 'Other take.'"),
    (115, 117, "c", "false_start", "'And look at,' doubled by 'and look at this,'; cut the FIRST"),
    (118, 241, "k", None, "and look at this, really super interesting ... So some ideas just die at step 1, and that's a feature."),
]

# ================================================ 0275 — the plan/stop + the lab
SPEC["0275"] = [
    (0, 0, "c", "false_start", "'If,' doubled by 'if it passes,'; cut the FIRST"),
    (1, 53, "k", None, "if it passes, then it writes a plan ... before I approve the plan and the budget."),
    (54, 60, "c", "retake", "'After I approve, the fun part starts.' doubled by 'I approve, and now the fun part.'; cut the FIRST"),
    (61, 98, "k", None, "I approve, and now the fun part ... so I use it as my lab."),
    (99, 127, "c", "retake", "2 broken attempts at the clone/pull numbers, killed by the 'Another take.' slate at 84.47"),
    (128, 147, "k", None, "It cloned the stack in 2 seconds ... and 20 seconds later,"),
    (148, 148, "c", "retake", "AUDIT: 'Supabase, Supabase was up' — Hasan flagged the repeat at ~6:22; cut the FIRST. Was left in as a tight splice (pre-gap 0.25s leaves a 0.125s tail on 'later,'); his call overrides. Post-side is clean (0.46s)."),
    (149, 164, "k", None, "Supabase was up. 11 containers, all healthy ... And it measured everything."),
    (165, 174, "c", "retake", "'the RAM of the container' + a 'down to the,' stumble; superseded by 'every container'"),
    (175, 181, "k", None, "down to the RAM of every container."),
    (182, 191, "c", "retake", "two bare 'Then it starts breaking things.' deliveries; the third adds 'on purpose' (the payoff)"),
    (192, 233, "k", None, "Then it starts breaking things on purpose ... to do these experiments,"),
    (234, 251, "c", "retake", "'while AI can do like hundreds of exp—' run; superseded by the cleaner 'while AI can run these experiments'"),
    (252, 352, "k", None, "while AI can run these experiments ... it destroys the server."),
    (353, 370, "c", "retake", "'teardown is part of the flow' + '$0.35' pair, killed by the 'Other take.' slate at 263.57"),
    (371, 385, "k", None, "The teardown is part of the work, and the total bill is like 35 cents."),
]

# ============================================================ 0276 — the hands
SPEC["0276"] = [
    (0, 70, "k", None, "Now of course a guide like this requires screenshots ... Think about how much time this is saving you."),
    (71, 74, "c", "false_start", "'And it really has,' doubled by 'and it really has one rule I love'; cut the FIRST"),
    (75, 82, "k", None, "and it really has one rule I love."),
    (83, 88, "c", "retake", "'It never blurs a secret on—' doubled by 'it never blurs a secret.'; cut the FIRST"),
    (89, 109, "k", None, "it never blurs a secret. If a real key appears on the screen, it replaces it automatically with a fake one."),
]

# ============================== 0277 — the voice, the leash, the human read
SPEC["0277"] = [
    (0, 5, "k", None, "After all this, it finally writes."),
    (6, 7, "c", "false_start", "'But before,' doubled by 'but before drafting,'; cut the FIRST"),
    (8, 65, "k", None, "but before drafting, it pulls up my brain ... In my words, in my voice,"),
    (66, 68, "c", "retake", "AUDIT: 'and backed by, and backed by its evidence' — Hasan flagged the repeat at ~8:33; cut the FIRST. Tight: pre-gap 0.16s leaves a 0.08s tail on 'voice,'. Cutting the SECOND instead was considered and rejected — it would leave a 0.035s head on 'its', and a clipped word ONSET is far more audible than a clipped release."),
    (69, 73, "k", None, "and backed by its evidence."),
    (74, 80, "c", "false_start", "'After the first draft, we have the' abandoned; restarted as 'Now after the draft,'"),
    (81, 99, "k", None, "Now after the draft, we have the verification loops ... One loop checks the evidence."),
    (100, 138, "c", "retake", "4 attempts at 'one attacks the draft trying to find a wrong claim' (3 slates); the delivery at 113.69 supersedes all"),
    (139, 177, "k", None, "and one attacks the draft trying to find a wrong claim ... committed to my site's repo."),
    (178, 209, "c", "retake", "4 attempts at 'but there is one more thing before it goes live' (2 slates)"),
    (210, 269, "k", None, "But there is one more thing before it goes live ... or rely directly on the output."),
    (270, 292, "c", "retake", "'Yes, compared to 2022 ... maybe more than 1,000 times of the work.' killed by the 'Other take.' slate at 240.24"),
    (293, 339, "k", None, "Now compared to 2022, now the AI does 1,000 times more of the work ... never automate the responsibility."),
]

# ==================================== 0278 — the flywheel + video-1 + close
SPEC["0278"] = [
    (0, 7, "k", None, "Now the last part, and my favorite one."),
    (8, 20, "c", "false_start", "'Look at the first stage of the pipeline and the final—' + its own 'another take.' slate"),
    (21, 135, "k", None, "Look at the first stage of the pipeline and the last one ... build your own brain and connect with AI."),
    (136, 148, "c", "retake", "second delivery 'Go watch it and see how you can connect your brain to AI.' — EXCEPTION to cut-the-first, see flag 2"),
    (149, 158, "c", "retake", "'If you learned something new today, smash the like button.' killed by the 'Overtake.' [=Other take] slate at 131.39"),
    (159, 159, "c", "false_start", "slate: 'Overtake.' (mis-transcribed 'Other take.')"),
    (160, 165, "c", "retake", "'If you learned something new today,' doubled by the next delivery; cut the FIRST"),
    (166, 175, "k", None, "if you learned something new today, smash the like button"),
    (176, 185, "c", "retake", "'and go now read the guide I created with AI.' doubled by 'And go now and read the guide I showed you in this video.'; cut the FIRST"),
    (186, 198, "k", None, "And go now and read the guide I showed you in this video."),
    (199, 210, "c", "retake", "'And you—' false start + 'and if you spot any AI slop or robotic sentences.'; the next delivery completes the thought with 'tell me in the comments'"),
    (211, 237, "k", None, "And if you find any AI slop, tell me in the comments. I read every one of them. Thank you and see you in the upcoming videos."),
]


# ---------------------------------------------------------- splice-risk report
# plan_clip truncates a segment's tail AT the cut start (`seg_e = cs`). So when a
# cut begins only a few ms after the previous kept word ends, that word's release
# is chopped -> a hard entry / audible clip. A clean landing needs
#   pre_gap >= min_tail + head + 0.06   (tight: 0.35s, natural: 0.51s)
# This prints every cut whose pre-gap is under that so nothing hides.
RISK: list[str] = []
CLEAN_TIGHT = STYLES["tight"]["min_tail"] + STYLES["tight"]["head"] + 0.06
CLEAN_NAT = STYLES["natural"]["min_tail"] + STYLES["natural"]["head"] + 0.06


def check_splices(cid: str, spec: list, words: list) -> list[str]:
    """Only a cut that FOLLOWS A KEEP can clip anything: if the previous span is
    itself a cut there is no kept release to protect. And the number that matters
    is the tail actually left after HUG pulls the boundary back, not the raw gap."""
    kind_of = {}
    for a, b, kind, *_ in spec:
        for i in range(a, b + 1):
            kind_of[i] = kind

    out = []
    for a, b, kind, cat, note in spec:
        if kind != "c" or a == 0 or kind_of.get(a - 1) != "k":
            continue
        pre = words[a]["start"] / 1000.0 - words[a - 1]["end"] / 1000.0
        tail = pre - min(HUG, max(pre * 0.5, 0.01))
        if tail >= STYLES["natural"]["min_tail"]:
            continue
        level = "CLIPS-BOTH" if tail < STYLES["tight"]["min_tail"] else "short-on-natural"
        out.append(f"  [{level}] {cid} cut@{a}-{b}: pre_gap={pre:.3f}s -> "
                   f"tail={tail:.3f}s left on {words[a-1]['text']!r} "
                   f"(then {words[a]['text']!r} is cut)")
    return out


# ------------------------------------------------------------------ builder
def build(proj: Path) -> dict:
    clips = []
    order = sorted(SPEC.keys())
    for cid in order:
        words = json.loads((proj / "work" / "transcripts" / f"{cid}.json")
                           .read_text(encoding="utf-8"))["words"]
        spec = SPEC[cid]
        # validate coverage: strictly increasing, no gaps, no overlaps
        expect = 0
        for a, b, *_ in spec:
            if a != expect:
                raise SystemExit(f"{cid}: spec gap/overlap at word {a}, expected {expect}")
            if b < a:
                raise SystemExit(f"{cid}: reversed range {a}-{b}")
            expect = b + 1
        if expect != len(words):
            raise SystemExit(f"{cid}: spec covers {expect} words, transcript has {len(words)}")

        keeps, cuts = [], []
        for a, b, kind, cat, note in spec:
            w0, w1 = words[a], words[b]
            s0, e1 = w0["start"] / 1000.0, w1["end"] / 1000.0
            text = " ".join(w["text"] for w in words[a:b + 1])
            if kind == "k":
                gap_after = None
                if b + 1 < len(words):
                    gap_after = round(words[b + 1]["start"] / 1000.0 - e1, 3)
                entry = {"s": round(s0, 3), "e": round(e1, 3), "text": text}
                if gap_after is not None:
                    kind_g = "silence" if gap_after >= 0.6 else "pause"
                    entry["gap"] = {"d": gap_after, "t": kind_g}
                keeps.append(entry)
            else:
                # hug the cut speech, but stay in the quiet between words
                prev_end = words[a - 1]["end"] / 1000.0 if a > 0 else None
                next_start = words[b + 1]["start"] / 1000.0 if b + 1 < len(words) else None
                gap_before = (s0 - prev_end) if prev_end is not None else 1.0
                gap_after = (next_start - e1) if next_start is not None else 1.0
                cs = s0 - min(HUG, max(gap_before * 0.5, 0.01))
                ce = e1 + min(HUG, max(gap_after * 0.5, 0.01))
                cuts.append({"s": round(cs, 3), "e": round(ce, 3), "cat": cat,
                             "text": text, "note": note})

        for xs, xe, xcat, xnote in EXTRA_CUTS.get(cid, []):
            cuts.append({"s": xs, "e": xe, "cat": xcat, "text": "(no tokens remain here)",
                         "note": xnote})
        cuts.sort(key=lambda c: c["s"])
        fluff = []
        for a, b, crit, note in FLUFF_IDX.get(cid, []):
            w0, w1 = words[a], words[b]
            prev_end = words[a - 1]["end"] / 1000.0 if a > 0 else 0.0
            nxt = words[b + 1]["start"] / 1000.0 if b + 1 < len(words) else w1["end"] / 1000.0 + 1
            gb = w0["start"] / 1000.0 - prev_end
            fluff.append({
                "s": round(w0["start"] / 1000.0 - min(HUG, max(gb * 0.5, 0.01)), 3),
                "e": round(min(w1["end"] / 1000.0 + HUG, nxt - 0.02), 3),
                "text": " ".join(w["text"] for w in words[a:b + 1]),
                "crit": crit, "note": note, "status": "suggested",
                "pre_gap": round(gb, 3),
            })

        clips.append({
            "id": cid,
            "file": CLIP_FILES[cid],
            "duration": DURATIONS[cid],
            "keeps": keeps,
            "cuts": cuts,
            "fluff_suggestions": fluff,
        })
        RISK.extend(check_splices(cid, spec, words))

    return {
        "project": "video-2",
        "clip_order": order,
        "clips": clips,
        "styles": STYLES,
        "flags": FLAGS,
    }


# Fluff / doublings left IN the cut, by word index, all status "suggested" so the
# renderer never drops them. Three of these are doublings I would normally cut, but
# the pre-gap is too tight for a clean splice (see SPLICE RISK note at the bottom):
# the boundary would truncate the PRECEDING word's release instead of landing in
# quiet. Left for the audit, where an ear beats a heuristic.
FLUFF_IDX: dict[str, list] = {
    "0272": [
        (161, 165, "restated-idea", "'and you will see today,' — 'So today,' already said it 9s earlier. Safe to drop (pre-gap 1.69s)."),
    ],
    "0273": [
        (151, 151, "evaluative-aside", "a standalone 'Yes.' between 'the hands.' and 'Which is a real browser'. Safe to drop (pre-gap 1.64s)."),
    ],
    "0275": [
        (148, 148, "doubled-phrase", "'Supabase, Supabase was up' — cut the first 'Supabase,'. TIGHT: pre-gap 0.25s, would leave ~0.07s tail on 'later,'."),
    ],
    "0277": [
        (19, 20, "doubled-phrase", "'my beliefs, my beliefs about self-hosting' — cut the first. TIGHT: pre-gap 0.04s; a splice here WILL clip 'rules,'."),
        (66, 68, "doubled-phrase", "'and backed by, and backed by its evidence' — cut the first. TIGHT: pre-gap 0.16s; 2.66s pause between them makes it read as a deliberate restart."),
    ],
}

FLAGS: list[dict] = [
    {
        "id": 1, "clip": "0271", "at": "00:20",
        "issue": "Intro line wording. The only take with the stronger 'of this AI-powered content factory system' (at 09:81) was explicitly killed by your 'Repeat, repeat.' slate, so the cut uses the surviving take: 'of my content factory system'.",
        "default": "follow the slate — keep 'my content factory system'",
        "alternative": "restore 0271 words 6-21 (07.11-13.90) and cut 27-41 instead",
    },
    {
        "id": 2, "clip": "0278", "at": "01:30",
        "issue": "'Go watch it and see how you can...' is delivered twice: first '...build your own brain and connect with AI.' (90.31-94.97), then '...connect your brain to AI.' (97.12-100.12). This is the ONE place I did not cut-the-first: the second is a thinner paraphrase, and cutting the first needs a 0.21s splice that would clip 'below.' to a ~0.07s tail.",
        "default": "keep the FIRST (richer) delivery, cut the second",
        "alternative": "flip it if you want the shorter line — accept the clipped 'below.'",
    },
    {
        "id": 3, "clip": "0272", "at": "02:29",
        "issue": "'and we should adapt' then 'and you should adapt.' — reads as intentional we/you escalation rather than a retake, so both are kept.",
        "default": "keep both",
        "alternative": "cut 195-198 (149.33-150.15) if it plays as a stumble",
    },
    {
        "id": 4, "clip": "0273", "at": "03:14",
        "issue": "The free-ebook CTA (194.42-265.04) is the only block big enough to move the runtime. plan.md specified a companion-guide CTA here instead; the ebook is what got recorded. Measured cost is +32s of RENDER time, not the ~70s its raw span suggests — that stretch is mostly long pauses the engine already compresses.",
        "default": "keep as recorded",
        "alternative": "cut 281-427 to reclaim 32s (tight 10:10 -> 9:39, natural 10:36 -> 10:03)",
        "decided": "2026-08-13 — KEEP. Hasan chose to keep the CTA and accept ~10:10, over plan.md's 10:00 ceiling.",
    },
    {
        "id": 5, "clip": "*", "at": "-",
        "issue": "The 5 fluff/doubling suggestions are all left IN. Three of them (0275 'Supabase,', 0277 'my beliefs,', 0277 'and backed by,') cannot be spliced cleanly anyway — pre-gaps of 0.25s / 0.04s / 0.16s would truncate the PRECEDING word's release.",
        "default": "leave all 5 in (status stays 'suggested', renderer never drops them)",
        "alternative": "flip any to 'auto_applied' in the editor after hearing it",
        "decided": "2026-08-13 — LEAVE IN. Hasan: 'just follow my recording' — no discretionary fluff removal. Slate-driven retake/false-start cuts still apply, since those ARE the recording's spoken instructions.",
    },
]

if __name__ == "__main__":
    proj = Path(sys.argv[1] if len(sys.argv) > 1 else "videos/video-2")
    data = build(proj)
    out = proj / "work" / "analysis" / "cuts.json"
    out.write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")
    nk = sum(len(c["keeps"]) for c in data["clips"])
    nc = sum(len(c["cuts"]) for c in data["clips"])
    kept = sum(k["e"] - k["s"] for c in data["clips"] for k in c["keeps"])
    raw = sum(c["duration"] for c in data["clips"])
    print(f"wrote {out}")
    print(f"clips={len(data['clips'])} keeps={nk} cuts={nc}")
    print(f"raw={raw / 60:.1f}min  kept_speech={kept:.1f}s ({kept / 60:.2f}min) "
          f"-- pauses/heads/tails add on top")
    for c in data["clips"]:
        ks = sum(k["e"] - k["s"] for k in c["keeps"])
        nf = len(c["fluff_suggestions"])
        print(f"  {c['id']}: {len(c['keeps'])} keeps ({ks:6.1f}s speech), "
              f"{len(c['cuts']):2d} cuts, {nf} fluff")
    print(f"\nsplice risk ({len(RISK)} cuts land inside the clean-landing window):")
    print(f"  clean landing needs pre_gap >= {CLEAN_TIGHT:.2f}s (tight) / {CLEAN_NAT:.2f}s (natural)")
    for r in RISK:
        print(r)
    if not RISK:
        print("  none — every cut starts in comfortable quiet")
