import React from 'react';
import { ColdOpenScene } from './_shared/ColdOpenScene';

// =============================================================================
// B1 — the cold open. Master 3.9333 -> 13.2000 (278f).
//
// Round-1 note was that the hook was visually dead for 13s and that "Look at this."
// (3.95) and "Look at this example." (11.82) both landed with nothing on screen.
// Three treatments were auditioned in v2; this is the one Hasan picked. It pays the
// first cue with the post card and the second with the handoff into the replies.
//
// Hands off to B1ReplyCompare at 13.20 with the post card already sitting in that
// shot's opening geometry (left 50%, top 360, width 1160, scale 1), so the join is
// invisible. B1ReplyCompare's post entrance was removed to match; the two shots are
// a PAIR and must not be reordered or used apart.
//
// local frame = round((master_s - 3.9333) * 30)
//   3.95  "Look at this."          -> f1    the post card rises (1st cue paid)
//   6.46  "an AI agent"            -> f76   the agent node appears
//   8.15  "reply to my X posts"    -> f127  the X branch draws
//  10.12  "or maybe my emails"     -> f186  the emails branch draws
//  11.82  "Look at this example."  -> f236  branches retire, post alone for the handoff
// =============================================================================
export const compositionConfig = { id: 'B1ColdOpen', durationInSeconds: 9.2667, fps: 30, width: 1920, height: 1080 };

const B1ColdOpen: React.FC = () => (
  <ColdOpenScene cues={{ postAt: 1, agentAt: 76, xAt: 127, mailAt: 186, settleAt: 236 }} />
);

export default B1ColdOpen;
