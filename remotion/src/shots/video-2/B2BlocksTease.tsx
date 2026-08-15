import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';
import { BLOCKS } from './_shared/FactoryKit';

// ============================================================================
// B2 tease · the five blocks, named once, fast — transparent overlay in the
// bottom band while Hasan stays on camera. Icons + names ONLY (the full map
// with subs/chips is B3's reveal — don't pre-empt it).
// Master span 63.0 -> 71.5 (8.5s). local f = round((master_s - 63.0) * 30).
// Cues: "5" 63.54->f16 · "building blocks" 64.04-64.75 · "content factory"
// 65.09-65.74 — cards land one by one f16/f26/f36/f46/f56 · out before
// "If you are ready" (71.59) with a dip at f236.
// ============================================================================
export const compositionConfig = {
  id: 'B2BlocksTease',
  durationInSeconds: 8.5,
  fps: 30,
  width: 1920,
  height: 1080,
  transparent: true,
};

const CARD_AT = [16, 26, 36, 46, 56] as const;
const OUT = 236;

const B2BlocksTease: React.FC = () => {
  const frame = useCurrentFrame();
  const outOp = interpolate(frame, [OUT, OUT + 14], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });
  const outY = interpolate(frame, [OUT, OUT + 14], [0, 24], { ...CLAMP, easing: EASINGS.easeIn });
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 54 }}>
      <div style={{ display: 'flex', gap: 16, opacity: outOp, transform: `translateY(${outY}px)` }}>
        {BLOCKS.map((b, i) => {
          const at = CARD_AT[i];
          const { Icon } = b;
          const op = interpolate(frame, [at, at + 9], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
          const y = interpolate(frame, [at, at + 11], [34, 0], { ...CLAMP, easing: EASINGS.overshoot });
          const iconPop = interpolate(frame, [at + 3, at + 13], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
          return (
            <div
              key={b.n}
              style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                display: 'flex',
                alignItems: 'center',
                gap: 15,
                width: 336,
                boxSizing: 'border-box',
                padding: '16px 18px',
                background: COLORS.paper,
                border: `1px solid ${COLORS.line}`,
                borderTop: `4px solid ${b.color}`,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
              }}
            >
              <div style={{ width: 58, height: 58, borderRadius: 16, background: `${b.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${iconPop})`, flexShrink: 0 }}>
                <Icon size={32} color={b.color} strokeWidth={2.1} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 15, letterSpacing: 2, color: b.color }}>BLOCK&nbsp;{b.n}</span>
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 27, color: COLORS.ink, whiteSpace: 'nowrap' }}>{b.name}</span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default B2BlocksTease;
