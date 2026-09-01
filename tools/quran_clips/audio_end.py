"""Snap a listed recitation end to the next short sound (usually the takbir).

Do not cut at the summary timestamp. Keep going until the current recitation
goes quiet, include the next short burst if one follows soon, then stop.
A long following burst is treated as the next rak'ah — stop before it.
"""
from __future__ import annotations

import array
import math
import subprocess
from pathlib import Path
from typing import Callable

from .titles import format_clock

LogFn = Callable[[str], None]

HOP_S = 0.04
WIN_S = 0.08
MIN_SILENCE_S = 0.50
MIN_BURST_S = 0.12
SHORT_SOUND_S = 3.5
MAX_GAP_TO_NEXT_S = 5.0
TAIL_S = 0.20
ON_ABOVE_FLOOR_DB = 8.0
MIN_ON_DB = -48.0
EXTRACT_PAD_S = 8.0


def _extract_pcm(video: Path, start_s: float, dur_s: float) -> tuple[array.array, int]:
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel",
        "error",
        "-ss",
        f"{start_s:.3f}",
        "-t",
        f"{dur_s:.3f}",
        "-i",
        str(video),
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "s16le",
        "pipe:1",
    ]
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0 or not r.stdout:
        err = (r.stderr or b"").decode("utf-8", errors="replace")[:240]
        raise RuntimeError(err or "ffmpeg audio extract failed")
    data = array.array("h")
    data.frombytes(r.stdout)
    return data, 16000


def _rms_frames(samples: array.array, sr: int) -> list[float]:
    hop_n = max(1, int(HOP_S * sr))
    win_n = max(hop_n, int(WIN_S * sr))
    frames: list[float] = []
    n = len(samples)
    i = 0
    while i < n:
        b = min(n, i + win_n)
        acc = 0.0
        for j in range(i, b):
            acc += samples[j] * samples[j]
        r = math.sqrt(acc / (b - i)) + 1e-9
        frames.append(20.0 * math.log10(r / 32768.0))
        i += hop_n
    return frames


def _floor_db(frames: list[float]) -> float:
    if not frames:
        return -60.0
    ordered = sorted(frames)
    return ordered[max(0, len(ordered) // 8)]


def bursts_from_rms(frames: list[float], hop: float = HOP_S) -> list[tuple[float, float]]:
    """Return (start, end) seconds of sounding bursts relative to the window."""
    if not frames:
        return []
    floor = _floor_db(frames)
    on = [db > MIN_ON_DB and db >= floor + ON_ABOVE_FLOOR_DB for db in frames]
    raw: list[tuple[int, int]] = []
    i = 0
    n = len(on)
    while i < n:
        if not on[i]:
            i += 1
            continue
        j = i + 1
        while j < n and on[j]:
            j += 1
        raw.append((i, j))
        i = j
    if not raw:
        return []
    merged = [raw[0]]
    gap_frames = max(1, int(MIN_SILENCE_S / hop))
    for a, b in raw[1:]:
        pa, pb = merged[-1]
        if a - pb <= gap_frames:
            merged[-1] = (pa, b)
        else:
            merged.append((a, b))
    out: list[tuple[float, float]] = []
    for a, b in merged:
        start = a * hop
        end = b * hop
        if end - start >= MIN_BURST_S:
            out.append((start, end))
    return out


def end_after_next_sound(
    bursts: list[tuple[float, float]],
    *,
    listed_end: float,
) -> float:
    """Pick a cut time from window-relative bursts. Times in the list start at 0 = listed_end."""
    tail = TAIL_S
    if not bursts:
        return listed_end

    current = [b for b in bursts if b[0] <= 0.12]
    later = [b for b in bursts if b[0] > 0.12]

    def include_short(burst: tuple[float, float], after: float) -> float:
        start, stop = burst
        if start - after > MAX_GAP_TO_NEXT_S:
            return listed_end + after + tail
        if (stop - start) <= SHORT_SOUND_S:
            return listed_end + stop + tail
        return listed_end + after + tail

    if current:
        cur_end = max(b[1] for b in current)
        nxt = next((b for b in later if b[0] >= cur_end - 0.08), None)
        if nxt is None:
            return listed_end + cur_end + tail
        return include_short(nxt, cur_end)

    nxt = later[0]
    start, stop = nxt
    if start > MAX_GAP_TO_NEXT_S:
        return listed_end
    if (stop - start) <= SHORT_SOUND_S:
        return listed_end + stop + tail
    return listed_end


def snap_end_to_next_sound(
    video: Path,
    listed_end: float,
    *,
    limit_s: float,
    max_wait_s: float,
) -> float:
    """Return a cut time >= listed_end, clamped to limit_s."""
    listed_end = float(listed_end)
    limit_s = float(limit_s)
    if limit_s <= listed_end + 0.05:
        return listed_end
    wait = max(1.0, float(max_wait_s or 8.0))
    window = min(wait + EXTRACT_PAD_S, limit_s - listed_end)
    if window < 0.35:
        return min(listed_end + window, limit_s)
    samples, sr = _extract_pcm(video, listed_end, window)
    frames = _rms_frames(samples, sr)
    bursts = bursts_from_rms(frames)
    snapped = end_after_next_sound(bursts, listed_end=listed_end)
    return max(listed_end, min(snapped, limit_s))


def apply_next_sound_ends(
    clips: list[dict],
    video: Path,
    *,
    duration_s: float,
    max_wait_s: float,
    log: LogFn | None = None,
) -> list[dict]:
    """Extend every recitation segment's end to the next short sound. Starts stay put."""
    wait = max(0.0, float(max_wait_s or 0))
    if wait <= 0 or not clips:
        return clips
    if log:
        log(f"Next-sound snap (max wait {wait:.0f}s after each Surah)…\n")
    out: list[dict] = []
    for clip in clips:
        c2 = dict(clip)
        segs = c2.get("segments")
        items = [dict(s) for s in segs] if isinstance(segs, list) and segs else [c2]
        new_items: list[dict] = []
        for i, seg in enumerate(items):
            listed = float(seg["end_s"])
            if i + 1 < len(items):
                limit = float(items[i + 1]["start_s"])
            else:
                limit = float(duration_s)
            try:
                snapped = snap_end_to_next_sound(
                    video, listed, limit_s=limit, max_wait_s=wait
                )
            except Exception as e:
                if log:
                    log(f"  snap failed at {listed:.1f}s ({e}); using listed end\n")
                snapped = listed
            seg = dict(seg)
            seg["end_s"] = round(snapped, 3)
            seg["end"] = format_clock(seg["end_s"])
            if log:
                extra = snapped - listed
                log(
                    f"  listed {listed:.1f}s → {snapped:.1f}s "
                    f"({extra:+.1f}s)\n"
                )
            new_items.append(seg)
        if isinstance(segs, list) and segs:
            c2["segments"] = new_items
            c2["end_s"] = new_items[-1]["end_s"]
            c2["end"] = new_items[-1]["end"]
        else:
            c2["end_s"] = new_items[0]["end_s"]
            c2["end"] = new_items[0]["end"]
        out.append(c2)
    return out
