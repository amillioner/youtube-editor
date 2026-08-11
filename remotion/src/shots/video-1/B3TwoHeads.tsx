import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { TwoHeads } from './_shared/TwoHeads';
import { OneRepoTwoHeads } from './_shared/OneRepoTwoHeads';

// =============================================================================
// B3.3 — ★ THE TWO-HEADS DIAGRAM. The centrepiece the rest of the video calls
// back to. The diagram itself lives in ./_shared/TwoHeads.tsx as a plain
// component (props-driven, no clock of its own) so B8 can re-drive it later.
// Master span 227.432167–255.932167. Local frame = round((master - 227.432167) * 30).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Cues: "That folder" 229.08->f14 · "that GitHub repo" 230.50->f57 ·
//       "2 heads." 233.88->f158  <- the reveal beat ·
//       "local," 236.59->f240 · "deploy and run" 237.42->f264 ·
//       "privately" 239.97->f341 · "online." 244.05->f464 ·
//       "built also a layer" 246.55->f495 · "publish" 248.94->f610 ·
//       "free" 252.56->f719 · "open source" 253.35->f743 ·
//       "self hosted" 254.25->f770 · "fully private" 256.09->f825.
// B3OnlineAccess cuts in straight after this at the SAME diagram top, so the
// geometry constant lives here and is imported there.
// =============================================================================
export const compositionConfig = { id: 'B3TwoHeads', durationInSeconds: 28.5, fps: 30, width: 1920, height: 1080 };

const HEADS_AT = 158;
const CHIPS = [
  { label: 'free', at: 719 },
  { label: 'open source', at: 743 },
  { label: 'self hosted', at: 770 },
  { label: 'fully private', at: 825 },
];
const CHIPS_OUT = 843;

const B3TwoHeadsShot: React.FC = () => {
  const frame = useCurrentFrame();
  const chipsOut = 1 - interpolate(frame, [CHIPS_OUT, CHIPS_OUT + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeIn });
  const chipsFall = interpolate(frame, [CHIPS_OUT, CHIPS_OUT + 12], [0, 14], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <OneRepoTwoHeads frame={frame} oneAt={14} headsAt={HEADS_AT} />

      <TwoHeads
        frame={frame}
        top={250}
        rootAt={26}
        splitAt={HEADS_AT}
        localAt={240}
        localSubAt={264}
        localPillAt={341}
        onlineAt={464}
        onlineSubAt={495}
        onlinePillAt={610}
      />

      {/* "free and open source and self hosted" / "fully private too" — small
          signal affordances, deliberately not a beat of their own. */}
      <div style={{
        position: 'absolute', top: 850, left: 0, width: 1920,
        display: 'flex', justifyContent: 'center', gap: 20,
        opacity: chipsOut, transform: `translateY(${chipsFall}px)`,
      }}>
        {CHIPS.map((c) => {
          const op = interpolate(frame, [c.at, c.at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
          const y = interpolate(frame, [c.at, c.at + 14], [18, 0], { ...CLAMP, easing: EASINGS.easeOut });
          return (
            <div key={c.label} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              background: `${COLORS.signal}14`, border: `1px solid ${COLORS.signal}44`,
              borderRadius: RADIUS.pill, padding: '12px 26px',
              opacity: op, transform: `translateY(${y}px)`,
            }}>
              <Check size={22} color={COLORS.signal} strokeWidth={3} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 28, color: COLORS.ink }}>{c.label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
export default B3TwoHeadsShot;
