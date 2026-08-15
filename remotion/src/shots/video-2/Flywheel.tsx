import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { Brain, FileText, CircleCheck } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';
import { BLOCKS } from './_shared/FactoryKit';

// ============================================================================
// Flywheel · first stage reads the brain, last stage feeds it — closed loop.
// Master span 576.6 -> 609.2 (32.6s). local f = round((master_s - 576.6) * 30).
// Cues: "first stage" 577.2->f18 · "reads my brain" 581.2->f138 · "feeds my
// brain again" 584.4->f234 · lesson/experiment/result 586.2/587.9/589.5->
// f288/f339/f387 · "I approve what it enters" 594.3->f531 · "every guide makes
// my brain better" 596.3->f591 · "closed loop" 603.0->f792 · "the brain video"
// 606.4->f894
// ============================================================================
export const compositionConfig = { id: 'Flywheel', durationInSeconds: 32.6, fps: 30, width: 1920, height: 1080 };

const HEAD = 12;
const READS = 138;
const FEEDS = 234;
const PELLETS: readonly (readonly [string, number])[] = [['lesson', 288], ['experiment', 339], ['result', 387]];
const GATE = 531;
const BETTER = 591;
const LOOP = 792;
const VIDEO1 = 894;

// layout: brain node left, factory node right, arcs between
const BRAIN = { x: 430, y: 560 };
const FACTORY = { x: 1490, y: 560 };

const Flywheel: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const at = (s: number, dy = 14) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  const topDash = interpolate(frame, [READS, READS + 30], [1, 0], { ...CLAMP, easing: EASINGS.easeInOut });
  const botDash = interpolate(frame, [FEEDS, FEEDS + 30], [1, 0], { ...CLAMP, easing: EASINGS.easeInOut });
  const loopPulse = frame >= LOOP ? 0.6 + 0.4 * Math.abs(Math.sin((frame - LOOP) / 14)) : 1;
  // pellets travel the bottom arc right -> left after FEEDS
  const pellet = (i: number, s: number) => {
    const t = interpolate(frame, [s, s + 150], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
    const x = FACTORY.x - (FACTORY.x - BRAIN.x) * t;
    const y = 730 + Math.sin(Math.PI * t) * 90;
    return { x, y, done: t >= 1, t };
  };
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 66 }}>
        <div style={{ ...rise(HEAD, 14), fontFamily: FONT_MONO, fontSize: 23, letterSpacing: 3, color: COLORS.accent }}>THE&nbsp;LAST&nbsp;PART,&nbsp;MY&nbsp;FAVORITE</div>
        <h1 style={{ ...rise(HEAD + 10), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: COLORS.ink, margin: 0, marginTop: 8, opacity: frame >= LOOP ? 1 : undefined }}>
          {frame >= LOOP ? <span style={{ color: COLORS.accent }}>it's a closed loop</span> : 'the factory feeds the brain'}
        </h1>
      </AbsoluteFill>
      {/* arcs — ROUND-6: endpoints terminate EXACTLY on the node edges. Brain
          circle: center (430,550), outer r≈113 → edge points at ±26°. Factory
          card: left edge x=1290 (spans y 440-628). */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* top arc: brain -> factory (S1 read) */}
        <path d={`M 532 500 C 760 300, 1160 300, 1290 496`} fill="none" stroke={COLORS.accent} strokeWidth={7} strokeDasharray="1000" strokeDashoffset={1000 * topDash} opacity={0.9 * loopPulse} />
        {/* bottom arc: factory -> brain (S9 feed) */}
        <path d={`M 1290 600 C 1160 830, 760 830, 532 600`} fill="none" stroke={COLORS.signal} strokeWidth={7} strokeDasharray="1000" strokeDashoffset={1000 * botDash} opacity={0.9 * loopPulse} />
      </svg>
      {/* arc labels */}
      <div style={{ ...at(READS, 10), position: 'absolute', left: 0, right: 0, top: 268, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 24, color: COLORS.accent }}>S1 · first stage: read the brain →</div>
      <div style={{ ...at(FEEDS, 10), position: 'absolute', left: 0, right: 0, top: 838, textAlign: 'center', fontFamily: FONT_MONO, fontSize: 24, color: COLORS.signal }}>← S9 · last stage: feed the brain</div>
      {/* brain node */}
      <div style={{ ...at(HEAD + 20, 20), position: 'absolute', left: BRAIN.x - 130, top: BRAIN.y - 120, width: 260, textAlign: 'center' }}>
        <div style={{ width: 220, height: 220, margin: '0 auto', borderRadius: 999, background: COLORS.paper, border: `3px solid ${COLORS.accent}`, boxShadow: SHADOW.card, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Brain size={74} color={COLORS.accent} strokeWidth={1.9} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: COLORS.ink }}>my brain</span>
        </div>
        <div style={{ ...at(BETTER), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, color: COLORS.accent, marginTop: 14 }}>gets better ↺</div>
      </div>
      {/* factory node: the five blocks, mini */}
      <div style={{ ...at(HEAD + 32, 20), position: 'absolute', left: FACTORY.x - 200, top: FACTORY.y - 120, width: 400 }}>
        <div style={{ background: COLORS.paper, border: `3px solid ${COLORS.accent2}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '22px 26px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 12 }}>
            {BLOCKS.map((b) => {
              const { Icon } = b;
              return <div key={b.n} style={{ width: 52, height: 52, borderRadius: 12, background: `${b.color}1d`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={28} color={b.color} strokeWidth={2} /></div>;
            })}
          </div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 28, color: COLORS.ink }}>the factory</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>
            <FileText size={20} color={COLORS.muted} /> guides out
          </div>
        </div>
        <div style={{ ...at(BETTER + 20), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, color: COLORS.accent2, marginTop: 14, textAlign: 'center' }}>next guide gets better ↺</div>
      </div>
      {/* pellets on the return path */}
      {PELLETS.map(([label, s], i) => {
        const p = pellet(i, s);
        if (frame < s || p.done) return null;
        return (
          <div key={label} style={{ position: 'absolute', left: p.x - 60, top: p.y - 22, fontFamily: FONT_MONO, fontSize: 20, color: COLORS.ink, background: COLORS.paper, border: `2px solid ${COLORS.signal}`, borderRadius: RADIUS.pill, padding: '7px 18px', boxShadow: SHADOW.soft }}>
            {label}
          </div>
        );
      })}
      {/* the approval gate on the return path */}
      <div style={{ ...at(GATE, 10), position: 'absolute', left: 900, top: 900, display: 'flex', alignItems: 'center', gap: 10, fontFamily: FONT_MONO, fontSize: 22, color: COLORS.ink, background: COLORS.paper, border: `2px solid ${COLORS.signal}`, borderRadius: RADIUS.pill, padding: '9px 20px', boxShadow: SHADOW.soft, transform: 'translateX(-50%)' }}>
        <CircleCheck size={24} color={COLORS.signal} strokeWidth={2.4} /> I approve what enters
      </div>
      {/* video-1 callback */}
      <div style={{ ...at(VIDEO1, 12), position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 27, color: COLORS.ink, background: COLORS.paper, border: `2px solid ${COLORS.accent}`, borderRadius: RADIUS.pill, padding: '12px 30px', boxShadow: SHADOW.card }}>
          building the brain = <span style={{ color: COLORS.accent }}>the video from last week</span> · link below
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default Flywheel;
