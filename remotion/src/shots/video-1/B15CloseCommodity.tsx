import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Sparkles, MoreHorizontal } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, Sunburst } from '../../lib/kit';
import { r } from './B14Kit';

// =============================================================================
// B15 · why it is not about the models. Master span 896.796967 -> 904.696967 (7.90s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 896.796967) * 30).
//   "Because the AI models" 900.30 -> f15   headline half 1
//   "are the same."         901.07 -> f38   headline half 2 + wipe (f41)
//   "Everyone has access"   902.03 -> f67   the row opens
//   "to Claude"             903.00 -> f96   chip 1
//   "or Gemini"             903.82 -> f121  chip 2
//   "or whatever."          904.38 -> f137  chip 3, deliberately a dashed "any"
//   "The tools are free,"   905.25 -> f164  stat 1 (wipe on "free," f180)
//   "the models are cheap." 906.56 -> f200  stat 2 (wipe on "cheap." f219)
// The Claude and Gemini marks use their real product colours, not the indigo
// brand: house practice for third-party UI (see lib/browser.tsx, B5TemplateRepo).
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B15CloseCommodity', durationInSeconds: 7.9, fps: 30, width: 1920, height: 1080 };

const F_H1 = 15;
const F_H2 = 38;
const F_ROW = 67;
const F_CLAUDE = 96;
const F_GEMINI = 121;
const F_WHATEVER = 137;
const F_TOOLS = 164;
const F_TOOLS_W = 180;
const F_MODELS = 200;
const F_MODELS_W = 219;

const GEMINI_BLUE = '#4285F4'; // real product colour
const CLAUDE_CORAL = '#cd8064'; // real product colour

const B15CloseCommodity: React.FC = () => {
  const frame = useCurrentFrame();

  const h1Op = r(frame, F_H1, F_H1 + 14);
  const h1Y = r(frame, F_H1, F_H1 + 14, 26, 0);
  const h2Op = r(frame, F_H2, F_H2 + 14);
  const h2Wipe = r(frame, F_H2 + 3, F_H2 + 15);
  const rowOp = r(frame, F_ROW, F_ROW + 14);

  const stat = (at: number, wipeAt: number) => ({
    op: r(frame, at, at + 14),
    y: r(frame, at, at + 14, 20, 0),
    wipe: r(frame, wipeAt, wipeAt + 12),
  });
  const s1 = stat(F_TOOLS, F_TOOLS_W);
  const s2 = stat(F_MODELS, F_MODELS_W);

  const chip = (at: number) => ({
    op: r(frame, at, at + 14),
    y: r(frame, at, at + 14, 22, 0),
    sc: r(frame, at, at + 18, 0.94, 1, EASINGS.easeOut),
  });
  const c1 = chip(F_CLAUDE);
  const c2 = chip(F_GEMINI);
  const c3 = chip(F_WHATEVER);

  const CHIP: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 18,
    background: COLORS.paper, borderRadius: RADIUS.card, boxShadow: SHADOW.card,
    padding: '24px 42px',
  };

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{ position: 'absolute', left: 0, top: 186, width: 1920, textAlign: 'center' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: COLORS.ink, opacity: h1Op, display: 'inline-block', transform: `translateY(${h1Y}px)` }}>
          The&nbsp;models&nbsp;are&nbsp;
        </span>
        <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: COLORS.accent, opacity: h2Op }}>
          <span style={{ position: 'absolute', left: -8, right: -8, bottom: 2, height: 10, borderRadius: 5, background: COLORS.accent, transform: `scaleX(${h2Wipe})`, transformOrigin: 'left' }} />
          <span style={{ position: 'relative' }}>the same.</span>
        </span>
      </div>

      <div style={{ position: 'absolute', left: 0, top: 360, width: 1920, textAlign: 'center', opacity: rowOp, fontFamily: FONT_BODY, fontSize: 40, color: COLORS.muted }}>
        everyone has access
      </div>

      <div style={{ position: 'absolute', left: 0, top: 452, width: 1920, display: 'flex', justifyContent: 'center', gap: 34 }}>
        <div style={{ ...CHIP, border: `2px solid ${CLAUDE_CORAL}`, opacity: c1.op, transform: `translateY(${c1.y}px) scale(${c1.sc})` }}>
          <Sunburst size={52} color={CLAUDE_CORAL} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: COLORS.ink }}>Claude</span>
        </div>
        <div style={{ ...CHIP, border: `2px solid ${GEMINI_BLUE}`, opacity: c2.op, transform: `translateY(${c2.y}px) scale(${c2.sc})` }}>
          <Sparkles size={50} color={GEMINI_BLUE} strokeWidth={2.1} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: COLORS.ink }}>Gemini</span>
        </div>
        <div style={{ ...CHIP, background: 'transparent', boxShadow: 'none', border: `2px dashed ${COLORS.muted}77`, opacity: c3.op, transform: `translateY(${c3.y}px) scale(${c3.sc})` }}>
          <MoreHorizontal size={50} color={COLORS.muted} strokeWidth={2.1} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: COLORS.muted }}>whatever</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 0, top: 740, width: 1920, display: 'flex', justifyContent: 'center', gap: 40 }}>
        {[
          { k: 'the tools', v: 'free', s: s1, color: COLORS.signal },
          { k: 'the models', v: 'cheap', s: s2, color: COLORS.signal },
        ].map((it) => (
          <div key={it.k} style={{
            display: 'flex', alignItems: 'baseline', gap: 20,
            background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card,
            boxShadow: SHADOW.soft, padding: '26px 46px',
            opacity: it.s.op, transform: `translateY(${it.s.y}px)`,
          }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 32, color: COLORS.muted }}>{it.k}</span>
            <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 62, color: it.color }}>
              <span style={{ position: 'absolute', left: -6, right: -6, bottom: 2, height: 8, borderRadius: 4, background: it.color, transform: `scaleX(${it.s.wipe})`, transformOrigin: 'left' }} />
              <span style={{ position: 'relative' }}>{it.v}</span>
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
export default B15CloseCommodity;
