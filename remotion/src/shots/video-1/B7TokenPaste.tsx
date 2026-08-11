import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ChevronDown, Check, Copy } from 'lucide-react';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame } from '../../lib/browser';
import { BOX, PW, GH, GhMark, BrainMark, WizardShell, WizCard, CursorLayer, Chip, CONTINUE, Key } from './B7kit';

// =============================================================================
// B7 (13/16) — generate, copy, paste back. Master span 530.496967 -> 536.096967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 530.496967) * 30)).
//   "Generate,"        533.55 -> f14   the generate click (word runs f2..f21)
//   "copy it,"         534.67 -> f38   the copy click, "Copied!" at f46
//   "paste it back"    536.93 -> f108  HARD CUT back to the wizard, token pastes
//   "here,"            537.47 -> f119  the field turns green
//   "and you are done."538.53 -> f151  step 4 goes teal, write access granted
// GitHub really does show the token once, so the banner says exactly that.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7TokenPaste', durationInSeconds: 5.6, fps: 30, width: 1920, height: 1080 };

const F_GEN = 14;
const F_CREATED = 18;
const F_COPY = 38;
const F_COPIED = 46;
const F_WIZ = 96;
const F_PASTE = 108;
const F_OK = 119;
const F_DONE = 151;

const TOKEN = 'github_pat_11ABCDEF0AbCdEfGhIjKl_mNoPqRsTuVwXyZ0123456789AbCdEfGh';
const PERMS = ['Actions', 'Administration', 'Commit statuses', 'Contents', 'Deployments', 'Metadata'];
const ROW_Y = 860, ROW_H = 78;

const KEYS: Key[] = [
  { frame: 0, x: 1400, y: 803 },
  { frame: 12, x: 570, y: 829 },
  { frame: 24, x: 570, y: 829 },
  { frame: 34, x: 1298, y: 430 },
  { frame: 58, x: 1298, y: 430 },
];
const CLICKS = [F_GEN, F_COPY];

const B7TokenPaste: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const stage = frame >= F_WIZ ? 3 : frame >= F_CREATED ? 2 : 1;
  const scrollY = stage === 1 ? r(0, 10, 600, 700, EASINGS.easeInOut) : 0;

  const url = stage === 3 ? 'brain.learnwithhasan.com/setup'
    : stage === 2 ? 'github.com/settings/personal-access-tokens'
      : 'github.com/settings/personal-access-tokens/new';
  const tab = stage === 3 ? 'Setup | BrainOutside' : 'Personal access tokens';

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <WebBrowserFrame url={url} tabTitle={tab} favicon={stage === 3 ? <BrainMark size={20} /> : <GhMark size={20} />} box={BOX} appearAt={CONTINUE} scrollY={scrollY}>

        {/* ---------------- stage 1: the bottom of the token form ---------------- */}
        {stage === 1 && (
          <div style={{ position: 'relative', width: PW, height: 1480, background: GH.bg, color: GH.text }}>
            <div style={{ position: 'absolute', left: 300, top: 760, fontSize: 30, fontWeight: 600 }}>Permissions</div>
            {PERMS.map((p, i) => {
              const isC = i === 3;
              return (
                <div key={p} style={{ position: 'absolute', left: 300, top: ROW_Y + i * ROW_H, width: 1100, height: ROW_H, opacity: isC ? 1 : 0.26 }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, width: 1100, height: 1, background: GH.line }} />
                  <div style={{ position: 'absolute', left: 4, top: 24, fontSize: 24 }}>{p}</div>
                  <div style={{
                    position: 'absolute', left: 800, top: 12, width: 300, height: 52,
                    border: `1px solid ${isC ? COLORS.accent : GH.border}`, borderRadius: 8,
                    background: isC ? `${COLORS.accent}12` : GH.canvas,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px',
                    fontSize: 21, color: isC ? COLORS.accent : GH.text, fontWeight: isC ? 600 : 400,
                  }}>
                    {isC ? 'Read and write' : p === 'Metadata' ? 'Read-only' : 'No access'}<ChevronDown size={16} color={GH.dim} />
                  </div>
                </div>
              );
            })}
            <div style={{ position: 'absolute', left: 300, top: 1370, width: 240, height: 54, background: GH.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, fontWeight: 600, color: GH.on }}>
              Generate token
            </div>
          </div>
        )}

        {/* ---------------- stage 2: the token, shown once ---------------- */}
        {stage === 2 && (
          <div style={{ position: 'relative', width: PW, height: 760, background: GH.bg, color: GH.text }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 54, background: GH.canvas, borderBottom: `1px solid ${GH.border}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px' }}>
              <GhMark size={28} />
              <span style={{ fontSize: 19, color: GH.dim }}>Type / to search</span>
            </div>
            <div style={{ position: 'absolute', left: 100, top: 96, fontFamily: FONT_DISPLAY, fontSize: 38, fontWeight: 600 }}>Fine-grained personal access tokens</div>
            <div style={{ position: 'absolute', left: 100, top: 168, width: 1420, height: 70, background: GH.ok, border: `1px solid ${GH.okB}`, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 14, padding: '0 22px', fontSize: 22, color: GH.text, opacity: r(F_CREATED, F_CREATED + 10) }}>
              <Check size={22} color={GH.green} strokeWidth={3} />
              Make sure to copy your personal access token now. You won&apos;t be able to see it again.
            </div>
            <div style={{ position: 'absolute', left: 100, top: 270, width: 1000, height: 56, background: GH.canvas, border: `1px solid ${GH.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 18px', fontFamily: FONT_MONO, fontSize: 21, color: GH.text, whiteSpace: 'nowrap', overflow: 'hidden' }}>
              {TOKEN}
            </div>
            <div style={{
              position: 'absolute', left: 1120, top: 270, width: 56, height: 56, borderRadius: 8,
              border: `1px solid ${frame >= F_COPY ? GH.okB : GH.border}`, background: frame >= F_COPY ? GH.ok : GH.canvas,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {frame >= F_COPY ? <Check size={24} color={GH.green} strokeWidth={3} /> : <Copy size={22} color={GH.dim} strokeWidth={2} />}
            </div>
            {frame >= F_COPIED && (
              <div style={{
                position: 'absolute', left: 1200, top: 282, display: 'inline-flex', alignItems: 'center',
                height: 44, padding: '0 18px', borderRadius: RADIUS.pill, background: `${COLORS.signal}1f`,
                border: `1px solid ${COLORS.signal}`, color: COLORS.signal, fontFamily: FONT_MONO, fontSize: 21,
                opacity: r(F_COPIED, F_COPIED + 10),
              }}>Copied</div>
            )}
          </div>
        )}

        {/* ---------------- stage 3: back in the wizard ---------------- */}
        {stage === 3 && (
          <WizardShell step={4} done={frame >= F_DONE ? 4 : 3} railAt={CONTINUE} title="Let it write back">
            <WizCard at={CONTINUE} x={460} y={320} w={700} h={300}>
              <div style={{ position: 'absolute', left: 40, top: 26, fontSize: 20, color: COLORS.muted }}>GitHub token</div>
              <div style={{
                position: 'absolute', left: 40, top: 62, width: 620, height: 60, borderRadius: 10,
                background: COLORS.cream, border: `1px solid ${frame >= F_PASTE ? COLORS.accent : COLORS.line}`,
                display: 'flex', alignItems: 'center', padding: '0 18px',
                fontFamily: FONT_MONO, fontSize: 21, color: COLORS.ink,
              }}>
                {frame >= F_PASTE ? 'github_pat_••••••••••••••••••••••••••' : <span style={{ color: COLORS.muted }}>github_pat_…</span>}
                {frame >= F_OK && (
                  <div style={{ position: 'absolute', right: 14, width: 32, height: 32, borderRadius: '50%', background: COLORS.signal, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: r(F_OK, F_OK + 10) }}>
                    <Check size={19} color={COLORS.paper} strokeWidth={3.4} />
                  </div>
                )}
              </div>
              <div style={{
                position: 'absolute', left: 40, top: 166, width: 620, height: 58, borderRadius: 10,
                background: frame >= F_DONE ? `${COLORS.signal}1f` : COLORS.accent,
                border: `1px solid ${frame >= F_DONE ? COLORS.signal : COLORS.accent}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontSize: 23, fontWeight: 600, color: frame >= F_DONE ? COLORS.signal : COLORS.paper,
              }}>
                {frame >= F_DONE ? <><Check size={21} color={COLORS.signal} strokeWidth={3.2} />write access granted</> : 'Save token'}
              </div>
            </WizCard>
            <Chip at={F_DONE + 6} color={COLORS.signal} style={{ left: 460, top: 660 }}>your brain can be written to</Chip>
          </WizardShell>
        )}
      </WebBrowserFrame>

      <CursorLayer keys={KEYS} clicks={CLICKS} hideAt={60} />
    </AbsoluteFill>
  );
};
export default B7TokenPaste;
