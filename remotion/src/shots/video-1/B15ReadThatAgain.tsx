import React from 'react';
import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { Marker } from '../../lib/browser';

// =============================================================================
// B1.5 (2/3) — the hard beat. Master span 117.832167 -> 124.432167
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 117.832167) * 30)).
//   "Read that again."          119.35 -> f11   full-screen statement
//   "My brain told the AI ..."  120.44 -> f43   the line re-asserts underneath,
//                                               "Read that again." shrinks to an
//                                               eyebrow and HOLDS (he told the
//                                               viewer to re-read; it stays up)
//   "what is not allowed"       123.10 -> f123  indigo highlight wipe
//   "to make up."               124.77 -> f173  indigo underline wipe + 1.03 pop
// Left-aligned on purpose: the sentence is built in halves, and a centred block
// would slide sideways every time a half arrives.
// =============================================================================
export const compositionConfig = { id: 'B15ReadThatAgain', durationInSeconds: 6.6, fps: 30, width: 1920, height: 1080 };

const F_READ = 11;
const F_SHRINK = 34; // "again." has landed (120.10) — clear the stage before the line arrives
const F_LINE = 43;
const F_ALLOWED = 123;
const F_MAKEUP = 173;

const B15ReadThatAgain: React.FC = () => {
  const frame = useCurrentFrame();

  // stage 1
  const readOp = interpolate(frame, [F_READ, F_READ + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const readY = interpolate(frame, [F_READ, F_READ + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const readTop = interpolate(frame, [F_SHRINK, F_SHRINK + 12], [460, 372], { ...CLAMP, easing: EASINGS.easeInOut });
  const readScale = interpolate(frame, [F_SHRINK, F_SHRINK + 12], [1, 0.42], { ...CLAMP, easing: EASINGS.easeInOut });
  const readFade = interpolate(frame, [F_SHRINK, F_SHRINK + 12], [1, 0.58], { ...CLAMP, easing: EASINGS.easeInOut });
  const readColor = interpolateColors(frame, [F_SHRINK, F_SHRINK + 12], [COLORS.ink, COLORS.muted]);

  // stage 2
  const l1Op = interpolate(frame, [F_LINE, F_LINE + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const l1Y = interpolate(frame, [F_LINE, F_LINE + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const aOp = interpolate(frame, [F_ALLOWED, F_ALLOWED + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const mOp = interpolate(frame, [F_MAKEUP, F_MAKEUP + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const mWipe = interpolate(frame, [F_MAKEUP, F_MAKEUP + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const mPop = interpolate(frame, [F_MAKEUP, F_MAKEUP + 10, F_MAKEUP + 24], [1, 1.03, 1], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* stage 1 — "Read that again." then held as an eyebrow */}
      <div style={{
        position: 'absolute', left: 220, top: readTop,
        opacity: readOp * readFade, transform: `translateY(${readY}px) scale(${readScale})`, transformOrigin: 'left top',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 148, lineHeight: 1, color: readColor,
      }}>
        Read that again.
      </div>

      {/* stage 2 — the line, built in its two halves */}
      <div style={{ position: 'absolute', left: 220, top: 510, width: 1520, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 88, lineHeight: 1.32, color: COLORS.ink }}>
        <div style={{ opacity: l1Op, transform: `translateY(${l1Y}px)` }}>My brain told the AI model</div>
        <div>
          <span style={{ opacity: aOp }}>
            <Marker start={F_ALLOWED} color={`${COLORS.accent}33`} pad={10} radius={8}>what is not allowed</Marker>
          </span>
          <span style={{ opacity: mOp, display: 'inline-block', transform: `scale(${mPop})`, transformOrigin: 'left center' }}>
            <span style={{ position: 'relative', display: 'inline-block', paddingLeft: 22 }}>
              to make up.
              <span style={{ position: 'absolute', left: 22, right: 0, bottom: 4, height: 7, borderRadius: 4, background: COLORS.accent, transform: `scaleX(${mWipe})`, transformOrigin: 'left' }} />
            </span>
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default B15ReadThatAgain;
