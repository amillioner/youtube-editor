import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Check, Hammer, Radio, FolderTree } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP, Sunburst } from '../../lib/kit';
import { WebBrowserFrame, Ring } from '../../lib/browser';
import { BOX, PW, PH, BrainMark, WizardShell, WizCard, Field, SpedUpTag, LogStream, Bar, Caption, Wipe, CONTINUE } from './B7kit';

// =============================================================================
// B7 (15/16) — steps 5 and 6, then the payoff. Master span 540.096967 -> 549.896967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 540.096967) * 30)).
//   "step number 5,"      544.28 -> f35   ring on pip 5
//   "connect Claude,"     545.34 -> f67   the Claude lockup in the card
//   "add your key."       546.61 -> f105  the API key field fills
//   "Number 6,"           547.58 -> f134  ring on pip 6, the Build card
//   "build,"              548.54 -> f163  the build ramps (`sped up` tag ON)
//   "and that's it."      549.59 -> f192  build complete
//   "online."             552.13 -> f271  the status pill flips + pulses, caption wipe
// The caption arrives ON the payoff word, not before it. Slow push from f232 so
// the last 2 seconds settle into the result instead of sitting still.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7Steps56', durationInSeconds: 9.8, fps: 30, width: 1920, height: 1080 };

const F_CARD5 = 20;
const F_PIP5 = 35;
const F_CLAUDE = 67;
const F_KEY = 96;
const F_KEY_OK = 105;
const F_STEP6 = 127;
const F_PIP6 = 134;
const F_BUILD = 163;
const F_BUILT = 192;
const F_DASH = 223;
const F_ONLINE = 271;

const RAIL_L = (PW - 6 * 178) / 2;
const pipX = (i: number) => RAIL_L + i * 178 + 89;

const BUILD_LOG = [
  'reading INDEX.md',
  'indexing knowledge/  (21 notes)',
  'indexing identity/   (6 notes)',
  'indexing projects/   (14 notes)',
  'indexing lenses/     (8 notes)',
  'building embeddings',
  'writing content-catalog/',
  '✓ brain built. 49 notes indexed',
];

const B7Steps56: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const onDash = frame >= F_DASH;
  const step = frame >= F_STEP6 ? 6 : 5;
  const done = frame >= F_BUILT ? 6 : frame >= F_KEY_OK + 6 ? 5 : 4;

  // slow push onto the payoff
  const push = r(F_DASH + 8, 294, 1, 1.055, EASINGS.easeInOut);

  // "online." lands on f271 with ~23 frames left, so the pill itself carries the
  // beat: a fast pop, one expanding ripple, then a held teal glow.
  const isOnline = frame >= F_ONLINE;
  const a8 = (a: number) => Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
  const pop = interpolate(frame, [F_ONLINE, F_ONLINE + 4, F_ONLINE + 13], [1, 1.13, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ripple = r(F_ONLINE, F_ONLINE + 16, 0, 30);
  const rippleOp = r(F_ONLINE, F_ONLINE + 16, 0.55, 0);
  const breathe = Math.abs(((frame % 20) / 10) - 1);           // 0..1, ~0.67s cycle
  const glow = 12 + 14 * breathe;
  const pillGlow = isOnline
    ? `0 0 0 ${ripple}px ${COLORS.signal}${a8(rippleOp)}, 0 0 ${glow}px ${COLORS.signal}${a8(0.6)}`
    : 'none';

  const tile = (at: number): React.CSSProperties => ({
    display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center',
    height: 150, padding: '0 28px', borderRadius: 14,
    background: COLORS.paper, border: `1px solid ${COLORS.line}`, boxShadow: SHADOW.soft,
    opacity: r(at, at + 14), transform: `translateY(${r(at, at + 14, 18, 0)}px)`,
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, transform: `scale(${onDash ? push : 1})` }}>
      <BrandBg glow={COLORS.accent} />
      <WebBrowserFrame
        url={onDash ? 'brain.learnwithhasan.com' : 'brain.learnwithhasan.com/setup'}
        tabTitle={onDash ? 'my-brain | BrainOutside' : 'Setup | BrainOutside'}
        favicon={<BrainMark size={20} />} box={BOX} appearAt={CONTINUE}
      >
        {!onDash ? (
          <WizardShell step={step} done={done} railAt={CONTINUE} title={step === 5 ? 'Connect Claude' : 'Build your brain'}>
            {frame >= F_PIP5 && frame < F_STEP6 && (
              <Ring start={F_PIP5} color={COLORS.accent} style={{ left: pipX(4) - 32, top: 86, right: 'auto', bottom: 'auto', width: 64, height: 64, borderRadius: 999 }} />
            )}
            {frame >= F_PIP6 && (
              <Ring start={F_PIP6} color={COLORS.accent} style={{ left: pipX(5) - 32, top: 86, right: 'auto', bottom: 'auto', width: 64, height: 64, borderRadius: 999 }} />
            )}

            {step === 5 ? (
              <WizCard at={F_CARD5} x={460} y={310} w={700} h={300}>
                <div style={{
                  position: 'absolute', left: 40, top: 30, display: 'flex', alignItems: 'center', gap: 14,
                  opacity: r(F_CLAUDE, F_CLAUDE + 13), transform: `translateY(${r(F_CLAUDE, F_CLAUDE + 13, 12, 0)}px)`,
                }}>
                  <Sunburst size={34} />
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink }}>Claude</span>
                  <span style={{ fontSize: 21, color: COLORS.muted }}>API key or subscription token</span>
                </div>
                <Field label="" value="sk-ant-api03-••••••••••••••••••••" at={F_KEY} x={40} y={110} w={620} done={F_KEY_OK} />
                <div style={{
                  position: 'absolute', left: 40, top: 210, width: 620, height: 56, borderRadius: 10,
                  background: frame >= F_KEY_OK ? `${COLORS.signal}1f` : COLORS.cream,
                  border: `1px solid ${frame >= F_KEY_OK ? COLORS.signal : COLORS.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  fontSize: 22, fontWeight: 600, color: frame >= F_KEY_OK ? COLORS.signal : COLORS.muted,
                }}>
                  {frame >= F_KEY_OK ? <><Check size={20} color={COLORS.signal} strokeWidth={3.2} />Claude connected</> : 'Connect'}
                </div>
              </WizCard>
            ) : (
              <WizCard at={F_STEP6} x={430} y={310} w={760} h={330}>
                <div style={{ position: 'absolute', left: 36, top: 26, display: 'flex', alignItems: 'center', gap: 12, fontSize: 21, color: COLORS.muted }}>
                  <Hammer size={20} color={COLORS.muted} strokeWidth={2} />reading your repo and building the index
                </div>
                <div style={{ position: 'absolute', left: 36, top: 68, width: 688, height: 178, background: COLORS.d900, borderRadius: 10, overflow: 'hidden' }} />
                {frame >= F_BUILD && (
                  <LogStream
                    lines={BUILD_LOG} from={F_BUILD} to={F_BUILT} rows={5}
                    x={56} y={84} w={648} size={20} lineH={31}
                    dimColor={COLORS.d400} okColor={COLORS.signal}
                  />
                )}
                <Bar from={F_BUILD} to={F_BUILT} x={36} y={266} w={688} h={10} color={frame >= F_BUILT ? COLORS.signal : COLORS.accent} track={COLORS.line} />
                {frame >= F_BUILT && (
                  <div style={{ position: 'absolute', left: 36, top: 288, display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT_MONO, fontSize: 21, color: COLORS.signal, opacity: r(F_BUILT, F_BUILT + 10) }}>
                    <Check size={19} color={COLORS.signal} strokeWidth={3.2} />build complete
                  </div>
                )}
              </WizCard>
            )}
          </WizardShell>
        ) : (
          // ---------------- the payoff: the brain, live on its own domain -------
          <div style={{ position: 'relative', width: PW, height: PH, background: COLORS.paper }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(900px 460px at 50% -14%, ${COLORS.accent}1c, transparent 62%)` }} />
            <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 62, borderBottom: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px' }}>
              <BrainMark size={28} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, color: COLORS.ink }}>BrainOutside</span>
            </div>

            <div style={{ position: 'absolute', left: 90, top: 130, display: 'flex', alignItems: 'center', gap: 22, opacity: r(F_DASH + 4, F_DASH + 18) }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 62, color: COLORS.ink }}>my-brain</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 12, height: 56, padding: '0 22px', borderRadius: RADIUS.pill,
                background: isOnline ? `${COLORS.signal}2e` : `${COLORS.warn}22`,
                border: `${isOnline ? 2 : 1}px solid ${isOnline ? COLORS.signal : COLORS.warn}`,
                fontFamily: FONT_MONO, fontSize: 24, color: COLORS.ink,
                boxShadow: pillGlow, transform: `scale(${isOnline ? pop : 1})`,
              }}>
                <span style={{ width: 13, height: 13, borderRadius: '50%', background: isOnline ? COLORS.signal : COLORS.warn }} />
                {isOnline ? 'online' : 'starting'}
              </span>
            </div>
            <div style={{ position: 'absolute', left: 90, top: 218, fontFamily: FONT_MONO, fontSize: 24, color: COLORS.muted, opacity: r(F_DASH + 10, F_DASH + 24) }}>
              brain.learnwithhasan.com
            </div>

            <div style={{ position: 'absolute', left: 90, top: 300, width: PW - 180, display: 'flex', gap: 26 }}>
              <div style={{ ...tile(F_DASH + 14), flex: 1 }}>
                <FolderTree size={26} color={COLORS.accent} strokeWidth={2} />
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink }}>49 notes</span>
                <span style={{ fontSize: 20, color: COLORS.muted }}>indexed from your repo</span>
              </div>
              <div style={{ ...tile(F_DASH + 20), flex: 1 }}>
                <Radio size={26} color={COLORS.accent} strokeWidth={2} />
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink }}>MCP</span>
                <span style={{ fontSize: 20, color: COLORS.muted }}>endpoint ready</span>
              </div>
              <div style={{ ...tile(F_DASH + 26), flex: 1 }}>
                <Sunburst size={26} />
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink }}>Claude</span>
                <span style={{ fontSize: 20, color: COLORS.muted }}>connected</span>
              </div>
            </div>

          </div>
        )}
      </WebBrowserFrame>

      {frame >= F_BUILD && frame < F_DASH && <SpedUpTag from={F_BUILD} to={F_BUILT - 4} />}
      {onDash && <Caption at={F_ONLINE}>Your brain is <Wipe at={F_ONLINE + 4}>online.</Wipe></Caption>}
    </AbsoluteFill>
  );
};
export default B7Steps56;
