import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Cpu, MemoryStick, HardDrive, Globe, Search } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, Ring } from '../../lib/browser';
import { BOX, PX, PY, PW, PH, CT, ContaboMark, CursorLayer, Chip, Key } from './B7kit';

// =============================================================================
// B7 (1/16) — pick a VPS. Master span 409.596967 -> 418.696967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 409.596967) * 30)).
//   "In my case now, for the quick demo"  412.67 -> f2    Contabo VPS page is up
//   "VPS."                                415.23 -> f79   plan cards settled
//   "Any provider you want."              416.38 -> f113  provider strip rises
//   "Contabo."                            418.03 -> f163  strip dims to Contabo
//   "cheapest"                            419.32 -> f202  cheapest plan clicked
//   "VPS."                                419.96 -> f221  ring settles on it
//   "It's more than enough."              420.55 -> f239  teal chip lands
// Contabo's own palette (navy + orange) — never the indigo brand. Brand tokens
// are only on OUR chrome: the cursor, the ring, the chip, the provider strip.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7VpsPick', durationInSeconds: 9.1, fps: 30, width: 1920, height: 1080 };

const F_STRIP = 113;
const F_CONTABO = 163;
const F_PICK = 202;
const F_RING = 206;
const F_ENOUGH = 239;

const CARD_X = [40, 430, 820, 1210];
const CARD_W = 370, CARD_Y = 170, CARD_H = 490;
const BTN = { dx: 30, dy: 400, w: 310, h: 54 };

const PLANS = [
  { name: 'Cloud VPS 10', price: '€4.50', cpu: '3 vCPU Cores', ram: '8 GB RAM', disk: '75 GB NVMe' },
  { name: 'Cloud VPS 20', price: '€7.50', cpu: '6 vCPU Cores', ram: '12 GB RAM', disk: '100 GB NVMe' },
  { name: 'Cloud VPS 30', price: '€12.50', cpu: '8 vCPU Cores', ram: '24 GB RAM', disk: '200 GB NVMe' },
  { name: 'Cloud VPS 40', price: '€22.50', cpu: '12 vCPU Cores', ram: '48 GB RAM', disk: '300 GB NVMe' },
];

const PROVIDERS = ['Hetzner', 'DigitalOcean', 'Vultr', 'Contabo', 'Linode'];

const KEYS: Key[] = [
  { frame: 0, x: PX + 1360, y: PY + 660 },
  { frame: 120, x: PX + 1360, y: PY + 660 },
  { frame: 196, x: PX + CARD_X[0] + BTN.dx + BTN.w / 2, y: PY + CARD_Y + BTN.dy + BTN.h / 2 },
];
const CLICKS = [F_PICK];

const PlanCard: React.FC<{ i: number; picked: boolean }> = ({ i, picked }) => {
  const p = PLANS[i];
  const rows: { Icon: React.FC<any>; t: string }[] = [
    { Icon: Cpu, t: p.cpu }, { Icon: MemoryStick, t: p.ram }, { Icon: HardDrive, t: p.disk }, { Icon: Globe, t: '32 TB Traffic' },
  ];
  return (
    <div style={{
      position: 'absolute', left: CARD_X[i], top: CARD_Y, width: CARD_W, height: CARD_H,
      background: CT.bg, border: `1px solid ${picked ? CT.orange : CT.border}`, borderRadius: 12,
      boxShadow: picked ? SHADOW.card : 'none',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: CARD_W, height: 62, background: CT.canvas, borderBottom: `1px solid ${CT.border}`, borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 26, color: CT.text }}>{p.name}</span>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 84, width: CARD_W, textAlign: 'center' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 62, color: CT.navy }}>{p.price}</span>
        <span style={{ fontSize: 24, color: CT.dim }}> /mo</span>
      </div>
      <div style={{ position: 'absolute', left: 30, top: 176, width: CARD_W - 60, height: 1, background: CT.border }} />
      {rows.map((r, k) => (
        <div key={r.t} style={{ position: 'absolute', left: 34, top: 202 + k * 48, display: 'flex', alignItems: 'center', gap: 14 }}>
          <r.Icon size={21} color={CT.dim} strokeWidth={1.9} />
          <span style={{ fontSize: 22, color: CT.text }}>{r.t}</span>
        </div>
      ))}
      <div style={{
        position: 'absolute', left: BTN.dx, top: BTN.dy, width: BTN.w, height: BTN.h,
        background: CT.orange, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, fontWeight: 600, color: '#ffffff',
      }}>Order now</div>
      {picked && <Ring start={F_RING} color={COLORS.accent} style={{ inset: -10, borderRadius: 16 }} />}
    </div>
  );
};

const B7VpsPick: React.FC = () => {
  const frame = useCurrentFrame();
  const picked = frame >= F_PICK;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <WebBrowserFrame url="contabo.com/en/vps/" tabTitle="Cloud VPS | Contabo" favicon={<ContaboMark size={20} />} box={BOX} appearAt={0}>
        <div style={{ position: 'relative', width: PW, height: PH, background: CT.bg, color: CT.text }}>
          {/* navy header */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 64, background: CT.navy, display: 'flex', alignItems: 'center', gap: 26, padding: '0 26px' }}>
            <ContaboMark size={30} />
            <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 25, letterSpacing: 2, color: '#ffffff' }}>CONTABO</span>
            <div style={{ display: 'flex', gap: 26, marginLeft: 24, fontSize: 20, color: '#c7d4e6' }}>
              {['VPS', 'VDS', 'Dedicated Servers', 'Object Storage', 'Support'].map((t, i) => (
                <span key={t} style={{ color: i === 0 ? '#ffffff' : '#c7d4e6', fontWeight: i === 0 ? 600 : 400 }}>{t}</span>
              ))}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
              <Search size={19} color="#c7d4e6" />
              <div style={{ height: 40, padding: '0 20px', borderRadius: 7, background: CT.orange, display: 'flex', alignItems: 'center', fontSize: 19, fontWeight: 600, color: '#ffffff' }}>Customer Login</div>
            </div>
          </div>

          <div style={{ position: 'absolute', left: 40, top: 88, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 42, color: CT.text }}>Cloud VPS</div>
          <div style={{ position: 'absolute', left: 40, top: 136, fontSize: 22, color: CT.dim }}>Virtual private servers with NVMe storage. Choose your plan.</div>

          {PLANS.map((_, i) => <PlanCard key={i} i={i} picked={picked && i === 0} />)}

          <Chip at={F_ENOUGH} color={COLORS.signal} style={{ left: 40, top: 680 }}>more than enough</Chip>
        </div>
      </WebBrowserFrame>

      {/* ---- OUR chrome: "any provider you want", then it narrows to Contabo ---- */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 924, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {PROVIDERS.map((p, i) => {
          const at = F_STRIP + i * 4;
          const op = interpolate(frame, [at, at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
          const y = interpolate(frame, [at, at + 14], [18, 0], { ...CLAMP, easing: EASINGS.easeOut });
          const isPick = p === 'Contabo';
          const dim = isPick ? 1 : interpolate(frame, [F_CONTABO, F_CONTABO + 12], [1, 0.26], { ...CLAMP, easing: EASINGS.easeOut });
          const ringOp = isPick ? interpolate(frame, [F_CONTABO, F_CONTABO + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) : 0;
          const out = interpolate(frame, [F_PICK - 12, F_PICK + 2], [1, 0], { ...CLAMP, easing: EASINGS.easeIn });
          return (
            <div key={p} style={{
              position: 'relative', height: 56, padding: '0 26px', borderRadius: RADIUS.pill,
              display: 'flex', alignItems: 'center', background: COLORS.cream,
              border: `1px solid ${COLORS.line}`, fontFamily: FONT_MONO, fontSize: 24, color: COLORS.ink,
              opacity: op * dim * out, transform: `translateY(${y}px)`,
            }}>
              {p}
              <div style={{ position: 'absolute', inset: -4, borderRadius: RADIUS.pill, border: `3px solid ${COLORS.accent}`, opacity: ringOp }} />
            </div>
          );
        })}
      </div>

      <CursorLayer keys={KEYS} clicks={CLICKS} hideAt={F_ENOUGH + 6} />
    </AbsoluteFill>
  );
};
export default B7VpsPick;
