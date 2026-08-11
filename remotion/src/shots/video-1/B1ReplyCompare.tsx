import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import {
  MessageCircle, Repeat2, Heart, BarChart3, AlertTriangle,
  Mic, Database, Hash, Server, BookOpen,
} from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP, Sunburst } from '../../lib/kit';
import { Marker } from '../../lib/browser';

// =============================================================================
// B1 — the A/B reply comparison. Master span 12.032167 -> 42.232167 (30.2s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// v3: the B1ColdOpen pair contract is RETIRED (variant B parked in work/retired/).
// The realistic cold open before this ends on a Gmail reply box, so the post card
// entrance is restored (POST_IN) and this shot opens clean on the hard cut.
// Neither reply is labelled good/bad; they are only numbered 01 / 02.
// local frame = round((master_s - 12.032167) * 30)
//   13.27 "We have the same post"      -> f2   post card rises
//   16.64 "the same AI model"          -> f103 model pill
//   18.55 "Claude"                     -> f161 Claude fills the pill
//   19.99 "and replying to..."         -> f206 post docks up, ghost replies
//   22.88 "writing both of them"       -> f290 reply copy fills in
//   24.93 "Read the first one"         -> f352 focus reply 01
//   26.41 "generic,"                   -> f396 danger border + NO SPECIFICS
//   28.81 "AI slop."                   -> f462 AI SLOP bar
//   29.61 "Now the second one"         -> f492 focus shifts to reply 02
//   30.93 "16 seconds of downtime"     -> f532 marker
//   33.16 "twice a year,"              -> f599 marker
//   34.54 "$700 a month."              -> f640 marker
//   36.29 "That's my voice, my data.." -> f684 reply 01 retires, provenance list
// =============================================================================
export const compositionConfig = { id: 'B1ReplyCompare', durationInSeconds: 30.2, fps: 30, width: 1920, height: 1080 };

const POST_IN = 6;
const MODEL = 103;
const CLAUDE = 161;
const SHRINK = 206;
const GHOSTS = 216;
const FILL = 290;
const FOCUS1 = 352;
const GENERIC = 396;
const SLOP = 462;
const FOCUS2 = 492;
const H1 = 532;
const H2 = 599;
const H3 = 640;
const PROV = 684;
const PROV_HEAD = 693;

const CARD_TOP = 280;
const CARD_H = 620;
const COL_W = 810;
const X1 = 122;
const X2 = 988;

const PROVENANCE = [
  { label: 'my voice', Icon: Mic, at: 721 },
  { label: 'my data', Icon: Database, at: 760 },
  { label: 'my numbers', Icon: Hash, at: 796 },
  { label: 'my own servers', Icon: Server, at: 830 },
  { label: 'my own experience', Icon: BookOpen, at: 868 },
];

const Avatar: React.FC<{ initials: string; size: number; from: string; to: string }> = ({ initials, size, from, to }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: `linear-gradient(135deg, ${from}, ${to})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size * 0.42, color: COLORS.paper,
  }}>{initials}</div>
);

const ClaudeChip: React.FC = () => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill,
    padding: '5px 14px', background: COLORS.cream,
  }}>
    <Sunburst size={18} />
    <span style={{ fontFamily: FONT_MONO, fontSize: 19, color: COLORS.muted }}>Claude</span>
  </div>
);

const IndexBadge: React.FC<{ n: string; color: string }> = ({ n, color }) => (
  <div style={{
    width: 52, height: 52, borderRadius: RADIUS.panel, flexShrink: 0,
    background: `${color}16`, border: `1px solid ${color}44`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: FONT_MONO, fontWeight: 700, fontSize: 24, color,
  }}>{n}</div>
);

const B1ReplyCompare: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // ---- post card docks to the top -------------------------------------------
  const shrink = r(SHRINK, SHRINK + 22, 0, 1, EASINGS.easeInOut);
  const postTop = interpolate(shrink, [0, 1], [360, 40]);
  const postScale = interpolate(shrink, [0, 1], [1, 0.68]);
  // v3: the variant-B ColdOpen handoff is retired — the realistic X/Gmail cold open
  // ends on a Gmail reply box, so this shot cuts in from a different scene and the
  // post card ENTERS again on "We have the same post" (POST_IN).
  const postOp = r(POST_IN, POST_IN + 14);
  const postY = r(POST_IN, POST_IN + 14, 26, 0);
  const modelOp = r(MODEL, MODEL + 14) * (1 - r(SHRINK, SHRINK + 12));
  const modelY = r(MODEL, MODEL + 14, 22, 0);
  const claudeOp = r(CLAUDE, CLAUDE + 12);

  // ---- cards: appear as skeletons, then fill --------------------------------
  const cardIn = r(GHOSTS, GHOSTS + 16);
  const cardInY = r(GHOSTS, GHOSTS + 16, 30, 0);
  const textIn = r(FILL, FILL + 16);
  const skel = 1 - r(FILL - 4, FILL + 10);

  // ---- focus / dim ----------------------------------------------------------
  const ramp1 = r(FOCUS1, FOCUS1 + 14);
  const ramp2 = r(FOCUS2, FOCUS2 + 14);
  const f1 = Math.max(0, ramp1 - ramp2); // reply 01 has the floor
  const f2 = ramp2; // reply 02 has the floor
  const retire1 = r(PROV, PROV + 16);

  const op1 = (1 - 0.7 * ramp2) * (1 - retire1);
  const op2 = 1 - 0.7 * Math.max(0, ramp1 - ramp2);

  const border1 = interpolateColors(frame, [GENERIC, GENERIC + 12], [COLORS.line, COLORS.danger]);
  const border2 = interpolateColors(frame, [FOCUS2, FOCUS2 + 14], [COLORS.line, COLORS.accent]);

  const stripOp = r(GENERIC, GENERIC + 14);
  const stripY = r(GENERIC, GENERIC + 14, 64, 0);
  const slopOp = r(SLOP, SLOP + 12) * op1; // the verdict dims with its card, never competes with reply 02
  const slopPop = r(SLOP, SLOP + 10, 0.94, 1.03) - r(SLOP + 10, SLOP + 22, 0, 0.03);

  // ---- provenance list ------------------------------------------------------
  const provHead = r(PROV_HEAD, PROV_HEAD + 14);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* ===================== the shared post ===================== */}
      <div style={{
        position: 'absolute', left: '50%', top: postTop, width: 1160,
        transform: `translateX(-50%) scale(${postScale})`, transformOrigin: 'top center',
      }}>
        <div style={{
          background: COLORS.paper, border: `1px solid ${COLORS.line}`,
          borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '28px 38px 24px',
          opacity: postOp, transform: `translateY(${postY}px)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar initials="SN" size={62} from={COLORS.accent2} to={COLORS.accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 31, color: COLORS.ink }}>Startup Notes</div>
              <div style={{ fontSize: 25, color: COLORS.muted }}>@startupnotes · 2h</div>
            </div>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 2, color: COLORS.muted,
              border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill, padding: '7px 18px',
            }}>THE&nbsp;POST</div>
          </div>
          <div style={{ fontSize: 36, lineHeight: 1.42, color: COLORS.ink, marginTop: 18 }}>
            Self hosting sounds cheap until it breaks at 3am. Managed cloud costs more, but at least you sleep. Change my mind.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 78, marginTop: 20, color: COLORS.muted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 23 }}><MessageCircle size={23} strokeWidth={1.9} /> 412</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 23 }}><Repeat2 size={23} strokeWidth={1.9} /> 96</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 23 }}><Heart size={23} strokeWidth={1.9} /> 1.8K</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 23 }}><BarChart3 size={23} strokeWidth={1.9} /> 74K</span>
          </div>
        </div>

        {/* same model pill (retires when the post docks) */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginTop: 22,
          opacity: modelOp, transform: `translateY(${modelY}px)`,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            background: COLORS.paper, border: `1px solid ${COLORS.line}`,
            borderRadius: RADIUS.pill, boxShadow: SHADOW.soft, padding: '12px 28px',
          }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: 2, color: COLORS.muted }}>SAME&nbsp;MODEL</span>
            <span style={{ width: 1, height: 26, background: COLORS.line }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: claudeOp }}>
              <Sunburst size={26} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: COLORS.ink }}>Claude</span>
            </span>
          </div>
        </div>
      </div>

      {/* ===================== reply 01 ===================== */}
      <div style={{
        position: 'absolute', left: X1, top: CARD_TOP, width: COL_W, height: CARD_H,
        background: COLORS.paper, border: `2px solid ${border1}`,
        borderRadius: RADIUS.card, boxShadow: SHADOW.card,
        padding: '28px 34px', opacity: cardIn * op1,
        transform: `translateY(${cardInY - 10 * f1}px) scale(${1 + 0.015 * f1})`,
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar initials="H" size={54} from={COLORS.accent} to={COLORS.signal} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 27, color: COLORS.ink }}>Hasan</div>
            <div style={{ fontSize: 22, color: COLORS.muted }}>@hasan</div>
          </div>
          <ClaudeChip />
          <IndexBadge n="01" color={COLORS.muted} />
        </div>
        <div style={{ fontSize: 22, color: COLORS.muted, marginTop: 12 }}>Replying to @startupnotes</div>

        {/* skeleton lines while the reply is still "being written" */}
        <div style={{ position: 'absolute', left: 34, right: 34, top: 162, opacity: skel }}>
          {[100, 94, 88, 96, 62].map((w, i) => (
            <div key={i} style={{ height: 22, width: `${w}%`, borderRadius: 999, background: COLORS.line, marginBottom: 28 }} />
          ))}
        </div>
        <div style={{
          position: 'absolute', left: 34, right: 34, top: 158,
          fontSize: 33, lineHeight: 1.5, color: COLORS.ink, opacity: textIn,
        }}>
          Great question! Managed cloud definitely gives you peace of mind, and self hosting can be very cost effective with the right setup. It really depends on your team, your workload and your risk tolerance. There are tradeoffs either way, so think it through carefully.
        </div>

        {/* "generic" verdict strip */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, height: 64,
          background: `${COLORS.danger}1f`, borderTop: `1px solid ${COLORS.danger}55`,
          display: 'flex', alignItems: 'center', gap: 14, padding: '0 34px',
          opacity: stripOp, transform: `translateY(${stripY}px)`,
        }}>
          <AlertTriangle size={26} color={COLORS.danger} strokeWidth={2.2} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 2, color: COLORS.danger }}>NO&nbsp;SPECIFICS</span>
        </div>
      </div>

      {/* "AI slop" stamp under reply 01 */}
      <div style={{
        position: 'absolute', left: X1, top: 924, width: COL_W,
        display: 'flex', justifyContent: 'center', opacity: slopOp,
      }}>
        <div style={{
          background: COLORS.danger, borderRadius: RADIUS.pill, padding: '12px 46px',
          transform: `scale(${slopPop})`, boxShadow: SHADOW.soft,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: 1, color: COLORS.paper,
        }}>AI slop</div>
      </div>

      {/* ===================== reply 02 ===================== */}
      <div style={{
        position: 'absolute', left: X2, top: CARD_TOP, width: COL_W, height: CARD_H,
        background: COLORS.paper, border: `2px solid ${border2}`,
        borderRadius: RADIUS.card, boxShadow: SHADOW.card,
        padding: '28px 34px', opacity: cardIn * op2,
        transform: `translateY(${cardInY - 10 * f2}px) scale(${1 + 0.015 * f2})`,
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar initials="H" size={54} from={COLORS.accent} to={COLORS.signal} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 27, color: COLORS.ink }}>Hasan</div>
            <div style={{ fontSize: 22, color: COLORS.muted }}>@hasan</div>
          </div>
          <ClaudeChip />
          <IndexBadge n="02" color={COLORS.muted} />
        </div>
        <div style={{ fontSize: 22, color: COLORS.muted, marginTop: 12 }}>Replying to @startupnotes</div>

        <div style={{ position: 'absolute', left: 34, right: 34, top: 162, opacity: skel }}>
          {[96, 100, 90, 84, 58].map((w, i) => (
            <div key={i} style={{ height: 22, width: `${w}%`, borderRadius: 999, background: COLORS.line, marginBottom: 28 }} />
          ))}
        </div>
        <div style={{
          position: 'absolute', left: 34, right: 34, top: 158,
          fontSize: 33, lineHeight: 1.55, color: COLORS.ink, opacity: textIn,
        }}>
          I moved off managed cloud and kept the receipts. Real numbers:{' '}
          <Marker start={H1} color={`${COLORS.accent}3d`} pad={5}>16 seconds of downtime</Marker>,{' '}
          <Marker start={H2} color={`${COLORS.accent}3d`} pad={5}>twice a year</Marker>. The bill is{' '}
          <Marker start={H3} color={`${COLORS.signal}4d`} pad={5}>$700 a month</Marker>, all in. The 3am page everyone warns about has not happened yet. It cost me one weekend of setup and a runbook I keep updated.
        </div>
      </div>

      {/* ===================== provenance list (replaces reply 01) ===================== */}
      <div style={{ position: 'absolute', left: X1, top: CARD_TOP + 6, width: COL_W, opacity: provHead }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 25, letterSpacing: 4, color: COLORS.muted, marginBottom: 30 }}>
          WHERE&nbsp;THIS&nbsp;CAME&nbsp;FROM
        </div>
        {PROVENANCE.map((p) => {
          const op = r(p.at, p.at + 14);
          const y = r(p.at, p.at + 14, 24, 0);
          const Icon = p.Icon;
          return (
            <div key={p.label} style={{
              display: 'flex', alignItems: 'center', gap: 22, marginBottom: 16,
              opacity: op, transform: `translateY(${y}px)`,
              background: COLORS.paper, border: `1px solid ${COLORS.line}`,
              borderRadius: RADIUS.card, boxShadow: SHADOW.soft, padding: '14px 26px',
            }}>
              <div style={{
                width: 58, height: 58, borderRadius: '50%', flexShrink: 0,
                background: `${COLORS.accent}16`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={30} color={COLORS.accent} strokeWidth={2.1} />
              </div>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 42, color: COLORS.ink }}>{p.label}</span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export default B1ReplyCompare;
