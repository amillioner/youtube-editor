import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { EqualNot } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B2b (3/3) — the self-disagreement paradox.
// Master span 185.432167 -> 191.832167 (6.4s). local frame = round((master_s - 185.432167) * 30)
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//
// "Like, sometimes I disagree with its answers, which is myself. That's really
// weird." The shot is ONE object: an inequality. It is built as a normal
// disagreement (me != its answers) and then the right-hand side is replaced by
// the left-hand side on the word "myself." — so the equation ends up reading
// me != me. Nothing else on screen has to explain the paradox.
//
// Cues: "sometimes" 187.27 -> f20   eyebrow
//       "I"         188.06 -> f44   left term "me"
//       "disagree"  188.13 -> f46   -> operator lands f50 (on its tail, once the
//                                      left term exists to disagree FROM)
//       "answers,"  189.08 -> f74   right term "its answers"
//       "myself."   190.78 -> f125  right term becomes "me"; both borders go
//                                   indigo and the brace labelled MYSELF closes
//                                   under the whole equation
//       "That's really" 191.74 -> f154
//       "weird."    192.28 -> f170  + pink underline wipe
// Both halves of the closing line hold their layout slot at opacity 0, so the
// centred sentence never shifts when "weird." arrives.
// =============================================================================
export const compositionConfig = {
  id: 'B2bDisagreeMyself',
  durationInSeconds: 6.4,
  fps: 30,
  width: 1920,
  height: 1080,
};

const EYEBROW = 20;
const LEFT = 44;
const OP = 50;
const RIGHT = 74;
const MERGE = 125;
const LINE = 154;
const WEIRD = 170;

const CARD_W = 620;
const CARD_H = 260;
const CARD_Y = 340;
const LX = 260;
const RX = 1040;

const B2bDisagreeMyself: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const merge = r(MERGE, MERGE + 14);
  const border = interpolateColors(frame, [MERGE, MERGE + 14], [COLORS.line, COLORS.accent]);
  const pop = interpolate(frame, [MERGE, MERGE + 10, MERGE + 24], [1, 1.03, 1], {
    ...CLAMP,
    easing: EASINGS.easeInOut,
  });

  const opOp = r(OP, OP + 12);
  const opScale = r(OP, OP + 14, 0.7, 1, EASINGS.overshoot);

  const braceOp = r(MERGE, MERGE + 14);
  const braceY = r(MERGE, MERGE + 14, 16, 0);

  const weirdWipe = r(WEIRD + 2, WEIRD + 14, 0, 1, EASINGS.easeInOut);

  const card = (at: number): React.CSSProperties => ({
    position: 'absolute',
    top: CARD_Y,
    width: CARD_W,
    height: CARD_H,
    background: COLORS.paper,
    border: `2px solid ${border}`,
    borderRadius: RADIUS.card,
    boxShadow: SHADOW.card,
    opacity: r(at, at + 14),
  });

  const term: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: FONT_DISPLAY,
    fontWeight: 700,
    fontSize: 80,
    letterSpacing: -1.5,
    color: COLORS.ink,
    whiteSpace: 'nowrap',
  };

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent2} />

      {/* eyebrow */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 208,
          textAlign: 'center',
          fontFamily: FONT_MONO,
          fontSize: 30,
          letterSpacing: 6,
          color: COLORS.muted,
          opacity: r(EYEBROW, EYEBROW + 14),
        }}
      >
        SOMETIMES
      </div>

      {/* left term */}
      <div
        style={{
          ...card(LEFT),
          left: LX,
          transform: `translateY(${r(LEFT, LEFT + 14, 24, 0)}px)`,
        }}
      >
        <div style={term}>me</div>
      </div>

      {/* the operator */}
      <div
        style={{
          position: 'absolute',
          left: LX + CARD_W,
          top: CARD_Y + CARD_H / 2 - 60,
          width: RX - (LX + CARD_W),
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: opOp,
          transform: `scale(${opScale})`,
        }}
      >
        <EqualNot size={104} color={COLORS.danger} strokeWidth={2.5} />
      </div>

      {/* right term — "its answers" is replaced by "me" on the word "myself." */}
      <div
        style={{
          ...card(RIGHT),
          left: RX,
          transform: `translateY(${r(RIGHT, RIGHT + 14, 24, 0)}px) scale(${pop})`,
        }}
      >
        <div style={{ ...term, opacity: 1 - merge }}>its answers</div>
        <div style={{ ...term, opacity: merge, color: COLORS.accent }}>me</div>
      </div>

      {/* the brace: both sides are the same person */}
      <div
        style={{
          position: 'absolute',
          left: LX,
          top: 664,
          width: RX + CARD_W - LX,
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          opacity: braceOp,
          transform: `translateY(${braceY}px)`,
        }}
      >
        <span style={{ width: 2, height: 26, background: `${COLORS.accent}99`, marginTop: -26 }} />
        <span style={{ flex: 1, height: 2, background: `${COLORS.accent}99` }} />
        <span
          style={{
            fontFamily: FONT_MONO,
            fontSize: 30,
            letterSpacing: 6,
            color: COLORS.accent,
            background: COLORS.paper,
            border: `1.5px solid ${COLORS.accent}55`,
            borderRadius: RADIUS.pill,
            boxShadow: SHADOW.soft,
            padding: '12px 34px',
            whiteSpace: 'nowrap',
          }}
        >
          MYSELF
        </span>
        <span style={{ flex: 1, height: 2, background: `${COLORS.accent}99` }} />
        <span style={{ width: 2, height: 26, background: `${COLORS.accent}99`, marginTop: -26 }} />
      </div>

      {/* the verdict */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 796,
          textAlign: 'center',
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 100,
          lineHeight: 1.12,
          letterSpacing: -2,
          color: COLORS.ink,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            opacity: r(LINE, LINE + 14),
            transform: `translateY(${r(LINE, LINE + 14, 20, 0)}px)`,
          }}
        >
          That&rsquo;s really
        </span>{' '}
        <span
          style={{
            display: 'inline-block',
            position: 'relative',
            opacity: r(WEIRD, WEIRD + 12),
            transform: `translateY(${r(WEIRD, WEIRD + 12, 20, 0)}px)`,
          }}
        >
          weird.
          <span
            style={{
              position: 'absolute',
              left: 0,
              right: 18,
              bottom: 4,
              height: 7,
              borderRadius: 4,
              background: COLORS.danger,
              transform: `scaleX(${weirdWipe})`,
              transformOrigin: 'left',
            }}
          />
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default B2bDisagreeMyself;
