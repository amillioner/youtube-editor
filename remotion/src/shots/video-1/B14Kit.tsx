// =============================================================================
// B14Kit — the pieces the whole B14 ladder shares. NOT a shot: no
// `compositionConfig`, so gen-registry skips this file on purpose.
//
// Every component here is a PLAIN React component (no useCurrentFrame): the
// caller passes `frame`, so a shot can drive a piece on its own schedule and
// two adjacent shots can render the SAME picture at different stages. A cue
// prop <= -30 renders that element already-finished at frame 0, which is how a
// hard cut between two ladder shots reads as one continuous image.
//
// CONTENTS
//   SimTag         the persistent "SIMULATED / roadmap, not shipped" honesty tag
//   LevelRail      the 5-slot ladder rail; unreached levels stay dashed + unnamed
//   BrainRepoCard  the brain repo card, geometry-identical to the TwoHeads root
//   Waveform       deterministic audio bars (frame-driven sine, no randomness)
//   Connector      a vertical draw-on line between two stacked cards
// =============================================================================
import React from 'react';
import { interpolate } from 'remotion';
import { Lock, TriangleAlert } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';
import { GithubMark } from './_shared/marks';

export const r = (frame: number, a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
  interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

// -----------------------------------------------------------------------------
// SimTag — the honesty commitment. He says it out loud at 862.63; it is on
// screen from the first ladder frame so nobody can quote the video wrong.
// The caller animates `scale` / `top` / `right` for the enlarge beat.
// -----------------------------------------------------------------------------
export const SimTag: React.FC<{
  frame: number;
  at?: number;
  tone?: 'light' | 'dark';
  top?: number;
  right?: number;
  scale?: number;
}> = ({ frame, at = 0, tone = 'light', top = 44, right = 56, scale = 1 }) => {
  const op = r(frame, at, at + 12);
  const y = r(frame, at, at + 12, -14, 0);
  const dark = tone === 'dark';
  return (
    <div
      style={{
        position: 'absolute', top, right,
        transform: `translateY(${y}px) scale(${scale})`, transformOrigin: 'top right',
        opacity: op,
        display: 'flex', alignItems: 'center', gap: 14,
        background: dark ? `${COLORS.d900}d9` : COLORS.paper,
        border: `2px solid ${COLORS.warn}`,
        borderRadius: RADIUS.pill,
        boxShadow: dark ? 'none' : SHADOW.soft,
        padding: '13px 26px',
        whiteSpace: 'nowrap',
      }}
    >
      <TriangleAlert size={26} color={COLORS.warn} strokeWidth={2.4} />
      <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: dark ? COLORS.warn : COLORS.ink }}>
        SIMULATED
      </span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: dark ? COLORS.d400 : COLORS.muted }}>·</span>
      <span style={{ fontFamily: FONT_BODY, fontSize: 24, color: dark ? COLORS.d300 : COLORS.muted }}>
        roadmap, not shipped
      </span>
    </div>
  );
};

// -----------------------------------------------------------------------------
// LevelRail — 5 slots in the bottom band. A slot only shows its NAME once the
// narration has named it; until then it is a dashed numbered slot (the same
// idiom the TwoHeads diagram uses for its empty heads). Pass `label: ''` for a
// level that has been REACHED but not yet named on camera.
// -----------------------------------------------------------------------------
export type RailSlot = { n: number; label?: string; at: number };
export const RAIL_TOP = 944;
const RAIL_W = 296;
const RAIL_GAP = 22;
const RAIL_H = 78;
const RAIL_LEFT = (1920 - (RAIL_W * 5 + RAIL_GAP * 4)) / 2;

export const LevelRail: React.FC<{
  frame: number; slots: RailSlot[]; tone?: 'light' | 'dark'; top?: number; at?: number;
}> = ({ frame, slots, tone = 'light', top = RAIL_TOP, at = 0 }) => {
  const dark = tone === 'dark';
  const railOp = r(frame, at, at + 14);
  return (
    <div style={{ position: 'absolute', left: RAIL_LEFT, top, width: RAIL_W * 5 + RAIL_GAP * 4, height: RAIL_H, display: 'flex', gap: RAIL_GAP, opacity: railOp }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const slot = slots.find((s) => s.n === n);
        const fill = slot ? r(frame, slot.at, slot.at + 14) : 0;
        const rise = slot ? r(frame, slot.at, slot.at + 14, 12, 0) : 0;
        return (
          <div key={n} style={{ position: 'relative', width: RAIL_W, height: RAIL_H }}>
            {/* unreached: dashed, number only */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: RADIUS.card,
              border: `2px dashed ${dark ? `${COLORS.d400}66` : `${COLORS.muted}55`}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 1 - fill,
            }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: dark ? `${COLORS.d400}aa` : `${COLORS.muted}88` }}>{n}</span>
            </div>
            {/* reached */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: RADIUS.card,
              background: dark ? `${COLORS.d900}cc` : COLORS.paper,
              border: `2px solid ${COLORS.accent}`,
              boxShadow: dark ? 'none' : SHADOW.soft,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
              opacity: fill, transform: `translateY(${rise}px)`,
            }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: COLORS.accent }}>{n}</span>
              {slot?.label ? (
                <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 30, color: dark ? COLORS.d300 : COLORS.ink }}>{slot.label}</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// -----------------------------------------------------------------------------
// BrainRepoCard — the constant of the whole ladder. Same visual language as the
// TwoHeads root card (B3), so when it returns underneath all five levels at
// 869.62 the viewer recognises it instantly.
// -----------------------------------------------------------------------------
export const BRAIN_CARD = { x: 680, y: 148, w: 560, h: 124 } as const;

export const BrainRepoCard: React.FC<{
  frame: number; at?: number;
  x?: number; y?: number; w?: number; h?: number;
  name?: string; sub?: string;
}> = ({
  frame, at = 0,
  x = BRAIN_CARD.x, y = BRAIN_CARD.y, w = BRAIN_CARD.w, h = BRAIN_CARD.h,
  name = 'brain', sub = 'markdown files in a git repo',
}) => {
  const op = r(frame, at, at + 14);
  const ty = r(frame, at, at + 14, 24, 0);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      background: COLORS.d900, border: `1.5px solid ${COLORS.d600}`, borderRadius: RADIUS.card,
      boxShadow: SHADOW.card, padding: '22px 28px', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10,
      opacity: op, transform: `translateY(${ty}px)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <GithubMark size={32} color={COLORS.d300} />
        <span style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 34, color: COLORS.d300 }}>{name}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
          <Lock size={17} color={COLORS.signal} strokeWidth={2.4} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 19, color: COLORS.signal }}>private</span>
        </div>
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.d400 }}>{sub}</div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// Waveform — deterministic bars. Height is a pure function of (bar index, frame),
// so every render is identical. `live` scales the whole thing so a waveform can
// sit idle and then "speak" on a cue.
// -----------------------------------------------------------------------------
export const Waveform: React.FC<{
  frame: number; at?: number; liveAt?: number;
  x: number; y: number; w: number; h: number;
  bars?: number; color?: string; speed?: number; phase?: number;
}> = ({ frame, at = 0, liveAt, x, y, w, h, bars = 34, color = COLORS.accent, speed = 0.26, phase = 0 }) => {
  const op = r(frame, at, at + 14);
  const live = liveAt === undefined ? 1 : r(frame, liveAt, liveAt + 16, 0.18, 1, EASINGS.easeInOut);
  const bw = w / (bars * 2 - 1);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, display: 'flex', alignItems: 'center', gap: bw, opacity: op }}>
      {Array.from({ length: bars }).map((_, i) => {
        const s = Math.abs(Math.sin(i * 0.83 + phase + frame * speed));
        const s2 = Math.abs(Math.sin(i * 0.31 - phase + frame * speed * 0.55));
        const amp = 0.14 + 0.86 * (0.6 * s + 0.4 * s2);
        const bh = Math.max(bw, h * amp * live);
        return (
          <div key={i} style={{ width: bw, height: bh, borderRadius: bw / 2, background: color }} />
        );
      })}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Connector — a vertical line that draws downward from one card to the next.
// -----------------------------------------------------------------------------
export const Connector: React.FC<{
  frame: number; at: number; x: number; y1: number; y2: number; color?: string; dur?: number;
}> = ({ frame, at, x, y1, y2, color = COLORS.muted, dur = 16 }) => {
  if (frame < at) return null;
  const len = y2 - y1;
  const d = r(frame, at, at + dur, 0, 1, EASINGS.easeInOut);
  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }}>
      <line
        x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={3} strokeLinecap="round"
        strokeDasharray={len} strokeDashoffset={len * (1 - d)}
      />
    </svg>
  );
};

// -----------------------------------------------------------------------------
// The five levels, named the way the narration names them. Used by the recap
// shots (B14Simulated / B14SameFolder) AFTER every name has been said on camera.
// -----------------------------------------------------------------------------
export const LEVELS = [
  { n: 1, label: 'voice' },
  { n: 2, label: 'voice clone' },
  { n: 3, label: 'photo' },
  { n: 4, label: 'lipsync' },
  { n: 5, label: 'iRobot version' },
] as const;

// -----------------------------------------------------------------------------
// LevelCard — one of the five recap cards. B14Simulated stamps them and walks
// them up to y = CARD_TOP_PARKED; B14SameFolder starts with them already there,
// so the cut between the two shots is one continuous move.
// -----------------------------------------------------------------------------
// where the tag parks when it ENLARGES on "none of that is built right now"
// (862.63). Shared so B14TagHold can hand it to B14Simulated mid-move.
// (right is measured so the enlarged pill lands centred on the 1920 canvas)
export const TAG_BIG = { top: 780, right: 407, scale: 2 } as const;

export const CARD_W = 320;
export const CARD_H = 132;
export const CARD_GAP = 24;
export const CARD_TOP_STAGE = 380;
export const CARD_TOP_PARKED = 140;
export const CARD_X = (i: number) => (1920 - (CARD_W * 5 + CARD_GAP * 4)) / 2 + i * (CARD_W + CARD_GAP);

export const LevelCard: React.FC<{
  frame: number; at: number; n: number; label: string; x: number; y: number; sim?: number;
}> = ({ frame, at, n, label, x, y, sim = 0 }) => {
  const op = r(frame, at, at + 14);
  const ty = r(frame, at, at + 14, 22, 0);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: CARD_W, height: CARD_H, boxSizing: 'border-box',
      borderRadius: RADIUS.card, background: COLORS.paper,
      border: `2px solid ${sim > 0.5 ? COLORS.warn : COLORS.accent}`,
      boxShadow: SHADOW.soft, padding: '16px 22px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4,
      opacity: op * (1 - sim * 0.22), transform: `translateY(${ty}px)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: sim > 0.5 ? COLORS.warn : COLORS.accent, lineHeight: 1 }}>{n}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 19, letterSpacing: 2, color: COLORS.muted }}>LEVEL</span>
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink, whiteSpace: 'nowrap' }}>{label}</div>
    </div>
  );
};
