import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  AbsoluteFill,
  Sequence,
  Audio,
  OffthreadVideo,
  Img,
  staticFile,
} from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW, GRADIENT } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';

// =============================================================================
// COMPOSITION CONFIG
// =============================================================================
export const compositionConfig = {
  id: 'ShortAiTest',
  durationInSeconds: 39.1,
  fps: 30,
  width: 1080,
  height: 1920,
};

// =============================================================================
// STYLE CONSTANTS
// =============================================================================
export const P = (name: string) => staticFile(`projects/short-ai-test/${name}`);

// =============================================================================
// PRE-GENERATED DATA (computed once at module level, NOT during render)
// =============================================================================
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
};
const WAVE = Array.from({ length: 26 }, (_, i) => 0.2 + 0.8 * seededRandom(i * 7 + 3));

// Beat timeline. cam durations = clip length in frames (measured from the mp4s);
// tsx durations = VO length + breathing room.
type Beat = {
  id: string;
  kind: 'cam' | 'tsx';
  dur: number; // frames @30fps
  caption?: string;
};
const BEATS: Beat[] = [
  { id: 'b1', kind: 'cam', dur: 93, caption: "The person talking to you right now… doesn't exist." },
  { id: 'b2', kind: 'tsx', dur: 98 },
  { id: 'b3', kind: 'cam', dur: 107, caption: 'I never recorded this. Not the video. Not even the voice.' },
  { id: 'b4', kind: 'tsx', dur: 238 },
  { id: 'b5', kind: 'cam', dur: 102, caption: 'An AI is reading this script, with my voice… right now.' },
  { id: 'b6', kind: 'tsx', dur: 141 },
  { id: 'b7', kind: 'cam', dur: 54, caption: "Two dollars. And you can't tell." },
  { id: 'b8', kind: 'tsx', dur: 158 },
  { id: 'b9', kind: 'cam', dur: 107, caption: 'Watch it again… and find the glitch.' },
  { id: 'end', kind: 'tsx', dur: 75 },
];
const FROM: number[] = [];
BEATS.reduce((acc, b, i) => { FROM[i] = acc; return acc + b.dur; }, 0);

// =============================================================================
// SHARED PIECES
// =============================================================================
const Chip: React.FC<{ children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }> = ({ children, dark, style }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 28px',
      borderRadius: RADIUS.pill,
      background: dark ? COLORS.d800 : COLORS.paper,
      border: `1px solid ${dark ? COLORS.d600 : COLORS.line}`,
      color: dark ? COLORS.d300 : COLORS.ink,
      fontFamily: FONT_MONO,
      fontSize: 30,
      fontWeight: 500,
      boxShadow: SHADOW.soft,
      ...style,
    }}
  >
    {children}
  </div>
);

// Caption chip over the cam clips, bottom band, one calm fade+rise.
const CamCaption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [4, 18], [0, 1], { easing: EASINGS.easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        left: '5%',
        right: '5%',
        bottom: '17%',
        display: 'flex',
        justifyContent: 'center',
        opacity: t,
        transform: `translateY(${24 * (1 - t)}px)`,
      }}
    >
      <div
        style={{
          background: 'rgba(13,17,23,0.82)',
          border: `1px solid ${COLORS.d600}`,
          borderRadius: 20,
          padding: '20px 30px',
          color: '#ffffff',
          fontFamily: FONT_BODY,
          fontSize: 40,
          fontWeight: 600,
          lineHeight: 1.3,
          textAlign: 'center',
          maxWidth: '92%',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const CamBeat: React.FC<{ src: string; caption?: string }> = ({ src, caption }) => (
  <AbsoluteFill style={{ backgroundColor: COLORS.d900 }}>
    <OffthreadVideo src={P(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    {caption ? <CamCaption text={caption} /> : null}
  </AbsoluteFill>
);

// =============================================================================
// B2 — "one photo + my voice" (dark, scan pass over the source photo)
// =============================================================================
export const PhotoBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const slam = interpolate(frame, [0, 10], [0, 1], { easing: EASINGS.overshoot, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scanY = interpolate(frame, [12, 70], [0, 1], { easing: EASINGS.easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const chip1 = interpolate(frame, [16, 28], [0, 1], { easing: EASINGS.easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const chip2 = interpolate(frame, [52, 64], [0, 1], { easing: EASINGS.easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const CARD_W = 620;
  const CARD_H = 1100;
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          position: 'relative',
          width: CARD_W,
          height: CARD_H,
          borderRadius: RADIUS.card,
          overflow: 'hidden',
          border: `1px solid ${COLORS.d600}`,
          boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
          transform: `scale(${0.7 + 0.3 * slam}) rotate(${-3 * (1 - slam)}deg)`,
          opacity: slam,
        }}
      >
        <Img src={P('ref-vertical.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        {/* scan line sweeping down the photo */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: `${scanY * 100}%`,
            height: 5,
            background: GRADIENT,
            boxShadow: `0 0 34px 8px rgba(99,102,241,0.65)`,
            opacity: scanY > 0 && scanY < 1 ? 1 : 0,
          }}
        />
        {/* scanned region tint */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: `${scanY * 100}%`,
            background: 'rgba(99,102,241,0.10)',
          }}
        />
      </div>
      <div style={{ position: 'absolute', top: '12%', left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: chip1, transform: `translateY(${20 * (1 - chip1)}px)` }}>
        <Chip dark>
          <span style={{ color: COLORS.accent }}>input</span> 1 photo of me
        </Chip>
      </div>
      <div style={{ position: 'absolute', bottom: '13%', left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: chip2, transform: `translateY(${20 * (1 - chip2)}px)` }}>
        <Chip dark>
          <span style={{ color: COLORS.signal }}>+</span> my voice, cloned by AI
        </Chip>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// B4 — pipeline: photo + audio -> model -> me, talking (light, vertical flow)
// =============================================================================
export const PipelineBeat: React.FC = () => {
  const frame = useCurrentFrame();
  // narration sync (~30fps): "a model takes that photo"(0-45) "and the audio"(45-80)
  // "generates me. Talking."(~95-150) "Blinks, gestures, everything."(~155-235)
  const rise = (start: number, len = 14) =>
    interpolate(frame, [start, start + len], [0, 1], { easing: EASINGS.easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const photoIn = rise(2);
  const audioIn = rise(45);
  const modelIn = rise(84);
  const outIn = rise(108);
  const tags = ['blinks', 'gestures', 'everything'];
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, marginTop: -40 }}>
        {/* inputs row: photo + waveform */}
        <div style={{ display: 'flex', gap: 30, alignItems: 'center', opacity: photoIn, transform: `translateY(${24 * (1 - photoIn)}px)` }}>
          <div style={{ width: 240, height: 340, borderRadius: RADIUS.card, overflow: 'hidden', border: `1px solid ${COLORS.line}`, boxShadow: SHADOW.card }}>
            <Img src={P('ref-vertical.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div
            style={{
              width: 300, height: 150, borderRadius: RADIUS.card, background: COLORS.d900,
              border: `1px solid ${COLORS.d600}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 5, opacity: audioIn, transform: `translateY(${24 * (1 - audioIn)}px)`, padding: '0 24px',
            }}
          >
            {WAVE.slice(0, 18).map((h, i) => {
              const live = frame >= 45 ? 0.35 + 0.65 * Math.abs(Math.sin((frame - 45) / 6 + i * 1.7)) : 0.3;
              return (
                <div key={i} style={{ width: 8, borderRadius: 4, height: 14 + h * 90 * live, background: i % 4 === 0 ? COLORS.accent : COLORS.d400 }} />
              );
            })}
          </div>
        </div>
        {/* down arrow */}
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 54, color: COLORS.muted, opacity: modelIn }}>↓</div>
        {/* model chip */}
        <div style={{ opacity: modelIn, transform: `translateY(${24 * (1 - modelIn)}px)` }}>
          <div
            style={{
              padding: '24px 44px', borderRadius: RADIUS.card, background: COLORS.d900,
              border: `1px solid ${COLORS.d600}`, boxShadow: SHADOW.card,
              fontFamily: FONT_MONO, fontSize: 40, fontWeight: 700, color: '#ffffff',
              display: 'flex', alignItems: 'center', gap: 18,
            }}
          >
            <span style={{ width: 16, height: 16, borderRadius: 8, background: COLORS.signal, display: 'inline-block' }} />
            OmniHuman <span style={{ color: COLORS.accent }}>v1.5</span>
          </div>
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 54, color: COLORS.muted, opacity: outIn }}>↓</div>
        {/* output statement */}
        <div style={{ textAlign: 'center', opacity: outIn, transform: `translateY(${24 * (1 - outIn)}px)` }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 92, fontWeight: 700, color: COLORS.ink, letterSpacing: -2, margin: 0 }}>
            generates <span style={{ color: COLORS.accent }}>me</span>.
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 92, fontWeight: 700, color: COLORS.ink, letterSpacing: -2, margin: 0 }}>
            talking.
          </div>
        </div>
        {/* trait chips on "blinks, gestures, everything" */}
        <div style={{ display: 'flex', gap: 18, marginTop: 10 }}>
          {tags.map((t, i) => {
            const tIn = rise(158 + i * 22, 12);
            return (
              <div key={t} style={{ opacity: tIn, transform: `translateY(${18 * (1 - tIn)}px) scale(${0.94 + 0.06 * tIn})` }}>
                <Chip>
                  <span style={{ color: [COLORS.accent, COLORS.accent2, COLORS.signal][i] }}>✓</span> {t}
                </Chip>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// B6 — the cost (dark, mono counter ticking to ~$2)
// =============================================================================
export const CostBeat: React.FC = () => {
  const frame = useCurrentFrame();
  // "sixteen cents per second"(0-55) "this entire video"(~55-90) "about two dollars"(~95-140)
  const rateIn = interpolate(frame, [2, 14], [0, 1], { easing: EASINGS.easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const counter = interpolate(frame, [55, 100], [0, 2.07], { easing: EASINGS.easeInOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const stamp = interpolate(frame, [104, 114], [0, 1], { easing: EASINGS.overshoot, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 44 }}>
        <div style={{ opacity: rateIn, transform: `translateY(${24 * (1 - rateIn)}px)` }}>
          <Chip dark>
            <span style={{ color: COLORS.warn }}>rate</span> $0.16 / second of me
          </Chip>
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 200, fontWeight: 700, color: '#ffffff', fontVariantNumeric: 'tabular-nums', margin: 0, lineHeight: 1 }}>
          ${counter.toFixed(2)}
        </div>
        <div style={{ opacity: stamp, transform: `scale(${0.8 + 0.2 * stamp}) rotate(${-4 * (1 - stamp)}deg)` }}>
          <div
            style={{
              padding: '18px 40px', borderRadius: RADIUS.card, border: `4px solid ${COLORS.signal}`,
              color: COLORS.signal, fontFamily: FONT_DISPLAY, fontSize: 60, fontWeight: 700, letterSpacing: 1,
            }}
          >
            THIS WHOLE VIDEO
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// B8 — "every single clip was generated" (light, big type + three stamps)
// =============================================================================
export const StatementBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = (start: number, len = 14) =>
    interpolate(frame, [start, start + len], [0, 1], { easing: EASINGS.easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // "Every single clip of me in this video…"(0-75) "was generated."(~80-110) "Every. Single. One."(~112-155)
  const l1 = rise(4);
  const l2 = rise(18);
  const l3 = rise(80);
  const words = ['Every.', 'Single.', 'One.'];
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.paper, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', padding: '0 60px' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 88, fontWeight: 700, color: COLORS.ink, letterSpacing: -2, margin: 0, opacity: l1, transform: `translateY(${24 * (1 - l1)}px)` }}>
          every single clip
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 88, fontWeight: 700, color: COLORS.ink, letterSpacing: -2, margin: 0, opacity: l2, transform: `translateY(${24 * (1 - l2)}px)` }}>
          of me in this video
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 110, fontWeight: 700, color: COLORS.accent, letterSpacing: -2, margin: '30px 0 0 0', opacity: l3, transform: `translateY(${24 * (1 - l3)}px)` }}>
          was generated
        </div>
        <div style={{ display: 'flex', gap: 26, justifyContent: 'center', marginTop: 70 }}>
          {words.map((w, i) => {
            const s = interpolate(frame, [112 + i * 14, 120 + i * 14], [0, 1], { easing: EASINGS.overshoot, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            return (
              <div
                key={w}
                style={{
                  fontFamily: FONT_DISPLAY, fontSize: 58, fontWeight: 700, color: '#ffffff',
                  background: [COLORS.accent, COLORS.accent2, COLORS.signal][i],
                  padding: '14px 30px', borderRadius: RADIUS.card, boxShadow: SHADOW.card,
                  opacity: s, transform: `scale(${0.7 + 0.3 * s})`,
                }}
              >
                {w}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// END CARD — "0 seconds recorded."
// =============================================================================
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const inA = interpolate(frame, [2, 14], [0, 1], { easing: EASINGS.easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const inB = interpolate(frame, [18, 30], [0, 1], { easing: EASINGS.easeOut, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: GRADIENT }} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 96, fontWeight: 700, color: '#ffffff', margin: 0, opacity: inA, transform: `translateY(${24 * (1 - inA)}px)` }}>
          0 seconds
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 96, fontWeight: 700, color: COLORS.accent, margin: 0, opacity: inA, transform: `translateY(${24 * (1 - inA)}px)` }}>
          recorded.
        </div>
        <div style={{ marginTop: 60, opacity: inB, transform: `translateY(${20 * (1 - inB)}px)` }}>
          <Chip dark>
            <span style={{ color: COLORS.signal }}>▲</span> watch again. find the glitch.
          </Chip>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const ShortAiTest: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900 }}>
      {BEATS.map((b, i) => (
        <Sequence key={b.id} from={FROM[i]} durationInFrames={b.dur}>
          {b.kind === 'cam' ? (
            <CamBeat src={`cam/${b.id}.mp4`} caption={b.caption} />
          ) : (
            <>
              {b.id === 'b2' && <PhotoBeat />}
              {b.id === 'b4' && <PipelineBeat />}
              {b.id === 'b6' && <CostBeat />}
              {b.id === 'b8' && <StatementBeat />}
              {b.id === 'end' && <EndCard />}
              {b.id !== 'end' && <Audio src={P(`vo/${b.id}.mp3`)} />}
            </>
          )}
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default ShortAiTest;
