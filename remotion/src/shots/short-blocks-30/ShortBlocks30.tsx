import React from 'react';
import {
  useCurrentFrame,
  interpolate,
  AbsoluteFill,
  Sequence,
  Audio,
  OffthreadVideo,
  staticFile,
  Easing,
} from 'remotion';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';

// =============================================================================
// COMPOSITION CONFIG — Block 30 Short (Shorts-factory pilot).
// ~51s runtime accepted by Hasan at Gate 2 (2026-08-13).
// =============================================================================
export const compositionConfig = {
  id: 'ShortBlocks30',
  durationInSeconds: 51.4,
  fps: 30,
  width: 1080,
  height: 1920,
};

export const P = (name: string) => staticFile(`projects/short-blocks-30/${name}`);

// =============================================================================
// BRAND — Vibe Engineering Blocks (profile/visual-style.md in the X repo).
// Defined LOCALLY on purpose: each Short wears its SERIES brand; this repo's
// brand.ts (indigo, long-form) must not leak in. `fix` green is deliberately
// absent — block 30's chromatic axis is "no green anywhere" (nothing gets
// fixed in this piece; the payoff is seeing the tail).
// =============================================================================
const C = {
  bg: '#F8F9FC', structure: '#16273F', secondary: '#5C6B85', problem: '#E5484D',
  accent: '#D97757', accentInk: '#B85536', line: '#E4E8F1', white: '#FFFFFF',
  accentSoft: '#FBEEE7', problemSoft: '#FDECEC', rowline: '#DCE2EE',
} as const;

const EASE_OUT = Easing.bezier(0.22, 0.72, 0.28, 1);
const EASE = Easing.bezier(0.5, 0, 0.2, 1);
const OVERSHOOT = Easing.bezier(0.34, 1.56, 0.64, 1);

const iio = (f: number, inR: number[], outR: number[], easing?: (n: number) => number) =>
  interpolate(f, inR, outR, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// =============================================================================
// THE DISTRIBUTION — the computed core lifted from LatencyPercentilesV1Square
// (the X diagram). Same 125 samples, 28 log bins, same percentile walk; only
// the canvas is new (vertical, narration-timed).
// =============================================================================
const BIN_COUNTS = [1, 3, 8, 16, 21, 22, 15, 9, 6, 4, 3, 2, 2, 2, 1, 2, 1,
                    1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1] as const;
const N_BINS = BIN_COUNTS.length; // 28
const TOTAL = BIN_COUNTS.reduce<number>((a, b) => a + b, 0); // 125
const rankBin = (rank: number) => {
  let c = 0;
  for (let i = 0; i < N_BINS; i++) { c += BIN_COUNTS[i]; if (c >= rank) return i; }
  return N_BINS - 1;
};
const P50_BIN = rankBin(Math.ceil(TOTAL * 0.50)); // 5
const P95_BIN = rankBin(Math.ceil(TOTAL * 0.95)); // 17
const P99_BIN = rankBin(Math.ceil(TOTAL * 0.99)); // 23
const TAIL_BIN = P95_BIN;
const RATIO = Math.pow(20, 1 / 12);
const binMs = (i: number) => 100 * Math.pow(RATIO, i - P50_BIN);
const MEAN_MS = BIN_COUNTS.reduce<number>((s, n, i) => s + n * binMs(i), 0) / TOTAL;
const MEAN_BIN = P50_BIN + Math.log(MEAN_MS / 100) / Math.log(RATIO);

// vertical-canvas geometry
const BIN0_X = 64, BIN_DX = 34;
const binX = (i: number) => BIN0_X + BIN_DX * i;
const AXIS_Y = 1430;
const ROW0_Y = 1414, ROW_DY = 26;
const DOT_R = 8.4;
const FALL_FROM = 560;
const P50_X = binX(P50_BIN), P95_X = binX(P95_BIN), P99_X = binX(P99_BIN);
const MEAN_X = binX(MEAN_BIN);

// seeded shuffle rain (same technique as the square: arrival is shuffled so the
// pile never reads as a left-to-right sweep; rows assigned in arrival order)
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const rng = mulberry32(30081525);
const RAIN_A = 12, RAIN_B = 95, LAST_START = 100;
const buildDots = () => {
  const pool: number[] = [];
  for (let b = 0; b < N_BINS - 1; b++) for (let j = 0; j < BIN_COUNTS[b]; j++) pool.push(b);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
  }
  pool.push(N_BINS - 1); // the lone slowest sample lands alone, last
  const used = new Array(N_BINS).fill(0);
  const n = pool.length;
  return pool.map((bin, k) => {
    const row = used[bin]++;
    const y = ROW0_Y - ROW_DY * row;
    const dist = y - FALL_FROM;
    return {
      x: binX(bin), y,
      tail: bin >= TAIL_BIN,
      p99: bin === P99_BIN,
      start: k === n - 1 ? LAST_START
        : Math.max(4, RAIN_A + ((RAIN_B - RAIN_A) * k) / (n - 2) + (rng() - 0.5) * 2.6),
      dur: 6 + 10 * Math.sqrt(dist / (ROW0_Y - FALL_FROM)),
    };
  });
};
const DOTS = buildDots();

// =============================================================================
// BEAT TIMELINE — cam durations = measured clip lengths; tsx = VO + breathing.
// VO sync points measured from the mp3s (silencedetect on the SSML breaks).
// =============================================================================
type Beat = { id: string; kind: 'cam' | 'broll' | 'tsx'; dur: number; caption?: string };
const BEATS: Beat[] = [
  { id: 'b1', kind: 'cam', dur: 68, caption: 'someone just told you your app is slow.' },
  { id: 'b2', kind: 'broll', dur: 350 },
  { id: 'b3', kind: 'tsx', dur: 424 },
  { id: 'b4', kind: 'cam', dur: 49, caption: "there's a number that catches them." },
  { id: 'b5', kind: 'tsx', dur: 246 },
  { id: 'b6', kind: 'tsx', dur: 252 },
  { id: 'b7', kind: 'cam', dur: 92, caption: "that's the skill. knowing what to ask for." },
  { id: 'end', kind: 'tsx', dur: 60 },
];
const FROM: number[] = [];
BEATS.reduce((acc, b, i) => { FROM[i] = acc; return acc + b.dur; }, 0);

// =============================================================================
// SHARED PIECES
// =============================================================================
const Chip: React.FC<{ children: React.ReactNode; tone?: 'plain' | 'coral' | 'red'; style?: React.CSSProperties }> =
  ({ children, tone = 'plain', style }) => (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 24px',
        borderRadius: 999,
        background: tone === 'coral' ? C.accentSoft : tone === 'red' ? C.problemSoft : C.white,
        border: `1.6px solid ${tone === 'coral' ? C.accent : tone === 'red' ? C.problem : C.line}`,
        color: tone === 'coral' ? C.accentInk : tone === 'red' ? C.problem : C.structure,
        fontFamily: FONT_MONO, fontSize: 30, fontWeight: 700,
        ...style,
      }}
    >
      {children}
    </div>
  );

// caption chip over cam clips — neutral dark scrim so it sits on video, any brand
const CamCaption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const t = iio(frame, [3, 15], [0, 1], EASE_OUT);
  return (
    <div style={{
      position: 'absolute', left: '6%', right: '6%', bottom: '16%',
      display: 'flex', justifyContent: 'center', opacity: t, transform: `translateY(${22 * (1 - t)}px)`,
    }}>
      <div style={{
        background: 'rgba(13,17,23,0.80)', borderRadius: 18, padding: '18px 28px',
        color: C.white, fontFamily: FONT_BODY, fontSize: 40, fontWeight: 600,
        lineHeight: 1.3, textAlign: 'center', maxWidth: '94%',
      }}>
        {text}
      </div>
    </div>
  );
};

export const CamBeat: React.FC<{ src: string; caption?: string }> = ({ src, caption }) => (
  <AbsoluteFill style={{ backgroundColor: C.structure }}>
    <OffthreadVideo src={P(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    {caption ? <CamCaption text={caption} /> : null}
  </AbsoluteFill>
);

// =============================================================================
// B2 — b-roll v3 (Hasan's Gate-4 re-work): face-forward scenes in his real
// room, image-first pipeline (real photo -> Nano Banana stills -> Kling i2v).
// Scene A = watching the page load, scene B = typing/building. Kling clips are
// 5s; playbackRate stretches each scene to its VO span: "you open it… blink…
// wifi. don't." 0–6.1s (183f), "you built that app… fast. for you." 6.1–11.65s.
// =============================================================================
const B2_CUT = 183;
export const BrollBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = iio(frame, [B2_CUT, B2_CUT + 6], [0.35, 0], EASE);
  return (
    <AbsoluteFill style={{ backgroundColor: C.structure }}>
      <Sequence from={0} durationInFrames={B2_CUT}>
        {/* 5.04s clip over 6.1s -> rate ~0.82 */}
        <OffthreadVideo src={P('broll/v3-cA-checking.mp4')} playbackRate={0.82} muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Sequence>
      <Sequence from={B2_CUT} durationInFrames={350 - B2_CUT}>
        {/* 5.04s clip over 5.55s -> rate ~0.9 */}
        <OffthreadVideo src={P('broll/v3-cB-building.mp4')} playbackRate={0.9} muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Sequence>
      {/* soft white flash on the scene cut */}
      <AbsoluteFill style={{ backgroundColor: C.white, opacity: frame >= B2_CUT ? flash : 0 }} />
    </AbsoluteFill>
  );
};

// =============================================================================
// B3 — the evidence turn. 125 loads rain into the distribution; the peak gets
// counted, the tail goes red, the dashed average lands where almost nobody is.
// VO anchors (f): 0 "thousand times" · 86 "nine hundred / tenth of a second" ·
// 177 "twenty took nine full seconds" · 275 "average says 430" · 353 "fine." ·
// 379 "nothing to fix."
// =============================================================================
export const RainBeat: React.FC = () => {
  const frame = useCurrentFrame();

  const headIn = iio(frame, [2, 16], [0, 1], EASE_OUT);
  const peakChip = iio(frame, [90, 102], [0, 1], OVERSHOOT);
  const tailOn = iio(frame, [178, 190], [0, 1], EASE);
  const tailChip = iio(frame, [185, 197], [0, 1], OVERSHOOT);
  const redPulse = iio(frame, [206, 218, 232], [1, 1.3, 1], EASE_OUT);
  const avgO = iio(frame, [276, 294], [0, 1], EASE);
  const avgDY = iio(frame, [276, 294], [-150, 0], EASE_OUT);
  const avgChip = iio(frame, [296, 308], [0, 1], OVERSHOOT);
  const fineIn = iio(frame, [354, 366], [0, 1], EASE_OUT);
  const fixIn = iio(frame, [380, 392], [0, 1], EASE_OUT);

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* headline */}
      <div style={{ position: 'absolute', top: 220, left: 0, right: 0, textAlign: 'center', opacity: headIn, transform: `translateY(${26 * (1 - headIn)}px)` }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 120, fontWeight: 700, color: C.structure, letterSpacing: -3, lineHeight: 1 }}>
          1,000 <span style={{ color: C.accentInk }}>loads</span>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 42, color: C.secondary, marginTop: 14 }}>same page. today.</div>
      </div>

      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <clipPath id="plot30"><rect x={36} y={520} width={1008} height={950} /></clipPath>
        </defs>

        {/* the dashed average — arrives standing in the emptiest part of the pile */}
        <g clipPath="url(#plot30)" opacity={avgO}>
          <line x1={MEAN_X} y1={880 + avgDY} x2={MEAN_X} y2={AXIS_Y + avgDY}
            stroke={C.secondary} strokeWidth={3} strokeDasharray="9 7" />
        </g>

        {/* 125 samples, one dot = one request */}
        <g clipPath="url(#plot30)">
          {DOTS.map((d, i) => {
            const p = clamp((frame - d.start) / d.dur, 0, 1);
            const y = mix(FALL_FROM, d.y, p * p);
            const fill = d.tail ? (tailOn > 0.5 ? C.problem : C.accent) : C.structure;
            const r = d.p99 && frame >= 206 ? DOT_R * redPulse : DOT_R;
            return <circle key={i} cx={d.x} cy={y} r={r} fill={fill} />;
          })}
        </g>

        {/* baseline — value axis, no arrowhead */}
        <line x1={48} y1={AXIS_Y} x2={1032} y2={AXIS_Y} stroke={C.structure} strokeWidth={4} />
        <circle cx={MEAN_X} cy={AXIS_Y} r={6.5} fill={C.white} stroke={C.secondary} strokeWidth={3} opacity={avgO} />
        <text x={1032} y={1478} fontFamily={FONT_BODY} fontSize={26} fill={C.secondary} textAnchor="end" letterSpacing={4}>latency</text>
      </svg>

      {/* the three counted facts, chip by chip, where their dots are */}
      <div style={{ position: 'absolute', left: 60, top: 700, opacity: peakChip, transform: `scale(${0.8 + 0.2 * peakChip})`, transformOrigin: 'left center' }}>
        <Chip>900 × 100ms</Chip>
      </div>
      <div style={{ position: 'absolute', right: 48, top: 1180, opacity: tailChip, transform: `scale(${0.8 + 0.2 * tailChip})`, transformOrigin: 'right center' }}>
        <Chip tone="red">20 × 9s</Chip>
      </div>
      <div style={{ position: 'absolute', left: MEAN_X - 120, top: 800, opacity: avgChip, transform: `scale(${0.8 + 0.2 * avgChip})` }}>
        <Chip>avg 430ms</Chip>
      </div>

      {/* the shrug */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1560, textAlign: 'center' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 72, fontWeight: 700, color: C.structure, opacity: fineIn }}>fine. </span>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 72, fontWeight: 700, color: C.secondary, opacity: fixIn }}>nothing to fix.</span>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// B5 — the NAME. Card stamps in (the SFX hero moment), then p50/p99 markers
// grow out of a compressed pile. VO anchors: 0 "it's called latency
// percentiles" · 72 "p50 is you" · 128 "p99 is the person about to quit".
// =============================================================================
const MINI_Y = 1560, MINI_DY = 13, MINI_R = 4.6, MINI_X0 = 250, MINI_DX = 21;
const miniX = (i: number) => MINI_X0 + MINI_DX * i;
const MINI = DOTS.map((d, i) => ({
  x: miniX(Math.round((d.x - BIN0_X) / BIN_DX)),
  y: MINI_Y - ((ROW0_Y - d.y) / ROW_DY) * MINI_DY,
  tail: d.tail,
}));

export const NameBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const stamp = iio(frame, [4, 16], [0, 1], OVERSHOOT);
  const pileIn = iio(frame, [20, 40], [0, 1], EASE);
  const g50 = iio(frame, [74, 92], [0, 1], EASE_OUT);
  const you = iio(frame, [84, 98], [0, 1], EASE_OUT);
  const g99 = iio(frame, [130, 148], [0, 1], EASE_OUT);
  const them = iio(frame, [142, 158], [0, 1], EASE_OUT);
  const M50X = miniX(P50_BIN), M99X = miniX(P99_BIN);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* the name card */}
      <div style={{
        position: 'absolute', left: 70, right: 70, top: 420, textAlign: 'center',
        opacity: stamp, transform: `scale(${0.75 + 0.25 * stamp}) rotate(${-2.5 * (1 - stamp)}deg)`,
      }}>
        <div style={{
          background: C.accentSoft, border: `3px solid ${C.accent}`, borderRadius: 28,
          padding: '56px 40px',
        }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 34, color: C.secondary, letterSpacing: 6, marginBottom: 18 }}>THIS HAS A NAME</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 96, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05 }}>
            <span style={{ color: C.accentInk }}>latency</span>{' '}
            <span style={{ color: C.structure }}>percentiles</span>
          </div>
        </div>
      </div>

      {/* compressed pile + the two people */}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', inset: 0 }}>
        <g opacity={pileIn}>
          {MINI.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={MINI_R} fill={d.tail ? C.accent : C.structure} opacity={0.85} />
          ))}
          <line x1={220} y1={MINI_Y + 12} x2={860} y2={MINI_Y + 12} stroke={C.structure} strokeWidth={3} />
        </g>
        <line x1={M50X} y1={MINI_Y + 12} x2={M50X} y2={mix(MINI_Y + 12, 1180, g50)} stroke={C.structure} strokeWidth={4} />
        <line x1={M99X} y1={MINI_Y + 12} x2={M99X} y2={mix(MINI_Y + 12, 1180, g99)} stroke={C.problem} strokeWidth={5} />
      </svg>
      <div style={{ position: 'absolute', left: M50X - 150, width: 300, top: 1095, textAlign: 'center', opacity: you }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700, color: C.structure }}>p50 — you</div>
      </div>
      <div style={{ position: 'absolute', left: M99X - 220, width: 300, top: 1020, textAlign: 'center', opacity: them }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 700, color: C.problem }}>p99</div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 30, fontWeight: 600, color: C.problem, lineHeight: 1.25 }}>about to quit your app</div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// B6 — the ask: the literal prompt, typed into a Claude Code-style terminal.
// VO anchors: 0 "one line to Claude" · 55 typing starts · 190 typing done ·
// 208 "not the average" -> send.
// =============================================================================
const PROMPT_TEXT = 'time every request and show me p50, p95 and p99, not the average.';
const TYPE_START = 55, TYPE_END = 185, SEND_AT = 210;
export const PromptBeat: React.FC = () => {
  const frame = useCurrentFrame();
  const cardIn = iio(frame, [2, 14], [0, 1], EASE_OUT);
  const nChars = Math.floor(iio(frame, [TYPE_START, TYPE_END], [0, PROMPT_TEXT.length]));
  const typed = PROMPT_TEXT.slice(0, nChars);
  const caretOn = Math.floor(frame / 8) % 2 === 0 && frame < SEND_AT;
  const send = iio(frame, [SEND_AT, SEND_AT + 8], [0, 1], OVERSHOOT);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: 300, left: 0, right: 0, textAlign: 'center', opacity: cardIn }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 76, fontWeight: 700, color: C.structure, letterSpacing: -1 }}>
          one line to <span style={{ color: C.accentInk }}>Claude</span>
        </div>
      </div>
      <div style={{
        width: 920, borderRadius: 24, overflow: 'hidden', border: `1px solid ${C.line}`,
        boxShadow: '0 30px 90px rgba(22,39,63,0.18)', opacity: cardIn,
        transform: `translateY(${30 * (1 - cardIn)}px)`,
      }}>
        {/* terminal chrome — navy, in-palette */}
        <div style={{ background: C.structure, padding: '22px 30px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width={30} height={30} viewBox="0 0 24 24"><path fill={C.accent} d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" /></svg>
          <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: C.white, fontWeight: 700 }}>Claude Code</span>
        </div>
        <div style={{ background: '#0F1B2D', padding: '44px 40px', minHeight: 300 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 36, lineHeight: 1.6, color: '#E8EDF5' }}>
            <span style={{ color: C.accent }}>&gt; </span>
            {typed}
            <span style={{ opacity: caretOn ? 1 : 0, color: C.accent }}>▌</span>
          </div>
        </div>
        {/* send row */}
        <div style={{ background: '#0F1B2D', padding: '0 40px 36px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            padding: '14px 34px', borderRadius: 14, background: C.accent, color: C.white,
            fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700,
            opacity: 0.35 + 0.65 * send, transform: `scale(${1 + 0.12 * send * (1 - send) * 4})`,
          }}>
            ⏎ send
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 330, left: 0, right: 0, textAlign: 'center', opacity: send }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 52, fontWeight: 700, color: C.secondary }}>
          not the <span style={{ color: C.problem, textDecoration: 'line-through', textDecorationThickness: 4 }}>average</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// END CARD — series stamp + follow. Silent beat; impact-deep-soft lands here.
// =============================================================================
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const inA = iio(frame, [2, 14], [0, 1], OVERSHOOT);
  const inB = iio(frame, [16, 28], [0, 1], EASE_OUT);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ opacity: inA, transform: `scale(${0.7 + 0.3 * inA})` }}>
          <svg width={170} height={170} viewBox="0 0 24 24" style={{ display: 'block', margin: '0 auto 40px' }}>
            <path fill={C.accent} d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
          </svg>
          <div style={{
            display: 'inline-block', background: C.accentSoft, border: `2px solid ${C.accent}`,
            borderRadius: 999, padding: '10px 32px', fontFamily: FONT_DISPLAY, fontSize: 34,
            fontWeight: 700, color: C.accentInk, letterSpacing: 1,
          }}>
            BLOCK 30
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 62, fontWeight: 700, color: C.structure, marginTop: 30, letterSpacing: -1 }}>
            Vibe Engineering Blocks
          </div>
        </div>
        <div style={{ fontFamily: FONT_BODY, fontSize: 36, color: C.secondary, marginTop: 26, opacity: inB }}>
          follow for the next block
        </div>
      </div>
    </AbsoluteFill>
  );
};

// =============================================================================
// MAIN
// =============================================================================
const ShortBlocks30: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {BEATS.map((b, i) => (
      <Sequence key={b.id} from={FROM[i]} durationInFrames={b.dur}>
        {b.kind === 'cam' ? (
          <CamBeat src={`cam/${b.id}.mp4`} caption={b.caption} />
        ) : (
          <>
            {b.id === 'b2' && <BrollBeat />}
            {b.id === 'b3' && <RainBeat />}
            {b.id === 'b5' && <NameBeat />}
            {b.id === 'b6' && <PromptBeat />}
            {b.id === 'end' && <EndCard />}
            {b.id !== 'end' && <Audio src={P(`vo/${b.id}.mp3`)} />}
          </>
        )}
      </Sequence>
    ))}
  </AbsoluteFill>
);

export default ShortBlocks30;
