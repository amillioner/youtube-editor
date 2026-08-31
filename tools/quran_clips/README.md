# Quran Clips

Separate UI from Clip Factory. Cut Surah clips from a prayer video using a **pasted summary**.

## Workflow

1. Open **http://localhost:8767**
2. **Drop or select** the prayer video (MP4)
3. **Paste the video title** (or keep the file name) — date, prayer, and place come from this, not from a leftover example date
4. **Paste** the segment summary (Adhan / First Rak'ah / Second Rak'ah / …)
5. Optional: **Parse only** to preview detected clips
6. **Parse & cut** → titles + descriptions on tab 2 for YouTube Studio

## Parsing (DeepSeek preferred)

Set `DEEPSEEK_API_KEY` in the repo-root `.env` (see `.env.example`). When present, summaries are structured via DeepSeek (`deepseek-chat`) into First/Second Rak’ah Fatiha+Surah ranges — more reliable than regex on inconsistent wording.

If the key is **unset**, a local heuristic parser is used. If DeepSeek is set but the call fails, the UI shows the error (no silent fallback).

Each video is parsed as **every recited rak’ah** (2, 3 for Maghrib including a Fatiha-only 3rd, or 4). Date / prayer / place come from the **video title** (file name or the title field), not from a prompt example.

- **Same Surah** (or “further verses” / continued) → **one stitched clip** by default (all rak’ahs)
- **Different Surahs** → **one file per rak’ah** by default
- Override anytime with the **One clip** / **Separate clips** checkboxes

The paste does **not** need to say “First/Second Rak’ah” — ranges are inferred by order/time. Labels are always `Surah Al-Fatiha & …`.

## Export quality

Exports keep the **source resolution** (including 4K). Video is frame-accurately re-encoded at CRF 16; audio is copied when possible. Multi-rak’ah stitches encode **once** from the source — no 1920px downscale and no double encode.

## Start

From repo root (venv):

```bash
venv\Scripts\python tools\quran_clips\server.py
```

## Example paste

```
This video features the 'Isha prayer performed on October 11, 2024, at the
Grand Mosque in Makkah, led by Sheikh Waleed Al-Shamsaan.

* Adhan and Iqamah: … (0:00 - 0:42) …
* First Rak'ah: … Surah Adh-Dhariyat (2:06 - 3:36) followed by Ruku …
* Second Rak'ah: … further verses (5:34 - 6:54) followed by Ruku …
* Third and Fourth Rak'ahs: … ending with the Taslim.
```

→ same Surah, so **one clip**: Al-Fatiha (first rak’ah if listed, else the next) plus every Surah window, stitched. Four-segment pastes (Fatiha + Surah × 4) keep all four rak’ahs. Different Surahs auto-split into one file each. Checkboxes override either way.
