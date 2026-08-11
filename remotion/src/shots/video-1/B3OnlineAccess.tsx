import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Bot } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { TwoHeads } from './_shared/TwoHeads';
import { OneRepoTwoHeads } from './_shared/OneRepoTwoHeads';

// =============================================================================
// B3.4 — MCP + API endpoints attach to the ONLINE head. This is the SAME
// diagram, at the same top, cut in already fully drawn (negative cues clamp to
// "finished"), so the cut from B3TwoHeads reads as one continuous image and only
// the online side changes.
// Master span 255.932167–269.132167. Local frame = round((master - 255.932167) * 30).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Cues: "this online brain" 259.30->f66 (emphasis ramps to the online head) ·
//       "MCP" 263.62->f196 · "API" 264.90->f234 · "connect" 266.92->f295.
// Each endpoint connector draws 12 frames ahead of its own chip, so the MCP path
// and the API path each arrive on their own word.
// =============================================================================
export const compositionConfig = { id: 'B3OnlineAccess', durationInSeconds: 13.2, fps: 30, width: 1920, height: 1080 };

const BUILT = -90; // any cue <= this is already finished at frame 0
const AGENTS_AT = 295;

const B3OnlineAccess: React.FC = () => {
  const frame = useCurrentFrame();
  const agentOp = interpolate(frame, [AGENTS_AT, AGENTS_AT + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const agentY = interpolate(frame, [AGENTS_AT, AGENTS_AT + 14], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <OneRepoTwoHeads frame={frame} oneAt={BUILT} headsAt={BUILT} />

      <TwoHeads
        frame={frame}
        top={250}
        rootAt={BUILT}
        splitAt={BUILT}
        localAt={BUILT}
        localSubAt={BUILT}
        localPillAt={BUILT}
        onlineAt={BUILT}
        onlineSubAt={BUILT}
        onlinePillAt={BUILT}
        emphasis="online"
        emphasisAt={66}
        endpoints={[
          { label: 'MCP', sub: 'endpoint', icon: 'mcp', at: 196 },
          { label: 'API', sub: 'endpoint', icon: 'api', at: 234 },
        ]}
      />

      {/* "So you can connect with any AI agent you want." */}
      <div style={{
        position: 'absolute', top: 924, left: 0, width: 1920,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          background: COLORS.paper, border: `1px solid ${COLORS.accent}55`, boxShadow: SHADOW.card,
          borderRadius: RADIUS.pill, padding: '16px 34px',
          opacity: agentOp, transform: `translateY(${agentY}px)`,
        }}>
          <Bot size={32} color={COLORS.accent} strokeWidth={2.1} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 34, color: COLORS.ink }}>connect any AI agent</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default B3OnlineAccess;
