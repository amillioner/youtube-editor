import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Laptop, Lock, FolderGit2, Code2, DoorOpen } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B6 (2/2) — the rehook. The local brain works, and it is walled inside one
// machine. He opens a door in that wall. The door is the two things B3 already
// established as the online head's surface (MCP + REST API), so this is a tease
// of B7, not a new claim.
//
// Master span 388.846967-400.346967 (local frame = round((t - 388.846967) * 30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//   "It's only on your   392.21 -> f11   the wall rises
//    machine."           392.51 -> f20   "this machine only" chip
//   "give it a door"     394.60 -> f83   (rise) / 395.18 -> f100 the gap opens
//   "connect"            396.94 -> f153  the rail draws through the doorway,
//                                        the door is labelled MCP · REST API
//   "any app you want."  398.45 -> f198  the consumers arrive, one per 6 frames,
//                                        the last landing on "want." (f222)
//   "real"               401.52 -> f290  the closing line assembles
//   "magic"              401.86 -> f300  indigo wipe
//   "begins."            402.56 -> f321
// Ends flush against B6ShockClip3 at 401.5148 so the gag is a hard cut punchline.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B6GiveItADoor', durationInSeconds: 11.5, fps: 30, width: 1920, height: 1080 };

const F_WALL = 11;
const F_ONLY = 20;
const F_GIVE = 83;
const F_DOOR = 100;
const F_CONNECT = 153;
const F_APPS = 198;
const F_MAGIC_A = 249;
const F_REAL = 290;
const F_MAGIC = 300;
const F_BEGINS = 321;

const AXIS = 530;
const CARD = { x: 140, y: 360, w: 560, h: 340 };
const WALL = { x: 830, w: 48, top: 240, bottom: 820 };
const GAP_H = 220;
const RAIL = { x: 700, w: 464 };

const APPS = ['Claude', 'Cursor', 'ChatGPT', 'n8n', 'your own app'];

const B6GiveItADoor: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const wallH = WALL.bottom - WALL.top;
  const gap = r(F_DOOR, F_DOOR + 18, 0, GAP_H, EASINGS.easeInOut);
  const segH = (wallH - gap) / 2;
  const wallOp = r(F_WALL, F_WALL + 14);
  const wallStripe = {
    background: COLORS.ink,
    backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0 10px, transparent 10px 20px)`,
  } as const;

  const railDraw = r(F_CONNECT, F_CONNECT + 18);
  const dotT = Math.max(0, frame - F_CONNECT);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* ---------------- your machine ---------------- */}
      <div style={{
        position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, boxSizing: 'border-box',
        background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
        opacity: r(0, 14), transform: `translateY(${r(0, 16, 20, 0)}px)`,
      }}>
        <Laptop size={52} color={COLORS.ink} strokeWidth={1.8} />
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink }}>your machine</div>
        <div style={{ display: 'flex', gap: 14 }}>
          {[
            { label: 'my-brain', Icon: FolderGit2 },
            { label: 'VS Code', Icon: Code2 },
          ].map((c) => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 50, padding: '0 18px', border: `1px solid ${COLORS.line}`, background: COLORS.cream, borderRadius: RADIUS.pill }}>
              <c.Icon size={21} color={COLORS.muted} strokeWidth={2} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 23, color: COLORS.ink }}>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- the wall, and the door in it ---------------- */}
      <div style={{ position: 'absolute', left: WALL.x, top: WALL.top, width: WALL.w, height: segH, borderRadius: 6, opacity: wallOp, ...wallStripe }} />
      <div style={{ position: 'absolute', left: WALL.x, top: WALL.bottom - segH, width: WALL.w, height: segH, borderRadius: 6, opacity: wallOp, ...wallStripe }} />
      {/* the opening glows */}
      <div style={{
        position: 'absolute', left: WALL.x - 6, top: AXIS - gap / 2, width: WALL.w + 12, height: gap,
        background: `linear-gradient(180deg, ${COLORS.accent}00, ${COLORS.accent}66, ${COLORS.accent}00)`,
        opacity: r(F_DOOR, F_DOOR + 16),
      }} />

      <div style={{
        position: 'absolute', left: WALL.x - 160, top: 168, width: 368, display: 'flex', justifyContent: 'center',
        opacity: r(F_ONLY, F_ONLY + 14) * (1 - r(F_DOOR, F_DOOR + 14)),
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 54, padding: '0 24px', background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill, boxShadow: SHADOW.soft }}>
          <Lock size={22} color={COLORS.muted} strokeWidth={2.2} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.muted }}>this machine only</span>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: WALL.x - 160, top: 168, width: 368, display: 'flex', justifyContent: 'center',
        opacity: r(F_DOOR, F_DOOR + 14), transform: `translateY(${r(F_DOOR, F_DOOR + 14, 12, 0)}px)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 54, padding: '0 24px', background: `${COLORS.accent}14`, border: `1px solid ${COLORS.accent}59`, borderRadius: RADIUS.pill }}>
          <DoorOpen size={22} color={COLORS.accent} strokeWidth={2.2} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.accent }}>a door</span>
        </div>
      </div>

      {/* the door has two leaves, and they are the ones B3 already named.
          It sits BELOW the wall (which ends at 820) so nothing overlaps it. */}
      <div style={{
        position: 'absolute', left: WALL.x - 184, top: 838, width: 416, textAlign: 'center',
        fontFamily: FONT_MONO, fontSize: 25, color: COLORS.accent,
        opacity: r(F_CONNECT, F_CONNECT + 14), transform: `translateY(${r(F_CONNECT, F_CONNECT + 14, 10, 0)}px)`,
      }}>
        MCP&nbsp;&nbsp;·&nbsp;&nbsp;REST API
      </div>

      {/* ---------------- the connection ---------------- */}
      <div style={{ position: 'absolute', left: RAIL.x, top: AXIS - 3, width: RAIL.w - 20, height: 6, borderRadius: 3, background: `${COLORS.accent}55`, transform: `scaleX(${railDraw})`, transformOrigin: 'left' }} />
      <div style={{
        position: 'absolute', left: RAIL.x + RAIL.w - 20, top: AXIS - 13, width: 0, height: 0,
        borderTop: '13px solid transparent', borderBottom: '13px solid transparent', borderLeft: `20px solid ${COLORS.accent}`,
        opacity: r(F_CONNECT + 12, F_CONNECT + 22),
      }} />
      {[0, 1, 2, 3].map((k) => {
        const p = ((dotT * 0.011) + k / 4) % 1;
        return (
          <div key={k} style={{
            position: 'absolute', left: RAIL.x + p * (RAIL.w - 26) - 7, top: AXIS - 7,
            width: 14, height: 14, borderRadius: '50%', background: COLORS.accent, opacity: railDraw,
          }} />
        );
      })}

      {/* ---------------- any app you want ---------------- */}
      {APPS.map((name, i) => {
        const at = F_APPS + i * 6;
        return (
          <div key={name} style={{
            position: 'absolute', left: 1200, top: 300 + i * 96, width: 560, height: 76, boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', gap: 16, padding: '0 26px',
            background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.soft,
            opacity: r(at, at + 14), transform: `translateX(${r(at, at + 14, -22, 0)}px)`,
          }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', background: COLORS.accent }} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink }}>{name}</span>
          </div>
        );
      })}

      {/* ---------------- the rehook line ---------------- */}
      <div style={{
        position: 'absolute', left: 0, top: 900, width: 1920, textAlign: 'center',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 60, color: COLORS.ink,
        opacity: r(F_MAGIC_A, F_MAGIC_A + 14), transform: `translateY(${r(F_MAGIC_A, F_MAGIC_A + 14, 18, 0)}px)`,
      }}>
        <span>And here&rsquo;s where the </span>
        <span style={{ opacity: r(F_REAL, F_REAL + 10) }}>real </span>
        <span style={{ position: 'relative', display: 'inline-block', opacity: r(F_MAGIC, F_MAGIC + 10) }}>
          <span style={{ position: 'absolute', left: -8, right: -8, bottom: -4, height: 22, borderRadius: 6, background: `${COLORS.accent}59`, transform: `scaleX(${r(F_MAGIC + 2, F_MAGIC + 12)})`, transformOrigin: 'left', zIndex: 0 }} />
          <span style={{ position: 'relative', zIndex: 1 }}>magic</span>
        </span>
        <span style={{ opacity: r(F_BEGINS, F_BEGINS + 10) }}> begins.</span>
      </div>
    </AbsoluteFill>
  );
};
export default B6GiveItADoor;
