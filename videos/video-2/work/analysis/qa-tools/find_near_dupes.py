"""Adjacent NEAR-repeats: two consecutive n-grams differing in at most one token.

Catches 'and WE should adapt / and YOU should adapt', which an exact scan misses.
"""
import json
import re
import sys
from pathlib import Path

proj, tid = Path(sys.argv[1]), sys.argv[2]
lo = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
hi = float(sys.argv[4]) if len(sys.argv) > 4 else 1e9
words = json.loads((proj / "work" / "transcripts" / f"{tid}.json").read_text(encoding="utf-8"))["words"]
toks = [re.sub(r"[^a-z0-9]", "", w["text"].lower()) for w in words]

found = []
for n in range(5, 1, -1):
    for i in range(len(toks) - 2 * n + 1):
        a, b = toks[i:i + n], toks[i + n:i + 2 * n]
        if not all(a) or not all(b):
            continue
        diff = sum(1 for x, y in zip(a, b) if x != y)
        if diff <= 1 and a != b:          # exact handled elsewhere; want NEAR only
            found.append((i, n, diff))

found.sort(key=lambda h: (-h[1], h[0]))
taken, out = set(), []
for i, n, d in found:
    span = set(range(i, i + 2 * n))
    if span & taken:
        continue
    taken |= span
    out.append((i, n, d))

for i, n, d in sorted(out):
    s = words[i]["start"] / 1000.0
    if not (lo <= s <= hi):
        continue
    e = words[i + 2 * n - 1]["end"] / 1000.0
    print(f"{int(s // 60)}:{s % 60:05.2f}  n={n} diff={d}  [{s:.2f}-{e:.2f}]")
    print(f"    {' '.join(w['text'] for w in words[max(0, i - 5):i + 2 * n + 5])}")
