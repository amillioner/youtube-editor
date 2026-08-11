import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Plus, Rocket, Loader } from 'lucide-react';
import { COLORS, EASINGS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, Ring } from '../../lib/browser';
import { BOX, PW, PH, CF, CONTINUE, CoolifyMark, CoolifyShell, CursorLayer, Chip, Key } from './B7kit';

// =============================================================================
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// B7 (6/16) — exactly two environment variables, then Deploy. Master span
// 459.896967 -> 470.5648 (local frame = round((t - 459.896967) * 30)).
//   "variables,"              463.92 -> f31   the nav click lands on the word
//   "exactly"                 465.54 -> f79   the empty page is on screen
//   "2 things:"               466.52 -> f109  two empty rows outline + the count
//   "database" / "password"   467.37 / 467.79 -> f134 / f147
//   "and the domain."         468.98 -> f182
//   "That's the whole thing." 469.80 -> f207  teal chip
//   "Deploy."                 471.72 -> f264  the deploy click
// Chrome continues from B7CoolifyDeploy (appearAt CONTINUE) so the browser window
// never re-animates mid-walkthrough; only the PAGE cuts.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7EnvDeploy', durationInSeconds: 9.5, fps: 30, width: 1920, height: 1080 };

const F_NAV = 31;
const F_PAGE = 59;
const F_SLOTS = 109;
const F_KEY1 = 134;
const F_VAL1 = 147;
const F_KEY2 = 175;
const F_VAL2 = 182;
const F_WHOLE = 207;
const F_DEPLOY = 264;

const NAV = [
  { label: 'Configuration' },
  { label: 'Environment Variables' },
  { label: 'Persistent Storage' },
  { label: 'Deployments' },
  { label: 'Logs' },
  { label: 'Webhooks' },
];

const KEYS: Key[] = [
  { frame: 0, x: 1300, y: 700 },
  { frame: 24, x: 286, y: 281 },
  { frame: 62, x: 286, y: 281 },
  { frame: 124, x: 760, y: 430 },
  { frame: 232, x: 760, y: 430 },
  { frame: 258, x: 1625, y: 254 },
];
const CLICKS = [F_NAV, F_DEPLOY];

const EnvRow: React.FC<{
  y: number; k: string; v: string; keyAt: number; valAt: number; slotAt: number; mask?: boolean;
}> = ({ y, k, v, keyAt, valAt, slotAt, mask }) => {
  const frame = useCurrentFrame();
  const slotOp = interpolate(frame, [slotAt, slotAt + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const hasK = frame >= keyAt, hasV = frame >= valAt;
  const box = (filled: boolean): React.CSSProperties => ({
    height: 68, borderRadius: 9, display: 'flex', alignItems: 'center', padding: '0 20px',
    background: filled ? CF.panel2 : 'transparent',
    border: filled ? `1px solid ${CF.purple}` : `1px dashed ${CF.border}`,
    fontFamily: FONT_MONO, fontSize: 24, color: CF.text,
  });
  return (
    <div style={{ position: 'absolute', left: 320, top: y, width: 1250, display: 'flex', gap: 20, opacity: slotOp }}>
      <div style={{ ...box(hasK), width: 520 }}>{hasK ? k : <span style={{ color: CF.faint }}>KEY</span>}</div>
      <div style={{ ...box(hasV), width: 710 }}>{hasV ? (mask ? '••••••••••••••••••' : v) : <span style={{ color: CF.faint }}>VALUE</span>}</div>
    </div>
  );
};

const B7EnvDeploy: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const onEnv = frame >= F_NAV;
  const nav = NAV.map((n, i) => ({ ...n, active: onEnv ? i === 1 : i === 0 }));
  const url = onEnv
    ? '203.0.113.42:8000/…/brainoutside/environment-variables'
    : '203.0.113.42:8000/…/brainoutside/configuration';

  const pageOp = r(F_PAGE - 30, F_PAGE - 18);
  const deploying = frame >= F_DEPLOY + 5;
  const spin = (frame * 10) % 360;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={CF.purple} />
      <WebBrowserFrame url={url} tabTitle="brainoutside | Coolify" favicon={<CoolifyMark size={20} />} box={BOX} appearAt={CONTINUE}>
        <CoolifyShell crumb="brainoutside / production / brainoutside" nav={nav}>
          {/* resource header */}
          <div style={{ position: 'absolute', left: 320, top: 118, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: CF.text }}>
            {onEnv ? 'Environment Variables' : 'Configuration'}
          </div>
          <div style={{
            position: 'absolute', left: 1380, top: 96, width: 190, height: 52,
            background: deploying ? CF.warn : CF.green, borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontSize: 21, fontWeight: 600, color: '#0d0d10',
          }}>
            {deploying
              ? <><div style={{ transform: `rotate(${spin}deg)`, display: 'flex' }}><Loader size={19} color="#0d0d10" strokeWidth={2.6} /></div>Deploying</>
              : <><Rocket size={19} color="#0d0d10" strokeWidth={2.4} />Deploy</>}
          </div>

          {onEnv && (
            <>
              <div style={{ position: 'absolute', left: 1170, top: 96, width: 170, height: 52, border: `1px solid ${CF.border}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 21, color: CF.text, opacity: pageOp }}>
                <Plus size={18} color={CF.dim} strokeWidth={2.4} />Add
              </div>

              <EnvRow y={216} k="POSTGRES_PASSWORD" v="" keyAt={F_KEY1} valAt={F_VAL1} slotAt={F_SLOTS} mask />
              <EnvRow y={308} k="APP_DOMAIN" v="brain.learnwithhasan.com" keyAt={F_KEY2} valAt={F_VAL2} slotAt={F_SLOTS + 4} />

              {frame >= F_WHOLE && (
                <Ring start={F_WHOLE} color={COLORS.accent} style={{ left: 310, top: 206, right: 'auto', bottom: 'auto', width: 1270, height: 190, borderRadius: 14 }} />
              )}
              <Chip at={F_WHOLE} color={COLORS.signal} style={{ left: 320, top: 430 }}>2 variables and nothing else</Chip>

              <div style={{ position: 'absolute', left: 320, top: 540, width: 1250, height: 1, background: CF.border, opacity: pageOp }} />
              <div style={{ position: 'absolute', left: 320, top: 570, fontSize: 21, color: CF.faint, opacity: pageOp }}>
                Everything else has a sane default in docker-compose.yml
              </div>
            </>
          )}
          {!onEnv && (
            <div style={{ position: 'absolute', left: 320, top: 200, width: 1250, height: 300, border: `1px solid ${CF.border}`, borderRadius: 12, background: CF.panel, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CF.faint, fontSize: 24 }}>
              github.com/hassancs91/brainoutside · main · Docker Compose
            </div>
          )}
          <div style={{ position: 'absolute', left: 0, top: PH - 1, width: PW, height: 1 }} />
        </CoolifyShell>
      </WebBrowserFrame>

      <CursorLayer keys={KEYS} clicks={CLICKS} />
    </AbsoluteFill>
  );
};
export default B7EnvDeploy;
