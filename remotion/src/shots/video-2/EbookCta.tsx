import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate, Img } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, CLAMP, lib } from '../../lib/kit';

// ============================================================================
// Ebook CTA · ROUND-7 REBUILD — the REAL book (my-books-creator ·
// books/blocks/universal-foundations, 72 pages, rendered to
// media/projects/video-2/ebook/). The book floats LEFT as a hovering 3D
// mockup built from the real cover; on "I designed it" the camera ZOOMS IN,
// the cover swings open and we page through REAL spreads synced to the
// narration; ZOOM OUT on "It's free, grab it". Extended to master 255.9 so
// there is NO face gap: the last frames dip to dark and hard-cut straight
// into B4Input's Claude Code view.
// Master span 227.0 -> 255.9 (28.9s). local f = round((m - 227.0) * 30).
// Cues: "free ebook" 227.7->f21 · "vibe engineering building blocks"
// 228.8->f54 · "blind vibe coder -> real builder" 232.1->f153 · "totally
// free" 235.9->f267 · ZOOM "I designed it" 237.28->f308 (cover opens f316) ·
// "one block on each page" 240.03->f391 (hold the blocks spread) · turn 2 on
// "read like 5 pages a day" 242.8->f450 (diagram spread) · turn 3 on "1 week"
// 244.68->f530 (part-checklist spread) · turn 4 on "complete mind shift"
// 248.69->f651 (the CLAUDE.md rules payoff) · ZOOM OUT "It's free, grab it"
// 252.85->f776 · "let's continue our work" 254.1->f813 (dip to dark) · hard
// cut to B4Input at f867.
// ============================================================================
export const compositionConfig = { id: 'EbookCta', durationInSeconds: 28.9, fps: 30, width: 1920, height: 1080 };

const BOOK = 21;
const TITLE = 54;
const JOURNEY = 153;
const FREE = 267;
const ZOOM = 308;
const OPEN = 316;
const TURNS = [450, 530, 651] as const;
const ZOOM_OUT = 776;
const GRAB = 790;
const DIP = 813;

const ebook = (p: string) => lib(`projects/video-2/ebook/${p}`);
const SPREADS: readonly (readonly [string, string])[] = [
  ['p10.png', 'p11.png'], // block anatomy — "one block on each page"
  ['p32.png', 'p33.png'], // the diagram-heavy pair (N+1 / NoSQL)
  ['p35.png', 'p36.png'], // part-6 checklist divider
  ['p68.png', 'p69.png'], // the CLAUDE.md rules payoff
];

// closed-book geometry
const BW = 430;
const BH = 596;
const THICK = 34;
// open-book page geometry (in the zoomed view)
const PW = 430;
const PH = 596;

const ease = { ...CLAMP, easing: EASINGS.easeOut };

const PageFace: React.FC<{ src: string; flip?: boolean }> = ({ src, flip }) => (
  <div style={{ position: 'absolute', inset: 0, background: '#fff', overflow: 'hidden', transform: flip ? 'scaleX(-1)' : undefined }}>
    <Img src={ebook(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  </div>
);

const EbookCta: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (s: number, dy = 14) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], ease),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], ease)}px)`,
  });
  const freeIn = interpolate(frame, [FREE, FREE + 10], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });

  // ---- camera: closed-left -> zoomed-center -> back -----------------------
  const zin = interpolate(frame, [ZOOM, ZOOM + 26], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const zout = interpolate(frame, [ZOOM_OUT, ZOOM_OUT + 22], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const z = zin * (1 - zout); // 0 = mockup view, 1 = reading view
  // the open book (reading view) fades/scales with z
  const openBookOp = interpolate(z, [0.55, 0.9], [0, 1], CLAMP);
  const mockOp = 1 - interpolate(z, [0.25, 0.6], [0, 1], CLAMP);

  // closed mockup: float + bob
  const bob = 9 * Math.sin(frame / 26);
  const sway = 1.2 * Math.sin(frame / 44);
  const mockIn = interpolate(frame, [BOOK, BOOK + 16], [0, 1], ease);
  const mockRise = interpolate(frame, [BOOK, BOOK + 16], [30, 0], ease);
  // as the camera zooms, the mockup drifts toward center and grows
  const mx = interpolate(z, [0, 1], [235, 560]);
  const my = interpolate(z, [0, 1], [225, 120]) + bob * (1 - z * 0.7);
  const msc = interpolate(z, [0, 1], [1, 1.55]);

  // cover swing (opens the book once zoomed)
  const openT = interpolate(frame, [OPEN + 14, OPEN + 40], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const closeT = interpolate(frame, [ZOOM_OUT, ZOOM_OUT + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const coverAngle = -180 * openT * (1 - closeT);

  // current spread + page-turn progress
  let spread = 0;
  let turn = 0;
  for (let k = 0; k < TURNS.length; k++) {
    const tp = interpolate(frame, [TURNS[k], TURNS[k] + 22], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
    if (tp >= 1) spread = k + 1;
    else if (tp > 0) { spread = k; turn = tp; break; }
  }
  const cur = SPREADS[spread];
  const nxt = SPREADS[Math.min(spread + 1, SPREADS.length - 1)];

  // the closing dip into B4Input (no face gap: cut straight to the dark editor)
  const dip = interpolate(frame, [DIP + 24, 866], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />

      {/* ---- the hovering 3D mockup (closed book, real cover) */}
      {mockOp > 0 && (
        <div style={{ position: 'absolute', left: mx, top: my + mockRise, opacity: mockIn * mockOp, transform: `scale(${msc})`, transformOrigin: 'center center' }}>
          {/* floor shadow */}
          <div style={{ position: 'absolute', left: -30, top: BH + 66 - bob * 1.6, width: BW + 120, height: 54, borderRadius: '50%', background: 'rgba(24,20,50,0.32)', filter: 'blur(22px)', transform: `scaleX(${1 + 0.025 * Math.sin(frame / 26)})` }} />
          <div style={{ width: BW, height: BH, perspective: 1600 }}>
            <div style={{ position: 'relative', width: BW, height: BH, transformStyle: 'preserve-3d', transform: `rotateY(${-21 + sway}deg) rotateX(4deg)` }}>
              {/* back cover silhouette (thickness) */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: '#12122a', transform: `translateZ(${-THICK}px)` }} />
              {/* page block edge — right side */}
              <div style={{ position: 'absolute', right: 0, top: 5, width: THICK, height: BH - 10, transformOrigin: 'right center', transform: 'rotateY(90deg)', background: 'repeating-linear-gradient(180deg, #f4f1e9 0 3px, #d9d5c8 3px 4px)', borderRadius: 2 }} />
              {/* the real cover */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: 8, overflow: 'hidden', boxShadow: '0 30px 70px rgba(20,18,44,0.35)' }}>
                <Img src={ebook('cover.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 22, background: 'linear-gradient(90deg, rgba(0,0,0,0.18), rgba(0,0,0,0))' }} />
              </div>
            </div>
          </div>
          {/* 100% FREE badge */}
          <div style={{ position: 'absolute', right: -52, top: -38, opacity: freeIn * mockOp, transform: `rotate(10deg) scale(${0.7 + 0.3 * freeIn})`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: '#fff', background: COLORS.signal, borderRadius: RADIUS.pill, padding: '12px 30px', boxShadow: SHADOW.card }}>
            100% FREE
          </div>
        </div>
      )}

      {/* ---- the reading view (zoomed open book, real spreads) */}
      {openBookOp > 0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: openBookOp }}>
          <div style={{ position: 'relative', width: PW * 2, height: PH, perspective: 2200, transform: `scale(${interpolate(z, [0.55, 1], [0.92, 1.06], CLAMP)})` }}>
            {/* book base shadow */}
            <div style={{ position: 'absolute', left: -20, right: -20, top: PH - 8, height: 46, borderRadius: '50%', background: 'rgba(24,20,50,0.30)', filter: 'blur(20px)' }} />
            {/* left page (current) */}
            <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: PH, borderRadius: '8px 0 0 8px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(20,18,44,0.30)' }}>
              <PageFace src={cur[0]} />
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 34, background: 'linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.14))' }} />
            </div>
            {/* right page underneath (next right while turning, else current right) */}
            <div style={{ position: 'absolute', left: PW, top: 0, width: PW, height: PH, borderRadius: '0 8px 8px 0', overflow: 'hidden', boxShadow: '0 24px 60px rgba(20,18,44,0.30)' }}>
              <PageFace src={turn > 0 ? nxt[1] : cur[1]} />
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 34, background: 'linear-gradient(90deg, rgba(0,0,0,0.14), rgba(0,0,0,0))' }} />
            </div>
            {/* the turning page: front = current right, back = next left */}
            {turn > 0 && (
              <div style={{
                position: 'absolute', left: PW, top: 0, width: PW, height: PH,
                transformStyle: 'preserve-3d', transformOrigin: 'left center',
                transform: `rotateY(${-180 * turn}deg)`,
                boxShadow: turn < 0.5 ? '14px 18px 44px rgba(20,18,44,0.25)' : '-14px 18px 44px rgba(20,18,44,0.25)',
              }}>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', overflow: 'hidden' }}>
                  <PageFace src={cur[1]} />
                </div>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', overflow: 'hidden' }}>
                  <PageFace src={nxt[0]} />
                </div>
              </div>
            )}
            {/* the cover swinging open / closed over the spread */}
            {coverAngle > -178 && coverAngle < -2 && (
              <div style={{
                position: 'absolute', left: PW, top: 0, width: PW, height: PH,
                transformStyle: 'preserve-3d', transformOrigin: 'left center',
                transform: `rotateY(${coverAngle}deg)`,
              }}>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderRadius: '0 8px 8px 0', overflow: 'hidden' }}>
                  <Img src={ebook('cover.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: '8px 0 0 8px', background: '#f6f4ec' }} />
              </div>
            )}
            {/* center gutter */}
            <div style={{ position: 'absolute', left: PW - 3, top: 2, width: 6, height: PH - 4, background: 'linear-gradient(90deg, rgba(0,0,0,0.10), rgba(0,0,0,0.22), rgba(0,0,0,0.10))' }} />
          </div>
        </AbsoluteFill>
      )}

      {/* ---- right column (mockup view only) */}
      <div style={{ position: 'absolute', left: 810, top: 286, width: 900, opacity: mockOp }}>
        <div style={{ ...at(TITLE), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 58, color: COLORS.ink, lineHeight: 1.2 }}>
          the top vibe engineering<br />building blocks
        </div>
        <div style={{ ...at(JOURNEY, 16), display: 'flex', alignItems: 'center', gap: 16, marginTop: 36, fontSize: 29 }}>
          <span style={{ color: COLORS.muted }}>blind vibe coder</span>
          <span style={{ color: COLORS.accent, fontWeight: 700, fontSize: 34 }}>→</span>
          <span style={{ color: COLORS.ink, fontFamily: FONT_DISPLAY, fontWeight: 600 }}>a real builder with AI</span>
        </div>
        <div style={{ ...at(JOURNEY + 40, 12), display: 'flex', gap: 14, marginTop: 38 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 23, color: COLORS.ink, background: COLORS.cream, border: `1px solid ${COLORS.line}`, padding: '10px 22px', borderRadius: RADIUS.pill }}>47 blocks · 72 pages</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 23, color: COLORS.ink, background: COLORS.cream, border: `1px solid ${COLORS.line}`, padding: '10px 22px', borderRadius: RADIUS.pill }}>free PDF</span>
        </div>
      </div>

      {/* ---- the grab-it payoff (returns with the zoom out) */}
      {frame >= GRAB && (
        <div style={{ position: 'absolute', left: 810, top: 700, opacity: interpolate(frame, [GRAB, GRAB + 12], [0, 1], ease) * (1 - dip) }}>
          <div style={{ transform: `scale(${1 + 0.03 * Math.abs(Math.sin((frame - GRAB) / 8))})`, transformOrigin: 'left center', display: 'inline-block', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 32, color: '#fff', background: COLORS.accent, borderRadius: RADIUS.pill, padding: '18px 40px', boxShadow: SHADOW.card }}>
            grab it free · link below
          </div>
          <div style={{ ...at(DIP, 10), marginTop: 22, fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted }}>
            back to the run →
          </div>
        </div>
      )}

      {/* the dip into B4Input's dark editor — no face in between */}
      {dip > 0 && <AbsoluteFill style={{ background: '#000', opacity: dip }} />}
    </AbsoluteFill>
  );
};

export default EbookCta;
