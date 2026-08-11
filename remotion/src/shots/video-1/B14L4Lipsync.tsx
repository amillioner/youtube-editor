import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, RADIUS } from '../../brand';
import { FONT_BODY, FONT_MONO } from '../../fonts';
import { LevelRail, SimTag, r } from './B14Kit';

// =============================================================================
// B14 · LEVEL 4 — the lipsynced avatar. Master span 833.596967 -> 839.596967 (6.00s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 833.596967) * 30).
//   "Now"          836.73 -> f4    the render frame draws in
//   "with lipsync" 839.75 -> f95   rail slot 4 fills
//   "that's me"    840.95 -> f131  (no new element: the footage IS the beat)
//
// GENERATED. media/projects/video-1/l4-lipsync-v1.mp4 was made with
// tools/gen_video.py (fal, kling 2.5 turbo pro image-to-video, 10s, $0.70). The
// reference frame was pulled out of the master AT 837.50 with ffmpeg, so
// wardrobe, room, light and framing continue the real take.
// Pre-trimmed to l4-lipsync-slot.mp4 (first 6.00s, resampled to exactly 180
// frames at 30fps) so this shot plays it from frame 0 — no startFrom, no
// fps-mismatch semantics to get wrong.
//
// ★ The SIMULATED tag is NOT optional here. This is the shot a viewer is most
// likely to mistake for real footage, so the tag is on the first frame and the
// corner brackets mark the picture as a render, not a recording.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B14L4Lipsync', durationInSeconds: 6, fps: 30, width: 1920, height: 1080 };

const F_FRAME = 4;
const F_LIPSYNC = 95;

const Bracket: React.FC<{ op: number; style: React.CSSProperties }> = ({ op, style }) => (
  <div style={{ position: 'absolute', width: 68, height: 68, opacity: op, ...style }} />
);

const B14L4Lipsync: React.FC = () => {
  const frame = useCurrentFrame();
  const brOp = r(frame, F_FRAME, F_FRAME + 16) * 0.85;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY }}>
      <OffthreadVideo
        src={staticFile('projects/video-1/l4-lipsync-slot.mp4')}
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* scrims so the tag and the rail stay readable over the footage */}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${COLORS.d900}66, transparent 22%, transparent 66%, ${COLORS.d900}88)` }} />

      {/* render brackets: this picture is an output, not a recording */}
      <Bracket op={brOp} style={{ left: 54, top: 150, borderLeft: `3px solid ${COLORS.warn}`, borderTop: `3px solid ${COLORS.warn}` }} />
      <Bracket op={brOp} style={{ right: 54, top: 150, borderRight: `3px solid ${COLORS.warn}`, borderTop: `3px solid ${COLORS.warn}` }} />
      <Bracket op={brOp} style={{ left: 54, bottom: 250, borderLeft: `3px solid ${COLORS.warn}`, borderBottom: `3px solid ${COLORS.warn}` }} />
      <Bracket op={brOp} style={{ right: 54, bottom: 250, borderRight: `3px solid ${COLORS.warn}`, borderBottom: `3px solid ${COLORS.warn}` }} />

      <div style={{
        position: 'absolute', left: 54, top: 100, opacity: brOp,
        background: `${COLORS.d900}d9`, borderRadius: RADIUS.pill, padding: '8px 20px',
        fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.warn,
      }}>
        GENERATED RENDER
      </div>

      <SimTag frame={frame} at={-30} tone="dark" />

      <LevelRail
        frame={frame}
        at={-30}
        tone="dark"
        slots={[
          { n: 1, label: 'voice', at: -30 },
          { n: 2, label: 'voice clone', at: -30 },
          { n: 3, label: 'photo', at: -30 },
          { n: 4, label: 'lipsync', at: F_LIPSYNC },
        ]}
      />
    </AbsoluteFill>
  );
};
export default B14L4Lipsync;
