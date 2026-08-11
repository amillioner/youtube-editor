import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { EyeOff } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { r } from './B14Kit';
import { YOU_CARD, YouCard } from './B15CloseKit';

// =============================================================================
// B15 · ★ the thesis. Master span 904.696967 -> 913.596967 (8.90s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 904.696967) * 30).
//   "The only"                  907.83 -> f4    the statement builds
//   "unique"                    908.70 -> f30   indigo highlight on the word
//   "left"                      909.90 -> f66
//   "is you,"                   911.03 -> f100  the payoff half, with the wipe
//   "and right now that's"      911.76 -> f122  the statement shrinks to a header
//   "sitting in your head"      914.00 -> f189  the you.md card appears, LOCKED
//   "where nothing can read it" 915.06 -> f221  every line redacted, no reader
// The card is deliberately the same object B15ClosePutItOutside then unlocks and
// moves: the two shots are one sentence, so the geometry lives in B15CloseKit.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B15CloseOnlyYou', durationInSeconds: 8.9, fps: 30, width: 1920, height: 1080 };

const F_ONLY = 4;
const F_UNIQUE = 30;
const F_LEFT = 66;
const F_YOU = 100;
const F_SHRINK = 148; // "that's sitting" 912.95 -> f158: hold the payoff line at
// full size through "and right now" and start clearing just before the clause
// that needs the stage.
const F_CARD = 189;
const F_NOREAD = 221;

export const YOU_CARD_POS = { x: (1920 - YOU_CARD.w) / 2, y: 588 } as const;

const B15CloseOnlyYou: React.FC = () => {
  const frame = useCurrentFrame();

  const l1Op = r(frame, F_ONLY, F_ONLY + 14);
  const l1Y = r(frame, F_ONLY, F_ONLY + 14, 26, 0);
  const uniqueWipe = r(frame, F_UNIQUE, F_UNIQUE + 12);
  const leftOp = r(frame, F_LEFT, F_LEFT + 14);
  const youOp = r(frame, F_YOU, F_YOU + 14);
  const youWipe = r(frame, F_YOU + 3, F_YOU + 15);
  const youPop = interpolate(frame, [F_YOU, F_YOU + 10, F_YOU + 26], [1, 1.03, 1], { ...CLAMP, easing: EASINGS.easeInOut });

  // the statement retreats to the top so the card can own the frame
  const top = r(frame, F_SHRINK, F_SHRINK + 20, 372, 132, EASINGS.easeInOut);
  const scale = r(frame, F_SHRINK, F_SHRINK + 20, 1, 0.56, EASINGS.easeInOut);
  const fade = r(frame, F_SHRINK, F_SHRINK + 20, 1, 0.62, EASINGS.easeInOut);

  const subOp = r(frame, F_CARD - 16, F_CARD - 2);
  const noReadOp = r(frame, F_NOREAD, F_NOREAD + 14);
  const noReadSc = r(frame, F_NOREAD, F_NOREAD + 16, 0.94, 1);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{
        position: 'absolute', left: 0, top, width: 1920, textAlign: 'center',
        transform: `scale(${scale})`, transformOrigin: 'center top', opacity: fade,
      }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.18, color: COLORS.ink, opacity: l1Op, transform: `translateY(${l1Y}px)` }}>
          The only{' '}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{ position: 'absolute', left: -10, right: -10, bottom: 8, height: 34, borderRadius: 8, background: `${COLORS.accent}45`, transform: `scaleX(${uniqueWipe})`, transformOrigin: 'left', zIndex: 0 }} />
            <span style={{ position: 'relative', zIndex: 1 }}>unique</span>
          </span>
          <span style={{ opacity: leftOp }}> thing left</span>
        </div>
        <div style={{ marginTop: 6, opacity: youOp, transform: `scale(${youPop})` }}>
          <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 156, lineHeight: 1.1, color: COLORS.accent }}>
            <span style={{ position: 'absolute', left: -8, right: -8, bottom: 8, height: 12, borderRadius: 6, background: COLORS.accent, transform: `scaleX(${youWipe})`, transformOrigin: 'left' }} />
            <span style={{ position: 'relative' }}>is you.</span>
          </span>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, top: 512, width: 1920, textAlign: 'center',
        opacity: subOp, fontFamily: FONT_MONO, fontSize: 30, letterSpacing: 3, color: COLORS.muted,
      }}>
        RIGHT&nbsp;NOW&nbsp;IT&nbsp;IS&nbsp;IN&nbsp;YOUR&nbsp;HEAD
      </div>

      <YouCard frame={frame} at={F_CARD} x={YOU_CARD_POS.x} y={YOU_CARD_POS.y} />

      <div style={{
        position: 'absolute', left: 0, top: 934, width: 1920, display: 'flex', justifyContent: 'center',
        opacity: noReadOp, transform: `scale(${noReadSc})`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: `${COLORS.danger}18`, border: `2px solid ${COLORS.danger}`,
          borderRadius: RADIUS.pill, boxShadow: SHADOW.soft, padding: '12px 30px',
        }}>
          <EyeOff size={28} color={COLORS.danger} strokeWidth={2.3} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 27, letterSpacing: 2, color: COLORS.ink }}>nothing can read it</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default B15CloseOnlyYou;
