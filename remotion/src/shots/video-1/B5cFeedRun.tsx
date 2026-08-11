import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { VSCodeWindow } from '../../lib/vscode';
import {
  ED_X, ED_W, FAR, myBrainRows, SidebarBrace, SessionBg, SessionScroll,
  SessionWordmark, SessionEmptyState, SourceChips, SessionComposer, UserTurn, CliStep,
} from './_shared/B5cSession';

// =============================================================================
// B5b (2/6) — NEW in v2. 320.10-328.40 used to cut back to camera; it does not any
// more. The VS Code session keeps running: the message is sent and mind-feeder
// actually works, in the real Claude Code look (coral bullets, spinner, elbow
// result lines) inside the same pane B5bFeedPaste revealed.
//
// Master span 318.932167-327.232167 (local frame = round((t - 318.932167) * 30)). Frame 0 is a
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// pixel copy of B5bFeedPaste's last frame: paste chip in the composer, prompt
// typed, caret blinking, source chips still up.
//   "And here's the part that really matters." 320.23 -> f4    SEND (the composer
//                                                              collapses, the empty
//                                                              state + source chips
//                                                              clear, the message
//                                                              lands as a turn)
//   "...the part"          320.71 -> f18   Read(Pasted text #1)
//                                  f30   1,842 lines
//   "It doesn't just save it."  322.39 -> f69   mind-feeder(read the source) starts
//                                  f80/f92/f104/f116  what it actually pulls out
//   "It reads it."         324.30 -> f126  coral wipe under "read the source"
//                          324.64 -> f136  the step resolves
//   "It decides"           325.44 -> f158  mind-feeder(decide what is worth keeping)
//   "what's"               326.31 -> f186  47 candidate lines
//   "worth keeping."       327.11 -> f210  1 worth keeping  (indigo — the payoff)
// Hands off to B5bProposal at 328.40 with all three steps complete.
// =============================================================================
export const compositionConfig = { id: 'B5cFeedRun', durationInSeconds: 8.3, fps: 30, width: 1920, height: 1080 };

const F_SEND = 4;
const F_TURN = 12;
const F_READ = 18;
const F_ANALYZE = 69;
const F_READS = 126;
const F_ANALYZE_DONE = 136;
const F_DECIDE = 158;
const F_KEEP = 210;

const Y_TURN = 250;
const Y_READ = 400;
const Y_ANALYZE = 512;
const Y_DECIDE = 738;

const B5cFeedRun: React.FC = () => {
  const frame = useCurrentFrame();
  const clear = 1 - interpolate(frame, [F_SEND, F_SEND + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <VSCodeWindow
      rows={myBrainRows()}
      projectName="my-brain"
      groups={[{
        x: ED_X, w: ED_W,
        tab: { label: 'Claude Code', icon: 'claude', appearAt: FAR },
        breadcrumb: ['Claude Code'],
      }]}
    >
      <SessionBg />

      <SessionScroll>
        <SessionWordmark />

        {/* the empty state and the "a source is anything" chips clear on the send, then
            UNMOUNT — a leftover zero-opacity layer would change how Chrome antialiases
            the transcript, and frame 248 has to hand off to B5bProposal unchanged. */}
        {clear > 0 && (
          <>
            <SessionEmptyState opacity={clear} />
            <SourceChips labelAt={FAR} shift={FAR} opacity={clear} />
          </>
        )}

        {/* what was sent */}
        <UserTurn y={Y_TURN} at={F_TURN} />

        {/* ...and what mind-feeder does with it */}
        <CliStep
          y={Y_READ} at={F_READ} doneAt={F_READ + 6}
          tool="Read" arg="Pasted text #1"
          subs={[{ at: 30, text: '1,842 lines' }]}
        />
        <CliStep
          y={Y_ANALYZE} at={F_ANALYZE} doneAt={F_ANALYZE_DONE} underlineAt={F_READS}
          tool="mind-feeder" arg="read the source"
          subs={[
            { at: 80, text: 'claims and opinions' },
            { at: 92, text: 'numbers and receipts' },
            { at: 104, text: 'stories' },
            { at: 116, text: 'the way you say things' },
          ]}
        />
        <CliStep
          y={Y_DECIDE} at={F_DECIDE} doneAt={F_KEEP} underlineAt={F_DECIDE + 2}
          tool="mind-feeder" arg="decide what is worth keeping"
          subs={[
            { at: 186, text: '47 candidate lines' },
            { at: F_KEEP, text: '1 worth keeping', color: COLORS.accent, strong: true },
          ]}
        />
      </SessionScroll>

      <SessionComposer pasteAt={FAR} typeStart={FAR} sendAt={F_SEND} />
      <SidebarBrace />
    </VSCodeWindow>
  );
};

export default B5cFeedRun;
