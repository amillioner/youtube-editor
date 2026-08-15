"""Sweep `head` against analyze_cut's hard-entry count + total runtime.

Pick the SMALLEST head that reaches zero hard entries (bigger head buys lead-in
that costs real runtime). Mirrors tools/analyze_cut.py entry_check exactly.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path("tools").resolve()))
from cutlib import AudioProbe, plan_clip  # noqa: E402

proj = Path(sys.argv[1])
style_name = sys.argv[2]
data = json.loads((proj / "work" / "analysis" / "cuts.json").read_text(encoding="utf-8"))
probe = AudioProbe(proj)  # AudioProbe appends work/audio itself

base = dict(data["styles"][style_name])
words_by = {}
for c in data["clips"]:
    words_by[c["id"]] = json.loads(
        (proj / "work" / "transcripts" / f"{c['id']}.json").read_text(encoding="utf-8"))["words"]

print(f"style={style_name}  (min_tail={base['min_tail']}, max_tail={base['max_tail']})")
print(f"{'head':>6} {'hard':>5} {'runtime':>9}   offenders")
for head_ms in range(11, 27):
    head = head_ms / 100.0
    style = dict(base, head=head)
    total = 0.0
    offenders = []
    for c in data["clips"]:
        cid = c["id"]
        segs = plan_clip(cid, c["keeps"], words_by[cid], style, probe, c.get("cuts"))
        total += sum(e - s for s, e in segs)
        floor = probe.floor_db(cid)
        prev_end = None
        for s, e in segs:
            if prev_end is None or (s - prev_end) > 0.75:
                over = probe.rms_db(cid, max(s - 0.06, 0.0), 0.05) - floor
                if over > 15:
                    offenders.append(f"{cid}@{s:.2f}(+{over:.0f})")
            prev_end = e
    mark = "  <-- zero" if not offenders else ""
    print(f"{head:6.2f} {len(offenders):5d} {int(total // 60)}:{int(total % 60):02d}"
          f"     {' '.join(offenders[:4])}{mark}")
