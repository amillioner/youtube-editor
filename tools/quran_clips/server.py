"""Quran Clips local web UI.

Usage: python tools/quran_clips/server.py [port]
Open http://localhost:8767

Workflow: select video file + paste prayer summary → local parser finds
Surah ranges (no Gemini) → cut clips + YouTube titles/descriptions.
"""
from __future__ import annotations

import json
import mimetypes
import os
import re
import sys
import threading
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
UI_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "tools"))

from quran_clips.parse_summary import parse_summary  # noqa: E402
from quran_clips.pipeline import QuranJobError, preview_packaging, run_quran_job  # noqa: E402
from quran_clips.titles import build_youtube_title  # noqa: E402

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8767

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
            files[name] = (fn_m.group(1), data)
        else:
            fields[name] = data.decode("utf-8")
    return fields, files


def run_job(fields: dict[str, str], files: dict[str, tuple[str, bytes]]) -> None:
    global job_state
    job_state = {"running": True, "log": "Starting Quran Clips job…\n", "result": None, "error": None}

    def log(msg: str) -> None:
        job_state["log"] += msg

    try:
        summary = (fields.get("summary") or "").strip()
        youtube_url = (fields.get("youtube_url") or "").strip()
        video_path = None
        if "video" in files and files["video"][1]:
            work = ROOT / "work" / "clip-jobs" / "_quran_upload_tmp"
            work.mkdir(parents=True, exist_ok=True)
            vname, vbytes = files["video"]
            video_path = work / (vname or "upload.mp4")
            video_path.write_bytes(vbytes)
            log(f"Uploaded: {video_path.name} ({len(vbytes)} bytes)\n")
        if not youtube_url and video_path is None:
            raise QuranJobError("Select a video file (or provide a YouTube URL)")

        parsed = None
        clips_field = (fields.get("clips") or "").strip()
        clip_mode = (fields.get("clip_mode") or "").strip().lower()
        if not clip_mode:
            one = (fields.get("one_clip") or "").strip().lower() in {"1", "true", "yes", "on"}
            two = (fields.get("two_clips") or fields.get("split_rakahs") or "").strip().lower() in {
                "1", "true", "yes", "on",
            }
            if one and not two:
                clip_mode = "one"
            elif two and not one:
                clip_mode = "two"
            else:
                clip_mode = "auto"
        if summary:
            log("Parsing summary (DeepSeek if keyed, else heuristic)…\n")
            parsed = parse_summary(
                summary,
                clip_mode=clip_mode,
                video_title=(fields.get("video_title") or "").strip()
                or (video_path.stem if video_path else ""),
            )
            meta = parsed["meta"]
            clips = parsed["clips_raw"]
            log(
                f"  parser={parsed.get('parser')} · {parsed.get('mode_reason')}\n"
                f"  {meta['prayer']} · {meta['sheikh']} · {meta['place']} · {meta['date']}\n"
                f"  {len(clips)} clip(s)\n"
            )
            for c in clips:
                segs = c.get("segments")
                if isinstance(segs, list) and len(segs) >= 2:
                    parts = " then ".join(f"{s.get('start')}–{s.get('end')}" for s in segs)
                    log(f"  · {c['surah']}  {parts} (stitched)\n")
                else:
                    log(f"  · {c['surah']}  {c['start']}–{c['end']}\n")
        elif clips_field:
            meta = {
                "sheikh": (fields.get("sheikh") or "").strip(),
                "place": (fields.get("place") or "Makkah").strip(),
                "date": (fields.get("date") or "").strip(),
                "prayer": (fields.get("prayer") or "").strip(),
            }
            clips = json.loads(clips_field)
        else:
            raise QuranJobError("Paste a prayer summary (or provide clips JSON)")

        result = run_quran_job(
            clips_raw=clips,
            meta=meta,
            youtube_url=youtube_url or None,
            video_path=video_path,
            log=log,
        )
        if parsed:
            result["parse"] = {
                "meta": parsed["meta"],
                "clips": parsed["clips"],
                "warnings": parsed.get("warnings") or [],
            }
        job_state["result"] = result
    except (QuranJobError, ValueError, json.JSONDecodeError) as e:
        job_state["error"] = str(e)
        job_state["log"] += f"\nERROR: {e}\n"
    except Exception as e:
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
            return
        if self.path == "/api/status":
            self.send_json(job_state)
            return
        if self.path == "/api/open-output":
            result = job_state.get("result") or {}
            job_dir = result.get("job_dir")
            if not job_dir:
                self.send_json({"error": "no job output yet"}, 404)
                return
            out_dir = Path(job_dir) / "output"
            if not out_dir.is_dir():
                self.send_json({"error": f"output folder missing: {out_dir}"}, 404)
                return
            try:
                # Windows: open folder in Explorer
                os.startfile(str(out_dir.resolve()))  # type: ignore[attr-defined]
            except AttributeError:
                # non-Windows fallback
                import subprocess

                subprocess.Popen(["xdg-open", str(out_dir.resolve())])
            self.send_json({"opened": str(out_dir.resolve())})
            return
        if self.path.startswith("/api/download/"):
            rel = self.path[len("/api/download/") :]
            safe_parts = [p for p in Path(rel).parts if p not in ("", ".", "..")]
            result = job_state.get("result") or {}
            job_dir = result.get("job_dir")
            if not job_dir or not safe_parts:
                self.send_json({"error": "no job output"}, 404)
                return
            fpath = Path(job_dir) / "output" / Path(*safe_parts)
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
            return
        self.send_json({"error": "not found"}, 404)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length)
        ctype = self.headers.get("Content-Type", "")

        if self.path == "/api/parse-summary":
            try:
                payload = json.loads(body.decode("utf-8"))
                data = parse_summary(
                    payload.get("summary") or "",
                    clip_mode=str(payload.get("clip_mode") or "auto"),
                    split_rakahs=payload.get("split_rakahs") if "split_rakahs" in payload else None,
                    video_title=str(payload.get("video_title") or payload.get("title") or ""),
                )
                self.send_json(data)
            except Exception as e:
                self.send_json({"error": str(e)}, 400)
            return

        if self.path == "/api/preview-titles":
            try:
                payload = json.loads(body.decode("utf-8"))
                meta = {
                    "sheikh": (payload.get("sheikh") or "").strip(),
                    "place": (payload.get("place") or "Makkah").strip(),
                    "date": (payload.get("date") or "").strip(),
                    "prayer": (payload.get("prayer") or "").strip(),
                }
                clips = payload.get("clips") or []
                if isinstance(clips, str):
                    clips = json.loads(clips)
                packaged = preview_packaging(clips, meta)
                self.send_json({"clips": packaged})
            except Exception as e:
                self.send_json({"error": str(e)}, 400)
            return

        if self.path == "/api/preview-title":
            try:
                payload = json.loads(body.decode("utf-8"))
                title = build_youtube_title(
                    payload.get("surah") or "",
                    sheikh=payload.get("sheikh") or "",
                    place=payload.get("place") or "Makkah",
                    date=payload.get("date") or "",
                )
                self.send_json({"youtube_title": title, "title_len": len(title)})
            except Exception as e:
                self.send_json({"error": str(e)}, 400)
            return

        if self.path != "/api/process":
            self.send_json({"error": "not found"}, 404)
            return
        if job_state.get("running"):
            self.send_json({"error": "job already running"}, 409)
            return
        try:
            if "multipart/form-data" in ctype:
                fields, files = parse_multipart(body, ctype)
            elif "application/json" in ctype:
                payload = json.loads(body.decode("utf-8"))
                fields = {
                    k: (json.dumps(v) if isinstance(v, (list, dict)) else str(v or ""))
                    for k, v in payload.items()
                }
                if "clips" in payload and not isinstance(payload["clips"], str):
                    fields["clips"] = json.dumps(payload["clips"])
                if "split_rakahs" in payload:
                    fields["split_rakahs"] = "true" if payload["split_rakahs"] else "false"
                files = {}
            else:
                self.send_json({"error": "expected multipart or json"}, 400)
                return
        except Exception as e:
            self.send_json({"error": str(e)}, 400)
            return

        threading.Thread(target=run_job, args=(fields, files), daemon=True).start()
        self.send_json({"started": True})


if __name__ == "__main__":
    print(f"Quran Clips  ->  http://localhost:{PORT}")
    print("Select/drop video + paste summary. DeepSeek if DEEPSEEK_API_KEY set.")
    print("(Separate from Clip Factory 8766 and Cut Editor 8765)")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
