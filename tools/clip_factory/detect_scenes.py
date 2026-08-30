"""Hybrid scene splitting: transcript gaps + PySceneDetect (FFmpeg fallback)."""
from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path
from typing import Any

from .common import JobConfig
from .parse_transcript import load_transcript, lines_in_range

_PTS_TIME = re.compile(r"pts_time:([\d.]+)")

SCENE_DETECTORS = ("content", "adaptive", "fade", "hybrid", "ffmpeg")


def group_transcript_scenes(
    lines: list[dict[str, Any]],
    gap_threshold_s: float,
) -> list[list[dict[str, Any]]]:
    """Group timed transcript lines into scenes by start-time gaps.

    A new group starts when the gap between consecutive line starts is
    *greater than* gap_threshold_s seconds (exact threshold stays in-scene).
    """
    timed = [ln for ln in lines if ln.get("start_ms") is not None]
    if not timed:
        return []

    timed = sorted(timed, key=lambda ln: int(ln["start_ms"]))
    gap_ms = int(gap_threshold_s * 1000)
    groups: list[list[dict[str, Any]]] = [[timed[0]]]

    for ln in timed[1:]:
        prev_start = int(groups[-1][-1]["start_ms"])
        cur_start = int(ln["start_ms"])
        if cur_start - prev_start > gap_ms:
            groups.append([ln])
        else:
            groups[-1].append(ln)

    return groups


def draft_boundaries_from_groups(
    groups: list[list[dict[str, Any]]],
    video_duration_s: float,
) -> list[dict[str, Any]]:
    """Build draft {start_s, end_s, lines} segments from transcript groups.

    Each group's start is the first line's start. End is the next group's
    start (or video duration for the last group). First group starts at 0
    when narration begins after a cold open / silence.
    """
    if not groups:
        return []

    starts = [int(g[0]["start_ms"]) / 1000.0 for g in groups]
    # Include content before the first narration line as part of scene 1
    starts[0] = 0.0

    drafts: list[dict[str, Any]] = []
    for i, group in enumerate(groups):
        start_s = starts[i]
        if i + 1 < len(starts):
            end_s = starts[i + 1]
        else:
            end_s = video_duration_s
        end_s = min(end_s, video_duration_s)
        if end_s <= start_s:
            continue
        drafts.append(
            {
                "start_s": round(start_s, 3),
                "end_s": round(end_s, 3),
                "lines": group,
                "draft_start_s": round(start_s, 3),
                "draft_end_s": round(end_s, 3),
            }
        )
    return drafts


def detect_visual_scenes_ffmpeg(video_path: Path, threshold: float = 0.35) -> list[float]:
    """Detect visual cut times via FFmpeg scene filter. Returns seconds."""
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-i",
        str(video_path),
        "-filter:v",
        f"select='gt(scene\\,{threshold})',showinfo",
        "-f",
        "null",
        "-",
    ]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, check=False)
    except FileNotFoundError:
        return []

    times: list[float] = []
    for m in _PTS_TIME.finditer(r.stderr or ""):
        t = float(m.group(1))
        if not times or abs(t - times[-1]) > 0.05:
            times.append(t)
    return times


def _pyscenedetect_available() -> bool:
    try:
        import scenedetect  # noqa: F401
        return True
    except ImportError:
        return False


def detect_visual_scenes_pyscenedetect(
    video_path: Path,
    *,
    detector: str = "content",
    content_threshold: float = 27.0,
    fade_threshold: float = 12.0,
    min_scene_len_frames: int = 15,
    stats_csv: Path | None = None,
) -> tuple[list[float], dict[str, Any]]:
    """Detect visual cut times via PySceneDetect. Returns (cut_seconds, meta)."""
    from scenedetect import SceneManager, open_video
    from scenedetect.detectors import AdaptiveDetector, ContentDetector, ThresholdDetector
    from scenedetect.stats_manager import StatsManager

    detector = (detector or "content").lower().strip()
    if detector not in SCENE_DETECTORS or detector == "ffmpeg":
        detector = "content"

    video = open_video(str(video_path))
    stats_manager = StatsManager() if stats_csv is not None else None
    scene_manager = SceneManager(stats_manager=stats_manager)

    min_len = max(1, int(min_scene_len_frames))
    if detector == "adaptive":
        scene_manager.add_detector(
            AdaptiveDetector(
                adaptive_threshold=3.0,
                min_scene_len=min_len,
                min_content_val=content_threshold,
            )
        )
    elif detector == "fade":
        scene_manager.add_detector(
            ThresholdDetector(threshold=fade_threshold, min_scene_len=min_len)
        )
    elif detector == "hybrid":
        scene_manager.add_detector(
            ContentDetector(threshold=content_threshold, min_scene_len=min_len)
        )
        scene_manager.add_detector(
            ThresholdDetector(threshold=fade_threshold, min_scene_len=min_len)
        )
    else:
        detector = "content"
        scene_manager.add_detector(
            ContentDetector(threshold=content_threshold, min_scene_len=min_len)
        )

    scene_manager.detect_scenes(video, show_progress=False)
    scene_list = scene_manager.get_scene_list(start_in_scene=True)

    # Cut points = start of each scene after the first
    cuts: list[float] = []
    for start, _end in scene_list[1:]:
        t = float(start.get_seconds())
        if not cuts or abs(t - cuts[-1]) > 0.05:
            cuts.append(t)

    stats_path: str | None = None
    if stats_csv is not None and stats_manager is not None:
        stats_csv.parent.mkdir(parents=True, exist_ok=True)
        stats_manager.save_to_csv(str(stats_csv))
        stats_path = str(stats_csv)

    meta = {
        "backend": "pyscenedetect",
        "detector": detector,
        "content_threshold": content_threshold,
        "fade_threshold": fade_threshold,
        "min_scene_len_frames": min_len,
        "scene_count": len(scene_list),
        "stats_csv": stats_path,
    }
    return cuts, meta


def detect_visual_scenes(
    video_path: Path,
    *,
    detector: str = "content",
    content_threshold: float = 27.0,
    fade_threshold: float = 12.0,
    min_scene_len_frames: int = 15,
    ffmpeg_threshold: float = 0.35,
    stats_csv: Path | None = None,
) -> tuple[list[float], dict[str, Any]]:
    """Detect visual cuts. Prefers PySceneDetect; falls back to FFmpeg."""
    want_ffmpeg = (detector or "").lower().strip() == "ffmpeg"
    if not want_ffmpeg and _pyscenedetect_available():
        try:
            return detect_visual_scenes_pyscenedetect(
                video_path,
                detector=detector,
                content_threshold=content_threshold,
                fade_threshold=fade_threshold,
                min_scene_len_frames=min_scene_len_frames,
                stats_csv=stats_csv,
            )
        except Exception as exc:  # noqa: BLE001 — fall back to FFmpeg
            cuts = detect_visual_scenes_ffmpeg(video_path, ffmpeg_threshold)
            return cuts, {
                "backend": "ffmpeg",
                "detector": "ffmpeg",
                "ffmpeg_threshold": ffmpeg_threshold,
                "fallback_reason": str(exc),
                "stats_csv": None,
            }

    cuts = detect_visual_scenes_ffmpeg(video_path, ffmpeg_threshold)
    return cuts, {
        "backend": "ffmpeg",
        "detector": "ffmpeg",
        "ffmpeg_threshold": ffmpeg_threshold,
        "fallback_reason": None if want_ffmpeg else "scenedetect not installed",
        "stats_csv": None,
    }


def _snap_time(
    t: float,
    visual_cuts: list[float],
    tolerance_s: float,
    *,
    prefer: str = "nearest",
) -> float:
    """Snap t to a visual cut within tolerance.

    prefer:
      - nearest: closest cut (either side)
      - forward: only cuts at or after t (scene ends — don't eat narration)
      - backward: only cuts at or before t (scene starts)
    """
    if not visual_cuts or tolerance_s <= 0:
        return t
    best = t
    best_dist = tolerance_s + 1.0
    for cut in visual_cuts:
        dist = abs(cut - t)
        if dist > tolerance_s or dist >= best_dist:
            continue
        if prefer == "forward" and cut < t:
            continue
        if prefer == "backward" and cut > t:
            continue
        best = cut
        best_dist = dist
    return best


def snap_boundaries(
    drafts: list[dict[str, Any]],
    visual_cuts: list[float],
    *,
    snap_tolerance_s: float,
    min_duration_s: float,
    video_duration_s: float,
    end_pad_s: float = 0.0,
) -> list[dict[str, Any]]:
    """Snap draft start/end to nearest visual cuts; merge short scenes.

    Interior boundaries (scene ends / next starts) prefer a visual cut at or
    after the draft time so narration at the boundary is not truncated.
    """
    if not drafts:
        return []

    # Collect unique boundary times (starts + final end)
    raw_bounds = [d["start_s"] for d in drafts] + [drafts[-1]["end_s"]]
    snapped: list[float] = []
    for i, t in enumerate(raw_bounds):
        if i == 0:
            snapped.append(0.0)
            continue
        if i == len(raw_bounds) - 1:
            snapped.append(min(video_duration_s, max(t, snapped[-1] + min_duration_s * 0.5)))
            continue
        # Interior: prefer forward so previous scene's end is not pulled earlier
        s = _snap_time(t, visual_cuts, snap_tolerance_s, prefer="forward")
        # Enforce strictly increasing
        s = max(s, snapped[-1] + 0.05)
        snapped.append(min(s, video_duration_s))

    # Build segments aligned to drafts
    segments: list[dict[str, Any]] = []
    for i, draft in enumerate(drafts):
        start_s = snapped[i]
        end_s = snapped[i + 1] if i + 1 < len(snapped) else video_duration_s
        end_s = min(end_s, video_duration_s)
        if end_s <= start_s:
            continue
        segments.append(
            {
                **draft,
                "start_s": round(start_s, 3),
                "end_s": round(end_s, 3),
                "snapped": abs(start_s - draft["draft_start_s"]) > 0.01
                or abs(end_s - draft["draft_end_s"]) > 0.01,
            }
        )

    # Merge clips shorter than min_duration_s into the next (or previous) neighbor
    if min_duration_s <= 0:
        merged = segments
    else:
        merged = []
        i = 0
        while i < len(segments):
            seg = segments[i]
            dur = seg["end_s"] - seg["start_s"]
            if dur < min_duration_s and i + 1 < len(segments):
                # Merge into next
                nxt = segments[i + 1]
                combined_lines = list(seg.get("lines") or []) + list(nxt.get("lines") or [])
                segments[i + 1] = {
                    **nxt,
                    "start_s": seg["start_s"],
                    "draft_start_s": seg.get("draft_start_s", seg["start_s"]),
                    "lines": combined_lines,
                    "snapped": seg.get("snapped") or nxt.get("snapped"),
                }
                i += 1
                continue
            if dur < min_duration_s and merged:
                # Merge into previous
                prev = merged[-1]
                prev["end_s"] = seg["end_s"]
                prev["draft_end_s"] = seg.get("draft_end_s", seg["end_s"])
                prev["lines"] = list(prev.get("lines") or []) + list(seg.get("lines") or [])
                prev["snapped"] = prev.get("snapped") or seg.get("snapped")
                i += 1
                continue
            merged.append(seg)
            i += 1

    # Narration tail pad — slight overlap into the next scene is OK for shorts
    if end_pad_s > 0 and merged:
        for seg in merged:
            padded = min(video_duration_s, float(seg["end_s"]) + end_pad_s)
            seg["end_s"] = round(padded, 3)

    return merged


def drafts_from_visual_only(
    visual_cuts: list[float],
    video_duration_s: float,
    transcript: dict[str, Any],
) -> list[dict[str, Any]]:
    """Fallback: one segment between consecutive visual cuts."""
    bounds = [0.0] + [c for c in visual_cuts if 0 < c < video_duration_s] + [video_duration_s]
    # Deduplicate
    cleaned: list[float] = []
    for b in bounds:
        if not cleaned or abs(b - cleaned[-1]) > 0.05:
            cleaned.append(b)

    drafts: list[dict[str, Any]] = []
    for i in range(len(cleaned) - 1):
        start_s, end_s = cleaned[i], cleaned[i + 1]
        if end_s <= start_s:
            continue
        group_lines = lines_in_range(transcript, start_s, end_s)
        # lines_in_range returns clip-local times; re-fetch absolute for titles
        abs_lines = []
        for ln in transcript.get("lines", []):
            s = ln.get("start_ms")
            e = ln.get("end_ms")
            if s is None or e is None:
                continue
            if e / 1000 <= start_s or s / 1000 >= end_s:
                continue
            abs_lines.append(ln)
        drafts.append(
            {
                "start_s": round(start_s, 3),
                "end_s": round(end_s, 3),
                "draft_start_s": round(start_s, 3),
                "draft_end_s": round(end_s, 3),
                "lines": abs_lines or group_lines,
            }
        )
    return drafts


def _title_from_lines(lines: list[dict[str, Any]], fallback: str = "scene") -> str:
    for ln in lines:
        text = (ln.get("text") or "").strip()
        if text:
            return text[:60]
    return fallback


def _caption_from_lines(lines: list[dict[str, Any]]) -> str:
    return " ".join((ln.get("text") or "").strip() for ln in lines if ln.get("text")).strip()[:500]


def segments_to_clips(
    segments: list[dict[str, Any]],
    *,
    video_duration_s: float | None = None,
) -> list[dict[str, Any]]:
    clips: list[dict[str, Any]] = []
    for i, seg in enumerate(segments):
        lines = seg.get("lines") or []
        title = _title_from_lines(lines, f"scene-{i + 1}")
        snapped = seg.get("snapped", False)
        reason = (
            f"Scene {i + 1} — transcript gap + visual snap"
            if snapped
            else f"Scene {i + 1} — transcript gap"
        )
        start_s = float(seg["start_s"])
        end_s = float(seg["end_s"])
        # Extend through this scene's own caption lines only
        for ln in lines:
            e = ln.get("end_ms")
            if e is not None:
                end_s = max(end_s, float(e) / 1000.0)
        if video_duration_s is not None:
            end_s = min(end_s, video_duration_s)
        clips.append(
            {
                "id": f"{i + 1:02d}",
                "title": title,
                "start_s": round(start_s, 3),
                "end_s": round(end_s, 3),
                "score": 100,
                "hook": title[:120],
                "reason": reason,
                "caption": _caption_from_lines(lines),
            }
        )
    return clips


def export_scene_thumbnails(
    video_path: Path,
    segments: list[dict[str, Any]],
    thumbs_dir: Path,
) -> list[str]:
    """Extract midpoint JPEG for each segment. Returns relative paths written."""
    if not video_path.exists() or not segments:
        return []

    thumbs_dir.mkdir(parents=True, exist_ok=True)
    written: list[str] = []
    for i, seg in enumerate(segments):
        start_s = float(seg["start_s"])
        end_s = float(seg["end_s"])
        mid = (start_s + end_s) / 2.0
        out = thumbs_dir / f"{i + 1:02d}.jpg"
        cmd = [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-ss",
            f"{mid:.3f}",
            "-i",
            str(video_path),
            "-frames:v",
            "1",
            "-q:v",
            "3",
            str(out),
        ]
        try:
            r = subprocess.run(cmd, capture_output=True, text=True, check=False)
        except FileNotFoundError:
            return written
        if r.returncode == 0 and out.exists():
            written.append(str(out))
    return written


def build_scene_debug(
    drafts: list[dict[str, Any]],
    segments: list[dict[str, Any]],
    visual_cuts: list[float],
    config: JobConfig,
    *,
    detect_meta: dict[str, Any] | None = None,
    thumb_paths: list[str] | None = None,
) -> dict[str, Any]:
    meta = detect_meta or {}
    return {
        "gap_threshold_s": config.scene_gap_threshold_s,
        "visual_threshold": config.scene_visual_threshold,
        "snap_tolerance_s": config.scene_snap_tolerance_s,
        "min_duration_s": config.min_duration_s,
        "scene_end_pad_s": config.scene_end_pad_s,
        "scene_detector": config.scene_detector,
        "scene_content_threshold": config.scene_content_threshold,
        "scene_fade_threshold": config.scene_fade_threshold,
        "scene_min_scene_len_frames": config.scene_min_scene_len_frames,
        "detect_backend": meta.get("backend"),
        "detect_detector": meta.get("detector"),
        "detect_fallback_reason": meta.get("fallback_reason"),
        "stats_csv": meta.get("stats_csv"),
        "visual_cut_count": len(visual_cuts),
        "visual_cuts": visual_cuts[:500],
        "draft_count": len(drafts),
        "drafts": [
            {
                "start_s": d["draft_start_s"],
                "end_s": d["draft_end_s"],
                "line_count": len(d.get("lines") or []),
                "title": _title_from_lines(d.get("lines") or []),
            }
            for d in drafts
        ],
        "final_count": len(segments),
        "final": [
            {
                "start_s": s["start_s"],
                "end_s": s["end_s"],
                "draft_start_s": s.get("draft_start_s"),
                "draft_end_s": s.get("draft_end_s"),
                "snapped": bool(s.get("snapped")),
                "title": _title_from_lines(s.get("lines") or []),
            }
            for s in segments
        ],
        "thumbnails": thumb_paths or [],
    }


def select_scene_clips(
    video_path: Path,
    transcript_path: Path,
    config: JobConfig,
    video_duration_s: float,
    *,
    skip_visual: bool = False,
    stats_csv: Path | None = None,
    thumbs_dir: Path | None = None,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    """Select one clip per scene. Returns (clips, scenes_debug)."""
    transcript = load_transcript(transcript_path)

    if transcript.get("untimed"):
        raise RuntimeError(
            "Scenes mode requires timed captions (YouTube [MM:SS] paste, SRT, or VTT)."
        )

    lines = transcript.get("lines") or []
    gap = config.scene_gap_threshold_s
    groups = group_transcript_scenes(lines, gap)
    drafts = draft_boundaries_from_groups(groups, video_duration_s)

    visual_cuts: list[float] = []
    detect_meta: dict[str, Any] = {"backend": None, "detector": None, "stats_csv": None}
    if not skip_visual and video_path.exists():
        csv_path = stats_csv
        if csv_path is None and config.scene_export_stats:
            csv_path = video_path.parent.parent / "scene-stats.csv"
        visual_cuts, detect_meta = detect_visual_scenes(
            video_path,
            detector=config.scene_detector,
            content_threshold=config.scene_content_threshold,
            fade_threshold=config.scene_fade_threshold,
            min_scene_len_frames=config.scene_min_scene_len_frames,
            ffmpeg_threshold=config.scene_visual_threshold,
            stats_csv=csv_path if config.scene_export_stats else None,
        )

    # If transcript produced too few groups (e.g. dense SRT), fall back to visual-only
    if len(drafts) <= 1 and visual_cuts:
        drafts = drafts_from_visual_only(visual_cuts, video_duration_s, transcript)

    if not drafts:
        # Absolute fallback: whole video as one scene
        drafts = [
            {
                "start_s": 0.0,
                "end_s": video_duration_s,
                "draft_start_s": 0.0,
                "draft_end_s": video_duration_s,
                "lines": lines,
            }
        ]

    segments = snap_boundaries(
        drafts,
        visual_cuts,
        snap_tolerance_s=config.scene_snap_tolerance_s,
        min_duration_s=config.min_duration_s,
        video_duration_s=video_duration_s,
        end_pad_s=config.scene_end_pad_s,
    )

    thumb_paths: list[str] = []
    if (
        not skip_visual
        and config.scene_export_thumbs
        and video_path.exists()
        and segments
    ):
        out_dir = thumbs_dir
        if out_dir is None:
            out_dir = video_path.parent.parent / "output" / "_scene_thumbs"
        thumb_paths = export_scene_thumbnails(video_path, segments, out_dir)

    clips = segments_to_clips(segments, video_duration_s=video_duration_s)
    debug = build_scene_debug(
        drafts,
        segments,
        visual_cuts,
        config,
        detect_meta=detect_meta,
        thumb_paths=thumb_paths,
    )
    return clips, debug


def write_scenes_debug(path: Path, debug: dict[str, Any]) -> None:
    path.write_text(json.dumps(debug, indent=2, ensure_ascii=False), encoding="utf-8")


def preview_scenes_from_transcript(
    transcript: dict[str, Any],
    *,
    gap_threshold_s: float = 10.0,
    min_duration_s: float = 3.0,
    video_duration_s: float | None = None,
    video_path: Path | None = None,
    snap_tolerance_s: float = 2.0,
    end_pad_s: float = 0.75,
    detector: str = "content",
    content_threshold: float = 27.0,
    fade_threshold: float = 12.0,
    min_scene_len_frames: int = 15,
    ffmpeg_threshold: float = 0.35,
    skip_visual: bool = False,
) -> dict[str, Any]:
    """Scene preview for the UI. Optionally snaps to visual cuts when video is provided."""
    if transcript.get("untimed"):
        return {
            "error": "Scenes mode requires timed captions",
            "untimed": True,
            "scene_count": 0,
            "scenes": [],
        }

    lines = transcript.get("lines") or []
    total_ms = transcript.get("total_ms") or 0
    dur = video_duration_s if video_duration_s is not None else (total_ms / 1000.0 if total_ms else 0.0)
    if dur <= 0 and lines:
        dur = max(int(ln.get("end_ms") or 0) for ln in lines) / 1000.0

    groups = group_transcript_scenes(lines, gap_threshold_s)
    drafts = draft_boundaries_from_groups(groups, dur or 1.0)

    visual_cuts: list[float] = []
    detect_meta: dict[str, Any] = {}
    if not skip_visual and video_path is not None and video_path.exists():
        visual_cuts, detect_meta = detect_visual_scenes(
            video_path,
            detector=detector,
            content_threshold=content_threshold,
            fade_threshold=fade_threshold,
            min_scene_len_frames=min_scene_len_frames,
            ffmpeg_threshold=ffmpeg_threshold,
            stats_csv=None,
        )
        if len(drafts) <= 1 and visual_cuts:
            drafts = drafts_from_visual_only(visual_cuts, dur or 1.0, transcript)

    segments = snap_boundaries(
        drafts,
        visual_cuts,
        snap_tolerance_s=snap_tolerance_s if visual_cuts else 0.0,
        min_duration_s=min_duration_s,
        video_duration_s=dur or 1.0,
        end_pad_s=end_pad_s,
    )

    scenes = [
        {
            "id": f"{i + 1:02d}",
            "start_s": s["start_s"],
            "end_s": s["end_s"],
            "duration_s": round(s["end_s"] - s["start_s"], 3),
            "title": _title_from_lines(s.get("lines") or []),
            "snapped": bool(s.get("snapped")),
        }
        for i, s in enumerate(segments)
    ]
    snapped_count = sum(1 for s in scenes if s.get("snapped"))
    return {
        "untimed": False,
        "scene_count": len(scenes),
        "draft_count": len(drafts),
        "visual_cut_count": len(visual_cuts),
        "snapped_count": snapped_count,
        "gap_threshold_s": gap_threshold_s,
        "detect_backend": detect_meta.get("backend"),
        "detect_detector": detect_meta.get("detector") or detector,
        "warning": "More than 100 scenes — export may take a while" if len(scenes) > 100 else None,
        "scenes": scenes,
    }
