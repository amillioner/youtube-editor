import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Server, KeyRound, Lock, Check, FileText } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { GhMark, Wipe } from './B7kit';

// =============================================================================
// B7 (10/16) — why a read key is not enough. Master span 501.996967 -> 513.396967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 501.996967) * 30)).
//   "The key you just added"  505.11 -> f3    read lane draws, key chip
//   "is read-only,"           506.65 -> f50   the read-only badge (warn = the limit)
//   "approve something."      509.02 -> f121  the approve row inside the server
//   "We need to write to"     510.26 -> f158  the write lane appears, dashed, locked
//   "our brain."              510.88 -> f176  the note chip parks at the lane head
//   "push to GitHub,"         513.03 -> f241  the note travels and hits the lock
//   "needs permission"        515.05 -> f302  the warn badge under the lock
//   "to write."               515.68 -> f320  the payoff line, indigo wipe
// Concept beat, so it is a diagram, not UI (brand.md §7). The lock is still shut
// at the end on purpose: the token beat is what opens it.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7ReadOnlyWrite', durationInSeconds: 11.4, fps: 30, width: 1920, height: 1080 };

const F_READ = 3;
const F_KEY = 32;
const F_RO = 50;
const F_APPROVE = 121;
const F_APPROVED = 133;
const F_WLANE = 158;
const F_NOTE = 176;
const F_PUSH = 241;
const F_HIT = 256;
const F_PERM = 302;
const F_WRITE = 320;

const SRV = { x: 210, y: 340, w: 420, h: 360 };
const GHB = { x: 1290, y: 340, w: 420, h: 360 };
const LANE_A_Y = 432;
const LANE_B_Y = 606;
const LANE_X0 = SRV.x + SRV.w;      // 630
const LANE_X1 = GHB.x;              // 1290
// The lock is a barrier, so the travelling note is stopped SHORT of it with a
// visible gap — fixed width keeps the pill's right edge known, no overlap.
const LOCK_X = LANE_X1 - 46;        // 1244, the lock circle's left edge
const NOTE_W = 244;
const NOTE_GAP = 32;
const NOTE_X0 = LANE_X0 + 30;                    // 660, parked at the lane head
const NOTE_STOP = LOCK_X - NOTE_GAP - NOTE_W;    // 968, right edge lands at 1212

const B7ReadOnlyWrite: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });
  const rise = (at: number, dist = 20) => ({
    opacity: r(at, at + 14),
    transform: `translateY(${r(at, at + 14, dist, 0)}px)`,
  });

  const nodeOp = r(0, 14);
  const readDraw = r(F_READ, F_READ + 18, 0, 1, EASINGS.easeInOut);
  const wLaneOp = r(F_WLANE, F_WLANE + 14);
  const pushDraw = r(F_PUSH, F_HIT, 0, 1, EASINGS.easeInOut);
  // travels, is stopped by the lock, recoils a touch and settles short of it
  const noteX = interpolate(
    frame,
    [F_PUSH, F_HIT, F_HIT + 7, F_HIT + 18],
    [NOTE_X0, NOTE_STOP, NOTE_STOP - 22, NOTE_STOP - 8],
    { ...CLAMP, easing: EASINGS.easeInOut },
  );
  const hitShake = frame >= F_HIT && frame < F_HIT + 14
    ? Math.sin((frame - F_HIT) * 1.5) * (1 - (frame - F_HIT) / 14) * 6
    : 0;
  const lockCol = frame >= F_HIT ? COLORS.danger : COLORS.muted;

  const card: React.CSSProperties = {
    position: 'absolute', background: COLORS.paper, border: `1px solid ${COLORS.line}`,
    borderRadius: RADIUS.card, boxShadow: SHADOW.card, opacity: nodeOp,
  };

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', ...rise(F_READ, 14), fontFamily: FONT_MONO, fontSize: 27, letterSpacing: 5, color: COLORS.muted }}>
        WHAT&nbsp;THE&nbsp;SERVER&nbsp;IS&nbsp;ALLOWED&nbsp;TO&nbsp;DO
      </div>

      {/* ---------------- the server ---------------- */}
      <div style={{ ...card, left: SRV.x, top: SRV.y, width: SRV.w, height: SRV.h }}>
        <div style={{ position: 'absolute', left: 30, top: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
          <Server size={34} color={COLORS.accent} strokeWidth={2} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 34, color: COLORS.ink }}>your server</span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 82, fontFamily: FONT_MONO, fontSize: 21, color: COLORS.muted }}>brain.learnwithhasan.com</div>

        {/* the thing you approve */}
        <div style={{ position: 'absolute', left: 30, top: 150, width: SRV.w - 60, opacity: r(F_APPROVE, F_APPROVE + 12), transform: `translateY(${r(F_APPROVE, F_APPROVE + 12, 14, 0)}px)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 62, padding: '0 18px', background: COLORS.cream, border: `1px solid ${COLORS.line}`, borderRadius: 10 }}>
            <FileText size={21} color={COLORS.muted} strokeWidth={2} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.ink }}>note: my cost story</span>
          </div>
          <div style={{
            marginTop: 16, height: 58, borderRadius: 10,
            background: frame >= F_APPROVED ? `${COLORS.signal}1f` : COLORS.accent,
            border: `1px solid ${frame >= F_APPROVED ? COLORS.signal : COLORS.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontSize: 23, fontWeight: 600, color: frame >= F_APPROVED ? COLORS.signal : COLORS.paper,
          }}>
            {frame >= F_APPROVED ? <><Check size={21} color={COLORS.signal} strokeWidth={3.2} />approved</> : 'Approve'}
          </div>
        </div>
      </div>

      {/* ---------------- GitHub ---------------- */}
      <div style={{ ...card, left: GHB.x, top: GHB.y, width: GHB.w, height: GHB.h }}>
        <div style={{ position: 'absolute', left: 30, top: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
          <GhMark size={34} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 34, color: COLORS.ink }}>GitHub</span>
        </div>
        <div style={{ position: 'absolute', left: 30, top: 82, fontFamily: FONT_MONO, fontSize: 21, color: COLORS.muted }}>hassancs91/my-brain</div>
        <div style={{ position: 'absolute', left: 30, top: 150, width: GHB.w - 60, fontSize: 22, color: COLORS.muted, lineHeight: 1.5 }}>
          the copy that survives the server
        </div>
      </div>

      {/* ---------------- lane A: read (GitHub -> server) ---------------- */}
      <div style={{ position: 'absolute', left: LANE_X0, top: LANE_A_Y - 3, width: LANE_X1 - LANE_X0, height: 6, borderRadius: 3, background: COLORS.signal, transform: `scaleX(${readDraw})`, transformOrigin: 'right' }} />
      <div style={{ position: 'absolute', left: LANE_X0 - 2, top: LANE_A_Y - 14, opacity: r(F_READ + 14, F_READ + 22) }}>
        <svg width={26} height={28} viewBox="0 0 26 28"><path d="M26 0 L26 28 L0 14 Z" fill={COLORS.signal} /></svg>
      </div>
      <div style={{ position: 'absolute', left: LANE_X0, top: LANE_A_Y - 54, width: LANE_X1 - LANE_X0, textAlign: 'center', opacity: readDraw, fontFamily: FONT_MONO, fontSize: 24, color: COLORS.signal }}>
        clone and pull
      </div>
      <div style={{
        position: 'absolute', left: 800, top: LANE_A_Y + 22, display: 'flex', alignItems: 'center', gap: 12,
        height: 50, padding: '0 20px', borderRadius: RADIUS.pill, background: COLORS.paper,
        border: `1px solid ${COLORS.line}`, boxShadow: SHADOW.soft,
        opacity: r(F_KEY, F_KEY + 12), transform: `translateY(${r(F_KEY, F_KEY + 12, 12, 0)}px)`,
      }}>
        <KeyRound size={20} color={COLORS.muted} strokeWidth={2.1} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 21, color: COLORS.ink }}>deploy key</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', height: 34, padding: '0 14px', borderRadius: RADIUS.pill,
          background: `${COLORS.warn}33`, border: `1px solid ${COLORS.warn}`, color: COLORS.ink,
          fontFamily: FONT_MONO, fontSize: 19, opacity: r(F_RO, F_RO + 12),
        }}>read only</span>
      </div>

      {/* ---------------- lane B: write (server -> GitHub), blocked ---------- */}
      <div style={{ position: 'absolute', left: LANE_X0, top: LANE_B_Y - 3, width: LANE_X1 - LANE_X0, height: 6, borderRadius: 3, opacity: wLaneOp, background: `repeating-linear-gradient(90deg, ${COLORS.line} 0 18px, transparent 18px 34px)` }} />
      <div style={{ position: 'absolute', left: LANE_X0, top: LANE_B_Y - 3, width: LANE_X1 - LANE_X0, height: 6, borderRadius: 3, background: COLORS.accent, transform: `scaleX(${pushDraw})`, transformOrigin: 'left', opacity: wLaneOp }} />
      <div style={{ position: 'absolute', left: LANE_X0, top: LANE_B_Y + 26, width: LANE_X1 - LANE_X0, textAlign: 'center', opacity: wLaneOp, fontFamily: FONT_MONO, fontSize: 24, color: frame >= F_PUSH ? COLORS.accent : COLORS.muted }}>
        push
      </div>

      {/* the approved note travelling the write lane */}
      {frame >= F_NOTE && (
        <div style={{
          position: 'absolute', left: frame >= F_PUSH ? noteX : NOTE_X0, top: LANE_B_Y - 62,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: NOTE_W, height: 50, padding: '0 18px', boxSizing: 'border-box',
          borderRadius: RADIUS.pill, background: `${COLORS.signal}1a`, border: `1px solid ${COLORS.signal}`,
          fontFamily: FONT_MONO, fontSize: 21, color: COLORS.signal,
          opacity: r(F_NOTE, F_NOTE + 12),
        }}>
          <Check size={18} color={COLORS.signal} strokeWidth={3.2} />approved note
        </div>
      )}

      {/* the lock at GitHub's door */}
      <div style={{
        position: 'absolute', left: LANE_X1 - 46, top: LANE_B_Y - 46, width: 92, height: 92, borderRadius: '50%',
        background: COLORS.paper, border: `3px solid ${lockCol}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: SHADOW.soft, opacity: wLaneOp, transform: `translateX(${hitShake}px)`,
      }}>
        <Lock size={40} color={lockCol} strokeWidth={2.2} />
      </div>
      <div style={{
        position: 'absolute', left: LANE_X1 - 118, top: LANE_B_Y + 66, width: 236, textAlign: 'center',
        display: 'flex', justifyContent: 'center',
      }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', height: 46, padding: '0 20px', borderRadius: RADIUS.pill,
          background: `${COLORS.warn}22`, border: `1px solid ${COLORS.warn}`, color: COLORS.ink,
          fontFamily: FONT_MONO, fontSize: 21, whiteSpace: 'nowrap',
          opacity: r(F_PERM, F_PERM + 12), transform: `translateY(${r(F_PERM, F_PERM + 12, 12, 0)}px)`,
        }}>write permission</span>
      </div>

      {/* ---------------- payoff line ---------------- */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 806, textAlign: 'center',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: COLORS.ink,
        opacity: r(F_PERM - 12, F_PERM + 2), transform: `translateY(${r(F_PERM - 12, F_PERM + 2, 22, 0)}px)`,
      }}>
        The server needs permission to <Wipe at={F_WRITE}>write.</Wipe>
      </div>
    </AbsoluteFill>
  );
};
export default B7ReadOnlyWrite;
