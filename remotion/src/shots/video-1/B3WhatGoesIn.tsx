import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { User, PenLine, Boxes, Quote, BookOpen, Lightbulb, GraduationCap, Lock } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';
import { GithubMark } from './_shared/marks';
import { LayerFrame } from './_shared/LayerFrame';

// =============================================================================
// B3.2 — what goes in it. The narration genuinely ENUMERATES, so the list builds
// item by item across the real 12s span, then the whole thing gets wrapped by
// the private GitHub repo it lives in.
// Master span 214.432167–227.432167. Local frame = round((master - 214.432167) * 30).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Cues: "Who you are" 215.84->f7 · "how you write" 216.74->f34 · "projects"
// 218.26->f80 · "takes" 219.29->f111 · "stories" 220.50->f147 · "lessons"
// 221.53->f178 · "education" 222.39->f204 · "everything about you" 223.61->f240 ·
// "inside" 224.97->f281 · "private" 226.03->f313 · "GitHub repo" 226.91->f339.
// =============================================================================
export const compositionConfig = { id: 'B3WhatGoesIn', durationInSeconds: 13, fps: 30, width: 1920, height: 1080 };

const EVERYTHING_AT = 240;
const INSIDE_AT = 281;
const PRIVATE_AT = 313;
const REPO_AT = 339;

// icon color follows the REAL folder it lives in: identity / projects / knowledge
const ITEMS = [
  { label: 'Who you are', path: 'identity/core.md', Icon: User, color: COLORS.accent, at: 7 },
  { label: 'How you write', path: 'identity/voice.md', Icon: PenLine, color: COLORS.accent, at: 34 },
  { label: 'Your projects', path: 'projects/', Icon: Boxes, color: COLORS.signal, at: 80 },
  { label: 'Your takes', path: 'knowledge/takes/', Icon: Quote, color: COLORS.accent2, at: 111 },
  { label: 'Your stories', path: 'knowledge/stories/', Icon: BookOpen, color: COLORS.accent2, at: 147 },
  { label: 'The lessons', path: 'knowledge/lessons/', Icon: Lightbulb, color: COLORS.accent2, at: 178 },
  { label: 'Your education', path: 'knowledge/facts/', Icon: GraduationCap, color: COLORS.accent2, at: 204 },
];

const B3WhatGoesIn: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent2} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(4, 14), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 5, color: COLORS.muted, marginBottom: 36 }}>
          WHAT&nbsp;GOES&nbsp;IN&nbsp;IT
        </div>

        <LayerFrame
          frame={frame} at={INSIDE_AT} labelAt={REPO_AT} color={COLORS.accent} label="GitHub repo" pad={52} radius={30}
          icon={<GithubMark size={24} color={COLORS.accent} />}
          rightAt={PRIVATE_AT}
          rightSlot={(
            <>
              <Lock size={20} color={COLORS.signal} strokeWidth={2.4} />
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, color: COLORS.ink }}>Private</span>
            </>
          )}
        >
          <div style={{ width: 1502, display: 'flex', flexWrap: 'wrap', gap: 26, justifyContent: 'center' }}>
            {ITEMS.map((it) => {
              const op = interpolate(frame, [it.at, it.at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
              const y = interpolate(frame, [it.at, it.at + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
              const { Icon } = it;
              return (
                <div
                  key={it.label}
                  style={{
                    width: 356, boxSizing: 'border-box', padding: '22px 26px',
                    display: 'flex', flexDirection: 'column', gap: 10,
                    background: COLORS.paper, border: `1px solid ${COLORS.line}`,
                    borderRadius: RADIUS.card, boxShadow: SHADOW.card,
                    opacity: op, transform: `translateY(${y}px)`,
                  }}
                >
                  <Icon size={30} color={it.color} strokeWidth={2} />
                  <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 32, color: COLORS.ink }}>{it.label}</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 19, color: COLORS.muted }}>{it.path}</span>
                </div>
              );
            })}
          </div>

          <div style={{ ...rise(EVERYTHING_AT, 16), marginTop: 34, textAlign: 'center', fontSize: 36, color: COLORS.muted }}>
            everything about you, in plain text
          </div>
        </LayerFrame>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default B3WhatGoesIn;
