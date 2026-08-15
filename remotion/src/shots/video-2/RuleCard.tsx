import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

// ============================================================================
// RuleCard · the thesis statement of the whole video.
// Master span 567.9 -> 573.4 (5.5s). local f = round((master_s - 567.9) * 30).
// Cues: "automate the work" 568.0->f15 · "never automate the responsibility"
// 570.9->f91 (the word "never" lands 570.923)
// ============================================================================
export const compositionConfig = { id: 'RuleCard', durationInSeconds: 5.5, fps: 30, width: 1920, height: 1080 };

const L1 = 12;
const L2 = 91;

const RuleCard: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const underline = interpolate(frame, [L2 + 8, L2 + 22], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(4, 12), fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.muted, marginBottom: 30 }}>THE&nbsp;RULE,&nbsp;SINCE&nbsp;2022</div>
        <div style={{ ...rise(L1), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 92, color: COLORS.ink }}>
          Automate the work.
        </div>
        <div style={{ ...rise(L2), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 92, color: COLORS.ink, marginTop: 12 }}>
          Never automate the <span style={{ position: 'relative', color: COLORS.accent }}>responsibility.
            <div style={{ position: 'absolute', left: 0, bottom: -8, height: 10, borderRadius: 5, background: COLORS.accent, width: `${underline * 100}%`, opacity: 0.85 }} />
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default RuleCard;
