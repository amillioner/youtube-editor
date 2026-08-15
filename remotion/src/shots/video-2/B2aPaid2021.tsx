import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';

// ============================================================================
// B2a · the 2021 way — ROUND-4: split screen. Visuals fill the LEFT 2/3; the
// RIGHT third is a TRANSPARENT window where bake.py places the cropped master
// (timeline type "split", master_box x1280 y0 w640 h1080). Rendered as a
// transparent overlay (.mov) so this shot draws the divider + edge shade OVER
// the pip and keeps full control of the frame.
// Master span 74.8 -> 91.9 (17.1s). local f = round((master_s - 74.8) * 30).
// ROUND-7: the "like this one" mini GuidePage callback is GONE (Hasan's note);
// the waiting + churn column is centered under the price stack instead.
// Cues: "2021" 75.359->f17 · "$150" 77.767->f89 · "$300" 78.553->f113 ·
// "one technical guide" 79.854->f152 · "7 days" 84.170->f281 ·
// "experiments" 87.635->f385 · "tests" 89.079->f428 · "back and forth" 89.624->f445
// ============================================================================
export const compositionConfig = {
  id: 'B2aPaid2021',
  durationInSeconds: 17.1,
  fps: 30,
  width: 1920,
  height: 1080,
  transparent: true,
};

const PANEL_W = 1280; // left panel; pip window = 1280..1920

const YEAR = 17;
const PRICE = 89;
const PRICE_HI = 113;
const GUIDE = 152;
const DAYS = 281;
const CHIPS = [385, 428, 445] as const;
const CHIP_LABELS = ['a lot of experiments', 'a lot of tests', 'back and forth with the writer'] as const;

const B2aPaid2021: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const priceScale = interpolate(frame, [PRICE_HI, PRICE_HI + 10], [1, 1.03], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      {/* left panel — opaque from f0 (the split cut lands directly in this layout) */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: PANEL_W, height: 1080, overflow: 'hidden' }}>
        <BrandBg glow={COLORS.danger} />

        {/* headline stack */}
        <div style={{ position: 'absolute', left: 0, top: 74, width: PANEL_W, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ ...rise(YEAR, 14), fontFamily: FONT_MONO, fontSize: 25, letterSpacing: 4, color: COLORS.muted }}>BACK&nbsp;IN&nbsp;2021</div>
          <div style={{ ...rise(PRICE), transform: `${rise(PRICE).transform} scale(${priceScale})`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 118, color: COLORS.danger, marginTop: 16 }}>
            $150 to $300
          </div>
          <div style={{ ...rise(GUIDE), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40, color: COLORS.ink, marginTop: 10 }}>for one technical guide</div>
        </div>

        {/* the waiting + the churn — centered under the price stack (round-7: the
            mini guide callback is gone, this column owns the lower half) */}
        <div style={{ position: 'absolute', left: 0, top: 520, width: PANEL_W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <div style={{ ...rise(DAYS, 18), fontFamily: FONT_MONO, fontSize: 32, color: COLORS.ink, background: `${COLORS.warn}55`, border: `1px solid ${COLORS.line}`, padding: '16px 34px', borderRadius: RADIUS.pill, boxShadow: SHADOW.soft }}>
            and up to 7 days of waiting
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15, marginTop: 14 }}>
            {CHIP_LABELS.map((label, i) => (
              <span key={label} style={{ ...rise(CHIPS[i], 12), fontSize: 26, color: COLORS.muted, background: COLORS.paper, border: `1px solid ${COLORS.line}`, padding: '12px 26px', borderRadius: RADIUS.pill }}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      {/* divider + soft shade over the pip's left edge (drawn OVER the master) */}
      <div style={{ position: 'absolute', left: PANEL_W - 3, top: 0, width: 3, height: 1080, background: COLORS.ink, opacity: 0.9 }} />
      <div style={{ position: 'absolute', left: PANEL_W, top: 0, width: 36, height: 1080, background: 'linear-gradient(90deg, rgba(0,0,0,0.22), rgba(0,0,0,0))' }} />
    </AbsoluteFill>
  );
};

export default B2aPaid2021;
