import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Ban, ShieldCheck } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B1.5 (3/3) — the inversion. Master span 124.432167 -> 131.832167
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 124.432167) * 30)).
//   "Everyone is worried"        125.73 -> f4    eyebrow: THE COMMON WORRY
//   "hallucinating"              127.42 -> f55   headline half 1 (+ pink wipe)
//   "writing in your voice"      128.57 -> f89   headline half 2
//                                       f96      the fabricated line (the fear,
//                                                made concrete: the exact number
//                                                the gaps field refused)
//   "This project does the       130.47 -> f146  the flip: worry falls away, the
//    opposite."                                  claim rises, and at f160 the
//                                                same fabricated line is struck
//                                                and re-tagged "blocked by gaps"
//   "opposite."                  132.01 -> f192  indigo wipe on the payoff word
// Palette: pink = the fear (brand.md §3 "errors / negative contrast"), yellow =
// the constraint (the same warn the gaps field carries), indigo = the claim.
// =============================================================================
export const compositionConfig = { id: 'B15Opposite', durationInSeconds: 7.4, fps: 30, width: 1920, height: 1080 };

const F_EYEBROW = 4;
const F_CARD = 21; // "worried" — the fabricated line is the worry, made concrete
const F_HALF1 = 55;
const F_PILL = 58;
const F_HALF2 = 89;
const F_EXIT = 134; // "voice." has landed (129.97): clear the worry in the pause before the flip
const F_FLIP = 146;
const F_BLOCK = 160;
const F_OPP = 192;

const B15Opposite: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // stage 1 -> stage 2 handoff (fade + fall, brand.md §6). The worry is gone
  // before the claim arrives — the two headlines never share the frame.
  const s1Op = 1 - r(F_EXIT, F_EXIT + 10, 0, 1, EASINGS.easeIn);
  const s1Y = r(F_EXIT, F_EXIT + 12, 0, 26, EASINGS.easeIn);
  const tint = r(F_EXIT + 4, F_EXIT + 32, 0, 1, EASINGS.easeInOut);

  const eyebrowOp = r(F_EYEBROW, F_EYEBROW + 14);
  const eyebrowY = r(F_EYEBROW, F_EYEBROW + 14, 18, 0);
  const h1Op = r(F_HALF1, F_HALF1 + 14);
  const h1Y = r(F_HALF1, F_HALF1 + 14, 24, 0);
  const h1Wipe = r(F_HALF1 + 3, F_HALF1 + 13);
  const h2Op = r(F_HALF2, F_HALF2 + 14);
  const h2Y = r(F_HALF2, F_HALF2 + 14, 24, 0);

  // the card persists across the flip
  const cardOp = r(F_CARD, F_CARD + 14);
  const cardY = r(F_CARD, F_CARD + 14, 22, 0);
  const strike = r(F_BLOCK, F_BLOCK + 12, 0, 1, EASINGS.easeInOut);
  const lineFade = r(F_BLOCK, F_BLOCK + 12, 1, 0.34);
  const pillA = r(F_PILL, F_PILL + 12) * (1 - r(F_BLOCK, F_BLOCK + 10));
  const pillB = r(F_BLOCK + 4, F_BLOCK + 16);

  // stage 2
  const s2Op = r(F_FLIP, F_FLIP + 14);
  const s2Y = r(F_FLIP, F_FLIP + 16, 30, 0);
  const oppWipe = r(F_OPP, F_OPP + 10);

  const pill: React.CSSProperties = {
    position: 'absolute', right: 30, top: '50%', marginTop: -19,
    display: 'flex', alignItems: 'center', gap: 10, height: 38,
    borderRadius: RADIUS.pill, padding: '0 18px',
    fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 0.5,
  };

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.danger} />
      <AbsoluteFill style={{ opacity: tint }}><BrandBg glow={COLORS.accent} /></AbsoluteFill>

      {/* ---------------- stage 1: the common worry ---------------- */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 296, textAlign: 'center', opacity: s1Op * eyebrowOp, transform: `translateY(${eyebrowY + s1Y}px)`, fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 4, color: COLORS.muted }}>
        THE&nbsp;COMMON&nbsp;WORRY
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 372, textAlign: 'center', opacity: s1Op, transform: `translateY(${s1Y}px)`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 100, lineHeight: 1.3, color: COLORS.ink }}>
        <div style={{ opacity: h1Op, transform: `translateY(${h1Y}px)` }}>
          AI{' '}
          <span style={{ position: 'relative', display: 'inline-block', color: COLORS.danger }}>
            hallucinating
            <span style={{ position: 'absolute', left: 0, right: 0, bottom: 12, height: 8, borderRadius: 4, background: COLORS.danger, transform: `scaleX(${h1Wipe})`, transformOrigin: 'left' }} />
          </span>
        </div>
        <div style={{ opacity: h2Op, transform: `translateY(${h2Y}px)` }}>when writing in your voice</div>
      </div>

      {/* ---------------- stage 2: the flip ---------------- */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 452, textAlign: 'center', opacity: s2Op, transform: `translateY(${s2Y}px)`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1.2, color: COLORS.ink }}>
        This project does the{' '}
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ position: 'absolute', left: -10, right: -10, bottom: 10, height: 26, borderRadius: 8, background: `${COLORS.accent}59`, transform: `scaleX(${oppWipe})`, transformOrigin: 'left', zIndex: 0 }} />
          <span style={{ position: 'relative', zIndex: 1 }}>opposite.</span>
        </span>
      </div>

      {/* ---------------- the fabricated line (lives through both stages) ------ */}
      <div style={{
        position: 'absolute', left: 380, top: 700, width: 1160,
        background: COLORS.d900, border: `1px solid ${COLORS.d600}`, borderRadius: RADIUS.panel,
        boxShadow: SHADOW.card, opacity: cardOp, transform: `translateY(${cardY}px)`,
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 92, padding: '0 30px' }}>
          <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_MONO, fontSize: 28, color: COLORS.d300, opacity: lineFade }}>
            &quot;I spend about 5 hours a week on maintenance.&quot;
            <span style={{ position: 'absolute', left: -4, right: -4, top: '50%', height: 3, borderRadius: 2, background: COLORS.danger, transform: `scaleX(${strike})`, transformOrigin: 'left' }} />
          </span>

          <div style={{ ...pill, opacity: pillA, background: `${COLORS.danger}1a`, border: `1px solid ${COLORS.danger}59`, color: COLORS.danger }}>
            <Ban size={18} color={COLORS.danger} strokeWidth={2.2} />
            <span>invented</span>
          </div>
          <div style={{ ...pill, opacity: pillB, background: `${COLORS.warn}1a`, border: `1px solid ${COLORS.warn}59`, color: COLORS.warn }}>
            <ShieldCheck size={18} color={COLORS.warn} strokeWidth={2.2} />
            <span>blocked by gaps</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default B15Opposite;
