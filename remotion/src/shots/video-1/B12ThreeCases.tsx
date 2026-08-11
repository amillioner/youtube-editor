import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { BookOpen, GraduationCap, Blocks, Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B12 (2/3) — the three-up. Same shape, three kinds of work.
// Master span 749.596967 -> 758.996967 (local f = round((t-749.596967)*30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//   f0                       the book column is ALREADY resolved (it carries
//                            straight out of B12WritingABook) and sits dimmed,
//                            so the eye goes to the two that are still arriving
//   "a course,"   753.10 -> f15   column 2 header
//   "explain"     754.78 -> f65   column 2 payoff
//   "anything"    757.09 -> f135  column 3 header
//   "your decisions" 759.84 -> f217  column 3 payoff
//   "already made,"  761.30 -> f261  indigo underline wipe on the payoff
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B12ThreeCases', durationInSeconds: 9.4, fps: 30, width: 1920, height: 1080 };

const F_COURSE = 15;
const F_EXPLAIN = 65;
const F_BUILD = 135;
const F_DECISIONS = 217;
const F_MADE = 261;

const COLS = [
  {
    key: 'book', title: 'A book', Icon: BookOpen, at: -1, bodyAt: -1,
    body: 'Chapter 9 agrees with chapter 1', done: true,
  },
  {
    key: 'course', title: 'A course', Icon: GraduationCap, at: F_COURSE, bodyAt: F_EXPLAIN,
    body: 'How you explain things', done: false,
  },
  {
    key: 'build', title: 'Anything you build with AI', Icon: Blocks, at: F_BUILD, bodyAt: F_DECISIONS,
    body: 'The decisions you already made', done: false,
  },
];

const COL_W = 520;
const COL_H = 470;
const COL_TOP = 330;
const GAP = 60;
const LEFT0 = (1920 - (COL_W * 3 + GAP * 2)) / 2; // 120

const B12ThreeCases: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const madeWipe = r(F_MADE, F_MADE + 12, 0, 1, EASINGS.easeInOut);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{
        position: 'absolute', left: 0, right: 0, top: 244, textAlign: 'center',
        opacity: r(0, 12), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 5, color: COLORS.accent,
      }}>
        NOT&nbsp;ONLY&nbsp;FOR&nbsp;CONTENT
      </div>

      {COLS.map((c, i) => {
        const op = c.done ? 0.62 : r(c.at, c.at + 14);
        const y = c.done ? 0 : r(c.at, c.at + 14, 26, 0);
        const bodyOp = c.done ? 1 : r(c.bodyAt, c.bodyAt + 14);
        const bodyY = c.done ? 0 : r(c.bodyAt, c.bodyAt + 14, 18, 0);
        const live = c.done ? 1 : r(c.bodyAt, c.bodyAt + 12);
        return (
          <div
            key={c.key}
            style={{
              position: 'absolute', left: LEFT0 + i * (COL_W + GAP), top: COL_TOP,
              width: COL_W, height: COL_H, boxSizing: 'border-box', padding: '40px 38px',
              display: 'flex', flexDirection: 'column',
              background: COLORS.paper, border: `${1 + live}px solid ${live > 0.5 ? COLORS.accent : COLORS.line}`,
              borderRadius: RADIUS.card, boxShadow: SHADOW.card,
              opacity: op, transform: `translateY(${y}px)`,
            }}
          >
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: `${COLORS.accent}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }}>
              <c.Icon size={42} color={COLORS.accent} strokeWidth={2} />
            </div>

            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 46, lineHeight: 1.14, color: COLORS.ink }}>
              {c.title}
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ fontFamily: FONT_MONO, fontSize: 21, letterSpacing: 3, color: COLORS.muted, marginBottom: 16, opacity: bodyOp }}>
              IT&nbsp;HOLDS
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, opacity: bodyOp, transform: `translateY(${bodyY}px)` }}>
              {c.done && <Check size={28} color={COLORS.accent} strokeWidth={3} style={{ marginTop: 8, flexShrink: 0 }} />}
              <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 36, lineHeight: 1.24, color: COLORS.ink }}>
                {c.body}
                {c.key === 'build' && (
                  <span style={{
                    position: 'absolute', left: 0, right: 0, bottom: -8, height: 6, borderRadius: 3,
                    background: COLORS.accent, transform: `scaleX(${madeWipe})`, transformOrigin: 'left',
                  }} />
                )}
              </span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
export default B12ThreeCases;
