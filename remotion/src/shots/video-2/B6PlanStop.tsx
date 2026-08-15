import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { CircleCheck } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';
import { FactoryLine, CORAL } from './_shared/FactoryLine';

// ============================================================================
// B6 · step 3 · PLAN — ROUND-5: the real S3 plan + the Checkpoint-1 "apprive"
// moment re-laid for the top half; the factory band advances the piece to
// station 3 on the beat boundary.
// Master span 335.2 -> 356.4 (21.2s). local f = round((master_s - 335.2) * 30).
// Cues: "writes a plan" 337.060->f56 · "main idea" 338.826->f109 ·
// "8 experiments" 339.645->f133 · "$0.70" 343.402->f246 · "cap of $1.50"
// 345.891->f321 · "cannot pass" 347.995->f384 · "it stops" 349.263->f422 ·
// "I approve." 354.804->f588
// ============================================================================
export const compositionConfig = { id: 'B6PlanStop', durationInSeconds: 21.2, fps: 30, width: 1920, height: 1080 };

const PLAN = 56;
const THESIS = 109;
const EXPS = 133;
const COST = 246;
const CAP = 321;
const STOP = 422;
const APPROVE = 588;

// the real E1-E8 (evidence-manifest.md), one-word handles
const EXPERIMENTS = ['E1 bring-up', 'E2 secrets', 'E3 auth email', 'E4 storage', 'E5 pooling', 'E6 upgrade', 'E7 backups', 'E8 exposure'] as const;

const B6PlanStop: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const at = (s: number, dy = 14) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  // the plan card dims while the factory waits at the gate
  const dim = interpolate(frame, [STOP, STOP + 14, APPROVE, APPROVE + 10], [1, 0.45, 0.45, 1], CLAMP);
  const pulse = 0.45 + 0.55 * Math.abs(Math.sin(frame / 11));
  const waiting = frame >= STOP + 6 && frame < APPROVE + 4;
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.warn} />
      {/* header — compact, left */}
      <div style={{ position: 'absolute', left: 64, top: 26 }}>
        <div style={{ ...rise(PLAN, 12), fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 3, color: CORAL }}>STEP&nbsp;3&nbsp;·&nbsp;PLAN</div>
        <div style={{ ...rise(PLAN + 10), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink, marginTop: 4 }}>
          a plan, then a full stop
        </div>
      </div>
      {/* the real S3 plan */}
      <div style={{ ...rise(THESIS - 10, 16), position: 'absolute', left: 60, top: 148, width: 1500 }}>
        <div style={{ opacity: dim, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '26px 36px' }}>
          <div style={{ ...at(THESIS), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 29, color: COLORS.ink, lineHeight: 1.32 }}>
            The compose gets you a login screen.<br />
            <span style={{ color: COLORS.accent }}>Everything after it</span> is the guide: run for real, with numbers.
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 20 }}>
            {EXPERIMENTS.map((e, i) => (
              <span key={e} style={{ ...at(EXPS + i * 4, 10), fontFamily: FONT_MONO, fontSize: 20, color: COLORS.ink, background: COLORS.cream, border: `1px solid ${COLORS.line}`, padding: '7px 14px', borderRadius: RADIUS.pill }}>{e}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 20, alignItems: 'center' }}>
            <span style={{ ...at(COST), fontFamily: FONT_MONO, fontSize: 24, color: COLORS.ink }}>estimated <b style={{ color: COLORS.signal }}>$0.70</b></span>
            <span style={{ ...at(CAP), fontFamily: FONT_MONO, fontSize: 24, color: COLORS.ink, background: `${COLORS.danger}14`, border: `1px solid ${COLORS.danger}`, padding: '5px 15px', borderRadius: RADIUS.pill }}>
              hard cap <b style={{ color: COLORS.danger }}>$1.50</b>, it cannot pass
            </span>
          </div>
        </div>
        {/* the gate */}
        <div style={{ ...at(STOP, 16), marginTop: 18, background: COLORS.paper, border: `2px solid ${frame >= APPROVE ? COLORS.signal : COLORS.warn}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '18px 30px', display: 'flex', alignItems: 'center', gap: 18 }}>
          {waiting ? (
            <>
              <div style={{ width: 17, height: 17, borderRadius: 999, background: COLORS.warn, opacity: pulse, flexShrink: 0 }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.ink }}>CHECKPOINT&nbsp;1 — stopped. No server is touched before approval.</span>
            </>
          ) : frame >= APPROVE ? (
            <>
              <CircleCheck size={28} color={COLORS.signal} strokeWidth={2.4} style={{ flexShrink: 0 }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 23, color: COLORS.ink }}>
                2026-08-11 — Hasan approved the plan as presented (<b style={{ color: COLORS.signal }}>"apprive"</b>), no changes requested.
              </span>
            </>
          ) : (
            <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.muted }}>…</span>
          )}
        </div>
      </div>
      {/* the factory — belt advances the piece to station 3 */}
      <FactoryLine station={2} pieceFrom={1} advanceAt={0} />
    </AbsoluteFill>
  );
};

export default B6PlanStop;
