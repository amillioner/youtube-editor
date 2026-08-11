import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { LevelRail, SimTag, r } from './B14Kit';

// =============================================================================
// B14 · LEVEL 4, the sting. Master span 839.596967 -> 844.596967 (5.00s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 839.596967) * 30).
//   "my clone"               842.97 -> f11   line half 1
//   "saying"                 843.86 -> f38   line half 2
//   "things I never said."   844.27 -> f50   the claim lands
//   "never"                  845.14 -> f76   pink wipe on the scary half
//   "That I would have said." 846.41 -> f114 the turn, in indigo, +1.03 pop
// Left-aligned like B15ReadThatAgain: the sentence is built in halves and a
// centred block would slide sideways every time a half arrives.
// Pink = the fear (brand.md §3), indigo = the claim. Same grammar as B15Opposite.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B14L4NeverSaid', durationInSeconds: 5, fps: 30, width: 1920, height: 1080 };

const F_CLONE = 11;
const F_SAYING = 38;
const F_THINGS = 50;
const F_NEVER = 76;
const F_WOULD = 114;

const B14L4NeverSaid: React.FC = () => {
  const frame = useCurrentFrame();

  const l1Op = r(frame, F_CLONE, F_CLONE + 14);
  const l1Y = r(frame, F_CLONE, F_CLONE + 14, 24, 0);
  const l2Op = r(frame, F_SAYING, F_SAYING + 14);
  const l3Op = r(frame, F_THINGS, F_THINGS + 14);
  const l3Y = r(frame, F_THINGS, F_THINGS + 14, 20, 0);
  const neverWipe = r(frame, F_NEVER, F_NEVER + 12);
  const wOp = r(frame, F_WOULD, F_WOULD + 14);
  const wY = r(frame, F_WOULD, F_WOULD + 14, 26, 0);
  const wWipe = r(frame, F_WOULD + 3, F_WOULD + 14);
  const wPop = interpolate(frame, [F_WOULD, F_WOULD + 10, F_WOULD + 26], [1, 1.03, 1], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.danger} />
      <AbsoluteFill style={{ opacity: r(frame, F_WOULD, F_WOULD + 26, 0, 1, EASINGS.easeInOut) }}>
        <BrandBg glow={COLORS.accent} />
      </AbsoluteFill>

      <SimTag frame={frame} at={-30} />

      <div style={{ position: 'absolute', left: 200, top: 316, width: 1560, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.24, color: COLORS.ink }}>
        <div style={{ opacity: l1Op, transform: `translateY(${l1Y}px)` }}>
          My clone<span style={{ opacity: l2Op }}> saying</span>
        </div>
        <div style={{ opacity: l3Op, transform: `translateY(${l3Y}px)` }}>
          things I{' '}
          <span style={{ position: 'relative', display: 'inline-block', color: COLORS.danger }}>
            <span style={{ position: 'absolute', left: -6, right: -6, bottom: 14, height: 9, borderRadius: 5, background: COLORS.danger, transform: `scaleX(${neverWipe})`, transformOrigin: 'left' }} />
            <span style={{ position: 'relative' }}>never said.</span>
          </span>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 200, top: 616, width: 1560,
        opacity: wOp, transform: `translateY(${wY}px) scale(${wPop})`, transformOrigin: 'left center',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.24, color: COLORS.ink,
      }}>
        That I{' '}
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ position: 'absolute', left: -10, right: -10, bottom: 12, height: 30, borderRadius: 8, background: `${COLORS.accent}59`, transform: `scaleX(${wWipe})`, transformOrigin: 'left', zIndex: 0 }} />
          <span style={{ position: 'relative', zIndex: 1 }}>would have said.</span>
        </span>
      </div>

      <LevelRail
        frame={frame}
        at={-30}
        slots={[
          { n: 1, label: 'voice', at: -30 },
          { n: 2, label: 'voice clone', at: -30 },
          { n: 3, label: 'photo', at: -30 },
          { n: 4, label: 'lipsync', at: -30 },
        ]}
      />
    </AbsoluteFill>
  );
};
export default B14L4NeverSaid;
