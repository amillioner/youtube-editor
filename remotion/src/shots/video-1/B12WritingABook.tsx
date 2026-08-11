import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { BookOpen, PenLine, Search, Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B12 (1/3) — "it's not only for content": the book case, the one that gets a
// concrete payoff. Master span 733.996967 -> 749.596967 (local f = round((t-733.996967)*30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//
// Stage 1 (f0 -> f334) the claim
//   "a book"            738.08 -> f32   pill
//   "a novel"           738.99 -> f60   pill
//   "doing research"    740.34 -> f100  pill
//   "brain holds"       741.53 -> f136  headline
//   "your position"     743.15 -> f184  pill
//   "your beliefs"      744.27 -> f218  pill
//   "your examples"     745.07 -> f242  pill
//   "across whole"      746.28 -> f278  tail line ("pages." ends 748.09 -> f333)
// Stage 2 (f346 -> end) the proof — he names chapter 9 FIRST, so 9 lights first
//   "So chapter"        748.75 -> f346/352  spine + both chapter cards (ghosted)
//   "9"                 749.16 -> f365  chapter 9 activates
//   "doesn't contradict"750.29 -> f399  the arc draws 9 -> 1
//   "with chapter 1."   751.24 -> f427  chapter 1 activates, same three rows
//                                f440  the "no contradiction" badge lands
// The three rows inside each chapter card are the SAME three things he just
// listed (position / beliefs / examples) — that is why the chapters agree.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B12WritingABook', durationInSeconds: 15.6, fps: 30, width: 1920, height: 1080 };

const F_EYEBROW = 1;
const F_CASES = [32, 60, 100];
const F_HOLDS = 136;
const F_HELD = [184, 218, 242];
const F_PAGES = 278;
const F_EXIT = 334;
const F_STAGE2 = 346;
const F_CH9 = 365;
const F_ARC = 399;
const F_CH1 = 427;
const F_BADGE = 440;

const CASES = [
  { label: 'A book', Icon: BookOpen },
  { label: 'A novel', Icon: PenLine },
  { label: 'Research', Icon: Search },
];
const HELD = ['your position', 'your beliefs', 'your examples'];

// chapter card geometry
const CARD_W = 520;
const CARD_H = 328;
const CARD_Y = 400;
const CH1_CX = 470;
const CH9_CX = 1450;
const SPINE_Y = 872;
const ARC_PATH =
  'M 1450 400 L 1450 340 Q 1450 290 1400 290 L 520 290 Q 470 290 470 340 L 470 400';

const ChapterCard: React.FC<{ n: number; cx: number; at: number }> = ({ n, cx, at }) => {
  const frame = useCurrentFrame();
  const born = interpolate(frame, [F_STAGE2, F_STAGE2 + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const bornY = interpolate(frame, [F_STAGE2, F_STAGE2 + 14], [26, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const live = interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const border = interpolateColors(frame, [at, at + 12], [COLORS.line, COLORS.accent]);
  const titleColor = interpolateColors(frame, [at, at + 12], [COLORS.muted, COLORS.ink]);
  const pop = interpolate(frame, [at, at + 10, at + 22], [1, 1.03, 1], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <div
      style={{
        position: 'absolute', left: cx - CARD_W / 2, top: CARD_Y, width: CARD_W, height: CARD_H,
        boxSizing: 'border-box', padding: '34px 38px',
        background: COLORS.paper, border: `${1 + live}px solid ${border}`,
        borderRadius: RADIUS.card, boxShadow: SHADOW.card,
        opacity: born, transform: `translateY(${bornY}px) scale(${pop})`,
      }}
    >
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: titleColor }}>
        Chapter&nbsp;{n}
      </div>
      <div style={{ height: 2, background: COLORS.line, margin: '22px 0 24px' }} />
      {HELD.map((h, i) => {
        const s = at + i * 4;
        const op = interpolate(frame, [s, s + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
        const x = interpolate(frame, [s, s + 12], [-14, 0], { ...CLAMP, easing: EASINGS.easeOut });
        return (
          <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 16, height: 52, opacity: op, transform: `translateX(${x}px)` }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS.accent, flexShrink: 0 }} />
            <span style={{ fontSize: 34, color: COLORS.ink }}>{h}</span>
          </div>
        );
      })}
    </div>
  );
};

const B12WritingABook: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // stage 1 -> stage 2 handoff (fade + fall, brand.md §6)
  const s1Op = 1 - r(F_EXIT, F_EXIT + 10, 0, 1, EASINGS.easeIn);
  const s1Y = r(F_EXIT, F_EXIT + 12, 0, 26, EASINGS.easeIn);
  const s2Op = r(F_STAGE2, F_STAGE2 + 12);

  const arcProg = r(F_ARC, F_ARC + 22, 0, 1, EASINGS.easeInOut);
  const arrowOp = r(F_ARC + 18, F_ARC + 26);
  const badgeOp = r(F_BADGE, F_BADGE + 12);
  const badgeY = r(F_BADGE, F_BADGE + 12, 14, 0);

  const enter = (at: number, dist = 24) => ({
    opacity: r(at, at + 14),
    transform: `translateY(${r(at, at + 14, dist, 0)}px)`,
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* ================= stage 1 — the claim ================= */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: s1Op, transform: `translateY(${s1Y}px)` }}>
        <div style={{ ...enter(F_EYEBROW, 14), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 5, color: COLORS.accent, marginBottom: 38 }}>
          NOT&nbsp;ONLY&nbsp;FOR&nbsp;CONTENT
        </div>

        <div style={{ display: 'flex', gap: 22, marginBottom: 58 }}>
          {CASES.map((c, i) => (
            <div
              key={c.label}
              style={{
                ...enter(F_CASES[i]),
                display: 'flex', alignItems: 'center', gap: 16,
                background: COLORS.paper, border: `1px solid ${COLORS.line}`,
                borderRadius: RADIUS.pill, boxShadow: SHADOW.soft, padding: '18px 36px',
              }}
            >
              <c.Icon size={32} color={COLORS.muted} strokeWidth={2} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 40, color: COLORS.ink }}>{c.label}</span>
            </div>
          ))}
        </div>

        <div style={{ ...enter(F_HOLDS, 28), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 108, lineHeight: 1, color: COLORS.ink, marginBottom: 44 }}>
          Your brain holds
        </div>

        <div style={{ display: 'flex', gap: 22 }}>
          {HELD.map((h, i) => (
            <div
              key={h}
              style={{
                ...enter(F_HELD[i]),
                display: 'flex', alignItems: 'center', gap: 14,
                background: `${COLORS.accent}14`, border: `1px solid ${COLORS.accent}59`,
                borderRadius: RADIUS.pill, padding: '16px 34px',
              }}
            >
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS.accent }} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 38, color: COLORS.ink }}>{h}</span>
            </div>
          ))}
        </div>

        <div style={{ ...enter(F_PAGES, 16), fontSize: 38, color: COLORS.muted, marginTop: 40 }}>
          across whole pages
        </div>
      </AbsoluteFill>

      {/* ================= stage 2 — the proof ================= */}
      <AbsoluteFill style={{ opacity: s2Op }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 182, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 5, color: COLORS.muted }}>
          ACROSS&nbsp;THE&nbsp;WHOLE&nbsp;BOOK
        </div>

        {/* the arc: chapter 9 looks back at chapter 1 */}
        <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d={ARC_PATH} pathLength={1} fill="none" stroke={COLORS.accent} strokeWidth={5} strokeLinecap="round"
            strokeDasharray={1} strokeDashoffset={1 - arcProg} />
          <polygon points="457,376 483,376 470,402" fill={COLORS.accent} opacity={arrowOp} />
        </svg>

        <ChapterCard n={1} cx={CH1_CX} at={F_CH1} />
        <ChapterCard n={9} cx={CH9_CX} at={F_CH9} />

        {/* the badge sits ON the arc */}
        <div style={{
          position: 'absolute', left: 960, top: 290, transform: `translate(-50%, -50%) translateY(${badgeY}px)`,
          opacity: badgeOp, display: 'flex', alignItems: 'center', gap: 14,
          background: COLORS.paper, border: `2px solid ${COLORS.accent}`, borderRadius: RADIUS.pill,
          boxShadow: SHADOW.card, padding: '16px 34px',
        }}>
          <Check size={28} color={COLORS.accent} strokeWidth={3.2} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 38, color: COLORS.ink }}>no contradiction</span>
        </div>

        {/* the chapter spine */}
        <div style={{ position: 'absolute', left: CH1_CX, top: SPINE_Y - 2, width: CH9_CX - CH1_CX, height: 3, background: COLORS.line }} />
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n, i) => {
          const hot = n === 1 || n === 9;
          const at = n === 9 ? F_CH9 : n === 1 ? F_CH1 : 0;
          const glow = hot ? r(at, at + 12) : 0;
          return (
            <div key={n} style={{ position: 'absolute', left: CH1_CX + i * ((CH9_CX - CH1_CX) / 8), top: SPINE_Y, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <span style={{
                width: hot ? 22 : 14, height: hot ? 22 : 14, borderRadius: '50%',
                background: hot ? interpolateColors(glow, [0, 1], [COLORS.line, COLORS.accent]) : COLORS.line,
                border: `2px solid ${COLORS.paper}`,
              }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: hot ? interpolateColors(glow, [0, 1], [COLORS.muted, COLORS.accent]) : COLORS.muted }}>{n}</span>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default B12WritingABook;
