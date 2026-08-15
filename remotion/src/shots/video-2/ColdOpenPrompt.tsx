import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { EASINGS } from '../../brand';
import { FONT_BODY } from '../../fonts';
import { CLAMP, V, VSC } from '../../lib/kit';
import { AgentFeed, ClaudeEmptyState, ClaudeInputDock, ClaudeUserBubble, ClaudeWordmark, FactoryWindow, PromptHighlight } from './_shared/FactoryVSCode';

// ============================================================================
// ColdOpen 0/3 · the video OPENS on the screen, not the camera: a simple,
// conversational 2-line prompt typed into Claude Code inside VS Code
// (round-2 note), with "content-factory" highlighted on its narration cue.
// ROUND-7: Hasan stays on camera in a CIRCLE pip top-right of the empty
// welcome area — rendered as a transparent .mov that is opaque EVERYWHERE
// except a circular alpha hole (center 1755,313 · r135) with a coral ring;
// bake.py "split" places the square-cropped master behind it (master_box
// 1605,163,300,300 · crop zoom 1.5 for a face closeup). The hole grows in at
// 0.0 and closes cleanly before the montage cut at 10.2.
// Master span 0.0 -> 10.2 (10.2s). local f = round(master_s * 30).
// Cues: "A simple 2-line prompt" 1.23->f37 (typing starts) · typing done f200 ·
// "content factory" 7.39->f222 (highlight sweep) · "Let's run." 9.17->f275
// (send) · spinner f287 · hard cut to the montage at 10.2.
// ============================================================================
export const compositionConfig = { id: 'ColdOpenPrompt', durationInSeconds: 10.2, fps: 30, width: 1920, height: 1080, transparent: true };

// the face pip: a circular hole in this shot's alpha (the master shows through)
const PIP = { cx: 1755, cy: 313, r: 135 } as const;

const PRE = 'create a full guide on self hosting supabase\nusing the ';
const CF = 'content-factory';
const TYPE_START = 38;
const TYPE_END = 200;
const HIGHLIGHT = 222;
const SEND = 275;

const ColdOpenPrompt: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 8], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const total = PRE.length + CF.length;
  const typedN = Math.floor(interpolate(frame, [TYPE_START, TYPE_END], [0, total], { ...CLAMP, easing: EASINGS.easeInOut }));
  const typedPre = PRE.slice(0, Math.min(typedN, PRE.length));
  const typedCF = CF.slice(0, Math.max(0, typedN - PRE.length));
  const sent = frame >= SEND;
  const cursorOn = Math.floor(frame / 15) % 2 === 0 && !sent;
  const emptyOp = 1 - interpolate(frame, [SEND - 4, SEND + 8], [0, 1], CLAMP);
  const typedNode = typedN > 0 ? (
    <>{typedPre}{typedCF && <PromptHighlight at={HIGHLIGHT}>{typedCF}</PromptHighlight>}</>
  ) : '';
  // circle pip: hole radius grows in at 0.0, closes ON the send (f262-275) so
  // the ring never overlaps the sent bubble that lands top-right after SEND
  const rIn = interpolate(frame, [0, 14], [0, PIP.r], { ...CLAMP, easing: EASINGS.easeOut });
  const rClose = interpolate(frame, [262, 275], [1, 0], { ...CLAMP, easing: EASINGS.easeInOut });
  const r = rIn * rClose;
  const mask = `radial-gradient(circle at ${PIP.cx}px ${PIP.cy}px, rgba(0,0,0,0) ${Math.max(0, r - 1.5)}px, #000 ${r}px)`;
  const ringPop = interpolate(frame, [2, 16], [0.85, 1], { ...CLAMP, easing: EASINGS.overshoot });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ fontFamily: FONT_BODY, background: '#000', WebkitMaskImage: mask, maskImage: mask }}>
        <AbsoluteFill style={{ opacity: fade }}>
          <FactoryWindow groups={[{ x: VSC.ED_X, w: VSC.ED_W, tab: { label: 'Claude Code', icon: 'claude' }, breadcrumb: ['Claude Code'] }]}>
            <ClaudeWordmark x={VSC.ED_X} w={VSC.ED_W} top={160} />
            {emptyOp > 0 && <ClaudeEmptyState x={VSC.ED_X} w={VSC.ED_W} top={430} opacity={emptyOp} />}
            {/* on send the input becomes the transcript message + the run starts */}
            {sent && (
              <>
                <ClaudeUserBubble x={VSC.ED_X} w={VSC.ED_W} top={250} size={24}
                  text={<>{PRE}<PromptHighlight>{CF}</PromptHighlight></>} at={SEND + 2} />
                <AgentFeed
                  lines={[[SEND + 9, 'tool', 'Skill(content-factory) — 9 stages, S1 Brain → S9 Seed']]}
                  x={VSC.ED_X + 40} w={VSC.ED_W - 80} top={475} size={22}
                  spinner={{ label: 'Booting the factory…', from: SEND + 14 }}
                />
              </>
            )}
            <ClaudeInputDock x={VSC.ED_X + 170} w={VSC.ED_W - 340} typed={typedNode} sent={sent} cursorOn={cursorOn} bottom={40} />
          </FactoryWindow>
        </AbsoluteFill>
      </AbsoluteFill>
      {/* the styled ring riding the hole edge (drawn OVER the alpha hole) */}
      {r > 1 && (
        <div style={{
          position: 'absolute', left: PIP.cx - r - 4, top: PIP.cy - r - 4,
          width: 2 * r, height: 2 * r, borderRadius: '50%',
          border: `4px solid ${V.coral}`, transform: `scale(${ringPop})`,
          boxShadow: `0 0 0 7px ${V.coral}2e, 0 16px 46px rgba(0,0,0,0.5)`,
        }} />
      )}
    </AbsoluteFill>
  );
};

export default ColdOpenPrompt;
