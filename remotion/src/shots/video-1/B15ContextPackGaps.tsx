import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { Braces, TriangleAlert } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP, useRise } from '../../lib/kit';
import { Marker } from '../../lib/browser';

// =============================================================================
// B1.5 (1/3) — the hero asset: a real context pack, with the `gaps` field as the
// subject. Master span 100.232167 -> 110.732167 (local frame = round((t - 100.232167) * 30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//   "My brain, my AI brain,"      101.42 -> f0    pack rises + streams in
//   "sent me a warning."          104.79 -> f102  gaps key turns warn, rail +
//                                                 chip land, every other field dims
//   "Do not invent this number,"  106.88 -> f164  highlight sweep (the payoff)
//   "how much time maintenance"   110.65 -> f278  underline on the missing figure
// Colour: COLORS.warn, not danger. brand.md §3 gives yellow the "highlight
// sweeps / watch this" role and pink the "error" role — the gaps field is not an
// error, it is the brain telling the model to watch out, and yellow is the only
// palette colour that stays legible as a sweep on the d900 panel.
// =============================================================================
export const compositionConfig = { id: 'B15ContextPackGaps', durationInSeconds: 10.5, fps: 30, width: 1920, height: 1080 };

const F_WARN = 102; // "warning."
const F_INVENT = 164; // "invent this number"
const F_MAINT = 278; // "maintenance takes"

const ROW_H = 48;
const PAD_TOP = 40;
const PAD_BOT = 44;
const GAPS_FIRST = 5; // row index of `"gaps": [`
const GAPS_ROWS = 5; // through `],`
// frame each row lands on — also drives the panel's height, so the pack GROWS as
// it streams in instead of sitting in a half-empty box
const ROW_AT = [6, 10, 14, 18, 22, 28, 34, 39, 44, 50, 55, 60];

// underline wipe (brand.md §6 — ~10 frames, no bounce)
const Wipe: React.FC<{ start: number; color: string; children: React.ReactNode }> = ({ start, color, children }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [start, start + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'pre' }}>
      {children}
      <span style={{ position: 'absolute', left: 0, right: 0, bottom: -3, height: 3, background: color, borderRadius: 2, transform: `scaleX(${w})`, transformOrigin: 'left' }} />
    </span>
  );
};

const Row: React.FC<{ num: number | null; at: number; dim?: boolean; children: React.ReactNode }> = ({ num, at, dim, children }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const y = interpolate(frame, [at, at + 14], [14, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const fade = dim ? interpolate(frame, [F_WARN, F_WARN + 18], [1, 0.42], { ...CLAMP, easing: EASINGS.easeOut }) : 1;
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: ROW_H, opacity: op * fade, transform: `translateY(${y}px)`, position: 'relative' }}>
      <span style={{ width: 78, flexShrink: 0, textAlign: 'right', paddingRight: 26, fontFamily: FONT_MONO, fontSize: 21, color: COLORS.d600 }}>{num ?? ''}</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 28, whiteSpace: 'pre', lineHeight: 1 }}>{children}</span>
    </div>
  );
};

const B15ContextPackGaps: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  const panelOp = interpolate(frame, [0, 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const panelY = interpolate(frame, [0, 16], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
  // slow, calm push toward the gaps block once the warning has landed
  const push = interpolate(frame, [F_WARN, 300], [1, 1.014], { ...CLAMP, easing: EASINGS.easeInOut });

  const railOp = interpolate(frame, [F_WARN, F_WARN + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const gapsKey = interpolateColors(frame, [F_WARN, F_WARN + 16], [COLORS.d300, COLORS.warn]);
  const phrase = interpolateColors(frame, [F_INVENT, F_INVENT + 14], [COLORS.d300, COLORS.warn]);
  const chipOp = interpolate(frame, [F_WARN, F_WARN + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const chipY = interpolate(frame, [F_WARN, F_WARN + 14], [10, 0], { ...CLAMP, easing: EASINGS.easeOut });

  const shownRows = interpolate(frame, ROW_AT, ROW_AT.map((_, i) => i + 1), { ...CLAMP, easing: EASINGS.easeOut });
  const docH = PAD_TOP + shownRows * ROW_H + PAD_BOT;

  const key = { color: COLORS.d300 };
  const val = { color: COLORS.d400 };
  const pun = { color: COLORS.d600 };
  const gap = { color: COLORS.d300 };

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <div style={{ ...rise(2, 14), position: 'absolute', top: 112, left: 0, right: 0, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.muted }}>
        WHAT&nbsp;MY&nbsp;BRAIN&nbsp;SENDS&nbsp;THE&nbsp;MODEL
      </div>

      <div style={{
        position: 'absolute', left: 190, top: 186, width: 1540,
        background: COLORS.d900, border: `1px solid ${COLORS.d600}`,
        borderRadius: RADIUS.window, overflow: 'hidden', boxShadow: SHADOW.card,
        opacity: panelOp, transform: `translateY(${panelY}px) scale(${push})`, transformOrigin: '50% 68%',
      }}>
        {/* window chrome (brand.md §5) */}
        <div style={{ height: 56, background: COLORS.d800, borderBottom: `1px solid ${COLORS.d600}`, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px' }}>
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

        {/* document */}
        <div style={{ position: 'relative', padding: `${PAD_TOP}px 26px ${PAD_BOT}px`, height: docH, boxSizing: 'border-box', overflow: 'hidden' }}>
          {/* the gaps band: warn rail + faint tint, lands on "warning." */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: PAD_TOP + GAPS_FIRST * ROW_H, height: GAPS_ROWS * ROW_H, background: `${COLORS.warn}0f`, opacity: railOp }} />
          <div style={{ position: 'absolute', left: 0, top: PAD_TOP + GAPS_FIRST * ROW_H, width: 6, height: GAPS_ROWS * ROW_H, background: COLORS.warn, opacity: railOp }} />

          <Row num={1} at={6} dim><span style={pun}>{'{'}</span></Row>
          <Row num={2} at={10} dim>
            <span style={pun}>{'  '}</span><span style={key}>&quot;tier&quot;</span><span style={pun}>: </span><span style={val}>&quot;private&quot;</span><span style={pun}>,</span>
          </Row>
          <Row num={3} at={14} dim>
            <span style={pun}>{'  '}</span><span style={key}>&quot;task&quot;</span><span style={pun}>: </span><span style={val}>&quot;reply to the self-hosting post&quot;</span><span style={pun}>,</span>
          </Row>
          <Row num={4} at={18} dim>
            <span style={pun}>{'  '}</span><span style={key}>&quot;context_pack&quot;</span><span style={pun}>: </span><span style={val}>&quot;## Identity ... ## Voice ... ## The real numbers ...&quot;</span><span style={pun}>,</span>
          </Row>
          <Row num={5} at={22} dim>
            <span style={pun}>{'  '}</span><span style={key}>&quot;entity_ids_used&quot;</span><span style={pun}>: [</span><span style={val}>&quot;identity-voice&quot;</span><span style={pun}>, </span><span style={val}>&quot;take-maintenance-burden&quot;</span><span style={pun}>],</span>
          </Row>

          {/* ---- the field that matters ---- */}
          <Row num={6} at={28}>
            <span style={pun}>{'  '}</span><span style={{ color: gapsKey, fontWeight: 700 }}>&quot;gaps&quot;</span><span style={pun}>: [</span>
          </Row>
          <Row num={7} at={34}>
            <span style={pun}>{'    '}</span><span style={gap}>&quot;No sourced figure for </span>
            <Wipe start={F_MAINT} color={`${COLORS.warn}cc`}><span style={gap}>hours per week on maintenance</span></Wipe>
            <span style={gap}>.</span>
          </Row>
          <Row num={null} at={39}>
            <span style={pun}>{'     '}</span>
            <Marker start={F_INVENT} color={`${COLORS.warn}30`} pad={9} radius={6}>
              <span style={{ color: phrase, fontWeight: 700 }}>Do not invent this number.</span>
            </Marker>
            <span style={gap}> Only the 16 second upgrade</span>
          </Row>
          <Row num={null} at={44}>
            <span style={pun}>{'     '}</span><span style={gap}>timing is real.&quot;</span>
          </Row>
          <Row num={8} at={50}>
            <span style={pun}>{'  ],'}</span>
          </Row>
          {/* ---- back to subordinate ---- */}
          <Row num={9} at={55} dim>
            <span style={pun}>{'  '}</span><span style={key}>&quot;tokens&quot;</span><span style={pun}>: {'{ '}</span><span style={key}>&quot;input&quot;</span><span style={pun}>: </span><span style={val}>12</span><span style={pun}>, </span><span style={key}>&quot;output&quot;</span><span style={pun}>: </span><span style={val}>3626</span><span style={pun}> {'}'}</span>
          </Row>
          <Row num={10} at={60} dim><span style={pun}>{'}'}</span></Row>

          {/* warning chip, right-aligned on the gaps row */}
          <div style={{
            position: 'absolute', right: 26, top: PAD_TOP + GAPS_FIRST * ROW_H + 6,
            display: 'flex', alignItems: 'center', gap: 10, height: 36,
            background: `${COLORS.warn}1a`, border: `1px solid ${COLORS.warn}59`, borderRadius: RADIUS.pill,
            padding: '0 18px', opacity: chipOp, transform: `translateY(${chipY}px)`,
          }}>
            <TriangleAlert size={18} color={COLORS.warn} strokeWidth={2.2} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.warn, letterSpacing: 0.5 }}>warning</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default B15ContextPackGaps;
