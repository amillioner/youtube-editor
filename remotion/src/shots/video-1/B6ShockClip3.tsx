import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';

// =============================================================================
// B6 · the cable gag, use 3 of 3 (the callback). Master span 400.346967-401.746967 (1.40s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//
// Script B6: "remember the shock [quick fun video again], here it starts!"
// Narration: "Remember the shock?" 403.37-404.25 · "It starts here." 404.81.
// The clip is GONE before "It starts here." so that line plays on his face.
//
// Same source as B1ShockClip1/2 (media/projects/video-1/shock-clip-v1.mp4),
// pre-trimmed to media/projects/video-1/shock-slot3.mp4 (clip 2.875-4.275s, 42f
// @30fps) so this shot plays from frame 0 — no startFrom/fps-mismatch semantics.
//
// WHY THIS TRIM. Slot 1 was the anticipation -> zap (clip 1.50-3.00); slot 2 was
// the peak only (2.30-2.80). Both ended before the gag's actual punchline: at
// clip 3.375s his hair POPS into electrocuted spikes and starts smoking. That
// pop is the "after" photo, and it is the only part of the clip the first two
// uses never showed — so the callback is new footage, not a repeat.
// It is placed so the pop lands at master 403.85, exactly on the word "shock?".
// Do not retime without moving that relationship.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B6ShockClip3', durationInSeconds: 1.4, fps: 30, width: 1920, height: 1080 };

const B6ShockClip3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: 'black' }}>
    <OffthreadVideo
      src={staticFile('projects/video-1/shock-slot3.mp4')}
      muted
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </AbsoluteFill>
);
export default B6ShockClip3;
