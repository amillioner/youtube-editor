import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { BLOCKS } from './_shared/FactoryKit';

// ============================================================================
// B3 · the five-block map — ROUND-7 REDESIGN: split screen + living mesh.
// Hasan stays on camera cropped into the RIGHT third (bake.py "split",
// master_box 1280,0,640,1080 — B2a language); the presentation owns the LEFT
// 1280px. The four blocks land in the CORNERS on their cues, each with a LIVE
// mini-animation inside (contract = mini pipeline working a piece · senses =
// search data streaming in · hands = mini browser clicking + typing · lab =
// mini terminal breaking + fixing). The BRAIN lands in the CENTER on its cue
// and animated progress lines draw from it to all four cards — the mesh.
// Master span 143.0 -> 216.0 (73.0s). local f = round((master_s - 143.0) * 30).
// Cues: "5 building blocks" 143.944->f28 ·
// B1 "Block" 148.764->f173, "contract" 150.113->f210, "Claude skills" 151.720->f262,
//   instructions f327 · stages f366 · guidelines f402 · rules f428
// B2 "Number 2" 161.039->f541, senses f568, "keyword" 163.690->f621,
//   related content f742 · competitors f790 · what the internet says f857
// B3 "Number 3" 173.248->f907, hands f941, "real browser" 176.493->f1005,
//   Playwright 180.477->f1124 · testing f1214 · screenshots f1236
// B4 "number 4" 186.164->f1295, lab f1324, "real server" 188.943->f1378,
//   APIs f1433 · tools f1472 · servers f1502 · companies f1527 · websites f1553 · services f1573
// B5 "number 5" 201.903->f1767 (BRAIN center), "most important" 203.058->f1802
//   (tag + mesh draws), brain name 204.870->f1856, "my brain" 205.848->f1886,
//   thoughts f1984 · beliefs f2003 · opinions f2044 · projects f2071,
//   "write exactly like me" 214.027->f2131
// ============================================================================
export const compositionConfig = { id: 'B3FiveBlocks', durationInSeconds: 73, fps: 30, width: 1920, height: 1080, transparent: true };

const PANEL_W = 1280;
const EYEBROW = 6;
const HEADLINE = 28;

const SHELL = [173, 541, 907, 1295] as const;
const NAME = [210, 568, 941, 1324] as const;
const SUB = [262, 621, 1005, 1378] as const;
const BRAIN = { shell: 1767, tag: 1802, name: 1856, sub: 1886, caption: 2131 };
const MESH = 1803; // lines draw right after "the most important"

const CHIPS: readonly (readonly (readonly [string, number])[])[] = [
  [['instructions', 327], ['stages', 366], ['guidelines', 402], ['rules', 428]],
  [['related content', 742], ['competitors', 790], ['what the internet says', 857]],
  [['Playwright', 1124], ['testing', 1214], ['screenshots', 1236]],
  [['APIs', 1433], ['tools', 1472], ['servers', 1502], ['companies', 1527], ['websites', 1553], ['services', 1573]],
];
const BRAIN_CHIPS: readonly (readonly [string, number])[] = [
  ['my thoughts', 1984], ['my beliefs', 2003], ['my opinions', 2044], ['my projects', 2071],
];

// corner geometry (left panel design px)
const CARD_W = 430;
const CARD_H = 310;
const POS = [
  { x: 40, y: 195 }, // 1 contract · TL (round-7b: pushed below the header)
  { x: 810, y: 195 }, // 2 senses · TR
  { x: 40, y: 700 }, // 3 hands · BL
  { x: 810, y: 700 }, // 4 lab · BR
] as const;
const BRAIN_C = { x: 640, y: 560, r: 125 } as const;
// each card's inner corner (mesh line target)
const TARGETS = [
  { x: 470, y: 505 }, { x: 810, y: 505 }, { x: 470, y: 700 }, { x: 810, y: 700 },
] as const;

const ease = { ...CLAMP, easing: EASINGS.easeOut };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---- the live mini-animations (each runs from its card's landing, loops) ----
const AW = 382;
const AH = 92;

// 1 · contract — a mini pipeline works a piece through 4 stages
const PipelineAnim: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const loop = Math.max(0, t) % 120;
  const STX = [26, 130, 234, 338];
  const seg = Math.min(3, Math.floor(loop / 30));
  const tin = interpolate(loop % 30, [4, 24], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const px = seg >= 3 ? STX[3] : lerp(STX[seg], STX[seg + 1], tin);
  return (
    <div style={{ position: 'relative', width: AW, height: AH }}>
      <div style={{ position: 'absolute', left: 16, right: 16, top: 47, height: 3, borderRadius: 2, background: COLORS.line }} />
      {STX.map((sx, i) => {
        const near = Math.max(0, 1 - Math.abs(px - sx) / 34);
        return (
          <div key={i} style={{ position: 'absolute', left: sx - 11, top: 37, width: 22, height: 22, borderRadius: 7, border: `2.5px solid ${near > 0.4 ? color : COLORS.line}`, background: near > 0.4 ? `${color}22` : COLORS.paper, transform: `scale(${1 + 0.22 * near})` }} />
        );
      })}
      <div style={{ position: 'absolute', left: px - 7, top: 27, width: 14, height: 14, borderRadius: 4, background: color, boxShadow: `0 0 12px ${color}88` }} />
      {STX.map((sx, i) => (
        <div key={`l${i}`} style={{ position: 'absolute', left: sx - 20, top: 66, width: 40, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 12, color: COLORS.muted }}>S{i + 1}</div>
      ))}
    </div>
  );
};

// 2 · senses — search/keyword data streams in beside a radar sweep
const SensesAnim: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const loop = Math.max(0, t) % 100;
  const sweep = (Math.max(0, t) * 5) % 360;
  const ROWS = [
    ['self host supabase', 0.62], ['supabase docker', 0.48], ['supabase vps', 0.36],
  ] as const;
  return (
    <div style={{ position: 'relative', width: AW, height: AH }}>
      <div style={{ position: 'absolute', left: 10, top: 14, width: 62, height: 62, borderRadius: 999, border: `2px solid ${color}55`, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 31, height: 2.5, background: color, transformOrigin: 'left center', transform: `rotate(${sweep}deg)` }} />
        <div style={{ position: 'absolute', left: 16, top: 38, width: 5, height: 5, borderRadius: 999, background: color, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t / 11)) }} />
        <div style={{ position: 'absolute', left: 40, top: 18, width: 5, height: 5, borderRadius: 999, background: color, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t / 8 + 2)) }} />
      </div>
      {ROWS.map(([kw, w], i) => {
        const rin = interpolate(loop, [i * 20 + 4, i * 20 + 16], [0, 1], ease);
        return (
          <div key={kw} style={{ position: 'absolute', left: 92, top: 10 + i * 26, opacity: rin, transform: `translateX(${(1 - rin) * 14}px)`, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: COLORS.ink, width: 150 }}>{kw}</span>
            <div style={{ width: rin * w * 130, height: 9, borderRadius: 5, background: `${color}99` }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: COLORS.muted }}>{[590, 320, 210][i]}</span>
          </div>
        );
      })}
    </div>
  );
};

// 3 · hands — a mini browser: the cursor eases to targets, clicks, types
const HandsAnim: React.FC<{ t: number; color: string }> = ({ t, color }) => {
  const loop = Math.max(0, t) % 140;
  const cx = interpolate(loop, [6, 30, 60, 84, 140], [320, 74, 74, 220, 320], { ...CLAMP, easing: EASINGS.easeInOut });
  const cy = interpolate(loop, [6, 30, 60, 84, 140], [76, 44, 44, 68, 76], { ...CLAMP, easing: EASINGS.easeInOut });
  const click1 = loop >= 32 && loop <= 50 ? interpolate(loop, [32, 50], [0, 1], CLAMP) : 0;
  const typedDots = Math.max(0, Math.floor((loop - 88) / 7));
  return (
    <div style={{ position: 'relative', width: AW, height: AH, borderRadius: 8, border: `1.5px solid ${COLORS.line}`, background: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, height: 20, background: '#f1f0f7', padding: '0 8px' }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 6.5, height: 6.5, borderRadius: 999, background: c }} />)}
        <div style={{ marginLeft: 6, flex: 1, height: 11, borderRadius: 6, background: '#fff', border: `1px solid ${COLORS.line}` }} />
      </div>
      <div style={{ position: 'absolute', left: 16, top: 32, width: 116, height: 24, borderRadius: 6, background: click1 > 0 ? `${color}33` : `${color}18`, border: `1.5px solid ${color}`, fontSize: 12, fontFamily: FONT_MONO, color: COLORS.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Open page</div>
      <div style={{ position: 'absolute', left: 152, top: 34, width: 170, height: 20, borderRadius: 5, border: `1px solid ${COLORS.line}`, background: COLORS.cream, fontFamily: FONT_MONO, fontSize: 13, color: COLORS.ink, display: 'flex', alignItems: 'center', paddingLeft: 7 }}>
        {'•'.repeat(Math.min(12, typedDots))}
        <span style={{ opacity: Math.floor(loop / 8) % 2 === 0 ? 1 : 0, color }}>▌</span>
      </div>
      {click1 > 0 && (
        <div style={{ position: 'absolute', left: 74 - 12, top: 44 - 12, width: 24, height: 24, borderRadius: 999, border: `2px solid ${color}`, opacity: 0.6 * (1 - click1), transform: `scale(${0.4 + click1 * 1.8})` }} />
      )}
      <svg width={15} height={17} viewBox="0 0 12 14" style={{ position: 'absolute', left: cx, top: cy }}>
        <path d="M1 0 L1 11 L3.8 8.6 L5.6 12.6 L7.7 11.6 L5.9 7.8 L9.5 7.6 Z" fill="#111" stroke="#fff" strokeWidth={0.9} />
      </svg>
    </div>
  );
};

// 4 · lab — a mini terminal runs, breaks, fixes, proves
const LabAnim: React.FC<{ t: number }> = ({ t }) => {
  const loop = Math.max(0, t) % 170;
  const LINES: readonly (readonly [number, string, string])[] = [
    [8, '$ rotate keys', '#cdd6e4'],
    [36, 'pooler: hanging… no error', '#e56b6b'],
    [82, '$ re-seed pooler tenants', '#cdd6e4'],
    [116, '✓ 25/25 connections OK', '#7ee2b8'],
  ];
  return (
    <div style={{ position: 'relative', width: AW, height: AH, borderRadius: 8, background: '#14141c', padding: '10px 14px', boxSizing: 'border-box' }}>
      {LINES.map(([at, txt, c]) => {
        const op = interpolate(loop, [at, at + 7], [0, 1], CLAMP);
        return (
          <div key={txt} style={{ opacity: op, fontFamily: FONT_MONO, fontSize: 13.5, lineHeight: 1.42, color: c }}>
            {txt}
            {txt.startsWith('pooler') && op >= 1 && loop < 80 && <span style={{ color: '#e56b6b' }}>{'.'.repeat(1 + (Math.floor(loop / 9) % 3))}</span>}
          </div>
        );
      })}
    </div>
  );
};

// ---- a corner card -----------------------------------------------------------
const CornerCard: React.FC<{
  frame: number; i: number; activeTo: number;
}> = ({ frame, i, activeTo }) => {
  const b = BLOCKS[i];
  const { Icon } = b;
  const { x, y } = POS[i];
  const shellAt = SHELL[i];
  const shellOp = interpolate(frame, [shellAt, shellAt + 14], [0, 1], ease);
  const shellY = interpolate(frame, [shellAt, shellAt + 14], [26, 0], ease);
  const heat = interpolate(frame, [shellAt, shellAt + 10, activeTo, activeTo + 12], [0, 1, 1, 0], CLAMP);
  const at = (s: number, dy = 12) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], ease),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], ease)}px)`,
  });
  const t = frame - shellAt - 8; // mini-anim clock starts once the card has landed
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: CARD_W, height: CARD_H, boxSizing: 'border-box',
      opacity: shellOp, transform: `translateY(${shellY}px) scale(${1 + 0.015 * heat})`,
      background: COLORS.paper, border: `2px solid ${heat > 0.5 ? b.color : COLORS.line}`,
      borderRadius: RADIUS.card, boxShadow: heat > 0.5 ? `0 12px 44px ${b.color}33` : SHADOW.card,
      padding: '18px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <div style={{ width: 36, height: 36, borderRadius: RADIUS.pill, background: `${b.color}22`, color: b.color, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{b.n}</div>
        <div style={{ ...at(NAME[i]), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 28, color: COLORS.ink }}>{b.name}</div>
        <div style={{ flex: 1 }} />
        <div style={at(NAME[i], 8)}><Icon size={30} color={b.color} strokeWidth={2.1} /></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
        <span style={{ ...at(SUB[i]), fontFamily: FONT_MONO, fontSize: 17, color: b.color }}>{b.sub}</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CHIPS[i].map(([label, cueAt]) => (
            <span key={label} style={{ ...at(cueAt, 8), fontSize: 15.5, color: COLORS.ink, background: COLORS.cream, border: `1px solid ${COLORS.line}`, padding: '3px 10px', borderRadius: RADIUS.pill }}>{label}</span>
          ))}
        </div>
      </div>
      {/* the LIVE mini-animation */}
      <div style={{ position: 'absolute', left: 22, bottom: 16, width: AW, height: AH, opacity: interpolate(frame, [shellAt + 8, shellAt + 20], [0, 1], ease) }}>
        {i === 0 && <PipelineAnim t={t} color={b.color} />}
        {i === 1 && <SensesAnim t={t} color={b.color} />}
        {i === 2 && <HandsAnim t={t} color={b.color} />}
        {i === 3 && <LabAnim t={t} />}
      </div>
    </div>
  );
};

// ---- the shot ----------------------------------------------------------------
const B3FiveBlocks: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = (s: number, dy = 18) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], ease),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], ease)}px)`,
  });
  const brain = BLOCKS[4];
  const BrainIcon = brain.Icon;
  const brainIn = interpolate(frame, [BRAIN.shell, BRAIN.shell + 14], [0, 1], ease);
  const brainPop = interpolate(frame, [BRAIN.shell, BRAIN.shell + 16], [0.7, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const activeTo = [SHELL[1], SHELL[2], SHELL[3], BRAIN.shell] as const;
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      {/* left panel — opaque; the right 640px stays transparent for the master pip */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: PANEL_W, height: 1080, overflow: 'hidden' }}>
        <BrandBg glow={COLORS.accent} />

        {/* headline */}
        <div style={{ position: 'absolute', left: 0, top: 42, width: PANEL_W, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ ...rise(EYEBROW, 12), fontFamily: FONT_MONO, fontSize: 21, letterSpacing: 3, color: COLORS.accent }}>THE&nbsp;CONTENT&nbsp;FACTORY</div>
          <div style={{ ...rise(HEADLINE), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: COLORS.ink, marginTop: 8 }}>5 building blocks</div>
        </div>

        {/* the mesh — progress lines brain -> every card (draw after "most important") */}
        <svg width={PANEL_W} height={1080} style={{ position: 'absolute', left: 0, top: 0 }}>
          {TARGETS.map((tg, i) => {
            const dx = tg.x - BRAIN_C.x, dy = tg.y - BRAIN_C.y;
            const len = Math.hypot(dx, dy);
            const sx = BRAIN_C.x + (dx / len) * (BRAIN_C.r + 6);
            const sy = BRAIN_C.y + (dy / len) * (BRAIN_C.r + 6);
            const seg = Math.hypot(tg.x - sx, tg.y - sy);
            const draw = interpolate(frame, [MESH + i * 8, MESH + i * 8 + 22], [seg, 0], { ...CLAMP, easing: EASINGS.easeInOut });
            if (frame < MESH + i * 8) return null;
            const pt = ((frame - (MESH + i * 8 + 22)) / 55) % 1;
            const showPulse = frame > MESH + i * 8 + 26 && pt >= 0;
            return (
              <g key={i}>
                <line x1={sx} y1={sy} x2={tg.x} y2={tg.y} stroke={`${BLOCKS[i].color}aa`} strokeWidth={4.5}
                  strokeDasharray={`${seg}`} strokeDashoffset={draw} strokeLinecap="round" />
                {showPulse && (
                  <circle cx={lerp(sx, tg.x, pt)} cy={lerp(sy, tg.y, pt)} r={6} fill={BLOCKS[i].color} opacity={0.9} />
                )}
              </g>
            );
          })}
        </svg>

        {/* the four corner blocks */}
        {[0, 1, 2, 3].map((i) => <CornerCard key={i} frame={frame} i={i} activeTo={activeTo[i]} />)}

        {/* the most important — the tag above the brain */}
        <div style={{ ...rise(BRAIN.tag, 8), position: 'absolute', left: BRAIN_C.x - 160, top: 388, width: 320, textAlign: 'center' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 18, letterSpacing: 1.5, color: brain.color, background: `${brain.color}1f`, padding: '7px 16px', borderRadius: RADIUS.pill }}>the most important</span>
        </div>

        {/* the BRAIN — center */}
        {brainIn > 0 && (
          <div style={{
            position: 'absolute', left: BRAIN_C.x - BRAIN_C.r, top: BRAIN_C.y - BRAIN_C.r,
            width: BRAIN_C.r * 2, height: BRAIN_C.r * 2, borderRadius: 999, opacity: brainIn,
            transform: `scale(${brainPop})`, background: COLORS.paper, border: `3px solid ${brain.color}`,
            boxShadow: `0 16px 60px ${brain.color}40`, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <BrainIcon size={52} color={brain.color} strokeWidth={2} />
            <div style={{ ...rise(BRAIN.name, 8), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: COLORS.ink }}>The brain</div>
            <div style={{ ...rise(BRAIN.sub, 6), fontFamily: FONT_MONO, fontSize: 18, color: brain.color }}>my brain</div>
          </div>
        )}

        {/* what the brain holds + the payoff caption */}
        <div style={{ position: 'absolute', left: BRAIN_C.x - 175, top: 702, width: 350, display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {BRAIN_CHIPS.map(([label, cueAt]) => (
            <span key={label} style={{ ...rise(cueAt, 10), fontSize: 17.5, color: COLORS.ink, background: COLORS.cream, border: `1px solid ${COLORS.line}`, padding: '5px 14px', borderRadius: RADIUS.pill }}>{label}</span>
          ))}
        </div>
        <div style={{ ...rise(BRAIN.caption, 10), position: 'absolute', left: BRAIN_C.x - 220, top: 798, width: 440, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, color: brain.color }}>
          writes exactly like me
        </div>
      </div>

      {/* divider + soft shade over the pip's left edge (B2a split language) */}
      <div style={{ position: 'absolute', left: PANEL_W - 3, top: 0, width: 3, height: 1080, background: COLORS.ink, opacity: 0.9 }} />
      <div style={{ position: 'absolute', left: PANEL_W, top: 0, width: 36, height: 1080, background: 'linear-gradient(90deg, rgba(0,0,0,0.22), rgba(0,0,0,0))' }} />
    </AbsoluteFill>
  );
};

export default B3FiveBlocks;
