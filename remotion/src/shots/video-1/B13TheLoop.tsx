import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { BookOpen, Upload } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { Marker } from '../../lib/browser';

// =============================================================================
// B13 (2/2) — THE THESIS CARD. Master span 775.796967 -> 794.796967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local f = round((t-775.796967)*30)).
//
// The two halves are laid out as the two nodes of a cycle FROM THE START, so
// when the loop closes nothing has to move: the arcs simply arrive and shut the
// circuit around what is already on screen.
//   "Read"            778.92 -> f3    READ node
//   "always"          779.24 -> f13   indigo wipe on "always"
//   "feed"            780.05 -> f38   FEED node
//   "always."         780.44 -> f49   violet wipe on "always"
//   "before"          781.66 -> f86   READ line 1
//   "so it has you,"  783.41 -> f138  READ line 2
//   "after"           785.17 -> f191  FEED line 1
//   "so it keeps you."786.65 -> f235  FEED line 2
//   "That's"          787.90 -> f273  arc READ -> FEED draws
//   "loop."           788.30 -> f285  arc FEED -> READ draws; the circuit CLOSES
//                             f297    the circuit starts running (travelling dash)
//   "Run it for"      789.09 -> f309  the accumulation track appears
//   "1 month"         790.08 -> f338  30 cells start filling, one per ~7 frames
//   "or maybe less"   791.27 -> f374  "or less" is appended
//   "Nobody can copy" 793.29 -> f435  the payoff line
//   "nobody else"     795.12 -> f490  the reason
//   "your last month" 796.66 -> f536  indigo wipe on the reason
//
// He says ONE MONTH on the take, not a year — the grid is 30 cells for that
// reason. It stays inside the ring and never competes with it.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B13TheLoop', durationInSeconds: 19, fps: 30, width: 1920, height: 1080 };

const F_READ = 3;
const F_READ_ALWAYS = 13;
const F_FEED = 38;
const F_FEED_ALWAYS = 49;
const F_READ_L1 = 86;
const F_READ_L2 = 138;
const F_FEED_L1 = 191;
const F_FEED_L2 = 235;
const F_ARC_A = 273;
const F_ARC_B = 285;
const F_CLOSE = 297;
const F_TRACK = 309;
const F_GRID = 338;
const F_LESS = 374;
const F_COPY = 435;
const F_BECAUSE = 490;
const F_LASTMONTH = 536;

const CARD_W = 640;
const CARD_H = 380;
const CARD_TOP = 275;
const READ_X = 170;
const FEED_X = 1110;
const READ_CX = READ_X + CARD_W / 2; // 490
const FEED_CX = FEED_X + CARD_W / 2; // 1430

const ARC_A = 'M 490 275 L 490 215 Q 490 165 540 165 L 1380 165 Q 1430 165 1430 215 L 1430 275';
const ARC_B = 'M 1430 655 L 1430 715 Q 1430 765 1380 765 L 540 765 Q 490 765 490 715 L 490 655';

const CELLS = 30;
const CELL = 30;
const CELL_GAP = 10;
const CELL_STEP = 7.4;

const LoopNode: React.FC<{
  cx: number; color: string; Icon: React.FC<any>;
  verb: string; at: number; wipeAt: number;
  l1: string; l1At: number; l2: string; l2At: number;
}> = ({ cx, color, Icon, verb, at, wipeAt, l1, l1At, l2, l2At }) => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });
  const wipe = r(wipeAt, wipeAt + 12, 0, 1, EASINGS.easeInOut);

  return (
    <div style={{
      position: 'absolute', left: cx - CARD_W / 2, top: CARD_TOP, width: CARD_W, height: CARD_H,
      boxSizing: 'border-box', padding: 40,
      background: COLORS.paper, border: `2px solid ${color}`,
      borderRadius: RADIUS.card, boxShadow: SHADOW.card,
      opacity: r(at, at + 14), transform: `translateY(${r(at, at + 14, 26, 0)}px)`,
    }}>
      <Icon size={44} color={color} strokeWidth={2.1} />
      <div style={{ marginTop: 14, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 78, lineHeight: 1, color: COLORS.ink }}>
        {verb}{' '}
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{
            position: 'absolute', left: -9, right: -9, bottom: 6, height: 24, borderRadius: 6,
            background: `${color}59`, transform: `scaleX(${wipe})`, transformOrigin: 'left', zIndex: 0,
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>always.</span>
        </span>
      </div>
      <div style={{ marginTop: 26, fontSize: 36, lineHeight: 1.34, color: COLORS.muted }}>
        <div style={{ opacity: r(l1At, l1At + 14), transform: `translateY(${r(l1At, l1At + 14, 14, 0)}px)` }}>{l1}</div>
        <div style={{ opacity: r(l2At, l2At + 14), transform: `translateY(${r(l2At, l2At + 14, 14, 0)}px)`, color: COLORS.ink }}>{l2}</div>
      </div>
    </div>
  );
};

const B13TheLoop: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const arcA = r(F_ARC_A, F_ARC_A + 12, 0, 1, EASINGS.easeInOut);
  const arcB = r(F_ARC_B, F_ARC_B + 12, 0, 1, EASINGS.easeInOut);
  const arrowA = r(F_ARC_A + 9, F_ARC_A + 15);
  const arrowB = r(F_ARC_B + 9, F_ARC_B + 15);

  // the circuit runs: one travelling dash per arc, half a period apart, so it
  // reads as a single thing going round. Frame-derived, fully deterministic.
  const t = Math.max(0, frame - F_CLOSE);
  const runOp = r(F_CLOSE, F_CLOSE + 12, 0, 0.9);
  const phaseA = (t % 66) / 66;
  const phaseB = ((t + 33) % 66) / 66;

  // the close is felt, not announced: one soft glow pulse on the ring
  const pulse = interpolate(frame, [F_ARC_B + 10, F_ARC_B + 22, F_ARC_B + 46], [0, 0.5, 0], { ...CLAMP, easing: EASINGS.easeInOut });

  const gridOp = r(F_TRACK, F_TRACK + 14);
  const gridY = r(F_TRACK, F_TRACK + 14, 16, 0);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{
        position: 'absolute', left: 0, right: 0, top: 88, textAlign: 'center',
        opacity: r(F_READ, F_READ + 14), transform: `translateY(${r(F_READ, F_READ + 14, 14, 0)}px)`,
        fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 6, color: COLORS.accent,
      }}>
        THE&nbsp;RULE
      </div>

      {/* ================= the circuit ================= */}
      <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
        <defs>
          <linearGradient id="loopA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COLORS.accent} />
            <stop offset="100%" stopColor={COLORS.accent2} />
          </linearGradient>
          <linearGradient id="loopB" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor={COLORS.accent2} />
            <stop offset="100%" stopColor={COLORS.accent} />
          </linearGradient>
        </defs>

        {/* the track the circuit will close along — scaffolding, not a claim */}
        <path d={ARC_A} fill="none" stroke={COLORS.line} strokeWidth={5} strokeLinecap="round" opacity={r(F_READ_L1, F_READ_L1 + 20, 0, 0.9)} />
        <path d={ARC_B} fill="none" stroke={COLORS.line} strokeWidth={5} strokeLinecap="round" opacity={r(F_READ_L1, F_READ_L1 + 20, 0, 0.9)} />

        {/* glow pulse on close */}
        <path d={ARC_A} pathLength={1} fill="none" stroke={COLORS.accent} strokeWidth={16} strokeLinecap="round" opacity={pulse * 0.25} />
        <path d={ARC_B} pathLength={1} fill="none" stroke={COLORS.accent2} strokeWidth={16} strokeLinecap="round" opacity={pulse * 0.25} />

        <path d={ARC_A} pathLength={1} fill="none" stroke="url(#loopA)" strokeWidth={5} strokeLinecap="round"
          strokeDasharray={1} strokeDashoffset={1 - arcA} />
        <path d={ARC_B} pathLength={1} fill="none" stroke="url(#loopB)" strokeWidth={5} strokeLinecap="round"
          strokeDasharray={1} strokeDashoffset={1 - arcB} />

        {/* the circuit running */}
        <path d={ARC_A} pathLength={1} fill="none" stroke={COLORS.paper} strokeWidth={9} strokeLinecap="round"
          strokeDasharray="0.1 0.9" strokeDashoffset={-phaseA} opacity={runOp * 0.85} />
        <path d={ARC_A} pathLength={1} fill="none" stroke={COLORS.accent} strokeWidth={5} strokeLinecap="round"
          strokeDasharray="0.1 0.9" strokeDashoffset={-phaseA} opacity={runOp} />
        <path d={ARC_B} pathLength={1} fill="none" stroke={COLORS.paper} strokeWidth={9} strokeLinecap="round"
          strokeDasharray="0.1 0.9" strokeDashoffset={-phaseB} opacity={runOp * 0.85} />
        <path d={ARC_B} pathLength={1} fill="none" stroke={COLORS.accent2} strokeWidth={5} strokeLinecap="round"
          strokeDasharray="0.1 0.9" strokeDashoffset={-phaseB} opacity={runOp} />

        <polygon points="1417,251 1443,251 1430,277" fill={COLORS.accent2} opacity={arrowA} />
        <polygon points="477,679 503,679 490,653" fill={COLORS.accent} opacity={arrowB} />
      </svg>

      {/* ================= the two halves of the rule ================= */}
      <LoopNode
        cx={READ_CX} color={COLORS.accent} Icon={BookOpen} verb="Read"
        at={F_READ} wipeAt={F_READ_ALWAYS}
        l1="before it writes," l1At={F_READ_L1}
        l2="so it has you" l2At={F_READ_L2}
      />
      <LoopNode
        cx={FEED_CX} color={COLORS.accent2} Icon={Upload} verb="Feed"
        at={F_FEED} wipeAt={F_FEED_ALWAYS}
        l1="after you learn something," l1At={F_FEED_L1}
        l2="so it keeps you" l2At={F_FEED_L2}
      />

      {/* ================= inside the ring: what it accumulates ================= */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 314, textAlign: 'center',
        opacity: r(F_ARC_B, F_ARC_B + 12), transform: `translateY(${r(F_ARC_B, F_ARC_B + 12, 12, 0)}px)`,
        fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 5, color: COLORS.accent,
      }}>
        THE&nbsp;LOOP
      </div>

      <div style={{
        position: 'absolute', left: 960, top: 458, transform: `translate(-50%, -50%) translateY(${gridY}px)`,
        opacity: gridOp,
        display: 'grid', gridTemplateColumns: `repeat(6, ${CELL}px)`, gap: CELL_GAP,
      }}>
        {Array.from({ length: CELLS }).map((_, i) => {
          const s = F_GRID + i * CELL_STEP;
          return (
            <div key={i} style={{
              width: CELL, height: CELL, borderRadius: 7,
              background: interpolateColors(frame, [s, s + 8], [`${COLORS.accent}1f`, COLORS.accent]),
            }} />
          );
        })}
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, top: 572, textAlign: 'center',
        opacity: r(F_GRID, F_GRID + 12), fontFamily: FONT_MONO, fontSize: 24, color: COLORS.ink,
      }}>
        1&nbsp;month
        <span style={{ opacity: r(F_LESS, F_LESS + 12), color: COLORS.muted }}>&nbsp;or&nbsp;less</span>
      </div>

      {/* ================= the payoff ================= */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 828, textAlign: 'center',
        opacity: r(F_COPY, F_COPY + 14), transform: `translateY(${r(F_COPY, F_COPY + 14, 24, 0)}px)`,
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 78, lineHeight: 1, color: COLORS.ink,
      }}>
        Nobody can copy this.
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, top: 940, textAlign: 'center',
        opacity: r(F_BECAUSE, F_BECAUSE + 14), transform: `translateY(${r(F_BECAUSE, F_BECAUSE + 14, 16, 0)}px)`,
        fontSize: 40, color: COLORS.muted,
      }}>
        because nobody else has{' '}
        <Marker start={F_LASTMONTH} color={`${COLORS.accent}3d`} pad={10} radius={8}>
          <span style={{ color: COLORS.ink, fontWeight: 600 }}>your last month</span>
        </Marker>
      </div>
    </AbsoluteFill>
  );
};
export default B13TheLoop;
