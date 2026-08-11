import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Bot, MoveRight } from 'lucide-react';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg } from '../../lib/kit';
import { SimTag, r } from './B14Kit';
import { Lockup, YOU_CARD, YouCard } from './B15CloseKit';

// =============================================================================
// B15 · ★★ the product name pays off. Master span 913.596967 -> 920.196967 (6.60s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 913.596967) * 30).
//   "Put it"                916.66 -> f2    the card lifts out of "your head"
//   "outside"               917.05 -> f14   it lands inside the BrainOutside
//                                           frame and UNLOCKS. The right-hand
//                                           frame is labelled with the product
//                                           lockup (the B2NameLockup callback),
//                                           so the card literally goes inside
//                                           the name.
//   "and maybe"             918.19 -> f48   a dashed, deliberately speculative row
//   "you will have"         920.58 -> f119
//   "your humanoid clone."  921.70 -> f153  it fills in, and the SIMULATED tag
//                                           comes back because he has just
//                                           re-invoked the level-5 humanoid.
// The you.md card is the SAME object B15CloseOnlyYou locked: redacted while it
// is in your head, readable once it is outside. That is the whole video in one
// move.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B15ClosePutItOutside', durationInSeconds: 6.6, fps: 30, width: 1920, height: 1080 };

const F_PUT = 2;
const F_OUT = 14;
const F_MAYBE = 48;
const F_HUMANOID = 153;
const F_TAG = 148;

const HEAD_BOX = { x: 210, y: 150, w: 620, h: 348 };
const OUT_BOX = { x: 1090, y: 150, w: 620, h: 348 };
const CARD_SC = 0.9;
const cardIn = (box: typeof HEAD_BOX) => ({
  x: box.x + (box.w - YOU_CARD.w * CARD_SC) / 2 + (YOU_CARD.w * (CARD_SC - 1)) / 2,
  y: box.y + (box.h - YOU_CARD.h * CARD_SC) / 2 + (YOU_CARD.h * (CARD_SC - 1)) / 2,
});

const B15ClosePutItOutside: React.FC = () => {
  const frame = useCurrentFrame();

  const from = cardIn(HEAD_BOX);
  const to = cardIn(OUT_BOX);
  const cx = r(frame, F_PUT, F_PUT + 22, from.x, to.x, EASINGS.easeInOut);
  const cy = r(frame, F_PUT, F_PUT + 22, from.y, to.y, EASINGS.easeInOut);

  const arrowOp = r(frame, F_PUT, F_PUT + 12);
  const arrowX = r(frame, F_PUT, F_PUT + 26, -30, 30, EASINGS.easeInOut);
  const headFade = r(frame, F_PUT + 8, F_PUT + 24, 1, 0.4, EASINGS.easeInOut);
  const outFrame = r(frame, F_OUT - 6, F_OUT + 8);

  const putOp = r(frame, F_PUT, F_PUT + 14);
  const putY = r(frame, F_PUT, F_PUT + 14, 26, 0);
  const outOp = r(frame, F_OUT, F_OUT + 12);
  const outWipe = r(frame, F_OUT + 2, F_OUT + 14);

  const maybeOp = r(frame, F_MAYBE, F_MAYBE + 14);
  const maybeY = r(frame, F_MAYBE, F_MAYBE + 14, 22, 0);
  const humOp = r(frame, F_HUMANOID, F_HUMANOID + 14);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* your head (dashed, and it empties out) */}
      <div style={{
        position: 'absolute', left: HEAD_BOX.x, top: HEAD_BOX.y, width: HEAD_BOX.w, height: HEAD_BOX.h,
        borderRadius: 26, border: `2px dashed ${COLORS.muted}66`, opacity: headFade,
      }} />
      <div style={{
        position: 'absolute', left: HEAD_BOX.x + 34, top: HEAD_BOX.y - 20, height: 40,
        display: 'flex', alignItems: 'center', padding: '0 18px',
        background: COLORS.paper, border: `1px solid ${COLORS.muted}44`, borderRadius: RADIUS.pill,
        fontFamily: FONT_MONO, fontSize: 24, color: COLORS.muted, opacity: headFade,
      }}>
        your head
      </div>

      {/* outside: inside the name */}
      <div style={{
        position: 'absolute', left: OUT_BOX.x, top: OUT_BOX.y, width: OUT_BOX.w, height: OUT_BOX.h,
        borderRadius: 26, border: `2px solid ${COLORS.accent}`, opacity: outFrame,
      }} />
      <div style={{
        position: 'absolute', left: OUT_BOX.x + 34, top: OUT_BOX.y - 26,
        background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill,
        padding: '2px 22px 8px', opacity: outFrame,
      }}>
        <Lockup frame={frame} at={F_OUT} size={44} boxed={false} />
      </div>

      {/* the move */}
      <div style={{ position: 'absolute', left: 880, top: 296, opacity: arrowOp, transform: `translateX(${arrowX}px)` }}>
        <MoveRight size={72} color={COLORS.accent} strokeWidth={2.4} />
      </div>

      <YouCard frame={frame} at={-30} openAt={F_OUT} x={cx} y={cy} scale={CARD_SC} />

      {/* "Put it outside." */}
      <div style={{ position: 'absolute', left: 0, top: 566, width: 1920, textAlign: 'center' }}>
        <span style={{ display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 132, letterSpacing: -2, color: COLORS.ink, opacity: putOp, transform: `translateY(${putY}px)` }}>
          Put it&nbsp;
        </span>
        <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 132, letterSpacing: -2, color: COLORS.accent, opacity: outOp }}>
          <span style={{ position: 'absolute', left: 0, right: 0, bottom: 8, height: 12, borderRadius: 6, background: COLORS.accent, transform: `scaleX(${outWipe})`, transformOrigin: 'left' }} />
          <span style={{ position: 'relative' }}>outside.</span>
        </span>
      </div>

      {/* "and maybe in the near future ... your humanoid clone." */}
      <div style={{
        position: 'absolute', left: 0, top: 812, width: 1920, display: 'flex', justifyContent: 'center',
        opacity: maybeOp, transform: `translateY(${maybeY}px)`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 22, minWidth: 760, justifyContent: 'center',
          border: `2px dashed ${COLORS.muted}66`, borderRadius: RADIUS.card, padding: '20px 46px',
        }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 3, color: COLORS.muted }}>ONE&nbsp;DAY</span>
          <div style={{ width: 2, height: 44, background: `${COLORS.muted}44` }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: humOp }}>
            <Bot size={46} color={COLORS.accent2} strokeWidth={2} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 46, color: COLORS.ink }}>your humanoid clone</span>
          </div>
        </div>
      </div>

      <SimTag frame={frame} at={F_TAG} />
    </AbsoluteFill>
  );
};
export default B15ClosePutItOutside;
