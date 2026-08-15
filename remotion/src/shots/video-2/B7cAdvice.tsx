import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { TermWindow, TermLines, TermLine } from './_shared/TermKit';
import { FactoryLine } from './_shared/FactoryLine';

// ============================================================================
// B7c · step 4 · LAB, part 3 — ROUND-5: same layout language (terminal LEFT,
// story slot RIGHT). The advice card fills the right slot; the teardown runs
// in the same terminal; the bill lands on "35 cents". Piece stays at the lab.
// Master span 425.0 -> 447.3 (22.3s). local f = round((master_s - 425.0) * 30).
// Cues: "Set all your secrets" 425.4->f12 · "pooler dies quietly" 428.4->f102 ·
// "No guide ranking on Google" 430.8->f174 · "because it lived it" 436.4->f342 ·
// "destroys the server" 440.9->f477 (teardown types f465+) · "teardown is part
// of the work" 442.6->f528 · "35 cents" 445.9->f627
// ============================================================================
export const compositionConfig = { id: 'B7cAdvice', durationInSeconds: 22.3, fps: 30, width: 1920, height: 1080 };

const ADVICE1 = 12;
const ADVICE2 = 96;
const NOGUIDE = 174;
const LIVED = 342;
const TEAR = 465;
const BILL = 627;

const LINES: readonly TermLine[] = [
  [0, 'lab complete: 8/8 experiments · evidence/*.out saved', 'ok'],
  [0, 'ledger.json updated · every claim has a receipt', 'dim'],
  [TEAR, '$ do.py destroy cf-self-host-supabase', 'accent'],
  [TEAR + 22, 'droplet destroyed 12:30 UTC · DNS removed · sweep clean', 'ok'],
  [TEAR + 44, 'the box no longer exists. the numbers do.', 'dim'],
];

const B7cAdvice: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (s: number, dy = 14) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  const billIn = interpolate(frame, [BILL, BILL + 10], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />
      {/* left: the same lab terminal — teardown is part of the work */}
      <TermWindow title="root@cf-self-host-supabase — teardown is part of the work" x={60} y={76} w={990} h={548}>
        <TermLines lines={LINES} rows={13} size={19} lineH={34} w={940} cursorUntil={TEAR - 6} />
      </TermWindow>
      {/* the bill — lands over the terminal on "35 cents" */}
      <div style={{ position: 'absolute', left: 60, width: 990, top: 440, display: 'flex', justifyContent: 'center', opacity: billIn, zIndex: 5 }}>
        <div style={{ transform: `scale(${0.8 + 0.2 * billIn})`, display: 'flex', alignItems: 'baseline', gap: 16, background: COLORS.paper, border: `2px solid ${COLORS.signal}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '12px 32px' }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 52, color: COLORS.signal }}>$0.35</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 26, color: COLORS.ink }}>total server bill</span>
        </div>
      </div>
      {/* right: the headline advice card */}
      <div style={{ ...at(ADVICE1 - 8, 16), position: 'absolute', left: 1090, top: 76, width: 770, boxSizing: 'border-box', background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '30px 38px' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 18, letterSpacing: 2.5, color: COLORS.accent }}>THE&nbsp;HEADLINE&nbsp;ADVICE&nbsp;OF&nbsp;THE&nbsp;GUIDE</div>
        <div style={{ ...at(ADVICE1), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 42, color: COLORS.ink, lineHeight: 1.22, marginTop: 18 }}>
          Set all your secrets <span style={{ color: COLORS.accent }}>before the first boot.</span>
        </div>
        <div style={{ ...at(ADVICE2), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: COLORS.danger, marginTop: 14 }}>
          Or your pooler dies quietly later.
        </div>
        <div style={{ ...at(NOGUIDE), fontSize: 25, color: COLORS.muted, marginTop: 30 }}>
          no guide ranking on Google knows this
        </div>
        <div style={{ ...at(LIVED), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 27, color: COLORS.ink, marginTop: 8 }}>
          the factory knows it because it <span style={{ color: COLORS.signal }}>lived it</span>
        </div>
      </div>
      {/* the factory — piece stays at the lab */}
      <FactoryLine station={3} pieceFrom={3} />
    </AbsoluteFill>
  );
};

export default B7cAdvice;
