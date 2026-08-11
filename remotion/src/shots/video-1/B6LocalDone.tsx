import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { FolderGit2, PenLine, BookOpen, Check } from 'lucide-react';
import { COLORS, GRADIENT, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';

// =============================================================================
// B6 (1/2) — the checkpoint. Path A is done and he says so: you could stop here
// and still have a working brain. The card is the same object B5TwoSkills ended
// on (my-brain + the two skills), now ticked.
//
// Master span 377.196967-383.596967 (local frame = round((t - 377.196967) * 30)).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
//   (the my-brain card itself rises at f4, before the first word, so the cut
//    never opens on an empty frame; the WORDS all land on their own cues)
//   "that's the"   381.12 -> f28   headline rises (all spans hold their width,
//   "local"        381.52 -> f40   so nothing re-centers) + indigo wipe
//   "version."     381.92 -> f52
//   "It's"         382.66 -> f74   the check stamps on the card
//   "finished."    382.88 -> f81   the word lands
//   "stop"         384.49 -> f129  "You can stop right here."
//   "here"         385.45 -> f158  underline wipe
// The rest of the sentence ("...inside VS Code running locally on your machine",
// 387.38-390.73) is deliberately clean talking head.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B6LocalDone', durationInSeconds: 6.4, fps: 30, width: 1920, height: 1080 };

const F_HEAD = 28;
const F_LOCAL = 40;
const F_VERSION = 52;
const F_CHECK = 74;
const F_FINISHED = 81;
const F_STOP = 129;
const F_HERE = 158;

const CARD = { x: 560, y: 330, w: 800, h: 290 };

const B6LocalDone: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />

      {/* the headline, assembled on its own words without reflowing */}
      <div style={{
        position: 'absolute', left: 0, top: 190, width: 1920, textAlign: 'center',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 80, color: COLORS.ink,
        opacity: r(F_HEAD, F_HEAD + 14), transform: `translateY(${r(F_HEAD, F_HEAD + 14, 20, 0)}px)`,
      }}>
        <span>That&rsquo;s the </span>
        <span style={{ position: 'relative', display: 'inline-block', opacity: r(F_LOCAL, F_LOCAL + 12), color: COLORS.accent }}>
          <span style={{ position: 'absolute', left: -6, right: -6, bottom: -6, height: 8, borderRadius: 4, background: COLORS.accent, transform: `scaleX(${r(F_LOCAL + 2, F_LOCAL + 12)})`, transformOrigin: 'left' }} />
          <span style={{ position: 'relative' }}>local</span>
        </span>
        <span style={{ opacity: r(F_VERSION, F_VERSION + 12) }}> version.</span>
      </div>

      {/* what "it" is */}
      <div style={{
        position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, boxSizing: 'border-box',
        background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card,
        overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18,
        opacity: r(4, 20), transform: `translateY(${r(4, 22, 20, 0)}px)`,
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: 8, background: GRADIENT }} />
        <FolderGit2 size={54} color={COLORS.ink} strokeWidth={1.7} />
        <div style={{ fontFamily: FONT_MONO, fontSize: 38, fontWeight: 700, color: COLORS.ink }}>my-brain</div>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            { label: 'mind-feeder', Icon: PenLine, color: COLORS.accent },
            { label: 'mind-reader', Icon: BookOpen, color: COLORS.signal },
          ].map((s) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 52, padding: '0 20px', border: `1px solid ${s.color}55`, background: `${s.color}12`, borderRadius: RADIUS.pill }}>
              <s.Icon size={22} color={s.color} strokeWidth={2} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.ink }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* the tick */}
      <div style={{
        position: 'absolute', left: CARD.x + CARD.w - 62, top: CARD.y - 56, width: 118, height: 118, borderRadius: '50%',
        background: COLORS.signal, boxShadow: SHADOW.card, display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: r(F_CHECK, F_CHECK + 10), transform: `scale(${r(F_CHECK, F_CHECK + 16, 0.7, 1, EASINGS.overshoot)})`,
      }}>
        <Check size={62} color={COLORS.paper} strokeWidth={3.4} />
      </div>

      <div style={{
        position: 'absolute', left: 0, top: 656, width: 1920, textAlign: 'center',
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: COLORS.signal,
        opacity: r(F_FINISHED, F_FINISHED + 14), transform: `translateY(${r(F_FINISHED, F_FINISHED + 14, 14, 0)}px)`,
      }}>
        Finished.
      </div>

      <div style={{
        position: 'absolute', left: 0, top: 790, width: 1920, textAlign: 'center',
        fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 58, color: COLORS.muted,
        opacity: r(F_STOP, F_STOP + 14), transform: `translateY(${r(F_STOP, F_STOP + 14, 18, 0)}px)`,
      }}>
        You can{' '}
        <span style={{ position: 'relative', display: 'inline-block', color: COLORS.ink }}>
          <span style={{ position: 'absolute', left: -6, right: -6, bottom: -8, height: 6, borderRadius: 3, background: COLORS.accent, transform: `scaleX(${r(F_HERE, F_HERE + 10)})`, transformOrigin: 'left' }} />
          <span style={{ position: 'relative' }}>stop right here.</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};
export default B6LocalDone;
