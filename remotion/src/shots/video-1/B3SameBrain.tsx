import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Laptop, Globe } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';
import { LOCAL_COLOR, ONLINE_COLOR } from './_shared/TwoHeads';

// =============================================================================
// B3.5 — the resolution: the two heads collapse back into one brain.
// Master span 269.132167–278.832167. Local frame = round((master - 269.132167) * 30).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Cues: "same repo," 271.34->f31 · "same files," 272.70->f72 ·
//       "the same brain" 273.75->f104 (lands on "brain" 274.21->f117) ·
//       "locally" 275.98->f170 · "or" 276.86->f197 · "online" 277.18->f206 ·
//       "from anywhere." 278.55->f248.
// Both halves of every line are always in the layout (opacity only), so nothing
// re-centers as the sentence builds.
// =============================================================================
export const compositionConfig = { id: 'B3SameBrain', durationInSeconds: 9.7, fps: 30, width: 1920, height: 1080 };

const REPO_AT = 31;
const FILES_AT = 72;
const BRAIN_AT = 117;
const LOCAL_AT = 170;
const OR_AT = 197;
const ONLINE_AT = 206;
const ANYWHERE_AT = 248;

const B3SameBrain: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const fade = (at: number) => interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const brainWipe = interpolate(frame, [BRAIN_AT + 4, BRAIN_AT + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const tailWipe = interpolate(frame, [ANYWHERE_AT + 4, ANYWHERE_AT + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  const pill = (at: number, color: string, Icon: React.FC<any>, label: string) => {
    const op = interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
    const y = interpolate(frame, [at, at + 14], [20, 0], { ...CLAMP, easing: EASINGS.easeOut });
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: COLORS.paper, border: `2px solid ${color}`, boxShadow: SHADOW.card,
        borderRadius: RADIUS.pill, padding: '18px 38px',
        opacity: op, transform: `translateY(${y}px)`,
      }}>
        <Icon size={34} color={color} strokeWidth={2.1} />
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 38, color: COLORS.ink }}>{label}</span>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(5, 14), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 5, color: COLORS.muted, marginBottom: 34 }}>
          ONE&nbsp;BRAIN
        </div>

        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, lineHeight: 1.14, color: COLORS.ink, margin: 0, textAlign: 'center' }}>
          <div>
            <span style={{ opacity: fade(REPO_AT) }}>Same repo.&nbsp;</span>
            <span style={{ opacity: fade(FILES_AT) }}>Same files.</span>
          </div>
          <div style={{ opacity: fade(BRAIN_AT) }}>
            The same{' '}
            <span style={{ position: 'relative', display: 'inline-block', color: COLORS.accent }}>
              <span style={{ position: 'absolute', left: -6, right: -6, bottom: -10, height: 10, borderRadius: 5, background: COLORS.accent, transform: `scaleX(${brainWipe})`, transformOrigin: 'left' }} />
              <span style={{ position: 'relative' }}>brain.</span>
            </span>
          </div>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginTop: 56 }}>
          {pill(LOCAL_AT, LOCAL_COLOR, Laptop, 'locally')}
          <span style={{ fontFamily: FONT_MONO, fontSize: 30, color: COLORS.muted, opacity: fade(OR_AT) }}>or</span>
          {pill(ONLINE_AT, ONLINE_COLOR, Globe, 'online')}
        </div>

        <div style={{ marginTop: 44, opacity: fade(ANYWHERE_AT) }}>
          <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 44, color: COLORS.ink }}>
            <span style={{ position: 'absolute', left: -8, right: -8, bottom: -15, height: 8, borderRadius: 4, background: `${COLORS.signal}88`, transform: `scaleX(${tailWipe})`, transformOrigin: 'left' }} />
            <span style={{ position: 'relative' }}>from anywhere</span>
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default B3SameBrain;
