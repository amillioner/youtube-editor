## Learned User Preferences

- Prefers manual file select or drag-and-drop (video + captions/summary) over folder-watching for clip workflows; captions should accept paste or file upload.
- Wants Shorts/vertical crop optional — also support regular/source aspect without forced crop.
- Quran clip YouTube titles: `Surah … | Sheikh Waleed Al Shamsaan | Makkah | Prayer | Date` — expand short filename forms like `Sheikh Shamsaan` to the full name; spell Shamsaan (not Shamasan); omit Dr. and rak'ah fluff; keep under 100 characters; never drop the reciter to fit.
- Quran exports should be recitation-only (Fatiha/surahs); skip Adhan, Iqamah, Taslim, and non-recitation segments; always produce titles and descriptions for YouTube.
- Prefers a separate Quran Clips UI from Clip Factory / Cut Editor; summary parsing via DeepSeek when `DEEPSEEK_API_KEY` is set, else local heuristic — not Gemini.
- Default Quran clip mode is **auto**: same Surah (or continued verses) → one stitched clip; different Surahs → separate by Surah; **Separate clips** also groups by Surah (not rak'ah), combining consecutive same-Surah rak'ahs; override with **One clip** / **Separate clips** checkboxes.
- One-clip exports must include Al-Fatiha from the first or second rak'ah listed in the summary.
- YouTube descriptions must include the full reciter name (e.g., "led by Sheikh Waleed Al Shamsaan") — never truncated placeholders like "Sheikh …".
- Parse date, prayer, and place from the user-provided **video title** (filename or title field), not from hardcoded example dates in prompts.
- On Windows, use `py` / `venv\Scripts\python` when plain `python` is not on PATH.
- Stack for this repo: Gemini, ElevenLabs, DeepSeek, and Cursor locally — not a separate cloud video SaaS.

## Learned Workspace Facts

- Cut Editor UI lives at `tools/editor/` on port **8765**.
- Clip Factory UI lives at `tools/clip_factory/` on port **8766** (viral / compilation / scenes / full); job outputs under `work/clip-jobs/<job-id>/`.
- Quran Clips UI lives at `tools/quran_clips/` on port **8767** — drop/select video, paste title + segment summary, cut clips; DeepSeek when keyed; no Gemini required.
- Quran Clips supports **2–4 rak'ahs** per prayer (e.g., Maghrib 3, Taraweeh 4) based on the pasted summary; paste does not need to say "First/Second Rak'ah" — ranges inferred by order/time.
- Quran Clips exports use `encode_quality=highest`: source resolution kept; prefer `h264_nvenc` (CQ 17) with libx264 fallback; audio copied when possible; single-pass multi-rak'ah stitch.
- Quran Clips job folders are named from the video title under `work/clip-jobs/<video-title>/` (not opaque `quran-<id>`); resubmitting the same title keeps the old folder and writes `<title>_2`, `_3`, …; input file uses the title name instead of `source.mp4`; UI **Open output folder** opens that job's output path.
- Quran Clips supports a job queue (submit while another encodes) and parallel encode of up to 2 clips within a multi-clip job.
- Clip Factory viral selection is transcript-only via Gemini; untimed captions skip Gemini and export only the first `max_dur` seconds.
- Scenes mode does not use Gemini: transcript timestamp gaps snapped to PySceneDetect visual cuts (ContentDetector; FFmpeg fallback).
- Default ElevenLabs TTS voice for viral clips when enabled: Liam (`TX3LPaxmHKxFdv7VOQHJ`).
- Recurring source content: Makkah prayer recordings (e.g. Sheikh Waleed Al Shamsaan) under `videos/`.
- Static project home deploys to Vercel at `yt-clip-editor.vercel.app`; editors still run locally (Python + ffmpeg on ports 8765–8767).
