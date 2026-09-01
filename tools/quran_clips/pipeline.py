"""Download (optional) + cut Quran clips + write YouTube packaging files."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any, Callable

from clip_factory.common import JOBS_DIR, JobConfig, JobPaths, slugify
from clip_factory.export_clips import export_clip, export_stitched_segments, probe_duration

from .audio_end import apply_next_sound_ends
from .titles import DEFAULT_END_BUFFER_S, normalize_clip

LogFn = Callable[[str], None]


class QuranJobError(Exception):
    pass


def _safe_filename(title: str, max_len: int = 120) -> str:
    s = re.sub(r'[<>:"/\\|?*]+', "", title)
    s = re.sub(r"\s+", " ", s).strip(" .")
    return (s[:max_len] or "quran-clip").rstrip()


def job_id_from_video_title(video_title: str, *, video_filename: str = "") -> str:
    """Folder name = source video title (filename stem if title empty)."""
    title = (video_title or "").strip()
    if not title and video_filename:
        title = Path(video_filename).stem
    title = title.replace("_", " ")
    jid = _safe_filename(title, max_len=140)
    if not jid or jid == "quran-clip":
        raise QuranJobError("Video title is required (used as the job folder name)")
    return jid


def job_dir_exists(job_id: str) -> bool:
    root = JOBS_DIR / job_id
    return root.exists()


def allocate_job_id(base: str, *, taken: set[str] | None = None) -> str:
    """Keep the title folder if free; otherwise title_2, title_3, … so old cuts stay."""
    taken = taken or set()

    def occupied(jid: str) -> bool:
        return jid in taken or job_dir_exists(jid)

    if not occupied(base):
        return base
    n = 2
    while n <= 999:
        candidate = f"{base}_{n}"
        if not occupied(candidate):
            return candidate
        n += 1
    raise QuranJobError(f"Too many copies of work/clip-jobs/{base}")


def download_youtube(url: str, dest: Path, log: LogFn | None = None) -> Path:
    """Download a YouTube video with yt-dlp into dest (mp4)."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    out_tmpl = str(dest.with_suffix("")) + ".%(ext)s"
    cmd = [
        "yt-dlp",
        "--no-update",
        "--extractor-args",
        "youtube:player_client=android,tv",
        "-f",
        "bv*+ba/b",
        "--merge-output-format",
        "mp4",
        "-o",
        out_tmpl,
        url,
    ]
    if log:
        log(f"Downloading: {url}\n")
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise QuranJobError(
            "yt-dlp failed. Install/update yt-dlp and retry.\n"
            + (r.stderr or r.stdout or "")[:800]
        )
    # Prefer exact dest if created; else find newest mp4 in parent
    if dest.exists():
        return dest
    candidates = sorted(dest.parent.glob(dest.stem + ".*"), key=lambda p: p.stat().st_mtime, reverse=True)
    for p in candidates:
        if p.suffix.lower() in {".mp4", ".mkv", ".webm", ".mov"}:
            if p != dest:
                if dest.exists():
                    dest.unlink()
                p.rename(dest)
            return dest
    raise QuranJobError("Download finished but no video file was found")


def preview_packaging(
    clips_raw: list[dict[str, Any]],
    meta: dict[str, str],
) -> list[dict[str, Any]]:
    return [normalize_clip(c, meta) for c in clips_raw]


def run_quran_job(
    *,
    clips_raw: list[dict[str, Any]],
    meta: dict[str, str],
    youtube_url: str | None = None,
    video_path: Path | None = None,
    video_title: str = "",
    job_id: str | None = None,
    end_buffer_s: float = DEFAULT_END_BUFFER_S,
    log: LogFn | None = None,
) -> dict[str, Any]:
    def _log(msg: str) -> None:
        if log:
            log(msg)

    if not clips_raw:
        raise QuranJobError("Add at least one clip (Surah + start/end)")

    clips = preview_packaging(clips_raw, meta)
    title_for_id = (video_title or "").strip()
    if not title_for_id and video_path:
        title_for_id = video_path.stem
    base_id = job_id or job_id_from_video_title(title_for_id)
    jid = allocate_job_id(base_id)
    if jid != base_id:
        _log(f"Already had work/clip-jobs/{base_id} — saving this cut as {jid}\n")
    job = JobPaths.create(jid)
    config = JobConfig(
        mode="clips",
        profile="source",
        burn_captions=False,
        keep_original_audio=True,
        add_voice=False,
        stitch=False,
        max_clips=len(clips),
        encode_quality="highest",
    )
    job.save_config(config)

    title_for_file = (video_title or "").strip()
    if not title_for_file and video_path:
        title_for_file = video_path.stem
    input_name = _safe_filename(title_for_file) if title_for_file else "source"
    src_dest = job.input_dir / f"{input_name}.mp4"
    if youtube_url and youtube_url.strip():
        download_youtube(youtube_url.strip(), src_dest, log=_log)
    elif video_path and video_path.exists():
        _log(f"Using local video: {video_path.name}\n")
        _log(f"Saving to input: {src_dest.name}\n")
        if src_dest.exists():
            src_dest.unlink()
        try:
            src_dest.hardlink_to(video_path.resolve())
        except OSError:
            shutil.copy2(video_path, src_dest)
    else:
        raise QuranJobError("Provide a YouTube URL or a local video file")

    duration = probe_duration(src_dest)
    _log(f"Video duration: {duration:.1f}s\n")

    def _segments(c: dict[str, Any]) -> list[dict[str, Any]]:
        segs = c.get("segments")
        if isinstance(segs, list) and len(segs) >= 2:
            return segs
        return [{"start_s": c["start_s"], "end_s": c["end_s"]}]

    for c in clips:
        for seg in _segments(c):
            end_s = float(seg["end_s"])
            if end_s > duration + 1:
                raise QuranJobError(
                    f"Clip '{c['surah']}' ends at {end_s:.1f}s but video is only {duration:.1f}s"
                )

    pad = max(0.0, float(end_buffer_s or 0))
    if pad > 0:
        clips = apply_next_sound_ends(
            clips,
            src_dest,
            duration_s=duration,
            max_wait_s=pad,
            log=_log,
        )

    # Minimal transcript (no burn)
    job.transcript_path.write_text(
        json.dumps({"format": "manual", "untimed": True, "lines": [], "total_ms": int(duration * 1000)}, indent=2),
        encoding="utf-8",
    )

    packaging: list[dict[str, Any]] = []
    outputs: list[str] = []
    log_lock = threading.Lock()

    def _log_locked(msg: str) -> None:
        with log_lock:
            _log(msg)

    def _export_one(i: int, c: dict[str, Any]) -> tuple[int, dict[str, Any], str]:
        cid = f"{i:02d}"
        fname = _safe_filename(c["youtube_title"]) + ".mp4"
        out = job.output_dir / fname
        segs = _segments(c)
        if len(segs) == 1:
            _log_locked(f"Cutting {cid}: {c['start_s']:.1f}s → {c['end_s']:.1f}s — {c['surah']}\n")
            export_clip(
                src_dest,
                out,
                c["start_s"],
                c["end_s"],
                config,
                transcript=None,
                title=c["surah"],
            )
        else:
            seg_ranges = [(float(seg["start_s"]), float(seg["end_s"])) for seg in segs]
            for j, (a, b) in enumerate(seg_ranges, 1):
                _log_locked(f"Cutting {cid} rak'ah {j}: {a:.1f}s → {b:.1f}s — {c['surah']}\n")
            _log_locked(f"Stitching {cid} into one clip ({len(seg_ranges)} rak'ahs, single encode)\n")
            export_stitched_segments(
                src_dest,
                out,
                seg_ranges,
                config,
                title=c["surah"],
            )
        desc_path = job.output_dir / f"{cid}-{slugify(c['surah'])}.description.txt"
        desc_path.write_text(c["description"], encoding="utf-8")
        title_path = job.output_dir / f"{cid}-{slugify(c['surah'])}.title.txt"
        title_path.write_text(c["youtube_title"], encoding="utf-8")
        pack_item = {
            "id": cid,
            "surah": c["surah"],
            "start_s": c["start_s"],
            "end_s": c["end_s"],
            "segments": segs if len(segs) >= 2 else None,
            "youtube_title": c["youtube_title"],
            "title_len": c["title_len"],
            "description": c["description"],
            "video": fname,
            "description_file": desc_path.name,
            "title_file": title_path.name,
        }
        return i, pack_item, str(out)

    if len(clips) == 1:
        _, pack_item, out_path = _export_one(1, clips[0])
        packaging.append(pack_item)
        outputs.append(out_path)
    else:
        results: dict[int, tuple[dict[str, Any], str]] = {}
        with ThreadPoolExecutor(max_workers=2) as pool:
            futures = [pool.submit(_export_one, i, c) for i, c in enumerate(clips, 1)]
            for fut in as_completed(futures):
                idx, pack_item, out_path = fut.result()
                results[idx] = (pack_item, out_path)
        for idx in sorted(results):
            pack_item, out_path = results[idx]
            packaging.append(pack_item)
            outputs.append(out_path)

    pack_path = job.root / "packaging.json"
    pack_path.write_text(
        json.dumps({"meta": meta, "clips": packaging}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    job.clips_path.write_text(
        json.dumps(
            [
                {
                    "id": p["id"],
                    "title": p["youtube_title"],
                    "start_s": p["start_s"],
                    "end_s": p["end_s"],
                    "score": 100,
                    "hook": p["surah"],
                    "reason": "Quran Clips UI",
                    "caption": "",
                    "youtube_title": p["youtube_title"],
                }
                for p in packaging
            ],
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    _log("Done.\n")
    return {
        "job_id": job.job_id,
        "job_dir": str(job.root),
        "outputs": outputs,
        "packaging": packaging,
        "meta": meta,
    }
