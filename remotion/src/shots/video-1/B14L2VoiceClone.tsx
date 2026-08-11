import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Volume2, Fingerprint } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg } from '../../lib/kit';
import { BrainRepoCard, Connector, LevelRail, SimTag, Waveform, r } from './B14Kit';

// =============================================================================
// B14 · LEVEL 2a — the voice becomes YOUR voice. Master span 813.596967 -> 819.796967.
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 813.596967) * 30).
//   "Now let's make the voice" 817.44 -> f25   the generic voice name is struck
//   "a voice clone"            818.90 -> f69   the module retitles
//   "clone"                    819.37 -> f83   cloned chip lands + rail 2 fills
//   "of me,"                   819.87 -> f98   owner chip 1
//   "or your brain,"           820.91 -> f129  owner chip 2
//   "or you."                  822.19 -> f168  owner chip 3
// The module keeps the SAME geometry as level 1, so the cut is a change of
// state, not a change of scene. No photo of him here on purpose: the face is
// level 3's reveal and must not be pre-empted.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B14L2VoiceClone', durationInSeconds: 6.2, fps: 30, width: 1920, height: 1080 };

const F_STRIKE = 25;
const F_TITLE = 69;
const F_CLONE = 83;
const OWNERS = [
  { label: 'me', at: 98 },
  { label: 'your brain', at: 129 },
  { label: 'you', at: 168 },
];

const MOD = { x: 600, y: 424, w: 720, h: 300 };

const B14L2VoiceClone: React.FC = () => {
  const frame = useCurrentFrame();

  const strike = r(frame, F_STRIKE, F_STRIKE + 12, 0, 1, EASINGS.easeInOut);
  const genericFade = r(frame, F_STRIKE, F_STRIKE + 12, 1, 0.32);
  const titleOut = 1 - r(frame, F_TITLE - 4, F_TITLE + 8, 0, 1, EASINGS.easeIn);
  const titleIn = r(frame, F_TITLE, F_TITLE + 14);
  const cloneOp = r(frame, F_CLONE, F_CLONE + 12);
  const cloneSc = r(frame, F_CLONE, F_CLONE + 14, 0.94, 1);
  const headOp = r(frame, F_CLONE, F_CLONE + 14);
  const headY = r(frame, F_CLONE, F_CLONE + 14, 26, 0);
  const headWipe = r(frame, F_CLONE + 4, F_CLONE + 16);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <SimTag frame={frame} at={-30} />
      <BrainRepoCard frame={frame} at={-30} />
      <Connector frame={frame} at={-30} x={960} y1={358} y2={MOD.y} color={COLORS.accent} />

      <div style={{
        position: 'absolute', left: MOD.x, top: MOD.y, width: MOD.w, height: MOD.h,
        borderRadius: RADIUS.card, overflow: 'hidden',
        background: COLORS.paper, border: `2px solid ${COLORS.accent}`, boxShadow: SHADOW.card,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 30px 0' }}>
          <Volume2 size={34} color={COLORS.accent} strokeWidth={2.2} />
          {/* title swaps in place: "voice" -> "voice clone" */}
          <div style={{ position: 'relative', height: 52, flex: 1 }}>
            <span style={{ position: 'absolute', left: 0, top: 0, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 42, color: COLORS.ink, opacity: titleOut, whiteSpace: 'nowrap' }}>voice</span>
            <span style={{ position: 'absolute', left: 0, top: 0, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 42, color: COLORS.ink, opacity: titleIn, whiteSpace: 'nowrap' }}>voice clone</span>
          </div>
          {/* the generic voice name is struck out on its cue */}
          <div style={{ position: 'relative', display: 'inline-block', opacity: genericFade }}>
            {/* the exact generic name B14L1AnyVoice's last frame is showing, so
                the cut lands on the same label before it is struck out */}
            <span style={{ fontFamily: FONT_MONO, fontSize: 26, color: COLORS.muted, whiteSpace: 'nowrap' }}>voice: nova</span>
            <span style={{ position: 'absolute', left: -4, right: -4, top: '52%', height: 3, borderRadius: 2, background: COLORS.danger, transform: `scaleX(${strike})`, transformOrigin: 'left' }} />
          </div>
        </div>

        <Waveform frame={frame} at={-30} x={30} y={112} w={660} h={130} bars={38} color={COLORS.accent} />

        <div style={{
          position: 'absolute', left: 30, bottom: 22,
          display: 'flex', alignItems: 'center', gap: 12,
          background: `${COLORS.accent2}18`, border: `1px solid ${COLORS.accent2}55`,
          borderRadius: RADIUS.pill, padding: '9px 20px',
          opacity: cloneOp, transform: `scale(${cloneSc})`, transformOrigin: 'left center',
        }}>
          <Fingerprint size={24} color={COLORS.accent2} strokeWidth={2.2} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 2, color: COLORS.accent2 }}>CLONED</span>
        </div>
      </div>

      {/* "of me, or your brain, or you." */}
      <div style={{ position: 'absolute', left: 0, top: 762, width: 1920, display: 'flex', justifyContent: 'center', gap: 22 }}>
        {OWNERS.map((o) => {
          const op = r(frame, o.at, o.at + 14);
          const y = r(frame, o.at, o.at + 14, 18, 0);
          return (
            <div key={o.label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: COLORS.paper, border: `2px solid ${COLORS.accent}`,
              borderRadius: RADIUS.pill, boxShadow: SHADOW.soft, padding: '13px 32px',
              opacity: op, transform: `translateY(${y}px)`,
            }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 34, color: COLORS.ink }}>{o.label}</span>
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'absolute', left: 0, top: 852, width: 1920, textAlign: 'center',
        opacity: headOp, transform: `translateY(${headY}px)`,
      }}>
        <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: COLORS.ink }}>
          <span style={{ position: 'absolute', left: -8, right: -8, bottom: -8, height: 7, borderRadius: 4, background: COLORS.accent2, transform: `scaleX(${headWipe})`, transformOrigin: 'left' }} />
          <span style={{ position: 'relative' }}>Not any voice. Yours.</span>
        </span>
      </div>

      <LevelRail
        frame={frame}
        at={-30}
        slots={[{ n: 1, label: 'voice', at: -30 }, { n: 2, label: 'voice clone', at: F_CLONE }]}
      />
    </AbsoluteFill>
  );
};
export default B14L2VoiceClone;
