import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FileText } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { BrainRepoCard, BRAIN_CARD, r } from './B14Kit';

// =============================================================================
// B14 (0/5) — the base of the ladder. Master span 802.196967 -> 806.296967 (4.10s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 802.196967) * 30).
//   "Today,"             805.27 -> f2    eyebrow
//   "this project,"      805.80 -> f18   the repo card rises
//   "the brain,"         806.94 -> f52   the card's name is highlighted
//   "is some text files" 808.21 -> f90   five plain .md files fill in under it
// No SIMULATED tag yet: nothing simulated is on screen. The tag arrives with
// level 1 in the very next shot and never leaves until 883.7.
// The repo card sits at the SHARED BRAIN_CARD geometry, so every level shot in
// the ladder cuts to the same card in the same place.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B14TodayItsText', durationInSeconds: 4.1, fps: 30, width: 1920, height: 1080 };

const F_TODAY = 2;
const F_CARD = 18;
const F_BRAIN = 52;
const F_FILES = 90;

const FILES = ['identity/core', 'identity/voice', 'identity/beliefs', 'knowledge/takes', 'projects/'];

const B14TodayItsText: React.FC = () => {
  const frame = useCurrentFrame();

  const eyeOp = r(frame, F_TODAY, F_TODAY + 12);
  const eyeY = r(frame, F_TODAY, F_TODAY + 12, 16, 0);
  const glow = r(frame, F_BRAIN, F_BRAIN + 14);
  const pop = interpolate(frame, [F_BRAIN, F_BRAIN + 8, F_BRAIN + 22], [1, 1.03, 1], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{
        position: 'absolute', top: 64, left: 0, width: 1920, textAlign: 'center',
        opacity: eyeOp, transform: `translateY(${eyeY}px)`,
        fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 6, color: COLORS.muted,
      }}>
        TODAY
      </div>

      {/* the repo card, at the shared ladder geometry */}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${pop})`, transformOrigin: `${BRAIN_CARD.x + BRAIN_CARD.w / 2}px ${BRAIN_CARD.y + BRAIN_CARD.h / 2}px` }}>
        <div style={{
          position: 'absolute', left: BRAIN_CARD.x - 14, top: BRAIN_CARD.y - 14,
          width: BRAIN_CARD.w + 28, height: BRAIN_CARD.h + 28,
          borderRadius: RADIUS.card + 6, border: `2px solid ${COLORS.accent}`, opacity: glow * 0.8,
        }} />
        <BrainRepoCard frame={frame} at={F_CARD} />
      </div>

      {/* "is some text files." */}
      <div style={{ position: 'absolute', left: 560, top: 356, width: 800 }}>
        {FILES.map((f, i) => {
          const at = F_FILES + i * 4;
          const op = r(frame, at, at + 12);
          const x = r(frame, at, at + 12, -14, 0);
          return (
            <div key={f} style={{
              display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12,
              background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.panel,
              boxShadow: SHADOW.soft, padding: '16px 26px',
              opacity: op, transform: `translateX(${x}px)`,
            }}>
              <FileText size={26} color={COLORS.muted} strokeWidth={1.9} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 30, color: COLORS.muted }}>
                {f}
                <span style={{ color: COLORS.ink }}>.md</span>
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute', left: 0, top: 800, width: 1920, textAlign: 'center',
        opacity: r(frame, F_FILES + 6, F_FILES + 20),
        transform: `translateY(${r(frame, F_FILES + 6, F_FILES + 20, 20, 0)}px)`,
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 76, color: COLORS.ink,
      }}>
        Just text files.
      </div>
    </AbsoluteFill>
  );
};
export default B14TodayItsText;
