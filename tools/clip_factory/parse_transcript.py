"""Parse caption/transcript files into normalized transcript.json."""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any


def _srt_time_to_ms(ts: str) -> int:
    ts = ts.strip().replace(",", ".")
    parts = ts.split(":")
    if len(parts) == 3:
        h, m, s = parts
        return int((int(h) * 3600 + int(m) * 60 + float(s)) * 1000)
    if len(parts) == 2:
        m, s = parts
        return int((int(m) * 60 + float(s)) * 1000)
    return int(float(ts) * 1000)


def _parse_srt_vtt(text: str, source: str) -> dict[str, Any]:
    blocks = re.split(r"\n\s*\n", text.strip())
    lines: list[dict[str, Any]] = []
    for block in blocks:
        rows = [r.strip() for r in block.splitlines() if r.strip()]
        if len(rows) < 2:
            continue
        time_row = rows[1] if re.match(r"^\d+$", rows[0]) else rows[0]
        text_rows = rows[2:] if re.match(r"^\d+$", rows[0]) else rows[1:]
        if "-->" not in time_row:
            continue
        start_s, end_s = [p.strip() for p in time_row.split("-->")]
        body = " ".join(text_rows)
        body = re.sub(r"<[^>]+>", "", body).strip()
        if not body:
            continue
        start_ms = _srt_time_to_ms(start_s.split()[0])
        end_ms = _srt_time_to_ms(end_s.split()[0])
        lines.append({"text": body, "start_ms": start_ms, "end_ms": end_ms})
    total_ms = max((ln["end_ms"] for ln in lines), default=0)
    return {"source": source, "lines": lines, "words": [], "total_ms": total_ms}


def _parse_json(data: Any, source: str) -> dict[str, Any]:
    lines: list[dict[str, Any]] = []
    words: list[dict[str, Any]] = []

    if isinstance(data, dict):
        if "lines" in data and isinstance(data["lines"], list):
            lines = data["lines"]
        elif "words" in data and isinstance(data["words"], list):
            words = [
                {
                    "text": w.get("text", ""),
                    "start_ms": int(w.get("start_ms", w.get("start", 0))),
                    "end_ms": int(w.get("end_ms", w.get("end", 0))),
                }
                for w in data["words"]
            ]
        elif "utterances" in data:
            for u in data["utterances"]:
                start = int(u.get("start", 0))
                end = int(u.get("end", start))
                if start < 100000:
                    start, end = start * 1000, end * 1000
                lines.append({"text": u.get("text", ""), "start_ms": start, "end_ms": end})
        elif "segments" in data:
            for s in data["segments"]:
                start = float(s.get("start", 0))
                end = float(s.get("end", start))
                lines.append(
                    {
                        "text": s.get("text", "").strip(),
                        "start_ms": int(start * 1000),
                        "end_ms": int(end * 1000),
                    }
                )

    if words and not lines:
        # Group words into pseudo-lines (~8 words)
        chunk: list[dict[str, Any]] = []
        for w in words:
            chunk.append(w)
            if len(chunk) >= 8 or w["text"].endswith((".", "!", "?")):
                lines.append(
                    {
                        "text": " ".join(x["text"] for x in chunk),
                        "start_ms": chunk[0]["start_ms"],
                        "end_ms": chunk[-1]["end_ms"],
                    }
                )
                chunk = []
        if chunk:
            lines.append(
                {
                    "text": " ".join(x["text"] for x in chunk),
                    "start_ms": chunk[0]["start_ms"],
                    "end_ms": chunk[-1]["end_ms"],
                }
            )

    total_ms = max((ln.get("end_ms", 0) for ln in lines), default=0)
    if words:
        total_ms = max(total_ms, max(w.get("end_ms", 0) for w in words))
    return {"source": source, "lines": lines, "words": words, "total_ms": total_ms}


def _parse_plain_text(text: str, source: str) -> dict[str, Any]:
    raw_lines = [ln.strip() for ln in text.splitlines() if ln.strip() and not ln.strip().startswith("#")]
    if not raw_lines:
        raw_lines = [text.strip()]
    # One paragraph -> split sentences
    if len(raw_lines) == 1 and len(raw_lines[0]) > 120:
        raw_lines = re.split(r"(?<=[.!?])\s+", raw_lines[0])
    lines = [{"text": ln, "start_ms": None, "end_ms": None} for ln in raw_lines if ln]
    return {"source": source, "lines": lines, "words": [], "total_ms": 0, "untimed": True}


# YouTube "Show transcript" paste, with or without markdown links:
#   [00:08](https://youtu.be/...?t=8) Hello
#   [00:08](https://youtu.be/...?t=8)(https://youtu.be/...?t=8) Hello  (duplicated URL)
#   [1:02:03] Hello   (HH:MM:SS, no URL)
#   [08:15] Hello     (MM:SS, no URL)
_YOUTUBE_LINE = re.compile(
    r"^\[(?P<display>\d{1,2}:\d{2}(?::\d{2})?)\]"
    r"(?:\((?P<url1>https?://[^)]+)\))?"
    r"(?:\((?P<url2>https?://[^)]+)\))?"
    r"\s*(?P<text>.+)$"
)
_YOUTUBE_T_PARAM = re.compile(r"[?&]t=(\d+)")
# Loose signal: any line that starts with a bracketed timestamp
_TIMESTAMP_PREFIX = re.compile(r"^\[\d{1,2}:\d{2}(?::\d{2})?\]")


def _seconds_from_youtube_url(url: str) -> int | None:
    m = _YOUTUBE_T_PARAM.search(url)
    if m:
        return int(m.group(1))
    return None


def _display_stamp_to_ms(stamp: str) -> int:
    parts = stamp.split(":")
    if len(parts) == 3:
        h, m, s = parts
        return (int(h) * 3600 + int(m) * 60 + int(s)) * 1000
    if len(parts) == 2:
        m, s = parts
        return (int(m) * 60 + int(s)) * 1000
    return 0


def is_youtube_markdown_transcript(text: str) -> bool:
    """True when enough lines look like YouTube / timestamped transcript paste."""
    rows = [ln.strip() for ln in text.splitlines() if ln.strip()]
    if not rows:
        return False
    matched = sum(1 for ln in rows if _YOUTUBE_LINE.match(ln))
    if matched >= max(1, int(len(rows) * 0.5)):
        return True
    # Fallback: majority of lines start with [MM:SS] even if body is weird
    stamped = sum(1 for ln in rows if _TIMESTAMP_PREFIX.match(ln))
    return stamped >= max(1, int(len(rows) * 0.5))


def _parse_youtube_markdown_txt(text: str, source: str) -> dict[str, Any]:
    parsed: list[tuple[int, str]] = []
    for raw in text.splitlines():
        ln = raw.strip()
        if not ln:
            continue
        m = _YOUTUBE_LINE.match(ln)
        if not m:
            continue
        url = m.group("url1")
        start_s = _seconds_from_youtube_url(url) if url else None
        if start_s is None:
            start_s = _display_stamp_to_ms(m.group("display")) // 1000
        body = (m.group("text") or "").strip()
        if not body:
            continue
        parsed.append((start_s * 1000, body))

    if not parsed:
        return _parse_plain_text(text, source)

    lines: list[dict[str, Any]] = []
    for i, (start_ms, body) in enumerate(parsed):
        if i + 1 < len(parsed):
            end_ms = parsed[i + 1][0]
        else:
            end_ms = start_ms + 3000
        if end_ms <= start_ms:
            end_ms = start_ms + 3000
        lines.append({"text": body, "start_ms": start_ms, "end_ms": end_ms})

    total_ms = max((ln["end_ms"] for ln in lines), default=0)
    return {"source": source, "lines": lines, "words": [], "total_ms": total_ms, "format": "youtube-markdown"}


def parse_caption_text(text: str, source: str = ".txt") -> dict[str, Any]:
    text = text.lstrip("\ufeff")
    suffix = source.lower()
    if suffix.endswith(".json"):
        return _parse_json(json.loads(text), suffix)
    if suffix.endswith(".srt") or suffix.endswith(".vtt"):
        return _parse_srt_vtt(text, suffix)
    # Prefer timestamped YouTube-style paste over plain text whenever possible
    if is_youtube_markdown_transcript(text):
        result = _parse_youtube_markdown_txt(text, source)
        if not result.get("untimed") and result.get("lines"):
            return result
    # Last chance: try extracting any timestamped lines even below the ratio threshold
    yt_try = _parse_youtube_markdown_txt(text, source)
    if not yt_try.get("untimed") and len(yt_try.get("lines", [])) >= 3:
        return yt_try
    return _parse_plain_text(text, source)


def parse_caption_file(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8-sig")
    return parse_caption_text(text, path.suffix.lower() or ".txt")


def transcript_timing_summary(transcript: dict[str, Any]) -> str:
    if transcript.get("untimed"):
        return "untimed (Gemini clip selection will be skipped)"
    fmt = transcript.get("format") or transcript.get("source", "unknown")
    n = len(transcript.get("lines", []))
    total_s = (transcript.get("total_ms") or 0) / 1000
    return f"timed, {n} lines, ~{total_s:.0f}s span ({fmt})"


def write_transcript(path: Path, transcript: dict[str, Any]) -> None:
    path.write_text(json.dumps(transcript, indent=2, ensure_ascii=False), encoding="utf-8")


def load_transcript(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def transcript_plain_text(transcript: dict[str, Any]) -> str:
    return "\n".join(ln["text"] for ln in transcript.get("lines", []) if ln.get("text"))


def lines_in_range(transcript: dict[str, Any], start_s: float, end_s: float) -> list[dict[str, Any]]:
    start_ms, end_ms = int(start_s * 1000), int(end_s * 1000)
    out: list[dict[str, Any]] = []
    for ln in transcript.get("lines", []):
        s = ln.get("start_ms")
        e = ln.get("end_ms")
        if s is None or e is None:
            continue
        if e <= start_ms or s >= end_ms:
            continue
        out.append(
            {
                "text": ln["text"],
                "start_ms": max(0, s - start_ms),
                "end_ms": max(0, e - start_ms),
            }
        )
    return out


def extend_end_to_lines(
    transcript: dict[str, Any],
    start_s: float,
    end_s: float,
) -> float:
    """Bump end_s to the end_ms of the last line overlapping [start_s, end_s)."""
    start_ms = int(start_s * 1000)
    end_ms = int(end_s * 1000)
    best = end_s
    for ln in transcript.get("lines", []):
        s = ln.get("start_ms")
        e = ln.get("end_ms")
        if s is None or e is None:
            continue
        if e <= start_ms or s >= end_ms:
            continue
        best = max(best, float(e) / 1000.0)
    return best


def extend_end_through_line_at_boundary(
    transcript: dict[str, Any],
    end_s: float,
    *,
    epsilon_s: float = 0.05,
) -> float:
    """If end_s lands on a caption line's start, include that whole line.

    YouTube-style transcripts often set line end_ms = next line start_ms, so
    selectors that pick the next line's start as end_s cut off the payoff line.
    """
    end_ms = int(round(end_s * 1000))
    eps_ms = int(epsilon_s * 1000)
    best = end_s
    for ln in transcript.get("lines", []):
        s = ln.get("start_ms")
        e = ln.get("end_ms")
        if s is None or e is None:
            continue
        if abs(int(s) - end_ms) <= eps_ms:
            best = max(best, float(e) / 1000.0)
            break
    return best


def finalize_clip_end(
    transcript: dict[str, Any],
    start_s: float,
    end_s: float,
    *,
    video_duration_s: float | None = None,
) -> float:
    """Extend end through overlapping lines and any line starting at end_s."""
    end_s = extend_end_to_lines(transcript, start_s, end_s)
    end_s = extend_end_through_line_at_boundary(transcript, end_s)
    if video_duration_s is not None:
        end_s = min(end_s, video_duration_s)
    return end_s
