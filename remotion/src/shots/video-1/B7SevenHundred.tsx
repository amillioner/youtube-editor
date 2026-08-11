import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Server } from 'lucide-react';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// B7 (4/16) — the only number he actually quotes on camera. Master span
// 434.196967 -> 443.3648 (local frame = round((t - 434.196967) * 30)).
//   "exactly, by the way,"   437.31 -> f3    eyebrow
//   "how I save"             438.42 -> f37   "I save"
//   "$700"                   438.98 -> f53   THE number (+ indigo wipe)
//   "per month"              440.57 -> f101  the period attaches
//   "hosting"                441.21 -> f120  the "hosting" label
//   "projects"               442.27 -> f152  chip
//   "services"               442.75 -> f167  chip
//   "on my own server."      444.35 -> f214  the teal payoff line
// $700/month is spoken at 438.98 so it is fair on screen. NOTHING else numeric
// goes up in this beat — he never quotes an install duration.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7SevenHundred', durationInSeconds: 8.0, fps: 30, width: 1920, height: 1080 };

const F_EYEBROW = 3;
const F_SAVE = 37;
const F_NUM = 53;
const F_MONTH = 101;
const F_HOSTING = 120;
const F_PROJECTS = 152;
const F_SERVICES = 167;
const F_SERVER = 214;

const B7SevenHundred: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });
  const rise = (at: number, dist = 22) => ({
    opacity: r(at, at + 14),
    transform: `translateY(${r(at, at + 14, dist, 0)}px)`,
  });

  const numOp = r(F_NUM, F_NUM + 14);
  const numScale = r(F_NUM, F_NUM + 18, 0.94, 1);
  const wipe = r(F_NUM + 2, F_NUM + 14, 0, 1, EASINGS.easeInOut);

  const chip = (at: number, color: string): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', height: 62, padding: '0 26px',
    borderRadius: RADIUS.pill, background: `${color}18`, border: `1px solid ${color}66`,
    fontFamily: FONT_MONO, fontSize: 32, color: COLORS.ink,
    opacity: r(at, at + 13), transform: `translateY(${r(at, at + 13, 16, 0)}px)`,
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{ position: 'absolute', left: 0, right: 0, top: 190, textAlign: 'center', ...rise(F_EYEBROW, 16), fontFamily: FONT_MONO, fontSize: 27, letterSpacing: 5, color: COLORS.muted }}>
        WHY&nbsp;I&nbsp;SELF&nbsp;HOST
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 252, textAlign: 'center', ...rise(F_SAVE, 18), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 46, color: COLORS.muted }}>
        I save
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 316, textAlign: 'center', opacity: numOp, transform: `scale(${numScale})` }}>
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ position: 'absolute', left: -18, right: -18, bottom: 34, height: 34, borderRadius: 10, background: `${COLORS.accent}45`, transform: `scaleX(${wipe})`, transformOrigin: 'left' }} />
          <span style={{ position: 'relative', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 228, lineHeight: 1, color: COLORS.ink }}>$700+</span>
        </span>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 566, textAlign: 'center', ...rise(F_MONTH, 16), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 52, color: COLORS.accent }}>
        per month
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 672, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <span style={{ ...rise(F_HOSTING, 14), fontSize: 36, color: COLORS.muted }}>hosting</span>
        <span style={chip(F_PROJECTS, COLORS.accent)}>all my projects</span>
        <span style={chip(F_SERVICES, COLORS.accent2)}>and services</span>
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 796, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, ...rise(F_SERVER, 20) }}>
        <Server size={40} color={COLORS.signal} strokeWidth={2} />
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 54, color: COLORS.signal }}>on my own server</span>
      </div>
    </AbsoluteFill>
  );
};
export default B7SevenHundred;
