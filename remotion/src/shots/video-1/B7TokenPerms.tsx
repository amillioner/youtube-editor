import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ChevronDown, Check, GitBranch, Lock } from 'lucide-react';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, Ring } from '../../lib/browser';
import { BOX, PW, GH, GhMark, CursorLayer, Caption, CONTINUE, Key } from './B7kit';

// =============================================================================
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// B7 (12/16) — scope the token to one repo and one permission. Master span
// 523.096967 -> 531.6648 (local frame = round((t - 523.096967) * 30)).
//   "Which is your brain repo," 526.66 -> f17  the repo picker resolves to my-brain
//   "then permissions,"         528.20 -> f63  the page scrolls to Permissions
//   "contents,"                 529.22 -> f94  ring on the Contents row
//   "read and write."           530.68 -> f137 the access select is set
//   "That's the only you need." 532.02 -> f178 everything else dims, caption lands
// Same URL path as B7TokenNav: this is one page, scrolled and filled in, NOT a
// navigation. Chrome continues (appearAt CONTINUE) so only the page moves.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7TokenPerms', durationInSeconds: 7.4, fps: 30, width: 1920, height: 1080 };

const F_OPEN = 6;
const F_REPO = 17;
const F_CHIP = 24;
const F_SCROLL = 58;
const F_SCROLL_END = 80;
const F_CONTENTS = 94;
const F_SELECT = 110;
const F_RW = 137;
const F_ONLY = 178;

const SCROLL_TO = 600;

const PERMS = [
  'Actions', 'Administration', 'Commit statuses', 'Contents', 'Deployments', 'Metadata',
];
const CONTENTS_I = 3;
const ROW_Y = 860, ROW_H = 78;

const REPOS = ['hassancs91/my-brain', 'hassancs91/brainoutside', 'hassancs91/learnwithhasan'];

const KEYS: Key[] = [
  { frame: 0, x: 730, y: 748 },
  { frame: 8, x: 730, y: 748 },
  { frame: 14, x: 730, y: 818 },
  { frame: 28, x: 730, y: 818 },
  { frame: 88, x: 1400, y: 657 },
  { frame: 112, x: 1400, y: 657 },
  { frame: 126, x: 1400, y: 803 },
  { frame: 152, x: 1400, y: 803 },
];
const CLICKS = [F_OPEN, F_REPO, F_SELECT, F_RW];

const B7TokenPerms: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const scrollY = r(F_SCROLL, F_SCROLL_END, 0, SCROLL_TO, EASINGS.easeInOut);
  const listOpen = frame >= F_OPEN && frame < F_REPO;
  const selOpen = frame >= F_SELECT && frame < F_RW;
  const dim = r(F_ONLY, F_ONLY + 14, 1, 0.26);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <WebBrowserFrame
        url="github.com/settings/personal-access-tokens/new"
        tabTitle="Personal access tokens" favicon={<GhMark size={20} />}
        box={BOX} appearAt={CONTINUE} scrollY={scrollY}
      >
        <div style={{ position: 'relative', width: PW, height: 1380, background: GH.bg, color: GH.text }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 54, background: GH.canvas, borderBottom: `1px solid ${GH.border}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px' }}>
            <GhMark size={28} />
            <span style={{ fontSize: 19, color: GH.dim }}>Type / to search</span>
          </div>
          <div style={{ position: 'absolute', left: 300, top: 96, fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 600 }}>New fine-grained personal access token</div>

          <div style={{ position: 'absolute', left: 300, top: 162, fontSize: 19, fontWeight: 600 }}>Token name</div>
          <div style={{ position: 'absolute', left: 300, top: 190, width: 560, height: 52, border: `1px solid ${GH.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 16px', fontFamily: FONT_MONO, fontSize: 21 }}>brainoutside</div>

          <div style={{ position: 'absolute', left: 300, top: 292, fontSize: 26, fontWeight: 600 }}>Repository access</div>
          <div style={{ position: 'absolute', left: 300, top: 348, width: 1020, height: 62, display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${COLORS.accent}`, marginLeft: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: COLORS.accent }} />
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: COLORS.accent }}>Only select repositories</div>
          </div>

          {/* the repo picker */}
          <div style={{ position: 'absolute', left: 300, top: 452, fontSize: 19, fontWeight: 600 }}>Selected repositories</div>
          <div style={{ position: 'absolute', left: 300, top: 590, width: 560, height: 52, border: `1px solid ${listOpen || frame >= F_REPO ? COLORS.accent : GH.border}`, borderRadius: 8, background: GH.canvas, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', fontSize: 21, color: GH.text }}>
            Select repositories <ChevronDown size={17} color={GH.dim} />
          </div>
          {listOpen && (
            <div style={{ position: 'absolute', left: 300, top: 648, width: 560, background: GH.bg, border: `1px solid ${GH.border}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 26px rgba(31,35,40,0.14)' }}>
              {REPOS.map((rp, i) => (
                <div key={rp} style={{ height: 52, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', fontFamily: FONT_MONO, fontSize: 20, background: i === 0 ? GH.canvas : GH.bg }}>
                  <GitBranch size={17} color={GH.dim} />{rp}
                </div>
              ))}
            </div>
          )}
          {frame >= F_CHIP && (
            <div style={{
              position: 'absolute', left: 300, top: 494, display: 'inline-flex', alignItems: 'center', gap: 12,
              height: 52, padding: '0 20px', borderRadius: RADIUS.pill,
              background: GH.ok, border: `1px solid ${GH.okB}`, fontFamily: FONT_MONO, fontSize: 21, color: GH.text,
              opacity: r(F_CHIP, F_CHIP + 12),
            }}>
              <Check size={18} color={GH.green} strokeWidth={3.2} />hassancs91/my-brain<Lock size={17} color={GH.dim} />
            </div>
          )}

          {/* permissions */}
          <div style={{ position: 'absolute', left: 300, top: 760, fontSize: 30, fontWeight: 600 }}>Permissions</div>
          <div style={{ position: 'absolute', left: 300, top: 810, width: 1020, fontSize: 20, color: GH.dim }}>Repository permissions</div>

          {PERMS.map((p, i) => {
            const isC = i === CONTENTS_I;
            const rowOp = isC ? 1 : dim;
            const val = isC ? (frame >= F_RW ? 'Read and write' : 'No access') : p === 'Metadata' ? 'Read-only' : 'No access';
            return (
              <div key={p} style={{ position: 'absolute', left: 300, top: ROW_Y + i * ROW_H, width: 1100, height: ROW_H, opacity: rowOp }}>
                <div style={{ position: 'absolute', left: 0, top: 0, width: 1100, height: 1, background: GH.line }} />
                <div style={{ position: 'absolute', left: 4, top: 24, fontSize: 24, color: GH.text }}>{p}</div>
                <div style={{
                  position: 'absolute', left: 800, top: 12, width: 300, height: 52,
                  border: `1px solid ${isC && frame >= F_RW ? COLORS.accent : GH.border}`, borderRadius: 8,
                  background: isC && frame >= F_RW ? `${COLORS.accent}12` : GH.canvas,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
                  fontSize: 21, color: isC && frame >= F_RW ? COLORS.accent : GH.text, fontWeight: isC && frame >= F_RW ? 600 : 400,
                }}>
                  {val}<ChevronDown size={16} color={GH.dim} />
                </div>
                {isC && frame >= F_CONTENTS && <Ring start={F_CONTENTS} color={COLORS.accent} style={{ left: -8, top: 4, right: 'auto', bottom: 'auto', width: 1116, height: 70, borderRadius: 12 }} />}
              </div>
            );
          })}

          {selOpen && (
            <div style={{ position: 'absolute', left: 1100, top: ROW_Y + CONTENTS_I * ROW_H + 64, width: 300, background: GH.bg, border: `1px solid ${GH.border}`, borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 26px rgba(31,35,40,0.16)', zIndex: 5 }}>
              {['No access', 'Read-only', 'Read and write'].map((o, i) => (
                <div key={o} style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 20, background: i === 2 ? GH.canvas : GH.bg, color: GH.text }}>{o}</div>
              ))}
            </div>
          )}
        </div>
      </WebBrowserFrame>

      <CursorLayer keys={KEYS} clicks={CLICKS} hideAt={F_ONLY - 20} />
      <Caption at={F_ONLY}>one permission, nothing else</Caption>
    </AbsoluteFill>
  );
};
export default B7TokenPerms;
