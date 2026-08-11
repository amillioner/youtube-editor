import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';

// =============================================================================
// B1 · the shock gag, use 2 of 2 — now a DIFFERENT failure. Master span
// 82.9822 -> 84.3822 (1.40s) on the post-V2 clock (= 84.15 -> 85.55 pre-V2;
// the V2 splice removed master 3.787117-4.954950, delta 1.167833s).
//
// v3 (round-2 R3): "No, not this way ALSO" only lands if the second gag is a
// DIFFERENT failure, and the line is a pun on "shock" — so gag 2 is still an
// electrocution, by a visibly dumber method: car jumper cable clamps clipped
// onto his own ears, arcs across the head, hair standing, smoke. Generated
// with fal/kling 2.5 turbo pro i2v from shock2-ref-84.15.jpg (the master frame
// AT the pre-V2 cut point, so wardrobe/room/light continue the take); full
// clip kept as shock-clip2-v1.mp4, recipe in shock-clip2-v1.fal.json.
//
// The slot is the PEAK only (source 3.40-4.80s, 42f @30): it snaps in already
// electrocuting — anticipation was clip 1's beat, this is the "ALSO" callback.
// It covers the line that labels it (No 84.29 · not 84.58 · this 84.96 · way
// 85.14 · also 85.30, all pre-V2 clock) and cuts back to his face before "So"
// at 86.10 (pre-V2). Local frames unchanged by any splice.
//
// shock-clip-v1.mp4 (the cable-at-temple take) is UNTOUCHED — B1ShockClip1 and
// B6ShockClip3 still play it.
// =============================================================================
export const compositionConfig = { id: 'B1ShockClip2', durationInSeconds: 1.4, fps: 30, width: 1920, height: 1080 };

const B1ShockClip2: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: 'black' }}>
    <OffthreadVideo
      src={staticFile('projects/video-1/shock-slot2-v2.mp4')}
      muted
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  </AbsoluteFill>
);
export default B1ShockClip2;
