import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { ThumbsUp, MessageSquare, BookOpen } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { CLAMP } from '../../lib/kit';

// ============================================================================
// EndCard · ROUND-6: NOT a cutaway — Hasan stays on camera. Transparent
// bottom-band overlay (B2BlocksTease language): the CTAs accumulate in the
// lower band, never covering the center-framed face. Runs to the master's end,
// so nothing animates out.
// Master span 618.0 -> 632.181 (14.18s). local f = round((m - 618.0) * 30).
// Cues: "smash the like" 619.3->f39 · "read the guide" 621.5->f105 ·
// "AI slop, tell me in the comments" 625.5->f225 · "see you" 630.3->f369
// ============================================================================
export const compositionConfig = {
  id: 'B15Close',
  durationInSeconds: 14.18,
  fps: 30,
  width: 1920,
  height: 1080,
  transparent: true,
};

const LIKE = 39;
const GUIDE = 105;
const SLOP = 225;
const BYE = 369;

const B15Close: React.FC = () => {
  const frame = useCurrentFrame();
  const pop = (s: number) => ({
    opacity: interpolate(frame, [s, s + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 12], [34, 0], { ...CLAMP, easing: EASINGS.overshoot })}px)`,
  });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, justifyContent: 'flex-end' }}>
      <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', gap: 16, paddingBottom: 46 }}>
        {/* smash the like */}
        <div style={{ ...pop(LIKE), display: 'flex', alignItems: 'center', gap: 13, background: COLORS.paper, border: `2px solid ${COLORS.accent}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '18px 26px' }}>
          <ThumbsUp size={34} color={COLORS.accent} strokeWidth={2.2} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 29, color: COLORS.ink, whiteSpace: 'nowrap' }}>smash the like</span>
        </div>
        {/* the guide URL */}
        <div style={{ ...pop(GUIDE), display: 'flex', alignItems: 'center', gap: 14, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderTop: `4px solid ${COLORS.accent}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '14px 24px' }}>
          <BookOpen size={30} color={COLORS.accent} strokeWidth={2.1} />
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24, color: COLORS.ink, whiteSpace: 'nowrap' }}>go read the guide it wrote</div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.accent, marginTop: 3, whiteSpace: 'nowrap' }}>learnwithhasan.com/guide/self-host-supabase</div>
          </div>
        </div>
        {/* AI slop in the comments */}
        <div style={{ ...pop(SLOP), display: 'flex', alignItems: 'center', gap: 13, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderTop: `4px solid ${COLORS.danger}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '14px 24px' }}>
          <MessageSquare size={28} color={COLORS.danger} strokeWidth={2.2} />
          <div style={{ fontSize: 21, color: COLORS.ink, lineHeight: 1.35, maxWidth: 330 }}>
            find any <b style={{ color: COLORS.danger }}>AI slop</b>? tell me in the comments. I read every one.
          </div>
        </div>
        {/* signoff */}
        <div style={{ ...pop(BYE), display: 'flex', alignItems: 'center', background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '14px 24px' }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 25, color: COLORS.ink, whiteSpace: 'nowrap' }}>
            Learn<span style={{ color: COLORS.accent }}>With</span>Hasan
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default B15Close;
