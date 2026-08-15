import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { GitCommitHorizontal, CircleCheck } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';
import { WebBrowserFrame } from '../../lib/browser';
import { GuidePageBody } from './_shared/GuidePage';
import { TermWindow, TermLines, TermLine } from './_shared/TermKit';
import { FactoryLine } from './_shared/FactoryLine';

// ============================================================================
// B11 · ship — ROUND-6 redesign: the CHECKED guide (green, 6/6 loops clean)
// gets built, rendered and committed. Guide left, build/ship terminal right,
// the real commit chip 057fb87 lands on its word. The factory band completes:
// the piece sits at station 7 (VERIFY + SHIP), line done.
// Master span 525.8 -> 531.7 (5.9s). local f = round((master_s - 525.8) * 30).
// Cues: "built" 527.4->f49 · "checked" 527.9->f64 · "rendered" 528.5->f81 ·
// "committed" 529.4->f107 · commit chip 530.3->f135 · "site's repo" 530.4->f139
// ============================================================================
export const compositionConfig = { id: 'B11Ship', durationInSeconds: 5.9, fps: 30, width: 1920, height: 1080 };

const HEAD = 6;
// the checked guide, mini
const BX = 60, BY = 118, BW = 780, BH = 500;
const CHROME = 102;
const PAGE = { w: BW, h: BH - CHROME };
const GUIDE_W = 1632;
const SCALE = PAGE.w / GUIDE_W;

const LINES: readonly TermLine[] = [
  [14, '$ factory ship PIECE.md', 'dim'],
  [28, '▸ building the page…', 'text'],
  [49, '✓ built · guide compiled, 0 errors', 'ok'],
  [64, '✓ checked · 6/6 verification loops clean', 'ok'],
  [81, '✓ rendered · html + images + code blocks', 'ok'],
  [96, '$ git add . && git commit', 'dim'],
  [107, '✓ committed · "guide: self-host supabase"', 'ok'],
  [139, "▸ pushed → my site's repo", 'accent'],
];
const COMMIT = 135;
const SHIPPED = 150;

const B11Ship: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const at = (s: number, dy = 12) => ({
    opacity: interpolate(frame, [s, s + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 10], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  const stampPop = interpolate(frame, [SHIPPED, SHIPPED + 9], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      {/* header — compact, left */}
      <div style={{ position: 'absolute', left: 64, top: 22 }}>
        <div style={{ ...rise(HEAD, 12), fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 3, color: COLORS.accent }}>S8&nbsp;·&nbsp;SHIP</div>
        <div style={{ ...rise(HEAD + 8), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink, marginTop: 4 }}>
          the checked guide ships
        </div>
      </div>

      {/* ---------------------------------- the checked guide (carried from B10) */}
      <WebBrowserFrame url="learnwithhasan.com/guide/self-host-supabase" tabTitle="How to Self-Host Supabase" box={{ x: BX, y: BY, w: BW, h: BH }} appearAt={0} pageBg="#fdfcf7">
        <div style={{ position: 'absolute', top: 0, left: 0, width: PAGE.w, height: PAGE.h, overflow: 'hidden', background: '#fdfcf7' }}>
          <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left', width: GUIDE_W }}>
            <div style={{ transform: 'translateY(-270px)' }}>
              <GuidePageBody />
            </div>
          </div>
        </div>
        {/* it arrives already clean: green ring + loops chip, no re-entrance */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: PAGE.w, height: PAGE.h, boxShadow: `inset 0 0 0 4px ${COLORS.signal}`, opacity: 0.8, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 12, right: 14, display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT_MONO, fontSize: 16, color: COLORS.ink, background: `${COLORS.paper}f2`, border: `1.5px solid ${COLORS.signal}`, padding: '5px 13px', borderRadius: RADIUS.pill, boxShadow: SHADOW.soft }}>
          <CircleCheck size={18} color={COLORS.signal} strokeWidth={2.4} /> 6/6 loops clean
        </div>
        {/* SHIPPED stamp once the push lands */}
        {frame >= SHIPPED && (
          <div style={{ position: 'absolute', top: 40, left: 34, transform: `rotate(-8deg) scale(${0.85 + 0.15 * stampPop})`, opacity: stampPop, fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 40, letterSpacing: 4, color: COLORS.signal, border: `4px solid ${COLORS.signal}`, borderRadius: 10, padding: '4px 18px', background: `${COLORS.paper}d9` }}>
            SHIPPED
          </div>
        )}
      </WebBrowserFrame>

      {/* ---------------------------------- the build/ship terminal */}
      <TermWindow title="factory · ship" x={880} y={118} w={980} h={500} appearAt={0}>
        <TermLines lines={LINES} x={28} y={20} w={920} rows={9} size={23} lineH={42} />
      </TermWindow>
      {/* the real commit chip on its word */}
      <div style={{ ...at(COMMIT, 14), position: 'absolute', left: 1010, top: 530, display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONT_MONO, fontSize: 26, color: COLORS.ink, background: COLORS.paper, border: `2px solid ${COLORS.accent}`, borderRadius: RADIUS.pill, padding: '12px 26px', boxShadow: SHADOW.card }}>
        <GitCommitHorizontal size={26} color={COLORS.accent} strokeWidth={2.2} />
        commit <b style={{ color: COLORS.accent }}>057fb87</b> → my site's repo
      </div>

      {/* the factory — line complete, piece parked at station 7 */}
      <FactoryLine station={6} pieceFrom={6} />
    </AbsoluteFill>
  );
};

export default B11Ship;
