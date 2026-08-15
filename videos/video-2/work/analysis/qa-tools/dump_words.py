"""Dump word-level times per clip + flag token-time anomalies.

Usage: python dump_words.py <project_dir> <out_dir>
"""
import json
import sys
from pathlib import Path

proj = Path(sys.argv[1])
out = Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

tdir = proj / "work" / "transcripts"
anomalies = []

for jf in sorted(tdir.glob("*.json")):
    cid = jf.stem
    data = json.loads(jf.read_text(encoding="utf-8"))
    words = data.get("words") or []
    lines = [f"# clip {cid} — {len(words)} words"]
    for i, w in enumerate(words):
        s = w["start"] / 1000.0
        e = w["end"] / 1000.0
        dur = e - s
        gap_next = (words[i + 1]["start"] / 1000.0 - e) if i + 1 < len(words) else 0.0
        conf = w.get("confidence", 1.0)
        flags = []
        if dur > 1.0:
            flags.append(f"LONG({dur:.2f}s)")
        if gap_next > 0.35:
            flags.append(f"GAP_AFTER({gap_next:.2f}s)")
        if conf < 0.6:
            flags.append(f"LOWCONF({conf:.2f})")
        flag = ("  <<< " + " ".join(flags)) if flags else ""
        lines.append(f"{i:4d} {s:8.2f}-{e:8.2f} d={dur:5.2f} g={gap_next:6.2f} c={conf:.2f}  {w['text']}{flag}")
        if flags:
            anomalies.append(f"{cid} #{i} {s:.2f}-{e:.2f} {w['text']!r} :: {' '.join(flags)}")
    (out / f"words-{cid}.txt").write_text("\n".join(lines), encoding="utf-8")
    print(f"{cid}: {len(words)} words -> words-{cid}.txt")

(out / "anomalies.txt").write_text("\n".join(anomalies), encoding="utf-8")
print(f"\n{len(anomalies)} anomalies -> anomalies.txt")
