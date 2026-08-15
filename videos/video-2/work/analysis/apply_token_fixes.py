"""Re-apply token-time-fixes.json to this project's transcripts.

transcribe.py --force wipes hand corrections, so run this after any re-transcribe:
    venv/Scripts/python videos/video-2/work/analysis/apply_token_fixes.py videos/video-2

Idempotent: asserts the word text matches and skips a fix already applied.
"""
import json
import sys
from pathlib import Path

proj = Path(sys.argv[1] if len(sys.argv) > 1 else "videos/video-2")
spec = json.loads((proj / "work" / "analysis" / "token-time-fixes.json").read_text(encoding="utf-8"))
tdir = proj / "work" / "transcripts"

cache: dict[str, dict] = {}


def load(clip: str) -> dict:
    if clip not in cache:
        cache[clip] = json.loads((tdir / f"{clip}.json").read_text(encoding="utf-8"))
    return cache[clip]


applied = skipped = 0


def check(clip: str, idx: int, want: str):
    w = load(clip)["words"][idx]
    got = w["text"]
    if got != want:
        raise SystemExit(f"ABORT {clip}#{idx}: expected {want!r}, found {got!r} — transcript changed shape")
    return w


for f in spec.get("fixes", []):
    w = check(f["clip"], f["index"], f["word"]) if "index" in f else None
    if w is None:
        continue
    if w["start"] == f["to_ms"]:
        skipped += 1
        continue
    w["start"] = f["to_ms"]
    applied += 1
    print(f"  {f['clip']}#{f['index']} {f['word']!r} start -> {f['to_ms']}ms")

for s in spec.get("inflated_spans", []):
    w = check(s["clip"], s["index"], s["word"])
    for key, field in (("new_start_ms", "start"), ("new_end_ms", "end")):
        if key in s:
            if w[field] == s[key]:
                skipped += 1
                continue
            w[field] = s[key]
            applied += 1
            print(f"  {s['clip']}#{s['index']} {s['word']!r} {field} -> {s[key]}ms (frees {s.get('freed_s')}s)")

for g in spec.get("retimed_groups", []):
    for e in g["words"]:
        w = check(g["clip"], e["index"], e["word"])
        if w["start"] == e["to_start_ms"] and w["end"] == e["to_end_ms"]:
            skipped += 1
            continue
        w["start"], w["end"] = e["to_start_ms"], e["to_end_ms"]
        applied += 1
        print(f"  {g['clip']}#{e['index']} {e['word']!r} -> {e['to_start_ms']}-{e['to_end_ms']}ms")

for clip, data in cache.items():
    (tdir / f"{clip}.json").write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding="utf-8")

print(f"\napplied {applied}, already-correct {skipped}, transcripts rewritten: {len(cache)}")
