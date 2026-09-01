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
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent.parent
UI_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "tools"))

from quran_clips.parse_summary import parse_summary  # noqa: E402
from quran_clips.pipeline import (  # noqa: E402
    QuranJobError,
    allocate_job_id,
    job_id_from_video_title,
    preview_packaging,
    run_quran_job,
)
from quran_clips.titles import DEFAULT_END_BUFFER_S, build_youtube_title  # noqa: E402

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8767


class JobQueue:
    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._queue: deque[str] = deque()
        self._jobs: dict[str, dict] = {}
        self._current: str | None = None
        self._worker_started = False

    def _ensure_worker(self) -> None:
        if self._worker_started:
            return
        self._worker_started = True
        threading.Thread(target=self._worker_loop, daemon=True).start()

    def enqueue(
        self,
        job_id: str,
        fields: dict[str, str],
        files: dict[str, tuple[str, bytes]],
    ) -> dict:
        with self._lock:
            taken: set[str] = set(self._queue)
            if self._current:
                taken.add(self._current)
            for jid, job in self._jobs.items():
                if job.get("status") in {"queued", "running"}:
                    taken.add(jid)
            allocated = allocate_job_id(job_id, taken=taken)
            position = len(self._queue) + (1 if self._current else 0) + 1
            self._jobs[allocated] = {
                "job_id": allocated,
                "status": "queued",
                "log": "",
                "result": None,
                "error": None,
                "fields": fields,
                "files": files,
            }
            self._queue.append(allocated)
            self._ensure_worker()
            return {
                "job_id": allocated,
                "base_job_id": job_id,
                "queued": True,
                "position": position,
            }

    def _worker_loop(self) -> None:
        while True:
            job_id: str | None = None
            with self._lock:
                if self._queue:
                    job_id = self._queue.popleft()
                    self._current = job_id
                    job = self._jobs[job_id]
                    job["status"] = "running"
                    job["log"] = "Starting Quran Clips job…\n"
            if not job_id:
                threading.Event().wait(0.25)
                continue
            try:
                self._run_job(job_id)
            finally:
                with self._lock:
                    if self._current == job_id:
                        self._current = None

    def _run_job(self, job_id: str) -> None:
        with self._lock:
            job = self._jobs[job_id]
            fields = dict(job["fields"])
            files = dict(job["files"])

        def log(msg: str) -> None:
            with self._lock:
                self._jobs[job_id]["log"] += msg

        try:
            log(f"Job folder: work/clip-jobs/{job_id}\n")
            summary = (fields.get("summary") or "").strip()
            youtube_url = (fields.get("youtube_url") or "").strip()
            video_path = None
            if "video" in files and files["video"][1]:
                work = ROOT / "work" / "clip-jobs" / "_quran_upload_tmp" / job_id
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
            end_buffer_s = parse_end_buffer_s(fields.get("end_buffer_s"))
            if summary:
                log("Parsing summary (DeepSeek if keyed, else heuristic)…\n")
                parsed = parse_summary(
                    summary,
                    clip_mode=clip_mode,
                    video_title=(fields.get("video_title") or "").strip()
                    or (video_path.stem if video_path else ""),
                    end_buffer_s=end_buffer_s,
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

            video_title = (fields.get("video_title") or "").strip() or (
                video_path.stem if video_path else ""
            )
            result = run_quran_job(
                clips_raw=clips,
                meta=meta,
                youtube_url=youtube_url or None,
                video_path=video_path,
                video_title=video_title,
                job_id=job_id,
                end_buffer_s=end_buffer_s,
                log=log,
            )
            if parsed:
                result["parse"] = {
                    "meta": parsed["meta"],
                    "clips": parsed["clips"],
                    "warnings": parsed.get("warnings") or [],
                    "parser": parsed.get("parser"),
                    "mode_reason": parsed.get("mode_reason"),
                    "split_rakahs": parsed.get("split_rakahs"),
                    "end_buffer_s": parsed.get("end_buffer_s", end_buffer_s),
                    "end_snap": parsed.get("end_snap"),
                }
            with self._lock:
                self._jobs[job_id]["result"] = result
                self._jobs[job_id]["status"] = "done"
        except (QuranJobError, ValueError, json.JSONDecodeError) as e:
            with self._lock:
                self._jobs[job_id]["error"] = str(e)
                self._jobs[job_id]["status"] = "error"
                self._jobs[job_id]["log"] += f"\nERROR: {e}\n"
        except Exception as e:
            with self._lock:
                self._jobs[job_id]["error"] = str(e)
                self._jobs[job_id]["status"] = "error"
                self._jobs[job_id]["log"] += traceback.format_exc()

    def get_job(self, job_id: str | None) -> dict | None:
        with self._lock:
            if job_id:
                job = self._jobs.get(job_id)
                return dict(job) if job else None
            if self._current:
                return dict(self._jobs[self._current])
            return None

    def snapshot(self, job_id: str | None = None) -> dict:
        with self._lock:
            current = self._current
            queue = list(self._queue)
            jobs_summary = {
                jid: {
                    "status": j["status"],
                    "log": j["log"],
                    "result": j["result"],
                    "error": j["error"],
                }
                for jid, j in self._jobs.items()
            }
            running = bool(current and self._jobs.get(current, {}).get("status") == "running")
            if job_id and job_id in self._jobs:
                active = self._jobs[job_id]
            elif current:
                active = self._jobs[current]
            else:
                active = None

        out: dict = {
            "current": current,
            "queue": queue,
            "jobs": jobs_summary,
            "running": running,
        }
        if active:
            out.update(
                {
                    "job_id": active.get("job_id") or job_id or current,
                    "status": active["status"],
                    "log": active["log"],
                    "result": active["result"],
                    "error": active["error"],
                }
            )
        else:
            out.update({"job_id": None, "status": "idle", "log": "", "result": None, "error": None})
        out["queue_length"] = len(queue) + (1 if current else 0)
        return out


job_queue = JobQueue()


def parse_end_buffer_s(value: object, default: float = DEFAULT_END_BUFFER_S) -> float:
    """Max seconds to wait for the next sound. Empty → 8. 0 = cut at listed time."""
    if value is None or value == "":
        return default
    if isinstance(value, bool):
        return default if value else 0.0
    try:
        pad = float(value)
    except (TypeError, ValueError):
        return default
    return max(0.0, min(pad, 180.0))


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


def _job_result(job_id: str | None) -> dict:
    if job_id:
        job = job_queue.get_job(job_id)
        return (job or {}).get("result") or {}
    snap = job_queue.snapshot()
    return snap.get("result") or {}


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

    def _query_job_id(self) -> str | None:
        parsed = urlparse(self.path)
        qs = parse_qs(parsed.query)
        vals = qs.get("job_id") or []
        return vals[0] if vals else None

    def do_GET(self):
        path = urlparse(self.path).path
        job_id = self._query_job_id()

        if path in ("/", "/index.html"):
            body = (UI_DIR / "index.html").read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == "/api/status":
            self.send_json(job_queue.snapshot(job_id))
            return
        if path == "/api/open-output":
            result = _job_result(job_id)
            job_dir = result.get("job_dir")
            if not job_dir:
                self.send_json({"error": "no job output yet"}, 404)
                return
            out_dir = Path(job_dir) / "output"
            if not out_dir.is_dir():
                self.send_json({"error": f"output folder missing: {out_dir}"}, 404)
                return
            try:
                os.startfile(str(out_dir.resolve()))  # type: ignore[attr-defined]
            except AttributeError:
                import subprocess

                subprocess.Popen(["xdg-open", str(out_dir.resolve())])
            self.send_json({"opened": str(out_dir.resolve())})
            return
        if path.startswith("/api/download/"):
            rel = path[len("/api/download/") :]
            safe_parts = [p for p in Path(rel).parts if p not in ("", ".", "..")]
            result = _job_result(job_id)
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
                    end_buffer_s=parse_end_buffer_s(payload.get("end_buffer_s")),
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
                    prayer=payload.get("prayer") or "",
                )
                self.send_json({"youtube_title": title, "title_len": len(title)})
            except Exception as e:
                self.send_json({"error": str(e)}, 400)
            return

        if self.path != "/api/process":
            self.send_json({"error": "not found"}, 404)
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

        video_title = (fields.get("video_title") or "").strip()
        video_filename = ""
        if "video" in files and files["video"][0]:
            video_filename = files["video"][0]
        try:
            job_id = job_id_from_video_title(video_title, video_filename=video_filename)
            info = job_queue.enqueue(job_id, fields, files)
        except QuranJobError as e:
            self.send_json({"error": str(e)}, 409)
            return
        self.send_json(info)


if __name__ == "__main__":
    print(f"Quran Clips  ->  http://localhost:{PORT}")
    print("Select/drop video + paste summary. DeepSeek if DEEPSEEK_API_KEY set.")
    print("(Separate from Clip Factory 8766 and Cut Editor 8765)")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
