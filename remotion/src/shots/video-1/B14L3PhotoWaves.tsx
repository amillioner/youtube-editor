import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { PhoneCall, User, Image as ImageIcon, AudioLines } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg } from '../../lib/kit';
import { GithubMark } from './_shared/marks';
import { BrainRepoCard, Connector, LevelRail, SimTag, Waveform, r } from './B14Kit';

// =============================================================================
// B14 · LEVEL 3 — a face on the voice. Master span 827.596967 -> 833.596967 (6.00s).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Local frame = round((master - 827.596967) * 30).
//   "Level up,"              830.68 -> f2    the call UI clears out of the card
//   "add a photo"            831.88 -> f38   a REAL still of him drops in (f44)
//   "audio waves,"           833.49 -> f87   the waveform arrives and goes live
//   "things become"          834.85 -> f128  headline
//   "really interesting."    835.51 -> f147  emphasis wipe
// The photo is a genuine frame lifted out of the master cut (862.30) with
// ffmpeg, so the likeness is his and nothing was generated for this level.
// Card geometry is unchanged from level 2b: same card, new contents.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B14L3PhotoWaves', durationInSeconds: 6, fps: 30, width: 1920, height: 1080 };

const F_CLEAR = 2;
const F_PHOTO = 44;
const F_WAVES = 87;
const F_HEAD = 128;
const F_INTEREST = 147;

const CARD = { x: 380, y: 402, w: 1160, h: 384 };

const B14L3PhotoWaves: React.FC = () => {
  const frame = useCurrentFrame();

  const oldOp = 1 - r(frame, F_CLEAR, F_CLEAR + 12, 0, 1, EASINGS.easeIn);
  const photoOp = r(frame, F_PHOTO, F_PHOTO + 14);
  const photoSc = r(frame, F_PHOTO, F_PHOTO + 20, 0.94, 1);
  const wavesOp = r(frame, F_WAVES, F_WAVES + 12);
  const headOp = r(frame, F_HEAD, F_HEAD + 14);
  const headY = r(frame, F_HEAD, F_HEAD + 14, 24, 0);
  const wipe = r(frame, F_INTEREST, F_INTEREST + 12);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />

      <SimTag frame={frame} at={-30} />
      <BrainRepoCard frame={frame} at={-30} />
      <Connector frame={frame} at={-30} x={960} y1={358} y2={CARD.y} color={COLORS.accent} />

      <div style={{
        position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h,
        borderRadius: RADIUS.card, overflow: 'hidden',
        background: COLORS.paper, border: `2px solid ${COLORS.accent}`, boxShadow: SHADOW.card,
      }}>
        {/* what level 2b left behind, clearing on "Level up," */}
        <div style={{ position: 'absolute', inset: 0, opacity: oldOp }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 30px 0' }}>
            <PhoneCall size={28} color={COLORS.accent} strokeWidth={2.3} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 25, letterSpacing: 2, color: COLORS.muted }}>VOICE CALL</span>
          </div>
          <div style={{ position: 'absolute', left: 60, top: 118, width: 200, textAlign: 'center' }}>
            <div style={{ width: 132, height: 132, margin: '0 auto', borderRadius: '50%', background: `${COLORS.ink}12`, border: `2px solid ${COLORS.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={62} color={COLORS.ink} strokeWidth={1.9} />
            </div>
          </div>
          <div style={{ position: 'absolute', right: 60, top: 118, width: 200, textAlign: 'center' }}>
            <div style={{ width: 132, height: 132, margin: '0 auto', borderRadius: '50%', background: `${COLORS.accent}12`, border: `2px solid ${COLORS.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GithubMark size={60} color={COLORS.accent} />
            </div>
          </div>
        </div>

        {/* the photo */}
        <div style={{
          position: 'absolute', left: 42, top: 42, width: 300, height: 300,
          borderRadius: RADIUS.card, overflow: 'hidden',
          border: `2px solid ${COLORS.accent}`, boxShadow: SHADOW.soft,
          opacity: photoOp, transform: `scale(${photoSc})`,
        }}>
          <Img src={staticFile('projects/video-1/l3-photo.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* labels + waves */}
        <div style={{ position: 'absolute', left: 390, top: 52, display: 'flex', alignItems: 'center', gap: 14, opacity: photoOp }}>
          <ImageIcon size={30} color={COLORS.accent} strokeWidth={2.1} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink }}>a photo</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 23, color: COLORS.muted, marginLeft: 8 }}>still image</span>
        </div>

        <div style={{ position: 'absolute', left: 390, top: 126, display: 'flex', alignItems: 'center', gap: 14, opacity: wavesOp }}>
          <AudioLines size={28} color={COLORS.accent2} strokeWidth={2.1} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 2, color: COLORS.accent2 }}>AUDIO WAVES</span>
        </div>
        <div style={{ opacity: wavesOp }}>
          <Waveform frame={frame} at={F_WAVES} liveAt={F_WAVES} x={390} y={190} w={700} h={140} bars={38} color={COLORS.accent2} />
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, top: 826, width: 1920, textAlign: 'center',
        opacity: headOp, transform: `translateY(${headY}px)`,
      }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 70, color: COLORS.ink }}>
          A face on the voice. Now it gets{' '}
          <span style={{ position: 'relative', display: 'inline-block', color: COLORS.accent }}>
            <span style={{ position: 'absolute', left: -6, right: -6, bottom: -8, height: 7, borderRadius: 4, background: COLORS.accent, transform: `scaleX(${wipe})`, transformOrigin: 'left' }} />
            <span style={{ position: 'relative' }}>interesting.</span>
          </span>
        </span>
      </div>

      <LevelRail
        frame={frame}
        at={-30}
        slots={[
          { n: 1, label: 'voice', at: -30 },
          { n: 2, label: 'voice clone', at: -30 },
          { n: 3, label: 'photo', at: F_PHOTO },
        ]}
      />
    </AbsoluteFill>
  );
};
export default B14L3PhotoWaves;
