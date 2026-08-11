import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// =============================================================================
// B2 "the mirror" — the product's first naming moment.
// Master span 146.032167–151.332167 (local f0 = 146.032167s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//
// TRANSPARENT OVERLAY on purpose: he is the one doing the naming ("I called it
// BrainOutside"), so the mark confirms the spelling BESIDE him instead of
// replacing him. B2 is the beat where graphics get out of the way (brand.md §6),
// and the lockup can then hold through the line that decodes the name
// ("as the name means, it's my brain outside", 149.17–152.09) — a cutaway would
// have had to cut back mid-explanation.
//
// Cues: "BrainOutside." 147.80–148.80 -> rise starts f18. One gesture only:
// in, hold, out. Exit begins f148 (152.13s), just after "outside" ends (152.09).
//
// NOTE: BRAND.wordmark in brand.ts is the CHANNEL placeholder ['Your','Channel']
// and is deliberately NOT used here. This is the product lockup, built from the
// brand type system: Space Grotesk 700, tight tracking, two-tone (brand.md §2).
// =============================================================================
export const compositionConfig = {
  id: 'B2NameLockup',
  durationInSeconds: 5.3,
  fps: 30,
  width: 1920,
  height: 1080,
  transparent: true,
};

const IN = 18; // 147.80s — "BrainOutside"
const OUT = 148; // 152.13s — after "it's my brain outside"

const B2NameLockup: React.FC = () => {
  const frame = useCurrentFrame();

  const op = Math.min(
    interpolate(frame, [IN, IN + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    interpolate(frame, [OUT, OUT + 10], [1, 0], { ...CLAMP, easing: EASINGS.easeIn }),
  );
  const y =
    interpolate(frame, [IN, IN + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut }) +
    interpolate(frame, [OUT, OUT + 10], [0, 18], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 118 }}>
      <div
        style={{
          opacity: op,
          transform: `translateY(${y}px)`,
          background: COLORS.paper,
          border: `1px solid ${COLORS.line}`,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
          padding: '20px 64px 26px',
        }}
      >
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 84,
            letterSpacing: -2,
            lineHeight: 1.12,
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: COLORS.ink }}>Brain</span>
          <span style={{ color: COLORS.accent }}>Outside</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default B2NameLockup;
