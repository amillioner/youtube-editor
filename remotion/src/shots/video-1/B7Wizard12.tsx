import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Lock, Globe, Check, ChevronDown, GitBranch } from 'lucide-react';
import { COLORS, EASINGS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, Ring } from '../../lib/browser';
import { BOX, PW, PH, GH, GhMark, BrainMark, WizardShell, WizCard, Field, CursorLayer, Key } from './B7kit';

// =============================================================================
// B7 (8/16) — wizard steps 1 and 2. Master span 484.896967 -> 492.296967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 484.896967) * 30)).
//   "number 1,"        488.50 -> f18   ring on pip 1
//   "the account,"     489.23 -> f40   the account form completes
//   "then create"      490.74 -> f85   step 2 card, ring on pip 2
//   "your brain,"      491.22 -> f100  the template button is clicked -> GitHub
//   "give it a name,"  492.29 -> f132  the repo name types
//   "private,"         493.46 -> f167  the Private radio fills
//   "create."          494.04 -> f184  Create repository, then back to the wizard
// Deliberate callback to B5TemplateRepo: the brain is still made the same way,
// the wizard just hands you the link. GitHub keeps its own light palette.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7Wizard12', durationInSeconds: 7.4, fps: 30, width: 1920, height: 1080 };

const F_RAIL = 4;
const F_PIP1 = 18;
const F_ACCOUNT = 30;
const F_ACCOUNT_OK = 40;
const F_STEP2 = 76;
const F_PIP2 = 85;
const F_GH = 100;
const F_NAME = 132;
const F_PRIV = 167;
const F_CREATE = 184;
const F_BACK = 192;

// step-rail pip centers (rail: 6 x 178px, centered in PW)
const RAIL_L = (PW - 6 * 178) / 2;
const pipX = (i: number) => RAIL_L + i * 178 + 89;

const KEYS: Key[] = [
  { frame: 0, x: 1300, y: 720 },
  { frame: 88, x: 960, y: 662 },
  { frame: 108, x: 960, y: 662 },
  { frame: 126, x: 1000, y: 338 },
  { frame: 148, x: 1000, y: 338 },
  { frame: 158, x: 472, y: 570 },
  { frame: 172, x: 472, y: 570 },
  { frame: 178, x: 1390, y: 679 },
  { frame: 190, x: 1390, y: 679 },
];
const CLICKS = [F_GH, F_NAME, F_PRIV, F_CREATE];

const VIS = [
  { Icon: Globe, name: 'Public', desc: 'Anyone on the internet can see this repository.', top: 336, priv: false },
  { Icon: Lock, name: 'Private', desc: 'You choose who can see and commit to this repository.', top: 412, priv: true },
];

const B7Wizard12: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const onGh = frame >= F_GH && frame < F_BACK;
  const step = frame >= F_STEP2 ? 2 : 1;
  const done = frame >= F_BACK ? 2 : frame >= F_ACCOUNT_OK + 4 ? 1 : 0;
  const privFill = r(F_PRIV, F_PRIV + 7);

  const url = onGh ? 'github.com/new?template=brainoutside-template' : 'brain.learnwithhasan.com/setup';
  const tab = onGh ? 'Create a New Repository' : 'Setup | BrainOutside';

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <WebBrowserFrame url={url} tabTitle={tab} favicon={onGh ? <GhMark size={20} /> : <BrainMark size={20} />} box={BOX} appearAt={0}>
        {onGh ? (
          // ---------------- GitHub: create the brain repo from the template ----
          <div style={{ position: 'relative', width: PW, height: PH, background: GH.bg, color: GH.text }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 54, background: GH.canvas, borderBottom: `1px solid ${GH.border}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px' }}>
              <GhMark size={28} />
              <span style={{ fontSize: 19, color: GH.dim }}>Type / to search</span>
            </div>
            <div style={{ position: 'absolute', left: 300, top: 78, fontFamily: FONT_DISPLAY, fontSize: 44, fontWeight: 600 }}>Create a new repository</div>
            <div style={{ position: 'absolute', left: 300, top: 138, width: 1020, fontSize: 21, color: GH.dim }}>
              This will create a new repository from{' '}
              <span style={{ fontFamily: FONT_MONO, color: GH.text }}>hassancs91/brainoutside-template</span>
            </div>

            <div style={{ position: 'absolute', left: 300, top: 180, width: 300, height: 52, border: `1px solid ${GH.border}`, borderRadius: 8, background: GH.canvas, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: COLORS.accent }} />
              <span style={{ fontSize: 21 }}>hassancs91</span>
              <ChevronDown size={16} color={GH.dim} style={{ marginLeft: 'auto' }} />
            </div>
            <div style={{ position: 'absolute', left: 614, top: 192, fontSize: 26, color: GH.dim }}>/</div>
            <div style={{ position: 'absolute', left: 640, top: 180, width: 420, height: 52, border: `1px solid ${frame >= F_NAME ? COLORS.accent : GH.border}`, borderRadius: 8, background: GH.bg, display: 'flex', alignItems: 'center', padding: '0 16px' }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 21 }}>
                {'my-brain'.slice(0, Math.floor(r(F_NAME + 2, F_NAME + 22, 0, 8, EASINGS.easeInOut)))}
              </span>
            </div>

            <div style={{ position: 'absolute', left: 300, top: 292, fontSize: 21, fontWeight: 600 }}>Visibility</div>
            {VIS.map((o) => {
              const sel = o.priv ? privFill : 1 - privFill;
              const on = sel > 0.5;
              return (
                <div key={o.name} style={{ position: 'absolute', left: 300, top: o.top, width: 1020, height: 62, display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${on ? COLORS.accent : GH.border}`, marginLeft: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: COLORS.accent, transform: `scale(${sel})` }} />
                  </div>
                  <o.Icon size={26} color={on ? COLORS.accent : GH.dim} strokeWidth={1.9} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 600, color: on ? COLORS.accent : GH.text }}>{o.name}</div>
                    <div style={{ fontSize: 19, color: GH.dim, marginTop: 2 }}>{o.desc}</div>
                  </div>
                  {o.priv && frame >= F_PRIV && <Ring start={F_PRIV + 1} color={COLORS.accent} style={{ inset: -10, borderRadius: 12 }} />}
                </div>
              );
            })}

            <div style={{ position: 'absolute', left: 1120, top: 520, width: 240, height: 54, background: GH.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, fontWeight: 600, color: GH.on }}>
              Create repository
            </div>
          </div>
        ) : (
          // ---------------- the wizard ----------------
          <WizardShell step={step} done={done} railAt={F_RAIL} title={step === 1 ? 'Create your account' : 'Create your brain'}>
            {frame >= F_PIP1 && frame < F_STEP2 && (
              <Ring start={F_PIP1} color={COLORS.accent} style={{ left: pipX(0) - 32, top: 86, right: 'auto', bottom: 'auto', width: 64, height: 64, borderRadius: 999 }} />
            )}
            {frame >= F_PIP2 && (
              <Ring start={F_PIP2} color={COLORS.accent} style={{ left: pipX(1) - 32, top: 86, right: 'auto', bottom: 'auto', width: 64, height: 64, borderRadius: 999 }} />
            )}

            {step === 1 ? (
              <WizCard at={F_ACCOUNT - 14} x={460} y={300} w={700} h={340}>
                <Field label="Email" value="hasan@brainoutside.dev" at={F_ACCOUNT} typed x={40} y={34} w={620} done={F_ACCOUNT_OK} />
                <Field label="Password" value="••••••••••••" at={F_ACCOUNT + 8} x={40} y={140} w={620} done={F_ACCOUNT_OK} />
                <div style={{
                  position: 'absolute', left: 40, top: 250, width: 620, height: 58, borderRadius: 10,
                  background: frame >= F_ACCOUNT_OK ? COLORS.signal : COLORS.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  fontSize: 23, fontWeight: 600, color: COLORS.paper,
                }}>
                  {frame >= F_ACCOUNT_OK ? <><Check size={21} color={COLORS.paper} strokeWidth={3.2} />Account created</> : 'Create account'}
                </div>
              </WizCard>
            ) : (
              <WizCard at={F_STEP2} x={460} y={300} w={700} h={300}>
                <div style={{ position: 'absolute', left: 40, top: 34, width: 620, fontSize: 24, color: COLORS.muted, lineHeight: 1.5 }}>
                  Your brain is a private GitHub repo, made from the template.
                </div>
                {frame < F_BACK ? (
                  <div style={{
                    position: 'absolute', left: 40, top: 170, width: 620, height: 60, borderRadius: 10,
                    background: GH.green, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    fontSize: 23, fontWeight: 600, color: GH.on,
                  }}>
                    <GhMark size={22} color={GH.on} />Use the template repo
                  </div>
                ) : (
                  <div style={{
                    position: 'absolute', left: 40, top: 170, width: 620, height: 60, borderRadius: 10,
                    background: `${COLORS.signal}18`, border: `1px solid ${COLORS.signal}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                    fontFamily: FONT_MONO, fontSize: 23, color: COLORS.signal,
                    opacity: r(F_BACK, F_BACK + 12),
                  }}>
                    <Check size={21} color={COLORS.signal} strokeWidth={3.2} />
                    <GitBranch size={20} color={COLORS.signal} />
                    hassancs91/my-brain
                    <Lock size={18} color={COLORS.signal} />
                  </div>
                )}
              </WizCard>
            )}
          </WizardShell>
        )}
      </WebBrowserFrame>

      <CursorLayer keys={KEYS} clicks={CLICKS} hideAt={F_BACK - 4} />
    </AbsoluteFill>
  );
};
export default B7Wizard12;
