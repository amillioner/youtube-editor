import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import {
  LayoutDashboard, Files, Waypoints, Inbox, KeyRound, MessageSquare, Brain,
  Search, Check, X, Shield, Plus, Clock, Circle, Globe, Lock, Sparkles,
} from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, chromeH } from '../../lib/browser';
import { GithubMark } from './_shared/marks';

// =============================================================================
// B9 — the quick tour of the BrainOutside dashboard. Six pages, hard cuts on the
// nav clicks, one in-page filter as a crossfade, three ken-burns pushes on the
// payoff of each half. This is OUR product's UI, so it wears the brand palette
// (unlike the GitHub / Coolify clones, which must look like the real product).
// Contents are the REAL brain: 3 identity / 10 project / 32 knowledge notes, and
// the cost story + the downtime take really do both point at the self-hosting lens.
//
// Master span 619.896967–662.596967. Local frame = round((master - 619.896967) * 30).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Cues (verified against work/edited-transcript.json):
//   "dashboard." 623.77->f26 · "rings" 625.00->f63 · identity 627.07->f125 ·
//   projects 627.73->f145 · knowledge 628.43->f166 ·
//   "browser," 629.25->f191 · "every note" 630.20->f219 · "filterable." 630.86->f239 ·
//   "markdown" 632.62->f292 · "rendered." 634.46->f347 ·
//   "graph," 635.76->f386 · "what links to what." 636.56->f410 ·
//   "cost story" 638.33->f463 · "downtime take" 639.27->f491 ·
//   "both point at" 640.24->f520 · "self hosting." 641.15->f548 ·
//   "ask about self hosting" 643.13->f607 · "both show up." 644.65->f653 ·
//   "queue," 646.82->f718 · "everything an agent wants to write" 647.30->f732 ·
//   "waiting on me." 649.57->f800 · "Nothing gets in behind my back." 650.85->f839 ·
//   "consumers" 653.66->f923 · "who is reading my brain," 654.79->f957 ·
//   "the MCP API keys" 656.70->f1014 ·
//   "chat." 660.07->f1115 · "This is me talking to me." 660.81->f1137 ·
//   "here things become really strange." 663.28->f1211.
// Ends at 663.7648, just before "You heard me saying MCP and API" (665.69).
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B9DashboardTour', durationInSeconds: 42.7, fps: 30, width: 1920, height: 1080 };

// ---- geometry ----------------------------------------------------------------
const BOX = { x: 70, y: 46, w: 1780, h: 988 };
const PX = BOX.x, PY = BOX.y + chromeH();
const PW = BOX.w, PH = BOX.h - chromeH();     // 1780 x 886
const SB_W = 300, TOP_H = 78;
const CW = PW - SB_W, CH = PH - TOP_H;        // content 1480 x 808

// ---- page cut frames ---------------------------------------------------------
const P_BROWSER = 189;
const P_GRAPH = 384;
const P_QUEUE = 716;
const P_CONSUMERS = 921;
const P_CHAT = 1113;

// ---- in-page cues ------------------------------------------------------------
const RING_AT = [125, 145, 166];    // identity / projects / knowledge
const FILTER_AT = 239;              // "filterable."
const RENDER_ZOOM = [280, 347] as const;
const EDGES_AT = 410;
const COST_AT = 463;
const DOWN_AT = 491;
const POINT_AT = 520;
const QUERY_AT = 581;               // graph search applied
const BOTH_AT = 653;
const SOURCE_AT = 732;
const WAITING_AT = 800;
const NOBACK_AT = 839;
const WHO_AT = 957;
const KEYS_AT = 1014;
const ASK_AT = 1120;
const REPLY_AT = 1149;
const CITE_AT = 1185;
const CHAT_ZOOM = [1207, 1262] as const;

const NAV = [
  { key: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard, at: 0 },
  { key: 'browser', label: 'Browser', Icon: Files, at: P_BROWSER },
  { key: 'graph', label: 'Graph', Icon: Waypoints, at: P_GRAPH },
  { key: 'queue', label: 'Queue', Icon: Inbox, at: P_QUEUE },
  { key: 'consumers', label: 'Consumers', Icon: KeyRound, at: P_CONSUMERS },
  { key: 'chat', label: 'Chat', Icon: MessageSquare, at: P_CHAT },
];
const ITEM_Y = [96, 164, 232, 300, 368, 436];
const ITEM_H = 62;

const navAt = (frame: number) =>
  frame >= P_CHAT ? 5 : frame >= P_CONSUMERS ? 4 : frame >= P_QUEUE ? 3
    : frame >= P_GRAPH ? 2 : frame >= P_BROWSER ? 1 : 0;

// ---- cursor ------------------------------------------------------------------
type Key = { frame: number; x: number; y: number };
const navTarget = (i: number) => ({ x: PX + 150, y: PY + ITEM_Y[i] + ITEM_H / 2 });
const KEYS: Key[] = [
  { frame: 0, x: PX + 980, y: PY + 520 },
  { frame: 120, x: PX + 980, y: PY + 520 },
  { frame: 183, ...navTarget(1) },
  { frame: 210, ...navTarget(1) },
  { frame: 234, x: PX + SB_W + 583, y: PY + TOP_H + 49 },   // the "lesson" filter chip
  { frame: 262, x: PX + SB_W + 583, y: PY + TOP_H + 49 },
  { frame: 276, x: PX + SB_W + 1000, y: PY + TOP_H + 400 },
  { frame: 360, x: PX + SB_W + 1000, y: PY + TOP_H + 400 },
  { frame: 378, ...navTarget(2) },
  { frame: 430, ...navTarget(2) },
  { frame: 470, x: PX + SB_W + 300, y: PY + TOP_H + 190 },  // over the cost story node
  { frame: 500, x: PX + SB_W + 300, y: PY + TOP_H + 610 },  // over the downtime take
  { frame: 560, x: PX + SB_W + 1230, y: PY + TOP_H + 44 },  // the graph search field
  { frame: 596, x: PX + SB_W + 1230, y: PY + TOP_H + 44 },
  { frame: 700, ...navTarget(3) },
  { frame: 745, ...navTarget(3) },
  { frame: 790, x: PX + SB_W + 220, y: PY + TOP_H + 192 },  // the source column
  { frame: 840, x: PX + SB_W + 1270, y: PY + TOP_H + 190 }, // the approve column
  { frame: 900, ...navTarget(4) },
  { frame: 960, ...navTarget(4) },
  { frame: 1010, x: PX + SB_W + 1300, y: PY + TOP_H + 40 }, // "New API key"
  { frame: 1080, x: PX + SB_W + 1300, y: PY + TOP_H + 40 },
  { frame: 1104, ...navTarget(5) },
  { frame: 1150, x: PX + SB_W + 740, y: PY + TOP_H + 700 },
];
const CLICKS = [186, 236, 381, 578, 713, 918, 1107];
// the pointer steps out of the way while a ken-burns push is running
const HIDE: [number, number][] = [[274, 366], [594, 700], [1200, 1300]];

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
    return interpolate(frame, [cf - 4, cf, cf + 8], [1, 0.78, 1], CLAMP);
  }, 1);
  const op = HIDE.reduce((acc, [a, b]) => acc * interpolate(frame, [a - 10, a, b, b + 10], [1, 0, 0, 1], CLAMP), 1);
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

// ---- small shared bits -------------------------------------------------------
const Hilite: React.FC<{ at: number; style?: React.CSSProperties; color?: string }> = ({ at, style, color = COLORS.accent }) => {
  const frame = useCurrentFrame();
  const op = interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const sc = interpolate(frame, [at, at + 16], [1.05, 1], { ...CLAMP, easing: EASINGS.easeOut });
  if (frame < at) return null;
  return <div style={{ position: 'absolute', inset: -10, border: `3px solid ${color}`, borderRadius: 16, opacity: op, transform: `scale(${sc})`, ...style }} />;
};

const Badge: React.FC<{ kind: string }> = ({ kind }) => {
  const c = kind === 'lesson' ? COLORS.signal : kind === 'take' ? COLORS.accent2
    : kind === 'story' ? COLORS.warn : kind === 'project' ? COLORS.accent
      : kind === 'identity' ? COLORS.danger : COLORS.muted;
  return (
    <span style={{
      fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 1, color: c,
      background: `${c}18`, border: `1px solid ${c}44`, borderRadius: RADIUS.pill, padding: '3px 12px',
    }}>{kind}</span>
  );
};

const Panel: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; pad?: number }> =
  ({ x, y, w, h, children, pad = 0 }) => (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h, boxSizing: 'border-box',
      background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card,
      boxShadow: SHADOW.card, padding: pad, overflow: 'hidden',
    }}>{children}</div>
  );

// =============================== page 1: dashboard ============================
const KINDS = [
  { name: 'identity', n: 3, color: COLORS.accent2, sub: 'who you are, how you write' },
  { name: 'projects', n: 10, color: COLORS.accent, sub: 'what you are building' },
  { name: 'knowledge', n: 32, color: COLORS.signal, sub: 'facts, lessons, stories, takes' },
];
// 3 + 10 + 32 + 4 = 49 entities. The three rings are the kinds he NAMES out loud
// (627.07 / 627.73 / 628.43); catalogs and lenses are the remaining 4 and ride in
// the summary strip, so the on-screen total agrees with the get-index shot at 685.62.
const TOTAL = 49;
const EXTRA = 4;
const RECENT = [
  { t: 'Lesson: Coolify injects every compose variable as an empty string', k: 'lesson', w: '2 hours ago' },
  { t: 'Hasan’s take: the combination is the engine, not the model', k: 'take', w: '5 hours ago' },
  { t: 'Fact: the open source Claude Code video editor', k: 'fact', w: 'yesterday' },
  { t: 'The story of adding up my cloud bills', k: 'story', w: '3 days ago' },
];

const KindRing: React.FC<{ at: number; n: number; color: string }> = ({ at, n, color }) => {
  const frame = useCurrentFrame();
  const R = 84, C = 2 * Math.PI * R;
  const p = interpolate(frame, [at, at + 28], [0, n / TOTAL], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <svg width={210} height={210} style={{ display: 'block' }}>
      <circle cx={105} cy={105} r={R} fill="none" stroke={COLORS.line} strokeWidth={17} />
      <circle cx={105} cy={105} r={R} fill="none" stroke={color} strokeWidth={17} strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform="rotate(-90 105 105)" />
    </svg>
  );
};

const DashboardPage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {KINDS.map((k, i) => {
        const x = 34 + i * 490;
        const lift = interpolate(frame, [RING_AT[i], RING_AT[i] + 14], [0, -8], { ...CLAMP, easing: EASINGS.easeOut });
        return (
          <div key={k.name} style={{ position: 'absolute', left: x, top: 20, width: 450, height: 410, transform: `translateY(${lift}px)` }}>
            <Panel x={0} y={0} w={450} h={410}>
              <div style={{ position: 'absolute', left: 0, top: 34, width: 450, display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <KindRing at={8 + i * 9} n={k.n} color={k.color} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 76, color: COLORS.ink }}>{k.n}</span>
                  </div>
                </div>
              </div>
              <div style={{ position: 'absolute', left: 0, top: 276, width: 450, textAlign: 'center', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: COLORS.ink }}>{k.name}</div>
              <div style={{ position: 'absolute', left: 0, top: 330, width: 450, textAlign: 'center', fontSize: 22, color: COLORS.muted }}>{k.sub}</div>
            </Panel>
            <Hilite at={RING_AT[i]} color={k.color} style={{ borderRadius: 22 }} />
          </div>
        );
      })}

      {/* the remaining 4 entities, so the total on screen is the same 49 the
          get-index shot reports 20 seconds later */}
      <Panel x={34} y={444} w={1412} h={58}>
        <div style={{ position: 'absolute', left: 26, top: 0, height: 58, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 15, height: 15, borderRadius: '50%', background: COLORS.muted, opacity: 0.45 }} />
          <span style={{ fontSize: 23, color: COLORS.muted }}>catalogs and lenses</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 25, color: COLORS.ink }}>{EXTRA}</span>
        </div>
        <div style={{ position: 'absolute', right: 26, top: 0, height: 58, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>3 + 10 + 32 + 4</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>=</span>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 27, color: COLORS.accent }}>{TOTAL} notes</span>
        </div>
      </Panel>

      <Panel x={34} y={518} w={1412} h={268}>
        <div style={{ position: 'absolute', left: 30, top: 22, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, letterSpacing: 1, color: COLORS.muted }}>RECENT</div>
        {RECENT.map((r, i) => (
          <div key={r.t} style={{ position: 'absolute', left: 30, top: 70 + i * 48, width: 1352, height: 44, display: 'flex', alignItems: 'center', gap: 18, borderTop: i ? `1px solid ${COLORS.line}` : 'none' }}>
            <Badge kind={r.k} />
            <span style={{ fontSize: 23, color: COLORS.ink, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.t}</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 19, color: COLORS.muted }}>{r.w}</span>
          </div>
        ))}
      </Panel>
    </>
  );
};

// =============================== page 2: browser ==============================
const CHIPS = [
  { k: 'all', n: 49 }, { k: 'identity', n: 3 }, { k: 'project', n: 10 }, { k: 'fact', n: 9 },
  { k: 'lesson', n: 10 }, { k: 'story', n: 4 }, { k: 'take', n: 9 }, { k: 'catalog', n: 3 }, { k: 'lens', n: 1 },
];
const ALL_ROWS = [
  { t: 'Who Hasan is', k: 'identity', p: 'identity/core.md' },
  { t: 'How Hasan writes', k: 'identity', p: 'identity/voice.md' },
  { t: 'pyrunner', k: 'project', p: 'projects/pyrunner.md' },
  { t: 'simplerllm', k: 'project', p: 'projects/simplerllm.md' },
  { t: 'Fact: SimplerLLM, one interface for every LLM', k: 'fact', p: 'knowledge/facts/...' },
  { t: 'Lesson: claim the Coolify admin account first', k: 'lesson', p: 'knowledge/lessons/...' },
  { t: 'The story of adding up my cloud bills', k: 'story', p: 'knowledge/stories/...' },
  { t: 'Take: the maintenance burden is measured in seconds', k: 'take', p: 'knowledge/takes/...' },
];
const LESSON_ROWS = [
  { t: 'Lesson: claim the Coolify admin account first', k: 'lesson', p: 'knowledge/lessons/...' },
  { t: 'Lesson: Coolify injects every compose variable as empty', k: 'lesson', p: 'knowledge/lessons/...' },
  { t: 'Lesson: the Coolify service catalog is not a promise', k: 'lesson', p: 'knowledge/lessons/...' },
  { t: 'Lesson: self hosted SMTP lives or dies on port 25 and PTR', k: 'lesson', p: 'knowledge/lessons/...' },
  { t: 'Lesson: Mautic 7 needs its own cron and worker containers', k: 'lesson', p: 'knowledge/lessons/...' },
  { t: 'Lesson: MinIO stripped its console', k: 'lesson', p: 'knowledge/lessons/...' },
  { t: 'Lesson: transcription quality is the foundation', k: 'lesson', p: 'knowledge/lessons/...' },
  { t: 'Lesson: three levels of free image generation', k: 'lesson', p: 'knowledge/lessons/...' },
];

const NoteList: React.FC<{ rows: typeof ALL_ROWS; op: number }> = ({ rows, op }) => (
  <div style={{ position: 'absolute', inset: 0, opacity: op }}>
    {rows.map((r, i) => (
      <div key={r.t} style={{ position: 'absolute', left: 0, top: i * 76, width: 552, height: 76, padding: '14px 26px', boxSizing: 'border-box', borderBottom: `1px solid ${COLORS.line}`, background: i === 5 ? `${COLORS.accent}0e` : 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Badge kind={r.k} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 16, color: COLORS.muted, marginLeft: 'auto' }}>{r.p}</span>
        </div>
        <div style={{ fontSize: 21, color: COLORS.ink, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.t}</div>
      </div>
    ))}
  </div>
);

const BrowserPage: React.FC = () => {
  const frame = useCurrentFrame();
  const f = interpolate(frame, [FILTER_AT, FILTER_AT + 8], [0, 1], CLAMP);
  return (
    <>
      {/* filter rail */}
      <div style={{ position: 'absolute', left: 34, top: 26, display: 'flex', alignItems: 'center', gap: 10 }}>
        {CHIPS.map((c) => {
          const on = c.k === 'lesson' ? f : c.k === 'all' ? 1 - f : 0;
          return (
            <div key={c.k} style={{
              display: 'flex', alignItems: 'center', gap: 8, height: 46, padding: '0 15px', boxSizing: 'border-box',
              borderRadius: RADIUS.pill,
              background: on > 0.5 ? COLORS.accent : COLORS.paper,
              border: `1.5px solid ${on > 0.5 ? COLORS.accent : COLORS.line}`,
            }}>
              <span style={{ fontFamily: FONT_BODY, fontWeight: 500, fontSize: 21, color: on > 0.5 ? COLORS.paper : COLORS.ink }}>{c.k}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: on > 0.5 ? `${COLORS.paper}cc` : COLORS.muted }}>{c.n}</span>
            </div>
          );
        })}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 46, width: 254, padding: '0 18px', boxSizing: 'border-box', marginLeft: 14, borderRadius: RADIUS.pill, border: `1.5px solid ${COLORS.line}`, background: COLORS.paper }}>
          <Search size={19} color={COLORS.muted} />
          <span style={{ fontSize: 20, color: COLORS.muted }}>search notes</span>
        </div>
      </div>

      {/* count */}
      <div style={{ position: 'absolute', left: 36, top: 96, fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>
        {f > 0.5 ? '10 of 49 notes' : '49 notes'}
      </div>

      {/* list pane */}
      <Panel x={34} y={128} w={554} h={608}>
        <NoteList rows={ALL_ROWS} op={1 - f} />
        <NoteList rows={LESSON_ROWS} op={f} />
      </Panel>

      {/* rendered pane */}
      <Panel x={614} y={128} w={832} h={608}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 832, height: 64, borderBottom: `1px solid ${COLORS.line}`, background: COLORS.cream, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', boxSizing: 'border-box' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 17, color: COLORS.muted, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>knowledge/lessons/lesson-2026-05-coolify-claim-admin-first.md</span>
          <div style={{ display: 'flex', border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.pill, overflow: 'hidden' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 16, color: COLORS.muted, padding: '6px 14px' }}>raw</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 16, color: COLORS.paper, background: COLORS.accent, padding: '6px 14px' }}>rendered</span>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 34, top: 92, width: 764 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: COLORS.ink, lineHeight: 1.2 }}>
            On a fresh Coolify, claim the admin account first
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 16 }}>
            <Badge kind="lesson" />
            <span style={{ fontFamily: FONT_MONO, fontSize: 17, color: COLORS.muted }}>last verified 2026-05-18</span>
          </div>
          <div style={{ fontSize: 24, color: COLORS.ink, lineHeight: 1.55, marginTop: 26 }}>
            The first account that registers on a fresh Coolify install owns the server. There is no invite step, and no second chance.
          </div>
          {['Register in the first minutes of the install.', 'Keep the port closed to the world until you have.', 'If someone else claims it, you reinstall.'].map((b) => (
            <div key={b} style={{ display: 'flex', gap: 14, marginTop: 16 }}>
              <span style={{ color: COLORS.accent, fontSize: 24, lineHeight: 1.4 }}>&bull;</span>
              <span style={{ fontSize: 23, color: COLORS.ink, lineHeight: 1.4 }}>{b}</span>
            </div>
          ))}
          <div style={{ marginTop: 26, background: COLORS.d900, borderRadius: 10, padding: '16px 22px' }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.d300 }}>ufw deny 8000/tcp</span>
          </div>
        </div>
      </Panel>
    </>
  );
};

// =============================== page 3: graph ================================
const HERO = [
  { id: 'cost', x: 300, y: 190, k: 'story', t: 'The story of adding up my cloud bills', at: COST_AT },
  { id: 'down', x: 300, y: 610, k: 'take', t: 'The maintenance burden is measured in seconds', at: DOWN_AT },
];
const LENS = { x: 800, y: 400 };
const DOTS = [
  { x: 1180, y: 160, t: 'pyrunner' },
  { x: 1290, y: 380, t: 'SMTP port 25' },
  { x: 1200, y: 610, t: 'toolerbox' },
  { x: 880, y: 720, t: 'cloud bills 2026' },
  { x: 900, y: 96, t: 'beliefs' },
];

const GraphPage: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1) => interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: EASINGS.easeOut });
  const dim = r(QUERY_AT, QUERY_AT + 16, 1, 0.2);
  const lit = interpolate(frame, [POINT_AT, POINT_AT + 18], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const lensPulse = interpolate(frame, [POINT_AT, POINT_AT + 12, POINT_AT + 26], [1, 1.07, 1], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <>
      {/* search field */}
      <div style={{ position: 'absolute', left: 1060, top: 18, width: 386, height: 52, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', borderRadius: RADIUS.pill, background: COLORS.paper, border: `1.5px solid ${frame >= QUERY_AT ? COLORS.accent : COLORS.line}` }}>
        <Search size={20} color={frame >= QUERY_AT ? COLORS.accent : COLORS.muted} />
        {frame >= QUERY_AT
          ? <span style={{ fontFamily: FONT_MONO, fontSize: 21, color: COLORS.ink }}>self hosting</span>
          : <span style={{ fontSize: 21, color: COLORS.muted }}>search the graph</span>}
      </div>
      <div style={{ position: 'absolute', left: 34, top: 26, fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>49 nodes, 132 links</div>

      {/* edges */}
      <svg width={CW} height={CH} style={{ position: 'absolute', left: 0, top: 0 }}>
        {DOTS.map((d, i) => {
          const a = EDGES_AT + i * 4;
          const p = interpolate(frame, [a, a + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
          const len = Math.hypot(d.x - LENS.x, d.y - LENS.y);
          return (
            <line key={d.t} x1={LENS.x} y1={LENS.y} x2={d.x} y2={d.y} stroke={COLORS.muted} strokeOpacity={0.32 * dim}
              strokeWidth={2} strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
          );
        })}
        {HERO.map((h, i) => {
          const a = EDGES_AT + 2 + i * 6;
          const p = interpolate(frame, [a, a + 18], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
          const len = Math.hypot(h.x - LENS.x, h.y - LENS.y);
          return (
            <g key={h.id}>
              <line x1={h.x} y1={h.y} x2={LENS.x} y2={LENS.y} stroke={COLORS.muted} strokeOpacity={0.4}
                strokeWidth={2.5} strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
              <line x1={h.x} y1={h.y} x2={LENS.x} y2={LENS.y} stroke={COLORS.accent} strokeOpacity={lit * 0.95}
                strokeWidth={6} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
            </g>
          );
        })}
      </svg>

      {/* context dots */}
      {DOTS.map((d, i) => {
        const a = EDGES_AT + i * 4;
        return (
          <div key={d.t} style={{ position: 'absolute', left: d.x - 90, top: d.y - 34, width: 180, opacity: interpolate(frame, [a, a + 14], [0, 1], CLAMP) * dim, textAlign: 'center' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: COLORS.muted, opacity: 0.5, margin: '0 auto' }} />
            <div style={{ fontFamily: FONT_MONO, fontSize: 17, color: COLORS.muted, marginTop: 8 }}>{d.t}</div>
          </div>
        );
      })}

      {/* the lens node */}
      <div style={{
        position: 'absolute', left: LENS.x - 175, top: LENS.y - 54, width: 350, height: 108, boxSizing: 'border-box',
        background: COLORS.accent, borderRadius: RADIUS.card, boxShadow: SHADOW.card,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        transform: `scale(${lensPulse})`,
      }}>
        <span style={{ fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 2, color: `${COLORS.paper}bb` }}>LENS</span>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: COLORS.paper }}>self hosting</span>
      </div>

      {/* the two hero notes */}
      {HERO.map((h) => (
        <div key={h.id} style={{ position: 'absolute', left: h.x - 190, top: h.y - 58, width: 380, height: 116 }}>
          <div style={{
            position: 'absolute', inset: 0, boxSizing: 'border-box', background: COLORS.paper,
            border: `2px solid ${frame >= h.at ? COLORS.accent : COLORS.line}`, borderRadius: RADIUS.card,
            boxShadow: SHADOW.soft, padding: '16px 22px',
          }}>
            <Badge kind={h.k} />
            <div style={{ fontSize: 23, color: COLORS.ink, lineHeight: 1.3, marginTop: 10 }}>{h.t}</div>
          </div>
          <Hilite at={h.at} style={{ borderRadius: 22 }} />
          <div style={{
            position: 'absolute', left: 300, top: -18, width: 44, height: 44, borderRadius: '50%',
            background: COLORS.signal, display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: interpolate(frame, [BOTH_AT, BOTH_AT + 12], [0, 1], CLAMP),
            transform: `scale(${interpolate(frame, [BOTH_AT, BOTH_AT + 16], [0.7, 1], { ...CLAMP, easing: EASINGS.overshoot })})`,
          }}>
            <Check size={26} color={COLORS.paper} strokeWidth={3.4} />
          </div>
        </div>
      ))}
    </>
  );
};

// =============================== page 4: queue ================================
const QROWS = [
  { src: 'mind-feeder (local)', k: 'fact', t: 'Coolify injects every compose variable as an empty string', w: '2 min ago' },
  { src: 'Claude (MCP)', k: 'take', t: 'The combination is the engine, not the model', w: '14 min ago' },
  { src: 'X drafter agent', k: 'story', t: 'A brand new server, found in 2 minutes 35 seconds', w: '1 hour ago' },
  { src: 'mind-feeder (local)', k: 'lesson', t: 'MinIO stripped its console, and the access key trap', w: '3 hours ago' },
];

const QueuePage: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{ position: 'absolute', left: 34, top: 22, display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: COLORS.ink }}>4 waiting</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: `${COLORS.warn}22`, border: `1px solid ${COLORS.warn}77`, borderRadius: RADIUS.pill, padding: '7px 18px' }}>
          <Clock size={18} color={COLORS.ink} />
          <span style={{ fontSize: 20, color: COLORS.ink }}>nothing merged yet</span>
        </span>
      </div>

      <Panel x={34} y={78} w={1412} h={520}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1412, height: 56, background: COLORS.cream, borderBottom: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 1.4, color: COLORS.muted }}>
          <span style={{ position: 'absolute', left: 28 }}>PROPOSED BY</span>
          <span style={{ position: 'absolute', left: 380 }}>NOTE</span>
          <span style={{ position: 'absolute', left: 1058 }}>WHEN</span>
        </div>
        {QROWS.map((q, i) => (
          <div key={q.t} style={{ position: 'absolute', left: 0, top: 56 + i * 116, width: 1412, height: 116, borderBottom: `1px solid ${COLORS.line}` }}>
            <div style={{ position: 'absolute', left: 28, top: 34, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${COLORS.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={19} color={COLORS.accent} strokeWidth={2.2} />
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 20, color: COLORS.ink }}>{q.src}</span>
            </div>
            <div style={{ position: 'absolute', left: 380, top: 26, width: 636 }}>
              <Badge kind={q.k} />
              <div style={{ fontSize: 23, color: COLORS.ink, marginTop: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.t}</div>
            </div>
            <span style={{ position: 'absolute', left: 1058, top: 46, fontFamily: FONT_MONO, fontSize: 19, color: COLORS.muted }}>{q.w}</span>
            <div style={{ position: 'absolute', left: 1226, top: 36, display: 'flex', gap: 10 }}>
              <div style={{ width: 46, height: 44, borderRadius: 10, background: COLORS.signal, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={22} color={COLORS.paper} strokeWidth={3} />
              </div>
              <div style={{ width: 46, height: 44, borderRadius: 10, border: `1.5px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} color={COLORS.muted} strokeWidth={2.6} />
              </div>
            </div>
          </div>
        ))}
        {/* column highlights. Hilite draws at inset -10 and pops from scale 1.05,
            so the height is set to close the bottom stroke INSIDE the panel
            (panel h 520 -> box bottom 508) instead of being cut by overflow. */}
        <div style={{ position: 'absolute', left: 14, top: 62, width: 340, height: 436 }}><Hilite at={SOURCE_AT} style={{ borderRadius: 14 }} /></div>
        <div style={{ position: 'absolute', left: 1216, top: 62, width: 128, height: 436 }}><Hilite at={WAITING_AT} style={{ borderRadius: 14 }} color={COLORS.signal} /></div>
      </Panel>

      <div style={{
        position: 'absolute', left: 34, top: 626, width: 1412, height: 82, boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px',
        background: `${COLORS.signal}14`, border: `1.5px solid ${COLORS.signal}66`, borderRadius: RADIUS.card,
        opacity: interpolate(frame, [NOBACK_AT, NOBACK_AT + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
        transform: `translateY(${interpolate(frame, [NOBACK_AT, NOBACK_AT + 14], [18, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
      }}>
        <Shield size={30} color={COLORS.signal} strokeWidth={2.2} />
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: COLORS.ink }}>Nothing is written to your brain without your approval.</span>
      </div>
    </>
  );
};

// =============================== page 5: consumers ============================
const CROWS = [
  { n: 'Claude Desktop', s: 'MCP server', tier: 'private', last: '2 min ago', req: '1,284' },
  { n: 'claude.ai connector', s: 'MCP server', tier: 'private', last: '12 min ago', req: '906' },
  { n: 'X drafter agent', s: 'REST API', tier: 'private', last: '1 hour ago', req: '431' },
  { n: 'learnwithhasan.com', s: 'REST API', tier: 'public', last: '3 hours ago', req: '2,109' },
];

const ConsumersPage: React.FC = () => (
  <>
    <div style={{ position: 'absolute', left: 34, top: 30, fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>4 consumers, 2 keys active</div>
    <div style={{ position: 'absolute', left: 1176, top: 16, width: 270, height: 54, boxSizing: 'border-box', background: COLORS.accent, borderRadius: RADIUS.pill, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, boxShadow: SHADOW.soft }}>
      <Plus size={22} color={COLORS.paper} strokeWidth={2.6} />
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, color: COLORS.paper }}>New API key</span>
      <Hilite at={KEYS_AT} style={{ borderRadius: 999, inset: -12 }} color={COLORS.accent2} />
    </div>

    <Panel x={34} y={94} w={1412} h={512}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1412, height: 56, background: COLORS.cream, borderBottom: `1px solid ${COLORS.line}`, fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 1.4, color: COLORS.muted }}>
        <span style={{ position: 'absolute', left: 28, top: 19 }}>CONSUMER</span>
        <span style={{ position: 'absolute', left: 700, top: 19 }}>TIER</span>
        <span style={{ position: 'absolute', left: 950, top: 19 }}>LAST READ</span>
        <span style={{ position: 'absolute', left: 1230, top: 19 }}>REQUESTS</span>
      </div>
      {CROWS.map((c, i) => (
        <div key={c.n} style={{ position: 'absolute', left: 0, top: 56 + i * 112, width: 1412, height: 112, borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={{ position: 'absolute', left: 28, top: 26, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: `${COLORS.accent}16`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={24} color={COLORS.accent} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 24, color: COLORS.ink, fontWeight: 500 }}>{c.n}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 17, color: COLORS.muted, marginTop: 3 }}>{c.s}</div>
            </div>
          </div>
          <span style={{
            position: 'absolute', left: 700, top: 38, display: 'inline-flex', alignItems: 'center', gap: 8,
            background: c.tier === 'public' ? `${COLORS.signal}18` : `${COLORS.accent2}18`,
            border: `1px solid ${c.tier === 'public' ? COLORS.signal : COLORS.accent2}66`,
            borderRadius: RADIUS.pill, padding: '6px 16px',
          }}>
            {c.tier === 'public' ? <Globe size={17} color={COLORS.signal} /> : <Lock size={16} color={COLORS.accent2} />}
            <span style={{ fontFamily: FONT_MONO, fontSize: 19, color: COLORS.ink }}>{c.tier}</span>
          </span>
          <span style={{ position: 'absolute', left: 950, top: 42, fontFamily: FONT_MONO, fontSize: 20, color: COLORS.muted }}>{c.last}</span>
          <span style={{ position: 'absolute', left: 1230, top: 42, fontFamily: FONT_MONO, fontSize: 20, color: COLORS.ink }}>{c.req}</span>
        </div>
      ))}
      {/* same rule as the queue columns: the bottom stroke closes inside the
          panel (panel h 512 -> box bottom 500), never clipped by overflow */}
      <div style={{ position: 'absolute', left: 14, top: 62, width: 650, height: 428 }}><Hilite at={WHO_AT} style={{ borderRadius: 14 }} /></div>
    </Panel>
  </>
);

// =============================== page 6: chat =================================
const REPLY = [
  'I moved everything off managed cloud last May.',
  'That is about 700 dollars a month back in my pocket.',
  'The maintenance everyone warns you about was 16 seconds of downtime, twice in a year.',
];
const CITES = ['story: added up my cloud bills', 'take: maintenance burden in seconds'];

const ChatPage: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = (at: number) => ({
    opacity: interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [at, at + 12], [16, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  return (
    <>
      <div style={{ position: 'absolute', left: 210, top: 40, width: 1060, display: 'flex', justifyContent: 'flex-end', ...rise(ASK_AT) }}>
        <div style={{ background: COLORS.accent, borderRadius: 20, padding: '20px 30px', maxWidth: 720 }}>
          <span style={{ fontSize: 27, color: COLORS.paper }}>What do I actually think about self hosting?</span>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 210, top: 170, width: 1060, ...rise(REPLY_AT) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: `${COLORS.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={24} color={COLORS.accent} strokeWidth={2} />
          </div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, color: COLORS.muted }}>your brain</span>
        </div>
        <div style={{ background: COLORS.cream, border: `1px solid ${COLORS.line}`, borderRadius: 20, padding: '28px 34px', boxShadow: SHADOW.soft }}>
          {REPLY.map((l, i) => (
            <div key={l} style={{ fontSize: 30, color: COLORS.ink, lineHeight: 1.45, marginTop: i ? 14 : 0, ...rise(REPLY_AT + 6 + i * 11) }}>{l}</div>
          ))}
          <div style={{ display: 'flex', gap: 14, marginTop: 26, ...rise(CITE_AT) }}>
            {CITES.map((c) => (
              <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: COLORS.paper, border: `1px solid ${COLORS.accent}55`, borderRadius: RADIUS.pill, padding: '9px 20px' }}>
                <Circle size={11} color={COLORS.accent} fill={COLORS.accent} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 19, color: COLORS.ink }}>{c}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: 210, top: 664, width: 1060, height: 76, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 14, padding: '0 26px', border: `1.5px solid ${COLORS.line}`, borderRadius: RADIUS.pill, background: COLORS.paper }}>
        <span style={{ flex: 1, fontSize: 24, color: COLORS.muted }}>Ask your brain something</span>
        <div style={{ width: 46, height: 46, borderRadius: '50%', background: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={22} color={COLORS.paper} />
        </div>
      </div>
    </>
  );
};

// =============================== shell + shot =================================
const Sidebar: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: SB_W, height: PH, background: COLORS.cream, borderRight: `1px solid ${COLORS.line}` }}>
    <div style={{ position: 'absolute', left: 26, top: 26, display: 'flex', alignItems: 'center', gap: 13 }}>
      <div style={{ width: 42, height: 42, borderRadius: 12, background: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Brain size={24} color={COLORS.paper} strokeWidth={2.1} />
      </div>
      <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 27, color: COLORS.ink }}>BrainOutside</span>
    </div>
    {NAV.map((n, i) => {
      const on = i === active;
      return (
        <div key={n.key} style={{
          position: 'absolute', left: 16, top: ITEM_Y[i], width: SB_W - 32, height: ITEM_H, boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', gap: 16, padding: '0 20px', borderRadius: 12,
          background: on ? `${COLORS.accent}16` : 'transparent',
        }}>
          {on && <div style={{ position: 'absolute', left: 0, top: 12, width: 4, height: ITEM_H - 24, borderRadius: 2, background: COLORS.accent }} />}
          <n.Icon size={24} color={on ? COLORS.accent : COLORS.muted} strokeWidth={2.1} />
          <span style={{ fontSize: 24, fontWeight: on ? 600 : 400, color: on ? COLORS.accent : COLORS.ink }}>{n.label}</span>
        </div>
      );
    })}
    <div style={{ position: 'absolute', left: 26, bottom: 26, display: 'flex', alignItems: 'center', gap: 11 }}>
      <GithubMark size={22} color={COLORS.muted} />
      <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.muted }}>hassancs91/my-brain</span>
    </div>
  </div>
);

const TopBar: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ position: 'absolute', left: SB_W, top: 0, width: CW, height: TOP_H, borderBottom: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', padding: '0 34px', boxSizing: 'border-box' }}>
    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 34, color: COLORS.ink }}>{title}</span>
    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10, background: `${COLORS.signal}16`, border: `1px solid ${COLORS.signal}55`, borderRadius: RADIUS.pill, padding: '8px 18px' }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS.signal }} />
      <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.ink }}>in sync with GitHub</span>
    </span>
    <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.muted, marginLeft: 20 }}>HEAD d69620e</span>
  </div>
);

const HOST = 'brain.learnwithhasan.com';

const B9DashboardTour: React.FC = () => {
  const frame = useCurrentFrame();
  const nav = navAt(frame);
  const page = NAV[nav].key;

  const url = page === 'browser' ? `${HOST}/browser${frame >= FILTER_AT ? '?kind=lesson' : ''}`
    : page === 'graph' ? `${HOST}/graph${frame >= QUERY_AT ? '?q=self-hosting' : ''}`
      : `${HOST}/${page}`;
  const tab = `${NAV[nav].label} · BrainOutside`;

  // ken-burns push onto each half's payoff, plus a constant slow drift so the
  // page is never a frozen still
  const life = interpolate(frame, [NAV[nav].at, NAV[nav + 1]?.at ?? 1281], [1, 1.012], CLAMP);
  // each push holds through its payoff word, then releases BEFORE the cursor goes
  // back to the nav (a held zoom + a cursor aiming at an off-screen sidebar reads fake)
  const zoom = page === 'browser' ? interpolate(frame, [RENDER_ZOOM[0], RENDER_ZOOM[1], 356, 372], [1, 1.26, 1.26, 1], { ...CLAMP, easing: EASINGS.easeInOut })
    : page === 'graph' ? interpolate(frame, [600, 682, 692, 708], [1, 1.2, 1.2, 1], { ...CLAMP, easing: EASINGS.easeInOut })
      : page === 'chat' ? interpolate(frame, CHAT_ZOOM, [1, 1.24], { ...CLAMP, easing: EASINGS.easeInOut })
        : 1;
  const origin = page === 'browser' ? '75% 58%' : page === 'graph' ? '47% 54%' : page === 'chat' ? '58% 49%' : '50% 50%';

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <WebBrowserFrame url={url} tabTitle={tab} box={BOX} appearAt={0} pageBg={COLORS.paper}
        favicon={<div style={{ width: 22, height: 22, borderRadius: 6, background: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Brain size={14} color={COLORS.paper} strokeWidth={2.4} /></div>}
      >
        <div style={{ position: 'relative', width: PW, height: PH, background: COLORS.paper, transform: `scale(${zoom * life})`, transformOrigin: origin }}>
          <Sidebar active={nav} />
          <TopBar title={NAV[nav].label} />
          <div style={{ position: 'absolute', left: SB_W, top: TOP_H, width: CW, height: CH }}>
            {page === 'dashboard' && <DashboardPage />}
            {page === 'browser' && <BrowserPage />}
            {page === 'graph' && <GraphPage />}
            {page === 'queue' && <QueuePage />}
            {page === 'consumers' && <ConsumersPage />}
            {page === 'chat' && <ChatPage />}
          </div>
        </div>
      </WebBrowserFrame>
      <CursorLayer />
    </AbsoluteFill>
  );
};
export default B9DashboardTour;
