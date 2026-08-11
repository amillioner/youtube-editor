import React from 'react';
import { ShockSlate } from './B1ShockSlate1';

// =============================================================================
// B1 — placeholder slate, slot 2. Same generated clip, hard recut shorter.
// Slot 2: master 84.15 -> 85.75 (after "shock you.", over "No, not this way also.")
// =============================================================================
export const compositionConfig = { id: 'B1ShockSlate2', durationInSeconds: 1.6, fps: 30, width: 1920, height: 1080 };

const B1ShockSlate2: React.FC = () => <ShockSlate n={2} span="84.15 s → 85.75 s" secs="1.60 s" />;

export default B1ShockSlate2;
