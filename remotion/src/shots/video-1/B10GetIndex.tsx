import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_BODY, FONT_MONO, FONT_SERIF } from '../../fonts';
import { CLAMP, Sunburst } from '../../lib/kit';

// =============================================================================
// B10 (2/4) — get-index. Master span 681.596967 -> 687.296967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 681.596967) * 30)).
//   "Watch this."             684.73 -> f4    empty session, cursor
//   "get-index."              685.62 -> f31   the MCP tool call line
//                                     f45     the result opens
//   "That's everything my     686.90 -> f69   the real index streams in
//    brain holds."            688.01 -> f102  "49 entities" chip
//   "One line each."          689.14 -> f136  the bracket + annotation
// Every row below is real output from the live BrainOutside MCP server at the
// private tier (49 entities). Descriptions are condensed to fit; the ` — ` in
// the raw output is rendered as ` · ` because on-screen text carries no
// em-dashes (brand.md §1).
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B10GetIndex', durationInSeconds: 5.7, fps: 30, width: 1920, height: 1080 };

const CC = {
  bg: '#1c1b19', panel: '#211f1d', border: '#38342e',
  coral: '#cd8064', text: '#ebe8e3', muted: '#8f8981', faint: '#6d675f',
} as const;

const F_CALL = 31;
const F_OPEN = 45;
const F_ROWS = 69;
const F_COUNT = 102;
const F_EACH = 136;

const ROW_H = 38;
const ROWS_TOP = 274;
const COL_L = 350;

type Row = { head: string } | { kind: string; title: string; desc?: string };

const ROWS: Row[] = [
  { head: '# INDEX  (tier: private)' },
  { head: '## Identity' },
  { kind: 'identity', title: 'Who Hasan is', desc: 'positioning, audience' },
  { kind: 'identity', title: 'How Hasan writes', desc: 'voice, per platform' },
  { kind: 'identity', title: 'Cross-cutting principles', desc: 'beliefs' },
  { head: '## Projects' },
  { kind: 'project', title: 'learnwithhasan', desc: 'main site + YouTube' },
  { kind: 'project', title: 'simplerllm', desc: 'one Python API for 11 LLM providers' },
  { kind: 'project', title: 'toolerbox', desc: '158 free tools + paid API/MCP' },
  { kind: 'project', title: 'pyrunner', desc: 'self-hosted Python automation' },
  { kind: 'project', title: 'vidtsx', desc: 'video as code, Remotion' },
  { head: '## Knowledge' },
  { kind: 'story', title: 'Adding up my cloud bills', desc: '$8.4k/yr, then one VPS' },
  { kind: 'take', title: 'The maintenance burden is measured in seconds' },
  { kind: 'take', title: 'The combination is the engine, not the model' },
  { kind: 'lesson', title: 'Self-hosted SMTP lives or dies on port 25 + PTR' },
  { kind: 'fact', title: 'ToolerBox exposes a paid REST API + MCP server' },
  { head: '## Catalogs and lenses' },
  { kind: 'catalog', title: 'X, YouTube, Blog' },
  { kind: 'lens', title: 'Lens: self-hosting' },
];

const B10GetIndex: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const callOp = r(F_CALL, F_CALL + 12);
  const callY = r(F_CALL, F_CALL + 12, 12, 0);
  const openOp = r(F_OPEN, F_OPEN + 12);
  const railH = r(F_OPEN, F_OPEN + 20, 0, 1, EASINGS.easeOut);
  const countOp = r(F_COUNT, F_COUNT + 14);
  const countY = r(F_COUNT, F_COUNT + 14, 10, 0);
  const brk = r(F_EACH, F_EACH + 12);
  const labelOp = r(F_EACH + 6, F_EACH + 18);

  return (
    <AbsoluteFill style={{ backgroundColor: CC.bg, fontFamily: FONT_BODY }}>
      <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <Sunburst size={30} />
        <span style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 38, color: CC.coral }}>Claude Code</span>
      </div>

      {/* ---- the MCP tool call ---- */}
      <div style={{
        position: 'absolute', left: 300, top: 168, display: 'flex', alignItems: 'center', gap: 16,
        opacity: callOp, transform: `translateY(${callY}px)`,
      }}>
        <span style={{ width: 15, height: 15, borderRadius: '50%', background: CC.coral }} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 32, color: CC.text }}>brainoutside</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 32, color: CC.faint }}>&middot;</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 32, color: CC.coral }}>get-index</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 27, color: CC.faint }}>(MCP)</span>
      </div>

      {/* ---- the result ---- */}
      <div style={{ position: 'absolute', left: 307, top: 232, width: 3, height: 760, background: CC.border, opacity: openOp, transform: `scaleY(${railH})`, transformOrigin: 'top' }} />

      <div style={{ position: 'absolute', left: COL_L, top: ROWS_TOP, width: 1000 }}>
        {ROWS.map((row, i) => {
          const at = 'head' in row && i === 0 ? F_OPEN : F_ROWS + (i - 1) * 2;
          const op = r(at, at + 12);
          const y = r(at, at + 12, 8, 0);
          return (
            <div key={i} style={{ height: ROW_H, display: 'flex', alignItems: 'center', opacity: op, transform: `translateY(${y}px)`, whiteSpace: 'pre', fontFamily: FONT_MONO, fontSize: 26 }}>
              {'head' in row ? (
                <span style={{ color: i === 0 ? CC.muted : CC.faint, letterSpacing: 0.6 }}>{row.head}</span>
              ) : (
                <>
                  <span style={{ color: CC.faint }}>{'- '}</span>
                  <span style={{ color: CC.coral }}>{`[${row.kind}]`}</span>
                  <span style={{ color: CC.text }}>{` ${row.title}`}</span>
                  {row.desc && <span style={{ color: CC.faint }}>{` · ${row.desc}`}</span>}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- everything my brain holds ---- */}
      <div style={{
        position: 'absolute', right: 300, top: 172,
        display: 'flex', alignItems: 'center', gap: 12, height: 48,
        background: `${CC.coral}1a`, border: `1px solid ${CC.coral}59`, borderRadius: RADIUS.pill,
        padding: '0 24px', opacity: countOp, transform: `translateY(${countY}px)`,
      }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 26, color: CC.coral }}>49 entities</span>
      </div>

      {/* ---- one line each ---- */}
      <div style={{
        position: 'absolute', left: 1330, top: ROWS_TOP + 4, width: 5,
        height: ROWS.length * ROW_H - 8, background: COLORS.warn,
        transform: `scaleY(${brk})`, transformOrigin: 'top', opacity: 0.85,
      }} />
      <div style={{
        position: 'absolute', left: 1372, top: ROWS_TOP + (ROWS.length * ROW_H) / 2 - 50, width: 280,
        opacity: labelOp, fontFamily: FONT_MONO, fontSize: 34, lineHeight: 1.35, color: COLORS.warn,
      }}>
        one line
        <br />
        each
      </div>
    </AbsoluteFill>
  );
};

export default B10GetIndex;
