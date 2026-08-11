import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { ArrowUp } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP, Sunburst } from '../../lib/kit';

// =============================================================================
// B10 (4/4) — the callback. Master span 698.996967 -> 702.896967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 698.996967) * 30)).
//   "Remember the reply"      702.05 -> f2    eyebrow
//                             702.54 -> f16   the cold-open reply card returns
//   "That's the call"         704.39 -> f72   the assemble-context call rises
//                                             under it
//                             704.86 -> f86   the connector draws, call -> reply
//   "that made it."           705.42 -> f110  the reply border turns indigo
// The reply text and its three highlights are lifted from B1ReplyCompare so the
// viewer recognises the exact card from the cold open. Paper background, for the
// same reason — B10's other three shots live in the Claude Code dark session.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B10ThatsTheCall', durationInSeconds: 3.9, fps: 30, width: 1920, height: 1080 };

const F_EYEBROW = 2;
const F_CARD = 16;
const F_CALL = 72;
const F_ARROW = 86;
const F_MADE = 110;

const CARD_TOP = 278;
const CARD_L = 400;
const CARD_W = 1120;

const Hl: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span style={{ position: 'relative', display: 'inline-block' }}>
    <span style={{ position: 'absolute', left: -6, right: -6, top: -3, bottom: -3, borderRadius: 6, background: color, zIndex: 0 }} />
    <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
  </span>
);

const B10ThatsTheCall: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const eyeOp = r(F_EYEBROW, F_EYEBROW + 14);
  const eyeY = r(F_EYEBROW, F_EYEBROW + 14, 16, 0);

  const cardOp = r(F_CARD, F_CARD + 14);
  const cardY = r(F_CARD, F_CARD + 16, 24, 0);
  const cardBorder = interpolateColors(frame, [F_MADE, F_MADE + 12], [COLORS.line, COLORS.accent]);

  const callOp = r(F_CALL, F_CALL + 16);
  const callY = r(F_CALL, F_CALL + 16, 22, 0);

  const arrow = r(F_ARROW, F_ARROW + 14);
  const arrowHead = r(F_ARROW + 8, F_ARROW + 18);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{
        position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center',
        opacity: eyeOp, transform: `translateY(${eyeY}px)`,
        fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 4, color: COLORS.muted,
      }}>
        FROM&nbsp;THE&nbsp;BEGINNING&nbsp;OF&nbsp;THE&nbsp;VIDEO
      </div>

      {/* ---- the call that made it ---- */}
      <div style={{
        position: 'absolute', left: 660, top: 742, width: 600,
        background: COLORS.d900, border: `1px solid ${COLORS.d600}`, borderRadius: RADIUS.panel,
        boxShadow: SHADOW.card, padding: '24px 30px',
        opacity: callOp, transform: `translateY(${callY}px)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Sunburst size={22} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 1.4, color: COLORS.d400 }}>BRAINOUTSIDE&nbsp;(MCP)</span>
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 34, color: COLORS.paper }}>assemble-context</div>
      </div>

      {/* ---- the connector: the call points up at the reply it made ---- */}
      <div style={{ position: 'absolute', left: 958, top: 694, width: 4, height: 48, borderRadius: 2, background: COLORS.accent, transform: `scaleY(${arrow})`, transformOrigin: 'bottom' }} />
      <div style={{ position: 'absolute', left: 937, top: 648, opacity: arrowHead }}>
        <ArrowUp size={46} color={COLORS.accent} strokeWidth={2.6} />
      </div>

      {/* ---- the reply from the cold open ---- */}
      <div style={{
        position: 'absolute', left: CARD_L, top: CARD_TOP, width: CARD_W,
        background: COLORS.paper, border: `2px solid ${cardBorder}`,
        borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '26px 32px',
        opacity: cardOp, transform: `translateY(${cardY}px)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.signal})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 23, color: COLORS.paper,
          }}>H</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 27, color: COLORS.ink }}>Hasan</div>
            <div style={{ fontSize: 22, color: COLORS.muted }}>@hasan</div>
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: RADIUS.panel, flexShrink: 0,
            background: `${COLORS.muted}16`, border: `1px solid ${COLORS.muted}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color: COLORS.muted,
          }}>02</div>
        </div>
        <div style={{ fontSize: 22, color: COLORS.muted, marginTop: 10 }}>Replying to @startupnotes</div>
        <div style={{ fontSize: 33, lineHeight: 1.62, color: COLORS.ink, marginTop: 22 }}>
          I moved off managed cloud and kept the receipts. Real numbers:{' '}
          <Hl color={`${COLORS.accent}3d`}>16 seconds of downtime</Hl>,{' '}
          <Hl color={`${COLORS.accent}3d`}>twice a year</Hl>. The bill is{' '}
          <Hl color={`${COLORS.signal}4d`}>$700 a month</Hl>, all in.
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default B10ThatsTheCall;
