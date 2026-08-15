"""Scan a rendered transcript for adjacent repeated n-grams (doublings that survived)."""
import json
import re
import sys
from pathlib import Path

proj = Path(sys.argv[1])
tid = sys.argv[2]
words = json.loads((proj / "work" / "transcripts" / f"{tid}.json").read_text(encoding="utf-8"))["words"]


def norm(t):
    return re.sub(r"[^a-z0-9]", "", t.lower())


toks = [norm(w["text"]) for w in words]
hits = []
for n in range(5, 0, -1):
    for i in range(len(toks) - 2 * n + 1):
        a, b = toks[i:i + n], toks[i + n:i + 2 * n]
        if a == b and all(a) and not (n == 1 and a[0] in {"the", "a", "and", "to", "of", "in", "is", "it", "that", "you", "so", "my"}):
            hits.append((i, n))

# keep the longest match at each position, drop overlaps
hits.sort(key=lambda h: (-h[1], h[0]))
taken = set()
out = []
for i, n in hits:
    span = set(range(i, i + 2 * n))
    if span & taken:
        continue
    taken |= span
    out.append((i, n))

for i, n in sorted(out):
    s = words[i]["start"] / 1000.0
    e = words[i + 2 * n - 1]["end"] / 1000.0
    phrase = " ".join(w["text"] for w in words[i:i + 2 * n])
    ctx = " ".join(w["text"] for w in words[max(0, i - 6):i + 2 * n + 6])
    print(f"{int(s // 60)}:{s % 60:05.2f}  n={n}  [{s:.2f}-{e:.2f}]")
    print(f"    DOUBLED: {phrase}")
    print(f"    context: ...{ctx}...")
