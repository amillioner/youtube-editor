"""ElevenLabs TTS voiceover and mux onto exported clips."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

from .common import load_env


def load_key() -> str:
    env = load_env()
    return env.get("ELEVENLABS_API_KEY", "").strip()


def generate_tts(text: str, out_mp3: Path, voice_id: str, model_id: str = "eleven_multilingual_v2") -> None:
    key = load_key()
    if not key:
        raise RuntimeError("ELEVENLABS_API_KEY not set in .env")
    if not voice_id:
        raise RuntimeError("voice_id is required for TTS")

    import requests

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    headers = {"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"}
    payload = {
        "text": text,
        "model_id": model_id,
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
    }
    r = requests.post(url, headers=headers, json=payload, timeout=600)
    if r.status_code != 200:
        raise RuntimeError(f"ElevenLabs TTS failed ({r.status_code}): {r.text[:500]}")
    out_mp3.write_bytes(r.content)


def mux_voiceover(video: Path, audio: Path, out: Path, *, replace: bool = True) -> None:
    if replace and out == video:
        tmp = video.with_suffix(".voiced.mp4")
        target = tmp
    else:
        target = out

    cmd = [
        "ffmpeg",
        "-y",
        "-hide_banner",
        "-loglevel",
        "error",
        "-i",
        str(video),
        "-i",
        str(audio),
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        "-movflags",
        "+faststart",
        str(target),
    ]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write(r.stdout + r.stderr)
        raise RuntimeError("ffmpeg mux voiceover failed")
    if replace and target != video:
        target.replace(video)


def add_voice_to_clip(video: Path, caption_text: str, voice_id: str) -> None:
    work = video.parent / "_voice_tmp"
    work.mkdir(exist_ok=True)
    audio = work / f"{video.stem}.mp3"
    generate_tts(caption_text, audio, voice_id)
    mux_voiceover(video, audio, video, replace=True)


def add_voice_from_clips_json(output_dir: Path, clips_path: Path, voice_id: str) -> None:
    clips = json.loads(clips_path.read_text(encoding="utf-8"))
    for clip in clips:
        cid = clip.get("id", "01")
        from .common import slugify

        title = clip.get("title", "clip")
        fname = f"{cid}-{slugify(title)}.mp4"
        video = output_dir / fname
        if not video.exists():
            continue
        text = clip.get("caption") or clip.get("hook") or title
        add_voice_to_clip(video, text, voice_id)
