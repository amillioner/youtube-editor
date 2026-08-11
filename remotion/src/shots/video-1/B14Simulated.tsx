import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { CARD_TOP_PARKED, CARD_TOP_STAGE, CARD_X, LEVELS, LevelCard, SimTag, TAG_BIG, r } from './B14Kit';

// =============================================================================
// B14 · the disclaimer, made concrete. Master span 862.196967 -> 866.596967 (4.40s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 862.196967) * 30).
//   "Everything I showed you" 865.28 -> f2   all five levels line up
//   "at the end"              866.68 -> f44  they go warn: none of them shipped
//   "was simulated,"          867.39 -> f66  ★ the stamp lands under the row
//   "but the brain"           868.90 -> f111 the row walks UP to make room for
//                                            what is underneath (the next shot
//                                            starts with it exactly there)
// The tag enters at the size and position B14TagHold left it at and returns to
// the corner over f0..f20, so the hard cut reads as one continuous move.
// Level 5 is labelled "iRobot version" because that is what he called it on
// camera at 857.67. It is never called "humanoid" before he says it at 921.70.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B14Simulated', durationInSeconds: 4.4, fps: 30, width: 1920, height: 1080 };

const F_CARDS = 2;
const F_WARN = 44;
const F_STAMP = 66;
const F_UP = 111;

const B14Simulated: React.FC = () => {
  const frame = useCurrentFrame();

  const tagTop = r(frame, 0, 20, TAG_BIG.top, 44, EASINGS.easeInOut);
  const tagRight = r(frame, 0, 20, TAG_BIG.right, 56, EASINGS.easeInOut);
  const tagScale = r(frame, 0, 20, TAG_BIG.scale, 1, EASINGS.easeInOut);

  const sim = r(frame, F_WARN, F_WARN + 16, 0, 1, EASINGS.easeInOut);
  const rowY = r(frame, F_UP, F_UP + 20, CARD_TOP_STAGE, CARD_TOP_PARKED, EASINGS.easeInOut);

  const stampOp = r(frame, F_STAMP, F_STAMP + 12) * (1 - r(frame, F_UP, F_UP + 12, 0, 1, EASINGS.easeIn));
  const stampSc = interpolate(frame, [F_STAMP, F_STAMP + 10, F_STAMP + 24], [0.94, 1.03, 1], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.warn} />

      {LEVELS.map((l, i) => (
        <LevelCard key={l.n} frame={frame} at={F_CARDS + i * 4} n={l.n} label={l.label} x={CARD_X(i)} y={rowY} sim={sim} />
      ))}

      {/* the stamp */}
      <div style={{
        position: 'absolute', left: CARD_X(0), top: 574, width: CARD_X(4) + 320 - CARD_X(0),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 128, borderRadius: RADIUS.card,
        background: `${COLORS.warn}22`, border: `3px solid ${COLORS.warn}`,
        opacity: stampOp, transform: `scale(${stampSc})`,
      }}>
        <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 80, letterSpacing: 14, color: COLORS.ink }}>
          SIMULATED
        </span>
      </div>

      <SimTag frame={frame} at={-30} top={tagTop} right={tagRight} scale={tagScale} />
    </AbsoluteFill>
  );
};
export default B14Simulated;
