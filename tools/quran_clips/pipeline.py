"""Download (optional) + cut Quran clips + write YouTube packaging files."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path
from typing import Any, Callable

from clip_factory.common import JOBS_DIR, JobConfig, JobPaths, new_job_id, slugify
from clip_factory.export_clips import concat_clips, export_clip, probe_duration

from .titles import normalize_clip

LogFn = Callable[[str], None]


class QuranJobError(Exception):
    pass


def _safe_filename(title: str, max_len: int = 120) -> str:
    s = re.sub(r'[<>:"/\\|?*]+', "", title)
    s = re.sub(r"\s+", " ", s).strip(" .")
    return (s[:max_len] or "quran-clip").rstrip()


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
        "b[height<=720]/best[height<=720]/best",
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
    job_id: str | None = None,
    log: LogFn | None = None,
) -> dict[str, Any]:
    def _log(msg: str) -> None:
        if log:
            log(msg)

    if not clips_raw:
        raise QuranJobError("Add at least one clip (Surah + start/end)")

    clips = preview_packaging(clips_raw, meta)
    jid = job_id or f"quran-{new_job_id()}"
    job = JobPaths.create(jid)
    config = JobConfig(
        mode="clips",
        profile="source",
        burn_captions=False,
        keep_original_audio=True,
        add_voice=False,
        stitch=False,
        max_clips=len(clips),
    )
    job.save_config(config)

    # Source video
    src_dest = job.input_dir / "source.mp4"
    if youtube_url and youtube_url.strip():
        download_youtube(youtube_url.strip(), src_dest, log=_log)
    elif video_path and video_path.exists():
        _log(f"Using local video: {video_path.name}\n")
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

    # Minimal transcript (no burn)
    job.transcript_path.write_text(
        json.dumps({"format": "manual", "untimed": True, "lines": [], "total_ms": int(duration * 1000)}, indent=2),
        encoding="utf-8",
    )

    packaging: list[dict[str, Any]] = []
    outputs: list[str] = []

    for i, c in enumerate(clips, 1):
        cid = f"{i:02d}"
        fname = _safe_filename(c["youtube_title"]) + ".mp4"
        out = job.output_dir / fname
        segs = _segments(c)
        if len(segs) == 1:
            _log(f"Cutting {cid}: {c['start_s']:.1f}s → {c['end_s']:.1f}s — {c['surah']}\n")
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
            tmp_dir = job.output_dir / "_tmp"
            tmp_dir.mkdir(parents=True, exist_ok=True)
            tmp_paths: list[Path] = []
            for j, seg in enumerate(segs, 1):
                a, b = float(seg["start_s"]), float(seg["end_s"])
                _log(f"Cutting {cid} rak'ah {j}: {a:.1f}s → {b:.1f}s — {c['surah']}\n")
                tmp = tmp_dir / f"{cid}-r{j}.mp4"
                export_clip(
                    src_dest,
                    tmp,
                    a,
                    b,
                    config,
                    transcript=None,
                    title=f"{c['surah']} r{j}",
                )
                tmp_paths.append(tmp)
            _log(f"Stitching {cid} into one clip ({len(tmp_paths)} rak'ahs)\n")
            concat_clips(tmp_paths, out)
            for p in tmp_paths:
                try:
                    p.unlink()
                except OSError:
                    pass
        desc_path = job.output_dir / f"{cid}-{slugify(c['surah'])}.description.txt"
        desc_path.write_text(c["description"], encoding="utf-8")
        title_path = job.output_dir / f"{cid}-{slugify(c['surah'])}.title.txt"
        title_path.write_text(c["youtube_title"], encoding="utf-8")
        outputs.append(str(out))
        packaging.append(
            {
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
        )

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
