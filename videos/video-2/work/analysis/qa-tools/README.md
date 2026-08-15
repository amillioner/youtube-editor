# qa-tools — cut-verification helpers written for video-2

Generic enough to promote to `tools/` later; kept per-video for now. Run from the repo
root with the venv python, e.g.:

```
venv/Scripts/python videos/video-2/work/analysis/qa-tools/phantoms.py videos/video-2
```

| script | what it answers |
|---|---|
| `dump_words.py <proj> <outdir>` | word-by-word times + flags LONG / GAP_AFTER / LOWCONF tokens |
| `rms.py floor\|env\|hot\|ramp <proj> <clip> [args]` | RMS envelope: noise floor, a printed envelope, hot (speech) sub-spans, and the onset-ramp distribution at atom starts |
| `phantoms.py <proj>` | **kept words whose span holds no audio** (<20% hot). A phantom has normal duration and normal gaps, so LONG/GAP scans miss it — but `split_atoms` will build an atom around it and the renderer emits dead air |
| `sweep_head.py <proj> <style>` | sweeps `head` against analyze_cut's hard-entry count + runtime. The zero-entry window is two-sided: too small clips onsets, too large reaches into the previous word's decay |
| `scenarios.py <proj>` | what each optional trim buys in RENDERED seconds (runs plan_clip for real, not raw span arithmetic) |
| `find_dupes.py <proj> <transcript-id>` | adjacent repeated n-grams surviving in a render |
| `find_near_dupes.py <proj> <tid> [lo hi]` | adjacent n-grams differing by <=1 token (catches "we should adapt" / "you should adapt") |
| `prose.py <proj> <tid> <t0> <t1>` | a rendered transcript as readable prose with [mm:ss] stamps |
| `peek_render.py <proj> <tid> <centre> [span]` | token-level view around a timestamp, for triaging a verify finding |

## The lesson these encode

The transcript lies about time in four ways (late start, inflated span, phantom,
**merged repeat**) and each needs a different detector. `phantoms.py` came from a real
0275 defect; the merged repeat came from Hasan's ear at ~1:44 and could only be *proved*
by slicing the two runs out with ffmpeg and re-transcribing each in isolation — when the
recognizer collapses two deliveries into one token, the duplicate is gone from the data
and no analysis of that data can recover it.
