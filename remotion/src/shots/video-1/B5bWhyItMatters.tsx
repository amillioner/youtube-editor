import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { TriangleAlert, Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B5b (5/6) — why selective reading is the point. One object, three states: the
// context window fills with every note, spills past its limit, and only then
// snaps back to the three notes mind-reader actually sent. The blocks are the
// same little note cards as B5bReadingPull's grid, so it reads as the same 36
// notes being handled two different ways.
//
// Master span 367.696967-377.196967 (local frame = round((t - 367.696967) * 30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//   "important"        371.51 -> f24   eyebrow + the empty window
//   "context"          372.61 -> f57   the limit label starts + notes start
//   "limit"            373.34 -> f79   ...completes, at the tick
//   "context"          374.31 -> f108  the window label starts
//   "window"           374.86 -> f125  ...completes, the window is now full
//   "hallucinations,"  375.82 -> f154  the pink chip on the spill
//   "accurate"         378.31 -> f228  it collapses back to what was relevant
//   "results."         379.35 -> f260  the teal stamp
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B5bWhyItMatters', durationInSeconds: 9.5, fps: 30, width: 1920, height: 1080 };

const F_EYEBROW = 24;
const F_CTX_A = 57;
const F_LIMIT = 79;
const F_CTX_B = 108;
const F_WINDOW = 125;
const F_HALLU = 154;
const F_FIX = 228;
const F_RESULT = 260;

const BAR = { x: 300, y: 450, w: 1320, h: 140 };
const BLOCK = { w: 30, h: 92, pitch: 36 };
const INNER_X = BAR.x + 8;
const BLOCK_Y = BAR.y + (BAR.h - BLOCK.h) / 2;
const CAPACITY = 36; // the same 36 notes B5bReadingPull laid out

const B5bWhyItMatters: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const count = Math.round(interpolate(frame, [F_CTX_A, F_WINDOW, 160, F_FIX, F_FIX + 24], [0, CAPACITY, 41, 41, 3], CLAMP));
  const keptColor = interpolateColors(frame, [F_FIX, F_FIX + 24], [COLORS.warn, COLORS.signal]);
  const spillOp = 1 - r(F_FIX, F_FIX + 16);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{
        position: 'absolute', left: 0, top: 230, width: 1920, textAlign: 'center',
        fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 6, color: COLORS.muted,
        opacity: r(F_EYEBROW, F_EYEBROW + 14), transform: `translateY(${r(F_EYEBROW, F_EYEBROW + 14, 16, 0)}px)`,
      }}>
        WHY&nbsp;THIS&nbsp;MATTERS
      </div>

      {/* the window itself */}
      <div style={{
        position: 'absolute', left: BAR.x, top: BAR.y, width: BAR.w, height: BAR.h, boxSizing: 'border-box',
        background: COLORS.cream, border: `2px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.soft,
        opacity: r(4, 18), transform: `translateY(${r(4, 20, 18, 0)}px)`,
      }} />

      {/* its name, assembled on the two words */}
      <div style={{ position: 'absolute', left: BAR.x, top: 356, width: BAR.w, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, color: COLORS.ink }}>
        <span style={{ opacity: r(F_CTX_B, F_CTX_B + 12) }}>context </span>
        <span style={{ opacity: r(F_WINDOW, F_WINDOW + 12) }}>window</span>
      </div>

      {/* the notes going in */}
      {Array.from({ length: 41 }).map((_, i) => {
        if (i >= count) return null;
        const over = i >= CAPACITY;
        return (
          <div key={i} style={{
            position: 'absolute', left: INNER_X + i * BLOCK.pitch, top: BLOCK_Y,
            width: BLOCK.w, height: BLOCK.h, borderRadius: 6,
            background: over ? COLORS.danger : keptColor,
            opacity: over ? spillOp : 1,
          }} />
        );
      })}

      {/* where the window ends */}
      <div style={{
        position: 'absolute', left: BAR.x + BAR.w, top: 420, width: 4, height: 240,
        background: COLORS.warn, opacity: r(F_CTX_A, F_CTX_A + 12),
      }} />
      <div style={{ position: 'absolute', left: BAR.x + BAR.w - 480, top: 668, width: 472, textAlign: 'right', fontFamily: FONT_MONO, fontSize: 32, fontWeight: 500, color: COLORS.warn }}>
        <span style={{ opacity: r(F_CTX_A, F_CTX_A + 12) }}>context </span>
        <span style={{ opacity: r(F_LIMIT, F_LIMIT + 12) }}>limit</span>
      </div>

      {/* what spilling over costs you */}
      <div style={{
        position: 'absolute', left: 1552, top: 348, width: 268, boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, height: 58,
        background: `${COLORS.danger}1a`, border: `1px solid ${COLORS.danger}59`, borderRadius: RADIUS.pill,
        opacity: r(F_HALLU, F_HALLU + 14) * spillOp,
        transform: `translateY(${r(F_HALLU, F_HALLU + 14, 12, 0)}px)`,
      }}>
        <TriangleAlert size={22} color={COLORS.danger} strokeWidth={2.2} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.danger }}>hallucinations</span>
      </div>

      {/* the payoff */}
      <div style={{
        position: 'absolute', left: 0, top: 770, width: 1920, display: 'flex', justifyContent: 'center',
        opacity: r(F_RESULT, F_RESULT + 14), transform: `translateY(${r(F_RESULT, F_RESULT + 14, 16, 0)}px)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 82, padding: '0 34px', background: COLORS.paper, border: `2px solid ${COLORS.signal}`, borderRadius: RADIUS.pill, boxShadow: SHADOW.card }}>
          <Check size={30} color={COLORS.signal} strokeWidth={3} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: COLORS.ink }}>accurate results</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default B5bWhyItMatters;
