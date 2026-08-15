import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { EASINGS } from '../../brand';
import { FONT_BODY } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame } from '../../lib/browser';
import { GuidePageBody, GuideShareRail, SITE } from './_shared/GuidePage';

// ============================================================================
// ColdOpenOutput · "here is the output" — the REAL published guide page
// (shared clone: _shared/GuidePage.tsx). The page scrolls through the FULL
// guide and lands on the measured 11-container stack grid on the cue.
// Master span 34.1 -> 41.6 (7.5s). local f = round((master_s - 34.1) * 30).
// Cues: page f12 · scroll f45-158 · "numbers it tested itself" 39.6->f165
// (markers sweep the measured MB values) · slow drift f190-225.
// ============================================================================
export const compositionConfig = { id: 'ColdOpenOutput', durationInSeconds: 7.5, fps: 30, width: 1920, height: 1080 };

const ColdOpenOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const scroll = interpolate(frame, [45, 158, 190, 225], [0, 1490, 1490, 1600], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={SITE.purple} />
      <WebBrowserFrame
        url="learnwithhasan.com/guide/self-host-supabase"
        tabTitle="How to Self-Host Supabase: The Parts the Docker Compose Skips"
        box={{ x: 150, y: 40, w: 1620, h: 1000 }}
        appearAt={12}
        pageBg={SITE.bg}
        favicon={<span style={{ width: 17, height: 17, borderRadius: 5, background: SITE.purple, display: 'inline-block' }} />}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, top: -scroll }}>
          <GuidePageBody mbStart={165} />
        </div>
        <GuideShareRail />
      </WebBrowserFrame>
    </AbsoluteFill>
  );
};

export default ColdOpenOutput;
