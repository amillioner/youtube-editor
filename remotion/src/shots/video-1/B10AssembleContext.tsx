import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Braces, Quote, TriangleAlert } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_BODY, FONT_MONO, FONT_SERIF } from '../../fonts';
import { CLAMP, Sunburst } from '../../lib/kit';

// =============================================================================
// B10 (3/4) — assemble-context, the hero call. Master span 687.296967 -> 698.996967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 687.296967) * 30)).
//   "assemble-context."       690.52 -> f7    the MCP tool call line
//   "This is the good one."   692.11 -> f54   coral wipe under the tool name
//   "I hand it a task"        693.54 -> f97   the real task parameter renders
//   "it goes and builds"      695.08 -> f143  assembling spinner
//   "a pack"                  696.13 -> f175  the pack panel opens (empty bands)
//   "for that exact task."    696.77 -> f194  accent rail links task -> pack
//   "The right notes,"        698.68 -> f251  entity_ids_used fills (indigo)
//   "the real quotes,"        699.98 -> f290  the verbatim quote fills (teal)
//   "and the gaps."           701.09 -> f324  the gaps field fills (warn)
// Everything in the pack panel is REAL output from the live BrainOutside MCP
// server (private tier) for this exact task: the six entity ids, the verbatim
// line from take-2026-07-maintenance-burden-in-seconds, and the gaps entry.
// The pack panel deliberately reuses B1.5's treatment (d900 window, warn rail +
// warning chip on gaps) because 702.05 calls straight back to that card.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B10AssembleContext', durationInSeconds: 11.7, fps: 30, width: 1920, height: 1080 };

const CC = {
  bg: '#1c1b19', border: '#38342e',
  coral: '#cd8064', text: '#ebe8e3', muted: '#8f8981', faint: '#6d675f',
} as const;

const F_CALL = 7;
const F_GOOD = 54;
const F_TASK = 97;
const F_SPIN = 143;
const F_PACK = 175;
const F_LINK = 194;
const F_NOTES = 251;
const F_QUOTES = 290;
const F_GAPS = 324;

const PANEL_TOP = 344;
const PANEL_L = 150;
const PANEL_W = 1620;
const BAR_H = 54;
const B1_Y = BAR_H + 28; // entity ids
const B2_Y = B1_Y + 150; // verbatim
const B3_Y = B2_Y + 118; // gaps
const BLOCK_L = 30;
const BLOCK_W = PANEL_W - 60;

const ENTITY_IDS = [
  'identity-core',
  'identity-voice',
  'story-2026-05-added-up-my-cloud-bills',
  'take-2026-07-maintenance-burden-in-seconds',
  'story-2026-05-system-no-saas-could-sell-me',
  'lesson-2026-05-self-host-smtp-port-25-ptr',
];

const B10AssembleContext: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const callOp = r(F_CALL, F_CALL + 12);
  const callY = r(F_CALL, F_CALL + 12, 12, 0);
  const goodWipe = r(F_GOOD, F_GOOD + 10);

  const taskOp = r(F_TASK, F_TASK + 14);
  const taskY = r(F_TASK, F_TASK + 14, 14, 0);

  const spinOp = r(F_SPIN, F_SPIN + 10) * (1 - r(F_PACK, F_PACK + 10));
  const spin = (frame * 9) % 360;

  const packOp = r(F_PACK, F_PACK + 14);
  const packY = r(F_PACK, F_PACK + 16, 22, 0);
  const link = r(F_LINK, F_LINK + 14);

  const notes = r(F_NOTES, F_NOTES + 14);
  const notesY = r(F_NOTES, F_NOTES + 14, 12, 0);
  const quotes = r(F_QUOTES, F_QUOTES + 14);
  const quotesY = r(F_QUOTES, F_QUOTES + 14, 12, 0);
  const gaps = r(F_GAPS, F_GAPS + 14);
  const gapsY = r(F_GAPS, F_GAPS + 14, 12, 0);

  // loading skeleton under each block until its content lands
  const Band: React.FC<{ fill: number }> = ({ fill }) => (
    <div style={{ position: 'absolute', left: 0, top: 6, opacity: 0.5 * (1 - fill) }}>
      <div style={{ width: 240, height: 10, borderRadius: 5, background: COLORS.d600 }} />
      <div style={{ width: 560, height: 10, borderRadius: 5, background: COLORS.d600, marginTop: 20 }} />
    </div>
  );

  const label = (color: string): React.CSSProperties => ({
    fontFamily: FONT_MONO, fontSize: 25, letterSpacing: 1.6, color, marginBottom: 14,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: CC.bg, fontFamily: FONT_BODY }}>
      <div style={{ position: 'absolute', top: 34, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
        <Sunburst size={28} />
        <span style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 34, color: CC.coral }}>Claude Code</span>
      </div>

      {/* ---- the MCP tool call ---- */}
      <div style={{
        position: 'absolute', left: 150, top: 130, display: 'flex', alignItems: 'center', gap: 16,
        opacity: callOp, transform: `translateY(${callY}px)`,
      }}>
        <span style={{ width: 15, height: 15, borderRadius: '50%', background: CC.coral }} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 30, color: CC.text }}>brainoutside</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 30, color: CC.faint }}>&middot;</span>
        <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_MONO, fontSize: 30, color: CC.coral }}>
          assemble-context
          <span style={{ position: 'absolute', left: 0, right: 0, bottom: -8, height: 3, borderRadius: 2, background: CC.coral, transform: `scaleX(${goodWipe})`, transformOrigin: 'left' }} />
        </span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 26, color: CC.faint }}>(MCP)</span>
      </div>

      {/* ---- task -> pack rail ---- */}
      <div style={{
        position: 'absolute', left: 166, top: 186, width: 4, height: PANEL_TOP - 186,
        background: COLORS.accent, opacity: 0.9, transform: `scaleY(${link})`, transformOrigin: 'top',
      }} />

      {/* ---- the real task parameter ---- */}
      <div style={{
        position: 'absolute', left: 200, top: 186, width: 1560,
        opacity: taskOp, transform: `translateY(${taskY}px)`,
      }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 1.6, color: CC.faint, marginBottom: 12 }}>TASK</div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 25, lineHeight: 1.5, color: CC.text }}>
          &quot;Reply to a post on X: &lsquo;Self hosting sounds cheap until it breaks at 3am. Managed cloud costs more,
          but at least you sleep.&rsquo; Write as Hasan, in his voice, using his real numbers.&quot;
        </div>
      </div>

      {/* ---- assembling ---- */}
      <div style={{ position: 'absolute', left: 200, top: 300, display: 'flex', alignItems: 'center', gap: 14, opacity: spinOp }}>
        <div style={{ transform: `rotate(${spin}deg)`, display: 'flex' }}><Sunburst size={24} /></div>
        <span style={{ fontFamily: FONT_MONO, fontSize: 27, color: CC.muted }}>assembling the pack</span>
      </div>

      {/* ---- the returned pack ---- */}
      <div style={{
        position: 'absolute', left: PANEL_L, top: PANEL_TOP, width: PANEL_W,
        background: COLORS.d900, border: `1px solid ${COLORS.d600}`, borderRadius: RADIUS.window,
        boxShadow: SHADOW.card, overflow: 'hidden', height: B3_Y + 122,
        opacity: packOp, transform: `translateY(${packY}px)`,
      }}>
        {/* window chrome (brand.md §5) — same treatment as B1.5's pack */}
        <div style={{ height: BAR_H, background: COLORS.d800, borderBottom: `1px solid ${COLORS.d600}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px' }}>
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS.d600 }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS.d600 }} />
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: COLORS.d600 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 18 }}>
            <Braces size={19} color={COLORS.d400} strokeWidth={1.9} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 21, color: COLORS.d400 }}>context-pack.json</span>
          </div>
          <span style={{ marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 19, color: COLORS.d400, border: `1px solid ${COLORS.d600}`, borderRadius: RADIUS.pill, padding: '4px 16px' }}>
            tier: private
          </span>
        </div>

        {/* ---- block 1: the right notes ---- */}
        <div style={{ position: 'absolute', left: BLOCK_L, top: B1_Y, width: BLOCK_W }}>
          <Band fill={notes} />
          <div style={{ opacity: notes, transform: `translateY(${notesY}px)` }}>
            <div style={label(COLORS.accent)}>ENTITY_IDS_USED</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {ENTITY_IDS.map((id) => (
                <span key={id} style={{
                  fontFamily: FONT_MONO, fontSize: 21, color: COLORS.d300,
                  background: `${COLORS.accent}1f`, border: `1px solid ${COLORS.accent}66`,
                  borderRadius: RADIUS.pill, padding: '7px 18px',
                }}>{id}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ---- block 2: the real quotes ---- */}
        <div style={{ position: 'absolute', left: BLOCK_L, top: B2_Y, width: BLOCK_W }}>
          <Band fill={quotes} />
          <div style={{ opacity: quotes, transform: `translateY(${quotesY}px)` }}>
            <div style={label(COLORS.signal)}>VERBATIM</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <Quote size={26} color={COLORS.signal} strokeWidth={2.2} style={{ flexShrink: 0, marginTop: 6 }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 29, color: COLORS.d300 }}>
                &quot;Sixteen seconds of downtime, twice a year, for analytics.&quot;
              </span>
            </div>
          </div>
        </div>

        {/* ---- block 3: and the gaps ---- */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: B3_Y - 20, height: 108, background: `${COLORS.warn}0f`, opacity: gaps }} />
        <div style={{ position: 'absolute', left: 0, top: B3_Y - 20, width: 6, height: 108, background: COLORS.warn, opacity: gaps }} />
        <div style={{ position: 'absolute', left: BLOCK_L, top: B3_Y, width: BLOCK_W }}>
          <Band fill={gaps} />
          <div style={{ opacity: gaps, transform: `translateY(${gapsY}px)` }}>
            <div style={label(COLORS.warn)}>GAPS</div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 29, color: COLORS.d300 }}>
                &quot;No note records an actual 3am outage for Hasan specifically.&quot;
              </span>
              <div style={{
                marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, height: 40,
                background: `${COLORS.warn}1a`, border: `1px solid ${COLORS.warn}59`, borderRadius: RADIUS.pill,
                padding: '0 20px',
              }}>
                <TriangleAlert size={19} color={COLORS.warn} strokeWidth={2.2} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 21, color: COLORS.warn }}>warning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default B10AssembleContext;
