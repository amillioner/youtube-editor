import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { PhoneCall, User, Volume2, Fingerprint } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg } from '../../lib/kit';
import { GithubMark } from './_shared/marks';
import { BrainRepoCard, Connector, LevelRail, SimTag, Waveform, r } from './B14Kit';

// =============================================================================
// B14 · LEVEL 2b — you can phone it. Master span 819.796967 -> 827.596967 (7.80s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 819.796967) * 30).
//   "And now you can"       822.90 -> f3    the level-2 module widens into a call
//   "call"                  824.02 -> f37   the call connects + headline 1
//   "your brain"            824.26 -> f44   the callee is the repo
//   "voice chat"            825.32 -> f76   it becomes two-way
//   "with yourself,"        827.01 -> f126  the callee relabels: it is YOU
//   "with your own voice."  828.43 -> f169  both sides turn the cloned-voice hue
//   "Think about it."       829.64 -> f205  hold. nothing new lands on this line.
// The card GROWS out of the level-2 module rather than cutting to a new scene,
// so the two shots read as one continuous picture.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B14L2CallBrain', durationInSeconds: 7.8, fps: 30, width: 1920, height: 1080 };

const F_MORPH = 3;
const F_CALL = 37;
const F_CALLEE = 44;
const F_CHAT = 76;
const F_SELF = 126;
const F_OWN = 169;
const F_THINK = 205;

const B14L2CallBrain: React.FC = () => {
  const frame = useCurrentFrame();

  // the level-2 module widens into the call card
  const x = r(frame, F_MORPH, F_MORPH + 27, 600, 380, EASINGS.easeInOut);
  const w = r(frame, F_MORPH, F_MORPH + 27, 720, 1160, EASINGS.easeInOut);
  const y = r(frame, F_MORPH, F_MORPH + 27, 424, 402, EASINGS.easeInOut);
  const h = r(frame, F_MORPH, F_MORPH + 27, 300, 384, EASINGS.easeInOut);
  const oldOp = 1 - r(frame, F_MORPH, F_MORPH + 13, 0, 1, EASINGS.easeIn);
  const newOp = r(frame, F_MORPH + 17, F_MORPH + 31);

  const ring = 1 - Math.abs(Math.sin(frame * 0.14)) * 0.35;
  const connectOp = r(frame, F_CALL, F_CALL + 12);
  const calleeOp = r(frame, F_CALLEE, F_CALLEE + 14);
  const brainLabel = 1 - r(frame, F_SELF, F_SELF + 12, 0, 1, EASINGS.easeIn);
  const selfLabel = r(frame, F_SELF + 2, F_SELF + 16);
  const chatOp = r(frame, F_CHAT, F_CHAT + 14);
  const ownOp = r(frame, F_OWN, F_OWN + 16);
  const dim = 1 - r(frame, F_THINK, F_THINK + 20, 0, 0.18, EASINGS.easeInOut);

  // headline swap
  const h1 = r(frame, F_CALL, F_CALL + 14) * (1 - r(frame, F_SELF - 12, F_SELF - 2, 0, 1, EASINGS.easeIn));
  const h1y = r(frame, F_CALL, F_CALL + 14, 24, 0);
  const h2 = r(frame, F_SELF, F_SELF + 14);
  const h2y = r(frame, F_SELF, F_SELF + 14, 24, 0);

  const AV = 132; // avatar diameter

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <SimTag frame={frame} at={-30} />
      <BrainRepoCard frame={frame} at={-30} />
      <Connector frame={frame} at={-30} x={960} y1={358} y2={402} color={COLORS.accent} />

      <div style={{
        position: 'absolute', left: x, top: y, width: w, height: h,
        borderRadius: RADIUS.card, overflow: 'hidden',
        background: COLORS.paper, border: `2px solid ${COLORS.accent}`, boxShadow: SHADOW.card,
        opacity: dim,
      }}>
        {/* ---- what level 2a left on screen, fading out as the card widens ---- */}
        <div style={{ position: 'absolute', inset: 0, opacity: oldOp }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 30px 0' }}>
            <Volume2 size={34} color={COLORS.accent} strokeWidth={2.2} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 42, color: COLORS.ink }}>voice clone</span>
          </div>
          <Waveform frame={frame} at={-30} x={30} y={112} w={660} h={130} bars={38} color={COLORS.accent} />
        </div>

        {/* ---- the call ---- */}
        <div style={{ position: 'absolute', inset: 0, opacity: newOp }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 30px 0' }}>
            <div style={{ opacity: ring, display: 'flex' }}>
              <PhoneCall size={28} color={COLORS.accent} strokeWidth={2.3} />
            </div>
            <span style={{ fontFamily: FONT_MONO, fontSize: 25, letterSpacing: 2, color: COLORS.muted }}>VOICE CALL</span>
            <span style={{ marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 25, color: COLORS.signal, opacity: connectOp }}>
              connected
            </span>
          </div>

          {/* caller (you) */}
          <div style={{ position: 'absolute', left: 60, top: 118, width: 200, textAlign: 'center' }}>
            <div style={{ width: AV, height: AV, margin: '0 auto', borderRadius: '50%', background: `${COLORS.ink}12`, border: `2px solid ${COLORS.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={62} color={COLORS.ink} strokeWidth={1.9} />
            </div>
            <div style={{ marginTop: 14, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: COLORS.ink }}>you</div>
          </div>

          {/* callee (the repo -> you) */}
          <div style={{ position: 'absolute', right: 60, top: 118, width: 200, textAlign: 'center', opacity: calleeOp }}>
            <div style={{ width: AV, height: AV, margin: '0 auto', borderRadius: '50%', background: `${COLORS.accent}12`, border: `2px solid ${COLORS.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GithubMark size={60} color={COLORS.accent} />
            </div>
            <div style={{ position: 'relative', height: 44, marginTop: 14 }}>
              <span style={{ position: 'absolute', left: 0, right: 0, top: 0, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: COLORS.accent, opacity: brainLabel }}>your brain</span>
              <span style={{ position: 'absolute', left: 0, right: 0, top: 0, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: COLORS.accent, opacity: selfLabel }}>you</span>
            </div>
          </div>

          {/* two-way audio */}
          <div style={{ position: 'absolute', left: 300, top: 126, width: 560, height: 170, opacity: chatOp }}>
            <div style={{ position: 'absolute', inset: 0, opacity: 1 - ownOp }}>
              <Waveform frame={frame} at={F_CHAT} x={0} y={2} w={560} h={72} bars={30} color={COLORS.ink} />
              <Waveform frame={frame} at={F_CHAT + 8} x={0} y={94} w={560} h={72} bars={30} color={COLORS.accent} phase={2.1} />
            </div>
            <div style={{ position: 'absolute', inset: 0, opacity: ownOp }}>
              <Waveform frame={frame} at={F_CHAT} x={0} y={2} w={560} h={72} bars={30} color={COLORS.accent2} />
              <Waveform frame={frame} at={F_CHAT + 8} x={0} y={94} w={560} h={72} bars={30} color={COLORS.accent2} phase={2.1} />
            </div>
          </div>

          {/* "with your own voice." */}
          <div style={{
            position: 'absolute', left: '50%', bottom: 22, transform: 'translateX(-50%)',
            display: 'flex', alignItems: 'center', gap: 12,
            background: `${COLORS.accent2}18`, border: `1px solid ${COLORS.accent2}55`,
            borderRadius: RADIUS.pill, padding: '9px 24px', opacity: ownOp, whiteSpace: 'nowrap',
          }}>
            <Fingerprint size={24} color={COLORS.accent2} strokeWidth={2.2} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 2, color: COLORS.accent2 }}>YOUR OWN VOICE</span>
          </div>
        </div>
      </div>

      {/* headline swap */}
      <div style={{ position: 'absolute', left: 0, top: 812, width: 1920, textAlign: 'center', height: 96 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: h1, transform: `translateY(${h1y}px)`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: COLORS.ink }}>
          Call your brain.
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, opacity: h2, transform: `translateY(${h2y}px)`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: COLORS.ink }}>
          Voice chat with yourself.
        </div>
      </div>

      <LevelRail
        frame={frame}
        at={-30}
        slots={[{ n: 1, label: 'voice', at: -30 }, { n: 2, label: 'voice clone', at: -30 }]}
      />
    </AbsoluteFill>
  );
};
export default B14L2CallBrain;
