import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, Marker } from '../../lib/browser';
import { GuidePageBody, SITE } from './_shared/GuidePage';

// ============================================================================
// ColdOpenLines · "look at this line, and this one" — ROUND-3: each verbatim
// sentence lifts off the real guide page into a STICKY zoom modal, so both
// quotes stay on screen and readable. ROUND-7: line 1 is now the TL;DR closing
// sentence ("I ran the whole thing…written down." — reads as ME writing), so
// the page opens on the TL;DR view, then still jumps to the pooler section.
// Master span 54.6 -> 61.9 (7.3s). local f = round((master_s - 54.6) * 30).
// Cues: "this line" 55.4->f24 (in-page marker, modal 1 zooms in f26) ·
// "this one" 56.4->f54 (modal 2 zooms in f56) · chips "me talking" 57.6->f90 ·
// "my real stories" 58.4->f114 · "my real numbers" 59.5->f147
// ============================================================================
export const compositionConfig = { id: 'ColdOpenLines', durationInSeconds: 7.3, fps: 30, width: 1920, height: 1080 };

// each sentence split in two so the marker sweep wraps cleanly in the card
const LINE1A = 'I ran the whole thing on one 4 GB server and measured';
const LINE1B = 'every part. This is that run, written down.';
const LINE2A = 'I ignored it once and watched the connection';
const LINE2B = 'pooler hang forever with no error.';
const CHIPS = [90, 114, 147] as const;
const CHIP_LABELS = ['me talking', 'my real stories', 'my real numbers'] as const;

const QuoteCard: React.FC<{
  at: number; top: number; fromY: number; eyebrow?: string; children: React.ReactNode;
}> = ({ at, top, fromY, eyebrow, children }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const sc = interpolate(frame, [at, at + 14], [0.62, 1], { ...CLAMP, easing: EASINGS.overshoot });
  const dy = interpolate(frame, [at, at + 14], [fromY - top, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <div style={{
      position: 'absolute', left: '50%', top, width: 1300, marginLeft: -650,
      opacity: op, transform: `translateY(${dy}px) scale(${sc})`,
      background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderLeft: `6px solid ${COLORS.warn}`,
      borderRadius: RADIUS.card, boxShadow: '0 34px 90px rgba(20,18,40,0.35)', padding: '34px 52px',
    }}>
      {eyebrow && <div style={{ fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 2.5, color: COLORS.muted, marginBottom: 18 }}>{eyebrow}</div>}
      <div style={{ fontSize: 31, lineHeight: 1.6, color: COLORS.ink }}>{children}</div>
    </div>
  );
};

const ColdOpenLines: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (s: number, dy = 12) => ({
    opacity: interpolate(frame, [s, s + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 10], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  // the page keeps living behind the modals: TL;DR view -> pooler view
  const scroll = interpolate(frame, [38, 52], [60, 2870], { ...CLAMP, easing: EASINGS.easeInOut });
  const dim = interpolate(frame, [26, 38], [0, 0.42], CLAMP);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.warn} />
      <WebBrowserFrame
        url="learnwithhasan.com/guide/self-host-supabase"
        tabTitle="How to Self-Host Supabase: The Parts the Docker Compose Skips"
        box={{ x: 150, y: 40, w: 1620, h: 1000 }}
        appearAt={2}
        pageBg={SITE.bg}
        favicon={<span style={{ width: 17, height: 17, borderRadius: 5, background: SITE.purple, display: 'inline-block' }} />}
      >
        <div style={{ position: 'absolute', left: 0, right: 0, top: -scroll }}>
          <GuidePageBody line1Start={22} line2Start={54} />
        </div>
        {/* dim while the modals hold (explicit dims: the page wrapper is a
            zero-height transformed containing block, inset:0 collapses) */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 1620, height: 898, background: `rgba(18,16,34,${dim})` }} />
      </WebBrowserFrame>

      {/* modal 1 · "this line" — lifts from the TL;DR sentence, sticks */}
      <QuoteCard at={26} top={170} fromY={640} eyebrow="FROM THE PUBLISHED GUIDE, VERBATIM">
        <Marker start={34} color={`${COLORS.warn}bb`}>{LINE1A}</Marker>{' '}
        <Marker start={42} color={`${COLORS.warn}bb`}>{LINE1B}</Marker>
      </QuoteCard>
      {/* modal 2 · "and this one" — sticks below, both stay readable */}
      <QuoteCard at={56} top={430} fromY={560}>
        <Marker start={64} color={`${COLORS.warn}bb`}>{LINE2A}</Marker>{' '}
        <Marker start={72} color={`${COLORS.warn}bb`}>{LINE2B}</Marker>
      </QuoteCard>

      {/* what those lines are made of */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 64, display: 'flex', justifyContent: 'center', gap: 16 }}>
        {CHIP_LABELS.map((label, i) => (
          <span key={label} style={{ ...at(CHIPS[i]), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 27, color: COLORS.ink, background: COLORS.paper, border: `2px solid ${COLORS.accent}`, padding: '10px 26px', borderRadius: RADIUS.pill, boxShadow: SHADOW.card }}>
            {label}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

export default ColdOpenLines;
