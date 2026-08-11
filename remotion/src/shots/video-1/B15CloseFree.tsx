import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Check, ArrowDown, BookOpen } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg } from '../../lib/kit';
import { GithubMark } from './_shared/marks';
import { r } from './B14Kit';

// =============================================================================
// B15 · the close opens. Master span 880.696967 -> 887.396967 (6.70s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 880.696967) * 30).
//   "Okay,"                883.74 -> f1    eyebrow + the two real repos
//   "free,"                885.20 -> f45   teal chip
//   "open source,"         886.31 -> f78   teal chip
//   "it's linked below"    887.59 -> f117  the link bar drops in, arrow pointing
//                                          at the description
//   "with the full guide," 888.81 -> f153  the guide line joins it
// Repo names are the REAL ones the video already showed in B5 and B7:
// hassancs91/brainoutside-template and hassancs91/brainoutside.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B15CloseFree', durationInSeconds: 6.7, fps: 30, width: 1920, height: 1080 };

const F_OPEN = 1;
const F_FREE = 45;
const F_OSS = 78;
const F_LINK = 117;
const F_GUIDE = 153;

const REPOS = [
  { name: 'brainoutside-template', sub: 'the brain, as a repo you copy', x: 180 },
  { name: 'brainoutside', sub: 'the online head', x: 1000 },
];
const CHIPS = [
  { label: 'free', at: F_FREE },
  { label: 'open source', at: F_OSS },
];

const B15CloseFree: React.FC = () => {
  const frame = useCurrentFrame();

  const eyeOp = r(frame, F_OPEN, F_OPEN + 12);
  const eyeY = r(frame, F_OPEN, F_OPEN + 12, 16, 0);
  const linkOp = r(frame, F_LINK, F_LINK + 14);
  const linkY = r(frame, F_LINK, F_LINK + 14, 24, 0);
  const arrow = r(frame, F_LINK + 6, F_LINK + 30, 0, 14, EASINGS.easeInOut);
  const guideOp = r(frame, F_GUIDE, F_GUIDE + 14);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />

      <div style={{
        position: 'absolute', top: 128, left: 0, width: 1920, textAlign: 'center',
        opacity: eyeOp, transform: `translateY(${eyeY}px)`,
        fontFamily: FONT_MONO, fontSize: 28, letterSpacing: 6, color: COLORS.muted,
      }}>
        THE&nbsp;PROJECT
      </div>

      {REPOS.map((repo, i) => {
        const at = F_OPEN + i * 5;
        const op = r(frame, at, at + 14);
        const y = r(frame, at, at + 14, 24, 0);
        return (
          <div key={repo.name} style={{
            position: 'absolute', left: repo.x, top: 232, width: 740, height: 152, boxSizing: 'border-box',
            background: COLORS.d900, border: `1.5px solid ${COLORS.d600}`, borderRadius: RADIUS.card,
            boxShadow: SHADOW.card, padding: '26px 32px',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12,
            opacity: op, transform: `translateY(${y}px)`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <GithubMark size={34} color={COLORS.d300} />
              <span style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 32, color: COLORS.d300 }}>{repo.name}</span>
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.d400 }}>{repo.sub}</div>
          </div>
        );
      })}

      {/* free · open source */}
      <div style={{ position: 'absolute', left: 0, top: 452, width: 1920, display: 'flex', justifyContent: 'center', gap: 26 }}>
        {CHIPS.map((c) => {
          const op = r(frame, c.at, c.at + 14);
          const y = r(frame, c.at, c.at + 14, 20, 0);
          return (
            <div key={c.label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: `${COLORS.signal}16`, border: `2px solid ${COLORS.signal}`,
              borderRadius: RADIUS.pill, padding: '14px 38px',
              opacity: op, transform: `translateY(${y}px)`,
            }}>
              <Check size={30} color={COLORS.signal} strokeWidth={3.2} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: COLORS.ink }}>{c.label}</span>
            </div>
          );
        })}
      </div>

      {/* linked below, with the full guide */}
      <div style={{
        position: 'absolute', left: 360, top: 626, width: 1200, boxSizing: 'border-box',
        background: COLORS.paper, border: `2px solid ${COLORS.accent}`, borderRadius: RADIUS.card,
        boxShadow: SHADOW.card, padding: '28px 40px',
        opacity: linkOp, transform: `translateY(${linkY}px)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ transform: `translateY(${arrow}px)`, display: 'flex' }}>
            <ArrowDown size={44} color={COLORS.accent} strokeWidth={2.6} />
          </div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 54, color: COLORS.ink }}>Both links are below</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 20, opacity: guideOp }}>
          <BookOpen size={34} color={COLORS.accent2} strokeWidth={2.1} />
          <span style={{ fontFamily: FONT_BODY, fontSize: 38, color: COLORS.muted }}>with the full written guide</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default B15CloseFree;
