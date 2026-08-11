import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Braces, Check, Loader } from 'lucide-react';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_BODY, FONT_DISPLAY, FONT_MONO, FONT_SERIF } from '../../fonts';
import { CLAMP, Sunburst } from '../../lib/kit';

// =============================================================================
// B10 (1/4) — connect Claude to the brain, once. Master span 670.196967 -> 681.596967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 670.196967) * 30)).
//   "I simply"                673.41 -> f6    the .mcp.json panel rises
//   "connect"                 673.98 -> f23   the server row appears, connecting
//   "once"                    675.64 -> f73   "one time" pill on the config file
//   "MCP" / "server"          676.61 -> f102  coral rail on the transport + url
//   "brain, and that's it."   679.02 -> f175  status flips to connected, the 9
//                                             real tools stream in
//   "Claude can now read      680.70 -> f225  the UI dims, the claim lands
//    my brain."               682.07 -> f255  indigo wipe under "read my brain"
//   "Literally, that's        683.19 -> f300  kicker
//    the feature."
// Real third-party UI (Claude Code, /mcp) is cloned with its literal hex, per
// brand.md — this must look like the real app, not like the indigo brand. The
// nine tool names are the real BrainOutside MCP surface.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B10ConnectMCP', durationInSeconds: 11.4, fps: 30, width: 1920, height: 1080 };

const CC = {
  bg: '#1c1b19', panel: '#211f1d', bar: '#262421', border: '#38342e',
  coral: '#cd8064', text: '#ebe8e3', muted: '#8f8981', faint: '#6d675f', green: '#4ec98f',
} as const;

const F_PANEL = 6;
const F_CONNECT = 23;
const F_ONCE = 73;
const F_TRANSPORT = 102;
const F_CONNECTED = 175;
const F_CLAIM = 225;
const F_WIPE = 255;
const F_KICKER = 300;

// the real tool surface of the BrainOutside MCP server
const TOOLS = [
  'get-identity', 'get-index', 'list-notes', 'get-note', 'get-raw',
  'get-lens', 'assemble-context', 'propose-feed', 'ping',
];

const JSON_LINES: { text: string; kind: 'pun' | 'key' | 'name' | 'val' }[][] = [
  [{ text: '{', kind: 'pun' }],
  [{ text: '  ', kind: 'pun' }, { text: '"mcpServers"', kind: 'key' }, { text: ': {', kind: 'pun' }],
  [{ text: '    ', kind: 'pun' }, { text: '"brainoutside"', kind: 'name' }, { text: ': {', kind: 'pun' }],
  [{ text: '      ', kind: 'pun' }, { text: '"type"', kind: 'key' }, { text: ': ', kind: 'pun' }, { text: '"http"', kind: 'val' }, { text: ',', kind: 'pun' }],
  [{ text: '      ', kind: 'pun' }, { text: '"url"', kind: 'key' }, { text: ': ', kind: 'pun' }, { text: '"https://brain.learnwithhasan.com/mcp"', kind: 'val' }],
  [{ text: '    }', kind: 'pun' }],
  [{ text: '  }', kind: 'pun' }],
  [{ text: '}', kind: 'pun' }],
];

const KIND_COLOR: Record<string, string> = {
  pun: CC.faint, key: CC.text, name: CC.coral, val: CC.muted,
};

const B10ConnectMCP: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const uiDim = r(F_CLAIM, F_CLAIM + 18, 1, 0.1, EASINGS.easeInOut);
  const scrim = r(F_CLAIM, F_CLAIM + 18, 0, 0.82, EASINGS.easeInOut);

  const cfgOp = r(F_PANEL, F_PANEL + 14);
  const cfgY = r(F_PANEL, F_PANEL + 16, 24, 0);
  const mcpOp = r(F_PANEL + 4, F_PANEL + 18);
  const mcpY = r(F_PANEL + 4, F_PANEL + 20, 24, 0);
  const onceOp = r(F_ONCE, F_ONCE + 12);
  const railOp = r(F_TRANSPORT, F_TRANSPORT + 14);

  const rowOp = r(F_CONNECT, F_CONNECT + 14);
  const rowY = r(F_CONNECT, F_CONNECT + 14, 12, 0);
  const connecting = 1 - r(F_CONNECTED, F_CONNECTED + 10);
  const connected = r(F_CONNECTED, F_CONNECTED + 12);
  const spin = (frame * 7) % 360;
  const toolsHead = r(F_CONNECTED + 4, F_CONNECTED + 16);

  const claimOp = r(F_CLAIM, F_CLAIM + 16);
  const claimY = r(F_CLAIM, F_CLAIM + 18, 26, 0);
  const wipe = r(F_WIPE, F_WIPE + 12);
  const kickOp = r(F_KICKER, F_KICKER + 14);
  const kickY = r(F_KICKER, F_KICKER + 14, 16, 0);

  return (
    <AbsoluteFill style={{ backgroundColor: CC.bg, fontFamily: FONT_BODY }}>
      {/* ---------------- the Claude Code session ---------------- */}
      <AbsoluteFill style={{ opacity: uiDim }}>
        <div style={{ position: 'absolute', top: 44, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Sunburst size={30} />
          <span style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 38, color: CC.coral }}>Claude Code</span>
        </div>

        {/* ---- left: the one-time config ---- */}
        <div style={{
          position: 'absolute', left: 80, top: 196, width: 900,
          background: CC.panel, border: `1px solid ${CC.border}`, borderRadius: RADIUS.window,
          overflow: 'hidden', opacity: cfgOp, transform: `translateY(${cfgY}px)`,
        }}>
          <div style={{ height: 62, background: CC.bar, borderBottom: `1px solid ${CC.border}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px' }}>
            <Braces size={22} color={CC.muted} strokeWidth={1.9} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 25, color: CC.muted }}>.mcp.json</span>
            <span style={{
              marginLeft: 'auto', opacity: onceOp,
              fontFamily: FONT_MONO, fontSize: 21, color: CC.coral,
              border: `1px solid ${CC.coral}66`, background: `${CC.coral}1a`,
              borderRadius: RADIUS.pill, padding: '5px 18px',
            }}>one time</span>
          </div>
          <div style={{ position: 'relative', padding: '30px 0 34px' }}>
            {/* coral rail on the transport + url, on "MCP server" */}
            <div style={{ position: 'absolute', left: 0, top: 30 + 3 * 52, width: 6, height: 2 * 52, background: CC.coral, opacity: railOp }} />
            <div style={{ position: 'absolute', left: 0, right: 0, top: 30 + 3 * 52, height: 2 * 52, background: `${CC.coral}12`, opacity: railOp }} />
            {JSON_LINES.map((line, i) => (
              <div key={i} style={{ position: 'relative', height: 52, display: 'flex', alignItems: 'center', padding: '0 30px', fontFamily: FONT_MONO, fontSize: 26, whiteSpace: 'pre' }}>
                {line.map((seg, j) => (
                  <span key={j} style={{ color: KIND_COLOR[seg.kind] }}>{seg.text}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ---- right: the /mcp panel ---- */}
        <div style={{
          position: 'absolute', left: 1030, top: 196, width: 810,
          background: CC.panel, border: `1px solid ${CC.border}`, borderRadius: RADIUS.window,
          overflow: 'hidden', opacity: mcpOp, transform: `translateY(${mcpY}px)`,
        }}>
          <div style={{ height: 62, background: CC.bar, borderBottom: `1px solid ${CC.border}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 24px' }}>
            <Sunburst size={22} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 25, color: CC.muted }}>Manage MCP servers</span>
          </div>
          <div style={{ padding: '26px 30px 34px' }}>
            {/* the server row */}
            <div style={{
              display: 'flex', alignItems: 'center', height: 72,
              background: CC.bg, border: `1px solid ${CC.border}`, borderRadius: RADIUS.panel,
              padding: '0 22px', opacity: rowOp, transform: `translateY(${rowY}px)`,
            }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 30, color: CC.text }}>brainoutside</span>
              <div style={{ marginLeft: 'auto', position: 'relative', width: 230, height: 36 }}>
                <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', alignItems: 'center', gap: 10, opacity: connecting }}>
                  <div style={{ transform: `rotate(${spin}deg)`, display: 'flex' }}>
                    <Loader size={22} color={CC.faint} strokeWidth={2.2} />
                  </div>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 25, color: CC.faint }}>connecting</span>
                </div>
                <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', alignItems: 'center', gap: 10, opacity: connected }}>
                  <Check size={24} color={CC.green} strokeWidth={3} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 25, color: CC.green }}>connected</span>
                </div>
              </div>
            </div>

            {/* the tools it exposes */}
            <div style={{ marginTop: 26, opacity: toolsHead, fontFamily: FONT_MONO, fontSize: 21, letterSpacing: 1.8, color: CC.faint }}>
              9&nbsp;TOOLS
            </div>
            <div style={{ marginTop: 12 }}>
              {TOOLS.map((t, i) => {
                const at = F_CONNECTED + 8 + i * 3;
                const op = r(at, at + 12);
                const y = r(at, at + 12, 10, 0);
                return (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 16, height: 44, opacity: op, transform: `translateY(${y}px)` }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CC.coral, flexShrink: 0 }} />
                    <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: CC.text }}>{t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>

      {/* ---------------- the claim ---------------- */}
      <AbsoluteFill style={{ background: CC.bg, opacity: scrim }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 430, textAlign: 'center',
        opacity: claimOp, transform: `translateY(${claimY}px)`,
        fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1.2, color: CC.text,
      }}>
        Claude can now{' '}
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{
            position: 'absolute', left: -12, right: -12, bottom: 8, height: 30, borderRadius: 8,
            background: `${COLORS.accent}66`, transform: `scaleX(${wipe})`, transformOrigin: 'left', zIndex: 0,
          }} />
          <span style={{ position: 'relative', zIndex: 1 }}>read my brain.</span>
        </span>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 600, textAlign: 'center',
        opacity: kickOp, transform: `translateY(${kickY}px)`,
        fontFamily: FONT_MONO, fontSize: 34, letterSpacing: 1, color: CC.muted,
      }}>
        Literally, that&rsquo;s the feature.
      </div>
    </AbsoluteFill>
  );
};

export default B10ConnectMCP;
