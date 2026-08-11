import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Check, X } from 'lucide-react';
import { COLORS, EASINGS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B11 (2/2) — the quotable line. Master span 723.296967 -> 730.396967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 723.296967) * 30)).
//   "Think about like"        726.60 -> f9    eyebrow
//   "a drafter,"              727.18 -> f26   the claim + indigo wipe
//   "not a ghostwriter."      728.46 -> f65   the negation + pink strike
//   "it starts from me"       730.64 -> f130  bottom line 1
//   "instead from nothing."   732.07 -> f173  bottom line 2
// Full-screen statement card (brand.md §7). Indigo carries the claim, pink the
// thing it is not — the same role split B1.5 uses.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B11DrafterNotGhostwriter', durationInSeconds: 7.1, fps: 30, width: 1920, height: 1080 };

const F_EYEBROW = 9;
const F_DRAFTER = 26;
const F_GHOST = 65;
const F_STARTS = 130;
const F_NOTHING = 173;

const GROUP_L = 560;

const B11DrafterNotGhostwriter: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const eyeOp = r(F_EYEBROW, F_EYEBROW + 14);
  const eyeY = r(F_EYEBROW, F_EYEBROW + 14, 16, 0);

  const d1Op = r(F_DRAFTER, F_DRAFTER + 14);
  const d1Y = r(F_DRAFTER, F_DRAFTER + 14, 24, 0);
  const d1Wipe = r(F_DRAFTER + 4, F_DRAFTER + 14);

  const d2Op = r(F_GHOST, F_GHOST + 14);
  const d2Y = r(F_GHOST, F_GHOST + 14, 24, 0);
  const strike = r(F_GHOST + 5, F_GHOST + 17);

  const l1Op = r(F_STARTS, F_STARTS + 14);
  const l1Y = r(F_STARTS, F_STARTS + 14, 20, 0);
  const l2Op = r(F_NOTHING, F_NOTHING + 14);
  const l2Y = r(F_NOTHING, F_NOTHING + 14, 20, 0);

  const badge = (color: string): React.CSSProperties => ({
    width: 68, height: 68, borderRadius: '50%', flexShrink: 0,
    background: `${color}1f`, border: `1px solid ${color}59`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{
        position: 'absolute', left: GROUP_L, top: 244,
        opacity: eyeOp, transform: `translateY(${eyeY}px)`,
        fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 4, color: COLORS.muted,
      }}>
        THINK&nbsp;OF&nbsp;IT&nbsp;AS
      </div>

      {/* ---- a drafter ---- */}
      <div style={{
        position: 'absolute', left: GROUP_L, top: 330, display: 'flex', alignItems: 'center', gap: 32,
        opacity: d1Op, transform: `translateY(${d1Y}px)`,
      }}>
        <div style={badge(COLORS.accent)}>
          <Check size={38} color={COLORS.accent} strokeWidth={3} />
        </div>
        <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 100, color: COLORS.ink }}>
          <span style={{
            position: 'absolute', left: -12, right: -12, bottom: 14, height: 28, borderRadius: 8,
            background: `${COLORS.accent}59`, transform: `scaleX(${d1Wipe})`, transformOrigin: 'left', zIndex: 0,
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>A drafter.</span>
        </span>
      </div>

      {/* ---- not a ghostwriter ---- */}
      <div style={{
        position: 'absolute', left: GROUP_L, top: 486, display: 'flex', alignItems: 'center', gap: 32,
        opacity: d2Op, transform: `translateY(${d2Y}px)`,
      }}>
        <div style={badge(COLORS.danger)}>
          <X size={38} color={COLORS.danger} strokeWidth={3} />
        </div>
        <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 100, color: COLORS.muted }}>
          A ghostwriter.
          <span style={{
            position: 'absolute', left: -8, right: -8, top: '52%', height: 6, borderRadius: 3,
            background: COLORS.danger, transform: `scaleX(${strike})`, transformOrigin: 'left',
          }} />
        </span>
      </div>

      {/* ---- where the draft starts ---- */}
      <div style={{
        position: 'absolute', left: GROUP_L + 100, top: 700,
        opacity: l1Op, transform: `translateY(${l1Y}px)`,
        fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 54, color: COLORS.ink,
      }}>
        It starts from me.
      </div>
      <div style={{
        position: 'absolute', left: GROUP_L + 100, top: 778,
        opacity: l2Op, transform: `translateY(${l2Y}px)`,
        fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 54, color: COLORS.muted,
      }}>
        Not from nothing.
      </div>
    </AbsoluteFill>
  );
};

export default B11DrafterNotGhostwriter;
