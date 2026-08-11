import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Brain } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP, Sunburst } from '../../lib/kit';

// =============================================================================
// B1 — the cold-open reveal. Master span 54.732167 -> 61.132167 (6.4s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// local frame = round((master_s - 54.732167) * 30)
//   57.37 "the second one" -> f44   the 02 card is named (label reveals f47)
//   59.77 "connected"      -> f116  the link draws
//   61.01 "to my"          -> f153  the brain node lands
//   61.71 "brain."         -> f174  the word lands + accent sweep + pulse
// The punchline "Yes, my brain." (62.42) is deliberately left on his face.
//
// v2 (creator feedback): the 02 card used to recall the reply as grey skeleton
// bars, which read as an unfinished placeholder. It now carries the REAL reply
// copy — byte-identical to the reply-02 body in B1ReplyCompare.tsx — so this is
// a genuine recall of the card the viewer already read at 13.20-43.40. The card
// grew 320x200 -> 700x344 and the row re-centred (node pushed 1200 -> 1405) to
// hold 6 lines at 27px without overflow. Choreography is unchanged: the body
// fades in with the card on cardOp, no new cue.
// =============================================================================
export const compositionConfig = { id: 'B1BrainReveal', durationInSeconds: 6.4, fps: 30, width: 1920, height: 1080 };

const CARD_IN = 6;
const LABEL = 47;
const LINK = 116;
const NODE = 153;
const WORD = 174;

const CARD_X = 315;
const CARD_W = 700;
// 344 = 22px padding + 44px header row + 18px gap + six 39px lines + 22px padding.
// The body wraps to exactly six lines at 27px/1.45 in a 648px content box.
const CARD_H = 344;
const CARD_TOP = 258;
const NODE_X = 1405;
const NODE_D = 200;
const NODE_TOP = 330; // card and node share the centre line at y=430

// Verbatim reply-02 body from B1ReplyCompare.tsx (do not paraphrase — this card
// is a recall of that exact reply, minus its animated highlight sweeps).
const REPLY_02 =
  'I moved off managed cloud and kept the receipts. Real numbers: 16 seconds of downtime, twice a year. The bill is $700 a month, all in. The 3am page everyone warns about has not happened yet. It cost me one weekend of setup and a runbook I keep updated.';

const B1BrainReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const cardOp = r(CARD_IN, CARD_IN + 14);
  const cardY = r(CARD_IN, CARD_IN + 14, 24, 0);
  const labelOp = r(LABEL, LABEL + 12);
  const link = r(LINK, LINK + 24, 0, 1, EASINGS.easeInOut);
  const nodeOp = r(NODE, NODE + 14);
  const nodeIn = r(NODE, NODE + 16, 0.9, 1, EASINGS.easeOut);
  const pulse = r(WORD, WORD + 8, 0, 0.03) - r(WORD + 8, WORD + 20, 0, 0.03);
  const glow = r(WORD, WORD + 16);
  const sweep = r(WORD + 2, WORD + 14, 0, 1, EASINGS.easeInOut);

  const word = (at: number) => ({
    opacity: r(at, at + 12),
    transform: `translateY(${r(at, at + 12, 20, 0)}px)`,
    display: 'inline-block',
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* label over the 02 card */}
      <div style={{
        position: 'absolute', left: CARD_X, top: CARD_TOP - 52, width: CARD_W,
        fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 4, color: COLORS.muted,
        opacity: labelOp,
      }}>THE&nbsp;SECOND&nbsp;ONE</div>

      {/* the 02 reply, recalled — the real copy, not a skeleton */}
      <div style={{
        position: 'absolute', left: CARD_X, top: CARD_TOP, width: CARD_W, height: CARD_H,
        background: COLORS.paper, border: `2px solid ${COLORS.accent}`,
        borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '22px 26px',
        opacity: cardOp, transform: `translateY(${cardY}px)`,
        overflow: 'hidden', boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: RADIUS.panel,
            background: `${COLORS.accent}16`, border: `1px solid ${COLORS.accent}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT_MONO, fontWeight: 700, fontSize: 21, color: COLORS.accent,
          }}>02</div>
          <div style={{ flex: 1 }} />
          <Sunburst size={22} />
        </div>
        <div style={{ fontSize: 27, lineHeight: 1.45, color: COLORS.ink, marginTop: 18 }}>
          {REPLY_02}
        </div>
      </div>

      {/* the link */}
      <div style={{
        position: 'absolute', left: CARD_X + CARD_W + 22, top: NODE_TOP + NODE_D / 2 - 4,
        width: NODE_X - (CARD_X + CARD_W) - 44, height: 8, borderRadius: 999,
        background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accent2})`,
        transform: `scaleX(${link})`, transformOrigin: 'left',
      }} />

      {/* the brain */}
      <div style={{
        position: 'absolute', left: NODE_X, top: NODE_TOP, width: NODE_D, height: NODE_D,
        opacity: nodeOp, transform: `scale(${nodeIn + pulse})`,
      }}>
        <div style={{
          position: 'absolute', inset: -46, borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.accent}33, transparent 70%)`,
          opacity: glow,
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `${COLORS.accent}14`, border: `3px solid ${COLORS.accent}`,
          boxShadow: SHADOW.card,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Brain size={104} color={COLORS.accent} strokeWidth={1.7} />
        </div>
      </div>

      {/* the line lands */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 690, textAlign: 'center',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.1, color: COLORS.ink,
      }}>
        <span style={word(LINK)}>connected</span>{' '}
        <span style={word(NODE)}>to my</span>{' '}
        <span style={{ ...word(WORD), position: 'relative', color: COLORS.accent }}>
          <span style={{
            position: 'absolute', left: -10, right: -10, bottom: 8, height: 24,
            background: `${COLORS.accent}45`, borderRadius: 7,
            transform: `scaleX(${sweep})`, transformOrigin: 'left', zIndex: 0,
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>brain</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default B1BrainReveal;
