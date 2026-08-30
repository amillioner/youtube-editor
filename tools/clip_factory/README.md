# Clip Factory (Lane B)

Separate workflow from the talking-head Cut Editor (`tools/editor/`, port **8765**).

**Clip Factory UI:** port **8766**

## What it does

1. You **select a video file** and provide **timed captions** — paste a YouTube transcript or upload SRT, VTT, TXT, JSON
2. Choose options: viral clips, **compilation** (stitched), **scenes** (one short per scene change), single clip, or full video
3. **Gemini** picks clip timestamps from the transcript (unless mode = `full` or `scenes`)
4. **FFmpeg** exports MP4(s) with optional burned captions
5. Optional **ElevenLabs TTS** replaces audio
6. In **compilation** mode (or `--stitch`), clips are concatenated into `output/compilation.mp4`

Gemini does **not** watch the video pixels. Viral selection is **transcript-only**. Untimed captions skip Gemini and export only the first `max_dur` seconds.

**Scenes mode** does not use Gemini. It groups transcript lines by timestamp gaps, then snaps boundaries to **PySceneDetect** visual cuts (ContentDetector by default; FFmpeg as fallback).

## Quick start

From repo root (with venv active):

```powershell
# Web UI
venv\Scripts\python tools/clip_factory/server.py
# Open http://localhost:8766

# Separate viral clips
venv\Scripts\python tools/run_pipeline.py --video ep.mp4 --captions ep.srt --profile shorts --mode clips --min-dur 15 --max-dur 60 --max-clips 10

# One stitched compilation of viral moments
venv\Scripts\python tools/run_pipeline.py --video ep.mp4 --captions ep.srt --mode compilation --max-clips 10

# Split by scenes (transcript gaps + PySceneDetect visual snap) — one short per scene
venv\Scripts\python tools/run_pipeline.py --video ep.mp4 --captions ep.txt --mode scenes --scene-gap 10 --min-dur 3 --profile shorts

# Full video + burn captions (no AI cutting)
venv\Scripts\python tools/run_pipeline.py --video ep.mp4 --captions ep.srt --mode full --profile source
```

## Environment

| Key | Required |
|-----|----------|
| `GEMINI_API_KEY` | Yes for viral modes (`clips` / `single` / `compilation`) |
| `ELEVENLABS_API_KEY` | Only if “Add AI voice” is enabled |

Default voice when AI voice is on: **Liam** (`TX3LPaxmHKxFdv7VOQHJ`) — ElevenLabs premade, energetic social-media tone.

Scenes mode does **not** need `GEMINI_API_KEY`.

## Output

Jobs write to `work/clip-jobs/<job-id>/output/*.mp4`.

Compilation mode also writes `work/clip-jobs/<job-id>/output/compilation.mp4` (individual segment MP4s are kept alongside it).

Scenes mode also writes:
- `work/clip-jobs/<job-id>/scenes.json` — draft vs snapped boundaries for QA
- `work/clip-jobs/<job-id>/scene-stats.csv` — per-frame PySceneDetect metrics (unless `--no-scene-stats`)
- `work/clip-jobs/<job-id>/output/_scene_thumbs/*.jpg` — midpoint frame per scene (unless `--no-scene-thumbs`)

## Caption formats

| Input | Gemini / scenes |
|-------|-----------------|
| YouTube copy-paste `.txt` (`[MM:SS](https://youtu.be/...?t=N) text` or `[MM:SS] text`) | Yes — timestamps from `?t=` or the bracket stamp |
| SRT / VTT | Yes |
| Plain untimed text | No — viral modes export first `max_dur` seconds only; scenes mode errors |

The UI previews timing before you run: look for **“Timed captions OK”**. If you see **untimed**, Gemini will not scan the full video (and scenes mode cannot run).

Paste in the UI or drop/upload a file — either works.

## Modes

| Mode | Behavior |
|------|----------|
| `clips` | Gemini finds multiple viral segments → separate MP4s |
| `compilation` | Same as clips, then stitches into one `compilation.mp4` |
| `single` | One Gemini-selected clip |
| `full` | Entire video + burn captions (no AI cutting) |
| `scenes` | One short per scene: transcript gap grouping + PySceneDetect visual snap |

CLI also accepts `--stitch` with `--mode clips` to concatenate after export.

### Scenes mode details

1. Group consecutive transcript lines whose **start** times are within `--scene-gap` (default 10s; gaps *equal* to the threshold stay in the same scene)
2. Draft boundaries: scene starts at first line (scene 1 from 0), ends at next scene’s start
3. Detect visual cuts with **PySceneDetect** (`--scene-detector`, default `content`)
4. Snap each interior boundary to the nearest visual cut **at or after** the draft time within `--scene-snap-tolerance` (default 2s) so ends are not pulled earlier
5. Merge scenes shorter than `--min-dur` (default 3s)
6. Add `--scene-end-pad` (default 0.75s) after each scene end; also extend through each scene’s last caption line
7. Optionally write `scene-stats.csv` and midpoint JPEGs under `output/_scene_thumbs/`

Viral modes (`clips` / `single`) post-process Gemini timestamps so `end_s` covers the last overlapping caption line and any line that *starts* at the chosen end (avoids cutting punchlines).

| Detector | When to use |
|----------|-------------|
| `content` | Default — hard cuts / shot changes (HSV content diff) |
| `adaptive` | Handheld, action, fast pans (rolling threshold) |
| `fade` | Fade in/out / fade-to-black |
| `hybrid` | Content + Threshold detectors together |
| `ffmpeg` | Legacy FFmpeg `select=gt(scene,THRESH)` only |

```powershell
venv\Scripts\python tools/run_pipeline.py `
  --video karma.mp4 `
  --captions transcript.txt `
  --mode scenes `
  --scene-gap 10 `
  --scene-detector content `
  --scene-content-threshold 27 `
  --scene-snap-tolerance 2 `
  --scene-end-pad 0.75 `
  --min-dur 3 `
  --profile shorts `
  --dry-run
```

In the UI, choose **Split by scenes**, pick a detector, then **Preview scenes** (uses the selected video for visual snap when available).

## Profiles

| Profile | Behavior |
|---------|----------|
| `source` | Keep original aspect (default for regular video) |
| `horizontal` | 1920×1080 letterbox/pad |
| `shorts` | 1080×1920 center crop |

## Defaults that matter

| Setting | Default | Notes |
|---------|---------|--------|
| `min_duration_s` / `max_duration_s` | 15 / 60 (viral); 3 / 600 (scenes) | Viral length vs scene length |
| `max_clips` | 10 | How many segments Gemini may pick |
| `scene_gap_threshold_s` | 10 | Transcript gap *greater than* this starts a new scene |
| `scene_end_pad_s` | 0.75 | Tail pad after each scene end |
| `scene_detector` | `content` | PySceneDetect profile (`content` / `adaptive` / `fade` / `hybrid` / `ffmpeg`) |
| `scene_content_threshold` | 27 | Content/Adaptive score (higher = fewer cuts; typical 15–40) |
| `scene_fade_threshold` | 12 | Fade detector intensity (fade/hybrid) |
| `scene_min_scene_len_frames` | 15 | Debounce cuts at detection time (~0.5s @ 30fps) |
| `scene_visual_threshold` | 0.35 | FFmpeg fallback only (0–1; higher = fewer cuts) |
| `scene_snap_tolerance_s` | 2 | Max seconds to snap to a visual cut (forward-biased for ends) |

## Existing pipeline unchanged

`/clean-cut`, `/make-tsx`, Cut Editor, and `videos/video-N/` projects are **not modified** by this tool.
