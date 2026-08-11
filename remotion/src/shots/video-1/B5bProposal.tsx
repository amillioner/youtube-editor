import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_MONO } from '../../fonts';
import { CLAMP, V } from '../../lib/kit';
import { VSCodeWindow } from '../../lib/vscode';
import { Marker } from '../../lib/browser';
import {
  ED_X, ED_W, FAR, myBrainRows, SidebarBrace, SessionBg, SessionScroll, SessionWordmark,
  SessionComposer, UserTurn, CliStep, ApprovalPrompt,
} from './_shared/B5cSession';

// =============================================================================
// B5b (3/6) — ★ the heart of the beat: the PROPOSAL. mind-feeder never writes on
// its own; it shows a plan with the owner's verbatim quote and then STOPS at the
// real Claude Code permission prompt until you answer.
//
// v2: this is no longer a composed artifact card on the brand background. It plays
// INSIDE the Claude Code session that has been running since 310.00 — same VS Code
// window, same my-brain tree, same transcript, which now SCROLLS as the proposal,
// the approval prompt and the write result stream in. Frame 0 is a pixel copy of
// B5cFeedRun's last frame. Content is the real thing from the brain repo: the note
// id, its frontmatter fields and the literal VERBATIM line out of
// knowledge/takes/take-2026-07-maintenance-burden-in-seconds.md.
//
// Master span 327.232167-341.232167 (local frame = round((t - 327.232167) * 30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//   "it shows"          328.65 -> f6    mind-feeder(propose)
//   "me"                329.11 -> f21   "1 new note, 1 index line" + the plan box
//   "a proposal"        329.37 -> f29   the note it wants to keep
//   "the exact"         330.64 -> f67   the verbatim box opens
//   "quote"             331.20 -> f84   quote line 1 + warn marker sweep
//   "to preserve"       332.56 -> f125  quote line 2 + its sweep
//   "in my words."      333.76 -> f161  accent underline + "in your words" chip
//   "Then it stops"     335.21 -> f204  the REAL approval prompt appears
//                                f214  "nothing has been written yet"
//   "for my approval."  336.81 -> f252  "waiting for you"
//   "When I approve,"   338.03 -> f289  option 1 resolves, the box turns teal
//   "it writes it."     339.31 -> f327  Write(...take.md)  /  f341 Update(INDEX.md)
//   "It's one Git       340.66 -> f360  Bash(git commit ...)
//    commit."           341.30 -> f387  files changed  /  341.88 -> f404  1 commit
// Hands off to B5bProposeApprove at 342.40, which is a deliberate full-screen cut.
// =============================================================================
export const compositionConfig = { id: 'B5bProposal', durationInSeconds: 14, fps: 30, width: 1920, height: 1080 };

// --- cue frames -------------------------------------------------------------
const F_PROPOSE = 6;
const F_PLAN = 21;
const F_NOTE = 29;
const F_META = 40;
const F_BOX = 67;
const F_QUOTE = 84;
const F_PRESERVE = 125;
const F_INDEX = 96;
const F_MYWORDS = 161;
const F_STOP = 204;
const F_NOTHING = 214;
const F_WAIT = 252;
const F_APPROVE = 289;
const F_WRITE = 327;
const F_UPDATE = 341;
const F_COMMIT = 360;
const F_FILES = 387;
const F_BADGE = 404;

// --- transcript geometry (canvas px, inside the scrolling column) ------------
const Y_TURN = 250;
const Y_READ = 400;
const Y_ANALYZE = 512;
const Y_DECIDE = 738;
const Y_PROPOSE = 896;

const PANEL = { x: ED_X + 82, y: 996, w: 1352, h: 400 };
const PAD = 24;
const VB = { y: 120, h: 206 };              // verbatim box, panel-local
const APPROVE_Y = 1436;
const Y_WRITE = 1734;
const Y_UPDATE = 1838;
const Y_COMMIT = 1962;

const NOTE_ID = 'take-2026-07-maintenance-burden-in-seconds';

// The session scrolls so the newest output is always in the pane — the same thing
// a real terminal does, and it keeps the 14s from ever going static.
const SCROLL_KEYS = [0, 8, 32, 188, 212, 306, 332];
const SCROLL_VALS = [0, 0, 590, 590, 870, 870, 1230];

const B5bProposal: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });
  const scrollY = interpolate(frame, SCROLL_KEYS, SCROLL_VALS, { ...CLAMP, easing: EASINGS.easeInOut });

  const panelOp = r(F_PLAN, F_PLAN + 14);
  const panelY = r(F_PLAN, F_PLAN + 14, 18, 0);

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

      <SessionScroll scrollY={scrollY}>
        {/* ---------- everything the session already printed (held) ---------- */}
        <SessionWordmark />
        <UserTurn y={Y_TURN} at={FAR} />
        <CliStep y={Y_READ} at={FAR} doneAt={FAR} tool="Read" arg="Pasted text #1" subs={[{ at: FAR, text: '1,842 lines' }]} />
        <CliStep
          y={Y_ANALYZE} at={FAR} doneAt={FAR} underlineAt={FAR}
          tool="mind-feeder" arg="read the source"
          subs={[
            { at: FAR, text: 'claims and opinions' },
            { at: FAR, text: 'numbers and receipts' },
            { at: FAR, text: 'stories' },
            { at: FAR, text: 'the way you say things' },
          ]}
        />
        <CliStep
          y={Y_DECIDE} at={FAR} doneAt={FAR} underlineAt={FAR}
          tool="mind-feeder" arg="decide what is worth keeping"
          subs={[
            { at: FAR, text: '47 candidate lines' },
            { at: FAR, text: '1 worth keeping', color: COLORS.accent, strong: true },
          ]}
        />

        {/* ---------- the proposal ----------
            Everything from here down MOUNTS on its cue rather than sitting at opacity
            0: a zero-opacity layer still flips Chrome's text antialiasing, and frame 0
            has to be a byte-for-byte copy of B5cFeedRun's last frame. */}
        {frame >= F_PROPOSE && (
        <CliStep
          y={Y_PROPOSE} at={F_PROPOSE} doneAt={F_PROPOSE + 8}
          tool="mind-feeder" arg="propose"
          subs={[{ at: F_PLAN, text: '1 new note, 1 index line' }]}
        />
        )}

        {frame >= F_PLAN && (
        <div style={{
          position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, boxSizing: 'border-box',
          background: '#181818', border: `1px solid ${V.inputBorder}`, borderRadius: 10,
          opacity: panelOp, transform: `translateY(${panelY}px)`,
        }}>
          {/* the note it wants to keep */}
          <div style={{
            position: 'absolute', left: PAD, top: PAD, display: 'flex', alignItems: 'center', gap: 18, height: 44,
            opacity: r(F_NOTE, F_NOTE + 14), transform: `translateY(${r(F_NOTE, F_NOTE + 14, 12, 0)}px)`,
          }}>
            <span style={{
              fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 2, color: COLORS.signal,
              border: `1px solid ${COLORS.signal}66`, background: `${COLORS.signal}1a`,
              borderRadius: RADIUS.pill, padding: '5px 16px',
            }}>NEW</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: V.text }}>knowledge/takes/{NOTE_ID}.md</span>
          </div>

          {/* its frontmatter */}
          <div style={{
            position: 'absolute', left: PAD + 4, top: 74, height: 34, display: 'flex', alignItems: 'center',
            fontFamily: FONT_MONO, fontSize: 23, color: V.dim, opacity: r(F_META, F_META + 12),
          }}>
            type: take &nbsp;·&nbsp; topics: [self-hosting, no-saas] &nbsp;·&nbsp; visibility: public
          </div>

          {/* the verbatim quote — the whole reason the gate exists */}
          <div style={{
            position: 'absolute', left: PAD, top: VB.y, width: PANEL.w - PAD * 2, height: VB.h, boxSizing: 'border-box',
            background: '#11161d', border: `1px solid ${V.inputBorder}`, borderLeft: `5px solid ${COLORS.warn}`,
            borderRadius: 8, opacity: r(F_BOX, F_BOX + 14), transform: `translateY(${r(F_BOX, F_BOX + 14, 14, 0)}px)`,
          }}>
            <div style={{ position: 'absolute', left: 26, top: 22, display: 'flex', alignItems: 'center', width: PANEL.w - PAD * 2 - 52 }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 3, color: COLORS.warn }}>VERBATIM</span>
              <span style={{
                marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 20, color: COLORS.accent,
                border: `1px solid ${COLORS.accent}66`, background: `${COLORS.accent}1a`,
                borderRadius: RADIUS.pill, padding: '5px 16px',
                opacity: r(F_MYWORDS, F_MYWORDS + 12), transform: `translateY(${r(F_MYWORDS, F_MYWORDS + 12, 8, 0)}px)`,
              }}>in your words</span>
            </div>
            <div style={{ position: 'absolute', left: 26, top: 72, opacity: r(F_QUOTE, F_QUOTE + 12) }}>
              <Marker start={F_QUOTE + 2} color={`${COLORS.warn}26`} pad={8} radius={6}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 29, color: COLORS.d300 }}>
                  &ldquo;Sixteen seconds of downtime, twice a year, for analytics.
                </span>
              </Marker>
            </div>
            <div style={{ position: 'absolute', left: 26, top: 122, opacity: r(F_PRESERVE, F_PRESERVE + 12) }}>
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <Marker start={F_PRESERVE + 2} color={`${COLORS.warn}26`} pad={8} radius={6}>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 29, color: COLORS.d300 }}>
                    That is the whole &lsquo;you have to maintain it yourself&rsquo; horror story.&rdquo;
                  </span>
                </Marker>
                <span style={{
                  position: 'absolute', left: -8, right: -8, bottom: -12, height: 3, borderRadius: 2,
                  background: COLORS.accent, transform: `scaleX(${r(F_MYWORDS, F_MYWORDS + 12)})`, transformOrigin: 'left',
                }} />
              </span>
            </div>
          </div>

          {/* the index line it wants to add */}
          <div style={{
            position: 'absolute', left: PAD + 4, top: 342, height: 34, display: 'flex', alignItems: 'center',
            fontFamily: FONT_MONO, fontSize: 23, color: V.dim, opacity: r(F_INDEX, F_INDEX + 14),
          }}>
            INDEX.md &nbsp;+1 line&nbsp; under Knowledge
          </div>
        </div>
        )}

        {/* ---------- and then it STOPS ---------- */}
        {frame >= F_STOP && (
        <ApprovalPrompt
          x={PANEL.x} y={APPROVE_Y} w={PANEL.w}
          at={F_STOP} noteAt={F_NOTHING} waitAt={F_WAIT} approveAt={F_APPROVE}
          question="Do you want to write this to your brain?"
          note="Nothing has been written yet."
        />
        )}

        {/* ---------- what it wrote, after the approval ---------- */}
        {frame >= F_WRITE && (
        <CliStep
          y={Y_WRITE} at={F_WRITE} doneAt={F_WRITE + 6}
          tool="Write" arg={`knowledge/takes/${NOTE_ID}.md`}
          subs={[{ at: F_WRITE + 8, text: 'created', color: COLORS.signal }]}
        />
        )}
        {frame >= F_UPDATE && (
        <CliStep
          y={Y_UPDATE} at={F_UPDATE} doneAt={F_UPDATE + 6}
          tool="Update" arg="INDEX.md"
          subs={[{ at: F_UPDATE + 8, text: '+1 line under Knowledge', color: COLORS.signal }]}
        />
        )}
        {frame >= F_COMMIT && (
        <CliStep
          y={Y_COMMIT} at={F_COMMIT} doneAt={F_FILES}
          tool="Bash" arg={'git commit -m "feed: maintenance-burden-in-seconds"'}
          subs={[
            { at: F_FILES, text: '2 files changed, 34 insertions(+)' },
            { at: F_BADGE, text: '[main a3f9c21]   one commit', color: COLORS.accent, strong: true },
          ]}
        />
        )}
      </SessionScroll>

      {/* the run is finished, so the composer is back to its idle sent state */}
      <SessionComposer pasteAt={FAR} typeStart={FAR} sendAt={FAR} />
      <SidebarBrace />
    </VSCodeWindow>
  );
};
export default B5bProposal;
