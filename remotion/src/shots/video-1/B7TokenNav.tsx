import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { COLORS, EASINGS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, Ring } from '../../lib/browser';
import { BOX, PW, PH, GH, GhMark, BrainMark, WizardShell, WizCard, CursorLayer, Key } from './B7kit';

// =============================================================================
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// B7 (11/16) — the deep link, then GitHub's fine-grained token form. Master span
// 513.396967 -> 524.2648 (local frame = round((t - 513.396967) * 30)).
//   "a link"                516.48/517.44 -> f31   ring on the wizard's link row
//   "Just click it,"        519.52 -> f94   click -> github.com/settings/tokens
//   "fine grained tokens,"  521.45 -> f152  nav click -> the fine-grained list
//   "generate new token,"   523.15 -> f203  click -> the new-token form
//   "select access to the
//    repositories."         525.07 -> f260  "Only select repositories" resolves
// Three navigations, three URL paths, three hard cuts. GitHub in GitHub's palette.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7TokenNav', durationInSeconds: 9.7, fps: 30, width: 1920, height: 1080 };

const F_RING = 31;
const F_GO = 94;
const F_FINE = 152;
const F_NEW = 203;
const F_SEL = 255;

const NAV = [
  { t: 'GitHub Apps', indent: 0 },
  { t: 'OAuth Apps', indent: 0 },
  { t: 'Personal access tokens', indent: 0 },
  { t: 'Fine-grained tokens', indent: 1 },
  { t: 'Tokens (classic)', indent: 1 },
];

const ACCESS = [
  { t: 'All repositories', sub: 'Applies to all current and future repositories you own.' },
  { t: 'Only select repositories', sub: 'Select at most 50 repositories.' },
  { t: 'Public repositories', sub: 'Read-only access to public repositories.' },
];

const KEYS: Key[] = [
  { frame: 0, x: 1350, y: 760 },
  { frame: 86, x: 960, y: 554 },
  { frame: 104, x: 960, y: 554 },
  { frame: 140, x: 570, y: 474 },
  { frame: 164, x: 570, y: 474 },
  { frame: 190, x: 1470, y: 276 },
  { frame: 214, x: 1470, y: 276 },
  { frame: 248, x: 472, y: 589 },
];
const CLICKS = [F_GO, F_FINE, F_NEW, F_SEL];

const GhBar: React.FC = () => (
  <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 54, background: GH.canvas, borderBottom: `1px solid ${GH.border}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px' }}>
    <GhMark size={28} />
    <span style={{ fontSize: 19, color: GH.dim }}>Type / to search</span>
    <span style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: '50%', background: COLORS.accent }} />
  </div>
);

const B7TokenNav: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const page = frame >= F_NEW ? 4 : frame >= F_FINE ? 3 : frame >= F_GO ? 2 : 1;
  const url = page === 1 ? 'brain.learnwithhasan.com/setup'
    : page === 2 ? 'github.com/settings/tokens'
      : page === 3 ? 'github.com/settings/personal-access-tokens'
        : 'github.com/settings/personal-access-tokens/new';
  const tab = page === 1 ? 'Setup | BrainOutside' : 'Personal access tokens';
  const selFill = r(F_SEL, F_SEL + 8);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <WebBrowserFrame url={url} tabTitle={tab} favicon={page === 1 ? <BrainMark size={20} /> : <GhMark size={20} />} box={BOX} appearAt={0}>

        {/* ---------------- page 1: the wizard hands you the link ---------------- */}
        {page === 1 && (
          <WizardShell step={4} done={3} railAt={0} title="Let it write back">
            <WizCard at={4} x={460} y={320} w={700} h={300}>
              <div style={{ position: 'absolute', left: 40, top: 26, fontSize: 20, color: COLORS.muted }}>GitHub token</div>
              <div style={{
                position: 'absolute', left: 40, top: 62, width: 620, height: 64, borderRadius: 10,
                background: `${COLORS.accent}12`, border: `1px solid ${COLORS.accent}`,
                display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px',
                fontSize: 22, color: COLORS.accent, fontWeight: 500,
              }}>
                <ExternalLink size={20} color={COLORS.accent} strokeWidth={2.2} />
                Create a fine-grained token on GitHub
                {frame >= F_RING && <Ring start={F_RING} color={COLORS.accent} style={{ inset: -9, borderRadius: 14 }} />}
              </div>
              <div style={{ position: 'absolute', left: 40, top: 166, fontSize: 20, color: COLORS.muted }}>Paste it here when you have it</div>
              <div style={{ position: 'absolute', left: 40, top: 198, width: 620, height: 56, borderRadius: 10, background: COLORS.cream, border: `1px solid ${COLORS.line}`, display: 'flex', alignItems: 'center', padding: '0 18px', fontFamily: FONT_MONO, fontSize: 21, color: COLORS.muted }}>
                github_pat_…
              </div>
            </WizCard>
          </WizardShell>
        )}

        {/* ---------------- page 2: developer settings ---------------- */}
        {page === 2 && (
          <div style={{ position: 'relative', width: PW, height: PH, background: GH.bg, color: GH.text }}>
            <GhBar />
            <div style={{ position: 'absolute', left: 250, top: 100, fontSize: 20, fontWeight: 700, color: GH.text }}>Developer settings</div>
            {NAV.map((n, i) => (
              <div key={n.t} style={{
                position: 'absolute', left: 250, top: 160 + i * 52, width: 340, height: 52,
                display: 'flex', alignItems: 'center', paddingLeft: 16 + n.indent * 22,
                fontSize: 21, color: GH.text, borderRadius: 8,
              }}>{n.t}</div>
            ))}
            <div style={{ position: 'absolute', left: 660, top: 104, fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 600 }}>Personal access tokens</div>
            <div style={{ position: 'absolute', left: 660, top: 168, width: 880, fontSize: 22, color: GH.dim, lineHeight: 1.6 }}>
              Fine-grained tokens let you scope a token to a single repository and a single permission. That is what we want here.
            </div>
          </div>
        )}

        {/* ---------------- page 3: the fine-grained list ---------------- */}
        {page === 3 && (
          <div style={{ position: 'relative', width: PW, height: PH, background: GH.bg, color: GH.text }}>
            <GhBar />
            <div style={{ position: 'absolute', left: 100, top: 110, fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 600 }}>Fine-grained personal access tokens</div>
            <div style={{ position: 'absolute', left: 1180, top: 118, width: 280, height: 52, background: GH.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 21, fontWeight: 600, color: GH.on }}>
              Generate new token <ChevronDown size={16} color={GH.on} />
            </div>
            <div style={{ position: 'absolute', left: 100, top: 210, width: 1420, height: 300, border: `1px dashed ${GH.border}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: GH.dim }}>
              You don&apos;t have any fine-grained tokens yet
            </div>
          </div>
        )}

        {/* ---------------- page 4: the new-token form ---------------- */}
        {page === 4 && (
          <div style={{ position: 'relative', width: PW, height: PH, background: GH.bg, color: GH.text }}>
            <GhBar />
            <div style={{ position: 'absolute', left: 300, top: 96, fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 600 }}>New fine-grained personal access token</div>

            <div style={{ position: 'absolute', left: 300, top: 162, fontSize: 19, fontWeight: 600 }}>Token name</div>
            <div style={{ position: 'absolute', left: 300, top: 190, width: 560, height: 52, border: `1px solid ${GH.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 16px', fontFamily: FONT_MONO, fontSize: 21 }}>
              brainoutside
            </div>
            <div style={{ position: 'absolute', left: 900, top: 162, fontSize: 19, fontWeight: 600 }}>Expiration</div>
            <div style={{ position: 'absolute', left: 900, top: 190, width: 320, height: 52, border: `1px solid ${GH.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: 21 }}>
              90 days <ChevronDown size={16} color={GH.dim} />
            </div>

            <div style={{ position: 'absolute', left: 300, top: 292, fontSize: 26, fontWeight: 600 }}>Repository access</div>
            {ACCESS.map((a, i) => {
              const on = i === 1 ? selFill > 0.5 : false;
              const fill = i === 1 ? selFill : 0;
              return (
                <div key={a.t} style={{ position: 'absolute', left: 300, top: 348 + i * 78, width: 1020, height: 62, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${on ? COLORS.accent : GH.border}`, marginLeft: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: COLORS.accent, transform: `scale(${fill})` }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: on ? COLORS.accent : GH.text }}>{a.t}</div>
                    <div style={{ fontSize: 19, color: GH.dim, marginTop: 2 }}>{a.sub}</div>
                  </div>
                  {i === 1 && frame >= F_SEL && <Ring start={F_SEL + 1} color={COLORS.accent} style={{ inset: -10, borderRadius: 12 }} />}
                </div>
              );
            })}
          </div>
        )}
      </WebBrowserFrame>

      <CursorLayer keys={KEYS} clicks={CLICKS} />
    </AbsoluteFill>
  );
};
export default B7TokenNav;
