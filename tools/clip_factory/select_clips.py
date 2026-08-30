"""Gemini-powered viral clip selection from a transcript."""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from .common import DEFAULT_GEMINI_MODEL, JobConfig, load_env
from .parse_transcript import finalize_clip_end, load_transcript, transcript_plain_text


def _extract_json_array(text: str) -> list[dict[str, Any]]:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1:
        raise ValueError("Gemini response did not contain a JSON array")
    return json.loads(text[start : end + 1])


def _format_transcript_for_prompt(transcript: dict[str, Any]) -> str:
    lines = []
    for ln in transcript.get("lines", []):
        s = ln.get("start_ms")
        if s is None:
            lines.append(ln["text"])
            continue
        h = s // 3_600_000
        m = (s % 3_600_000) // 60_000
        sec = (s % 60_000) / 1000
        ts = f"{h:02d}:{m:02d}:{sec:06.3f}"
        lines.append(f"[{ts}] {ln['text']}")
    return "\n".join(lines)


def build_full_clip(transcript: dict[str, Any], video_duration_s: float) -> list[dict[str, Any]]:
    total_ms = transcript.get("total_ms") or int(video_duration_s * 1000)
    end_s = min(video_duration_s, total_ms / 1000 if total_ms else video_duration_s)
    title = "full-video"
    if transcript.get("lines"):
        title = (transcript["lines"][0]["text"][:60] or "full-video").strip()
    return [
        {
            "id": "01",
            "title": title,
            "start_s": 0.0,
            "end_s": round(end_s, 3),
            "score": 100,
            "hook": title,
            "reason": "Full video mode — no AI clip selection",
            "caption": transcript_plain_text(transcript)[:500],
        }
    ]


def select_clips(
    transcript_path: Path,
    config: JobConfig,
    video_duration_s: float,
    *,
    dry_run: bool = False,
) -> list[dict[str, Any]]:
    transcript = load_transcript(transcript_path)

    mode = config.selection_mode()

    if mode == "full":
        return build_full_clip(transcript, video_duration_s)

    if transcript.get("untimed") and mode in ("clips", "single"):
        # Plain script without timestamps — cannot pick viral moments; start segment only
        end_s = min(video_duration_s, config.max_duration_s)
        text = transcript_plain_text(transcript)
        return [
            {
                "id": "01",
                "title": (text.split("\n")[0][:60] if text else "clip"),
                "start_s": 0.0,
                "end_s": round(end_s, 3),
                "score": 90,
                "hook": text[:120],
                "reason": "Untimed script — using video start segment",
                "caption": text[:500],
            }
        ]

    if mode == "single":
        max_clips = 1
    else:
        max_clips = config.max_clips

    prompt = f"""You are a viral short-form video editor.

Analyze this transcript and find up to {max_clips} clip{"s" if max_clips > 1 else ""} for social video.

Rules:
- Each clip must be between {config.min_duration_s} and {config.max_duration_s} seconds long
- Strong hook in the first 2-3 seconds of the clip
- Complete thought / curiosity gap / emotional payoff — do not cut before the punchline
- Natural sentence boundaries — do not cut mid-word
- Use timestamps from the transcript for start_s and end_s (seconds as floats)
- end_s must be >= the end timestamp of the last caption line included in the clip (not the start of the next line)
- Prefer completing the narrative payoff even if that means a slightly longer clip
- Video total duration is {video_duration_s:.1f} seconds — do not exceed it

Return ONLY a JSON array (no markdown prose) with objects:
{{
  "id": "01",
  "title": "short slug title",
  "start_s": 0.0,
  "end_s": 0.0,
  "score": 1-100,
  "hook": "opening hook line",
  "reason": "why this will perform",
  "caption": "suggested on-screen caption text for the clip"
}}

Transcript:
{_format_transcript_for_prompt(transcript)}
"""

    if dry_run:
        return [
            {
                "id": "01",
                "title": "dry-run-clip",
                "start_s": 0.0,
                "end_s": min(config.max_duration_s, video_duration_s),
                "score": 50,
                "hook": "dry run",
                "reason": "dry run",
                "caption": "dry run",
            }
        ]

    env = load_env()
    api_key = env.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set in .env")

    from google import genai

    client = genai.Client(api_key=api_key)
    model = config.gemini_model or DEFAULT_GEMINI_MODEL
    resp = client.models.generate_content(model=model, contents=prompt)
    raw = (resp.text or "").strip()
    if not raw:
        raise RuntimeError("Gemini returned empty response")

    clips = _extract_json_array(raw)
    validated: list[dict[str, Any]] = []
    for i, clip in enumerate(clips[:max_clips]):
        start_s = float(clip.get("start_s", 0))
        end_s = float(clip.get("end_s", start_s + config.max_duration_s))
        if end_s <= start_s:
            end_s = start_s + config.min_duration_s
        dur = end_s - start_s
        if dur < config.min_duration_s:
            end_s = min(video_duration_s, start_s + config.min_duration_s)
        if dur > config.max_duration_s:
            end_s = start_s + config.max_duration_s
        end_s = min(end_s, video_duration_s)
        start_s = max(0.0, start_s)
        # Extend through last overlapping line + any line that starts at end_s
        # (payoff often begins at the timestamp Gemini used as end_s)
        end_s = finalize_clip_end(
            transcript, start_s, end_s, video_duration_s=video_duration_s
        )
        validated.append(
            {
                "id": clip.get("id") or f"{i + 1:02d}",
                "title": clip.get("title") or f"clip-{i + 1}",
                "start_s": round(start_s, 3),
                "end_s": round(end_s, 3),
                "score": int(clip.get("score", 50)),
                "hook": clip.get("hook", ""),
                "reason": clip.get("reason", ""),
                "caption": clip.get("caption", ""),
            }
        )
    return validated


def write_clips(path: Path, clips: list[dict[str, Any]]) -> None:
    path.write_text(json.dumps(clips, indent=2, ensure_ascii=False), encoding="utf-8")
