"""Clip Factory local web UI. Stdlib only.

Usage: python tools/clip_factory/server.py [port]
Open http://localhost:8766
"""
from __future__ import annotations

import json
import mimetypes
import re
import sys
import threading
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
UI_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "tools"))

from clip_factory.common import JobConfig, DEFAULT_ELEVENLABS_VOICE_ID  # noqa: E402
from clip_factory.detect_scenes import preview_scenes_from_transcript  # noqa: E402
from clip_factory.export_clips import probe_duration  # noqa: E402
from clip_factory.parse_transcript import parse_caption_text, transcript_timing_summary  # noqa: E402
from clip_factory.pipeline import PipelineError, run_pipeline  # noqa: E402

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8766

job_state: dict = {
    "running": False,
    "log": "",
    "result": None,
    "error": None,
}


def parse_multipart(body: bytes, content_type: str) -> tuple[dict[str, str], dict[str, tuple[str, bytes]]]:
    m = re.search(r"boundary=(.+)", content_type)
    if not m:
        raise ValueError("missing multipart boundary")
    boundary = m.group(1).strip().encode("utf-8")
    fields: dict[str, str] = {}
    files: dict[str, tuple[str, bytes]] = {}
    for part in body.split(b"--" + boundary):
        if not part or part in (b"--", b"--\r\n"):
            continue
        if b"\r\n\r\n" not in part:
            continue
        header_blob, data = part.split(b"\r\n\r\n", 1)
        data = data.rstrip(b"\r\n")
        headers = header_blob.decode("utf-8", errors="replace")
        name_m = re.search(r'name="([^"]+)"', headers)
        if not name_m:
            continue
        name = name_m.group(1)
        fn_m = re.search(r'filename="([^"]*)"', headers)
        if fn_m and fn_m.group(1):
            fname = fn_m.group(1)
            files[name] = (fname, data)
        else:
            fields[name] = data.decode("utf-8")
    return fields, files


def run_job(
    video_bytes: bytes,
    video_name: str,
    fields: dict[str, str],
    *,
    cap_bytes: bytes | None = None,
    cap_name: str | None = None,
    captions_text: str | None = None,
) -> None:
    global job_state
    job_state = {"running": True, "log": "Starting pipeline...\n", "result": None, "error": None}
    work = ROOT / "work" / "clip-jobs" / "_upload_tmp"
    work.mkdir(parents=True, exist_ok=True)
    vpath = work / video_name
    vpath.write_bytes(video_bytes)

    if cap_bytes is not None and cap_name:
        cpath = work / cap_name
        cpath.write_bytes(cap_bytes)
        cap_label = cap_name
    elif captions_text:
        cpath = work / "captions.txt"
        cpath.write_text(captions_text, encoding="utf-8")
        line_count = len([ln for ln in captions_text.splitlines() if ln.strip()])
        cap_label = f"pasted transcript ({line_count} lines)"
    else:
        job_state["error"] = "No captions provided"
        job_state["running"] = False
        return

    crop = None
    if fields.get("crop") == "true":
        crop = True
    if fields.get("crop") == "false":
        crop = False

    mode = fields.get("mode", "clips")
    is_scenes = mode == "scenes"
    default_min = "3" if is_scenes else "15"
    default_max = "600" if is_scenes else "60"

    config = JobConfig(
        mode=mode,
        profile=fields.get("profile", "source"),
        crop=crop,
        burn_captions=fields.get("burn_captions", "true") == "true",
        min_duration_s=float(fields.get("min_dur", default_min)),
        max_duration_s=float(fields.get("max_dur", default_max)),
        max_clips=int(fields.get("max_clips", "10")),
        add_voice=fields.get("add_voice") == "true",
        keep_original_audio=fields.get("keep_audio", "true") == "true",
        voice_id=fields.get("voice_id", "").strip() or DEFAULT_ELEVENLABS_VOICE_ID,
        stitch=fields.get("stitch") == "true" or mode == "compilation",
        scene_gap_threshold_s=float(fields.get("scene_gap", "10")),
        scene_visual_threshold=float(fields.get("scene_visual_threshold", "0.35")),
        scene_snap_tolerance_s=float(fields.get("scene_snap_tolerance", "2")),
        scene_end_pad_s=float(fields.get("scene_end_pad", "0.75")),
        scene_detector=fields.get("scene_detector", "content") or "content",
        scene_content_threshold=float(fields.get("scene_content_threshold", "27")),
        scene_fade_threshold=float(fields.get("scene_fade_threshold", "12")),
        scene_min_scene_len_frames=int(float(fields.get("scene_min_scene_len", "15"))),
        scene_export_stats=fields.get("scene_export_stats", "true") == "true",
        scene_export_thumbs=fields.get("scene_export_thumbs", "true") == "true",
    )

    try:
        preview = parse_caption_text(cpath.read_text(encoding="utf-8-sig"), cpath.suffix.lower() or ".txt")
        timing = transcript_timing_summary(preview)
        job_state["log"] += (
            f"Video: {video_name}\nCaptions: {cap_label}\nTranscript: {timing}\n"
            f"Mode: {config.mode} | Profile: {config.profile}"
            f"{' | stitch->compilation.mp4' if config.wants_stitch() else ''}\n"
        )
        if preview.get("untimed") and config.mode == "scenes":
            job_state["error"] = "Scenes mode requires timed captions (YouTube paste, SRT, or VTT)."
            job_state["running"] = False
            return
        if preview.get("untimed") and config.selection_mode() in ("clips", "single"):
            job_state["log"] += (
                "Warning: untimed transcript — Gemini clip selection skipped; exporting start segment only.\n"
                "Use YouTube [MM:SS](url) paste, SRT, or VTT for viral clip finding.\n"
            )
        if config.mode == "scenes":
            job_state["log"] += (
                f"Scenes: gap={config.scene_gap_threshold_s}s, "
                f"detector={config.scene_detector}, "
                f"content_thresh={config.scene_content_threshold}, "
                f"snap±{config.scene_snap_tolerance_s}s, "
                f"end_pad={config.scene_end_pad_s}s, min_dur={config.min_duration_s}s\n"
            )
        result = run_pipeline(vpath, cpath, config)
        job_state["result"] = result
        if config.mode == "scenes":
            scenes_path = Path(result.get("job_dir", "")) / "scenes.json"
            n_clips = len(result.get("clips") or [])
            job_state["log"] += f"Scenes mode: {n_clips} scene clip(s)"
            if scenes_path.is_file():
                job_state["log"] += f" · wrote {scenes_path.name}\n"
            else:
                job_state["log"] += " · WARNING: scenes.json missing\n"
        job_state["log"] += "Done.\n"
        for o in result.get("outputs", []):
            job_state["log"] += f"  -> {o}\n"
    except (PipelineError, RuntimeError, Exception) as e:
        job_state["error"] = str(e)
        job_state["log"] += traceback.format_exc()
    finally:
        job_state["running"] = False


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args):  # quiet
        pass

    def send_json(self, obj, code=200):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            body = (UI_DIR / "index.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif self.path == "/api/status":
            self.send_json(job_state)
        elif self.path == "/api/preview-captions":
            self.send_json({"error": "POST a captions_text body"}, 405)
        elif self.path.startswith("/api/download/"):
            rel = self.path[len("/api/download/") :]
            # Allow flat filenames or output/_scene_thumbs/NN.jpg
            safe_parts = [p for p in Path(rel).parts if p not in ("", ".", "..")]
            if not safe_parts or any(p.startswith("/") or ":" in p for p in safe_parts):
                self.send_json({"error": "invalid path"}, 400)
                return
            result = job_state.get("result") or {}
            job_dir = result.get("job_dir")
            if not job_dir:
                self.send_json({"error": "no job output"}, 404)
                return
            fpath = Path(job_dir) / "output" / Path(*safe_parts)
            if not fpath.exists() and len(safe_parts) == 1:
                # Also try thumbs dir for bare filenames
                alt = Path(job_dir) / "output" / "_scene_thumbs" / safe_parts[0]
                if alt.exists():
                    fpath = alt
            if not fpath.exists():
                self.send_json({"error": "file not found"}, 404)
                return
            data = fpath.read_bytes()
            ctype = mimetypes.guess_type(str(fpath))[0] or "application/octet-stream"
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(data)))
            self.send_header("Content-Disposition", f'attachment; filename="{fpath.name}"')
            self.end_headers()
            self.wfile.write(data)
        else:
            self.send_json({"error": "not found"}, 404)

    def do_POST(self):
        if self.path == "/api/preview-captions":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            ctype = self.headers.get("Content-Type", "")
            text = ""
            if "application/json" in ctype:
                try:
                    payload = json.loads(body.decode("utf-8"))
                    text = (payload.get("captions_text") or "").strip()
                except json.JSONDecodeError:
                    self.send_json({"error": "invalid json"}, 400)
                    return
            elif "multipart/form-data" in ctype:
                try:
                    fields, files = parse_multipart(body, ctype)
                except ValueError as e:
                    self.send_json({"error": str(e)}, 400)
                    return
                text = fields.get("captions_text", "").strip()
                if not text and "captions" in files and files["captions"][1]:
                    text = files["captions"][1].decode("utf-8", errors="replace")
            else:
                text = body.decode("utf-8", errors="replace").strip()
            if not text:
                self.send_json({"error": "no captions text"}, 400)
                return
            preview = parse_caption_text(text, ".txt")
            self.send_json(
                {
                    "timing": transcript_timing_summary(preview),
                    "untimed": bool(preview.get("untimed")),
                    "lines": len(preview.get("lines", [])),
                    "total_ms": preview.get("total_ms") or 0,
                    "format": preview.get("format") or preview.get("source"),
                }
            )
            return

        if self.path == "/api/preview-scenes":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            ctype = self.headers.get("Content-Type", "")
            text = ""
            gap = 10.0
            min_dur = 3.0
            snap_tol = 2.0
            end_pad = 0.75
            detector = "content"
            content_thresh = 27.0
            fade_thresh = 12.0
            min_scene_len = 15
            ffmpeg_thresh = 0.35
            video_tmp: Path | None = None
            try:
                if "multipart/form-data" in ctype:
                    try:
                        fields, files = parse_multipart(body, ctype)
                    except ValueError as e:
                        self.send_json({"error": str(e)}, 400)
                        return
                    text = fields.get("captions_text", "").strip()
                    if not text and "captions" in files and files["captions"][1]:
                        text = files["captions"][1].decode("utf-8", errors="replace")
                    try:
                        gap = float(fields.get("scene_gap", "10"))
                        min_dur = float(fields.get("min_dur", "3"))
                        snap_tol = float(fields.get("scene_snap_tolerance", "2"))
                        end_pad = float(fields.get("scene_end_pad", "0.75"))
                        content_thresh = float(fields.get("scene_content_threshold", "27"))
                        fade_thresh = float(fields.get("scene_fade_threshold", "12"))
                        min_scene_len = int(float(fields.get("scene_min_scene_len", "15")))
                        ffmpeg_thresh = float(fields.get("scene_visual_threshold", "0.35"))
                    except ValueError:
                        pass
                    detector = (fields.get("scene_detector") or "content").strip().lower()
                    if "video" in files and files["video"][1]:
                        work = ROOT / "work" / "clip-jobs" / "_preview_tmp"
                        work.mkdir(parents=True, exist_ok=True)
                        vname = files["video"][0] or "preview.mp4"
                        video_tmp = work / f"preview{Path(vname).suffix.lower() or '.mp4'}"
                        video_tmp.write_bytes(files["video"][1])
                elif "application/json" in ctype:
                    try:
                        payload = json.loads(body.decode("utf-8"))
                        text = (payload.get("captions_text") or "").strip()
                        gap = float(payload.get("scene_gap", 10))
                        min_dur = float(payload.get("min_dur", 3))
                        snap_tol = float(payload.get("scene_snap_tolerance", 2))
                        end_pad = float(payload.get("scene_end_pad", 0.75))
                        detector = str(payload.get("scene_detector", "content")).strip().lower()
                        content_thresh = float(payload.get("scene_content_threshold", 27))
                        fade_thresh = float(payload.get("scene_fade_threshold", 12))
                        min_scene_len = int(float(payload.get("scene_min_scene_len", 15)))
                        ffmpeg_thresh = float(payload.get("scene_visual_threshold", 0.35))
                    except (json.JSONDecodeError, ValueError, TypeError):
                        self.send_json({"error": "invalid json"}, 400)
                        return
                else:
                    text = body.decode("utf-8", errors="replace").strip()
                if not text:
                    self.send_json({"error": "no captions text"}, 400)
                    return
                preview = parse_caption_text(text, ".txt")
                video_dur = None
                if video_tmp is not None and video_tmp.exists():
                    try:
                        video_dur = probe_duration(video_tmp)
                    except Exception:  # noqa: BLE001
                        video_dur = None
                result = preview_scenes_from_transcript(
                    preview,
                    gap_threshold_s=gap,
                    min_duration_s=min_dur,
                    video_duration_s=video_dur,
                    video_path=video_tmp,
                    snap_tolerance_s=snap_tol,
                    end_pad_s=end_pad,
                    detector=detector,
                    content_threshold=content_thresh,
                    fade_threshold=fade_thresh,
                    min_scene_len_frames=min_scene_len,
                    ffmpeg_threshold=ffmpeg_thresh,
                    skip_visual=video_tmp is None,
                )
                result["timing"] = transcript_timing_summary(preview)
                self.send_json(result)
            finally:
                if video_tmp is not None:
                    try:
                        video_tmp.unlink(missing_ok=True)
                    except OSError:
                        pass
            return

        if self.path != "/api/process":
            self.send_json({"error": "not found"}, 404)
            return
        if job_state.get("running"):
            self.send_json({"error": "job already running"}, 409)
            return
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        ctype = self.headers.get("Content-Type", "")
        try:
            fields, files = parse_multipart(body, ctype)
        except ValueError as e:
            self.send_json({"error": str(e)}, 400)
            return
        if "video" not in files:
            self.send_json({"error": "video file required"}, 400)
            return
        vname, vbytes = files["video"]
        if not vbytes:
            self.send_json({"error": "video file is empty — re-select the video and try again"}, 400)
            return
        captions_text = fields.get("captions_text", "").strip()
        has_caption_file = "captions" in files and files["captions"][1]
        if not captions_text and not has_caption_file:
            self.send_json({"error": "paste a transcript or upload a captions file"}, 400)
            return
        cap_bytes = cap_name = None
        if has_caption_file:
            cap_name, cap_bytes = files["captions"]
        elif captions_text:
            pass
        threading.Thread(
            target=run_job,
            kwargs={
                "video_bytes": vbytes,
                "video_name": vname,
                "fields": fields,
                "cap_bytes": cap_bytes,
                "cap_name": cap_name,
                "captions_text": captions_text if not has_caption_file else None,
            },
            daemon=True,
        ).start()
        self.send_json({"started": True})


if __name__ == "__main__":
    print(f"Clip Factory  ->  http://localhost:{PORT}")
    print("(Lane B — separate from Cut Editor on port 8765)")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
