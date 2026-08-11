import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Copy, Check, KeyRound, Loader } from 'lucide-react';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame } from '../../lib/browser';
import { BOX, PW, PH, GH, GhMark, BrainMark, WizardShell, WizCard, CursorLayer, Chip, Wipe, CONTINUE, Key } from './B7kit';

// =============================================================================
// B7 (9/16) — wizard step 3: read access. Master span 492.296967 -> 501.996967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 492.296967) * 30)).
//   "the server will read it," 495.65 -> f11   step 3 card
//   "paste"                    497.01 -> f51   Copy is clicked on the public key
//   "into GitHub."             498.70 -> f102  HARD CUT to the deploy-keys page,
//                                              the key pastes at f104, added f116
//   "Hit verify"               499.92 -> f139  back in the wizard, Verify clicked
//   "builds a real clone."     502.21 -> f207  the clone result lands
//   "Now let it write back."   504.39 -> f272  pip 4, title wipes on "back."
// The "Allow write access" checkbox on GitHub is deliberately LEFT UNCHECKED —
// that is the whole reason the next two minutes exist.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7Wizard3', durationInSeconds: 9.7, fps: 30, width: 1920, height: 1080 };

const F_CARD = 6;
const F_COPY = 51;
const F_GH = 96;
const F_PASTE = 104;
const F_ADD = 116;
const F_BACK = 126;
const F_VERIFY = 139;
const F_CLONE = 149;
const F_CLONED = 207;
const F_STEP4 = 262;
const F_WIPE = 272;

const PUBKEY = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIH8kQ2f0pVn7rXcM6bJyTqLdW3sZ1oR9vNhKuE4aGxYp brainoutside@vmi2481923';

const KEYS: Key[] = [
  { frame: 0, x: 1250, y: 740 },
  { frame: 44, x: 1316, y: 562 },
  { frame: 66, x: 1316, y: 562 },
  { frame: 104, x: 700, y: 480 },
  { frame: 112, x: 700, y: 480 },
  { frame: 116, x: 550, y: 678 },
  { frame: 128, x: 550, y: 678 },
  { frame: 136, x: 680, y: 671 },
];
const CLICKS = [F_COPY, F_ADD, F_VERIFY];

const B7Wizard3: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const onGh = frame >= F_GH && frame < F_BACK;
  const step = frame >= F_STEP4 ? 4 : 3;
  const done = frame >= F_CLONED + 8 ? 3 : 2;
  const spin = (frame * 9) % 360;

  const url = onGh ? 'github.com/hassancs91/my-brain/settings/keys' : 'brain.learnwithhasan.com/setup';
  const tab = onGh ? 'Deploy keys · hassancs91/my-brain' : 'Setup | BrainOutside';

  const title = step === 3
    ? 'Let the server read your brain'
    : <>Now let it write <Wipe at={F_WIPE}>back.</Wipe></>;

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <WebBrowserFrame url={url} tabTitle={tab} favicon={onGh ? <GhMark size={20} /> : <BrainMark size={20} />} box={BOX} appearAt={CONTINUE}>
        {onGh ? (
          // ---------------- GitHub: deploy keys ----------------
          <div style={{ position: 'relative', width: PW, height: PH, background: GH.bg, color: GH.text }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 54, background: GH.canvas, borderBottom: `1px solid ${GH.border}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px' }}>
              <GhMark size={28} />
              <span style={{ fontSize: 19, color: GH.dim }}>Type / to search</span>
            </div>
            <div style={{ position: 'absolute', left: 300, top: 76, fontSize: 22, color: GH.dim }}>
              <span style={{ color: GH.link }}>hassancs91</span> / <span style={{ color: GH.link, fontFamily: FONT_MONO }}>my-brain</span> · Settings
            </div>
            <div style={{ position: 'absolute', left: 300, top: 112, fontFamily: FONT_DISPLAY, fontSize: 40, fontWeight: 600 }}>Add new deploy key</div>

            <div style={{ position: 'absolute', left: 300, top: 178, fontSize: 19, fontWeight: 600 }}>Title</div>
            <div style={{ position: 'absolute', left: 300, top: 206, width: 520, height: 52, border: `1px solid ${GH.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 16px', fontFamily: FONT_MONO, fontSize: 21 }}>
              brainoutside-server
            </div>

            <div style={{ position: 'absolute', left: 300, top: 282, fontSize: 19, fontWeight: 600 }}>Key</div>
            <div style={{ position: 'absolute', left: 300, top: 310, width: 1020, height: 132, border: `1px solid ${frame >= F_PASTE ? COLORS.accent : GH.border}`, borderRadius: 8, padding: '14px 16px', fontFamily: FONT_MONO, fontSize: 19, color: GH.text, lineHeight: 1.6, wordBreak: 'break-all' }}>
              {frame >= F_PASTE ? PUBKEY : <span style={{ color: GH.dim }}>Begins with &apos;ssh-rsa&apos;, &apos;ssh-ed25519&apos;, …</span>}
            </div>

            <div style={{ position: 'absolute', left: 300, top: 466, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${GH.border}`, background: GH.canvas }} />
              <span style={{ fontSize: 21, color: GH.text }}>Allow write access</span>
              <span style={{ fontSize: 19, color: GH.dim }}>(left off on purpose)</span>
            </div>

            <div style={{ position: 'absolute', left: 300, top: 520, width: 200, height: 52, background: frame >= F_ADD ? GH.okB : GH.green, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 21, fontWeight: 600, color: GH.on }}>
              {frame >= F_ADD + 4 ? <><Check size={19} color={GH.on} strokeWidth={3} />Added</> : 'Add key'}
            </div>
          </div>
        ) : (
          // ---------------- the wizard ----------------
          <WizardShell step={step} done={done} railAt={CONTINUE} title={title}>
            {step === 3 ? (
              <WizCard at={F_CARD} x={360} y={320} w={900} h={300}>
                <div style={{ position: 'absolute', left: 40, top: 24, display: 'flex', alignItems: 'center', gap: 10, fontSize: 20, color: COLORS.muted }}>
                  <KeyRound size={19} color={COLORS.muted} strokeWidth={2} />Public key, generated on the server at boot
                </div>
                <div style={{ position: 'absolute', left: 40, top: 62, width: 690, height: 96, background: COLORS.cream, border: `1px solid ${COLORS.line}`, borderRadius: 10, padding: '12px 16px', fontFamily: FONT_MONO, fontSize: 18, color: COLORS.ink, lineHeight: 1.55, wordBreak: 'break-all' }}>
                  {PUBKEY}
                </div>
                <div style={{
                  position: 'absolute', left: 752, top: 62, width: 108, height: 96, borderRadius: 10,
                  background: frame >= F_COPY ? `${COLORS.signal}18` : COLORS.cream,
                  border: `1px solid ${frame >= F_COPY ? COLORS.signal : COLORS.line}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {frame >= F_COPY
                    ? <><Check size={26} color={COLORS.signal} strokeWidth={3} /><span style={{ fontSize: 17, color: COLORS.signal }}>Copied</span></>
                    : <><Copy size={26} color={COLORS.muted} strokeWidth={2} /><span style={{ fontSize: 17, color: COLORS.muted }}>Copy</span></>}
                </div>

                <div style={{
                  position: 'absolute', left: 40, top: 190, width: 260, height: 58, borderRadius: 10,
                  background: frame >= F_VERIFY ? COLORS.signal : COLORS.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  fontSize: 23, fontWeight: 600, color: COLORS.paper,
                }}>
                  {frame >= F_VERIFY ? <><Check size={21} color={COLORS.paper} strokeWidth={3.2} />Verified</> : 'Verify'}
                </div>

                {frame >= F_CLONE && (
                  <div style={{ position: 'absolute', left: 330, top: 190, width: 530, height: 58, display: 'flex', alignItems: 'center', gap: 14, opacity: r(F_CLONE, F_CLONE + 10) }}>
                    {frame < F_CLONED ? (
                      <>
                        <div style={{ transform: `rotate(${spin}deg)`, display: 'flex' }}><Loader size={22} color={COLORS.accent} strokeWidth={2.4} /></div>
                        <span style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.muted }}>Cloning hassancs91/my-brain …</span>
                      </>
                    ) : (
                      <span style={{ fontFamily: FONT_MONO, fontSize: 22, color: COLORS.signal, opacity: r(F_CLONED, F_CLONED + 10) }}>
                        ✓ cloned. 47 files, 12 folders
                      </span>
                    )}
                  </div>
                )}
              </WizCard>
            ) : (
              <WizCard at={F_STEP4} x={460} y={330} w={700} h={220}>
                <div style={{ position: 'absolute', left: 40, top: 40, width: 620, fontSize: 25, color: COLORS.muted, lineHeight: 1.55 }}>
                  Reading works. Writing does not, yet.
                </div>
                <div style={{
                  position: 'absolute', left: 40, top: 124, height: 56, padding: '0 22px', borderRadius: RADIUS.pill,
                  background: `${COLORS.warn}22`, border: `1px solid ${COLORS.warn}`, display: 'inline-flex', alignItems: 'center', gap: 12,
                  fontFamily: FONT_MONO, fontSize: 22, color: COLORS.ink, opacity: r(F_STEP4 + 8, F_STEP4 + 20),
                }}>
                  <KeyRound size={20} color={COLORS.warn} strokeWidth={2.2} />deploy key: read only
                </div>
              </WizCard>
            )}
            {step === 3 && (
              <Chip at={F_CLONED} color={COLORS.signal} style={{ left: 360, top: 660 }}>
                the server can read your brain
              </Chip>
            )}
          </WizardShell>
        )}
      </WebBrowserFrame>

      <CursorLayer keys={KEYS} clicks={CLICKS} hideAt={F_VERIFY + 16} />
    </AbsoluteFill>
  );
};
export default B7Wizard3;
