import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B2b (1/3) — the two borrowed names. Master span 159.832167 -> 164.332167 (4.5s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// local frame = round((master_s - 159.832167) * 30)
//
// The first punctuation in the 39.7s camera run at 159.10–198.80. Deliberately
// SHORT and text-only: B2NameLockup (147.20) already put the product wordmark on
// screen, so this beat must not re-render it. It shows the two words the viewer
// already owns ("my clone" / "second brain") so that the line that follows —
// "but what you will see today is something really different", which stays on his
// FACE in the gap after this shot — has something to push against.
//
// Cues: "clone,"  161.76 -> f23   term 1
//       "some people call it" 162.82 -> f55   the linking rule + label
//       "second" 164.28 -> f98   term 2 (phrase revealed atomically on its
//                                first word, as in B1SameDifferent)
//       "brain." 164.90 -> f117  accent sweep behind term 2, 12f so it settles
//                                before the cut back to camera at f135.
// =============================================================================
export const compositionConfig = {
  id: 'B2bCloneSecondBrain',
  durationInSeconds: 4.5,
  fps: 30,
  width: 1920,
  height: 1080,
};

const CLONE = 23;
const CALLED = 55;
const SECOND = 98;
const BRAIN = 117;

const B2bCloneSecondBrain: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const rise = (at: number) => ({
    opacity: r(at, at + 14),
    transform: `translateY(${r(at, at + 14, 24, 0)}px)`,
  });

  const sweep = r(BRAIN, BRAIN + 12, 0, 1, EASINGS.easeInOut);
  const ruleW = r(CALLED, CALLED + 16, 0, 200, EASINGS.easeOut);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* term 1 — his own word */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 336,
          textAlign: 'center',
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 124,
          lineHeight: 1.1,
          letterSpacing: -3,
          color: COLORS.ink,
          ...rise(CLONE),
        }}
      >
        my clone
      </div>

      {/* the link: same thing, other people's word */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 536,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 26,
          opacity: r(CALLED, CALLED + 14),
        }}
      >
        <span style={{ width: ruleW, height: 1, background: COLORS.line }} />
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 28,
            letterSpacing: 5,
            color: COLORS.muted,
            whiteSpace: 'nowrap',
          }}
        >
          SOME&nbsp;PEOPLE&nbsp;CALL&nbsp;IT
        </span>
        <span style={{ width: ruleW, height: 1, background: COLORS.line }} />
      </div>

      {/* term 2 — the word the audience already owns */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 620,
          textAlign: 'center',
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 124,
          lineHeight: 1.1,
          letterSpacing: -3,
          color: COLORS.ink,
          ...rise(SECOND),
        }}
      >
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span
            style={{
              position: 'absolute',
              left: -16,
              right: -16,
              bottom: 16,
              height: 30,
              background: `${COLORS.accent}52`,
              borderRadius: 8,
              transform: `scaleX(${sweep})`,
              transformOrigin: 'left',
              zIndex: 0,
            }}
          />
          <span style={{ position: 'relative', zIndex: 1 }}>second brain</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default B2bCloneSecondBrain;
