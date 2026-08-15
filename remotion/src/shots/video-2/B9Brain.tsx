import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate, Img } from 'remotion';
import { Brain, FileText } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, useRise, CLAMP, lib } from '../../lib/kit';
import { Marker } from '../../lib/browser';
import { SITE } from './_shared/GuidePage';
import { FactoryLine, CORAL } from './_shared/FactoryLine';

// ============================================================================
// B9 · step 6 · WRITE — ROUND-5: the brain feeds the page. Brain items (voice
// rules, beliefs, the cloud-bills story) land on their word cues and visibly
// feed INTO the real guide page assembling beside them: the intro TYPES itself
// in his voice, the container/RAM grid drops in, the Playwright screenshots
// snap into place, the measured line gets its evidence marker. Piece -> 6.
// Master span 484.8 -> 510.0 (25.2s). local f = round((master_s - 484.8) * 30).
// Cues: "pulls up my brain" 486.3->f45 · "voice rules" 488.2->f101 · "beliefs"
// 489.3->f133 · "about self-hosting" 491.0->f187 · "story of my cloud bills"
// 492.7->f236 · "$8,000 a year" 495.7->f327 · "draft opens with my argument"
// 500.8->f480 (typing) · "in my words" 506.5->f651 (stack grid) · "in my
// voice" 507.6->f685 (screenshots) · "backed by its evidence" 508.5->f709
// ============================================================================
export const compositionConfig = { id: 'B9Brain', durationInSeconds: 25.2, fps: 30, width: 1920, height: 1080 };

const HEAD = 20;
const FILES: readonly (readonly [string, string, number])[] = [
  ['identity/voice.md', 'how I write', 101],
  ['identity/beliefs.md', 'what I believe', 133],
  ['lenses/self-hosting.md', 'my platform lens', 187],
  ['story-2026-05-added-up-my-cloud-bills', 'the $8.4k/yr story', 236],
];
const SAVED = 327;
const DRAFT = 480;
const GRID = 651;
const SNAPS = 685;
const EVIDENCE = 709;

const TLDR = 'The official Docker Compose gets you a Supabase login screen in about 20 seconds. Everything that makes it a real backend is undocumented: the secrets you must set before the first boot, auth email that fails silently, a connection pooler that hangs if you rotate keys late, HTTPS, and a backup that restores.';

// the guide's real stack cards (first 6, with the measured MB values)
const STACK: readonly (readonly [string, string])[] = [
  ['Gateway', '84 MB'], ['Postgres', '121 MB'], ['Studio', '255 MB'],
  ['Auth (GoTrue)', '35 MB'], ['Storage', '220 MB'], ['Pooler', '187 MB'],
];

const PAGE = { x: 760, y: 66, w: 1100, h: 558 };

const B9Brain: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const at = (s: number, dy = 14) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  const typedN = Math.floor(interpolate(frame, [DRAFT, DRAFT + 160], [0, TLDR.length], { ...CLAMP, easing: EASINGS.easeInOut }));
  const typed = TLDR.slice(0, typedN);
  const typing = frame >= DRAFT && typedN < TLDR.length;
  const cursorOn = Math.floor(frame / 12) % 2 === 0;
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      {/* header — compact, left */}
      <div style={{ position: 'absolute', left: 64, top: 22 }}>
        <div style={{ ...rise(HEAD, 12), fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 3, color: CORAL }}>STEP&nbsp;6&nbsp;·&nbsp;WRITE</div>
        <div style={{ ...rise(HEAD + 12), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: COLORS.ink, marginTop: 4 }}>
          but first, it pulls up <span style={{ color: COLORS.accent }}>my brain</span>
        </div>
      </div>
      {/* the brain — what the writer stage actually loaded */}
      <div style={{ ...at(60, 20), position: 'absolute', left: 60, top: 150, width: 640, boxSizing: 'border-box', background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '22px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Brain size={28} color={COLORS.accent} strokeWidth={2.1} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 1.5, color: COLORS.muted }}>LOADED&nbsp;FOR&nbsp;THIS&nbsp;PIECE</span>
        </div>
        {FILES.map(([f, note, s]) => (
          <div key={f} style={{ ...at(s), display: 'flex', alignItems: 'center', gap: 10, padding: '9px 2px', borderBottom: `1px solid ${COLORS.cream}` }}>
            <FileText size={20} color={COLORS.accent2} strokeWidth={2} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 18.5, color: COLORS.ink, flex: 1 }}>{f}</span>
            <span style={{ fontSize: 17, color: COLORS.muted }}>{note}</span>
          </div>
        ))}
        <div style={{ ...at(SAVED), marginTop: 14, fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 24, color: COLORS.ink }}>
          why I self-host: <span style={{ color: COLORS.signal }}>$8,000+ a year saved</span>
        </div>
      </div>
      {/* feed particles — each brain item visibly feeds the page */}
      {[...FILES.map(([, , s], i) => [s, 208 + i * 44] as const), [SAVED, 400] as const].map(([s, fy]) => {
        const go = s + 10;
        if (frame < go || frame > go + 34) return null;
        const t = interpolate(frame, [go, go + 30], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
        const x = 700 + (PAGE.x + 40 - 700) * t;
        const y = fy + (PAGE.y + 220 - fy) * t * t;
        const op = interpolate(frame, [go, go + 6, go + 26, go + 32], [0, 1, 1, 0], CLAMP);
        return <div key={`${s}`} style={{ position: 'absolute', left: x, top: y, width: 13, height: 13, borderRadius: 999, background: COLORS.accent, boxShadow: `0 0 14px ${COLORS.accent}`, opacity: op, zIndex: 6 }} />;
      })}
      {/* the real guide page, assembling */}
      <div style={{ ...at(60, 22), position: 'absolute', left: PAGE.x, top: PAGE.y, width: PAGE.w, height: PAGE.h, boxSizing: 'border-box', background: SITE.bg, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.panel, boxShadow: SHADOW.card, overflow: 'hidden' }}>
        {/* mini site header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '13px 30px', borderBottom: `1px solid ${SITE.line}`, background: '#fffefc' }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 19, color: SITE.ink }}>Learn<span style={{ color: SITE.purple }}>With</span>Hasan</span>
          <div style={{ display: 'flex', gap: 18, fontSize: 13.5, color: SITE.body }}>
            <span>Courses</span><span>Resources ⌄</span><span>Guides ⌄</span><span>Tools</span>
          </div>
          <span style={{ marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 12.5, color: SITE.muted }}>content-lab/supabase/draft.md → the page</span>
        </div>
        <div style={{ padding: '16px 34px' }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 27, color: SITE.ink, lineHeight: 1.18 }}>
            How to Self-Host Supabase: The Parts the Docker Compose Skips
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 8 }}>
            <Img src={lib('projects/video-2/yt-2022/avatar.png')} style={{ width: 26, height: 26, borderRadius: 999, objectFit: 'cover' }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: SITE.ink }}>Hasan Aboul Hasan</span>
            <span style={{ fontSize: 13, color: SITE.muted }}>· in my voice, from my brain</span>
          </div>
          {/* the intro types itself (green TL;DR rail) */}
          <div style={{ marginTop: 12, background: SITE.card, border: `1.5px solid ${SITE.line}`, borderLeft: `4px solid ${SITE.green}`, borderRadius: 10, padding: '12px 18px', minHeight: 118 }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: 2.5, color: SITE.muted, marginBottom: 7 }}>≡&nbsp;&nbsp;TL;DR</div>
            <div style={{ fontSize: 15.5, lineHeight: 1.5, color: SITE.body }}>
              {typed}{typing && <span style={{ color: CORAL, opacity: cursorOn ? 1 : 0 }}>▌</span>}
              {typedN >= TLDR.length && (
                <> <Marker start={EVIDENCE} color="#ffd766bb">I ran the whole thing on one 4 GB server and measured every part.</Marker> This is that run, written down.</>
              )}
            </div>
          </div>
          {/* the container/RAM grid drops in */}
          <div style={{ ...at(GRID, 18), display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            {STACK.map(([name, mb], i) => (
              <div key={name} style={{ background: SITE.card, border: `1.5px solid ${i === 0 ? SITE.purple : SITE.line}`, borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: SITE.ink }}>{name}</span>
                <span style={{ fontFamily: FONT_MONO, fontSize: 13.5, fontWeight: 700, color: SITE.purple }}>{mb}</span>
              </div>
            ))}
          </div>
          {/* the Playwright screenshots snap into place */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            {['run/a2_studio_table_editor.png', 'run/a3_mailpit_inbox.png'].map((src, i) => {
              const s = SNAPS + i * 10;
              const sc = interpolate(frame, [s, s + 9], [1.18, 1], { ...CLAMP, easing: EASINGS.overshoot });
              const op = interpolate(frame, [s, s + 6], [0, 1], CLAMP);
              return (
                <div key={src} style={{ width: 505, height: 128, borderRadius: 8, overflow: 'hidden', border: `1.5px solid ${SITE.line}`, background: '#fff', opacity: op, transform: `scale(${sc})`, boxShadow: '0 6px 18px rgba(24,23,51,0.10)' }}>
                  <Img src={lib(`projects/video-2/${src}`)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* the factory — piece advances to station 6, WRITE */}
      <FactoryLine station={5} pieceFrom={4} advanceAt={0} />
    </AbsoluteFill>
  );
};

export default B9Brain;
