import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Server, ArrowUp, Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame } from '../../lib/browser';
import { BOX, PW, PH, GhMark, BrainMark, WizardShell, WizCard, CONTINUE } from './B7kit';

// =============================================================================
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// B7 (14/16) — the dashboard tells you the brain is ahead. Master span
// 536.096967 -> 541.2648 (local frame = round((t - 536.096967) * 30)).
//   "dashboard"     539.32 -> f7    HARD CUT from the wizard to the dashboard
//   "will tell you" 539.97 -> f26   the sync card
//   "your brain"    540.76 -> f50   the server row (what the brain holds)
//   "is ahead"      541.58 -> f74   the "2 commits ahead" pill
//   "of GitHub."    542.36 -> f98   the GitHub row it is ahead OF
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7AheadOfGitHub', durationInSeconds: 4.0, fps: 30, width: 1920, height: 1080 };

const F_CUT = 7;
const F_CARD = 26;
const F_SRV = 50;
const F_AHEAD = 74;
const F_GH = 98;

const B7AheadOfGitHub: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const onDash = frame >= F_CUT;

  const row = (at: number): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 16, height: 70,
    padding: '0 22px', borderRadius: 11, background: COLORS.cream, border: `1px solid ${COLORS.line}`,
    opacity: r(at, at + 13), transform: `translateY(${r(at, at + 13, 14, 0)}px)`,
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <WebBrowserFrame
        url={onDash ? 'brain.learnwithhasan.com/dashboard' : 'brain.learnwithhasan.com/setup'}
        tabTitle={onDash ? 'Dashboard | BrainOutside' : 'Setup | BrainOutside'}
        favicon={<BrainMark size={20} />} box={BOX} appearAt={CONTINUE}
      >
        {!onDash ? (
          <WizardShell step={4} done={4} railAt={CONTINUE} title="Let it write back">
            <WizCard at={CONTINUE} x={460} y={320} w={700} h={220}>
              <div style={{ position: 'absolute', left: 40, top: 70, width: 620, height: 58, borderRadius: 10, background: `${COLORS.signal}1f`, border: `1px solid ${COLORS.signal}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 23, fontWeight: 600, color: COLORS.signal }}>
                <Check size={21} color={COLORS.signal} strokeWidth={3.2} />write access granted
              </div>
            </WizCard>
          </WizardShell>
        ) : (
          <div style={{ position: 'relative', width: PW, height: PH, background: COLORS.paper }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(900px 460px at 50% -16%, ${COLORS.accent}16, transparent 62%)` }} />
            <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 62, borderBottom: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px' }}>
              <BrainMark size={28} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, color: COLORS.ink }}>BrainOutside</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.muted, marginLeft: 8 }}>dashboard</span>
            </div>

            <div style={{
              position: 'absolute', left: 410, top: 150, width: 800, height: 440,
              background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: 16, boxShadow: SHADOW.card,
              opacity: r(F_CARD, F_CARD + 14), transform: `translateY(${r(F_CARD, F_CARD + 14, 20, 0)}px)`,
            }}>
              <div style={{ position: 'absolute', left: 34, top: 30, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 34, color: COLORS.ink }}>Brain sync</div>

              <div style={{ position: 'absolute', left: 34, top: 100, width: 732, ...row(F_SRV) }}>
                <Server size={24} color={COLORS.accent} strokeWidth={2} />
                <span style={{ fontSize: 23, color: COLORS.ink, flex: 1 }}>on your server</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 23, color: COLORS.ink }}>49 notes</span>
              </div>

              <div style={{
                position: 'absolute', left: 34, top: 200, display: 'inline-flex', alignItems: 'center', gap: 12,
                height: 56, padding: '0 22px', borderRadius: RADIUS.pill,
                background: `${COLORS.warn}26`, border: `1px solid ${COLORS.warn}`,
                fontFamily: FONT_MONO, fontSize: 24, color: COLORS.ink,
                opacity: r(F_AHEAD, F_AHEAD + 13), transform: `translateY(${r(F_AHEAD, F_AHEAD + 13, 14, 0)}px)`,
              }}>
                <ArrowUp size={21} color={COLORS.ink} strokeWidth={2.6} />2 commits ahead
              </div>

              <div style={{ position: 'absolute', left: 34, top: 290, width: 732, ...row(F_GH) }}>
                <GhMark size={24} />
                <span style={{ fontSize: 23, color: COLORS.ink, flex: 1 }}>on GitHub</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 23, color: COLORS.muted }}>47 notes</span>
              </div>

              <div style={{ position: 'absolute', left: 34, top: 380, fontSize: 20, color: COLORS.muted, opacity: r(F_GH + 8, F_GH + 20) }}>
                hassancs91/my-brain
              </div>
            </div>
          </div>
        )}
      </WebBrowserFrame>
    </AbsoluteFill>
  );
};
export default B7AheadOfGitHub;
