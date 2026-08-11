// B5 / B5b shared session surface — the ONE continuous VS Code + Claude Code
// scene that runs from 297.80 to ~341 without a single cut back to camera.
// NOT a shot (no compositionConfig) — gen-registry skips this file on purpose.
//
// Four shots ride on it: B5OpenInVSCode (not editable, it establishes the frame),
// B5TwoSkills, B5bFeedPaste, B5cFeedRun and B5bProposal. Everything that has to be
// PIXEL-IDENTICAL across a shot join lives here exactly once, so a join can never
// drift: the my-brain explorer tree, the accent brace, the CLAUDE.md editor pane,
// the pane scrim, the two-skills diagram, the Claude Code session column and the
// composer.
//
// Third-party UI (VS Code chrome, Claude Code) keeps its own literal palette (V.*
// from lib/kit, coral #cd8064) — house practice, see B5TemplateRepo / B7kit. Brand
// tokens are used only where they carry meaning (the accent brace, the verbatim
// gate, the "worth keeping" payoff).
import React from 'react';
import { Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import {
  PenLine, BookOpen, FolderGit2, Paperclip, FileVideo, MessageSquare, FileText, Lightbulb, Car,
  Mic, Plus, Slash, Zap, ArrowUp, Square, ChevronRight, Check,
} from 'lucide-react';
import { COLORS, GRADIENT, EASINGS, RADIUS } from '../../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO, FONT_SERIF } from '../../../fonts';
import { CLAMP, Sunburst, V, VSC } from '../../../lib/kit';
import { ExplorerRow, CodeLine, GROUP_TOP } from '../../../lib/vscode';

// ---------------------------------------------------------------- geometry
export const ED_X = VSC.ED_X;          // 426
export const ED_W = VSC.ED_W;          // 1494
export const PANE_TOP = GROUP_TOP;     // 118
export const COL_X = ED_X + 60;        // transcript left gutter
export const COL_W = ED_W - 120;
export const SESSION_CLIP_H = 777;     // 118 -> 895, i.e. down to the composer
export const FAR = -20000;             // "already happened" sentinel for a cue frame
export const NEVER = 100000;           // "never happens" sentinel

export const r = (frame: number, a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
  interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

// ---------------------------------------------------------------- explorer
// The REAL my-brain tree, .claude\skills expanded with the two skills spliced in
// and both marked — exactly the state B5OpenInVSCode leaves at 304.60. It never
// changes again for the rest of the sequence, so the sidebar is pixel-stable.
export const myBrainRows = (): ExplorerRow[] => [
  { name: '.claude\\skills', kind: 'folder', open: true },
  { name: 'mind-feeder', kind: 'folder', depth: 1, highlightAt: FAR },
  { name: 'mind-reader', kind: 'folder', depth: 1, highlightAt: FAR },
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

// The accent brace down the two skill rows. Same coordinates B5OpenInVSCode
// draws it at, held at full height for the whole sequence.
const ROW0_Y = 121, ROW_PITCH = 32;
export const SidebarBrace: React.FC = () => (
  <div style={{
    position: 'absolute', left: VSC.SB_X + VSC.SB_W - 3, top: ROW0_Y + ROW_PITCH,
    width: 4, height: ROW_PITCH * 2, borderRadius: 2, background: COLORS.accent,
  }} />
);

// ---------------------------------------------------------------- CLAUDE.md
// The markdown pane B5OpenInVSCode leaves open behind the scrim. Identical copy so
// the 4% of it that shows through the scrim matches frame for frame.
const MD_KEY = '#4a9ee6', MD_HEAD = '#c9a26b', MD_TEXT = V.text, MD_DIM = V.faint;
export const CLAUDE_MD_LINES: CodeLine[] = [
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

// The ink scrim over the editor pane (B5OpenInVSCode dims the editor so the
// count is the only thing to read). Same colour + region.
export const PaneScrim: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div style={{
    position: 'absolute', left: ED_X, top: PANE_TOP, width: ED_W, bottom: 0,
    background: `${COLORS.ink}f5`, opacity,
  }} />
);

// Flat editor background — what the Claude Code surface sits on.
export const SessionBg: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div style={{ position: 'absolute', left: ED_X, top: PANE_TOP, width: ED_W, bottom: 0, background: V.editor, opacity }} />
);

// =============================================================================
// THE TWO-SKILLS DIAGRAM — lives INSIDE the right-hand pane, on the scrim, so
// B5TwoSkills is a continuation of B5OpenInVSCode instead of a new scene.
// =============================================================================
const AXIS = 470;
const FEEDER = { x: 543, y: 352, w: 290, h: 236 };
const BRAIN = { x: 1033, y: 340, w: 280, h: 260 };
const READER = { x: 1513, y: 352, w: 290, h: 236 };
const ARROW_L = { x: 853, w: 180 };
const ARROW_R = { x: 1333, w: 180 };

const Flow: React.FC<{ x: number; w: number; color: string; at: number }> = ({ x, w, color, at }) => {
  const frame = useCurrentFrame();
  const draw = r(frame, at, at + 16);
  const head = r(frame, at + 10, at + 20);
  const t = Math.max(0, frame - at);
  const runW = w - 20;
  return (
    <>
      <div style={{ position: 'absolute', left: x, top: AXIS - 3, width: runW, height: 6, borderRadius: 3, background: `${color}66`, transform: `scaleX(${draw})`, transformOrigin: 'left' }} />
      <div style={{
        position: 'absolute', left: x + runW, top: AXIS - 13, width: 0, height: 0,
        borderTop: '13px solid transparent', borderBottom: '13px solid transparent', borderLeft: `20px solid ${color}`,
        opacity: head,
      }} />
      {[0, 1, 2].map((i) => {
        const p = ((t * 0.013) + i / 3) % 1;
        return (
          <div key={i} style={{
            position: 'absolute', left: x + p * runW - 7, top: AXIS - 7,
            width: 14, height: 14, borderRadius: '50%', background: color, opacity: draw,
          }} />
        );
      })}
    </>
  );
};

const SkillCard: React.FC<{
  box: { x: number; y: number; w: number; h: number };
  at: number; color: string; name: string; sub: string; Icon: React.FC<any>;
}> = ({ box, at, color, name, sub, Icon }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      position: 'absolute', left: box.x, top: box.y, width: box.w, height: box.h,
      background: 'rgba(255,255,255,0.05)', border: `2px solid ${color}`, borderRadius: RADIUS.card,
      opacity: r(frame, at, at + 14), transform: `translateY(${r(frame, at, at + 14, 24, 0)}px)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
    }}>
      <div style={{ width: 70, height: 70, borderRadius: '50%', background: `${color}2e`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={38} color={color} strokeWidth={2} />
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 33, fontWeight: 700, color: COLORS.paper }}>{name}</div>
      <div style={{ fontFamily: FONT_BODY, fontSize: 22, color: COLORS.d400 }}>{sub}</div>
    </div>
  );
};

const ArrowLabel: React.FC<{ cx: number; at: number; color: string; verb: string; dir: string }> = ({ cx, at, color, verb, dir }) => {
  const frame = useCurrentFrame();
  const op = r(frame, at, at + 14);
  const y = r(frame, at, at + 14, 18, 0);
  return (
    <>
      <div style={{
        position: 'absolute', left: cx - 100, top: AXIS - 92, width: 200, textAlign: 'center',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color, opacity: op, transform: `translateY(${y}px)`,
      }}>{verb}</div>
      <div style={{
        position: 'absolute', left: cx - 100, top: AXIS + 34, width: 200, textAlign: 'center',
        fontFamily: FONT_BODY, fontSize: 22, color: COLORS.d400, opacity: op, transform: `translateY(${y}px)`,
      }}>{dir}</div>
    </>
  );
};

// Cue frames are relative to B5TwoSkills' own timeline. `shift` slides them all —
// B5bFeedPaste passes a large negative shift so the finished diagram is already on
// screen at its frame 0, which is what makes the 310.00 join invisible.
// `exitAt` (absolute) fades + falls the whole thing away.
export const TWO_SKILLS_CUES = { feeder: 9, writes: 38, reader: 70, reads: 108, close: 125, sweep: 146 } as const;

export const TwoSkillsDiagram: React.FC<{ shift?: number; exitAt?: number }> = ({ shift = 0, exitAt = NEVER }) => {
  const frame = useCurrentFrame();
  const c = TWO_SKILLS_CUES;
  const feederAt = c.feeder + shift, writesAt = c.writes + shift, readerAt = c.reader + shift;
  const readsAt = c.reads + shift, closeAt = c.close + shift, sweepAt = c.sweep + shift;
  const brainAt = 2 + shift;
  const outOp = 1 - r(frame, exitAt, exitAt + 12, 0, 1, EASINGS.easeIn);
  const outY = r(frame, exitAt, exitAt + 12, 0, 18, EASINGS.easeIn);
  const closeOp = r(frame, closeAt, closeAt + 14);
  const closeY = r(frame, closeAt, closeAt + 14, 22, 0);
  const sweep = r(frame, sweepAt, sweepAt + 8, 0, 1, EASINGS.easeInOut);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: outOp, transform: `translateY(${outY}px)` }}>
      {/* the brain in the middle */}
      <div style={{
        position: 'absolute', left: BRAIN.x, top: BRAIN.y, width: BRAIN.w, height: BRAIN.h,
        background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: RADIUS.card,
        overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
        opacity: r(frame, brainAt, brainAt + 14), transform: `translateY(${r(frame, brainAt, brainAt + 14, 20, 0)}px)`,
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 8, background: GRADIENT }} />
        <FolderGit2 size={58} color={COLORS.paper} strokeWidth={1.7} />
        <div style={{ fontFamily: FONT_MONO, fontSize: 36, fontWeight: 700, color: COLORS.paper }}>my-brain</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 22, color: COLORS.d400 }}>markdown in a git repo</div>
      </div>

      {/* mind-feeder WRITES into it */}
      <SkillCard box={FEEDER} at={feederAt} color={COLORS.accent} name="mind-feeder" sub="the only writer" Icon={PenLine} />
      <Flow x={ARROW_L.x} w={ARROW_L.w} color={COLORS.accent} at={writesAt} />
      <ArrowLabel cx={ARROW_L.x + ARROW_L.w / 2} at={writesAt} color={COLORS.accent} verb="writes" dir="into it" />

      {/* mind-reader READS out of it */}
      <SkillCard box={READER} at={readerAt} color={COLORS.signal} name="mind-reader" sub="pulls what is relevant" Icon={BookOpen} />
      <Flow x={ARROW_R.x} w={ARROW_R.w} color={COLORS.signal} at={readsAt} />
      <ArrowLabel cx={ARROW_R.x + ARROW_R.w / 2} at={readsAt} color={COLORS.signal} verb="reads" dir="out of it" />

      {/* "It's that simple." */}
      <div style={{
        position: 'absolute', left: ED_X, top: 700, width: ED_W, textAlign: 'center',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 66, color: COLORS.paper,
        opacity: closeOp, transform: `translateY(${closeY}px)`,
      }}>
        It&rsquo;s that{' '}
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ position: 'absolute', left: -8, right: -8, bottom: 8, height: 20, background: `${COLORS.warn}99`, borderRadius: 6, transform: `scaleX(${sweep})`, transformOrigin: 'left', zIndex: 0 }} />
          <span style={{ position: 'relative', zIndex: 1 }}>simple.</span>
        </span>
      </div>
    </div>
  );
};

// =============================================================================
// THE CLAUDE CODE SESSION — a scrolling transcript in the editor pane.
// =============================================================================

// Clipped, scrollable column. Children use ABSOLUTE CANVAS coordinates; the
// column translates under the clip so the transcript can run past the pane.
export const SessionScroll: React.FC<{ scrollY?: number; children: React.ReactNode }> = ({ scrollY = 0, children }) => (
  <div style={{ position: 'absolute', left: ED_X, top: PANE_TOP, width: ED_W, height: SESSION_CLIP_H, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: -ED_X, top: -PANE_TOP, width: 1920, height: 2400, transform: `translateY(${-scrollY}px)` }}>
      {children}
    </div>
    {/* the transcript scrolls up under the breadcrumb, so soften the clip edge */}
    <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 44, background: `linear-gradient(${V.editor}, ${V.editor}00)` }} />
  </div>
);

export const SessionWordmark: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div style={{ position: 'absolute', top: 170, left: ED_X, width: ED_W, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, opacity }}>
    <Sunburst size={30} color={V.coral} />
    <span style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 40, color: V.coral }}>Claude Code</span>
  </div>
);

export const SessionEmptyState: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div style={{ position: 'absolute', top: 250, left: ED_X, width: ED_W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, opacity }}>
    <Img src={staticFile('library/logos/claude-code-bot.png')} style={{ width: 104, height: 104 }} />
    <span style={{ fontFamily: FONT_BODY, fontSize: 25, color: V.dim }}>Ready when you are.</span>
  </div>
);

const SOURCES: { label: string; sub?: string; subAt?: number; Icon: React.FC<any>; SubIcon?: React.FC<any>; at: number }[] = [
  { label: 'video transcript', Icon: FileVideo, at: 134 },
  { label: 'a post', Icon: MessageSquare, at: 194 },
  { label: 'a doc', Icon: FileText, at: 225 },
  { label: 'just a thought', sub: 'I had in the car', subAt: 280, SubIcon: Car, Icon: Lightbulb, at: 252 },
];

// "A source is anything you said" + the four source chips. labelAt/opacity let the
// next shot hold them at frame 0 and then clear them on the send.
export const SourceChips: React.FC<{ labelAt?: number; opacity?: number; shift?: number }> = ({ labelAt = 87, opacity = 1, shift = 0 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ opacity }}>
      <div style={{
        position: 'absolute', top: 466, left: ED_X, width: ED_W, textAlign: 'center',
        fontFamily: FONT_MONO, fontSize: 22, letterSpacing: 4, color: V.faint, opacity: r(frame, labelAt, labelAt + 14),
      }}>
        A&nbsp;SOURCE&nbsp;IS&nbsp;ANYTHING&nbsp;YOU&nbsp;SAID
      </div>
      <div style={{
        position: 'absolute', top: 520, left: ED_X, width: ED_W,
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 18,
      }}>
        {SOURCES.map((s) => {
          const at = s.at + shift;
          const { Icon } = s;
          return (
            <div key={s.label} style={{
              opacity: r(frame, at, at + 14), transform: `translateY(${r(frame, at, at + 14, 22, 0)}px)`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, height: 66, padding: '0 24px',
                background: '#232323', border: `1px solid ${V.inputBorder}`, borderRadius: 14,
              }}>
                <Icon size={26} color={V.coral} strokeWidth={1.9} />
                <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 28, color: V.text }}>{s.label}</span>
              </div>
              {s.sub && s.SubIcon && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: r(frame, (s.subAt ?? s.at) + shift, (s.subAt ?? s.at) + shift + 12) }}>
                  <s.SubIcon size={19} color={V.faint} strokeWidth={1.9} />
                  <span style={{ fontFamily: FONT_BODY, fontSize: 22, color: V.dim }}>{s.sub}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// The sent message, as Claude Code renders it: the attachment chip on top of the
// prompt, right-aligned.
export const UserTurn: React.FC<{ y: number; at: number }> = ({ y, at }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{
      position: 'absolute', left: COL_X, top: y, width: COL_W, display: 'flex', justifyContent: 'flex-end',
      opacity: r(frame, at, at + 12), transform: `translateY(${r(frame, at, at + 12, 12, 0)}px)`,
    }}>
      <div style={{ background: V.input, border: `1px solid ${V.inputBorder}`, borderRadius: 12, padding: '16px 24px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, height: 40, padding: '0 14px',
          background: '#2e2b29', border: `1px solid ${V.coral}66`, borderRadius: 8, marginBottom: 12,
        }}>
          <Paperclip size={17} color={V.coral} strokeWidth={2} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 21, color: V.text }}>Pasted text #1</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 19, color: V.faint }}>1,842 lines</span>
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 26, color: V.text }}>feed this into my brain</div>
      </div>
    </div>
  );
};

// The L-shaped result connector Claude Code prints in front of every sub-line.
const Elbow: React.FC = () => (
  <div style={{
    width: 15, height: 14, marginTop: -9, flexShrink: 0,
    borderLeft: `2px solid ${V.faint}`, borderBottom: `2px solid ${V.faint}`, borderBottomLeftRadius: 3,
  }} />
);

export const BLOCK_TITLE_H = 42;
export const BLOCK_SUB_H = 38;
export type CliSub = { at: number; text: string; color?: string; strong?: boolean };

// One Claude Code step: the coral bullet (a spinner while it runs), the tool name,
// its argument, and the result sub-lines streaming underneath.
export const CliStep: React.FC<{
  y: number; at: number; tool: string; arg?: string;
  doneAt?: number; underlineAt?: number; subs?: CliSub[];
}> = ({ y, at, tool, arg, doneAt = at, underlineAt = NEVER, subs = [] }) => {
  const frame = useCurrentFrame();
  const spin = (frame * 9) % 360;
  const done = r(frame, doneAt, doneAt + 8);
  const wipe = r(frame, underlineAt, underlineAt + 12, 0, 1, EASINGS.easeInOut);
  return (
    <div style={{
      position: 'absolute', left: COL_X, top: y, width: COL_W,
      opacity: r(frame, at, at + 12), transform: `translateY(${r(frame, at, at + 12, 10, 0)}px)`,
    }}>
      <div style={{ height: BLOCK_TITLE_H, display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* the spinner is UNMOUNTED once the step resolves — a rotating layer that is
            only invisible still changes how Chrome antialiases the text next to it,
            and these steps have to survive a shot boundary unchanged. */}
        <div style={{ position: 'relative', width: 26, height: 26, flexShrink: 0 }}>
          <div style={{ position: 'absolute', left: 5, top: 5, width: 16, height: 16, borderRadius: '50%', background: V.coral, opacity: done }} />
          {done < 1 && (
            <div style={{ position: 'absolute', inset: 0, transform: `rotate(${spin}deg)`, opacity: 1 - done, display: 'flex' }}>
              <Sunburst size={26} color={V.coral} />
            </div>
          )}
        </div>
        <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: V.text }}>{tool}</span>
        {arg && (
          <span style={{ position: 'relative', display: 'inline-block', fontFamily: FONT_MONO, fontSize: 28, color: V.dim }}>
            ({arg})
            <span style={{ position: 'absolute', left: 0, right: 0, bottom: -6, height: 3, borderRadius: 2, background: V.coral, transform: `scaleX(${wipe})`, transformOrigin: 'left' }} />
          </span>
        )}
      </div>
      {subs.map((s) => (
        <div key={s.text} style={{
          height: BLOCK_SUB_H, display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 8,
          opacity: r(frame, s.at, s.at + 12), transform: `translateY(${r(frame, s.at, s.at + 12, 8, 0)}px)`,
        }}>
          <Elbow />
          <span style={{
            fontFamily: FONT_MONO, fontSize: 24, color: s.color ?? V.dim, fontWeight: s.strong ? 700 : 400,
          }}>{s.text}</span>
        </div>
      ))}
    </div>
  );
};

// =============================================================================
// THE COMPOSER — one component for every state, so its height and chrome are
// identical on both sides of a cut.
//   pasteAt   the attachment chip snaps in
//   typeStart the prompt types itself
//   sendAt    the message goes; the chip collapses and the send button becomes stop
// =============================================================================
const CHIP_BLOCK_H = 74;
export const PROMPT = 'feed this into my brain';

export const SessionComposer: React.FC<{
  pasteAt?: number; typeStart?: number; perChar?: number; sendAt?: number;
}> = ({ pasteAt = NEVER, typeStart = NEVER, perChar = 2.6, sendAt = NEVER }) => {
  const frame = useCurrentFrame();
  const sent = r(frame, sendAt, sendAt + 8);
  const chipH = r(frame, sendAt, sendAt + 8, CHIP_BLOCK_H, 0, EASINGS.easeInOut);
  const pasteOp = r(frame, pasteAt, pasteAt + 10);
  const pasteSc = r(frame, pasteAt, pasteAt + 12, 0.9, 1, EASINGS.overshoot);
  const typeEnd = typeStart + PROMPT.length * perChar;
  const typed = PROMPT.slice(0, Math.floor(r(frame, typeStart, typeEnd, 0, PROMPT.length, EASINGS.easeInOut)));
  const caretOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <div style={{ position: 'absolute', bottom: 30, left: ED_X + 24, width: ED_W - 48 }}>
      <div style={{ position: 'relative', background: V.input, border: `1px solid ${V.inputBorder}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 14, boxShadow: `inset 0 0 0 1px ${V.coral}`, opacity: 1 - sent }} />
        {/* the pasted source */}
        <div style={{ height: chipH, overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px 6px', opacity: pasteOp, transform: `scale(${pasteSc})`, transformOrigin: 'left center' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12, height: 50, padding: '0 20px',
              background: '#2e2b29', border: `1px solid ${V.coral}66`, borderRadius: 10,
            }}>
              <Paperclip size={20} color={V.coral} strokeWidth={2} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: V.text }}>Pasted text #1</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 22, color: V.faint }}>1,842 lines</span>
            </div>
          </div>
        </div>
        {/* the prompt line */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '10px 24px 18px', minHeight: 30 }}>
          <span style={{ flex: 1, position: 'relative', height: 34 }}>
            <span style={{ position: 'absolute', left: 0, top: 0, color: V.text, fontFamily: FONT_MONO, fontSize: 27, opacity: 1 - sent, whiteSpace: 'nowrap' }}>
              {typed}<span style={{ opacity: caretOn ? 1 : 0, color: V.coral }}>▌</span>
            </span>
            <span style={{ position: 'absolute', left: 0, top: 1, color: V.faint, fontFamily: FONT_BODY, fontSize: 26, opacity: sent, whiteSpace: 'nowrap' }}>
              Queue another message…
            </span>
          </span>
          <Mic size={24} color={V.dim} strokeWidth={2} />
        </div>
        {/* the dock */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Plus size={26} color={V.dim} strokeWidth={2} />
            <div style={{ width: 36, height: 30, borderRadius: 8, border: `1px solid ${V.inputBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Slash size={18} color={V.dim} strokeWidth={2} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Zap size={20} color={V.dim} strokeWidth={2} />
            <span style={{ color: V.dim, fontSize: 24 }}>Auto mode</span>
            <div style={{ position: 'relative', width: 42, height: 42, borderRadius: 10, background: V.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'absolute', opacity: 1 - sent, display: 'flex' }}><ArrowUp size={24} color="#fff" strokeWidth={2.4} /></div>
              <div style={{ position: 'absolute', opacity: sent, display: 'flex' }}><Square size={18} color="#fff" fill="#fff" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// THE APPROVAL PROMPT — the real Claude Code permission box. This is the gate the
// whole beat is about: it proposes, then it STOPS here until you answer.
// =============================================================================
export const APPROVE_H = 258;
const OPTIONS = ['1. Yes', '2. Yes, and do not ask again this session', '3. No, tell Claude what to do differently'];

export const ApprovalPrompt: React.FC<{
  y: number; x: number; w: number; at: number; noteAt: number; waitAt: number; approveAt: number;
  question: string; note: string;
}> = ({ y, x, w, at, noteAt, waitAt, approveAt, question, note }) => {
  const frame = useCurrentFrame();
  const op = r(frame, at, at + 14);
  const ty = r(frame, at, at + 14, 18, 0);
  const ok = r(frame, approveAt, approveAt + 12);
  const wait = r(frame, waitAt, waitAt + 12) * (1 - r(frame, approveAt, approveAt + 8));
  const pulse = 0.7 + 0.3 * Math.abs(((frame % 44) / 22) - 1);
  const edge = ok > 0.5 ? COLORS.signal : COLORS.warn;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: APPROVE_H, boxSizing: 'border-box',
      background: '#181818', border: `2px solid ${edge}`, borderRadius: 10, padding: '24px 28px',
      opacity: op, transform: `translateY(${ty}px)`,
    }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: `${COLORS.warn}10`, opacity: 1 - ok }} />
      <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: `${COLORS.signal}14`, opacity: ok }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 44 }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 29, color: V.text }}>{question}</span>
        <span style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: FONT_MONO, fontSize: 22, color: COLORS.warn,
          border: `1px solid ${COLORS.warn}66`, borderRadius: RADIUS.pill, padding: '6px 20px',
          opacity: wait * pulse,
        }}>waiting for you</span>
        <span style={{
          position: 'absolute', right: 0, display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: FONT_MONO, fontSize: 22, color: COLORS.signal,
          border: `1px solid ${COLORS.signal}66`, borderRadius: RADIUS.pill, padding: '6px 20px',
          opacity: ok,
        }}>
          <Check size={17} color={COLORS.signal} strokeWidth={3.2} />approved by you
        </span>
      </div>

      <div style={{
        position: 'relative', height: 30, display: 'flex', alignItems: 'center',
        opacity: r(frame, noteAt, noteAt + 12) * (1 - ok),
      }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 24, color: COLORS.warn }}>{note}</span>
      </div>

      <div style={{ position: 'relative', marginTop: 10 }}>
        {OPTIONS.map((o, i) => {
          const first = i === 0;
          const col = first ? (ok > 0.5 ? COLORS.signal : V.coral) : V.dim;
          return (
            <div key={o} style={{ height: 42, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 22, display: 'flex', opacity: first ? 1 : 0 }}>
                <ChevronRight size={22} color={col} strokeWidth={3} />
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 26, color: first ? col : V.dim }}>{o}</span>
              {first && (
                <div style={{
                  marginLeft: 10, display: 'flex', alignItems: 'center', gap: 8,
                  opacity: ok, fontFamily: FONT_MONO, fontSize: 22, color: COLORS.signal,
                }}>
                  <Check size={18} color={COLORS.signal} strokeWidth={3.2} />selected
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
