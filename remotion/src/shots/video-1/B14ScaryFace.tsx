import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';

// =============================================================================
// B14 (R12) · the scary-humour face. ACTIVE since v3 (2026-08-07).
//
// scary-face-slot.mp4 exists now: generated with fal/kling 2.5 turbo pro i2v
// from scary-ref-802.065.jpg (recipe below preserved for provenance; raw clip
// kept as scary-face-v1.mp4 + scary-face-v1.fal.json). Slot = source
// 1.55-2.85s re-timed to 39f @30: the claws are still rising at f0, the face
// peaks ~f17 on "scary.", and the last ~0.3s holds the peak — the silent hold
// IS the joke.
//
// v3 CLOCK NOTE: the V2 splice removed master 3.787117-4.954950 (delta
// 1.167833s), so the intended span below moved to 800.896967 -> 802.196967.
// All cue seconds in this header are the pre-V2 (post-R7) clock; local frames
// are unchanged.
//
// -----------------------------------------------------------------------------
// THE BEAT
// -----------------------------------------------------------------------------
// Intended master span 802.0648 -> 803.3648 (1.30s = 39 frames @30). It is a
// PUNCTUATION beat, not a rung of the ladder: no SIMULATED tag, no LevelRail, no
// chips. Same idiom as B1ShockClip1 — a full-bleed generated gag and nothing
// else. Anything ladder-flavoured here would pre-empt the SIMULATED framing that
// B14TodayItsText opens at 803.3648.
//
// Verified narration (post-splice clock, work/edited-transcript.json):
//   Now 795.952 · take 796.595 · a 796.900 · breath 796.980 · or 797.558 ·
//   drink 797.703 · some 797.895 · water 798.184 · because 799.003 ·
//   what 799.308 · you'll 799.405 · see 799.565 · now 799.742 · is 800.448 ·
//   really 800.673 · shocking 801.251 · and 802.054 · somehow 802.198 ·
//   scary. 802.632-803.066
//
// WHY THIS SPAN. It has to live inside the talking-head gap
// 795.9648 (end of B13TheLoop) -> 803.3648 (start of B14TodayItsText).
//   · In at 802.0648 = the onset of "and", so the cut lands on a word, not in
//     dead air, and the face has ~0.57s of run-up before "scary." at 802.632.
//   · Out at 803.3648 = butted straight against B14TodayItsText. Ending on
//     "scary." at 803.066 instead would leave a 0.30s sliver of master between
//     the gag and the ladder, and a 9-frame return to the talking head reads as
//     a stutter, not as a breath.
//   · That leaves 6.10s of real camera in front of it (795.96 -> 802.06), so
//     "take a breath or drink some water" is delivered straight to camera as
//     recorded. The gag is the last 1.3s only.
//   · The face therefore holds for ~0.30s after the word lands — that silent
//     hold IS the joke; the expression is funnier in the beat after "scary."
//     than on it.
//
// -----------------------------------------------------------------------------
// READY-TO-RUN GENERATION RECIPE (one command after a fal top-up)
// -----------------------------------------------------------------------------
// The reference frame is ALREADY EXTRACTED AND COMMITTED:
//   media/projects/video-1/scary-ref-802.065.jpg
//     ffmpeg -y -ss 802.0648 -i videos/video-1/output/master-natural-h264.mp4 \
//       -frames:v 1 -q:v 2 media/projects/video-1/scary-ref-802.065.jpg
//   It is the master frame AT the in-point, so wardrobe, room, light and framing
//   continue the real take. Lucky break: in that frame his right hand is already
//   raised near his chest with the fingers half-curled, which is most of the way
//   to a comic "spooky claw" — the prompt builds on the pose that is already
//   there instead of asking the model to invent one.
//
//   1) generate — kling first, the action is simple (~$0.35 for 5s):
//
//        venv/Scripts/python tools/gen_video.py \
//          --model kling --duration 5 --save-json \
//          --image media/projects/video-1/scary-ref-802.065.jpg \
//          --out media/projects/video-1/scary-face-v1.mp4 \
//          --prompt "<PROMPT>" --negative-prompt "<NEGATIVE>"
//
//      PROMPT
//        "The same bearded man in the olive-green sweatshirt, in the same bright
//         bedroom with the same framing and daylight, pulls a big comic
//         mock-scared face straight into the camera. His eyes go wide, his
//         eyebrows shoot up, his mouth opens into an exaggerated silent-movie
//         'oh no', his shoulders hunch up toward his ears, and he raises both
//         hands beside his face with the fingers spread like a cartoon spooky
//         claw. Playful and clearly a joke, not real fear. He holds the face at
//         its peak for a beat. Locked-off static camera, no zoom, no cut,
//         natural daylight, photoreal home-video look."
//
//      NEGATIVE
//        "horror, gore, blood, genuinely frightening, distorted face, melting
//         face, extra fingers, extra limbs, different person, clean shaven,
//         changed clothes, camera movement, zoom, cut, text, watermark,
//         subtitles"
//
//      If kling will not commit to the expression, escalate to veo (better
//      adherence, 4s is the shortest it takes, ~$0.80):
//        --model veo --duration 4s --resolution 1080p
//
//   2) find the peak, then trim EXACTLY 39 frames starting there. Contact-sheet
//      the candidate first — do not guess:
//        ffmpeg -y -i media/projects/video-1/scary-face-v1.mp4 \
//          -vf "fps=30,select='not(mod(n\,10))',scale=480:-1,tile=5x3" \
//          -frames:v 1 sheet.jpg          # every 10th frame = every 0.33s
//      Pick the second <S> where the expression is ~0.5s from its peak (the peak
//      should land around 0.57s in, on "scary."), then:
//        ffmpeg -y -ss <S> -i media/projects/video-1/scary-face-v1.mp4 \
//          -vf "fps=30,scale=1920:1080:flags=lanczos" -frames:v 39 -an \
//          -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p \
//          media/projects/video-1/scary-face-slot.mp4
//      Verify it is exactly 39 frames:
//        ffprobe -v error -select_streams v:0 -show_entries stream=nb_frames \
//          -of default=nw=1 media/projects/video-1/scary-face-slot.mp4
//
//   3) add the composition config line described under ACTIVATE above, then
//        cd remotion && npm run gen
//        node scripts/render-all.mjs --scale=1 B14ScaryFace
//
//   4) add to videos/video-1/work/timeline.json (the coordinator owns that file):
//        { "id": "B14ScaryFace", "type": "cutaway",
//          "master_in_s": 802.0648, "master_out_s": 803.3648, "beat": "B14" }
// =============================================================================

export const compositionConfig = { id: 'B14ScaryFace', durationInSeconds: 1.3, fps: 30, width: 1920, height: 1080 };

const B14ScaryFace: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: 'black' }}>
    <OffthreadVideo
      src={staticFile('projects/video-1/scary-face-slot.mp4')}
      muted
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </AbsoluteFill>
);
export default B14ScaryFace;
