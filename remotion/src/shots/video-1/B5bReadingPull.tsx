import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Ban, Braces, BookOpen, Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B5b (4/6) — the reading half. mind-reader does not hand the model the brain,
// it hands it three notes. The three it picks are the REAL ones the self-hosting
// lens would return (they exist in the brain repo), and the 16 second figure is
// the same number B15ContextPackGaps already put on screen, so this reads as a
// callback rather than a new claim.
//
// Master span 352.296967-367.696967 (local frame = round((t - 352.296967) * 30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//   "Mind-reader"        355.83 -> f16   the eyebrow names it (the grid itself
//                                        staggers in from f6, so the shot never
//                                        opens on an empty frame)
//   "task,"              358.40 -> f93   the empty TASK slot
//   "not everything"     359.38 -> f122  the pink "not everything" chip
//   "reply"              361.16 -> f176  the task fills
//   "about self-hosting" 361.87 -> f197  ...and completes
//   "it brings"          363.24 -> f238  the rail draws, the pack panel opens
//   "the cost story,"    363.80 -> f255  row 1 + its tile rings
//   "downtime number,"   365.24 -> f298  row 2 + its tile rings
//   "and my voice."      367.15 -> f356  row 3 + its tile rings
//   "leaves ... alone."  368.52 -> f397  every other tile dims; f421 the chip
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B5bReadingPull', durationInSeconds: 15.4, fps: 30, width: 1920, height: 1080 };

const F_GRID = 16;
const F_SLOT = 93;
const F_NOTALL = 122;
const F_REPLY = 176;
const F_TOPIC = 197;
const F_BRINGS = 238;
const F_ROW1 = 255;
const F_ROW2 = 298;
const F_ROW3 = 356;
const F_LEAVE = 397;
const F_UNTOUCHED = 421;

// grid geometry
const COLS = 6;
const ROWS = 6;
const TILE = 86;
const GAP = 18;
const GRID_X = 150;
const GRID_Y = 290;
const GRID_W = COLS * TILE + (COLS - 1) * GAP; // 606
const GRID_H = ROWS * TILE + (ROWS - 1) * GAP; // 606
const AXIS = GRID_Y + GRID_H / 2; // 593

// the three notes the lens actually returns
const PICKED: Record<number, number> = { 8: F_ROW1, 15: F_ROW2, 27: F_ROW3 };

const PACK = { x: 960, y: 350, w: 800, h: 486 };
const RAIL = { x: GRID_X + GRID_W + 16, w: 168 };
const PACK_ROWS = [
  { at: F_ROW1, main: 'story · added up my cloud bills', tag: 'the cost story' },
  { at: F_ROW2, main: 'take · 16 seconds of downtime', tag: 'the number' },
  { at: F_ROW3, main: 'identity/voice.md', tag: 'how I write' },
];

const B5bReadingPull: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const dim = r(F_LEAVE, F_LEAVE + 16, 1, 0.26);
  const railDraw = r(F_BRINGS, F_BRINGS + 16);
  const dotT = Math.max(0, frame - F_BRINGS);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />

      {/* who is talking */}
      <div style={{
        position: 'absolute', left: 0, top: 80, width: 1920, textAlign: 'center',
        fontFamily: FONT_MONO, fontSize: 32, letterSpacing: 6, color: COLORS.signal,
        opacity: r(F_GRID, F_GRID + 14), transform: `translateY(${r(F_GRID, F_GRID + 14, 16, 0)}px)`,
      }}>
        mind-reader
      </div>

      {/* the task it is answering */}
      <div style={{
        position: 'absolute', left: 400, top: 140, width: 1120, height: 92, boxSizing: 'border-box',
        background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card,
        display: 'flex', alignItems: 'center', gap: 22, padding: '0 28px',
        opacity: r(F_SLOT, F_SLOT + 14), transform: `translateY(${r(F_SLOT, F_SLOT + 14, 16, 0)}px)`,
      }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 21, letterSpacing: 3, color: COLORS.muted }}>TASK</span>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 38, color: COLORS.ink, opacity: r(F_REPLY, F_REPLY + 12) }}>
          write a reply
        </span>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 38, color: COLORS.accent, opacity: r(F_TOPIC, F_TOPIC + 12) }}>
          about self-hosting
        </span>
      </div>

      {/* ------------- the brain: every note it has ------------- */}
      <div style={{ position: 'absolute', left: GRID_X, top: 248, fontFamily: FONT_MONO, fontSize: 25, color: COLORS.muted, opacity: r(4, 18) }}>
        my-brain
      </div>

      <div style={{
        position: 'absolute', left: GRID_X + GRID_W - 268, top: 238,
        display: 'flex', alignItems: 'center', gap: 10, height: 46, width: 268, boxSizing: 'border-box',
        justifyContent: 'center',
        background: `${COLORS.danger}1a`, border: `1px solid ${COLORS.danger}59`, borderRadius: RADIUS.pill,
        opacity: r(F_NOTALL, F_NOTALL + 12) * (1 - r(F_BRINGS, F_BRINGS + 12)),
      }}>
        <Ban size={19} color={COLORS.danger} strokeWidth={2.2} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.danger }}>not everything</span>
      </div>

      {Array.from({ length: COLS * ROWS }).map((_, i) => {
        const at = 6 + i * 2.2;
        const op = r(at, at + 14);
        const y = r(at, at + 14, 14, 0);
        const selAt = PICKED[i];
        const sel = selAt !== undefined ? r(selAt, selAt + 14) : 0;
        const fade = selAt === undefined ? dim : 1;
        const lift = selAt !== undefined ? r(selAt, selAt + 14, 0, -8) : 0;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: GRID_X + (i % COLS) * (TILE + GAP),
              top: GRID_Y + Math.floor(i / COLS) * (TILE + GAP),
              width: TILE, height: TILE, boxSizing: 'border-box', borderRadius: 12,
              background: sel > 0.5 ? `${COLORS.signal}22` : COLORS.paper,
              border: `${sel > 0.5 ? 2 : 1}px solid ${sel > 0.5 ? COLORS.signal : COLORS.line}`,
              boxShadow: SHADOW.soft,
              opacity: op * fade,
              transform: `translateY(${y + lift}px)`,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, padding: '0 17px',
            }}
          >
            <span style={{ height: 6, borderRadius: 3, background: sel > 0.5 ? COLORS.signal : `${COLORS.muted}66`, width: '100%' }} />
            <span style={{ height: 6, borderRadius: 3, background: sel > 0.5 ? COLORS.signal : `${COLORS.muted}66`, width: '72%' }} />
            <span style={{ height: 6, borderRadius: 3, background: sel > 0.5 ? COLORS.signal : `${COLORS.muted}66`, width: '86%' }} />
          </div>
        );
      })}

      {/* everything it did NOT touch */}
      <div style={{
        position: 'absolute', left: GRID_X, top: 924, width: GRID_W, display: 'flex', justifyContent: 'center',
        opacity: r(F_UNTOUCHED, F_UNTOUCHED + 14), transform: `translateY(${r(F_UNTOUCHED, F_UNTOUCHED + 14, 12, 0)}px)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 56, padding: '0 26px', background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill, boxShadow: SHADOW.soft }}>
          <Check size={22} color={COLORS.signal} strokeWidth={3} />
          <span style={{ fontFamily: FONT_BODY, fontSize: 27, color: COLORS.muted }}>the other notes, left alone</span>
        </div>
      </div>

      {/* ------------- the rail ------------- */}
      <div style={{ position: 'absolute', left: RAIL.x, top: AXIS - 3, width: RAIL.w - 20, height: 6, borderRadius: 3, background: `${COLORS.signal}55`, transform: `scaleX(${railDraw})`, transformOrigin: 'left' }} />
      <div style={{
        position: 'absolute', left: RAIL.x + RAIL.w - 20, top: AXIS - 13, width: 0, height: 0,
        borderTop: '13px solid transparent', borderBottom: '13px solid transparent', borderLeft: `20px solid ${COLORS.signal}`,
        opacity: r(F_BRINGS + 10, F_BRINGS + 20),
      }} />
      {[0, 1, 2].map((k) => {
        const p = ((dotT * 0.013) + k / 3) % 1;
        return (
          <div key={k} style={{
            position: 'absolute', left: RAIL.x + p * (RAIL.w - 26) - 7, top: AXIS - 7,
            width: 14, height: 14, borderRadius: '50%', background: COLORS.signal, opacity: railDraw,
          }} />
        );
      })}

      {/* ------------- what it actually sends ------------- */}
      <div style={{
        position: 'absolute', left: PACK.x, top: PACK.y, width: PACK.w, height: PACK.h, boxSizing: 'border-box',
        background: COLORS.d900, border: `1px solid ${COLORS.d600}`, borderRadius: RADIUS.window, boxShadow: SHADOW.card,
        overflow: 'hidden', opacity: r(F_BRINGS, F_BRINGS + 14), transform: `translateY(${r(F_BRINGS, F_BRINGS + 14, 18, 0)}px)`,
      }}>
        <div style={{ height: 64, background: COLORS.d800, borderBottom: `1px solid ${COLORS.d600}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px' }}>
          <Braces size={20} color={COLORS.d400} strokeWidth={1.9} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 23, color: COLORS.d400 }}>context-pack.json</span>
          <BookOpen size={20} color={COLORS.signal} strokeWidth={1.9} style={{ marginLeft: 'auto' }} />
        </div>
        {PACK_ROWS.map((row, i) => (
          <div key={row.main} style={{
            position: 'absolute', left: 24, top: 92 + i * 128, width: PACK.w - 48, height: 108, boxSizing: 'border-box',
            background: '#11161d', border: `1px solid ${COLORS.d600}`, borderRadius: 10,
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 10, padding: '0 24px',
            opacity: r(row.at, row.at + 14), transform: `translateY(${r(row.at, row.at + 14, 16, 0)}px)`,
          }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 30, color: COLORS.d300 }}>{row.main}</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: 22, color: COLORS.signal }}>{row.tag}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
export default B5bReadingPull;
