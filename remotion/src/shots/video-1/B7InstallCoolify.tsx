import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Terminal } from 'lucide-react';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP } from '../../lib/kit';
import { CF, CoolifyMark, SpedUpTag, LogStream } from './B7kit';

// =============================================================================
// B7 (2/16) — install Coolify. One command over SSH. Master span 418.696967 -> 428.596967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 418.696967) * 30)).
//   "And now simply"        421.74 -> f1    terminal is up, local prompt
//   "Coolify."              423.59 -> f57   Coolify lockup lands
//   "one" / "command."      424.87 / 425.17 -> f95 / f104   "1 command" pill
//   "SSH"                   427.36 -> f170  ssh line finishes typing
//   "client,"               427.84 -> f184  the server banner answers
//   "paste it,"             428.88 -> f215  the install command appears WHOLE
//                                           (a paste, not a type — that is the tell)
//   "and let it run"        429.90 -> f246  output starts, `sped up` tag on
//   "a few minutes."        430.96 -> f278  still ramping (NO duration on screen:
//                                           he never quotes one, so neither do we)
// Terminal is the ink/dark scale from brand.md §3. Coolify keeps its own violet.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7InstallCoolify', durationInSeconds: 9.9, fps: 30, width: 1920, height: 1080 };

const F_COOLIFY = 57;
const F_CMD = 104;
const F_TYPE = 136;
const F_TYPE_END = 168;
const F_BANNER = 178;
const F_PASTE = 215;
const F_ENTER = 232;
const F_RAMP = 240;

const WIN = { x: 240, y: 170, w: 1440, h: 800 };
const BODY_X = WIN.x + 46;
const SSH = 'ssh root@203.0.113.42';
const INSTALL = 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash';

const LOG = [
  '[+] Checking OS compatibility ...',
  '[+] OS: Ubuntu 24.04 LTS  (supported)',
  '[+] Installing required packages: curl wget git jq openssl',
  '[+] Installing Docker Engine 27.3.1',
  '[+] Docker installed successfully',
  '[+] Creating /data/coolify/{source,ssh,applications,databases}',
  '[+] Downloading docker-compose.yml',
  '[+] Downloading .env',
  '[+] Generating secrets',
  '[+] Pulling ghcr.io/coollabsio/coolify:latest .................',
  '[+] Pulling postgres:15-alpine ..............',
  '[+] Pulling redis:7-alpine ..........',
  '[+] Pulling soketi:1.6-16-debian ..........',
  '[+] Starting containers',
  '[+] coolify-db         started',
  '[+] coolify-redis      started',
  '[+] coolify-realtime   started',
  '[+] coolify            started',
  '[+] Running database migrations',
  '[+] Waiting for Coolify to be ready ..........',
];

const B7InstallCoolify: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const winOp = r(0, 16);
  const winY = r(0, 16, 30, 0);

  const typed = SSH.slice(0, Math.floor(r(F_TYPE, F_TYPE_END, 0, SSH.length, EASINGS.easeInOut)));
  const connected = frame >= F_BANNER;
  const pasted = frame >= F_PASTE;
  const entered = frame >= F_ENTER;
  const caret = Math.floor(frame / 14) % 2 === 0;

  const coolOp = r(F_COOLIFY, F_COOLIFY + 14);
  const coolY = r(F_COOLIFY, F_COOLIFY + 14, 18, 0);
  const cmdOp = r(F_CMD, F_CMD + 12);

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.d900, fontFamily: FONT_BODY }}>
      <AbsoluteFill style={{ background: `radial-gradient(1200px 640px at 50% -6%, ${CF.purple}26, transparent 62%)` }} />

      {/* header lockup: Coolify, and that it is one command */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 66, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: coolOp, transform: `translateY(${coolY}px)` }}>
          <CoolifyMark size={44} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 48, color: COLORS.d300 }}>Coolify</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, height: 52, padding: '0 22px', borderRadius: RADIUS.pill,
          background: `${COLORS.accent}1f`, border: `1px solid ${COLORS.accent}`, opacity: cmdOp,
        }}>
          <Terminal size={22} color={COLORS.accent} strokeWidth={2.2} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 26, color: COLORS.accent }}>1 command</span>
        </div>
      </div>

      {/* terminal window */}
      <div style={{
        position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h,
        background: COLORS.d800, border: `1px solid ${COLORS.d600}`, borderRadius: RADIUS.window,
        boxShadow: '0 30px 90px rgba(0,0,0,0.55)', opacity: winOp, transform: `translateY(${winY}px)`, overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 60, padding: '0 24px', background: '#1b2230', borderBottom: `1px solid ${COLORS.d600}` }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#ff5f57' }} />
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#febc2e' }} />
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#28c840' }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 21, color: COLORS.d400, marginLeft: 18 }}>
            {connected ? 'ssh — root@203.0.113.42 — 132x40' : 'zsh — hasan@studio — 132x40'}
          </span>
        </div>
      </div>

      {/* terminal body (positioned in canvas space so nothing depends on layout flow) */}
      <div style={{ position: 'absolute', left: BODY_X, top: WIN.y + 96, width: WIN.w - 92, fontFamily: FONT_MONO, fontSize: 25, opacity: winOp }}>
        <div style={{ height: 40, color: COLORS.d300, whiteSpace: 'nowrap' }}>
          <span style={{ color: COLORS.signal }}>hasan@studio</span>
          <span style={{ color: COLORS.d400 }}> ~ %&nbsp;</span>
          {typed}
          {!connected && <span style={{ opacity: caret ? 1 : 0 }}>▌</span>}
        </div>
        {connected && (
          <>
            <div style={{ height: 40, color: COLORS.d400, whiteSpace: 'nowrap' }}>Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)</div>
            <div style={{ height: 40, color: COLORS.d400, whiteSpace: 'nowrap' }}>Last login: Wed Aug  6 11:42:07 2026 from 82.114.11.4</div>
            <div style={{ height: 48, color: COLORS.d300, whiteSpace: 'nowrap' }}>
              <span style={{ color: COLORS.accent2 }}>root@vmi2481923</span>
              <span style={{ color: COLORS.d400 }}>:~#&nbsp;</span>
              {pasted && <span style={{ color: COLORS.d300 }}>{INSTALL}</span>}
              {!entered && <span style={{ opacity: caret ? 1 : 0 }}>▌</span>}
            </div>
          </>
        )}
      </div>

      {entered && (
        <LogStream
          lines={LOG} from={F_ENTER} to={297} rows={12}
          x={BODY_X} y={WIN.y + 300} w={WIN.w - 92} size={24} lineH={37}
          dimColor={COLORS.d400} okColor={COLORS.signal}
        />
      )}

      <SpedUpTag from={F_RAMP} x={WIN.x + WIN.w - 214} y={WIN.y + WIN.h - 74} />
    </AbsoluteFill>
  );
};
export default B7InstallCoolify;
