#!/usr/bin/env python3
"""
run_pipeline.py — CLI entry for the Clip Factory (Lane B).

Usage:
  python tools/run_pipeline.py --video path/to/video.mp4 --captions path/to/captions.srt
  python tools/run_pipeline.py --video ep.mp4 --captions ep.srt --profile shorts --mode clips
  python tools/run_pipeline.py --video ep.mp4 --captions ep.srt --mode compilation --max-clips 10
  python tools/run_pipeline.py --video ep.mp4 --captions ep.txt --mode full --profile source
  python tools/run_pipeline.py --video ep.mp4 --captions ep.txt --mode scenes --scene-gap 10 --min-dur 3
  python tools/run_pipeline.py ... --dry-run

Then open the Clip Factory UI:
  python tools/clip_factory/server.py
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "tools"))

from clip_factory.common import JobConfig, DEFAULT_ELEVENLABS_VOICE_ID  # noqa: E402
from clip_factory.pipeline import PipelineError, run_pipeline  # noqa: E402


def main() -> None:
    p = argparse.ArgumentParser(description="Clip Factory - video + captions to exported clips")
    p.add_argument("--video", required=True, help="Path to source video")
    p.add_argument("--captions", required=True, help="Path to captions (.srt, .vtt, .txt, .json)")
    p.add_argument(
        "--mode",
        choices=["clips", "single", "full", "compilation", "scenes"],
        default="clips",
        help="clips=viral MP4s; compilation=stitch viral clips; single=one clip; "
             "full=entire video; scenes=one short per scene change (transcript gaps + visual snap)",
    )
    p.add_argument("--profile", choices=["source", "horizontal", "shorts"], default="source")
    p.add_argument("--crop", action="store_true", default=None, help="Force crop to output aspect")
    p.add_argument("--no-crop", action="store_true", help="Disable crop")
    p.add_argument("--no-captions-burn", action="store_true", help="Skip burning captions")
    p.add_argument("--min-dur", type=float, default=None,
                   help="Min clip length (default: 15 for viral modes, 3 for scenes)")
    p.add_argument("--max-dur", type=float, default=None,
                   help="Max clip length (default: 60 for viral modes, 600 for scenes)")
    p.add_argument("--max-clips", type=int, default=10)
    p.add_argument("--scene-gap", type=float, default=10.0,
                   help="Scenes mode: min seconds between line starts to start a new scene")
    p.add_argument("--scene-detector",
                   choices=["content", "adaptive", "fade", "hybrid", "ffmpeg"],
                   default="content",
                   help="Scenes mode visual detector (default: content via PySceneDetect)")
    p.add_argument("--scene-content-threshold", type=float, default=27.0,
                   help="PySceneDetect Content/Adaptive score (typical 15–40; higher = fewer cuts)")
    p.add_argument("--scene-fade-threshold", type=float, default=12.0,
                   help="ThresholdDetector fade intensity 0–255 (fade/hybrid detectors)")
    p.add_argument("--scene-min-scene-len", type=int, default=15,
                   help="Debounce cuts for this many frames at detection time")
    p.add_argument("--scene-visual-threshold", type=float, default=0.35,
                   help="FFmpeg fallback scene score 0-1 (higher = fewer visual cuts)")
    p.add_argument("--scene-snap-tolerance", type=float, default=2.0,
                   help="Scenes mode: max seconds to snap a boundary to a visual cut")
    p.add_argument("--scene-end-pad", type=float, default=0.75,
                   help="Scenes mode: seconds of tail pad after each scene end")
    p.add_argument("--no-scene-stats", action="store_true",
                   help="Skip writing scene-stats.csv")
    p.add_argument("--no-scene-thumbs", action="store_true",
                   help="Skip extracting midpoint JPEGs under output/_scene_thumbs/")
    p.add_argument("--stitch", action="store_true",
                   help="After export, concatenate clips into output/compilation.mp4 "
                        "(implied by --mode compilation)")
    p.add_argument("--add-voice", action="store_true")
    p.add_argument("--no-original-audio", action="store_true")
    p.add_argument("--voice-id", default=DEFAULT_ELEVENLABS_VOICE_ID, help="ElevenLabs voice id (default: Liam)")
    p.add_argument("--job-id", default=None)
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    crop = None
    if args.crop:
        crop = True
    if args.no_crop:
        crop = False

    is_scenes = args.mode == "scenes"
    min_dur = args.min_dur if args.min_dur is not None else (3.0 if is_scenes else 15.0)
    max_dur = args.max_dur if args.max_dur is not None else (600.0 if is_scenes else 60.0)

    config = JobConfig(
        mode=args.mode,
        profile=args.profile,
        crop=crop,
        burn_captions=not args.no_captions_burn,
        min_duration_s=min_dur,
        max_duration_s=max_dur,
        max_clips=args.max_clips,
        add_voice=args.add_voice,
        keep_original_audio=not args.no_original_audio,
        voice_id=args.voice_id,
        stitch=args.stitch or args.mode == "compilation",
        scene_gap_threshold_s=args.scene_gap,
        scene_visual_threshold=args.scene_visual_threshold,
        scene_snap_tolerance_s=args.scene_snap_tolerance,
        scene_end_pad_s=args.scene_end_pad,
        scene_detector=args.scene_detector,
        scene_content_threshold=args.scene_content_threshold,
        scene_fade_threshold=args.scene_fade_threshold,
        scene_min_scene_len_frames=args.scene_min_scene_len,
        scene_export_stats=not args.no_scene_stats,
        scene_export_thumbs=not args.no_scene_thumbs,
    )

    try:
        result = run_pipeline(
            Path(args.video).resolve(),
            Path(args.captions).resolve(),
            config,
            job_id=args.job_id,
            dry_run=args.dry_run,
        )
    except PipelineError as e:
        sys.exit(str(e))

    print(json.dumps(result, indent=2))
    if result.get("outputs"):
        print("\nExported:")
        for o in result["outputs"]:
            print(f"  {o}")


if __name__ == "__main__":
    main()
