import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { FolderOpen, FileText, GitBranch } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP } from '../../lib/kit';
import { GithubMark } from './_shared/marks';
import { LayerFrame } from './_shared/LayerFrame';

// =============================================================================
// B3.1 — the folder-tree escalation. ONE object gaining a layer each time:
//   folder (202.78) -> markdown files (204.46) -> git repo (207.76) -> GitHub repo (212.33)
// Master span 197.632167–214.432167. Local frame = round((master - 197.632167) * 30).
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// Cues: "idea" 199.34->f16 · "folder" 202.78->f119 · "markdown" 204.46->f170 ·
//       "Git" 207.76->f269 · "GitHub" 212.33->f406.
// The wrapping frames always occupy their padding, so nothing reflows when they
// appear — only their border + label chip animate.
// =============================================================================
export const compositionConfig = { id: 'B3RepoEscalation', durationInSeconds: 16.8, fps: 30, width: 1920, height: 1080 };

const FOLDER_AT = 119;
const FILES_AT = 170;
const GIT_AT = 269;
const GITHUB_AT = 406;

const CARD_W = 760;
const CARD_H_MIN = 108;
const CARD_H_MAX = 420;
const ROW_H = 52;

const FILES = [
  { dir: 'identity/', name: 'core' },
  { dir: 'identity/', name: 'voice' },
  { dir: 'identity/', name: 'beliefs' },
  { dir: 'knowledge/takes/', name: 'self-hosting' },
  { dir: 'knowledge/stories/', name: 'first-saas' },
  { dir: 'projects/', name: 'brainoutside' },
];

const B3RepoEscalation: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();

  const cardOp = interpolate(frame, [FOLDER_AT, FOLDER_AT + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const cardY = interpolate(frame, [FOLDER_AT, FOLDER_AT + 14], [24, 0], { ...CLAMP, easing: EASINGS.easeOut });
  const cardH = interpolate(frame, [FILES_AT, FILES_AT + 26], [CARD_H_MIN, CARD_H_MAX], { ...CLAMP, easing: EASINGS.easeOut });
  const metaOp = interpolate(frame, [FILES_AT + 4, FILES_AT + 18], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const folderLabelOp =
    interpolate(frame, [FOLDER_AT + 8, FOLDER_AT + 20], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }) *
    (1 - interpolate(frame, [FILES_AT - 2, FILES_AT + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeIn }));

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(4, 14), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 5, color: COLORS.muted }}>
          WHAT&nbsp;IT&nbsp;ACTUALLY&nbsp;IS
        </div>
        <h1 style={{ ...rise(16, 24), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 66, lineHeight: 1.1, color: COLORS.ink, margin: 0, marginTop: 22, marginBottom: 40, textAlign: 'center' }}>
          The idea is really simple
        </h1>

        {/* layer 3: GitHub repo -> layer 2: git repo -> the folder itself.
            The two chips sit in OPPOSITE top corners so they never collide. */}
        <LayerFrame
          frame={frame} at={GITHUB_AT} color={COLORS.accent} label="GitHub repo" side="right"
          icon={<GithubMark size={24} color={COLORS.accent} />}
        >
          <LayerFrame
            frame={frame} at={GIT_AT} color={COLORS.muted} label="git repo" side="left"
            icon={<GitBranch size={23} color={COLORS.muted} strokeWidth={2.2} />}
          >
            {/* fixed-height region: the card grows DOWNWARD inside it, so the
                assembly's top edge never moves while the files fill in */}
            <div style={{ width: CARD_W, height: CARD_H_MAX }}>
              <div style={{
                width: CARD_W, height: cardH, overflow: 'hidden',
                background: COLORS.d900, border: `1.5px solid ${COLORS.d600}`, borderRadius: RADIUS.card,
                boxShadow: SHADOW.card, opacity: cardOp, transform: `translateY(${cardY}px)`,
                paddingTop: 22,
              }}>
                {/* header: it is a folder */}
                <div style={{ height: 62, display: 'flex', alignItems: 'center', gap: 14, padding: '0 30px' }}>
                  <FolderOpen size={30} color={COLORS.warn} strokeWidth={1.9} />
                  <span style={{ fontFamily: FONT_MONO, fontWeight: 500, fontSize: 32, color: COLORS.d300 }}>brain</span>
                  {/* the label lands on its word: "folder" -> "markdown files" */}
                  <div style={{ marginLeft: 'auto', position: 'relative', height: 26, width: 240 }}>
                    <span style={{ position: 'absolute', right: 0, top: 0, whiteSpace: 'nowrap', fontFamily: FONT_MONO, fontSize: 20, color: COLORS.warn, opacity: folderLabelOp }}>
                      a folder
                    </span>
                    <span style={{ position: 'absolute', right: 0, top: 0, whiteSpace: 'nowrap', fontFamily: FONT_MONO, fontSize: 20, color: COLORS.d400, opacity: metaOp }}>
                      6 markdown files
                    </span>
                  </div>
                </div>
                <div style={{ height: 1, background: COLORS.d600, margin: '0 30px', opacity: metaOp }} />
                {/* the markdown files */}
                {FILES.map((f, i) => {
                  const at = FILES_AT + i * 4;
                  const op = interpolate(frame, [at, at + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
                  const x = interpolate(frame, [at, at + 12], [-14, 0], { ...CLAMP, easing: EASINGS.easeOut });
                  return (
                    <div key={f.dir + f.name} style={{ height: ROW_H, display: 'flex', alignItems: 'center', gap: 14, padding: '0 30px', opacity: op, transform: `translateX(${x}px)` }}>
                      <FileText size={22} color={COLORS.d400} strokeWidth={1.8} />
                      <span style={{ fontFamily: FONT_MONO, fontSize: 26, color: COLORS.d400 }}>
                        {f.dir}
                        <span style={{ color: COLORS.d300 }}>{f.name}</span>
                        <span style={{ color: COLORS.accent }}>.md</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </LayerFrame>
        </LayerFrame>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default B3RepoEscalation;
