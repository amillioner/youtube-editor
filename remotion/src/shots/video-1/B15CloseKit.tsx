// =============================================================================
// B15CloseKit — pieces shared by the close (883.7 -> 934.9). NOT a shot: no
// compositionConfig, so gen-registry skips this file.
//
//   YouCard    the `you.md` card: redacted while it is still in your head,
//              readable once it is outside. B15CloseOnlyYou locks it,
//              B15ClosePutItOutside opens it and moves it into the repo, so
//              the geometry is defined once here and shared.
//   Lockup     the BrainOutside product lockup, same construction as
//              B2NameLockup (Space Grotesk 700, tight, two-tone).
// =============================================================================
import React from 'react';
import { interpolate } from 'remotion';
import { FileText, Lock, LockOpen } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';

const rr = (frame: number, a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
  interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

export const YOU_CARD = { w: 560, h: 316 } as const;
const REDACT = [0.86, 0.62, 0.78, 0.54, 0.7];
const LINES = ['how I write', 'what I believe', 'my philosophy', 'my projects', 'my real numbers'];

export const YouCard: React.FC<{
  frame: number;
  at?: number;
  x: number;
  y: number;
  openAt?: number;
  scale?: number;
}> = ({ frame, at = 0, x, y, openAt, scale = 1 }) => {
  const op = rr(frame, at, at + 14);
  const ty = rr(frame, at, at + 14, 24, 0);
  const open = openAt === undefined ? 0 : rr(frame, openAt, openAt + 18, 0, 1, EASINGS.easeInOut);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: YOU_CARD.w, height: YOU_CARD.h, boxSizing: 'border-box',
      background: COLORS.d900, border: `1.5px solid ${open > 0.5 ? COLORS.signal : COLORS.d600}`,
      borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '22px 28px',
      opacity: op, transform: `translateY(${ty}px) scale(${scale})`, transformOrigin: 'center center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
        <FileText size={28} color={COLORS.d400} strokeWidth={1.9} />
        <span style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 30, color: COLORS.d300 }}>you.md</span>
        <div style={{ marginLeft: 'auto', position: 'relative', width: 34, height: 34 }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - open }}>
            <Lock size={26} color={COLORS.danger} strokeWidth={2.3} />
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: open }}>
            <LockOpen size={26} color={COLORS.signal} strokeWidth={2.3} />
          </div>
        </div>
      </div>
      {REDACT.map((w, i) => (
        <div key={i} style={{ position: 'relative', height: 30, marginBottom: 14 }}>
          <div style={{
            position: 'absolute', left: 0, top: 4, height: 22, width: `${w * 100}%`,
            borderRadius: 6, background: COLORS.d600, opacity: 1 - open,
          }} />
          <span style={{
            position: 'absolute', left: 0, top: 0, fontFamily: FONT_MONO, fontSize: 25, color: COLORS.d300,
            opacity: open, whiteSpace: 'nowrap',
          }}>
            {LINES[i]}
          </span>
        </div>
      ))}
    </div>
  );
};

// -----------------------------------------------------------------------------
// The product lockup. Same construction as B2NameLockup: the brand type system,
// two-tone, NOT the BRAND.wordmark channel placeholder.
// -----------------------------------------------------------------------------
export const Lockup: React.FC<{
  frame: number; at: number; size?: number; wipeAt?: number; boxed?: boolean;
}> = ({ frame, at, size = 118, wipeAt, boxed = true }) => {
  const op = rr(frame, at, at + 14);
  const ty = rr(frame, at, at + 14, 26, 0);
  const wipe = wipeAt === undefined ? 0 : rr(frame, wipeAt, wipeAt + 12);
  return (
    <div style={{
      display: 'inline-block', opacity: op, transform: `translateY(${ty}px)`,
      background: boxed ? COLORS.paper : 'transparent',
      border: boxed ? `1px solid ${COLORS.line}` : 'none',
      borderRadius: RADIUS.card, boxShadow: boxed ? SHADOW.card : 'none',
      padding: boxed ? '18px 56px 24px' : 0,
    }}>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: -2, lineHeight: 1.12, whiteSpace: 'nowrap' }}>
        <span style={{ color: COLORS.ink }}>Brain</span>
        <span style={{ position: 'relative', display: 'inline-block', color: COLORS.accent }}>
          <span style={{ position: 'absolute', left: 0, right: 0, bottom: 6, height: size * 0.08, borderRadius: 6, background: COLORS.accent, transform: `scaleX(${wipe})`, transformOrigin: 'left' }} />
          <span style={{ position: 'relative' }}>Outside</span>
        </span>
      </span>
    </div>
  );
};
