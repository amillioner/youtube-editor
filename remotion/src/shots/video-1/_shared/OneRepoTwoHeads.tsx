// =============================================================================
// OneRepoTwoHeads — the headline that sits above the TwoHeads diagram.
// "One repo, two heads." Both halves are ALWAYS in the layout (opacity only), so
// the line never re-centers when the second half lands on its word.
// Plain component (no compositionConfig, no useCurrentFrame): pass `frame`.
//
// PROPS
//   frame    number   REQUIRED. the caller's clock.
//   oneAt    number   frame "One repo," rises in            (default 0)
//   headsAt  number   frame "two heads." lands + the accent underline wipes
//                     (default oneAt + 40). Pass a negative value to have the
//                     whole line already on screen at frame 0.
//   top      number   y of the line on the 1920x1080 canvas (default 92)
// =============================================================================
import React from 'react';
import { interpolate } from 'remotion';
import { COLORS, EASINGS } from '../../../brand';
import { FONT_DISPLAY } from '../../../fonts';
import { CLAMP } from '../../../lib/kit';

export const HEADLINE_TOP = 112;

export const OneRepoTwoHeads: React.FC<{
  frame: number; oneAt?: number; headsAt?: number; top?: number;
}> = ({ frame, oneAt = 0, headsAt, top = HEADLINE_TOP }) => {
  const hAt = headsAt ?? oneAt + 40;
  const oneOp = interpolate(frame, [oneAt, oneAt + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const oneY = interpolate(frame, [oneAt, oneAt + 14], [22, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const headsOp = interpolate(frame, [hAt, hAt + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const wipe = interpolate(frame, [hAt + 2, hAt + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{ position: 'absolute', top, left: 0, width: 1920, textAlign: 'center' }}>
      <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, lineHeight: 1.1, color: COLORS.ink, margin: 0 }}>
        <span style={{ display: 'inline-block', opacity: oneOp, transform: `translateY(${oneY}px)` }}>One repo,&nbsp;</span>
        <span style={{ position: 'relative', display: 'inline-block', opacity: headsOp, color: COLORS.accent }}>
          <span style={{ position: 'absolute', left: -4, right: -4, bottom: -8, height: 8, borderRadius: 4, background: COLORS.accent, transform: `scaleX(${wipe})`, transformOrigin: 'left' }} />
          <span style={{ position: 'relative' }}>two heads.</span>
        </span>
      </h1>
    </div>
  );
};
