import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate, Img } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, useRise, CLAMP, lib } from '../../lib/kit';
import { WebBrowserFrame } from '../../lib/browser';
import { sampleCursor, CursorPointer, CursorKey } from '../../lib/screencast';
import { FactoryLine, CORAL } from './_shared/FactoryLine';

// ============================================================================
// B8 · step 5 · SCREENSHOTS — ROUND-6: a LIVE capture run. The browser surfs
// the run's real pages (cursor motion, scroll, URL changes); on each payoff we
// STOP: viewfinder pulse + shutter flash + freeze, and the frozen capture
// FLIES into the right-side rail (cold-open P4 capture language). The rail
// starts empty and builds live. Factory band: piece stays at station 5.
// Master span 456.8 -> 481.3 (24.5s). local f = round((master_s - 456.8) * 30).
// Cues: "drives a real browser" 459.6->f84 · "Playwright" 461.9->f153 ·
// "logs into the app" 464.3->f225 · "shoots every screenshot" 466.8->f300 ·
// "one rule I love" 473.0->f486 · "never blurs a secret" 474.7->f537 ·
// "replaces it...with a fake one" 478.7->f657
// SFX slots: camera shutter at f150 / f280 / f410 / f536.
// ============================================================================
export const compositionConfig = { id: 'B8Captures', durationInSeconds: 24.5, fps: 30, width: 1920, height: 1080 };

const HEAD = 20;
const RULE = 486;
const BLUR = 537;
const SWAP = 657;

// browser geometry (page area = under the 102px chrome)
const BX = 60, BY = 122, BW = 1050, BH = 460;
const CHROME = 102;
const PAGE = { x: BX, y: BY + CHROME, w: BW, h: BH - CHROME }; // 60,224,1050,358
const IMG_H = 1050 * (1800 / 2880); // capture rendered at page width -> 656

// capture rail (starts empty, builds live)
const RX = 1150, RW = 710;
const slotY = (i: number) => 122 + i * 118;

// the surf: [img, url, tabTitle, enterAt, scroll[from..to over range], captureAt, caption]
type Page = {
  img: string; url: string; tab: string; enterAt: number;
  scroll: { to: number; range: [number, number] }; cap: number; caption: string;
};
const PAGES: readonly Page[] = [
  { img: 'projects/video-2/run/a2_studio_table_editor.png', url: 'supabase.lab.selfhostschool.com/project/default/editor', tab: 'Supabase Studio · Table Editor', enterAt: 0, scroll: { to: 50, range: [50, 120] }, cap: 150, caption: 'Studio table editor · real HTTPS' },
  { img: 'projects/video-2/run/a3_mailpit_inbox.png', url: '164.92.174.5:8025', tab: 'Mailpit · Inbox', enterAt: 196, scroll: { to: 80, range: [215, 252] }, cap: 280, caption: 'the confirmation email, delivered' },
  { img: 'projects/video-2/run/a4_studio_sql_editor.png', url: 'supabase.lab.selfhostschool.com/project/default/sql/new', tab: 'SQL Editor · Supabase Studio', enterAt: 326, scroll: { to: 60, range: [345, 395] }, cap: 410, caption: 'SQL editor, seeded and queried' },
  { img: 'projects/video-2/run/a5_studio_auth_users.png', url: 'supabase.lab.selfhostschool.com/project/default/auth/users', tab: 'Authentication · Users', enterAt: 456, scroll: { to: 90, range: [470, 515] }, cap: 536, caption: 'real signups, post-restore' },
];
const FLY = 26; // flight length; fly starts cap+8, slot card lands cap+30

// cursor path (absolute canvas px, holds still through each capture)
const CURSOR: CursorKey[] = [
  { frame: 20, x: 940, y: 520 }, { frame: 62, x: 520, y: 390 }, { frame: 112, x: 700, y: 442 },
  { frame: 168, x: 700, y: 442 },
  { frame: 212, x: 400, y: 330 }, { frame: 250, x: 560, y: 412 }, { frame: 296, x: 560, y: 412 },
  { frame: 342, x: 300, y: 300 }, { frame: 380, x: 830, y: 540 }, { frame: 426, x: 830, y: 540 },
  { frame: 470, x: 500, y: 340 }, { frame: 514, x: 680, y: 470 }, { frame: 552, x: 680, y: 470 },
];
const CLICKS = [252, 382];

const B8Captures: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const at = (s: number, dy = 16) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });

  // active page drives the URL bar
  let pi = 0;
  for (let i = 0; i < PAGES.length; i++) if (frame >= PAGES[i].enterAt) pi = i;
  const active = PAGES[pi];

  // shutter flash across the page area on each capture
  const flash = PAGES.reduce((f, p) => {
    if (frame < p.cap || frame > p.cap + 7) return f;
    return Math.max(f, interpolate(frame, [p.cap, p.cap + 2, p.cap + 7], [0, 0.9, 0], CLAMP));
  }, 0);

  // viewfinder pulse before each capture (brackets settle 1.08 -> 1)
  const finder = PAGES.reduce<{ op: number; sc: number }>((acc, p) => {
    if (frame < p.cap - 24 || frame > p.cap + 6) return acc;
    const op = interpolate(frame, [p.cap - 24, p.cap - 16, p.cap + 1, p.cap + 6], [0, 1, 1, 0], CLAMP);
    const sc = interpolate(frame, [p.cap - 24, p.cap], [1.08, 1], { ...CLAMP, easing: EASINGS.easeOut });
    return { op, sc };
  }, { op: 0, sc: 1 });

  // cursor
  const cur = sampleCursor(frame, CURSOR);
  const curOp = interpolate(frame, [14, 22], [0, 1], CLAMP) * interpolate(frame, [556, 572], [1, 0], CLAMP);
  const press = CLICKS.reduce((p, cf) => (frame < cf - 4 || frame > cf + 8) ? p : interpolate(frame, [cf - 4, cf, cf + 8], [1, 0.8, 1], CLAMP), 1);

  // idle drift on the last page once the run is done (aliveness)
  const idleDrift = interpolate(frame, [566, 735], [1, 1.03], CLAMP);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.warn} />
      {/* header — compact, left */}
      <div style={{ position: 'absolute', left: 64, top: 22 }}>
        <div style={{ ...rise(HEAD, 12), fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 3, color: CORAL }}>STEP&nbsp;5&nbsp;·&nbsp;SCREENSHOTS</div>
        <div style={{ ...rise(HEAD + 10), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink, marginTop: 4 }}>
          it takes its own screenshots
        </div>
      </div>

      {/* ------------------------------------------------ the live browser */}
      <WebBrowserFrame url={active.url} tabTitle={active.tab} box={{ x: BX, y: BY, w: BW, h: BH }} appearAt={4} pageBg="#fff">
        {PAGES.map((p, i) => {
          const end = PAGES[i + 1]?.enterAt ?? 735;
          if (frame < p.enterAt || frame >= end) return null;
          const scrollY = interpolate(frame, p.scroll.range, [0, p.scroll.to], { ...CLAMP, easing: EASINGS.easeInOut });
          const drift = i === PAGES.length - 1 ? idleDrift : 1;
          return (
            // explicit dims: the frame's translateY wrapper is a zero-height containing block
            <div key={p.img} style={{ position: 'absolute', top: 0, left: 0, width: PAGE.w, height: PAGE.h, overflow: 'hidden', background: '#fff' }}>
              <div style={{ width: PAGE.w, transform: `translateY(${-scrollY}px) scale(${drift})`, transformOrigin: '50% 30%' }}>
                <Img src={lib(p.img)} style={{ width: PAGE.w, height: IMG_H, display: 'block' }} />
              </div>
            </div>
          );
        })}
        {/* shutter flash inside the page area */}
        {flash > 0 && <div style={{ position: 'absolute', top: 0, left: 0, width: PAGE.w, height: PAGE.h, background: '#fff', opacity: flash }} />}
      </WebBrowserFrame>

      {/* viewfinder pulse (coral corner brackets over the page area) */}
      {finder.op > 0 && (
        <div style={{ position: 'absolute', left: PAGE.x, top: PAGE.y, width: PAGE.w, height: PAGE.h, opacity: finder.op, transform: `scale(${finder.sc})`, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: 12, left: 12, width: 46, height: 46, borderTop: `5px solid ${CORAL}`, borderLeft: `5px solid ${CORAL}`, borderRadius: 4 }} />
          <div style={{ position: 'absolute', top: 12, right: 12, width: 46, height: 46, borderTop: `5px solid ${CORAL}`, borderRight: `5px solid ${CORAL}`, borderRadius: 4 }} />
          <div style={{ position: 'absolute', bottom: 12, left: 12, width: 46, height: 46, borderBottom: `5px solid ${CORAL}`, borderLeft: `5px solid ${CORAL}`, borderRadius: 4 }} />
          <div style={{ position: 'absolute', bottom: 12, right: 12, width: 46, height: 46, borderBottom: `5px solid ${CORAL}`, borderRight: `5px solid ${CORAL}`, borderRadius: 4 }} />
          <div style={{ position: 'absolute', top: 18, left: '50%', transform: 'translateX(-50%)', fontFamily: FONT_MONO, fontSize: 16, letterSpacing: 3, color: CORAL, background: `${COLORS.paper}e8`, padding: '3px 12px', borderRadius: RADIUS.pill }}>CAPTURE</div>
        </div>
      )}

      {/* click ripples */}
      {CLICKS.map((cf) => {
        if (frame < cf || frame > cf + 18) return null;
        const ck = sampleCursor(cf, CURSOR);
        const sc = interpolate(frame, [cf, cf + 18], [0, 2.4], { ...CLAMP, easing: EASINGS.easeOut });
        const ro = interpolate(frame, [cf, cf + 18], [0.5, 0], CLAMP);
        return <div key={cf} style={{ position: 'absolute', left: ck.x - 17, top: ck.y - 17, width: 34, height: 34, borderRadius: '50%', border: `2px solid ${COLORS.accent}`, opacity: ro, transform: `scale(${sc})` }} />;
      })}

      {/* the pointer */}
      {curOp > 0 && (
        <div style={{ position: 'absolute', left: cur.x, top: cur.y, transform: 'translate(-4px,-3px)', opacity: curOp }}>
          <CursorPointer press={press} />
        </div>
      )}

      {/* ------------------------------------------------ flying captures + the rail */}
      {PAGES.map((p, i) => {
        const flyStart = p.cap + 8, flyEnd = p.cap + 8 + FLY;
        const scrollFinal = p.scroll.to;
        // in flight: the frozen page shrinks from the page area into its rail slot
        if (frame >= flyStart && frame < flyEnd + 2) {
          const t = interpolate(frame, [flyStart, flyEnd], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
          const w = PAGE.w + (230 - PAGE.w) * t;
          const h = PAGE.h + (90 - PAGE.h) * t;
          const x = PAGE.x + (RX + 8 - PAGE.x) * t;
          const y = PAGE.y + (slotY(i) + 8 - PAGE.y) * t;
          // the frozen view eases back to the capture's top as it shrinks, so the
          // landed thumb shows the content, not the scrolled-past whitespace
          return (
            <div key={p.img} style={{ position: 'absolute', left: x, top: y, width: w, height: h, overflow: 'hidden', borderRadius: 8 + t * 2, border: `${2 + (1 - t) * 2}px solid #fff`, boxShadow: '0 18px 50px rgba(26,26,46,0.35)', background: '#fff', zIndex: 20 }}>
              <Img src={lib(p.img)} style={{ width: w, height: w * (1800 / 2880), display: 'block', transform: `translateY(${-scrollFinal * (w / PAGE.w) * (1 - t)}px)` }} />
            </div>
          );
        }
        // landed: the rail card (thumb + caption) — the rail builds live
        if (frame >= flyEnd) {
          const pop = interpolate(frame, [flyEnd, flyEnd + 8], [1.06, 1], { ...CLAMP, easing: EASINGS.easeOut });
          return (
            <div key={p.img} style={{ position: 'absolute', left: RX, top: slotY(i), width: RW, height: 106, transform: `scale(${pop})`, display: 'flex', alignItems: 'center', gap: 18, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.panel, boxShadow: SHADOW.soft, padding: 8, boxSizing: 'border-box' }}>
              <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${COLORS.line}`, background: '#fff', width: 230, height: 90, flexShrink: 0 }}>
                <Img src={lib(p.img)} style={{ width: 230, height: 230 * (1800 / 2880), display: 'block' }} />
              </div>
              <div style={{ fontSize: 21, color: COLORS.ink }}>{p.caption}</div>
            </div>
          );
        }
        return null;
      })}
      {/* empty-rail hint before the first capture lands */}
      {frame < PAGES[0].cap + 8 + FLY && (
        <div style={{ ...at(HEAD + 20, 8), position: 'absolute', left: RX, top: 122, width: RW, fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 2, color: COLORS.muted, border: `1.5px dashed ${COLORS.line}`, borderRadius: RADIUS.panel, padding: '14px 18px', boxSizing: 'border-box' }}>
          evidence/captures/ · empty
        </div>
      )}

      {/* the rule */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 596, display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'center' }}>
        <span style={{ ...at(RULE), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: COLORS.ink }}>it never blurs a secret</span>
        <span style={{ ...at(BLUR), fontFamily: FONT_MONO, fontSize: 23, color: COLORS.danger, textDecoration: 'line-through', textDecorationThickness: 3 }}>blur</span>
        <span style={{ ...at(SWAP), fontFamily: FONT_MONO, fontSize: 23, color: COLORS.ink, background: COLORS.paper, border: `1px solid ${COLORS.line}`, padding: '7px 17px', borderRadius: RADIUS.pill }}>
          sk-live-4f81… → <b style={{ color: COLORS.signal }}>sk-fake-XXXX</b> re-shot
        </span>
      </div>

      {/* the factory — piece stays at station 5 */}
      <FactoryLine station={4} pieceFrom={3} advanceAt={0} />
    </AbsoluteFill>
  );
};

export default B8Captures;
