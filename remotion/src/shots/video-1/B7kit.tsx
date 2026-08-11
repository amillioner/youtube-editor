// B7 shared building blocks — the online-brain install beat (master 406–580s).
// NOT a shot (no compositionConfig; gen-registry skips it). Everything here is
// frame-based and deterministic.
//
// Third-party UI (Contabo, Coolify, GitHub) gets its own LITERAL palette — house
// practice, see B5TemplateRepo / lib/browser. Brand tokens stay reserved for OUR
// chrome (cursor, rings, step rail, callouts) and for the BrainOutside product UI,
// which IS the brand.
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { FastForward, Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';
import { chromeH } from '../../lib/browser';

// ---------------------------------------------------------------- geometry
// One browser box for the whole beat, so the chrome never jumps between shots.
export const BOX = { x: 150, y: 30, w: 1620, h: 862 } as const;
export const PX = BOX.x;
export const PY = BOX.y + chromeH();
export const PW = BOX.w;
export const PH = BOX.h - chromeH(); // 1620 x 760

// Continuation shots pass this so the browser is already fully painted at frame 0
// (no re-entry fade when one page hard-cuts into the next shot).
export const CONTINUE = -20;

// ---------------------------------------------------------------- palettes
export const GH = {
  bg: '#ffffff', canvas: '#f6f8fa', border: '#d1d9e0', line: '#eaeef2',
  text: '#1f2328', dim: '#59636e', link: '#0969da', green: '#1f883d',
  on: '#ffffff', topic: '#ddf4ff', active: '#fd8c73', ok: '#dafbe1', okB: '#4ac26b',
} as const;

export const CF = {
  bg: '#0d0d10', panel: '#17171b', panel2: '#1e1e24', border: '#2a2a31',
  text: '#e6e6ea', dim: '#a0a0ac', faint: '#71717f',
  purple: '#8b5cf6', purple2: '#d946ef', green: '#22c55e', warn: '#f59e0b',
} as const;

export const CT = {
  navy: '#12294a', navy2: '#1b3a63', orange: '#ff6b00',
  bg: '#ffffff', canvas: '#f4f7fb', border: '#d9e2ee', text: '#16283f', dim: '#5c6f88',
} as const;

// ---------------------------------------------------------------- marks
export const GhMark: React.FC<{ size?: number; color?: string }> = ({ size = 30, color = GH.text }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <path
      fill={color}
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
    />
  </svg>
);

// Coolify: violet→fuchsia rounded square with a white bolt (the app's mark, simplified).
export const CoolifyMark: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <defs>
      <linearGradient id="cfg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={CF.purple} />
        <stop offset="100%" stopColor={CF.purple2} />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="32" height="32" rx="8" fill="url(#cfg)" />
    <path d="M18.4 5 L9 18.2 h5.6 L13.2 27 L23 13.4 h-5.8 Z" fill="#ffffff" />
  </svg>
);

// Contabo: white wordmark on navy with the orange dot.
export const ContaboMark: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <rect x="0" y="0" width="32" height="32" rx="7" fill={CT.navy} />
    <circle cx="16" cy="16" r="8.4" fill="none" stroke="#ffffff" strokeWidth="3.4" />
    <circle cx="24.5" cy="8" r="4.2" fill={CT.orange} />
  </svg>
);

// BrainOutside: our product, so it wears the brand.
export const BrainMark: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <rect x="0" y="0" width="32" height="32" rx="8" fill={COLORS.accent} />
    <path d="M11 9.5h6.2a4.3 4.3 0 0 1 0 8.6H11z" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinejoin="round" />
    <path d="M11 18.1h7.4a4.3 4.3 0 0 1 0 8.6" fill="none" stroke="#ffffff" strokeWidth="2.6" strokeLinejoin="round" opacity="0" />
    <circle cx="24.6" cy="13.8" r="2.6" fill={COLORS.signal} />
    <path d="M11 5.6v20.8" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

// ---------------------------------------------------------------- cursor
export type Key = { frame: number; x: number; y: number }; // absolute canvas px

export const sampleKeys = (frame: number, keys: Key[]) => {
  if (!keys.length) return { x: 960, y: 540 };
  if (frame <= keys[0].frame) return { x: keys[0].x, y: keys[0].y };
  const last = keys[keys.length - 1];
  if (frame >= last.frame) return { x: last.x, y: last.y };
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].frame <= frame) i++;
  const a = keys[i], b = keys[i + 1];
  const t = interpolate(frame, [a.frame, b.frame], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
};

export const CursorLayer: React.FC<{ keys: Key[]; clicks?: number[]; hideAt?: number }> = ({
  keys, clicks = [], hideAt,
}) => {
  const frame = useCurrentFrame();
  const p = sampleKeys(frame, keys);
  const press = clicks.reduce((acc, cf) => {
    if (frame < cf - 4 || frame > cf + 8) return acc;
    return interpolate(frame, [cf - 4, cf, cf + 8], [1, 0.8, 1], CLAMP);
  }, 1);
  const op = hideAt === undefined ? 1 : interpolate(frame, [hideAt, hideAt + 10], [1, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <>
      {clicks.map((cf) => {
        if (frame < cf || frame > cf + 18) return null;
        const at = sampleKeys(cf, keys);
        const sc = interpolate(frame, [cf, cf + 18], [0, 2.4], { ...CLAMP, easing: EASINGS.easeOut });
        const ro = interpolate(frame, [cf, cf + 18], [0.55, 0], CLAMP);
        return (
          <div key={cf} style={{
            position: 'absolute', left: at.x, top: at.y, width: 34, height: 34, marginLeft: -17, marginTop: -17,
            borderRadius: '50%', border: `2px solid ${COLORS.accent}`, opacity: ro, transform: `scale(${sc})`,
          }} />
        );
      })}
      <div style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-4px, -3px)', opacity: op }}>
        <svg width={34} height={34} viewBox="0 0 24 24" style={{
          transform: `scale(${press})`, transformOrigin: '16% 10%',
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))', display: 'block',
        }}>
          <path d="M4.2 2.6 L4.2 18.9 L8.7 14.7 L11.9 21.6 L14.6 20.3 L11.4 13.6 L17.6 13.6 Z"
            fill="#111318" stroke="#ffffff" strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};

// ---------------------------------------------------------------- honesty tag
// Any compressed progress/build footage carries this, so nobody thinks it runs
// this fast in real life (script B7).
export const SpedUpTag: React.FC<{ from: number; to?: number; x?: number; y?: number }> = ({
  from, to, x = BOX.x + BOX.w - 190, y = BOX.y + BOX.h - 76,
}) => {
  const frame = useCurrentFrame();
  const inOp = interpolate(frame, [from, from + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const outOp = to === undefined ? 1 : interpolate(frame, [to, to + 10], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });
  const pulse = 0.86 + 0.14 * Math.abs(((frame % 40) / 20) - 1);
  return (
    <div style={{
      position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 10,
      height: 44, padding: '0 18px', borderRadius: RADIUS.pill,
      background: 'rgba(13,13,16,0.78)', border: `1px solid ${COLORS.warn}66`,
      opacity: inOp * outOp,
    }}>
      <div style={{ display: 'flex', opacity: pulse }}><FastForward size={19} color={COLORS.warn} strokeWidth={2.4} /></div>
      <span style={{ fontFamily: FONT_MONO, fontSize: 21, letterSpacing: 1.4, color: COLORS.warn }}>sped up</span>
    </div>
  );
};

// ---------------------------------------------------------------- small parts
export const Chip: React.FC<{
  at: number; color?: string; children: React.ReactNode; style?: React.CSSProperties; icon?: React.ReactNode;
}> = ({ at, color = COLORS.signal, children, style, icon }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [at, at + 12], [14, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      position: 'absolute', display: 'inline-flex', alignItems: 'center', gap: 10,
      height: 42, padding: '0 18px', borderRadius: RADIUS.pill,
      background: `${color}1f`, border: `1px solid ${color}`, color,
      fontFamily: FONT_MONO, fontSize: 21, whiteSpace: 'nowrap',
      opacity: op, transform: `translateY(${y}px)`, ...style,
    }}>
      {icon ?? <Check size={17} color={color} strokeWidth={3.2} />}
      {children}
    </div>
  );
};

// Caption strip under the browser box (the band B5TemplateRepo uses for its step rail).
export const Caption: React.FC<{ at: number; children: React.ReactNode; top?: number }> = ({ at, children, top = 928 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [at, at + 14], [22, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top, textAlign: 'center',
      fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 44, color: COLORS.ink,
      opacity: op, transform: `translateY(${y}px)`,
    }}>{children}</div>
  );
};

// Indigo wipe behind a key word, fired on its narration frame.
export const Wipe: React.FC<{ at: number; color?: string; children: React.ReactNode }> = ({ at, color = `${COLORS.accent}59`, children }) => {
  const frame = useCurrentFrame();
  const s = interpolate(frame, [at, at + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
      <span style={{ position: 'absolute', left: -8, right: -8, bottom: 4, top: 6, background: color, borderRadius: 8, transform: `scaleX(${s})`, transformOrigin: 'left', zIndex: 0 }} />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
    </span>
  );
};

// ---------------------------------------------------------------- Coolify shell
export type CfNav = { label: string; active?: boolean };

export const CoolifyShell: React.FC<{
  crumb?: React.ReactNode;
  nav?: CfNav[];
  action?: React.ReactNode;
  children?: React.ReactNode;
}> = ({ crumb, nav, action, children }) => (
  <div style={{ position: 'relative', width: PW, height: PH, background: CF.bg, color: CF.text, fontFamily: FONT_BODY }}>
    {/* top bar */}
    <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 58, background: CF.panel, borderBottom: `1px solid ${CF.border}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 24px' }}>
      <CoolifyMark size={26} />
      <span style={{ fontSize: 21, fontWeight: 600, letterSpacing: 0.2 }}>Coolify</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 26, marginLeft: 18, fontSize: 19, color: CF.dim }}>
        {['Dashboard', 'Projects', 'Servers', 'Keys & Tokens'].map((t, i) => (
          <span key={t} style={{ color: i === 1 ? CF.text : CF.dim }}>{t}</span>
        ))}
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {action}
        <span style={{ width: 30, height: 30, borderRadius: '50%', background: CF.purple }} />
      </div>
    </div>
    {crumb && (
      <div style={{ position: 'absolute', left: nav ? 300 : 40, top: 78, fontFamily: FONT_MONO, fontSize: 19, color: CF.faint }}>{crumb}</div>
    )}
    {/* sub nav */}
    {nav && (
      <div style={{ position: 'absolute', left: 0, top: 58, width: 272, height: PH - 58, background: CF.panel, borderRight: `1px solid ${CF.border}`, paddingTop: 22 }}>
        {nav.map((n) => (
          <div key={n.label} style={{
            display: 'flex', alignItems: 'center', height: 46, margin: '0 14px', padding: '0 16px', borderRadius: 9,
            background: n.active ? CF.panel2 : 'transparent',
            color: n.active ? CF.text : CF.dim, fontSize: 19,
            borderLeft: `3px solid ${n.active ? CF.purple : 'transparent'}`,
          }}>{n.label}</div>
        ))}
      </div>
    )}
    {children}
  </div>
);

export const CfButton: React.FC<{
  label: string; tone?: 'purple' | 'green' | 'ghost'; style?: React.CSSProperties; icon?: React.ReactNode;
}> = ({ label, tone = 'purple', style, icon }) => {
  const bg = tone === 'purple' ? CF.purple : tone === 'green' ? CF.green : 'transparent';
  const bd = tone === 'ghost' ? CF.border : bg;
  const fg = tone === 'ghost' ? CF.text : '#ffffff';
  return (
    <div style={{
      position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      background: bg, border: `1px solid ${bd}`, borderRadius: 9, color: fg,
      fontSize: 20, fontWeight: 600, fontFamily: FONT_BODY, ...style,
    }}>{icon}{label}</div>
  );
};

// ---------------------------------------------------------------- wizard shell
// The BrainOutside first-run wizard. OUR product, so it is painted in the brand.
export const WIZ_STEPS = ['Account', 'Your brain', 'Read access', 'Write access', 'Connect Claude', 'Build'] as const;

export const WizardShell: React.FC<{
  step: number;          // 1..6, the currently active step
  done: number;          // highest completed step (0 = none)
  railAt?: number;       // frame the rail rises
  children?: React.ReactNode;
  title?: React.ReactNode;
}> = ({ step, done, railAt = 0, children, title }) => {
  const frame = useCurrentFrame();
  const railOp = interpolate(frame, [railAt, railAt + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const railY = interpolate(frame, [railAt, railAt + 14], [18, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{ position: 'relative', width: PW, height: PH, background: COLORS.paper, fontFamily: FONT_BODY }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(1000px 500px at 50% -18%, ${COLORS.accent}18, transparent 62%)` }} />
      {/* product bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 62, borderBottom: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 28px' }}>
        <BrainMark size={28} />
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, color: COLORS.ink }}>BrainOutside</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.muted, marginLeft: 8 }}>setup</span>
      </div>
      {/* step rail */}
      <div style={{ position: 'absolute', left: 0, top: 96, width: PW, display: 'flex', justifyContent: 'center', gap: 0, opacity: railOp, transform: `translateY(${railY}px)` }}>
        {WIZ_STEPS.map((label, i) => {
          const n = i + 1;
          const isDone = n <= done;
          const isNow = n === step;
          const col = isDone ? COLORS.signal : isNow ? COLORS.accent : COLORS.line;
          const fg = isDone || isNow ? COLORS.paper : COLORS.muted;
          return (
            <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 178 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: isDone || isNow ? col : COLORS.cream,
                  border: `2px solid ${isDone || isNow ? col : COLORS.line}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FONT_MONO, fontSize: 21, fontWeight: 700, color: fg,
                }}>
                  {isDone ? <Check size={22} color={COLORS.paper} strokeWidth={3.4} /> : n}
                </div>
                <span style={{ fontSize: 18, color: isNow ? COLORS.ink : COLORS.muted, fontWeight: isNow ? 600 : 400 }}>{label}</span>
              </div>
            </div>
          );
        })}
      </div>
      {title && (
        <div style={{ position: 'absolute', left: 0, top: 214, width: PW, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: COLORS.ink }}>{title}</div>
      )}
      {children}
    </div>
  );
};

// A wizard card body (the panel the current step's controls live in).
export const WizCard: React.FC<{
  at: number; x?: number; y?: number; w?: number; h?: number; children?: React.ReactNode; style?: React.CSSProperties;
}> = ({ at, x = 310, y = 300, w = 1000, h = 396, children, style }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const ty = interpolate(frame, [at, at + 14], [22, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card,
      boxShadow: SHADOW.card, opacity: op, transform: `translateY(${ty}px)`, ...style,
    }}>{children}</div>
  );
};

// A form field that fills at a given frame (typed or pasted).
export const Field: React.FC<{
  label: string; value: string; at: number; typed?: boolean; perChar?: number;
  x: number; y: number; w: number; mono?: boolean; done?: number;
}> = ({ label, value, at, typed = false, perChar = 1.1, x, y, w, mono = true, done }) => {
  const frame = useCurrentFrame();
  const shown = typed
    ? value.slice(0, Math.floor(interpolate(frame, [at, at + value.length * perChar], [0, value.length], { ...CLAMP, easing: EASINGS.easeInOut })))
    : frame >= at ? value : '';
  const okOp = done === undefined ? 0 : interpolate(frame, [done, done + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w }}>
      <div style={{ fontSize: 19, color: COLORS.muted, marginBottom: 8 }}>{label}</div>
      <div style={{
        position: 'relative', height: 56, border: `1px solid ${shown ? COLORS.accent : COLORS.line}`, borderRadius: 10,
        background: COLORS.cream, display: 'flex', alignItems: 'center', padding: '0 18px',
        fontFamily: mono ? FONT_MONO : FONT_BODY, fontSize: 22, color: COLORS.ink,
      }}>
        {shown}
        {okOp > 0 && (
          <div style={{ position: 'absolute', right: 14, width: 30, height: 30, borderRadius: '50%', background: COLORS.signal, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: okOp }}>
            <Check size={18} color={COLORS.paper} strokeWidth={3.4} />
          </div>
        )}
      </div>
    </div>
  );
};

// An accelerating log stream (install / build output). Deterministic: the visible
// line count is a frame interpolation, and the block scrolls so the newest line
// stays on the last row.
export const LogStream: React.FC<{
  lines: string[]; from: number; to: number; rows?: number;
  x: number; y: number; w: number; size?: number; lineH?: number;
  okColor?: string; dimColor?: string;
}> = ({ lines, from, to, rows = 12, x, y, w, size = 24, lineH = 36, okColor = CF.green, dimColor = CF.dim }) => {
  const frame = useCurrentFrame();
  const n = Math.max(0, Math.min(lines.length, Math.floor(interpolate(frame, [from, to], [0, lines.length], { ...CLAMP, easing: EASINGS.easeIn }))));
  const start = Math.max(0, n - rows);
  const view = lines.slice(start, n);
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: rows * lineH, overflow: 'hidden', fontFamily: FONT_MONO, fontSize: size }}>
      {view.map((l, i) => {
        const isOk = l.startsWith('✓');
        return (
          <div key={`${start + i}-${l}`} style={{ height: lineH, lineHeight: `${lineH}px`, color: isOk ? okColor : dimColor, whiteSpace: 'nowrap' }}>{l}</div>
        );
      })}
    </div>
  );
};

// A progress bar that fills over a frame range.
export const Bar: React.FC<{ from: number; to: number; x: number; y: number; w: number; h?: number; color?: string; track?: string }> = ({
  from, to, x, y, w, h = 10, color = CF.purple, track = CF.border,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [from, to], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: h / 2, background: track, overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: h / 2, background: color, transform: `scaleX(${p})`, transformOrigin: 'left' }} />
    </div>
  );
};
