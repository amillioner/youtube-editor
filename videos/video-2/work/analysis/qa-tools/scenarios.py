"""What each optional trim actually buys, in rendered seconds (not keep-span seconds).

Runs plan_clip for real, with the candidate span removed from the keeps, so the
number includes the head/tail/pause changes rather than just the raw span.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path("tools").resolve()))
from cutlib import AudioProbe, plan_clip  # noqa: E402

proj = Path(sys.argv[1])
data = json.loads((proj / "work" / "analysis" / "cuts.json").read_text(encoding="utf-8"))
probe = AudioProbe(proj)
words_by = {c["id"]: json.loads((proj / "work" / "transcripts" / f"{c['id']}.json")
                                .read_text(encoding="utf-8"))["words"] for c in data["clips"]}


def runtime(style_name, drop=None):
    """drop = list of (clip_id, s, e) spans to remove from keeps."""
    style = data["styles"][style_name]
    total = 0.0
    for c in data["clips"]:
        keeps = []
        for k in c["keeps"]:
            ks, ke = k["s"], k["e"]
            pieces = [(ks, ke)]
            for cid, ds, de in (drop or []):
                if cid != c["id"]:
                    continue
                nxt = []
                for ps, pe in pieces:
                    if de <= ps or ds >= pe:
                        nxt.append((ps, pe))
                        continue
                    if ps < ds:
                        nxt.append((ps, min(ds, pe)))
                    if pe > de:
                        nxt.append((max(de, ps), pe))
                pieces = nxt
            for ps, pe in pieces:
                if pe - ps > 0.05:
                    keeps.append({"s": ps, "e": pe})
        if keeps:
            segs = plan_clip(c["id"], keeps, words_by[c["id"]], style, probe, c.get("cuts"))
            total += sum(e - s for s, e in segs)
    return total


def fmt(t):
    return f"{int(t // 60)}:{int(t % 60):02d}"


# candidate trims
FLUFF_ALL = [(c["id"], f["s"], f["e"]) for c in data["clips"] for f in c["fluff_suggestions"]]
FLUFF_SAFE = [(c["id"], f["s"], f["e"]) for c in data["clips"]
              for f in c["fluff_suggestions"] if "TIGHT" not in f["note"]]
EBOOK = [("0273", 194.42, 265.10)]          # 'But before that, and speaking of building blocks' -> end
EBOOK_KEEP_SEED = [("0273", 199.85, 265.10)]  # keep the 'speaking of building blocks' bridge only

print(f"{'scenario':<42} {'tight':>7} {'natural':>8}")
rows = [
    ("as authored", None),
    ("+ safe fluff only (2)", FLUFF_SAFE),
    ("+ all 5 fluff suggestions", FLUFF_ALL),
    ("+ drop ebook CTA", EBOOK),
    ("+ drop ebook CTA + all fluff", FLUFF_ALL + EBOOK),
]
base_t = base_n = None
for label, drop in rows:
    t, n = runtime("tight", drop), runtime("natural", drop)
    if base_t is None:
        base_t, base_n = t, n
        print(f"{label:<42} {fmt(t):>7} {fmt(n):>8}")
    else:
        print(f"{label:<42} {fmt(t):>7} {fmt(n):>8}   "
              f"(-{base_t - t:.0f}s / -{base_n - n:.0f}s)")
print()
print("plan.md: target 9:30, hard ceiling 10:00")
