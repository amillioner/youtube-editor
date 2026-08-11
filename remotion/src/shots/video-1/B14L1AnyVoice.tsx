import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Check, Volume2, Plus } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg } from '../../lib/kit';
import { BrainRepoCard, BRAIN_CARD, Connector, LevelRail, SimTag, Waveform, r } from './B14Kit';

// =============================================================================
// B14 · LEVEL 1 — a voice. Master span 806.296967 -> 813.596967 (7.30s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 806.296967) * 30).
//   "It can write like you," 809.35 -> f2    what it already does (teal, shipped)
//   "but"                    810.86 -> f47   the empty module slot appears
//   "add"                    812.46 -> f95   the slot starts filling
//   "a voice?"               812.98 -> f110  it becomes a VOICE module + rail 1
//   "Any voice."             813.92 -> f139  the voice name cycles: any of them
//   "Your brain can talk."   814.81 -> f165  the waveform goes live + headline
// ★ The SIMULATED tag rises at f2 (809.35) and does not leave the screen again
//   until 883.7. Everything from here down is a roadmap, not a shipped feature.
// The repo card is at the shared BRAIN_CARD geometry and is already drawn at
// frame 0, so the cut from B14TodayItsText reads as one continuous image.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B14L1AnyVoice', durationInSeconds: 7.3, fps: 30, width: 1920, height: 1080 };

const F_TAG = 2;
const F_WRITES = 2;
const F_SLOT = 47;
const F_FILL = 95;
const F_VOICE = 110;
const F_ANY = 139;
const F_TALK = 165;

const MOD = { x: 600, y: 424, w: 720, h: 300 };
const VOICES = ['voice: alloy', 'voice: nova', 'voice: onyx'];

const B14L1AnyVoice: React.FC = () => {
  const frame = useCurrentFrame();

  const writesOp = r(frame, F_WRITES, F_WRITES + 14);
  const writesY = r(frame, F_WRITES, F_WRITES + 14, 18, 0);
  const slotOp = r(frame, F_SLOT, F_SLOT + 14);
  const ghostOut = 1 - r(frame, F_FILL - 4, F_FILL + 10, 0, 1, EASINGS.easeIn);
  const modOp = r(frame, F_FILL, F_FILL + 14);
  const modSc = r(frame, F_FILL, F_FILL + 18, 0.97, 1);
  const nameIdx = frame < F_ANY ? 0 : Math.min(2, Math.floor((frame - F_ANY) / 11) % 3);
  const anyOp = r(frame, F_ANY, F_ANY + 12);
  const headOp = r(frame, F_TALK, F_TALK + 14);
  const headY = r(frame, F_TALK, F_TALK + 14, 26, 0);
  const headWipe = r(frame, F_TALK + 4, F_TALK + 16);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <SimTag frame={frame} at={F_TAG} />

      <BrainRepoCard frame={frame} at={-30} />

      {/* what it already does */}
      <div style={{
        position: 'absolute', left: BRAIN_CARD.x, top: BRAIN_CARD.y + BRAIN_CARD.h + 18, width: BRAIN_CARD.w,
        display: 'flex', justifyContent: 'center',
        opacity: writesOp, transform: `translateY(${writesY}px)`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: `${COLORS.signal}14`, border: `1px solid ${COLORS.signal}44`,
          borderRadius: RADIUS.pill, padding: '10px 24px',
        }}>
          <Check size={22} color={COLORS.signal} strokeWidth={3} />
          <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 28, color: COLORS.ink }}>writes like you</span>
        </div>
      </div>

      <Connector frame={frame} at={F_SLOT} x={960} y1={358} y2={MOD.y} color={COLORS.accent} />

      {/* the empty module slot -> the VOICE module */}
      <div style={{ position: 'absolute', left: MOD.x, top: MOD.y, width: MOD.w, height: MOD.h }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: RADIUS.card,
          border: `2px dashed ${COLORS.muted}55`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          opacity: slotOp * ghostOut,
        }}>
          <Plus size={64} color={`${COLORS.muted}66`} strokeWidth={2.4} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: `${COLORS.muted}aa` }}>add</span>
        </div>

        <div style={{
          position: 'absolute', inset: 0, borderRadius: RADIUS.card, overflow: 'hidden',
          background: COLORS.paper, border: `2px solid ${COLORS.accent}`, boxShadow: SHADOW.card,
          opacity: modOp, transform: `scale(${modSc})`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 30px 0' }}>
            <Volume2 size={34} color={COLORS.accent} strokeWidth={2.2} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 42, color: COLORS.ink }}>voice</span>
            <div style={{ marginLeft: 'auto', position: 'relative', width: 260, height: 34 }}>
              <span style={{ position: 'absolute', right: 0, top: 0, fontFamily: FONT_MONO, fontSize: 26, color: COLORS.muted, whiteSpace: 'nowrap' }}>
                {VOICES[nameIdx]}
              </span>
            </div>
          </div>
          <Waveform frame={frame} at={F_VOICE} liveAt={F_TALK} x={30} y={112} w={660} h={130} bars={38} color={COLORS.accent} />
          <div style={{
            position: 'absolute', left: 30, bottom: 22, display: 'flex', alignItems: 'center', gap: 10,
            opacity: anyOp,
          }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 2, color: COLORS.accent2 }}>ANY VOICE</span>
          </div>
        </div>
      </div>

      {/* "Your brain can talk." */}
      <div style={{
        position: 'absolute', left: 0, top: 776, width: 1920, textAlign: 'center',
        opacity: headOp, transform: `translateY(${headY}px)`,
      }}>
        <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 82, color: COLORS.ink }}>
          <span style={{ position: 'absolute', left: -8, right: -8, bottom: -10, height: 8, borderRadius: 4, background: COLORS.accent, transform: `scaleX(${headWipe})`, transformOrigin: 'left' }} />
          <span style={{ position: 'relative' }}>Your brain can talk.</span>
        </span>
      </div>

      <LevelRail frame={frame} at={F_VOICE} slots={[{ n: 1, label: 'voice', at: F_VOICE }]} />
    </AbsoluteFill>
  );
};
export default B14L1AnyVoice;
