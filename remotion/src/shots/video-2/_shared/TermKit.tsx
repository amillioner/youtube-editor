// video-2 shared kit — terminal replay pieces for the lab beats (no compositionConfig).
// Every line rendered through these components is pasted from the run's evidence
// files (plan.md §5 honesty rule) — compression is allowed, invention is not.
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../../fonts';
import { CLAMP } from '../../../lib/kit';

export type TermLine = readonly [at: number, text: string, color?: 'dim' | 'text' | 'ok' | 'err' | 'accent'];

const LINE_COLORS = {
  dim: COLORS.d400,
  text: COLORS.d300,
  ok: '#7ee2b8',
  err: COLORS.danger,
  accent: '#cd8064',
} as const;

export const TermWindow: React.FC<{
  title: string;
  x?: number; y?: number; w?: number; h?: number;
  appearAt?: number;
  children?: React.ReactNode;
}> = ({ title, x = 120, y = 150, w = 1680, h = 820, appearAt = 0, children }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [appearAt, appearAt + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const dy = interpolate(frame, [appearAt, appearAt + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, opacity: op, transform: `translateY(${dy}px)`, background: COLORS.d900, border: `1px solid ${COLORS.d600}`, borderRadius: RADIUS.window, boxShadow: SHADOW.card, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 18px', background: COLORS.d800, borderBottom: `1px solid ${COLORS.d600}` }}>
        <div style={{ width: 13, height: 13, borderRadius: 999, background: '#ff5f57' }} />
        <div style={{ width: 13, height: 13, borderRadius: 999, background: '#febc2e' }} />
        <div style={{ width: 13, height: 13, borderRadius: 999, background: '#28c840' }} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 19, color: COLORS.d400, marginLeft: 12 }}>{title}</span>
      </div>
      <div style={{ position: 'relative', width: '100%', height: h - 50 }}>{children}</div>
    </div>
  );
};

/** Lines appear at their own frame; view auto-scrolls to keep the tail visible. */
export const TermLines: React.FC<{
  lines: readonly TermLine[];
  x?: number; y?: number; w?: number;
  rows?: number; size?: number; lineH?: number;
  cursorUntil?: number; // show a blinking cursor at the tail until this frame (stall effect)
}> = ({ lines, x = 26, y = 18, w = 1620, rows = 19, size = 22, lineH = 38, cursorUntil }) => {
  const frame = useCurrentFrame();
  const shown = lines.filter((l) => frame >= l[0]);
  const view = shown.slice(-rows);
  const cursorOn = cursorUntil !== undefined && frame < cursorUntil && Math.floor(frame / 14) % 2 === 0;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, fontFamily: FONT_MONO, fontSize: size, lineHeight: `${lineH}px`, whiteSpace: 'pre' }}>
      {view.map((l, i) => (
        <div key={`${l[0]}-${i}`} style={{ color: LINE_COLORS[l[2] ?? 'text'], opacity: interpolate(frame, [l[0], l[0] + 6], [0, 1], CLAMP) }}>{l[1]}</div>
      ))}
      {cursorOn && <span style={{ color: LINE_COLORS.accent }}>▌</span>}
    </div>
  );
};

export const SpedTag: React.FC<{ from: number; to?: number; x?: number; y?: number }> = ({ from, to, x = 1560, y = 880 }) => {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [from, from + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const outOp = to === undefined ? 1 : interpolate(frame, [to, to + 10], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });
  const pulse = 0.85 + 0.15 * Math.abs(((frame % 40) / 20) - 1);
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: inOp * outOp * pulse, fontFamily: FONT_MONO, fontSize: 21, letterSpacing: 2, color: COLORS.warn, background: 'rgba(26,26,46,0.75)', border: `1px solid ${COLORS.warn}`, padding: '7px 16px', borderRadius: RADIUS.pill }}>
      ▶▶ sped up
    </div>
  );
};

// ROUND-5: in-flow stat pills. Hand-placed StatChip x/y kept drifting out of
// alignment (round-4 QA); a flex ChipRow + FlowChip makes spacing structural —
// every pill occupies its slot from f0 and fades/rises in on its cue.
export const ChipRow: React.FC<{ x?: number; y?: number; gap?: number; children: React.ReactNode }> = ({ x = 60, y = 12, gap = 14, children }) => (
  <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap }}>{children}</div>
);

export const FlowChip: React.FC<{ at: number; color?: string; size?: number; children: React.ReactNode }> = ({ at, color = COLORS.signal, size = 26, children }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const dy = interpolate(frame, [at, at + 12], [14, 0], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <div style={{ opacity: op, transform: `translateY(${dy}px)`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size, color: COLORS.ink, background: COLORS.paper, border: `2px solid ${color}`, padding: '9px 20px', borderRadius: RADIUS.pill, boxShadow: SHADOW.card, whiteSpace: 'nowrap' }}>
      {children}
    </div>
  );
};

export const StatChip: React.FC<{ at: number; x: number; y: number; color?: string; children: React.ReactNode }> = ({ at, x, y, color = COLORS.signal, children }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const dy = interpolate(frame, [at, at + 12], [14, 0], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity: op, transform: `translateY(${dy}px)`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: COLORS.ink, background: COLORS.paper, border: `2px solid ${color}`, padding: '10px 22px', borderRadius: RADIUS.pill, boxShadow: SHADOW.card }}>
      {children}
    </div>
  );
};
