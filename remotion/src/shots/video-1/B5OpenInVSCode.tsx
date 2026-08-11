import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY } from '../../fonts';
import { V, VSC, CLAMP } from '../../lib/kit';
import { VSCodeWindow, CodeEditorPane, ExplorerRow, CodeLine, GROUP_TOP } from '../../lib/vscode';

// =============================================================================
// B5 step 2 — "Now open it in VS Code. That's the interface. Inside there are 2
// skills, and that's the whole thing."  Master span 296.632167–303.432167.
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Hard cut lands on "VS Code" (297.83 -> f1). The real brain-template tree.
//   "That's the interface."  299.12 -> f40   CLAUDE.md opens (tab + pane)
//   ".claude\skills" expands          f124   (chevron; children follow on the words)
//   "2"                      302.26 -> f134  mind-feeder row (appearAt 128) + the big count
//   "skills,"                302.49 -> f141  mind-reader row (appearAt 134)
//   "and that's the whole thing" 303.52 -> f172
// Rows are hand-built ExplorerRow[] (NOT baseExplorer, which is the example
// project's tree) so the file names on screen are the ones in the real repo.
// =============================================================================
export const compositionConfig = { id: 'B5OpenInVSCode', durationInSeconds: 6.8, fps: 30, width: 1920, height: 1080 };

const OPEN = 40, EXPAND = 124, SK1 = 128, SK2 = 134, HL1 = 134, HL2 = 140;
const SCRIM_AT = 132, BIG_AT = 138, WHOLE_AT = 172;

// markdown syntax colors (editor chrome — same local-palette pattern as example/SkillPointer)
const MD_KEY = '#4a9ee6', MD_HEAD = '#c9a26b', MD_TEXT = V.text, MD_DIM = V.faint;

const LINES: CodeLine[] = [
  [['---', MD_DIM]],
  [['contract-version: ', MD_KEY], ['"1.0"', MD_TEXT]],
  [['---', MD_DIM]],
  [['', MD_TEXT]],
  [['# YOUR MIND · Schema & Operating Contract', MD_HEAD]],
  [['', MD_TEXT]],
  [['This repo is your brain: the single knowledge base all of your AI', MD_TEXT]],
  [['agents read from for context, facts, and voice. This file is the', MD_TEXT]],
  [['contract. Every agent that reads or writes this repo MUST follow it.', MD_TEXT]],
  [['', MD_TEXT]],
  [['## 1. Layout', MD_HEAD]],
  [['', MD_TEXT]],
  [['| Path         | Layer         | What lives here              |', MD_DIM]],
  [['|--------------|---------------|------------------------------|', MD_DIM]],
  [['| INDEX.md     | Index         | Catalog of every entity.     |', MD_TEXT]],
  [['| identity/    | Identity core | Who you are, how you write.  |', MD_TEXT]],
  [['| projects/    | Cards         | One card per project.        |', MD_TEXT]],
  [['| knowledge/   | Distilled     | Takes, stories, lessons.     |', MD_TEXT]],
  [['| lenses/      | Scopes        | Named retrieval filters.     |', MD_TEXT]],
];

// sidebar geometry, measured off the rendered still (VSCodeWindow row pitch)
const ROW0_Y = 121, ROW_PITCH = 32;
const ED_W = 1920 - VSC.ED_X;

const B5OpenInVSCode: React.FC = () => {
  const frame = useCurrentFrame();

  // the two skill rows are SPLICED IN on their cue (the tree below pushes down,
  // exactly as VS Code does when a folder expands) — never held invisible, which
  // would leave a hole in the tree.
  const rows: ExplorerRow[] = [
    { name: '.claude\\skills', kind: 'folder', open: frame >= EXPAND },
    ...(frame >= SK1 ? [{ name: 'mind-feeder', kind: 'folder' as const, depth: 1, appearAt: SK1, highlightAt: HL1 }] : []),
    ...(frame >= SK2 ? [{ name: 'mind-reader', kind: 'folder' as const, depth: 1, appearAt: SK2, highlightAt: HL2 }] : []),
    { name: 'content-catalog', kind: 'folder' },
    { name: 'eval', kind: 'folder' },
    { name: 'identity', kind: 'folder' },
    { name: 'knowledge', kind: 'folder' },
    { name: 'lenses', kind: 'folder' },
    { name: 'projects', kind: 'folder' },
    { name: 'raw', kind: 'folder' },
    { name: 'CLAUDE.md', kind: 'file', icon: 'info' },
    { name: 'INDEX.md', kind: 'file', icon: 'info' },
    { name: 'LICENSE', kind: 'file', icon: 'file' },
    { name: 'README.md', kind: 'file', icon: 'info' },
  ];

  const braceH = interpolate(frame, [SK1, SK1 + 14], [0, ROW_PITCH * 2], { ...CLAMP, easing: EASINGS.easeOut });
  const scrim = interpolate(frame, [SCRIM_AT, SCRIM_AT + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const bigOp = interpolate(frame, [BIG_AT, BIG_AT + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const bigY = interpolate(frame, [BIG_AT, BIG_AT + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const wholeOp = interpolate(frame, [WHOLE_AT, WHOLE_AT + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const wholeY = interpolate(frame, [WHOLE_AT, WHOLE_AT + 14], [18, 0], { ...CLAMP, easing: EASINGS.easeOut });

  return (
    <VSCodeWindow
      rows={rows}
      projectName="my-brain"
      groups={[{
        x: VSC.ED_X, w: VSC.ED_W,
        tab: { label: 'CLAUDE.md', icon: 'file', appearAt: OPEN },
        breadcrumb: ['my-brain', 'CLAUDE.md'],
        children: <CodeEditorPane x={VSC.ED_X + 20} w={VSC.ED_W - 40} lines={LINES} typeStart={-2000} cps={30} fontSize={24} appearAt={OPEN + 4} />,
      }]}
    >
      {/* the editor dims so the count is the only thing to read */}
      <div style={{
        position: 'absolute', left: VSC.ED_X, top: GROUP_TOP, width: ED_W, bottom: 0,
        background: `${COLORS.ink}f5`, opacity: scrim,
      }} />
      <div style={{
        position: 'absolute', left: VSC.ED_X, top: 420, width: ED_W,
        display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 28,
        opacity: bigOp, transform: `translateY(${bigY}px)`,
      }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 210, lineHeight: 1, color: COLORS.accent }}>2</span>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 104, color: COLORS.paper }}>skills</span>
      </div>
      <div style={{
        position: 'absolute', left: VSC.ED_X, top: 664, width: ED_W, textAlign: 'center',
        fontFamily: FONT_BODY, fontSize: 40, color: COLORS.line,
        opacity: wholeOp, transform: `translateY(${wholeY}px)`,
      }}>
        and that&rsquo;s the whole thing
      </div>

      {/* accent bracket down the two skill rows in the explorer */}
      <div style={{
        position: 'absolute', left: VSC.SB_X + VSC.SB_W - 3, top: ROW0_Y + ROW_PITCH,
        width: 4, height: braceH, borderRadius: 2, background: COLORS.accent,
      }} />
    </VSCodeWindow>
  );
};
export default B5OpenInVSCode;
