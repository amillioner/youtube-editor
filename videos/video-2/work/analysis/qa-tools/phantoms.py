"""Find PHANTOM tokens: kept words whose span holds no audio above the floor.

A phantom has a normal duration and normal neighbouring gaps, so the LONG/GAP
detectors miss it entirely. But split_atoms will happily build an atom around it,
and the renderer then emits that span as pure silence -- dead air mid-sentence.
Caught on 0275 'Google' via a verify_cut big-interior-pause.
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

proj = Path(sys.argv[1])
data = json.loads((proj / "work" / "analysis" / "cuts.json").read_text(encoding="utf-8"))
HOP, WIN = 0.010, 0.025

for c in data["clips"]:
    cid = c["id"]
    with wave.open(str(proj / "work" / "audio" / f"{cid}.wav"), "rb") as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768.0
    hop_n, win_n = int(sr * HOP), int(sr * WIN)
    n = max(1, (len(x) - win_n) // hop_n + 1)
    frames = np.lib.stride_tricks.sliding_window_view(x, win_n)[np.arange(n) * hop_n]
    db = 20 * np.log10(np.sqrt((frames ** 2).mean(axis=1) + 1e-12) + 1e-12)
    floor = float(np.percentile(db, 10))
    thr = floor + 6

    words = json.loads((proj / "work" / "transcripts" / f"{cid}.json")
                       .read_text(encoding="utf-8"))["words"]
    keeps = [(k["s"], k["e"]) for k in c["keeps"]]
    for i, w in enumerate(words):
        s, e = w["start"] / 1000.0, w["end"] / 1000.0
        if not any(ks - 0.02 <= s and e <= ke + 0.02 for ks, ke in keeps):
            continue  # only kept words matter
        i0, i1 = int(s / HOP), max(int(e / HOP), int(s / HOP) + 1)
        seg = db[i0:i1]
        if len(seg) == 0:
            continue
        hot_frac = float((seg > thr).mean())
        if hot_frac < 0.20:
            print(f"PHANTOM {cid} #{i} {s:.2f}-{e:.2f} ({e - s:.2f}s) "
                  f"hot={hot_frac * 100:.0f}% peak={seg.max() - floor:+.1f}dB  {w['text']!r}")
print("scan complete")
