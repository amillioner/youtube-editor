"""FFmpeg export: cut clips, optional crop/scale, burn captions."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from .common import JobConfig, JobPaths, slugify
from .parse_transcript import lines_in_range, load_transcript


def probe_duration(path: Path) -> float:
    r = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=nw=1:nk=1",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(r.stdout.strip())


def probe_video_size(path: Path) -> tuple[int, int]:
    r = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-of",
            "json",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    data = json.loads(r.stdout)
    st = data["streams"][0]
    return int(st["width"]), int(st["height"])


def _ffmpeg_escape_sub_path(path: Path) -> str:
    """Escape path for ffmpeg subtitles filter on Windows."""
    s = str(path.resolve()).replace("\\", "/")
    s = s.replace(":", "\\:")
    return s


def _video_filter(config: JobConfig, width: int, height: int) -> str | None:
    if not config.crop_enabled() and config.profile == "source":
        if width <= 1920 and height <= 1920:
            return None
        return "scale='min(1920,iw)':-2"

    if config.profile == "horizontal":
        return (
            "scale=1920:1080:force_original_aspect_ratio=decrease,"
            "pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p"
        )

    if config.profile == "shorts":
        # Center crop to 9:16 then scale to 1080x1920
        return (
            "scale=1080:1920:force_original_aspect_ratio=increase,"
            "crop=1080:1920,format=yuv420p"
        )

    # source with crop flag on — pad to 16:9 without aggressive crop
    if config.crop_enabled():
        return (
            "scale=1920:1080:force_original_aspect_ratio=decrease,"
            "pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p"
        )
    return None


def write_clip_srt(lines: list[dict], dest: Path) -> None:
    def fmt_ms(ms: int) -> str:
        h = ms // 3_600_000
        m = (ms % 3_600_000) // 60_000
        s = (ms % 60_000) // 1000
        frac = ms % 1000
        return f"{h:02d}:{m:02d}:{s:02d},{frac:03d}"

    parts = []
    for i, ln in enumerate(lines, 1):
        parts.append(str(i))
        parts.append(f"{fmt_ms(int(ln['start_ms']))} --> {fmt_ms(int(ln['end_ms']))}")
        parts.append(ln["text"])
        parts.append("")
    dest.write_text("\n".join(parts), encoding="utf-8")


def export_clip(
    video: Path,
    out: Path,
    start_s: float,
    end_s: float,
    config: JobConfig,
    transcript: dict | None,
    *,
    title: str = "clip",
) -> None:
    dur = max(0.1, end_s - start_s)
    vw, vh = probe_video_size(video)
    vf = _video_filter(config, vw, vh)
    work = out.parent / "_tmp"
    work.mkdir(exist_ok=True)
    sub_path = work / f"{out.stem}.srt"

    filters: list[str] = []
    if vf:
        filters.append(vf)
    if config.burn_captions and transcript:
        clip_lines = lines_in_range(transcript, start_s, end_s)
        if clip_lines:
            write_clip_srt(clip_lines, sub_path)
            sub_esc = _ffmpeg_escape_sub_path(sub_path)
            filters.append(f"subtitles='{sub_esc}'")

    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-ss",
        f"{start_s:.3f}",
        "-t",
        f"{dur:.3f}",
        "-i",
        str(video),
    ]
    if config.keep_original_audio and not config.add_voice:
        cmd.extend(["-map", "0:v:0", "-map", "0:a:0?"])
    else:
        cmd.extend(["-map", "0:v:0"])
        if not config.add_voice:
            cmd.extend(["-an"])

    if filters:
        cmd.extend(["-vf", ",".join(filters)])
        cmd.extend(["-c:v", "libx264", "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p"])
    else:
        cmd.extend(["-c:v", "copy"])

    if config.keep_original_audio and not config.add_voice:
        cmd.extend(["-c:a", "aac", "-b:a", "192k"])
    cmd.extend(["-movflags", "+faststart", str(out)])

    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stdout + r.stderr)
        raise RuntimeError(f"ffmpeg export failed for {title}")


def export_all(job: JobPaths, config: JobConfig) -> list[Path]:
    clips = json.loads(job.clips_path.read_text(encoding="utf-8"))
    transcript = load_transcript(job.transcript_path) if job.transcript_path.exists() else None
    outputs: list[Path] = []
    for clip in clips:
        cid = clip.get("id", "01")
        title = clip.get("title", "clip")
        fname = f"{cid}-{slugify(title)}.mp4"
        out = job.output_dir / fname
        export_clip(
            job.video,
            out,
            float(clip["start_s"]),
            float(clip["end_s"]),
            config,
            transcript,
            title=title,
        )
        outputs.append(out)
    return outputs


def concat_clips(clip_paths: list[Path], out: Path) -> Path:
    """Stitch exported clips into one MP4 via ffmpeg concat demuxer."""
    if not clip_paths:
        raise RuntimeError("No clips to concatenate")
    if len(clip_paths) == 1:
        # Single clip — copy/rename as compilation
        out.write_bytes(clip_paths[0].read_bytes())
        return out

    work = out.parent / "_tmp"
    work.mkdir(exist_ok=True)
    list_path = work / "concat_list.txt"
    # ffmpeg concat demuxer needs forward-slash paths; escape single quotes
    lines = []
    for p in clip_paths:
        escaped = str(p.resolve()).replace("\\", "/").replace("'", "'\\''")
        lines.append(f"file '{escaped}'")
    list_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    # Re-encode for safety (filters/burns may leave incompatible streams)
    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        str(list_path),
        "-c:v",
        "libx264",
        "-crf",
        "20",
        "-preset",
        "medium",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-movflags",
        "+faststart",
        str(out),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        # Retry without audio if some segments are silent/audio-less
        cmd_no_a = [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(list_path),
            "-c:v",
            "libx264",
            "-crf",
            "20",
            "-preset",
            "medium",
            "-pix_fmt",
            "yuv420p",
            "-an",
            "-movflags",
            "+faststart",
            str(out),
        ]
        r2 = subprocess.run(cmd_no_a, capture_output=True, text=True)
        if r2.returncode != 0:
            sys.stderr.write(r.stdout + r.stderr + r2.stdout + r2.stderr)
            raise RuntimeError("ffmpeg concat failed for compilation")
    return out


def stitch_outputs(clip_paths: list[Path], job: JobPaths) -> Path:
    out = job.output_dir / "compilation.mp4"
    return concat_clips(clip_paths, out)
