import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// =============================================================================
// B1 — placeholder slate for the generated "shock" clip, which DOES NOT EXIST
// yet. Deliberately unmistakable in the baked preview: dark slate, hazard bars,
// mono label, blinking pending dot. Replace the span with the real clip later.
// Slot 1: master 63.65 -> 65.15 (after "Yes, my brain.", over "No, not this way.")
// =============================================================================
export const compositionConfig = { id: 'B1ShockSlate1', durationInSeconds: 1.5, fps: 30, width: 1920, height: 1080 };

const HAZARD = `repeating-linear-gradient(45deg, ${COLORS.d600} 0px, ${COLORS.d600} 22px, ${COLORS.d900} 22px, ${COLORS.d900} 46px)`;

const Corner: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div style={{ position: 'absolute', width: 84, height: 84, ...style }} />
);

export const ShockSlate: React.FC<{ n: number; span: string; secs: string }> = ({ n, span, secs }) => {
  const frame = useCurrentFrame();
  const blink = Math.floor(frame / 7) % 2 === 0 ? 1 : 0.2;
  const op = interpolate(frame, [0, 5], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, opacity: op }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 46, background: HAZARD, opacity: 0.55 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 46, background: HAZARD, opacity: 0.55 }} />

      {/* frame + corner ticks */}
      <div style={{ position: 'absolute', inset: 84, border: `2px solid ${COLORS.d600}`, borderRadius: RADIUS.window }} />
      <Corner style={{ top: 84, left: 84, borderTop: `6px solid ${COLORS.warn}`, borderLeft: `6px solid ${COLORS.warn}` }} />
      <Corner style={{ top: 84, right: 84, borderTop: `6px solid ${COLORS.warn}`, borderRight: `6px solid ${COLORS.warn}` }} />
      <Corner style={{ bottom: 84, left: 84, borderBottom: `6px solid ${COLORS.warn}`, borderLeft: `6px solid ${COLORS.warn}` }} />
      <Corner style={{ bottom: 84, right: 84, borderBottom: `6px solid ${COLORS.warn}`, borderRight: `6px solid ${COLORS.warn}` }} />

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 34,
          border: `2px solid ${COLORS.warn}`, borderRadius: RADIUS.pill, padding: '10px 28px',
        }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: COLORS.warn, opacity: blink }} />
          <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, letterSpacing: 6, color: COLORS.warn }}>
            PLACEHOLDER
          </span>
        </div>

        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 130, letterSpacing: 2, color: COLORS.d300, lineHeight: 1 }}>
          SHOCK CLIP {n}
        </div>

        <div style={{ fontFamily: FONT_MONO, fontSize: 42, letterSpacing: 5, color: COLORS.warn, marginTop: 26 }}>
          GENERATED&nbsp;CLIP&nbsp;PENDING
        </div>

        <div style={{ fontFamily: FONT_MONO, fontSize: 30, letterSpacing: 3, color: COLORS.d400, marginTop: 40 }}>
          MASTER&nbsp;{span}&nbsp;&nbsp;·&nbsp;&nbsp;{secs}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const B1ShockSlate1: React.FC = () => <ShockSlate n={1} span="63.65 s → 65.15 s" secs="1.50 s" />;

export default B1ShockSlate1;
