import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { CLAMP } from '../../lib/kit';
import { VSCodeWindow, CodeEditorPane } from '../../lib/vscode';
import {
  ED_X, ED_W, FAR, myBrainRows, SidebarBrace, CLAUDE_MD_LINES, PaneScrim, TwoSkillsDiagram,
} from './_shared/B5cSession';

// =============================================================================
// B5 step 3 — "The mind-feeder writes and the mind-reader reads. It's that
// simple."  Master span 303.432167-308.832167 (local frame = round((t - 303.432167) * 30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//
// v2: this is NOT a separate diagram card any more. VS Code opened at 297.80 and
// stays open until ~341, so this shot CONTINUES B5OpenInVSCode: identical window
// chrome, identical my-brain tree (.claude\skills expanded, both skills marked,
// accent brace held), identical CLAUDE.md tab and pane, identical ink scrim. Frame
// 0 here is a pixel copy of B5OpenInVSCode's last frame; the only thing that moves
// is the "2 skills" stamp falling away so the explanation can play in the pane.
//   "2 skills / and that's the whole thing"  f0-f10   falls away
//   "mind-feeder"      304.90 -> f9    the writer card
//   "writes"           305.86 -> f38   arrow draws INTO the brain (indigo)
//   "mind-reader"      306.92 -> f70   the reader card
//   "reads."           308.20 -> f108  arrow draws OUT of the brain (teal)
//   "It's that simple." 308.77 -> f125, highlight on "simple" 309.46 -> f146
// mind-feeder = the ONLY writer, mind-reader = the consumer protocol
// (brain-template/.claude/skills/*/SKILL.md) — the direction is the whole point.
// Hands off to B5bFeedPaste at 310.00 with the diagram still up; that shot clears
// it and switches to the Claude Code tab on "Watch what feeding looks like."
// =============================================================================
export const compositionConfig = { id: 'B5TwoSkills', durationInSeconds: 5.4, fps: 30, width: 1920, height: 1080 };

const OUT_AT = 0; // the count starts leaving the instant the cut lands

const B5TwoSkills: React.FC = () => {
  const frame = useCurrentFrame();
  const outOp = interpolate(frame, [OUT_AT, OUT_AT + 10], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });
  const outY = interpolate(frame, [OUT_AT, OUT_AT + 10], [0, 16], { ...CLAMP, easing: EASINGS.easeIn });

  return (
    <VSCodeWindow
      rows={myBrainRows()}
      projectName="my-brain"
      groups={[{
        x: ED_X, w: ED_W,
        tab: { label: 'CLAUDE.md', icon: 'file', appearAt: FAR },
        breadcrumb: ['my-brain', 'CLAUDE.md'],
        children: <CodeEditorPane x={ED_X + 20} w={ED_W - 40} lines={CLAUDE_MD_LINES} typeStart={-2000} cps={30} fontSize={24} appearAt={FAR} />,
      }]}
    >
      {/* the pane stays dimmed exactly as B5OpenInVSCode left it */}
      <PaneScrim opacity={1} />

      {/* ...and the count it ended on falls away */}
      <div style={{
        position: 'absolute', left: ED_X, top: 420, width: ED_W,
        display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 28,
        opacity: outOp, transform: `translateY(${outY}px)`,
      }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 210, lineHeight: 1, color: COLORS.accent }}>2</span>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 104, color: COLORS.paper }}>skills</span>
      </div>
      <div style={{
        position: 'absolute', left: ED_X, top: 664, width: ED_W, textAlign: 'center',
        fontFamily: FONT_BODY, fontSize: 40, color: COLORS.line,
        opacity: outOp, transform: `translateY(${outY}px)`,
      }}>
        and that&rsquo;s the whole thing
      </div>

      {/* the explanation, in the right-hand pane */}
      <TwoSkillsDiagram />

      <SidebarBrace />
    </VSCodeWindow>
  );
};
export default B5TwoSkills;
