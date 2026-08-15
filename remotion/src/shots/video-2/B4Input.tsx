import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_MONO, FONT_BODY } from '../../fonts';
import { CLAMP, VSC } from '../../lib/kit';
import { AgentFeed, ClaudeEmptyState, ClaudeInputDock, ClaudeUserBubble, ClaudeWordmark, FactoryWindow, PromptHighlight } from './_shared/FactoryVSCode';
import { FactoryLine } from './_shared/FactoryLine';

// ============================================================================
// B4 · one line in — ROUND-5 rebuild: the SAME conversational style as
// ColdOpenPrompt, prompt text = his spoken phrases ("self-host supabase, focus
// on the hard parts nobody documents, and run it on a real server" + "use the
// content-factory"). Struck chips kept. On "already knows all the stages" the
// 9-stage rail is REPLACED by the illustrated factory assembling/powering on
// across the bottom band; the prompt drops onto the belt as the PIECE.md token.
// Master span 255.9 -> 276.4 (20.5s). local f = round((master_s - 255.9) * 30).
// Cues: "here's the input" 256.69->f24 · prompt read 259.61-265.84 (typing
// f100-f298) · "That's it." 266.563->f320 (send) · "no prompt engineering"
// 267.686->f354 · "no outline" 269.129->f397 · "nothing" 270.010->f423 ·
// "content factory" 273.30->f522 (bubble highlight sweep) · "already knows all
// the stages" 274.56->f560 (factory assembles f546+, stations light f556-586,
// piece drops f598)
// ============================================================================
export const compositionConfig = { id: 'B4Input', durationInSeconds: 20.5, fps: 30, width: 1920, height: 1080 };

const PRE = 'self-host supabase, focus on the hard parts\nnobody documents, and run it on a real server\nuse the ';
const CF = 'content-factory';
const TYPE_START = 100;
const TYPE_END = 298;
const SEND = 320;
const HIGHLIGHT = 522;
const ASSEMBLE = 546;
const DROP = 598;

const NOT_CHIPS: readonly (readonly [string, number])[] = [
  ['no prompt engineering', 354],
  ['no outline', 397],
  ['nothing', 423],
];

const CC = { border: '#3a3a3a', muted: '#8b8b8b', panel: '#242424' } as const;

const B4Input: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (s: number, dy = 12) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  const total = PRE.length + CF.length;
  const typedN = Math.floor(interpolate(frame, [TYPE_START, TYPE_END], [0, total], { ...CLAMP, easing: EASINGS.easeInOut }));
  const typedPre = PRE.slice(0, Math.min(typedN, PRE.length));
  const typedCF = CF.slice(0, Math.max(0, typedN - PRE.length));
  const sent = frame >= SEND;
  const cursorOn = Math.floor(frame / 15) % 2 === 0 && !sent;
  const emptyOp = 1 - interpolate(frame, [SEND - 4, SEND + 8], [0, 1], CLAMP);
  const typedNode = typedN > 0 ? <>{typedPre}{typedCF}</> : '';
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, background: '#000' }}>
      <FactoryWindow groups={[{ x: VSC.ED_X, w: VSC.ED_W, tab: { label: 'Claude Code', icon: 'claude' }, breadcrumb: ['Claude Code'] }]}>
        <ClaudeWordmark x={VSC.ED_X} w={VSC.ED_W} top={130} />
        {emptyOp > 0 && <ClaudeEmptyState x={VSC.ED_X} w={VSC.ED_W} top={400} opacity={emptyOp} />}
        {sent && (
          <>
            <ClaudeUserBubble x={VSC.ED_X} w={VSC.ED_W} top={200} size={22}
              text={<>{PRE}<PromptHighlight at={HIGHLIGHT}>{CF}</PromptHighlight></>} at={SEND + 2} />
            <AgentFeed
              lines={[[SEND + 10, 'tool', 'Skill(content-factory) — the contract: 9 stages, S1 Brain → S9 Seed']]}
              x={VSC.ED_X + 40} w={VSC.ED_W - 80} top={445} size={22}
              spinner={{ label: 'Booting the factory…', from: SEND + 16 }}
            />
            {/* what the input is NOT (struck through, on each word) */}
            <div style={{ position: 'absolute', left: VSC.ED_X, width: VSC.ED_W, top: 556, display: 'flex', justifyContent: 'center', gap: 16 }}>
              {NOT_CHIPS.map(([label, s]) => (
                <span key={label} style={{ ...at(s), fontFamily: FONT_MONO, fontSize: 23, color: CC.muted, background: CC.panel, border: `1px solid ${CC.border}`, padding: '10px 22px', borderRadius: RADIUS.pill, textDecoration: 'line-through', textDecorationColor: COLORS.danger, textDecorationThickness: 3 }}>
                  {label}
                </span>
              ))}
            </div>
          </>
        )}
        <ClaudeInputDock x={VSC.ED_X + 170} w={VSC.ED_W - 340} typed={typedNode} sent={sent} cursorOn={cursorOn} bottom={40} />
      </FactoryWindow>
      {/* "already knows all the stages" — the machine assembles, the prompt becomes the piece */}
      <FactoryLine station={-1} pieceFrom={-1} assembleAt={ASSEMBLE} dropAt={DROP} />
    </AbsoluteFill>
  );
};

export default B4Input;
