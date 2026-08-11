import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Ban } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, Ring } from '../../lib/browser';
import {
  BOX, PW, PH, CF, CONTINUE, CoolifyMark, CoolifyShell, BrainMark, WizardShell, SpedUpTag, LogStream, Bar,
} from './B7kit';

// =============================================================================
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// B7 (7/16) — the build ramps, then the domain opens on a wizard. Master span
// 469.396967 -> 479.4648 (local frame = round((t - 469.396967) * 30)).
//   "Wait for a few seconds"  472.53 -> f4    build log ramps (`sped up` tag ON)
//   "open"                    474.76 -> f71   the URL bar starts retyping
//   "your domain"             475.34 -> f88   HARD CUT to the domain, page loading
//   "The first time"          477.10 -> f141  the first-run screen paints
//   "you don't get a"         478.53 -> f184  the expected sign-in card ghosts in
//   "login box,"              479.03 -> f199  it is struck (pink = the wrong idea)
//   "you get a"               479.83 -> f223  it falls, the wizard paints under it
//   "wizard."                 480.48 -> f242  ring on the 6-step rail
// The `sped up` tag is mandatory over the compressed build (script B7): nobody
// should think a real build runs at this speed.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7BuildOpen', durationInSeconds: 8.9, fps: 30, width: 1920, height: 1080 };

const F_DONE = 56;
const F_TYPE = 71;
const F_CUT = 88;
const F_FIRST = 141;
const F_GHOST = 184;
const F_STRIKE = 199;
const F_BAN = 209;
const F_WIZ = 223;
const F_RAIL = 228;
const F_RING = 242;

const DOMAIN = 'brain.learnwithhasan.com';
const DEPLOY_URL = '203.0.113.42:8000/…/deployment/kso4ggwc8s';

const BUILD = [
  '#1 [internal] load build definition from Dockerfile',
  '#2 [internal] load .dockerignore',
  '#3 [internal] load metadata for docker.io/library/python:3.12-slim',
  '#4 [base 1/6] FROM docker.io/library/python:3.12-slim',
  '#5 [base 2/6] RUN apt-get update && apt-get install -y build-essential',
  '#6 [base 3/6] COPY requirements.txt .',
  '#7 [base 4/6] RUN pip install --no-cache-dir -r requirements.txt',
  '#8 [base 5/6] COPY . /app',
  '#9 [base 6/6] RUN python manage.py collectstatic --noinput',
  '#10 exporting layers',
  '#11 naming to brainoutside:main',
  '[+] Running 4/4   db   redis   web   caddy',
  '[+] Waiting for healthchecks .........',
  '[+] Issuing TLS certificate for brain.learnwithhasan.com',
  '✓ Deployment successful',
];

const NAV = ['Configuration', 'Environment Variables', 'Persistent Storage', 'Deployments', 'Logs', 'Webhooks']
  .map((label, i) => ({ label, active: i === 3 }));

const B7BuildOpen: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const typed = DOMAIN.slice(0, Math.floor(r(F_TYPE, F_CUT - 2, 0, DOMAIN.length, EASINGS.easeInOut)));
  const url = frame < F_TYPE ? DEPLOY_URL : frame < F_CUT ? typed : DOMAIN;
  const tab = frame < F_CUT ? 'Deployment | Coolify' : 'BrainOutside';

  const onDomain = frame >= F_CUT;
  const finished = frame >= F_DONE;

  // load shimmer (deterministic)
  const shim = ((frame - F_CUT) % 45) / 45;

  const ghostOp = r(F_GHOST, F_GHOST + 14) * (1 - r(F_WIZ, F_WIZ + 12));
  const ghostY = r(F_WIZ, F_WIZ + 14, 0, 30, EASINGS.easeIn);
  const ghostDim = 1 - r(F_STRIKE, F_STRIKE + 12, 0, 0.55);
  const strike = r(F_STRIKE, F_STRIKE + 12, 0, 1, EASINGS.easeInOut);
  const banOp = r(F_BAN, F_BAN + 12) * (1 - r(F_WIZ, F_WIZ + 10));
  const wizOp = r(F_WIZ, F_WIZ + 12);
  // the first-run splash clears as the sign-in ghost arrives, so the dimmed card
  // never sits on top of live text (that read as a double-exposure in QA)
  const firstOp = r(F_FIRST, F_FIRST + 14) * (1 - r(F_GHOST - 4, F_GHOST + 10));

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={onDomain ? COLORS.accent : CF.purple} />
      <WebBrowserFrame url={url} tabTitle={tab} favicon={onDomain ? <BrainMark size={20} /> : <CoolifyMark size={20} />} box={BOX} appearAt={CONTINUE}>
        {!onDomain ? (
          <CoolifyShell crumb="brainoutside / production / brainoutside" nav={NAV}>
            <div style={{ position: 'absolute', left: 320, top: 118, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: CF.text }}>Deployment</div>
            <div style={{
              position: 'absolute', left: 1330, top: 122, height: 46, padding: '0 20px', borderRadius: RADIUS.pill,
              background: finished ? `${CF.green}1f` : `${CF.warn}1f`, border: `1px solid ${finished ? CF.green : CF.warn}66`,
              display: 'flex', alignItems: 'center', gap: 10, fontSize: 21, color: finished ? CF.green : CF.warn,
            }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: finished ? CF.green : CF.warn }} />
              {finished ? 'Finished' : 'Building'}
            </div>
            <div style={{ position: 'absolute', left: 320, top: 186, width: 1250, height: 420, background: '#08080a', border: `1px solid ${CF.border}`, borderRadius: 12 }} />
            <LogStream
              lines={BUILD} from={2} to={F_DONE} rows={10}
              x={344} y={206} w={1210} size={22} lineH={38}
              dimColor={CF.dim} okColor={CF.green}
            />
            <Bar from={2} to={F_DONE} x={320} y={636} w={1250} h={10} color={finished ? CF.green : CF.purple} track={CF.border} />
            <div style={{ position: 'absolute', left: 0, top: PH - 1, width: PW, height: 1 }} />
          </CoolifyShell>
        ) : (
          <div style={{ position: 'relative', width: PW, height: PH, background: COLORS.paper, overflow: 'hidden' }}>
            {/* the wizard, painted under the ghost card at F_WIZ */}
            <div style={{ position: 'absolute', inset: 0, opacity: wizOp }}>
              <WizardShell step={1} done={0} railAt={F_RAIL} title="Set up your brain">
                <div style={{ position: 'absolute', left: 0, top: 286, width: PW, textAlign: 'center', fontSize: 26, color: COLORS.muted, opacity: r(F_RAIL + 6, F_RAIL + 20) }}>
                  Six steps to your online brain.
                </div>
                {frame >= F_RING && (
                  <Ring start={F_RING} color={COLORS.accent} style={{ left: 250, top: 84, right: 'auto', bottom: 'auto', width: 1120, height: 118, borderRadius: 16 }} />
                )}
              </WizardShell>
            </div>

            {/* loading, then the first-run screen */}
            <div style={{ position: 'absolute', inset: 0, opacity: 1 - r(F_FIRST, F_FIRST + 12) }}>
              <div style={{ position: 'absolute', left: PW / 2 - 220, top: 300, width: 440, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
                <BrainMark size={72} />
                <div style={{ width: 320, height: 6, borderRadius: 3, background: COLORS.line, overflow: 'hidden' }}>
                  <div style={{ width: 120, height: '100%', borderRadius: 3, background: COLORS.accent, transform: `translateX(${-120 + shim * 440}px)` }} />
                </div>
              </div>
            </div>
            <div style={{ position: 'absolute', left: 0, top: 250, width: PW, textAlign: 'center', opacity: firstOp }}>
              <BrainMark size={64} />
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 56, color: COLORS.ink, marginTop: 14 }}>BrainOutside</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 24, color: COLORS.muted, marginTop: 12 }}>first run</div>
            </div>

            {/* the sign-in box you expect, and do not get */}
            <div style={{
              position: 'absolute', left: PW / 2 - 260, top: 250, width: 520,
              background: COLORS.cream, border: `2px dashed ${COLORS.line}`, borderRadius: RADIUS.card,
              boxShadow: SHADOW.soft, padding: '30px 34px 34px',
              opacity: ghostOp * ghostDim, transform: `translateY(${ghostY}px)`,
            }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 19, letterSpacing: 2, color: COLORS.muted, marginBottom: 18 }}>WHAT YOU EXPECT</div>
              <div style={{ position: 'relative', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: COLORS.ink, marginBottom: 24 }}>
                Sign in
                <span style={{ position: 'absolute', left: -8, right: -8, top: '52%', height: 4, borderRadius: 2, background: COLORS.danger, transform: `scaleX(${strike})`, transformOrigin: 'left' }} />
              </div>
              {['Email', 'Password'].map((f) => (
                <div key={f} style={{ height: 54, border: `1px solid ${COLORS.line}`, borderRadius: 9, background: COLORS.paper, display: 'flex', alignItems: 'center', padding: '0 16px', marginBottom: 14, fontSize: 21, color: COLORS.muted }}>{f}</div>
              ))}
              <div style={{ height: 54, borderRadius: 9, background: COLORS.line, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, color: COLORS.muted }}>Continue</div>
            </div>
            <div style={{
              position: 'absolute', left: PW / 2 - 110, top: 616, display: 'flex', alignItems: 'center', gap: 10,
              height: 46, padding: '0 20px', borderRadius: RADIUS.pill,
              background: `${COLORS.danger}1a`, border: `1px solid ${COLORS.danger}66`, color: COLORS.danger,
              fontFamily: FONT_MONO, fontSize: 22, opacity: banOp, transform: `translateY(${ghostY}px)`,
            }}>
              <Ban size={19} color={COLORS.danger} strokeWidth={2.3} />no login box
            </div>
          </div>
        )}
      </WebBrowserFrame>

      {frame < F_CUT && <SpedUpTag from={2} to={F_DONE} />}
    </AbsoluteFill>
  );
};
export default B7BuildOpen;
