import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg } from '../../lib/kit';
import { TwoHeads } from './_shared/TwoHeads';
import { CARD_H, CARD_TOP_PARKED, CARD_W, CARD_X, LEVELS, LevelCard, SimTag, r } from './B14Kit';

// =============================================================================
// B14 · ★ the payoff. The B3 diagram returns UNDERNEATH all five levels.
// Master span 866.596967 -> 880.696967 (14.10s). Local frame = round((master - 866.596967) * 30).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//   "underneath,"                869.62 -> f1    (cards are already parked here,
//                                                 handed over from B14Simulated)
//   "the folder underneath,"     870.70 -> f33   the brain repo rises under them
//   "the project underneath"     872.29 -> f81   five wires converge into it
//   "is real,"                   873.75 -> f125  the simulated/real line is drawn
//                                                and the REAL half (the B3
//                                                two-heads diagram) builds out
//   "in the same folder"         876.48 -> f206  the caption lands
//   "powering"                   878.14 -> f256  power pulses run root -> levels
//   "all"                        878.93 -> f280  accent wipe under "all five"
//   "could be real one day."     881.42 -> f355  a soft maybe behind the row.
//                                                The warn borders and the tag do
//                                                NOT soften: still not built.
// The diagram is the real _shared/TwoHeads.tsx from B3, driven with its cues so
// the geometry is identical to 228.60. Scaled about the root card's top edge, so
// the root lands exactly where the five wires converge.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B14SameFolder', durationInSeconds: 14.1, fps: 30, width: 1920, height: 1080 };

const F_ROOT = 33;
const F_WIRE = 81;
const F_REAL = 125;
const F_CAPTION = 206;
const F_POWER = 256;
const F_ALL = 280;
const F_ONEDAY = 355;

const HEADS_TOP = 396;
const HEADS_SCALE = 0.92;
const CARDS_BOTTOM = CARD_TOP_PARKED + CARD_H; // 272
const ROOT_PT = { x: 960, y: HEADS_TOP };

const B14SameFolder: React.FC = () => {
  const frame = useCurrentFrame();

  const realOp = r(frame, F_REAL, F_REAL + 14);
  const capOp = r(frame, F_CAPTION, F_CAPTION + 14);
  const capY = r(frame, F_CAPTION, F_CAPTION + 14, 24, 0);
  const allWipe = r(frame, F_ALL, F_ALL + 12);
  const maybe = r(frame, F_ONEDAY, F_ONEDAY + 26, 0, 1, EASINGS.easeInOut);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* "could be real one day" — a soft maybe behind the simulated row */}
      <div style={{
        position: 'absolute', left: CARD_X(0) - 60, top: CARD_TOP_PARKED - 60,
        width: CARD_X(4) + CARD_W - CARD_X(0) + 120, height: CARD_H + 120,
        borderRadius: 60, background: `radial-gradient(closest-side, ${COLORS.accent}26, transparent 72%)`,
        opacity: maybe,
      }} />

      {LEVELS.map((l, i) => (
        <LevelCard key={l.n} frame={frame} at={-30} n={l.n} label={l.label} x={CARD_X(i)} y={CARD_TOP_PARKED} sim={1} />
      ))}

      {/* five wires converging into the one repo */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        {LEVELS.map((l, i) => {
          const cx = CARD_X(i) + CARD_W / 2;
          const at = F_WIRE + i * 3;
          if (frame < at) return null;
          const len = Math.hypot(ROOT_PT.x - cx, ROOT_PT.y - CARDS_BOTTOM);
          const d = r(frame, at, at + 18, 0, 1, EASINGS.easeInOut);
          return (
            <line
              key={l.n} x1={cx} y1={CARDS_BOTTOM} x2={ROOT_PT.x} y2={ROOT_PT.y}
              stroke={COLORS.accent} strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round"
              strokeDasharray={len} strokeDashoffset={len * (1 - d)}
            />
          );
        })}
        {/* power pulses: the one folder driving all five */}
        {frame >= F_POWER && LEVELS.map((l, i) => {
          const cx = CARD_X(i) + CARD_W / 2;
          const t = (((frame - F_POWER) + i * 9) % 46) / 46;
          const px = ROOT_PT.x + (cx - ROOT_PT.x) * t;
          const py = ROOT_PT.y + (CARDS_BOTTOM - ROOT_PT.y) * t;
          return <circle key={`p${l.n}`} cx={px} cy={py} r={9} fill={COLORS.accent} opacity={Math.sin(t * Math.PI) * 0.9} />;
        })}
      </svg>

      {/* the simulated / real line */}
      <div style={{ position: 'absolute', left: 120, top: 330, width: 1680, opacity: realOp }}>
        <div style={{ height: 2, width: '100%', background: COLORS.line }} />
        <div style={{ position: 'absolute', left: 0, top: -44, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 4, color: COLORS.warn }}>SIMULATED</span>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 4, color: COLORS.signal }}>REAL</span>
        </div>
      </div>

      {/* ★ the B3 diagram, returning underneath all five levels */}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${HEADS_SCALE})`, transformOrigin: `${ROOT_PT.x}px ${ROOT_PT.y}px` }}>
        <TwoHeads
          frame={frame}
          top={HEADS_TOP}
          rootAt={F_ROOT}
          splitAt={F_REAL}
          localAt={F_REAL + 14}
          localSubAt={F_REAL + 26}
          localPillAt={F_REAL + 34}
          onlineAt={F_REAL + 22}
          onlineSubAt={F_REAL + 34}
          onlinePillAt={F_REAL + 42}
        />
      </div>

      {/* "the same project in the same folder" */}
      <div style={{
        position: 'absolute', left: 0, top: 906, width: 1920, textAlign: 'center',
        opacity: capOp, transform: `translateY(${capY}px)`,
      }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, color: COLORS.ink }}>
          The same folder in{' '}
          <span style={{ position: 'relative', display: 'inline-block', color: COLORS.accent }}>
            <span style={{ position: 'absolute', left: -8, right: -8, bottom: -8, height: 8, borderRadius: RADIUS.pill, background: COLORS.accent, transform: `scaleX(${allWipe})`, transformOrigin: 'left' }} />
            <span style={{ position: 'relative' }}>all five.</span>
          </span>
        </span>
      </div>

      <SimTag frame={frame} at={-30} />
    </AbsoluteFill>
  );
};
export default B14SameFolder;
