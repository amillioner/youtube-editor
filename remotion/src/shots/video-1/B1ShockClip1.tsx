import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';

// =============================================================================
// B1 · the cable gag, use 1 of 2. Master span 62.482167-63.982167 (1.50s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//
// Replaces the B1ShockSlate1 placeholder. Script B1:
//   "[GENERATED VIDEO - 2s] Hasan runs a cable from the computer into his head.
//    Gets shocked."  ->  "No. Not this way."
//
// Source: media/projects/video-1/shock-clip-v1.mp4, generated with
// tools/gen_video.py (fal, kling 2.5 turbo pro image-to-video). The reference
// frame was pulled from the master AT the cut point (63.64s), so wardrobe, room,
// light and framing continue the real take.
//
// Pre-trimmed to media/projects/video-1/shock-slot1.mp4 (clip 1.50-3.00s, 45f @30fps)
// so this shot plays from frame 0 — no startFrom/fps-mismatch semantics to get wrong.
// The zap begins ~0.30s in (master 63.95), landing just BEFORE "No," at 64.12:
// anticipation -> zap -> he reacts. Do not retime without moving that relationship.
// =============================================================================
export const compositionConfig = { id: 'B1ShockClip1', durationInSeconds: 1.5, fps: 30, width: 1920, height: 1080 };

const B1ShockClip1: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: 'black' }}>
    <OffthreadVideo
      src={staticFile('projects/video-1/shock-slot1.mp4')}
      muted
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </AbsoluteFill>
);
export default B1ShockClip1;
