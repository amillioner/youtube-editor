"""Parse pasted prayer summaries into clip ranges.

Prefer DeepSeek (DEEPSEEK_API_KEY in .env) for inconsistent wording.
Fall back to the local heuristic when no key is set.
"""
from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
from typing import Any

from clip_factory.common import load_env

from .titles import (
    format_clock,
    merge_source_meta,
    normalize_clip,
    parse_timestamp,
)

DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"
DEEPSEEK_MODEL = "deepseek-chat"

_RANGE_SIMPLE = re.compile(r"(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(\d{1,2}:\d{2}(?::\d{2})?)")

_SURAH = re.compile(
    r"Surah\s+((?:Al-|An-|Ar-|As-|Adh-|Ash-|At-|Az-)?[A-Za-z][\w'-]*)",
    re.I,
)

_RAKAH = re.compile(
    r"(first|second|third|fourth|1st|2nd|3rd|4th)\s+(?:rak'?a?h|segment)",
    re.I,
)

_RAKAH_LABELS = (
    "First Rak'ah",
    "Second Rak'ah",
    "Third Rak'ah",
    "Fourth Rak'ah",
    "Fifth Rak'ah",
    "Sixth Rak'ah",
    "Seventh Rak'ah",
    "Eighth Rak'ah",
)

_SYSTEM_PROMPT = """You extract EVERY recited rak'ah from a prayer-video summary.

A recited rak'ah is Al-Fatiha, plus a following Surah when one is listed. Maghrib has 3 rak'ahs (the 3rd is often Fatiha only). Other prayers may list 2 or 4 recited rak'ahs.

The user message may include a VIDEO TITLE. That title is authoritative for date, prayer, and place. The summary may say "First Rak'ah", "1st Segment", or just list Fatiha then Surah times.

Return ONLY valid JSON:
{
  "meta": {
    "sheikh": "Sheikh Waleed Al Shamsaan",
    "place": "Makkah",
    "date": "February 15, 2025",
    "prayer": "Maghrib"
  },
  "clips": [
    {
      "surah": "Surah Al-Fatiha & Fussilat",
      "start": "2:07",
      "end": "3:36",
      "fatiha_start": "1:27",
      "fatiha_end": "2:01",
      "rakah": "First Rak'ah"
    }
  ]
}

Rules:
- Return one clip per recited rak'ah: 2, 3 (Maghrib), or 4 — whatever the paste actually lists. Do not invent a 4th rak'ah. Do not drop a 3rd that has Fatiha times.
- If a rak'ah has Fatiha times but no Surah (typical Maghrib 3rd), still return it: surah "Surah Al-Fatiha", start/end = the Fatiha range.
- Each other clip is Fatiha + Surah even if the text only names the Surah (or says "further verses" / "continued"). Label "Surah Al-Fatiha & <Name>".
- If a later block continues the same Surah, use "Surah Al-Fatiha & <Name> (continued)".
- If Fatiha and Surah have separate times, clip.start/end is the Surah range — not Al-Fatiha. Set fatiha_start / fatiha_end from the listed Al-Fatiha times. The pipeline prefixes Al-Fatiha.
- Prefer recitation timestamps; IGNORE Adhan, Iqamah, Ruku/Sujud-only ranges, Taslim, and rak'ahs the paste marks as silent (no Surah/Fatiha times).
- Sort clips by start time ascending. Set rakah to First / Second / Third / Fourth Rak'ah as needed.
- meta.date, meta.prayer, meta.place: copy from the VIDEO TITLE when present (e.g. title "15th Feb 2025 Makkah Maghrib Sheikh Shamsaan" → date "February 15, 2025", prayer "Maghrib", place "Makkah"). NEVER invent a date. NEVER copy example values that are not in the title or summary (do not output October 11, 2024 or Isha unless those words appear).
- sheikh: the FULL reciter name from the paste or title (e.g. "Sheikh Waleed Al Shamsaan"). Never copy placeholders like "Sheikh …".
- Normalize 'Isha to "Isha". Times as M:SS or H:MM:SS.
"""


def _surah_other_name(label: str) -> str:
    s = re.sub(r"\s*\(continued\)\s*", "", label or "", flags=re.I).strip()
    s = re.sub(r"^Surah\s+Al-Fatiha\s*&\s*", "", s, flags=re.I)
    s = re.sub(r"^Surah\s+", "", s, flags=re.I)
    s = re.sub(r"Al-Fatiha\s*&\s*", "", s, flags=re.I)
    s = re.sub(r"^Fatiha\s*&\s*", "", s, flags=re.I)
    return s.strip() or "Qur’an Recitation"


def _is_fatiha_only(clip: dict[str, Any] | str) -> bool:
    label = clip if isinstance(clip, str) else str(clip.get("surah") or "")
    other = _surah_other_name(label).lower()
    return other in {"al-fatiha", "al fatiha", "fatiha"}


def _fatiha_and_surah_label(surah: str, *, continued: bool = False) -> str:
    other = _surah_other_name(surah)
    other = re.sub(r"^Surah\s+", "", other, flags=re.I)
    if other.lower() in {"al-fatiha", "al fatiha", "fatiha"}:
        return "Surah Al-Fatiha"
    label = f"Surah Al-Fatiha & {other}"
    if continued and "(continued)" not in label.lower():
        label = f"{label} (continued)"
    return label


def _same_surah(first: dict[str, Any], second: dict[str, Any]) -> bool:
    """True when the second rak'ah continues the same Surah (or has no new name)."""
    a = _surah_other_name(str(first.get("surah") or ""))
    second_raw = str(second.get("surah") or "")
    b = _surah_other_name(second_raw)
    return bool(
        re.search(r"continued|further", second_raw, re.I)
        or b.lower() in {"", "qur’an recitation", "quran recitation"}
        or b.lower() == a.lower()
    )


def _all_same_surah(clips: list[dict[str, Any]]) -> bool:
    named = [c for c in clips if not _is_fatiha_only(c)]
    if len(named) < 2:
        return True
    return all(_same_surah(named[0], c) for c in named[1:])


def _combined_surah_label(clips: list[dict[str, Any]]) -> str:
    """One label for every rak'ah: drop '(continued)' when the same Surah continues."""
    others: list[str] = []
    seen: set[str] = set()
    for c in clips:
        o = _surah_other_name(str(c.get("surah") or ""))
        key = o.lower()
        if key in {"", "qur’an recitation", "quran recitation", "al-fatiha", "al fatiha", "fatiha"} or key in seen:
            continue
        seen.add(key)
        others.append(o)
    if len(others) <= 1:
        name = others[0] if others else "Qur’an Recitation"
        return _fatiha_and_surah_label(f"Surah Al-Fatiha & {name}", continued=False)
    return "Surah Al-Fatiha & " + " & ".join(others)


def _normalize_clip_mode(
    clip_mode: str | None = None,
    split_rakahs: bool | None = None,
) -> str:
    m = (clip_mode or "").strip().lower()
    if m in {"one", "1", "combined"}:
        return "one"
    if m in {"two", "2", "split"}:
        return "two"
    if m in {"auto", "default"}:
        return "auto"
    if split_rakahs is True:
        return "two"
    return "auto"


def _resolve_split(clip_mode: str, windows: list[dict[str, Any]]) -> tuple[bool, str]:
    """Return (one_file_per_rakah, reason). Auto: same Surah → one; different → split."""
    n = len(windows)
    same = _all_same_surah(windows)
    if clip_mode == "one":
        return False, "one clip (manual)"
    if clip_mode == "two":
        return True, f"{n} clips (manual)"
    if same:
        return False, f"same Surah -> one clip ({n} rak'ahs)"
    return True, f"different Surahs -> {n} clips"


def _fatiha_windows(summary: str) -> list[tuple[float, float]]:
    """Al-Fatiha timestamp ranges from the paste (may be separate from the Surah range)."""
    found: list[tuple[float, float]] = []
    for line in _split_bullets(summary):
        if not re.search(r"\bfatiha", line, re.I):
            continue
        m = re.search(
            r"fatiha[h]?\b[^0-9]{0,48}?(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(\d{1,2}:\d{2}(?::\d{2})?)",
            line,
            re.I,
        )
        if m:
            try:
                a, b = parse_timestamp(m.group(1)), parse_timestamp(m.group(2))
            except ValueError:
                continue
            if b > a:
                found.append((a, b))
                continue
        ranges = _ranges_in_text(line)
        if not ranges:
            continue
        others = [s for s in _surahs_in_text(line) if "fatiha" not in s.lower()]
        if not others:
            found.append(ranges[0])
    uniq: list[tuple[float, float]] = []
    seen: set[float] = set()
    for a, b in sorted(found):
        key = round(a, 1)
        if key not in seen:
            seen.add(key)
            uniq.append((a, b))
    return uniq


def _extend_clips_with_fatiha(
    clips: list[dict[str, Any]],
    fatihas: list[tuple[float, float]],
    *,
    at_most_one: bool,
    warnings: list[str],
) -> list[dict[str, Any]]:
    """Pull Al-Fatiha in as a prefix when the Surah range omitted it.

    One-clip: Fatiha from the first rak'ah if listed, otherwise the next listed.
    Split: Fatiha on every rak'ah when listed.
    """
    if not fatihas:
        return clips
    used: set[int] = set()
    attached = 0
    prev_end = -1.0
    out: list[dict[str, Any]] = []

    def _fatiha_at_start(start: float, end: float) -> int | None:
        for i, (a, b) in enumerate(fatihas):
            if i in used:
                continue
            if abs(a - start) < 1.5 and b <= end + 1.0:
                return i
        return None

    def _strip_fatiha_prefix(c: dict[str, Any]) -> dict[str, Any]:
        """One clip only needs one Fatiha — drop a later rak'ah's Fatiha prefix."""
        start = float(c["start_s"])
        end = float(c["end_s"])
        idx = _fatiha_at_start(start, end)
        if idx is None:
            return c
        _a, b = fatihas[idx]
        used.add(idx)
        surah_start = float(c.get("surah_start_s") or start)
        new_start = surah_start if surah_start > b + 0.5 else b
        if new_start <= start + 0.5 or new_start >= end - 1.0:
            return c
        c2 = dict(c)
        c2["start_s"] = new_start
        c2["start"] = format_clock(new_start)
        return c2

    for c in clips:
        start = float(c["start_s"])
        end = float(c["end_s"])
        if at_most_one and attached:
            out.append(_strip_fatiha_prefix(c))
            prev_end = end
            continue
        already = _fatiha_at_start(start, end)
        if already is not None:
            used.add(already)
            attached += 1
            out.append(c)
            prev_end = end
            continue
        best_i: int | None = None
        best_a: float | None = None
        for i, (a, b) in enumerate(fatihas):
            if i in used:
                continue
            if a < prev_end - 0.5:
                continue
            if a >= start - 0.25:
                continue
            if b > start + 20:
                continue
            if b < start - 90:
                continue
            if best_a is None or a > best_a:
                best_a = a
                best_i = i
        if best_i is None:
            out.append(c)
            prev_end = end
            continue
        a, b = fatihas[best_i]
        used.add(best_i)
        c2 = dict(c)
        c2["start_s"] = a
        c2["start"] = format_clock(a)
        attached += 1
        warnings.append(
            f"included Al-Fatiha {format_clock(a)}–{format_clock(b)} "
            f"({c2.get('rakah') or 'clip'})"
        )
        out.append(c2)
        prev_end = end
    return out


def _merge_rakahs_into_one(windows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """One clip = each rak'ah's recitation, skipping ruku between."""
    first, last = windows[0], windows[-1]
    n = len(windows)
    how = {2: "both", 3: "all three", 4: "all four"}.get(n, f"all {n}")
    segments = []
    for i, w in enumerate(windows):
        segments.append(
            {
                "start_s": float(w["start_s"]),
                "end_s": float(w["end_s"]),
                "start": w["start"],
                "end": w["end"],
                "surah": w.get("surah"),
                "rakah": w.get("rakah") or (_RAKAH_LABELS[i] if i < len(_RAKAH_LABELS) else f"Rak'ah {i + 1}"),
            }
        )
    return [
        {
            "surah": _combined_surah_label(windows),
            "start": first["start"],
            "end": last["end"],
            "start_s": first["start_s"],
            "end_s": last["end_s"],
            "rakah": f"{n} Rak'ahs",
            "notes": (
                "Al-Fatiha (from the first rak'ah if listed, otherwise the next listed) "
                f"plus {how} rak'ah Surah recitations. Recitation only — ruku between rak'ahs is not included."
            ),
            "segments": segments,
        }
    ]


def _collapse_fatiha_surah_pairs(clips: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Join a Fatiha-only window with the Surah that follows it."""
    ordered = sorted(
        [c for c in clips if c.get("end_s", 0) > c.get("start_s", 0)],
        key=lambda c: float(c["start_s"]),
    )
    out: list[dict[str, Any]] = []
    i = 0
    while i < len(ordered):
        c = ordered[i]
        if _is_fatiha_only(c) and i + 1 < len(ordered) and not _is_fatiha_only(ordered[i + 1]):
            nxt = dict(ordered[i + 1])
            nxt["surah_start_s"] = float(nxt.get("surah_start_s") or nxt["start_s"])
            nxt["start_s"] = float(c["start_s"])
            nxt["start"] = format_clock(nxt["start_s"])
            out.append(nxt)
            i += 2
            continue
        out.append(c)
        i += 1
    return out


def _append_trailing_fatiha(
    clips: list[dict[str, Any]],
    fatihas: list[tuple[float, float]],
) -> list[dict[str, Any]]:
    """Keep a Maghrib 3rd (Fatiha-only) when it sits after the last Surah window."""
    if not fatihas or not clips:
        return clips
    last_end = max(float(c["end_s"]) for c in clips)
    out = list(clips)
    for a, b in fatihas:
        if a < last_end - 1.0:
            continue
        if any(abs(float(c["start_s"]) - a) < 1.5 for c in out):
            continue
        out.append(
            {
                "surah": "Surah Al-Fatiha",
                "start": format_clock(a),
                "end": format_clock(b),
                "start_s": a,
                "end_s": b,
                "surah_start_s": a,
            }
        )
        last_end = max(last_end, b)
    out.sort(key=lambda c: float(c["start_s"]))
    return out


def _canonicalize_clips(
    clips_raw: list[dict[str, Any]],
    *,
    warnings: list[str],
) -> list[dict[str, Any]]:
    """Sort by time, keep 2–8 recitation windows, force Fatiha+Surah labels."""
    valid = [c for c in clips_raw if c.get("end_s", 0) > c.get("start_s", 0)]
    valid.sort(key=lambda c: float(c["start_s"]))
    if len(valid) < 2:
        raise ValueError(
            "Need at least 2 recitation clips (rak'ahs with Fatiha + Surah times). "
            f"Found {len(valid)}. The summary must include those time ranges."
        )
    if len(valid) > 8:
        warnings.append(f"using earliest 8 of {len(valid)} recitation ranges")
        valid = valid[:8]

    named0 = next((c for c in valid if not _is_fatiha_only(c)), valid[0])
    first_other = _surah_other_name(str(named0.get("surah") or ""))
    out: list[dict[str, Any]] = []
    for i, c in enumerate(valid):
        c2 = dict(c)
        continued = i > 0 and not _is_fatiha_only(c) and _same_surah(named0, c)
        if _is_fatiha_only(c):
            c2["surah"] = "Surah Al-Fatiha"
        elif i == 0:
            c2["surah"] = _fatiha_and_surah_label(str(c.get("surah") or ""), continued=False)
        elif continued:
            c2["surah"] = _fatiha_and_surah_label(
                f"Surah Al-Fatiha & {first_other}", continued=True
            )
        else:
            c2["surah"] = _fatiha_and_surah_label(str(c.get("surah") or ""), continued=False)
        c2["rakah"] = _RAKAH_LABELS[i] if i < len(_RAKAH_LABELS) else f"Rak'ah {i + 1}"
        c2["start"] = format_clock(float(c2["start_s"]))
        c2["end"] = format_clock(float(c2["end_s"]))
        if "surah_start_s" not in c2:
            c2["surah_start_s"] = float(c2["start_s"])
        out.append(c2)
    return out


def deepseek_api_key() -> str:
    return (load_env().get("DEEPSEEK_API_KEY") or "").strip()


def _finalize(
    meta: dict[str, str],
    clips_raw: list[dict[str, Any]],
    *,
    parser: str,
    warnings: list[str] | None = None,
    clip_mode: str = "auto",
    split_rakahs: bool | None = None,
    summary: str = "",
    video_title: str = "",
) -> dict[str, Any]:
    warnings = list(warnings or [])
    mode = _normalize_clip_mode(clip_mode, split_rakahs)
    meta = merge_source_meta(meta, video_title=video_title, summary=summary)
    clips_raw = _collapse_fatiha_surah_pairs(clips_raw)
    clips_raw = _append_trailing_fatiha(clips_raw, _fatiha_windows(summary))
    clips_raw = _canonicalize_clips(clips_raw, warnings=warnings)
    same = _all_same_surah(clips_raw)
    split, reason = _resolve_split(mode, clips_raw)
    clips_raw = _extend_clips_with_fatiha(
        clips_raw,
        _fatiha_windows(summary),
        at_most_one=not split,
        warnings=warnings,
    )
    n_windows = len(clips_raw)
    if not split:
        clips_raw = _merge_rakahs_into_one(clips_raw)

    clips: list[dict[str, Any]] = []
    for raw in clips_raw:
        try:
            clips.append(normalize_clip(raw, meta))
        except ValueError as e:
            warnings.append(str(e))

    expected = n_windows if split else 1
    if len(clips) != expected:
        if split:
            raise ValueError(f"Could not build {expected} clips (one per rak'ah)")
        raise ValueError("Could not build 1 combined clip (all rak'ahs)")

    return {
        "meta": meta,
        "clips": clips,
        "clips_raw": clips_raw,
        "warnings": warnings,
        "parser": parser,
        "split_rakahs": split,
        "clip_mode": mode,
        "same_surah": same,
        "mode_reason": reason,
    }


def _validate_llm_payload(
    data: dict[str, Any],
    *,
    clip_mode: str = "auto",
    split_rakahs: bool | None = None,
    summary: str = "",
    video_title: str = "",
) -> dict[str, Any]:
    meta_in = data.get("meta") or {}
    if not isinstance(meta_in, dict):
        raise ValueError("DeepSeek response meta must be an object")

    meta = {
        "sheikh": str(meta_in.get("sheikh") or "").strip(),
        "place": str(meta_in.get("place") or "").strip(),
        "date": str(meta_in.get("date") or "").strip(),
        "prayer": str(meta_in.get("prayer") or "").strip(),
    }

    raw_clips = data.get("clips") or []
    if not isinstance(raw_clips, list):
        raise ValueError("DeepSeek response clips must be a list")

    clips_raw: list[dict[str, Any]] = []
    warnings: list[str] = []
    for i, c in enumerate(raw_clips):
        if not isinstance(c, dict):
            warnings.append(f"clip {i + 1}: not an object")
            continue
        surah = str(c.get("surah") or "").strip()
        start = str(c.get("start") or "").strip()
        end = str(c.get("end") or "").strip()
        if not surah or not start or not end:
            warnings.append(f"clip {i + 1}: missing surah/start/end")
            continue
        try:
            start_s = parse_timestamp(start)
            end_s = parse_timestamp(end)
        except ValueError as e:
            warnings.append(f"clip {i + 1}: {e}")
            continue
        if end_s <= start_s:
            warnings.append(f"clip {i + 1}: end must be after start")
            continue
        surah_start_s = start_s
        fatiha_start = str(c.get("fatiha_start") or "").strip()
        if fatiha_start:
            try:
                fs = parse_timestamp(fatiha_start)
                if fs < start_s:
                    start_s = fs
            except ValueError:
                warnings.append(f"clip {i + 1}: bad fatiha_start")
        entry: dict[str, Any] = {
            "surah": surah,
            "start": format_clock(start_s),
            "end": format_clock(end_s),
            "start_s": start_s,
            "end_s": end_s,
            "surah_start_s": surah_start_s,
        }
        rakah = str(c.get("rakah") or "").strip()
        if rakah:
            entry["rakah"] = rakah
        clips_raw.append(entry)

    return _finalize(
        meta,
        clips_raw,
        parser="deepseek",
        warnings=warnings,
        clip_mode=clip_mode,
        split_rakahs=split_rakahs,
        summary=summary,
        video_title=video_title,
    )


def _extract_json_object(text: str) -> dict[str, Any]:
    s = (text or "").strip()
    if not s:
        raise ValueError("empty model response")
    fence = re.search(r"```(?:json)?\s*([\s\S]*?)```", s, re.I)
    if fence:
        s = fence.group(1).strip()
    try:
        obj = json.loads(s)
    except json.JSONDecodeError:
        start = s.find("{")
        end = s.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("model did not return JSON")
        obj = json.loads(s[start : end + 1])
    if not isinstance(obj, dict):
        raise ValueError("JSON root must be an object")
    return obj


def _deepseek_chat(summary: str, *, video_title: str = "", stricter: bool = False) -> str:
    key = deepseek_api_key()
    if not key:
        raise RuntimeError("DEEPSEEK_API_KEY not set")

    parts: list[str] = []
    title = (video_title or "").strip()
    if title:
        parts.append(
            "VIDEO TITLE (authoritative for date, prayer, and place):\n" + title
        )
    parts.append("SUMMARY:\n" + summary.strip())
    user = "\n\n".join(parts)
    if stricter:
        user = "Return ONLY a single JSON object. No prose, no markdown.\n\n" + user

    payload = {
        "model": DEEPSEEK_MODEL,
        "temperature": 0.1,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": user},
        ],
        "response_format": {"type": "json_object"},
    }
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        DEEPSEEK_URL,
        data=body,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            raw = resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="replace")[:400]
        raise RuntimeError(f"DeepSeek HTTP {e.code}: {detail}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"DeepSeek network error: {e}") from e

    data = json.loads(raw)
    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as e:
        raise RuntimeError("Unexpected DeepSeek response shape") from e


def parse_summary_deepseek(
    summary: str,
    *,
    clip_mode: str = "auto",
    split_rakahs: bool | None = None,
    video_title: str = "",
) -> dict[str, Any]:
    text = (summary or "").strip()
    if not text:
        raise ValueError("Paste a prayer summary first")

    last_err: Exception | None = None
    for stricter in (False, True):
        try:
            content = _deepseek_chat(text, video_title=video_title, stricter=stricter)
            return _validate_llm_payload(
                _extract_json_object(content),
                clip_mode=clip_mode,
                split_rakahs=split_rakahs,
                summary=text,
                video_title=video_title,
            )
        except Exception as e:
            last_err = e
            continue
    raise ValueError(f"DeepSeek parse failed: {last_err}")


# --- heuristic fallback (no API key) ---


def _is_skip_context(text: str) -> bool:
    t = text.lower()
    if re.search(r"^\s*\*?\*?(adhan|iqamah|conclusion|preparation|third and fourth)", t):
        return True
    if "adhan" in t and ("iqamah" in t or "call to prayer" in t):
        return True
    if re.match(r"^\s*\*?\*?adhan\b", t):
        return True
    if "taslim" in t and "rak" not in t:
        return True
    if re.search(r"\b(ruku|sujud|bowing|prostration)\b", t) and not re.search(
        r"\b(surah|recit|fatiha|verses?)\b", t
    ):
        return True
    return False


def _ranges_in_text(text: str) -> list[tuple[float, float]]:
    found: list[tuple[float, float]] = []
    for m in _RANGE_SIMPLE.finditer(text):
        try:
            a, b = parse_timestamp(m.group(1)), parse_timestamp(m.group(2))
            if b > a:
                found.append((a, b))
        except ValueError:
            continue
    return found


def _surahs_in_text(text: str) -> list[str]:
    names: list[str] = []
    for m in _SURAH.finditer(text):
        name = re.sub(r"\s+", " ", m.group(0).strip())
        if name.lower() not in {n.lower() for n in names}:
            names.append(name)
    if re.search(r"\bAl-Fatiha\b", text, re.I) and not any("fatiha" in n.lower() for n in names):
        names.insert(0, "Surah Al-Fatiha")
    for m in re.finditer(
        r"\(\s*\*?(?:Surah\s+)?((?:Al-|An-|Ar-|As-|Adh-|Ash-|At-|Az-)[A-Za-z][\w'-]*)\s*\*?\s*\)",
        text,
        re.I,
    ):
        name = f"Surah {m.group(1)}"
        if name.lower() not in {n.lower() for n in names}:
            names.append(name)
    return names


def _label_from_surahs(surahs: list[str], rakah: str | None, fallback_surah: str | None) -> str:
    if len(surahs) >= 2:
        a, b = surahs[0], surahs[1]
        b_short = re.sub(r"^Surah\s+", "", b, flags=re.I)
        return f"{a} & {b_short}"
    if len(surahs) == 1:
        return surahs[0]
    if fallback_surah:
        return f"{fallback_surah} (continued)"
    if rakah:
        return f"Qur’an Recitation ({rakah})"
    return "Qur’an Recitation"


def _pick_recitation_range(text: str, ranges: list[tuple[float, float]]) -> tuple[float, float] | None:
    """Surah window before Ruku. Al-Fatiha is attached later from its own timestamps."""
    if not ranges:
        return None
    pool = ranges
    split_m = re.search(r"followed by\s+(?:ruku|sujud|bowing)", text, re.I)
    if split_m:
        before = _ranges_in_text(text[: split_m.start()])
        if before:
            pool = before
    has_fatiha = bool(re.search(r"\bfatiha", text, re.I))
    others = [s for s in _surahs_in_text(text) if "fatiha" not in s.lower()]
    continued = bool(re.search(r"further verses|continued", text, re.I))
    if has_fatiha and (others or continued) and len(pool) >= 2:
        return pool[-1]
    return (min(a for a, _ in pool), max(b for _, b in pool))


def _split_bullets(summary: str) -> list[str]:
    lines: list[str] = []
    for raw in summary.splitlines():
        line = raw.strip().lstrip("*•-–— ").strip()
        if line:
            lines.append(line)
    expanded: list[str] = []
    for line in lines:
        chunks = re.split(r"(?=\*\*[^*]+\*\*:)", line)
        for c in chunks:
            c = c.strip()
            if c:
                expanded.append(c)
    return expanded if expanded else lines


def parse_summary_heuristic(
    summary: str,
    *,
    clip_mode: str = "auto",
    split_rakahs: bool | None = None,
    video_title: str = "",
) -> dict[str, Any]:
    """Local regex parser — used only when DEEPSEEK_API_KEY is unset."""
    text = (summary or "").strip()
    if not text:
        raise ValueError("Paste a prayer summary first")

    meta: dict[str, str] = {}

    clips_raw: list[dict[str, Any]] = []
    last_surah: str | None = None

    for line in _split_bullets(text):
        if _is_skip_context(line):
            continue

        has_recitation = bool(
            re.search(r"\b(surah|recit|fatiha|verses?|rak'?a?h)\b", line, re.I)
        )
        if not has_recitation:
            continue

        if re.search(r"third and fourth|3rd and 4th", line, re.I) and not re.search(
            r"\bsurah\b", line, re.I
        ):
            continue

        ranges = _ranges_in_text(line)
        picked = _pick_recitation_range(line, ranges)
        if not picked:
            continue

        surahs = _surahs_in_text(line)
        non_fatiha = [s for s in surahs if "fatiha" not in s.lower()]
        if non_fatiha:
            label_surahs = (["Surah Al-Fatiha"] + non_fatiha) if any(
                "fatiha" in s.lower() for s in surahs
            ) else non_fatiha
        elif re.search(r"\bfatiha", line, re.I):
            label_surahs = ["Surah Al-Fatiha"]
        elif last_surah:
            label_surahs = []
        else:
            continue

        rakah_m = _RAKAH.search(line)
        rakah = None
        if rakah_m:
            rakah = rakah_m.group(0).title().replace("Rakah", "Rak'ah").replace("Rakaah", "Rak'ah")

        label = _label_from_surahs(label_surahs, rakah, last_surah)
        if non_fatiha:
            last_surah = non_fatiha[0]
        elif surahs:
            last_surah = surahs[0]

        start_s, end_s = picked
        clips_raw.append(
            {
                "surah": label,
                "start": format_clock(start_s),
                "end": format_clock(end_s),
                "start_s": start_s,
                "end_s": end_s,
                "source_line": line[:220],
            }
        )

    return _finalize(
        meta,
        clips_raw,
        parser="heuristic",
        clip_mode=clip_mode,
        split_rakahs=split_rakahs,
        summary=text,
        video_title=video_title,
    )


def parse_summary(
    summary: str,
    *,
    clip_mode: str = "auto",
    split_rakahs: bool | None = None,
    video_title: str = "",
) -> dict[str, Any]:
    """DeepSeek when keyed; otherwise local heuristic. No silent DeepSeek→heuristic fallback.

    clip_mode: auto (default) | one | two
    Auto: same Surah → one stitched clip (all recited rak'ahs); different Surahs → one file each.
    video_title: filename or pasted title — source of date, prayer, place.
    """
    if deepseek_api_key():
        return parse_summary_deepseek(
            summary,
            clip_mode=clip_mode,
            split_rakahs=split_rakahs,
            video_title=video_title,
        )
    return parse_summary_heuristic(
        summary,
        clip_mode=clip_mode,
        split_rakahs=split_rakahs,
        video_title=video_title,
    )
