import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Mail, MessageCircle, Newspaper, Video } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B11 (1/2) — what he actually uses it for. Master span 708.596967 -> 715.696967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 708.596967) * 30)).
//   "for replying,"           712.00 -> f12   card 1
//   "for emails,"             713.44 -> f55   card 2
//   "newsletter."             714.00 -> f72   card 3
//   "A video description,"    715.06 -> f104  card 4
//   "anything I have to       716.27 -> f140  the line under them
//    write as me."            717.86 -> f188  indigo wipe on "as me"
// The row re-centres as each card lands, so the group is always centred and
// nothing is on screen before it is said. Labels are his exact words: he says
// replying, emails, newsletter, a video description (not "a post").
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B11WriteAsMe', durationInSeconds: 7.1, fps: 30, width: 1920, height: 1080 };

const F_REPLY = 12;
const F_EMAIL = 55;
const F_NEWS = 72;
const F_DESC = 104;
const F_LINE = 140;
const F_ASME = 188;

const CARD_W = 400;
const CARD_H = 320;
const GAP = 36;
const ROW_TOP = 352;

const CARDS: { label: string; Icon: React.FC<any>; at: number; skel: number[] }[] = [
  { label: 'Replying', Icon: MessageCircle, at: F_REPLY, skel: [92, 74, 0] },
  { label: 'Emails', Icon: Mail, at: F_EMAIL, skel: [96, 88, 62] },
  { label: 'Newsletter', Icon: Newspaper, at: F_NEWS, skel: [90, 96, 70] },
  { label: 'Video description', Icon: Video, at: F_DESC, skel: [94, 82, 58] },
];

const B11WriteAsMe: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const ramps = CARDS.map((c) => r(c.at, c.at + 14));
  const count = ramps.reduce((a, b) => a + b, 0);
  const rowW = count * CARD_W + Math.max(0, count - 1) * GAP;
  const rowLeft = 960 - rowW / 2;

  const eyeOp = r(0, 14);
  const eyeY = r(0, 14, 16, 0);
  const lineOp = r(F_LINE, F_LINE + 16);
  const lineY = r(F_LINE, F_LINE + 16, 24, 0);
  const wipe = r(F_ASME, F_ASME + 12);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{
        position: 'absolute', left: 0, right: 0, top: 236, textAlign: 'center',
        opacity: eyeOp, transform: `translateY(${eyeY}px)`,
        fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 4, color: COLORS.muted,
      }}>
        EVERY&nbsp;DAY
      </div>

      {/* ---- the surfaces, one per word ---- */}
      <div style={{ position: 'absolute', left: rowLeft, top: ROW_TOP, width: rowW, height: CARD_H }}>
        {CARDS.map((c, i) => {
          const op = ramps[i];
          const y = r(c.at, c.at + 14, 22, 0);
          const Icon = c.Icon;
          return (
            <div key={c.label} style={{
              position: 'absolute', left: i * (CARD_W + GAP), top: 0, width: CARD_W, height: CARD_H,
              background: COLORS.paper, border: `1px solid ${COLORS.line}`,
              borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '30px 30px',
              opacity: op, transform: `translateY(${y}px)`, boxSizing: 'border-box',
            }}>
              <div style={{
                width: 76, height: 76, borderRadius: '50%', background: `${COLORS.accent}16`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={38} color={COLORS.accent} strokeWidth={2} />
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 36, color: COLORS.ink, marginTop: 20 }}>
                {c.label}
              </div>
              <div style={{ marginTop: 24 }}>
                {c.skel.filter((w) => w > 0).map((w, j) => (
                  <div key={j} style={{ height: 15, width: `${w}%`, borderRadius: 999, background: COLORS.line, marginBottom: 16 }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---- the unifying line ---- */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 762, textAlign: 'center',
        opacity: lineOp, transform: `translateY(${lineY}px)`,
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 78, color: COLORS.ink,
      }}>
        Anything I have to write{' '}
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{
            position: 'absolute', left: -10, right: -10, bottom: 6, height: 26, borderRadius: 8,
            background: `${COLORS.accent}59`, transform: `scaleX(${wipe})`, transformOrigin: 'left', zIndex: 0,
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>as me.</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default B11WriteAsMe;
