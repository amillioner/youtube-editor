"""Shared helpers for the Clip Factory (Lane B) pipeline."""
from __future__ import annotations

import json
import os
import re
import time
import uuid
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent.parent
JOBS_DIR = ROOT / "work" / "clip-jobs"
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
# ElevenLabs premade — energetic, punchy; good for Shorts / viral clip voiceover
DEFAULT_ELEVENLABS_VOICE_ID = "TX3LPaxmHKxFdv7VOQHJ"
DEFAULT_ELEVENLABS_VOICE_NAME = "Liam"


def load_env() -> dict[str, str]:
    env: dict[str, str] = dict(os.environ)
    dotenv = ROOT / ".env"
    if dotenv.exists():
        for line in dotenv.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def slugify(text: str, max_len: int = 48) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return (s[:max_len] or "clip").rstrip("-")


def new_job_id() -> str:
    stamp = time.strftime("%Y%m%d-%H%M%S")
    return f"{stamp}-{uuid.uuid4().hex[:8]}"


@dataclass
class JobConfig:
    mode: str = "clips"  # clips | single | full | compilation | scenes
    profile: str = "source"  # source | horizontal | shorts
    crop: bool | None = None  # None = profile default
    burn_captions: bool = True
    min_duration_s: float = 15.0
    max_duration_s: float = 60.0
    max_clips: int = 10
    add_voice: bool = False
    keep_original_audio: bool = True
    voice_id: str = DEFAULT_ELEVENLABS_VOICE_ID
    gemini_model: str = DEFAULT_GEMINI_MODEL
    # When True (or mode=compilation): stitch exported clips into one MP4
    stitch: bool = False
    # Scenes mode: transcript gap + visual snap (PySceneDetect, FFmpeg fallback)
    scene_gap_threshold_s: float = 10.0
    # Kept for FFmpeg fallback (0–1). Prefer scene_content_threshold for PySceneDetect.
    scene_visual_threshold: float = 0.35
    scene_snap_tolerance_s: float = 2.0
    # Extra seconds after each scene end (capped at video duration)
    scene_end_pad_s: float = 0.75
    # content | adaptive | fade | hybrid | ffmpeg
    scene_detector: str = "content"
    # PySceneDetect ContentDetector / AdaptiveDetector threshold (typical 15–40)
    scene_content_threshold: float = 27.0
    # ThresholdDetector fade intensity (0–255); used by fade / hybrid
    scene_fade_threshold: float = 12.0
    # Debounce cuts at detection time (frames); ~0.5s at 30fps
    scene_min_scene_len_frames: int = 15
    # Write per-frame metrics CSV next to scenes.json
    scene_export_stats: bool = True
    # Extract midpoint JPEG per final scene under output/_scene_thumbs/
    scene_export_thumbs: bool = True
    # default | highest — highest keeps source resolution, CRF 16, frame-accurate cuts
    encode_quality: str = "default"

    def highest_quality(self) -> bool:
        return self.encode_quality == "highest"

    def wants_stitch(self) -> bool:
        return self.stitch or self.mode == "compilation"

    def selection_mode(self) -> str:
        """Underlying clip-selection behavior (compilation uses multi-clip Gemini)."""
        if self.mode == "compilation":
            return "clips"
        return self.mode

    def crop_enabled(self) -> bool:
        if self.crop is not None:
            return self.crop
        return self.profile == "shorts"

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> JobConfig:
        known = {f.name for f in cls.__dataclass_fields__.values()}  # type: ignore[attr-defined]
        return cls(**{k: v for k, v in data.items() if k in known})


@dataclass
class JobPaths:
    job_id: str
    root: Path

    @classmethod
    def create(cls, job_id: str | None = None) -> JobPaths:
        jid = job_id or new_job_id()
        root = JOBS_DIR / jid
        (root / "input").mkdir(parents=True, exist_ok=True)
        (root / "output").mkdir(parents=True, exist_ok=True)
        return cls(job_id=jid, root=root)

    @property
    def input_dir(self) -> Path:
        return self.root / "input"

    @property
    def output_dir(self) -> Path:
        return self.root / "output"

    def find_video(self) -> Path:
        for name in ("video.mp4", "source.mp4", "source.mov", "source.mkv", "source.webm"):
            p = self.input_dir / name
            if p.exists():
                return p
        for p in sorted(self.input_dir.iterdir()):
            if p.suffix.lower() in {".mp4", ".mov", ".mkv", ".webm", ".m4v"}:
                return p
        return self.input_dir / "video.mp4"

    @property
    def video(self) -> Path:
        return self.find_video()

    def find_captions(self) -> Path:
        for p in sorted(self.input_dir.iterdir()):
            if p.name.startswith("captions.") and p.suffix.lower() in {".srt", ".vtt", ".txt", ".json"}:
                return p
        for p in sorted(self.input_dir.iterdir()):
            if p.suffix.lower() in {".srt", ".vtt", ".txt", ".json"} and not p.name.startswith("."):
                if p != self.find_video():
                    return p
        return self.input_dir / "captions.srt"

    @property
    def config_path(self) -> Path:
        return self.root / "job.json"

    @property
    def transcript_path(self) -> Path:
        return self.root / "transcript.json"

    @property
    def clips_path(self) -> Path:
        return self.root / "clips.json"

    def save_config(self, config: JobConfig) -> None:
        payload = {"job_id": self.job_id, "config": config.to_dict()}
        self.config_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    def load_config(self) -> JobConfig:
        data = json.loads(self.config_path.read_text(encoding="utf-8"))
        return JobConfig.from_dict(data.get("config", {}))
