import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { CircleCheck, RefreshCw, ShieldCheck, Crosshair, Mic } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';
import { WebBrowserFrame } from '../../lib/browser';
import { GuidePageBody } from './_shared/GuidePage';
import { FactoryLine } from './_shared/FactoryLine';

// ============================================================================
// B10 · the leash — ROUND-6 redesign: the REAL guide page being CHECKED. The
// page (shared GuidePage clone) sits in a browser left; each verification loop
// sweeps a scanning beam over it on its cue, the page scrolls to the section
// that loop cares about, findings land in the loop cards right, and everything
// ticks green on "until it comes back clean". Factory band runs through; the
// PIECE.md token advances to station 7 (VERIFY + SHIP).
// Master span 510.0 -> 525.8 (15.8s). local f = round((master_s - 510.0) * 30).
// Cues: "verification loops" 511.9->f57 · "checks the evidence" 515.5->f165 ·
// "attacks the draft" 517.4->f222 · "checks my voice" 520.5->f315 ·
// "runs until it comes back clean" 522.6-524.8->f378-444
// ============================================================================
export const compositionConfig = { id: 'B10Verify', durationInSeconds: 15.8, fps: 30, width: 1920, height: 1080 };

const HEAD = 20;
// browser + page geometry
const BX = 60, BY = 118, BW = 950, BH = 510;
const CHROME = 102;
const PAGE = { x: BX, y: BY + CHROME, w: BW, h: BH - CHROME }; // 60,220,950,408
const GUIDE_W = 1632; // GuidePageBody design width
const SCALE = PAGE.w / GUIDE_W;

// the loops
type Loop = {
  key: string; Icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string; what: string; finding: string;
  cue: number; sweep: [number, number]; findAt: number; greenAt: number; color: string;
};
const LOOPS: readonly Loop[] = [
  { key: 'V1', Icon: ShieldCheck, label: 'V1 · evidence', what: 'every draft number vs evidence/*.out', finding: '121 MB ↔ e2_idle.out · all numbers match', cue: 165, sweep: [198, 240], findAt: 226, greenAt: 385, color: COLORS.warn },
  { key: 'V2', Icon: Crosshair, label: 'V2 · claims attack', what: 'hunts the draft for a wrong claim', finding: 'every claim mapped · zero orphans', cue: 222, sweep: [254, 298], findAt: 292, greenAt: 408, color: COLORS.danger },
  { key: 'V4', Icon: Mic, label: 'V4 · voice', what: 'brain voice rules on every paragraph', finding: '2 em dashes found → rewritten', cue: 315, sweep: [344, 384], findAt: 380, greenAt: 432, color: COLORS.accent },
];
const MORE = 340;
const CLEAN = 450;

// page scroll (design px of the 1632-wide guide): TL;DR -> stack grid (V1) ->
// pooler trap (V2) -> back to TL;DR (V4)
const SCROLL_F = [0, 165, 196, 224, 252, 315, 342] as const;
const SCROLL_V = [140, 140, 1330, 1330, 2420, 2420, 270] as const;

const B10Verify: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const at = (s: number, dy = 14) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  const scroll = interpolate(frame, SCROLL_F as unknown as number[], SCROLL_V as unknown as number[], { ...CLAMP, easing: EASINGS.easeInOut });
  const allClean = frame >= LOOPS[2].greenAt;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />
      {/* header — compact, left */}
      <div style={{ position: 'absolute', left: 64, top: 22 }}>
        <div style={{ ...rise(HEAD, 12), fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 3, color: COLORS.signal }}>S7&nbsp;·&nbsp;THE&nbsp;LEASH</div>
        <div style={{ ...rise(HEAD + 10), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink, marginTop: 4 }}>
          loops that run until clean
        </div>
      </div>

      {/* ------------------------------------------ the guide page, being checked */}
      <WebBrowserFrame url="learnwithhasan.com/guide/self-host-supabase" tabTitle="How to Self-Host Supabase" box={{ x: BX, y: BY, w: BW, h: BH }} appearAt={4} pageBg="#fdfcf7">
        <div style={{ position: 'absolute', top: 0, left: 0, width: PAGE.w, height: PAGE.h, overflow: 'hidden', background: '#fdfcf7' }}>
          <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left', width: GUIDE_W }}>
            <div style={{ transform: `translateY(${-scroll}px)` }}>
              {/* V1 sweeps the measured MB values, V2 the pooler sentence */}
              <GuidePageBody mbStart={204} line2Start={258} />
            </div>
          </div>
        </div>
        {/* border tint goes green when every loop is clean */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: PAGE.w, height: PAGE.h, boxShadow: allClean ? `inset 0 0 0 4px ${COLORS.signal}` : 'none', opacity: allClean ? interpolate(frame, [LOOPS[2].greenAt, LOOPS[2].greenAt + 10], [0, 0.8], CLAMP) : 0, pointerEvents: 'none' }} />
        {/* scanning beams — one per loop, sweeping the visible page on its cue */}
        {LOOPS.map((l) => {
          if (frame < l.sweep[0] || frame > l.sweep[1] + 6) return null;
          const y = interpolate(frame, l.sweep, [-90, PAGE.h], { ...CLAMP, easing: EASINGS.easeInOut });
          const op = interpolate(frame, [l.sweep[0], l.sweep[0] + 6, l.sweep[1], l.sweep[1] + 6], [0, 1, 1, 0], CLAMP);
          return (
            <div key={l.key} style={{ position: 'absolute', top: 0, left: 0, width: PAGE.w, height: PAGE.h, overflow: 'hidden', opacity: op, pointerEvents: 'none' }}>
              <div style={{ position: 'absolute', left: 0, top: y, width: PAGE.w, height: 90, background: `linear-gradient(180deg, transparent 0%, ${l.color}26 70%, ${l.color}55 100%)` }} />
              <div style={{ position: 'absolute', left: 0, top: y + 90, width: PAGE.w, height: 3, background: l.color, boxShadow: `0 0 14px ${l.color}` }} />
              <div style={{ position: 'absolute', right: 14, top: Math.min(Math.max(y + 64, 8), PAGE.h - 44), fontFamily: FONT_MONO, fontSize: 15, letterSpacing: 2, color: '#fff', background: l.color, padding: '4px 12px', borderRadius: RADIUS.pill }}>
                {l.label} · scanning
              </div>
            </div>
          );
        })}
        {/* V4's finding pinned over the TL;DR once the voice pass lands */}
        {frame >= 352 && frame < LOOPS[2].greenAt + 60 && (
          <div style={{ ...at(352, 8), position: 'absolute', left: 96, top: 176, fontFamily: FONT_MONO, fontSize: 16, color: COLORS.ink, background: COLORS.paper, border: `1.5px solid ${frame >= LOOPS[2].greenAt ? COLORS.signal : COLORS.warn}`, padding: '5px 13px', borderRadius: RADIUS.pill, boxShadow: SHADOW.soft }}>
            {frame >= LOOPS[2].greenAt ? '✓ ' : ''}2 em dashes → rewritten in my voice
          </div>
        )}
      </WebBrowserFrame>

      {/* ------------------------------------------ the loop cards, right */}
      <div style={{ position: 'absolute', left: 1050, top: 122, width: 810 }}>
        {LOOPS.map((l) => {
          const { Icon } = l;
          const isGreen = frame >= l.greenAt;
          const scanning = frame >= l.sweep[0] && frame < l.greenAt;
          const spin = (frame * 6) % 360;
          const found = frame >= l.findAt;
          return (
            <div key={l.key} style={{ ...at(l.cue, 16), display: 'flex', alignItems: 'center', gap: 18, background: COLORS.paper, border: `2px solid ${isGreen ? COLORS.signal : scanning ? l.color : COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '16px 22px', marginBottom: 14, minHeight: 96, boxSizing: 'border-box' }}>
              {isGreen ? (
                <CircleCheck size={34} color={COLORS.signal} strokeWidth={2.4} />
              ) : scanning ? (
                <div style={{ transform: `rotate(${spin}deg)`, display: 'flex' }}><RefreshCw size={30} color={l.color} strokeWidth={2.2} /></div>
              ) : (
                <Icon size={30} color={COLORS.muted} strokeWidth={2} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 25, fontWeight: 700, color: COLORS.ink }}>{l.label}</span>
                  <span style={{ fontSize: 20, color: COLORS.muted }}>{l.what}</span>
                </div>
                {found && (
                  <div style={{ ...at(l.findAt, 6), fontFamily: FONT_MONO, fontSize: 19, color: isGreen ? COLORS.signal : l.color, marginTop: 7 }}>
                    {isGreen ? '✓ ' : '▸ '}{l.finding}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div style={{ ...at(MORE, 10), fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted, paddingLeft: 6 }}>
          + technical · SEO · visual (six loops total)
        </div>
        <div style={{ ...at(CLEAN, 12), marginTop: 22, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: COLORS.signal }}>
          nothing ships with an unproven claim
        </div>
      </div>

      {/* the factory — the piece finally reaches station 7 (VERIFY + SHIP) */}
      <FactoryLine station={6} pieceFrom={5} advanceAt={30} />
    </AbsoluteFill>
  );
};

export default B10Verify;
