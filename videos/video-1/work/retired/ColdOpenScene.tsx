import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { MessageCircle, Repeat2, Heart, BarChart3, Mail, AtSign } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../../fonts';
import { BrandBg, CLAMP, Sunburst } from '../../../lib/kit';

// =============================================================================
// R1 cold-open scene (shared by the variants Hasan is choosing between).
//
// The post card is laid out at EXACTLY the geometry B1ReplyCompare opens on
// (left 50%, top 360, width 1160, scale 1) so the handoff at 13.20 is invisible:
// see B1ReplyCompare.tsx CARD_TOP / postTop / the 1160-wide post block.
// Everything else lives BELOW it and retires before the handoff.
//
// Cue frames are passed in per variant because each variant sits on a different
// stretch of narration. No file here owns a compositionConfig, so gen-registry
// skips it (it only registers files that export one).
// =============================================================================

export type ColdOpenCues = {
  postAt: number;   // the X post card rises
  agentAt: number;  // the agent node appears
  xAt: number;      // the X-posts branch draws
  mailAt: number;   // the emails branch draws
  settleAt: number; // branches retire, leaving only the post
};

const POST_TOP = 360;
const POST_W = 1160;
// The post card bottoms out around y=660, so the whole agent rig hangs BELOW it and the
// branches drop DOWNWARD. (First cut ran the branches upward and the chips landed on top
// of the post card's metrics row.)
const AGENT_TOP = 726;
const AGENT_H = 80;
const AGENT_BOT = AGENT_TOP + AGENT_H;
const LINK = 74;
const CHIP_TOP = AGENT_BOT + LINK;

const Avatar: React.FC<{ initials: string; size: number; from: string; to: string }> = ({
  initials, size, from, to,
}) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: `linear-gradient(135deg, ${from}, ${to})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size * 0.42, color: COLORS.paper,
  }}>{initials}</div>
);

const Branch: React.FC<{
  label: string; Icon: LucideIcon;
  x: number; draw: number; color: string;
}> = ({ label, Icon, x, draw, color }) => {
  // a lead dropping out of the agent node down to its destination chip
  return (
    <>
      <div style={{
        position: 'absolute', left: x, top: AGENT_BOT, width: 2,
        height: LINK * draw, background: color, opacity: 0.55,
      }} />
      <div style={{
        position: 'absolute', left: x - 132, top: CHIP_TOP,
        width: 264, opacity: draw, transform: `translateY(${(1 - draw) * 14}px)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        background: COLORS.paper, border: `1px solid ${COLORS.line}`,
        borderRadius: RADIUS.pill, boxShadow: SHADOW.soft, padding: '13px 0',
      }}>
        <Icon size={26} color={color} strokeWidth={2.1} />
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 29, color: COLORS.ink }}>
          {label}
        </span>
      </div>
    </>
  );
};

export const ColdOpenScene: React.FC<{ cues: ColdOpenCues }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const postOp = r(cues.postAt, cues.postAt + 14);
  const postY = r(cues.postAt, cues.postAt + 14, 26, 0);

  // everything below the post retires before the handoff
  const retire = r(cues.settleAt, cues.settleAt + 16);
  const rigOp = r(cues.agentAt, cues.agentAt + 14) * (1 - retire);
  const rigY = r(cues.agentAt, cues.agentAt + 14, 22, 0) + retire * 18;
  const xDraw = r(cues.xAt, cues.xAt + 16, 0, 1, EASINGS.easeInOut);
  const mailDraw = r(cues.mailAt, cues.mailAt + 16, 0, 1, EASINGS.easeInOut);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      {/* ---- the X post, at B1ReplyCompare's exact opening geometry ---- */}
      <div style={{
        position: 'absolute', left: '50%', top: POST_TOP, width: POST_W,
        transform: 'translateX(-50%)', transformOrigin: 'top center',
      }}>
        <div style={{
          background: COLORS.paper, border: `1px solid ${COLORS.line}`,
          borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '28px 38px 24px',
          opacity: postOp, transform: `translateY(${postY}px)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar initials="SN" size={62} from={COLORS.accent2} to={COLORS.accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 31, color: COLORS.ink }}>
                Startup Notes
              </div>
              <div style={{ fontSize: 25, color: COLORS.muted }}>@startupnotes · 2h</div>
            </div>
            <div style={{
              fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 2, color: COLORS.muted,
              border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill, padding: '7px 18px',
            }}>THE&nbsp;POST</div>
          </div>
          <div style={{ fontSize: 36, lineHeight: 1.42, color: COLORS.ink, marginTop: 18 }}>
            Self hosting sounds cheap until it breaks at 3am. Managed cloud costs more, but at
            least you sleep. Change my mind.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 78, marginTop: 20, color: COLORS.muted }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 23 }}>
              <MessageCircle size={23} strokeWidth={1.9} /> 412
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 23 }}>
              <Repeat2 size={23} strokeWidth={1.9} /> 96
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 23 }}>
              <Heart size={23} strokeWidth={1.9} /> 1.8K
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 23 }}>
              <BarChart3 size={23} strokeWidth={1.9} /> 74K
            </span>
          </div>
        </div>
      </div>

      {/* ---- the branches (drawn before the node so the node caps them) ---- */}
      <div style={{ opacity: rigOp, transform: `translateY(${rigY}px)` }}>
        <Branch label="my X posts" Icon={AtSign} x={706} draw={xDraw} color={COLORS.accent} />
        <Branch label="my emails" Icon={Mail} x={1214} draw={mailDraw} color={COLORS.accent2} />

        {/* ---- the agent node ---- */}
        <div style={{
          position: 'absolute', left: '50%', top: AGENT_TOP, transform: 'translateX(-50%)',
          height: AGENT_H, boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', gap: 20,
          background: COLORS.paper, border: `1px solid ${COLORS.line}`,
          borderRadius: RADIUS.pill, boxShadow: SHADOW.card, padding: '0 40px',
        }}>
          <Sunburst size={34} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 44, color: COLORS.ink }}>
            AI agent
          </span>
          <span style={{ width: 1, height: 38, background: COLORS.line }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 25, letterSpacing: 2, color: COLORS.muted }}>
            REPLIES&nbsp;AS&nbsp;ME
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
