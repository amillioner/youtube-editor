"""Print rendered-transcript tokens around a given time, to triage verify findings."""
import json
import sys
from pathlib import Path

proj = Path(sys.argv[1])
tid = sys.argv[2]
centre = float(sys.argv[3])
span = float(sys.argv[4]) if len(sys.argv) > 4 else 6.0

words = json.loads((proj / "work" / "transcripts" / f"{tid}.json").read_text(encoding="utf-8"))["words"]
print(f"--- {tid} around {centre:.2f}s (+/-{span}s) ---")
prev_end = None
for w in words:
    s, e = w["start"] / 1000.0, w["end"] / 1000.0
    if centre - span <= s <= centre + span:
        gap = f"{s - prev_end:5.2f}" if prev_end is not None else "  -  "
        print(f"{s:8.2f}-{e:7.2f} gap={gap} c={w.get('confidence', 1):.2f}  {w['text']}")
    prev_end = e
