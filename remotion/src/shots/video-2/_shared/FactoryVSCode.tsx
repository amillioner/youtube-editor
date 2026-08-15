// video-2 shared kit — the factory's real workspace: VS Code (learnwithhasan-new
// project) with the Claude Code panel running the content-factory skill. All
// Claude Code UI in video-2 renders through these pieces so every beat matches
// the real product (dark chrome + coral, real layout). Frame-based only.
import React from 'react';
import { Img, interpolate, useCurrentFrame } from 'remotion';
import { Mic, Plus, Slash, Zap, ArrowUp, Square } from 'lucide-react';
import { FONT_BODY, FONT_MONO, FONT_SERIF } from '../../../fonts';
import { CLAMP, Sunburst, V, lib } from '../../../lib/kit';
import { VSCodeWindow, ExplorerRow, EditorGroup } from '../../../lib/vscode';

// ------------------------------------------------------------- explorer tree
// The factory workspace (real artifact names from the run: PIECE.md, recon
// report, ledger, evidence dir). Source files stay closed per plan §2.
export const factoryExplorer = (): ExplorerRow[] => [
  { name: '.claude\\skills', kind: 'folder', dot: true },
  { name: 'content-lab', kind: 'folder', dot: true },
  { name: 'evidence', kind: 'folder', dot: true },
  { name: 'templates\\guides', kind: 'folder', dot: true },
  { name: 'tools', kind: 'folder' },
  { name: '.env', kind: 'file', icon: 'settings' },
  { name: 'ledger.json', kind: 'file', icon: 'braces', mark: 'M' },
  { name: 'PIECE.md', kind: 'file', icon: 'info', mark: 'U' },
  { name: 'plan.md', kind: 'file', icon: 'info' },
  { name: 'recon-report.md', kind: 'file', icon: 'info', mark: 'U' },
  { name: 'README.md', kind: 'file', icon: 'info' },
];

export const FactoryWindow: React.FC<{ groups: EditorGroup[]; sidebarW?: number; children?: React.ReactNode }> = ({ groups, sidebarW, children }) => (
  <VSCodeWindow rows={factoryExplorer()} groups={groups} projectName="learnwithhasan-new" sidebarW={sidebarW}>
    {children}
  </VSCodeWindow>
);

// coral sweep behind a phrase of the prompt (e.g. "content-factory" on its
// narration cue). No `at` (or a past frame) = fully highlighted.
export const PromptHighlight: React.FC<{ at?: number; children: React.ReactNode }> = ({ at, children }) => {
  const frame = useCurrentFrame();
  const sweep = at === undefined ? 1 : interpolate(frame, [at, at + 14], [0, 1], CLAMP);
  return (
    <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
      <span style={{ position: 'absolute', left: -5, right: -5, top: -2, bottom: -2, background: 'rgba(205,128,100,0.34)', borderRadius: 6, transform: `scaleX(${sweep})`, transformOrigin: 'left' }} />
      <span style={{ position: 'relative', color: '#f0c9b4' }}>{children}</span>
    </span>
  );
};

// ------------------------------------------------------------- chat pieces
export const ClaudeWordmark: React.FC<{ x: number; w: number; top?: number }> = ({ x, w, top = 130 }) => (
  <div style={{ position: 'absolute', top, left: x, width: w, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
    <Sunburst size={26} color={V.coral} />
    <span style={{ fontFamily: FONT_SERIF, fontWeight: 500, fontSize: 34, color: V.coral }}>Claude Code</span>
  </div>
);

export const ClaudeEmptyState: React.FC<{ x: number; w: number; top?: number; opacity?: number }> = ({ x, w, top = 390, opacity = 1 }) => (
  <div style={{ position: 'absolute', top, left: x, width: w, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, opacity }}>
    <Img src={lib('library/logos/claude-code-bot.png')} style={{ width: 104, height: 104 }} />
    <span style={{ fontSize: 25, color: V.dim }}>Ready to code? Let&rsquo;s write something worth deploying.</span>
  </div>
);

// the sent prompt, right-aligned like the real transcript
export const ClaudeUserBubble: React.FC<{
  x: number; w: number; top: number; text: React.ReactNode; at?: number; size?: number;
}> = ({ x, w, top, text, at = 0, size = 21 }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 10], [0, 1], CLAMP);
  return (
    <div style={{ position: 'absolute', top, left: x + 24, width: w - 48, display: 'flex', justifyContent: 'flex-end', opacity: op }}>
      <div style={{ background: V.input, border: `1px solid ${V.inputBorder}`, borderRadius: 12, padding: '14px 20px', color: V.text, fontFamily: FONT_MONO, fontSize: size, lineHeight: 1.5, maxWidth: w - 120, whiteSpace: 'pre-wrap' }}>{text}</div>
    </div>
  );
};

// --------------------------------------------------------------- agent feed
// Streaming tool activity in the real CLI grammar: coral ⏺ tool lines, dim ⎿
// results. Lines appear on their frame; view keeps the tail visible.
export type FeedLine = readonly [at: number, kind: 'tool' | 'sub' | 'ok' | 'err', text: string];

const FEED_COLORS = { tool: V.text, sub: V.dim, ok: '#7ee2b8', err: '#e56b6b' } as const;

export const AgentFeed: React.FC<{
  lines: readonly FeedLine[];
  x: number; w: number; top: number;
  rows?: number; size?: number; lineH?: number;
  spinner?: { label: string; from: number; until?: number };
}> = ({ lines, x, w, top, rows = 12, size = 20, lineH = 40, spinner }) => {
  const frame = useCurrentFrame();
  const shown = lines.filter((l) => frame >= l[0]).slice(-rows);
  const spinOn = spinner && frame >= spinner.from && (spinner.until === undefined || frame < spinner.until);
  const pulse = 0.55 + 0.45 * Math.abs(((frame % 36) / 18) - 1);
  return (
    <div style={{ position: 'absolute', top, left: x + 28, width: w - 56, fontFamily: FONT_MONO, fontSize: size, lineHeight: `${lineH}px` }}>
      {shown.map((l, i) => (
        <div key={`${l[0]}-${i}`} style={{ display: 'flex', gap: 10, color: FEED_COLORS[l[1]], opacity: interpolate(frame, [l[0], l[0] + 6], [0, 1], CLAMP), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ color: l[1] === 'tool' ? V.coral : l[1] === 'ok' ? '#7ee2b8' : l[1] === 'err' ? '#e56b6b' : V.faint, flexShrink: 0 }}>
            {l[1] === 'tool' ? '⏺' : '⎿'}
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{l[2]}</span>
        </div>
      ))}
      {spinOn && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: V.coral, opacity: pulse }}>
          <span>✳</span>
          <span style={{ color: V.dim, fontFamily: FONT_BODY, fontSize: size - 1 }}>{spinner.label} <span style={{ color: V.faint }}>(esc to interrupt)</span></span>
        </div>
      )}
    </div>
  );
};

// --------------------------------------------------------------- input dock
// The real composer: text row (placeholder / typed / queued), then the control
// row (+, /, Auto mode, send). Multi-line typing renders with pre-wrap.
export const ClaudeInputDock: React.FC<{
  x: number; w: number;
  typed?: React.ReactNode; // currently-typed text (before send); nodes allowed for highlights
  sent?: boolean;          // after send: placeholder + stop button
  cursorOn?: boolean;
  bottom?: number;
}> = ({ x, w, typed = '', sent = false, cursorOn = false, bottom = 28 }) => (
  <div style={{ position: 'absolute', bottom, left: x + 20, width: w - 40 }}>
    <div style={{ background: V.input, border: `1px solid ${sent ? V.inputBorder : V.coral}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', padding: '18px 22px', minHeight: 30 }}>
        {sent ? (
          <span style={{ flex: 1, color: V.faint, fontSize: 24 }}>Queue another message…</span>
        ) : typed ? (
          <span style={{ flex: 1, color: V.text, fontFamily: FONT_MONO, fontSize: 24, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
            {typed}<span style={{ opacity: cursorOn ? 1 : 0, color: V.coral }}>▌</span>
          </span>
        ) : (
          <span style={{ flex: 1, color: V.faint, fontSize: 24 }}>ctrl esc to focus or unfocus Claude</span>
        )}
        <Mic size={23} color={V.dim} strokeWidth={2} style={{ marginTop: 4 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 18px 15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Plus size={25} color={V.dim} strokeWidth={2} />
          <div style={{ width: 34, height: 29, borderRadius: 8, border: `1px solid ${V.inputBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Slash size={17} color={V.dim} strokeWidth={2} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Zap size={19} color={V.dim} strokeWidth={2} /><span style={{ color: V.dim, fontSize: 22 }}>Auto mode</span>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: sent ? V.input : '#c8785b', border: sent ? `1px solid ${V.inputBorder}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {sent ? <Square size={16} color={V.text} fill={V.text} /> : <ArrowUp size={23} color="#f6efe9" strokeWidth={2.4} />}
          </div>
        </div>
      </div>
    </div>
  </div>
);
