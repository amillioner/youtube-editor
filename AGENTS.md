## Learned User Preferences

- Prefers manual file select (video + captions/summary) over folder-watching for clip workflows; captions should accept paste or file upload.
- Wants Shorts/vertical crop optional — also support regular/source aspect without forced crop.
- Quran clip YouTube titles: `Surah … | Sheikh … | Makkah | Date` — omit rak'ah/"1st Rak'ah" fluff; keep under 100 characters.
- Quran exports should be recitation-only (Fatiha/surahs); skip Adhan, Iqamah, Taslim, and non-recitation segments; always produce titles and descriptions for YouTube.
- Prefers a separate Quran Clips UI from Clip Factory / Cut Editor; parse pasted prayer summaries locally without requiring Gemini for that flow.
- On Windows, use `py` / `venv\Scripts\python` when plain `python` is not on PATH.
- Stack for this repo: Gemini, ElevenLabs, and Cursor locally — not a separate cloud video SaaS.

## Learned Workspace Facts

- Cut Editor UI lives at `tools/editor/` on port **8765**.
- Clip Factory UI lives at `tools/clip_factory/` on port **8766** (viral / compilation / scenes / full); job outputs under `work/clip-jobs/<job-id>/`.
- Quran Clips UI lives at `tools/quran_clips/` on port **8767** — select video, paste segment summary, cut clips; no Gemini key required.
- Clip Factory viral selection is transcript-only via Gemini; untimed captions skip Gemini and export only the first `max_dur` seconds.
- Scenes mode does not use Gemini: transcript timestamp gaps snapped to PySceneDetect visual cuts (ContentDetector; FFmpeg fallback).
- Default ElevenLabs TTS voice for viral clips when enabled: Liam (`TX3LPaxmHKxFdv7VOQHJ`).
- Recurring source content: Makkah prayer recordings (e.g. Sheikh Dr. Waleed Al Shamasan) under `videos/`.
