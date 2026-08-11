import React from 'react';
import { AbsoluteFill, Freeze, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';
import { LevelRail, SimTag, r } from './B14Kit';

// =============================================================================
// B14 · LEVEL 5 — the humanoid. Master span 844.596967 -> 859.196967 (14.60s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 844.596967) * 30).
//
//   "And then eventually this—" 847.80 -> f70  rail slot 5 fills (still UNNAMED)
//   "same voice,"               848.61 -> f85
//   "same takes,"               849.99 -> f127
//   "same opinions,"            851.35 -> f168
//   "same beliefs."             852.88 -> f213
//   -- the 8s generated clip runs out here (f239 = master 853.73) --
//   "That's me,"                854.31 -> f254  held picture, push-in already gliding
//   "the iRobot version,"       855.83 -> f302  ★ rail slot 5 finally takes its NAME
//   "maybe without the          857.04 -> f338  the four "same" chips clear the frame
//    spiritual."                                so nothing sits over the punchline
//   "Looks scary, huh?"         859.37 -> f408  clean: face + tag + rail only
//
// ALL TIMES ARE THE POST-SPLICE CLOCK. The R7 audio splice removed master
// 352.085-353.920 (delta 1.835167s), so every v1 timecode in this beat moved by
// -1.835167s. Re-derive from work/edited-transcript.json, never from old notes.
//
// GENERATED. media/projects/video-1/l5-humanoid-slot.mp4 was made with
// tools/gen_video.py (fal, veo 3.1 image-to-video, 8s, $1.60) from a master
// frame at 845.165. veo's prompt adherence does the work no image could: the
// real take runs for ~2.7s and then he TRANSFORMS into the robot version of
// himself in one continuous shot. The slot in-point is chosen so that transform
// lands at ~848.5, in the pause right after "eventually this—" and just before
// "same voice" 848.61 — it must never land before the word.
// The slot file is exactly 240 frames @30fps (8.00s), so this shot plays it
// from frame 0: no startFrom, no fps-mismatch semantics to get wrong.
//
// ★ The SIMULATED tag is on the first frame and never dips, for all 438 frames.
// That is load-bearing: see "WHY THIS SHOT DRAWS ITS OWN TAG" below. Chips sit
// LEFT so they never cover the centre-framed face.
//
// -----------------------------------------------------------------------------
// THE HOLD (R13) — 8.00s of footage carried to 14.60s WITHOUT generating more
// -----------------------------------------------------------------------------
// The user wanted level 5 held through "That's me, the iRobot version" and
// "Looks scary, huh?" instead of cutting away at 853.76. veo caps at 8s and
// there is no second clip, so the extra 6.60s is a DESIGNED HOLD, not new
// footage and emphatically not a loop:
//
//   f0-f239    the clip plays at 1:1, untouched.
//   f234       a slow push-in starts (scale 1 -> 1.052, LINEAR, so it never
//              decelerates into a dead stop). It starts 6 frames BEFORE the
//              footage stops on purpose: the eye is already tracking a global
//              move when the micro-motion ends, so the freeze is not read as a
//              player stalling. Across those 6 overlapping frames the picture
//              grows by at most 1.3px at the frame edge — invisible.
//   f240-f437  <Freeze> pins the video to F_FREEZE and the push-in carries it.
//              Nothing about this depends on what is IN the clip, so the R14
//              re-roll drops into the same slot file and the hold still works.
//
// Two real events keep the held picture from going inert: the rail slot takes
// its name at f302 and the chip column clears at f338. Both fire AFTER f240.
//
// SO THE RETIME IS SAFE TO APPLY *OR* TO DEFER. If timeline.json is left at the
// old 845.7648 -> 853.7648 span, bake.py just takes the first 240 frames and the
// beat is what it always was: no cue moved, and the only difference anywhere in
// those 240 frames is the sub-1.3px push over the last 6. Renders of this
// composition are 14.60s either way; the extra frames are simply unused.
//
// F_FREEZE is the one knob. It defaults to the slot's LAST frame; point it at
// any earlier frame (the best one in the final second) if a future slot ends on
// a blink and the picture should settle sooner.
//
// ⚠ WITH THE CURRENT v1 SLOT THE HOLD IS COMPROMISED, for a reason that is not
// the design's fault: frame 239 has the android with its eyes CLOSED, head
// tilted down, looking away from camera. Held for 6.6s under "That's me" that
// reads as a powered-down robot, and it parks the wrong-identity face (see
// below) on screen for nearly twice as long. Do not ship the 14.60s span until
// the re-roll lands. The re-roll prompt now asks for a camera-facing settle so
// that F_FREEZE = last frame is a good frame.
//
// -----------------------------------------------------------------------------
// WHY THIS SHOT DRAWS ITS OWN SIMULATED TAG (do not "simplify" this away)
// -----------------------------------------------------------------------------
// B14TagHold is an OVERLAY. tools/bake.py picks, per segment, a covering cutaway
// OR a covering overlay — `if cut: ... elif ov:` — so a cutaway always wins and
// the overlay is silently dropped, no warning. This shot is a CUTAWAY, so for
// every frame it covers, B14TagHold does not composite. The honesty tag would
// vanish for the whole hold if this shot did not draw it itself. It does, from
// frame 0 (`at={-30}`), and B14TagHold picks it up at the same corner geometry
// the frame after this shot ends.
//
// B14TagHold does NOT need shortening for that hand-off. bake.py seeks an
// overlay by master offset (bake.py:120), so its cues stay pinned to absolute
// master time and it is simply entered at frame 198 instead of frame 0. Leave
// its span at 853.7648 -> 863.3648.
//
// -----------------------------------------------------------------------------
// KNOWN ISSUE + READY-TO-RUN RE-ROLL (R14, approved, blocked on fal balance)
// -----------------------------------------------------------------------------
// v1's android does not read as HIM: it loses the beard and the face becomes
// paler, younger and narrower — a different, clean-shaven European man. Reading
// the split-face frame (f81) shows the drift starts DURING the morph, not at the
// end, so a re-roll has to constrain the geometry through the transformation,
// not just describe the end state. That matters because the line underneath is
// "same voice, same takes, same opinions, same beliefs" and the callback at
// 854.31 is "That's me".
//
// The re-roll is approved but fal is hard-locked account-wide: every submit
// returns 403 "User is locked. Reason: Exhausted balance." Once the balance is
// topped up this is a drop-in — nothing in this file changes, because the shot
// reads the SLOT file, and the hold above is content-agnostic.
//
//   1) generate (the `resolution` and `8s` duration handling that veo needs are
//      now in tools/gen_video.py; a bare `--duration 8` works too):
//
//        venv/Scripts/python tools/gen_video.py \
//          --model veo --duration 8s --resolution 1080p --save-json \
//          --image media/projects/video-1/l5-ref-845.165.jpg \
//          --out media/projects/video-1/l5-humanoid-v2.mp4 \
//          --prompt "<PROMPT below>" --negative-prompt "<NEGATIVE below>"
//
//        endpoint  fal-ai/veo3.1/image-to-video       cost ~$1.60
//        image     media/projects/video-1/l5-ref-845.165.jpg
//                  (master @ 845.165 = the v1 recipe's 847.00 in the new clock;
//                   already extracted and committed, so this really is one
//                   command. l5-ref-847.00.jpg is the stale v1 frame — keep it
//                   for reference, do not feed it to the model.)
//
//        PROMPT    "The exact same man stays in frame and never changes
//                   identity: same face geometry, same thick dark full beard and
//                   moustache in the same shape, same heavy brow, same nose,
//                   same hairline, same skin tone. He looks completely normal and
//                   human for the first two and a half seconds. Then over about
//                   one second his skin turns into a matte synthetic android
//                   surface, with fine seam lines along the jaw, temple and
//                   cheek and a thin metal ring at the base of the neck. He KEEPS
//                   the beard and the same face. He is the same man rendered as
//                   an android, not a different person. His own dark brown eyes
//                   with a faint ring of light around the iris. He keeps talking
//                   calmly to camera. In the final second he settles, turns to
//                   face the camera directly and holds a still, calm, open-eyed
//                   look straight down the lens. Locked-off static camera, same
//                   bright bedroom, natural daylight, photoreal."
//
//        NEGATIVE  "clean shaven, no beard, different person, face swap, younger
//                   face, pale white skin, narrow jaw, changed hairstyle, eyes
//                   closed at the end, looking away at the end, cut, camera
//                   movement, text, watermark"
//
//      The last sentence of the prompt and the two "at the end" negatives are the
//      R13 addendum: the shot now FREEZES on the clip's last frame, so that frame
//      has to be worth looking at for 6.6 seconds. Everything else is the
//      previously approved wording, unchanged.
//
//   2) trim to the slot (MUST stay exactly 240 frames @30 = 8.00s):
//        ffmpeg -y -i media/projects/video-1/l5-humanoid-v2.mp4 \
//          -vf "fps=30,scale=1920:1080:flags=lanczos" -frames:v 240 -an \
//          -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p \
//          media/projects/video-1/l5-humanoid-slot.mp4
//
//   3) cd remotion && node scripts/render-all.mjs --scale=1 B14L5Humanoid
//
//   4) VERIFY, in this order — a take that fails any of these is not usable:
//      a) IDENTITY. Put a pre-morph and a post-morph frame side by side:
//           ffmpeg -y -i out/B14L5Humanoid.mp4 -vf \
//             "select='eq(n\,60)+eq(n\,150)',scale=760:-1,tile=2x1" -frames:v 1 id.jpg
//         The beard, the jaw width and the skin tone must survive. If the android
//         still reads as a different man, re-roll — that is the entire point.
//      b) MORPH TIMING. It must land ~2.7s in (f75-f85, master ~848.3-848.6),
//         after "eventually this—" and BEFORE "same voice" 848.61. There is no
//         trim slack: the source is 8s and the slot is 8s.
//      c) FREEZE FRAME. Frame 239 of the slot is what the shot holds for 6.6s.
//         Eyes open, facing camera. If not, set F_FREEZE to the best frame in
//         the last second instead.
// =============================================================================
export const compositionConfig = { id: 'B14L5Humanoid', durationInSeconds: 14.6, fps: 30, width: 1920, height: 1080 };

/** last frame of the 240-frame slot clip — the picture the hold settles on */
const F_FREEZE = 239;
/** the push-in starts just before the footage stops, so the stop has no onset */
const F_PUSH = 234;
const F_END = 437;

const F_THIS = 70;
const F_NAME = 302;
const F_CLEAR = 338;

const SAMES = [
  { label: 'same voice', at: 85 },
  { label: 'same takes', at: 127 },
  { label: 'same opinions', at: 168 },
  { label: 'same beliefs', at: 213 },
];

const RAIL_BASE = [
  { n: 1, label: 'voice', at: -30 },
  { n: 2, label: 'voice clone', at: -30 },
  { n: 3, label: 'photo', at: -30 },
  { n: 4, label: 'lipsync', at: -30 },
];

const B14L5Humanoid: React.FC = () => {
  const frame = useCurrentFrame();
  const brOp = r(frame, 4, 20) * 0.85;

  // linear on purpose: a constant creep never reads as "starting" or "stopping"
  const push = interpolate(frame, [F_PUSH, F_END], [1, 1.052], CLAMP);
  // the chip column clears before "Looks scary, huh?" (brand.md §6)
  const chipsOp = r(frame, F_CLEAR, F_CLEAR + 20, 1, 0, EASINGS.easeInOut);
  // Slot 5 takes its name the moment he says "the iRobot version". LevelRail
  // centres each slot's contents, so adding the label shifts the "5" left by
  // ~107px — a re-layout, not a fade. Stacking a labelled rail over an unlabelled
  // one ghosts two "5" glyphs for the length of the crossfade (verified on the
  // render), so instead the label is swapped on one frame and the whole rail
  // dips briefly around the swap. The dip reads as "this row updated" and hides
  // the jump without duplicating B14Kit's private slot geometry here.
  const railDip = interpolate(frame, [F_NAME - 5, F_NAME, F_NAME + 7], [1, 0.55, 1], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Freeze frame={F_FREEZE} active={frame > F_FREEZE}>
          <OffthreadVideo
            src={staticFile('projects/video-1/l5-humanoid-slot.mp4')}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Freeze>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.d900}66, transparent 22%, transparent 62%, ${COLORS.d900}99)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${COLORS.d900}aa, transparent 38%)` }} />

      <div style={{
        position: 'absolute', left: 54, top: 100, opacity: brOp,
        background: `${COLORS.d900}d9`, borderRadius: RADIUS.pill, padding: '8px 20px',
        fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.warn,
      }}>
        GENERATED RENDER
      </div>

      {/* "same voice, same takes, same opinions, same beliefs." — left column so
          the centre-framed face stays clear. Clears at F_CLEAR. */}
      <div style={{ position: 'absolute', left: 62, top: 372, width: 520, opacity: chipsOp }}>
        {SAMES.map((s) => {
          const op = r(frame, s.at, s.at + 14);
          const x = r(frame, s.at, s.at + 14, -22, 0);
          return (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18,
              background: `${COLORS.d900}cc`, border: `2px solid ${COLORS.accent}`,
              borderRadius: RADIUS.pill, padding: '14px 30px',
              opacity: op, transform: `translateX(${x}px)`,
            }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.paper }}>{s.label}</span>
            </div>
          );
        })}
      </div>

      <SimTag frame={frame} at={-30} tone="dark" />

      {/* Slot 5 is REACHED at f70 but stays UNNAMED — the ladder's rule is that a
          slot shows its name only once the narration has named it, and he does
          not say "the iRobot version" until f302, which is now inside this shot
          instead of after it. */}
      <div style={{ opacity: railDip }}>
        <LevelRail
          frame={frame}
          at={-30}
          tone="dark"
          slots={[...RAIL_BASE, { n: 5, label: frame >= F_NAME ? 'iRobot version' : '', at: F_THIS }]}
        />
      </div>
    </AbsoluteFill>
  );
};
export default B14L5Humanoid;
