import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Bot, Check, Lock, Laptop } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B5b (3/6) — the scripted callout card. Script B5 asks for it in these exact
// words: "Callout card: agents propose · you approve". It lands as the summary
// stamp of the flow that just played, and it hands off to the "why" line, which
// he delivers to camera (no graphic over it).
//
// Master span 341.232167-344.832167 (local frame = round((t - 341.232167) * 30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//   "This is how it works."  342.58 -> f5   the rule
//   "Locally."               343.80 -> f42  the "all of this runs locally" pill
//   "Why so strict?"         344.67 -> f68  the question, which he then answers
//                                           on camera (346.05-353.62 is clean
//                                           talking head on purpose)
// Colour split follows brand.md §3: indigo = the agent's move, teal = the human
// confirm. The lock between them is the gate the previous shot just showed.
// =============================================================================
export const compositionConfig = { id: 'B5bProposeApprove', durationInSeconds: 3.6, fps: 30, width: 1920, height: 1080 };

const F_RULE = 2; // "This is how it works." is 342.58 -> f5; the rule starts its
                  // 14-frame rise 3 frames early so the cut never opens on an
                  // empty frame, and it reads under the word, not before it.
const F_LOCAL = 42;
const F_WHY = 68;

const Half: React.FC<{
  at: number; color: string; label: string; sub: string; Icon: React.FC<any>; align: 'right' | 'left';
}> = ({ at, color, label, sub, Icon, align }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [at, at + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: align === 'right' ? 'flex-end' : 'flex-start',
      gap: 16, opacity: op, transform: `translateY(${y}px)`,
    }}>
      <div style={{ width: 92, height: 92, borderRadius: '50%', background: `${color}1f`, border: `2px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={48} color={color} strokeWidth={2} />
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 82, lineHeight: 1.05, color }}>{label}</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 30, color: COLORS.muted }}>{sub}</div>
    </div>
  );
};

const B5bProposeApprove: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{
        position: 'absolute', left: 0, top: 196, width: 1920, textAlign: 'center',
        fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 6, color: COLORS.muted,
        opacity: r(F_RULE, F_RULE + 14), transform: `translateY(${r(F_RULE, F_RULE + 14, 16, 0)}px)`,
      }}>
        THE&nbsp;RULE
      </div>

      <div style={{ position: 'absolute', left: 190, top: 300, width: 1540, display: 'flex', alignItems: 'center', gap: 60 }}>
        <Half at={F_RULE} color={COLORS.accent} label="agents propose" sub="they draft, they never commit" Icon={Bot} align="right" />

        {/* the gate itself */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
          opacity: r(F_RULE + 6, F_RULE + 20), transform: `scale(${r(F_RULE + 6, F_RULE + 22, 0.9, 1, EASINGS.overshoot)})`,
        }}>
          <div style={{ width: 3, height: 74, background: COLORS.line }} />
          <div style={{ width: 74, height: 74, borderRadius: '50%', background: COLORS.paper, border: `2px solid ${COLORS.line}`, boxShadow: SHADOW.soft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={34} color={COLORS.ink} strokeWidth={2.2} />
          </div>
          <div style={{ width: 3, height: 74, background: COLORS.line }} />
        </div>

        <Half at={F_RULE + 4} color={COLORS.signal} label="you approve" sub="one gate, every single time" Icon={Check} align="left" />
      </div>

      {/* "Locally." */}
      <div style={{
        position: 'absolute', left: 0, top: 790, width: 1920, display: 'flex', justifyContent: 'center',
        opacity: r(F_LOCAL, F_LOCAL + 14), transform: `translateY(${r(F_LOCAL, F_LOCAL + 14, 14, 0)}px)`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, height: 66, padding: '0 30px',
          background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill, boxShadow: SHADOW.soft,
        }}>
          <Laptop size={28} color={COLORS.ink} strokeWidth={2} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: COLORS.ink }}>all of this runs locally</span>
        </div>
      </div>

      {/* the question he answers on camera */}
      <div style={{
        position: 'absolute', left: 0, top: 900, width: 1920, textAlign: 'center',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 62, color: COLORS.ink,
        opacity: r(F_WHY, F_WHY + 14), transform: `translateY(${r(F_WHY, F_WHY + 14, 18, 0)}px)`,
      }}>
        Why so strict?
      </div>
    </AbsoluteFill>
  );
};
export default B5bProposeApprove;
