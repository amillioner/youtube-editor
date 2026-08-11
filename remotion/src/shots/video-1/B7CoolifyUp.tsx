import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Server, Database, Boxes } from 'lucide-react';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, Ring } from '../../lib/browser';
import { BOX, PW, PH, CF, CoolifyMark, CoolifyShell, Chip } from './B7kit';

// =============================================================================
// B7 (3/16) — Coolify is up on the server. Master span 428.596967 -> 434.196967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 428.596967) * 30)).
//   "You can see now"          431.69 -> f3    dashboard fades up
//   "Coolify"                  432.47 -> f26   ring draws on the server card
//   "running"                  432.82 -> f37   the green status pills
//   "on my server."            433.37 -> f53   the server IP chip
//   "self host"                434.96 -> f101  the deployable-service tiles run
//   "anything you want."       435.53 -> f140  "+ 200 more" tile lands
// The `sped up` tag is gone here: nothing on this screen is compressed footage.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7CoolifyUp', durationInSeconds: 5.6, fps: 30, width: 1920, height: 1080 };

const F_RING = 26;
const F_STATUS = 37;
const F_IP = 53;
const F_SECTION = 81;
const F_TILES = 101;
const F_MORE = 140;

const SERVICES = ['PostgreSQL', 'Redis', 'n8n', 'Ghost', 'Supabase'];

const B7CoolifyUp: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const statusOp = r(F_STATUS, F_STATUS + 12);
  const secOp = r(F_SECTION, F_SECTION + 14);
  const secY = r(F_SECTION, F_SECTION + 14, 16, 0);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={CF.purple} />
      <WebBrowserFrame url="203.0.113.42:8000/dashboard" tabTitle="Dashboard | Coolify" favicon={<CoolifyMark size={20} />} box={BOX} appearAt={0}>
        <CoolifyShell>
          <div style={{ position: 'absolute', left: 40, top: 90, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: CF.text }}>Dashboard</div>

          {/* server card */}
          <div style={{ position: 'absolute', left: 40, top: 156, width: 760, height: 216, background: CF.panel, border: `1px solid ${CF.border}`, borderRadius: 12 }}>
            <div style={{ position: 'absolute', left: 28, top: 26, display: 'flex', alignItems: 'center', gap: 14 }}>
              <Server size={26} color={CF.purple} strokeWidth={1.9} />
              <span style={{ fontSize: 26, fontWeight: 600, color: CF.text }}>localhost</span>
            </div>
            <div style={{ position: 'absolute', left: 28, top: 78, fontFamily: FONT_MONO, fontSize: 22, color: CF.faint }}>root@203.0.113.42</div>
            <div style={{ position: 'absolute', left: 28, top: 128, display: 'flex', gap: 14, opacity: statusOp }}>
              {['Reachable', 'Usable'].map((s) => (
                <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 42, padding: '0 18px', borderRadius: RADIUS.pill, background: `${CF.green}1f`, border: `1px solid ${CF.green}66`, color: CF.green, fontSize: 21 }}>
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: CF.green }} />{s}
                </span>
              ))}
            </div>
            {frame >= F_RING && <Ring start={F_RING} color={COLORS.accent} style={{ inset: -10, borderRadius: 16 }} />}
          </div>

          {/* right card */}
          <div style={{ position: 'absolute', left: 830, top: 156, width: 750, height: 216, background: CF.panel, border: `1px solid ${CF.border}`, borderRadius: 12 }}>
            <div style={{ position: 'absolute', left: 28, top: 26, fontSize: 24, fontWeight: 600, color: CF.text }}>Your instance</div>
            {[
              ['Version', 'v4.0.0-beta.370'], ['Projects', '0'], ['Applications', '0'],
            ].map((row, i) => (
              <div key={row[0]} style={{ position: 'absolute', left: 28, right: 28, top: 78 + i * 44, display: 'flex', justifyContent: 'space-between', fontSize: 22 }}>
                <span style={{ color: CF.dim }}>{row[0]}</span>
                <span style={{ fontFamily: FONT_MONO, color: CF.text }}>{row[1]}</span>
              </div>
            ))}
          </div>

          <Chip at={F_IP} color={COLORS.signal} style={{ left: 40, top: 396 }}>running on my own server</Chip>

          {/* deployable services */}
          <div style={{ position: 'absolute', left: 40, top: 466, fontSize: 24, color: CF.dim, opacity: secOp, transform: `translateY(${secY}px)` }}>
            One-click resources
          </div>
          {SERVICES.map((s, i) => {
            const at = F_TILES + i * 4;
            const op = r(at, at + 13);
            const y = r(at, at + 13, 16, 0);
            return (
              <div key={s} style={{
                position: 'absolute', left: 40 + i * 262, top: 516, width: 242, height: 78,
                background: CF.panel, border: `1px solid ${CF.border}`, borderRadius: 11,
                display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px',
                opacity: op, transform: `translateY(${y}px)`,
              }}>
                <Database size={22} color={CF.dim} strokeWidth={1.9} />
                <span style={{ fontSize: 22, color: CF.text }}>{s}</span>
              </div>
            );
          })}
          <div style={{
            position: 'absolute', left: 40 + 5 * 262, top: 516, width: 242, height: 78,
            background: `${CF.purple}22`, border: `1px solid ${CF.purple}`, borderRadius: 11,
            display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px',
            opacity: r(F_MORE, F_MORE + 13), transform: `translateY(${r(F_MORE, F_MORE + 13, 16, 0)}px)`,
          }}>
            <Boxes size={22} color={CF.purple} strokeWidth={1.9} />
            <span style={{ fontSize: 22, color: CF.text }}>+ 200 more</span>
          </div>

          <div style={{ position: 'absolute', left: 40, top: 630, width: PW - 80, height: 1, background: CF.border, opacity: secOp }} />
          <div style={{ position: 'absolute', left: 40, top: 660, fontSize: 22, color: CF.faint, opacity: r(F_MORE + 8, F_MORE + 22) }}>
            or anything else that ships a Docker image
          </div>
          <div style={{ position: 'absolute', left: 0, top: PH - 1, width: PW, height: 1 }} />
        </CoolifyShell>
      </WebBrowserFrame>
    </AbsoluteFill>
  );
};
export default B7CoolifyUp;
