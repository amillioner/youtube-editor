import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate, Img } from 'remotion';
import { EASINGS, RADIUS, COLORS } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { CLAMP, V, VSC, lib } from '../../lib/kit';
import { WebBrowserFrame } from '../../lib/browser';
import { CursorPointer, sampleCursor, CursorKey } from '../../lib/screencast';
import { CodeEditorPane, CodeLine } from '../../lib/vscode';
import { FlaskConical, Hammer, Gauge } from 'lucide-react';
import { StatChip, TermLines, TermLine } from './_shared/TermKit';
import { AgentFeed, ClaudeInputDock, ClaudeUserBubble, FactoryWindow, FeedLine, PromptHighlight } from './_shared/FactoryVSCode';

// ============================================================================
// ColdOpen montage · the factory run in 24s as ONE continuous screen: Claude
// Code (inside VS Code) streaming tool calls on the left, the windows it opens
// beside it. ROUND-2: the explorer collapses at the split (Ctrl+B style) so
// both panes get more room; the empty second editor group (and its divider
// line) only exists once draft.md actually opens; the keyword-volume panel sits
// UNDER the Google results on "pulls real search data"; the shot runs to 34.1
// so no face flashes before the output beat.
// ROUND-3: the P3 pills sit on the RIGHT with icons (no "sped up" tag);
// P4 is a live capture animation — the browser opens each real page, a shutter
// flash freezes it and the shot shrinks into a thumbnail stack (capture SFX
// slots for the /suggest-sfx pass at f592/f616/f640).
// Master span 10.2 -> 34.1 (23.9s). f = (master_s - 10.2) * 30.
// Phases: P1 search f0-206 ("pulls real search data" 11.3->f33 volume panel ·
// "reads the top articles" 13.5->f99) · P2 server f207-341 ("Frankfurt"
// 20.4->f306) · P3 deploy f342-575 (testing f456 · breaking f492 · measuring
// f528) · P4 screenshots f576-653 (30.0->f594) · P5 it writes f654-717 (f690)
// ============================================================================
export const compositionConfig = { id: 'ColdOpenMontage', durationInSeconds: 23.9, fps: 30, width: 1920, height: 1080 };

const P2 = 207;
const P3 = 342;
const P4 = 576;
const P5 = 654;

// left Claude panel (x animates as the sidebar collapses) · right OS windows
const CL_W = 800;
const DRAFT_X = 900;

const FEED: readonly FeedLine[] = [
  [8, 'tool', 'WebSearch("self host supabase")'],
  [20, 'sub', '9 organic results · top pages queued'],
  [28, 'tool', 'KeywordVolume(4 related terms)'],
  [60, 'ok', 'cluster ~ 1,900 searches/mo'],
  [100, 'tool', 'Read(supabase.com/docs · self-hosting)'],
  [126, 'tool', 'Read(github.com #39820 · the pain list)'],
  [214, 'tool', 'Bash(python do.py create cf-self-host-supabase)'],
  [298, 'ok', 'droplet up · fra1 · 164.92.174.5'],
  [348, 'tool', 'Bash(docker compose up -d)'],
  [395, 'ok', '11 containers healthy · Studio in 20s'],
  [450, 'tool', 'Bash(./e3_auth_smtp.sh)'],
  [470, 'err', 'signup -> 500 · evidence saved'],
  [500, 'tool', 'Bash(./e2_secrets_rotation.sh)'],
  [522, 'ok', 'pooler hang -> fix proven 25/25'],
  [580, 'tool', 'Playwright(capture: studio, mailpit, auth)'],
  [612, 'ok', '4 screenshots · no blurs, re-shot with fakes'],
  [658, 'tool', 'Write(content-lab/supabase/draft.md)'],
];

// the real deploy/break/measure lines (evidence files, compressed)
const RUN_LINES: readonly TermLine[] = [
  [P3 + 6, '$ docker compose up -d', 'accent'],
  [P3 + 18, ' Container supabase-db        Started', 'text'],
  [P3 + 28, ' Container supabase-studio    Started', 'text'],
  [P3 + 38, 'studio_serving_seconds: 20', 'ok'],
  [P3 + 90, '$ ./e3_auth_smtp.sh', 'accent'],
  [P3 + 102, 'signup -> 500 "Error sending confirmation email"', 'err'],
  [P3 + 130, '$ ./e2_secrets_rotation.sh — rotate ALL keys', 'accent'],
  [P3 + 148, 'pooler: clients hang forever (no errors)', 'err'],
  [P3 + 170, 'fix proven: re-seed tenants -> 25/25 OK', 'ok'],
  [P3 + 190, 'docker stats: stack idles at 1.5 GB', 'text'],
  [P3 + 210, 'upgrade probe: longest outage 5s', 'ok'],
];

// the real SERP (recon-report.md §2), top 4 shown so the volume data fits under
const SERP: readonly (readonly [site: string, url: string, title: string, snippet: string])[] = [
  ['Supabase', 'supabase.com › docs › self-hosting', 'Self-Hosting | Supabase Docs', 'Host Supabase on your own infrastructure. Overview of the available hosting options…'],
  ['GitHub', 'github.com › supabase › issues › 39820', 'Improve the self-hosting experience #39820', 'The official compose works but everything around it is undocumented…'],
  ['Reddit', 'reddit.com › r › Supabase', 'Is self-hosting Supabase worth it?', '"Best decision I made" — but the thread is opinions, not a guide…'],
  ['RapidNative', 'rapidnative.com › blog', 'Self-Host Supabase in 2025: Complete Guide', 'A step by step walkthrough of the docker-compose stack…'],
];

const KEYWORDS: readonly (readonly [kw: string, vol: string, w: number])[] = [
  ['self host supabase', '320 / mo', 0.54],
  ['self hosted supabase', '320 / mo', 0.54],
  ['supabase self host', '590 / mo', 1],
  ['supabase self hosted', '590 / mo', 1],
];

const REGIONS: readonly (readonly [code: string, city: string, flag: FlagKind])[] = [
  ['NYC1', 'New York', 'us'],
  ['TOR1', 'Toronto', 'ca'],
  ['AMS3', 'Amsterdam', 'nl'],
  ['LON1', 'London', 'gb'],
  ['FRA1', 'Frankfurt', 'de'],
  ['SGP1', 'Singapore', 'sg'],
];

type FlagKind = 'us' | 'ca' | 'nl' | 'gb' | 'de' | 'sg';
// tiny simplified flags (44x30) — good enough at chip size, no external assets
const Flag: React.FC<{ kind: FlagKind; w?: number }> = ({ kind, w = 44 }) => {
  const h = (w / 44) * 30;
  const row = (colors: string[]) => (
    <div style={{ width: w, height: h, borderRadius: 4, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(0,0,0,0.15)' }}>
      {colors.map((c, i) => <div key={i} style={{ flex: 1, background: c }} />)}
    </div>
  );
  if (kind === 'de') return row(['#000', '#dd0000', '#ffce00']);
  if (kind === 'nl') return row(['#ae1c28', '#fff', '#21468b']);
  if (kind === 'sg') return row(['#ee2536', '#fff']);
  if (kind === 'ca') return (
    <div style={{ width: w, height: h, borderRadius: 4, overflow: 'hidden', display: 'flex', border: '1px solid rgba(0,0,0,0.15)' }}>
      <div style={{ width: '26%', background: '#d52b1e' }} /><div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ width: 8, height: 8, background: '#d52b1e', transform: 'rotate(45deg)' }} /></div><div style={{ width: '26%', background: '#d52b1e' }} />
    </div>
  );
  if (kind === 'gb') return (
    <div style={{ position: 'relative', width: w, height: h, borderRadius: 4, overflow: 'hidden', background: '#012169', border: '1px solid rgba(0,0,0,0.15)' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: '38%', height: '24%', background: '#fff' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '40%', width: '20%', background: '#fff' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '44%', height: '12%', background: '#c8102e' }} />
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '45%', width: '10%', background: '#c8102e' }} />
    </div>
  );
  // us
  return (
    <div style={{ position: 'relative', width: w, height: h, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.15)' }}>
      {[...Array(5)].map((_, i) => <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 20}%`, height: '20%', background: i % 2 ? '#fff' : '#b22234' }} />)}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '45%', height: '55%', background: '#3c3b6e' }} />
    </div>
  );
};

// draft.md typing itself (real TL;DR fragments)
const DRAFT: CodeLine[] = [
  [['# How to Self-Host Supabase:', '#e8b18f']],
  [['# The Parts the Docker Compose Skips', '#e8b18f']],
  [['', '#ccc']],
  [['> drafting from evidence/*.out · 0 invented numbers', '#7ee2b8']],
  [['', '#ccc']],
  [['The official Docker Compose gets you a Supabase', '#cccccc']],
  [['login screen in about 20 seconds. Everything that', '#cccccc']],
  [['makes it a real backend is undocumented: the', '#cccccc']],
  [['secrets you must set before the first boot, auth', '#cccccc']],
  [['email that fails silently, a connection pooler', '#cccccc']],
  [['that hangs if you rotate keys late...', '#cccccc']],
];

// P4 capture sequence: [img, url, tabTitle, pageAt, captureAt]
const CAPS: readonly (readonly [img: string, url: string, tab: string, at: number, cap: number])[] = [
  ['projects/video-2/run/a2_studio_table_editor.png', '164.92.174.5/project/default/editor', 'Supabase Studio · Table Editor', P4 + 2, 592],
  ['projects/video-2/run/a3_mailpit_inbox.png', '164.92.174.5:8025', 'Mailpit · Inbox', 602, 616],
  ['projects/video-2/run/a5_studio_auth_users.png', '164.92.174.5/project/default/auth/users', 'Authentication · Users', 626, 640],
];

const CURSOR: CursorKey[] = [
  { frame: 24, x: 1350, y: 430 },
  { frame: 70, x: 1130, y: 400 },
  { frame: 96, x: 1130, y: 404 },
  { frame: 124, x: 1520, y: 560 },
  { frame: 156, x: 1320, y: 690 },
  { frame: 200, x: 1320, y: 690 },
  { frame: 246, x: 1100, y: 330 },
  { frame: 276, x: 1385, y: 405 },
  { frame: 290, x: 1385, y: 405 },
  { frame: 318, x: 1430, y: 640 },
];
const CLICKS = [96, 280];

const G_COLORS = ['#4285f4', '#ea4335', '#fbbc05', '#4285f4', '#34a853', '#ea4335'];

const ColdOpenMontage: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (s: number, dy = 14) => ({
    opacity: interpolate(frame, [s, s + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 10], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });

  // the explorer collapses right after the cut — the split takes the room
  const sbW = interpolate(frame, [3, 15], [VSC.SB_W, 0], { ...CLAMP, easing: EASINGS.easeInOut });
  const panelX = VSC.ACT_W + sbW;

  // P1 -> P2 window swap (browser lingers so the volume payoff is read)
  const browserOut = interpolate(frame, [222, 232], [1, 0], CLAMP);
  const doOut = interpolate(frame, [P3 - 8, P3 + 2], [1, 0], CLAMP);
  // volume panel: on "pulls real search data", out on the first article click
  const volOp = interpolate(frame, [33, 43], [0, 1], CLAMP) * interpolate(frame, [94, 102], [1, 0], CLAMP);
  // P3 terminal slide
  const termY = interpolate(frame, [P3 + 3, P3 + 18], [470, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const termOp = frame >= P3 + 3 && frame < P4 + 10 ? interpolate(frame, [P4, P4 + 10], [1, 0], CLAMP) : 0;
  // P4 capture sequence
  const p4Op = interpolate(frame, [P5, P5 + 8], [1, 0], CLAMP);
  let capIdx = 0;
  for (let i = 0; i < CAPS.length; i++) if (frame >= CAPS[i][3]) capIdx = i;
  const flash = CAPS.reduce((f, [, , , , cap]) => {
    if (frame < cap || frame > cap + 7) return f;
    return Math.max(f, interpolate(frame, [cap, cap + 2, cap + 7], [0, 0.9, 0], CLAMP));
  }, 0);
  // cursor
  const cur = sampleCursor(frame, CURSOR);
  const curOp = interpolate(frame, [16, 24], [0, 1], CLAMP) * interpolate(frame, [332, 342], [1, 0], CLAMP);
  const press = CLICKS.reduce((p, cf) => (frame < cf - 4 || frame > cf + 8) ? p : interpolate(frame, [cf - 4, cf, cf + 8], [1, 0.8, 1], CLAMP), 1);

  const pageIdx = frame < 102 ? 0 : frame < 134 ? 1 : 2;
  const urls = ['google.com/search?q=self+host+supabase', 'supabase.com/docs/guides/self-hosting', 'github.com/supabase/supabase/issues/39820'];
  const tabs = ['self host supabase - Google Search', 'Self-Hosting | Supabase Docs', 'Improve the self-hosting experience · #39820'];

  const claudeGroup = { x: panelX, w: CL_W, tab: { label: 'Claude Code', icon: 'claude' as const }, breadcrumb: ['Claude Code'] };
  const draftGroup = { x: DRAFT_X, w: 1920 - DRAFT_X, tab: { label: 'draft.md', icon: 'file' as const, appearAt: P5 }, breadcrumb: ['content-lab', 'supabase', 'draft.md'] };

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, background: '#000' }}>
      <FactoryWindow sidebarW={sbW} groups={frame < P5 ? [claudeGroup] : [claudeGroup, draftGroup]}>
        {/* ------------------------------------------------ left: the agent */}
        <ClaudeUserBubble x={panelX} w={CL_W} top={140} size={18}
          text={<>create a full guide on self hosting supabase{'\n'}using the <PromptHighlight>content-factory</PromptHighlight></>} />
        <AgentFeed lines={FEED} x={panelX} w={CL_W} top={270} rows={13} size={19} lineH={36}
          spinner={{ label: 'Running the factory…', from: 14 }} />
        <ClaudeInputDock x={panelX + 6} w={CL_W - 12} sent bottom={18} />

        {/* ------------------------------------------------ P5: draft types itself */}
        {frame >= P5 && (
          <CodeEditorPane x={DRAFT_X} w={1920 - DRAFT_X} lines={DRAFT} typeStart={P5 + 10} cps={240} fontSize={24} appearAt={P5} />
        )}

        {/* ------------------------------------------------ P1: search window */}
        {browserOut > 0 && (
          <div style={{ opacity: browserOut }}>
            <WebBrowserFrame url={urls[pageIdx]} tabTitle={tabs[pageIdx]} box={{ x: 880, y: 96, w: 1010, h: 850 }} appearAt={6} pageBg="#fff">
              {/* page 1 · Google results */}
              {pageIdx === 0 && (
                <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '18px 28px 0' }}>
                    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30 }}>
                      {'Google'.split('').map((c, i) => <span key={i} style={{ color: G_COLORS[i] }}>{c}</span>)}
                    </span>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', maxWidth: 560, border: '1px solid #dfe1e5', borderRadius: 999, padding: '11px 22px', boxShadow: '0 1px 6px rgba(32,33,36,0.12)' }}>
                      <span style={{ fontSize: 19, color: '#202124' }}>self host supabase</span>
                      <span style={{ marginLeft: 'auto', color: '#4285f4', fontSize: 18 }}>⌕</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 26, padding: '14px 28px 10px 130px', borderBottom: '1px solid #ebebeb', fontSize: 15.5, color: '#5f6368' }}>
                    <span style={{ color: '#1a73e8', borderBottom: '3px solid #1a73e8', paddingBottom: 8 }}>All</span>
                    <span>Images</span><span>Videos</span><span>Forums</span><span>News</span>
                  </div>
                  <div style={{ padding: '10px 28px 0 130px', fontSize: 14, color: '#70757a', opacity: interpolate(frame, [18, 26], [0, 1], CLAMP) }}>About 1,240,000 results (0.42 seconds)</div>
                  <div style={{ padding: '4px 60px 0 130px' }}>
                    {SERP.map(([site, url, title, snippet], i) => (
                      <div key={site} style={{ ...at(20 + i * 6, 10), padding: '11px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 999, background: '#f1f3f4', border: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#5f6368', fontWeight: 700 }}>{site[0]}</div>
                          <div>
                            <div style={{ fontSize: 15, color: '#202124' }}>{site}</div>
                            <div style={{ fontSize: 13.5, color: '#70757a', marginTop: -2 }}>{url}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 21, color: '#1a0dab', marginTop: 5 }}>{title}</div>
                        <div style={{ fontSize: 15, color: '#4d5156', marginTop: 3, lineHeight: 1.4 }}>{snippet}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* page 2 · supabase docs (dark) */}
              {pageIdx === 1 && (
                <div style={{ position: 'absolute', inset: 0, background: '#1c1c1c', display: 'flex' }}>
                  <div style={{ width: 210, borderRight: '1px solid #2c2c2c', padding: '20px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 26 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: '#3ecf8e' }} />
                      <span style={{ fontSize: 18, color: '#ededed', fontWeight: 600 }}>supabase</span>
                    </div>
                    {['Getting Started', 'Database', 'Auth', 'Storage', 'Self-Hosting', 'Realtime', 'Edge Functions'].map((s) => (
                      <div key={s} style={{ fontSize: 15.5, color: s === 'Self-Hosting' ? '#3ecf8e' : '#9b9b9b', padding: '7px 10px', background: s === 'Self-Hosting' ? '#3ecf8e18' : 'transparent', borderRadius: 6, marginBottom: 2 }}>{s}</div>
                    ))}
                  </div>
                  <div style={{ flex: 1, padding: '30px 44px' }}>
                    <div style={{ fontSize: 13.5, color: '#3ecf8e', letterSpacing: 2, marginBottom: 12 }}>SELF-HOSTING</div>
                    <div style={{ fontSize: 32, color: '#ededed', fontWeight: 600 }}>Self-Hosting with Docker</div>
                    {[420, 560, 500, 0, 380, 540, 460].map((wd, i) => wd === 0
                      ? <div key={i} style={{ height: 18 }} />
                      : <div key={i} style={{ width: wd, height: 13, borderRadius: 7, background: '#2e2e2e', marginTop: 14 }} />)}
                    <div style={{ marginTop: 26, background: '#111', border: '1px solid #2c2c2c', borderRadius: 10, padding: '18px 22px', fontFamily: FONT_MONO, fontSize: 17, color: '#3ecf8e' }}>
                      $ docker compose up -d
                    </div>
                    {[520, 470, 550].map((wd, i) => <div key={i} style={{ width: wd, height: 13, borderRadius: 7, background: '#2e2e2e', marginTop: 14 }} />)}
                  </div>
                </div>
              )}
              {/* page 3 · the github pain list */}
              {pageIdx === 2 && (
                <div style={{ position: 'absolute', inset: 0, background: '#fff' }}>
                  <div style={{ height: 52, background: '#24292f', display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px' }}>
                    <div style={{ width: 26, height: 26, borderRadius: 999, background: '#fff' }} />
                    <span style={{ color: '#fff', fontSize: 16 }}>supabase / supabase</span>
                  </div>
                  <div style={{ padding: '24px 40px' }}>
                    <div style={{ fontSize: 26, color: '#1f2328', fontWeight: 600, lineHeight: 1.3 }}>
                      Improve the self-hosting developer experience <span style={{ color: '#656d76', fontWeight: 400 }}>#39820</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
                      <span style={{ background: '#1a7f37', color: '#fff', fontSize: 14.5, fontWeight: 600, borderRadius: 999, padding: '5px 14px' }}>⊙ Open</span>
                      <span style={{ fontSize: 15.5, color: '#656d76' }}>342 comments · 20,012 words of undocumented pain</span>
                    </div>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ marginTop: 18, border: '1px solid #d0d7de', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ height: 38, background: '#f6f8fa', borderBottom: '1px solid #d0d7de', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
                          <div style={{ width: 22, height: 22, borderRadius: 999, background: '#d0d7de' }} />
                          <div style={{ width: 130 + i * 30, height: 11, borderRadius: 6, background: '#d0d7de' }} />
                        </div>
                        <div style={{ padding: '14px 16px' }}>
                          {[420, 560, 300].slice(0, 3 - (i === 2 ? 1 : 0)).map((wd, j) => <div key={j} style={{ width: wd, height: 11, borderRadius: 6, background: '#eaeef2', marginTop: j ? 10 : 0 }} />)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </WebBrowserFrame>
            {/* keyword volume — UNDER the results, on "pulls real search data" */}
            {volOp > 0 && (
              <div style={{ position: 'absolute', left: 920, top: 682, width: 930, opacity: volOp, transform: `translateY(${interpolate(frame, [33, 43], [18, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`, background: '#17171c', border: `1px solid ${V.border}`, borderRadius: RADIUS.panel, boxShadow: '0 24px 70px rgba(0,0,0,0.55)', padding: '18px 26px' }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 15, letterSpacing: 2.5, color: V.coral, marginBottom: 10 }}>SEARCH&nbsp;VOLUME&nbsp;·&nbsp;RELATED&nbsp;TERMS</div>
                {KEYWORDS.map(([kw, vol, wd], i) => (
                  <div key={kw} style={{ ...at(38 + i * 6, 8), display: 'flex', alignItems: 'center', gap: 16, padding: '5px 0' }}>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: '#e6e3de', width: 260 }}>{kw}</span>
                    <div style={{ flex: 1, height: 11, borderRadius: 6, background: '#26262c', overflow: 'hidden' }}>
                      <div style={{ width: `${wd * 100}%`, height: '100%', borderRadius: 6, background: V.coral, transform: `scaleX(${interpolate(frame, [40 + i * 6, 56 + i * 6], [0, 1], { ...CLAMP, easing: EASINGS.easeOut })})`, transformOrigin: 'left' }} />
                    </div>
                    <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: '#9a958e', width: 100, textAlign: 'right' }}>{vol}</span>
                  </div>
                ))}
                <div style={{ ...at(60, 8), display: 'flex', justifyContent: 'flex-end', marginTop: 8, fontFamily: FONT_MONO, fontSize: 19, color: '#7ee2b8' }}>cluster ≈ 1,900 searches / mo</div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------ P2: a real server */}
        {frame >= P2 && doOut > 0 && (
          <div style={{ opacity: doOut }}>
            <WebBrowserFrame url="cloud.digitalocean.com/droplets/new" tabTitle="Create Droplets · DigitalOcean" box={{ x: 870, y: 88, w: 1030, h: 866 }} appearAt={228} pageBg="#fff">
              <div style={{ position: 'absolute', inset: 0, background: '#fff', padding: '24px 34px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 999, background: '#0080ff' }} />
                  <span style={{ fontSize: 21, fontWeight: 600, color: '#212933' }}>Create Droplets</span>
                  <span style={{ marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 15.5, color: '#697586' }}>cf-self-host-supabase</span>
                </div>
                <div style={{ fontSize: 16.5, color: '#4d5b6e', margin: '18px 0 10px', fontWeight: 600 }}>Choose a datacenter region</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  {REGIONS.map(([code, city, flag], i) => {
                    const isFra = code === 'FRA1';
                    const picked = isFra && frame >= 280;
                    return (
                      <div key={code} style={{ ...at(232 + i * 5, 10), display: 'flex', alignItems: 'center', gap: 12, border: `2px solid ${picked ? '#0080ff' : '#e2e8f0'}`, background: picked ? '#f0f7ff' : '#fff', borderRadius: 10, padding: '11px 16px' }}>
                        <Flag kind={flag} w={40} />
                        <div>
                          <div style={{ fontSize: 17, fontWeight: 600, color: '#212933' }}>{city}</div>
                          <div style={{ fontFamily: FONT_MONO, fontSize: 13.5, color: '#697586' }}>{code}</div>
                        </div>
                        {picked && <span style={{ marginLeft: 'auto', color: '#0080ff', fontSize: 19, fontWeight: 700 }}>✓</span>}
                      </div>
                    );
                  })}
                </div>
                {/* the map: pointer flies to Frankfurt */}
                <div style={{ ...at(258, 14), position: 'relative', marginTop: 12, height: 300, borderRadius: 12, background: '#f4f7fb', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  {[...Array(6)].map((_, i) => <div key={`h${i}`} style={{ position: 'absolute', left: 0, right: 0, top: 44 + i * 44, height: 1, background: '#dfe7f0' }} />)}
                  {[...Array(14)].map((_, i) => <div key={`v${i}`} style={{ position: 'absolute', top: 0, bottom: 0, left: 40 + i * 64, width: 1, background: '#dfe7f0' }} />)}
                  {([['New York', 90, 170], ['London', 470, 84], ['Amsterdam', 542, 66], ['Frankfurt', 596, 104], ['Singapore', 800, 225]] as const).map(([name, x, y]) => (
                    <React.Fragment key={name}>
                      <div style={{ position: 'absolute', left: x - 5, top: y - 5, width: 10, height: 10, borderRadius: 999, background: name === 'Frankfurt' ? '#0080ff' : '#9fb3c8' }} />
                      <div style={{ position: 'absolute', left: x + 10, top: y - 9, fontSize: 13.5, color: '#697586' }}>{name}</div>
                    </React.Fragment>
                  ))}
                  {/* route arc NYC -> FRA */}
                  <svg style={{ position: 'absolute', inset: 0 }} width={962} height={300}>
                    <path d="M 90 170 Q 340 -15 596 104" fill="none" stroke="#0080ff" strokeWidth={2.5} strokeDasharray="7 7"
                      pathLength={100} strokeDashoffset={interpolate(frame, [P2 + 62, P2 + 96], [100, 0], { ...CLAMP, easing: EASINGS.easeInOut })}
                      style={{ opacity: interpolate(frame, [P2 + 60, P2 + 66], [0, 1], CLAMP) }} />
                  </svg>
                  {/* pin drop + flag on "Frankfurt" (f306) */}
                  <div style={{ position: 'absolute', left: 596 - 15, top: 104 - 42, opacity: interpolate(frame, [304, 310], [0, 1], CLAMP), transform: `translateY(${interpolate(frame, [304, 312], [-26, 0], { ...CLAMP, easing: EASINGS.overshoot })}px)` }}>
                    <svg width={30} height={40} viewBox="0 0 30 40"><path d="M15 0C6.7 0 0 6.7 0 15c0 10 15 25 15 25s15-15 15-25C30 6.7 23.3 0 15 0z" fill="#0080ff" /><circle cx={15} cy={14.5} r={6} fill="#fff" /></svg>
                  </div>
                  <div style={{ position: 'absolute', left: 596, top: 104, width: 56, height: 56, marginLeft: -28, marginTop: -28, borderRadius: 999, border: '2.5px solid #0080ff', opacity: frame >= 306 ? Math.max(0, 0.5 - ((frame - 306) % 34) / 68) : 0, transform: `scale(${frame >= 306 ? 0.4 + (((frame - 306) % 34) / 34) * 1.1 : 0.4})` }} />
                  <div style={{ ...at(306, 10), position: 'absolute', left: 470, top: 150, display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 999, boxShadow: '0 10px 30px rgba(16,42,67,0.14)', padding: '10px 20px' }}>
                    <Flag kind="de" w={38} />
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#212933' }}>Frankfurt · Germany</span>
                  </div>
                </div>
                {/* the droplet exists */}
                <div style={{ ...at(315, 10), display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, background: '#0b1a2b', borderRadius: 10, padding: '13px 20px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 999, background: '#2dd4a7' }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 16.5, color: '#dbe7f3' }}>cf-self-host-supabase · s-2vcpu-4gb · fra1 · 164.92.174.5</span>
                  <span style={{ marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 15.5, color: '#7ee2b8' }}>$0.036 / hr</span>
                </div>
              </div>
            </WebBrowserFrame>
            <StatChip at={P2 + 90} x={1290} y={985} color={COLORS.danger}>rented by the hour</StatChip>
          </div>
        )}

        {/* ------------------------------------------------ P3: deploy, break, measure */}
        {termOp > 0 && (
          <div style={{ position: 'absolute', left: VSC.ACT_W, right: 0, bottom: 0, height: 470, transform: `translateY(${termY}px)`, opacity: termOp, background: '#181818', borderTop: `1px solid ${V.border}`, zIndex: 3 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '10px 24px', fontSize: 15, color: V.dim, borderBottom: `1px solid ${V.border}` }}>
              {['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL', 'PORTS'].map((t) => (
                <span key={t} style={{ color: t === 'TERMINAL' ? V.text : V.dim, borderBottom: t === 'TERMINAL' ? `1px solid ${V.text}` : 'none', paddingBottom: 6, letterSpacing: 0.5 }}>{t}</span>
              ))}
              <span style={{ marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 14.5 }}>bash · droplet 164.92.174.5</span>
            </div>
            <div style={{ position: 'relative', height: 400 }}>
              <TermLines lines={RUN_LINES} x={28} y={16} w={1800} rows={9} size={22} lineH={40} />
            </div>
          </div>
        )}
        {frame >= P3 && frame < P4 && (
          /* the run's three verbs — right side, stacked, iconed (zIndex above the terminal's 3) */
          <div style={{ position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none' }}>
            {([
              [456, 'testing it', COLORS.signal, FlaskConical],
              [492, 'breaking it', COLORS.danger, Hammer],
              [528, 'measuring everything', COLORS.accent, Gauge],
            ] as const).map(([cue, label, color, Icon], i) => (
              <div key={label} style={{
                position: 'absolute', left: 1440, top: 716 + i * 96,
                display: 'flex', alignItems: 'center', gap: 16,
                opacity: interpolate(frame, [cue, cue + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
                transform: `translateX(${interpolate(frame, [cue, cue + 12], [26, 0], { ...CLAMP, easing: EASINGS.overshoot })}px)`,
                fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 30, color: COLORS.ink,
                background: COLORS.paper, border: `2px solid ${color}`, padding: '12px 26px',
                borderRadius: RADIUS.pill, boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
              }}>
                <Icon size={30} color={color} strokeWidth={2.4} />
                {label}
              </div>
            ))}
          </div>
        )}

        {/* ------------------------------------------------ P4: it takes its own screenshots
            The browser opens each real page; a shutter flash freezes it and the
            shot shrinks into a thumbnail stack (macOS capture style).
            SFX slots: camera shutter at f592 / f616 / f640. */}
        {frame >= P4 && p4Op > 0 && (
          <div style={{ opacity: p4Op }}>
            {/* explicit page dims: the browser's translateY wrapper is a zero-height
                containing block, so inset/height-100% collapse (see lib/screencast) */}
            <WebBrowserFrame url={CAPS[capIdx][1]} tabTitle={CAPS[capIdx][2]} box={{ x: 880, y: 96, w: 1010, h: 850 }} appearAt={P4 + 2} pageBg="#fff">
              <div style={{ position: 'absolute', top: 0, left: 0, width: 1010, height: 748, background: '#fff' }}>
                <Img src={lib(CAPS[capIdx][0])} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
              </div>
              {/* shutter flash inside the page */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: 1010, height: 748, background: '#fff', opacity: flash }} />
            </WebBrowserFrame>
            {/* viewfinder pulse on each capture */}
            {CAPS.map(([, , , , cap]) => {
              if (frame < cap - 2 || frame > cap + 8) return null;
              const op = interpolate(frame, [cap - 2, cap, cap + 8], [0, 0.9, 0], CLAMP);
              return <div key={cap} style={{ position: 'absolute', left: 874, top: 90, width: 1022, height: 862, border: `3px solid ${V.coral}`, borderRadius: 16, opacity: op }} />;
            })}
            {/* each shot freezes and shrinks into the thumbnail rail */}
            {CAPS.map(([img, , , , cap], k) => {
              if (frame < cap + 3) return null;
              const t = interpolate(frame, [cap + 3, cap + 17], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
              const L = 880 + (904 + k * 250 - 880) * t;
              const T = 96 + (872 - 96) * t;
              const W = 1010 + (230 - 1010) * t;
              const H = 850 + (144 - 850) * t;
              return (
                <div key={img} style={{ position: 'absolute', left: L, top: T, width: W, height: H, borderRadius: 10, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.85)', boxShadow: '0 16px 44px rgba(0,0,0,0.5)', zIndex: 5 }}>
                  <Img src={lib(img)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                </div>
              );
            })}
            <div style={{ ...at(594, 12), position: 'absolute', left: 960, top: 44, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 27, color: '#fff', background: 'rgba(23,23,28,0.92)', border: `1px solid ${V.coral}`, padding: '10px 24px', borderRadius: RADIUS.pill, zIndex: 6 }}>
              its own screenshots · shot by Playwright
            </div>
          </div>
        )}

        {/* the pointer (P1 + P2 only) */}
        {curOp > 0 && (
          <div style={{ position: 'absolute', left: cur.x, top: cur.y, zIndex: 6, opacity: curOp }}>
            <CursorPointer press={press} size={32} />
          </div>
        )}
        {CLICKS.map((cf) => {
          if (frame < cf || frame > cf + 18) return null;
          const p = sampleCursor(cf, CURSOR);
          const sc = interpolate(frame, [cf, cf + 18], [0, 2.4], { ...CLAMP, easing: EASINGS.easeOut });
          const ro = interpolate(frame, [cf, cf + 18], [0.5, 0], CLAMP);
          return <div key={cf} style={{ position: 'absolute', left: p.x, top: p.y, width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: '50%', border: `2px solid ${V.coral}`, opacity: ro, transform: `scale(${sc})`, zIndex: 6 }} />;
        })}
      </FactoryWindow>
    </AbsoluteFill>
  );
};

export default ColdOpenMontage;
