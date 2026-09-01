"""Helpers for Quran Clips titles, timestamps, and descriptions."""
from __future__ import annotations

import re
from typing import Any


def parse_timestamp(value: str | float | int) -> float:
    """Parse 'M:SS', 'H:MM:SS', or seconds to float seconds."""
    if isinstance(value, (int, float)):
        return float(value)
    s = str(value).strip()
    if not s:
        raise ValueError("empty timestamp")
    if re.fullmatch(r"\d+(\.\d+)?", s):
        return float(s)
    parts = s.split(":")
    if len(parts) == 2:
        m, sec = parts
        return int(m) * 60 + float(sec)
    if len(parts) == 3:
        h, m, sec = parts
        return int(h) * 3600 + int(m) * 60 + float(sec)
    raise ValueError(f"bad timestamp: {value!r}")


_SHEIKH_NAME = r"(?:Sheikh|Shaikh|Shaykh)(?:\s+Dr\.?)?(?:\s+[A-Z][a-zA-Z\-']+)+"
_SHEIKH_LED = re.compile(
    r"(?i:led by|recited by|imam[:\s]+|reciter[:\s]+)\s*\*{0,2}(" + _SHEIKH_NAME + r")"
)
_SHEIKH_ANY = re.compile(r"\b(" + _SHEIKH_NAME + r")")

# Short filename forms → canonical channel reciter name
_RECITER_ALIASES: dict[str, str] = {
    "shamsaan": "Sheikh Waleed Al Shamsaan",
    "shamasan": "Sheikh Waleed Al Shamsaan",
    "sheikh shamsaan": "Sheikh Waleed Al Shamsaan",
    "sheikh shamasan": "Sheikh Waleed Al Shamsaan",
    "waleed al shamsaan": "Sheikh Waleed Al Shamsaan",
    "waleed al shamasan": "Sheikh Waleed Al Shamsaan",
    "sheikh waleed al shamsaan": "Sheikh Waleed Al Shamsaan",
    "sheikh waleed al shamasan": "Sheikh Waleed Al Shamsaan",
}


def format_reciter(name: str) -> str:
    """Display form: 'Sheikh Waleed Al Shamsaan' (Al- → Al )."""
    s = re.sub(r"[*]+", "", name or "")
    s = re.sub(r"\.{2,}|…|‥", "", s)
    s = re.sub(r"\s+", " ", s).strip().rstrip(".,;:")
    if not s:
        return ""
    alias_key = re.sub(r"^(?:sheikh|shaikh|shaykh|imam)\s+", "", s, flags=re.I).strip().lower()
    if alias_key in _RECITER_ALIASES:
        return _RECITER_ALIASES[alias_key]
    if s.lower() in _RECITER_ALIASES:
        return _RECITER_ALIASES[s.lower()]
    s = re.sub(r"\b(Al|An|Ar|As|Ad|Ash|Adh|At|Az)-", r"\1 ", s, flags=re.I)
    s = re.sub(r"\bShamasan\b", "Shamsaan", s, flags=re.I)
    if not re.match(r"^(sheikh|shaikh|shaykh|imam)\b", s, re.I):
        s = f"Sheikh {s}"
    s = re.sub(r"^(?:shaikh|shaykh|sheikh)\b", "Sheikh", s, flags=re.I)
    return s


def is_real_reciter(name: str) -> bool:
    s = (name or "").strip()
    if not s or re.search(r"\.{2,}|…|‥", s):
        return False
    if re.fullmatch(r"(the\s+)?(imam|sheikh|shaikh|shaykh)\.?", s, re.I):
        return False
    return bool(re.search(r"(sheikh|imam)\s+[A-Za-z]", s, re.I))


_MONTHS = {
    "jan": "January",
    "january": "January",
    "feb": "February",
    "february": "February",
    "mar": "March",
    "march": "March",
    "apr": "April",
    "april": "April",
    "may": "May",
    "jun": "June",
    "june": "June",
    "jul": "July",
    "july": "July",
    "aug": "August",
    "august": "August",
    "sep": "September",
    "sept": "September",
    "september": "September",
    "oct": "October",
    "october": "October",
    "nov": "November",
    "november": "November",
    "dec": "December",
    "december": "December",
}
_MONTH = (
    r"(?:January|February|March|April|May|June|July|August|September|October|November|December"
    r"|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept?|Oct|Nov|Dec)"
)
_DATE_DMY = re.compile(
    rf"\b(\d{{1,2}})(?:st|nd|rd|th)?\s+({_MONTH}),?\s+(\d{{4}})\b",
    re.I,
)
_DATE_MDY = re.compile(
    rf"\b({_MONTH})\s+(\d{{1,2}})(?:st|nd|rd|th)?,?\s+(\d{{4}})\b",
    re.I,
)
_DATE_RAMADAN = re.compile(
    r"\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:night\s+of\s+)?Ramadan\s+(\d{4})\b",
    re.I,
)
_HIJRI_MONTHS = (
    r"Muharram|Safar|Rabi(?:\s+Al-?)?(?:Awwal|I|1|First)|Rabi(?:\s+Al-?)?(?:Thani|II|2|Second)"
    r"|Jumada(?:\s+Al-?)?(?:Awwal|I|1|First)|Jumada(?:\s+Al-?)?(?:Thani|II|2|Second)"
    r"|Rajab|Sha(?:'|\u2019)?ban|Ramadan|Shawwal|Dhul(?:\s+)?(?:Qa(?:'|\u2019)?dah|Qadah)"
    r"|Dhul(?:\s+)?(?:Hijjah|Hijja)"
)
_DATE_HIJRI = re.compile(
    rf"\b(\d{{1,2}})(?:st|nd|rd|th)?\s+({_HIJRI_MONTHS})\s+(\d{{4}})\b",
    re.I,
)
_PRAYER = re.compile(
    r"\b(Maghrib|Isha|'Isha|‘Isha|Fajr|Dhuhr|Zuhr|Asr|Tahajjud|Taraweeh)\b",
    re.I,
)
_PLACE = re.compile(
    r"(Grand Mosque|Masjid al-Haram|Masjid al Haram|Makkah|Mecca|Madinah|Medina)",
    re.I,
)


def _month_name(token: str) -> str:
    return _MONTHS.get(token.lower().rstrip("."), token.title())


def format_calendar_date(day: int, month: str, year: int) -> str:
    return f"{_month_name(month)} {day}, {year}"


def _hijri_month_name(token: str) -> str:
    t = re.sub(r"\s+", " ", token.strip())
    low = t.lower().replace("'", "").replace("\u2019", "")
    if "ramadan" in low:
        return "Ramadan"
    if "shawwal" in low:
        return "Shawwal"
    if "muharram" in low:
        return "Muharram"
    if low.startswith("safar"):
        return "Safar"
    if "rajab" in low:
        return "Rajab"
    if "shaban" in low or "sha ban" in low:
        return "Shaban"
    if "dhul" in low and ("hijjah" in low or "hijja" in low):
        return "Dhul Hijjah"
    if "dhul" in low and ("qadah" in low or "qada" in low):
        return "Dhul Qadah"
    if "rabi" in low and ("thani" in low or " ii" in low or low.endswith("2")):
        return "Rabi Al-Thani"
    if "rabi" in low:
        return "Rabi Al-Awwal"
    if "jumada" in low and ("thani" in low or " ii" in low or low.endswith("2")):
        return "Jumada Al-Thani"
    if "jumada" in low:
        return "Jumada Al-Awwal"
    return t.title()


def extract_date(text: str) -> str:
    """Date from a video title or paste. Accepts '15th Feb 2025' and 'October 11, 2024'."""
    if not (text or "").strip():
        return ""
    m = _DATE_DMY.search(text)
    if m:
        return format_calendar_date(int(m.group(1)), m.group(2), int(m.group(3)))
    m = _DATE_MDY.search(text)
    if m:
        return format_calendar_date(int(m.group(2)), m.group(1), int(m.group(3)))
    m = _DATE_RAMADAN.search(text)
    if m:
        return f"{int(m.group(1))} Ramadan {m.group(2)}"
    m = _DATE_HIJRI.search(text)
    if m:
        return f"{int(m.group(1))} {_hijri_month_name(m.group(2))} {m.group(3)}"
    return ""


def extract_prayer(text: str) -> str:
    m = _PRAYER.search(text or "")
    if not m:
        return ""
    prayer = m.group(1)
    if prayer.lower() in {"'isha", "‘isha", "isha"}:
        return "Isha"
    return prayer[0].upper() + prayer[1:].lower() if prayer.lower() != "dhuhr" else "Dhuhr"


def extract_place(text: str) -> str:
    m = _PLACE.search(text or "")
    if not m:
        return ""
    token = m.group(1)
    if re.search(r"madinah|medina", token, re.I):
        return "Madinah"
    return "Makkah"


def extract_sheikh(text: str) -> str:
    """Pull the reciter name from a pasted summary or video title."""
    if not (text or "").strip():
        return ""
    m = _SHEIKH_LED.search(text)
    if not m:
        m = _SHEIKH_ANY.search(text)
    if not m:
        return ""
    return format_reciter(m.group(1))


def meta_from_text(text: str) -> dict[str, str]:
    return {
        "date": extract_date(text),
        "prayer": extract_prayer(text),
        "place": extract_place(text),
        "sheikh": extract_sheikh(text),
    }


def merge_source_meta(
    llm: dict[str, str] | None = None,
    *,
    video_title: str = "",
    summary: str = "",
) -> dict[str, str]:
    """Title wins for date/prayer/place. Never keep an LLM date that is not in the sources."""
    title_m = meta_from_text(video_title)
    paste_m = meta_from_text(summary)
    llm = llm or {}

    date = title_m["date"] or paste_m["date"]
    llm_date = str(llm.get("date") or "").strip()
    if not date and llm_date and extract_date(llm_date) and (
        extract_date(llm_date) == extract_date(f"{video_title} {summary}")
        or llm_date.lower() in f"{video_title} {summary}".lower()
    ):
        date = extract_date(llm_date) or llm_date

    prayer = title_m["prayer"] or paste_m["prayer"]
    llm_prayer = str(llm.get("prayer") or "").strip()
    if not prayer and llm_prayer:
        blob = f"{video_title} {summary}".lower()
        if llm_prayer.lower().replace("'", "") in blob.replace("'", "") or llm_prayer.lower() == "prayer":
            prayer = extract_prayer(llm_prayer) or llm_prayer

    place = title_m["place"] or paste_m["place"]
    llm_place = str(llm.get("place") or "").strip()
    if not place and llm_place:
        place = extract_place(llm_place) or llm_place
    if not place:
        place = "Makkah"

    sheikh = ""
    for cand in (paste_m["sheikh"], title_m["sheikh"], str(llm.get("sheikh") or "")):
        formatted = format_reciter(cand)
        if is_real_reciter(formatted):
            sheikh = formatted
            break

    if prayer.lower() in {"'isha", "‘isha", "isha"}:
        prayer = "Isha"
    if re.search(r"makkah|mecca|haram|grand mosque", place, re.I):
        place = "Makkah"

    return {
        "sheikh": sheikh or "Sheikh",
        "place": place,
        "date": date,
        "prayer": prayer or "Prayer",
    }


def format_clock(seconds: float) -> str:
    s = max(0, int(round(seconds)))
    h, rem = divmod(s, 3600)
    m, sec = divmod(rem, 60)
    if h:
        return f"{h}:{m:02d}:{sec:02d}"
    return f"{m}:{sec:02d}"


DEFAULT_END_BUFFER_S = 8.0


def apply_end_buffer(
    clips: list[dict[str, Any]],
    pad_s: float,
    *,
    duration_s: float | None = None,
) -> list[dict[str, Any]]:
    """Add pad_s after every recitation cut (each rak'ah when stitched). Starts stay put."""
    pad = float(pad_s or 0)
    if pad <= 0 or not clips:
        return clips
    out: list[dict[str, Any]] = []
    for clip in clips:
        c2 = dict(clip)
        segs = c2.get("segments")
        if isinstance(segs, list) and segs:
            new_segs: list[dict[str, Any]] = []
            for i, seg in enumerate(segs):
                s = dict(seg)
                new_end = float(s["end_s"]) + pad
                if i + 1 < len(segs):
                    next_start = float(segs[i + 1]["start_s"])
                    new_end = min(new_end, next_start)
                if duration_s is not None:
                    new_end = min(new_end, float(duration_s))
                new_end = max(new_end, float(s["end_s"]))
                s["end_s"] = round(new_end, 3)
                s["end"] = format_clock(s["end_s"])
                new_segs.append(s)
            c2["segments"] = new_segs
            c2["end_s"] = new_segs[-1]["end_s"]
            c2["end"] = new_segs[-1]["end"]
        else:
            new_end = float(c2["end_s"]) + pad
            if duration_s is not None:
                new_end = min(new_end, float(duration_s))
            c2["end_s"] = round(new_end, 3)
            c2["end"] = format_clock(c2["end_s"])
        out.append(c2)
    return out


def build_youtube_title(
    surah_label: str,
    *,
    sheikh: str,
    place: str,
    date: str,
    prayer: str = "",
    max_len: int = 99,
) -> str:
    """Build a YouTube title under max_len chars.

    Format: Surah … | Sheikh … | Place | Prayer | Date
    """
    surah = (surah_label or "").strip()
    sheikh = format_reciter(sheikh)
    if not is_real_reciter(sheikh):
        sheikh = ""
    place = (place or "").strip()
    prayer = (prayer or "").strip()
    if prayer.lower() in {"'isha", "\u2018isha", "isha"}:
        prayer = "Isha"
    elif prayer:
        prayer = prayer[0].upper() + prayer[1:].lower() if prayer.lower() != "dhuhr" else "Dhuhr"
    date = (date or "").strip()

    def join(parts: list[str]) -> str:
        return " | ".join(p for p in parts if p)

    full = join([surah, sheikh, place, prayer, date])
    if len(full) <= max_len:
        return full
    # Drop place, then date — never drop reciter or Surah
    no_place = join([surah, sheikh, prayer, date])
    if len(no_place) <= max_len:
        return no_place
    no_date = join([surah, sheikh, prayer])
    if len(no_date) <= max_len:
        return no_date
    core = join([surah, sheikh])
    if len(core) <= max_len:
        return core
    if sheikh and len(sheikh) <= max_len:
        return sheikh[:max_len]
    return (surah or "Quran Recitation")[:max_len]


def build_description(
    *,
    youtube_title: str,
    surah_label: str,
    sheikh: str,
    place: str,
    date: str,
    prayer: str,
    notes: str = "",
) -> str:
    reciter = format_reciter(sheikh)
    if not is_real_reciter(reciter):
        reciter = ""
    place = place.strip() or "Masjid al-Haram, Makkah"
    prayer = prayer.strip() or "prayer"
    date_line = f" on {date.strip()}" if date.strip() else ""
    notes = notes.strip()

    where = (
        f"the Grand Mosque (Masjid al-Haram) in {place}"
        if "makkah" in place.lower() or "mecca" in place.lower()
        else place
    )
    intro = f"This clip is from the {prayer} at {where}{date_line}."

    body = [youtube_title, "", intro]
    if reciter:
        body.extend(["", f"Led by {reciter}."])
    body.extend(
        [
            "",
            f"Recitation: {surah_label}.",
            "",
            "This clip contains only the Qur’an recitation — Adhan and Taslim are not included.",
        ]
    )
    if notes:
        body.extend(["", notes])
    source = f"Source: {prayer} — {place}{date_line}"
    if reciter:
        source += f", led by {reciter}"
    source += "."
    body.extend(
        [
            "",
            source,
            "",
            "May Allah accept from us and you.",
            "",
            _hashtags(surah_label, prayer, place, reciter),
        ]
    )
    return "\n".join(body)


def _hashtags(surah_label: str, prayer: str, place: str, reciter: str = "") -> str:
    tags = ["#Quran"]
    for part in re.split(r"[&,/+]| and ", surah_label, flags=re.I):
        clean = re.sub(r"[^A-Za-z0-9]+", "", part.strip())
        if clean and clean.lower() not in ("surah", "surat"):
            if not clean.lower().startswith("surah"):
                tags.append(f"#Surah{clean}" if not clean.startswith("Al") else f"#{clean}")
            else:
                tags.append(f"#{clean}")
    prayer_tag = re.sub(r"[^A-Za-z0-9]+", "", prayer)
    if prayer_tag:
        tags.append(f"#{prayer_tag}")
    if "makkah" in place.lower() or "haram" in place.lower():
        tags.extend(["#Makkah", "#MasjidAlHaram"])
    reciter_tag = re.sub(r"[^A-Za-z0-9]+", "", reciter or "")
    if reciter_tag and reciter_tag.lower() not in {"sheikh", "imam"}:
        tags.append(f"#{reciter_tag}")
    tags.append("#IslamicReminder")
    seen: set[str] = set()
    out: list[str] = []
    for t in tags:
        if t.lower() not in seen:
            seen.add(t.lower())
            out.append(t)
    return " ".join(out[:10])


def normalize_clip(raw: dict[str, Any], meta: dict[str, str]) -> dict[str, Any]:
    surah = (raw.get("surah") or raw.get("title") or "").strip()
    if not surah:
        raise ValueError("each clip needs a Surah / label")
    start_s = parse_timestamp(raw.get("start") if raw.get("start") is not None else raw.get("start_s"))
    end_s = parse_timestamp(raw.get("end") if raw.get("end") is not None else raw.get("end_s"))
    if end_s <= start_s:
        raise ValueError(f"end must be after start for {surah!r}")
    yt_title = build_youtube_title(
        surah,
        sheikh=meta.get("sheikh", ""),
        place=meta.get("place", ""),
        date=meta.get("date", ""),
        prayer=meta.get("prayer", ""),
    )
    desc = build_description(
        youtube_title=yt_title,
        surah_label=surah,
        sheikh=meta.get("sheikh", ""),
        place=meta.get("place", ""),
        date=meta.get("date", ""),
        prayer=meta.get("prayer", ""),
        notes=(raw.get("notes") or "").strip(),
    )
    out: dict[str, Any] = {
        "surah": surah,
        "start_s": round(start_s, 3),
        "end_s": round(end_s, 3),
        "youtube_title": yt_title,
        "title_len": len(yt_title),
        "description": desc,
    }
    segs = raw.get("segments")
    if isinstance(segs, list) and segs:
        out["segments"] = segs
    return out
