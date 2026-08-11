import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_MONO } from '../../fonts';
import { SimTag, TAG_BIG, r } from './B14Kit';

// =============================================================================
// B14 · the tag enlarges. TRANSPARENT OVERLAY. Master span 855.60 -> 865.20.
// Local frame = round((master - 855.60) * 30).
//   "That's me, the iRobot version" 856.14 -> f16   tag holds in the corner
//   "Looks scary, huh?"             861.20 -> f168  still holding
//   "Okay, none of that is built"   862.63 -> f211  ★ the tag grows and drops
//                                                   into the bottom band
//   "right now."                    864.32 -> f262  the count lands: 0 of 5 built
//
// ⚠ R13 NOTE — this shot needs NO retime if B14L5Humanoid is extended to
// 860.3648. tools/bake.py seeks an overlay by MASTER offset (`off = a - ov.in`,
// bake.py:120), so every cue above stays pinned to its absolute master time no
// matter how much of the head of this overlay a cutaway covers. Extending the
// humanoid just means bake enters this overlay at frame 198 instead of frame 0;
// F_GROW still fires at master 860.80 and F_COUNT still at 862.50. Leave the
// span at 853.7648 -> 863.3648 and leave the constants alone. Shortening the
// span WOULD break it: the cues would then have to move by -198 frames, and the
// two edits only work if applied together.
//
// OVERLAY, not a cutaway, on purpose. "That's me, the iRobot version, maybe
// without the spiritual. Looks scary, huh?" is a punchline delivered to camera,
// and brand.md §6 says graphics never cover a punchline. So we cut back to his
// real face for it — and the SIMULATED tag rides along in the corner so the
// honesty commitment does not blink between the humanoid clip and the
// disclaimer. It stays in the bottom band; it never covers the centre frame.
// The tag hands off mid-move: B14Simulated picks it up at exactly this size and
// position and walks it back to the corner.
// =============================================================================
export const compositionConfig = {
  id: 'B14TagHold', durationInSeconds: 9.6, fps: 30, width: 1920, height: 1080, transparent: true,
};

const F_GROW = 211;
const F_COUNT = 262;

const B14TagHold: React.FC = () => {
  const frame = useCurrentFrame();

  const top = r(frame, F_GROW, F_GROW + 22, 44, TAG_BIG.top, EASINGS.easeInOut);
  const right = r(frame, F_GROW, F_GROW + 22, 56, TAG_BIG.right, EASINGS.easeInOut);
  const scale = r(frame, F_GROW, F_GROW + 22, 1, TAG_BIG.scale, EASINGS.easeInOut);

  const countOp = r(frame, F_COUNT, F_COUNT + 14);
  const countY = r(frame, F_COUNT, F_COUNT + 14, 14, 0);

  return (
    <AbsoluteFill>
      <SimTag frame={frame} at={-30} top={top} right={right} scale={scale} />

      <div style={{
        position: 'absolute', left: 0, top: 948, width: 1920,
        display: 'flex', justifyContent: 'center',
        opacity: countOp, transform: `translateY(${countY}px)`,
      }}>
        <div style={{
          background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill,
          boxShadow: SHADOW.soft, padding: '11px 30px',
          fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 2, color: COLORS.muted,
        }}>
          0 of 5 built
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default B14TagHold;
