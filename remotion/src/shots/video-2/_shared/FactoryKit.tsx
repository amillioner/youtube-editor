// video-2 shared kit — the five factory blocks (no compositionConfig: not a shot).
// The block row is the video's skeleton: it debuts in B3FiveBlocks and returns as a
// progress spine in later beats (recon/lab/hands/brain), so the meta lives here once.
import React from 'react';
import { interpolate } from 'remotion';
import { ScrollText, Radar, MousePointerClick, FlaskConical, Brain } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../../brand';
import { FONT_DISPLAY, FONT_MONO } from '../../../fonts';
import { CLAMP } from '../../../lib/kit';

export type FactoryBlock = {
  n: number;
  name: string;
  sub: string; // what the narration names it as (revealed on its own cue)
  color: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
};

export const BLOCKS: readonly FactoryBlock[] = [
  { n: 1, name: 'The contract', sub: 'Claude skills', color: COLORS.accent2, Icon: ScrollText },
  { n: 2, name: 'The senses', sub: 'keyword + search data', color: COLORS.signal, Icon: Radar },
  { n: 3, name: 'The hands', sub: 'a real browser', color: COLORS.warn, Icon: MousePointerClick },
  { n: 4, name: 'The lab', sub: 'a real server', color: COLORS.danger, Icon: FlaskConical },
  { n: 5, name: 'The brain', sub: 'my brain', color: COLORS.accent, Icon: Brain },
] as const;

export const CARD_W = 330;
export const CARD_H = 440;

type Cue = readonly [label: string, at: number];

export const FactoryCard: React.FC<{
  frame: number;
  block: FactoryBlock;
  shellAt: number;
  nameAt: number;
  subAt: number;
  chips?: readonly Cue[];
  tag?: Cue; // small pill above the card ("the most important")
  caption?: Cue; // accent line at the card foot
  activeFrom: number;
  activeTo: number;
}> = ({ frame, block, shellAt, nameAt, subAt, chips = [], tag, caption, activeFrom, activeTo }) => {
  const { Icon } = block;
  const ease = { ...CLAMP, easing: EASINGS.easeOut };
  const shellOp = interpolate(frame, [shellAt, shellAt + 14], [0, 1], ease);
  const shellY = interpolate(frame, [shellAt, shellAt + 14], [26, 0], ease);
  // active emphasis: colored border + slight scale while narration is on this block
  const heat = interpolate(frame, [activeFrom, activeFrom + 10, activeTo, activeTo + 12], [0, 1, 1, 0], CLAMP);
  const at = (s: number, dy = 14) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], ease),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], ease)}px)`,
  });
  return (
    <div style={{ position: 'relative', width: CARD_W }}>
      {tag && (
        <div style={{ ...at(tag[1], 8), position: 'absolute', top: -46, left: 0, right: 0, textAlign: 'center' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 19, letterSpacing: 1.5, color: block.color, background: `${block.color}1f`, padding: '7px 16px', borderRadius: RADIUS.pill }}>{tag[0]}</span>
        </div>
      )}
      <div
        style={{
          opacity: shellOp,
          transform: `translateY(${shellY}px) scale(${1 + 0.02 * heat})`,
          width: CARD_W,
          height: CARD_H,
          boxSizing: 'border-box',
          padding: '26px 24px',
          background: COLORS.paper,
          border: `2px solid ${heat > 0.5 ? block.color : COLORS.line}`,
          borderRadius: RADIUS.card,
          boxShadow: heat > 0.5 ? `0 12px 44px ${block.color}33` : SHADOW.card,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: RADIUS.pill, background: `${block.color}22`, color: block.color, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{block.n}</div>
          <div style={{ flex: 1 }} />
          <div style={at(nameAt, 8)}><Icon size={34} color={block.color} strokeWidth={2.1} /></div>
        </div>
        <div style={{ ...at(nameAt), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 33, color: COLORS.ink, marginTop: 18 }}>{block.name}</div>
        <div style={{ ...at(subAt), fontFamily: FONT_MONO, fontSize: 20, color: block.color, marginTop: 8 }}>{block.sub}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
          {chips.map(([label, cueAt]) => (
            <span key={label} style={{ ...at(cueAt, 10), fontSize: 20, color: COLORS.ink, background: COLORS.cream, border: `1px solid ${COLORS.line}`, padding: '6px 13px', borderRadius: RADIUS.pill }}>{label}</span>
          ))}
        </div>
        {caption && (
          <div style={{ ...at(caption[1]), marginTop: 'auto', fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 21, color: block.color }}>{caption[0]}</div>
        )}
      </div>
    </div>
  );
};
