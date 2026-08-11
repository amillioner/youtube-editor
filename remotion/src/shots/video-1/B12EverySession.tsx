import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { RotateCcw, Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// =============================================================================
// B12 (3/3) — "so you stop re-explaining everything again and again with every
// new session or project." Master span 759.596967 -> 764.896967 (f = round((t-759.596967)*30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//
// TRANSPARENT OVERLAY, one bottom-band row. This line is the most relatable one
// in B12 and it is HIS line, so he keeps the frame — the repetition just
// accumulates underneath him and then resolves.
//   "re-explaining"  762.95 -> f11   the first ask
//   "again"          764.32 -> f51   the same ask, again
//   "again"          764.73 -> f64   and again
//   "session"        766.43 -> f115  the trailing dots (it never ends)
//   "or project."    767.14 -> f136  the resolve: the repeats dim, one pill lands
// Slots keep their layout position at opacity 0 so nothing reflows on arrival.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = {
  id: 'B12EverySession',
  durationInSeconds: 5.3,
  fps: 30,
  width: 1920,
  height: 1080,
  transparent: true,
};

const REPEATS = [11, 51, 64];
const F_DOTS = 115;
const F_RESOLVE = 136;

const B12EverySession: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const dim = r(F_RESOLVE, F_RESOLVE + 12, 1, 0.3, EASINGS.easeInOut);
  const resolveOp = r(F_RESOLVE, F_RESOLVE + 14);
  const resolveX = r(F_RESOLVE, F_RESOLVE + 14, 22, 0);

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 92, fontFamily: FONT_BODY }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {REPEATS.map((at, i) => (
          <div
            key={i}
            style={{
              opacity: r(at, at + 14) * dim,
              transform: `translateY(${r(at, at + 14, 20, 0)}px)`,
              display: 'flex', alignItems: 'center', gap: 12,
              background: COLORS.paper, border: `1px solid ${COLORS.line}`,
              borderRadius: RADIUS.pill, boxShadow: SHADOW.soft, padding: '14px 26px',
              whiteSpace: 'nowrap',
            }}
          >
            <RotateCcw size={22} color={COLORS.muted} strokeWidth={2.2} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.muted }}>
              &ldquo;here is my project&hellip;&rdquo;
            </span>
          </div>
        ))}

        <span style={{
          opacity: r(F_DOTS, F_DOTS + 12) * dim,
          fontFamily: FONT_MONO, fontSize: 34, letterSpacing: 3, color: COLORS.muted, padding: '0 6px',
        }}>
          &hellip;
        </span>

        <div style={{
          opacity: resolveOp, transform: `translateX(${resolveX}px)`,
          display: 'flex', alignItems: 'center', gap: 14,
          background: COLORS.paper, border: `2px solid ${COLORS.accent}`,
          borderRadius: RADIUS.pill, boxShadow: SHADOW.card, padding: '14px 30px',
          whiteSpace: 'nowrap',
        }}>
          <Check size={24} color={COLORS.accent} strokeWidth={3.2} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: COLORS.ink }}>
            your brain already has it
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default B12EverySession;
