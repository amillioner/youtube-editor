"""End-to-end Clip Factory pipeline orchestration."""
from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

from .common import DEFAULT_ELEVENLABS_VOICE_ID, JobConfig, JobPaths
from .detect_scenes import select_scene_clips, write_scenes_debug
from .export_clips import export_all, probe_duration, stitch_outputs
from .gen_voiceover import add_voice_from_clips_json
from .parse_transcript import parse_caption_file, write_transcript
from .select_clips import select_clips, write_clips


class PipelineError(Exception):
    pass


def run_pipeline(
    video_path: Path,
    captions_path: Path,
    config: JobConfig,
    *,
    job_id: str | None = None,
    dry_run: bool = False,
) -> dict[str, Any]:
    if not video_path.exists():
        raise PipelineError(f"Video not found: {video_path}")
    if not captions_path.exists():
        raise PipelineError(f"Captions not found: {captions_path}")

    job = JobPaths.create(job_id)
    job.save_config(config)

    vid_dest = job.input_dir / f"source{video_path.suffix.lower() or '.mp4'}"
    shutil.copy2(video_path, vid_dest)
    cap_dest = job.input_dir / f"captions{captions_path.suffix.lower() or '.srt'}"
    shutil.copy2(captions_path, cap_dest)

    transcript = parse_caption_file(cap_dest)
    write_transcript(job.transcript_path, transcript)

    video_duration_s = probe_duration(job.video)

    if config.mode == "scenes":
        clips, scenes_debug = select_scene_clips(
            job.video,
            job.transcript_path,
            config,
            video_duration_s,
            skip_visual=dry_run,
            stats_csv=job.root / "scene-stats.csv",
            thumbs_dir=job.output_dir / "_scene_thumbs",
        )
        write_scenes_debug(job.root / "scenes.json", scenes_debug)
        print(
            f"[clip_factory] scenes mode: {len(clips)} clip(s), "
            f"scenes.json -> {job.root / 'scenes.json'}",
            flush=True,
        )
    else:
        clips = select_clips(
            job.transcript_path,
            config,
            video_duration_s,
            dry_run=dry_run,
        )
    write_clips(job.clips_path, clips)

    if dry_run:
        return {
            "job_id": job.job_id,
            "job_dir": str(job.root),
            "clips": clips,
            "dry_run": True,
            "outputs": [],
            "stitched": config.wants_stitch(),
        }

    outputs = export_all(job, config)

    if config.add_voice:
        voice_id = config.voice_id.strip() or DEFAULT_ELEVENLABS_VOICE_ID
        add_voice_from_clips_json(job.output_dir, job.clips_path, voice_id)

    if config.wants_stitch() and outputs:
        # Prefer stitching after voiceover so the compilation includes TTS audio
        stitch_paths = []
        for p in outputs:
            if p.exists():
                stitch_paths.append(p)
        if stitch_paths:
            compilation = stitch_outputs(stitch_paths, job)
            # Surface compilation first in downloads / result list
            outputs = [compilation] + [p for p in outputs if p != compilation]

    return {
        "job_id": job.job_id,
        "job_dir": str(job.root),
        "clips": clips,
        "outputs": [str(p) for p in outputs],
        "stitched": config.wants_stitch(),
    }
