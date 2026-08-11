import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { EASINGS } from '../../brand';
import { CLAMP } from '../../lib/kit';
import { VSCodeWindow, CodeEditorPane } from '../../lib/vscode';
import {
  ED_X, ED_W, FAR, myBrainRows, SidebarBrace, CLAUDE_MD_LINES, PaneScrim, SessionBg,
  TwoSkillsDiagram, SessionScroll, SessionWordmark, SessionEmptyState, SourceChips, SessionComposer,
} from './_shared/B5cSession';

// =============================================================================
// B5b (1/6) — "Watch what feeding looks like." The PASTE, still inside the ONE
// VS Code session that opened at 297.80. Nothing is sent yet: this shot is only
// the source going IN.
//
// Master span 308.832167-318.932167 (local frame = round((t - 308.832167) * 30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// v2: frame 0 is a pixel copy of B5TwoSkills' last frame — the two-skills diagram
// is still up on the dimmed pane — and the shot MOVES from there instead of
// cutting. On "Watch" the diagram falls away, the editor tab flips from CLAUDE.md
// to Claude Code, and the scrim lifts on the Claude Code surface underneath.
//   diagram falls away                f2
//   "Watch"                           310.36 -> f11   the tab flips to Claude Code
//   scrim lifts                       f14-f28         the session is revealed
//   "paste"                           312.76 -> f83   the pasted-text pill snaps
//                                                     into the composer + the
//                                                     "a source is anything" label
//   "video transcript"                314.45 -> f134  pill 1
//   "post,"                           316.46 -> f194  pill 2
//   "doc,"                            317.50 -> f225  pill 3
//   "thought"                         318.38 -> f252  pill 4
//   "in the car."                     319.35 -> f280  pill 4's sub-line
// The prompt types itself AFTER the paste (f97-f157) — the order a human does it.
// Hands off to B5cFeedRun at 320.10 with the message typed but NOT sent.
// =============================================================================
export const compositionConfig = { id: 'B5bFeedPaste', durationInSeconds: 10.1, fps: 30, width: 1920, height: 1080 };

const DIAGRAM_OUT = 2;   // the two-skills diagram falls away
const TAB_AT = 11;       // "Watch" — the Claude Code tab becomes active
const PANE_AT = 12;      // the Claude Code surface is painted (still under the scrim)
const SCRIM_OUT = 14;    // ...and the scrim lifts off it
const F_PASTE = 83;
const TYPE_START = 97;

const B5bFeedPaste: React.FC = () => {
  const frame = useCurrentFrame();
  const onClaude = frame >= TAB_AT;
  // The Claude Code subtree is MOUNTED, not faded: an extra composited layer flips
  // Chrome from subpixel to grayscale text antialiasing, and at frame 0 this shot
  // has to be a byte-for-byte copy of B5TwoSkills' last frame. It mounts while the
  // scrim is still solid, so nothing about the mount is visible.
  const scrim = interpolate(frame, [SCRIM_OUT, SCRIM_OUT + 14], [1, 0], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <VSCodeWindow
      rows={myBrainRows()}
      projectName="my-brain"
      groups={[{
        x: ED_X, w: ED_W,
        tab: { label: onClaude ? 'Claude Code' : 'CLAUDE.md', icon: onClaude ? 'claude' : 'file', appearAt: FAR },
        breadcrumb: onClaude ? ['Claude Code'] : ['my-brain', 'CLAUDE.md'],
        children: <CodeEditorPane x={ED_X + 20} w={ED_W - 40} lines={CLAUDE_MD_LINES} typeStart={-2000} cps={30} fontSize={24} appearAt={FAR} />,
      }]}
    >
      {/* ---------------- the Claude Code surface, painted under the scrim ---------------- */}
      {frame >= PANE_AT && (
        <>
          <SessionBg />
          <SessionScroll>
            <SessionWordmark />
            <SessionEmptyState />
            <SourceChips labelAt={F_PASTE + 4} />
          </SessionScroll>
          <SessionComposer pasteAt={F_PASTE} typeStart={TYPE_START} />
        </>
      )}

      {/* ---------------- the dim, lifting off it ---------------- */}
      <PaneScrim opacity={scrim} />

      {/* ---------------- what B5TwoSkills left on screen, leaving ----------------
          The shift is EXACTLY -(B5TwoSkills' last frame) = -161, not just "some big
          negative": the flow dots travel on (frame - cue), so any other value would
          land them somewhere else and the 310.00 join would pop. */}
      <TwoSkillsDiagram shift={-161} exitAt={DIAGRAM_OUT} />

      <SidebarBrace />
    </VSCodeWindow>
  );
};

export default B5bFeedPaste;
