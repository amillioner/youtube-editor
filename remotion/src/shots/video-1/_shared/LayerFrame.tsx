// =============================================================================
// LayerFrame — a labelled rounded frame that WRAPS whatever is inside it, used
// to show one object gaining a layer ("folder" -> "git repo" -> "GitHub repo").
// Plain component (no compositionConfig, no useCurrentFrame): pass `frame`.
//
// PROPS
//   frame      number      REQUIRED. the caller's clock.
//   at         number      frame the border animates in.
//   labelAt    number      frame the label chip animates in (default `at` + 6) —
//                          split it out when the border and the WORD land apart.
//   color      string      border + label color.
//   label      string      the label chip text (masks the border it sits on).
//   icon       ReactNode   icon inside the label chip.
//   side       'left'|'right'  which top corner the label chip sits in (default 'left').
//   pad        number      padding reserved around the children (default 46). It is
//                          ALWAYS reserved, so nothing reflows when the frame appears.
//   radius     number      corner radius (default 26).
//   rightSlot  ReactNode   optional second chip, on the OPPOSITE top corner.
//   rightAt    number      frame that second chip animates in (default `at`).
// =============================================================================
import React from 'react';
import { interpolate } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../../brand';
import { FONT_MONO } from '../../../fonts';
import { CLAMP } from '../../../lib/kit';

export const LayerFrame: React.FC<{
  frame: number;
  at: number;
  labelAt?: number;
  color: string;
  label: string;
  icon?: React.ReactNode;
  side?: 'left' | 'right';
  pad?: number;
  radius?: number;
  rightSlot?: React.ReactNode;
  rightAt?: number;
  children: React.ReactNode;
}> = ({ frame, at, labelAt, color, label, icon, side = 'left', pad = 46, radius = 26, rightSlot, rightAt, children }) => {
  const lAt = labelAt ?? at + 6;
  const op = interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const sc = interpolate(frame, [at, at + 20], [1.05, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const chipOp = interpolate(frame, [lAt, lAt + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const chipY = interpolate(frame, [lAt, lAt + 14], [10, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const rAt = rightAt ?? at;
  const rOp = interpolate(frame, [rAt, rAt + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const rSc = interpolate(frame, [rAt, rAt + 14], [0.94, 1], { ...CLAMP, easing: EASINGS.easeOut });

  const chipBase: React.CSSProperties = {
    position: 'absolute', top: -21, height: 42, boxSizing: 'border-box',
    display: 'flex', alignItems: 'center', gap: 10,
    background: COLORS.paper, boxShadow: SHADOW.soft,
    borderRadius: RADIUS.pill, padding: '0 18px',
  };

  return (
    <div style={{ position: 'relative', padding: pad }}>
      <div style={{ position: 'absolute', inset: 0, border: `2px solid ${color}`, borderRadius: radius, opacity: op, transform: `scale(${sc})` }} />
      <div style={{
        ...chipBase, [side]: 40, border: `1px solid ${color}33`,
        opacity: chipOp, transform: `translateY(${chipY}px)`,
      }}>
        {icon}
        <span style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 24, color }}>{label}</span>
      </div>
      {rightSlot && (
        <div style={{
          ...chipBase, [side === 'left' ? 'right' : 'left']: 40,
          border: `1px solid ${COLORS.signal}44`, opacity: rOp, transform: `scale(${rSc})`,
        }}>
          {rightSlot}
        </div>
      )}
      {children}
    </div>
  );
};
