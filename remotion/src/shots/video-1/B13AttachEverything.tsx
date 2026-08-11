import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Brain, Bot, MessageSquare, Terminal } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B13 (1/2) — the rule, stated. Master span 768.896967 -> 775.796967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local f = round((t-768.896967)*30)).
//   "Attach"        771.97 -> f2    eyebrow THE RULE + headline half 1
//   "brain"         772.60 -> f21   the hub node lands
//   "to simply"     773.32 -> f43   headline half 2
//   "everything."   773.94 -> f61   indigo wipe on "everything"
//   "agent,"        775.15 -> f97   left spoke
//   "session,"      776.06 -> f125  right spoke
//   "tool"          777.42 -> f166  bottom spoke
// He says "to simply everything"; the card drops the filler adverb and keeps
// the claim. Hub-and-spoke here on purpose: the LOOP is the next card, and the
// two must not look like the same diagram.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B13AttachEverything', durationInSeconds: 6.9, fps: 30, width: 1920, height: 1080 };

const F_ATTACH = 2;
const F_HUB = 21;
const F_TO = 43;
const F_EVERYTHING = 61;
const F_AGENT = 97;
const F_SESSION = 125;
const F_TOOL = 166;

const HUB = { x: 780, y: 500, w: 360, h: 160 };
const CHIP_W = 340;
const SPOKE = 220;

const B13AttachEverything: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const wipe = r(F_EVERYTHING, F_EVERYTHING + 12, 0, 1, EASINGS.easeInOut);

  const chip = (at: number, cx: number, cy: number, label: string, Icon: React.FC<any>) => (
    <div style={{
      position: 'absolute', left: cx, top: cy,
      transform: `translate(-50%, -50%) translateY(${r(at, at + 14, 20, 0)}px)`,
      opacity: r(at, at + 14),
      width: CHIP_W, boxSizing: 'border-box',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      background: COLORS.paper, border: `2px solid ${COLORS.accent}59`,
      borderRadius: RADIUS.pill, boxShadow: SHADOW.soft, padding: '22px 0',
    }}>
      <Icon size={34} color={COLORS.accent} strokeWidth={2.1} />
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 38, color: COLORS.ink, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{
        position: 'absolute', left: 0, right: 0, top: 132, textAlign: 'center',
        opacity: r(F_ATTACH, F_ATTACH + 14), transform: `translateY(${r(F_ATTACH, F_ATTACH + 14, 16, 0)}px)`,
        fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 6, color: COLORS.accent,
      }}>
        THE&nbsp;RULE
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, top: 208, textAlign: 'center',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 100, lineHeight: 1.1, color: COLORS.ink,
      }}>
        <span style={{ opacity: r(F_ATTACH, F_ATTACH + 14), display: 'inline-block', transform: `translateY(${r(F_ATTACH, F_ATTACH + 14, 22, 0)}px)` }}>
          Attach your brain
        </span>
        {' '}
        <span style={{ opacity: r(F_TO, F_TO + 14), display: 'inline-block', transform: `translateY(${r(F_TO, F_TO + 14, 22, 0)}px)` }}>
          to{' '}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{
              position: 'absolute', left: -10, right: -10, bottom: 14, height: 30, borderRadius: 8,
              background: `${COLORS.accent}59`, transform: `scaleX(${wipe})`, transformOrigin: 'left', zIndex: 0,
            }} />
            <span style={{ position: 'relative', zIndex: 1 }}>everything</span>
          </span>
        </span>
      </div>

      {/* spokes (drawn from the hub outward) */}
      <div style={{
        position: 'absolute', left: HUB.x - SPOKE, top: HUB.y + HUB.h / 2 - 2, width: SPOKE, height: 5,
        background: COLORS.accent, opacity: 0.55,
        transform: `scaleX(${r(F_AGENT - 8, F_AGENT + 6, 0, 1, EASINGS.easeInOut)})`, transformOrigin: 'right',
      }} />
      <div style={{
        position: 'absolute', left: HUB.x + HUB.w, top: HUB.y + HUB.h / 2 - 2, width: SPOKE, height: 5,
        background: COLORS.accent, opacity: 0.55,
        transform: `scaleX(${r(F_SESSION - 8, F_SESSION + 6, 0, 1, EASINGS.easeInOut)})`, transformOrigin: 'left',
      }} />
      <div style={{
        position: 'absolute', left: 958, top: HUB.y + HUB.h, width: 5, height: SPOKE - 60,
        background: COLORS.accent, opacity: 0.55,
        transform: `scaleY(${r(F_TOOL - 8, F_TOOL + 6, 0, 1, EASINGS.easeInOut)})`, transformOrigin: 'top',
      }} />

      {/* the hub */}
      <div style={{
        position: 'absolute', left: HUB.x, top: HUB.y, width: HUB.w, height: HUB.h,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        background: COLORS.ink, borderRadius: RADIUS.card, boxShadow: SHADOW.card,
        opacity: r(F_HUB, F_HUB + 14),
        transform: `translateY(${r(F_HUB, F_HUB + 14, 22, 0)}px) scale(${interpolate(frame, [F_HUB, F_HUB + 12, F_HUB + 26], [0.94, 1.03, 1], { ...CLAMP, easing: EASINGS.easeInOut })})`,
      }}>
        <Brain size={54} color={COLORS.accent} strokeWidth={2} />
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.paper }}>your brain</span>
      </div>

      {chip(F_AGENT, HUB.x - SPOKE - CHIP_W / 2, HUB.y + HUB.h / 2, 'Every agent', Bot)}
      {chip(F_SESSION, HUB.x + HUB.w + SPOKE + CHIP_W / 2, HUB.y + HUB.h / 2, 'Every session', MessageSquare)}
      {chip(F_TOOL, 960, HUB.y + HUB.h + (SPOKE - 60) + 42, 'Every tool', Terminal)}
    </AbsoluteFill>
  );
};
export default B13AttachEverything;
