"""Print a rendered transcript as prose over a time range, with [mm:ss] stamps."""
import json
import sys
from pathlib import Path

proj, tid = Path(sys.argv[1]), sys.argv[2]
t0, t1 = float(sys.argv[3]), float(sys.argv[4])
words = json.loads((proj / "work" / "transcripts" / f"{tid}.json").read_text(encoding="utf-8"))["words"]

line, last_stamp = [], None
for w in words:
    s = w["start"] / 1000.0
    if not (t0 <= s <= t1):
        continue
    if last_stamp is None or s - last_stamp >= 5:
        if line:
            print(" ".join(line))
            line = []
        print(f"\n[{int(s // 60)}:{s % 60:05.2f}]", end=" ")
        last_stamp = s
    line.append(w["text"])
if line:
    print(" ".join(line))
