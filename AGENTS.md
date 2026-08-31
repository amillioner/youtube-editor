## Learned User Preferences

- Prefers manual file select or drag-and-drop (video + captions/summary) over folder-watching for clip workflows; captions should accept paste or file upload.
- Wants Shorts/vertical crop optional — also support regular/source aspect without forced crop.
- Quran clip YouTube titles: `Surah … | Sheikh … | Makkah | Date` — omit rak'ah/"1st Rak'ah" fluff; keep under 100 characters.
- Quran exports should be recitation-only (Fatiha/surahs); skip Adhan, Iqamah, Taslim, and non-recitation segments; always produce titles and descriptions for YouTube.
- Prefers a separate Quran Clips UI from Clip Factory / Cut Editor; summary parsing via DeepSeek when `DEEPSEEK_API_KEY` is set, else local heuristic — not Gemini.
- Default Quran clip mode is **auto**: same Surah (or continued verses) → one stitched clip; different Surahs → separate clips; override with **One clip** / **Separate clips** checkboxes.
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
- Quran Clips exports use `encode_quality=highest`: source resolution kept, CRF 16 / slow, audio copied when possible, single-pass multi-rak'ah stitch (no 1920px downscale).
- Quran Clips job outputs live under `work/clip-jobs/quran-<id>/output/`; UI **Open output folder** opens that path in Explorer.
- Clip Factory viral selection is transcript-only via Gemini; untimed captions skip Gemini and export only the first `max_dur` seconds.
- Scenes mode does not use Gemini: transcript timestamp gaps snapped to PySceneDetect visual cuts (ContentDetector; FFmpeg fallback).
- Default ElevenLabs TTS voice for viral clips when enabled: Liam (`TX3LPaxmHKxFdv7VOQHJ`).
- Recurring source content: Makkah prayer recordings (e.g. Sheikh Dr. Waleed Al Shamasan) under `videos/`.
