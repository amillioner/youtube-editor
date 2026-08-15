import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { Check, X } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';
import { FactoryLine, CORAL } from './_shared/FactoryLine';

// ============================================================================
// B5b · step 2 · DISCOVER — ROUND-5: the real keyword table (briefed vs winning,
// honesty gate, THAT'S A FEATURE stamp) re-laid for the top half; the factory
// band advances the piece to station 2 on the beat boundary.
// Master span 290.5 -> 335.2 (44.7s). local f = round((master_s - 290.5) * 30).
// Cues: "target self-host Supabase" 293.477->f89 (briefed rows) ·
// "740 searches" 296.538->f181 · "Supabase self-host" 301.047->f316 (winning) ·
// "1,100" 304.387->f417 (cluster) · "3 times bigger" 306.731->f487 (badge) ·
// "really honest" 314.823->f730 (gate) · "topic is weak" 322.803->f969 ·
// "die at step 1" 332.260->f1253 · "that's a feature" 333.945->f1303
// ============================================================================
export const compositionConfig = { id: 'B5bDiscovery', durationInSeconds: 44.7, fps: 30, width: 1920, height: 1080 };

const HEAD = 12;
const BRIEFED = 89;
const WINNING = 316;
const CLUSTER = 417;
const BADGE = 487;
const GATE = 730;
const WEAK = 969;
const DIES = 1253;
const FEATURE = 1303;

const ROWS: readonly (readonly [string, string, number, 'briefed' | 'winning'])[] = [
  ['self host supabase', '320 / mo', BRIEFED, 'briefed'],
  ['self hosted supabase', '320 / mo', BRIEFED + 10, 'briefed'],
  ['supabase self host', '590 / mo', WINNING, 'winning'],
  ['supabase self hosted', '590 / mo', WINNING + 10, 'winning'],
];

const B5bDiscovery: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const at = (s: number, dy = 14) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  const stamp = interpolate(frame, [FEATURE, FEATURE + 9], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      {/* header — compact, left */}
      <div style={{ position: 'absolute', left: 64, top: 26 }}>
        <div style={{ ...rise(HEAD, 12), fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 3, color: CORAL }}>STEP&nbsp;2&nbsp;·&nbsp;DISCOVER</div>
        <div style={{ ...rise(HEAD + 12), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink, marginTop: 4 }}>
          the data moved the target
        </div>
      </div>
      {/* real keyword table — left */}
      <div style={{ ...rise(BRIEFED - 14, 16), position: 'absolute', left: 60, top: 148, width: 740, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '20px 28px' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 1.5, color: COLORS.muted, paddingBottom: 10, borderBottom: `1px solid ${COLORS.line}`, display: 'flex' }}>
          <span style={{ flex: 1 }}>KEYWORD</span><span>VOLUME</span>
        </div>
        {ROWS.map(([kw, vol, s, kind]) => (
          <div key={kw} style={{ ...at(s), display: 'flex', alignItems: 'center', padding: '11px 2px', borderBottom: `1px solid ${COLORS.cream}` }}>
            <span style={{ flex: 1, fontFamily: FONT_MONO, fontSize: 23, color: COLORS.ink }}>{kw}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 23, fontWeight: 700, color: kind === 'winning' ? COLORS.accent : COLORS.muted }}>{vol}</span>
          </div>
        ))}
        <div style={{ ...at(CLUSTER), display: 'flex', alignItems: 'center', padding: '13px 2px 2px' }}>
          <span style={{ flex: 1, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 25, color: COLORS.ink }}>full cluster</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 25, fontWeight: 700, color: COLORS.accent }}>≈ 1,900 / mo</span>
        </div>
      </div>
      {/* 3x badge — right, on its cue */}
      <div style={{ ...at(BADGE, 16), position: 'absolute', left: 850, top: 148, width: 460, boxSizing: 'border-box', background: COLORS.paper, border: `2px solid ${COLORS.accent}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '18px 26px', textAlign: 'center' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: COLORS.accent }}>3×</span>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 27, color: COLORS.ink }}>&nbsp;bigger than the brief</span>
      </div>
      {/* the honesty gate — right, below the badge */}
      <div style={{ ...at(GATE, 16), position: 'absolute', left: 850, top: 296, width: 1010, boxSizing: 'border-box', background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '22px 30px' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 1.5, color: COLORS.muted, marginBottom: 14 }}>THE&nbsp;HONESTY&nbsp;GATE</div>
        <div style={{ ...at(GATE + 14), display: 'flex', alignItems: 'center', gap: 12, fontSize: 25, color: COLORS.ink, marginBottom: 12 }}>
          <Check size={25} color={COLORS.signal} strokeWidth={2.6} /> real gap found → it writes
        </div>
        <div style={{ ...at(WEAK), display: 'flex', alignItems: 'center', gap: 12, fontSize: 25, color: COLORS.ink }}>
          <X size={25} color={COLORS.danger} strokeWidth={2.6} /> no gap → <span style={{ fontFamily: FONT_MONO, background: `${COLORS.danger}1a`, color: COLORS.danger, padding: '4px 12px', borderRadius: 8 }}>"the topic is weak"</span>
        </div>
        <div style={{ ...at(DIES), fontSize: 23, color: COLORS.muted, marginTop: 12, paddingLeft: 37 }}>the idea dies at step 1, before anything is written</div>
      </div>
      {/* the stamp */}
      <div style={{ position: 'absolute', left: 1210, top: 520, opacity: stamp, transform: `rotate(-4deg) scale(${0.75 + 0.25 * stamp})` }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, letterSpacing: 2, color: COLORS.signal, border: `4px solid ${COLORS.signal}`, borderRadius: 12, padding: '6px 22px', background: `${COLORS.paper}e6`, whiteSpace: 'nowrap' }}>THAT'S A FEATURE</span>
      </div>
      {/* the factory — belt advances the piece to station 2 */}
      <FactoryLine station={1} pieceFrom={0} advanceAt={0} />
    </AbsoluteFill>
  );
};

export default B5bDiscovery;
