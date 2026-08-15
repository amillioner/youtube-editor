import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';
import { WebBrowserFrame } from '../../lib/browser';
import { CursorPointer, sampleCursor, CursorKey } from '../../lib/screencast';
import { FactoryLine, CORAL } from './_shared/FactoryLine';

// ============================================================================
// B5a · step 1 · READ — ROUND-5: the factory band runs along the bottom (piece
// rides in from the hopper to station 1); the top splits into the compressed
// SERP dissection table (left) and a REAL browser working beside it (right):
// the real Google SERP for the target query, then the top pages opening and
// being read (docs, the github pain list), cursor + clicks, cold-open fidelity.
// Master span 276.4 -> 290.5 (14.1s). local f = round((master_s - 276.4) * 30).
// Cues: "doesn't write" 278.265->f56 · "it reads" 279.468->f92 ·
// "search data" 281.327->f148 (rows + browser) · "top-ranking results"
// 282.42->f181 · "every single one" 285.943->f286 (docs opens f292, github
// f332) · "cover" 288.123->f352 (covers col) · "miss" 289.149->f383 (misses)
// ============================================================================
export const compositionConfig = { id: 'B5aReconRead', durationInSeconds: 14.1, fps: 30, width: 1920, height: 1080 };

const HEAD = 56;
const READS = 92;
const ROWS = 148;
const RESULTS = 181;
const DOCS = 292;
const GH = 332;
const COVERS = 352;
const MISSES = 383;

// rank · source · covers · misses (compressed verbatim from the recon report)
const SERP: readonly (readonly [string, string, string, string])[] = [
  ['1', 'supabase.com/docs', 'self-hosting index page', 'how-to is a click deeper'],
  ['2', 'reddit.com/r/Supabase', '"best decision I made"', 'not a guide at all'],
  ['3', 'supabase.com/troubleshooting', 'what cloud has, self-hosted lacks', '172 words'],
  ['4', 'github.com #39820', 'THE pain list, 20,012 words', 'a forum thread, zero structure'],
  ['5', 'news.ycombinator.com', '"one command or a maze" debate', 'not a guide'],
  ['6', 'youtube.com', '10-minute sponsored demo', 'the framing IS the problem'],
  ['7', 'rapidnative.com', 'best-structured competitor', 'zero evidence, never ran it'],
  ['8', 'activeno.de', 'real hands-on run', 'dated 2023-08, stale stack'],
  ['9', 'supadex.app', 'CLI vs panels listicle', '688 words of nothing'],
];

// the real organic results (recon-report.md §2), compact SERP entries
const G_RESULTS: readonly (readonly [string, string, string, string])[] = [
  ['Supabase', 'supabase.com › docs › self-hosting', 'Self-Hosting | Supabase Docs', 'Host Supabase on your own infrastructure…'],
  ['GitHub', 'github.com › supabase › issues › 39820', 'Improve the self-hosting experience #39820', 'The compose works but everything around it is undocumented…'],
  ['Reddit', 'reddit.com › r › Supabase', 'Is self-hosting Supabase worth it?', '"Best decision I made" — opinions, not a guide…'],
  ['RapidNative', 'rapidnative.com › blog', 'Self-Host Supabase in 2025: Complete Guide', 'A step by step walkthrough of the docker-compose stack…'],
];

const G_COLORS = ['#4285f4', '#ea4335', '#fbbc05', '#4285f4', '#34a853', '#ea4335'];

const BOX = { x: 1096, y: 58, w: 764, h: 560 };
const PAGE_W = 764;
const PAGE_H = BOX.h - 102;

const CURSOR: CursorKey[] = [
  { frame: 205, x: 1560, y: 300 },
  { frame: 262, x: 1250, y: 262 },
  { frame: 284, x: 1250, y: 262 },
  { frame: 316, x: 1480, y: 420 },
  { frame: 328, x: 1480, y: 420 },
  { frame: 372, x: 1580, y: 480 },
];
const CLICKS = [286, 330];

const B5aReconRead: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const colOp = (s: number) => interpolate(frame, [s, s + 10], [0.25, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const pageIdx = frame < DOCS ? 0 : frame < GH ? 1 : 2;
  const urls = ['google.com/search?q=self+host+supabase', 'supabase.com/docs/guides/self-hosting', 'github.com/supabase/supabase/issues/39820'];
  const tabs = ['self host supabase - Google Search', 'Self-Hosting | Supabase Docs', 'Improve the self-hosting experience · #39820'];
  const cur = sampleCursor(frame, CURSOR);
  const curOp = interpolate(frame, [198, 206], [0, 1], CLAMP);
  const press = CLICKS.reduce((p, cf) => (frame < cf - 4 || frame > cf + 8) ? p : interpolate(frame, [cf - 4, cf, cf + 8], [1, 0.8, 1], CLAMP), 1);
  const at = (s: number, dy = 10) => ({
    opacity: interpolate(frame, [s, s + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 10], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />
      {/* header — compact, left, above the table */}
      <div style={{ position: 'absolute', left: 64, top: 26 }}>
        <div style={{ ...rise(HEAD, 12), fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 3, color: CORAL }}>STEP&nbsp;1&nbsp;·&nbsp;READ</div>
        <div style={{ ...rise(READS), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink, marginTop: 4 }}>
          it doesn't write, it reads
        </div>
      </div>
      {/* the SERP dissection (compressed) */}
      <div style={{ ...rise(ROWS - 10, 16), position: 'absolute', left: 60, top: 138, width: 1010, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '14px 22px' }}>
        <div style={{ display: 'flex', fontFamily: FONT_MONO, fontSize: 15.5, letterSpacing: 1.2, color: COLORS.muted, padding: '2px 8px 9px', borderBottom: `1px solid ${COLORS.line}` }}>
          <span style={{ width: 36 }}>#</span>
          <span style={{ width: 296 }}>TOP RESULTS ON GOOGLE</span>
          <span style={{ width: 330, color: COLORS.signal, opacity: colOp(COVERS) }}>WHAT THEY COVER</span>
          <span style={{ flex: 1, color: COLORS.danger, opacity: colOp(MISSES) }}>WHAT THEY MISS</span>
        </div>
        {SERP.map(([n, src, covers, misses], i) => {
          const s = ROWS + i * 12;
          return (
            <div key={n} style={{ ...at(s, 8), display: 'flex', alignItems: 'baseline', fontSize: 18, color: COLORS.ink, padding: '6.5px 8px', borderBottom: i < 8 ? `1px solid ${COLORS.cream}` : 'none' }}>
              <span style={{ width: 36, fontFamily: FONT_MONO, color: COLORS.muted, fontSize: 16 }}>{n}</span>
              <span style={{ width: 296, fontFamily: FONT_MONO, fontSize: 17 }}>{src}</span>
              <span style={{ width: 330, color: COLORS.ink, opacity: colOp(COVERS) }}>{covers}</span>
              <span style={{ flex: 1, color: COLORS.muted, opacity: colOp(MISSES) }}>{misses}</span>
            </div>
          );
        })}
      </div>
      {/* the real browser, reading beside the table */}
      <WebBrowserFrame url={urls[pageIdx]} tabTitle={tabs[pageIdx]} box={BOX} appearAt={ROWS} pageBg="#fff">
        {/* page 1 · the real Google SERP */}
        {pageIdx === 0 && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: PAGE_W, height: PAGE_H, background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px 0' }}>
              <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 24 }}>
                {'Google'.split('').map((c, i) => <span key={i} style={{ color: G_COLORS[i] }}>{c}</span>)}
              </span>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', maxWidth: 420, border: '1px solid #dfe1e5', borderRadius: 999, padding: '8px 18px', boxShadow: '0 1px 6px rgba(32,33,36,0.12)' }}>
                <span style={{ fontSize: 15.5, color: '#202124' }}>self host supabase</span>
                <span style={{ marginLeft: 'auto', color: '#4285f4', fontSize: 15 }}>⌕</span>
              </div>
            </div>
            <div style={{ padding: '8px 20px 0 96px', fontSize: 12, color: '#70757a', opacity: interpolate(frame, [RESULTS - 14, RESULTS - 6], [0, 1], CLAMP) }}>About 1,240,000 results (0.42 seconds)</div>
            <div style={{ padding: '2px 30px 0 96px' }}>
              {G_RESULTS.map(([site, url, title, snippet], i) => (
                <div key={site} style={{ ...at(RESULTS + i * 8, 8), padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 21, height: 21, borderRadius: 999, background: '#f1f3f4', border: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#5f6368', fontWeight: 700 }}>{site[0]}</div>
                    <div>
                      <div style={{ fontSize: 12.5, color: '#202124' }}>{site}</div>
                      <div style={{ fontSize: 11.5, color: '#70757a', marginTop: -2 }}>{url}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 17.5, color: '#1a0dab', marginTop: 3 }}>{title}</div>
                  <div style={{ fontSize: 12.5, color: '#4d5156', marginTop: 2 }}>{snippet}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* page 2 · supabase docs (dark) */}
        {pageIdx === 1 && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: PAGE_W, height: PAGE_H, background: '#1c1c1c', display: 'flex' }}>
            <div style={{ width: 158, borderRight: '1px solid #2c2c2c', padding: '14px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
                <div style={{ width: 17, height: 17, borderRadius: 5, background: '#3ecf8e' }} />
                <span style={{ fontSize: 14.5, color: '#ededed', fontWeight: 600 }}>supabase</span>
              </div>
              {['Getting Started', 'Database', 'Auth', 'Storage', 'Self-Hosting', 'Realtime'].map((s) => (
                <div key={s} style={{ fontSize: 12.5, color: s === 'Self-Hosting' ? '#3ecf8e' : '#9b9b9b', padding: '5px 8px', background: s === 'Self-Hosting' ? '#3ecf8e18' : 'transparent', borderRadius: 5, marginBottom: 2 }}>{s}</div>
              ))}
            </div>
            <div style={{ flex: 1, padding: '20px 28px' }}>
              <div style={{ fontSize: 11, color: '#3ecf8e', letterSpacing: 2, marginBottom: 8 }}>SELF-HOSTING</div>
              <div style={{ fontSize: 24, color: '#ededed', fontWeight: 600 }}>Self-Hosting with Docker</div>
              {[300, 400, 360, 0, 280, 390].map((wd, i) => wd === 0
                ? <div key={i} style={{ height: 12 }} />
                : <div key={i} style={{ width: wd, height: 10, borderRadius: 5, background: '#2e2e2e', marginTop: 11 }} />)}
              <div style={{ marginTop: 18, background: '#111', border: '1px solid #2c2c2c', borderRadius: 8, padding: '13px 16px', fontFamily: FONT_MONO, fontSize: 13.5, color: '#3ecf8e' }}>
                $ docker compose up -d
              </div>
              {[370, 330].map((wd, i) => <div key={i} style={{ width: wd, height: 10, borderRadius: 5, background: '#2e2e2e', marginTop: 11 }} />)}
            </div>
          </div>
        )}
        {/* page 3 · the github pain list */}
        {pageIdx === 2 && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: PAGE_W, height: PAGE_H, background: '#fff' }}>
            <div style={{ height: 40, background: '#24292f', display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px' }}>
              <div style={{ width: 20, height: 20, borderRadius: 999, background: '#fff' }} />
              <span style={{ color: '#fff', fontSize: 13 }}>supabase / supabase</span>
            </div>
            <div style={{ padding: '16px 26px' }}>
              <div style={{ fontSize: 20, color: '#1f2328', fontWeight: 600, lineHeight: 1.3 }}>
                Improve the self-hosting developer experience <span style={{ color: '#656d76', fontWeight: 400 }}>#39820</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 9 }}>
                <span style={{ background: '#1a7f37', color: '#fff', fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '4px 11px' }}>⊙ Open</span>
                <span style={{ fontSize: 12.5, color: '#656d76' }}>342 comments · 20,012 words of undocumented pain</span>
              </div>
              {[0, 1].map((i) => (
                <div key={i} style={{ marginTop: 13, border: '1px solid #d0d7de', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ height: 30, background: '#f6f8fa', borderBottom: '1px solid #d0d7de', display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px' }}>
                    <div style={{ width: 17, height: 17, borderRadius: 999, background: '#d0d7de' }} />
                    <div style={{ width: 100 + i * 26, height: 9, borderRadius: 5, background: '#d0d7de' }} />
                  </div>
                  <div style={{ padding: '11px 12px' }}>
                    {[320, 420, 230].slice(0, 3 - i).map((wd, j) => <div key={j} style={{ width: wd, height: 9, borderRadius: 5, background: '#eaeef2', marginTop: j ? 8 : 0 }} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </WebBrowserFrame>
      {/* pointer + click ripples over the browser */}
      {curOp > 0 && (
        <div style={{ position: 'absolute', left: cur.x, top: cur.y, zIndex: 6, opacity: curOp }}>
          <CursorPointer press={press} size={30} />
        </div>
      )}
      {CLICKS.map((cf) => {
        if (frame < cf || frame > cf + 18) return null;
        const p = sampleCursor(cf, CURSOR);
        const sc = interpolate(frame, [cf, cf + 18], [0, 2.4], { ...CLAMP, easing: EASINGS.easeOut });
        const ro = interpolate(frame, [cf, cf + 18], [0.5, 0], CLAMP);
        return <div key={cf} style={{ position: 'absolute', left: p.x, top: p.y, width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: '50%', border: `2px solid ${CORAL}`, opacity: ro, transform: `scale(${sc})`, zIndex: 6 }} />;
      })}
      {/* the factory — piece rides in from the hopper to station 1 */}
      <FactoryLine station={0} pieceFrom={-1} advanceAt={0} />
    </AbsoluteFill>
  );
};

export default B5aReconRead;
