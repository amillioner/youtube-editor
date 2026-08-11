import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  Search, Bell, Plus, ChevronDown, Star, GitFork, Eye, Folder, FileText, Scale,
  Lock, Globe, Check, CodeXml, GitBranch,
} from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, Ring, chromeH } from '../../lib/browser';

// =============================================================================
// B5 step 1 — "You just open the template repo I built for you. Click Use this
// template and make it private. That's your brain."  Master span 287.032167–296.632167.
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Cursor-driven walkthrough on a TSX clone of github.com/hassancs91/
// brainoutside-template (the real repo, real top-level tree).
//   "You just open"        288.50 -> f9    the repo page is up
//   click "Use this…"      292.36 -> f125  (cursor arrives f120, the RESULT is on the word)
//   "private."             294.28 -> f182  (radio fills f180–187)
//   "That's your brain."   295.18 -> f209  (created private repo + "your brain" chip)
// Holds the repo page over "Now open it in…" so the VS Code cut lands on "VS Code".
// =============================================================================
export const compositionConfig = { id: 'B5TemplateRepo', durationInSeconds: 9.6, fps: 30, width: 1920, height: 1080 };

// GitHub light-theme surface colors. A real third-party UI gets its own local
// palette (same pattern as the Cloudflare page in shots/example/CreditsStat);
// brand tokens stay reserved for OUR chrome (cursor, rings, step rail).
const GH = {
  bg: '#ffffff', canvas: '#f6f8fa', border: '#d1d9e0', line: '#eaeef2',
  text: '#1f2328', dim: '#59636e', link: '#0969da', green: '#1f883d',
  folder: '#54aeff', on: '#ffffff', topic: '#ddf4ff', active: '#fd8c73',
} as const;

const BOX = { x: 150, y: 30, w: 1620, h: 862 };
const PX = BOX.x, PY = BOX.y + chromeH();          // page-region origin, canvas px
const PW = BOX.w, PH = BOX.h - chromeH();          // 1620 x 760

// cue frames
const PAGE2_AT = 125;   // "Use this template" click result  (292.36)
const PRIV_AT = 180;    // private radio click -> resolves on "private." (294.28 -> f182)
const CREATE_AT = 196;  // "Create repository" click
const PAGE3_AT = 202;   // the created repo
const BRAIN_AT = 209;   // "That's your brain."             (295.18)

// layout, in PAGE-LOCAL px (canvas = P{X,Y} + local)
const CARD = { x: 24, y: 190, w: 1208 };
const ROW_H = 40, HEAD_H = 56;
const USE_BTN = { x: 782, y: 198, w: 268, h: 42 };
const CODE_BTN = { x: 1062, y: 198, w: 126, h: 42 };
const PRIV_RADIO = { x: 322, y: 595 };
const CREATE_BTN = { x: 1080, y: 664, w: 240, h: 52 };

// ------------------------------------------------------------------ GitHub mark
const GhMark: React.FC<{ size?: number; color?: string }> = ({ size = 30, color = GH.text }) => (
  <svg width={size} height={size} viewBox="0 0 16 16">
    <path
      fill={color}
      d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
    />
  </svg>
);

// ------------------------------------------------------------------ cursor
type Key = { frame: number; x: number; y: number };
const KEYS: Key[] = [
  { frame: 0, x: PX + 1420, y: PY + 640 },
  { frame: 96, x: PX + 1420, y: PY + 640 },
  { frame: 120, x: PX + USE_BTN.x + USE_BTN.w / 2, y: PY + USE_BTN.y + USE_BTN.h / 2 },
  { frame: 152, x: PX + USE_BTN.x + USE_BTN.w / 2, y: PY + USE_BTN.y + USE_BTN.h / 2 },
  { frame: 176, x: PX + PRIV_RADIO.x, y: PY + PRIV_RADIO.y },
  { frame: 184, x: PX + PRIV_RADIO.x, y: PY + PRIV_RADIO.y },
  { frame: 194, x: PX + CREATE_BTN.x + CREATE_BTN.w / 2, y: PY + CREATE_BTN.y + CREATE_BTN.h / 2 },
];
const CLICKS = [PAGE2_AT, PRIV_AT, CREATE_AT];

const sample = (frame: number, keys: Key[]) => {
  if (frame <= keys[0].frame) return { x: keys[0].x, y: keys[0].y };
  const last = keys[keys.length - 1];
  if (frame >= last.frame) return { x: last.x, y: last.y };
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].frame <= frame) i++;
  const a = keys[i], b = keys[i + 1];
  const t = interpolate(frame, [a.frame, b.frame], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
};

const CursorLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const p = sample(frame, KEYS);
  const press = CLICKS.reduce((acc, cf) => {
    if (frame < cf - 4 || frame > cf + 8) return acc;
    return interpolate(frame, [cf - 4, cf, cf + 8], [1, 0.8, 1], CLAMP);
  }, 1);
  const op = interpolate(frame, [CREATE_AT + 4, CREATE_AT + 14], [1, 0], { ...CLAMP, easing: EASINGS.easeOut });
  return (
    <>
      {CLICKS.map((cf) => {
        if (frame < cf || frame > cf + 18) return null;
        const at = sample(cf, KEYS);
        const sc = interpolate(frame, [cf, cf + 18], [0, 2.4], { ...CLAMP, easing: EASINGS.easeOut });
        const ro = interpolate(frame, [cf, cf + 18], [0.55, 0], CLAMP);
        return (
          <div key={cf} style={{
            position: 'absolute', left: at.x, top: at.y, width: 34, height: 34, marginLeft: -17, marginTop: -17,
            borderRadius: '50%', border: `2px solid ${COLORS.accent}`, opacity: ro, transform: `scale(${sc})`,
          }} />
        );
      })}
      <div style={{ position: 'absolute', left: p.x, top: p.y, transform: 'translate(-4px, -3px)', opacity: op }}>
        <svg width={34} height={34} viewBox="0 0 24 24" style={{
          transform: `scale(${press})`, transformOrigin: '16% 10%',
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))', display: 'block',
        }}>
          <path d="M4.2 2.6 L4.2 18.9 L8.7 14.7 L11.9 21.6 L14.6 20.3 L11.4 13.6 L17.6 13.6 Z"
            fill="#111318" stroke="#ffffff" strokeWidth={1.4} strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};

// ------------------------------------------------------------------ page pieces
const TREE: { name: string; kind: 'folder' | 'file'; msg: string }[] = [
  { name: '.claude', kind: 'folder', msg: 'initial template' },
  { name: 'content-catalog', kind: 'folder', msg: 'initial template' },
  { name: 'identity', kind: 'folder', msg: 'initial template' },
  { name: 'knowledge', kind: 'folder', msg: 'initial template' },
  { name: 'lenses', kind: 'folder', msg: 'initial template' },
  { name: 'projects', kind: 'folder', msg: 'initial template' },
  { name: 'raw', kind: 'folder', msg: 'initial template' },
  { name: 'CLAUDE.md', kind: 'file', msg: 'the contract' },
  { name: 'INDEX.md', kind: 'file', msg: 'read this first, always' },
  { name: 'LICENSE', kind: 'file', msg: 'MIT' },
  { name: 'README.md', kind: 'file', msg: 'start here' },
];
const CARD_H = HEAD_H + TREE.length * ROW_H;

const TopBar: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 54, background: GH.canvas, borderBottom: `1px solid ${GH.border}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px' }}>
    <GhMark size={28} />
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 300, height: 32, border: `1px solid ${GH.border}`, borderRadius: 8, padding: '0 12px', color: GH.dim, background: GH.bg }}>
      <Search size={15} color={GH.dim} /><span style={{ fontSize: 17 }}>Type / to search</span>
    </div>
    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
      <Plus size={17} color={GH.dim} /><Bell size={17} color={GH.dim} />
      <span style={{ width: 28, height: 28, borderRadius: '50%', background: COLORS.accent }} />
    </div>
  </div>
);

const RepoRow: React.FC<{ r: typeof TREE[number]; y: number }> = ({ r, y }) => (
  <div style={{ position: 'absolute', left: 1, top: y, width: CARD.w - 2, height: ROW_H, display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', borderTop: `1px solid ${GH.line}` }}>
    {r.kind === 'folder'
      ? <Folder size={19} color={GH.folder} fill={GH.folder} strokeWidth={1.6} />
      : r.name === 'LICENSE' ? <Scale size={19} color={GH.dim} strokeWidth={1.8} /> : <FileText size={19} color={GH.dim} strokeWidth={1.8} />}
    <span style={{ fontFamily: FONT_MONO, fontSize: 20, color: GH.text, width: 260 }}>{r.name}</span>
    <span style={{ fontSize: 19, color: GH.dim, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.msg}</span>
    <span style={{ fontSize: 18, color: GH.dim }}>2 days ago</span>
  </div>
);

const FileCard: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD_H, border: `1px solid ${GH.border}`, borderRadius: 10, background: GH.bg, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: 20, top: 12, display: 'flex', alignItems: 'center', gap: 8, height: 34, border: `1px solid ${GH.border}`, borderRadius: 8, padding: '0 14px', background: GH.canvas }}>
      <GitBranch size={16} color={GH.dim} /><span style={{ fontSize: 18, color: GH.text, fontWeight: 600 }}>main</span><ChevronDown size={14} color={GH.dim} />
    </div>
    {children}
    {TREE.map((r, i) => <RepoRow key={r.name} r={r} y={HEAD_H + i * ROW_H} />)}
  </div>
);

const AboutCard: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: 'absolute', left: 1264, top: CARD.y, width: 332 }}>
    <div style={{ fontSize: 21, fontWeight: 600, color: GH.text, marginBottom: 14 }}>About</div>
    <div style={{ fontSize: 19, color: GH.dim, lineHeight: 1.6 }}>{text}</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
      {['markdown', 'claude-code', 'second-brain'].map((t) => (
        <span key={t} style={{ fontSize: 17, color: GH.link, background: GH.topic, borderRadius: 999, padding: '4px 12px' }}>{t}</span>
      ))}
    </div>
  </div>
);

const TitleRow: React.FC<{ owner: string; name: string; badge: React.ReactNode }> = ({ owner, name, badge }) => (
  <>
    <div style={{ position: 'absolute', left: 24, top: 70, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 28, color: GH.link }}>{owner}</span>
      <span style={{ fontSize: 28, color: GH.dim }}>/</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 28, color: GH.link, fontWeight: 700 }}>{name}</span>
      {badge}
    </div>
    <div style={{ position: 'absolute', right: 24, top: 72, display: 'flex', alignItems: 'center', gap: 12, fontSize: 18, color: GH.text }}>
      {[{ I: Eye, l: 'Watch' }, { I: GitFork, l: 'Fork' }, { I: Star, l: 'Star' }].map(({ I, l }) => (
        <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${GH.border}`, borderRadius: 8, padding: '7px 14px', background: GH.canvas }}>
          <I size={16} color={GH.dim} />{l}
        </span>
      ))}
    </div>
    <div style={{ position: 'absolute', left: 24, top: 128, display: 'flex', alignItems: 'center', gap: 30, fontSize: 20 }}>
      {['Code', 'Issues', 'Pull requests', 'Actions', 'Settings'].map((t, i) => (
        <span key={t} style={{ color: i === 0 ? GH.text : GH.dim, fontWeight: i === 0 ? 600 : 400, paddingBottom: 10, borderBottom: `2px solid ${i === 0 ? GH.active : 'transparent'}` }}>{t}</span>
      ))}
    </div>
    <div style={{ position: 'absolute', left: 0, top: 166, width: PW, height: 1, background: GH.border }} />
  </>
);

// ------------------------------------------------------------------ step rail
const STEPS = [
  { at: 9, done: PAGE2_AT, label: 'Open the template repo' },
  { at: PAGE2_AT, done: PRIV_AT + 3, label: 'Use this template' },
  { at: PRIV_AT + 3, done: BRAIN_AT, label: 'Make it private' },
];

const StepRail: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {STEPS.map((s, i) => {
        const op = interpolate(frame, [s.at, s.at + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
        const y = interpolate(frame, [s.at, s.at + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
        const dn = frame >= s.done;
        const col = dn ? COLORS.signal : COLORS.accent;
        return (
          <div key={s.label} style={{
            position: 'absolute', left: 240 + i * 480, top: 940, width: 480,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
            opacity: op, transform: `translateY(${y}px)`,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: col,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT_MONO, fontSize: 21, fontWeight: 700, color: COLORS.paper,
            }}>
              {dn ? <Check size={22} color={COLORS.paper} strokeWidth={3.4} /> : i + 1}
            </div>
            <span style={{ fontFamily: FONT_BODY, fontSize: 30, fontWeight: 500, color: COLORS.ink }}>{s.label}</span>
          </div>
        );
      })}
    </>
  );
};

// ------------------------------------------------------------------ shot
const VIS = [
  { Icon: Globe, name: 'Public', desc: 'Anyone on the internet can see this repository.', top: 486, priv: false },
  { Icon: Lock, name: 'Private', desc: 'You choose who can see and commit to this repository.', top: 564, priv: true },
];

const B5TemplateRepo: React.FC = () => {
  const frame = useCurrentFrame();
  const privFill = interpolate(frame, [PRIV_AT, PRIV_AT + 7], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const brainOp = interpolate(frame, [BRAIN_AT, BRAIN_AT + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const brainY = interpolate(frame, [BRAIN_AT, BRAIN_AT + 14], [18, 0], { ...CLAMP, easing: EASINGS.easeOut });

  const page = frame >= PAGE3_AT ? 3 : frame >= PAGE2_AT ? 2 : 1;
  const url = page === 1 ? 'github.com/hassancs91/brainoutside-template'
    : page === 2 ? 'github.com/new?template=brainoutside-template'
      : 'github.com/hassancs91/my-brain';
  const tab = page === 3 ? 'hassancs91/my-brain'
    : page === 2 ? 'Create a New Repository'
      : 'hassancs91/brainoutside-template';

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <WebBrowserFrame url={url} tabTitle={tab} favicon={<GhMark size={20} />} box={BOX} appearAt={0}>
        <div style={{ position: 'relative', width: PW, height: PH, background: GH.bg, color: GH.text }}>
          <TopBar />

          {/* -------- page 1: the template repo -------- */}
          {page === 1 && (
            <>
              <TitleRow
                owner="hassancs91" name="brainoutside-template"
                badge={<span style={{ fontSize: 17, color: GH.dim, border: `1px solid ${GH.border}`, borderRadius: 999, padding: '5px 14px' }}>Public template</span>}
              />
              <FileCard>
                <div style={{ position: 'absolute', left: USE_BTN.x, top: USE_BTN.y - CARD.y, width: USE_BTN.w, height: USE_BTN.h, background: GH.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: SHADOW.soft }}>
                  <span style={{ fontSize: 20, fontWeight: 600, color: GH.on }}>Use this template</span>
                  <ChevronDown size={15} color={GH.on} />
                </div>
                <div style={{ position: 'absolute', left: CODE_BTN.x, top: CODE_BTN.y - CARD.y, width: CODE_BTN.w, height: CODE_BTN.h, background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CodeXml size={17} color={GH.dim} /><span style={{ fontSize: 20, fontWeight: 600 }}>Code</span>
                </div>
              </FileCard>
              <AboutCard text="A brain you own: markdown notes in a git repo, read and written by two Claude Code skills." />
            </>
          )}

          {/* -------- page 2: create a repo from the template -------- */}
          {page === 2 && (
            <>
              <div style={{ position: 'absolute', left: 300, top: 84, fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 600 }}>Create a new repository</div>
              <div style={{ position: 'absolute', left: 300, top: 148, width: 1020, fontSize: 20, color: GH.dim }}>
                This will create a new repository from{' '}
                <span style={{ fontFamily: FONT_MONO, color: GH.text }}>hassancs91/brainoutside-template</span>
              </div>
              <div style={{ position: 'absolute', left: 300, top: 190, width: 1020, height: 1, background: GH.border }} />

              <div style={{ position: 'absolute', left: 300, top: 212, fontSize: 19, fontWeight: 600 }}>Owner *</div>
              <div style={{ position: 'absolute', left: 648, top: 212, fontSize: 19, fontWeight: 600 }}>Repository name *</div>
              <div style={{ position: 'absolute', left: 300, top: 240, width: 300, height: 52, border: `1px solid ${GH.border}`, borderRadius: 8, background: GH.canvas, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
                <span style={{ width: 26, height: 26, borderRadius: '50%', background: COLORS.accent }} />
                <span style={{ fontSize: 21 }}>hassancs91</span>
                <ChevronDown size={16} color={GH.dim} style={{ marginLeft: 'auto' }} />
              </div>
              <div style={{ position: 'absolute', left: 614, top: 252, fontSize: 26, color: GH.dim }}>/</div>
              <div style={{ position: 'absolute', left: 648, top: 240, width: 460, height: 52, border: `1px solid ${GH.border}`, borderRadius: 8, background: GH.bg, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 21 }}>my-brain</span>
              </div>

              <div style={{ position: 'absolute', left: 300, top: 322, fontSize: 19, fontWeight: 600 }}>Description (optional)</div>
              <div style={{ position: 'absolute', left: 300, top: 350, width: 1020, height: 52, border: `1px solid ${GH.border}`, borderRadius: 8, background: GH.bg, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                <span style={{ fontSize: 21, color: GH.dim }}>my brain</span>
              </div>
              <div style={{ position: 'absolute', left: 300, top: 434, width: 1020, height: 1, background: GH.border }} />
              <div style={{ position: 'absolute', left: 300, top: 452, fontSize: 21, fontWeight: 600 }}>Visibility</div>

              {VIS.map((o) => {
                const sel = o.priv ? privFill : 1 - privFill;
                const on = sel > 0.5;
                return (
                  <div key={o.name} style={{ position: 'absolute', left: 300, top: o.top, width: 1020, height: 62, display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${on ? COLORS.accent : GH.border}`, marginLeft: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: COLORS.accent, transform: `scale(${sel})` }} />
                    </div>
                    <o.Icon size={26} color={on ? COLORS.accent : GH.dim} strokeWidth={1.9} />
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 600, color: on ? COLORS.accent : GH.text }}>{o.name}</div>
                      <div style={{ fontSize: 19, color: GH.dim, marginTop: 2 }}>{o.desc}</div>
                    </div>
                    {o.priv && frame >= PRIV_AT && <Ring start={PRIV_AT + 1} color={COLORS.accent} style={{ inset: -10, borderRadius: 12 }} />}
                  </div>
                );
              })}

              <div style={{ position: 'absolute', left: CREATE_BTN.x, top: CREATE_BTN.y, width: CREATE_BTN.w, height: CREATE_BTN.h, background: GH.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 21, fontWeight: 600, color: GH.on }}>Create repository</span>
              </div>
            </>
          )}

          {/* -------- page 3: the created private repo -------- */}
          {page === 3 && (
            <>
              <TitleRow
                owner="hassancs91" name="my-brain"
                badge={
                  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 17, color: GH.dim, border: `1px solid ${GH.border}`, borderRadius: 999, padding: '5px 14px' }}>
                    <Lock size={14} color={GH.dim} />Private
                    <Ring start={PAGE3_AT + 2} color={COLORS.accent} style={{ inset: -7, borderRadius: 999 }} />
                  </span>
                }
              />
              <div style={{
                position: 'absolute', left: 560, top: 64, display: 'inline-flex', alignItems: 'center', gap: 10,
                background: `${COLORS.signal}1f`, border: `1px solid ${COLORS.signal}`, borderRadius: RADIUS.pill,
                padding: '8px 20px', opacity: brainOp, transform: `translateY(${brainY}px)`,
              }}>
                <Check size={19} color={COLORS.signal} strokeWidth={3.2} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 21, color: COLORS.signal, fontWeight: 500 }}>your brain</span>
              </div>
              <FileCard>
                <div style={{ position: 'absolute', left: CODE_BTN.x, top: CODE_BTN.y - CARD.y, width: CODE_BTN.w, height: CODE_BTN.h, background: GH.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <CodeXml size={17} color={GH.on} /><span style={{ fontSize: 20, fontWeight: 600, color: GH.on }}>Code</span>
                </div>
              </FileCard>
              <AboutCard text="my brain" />
            </>
          )}
        </div>
      </WebBrowserFrame>

      <CursorLayer />
      <StepRail />
    </AbsoluteFill>
  );
};
export default B5TemplateRepo;
