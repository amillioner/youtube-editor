import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  FilePlus, Check, GitCommitHorizontal, ArrowUpFromLine,
  Webhook, ArrowDownToLine, RefreshCw, Globe, ArrowLeftRight, DoorOpen,
} from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { TwoHeads } from './_shared/TwoHeads';
import { OneRepoTwoHeads, HEADLINE_TOP } from './_shared/OneRepoTwoHeads';

// =============================================================================
// B8 — ★ THE MONEY SHOT. The callback to the two-heads diagram (B3.3/B3.4).
// Same component, same `top`, every cue prop <= BUILT so it cuts in already
// drawn: identical geometry to B3TwoHeads, on a completely different clock.
// The picture the viewer already knows is now used as the PIPE: a packet runs
// local -> root -> online, one step per narrated word.
//
// Master span 579.596967–615.196967. Local frame = round((master - 579.596967) * 30).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Cues (all verified against work/edited-transcript.json):
//   "feed" 586.95->f131 · "approve" 588.70->f183 · "commits" 590.08->f224 ·
//   "push." 591.68->f273 · "GitHub" 592.39->f294 · ★"webhook" 593.59->f330 ·
//   "pulls" 597.54->f448 · "updates." 598.18->f467 · "reindexes" 599.29->f501 ·
//   "live" 601.45->f566 · "the other direction" 603.79->f636 ·
//   "same repo" 606.84->f727 · "both directions" 608.13->f766 ·
//   "sync." 612.37->f893 · "no syncing" 614.23->f949 ·
//   "one" 615.50->f987 · "source" 616.24->f1009 · "2" 617.37->f1043 ·
//   "doors." 617.59->f1050.
// The reverse direction is ONE throwaway line (603.79–605.93, ~2s), so it gets
// exactly one quick reverse traversal, not a second walkthrough.
// Ends at 616.3648 so "Now let me take you through a quick tour" is clean face.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B8Compose', durationInSeconds: 35.6, fps: 30, width: 1920, height: 1080 };

const BUILT = -90; // any cue <= this renders already-finished at frame 0
const TOP = 250;   // the SAME diagram top as B3TwoHeads / B3OnlineAccess

// Geometry mirrored from _shared/TwoHeads.tsx. Kept local on purpose: the shared
// component is untouched, and these values are fixed there (root rect, the two
// branch paths and their common length).
const BRANCH_LEN = 456;
const BRANCH_L = 'M 960 124 V 168 Q 960 182 946 182 H 634 Q 620 182 620 196 V 252';
const BRANCH_R = 'M 960 124 V 168 Q 960 182 974 182 H 1286 Q 1300 182 1300 196 V 252';
const BOX_H = 640;
const ROOT = { x: 680, y: TOP, w: 560, h: 124 };
const LOCAL = { x: 350, y: TOP + 252, w: 540, h: 252, cx: 620 };
const ONLINE = { x: 1030, y: TOP + 252, w: 540, h: 252, cx: 1300 };

// ---- cue frames --------------------------------------------------------------
const FEED_AT = 131;
const APPROVE_AT = 183;
const COMMIT_AT = 224;
const PUSH_AT = 273;
const PUSH_PULSE = [273, 309] as const;
const LANDED_AT = 303;   // "+1 commit" appears on the repo as the packet arrives
const WEBHOOK_AT = 330;  // ★ "webhook"
const PULL_AT = 448;
const PULL_PULSE = [440, 478] as const;
const REINDEX_AT = 501;
const LIVE_AT = 566;

const LISTS_OUT = 636;   // "And this works too in the other direction."
const REV_R = [644, 676] as const; // online -> root
const REV_L = [676, 708] as const; // root -> local
const FLIP_AT = 644;
const FLIP_OUT = 924;    // "Actually, there is no syncing."

const SAME_AT = 727;
const BOTH_AT = 766;
const SYNC_AT = 893;
const STRIKE_AT = 949;
const CHIPS_OUT = 971;

const SWAP_AT = 971;     // "We have..." — old headline leaves
const SOURCE_AT = 987;   // "one"
const ROOTRING_AT = 1009; // "source"
const DOORS_AT = 1043;   // "2"
const DOORLINE_AT = 1050; // "doors."

// -----------------------------------------------------------------------------
// a bright packet running along one of the two branch paths.
// `up` = head -> root (against the path direction), else root -> head.
// -----------------------------------------------------------------------------
const DASH = 108;
const Packet: React.FC<{ frame: number; d: string; a: number; b: number; up: boolean; color: string }> = ({ frame, d, a, b, up, color }) => {
  if (frame < a || frame > b) return null;
  const t = interpolate(frame, [a, b], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const span = DASH + BRANCH_LEN;
  const off = up ? -BRANCH_LEN + t * span : DASH - t * span;
  const fade = interpolate(frame, [a, a + 5, b - 5, b], [0, 1, 1, 0], CLAMP);
  return (
    <>
      <path d={d} fill="none" stroke={color} strokeOpacity={0.26 * fade} strokeWidth={22} strokeLinecap="round"
        strokeDasharray={`${DASH} ${BRANCH_LEN}`} strokeDashoffset={off} />
      <path d={d} fill="none" stroke={color} strokeOpacity={fade} strokeWidth={8} strokeLinecap="round"
        strokeDasharray={`${DASH} ${BRANCH_LEN}`} strokeDashoffset={off} />
    </>
  );
};

// -----------------------------------------------------------------------------
// one step of the chain, stacked under its own head
// -----------------------------------------------------------------------------
const StepPill: React.FC<{
  frame: number; at: number; doneAt: number | null; Icon: React.FC<any>;
  label: string; color: string; cx: number; y: number;
}> = ({ frame, at, doneAt, Icon, label, color, cx, y }) => {
  const op = interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ty = interpolate(frame, [at, at + 12], [16, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const sc = interpolate(frame, [at, at + 8, at + 16], [0.96, 1.03, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const out = 1 - interpolate(frame, [LISTS_OUT, LISTS_OUT + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeIn });
  const done = doneAt !== null && frame >= doneAt;
  const dim = done ? interpolate(frame, [doneAt as number, (doneAt as number) + 12], [1, 0.46], { ...CLAMP, easing: EASINGS.easeOut }) : 1;
  const W = 452, H = 58;
  return (
    <div style={{
      position: 'absolute', left: cx - W / 2, top: y, width: W, height: H,
      display: 'flex', alignItems: 'center', gap: 18, padding: '0 22px', boxSizing: 'border-box',
      background: COLORS.paper, border: `2px solid ${color}${done ? '33' : '99'}`,
      borderRadius: RADIUS.pill, boxShadow: SHADOW.soft,
      opacity: op * out * dim, transform: `translateY(${ty}px) scale(${sc})`,
    }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${color}16`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} strokeWidth={2.2} />
      </div>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 31, color: COLORS.ink }}>{label}</span>
      {done && <Check size={24} color={COLORS.signal} strokeWidth={3.2} style={{ marginLeft: 'auto' }} />}
    </div>
  );
};

const ROW_Y = [786, 852, 918, 984];
const LEFT_STEPS = [
  { at: FEED_AT, doneAt: APPROVE_AT, Icon: FilePlus, label: 'feed a note' },
  { at: APPROVE_AT, doneAt: COMMIT_AT, Icon: Check, label: 'approve' },
  { at: COMMIT_AT, doneAt: PUSH_AT, Icon: GitCommitHorizontal, label: 'commit' },
  { at: PUSH_AT, doneAt: LANDED_AT, Icon: ArrowUpFromLine, label: 'push' },
];
const RIGHT_STEPS = [
  { at: WEBHOOK_AT, doneAt: PULL_AT, Icon: Webhook, label: 'webhook' },
  { at: PULL_AT, doneAt: REINDEX_AT, Icon: ArrowDownToLine, label: 'pull' },
  { at: REINDEX_AT, doneAt: LIVE_AT, Icon: RefreshCw, label: 'reindex' },
  { at: LIVE_AT, doneAt: null, Icon: Globe, label: 'live' },
];

// -----------------------------------------------------------------------------
const CHIPS = [
  { at: SAME_AT, label: 'same repo' },
  { at: BOTH_AT, label: 'both directions' },
  { at: SYNC_AT, label: 'in sync' },
];

const B8Compose: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  // the repo card reacting to the push landing
  const landOp = r(LANDED_AT, LANDED_AT + 12);
  const landY = r(LANDED_AT, LANDED_AT + 12, 18, 0);
  const rootLit = interpolate(frame, [PUSH_PULSE[1] - 6, PUSH_PULSE[1] + 6, WEBHOOK_AT + 40, WEBHOOK_AT + 60], [0, 1, 1, 0], { ...CLAMP, easing: EASINGS.easeInOut });

  // reindex sweep on the online card
  const reindex = r(REINDEX_AT, REINDEX_AT + 34, 0, 1, EASINGS.easeInOut);
  const reindexOp = interpolate(frame, [REINDEX_AT, REINDEX_AT + 6, LIVE_AT - 4, LIVE_AT + 8], [0, 1, 1, 0], CLAMP);

  // the "both ways" badge between the heads
  const flipOp = interpolate(frame, [FLIP_AT, FLIP_AT + 12, FLIP_OUT, FLIP_OUT + 14], [0, 1, 1, 0], CLAMP);
  const flipSc = r(FLIP_AT, FLIP_AT + 16, 0.9, 1, EASINGS.overshoot);

  // headline swap
  const oldHead = 1 - r(SWAP_AT, SWAP_AT + 12, 0, 1, EASINGS.easeIn);
  const srcOp = r(SOURCE_AT, SOURCE_AT + 14);
  const srcY = r(SOURCE_AT, SOURCE_AT + 14, 22, 0);
  const doorOp = r(DOORS_AT, DOORS_AT + 12);
  const doorWipe = r(DOORLINE_AT, DOORLINE_AT + 10);

  const chipsOut = 1 - r(CHIPS_OUT, CHIPS_OUT + 12, 0, 1, EASINGS.easeIn);
  const strike = r(STRIKE_AT, STRIKE_AT + 12, 0, 1, EASINGS.easeOut);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* ---- the headline the whole video hangs on, already on screen ---- */}
      <div style={{ opacity: oldHead }}>
        <OneRepoTwoHeads frame={frame} oneAt={BUILT} headsAt={BUILT} />
      </div>

      {/* ---- the payoff headline: "One source, two doors." ---- */}
      <div style={{ position: 'absolute', top: HEADLINE_TOP, left: 0, width: 1920, textAlign: 'center' }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 72, lineHeight: 1.1, color: COLORS.ink, margin: 0 }}>
          <span style={{ display: 'inline-block', opacity: srcOp, transform: `translateY(${srcY}px)` }}>One source,&nbsp;</span>
          <span style={{ position: 'relative', display: 'inline-block', opacity: doorOp, color: COLORS.accent }}>
            <span style={{ position: 'absolute', left: -4, right: -4, bottom: -8, height: 8, borderRadius: 4, background: COLORS.accent, transform: `scaleX(${doorWipe})`, transformOrigin: 'left' }} />
            <span style={{ position: 'relative' }}>two doors.</span>
          </span>
        </h1>
      </div>

      {/* ---- ★ THE CALLBACK: same diagram, same top, cut in already drawn ---- */}
      <TwoHeads
        frame={frame}
        top={TOP}
        rootAt={BUILT}
        splitAt={BUILT}
        localAt={BUILT}
        localSubAt={BUILT}
        localPillAt={BUILT}
        onlineAt={BUILT}
        onlineSubAt={BUILT}
        onlinePillAt={BUILT}
      />

      {/* ---- packets running through the branches ---- */}
      <svg width={1920} height={BOX_H} style={{ position: 'absolute', left: 0, top: TOP }}>
        {/* push: local -> root */}
        <Packet frame={frame} d={BRANCH_L} a={PUSH_PULSE[0]} b={PUSH_PULSE[1]} up color={COLORS.signal} />
        {/* pull: root -> online */}
        <Packet frame={frame} d={BRANCH_R} a={PULL_PULSE[0]} b={PULL_PULSE[1]} up={false} color={COLORS.accent} />
        {/* the one throwaway line about the other direction: online -> root -> local */}
        <Packet frame={frame} d={BRANCH_R} a={REV_R[0]} b={REV_R[1]} up color={COLORS.accent2} />
        <Packet frame={frame} d={BRANCH_L} a={REV_L[0]} b={REV_L[1]} up={false} color={COLORS.accent2} />
      </svg>

      {/* ---- the repo card lights up as the commit lands ---- */}
      <div style={{
        position: 'absolute', left: ROOT.x - 10, top: ROOT.y - 10, width: ROOT.w + 20, height: ROOT.h + 20,
        border: `3px solid ${COLORS.accent}`, borderRadius: 22, opacity: rootLit * 0.9, pointerEvents: 'none',
      }} />

      {/* ---- "GitHub fires a webhook": a broadcast from the repo ---- */}
      {[0, 12, 24].map((d) => {
        const a = WEBHOOK_AT + d;
        if (frame < a || frame > a + 34) return null;
        const sc = interpolate(frame, [a, a + 34], [1, 1.34], { ...CLAMP, easing: EASINGS.easeOut });
        const op = interpolate(frame, [a, a + 34], [0.5, 0], { ...CLAMP, easing: EASINGS.easeOut });
        return (
          <div key={d} style={{
            position: 'absolute', left: ROOT.x - 10, top: ROOT.y - 10, width: ROOT.w + 20, height: ROOT.h + 20,
            border: `3px solid ${COLORS.accent}`, borderRadius: 22, opacity: op, transform: `scale(${sc})`,
          }} />
        );
      })}

      {/* ---- "+1 commit" on the repo ---- */}
      <div style={{
        position: 'absolute', left: ROOT.x + ROOT.w + 22, top: ROOT.y + 38, height: 48,
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px',
        background: COLORS.paper, border: `1.5px solid ${COLORS.signal}77`, borderRadius: RADIUS.pill,
        boxShadow: SHADOW.soft, opacity: landOp * (1 - interpolate(frame, [LISTS_OUT, LISTS_OUT + 14], [0, 1], CLAMP)),
        transform: `translateY(${landY}px)`,
      }}>
        <GitCommitHorizontal size={22} color={COLORS.signal} strokeWidth={2.4} />
        <span style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 24, color: COLORS.ink }}>+1 commit</span>
      </div>

      {/* ---- reindex sweep across the online head ---- */}
      <div style={{
        position: 'absolute', left: ONLINE.x + 2, top: ONLINE.y + ONLINE.h - 8, width: ONLINE.w - 4, height: 6,
        borderRadius: 3, background: `${COLORS.accent}22`, opacity: reindexOp, overflow: 'hidden',
      }}>
        <div style={{ width: '100%', height: '100%', background: COLORS.accent, transform: `scaleX(${reindex})`, transformOrigin: 'left' }} />
      </div>

      {/* ---- the two chains, each under its own head ---- */}
      {LEFT_STEPS.map((s, i) => (
        <StepPill key={s.label} frame={frame} at={s.at} doneAt={s.doneAt} Icon={s.Icon}
          label={s.label} color={COLORS.ink} cx={LOCAL.cx} y={ROW_Y[i]} />
      ))}
      {RIGHT_STEPS.map((s, i) => (
        <StepPill key={s.label} frame={frame} at={s.at} doneAt={s.doneAt} Icon={s.Icon}
          label={s.label} color={COLORS.accent} cx={ONLINE.cx} y={ROW_Y[i]} />
      ))}

      {/* ---- both-ways badge, sitting in the gap between the heads ---- */}
      <div style={{
        position: 'absolute', left: 960 - 34, top: ONLINE.y + 92, width: 68, height: 68,
        borderRadius: '50%', background: COLORS.paper, border: `2px solid ${COLORS.accent2}`,
        boxShadow: SHADOW.soft, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: flipOp, transform: `scale(${flipSc})`,
      }}>
        <ArrowLeftRight size={32} color={COLORS.accent2} strokeWidth={2.3} />
      </div>

      {/* ---- "same repo, both directions ... in sync" -> struck out ---- */}
      <div style={{
        position: 'absolute', left: 0, top: 846, width: 1920,
        display: 'flex', justifyContent: 'center', gap: 24, opacity: chipsOut,
      }}>
        {CHIPS.map((c, i) => {
          const op = interpolate(frame, [c.at, c.at + 13], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
          const y = interpolate(frame, [c.at, c.at + 13], [18, 0], { ...CLAMP, easing: EASINGS.easeOut });
          const isSync = i === 2;
          const struck = isSync ? strike : 0;
          return (
            <div key={c.label} style={{
              position: 'relative', display: 'flex', alignItems: 'center',
              background: COLORS.paper, boxShadow: SHADOW.soft,
              border: `2px solid ${struck > 0.05 ? COLORS.danger : `${COLORS.accent}55`}`,
              borderRadius: RADIUS.pill, padding: '16px 34px',
              opacity: op * (1 - struck * 0.42), transform: `translateY(${y}px)`,
            }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 36, color: COLORS.ink }}>{c.label}</span>
              {isSync && (
                <span style={{
                  position: 'absolute', left: 22, right: 22, top: '50%', height: 4, borderRadius: 2,
                  background: COLORS.danger, transform: `translateY(-2px) scaleX(${struck})`, transformOrigin: 'left',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* ---- payoff: one source ... ---- */}
      <div style={{
        position: 'absolute', left: ROOT.x - 14, top: ROOT.y - 14, width: ROOT.w + 28, height: ROOT.h + 28,
        border: `4px solid ${COLORS.accent}`, borderRadius: 24,
        opacity: r(ROOTRING_AT, ROOTRING_AT + 12),
        transform: `scale(${r(ROOTRING_AT, ROOTRING_AT + 18, 1.05, 1)})`,
      }} />

      {/* ---- ... and 2 doors ---- */}
      {[LOCAL, ONLINE].map((c, i) => (
        <div key={i}>
          <div style={{
            position: 'absolute', left: c.x - 14, top: c.y - 14, width: c.w + 28, height: c.h + 28,
            border: `4px solid ${COLORS.accent}`, borderRadius: 28,
            opacity: r(DOORLINE_AT, DOORLINE_AT + 12),
            transform: `scale(${r(DOORLINE_AT, DOORLINE_AT + 18, 1.04, 1)})`,
          }} />
          <div style={{
            position: 'absolute', left: c.cx - 105, top: c.y + c.h + 34, width: 210, height: 62,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 13,
            background: COLORS.paper, border: `2px solid ${COLORS.accent}`, borderRadius: RADIUS.pill,
            boxShadow: SHADOW.soft,
            opacity: r(DOORLINE_AT, DOORLINE_AT + 12),
            transform: `translateY(${r(DOORLINE_AT, DOORLINE_AT + 14, 16, 0)}px)`,
          }}>
            <DoorOpen size={28} color={COLORS.accent} strokeWidth={2.2} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink }}>door {i + 1}</span>
          </div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
export default B8Compose;
