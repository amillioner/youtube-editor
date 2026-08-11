import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// =============================================================================
// B2 "the mirror" — the one enumeration in an otherwise face-only beat.
// Master span 151.532167–157.932167 (local f0 = 151.532167s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//
// TRANSPARENT OVERLAY, single bottom-band row: B2 is deliberately the lightest
// beat in the chunk, so this stays a quiet lower-third that accumulates while he
// keeps the frame. A card/cutaway here would be louder than the talking head,
// which is exactly what this beat must not be.
//
// "It knows how I write. It knows what I believe, my philosophy, my projects."
// Each item lands ON its own content word (the words are 1.2–2.4s apart, so the
// 3–4 frame stagger only applies to the "IT KNOWS" stem -> first item pair):
//   "knows"      152.62 -> stem f0
//   "how"        152.86 -> f5
//   "what"       154.62 -> f58
//   "my philos." 155.99 -> f99
//   "my projects" 157.19 -> f135
// All four hold, then the row leaves together at f180 (158.70s) under "what I
// do, just everything about me" so his face carries the rest of the beat.
// Items keep their layout slot at opacity 0 so nothing reflows as they arrive.
// =============================================================================
export const compositionConfig = {
  id: 'B2KnowsList',
  durationInSeconds: 6.4,
  fps: 30,
  width: 1920,
  height: 1080,
  transparent: true,
};

const ITEMS = [
  { label: 'how I write', at: 5 },
  { label: 'what I believe', at: 58 },
  { label: 'my philosophy', at: 99 },
  { label: 'my projects', at: 135 },
];

const OUT = 180; // 158.70s

const B2KnowsList: React.FC = () => {
  const frame = useCurrentFrame();

  const leave = interpolate(frame, [OUT, OUT + 10], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });
  const leaveY = interpolate(frame, [OUT, OUT + 10], [0, 18], { ...CLAMP, easing: EASINGS.easeIn });

  const enter = (at: number) => ({
    opacity:
      interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) * leave,
    transform: `translateY(${
      interpolate(frame, [at, at + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut }) + leaveY
    }px)`,
  });

  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <span
          style={{
            ...enter(0),
            fontFamily: FONT_MONO,
            fontSize: 22,
            letterSpacing: 3,
            color: COLORS.muted,
            whiteSpace: 'nowrap',
            paddingRight: 4,
          }}
        >
          IT&nbsp;KNOWS
        </span>

        {ITEMS.map((it) => (
          <div
            key={it.label}
            style={{
              ...enter(it.at),
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: COLORS.paper,
              border: `1px solid ${COLORS.line}`,
              borderRadius: RADIUS.pill,
              boxShadow: SHADOW.soft,
              padding: '15px 30px',
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.accent, flexShrink: 0 }} />
            <span
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 600,
                fontSize: 34,
                color: COLORS.ink,
                whiteSpace: 'nowrap',
              }}
            >
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export default B2KnowsList;
