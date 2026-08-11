// =============================================================================
// TwoHeads — the video-1 signature diagram. ONE repo at the root, TWO heads
// branching out of it: LOCAL (calm / private / ink) and ONLINE (accent / signal),
// with optional MCP + API endpoint chips hanging off the ONLINE head.
//
// This is a PLAIN React component on purpose:
//   · no `compositionConfig`  -> gen-registry skips it, it is not a shot
//   · no `useCurrentFrame()`  -> the caller passes `frame`, so any shot can drive
//     it on a completely different schedule (B3 introduces it, B8 calls it back)
//
// -----------------------------------------------------------------------------
// PROPS  (every *At value is a frame number on the CALLER's clock)
// -----------------------------------------------------------------------------
//   frame           number   REQUIRED. the driving clock.
//   top             number   y of the diagram box on the 1920x1080 canvas (default 250).
//                            The box is 1920 wide; 504 tall without endpoints,
//                            640 tall with them.
//   rootAt          number   root repo card rises in                (default 0)
//   splitAt         number   branch lines draw + the two EMPTY head slots
//                            ("head 1" / "head 2") appear. THIS is the
//                            "it has 2 heads" beat.                 (default rootAt + 60)
//   localAt         number   slot 1 turns into the LOCAL head       (default splitAt + 60)
//   localSubAt      number   local sub-caption lands                (default localAt + 20)
//   localPillAt     number   local pill ("private") lands           (default localSubAt + 20)
//   onlineAt        number   slot 2 turns into the ONLINE head      (default localAt + 90)
//   onlineSubAt     number   online sub-caption lands               (default onlineAt + 20)
//   onlinePillAt    number   online pill ("published") lands        (default onlineSubAt + 20)
//
//   localTitle / localSub / localPill        string  copy overrides
//   onlineTitle / onlineSub / onlinePill     string  copy overrides
//   rootName / rootSub                       string  copy overrides for the root card
//
//   endpoints       TwoHeadsEndpoint[]   chips attached UNDER the online head.
//                            { label, sub?, icon?: 'mcp' | 'api', at }. Omit for none.
//   endpointsAt     number   OVERRIDE: draw both connectors at this one frame.
//                            By default each connector draws 12 frames ahead of
//                            its own chip, so each path arrives on its own word.
//
//   emphasis        'none' | 'local' | 'online'   dims the OTHER head (default 'none')
//   emphasisAt      number   frame the dim ramp starts   (default -60, i.e. already applied)
//   emphasisDim     number   opacity of the dimmed head  (default 0.26)
//
// -----------------------------------------------------------------------------
// USAGE
// -----------------------------------------------------------------------------
//   build it live:      <TwoHeads frame={frame} rootAt={26} splitAt={158}
//                                 localAt={240} onlineAt={464} />
//   already built (a callback shot / a second cut on the same picture):
//                       <TwoHeads frame={frame} rootAt={-90} splitAt={-90}
//                                 localAt={-90} onlineAt={-90}
//                                 localSubAt={-90} localPillAt={-90}
//                                 onlineSubAt={-90} onlinePillAt={-90}
//                                 emphasis="online" emphasisAt={66}
//                                 endpoints={[{label:'MCP', icon:'mcp', at:196}, ...]} />
//   Negative cues clamp to "finished", so the diagram cuts in fully drawn and the
//   geometry is identical between shots — a hard cut between two shots that both
//   render TwoHeads at the same `top` reads as one continuous image.
// =============================================================================
import React from 'react';
import { interpolate } from 'remotion';
import { Laptop, Globe, Lock, Share2, Plug, Braces } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../../fonts';
import { CLAMP } from '../../../lib/kit';
import { GithubMark } from './marks';

// ---- the two head identities -------------------------------------------------
export const LOCAL_COLOR = COLORS.ink; // calm, private
export const ONLINE_COLOR = COLORS.accent; // signal side

// ---- fixed geometry (box coordinates, 1920 wide) -----------------------------
const ROOT = { x: 680, y: 0, w: 560, h: 124 };
const HEAD = { y: 252, w: 540, h: 252 };
const LEFT_X = 350; // left card left edge  -> center 620
const RIGHT_X = 1030; // right card left edge -> center 1300
const BRANCH_LEN = 456; // both branch paths are the same length (symmetry)
const BRANCH_L = 'M 960 124 V 168 Q 960 182 946 182 H 634 Q 620 182 620 196 V 252';
const BRANCH_R = 'M 960 124 V 168 Q 960 182 974 182 H 1286 Q 1300 182 1300 196 V 252';
const EP_LEN = 181;
const EP_L = 'M 1300 504 V 520 Q 1300 532 1288 532 H 1177 Q 1165 532 1165 544 V 560';
const EP_R = 'M 1300 504 V 520 Q 1300 532 1312 532 H 1423 Q 1435 532 1435 544 V 560';
const EP_CHIP = { y: 560, w: 230, h: 74 };
export const TWO_HEADS_H = 640; // full box height (with endpoints); 504 without

export type TwoHeadsEndpoint = {
  label: string;
  sub?: string;
  icon?: 'mcp' | 'api';
  at: number;
};

export type TwoHeadsProps = {
  frame: number;
  top?: number;
  rootAt?: number;
  splitAt?: number;
  localAt?: number;
  localSubAt?: number;
  localPillAt?: number;
  onlineAt?: number;
  onlineSubAt?: number;
  onlinePillAt?: number;
  rootName?: string;
  rootSub?: string;
  localTitle?: string;
  localSub?: string;
  localPill?: string;
  onlineTitle?: string;
  onlineSub?: string;
  onlinePill?: string;
  endpoints?: TwoHeadsEndpoint[];
  endpointsAt?: number;
  emphasis?: 'none' | 'local' | 'online';
  emphasisAt?: number;
  emphasisDim?: number;
};

// -----------------------------------------------------------------------------
// one head slot: a dashed empty slot that becomes a filled card on `at`
// -----------------------------------------------------------------------------
const HeadSlot: React.FC<{
  frame: number;
  x: number;
  slotAt: number;
  at: number;
  subAt: number;
  pillAt: number;
  n: string;
  color: string;
  title: string;
  sub: string;
  pill: string;
  kind: 'local' | 'online';
}> = ({ frame, x, slotAt, at, subAt, pillAt, n, color, title, sub, pill, kind }) => {
  const slotOp = interpolate(frame, [slotAt, slotAt + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ghostOut = 1 - interpolate(frame, [at - 6, at + 8], [0, 1], { ...CLAMP, easing: EASINGS.easeIn });
  const cardOp = interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const cardSc = interpolate(frame, [at, at + 18], [0.97, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const barX = interpolate(frame, [at + 6, at + 24], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const subOp = interpolate(frame, [subAt, subAt + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const subY = interpolate(frame, [subAt, subAt + 14], [14, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const pillOp = interpolate(frame, [pillAt, pillAt + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const pillSc = interpolate(frame, [pillAt, pillAt + 14], [0.94, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const Icon = kind === 'local' ? Laptop : Globe;
  const PillIcon = kind === 'local' ? Lock : Share2;

  return (
    <div style={{ position: 'absolute', left: x, top: HEAD.y, width: HEAD.w, height: HEAD.h }}>
      {/* empty slot ("head 1" / "head 2") */}
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: RADIUS.card,
          border: `2px dashed ${COLORS.muted}55`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
          opacity: slotOp * ghostOut,
        }}
      >
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 92, lineHeight: 1, color: `${COLORS.muted}66` }}>{n}</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: `${COLORS.muted}aa` }}>head</span>
      </div>

      {/* the real head card */}
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: RADIUS.card, overflow: 'hidden',
          background: COLORS.paper, border: `2px solid ${color}`, boxShadow: SHADOW.card,
          opacity: cardOp, transform: `scale(${cardSc})`,
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, padding: '26px 34px',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 6, background: color, transform: `scaleX(${barX})`, transformOrigin: 'left' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 36 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 21, letterSpacing: 3, color }}>HEAD&nbsp;{n}</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 9,
            background: `${COLORS.signal}16`, border: `1px solid ${COLORS.signal}44`,
            borderRadius: RADIUS.pill, padding: '7px 16px',
            opacity: pillOp, transform: `scale(${pillSc})`,
          }}>
            <PillIcon size={19} color={COLORS.signal} strokeWidth={2.4} />
            <span style={{ fontFamily: FONT_BODY, fontWeight: 600, fontSize: 22, color: COLORS.ink }}>{pill}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 76, height: 76, borderRadius: '50%', background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={38} color={color} strokeWidth={2} />
          </div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: COLORS.ink }}>{title}</span>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 27, color: COLORS.muted, opacity: subOp, transform: `translateY(${subY}px)` }}>{sub}</div>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
export const TwoHeads: React.FC<TwoHeadsProps> = ({
  frame,
  top = 250,
  rootAt = 0,
  splitAt,
  localAt,
  localSubAt,
  localPillAt,
  onlineAt,
  onlineSubAt,
  onlinePillAt,
  rootName = 'brain',
  rootSub = 'markdown files in a git repo',
  localTitle = 'Local',
  localSub = 'runs on your own computer',
  localPill = 'private',
  onlineTitle = 'Online',
  onlineSub = 'reachable from anywhere',
  onlinePill = 'published',
  endpoints,
  endpointsAt,
  emphasis = 'none',
  emphasisAt = -60,
  emphasisDim = 0.26,
}) => {
  const _split = splitAt ?? rootAt + 60;
  const _local = localAt ?? _split + 60;
  const _localSub = localSubAt ?? _local + 20;
  const _localPill = localPillAt ?? _localSub + 20;
  const _online = onlineAt ?? _local + 90;
  const _onlineSub = onlineSubAt ?? _online + 20;
  const _onlinePill = onlinePillAt ?? _onlineSub + 20;
  const eps = endpoints ?? [];

  const rootOp = interpolate(frame, [rootAt, rootAt + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const rootY = interpolate(frame, [rootAt, rootAt + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const draw = interpolate(frame, [_split, _split + 22], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const litL = interpolate(frame, [_local, _local + 18], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const litR = interpolate(frame, [_online, _online + 18], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });

  // emphasis: ramp the OTHER head down
  const emph = interpolate(frame, [emphasisAt, emphasisAt + 18], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const dimFor = (side: 'local' | 'online') =>
    emphasis === 'none' || emphasis === side ? 1 : 1 - emph * (1 - emphasisDim);

  return (
    <div style={{ position: 'absolute', left: 0, top, width: 1920, height: TWO_HEADS_H, fontFamily: FONT_BODY }}>
      {/* ---------------- root: the one repo ---------------- */}
      <div
        style={{
          position: 'absolute', left: ROOT.x, top: ROOT.y, width: ROOT.w, height: ROOT.h,
          background: COLORS.d900, border: `1.5px solid ${COLORS.d600}`, borderRadius: RADIUS.card,
          boxShadow: SHADOW.card, padding: '22px 28px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10,
          opacity: rootOp, transform: `translateY(${rootY}px)`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <GithubMark size={32} color={COLORS.d300} />
          <span style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 34, color: COLORS.d300 }}>{rootName}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Lock size={17} color={COLORS.signal} strokeWidth={2.4} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 19, color: COLORS.signal }}>private</span>
          </div>
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.d400 }}>{rootSub}</div>
      </div>

      {/* ---------------- branches ---------------- */}
      {/* the paths are only mounted once their draw has started — a round cap on a
          fully-offset dash still paints a dot, which would leak before the cue */}
      <svg width={1920} height={TWO_HEADS_H} style={{ position: 'absolute', left: 0, top: 0 }}>
        {frame >= _split && (
          <>
            {[BRANCH_L, BRANCH_R].map((d, i) => (
              <path
                key={`base${i}`} d={d} fill="none" stroke={COLORS.muted} strokeOpacity={0.3}
                strokeWidth={3} strokeLinecap="round"
                strokeDasharray={BRANCH_LEN} strokeDashoffset={BRANCH_LEN * (1 - draw)}
              />
            ))}
            <path
              d={BRANCH_L} fill="none" stroke={LOCAL_COLOR} strokeOpacity={litL * dimFor('local') * 0.65}
              strokeWidth={3} strokeLinecap="round"
              strokeDasharray={BRANCH_LEN} strokeDashoffset={BRANCH_LEN * (1 - draw)}
            />
            <path
              d={BRANCH_R} fill="none" stroke={ONLINE_COLOR} strokeOpacity={litR * dimFor('online')}
              strokeWidth={3} strokeLinecap="round"
              strokeDasharray={BRANCH_LEN} strokeDashoffset={BRANCH_LEN * (1 - draw)}
            />
          </>
        )}
        {eps.slice(0, 2).map((e, i) => {
          const start = endpointsAt ?? e.at - 12;
          if (frame < start) return null;
          const d = interpolate(frame, [start, start + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
          return (
            <path
              key={`ep${i}`} d={i === 0 ? EP_L : EP_R} fill="none"
              stroke={ONLINE_COLOR} strokeOpacity={0.55 * dimFor('online')}
              strokeWidth={3} strokeLinecap="round"
              strokeDasharray={EP_LEN} strokeDashoffset={EP_LEN * (1 - d)}
            />
          );
        })}
      </svg>

      {/* ---------------- the two heads ---------------- */}
      <div style={{ opacity: dimFor('local') }}>
        <HeadSlot
          frame={frame} x={LEFT_X} slotAt={_split} at={_local} subAt={_localSub} pillAt={_localPill}
          n="1" color={LOCAL_COLOR} title={localTitle} sub={localSub} pill={localPill} kind="local"
        />
      </div>
      <div style={{ opacity: dimFor('online') }}>
        <HeadSlot
          frame={frame} x={RIGHT_X} slotAt={_split} at={_online} subAt={_onlineSub} pillAt={_onlinePill}
          n="2" color={ONLINE_COLOR} title={onlineTitle} sub={onlineSub} pill={onlinePill} kind="online"
        />
      </div>

      {/* ---------------- endpoints off the online head ---------------- */}
      {eps.slice(0, 2).map((e, i) => {
        const op = interpolate(frame, [e.at, e.at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
        const y = interpolate(frame, [e.at, e.at + 14], [18, 0], { ...CLAMP, easing: EASINGS.easeOut });
        const cx = i === 0 ? 1165 : 1435;
        const EIcon = e.icon === 'api' ? Braces : Plug;
        return (
          <div
            key={e.label}
            style={{
              position: 'absolute', left: cx - EP_CHIP.w / 2, top: EP_CHIP.y, width: EP_CHIP.w, height: EP_CHIP.h,
              background: COLORS.paper, border: `2px solid ${ONLINE_COLOR}`, borderRadius: RADIUS.card,
              boxShadow: SHADOW.soft, display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px',
              opacity: op * dimFor('online'), transform: `translateY(${y}px)`,
            }}
          >
            <EIcon size={28} color={ONLINE_COLOR} strokeWidth={2.2} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontFamily: FONT_MONO, fontWeight: 700, fontSize: 30, color: COLORS.ink, lineHeight: 1.1 }}>{e.label}</span>
              {e.sub && <span style={{ fontFamily: FONT_BODY, fontSize: 18, color: COLORS.muted }}>{e.sub}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
