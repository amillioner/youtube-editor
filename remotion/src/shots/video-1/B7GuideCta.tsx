import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { BookOpen, ArrowDown } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// =============================================================================
// B7 (16/16) — the free guide CTA. Master span 557.496967 -> 567.196967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 557.496967) * 30)).
//   "a full guide"        560.73 -> f7    the band rises with "Full guide"
//   "step by step"        563.13 -> f79   the sub-line
//   "online"              566.25 -> f173  chip
//   "and locally,"        567.05 -> f197  chip
//   "it's free"           568.19 -> f231  the teal FREE badge
//   "linked below."       569.31 -> f264  "link in the description" + arrow
// OVERLAY, not a cutaway: this stretch is him talking to camera about the guide,
// and brand.md §7 reserves overlays for exactly this (a small bottom-band CTA).
// The centre frame stays clear — the band sits at y 880, well below his face.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = {
  id: 'B7GuideCta', durationInSeconds: 9.7, fps: 30, width: 1920, height: 1080, transparent: true,
};

const F_CARD = 7;
const F_TITLE = 24;
const F_SUB = 79;
const F_ONLINE = 173;
const F_LOCAL = 197;
const F_FREE = 231;
const F_LINK = 264;
const F_OUT = 278;

const CARD = { x: 370, y: 880, w: 1180, h: 140 };

const B7GuideCta: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const cardOp = r(F_CARD, F_CARD + 14) * (1 - r(F_OUT, F_OUT + 12, 0, 1, EASINGS.easeIn));
  const cardY = r(F_CARD, F_CARD + 14, 26, 0) + r(F_OUT, F_OUT + 13, 0, 22, EASINGS.easeIn);

  const chip = (at: number, color: string): React.CSSProperties => ({
    position: 'absolute', top: 48, display: 'inline-flex', alignItems: 'center',
    height: 46, padding: '0 20px', borderRadius: RADIUS.pill,
    background: `${color}18`, border: `1px solid ${color}`, color: COLORS.ink,
    fontFamily: FONT_MONO, fontSize: 22, whiteSpace: 'nowrap',
    opacity: r(at, at + 13), transform: `translateY(${r(at, at + 13, 12, 0)}px)`,
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <div style={{
        position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h,
        background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card,
        boxShadow: SHADOW.card, opacity: cardOp, transform: `translateY(${cardY}px)`,
      }}>
        <div style={{ position: 'absolute', left: 32, top: 50, opacity: r(F_TITLE, F_TITLE + 12) }}>
          <BookOpen size={40} color={COLORS.accent} strokeWidth={2} />
        </div>
        <div style={{
          position: 'absolute', left: 92, top: 26, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink,
          opacity: r(F_TITLE, F_TITLE + 13), transform: `translateY(${r(F_TITLE, F_TITLE + 13, 12, 0)}px)`,
        }}>Full guide</div>
        <div style={{
          position: 'absolute', left: 92, top: 80, fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted,
          opacity: r(F_SUB, F_SUB + 13), transform: `translateY(${r(F_SUB, F_SUB + 13, 10, 0)}px)`,
        }}>step by step</div>

        <div style={{ ...chip(F_ONLINE, COLORS.accent), left: 400 }}>online</div>
        <div style={{ ...chip(F_LOCAL, COLORS.accent2), left: 544 }}>locally</div>

        <div style={{
          position: 'absolute', left: 706, top: 44, display: 'inline-flex', alignItems: 'center',
          height: 54, padding: '0 24px', borderRadius: RADIUS.pill,
          background: COLORS.signal, color: COLORS.paper,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 26, letterSpacing: 2,
          opacity: r(F_FREE, F_FREE + 13), transform: `scale(${r(F_FREE, F_FREE + 16, 0.9, 1, EASINGS.overshoot)})`,
        }}>FREE</div>

        <div style={{
          position: 'absolute', left: 872, top: 52, display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 26, color: COLORS.muted,
          opacity: r(F_LINK, F_LINK + 13), transform: `translateY(${r(F_LINK, F_LINK + 13, 12, 0)}px)`,
        }}>
          link in the description
          <ArrowDown size={24} color={COLORS.accent} strokeWidth={2.6} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default B7GuideCta;
