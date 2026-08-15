// video-2 shared kit — the illustrated content factory (no compositionConfig).
// A flat conveyor-belt machine in the brand palette (paper/indigo/coral) that
// fills the bottom ~40% of every cutaway from 4:37 on. 7 stations = the
// narration's steps (read → discover → plan → lab → screenshots → write →
// verify+ship). A glowing PIECE.md token rides the belt; the narrated station
// lights up and works the piece. Rendered identically by every beat so the
// whole section reads as ONE take (band present from f0, no entrance) — except
// B4, which assembles/powers it on via `assembleAt` and drops the piece in
// via `dropAt`. Frame-based only; monotonic interpolate + clamp.
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import {
  BookOpen, Radar, ClipboardList, FlaskConical, Camera, PenLine, BadgeCheck, Cog,
} from 'lucide-react';
import { COLORS, EASINGS } from '../../../brand';
import { FONT_MONO } from '../../../fonts';
import { CLAMP } from '../../../lib/kit';

export const CORAL = '#cd8064'; // the Claude coral — the factory's "power" color

export const STATIONS = [
  { key: 'read', label: 'READ', Icon: BookOpen },
  { key: 'discover', label: 'DISCOVER', Icon: Radar },
  { key: 'plan', label: 'PLAN', Icon: ClipboardList },
  { key: 'lab', label: 'LAB', Icon: FlaskConical },
  { key: 'shots', label: 'SCREENSHOTS', Icon: Camera },
  { key: 'write', label: 'WRITE', Icon: PenLine },
  { key: 'verify', label: 'VERIFY + SHIP', Icon: BadgeCheck },
] as const;

// station center xs (band coordinates, 1920 wide) — rail starts at 250 so the
// hopper sits clearly at the left of station 1 (ROUND-6)
export const STATION_X = [250, 490, 730, 970, 1210, 1450, 1690] as const;
const ENTRY_X = 70; // the hopper mouth, where the piece drops in
export const BAND_H = 432; // the band fills the bottom 40% of 1080
export const BAND_Y = 1080 - BAND_H;

const HEAD_W = 172;
const HEAD_H = 112;
const HEAD_Y = 66; // head top
const BELT_Y = 250; // belt top
const BELT_H = 58;
const PIECE_W = 86;
const PIECE_H = 100;

const px = (i: number) => (i < 0 ? ENTRY_X : STATION_X[i]);

export const FactoryLine: React.FC<{
  station: number;      // narrated station index 0..6 (-1 = none yet, B4)
  pieceFrom?: number;   // station the piece starts at (-1 = hopper); default = station
  advanceAt?: number;   // frame the piece starts sliding pieceFrom -> station
  assembleAt?: number;  // if set, the machine assembles + powers on at this frame
  dropAt?: number;      // frame the piece drops onto the belt (B4 only)
  showPiece?: boolean;
}> = ({ station, pieceFrom, advanceAt = 0, assembleAt, dropAt, showPiece = true }) => {
  const frame = useCurrentFrame();
  const from = pieceFrom ?? station;
  const ease = { ...CLAMP, easing: EASINGS.easeOut };

  // --- assembly / power-on ---------------------------------------------------
  const asm = assembleAt ?? -9999; // already assembled when unset
  const bandY = interpolate(frame, [asm, asm + 16], [BAND_H, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const beltSx = interpolate(frame, [asm + 8, asm + 26], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const powerOn = asm + 26;
  const run = Math.max(0, frame - powerOn); // machine time (gears, treads move only when on)

  // --- the piece -------------------------------------------------------------
  const slide = interpolate(frame, [advanceAt, advanceAt + 26], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const pieceX = px(from) + (px(station) - px(from)) * slide;
  const arrived = from === station ? advanceAt : advanceAt + 26;
  // drop-in (B4): falls from above the band into the hopper
  const dropY = dropAt === undefined ? 0 : interpolate(frame, [dropAt, dropAt + 12], [-260, 0], { ...CLAMP, easing: EASINGS.easeIn });
  const dropSettle = dropAt === undefined ? 1 : interpolate(frame, [dropAt + 12, dropAt + 20], [1.04, 1], ease);
  const pieceVisible = showPiece && (dropAt === undefined || frame >= dropAt);
  const idleBob = Math.sin(frame / 9) * 1.5;
  const glowPulse = 0.55 + 0.45 * Math.abs(Math.sin(frame / 13));

  return (
    <div style={{
      position: 'absolute', left: 0, top: BAND_Y, width: 1920, height: BAND_H,
      transform: `translateY(${bandY}px)`, zIndex: 10, overflow: 'hidden',
      background: COLORS.cream, borderTop: `1px solid ${COLORS.line}`,
      boxShadow: '0 -12px 34px rgba(26,26,46,0.07)', fontFamily: FONT_MONO,
    }}>
      {/* faint dotted grid, same texture as BrandBg */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(${COLORS.line} 1.5px, transparent 1.5px)`, backgroundSize: '46px 46px', opacity: 0.4 }} />

      {/* decorative gears (power visible: they only turn once the machine is on) */}
      <div style={{ position: 'absolute', left: 22, top: 20, opacity: 0.4, transform: `rotate(${run * 1.1}deg)` }}>
        <Cog size={56} color={COLORS.muted} strokeWidth={1.4} />
      </div>
      <div style={{ position: 'absolute', left: 66, top: 58, opacity: 0.3, transform: `rotate(${-run * 1.6}deg)` }}>
        <Cog size={38} color={COLORS.muted} strokeWidth={1.4} />
      </div>
      <div style={{ position: 'absolute', right: 30, top: 26, opacity: 0.35, transform: `rotate(${-run * 0.9}deg)` }}>
        <Cog size={48} color={COLORS.muted} strokeWidth={1.4} />
      </div>

      {/* the hopper (input funnel) over the belt's left end */}
      <div style={{ position: 'absolute', left: ENTRY_X - 52, top: HEAD_Y + 6 }}>
        <svg width={104} height={BELT_Y - HEAD_Y - 6} viewBox={`0 0 104 ${BELT_Y - HEAD_Y - 6}`}>
          <path d={`M 6 0 L 98 0 L 68 74 L 68 ${BELT_Y - HEAD_Y - 14} L 36 ${BELT_Y - HEAD_Y - 14} L 36 74 Z`}
            fill={COLORS.paper} stroke={COLORS.ink} strokeWidth={2.5} strokeLinejoin="round" />
          <line x1={20} y1={22} x2={84} y2={22} stroke={COLORS.line} strokeWidth={2} />
        </svg>
      </div>

      {/* stations */}
      {STATIONS.map((st, i) => {
        const { Icon } = st;
        const pop = assembleAt === undefined ? 1 : interpolate(frame, [asm + 10 + i * 5, asm + 20 + i * 5], [0, 1], ease);
        const popY = assembleAt === undefined ? 0 : interpolate(frame, [asm + 10 + i * 5, asm + 20 + i * 5], [26, 0], ease);
        // narrated-station heat (ramps once the piece has arrived)
        const heat = i === station ? interpolate(frame, [arrived, arrived + 12], [0, 1], CLAMP) : 0;
        const done = station >= 0 && i < station;
        const lampColor = heat > 0.5 ? CORAL : done ? COLORS.signal : COLORS.line;
        const lampGlow = heat > 0.5 ? 0.35 + 0.65 * Math.abs(Math.sin(frame / 11)) : done ? 0.9 : 1;
        // power-on flash as each station pops in (B4 assembly)
        const flash = assembleAt === undefined ? 0 : interpolate(frame, [asm + 18 + i * 5, asm + 22 + i * 5, asm + 30 + i * 5], [0, 1, 0], CLAMP);
        const bob = heat > 0.5 ? Math.sin(frame / 7) * 2.2 : 0;
        // the working piston, pressing toward the piece
        const pistonLen = heat > 0.5 ? 26 + Math.abs(Math.sin(frame / 8)) * 26 : 16;
        const x = STATION_X[i];
        return (
          <div key={st.key} style={{ position: 'absolute', left: 0, top: 0, opacity: pop, transform: `translateY(${popY}px)` }}>
            {/* soft glow behind the active station */}
            {heat > 0 && (
              <div style={{ position: 'absolute', left: x - 150, top: HEAD_Y - 46, width: 300, height: 300, borderRadius: 999, background: `radial-gradient(circle, ${CORAL}${Math.round(heat * 42).toString(16).padStart(2, '0')} 0%, transparent 68%)` }} />
            )}
            {/* legs */}
            <div style={{ position: 'absolute', left: x - 62, top: HEAD_Y + HEAD_H - 6, width: 7, height: BELT_Y - HEAD_Y - HEAD_H + 6, background: COLORS.ink, opacity: 0.82 }} />
            <div style={{ position: 'absolute', left: x + 55, top: HEAD_Y + HEAD_H - 6, width: 7, height: BELT_Y - HEAD_Y - HEAD_H + 6, background: COLORS.ink, opacity: 0.82 }} />
            {/* piston (the arm that works the piece) */}
            <div style={{ position: 'absolute', left: x - 13, top: HEAD_Y + HEAD_H - 4, width: 26, height: pistonLen, background: heat > 0.5 ? CORAL : COLORS.muted, borderRadius: '0 0 6px 6px', opacity: 0.9 }} />
            {/* head */}
            <div style={{
              position: 'absolute', left: x - HEAD_W / 2, top: HEAD_Y + bob, width: HEAD_W, height: HEAD_H,
              background: COLORS.paper, borderRadius: 14,
              border: `2.5px solid ${heat > 0.5 ? CORAL : COLORS.ink}`,
              boxShadow: heat > 0.5 ? `0 10px 34px ${CORAL}55` : '0 6px 18px rgba(26,26,46,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={44} color={heat > 0.5 ? CORAL : COLORS.accent} strokeWidth={1.9} />
              {/* step number */}
              <span style={{ position: 'absolute', top: 7, left: 11, fontSize: 15, color: COLORS.muted }}>{i + 1}</span>
              {/* status lamp */}
              <span style={{ position: 'absolute', top: 10, right: 11, width: 13, height: 13, borderRadius: 999, background: flash > 0 ? CORAL : lampColor, opacity: flash > 0 ? flash : lampGlow, border: `1px solid ${COLORS.line}` }} />
            </div>
            {/* label (below the roller row, ROUND-6) */}
            <div style={{ position: 'absolute', left: x - 130, top: BELT_Y + BELT_H + 58, width: 260, textAlign: 'center', fontSize: 17, letterSpacing: 2.5, color: heat > 0.5 ? CORAL : done ? COLORS.ink : COLORS.muted, fontWeight: heat > 0.5 ? 700 : 400 }}>
              {st.label}
            </div>
          </div>
        );
      })}

      {/* rollers (ROUND-6: fully visible BELOW the belt, labels below them; each
          one only exists once the assembling belt has reached it) */}
      {[120, 400, 680, 960, 1240, 1520, 1800].map((rx) => (
        <div key={rx} style={{ position: 'absolute', left: rx - 15, top: BELT_Y + BELT_H + 10, width: 30, height: 30, borderRadius: 999, border: `2.5px solid ${COLORS.ink}`, background: COLORS.paper, opacity: 26 + 1868 * beltSx >= rx + 15 ? 0.85 : 0 }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 22, height: 2.5, marginLeft: -11, marginTop: -1.25, background: COLORS.ink, transform: `rotate(${run * 2.2}deg)`, borderRadius: 2 }} />
        </div>
      ))}
      {/* the belt */}
      <div style={{
        position: 'absolute', left: 26, top: BELT_Y, width: 1868, height: BELT_H,
        transform: `scaleX(${beltSx})`, transformOrigin: 'left',
        background: COLORS.ink, borderRadius: 29, overflow: 'hidden',
        boxShadow: '0 10px 26px rgba(26,26,46,0.18)',
      }}>
        {/* moving treads */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(100deg, transparent 0px, transparent 40px, rgba(255,255,255,0.10) 40px, rgba(255,255,255,0.10) 48px)',
          backgroundPositionX: `${(run * 1.4) % 96}px`,
        }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 6, height: 2, background: 'rgba(255,255,255,0.14)' }} />
      </div>

      {/* the PIECE.md token riding the belt */}
      {pieceVisible && (
        <div style={{
          position: 'absolute', left: pieceX - PIECE_W / 2, top: BELT_Y - PIECE_H + 6 + dropY + idleBob,
          width: PIECE_W, height: PIECE_H, transform: `scale(${dropSettle})`,
          background: '#fff', border: `2px solid ${CORAL}`, borderRadius: 9,
          boxShadow: `0 0 ${18 + glowPulse * 18}px ${CORAL}${Math.round(glowPulse * 120).toString(16).padStart(2, '0')}, 0 10px 22px rgba(26,26,46,0.18)`,
          overflow: 'hidden',
        }}>
          <div style={{ height: 10, background: CORAL }} />
          <div style={{ padding: '8px 7px 0', fontSize: 13.5, color: COLORS.ink, letterSpacing: 0.2 }}>PIECE.md</div>
          {[46, 58, 38, 52].map((w, i) => (
            <div key={i} style={{ marginLeft: 7, marginTop: 7, width: w, height: 4, borderRadius: 2, background: i === 0 ? `${CORAL}88` : COLORS.line }} />
          ))}
        </div>
      )}
    </div>
  );
};
