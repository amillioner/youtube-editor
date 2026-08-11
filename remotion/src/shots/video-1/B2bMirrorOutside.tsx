import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { User, Check, AlertCircle } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { Marker } from '../../lib/browser';

// =============================================================================
// B2b (2/3) — "my mirror outside", and what the mirror does.
// Master span 170.032167 -> 181.732167 (11.7s). local frame = round((master_s - 170.032167) * 30)
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//
// The hero beat of this range: the product's own metaphor landing as a picture.
// B2NameLockup already spelled BrainOutside, so this shot never re-renders the
// wordmark — it EARNS the second half of the name instead. One object, mirrored
// across a seam: "me" on the left, the reflection labelled "outside" on the
// right. Everything after is the same diagram gaining state, never a new screen.
//
// Cues: "think"    171.79 -> f18   eyebrow
//       "my"       172.66 -> f44   left card ("me")
//       "mirror"   172.83 -> f49   the seam draws + "my mirror" in the hero
//       "outside." 173.30 -> f63   the reflection rises + "outside" (accent + wipe)
//       "it"       175.22 -> f121  left bubble "I can ask it" (held to the LAST
//                                  word of the phrase so nothing is pre-empted)
//       "answers"  176.74 -> f166  right bubble "it answers"
//       "like"     177.32 -> f184  "like me" fades in (slot reserved, no reflow)
//       "me,"      177.64 -> f193  accent marker under "like me"
//       "useful"   178.75 -> f227  teal verdict pill
//       "days"     179.95 -> f263  its mono caption
//       "sometimes" 180.83 -> f289 the second verdict's caption arrives ALONE
//       "becomes"  181.49 -> f309  the reflection starts to drift out of register
//       "strange"  181.95 -> f323  pink verdict pill lands on the drift
//
// Both bubbles are SHELLS from the moment their card arrives, holding resting
// dots until their line is spoken — otherwise the right card sits blank for 3.4s
// between "outside." and "answers", which read as a dead panel on the first pass.
// The "strange" payoff is a mis-registration, not a glitch: the mirrored card
// slides ~18px off its own outline and its border warms to pink. Calm-premium
// (brand.md §6) — no shake, no noise, one readable event.
// =============================================================================
export const compositionConfig = {
  id: 'B2bMirrorOutside',
  durationInSeconds: 11.7,
  fps: 30,
  width: 1920,
  height: 1080,
};

const EYEBROW = 18;
const CARD_L = 44;
const MIRROR = 49;
const OUTSIDE = 63;
const ASK = 121;
const ANSWERS = 166;
const LIKE = 184;
const ME_W = 193;
const USEFUL = 227;
const DAYS = 263;
const SOMETIMES = 289;
const BECOMES = 309;
const STRANGE = 323;

const CARD_W = 700;
const CARD_H = 364;
const CARD_Y = 348;
const CARD_LX = 190;
const CARD_RX = 1030;
const SEAM_X = 958;
const SHELL_W = 520;
const SHELL_H = 96;

const B2bMirrorOutside: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // hero
  const heroA = { opacity: r(MIRROR, MIRROR + 14), transform: `translateY(${r(MIRROR, MIRROR + 14, 22, 0)}px)` };
  const heroB = { opacity: r(OUTSIDE, OUTSIDE + 14), transform: `translateY(${r(OUTSIDE, OUTSIDE + 14, 22, 0)}px)` };
  const heroWipe = r(OUTSIDE + 2, OUTSIDE + 14, 0, 1, EASINGS.easeInOut);

  // seam
  const seam = r(MIRROR, MIRROR + 18, 0, 1, EASINGS.easeOut);

  // cards
  const leftOp = r(CARD_L, CARD_L + 14);
  const leftY = r(CARD_L, CARD_L + 14, 26, 0);
  const rightOp = r(OUTSIDE, OUTSIDE + 14);
  const rightY = r(OUTSIDE, OUTSIDE + 14, 26, 0);

  // the reflection slips out of register
  const drift = r(BECOMES, BECOMES + 22, 0, 1, EASINGS.easeInOut);
  const ghostOp = r(BECOMES + 4, BECOMES + 24, 0, 0.5, EASINGS.easeOut);
  const rightBorder = interpolateColors(frame, [BECOMES, BECOMES + 22], [COLORS.accent, COLORS.danger]);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* eyebrow */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 104,
          textAlign: 'center',
          fontFamily: FONT_MONO,
          fontSize: 28,
          letterSpacing: 6,
          color: COLORS.muted,
          opacity: r(EYEBROW, EYEBROW + 14),
        }}
      >
        THINK&nbsp;OF&nbsp;IT&nbsp;LIKE&nbsp;THIS
      </div>

      {/* hero — the metaphor, built in its two halves */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 162,
          textAlign: 'center',
          fontFamily: FONT_DISPLAY,
          fontWeight: 700,
          fontSize: 100,
          lineHeight: 1.12,
          letterSpacing: -2,
          color: COLORS.ink,
        }}
      >
        <span style={{ ...heroA, display: 'inline-block' }}>my mirror</span>{' '}
        <span style={{ ...heroB, display: 'inline-block', position: 'relative' }}>
          <span style={{ color: COLORS.accent }}>outside</span>
          <span
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 2,
              height: 8,
              borderRadius: 4,
              background: COLORS.accent,
              transform: `scaleX(${heroWipe})`,
              transformOrigin: 'left',
            }}
          />
        </span>
      </div>

      {/* the mirror seam */}
      <div
        style={{
          position: 'absolute',
          left: SEAM_X,
          top: 330,
          width: 4,
          height: 400,
          borderRadius: 2,
          background: `linear-gradient(180deg, transparent, ${COLORS.accent}, ${COLORS.accent2}, ${COLORS.signal}, transparent)`,
          boxShadow: `0 0 26px ${COLORS.accent}55`,
          transform: `scaleY(${seam})`,
          transformOrigin: 'center',
        }}
      />

      {/* ---------------- left: me ---------------- */}
      <div
        style={{
          position: 'absolute',
          left: CARD_LX,
          top: CARD_Y,
          width: CARD_W,
          height: CARD_H,
          background: COLORS.paper,
          border: `1.5px solid ${COLORS.line}`,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
          padding: 34,
          opacity: leftOp,
          transform: `translateY(${leftY}px)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              flexShrink: 0,
              background: `${COLORS.ink}12`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <User size={32} color={COLORS.ink} strokeWidth={2} />
          </div>
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 4, color: COLORS.muted }}>ME</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 56 }}>
          <Bubble
            side="left"
            textAt={ASK}
            bg={COLORS.cream}
            border={COLORS.line}
            dot={COLORS.muted}
          >
            I can ask it
          </Bubble>
        </div>
      </div>

      {/* ---------------- right: the reflection ---------------- */}
      {/* the card's own outline, left behind when it slips out of register */}
      <div
        style={{
          position: 'absolute',
          left: CARD_RX,
          top: CARD_Y,
          width: CARD_W,
          height: CARD_H,
          border: `2px solid ${COLORS.danger}`,
          borderRadius: RADIUS.card,
          opacity: ghostOp,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: CARD_RX,
          top: CARD_Y,
          width: CARD_W,
          height: CARD_H,
          background: `linear-gradient(90deg, ${COLORS.paper}, ${COLORS.cream})`,
          border: `1.5px solid ${rightBorder}`,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
          padding: 34,
          opacity: rightOp,
          transform: `translate(${18 * drift}px, ${rightY - 10 * drift}px) rotate(${0.7 * drift}deg)`,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              flexShrink: 0,
              background: `${COLORS.accent}18`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'scaleX(-1)',
            }}
          >
            <User size={32} color={COLORS.accent} strokeWidth={2} />
          </div>
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 4, color: COLORS.accent }}>OUTSIDE</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 56 }}>
          <Bubble
            side="right"
            textAt={ANSWERS}
            bg={`${COLORS.accent}12`}
            border={`${COLORS.accent}3d`}
            dot={COLORS.accent}
          >
            it answers{' '}
            <span style={{ opacity: interpolate(frame, [LIKE, LIKE + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) }}>
              <Marker start={ME_W} color={`${COLORS.accent}40`} pad={7} radius={6}>
                like me
              </Marker>
            </span>
          </Bubble>
        </div>
      </div>

      {/* ---------------- the two verdicts ---------------- */}
      <Verdict
        cx={720}
        at={USEFUL}
        captionAt={DAYS}
        color={COLORS.signal}
        label="useful"
        caption="most of the days"
        icon={<Check size={34} color={COLORS.signal} strokeWidth={3} />}
      />
      <Verdict
        cx={1200}
        at={STRANGE}
        captionAt={SOMETIMES}
        color={COLORS.danger}
        label="strange"
        caption="sometimes"
        icon={<AlertCircle size={34} color={COLORS.danger} strokeWidth={2.4} />}
      />
    </AbsoluteFill>
  );
};

// A chat bubble that exists (as a shell with resting dots) from the moment its
// card arrives, and fills with its line on the spoken cue. Fixed size, so the
// dots -> text crossfade never reflows the card.
const Bubble: React.FC<{
  side: 'left' | 'right';
  textAt: number;
  bg: string;
  border: string;
  dot: string;
  children: React.ReactNode;
}> = ({ side, textAt, bg, border, dot, children }) => {
  const frame = useCurrentFrame();
  const textOp = interpolate(frame, [textAt, textAt + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const justify = side === 'left' ? 'flex-start' : 'flex-end';

  return (
    <div
      style={{
        position: 'relative',
        width: SHELL_W,
        height: SHELL_H,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: RADIUS.panel,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: justify,
          gap: 13,
          padding: '0 30px',
          opacity: 1 - textOp,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: dot, opacity: 0.45 }} />
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: justify,
          padding: '0 30px',
          fontSize: 42,
          lineHeight: 1.3,
          color: COLORS.ink,
          opacity: textOp,
        }}
      >
        {/* ONE flex item: the inline run has to stay a single item, or flex
            swallows the space between "it answers" and the marked-up phrase. */}
        <span style={{ whiteSpace: 'nowrap' }}>{children}</span>
      </div>
    </div>
  );
};

// A verdict column: pill on top, mono caption under it. Both slots are fixed at
// absolute coordinates so the second column arriving never moves the first.
const Verdict: React.FC<{
  cx: number;
  at: number;
  captionAt: number;
  color: string;
  label: string;
  caption: string;
  icon: React.ReactNode;
}> = ({ cx, at, captionAt, color, label, caption, icon }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [at, at + 14], [22, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const cOp = interpolate(frame, [captionAt, captionAt + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <div style={{ position: 'absolute', left: cx - 260, top: 792, width: 520, textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            background: `${color}18`,
            border: `1px solid ${color}55`,
            borderRadius: RADIUS.pill,
            boxShadow: SHADOW.soft,
            padding: '15px 38px',
            opacity: op,
            transform: `translateY(${y}px)`,
          }}
        >
          {icon}
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 50, color: COLORS.ink }}>{label}</span>
        </div>
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: FONT_MONO,
          fontSize: 28,
          letterSpacing: 3,
          color: COLORS.muted,
          opacity: cOp,
        }}
      >
        {caption}
      </div>
    </div>
  );
};

export default B2bMirrorOutside;
