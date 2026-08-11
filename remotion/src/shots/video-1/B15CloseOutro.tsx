import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ThumbsUp, Star, MessageSquare } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY } from '../../fonts';
import { GithubMark } from './_shared/marks';
import { r } from './B14Kit';
import { Lockup } from './B15CloseKit';

// =============================================================================
// B15 · the goodbye. TRANSPARENT OVERLAY. Master span 920.196967 -> 931.896967 (11.70s),
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// and 933.0648 is the last word of the video. Local frame = round((master - 920.196967) * 30).
//   "Hit like"                  923.55 -> f11   badge 1
//   "on GitHub."                927.43 -> f127  badge 2
//   "I read every comment."     931.53 -> f250  badge 3
//   "See you in the upcoming    933.24 -> f301  the badges give way to the
//    videos."                                   product lockup, which holds to
//                                               the final frame
// OVERLAY, never a cutaway: the last 11 seconds are him talking to the viewer
// and brand.md §6 says you do not cover a personal line with graphics. One badge
// at a time, in the bottom band, so his centre-framed face is never touched.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = {
  id: 'B15CloseOutro', durationInSeconds: 11.7, fps: 30, width: 1920, height: 1080, transparent: true,
};

const SLOTS = [
  { key: 'like', at: 11, out: 117 },
  { key: 'github', at: 127, out: 240 },
  { key: 'comment', at: 250, out: 293 },
  { key: 'lockup', at: 301, out: 100000 },
] as const;

const B15CloseOutro: React.FC = () => {
  const frame = useCurrentFrame();

  const vis = (i: number) =>
    r(frame, SLOTS[i].at, SLOTS[i].at + 12) *
    (1 - r(frame, SLOTS[i].out, SLOTS[i].out + 12, 0, 1, EASINGS.easeIn));
  const rise = (i: number) => r(frame, SLOTS[i].at, SLOTS[i].at + 14, 24, 0);

  // two deliberate taps on the thumb, frame-driven (no randomness)
  const tap = 1 - 0.1 * (Math.sin(frame / 4.5) > 0.55 ? 1 : 0);

  const PILL: React.CSSProperties = {
    position: 'absolute', left: '50%', bottom: 0,
    display: 'flex', alignItems: 'center', gap: 20,
    borderRadius: RADIUS.pill, boxShadow: SHADOW.card, padding: '18px 40px',
    whiteSpace: 'nowrap',
  };

  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, bottom: 132, width: 1920, height: 110 }}>
        <div style={{ ...PILL, background: COLORS.accent, opacity: vis(0), transform: `translateX(-50%) translateY(${rise(0)}px)` }}>
          <div style={{ transform: `scale(${tap})`, display: 'flex' }}>
            <ThumbsUp size={44} color={COLORS.paper} strokeWidth={2.2} fill={COLORS.paper} />
          </div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.paper }}>Hit like</span>
        </div>

        <div style={{ ...PILL, background: COLORS.d900, opacity: vis(1), transform: `translateX(-50%) translateY(${rise(1)}px)` }}>
          <GithubMark size={44} color={COLORS.paper} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.paper }}>Star the repo</span>
          <Star size={40} color={COLORS.warn} strokeWidth={2} fill={COLORS.warn} />
        </div>

        <div style={{ ...PILL, background: COLORS.signal, opacity: vis(2), transform: `translateX(-50%) translateY(${rise(2)}px)` }}>
          <MessageSquare size={42} color={COLORS.paper} strokeWidth={2.2} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.paper }}>I read every comment</span>
        </div>

        <div style={{ position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)', opacity: vis(3) }}>
          <Lockup frame={frame} at={SLOTS[3].at} size={62} wipeAt={SLOTS[3].at + 10} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default B15CloseOutro;
