import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B1 — "same model, same prompt, same post ... but one big difference."
// Master span 42.232167 -> 50.232167 (8.0s). local frame = round((master_s - 42.232167) * 30)
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//   44.70 "model,"      -> f39   row 1 ticks
//   45.99 "prompt,"     -> f78   row 2 ticks
//   47.52 "post,"       -> f124  row 3 ticks
//   48.56 "but"         -> f155  the three recede
//   49.36 "one"         -> f179  \
//   50.01 "big"         -> f199   > the headline builds word by word
//   50.55 "difference." -> f214  /  + accent sweep
// =============================================================================
export const compositionConfig = { id: 'B1SameDifferent', durationInSeconds: 8, fps: 30, width: 1920, height: 1080 };

const ROWS = [
  { label: 'same model', at: 39 },
  { label: 'same prompt', at: 78 },
  { label: 'same post', at: 124 },
];
const COLLAPSE = 155;
const W_ONE = 179;
const W_BIG = 199;
const W_DIFF = 214;

const B1SameDifferent: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const collapse = r(COLLAPSE, COLLAPSE + 20, 0, 1, EASINGS.easeInOut);
  const groupTop = interpolate(collapse, [0, 1], [380, 280]);
  const groupScale = interpolate(collapse, [0, 1], [1, 0.8]);
  const groupOp = interpolate(collapse, [0, 1], [1, 0.28]);

  const word = (at: number) => ({
    opacity: r(at, at + 12),
    transform: `translateY(${r(at, at + 12, 20, 0)}px)`,
    display: 'inline-block',
  });
  const sweep = r(W_DIFF + 2, W_DIFF + 14, 0, 1, EASINGS.easeInOut);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* the three sames */}
      <div style={{
        position: 'absolute', left: '50%', top: groupTop, width: 760,
        transform: `translateX(-50%) scale(${groupScale})`, transformOrigin: 'top center',
        opacity: groupOp,
      }}>
        {ROWS.map((row) => {
          const op = r(row.at, row.at + 14);
          const y = r(row.at, row.at + 14, 24, 0);
          const tick = r(row.at + 4, row.at + 16, 0, 1, EASINGS.overshoot);
          return (
            <div key={row.label} style={{
              display: 'flex', alignItems: 'center', gap: 28, marginBottom: 20,
              opacity: op, transform: `translateY(${y}px)`,
              background: COLORS.paper, border: `1px solid ${COLORS.line}`,
              borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '18px 34px',
            }}>
              <div style={{
                width: 62, height: 62, borderRadius: '50%', flexShrink: 0,
                background: `${COLORS.signal}1c`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{ transform: `scale(${tick})`, display: 'flex' }}>
                  <Check size={34} color={COLORS.signal} strokeWidth={3.2} />
                </div>
              </div>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 56, color: COLORS.ink }}>{row.label}</span>
            </div>
          );
        })}
      </div>

      {/* the one difference */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 116, lineHeight: 1.1, color: COLORS.ink,
      }}>
        <span style={word(W_ONE)}>one</span>{' '}
        <span style={word(W_BIG)}>big</span>{' '}
        <span style={{ ...word(W_DIFF), position: 'relative' }}>
          <span style={{
            position: 'absolute', left: -10, right: -10, bottom: 12, height: 26,
            background: `${COLORS.accent}59`, borderRadius: 7,
            transform: `scaleX(${sweep})`, transformOrigin: 'left', zIndex: 0,
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>difference</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default B1SameDifferent;
