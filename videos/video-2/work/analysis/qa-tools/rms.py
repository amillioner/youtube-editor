"""RMS envelope helpers for cut authoring.

Modes:
  floor  <proj> <clip>                     -> 10th-percentile noise floor (dB)
  env    <proj> <clip> <t0> <t1>           -> print 20ms RMS envelope over a span
  ramp   <proj> <clip> [n]                 -> onset-ramp distribution at word starts
  hot    <proj> <clip> <t0> <t1>           -> report hot (speech) sub-spans in a range
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

HOP = 0.010  # 10 ms


def load(proj: Path, clip: str):
    wav = proj / "work" / "audio" / f"{clip}.wav"
    with wave.open(str(wav), "rb") as w:
        sr = w.getframerate()
        n = w.getnframes()
        raw = w.readframes(n)
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    return x, sr


def envelope(x, sr, hop=HOP, win=0.025):
    hop_n = int(sr * hop)
    win_n = int(sr * win)
    n_frames = max(1, (len(x) - win_n) // hop_n + 1)
    idx = np.arange(n_frames) * hop_n
    frames = np.lib.stride_tricks.sliding_window_view(x, win_n)[idx]
    rms = np.sqrt((frames ** 2).mean(axis=1) + 1e-12)
    db = 20 * np.log10(rms + 1e-12)
    return db, hop


def noise_floor(db):
    return float(np.percentile(db, 10))


def words_of(proj: Path, clip: str):
    d = json.loads((proj / "work" / "transcripts" / f"{clip}.json").read_text(encoding="utf-8"))
    return d["words"]


def main():
    mode, proj_s, clip = sys.argv[1], sys.argv[2], sys.argv[3]
    proj = Path(proj_s)
    x, sr = load(proj, clip)
    db, hop = envelope(x, sr)
    floor = noise_floor(db)

    if mode == "floor":
        print(f"clip {clip}: floor={floor:.1f} dB  peak={db.max():.1f} dB  frames={len(db)}")
        return

    if mode == "env":
        t0, t1 = float(sys.argv[4]), float(sys.argv[5])
        i0, i1 = int(t0 / hop), int(t1 / hop)
        print(f"clip {clip} floor={floor:.1f} dB, span {t0:.2f}-{t1:.2f}s (marker: | = floor+6dB)")
        for i in range(max(0, i0), min(len(db), i1)):
            t = i * hop
            v = db[i]
            bar = "#" * max(0, int((v - floor) / 2))
            hot = "*" if v > floor + 6 else " "
            print(f"{t:8.2f} {v:7.1f} {hot} {bar}")
        return

    if mode == "hot":
        t0, t1 = float(sys.argv[4]), float(sys.argv[5])
        i0, i1 = int(t0 / hop), int(t1 / hop)
        thr = floor + 6
        seg = db[i0:i1] > thr
        # group contiguous hot runs, allow 60ms bridging
        runs = []
        cur = None
        gap = 0
        for k, v in enumerate(seg):
            if v:
                if cur is None:
                    cur = k
                gap = 0
            else:
                if cur is not None:
                    gap += 1
                    if gap > 6:
                        runs.append((cur, k - gap))
                        cur = None
        if cur is not None:
            runs.append((cur, len(seg) - 1))
        print(f"clip {clip} floor={floor:.1f} thr={thr:.1f} span {t0:.2f}-{t1:.2f}")
        total = 0.0
        for a, b in runs:
            ta, tb = t0 + a * hop, t0 + b * hop
            total += tb - ta
            print(f"  HOT {ta:8.2f} - {tb:8.2f}  ({tb - ta:.2f}s)")
        print(f"  hot total {total:.2f}s of {t1 - t0:.2f}s span")
        return

    if mode == "ramp":
        # Only ATOM STARTS matter for `head`: words preceded by a real pause, i.e.
        # the points a cut can splice in. Mid-phrase words sit in continuous speech
        # and would report a bogus multi-hundred-ms "ramp".
        min_gap = float(sys.argv[4]) if len(sys.argv) > 4 else 0.4
        words = words_of(proj, clip)
        thr = floor + 6
        ramps = []
        prev_end = None
        for w in words:
            ws = w["start"] / 1000.0
            gap_before = (ws - prev_end) if prev_end is not None else 99.0
            prev_end = w["end"] / 1000.0
            if gap_before < min_gap:
                continue
            i = int(ws / hop)
            if i <= 0 or i >= len(db):
                continue
            # walk back to last frame at/below threshold
            k = i
            steps = 0
            while k > 0 and db[k] > thr and steps < 60:
                k -= 1
                steps += 1
            ramp = (i - k) * hop
            if steps < 60:
                ramps.append(ramp)
        if ramps:
            a = np.array(ramps)
            print(f"clip {clip} floor={floor:.1f} n={len(a)}  "
                  f"mean={a.mean():.3f} median={np.median(a):.3f} "
                  f"p75={np.percentile(a,75):.3f} p90={np.percentile(a,90):.3f} max={a.max():.3f}")
        return


main()
