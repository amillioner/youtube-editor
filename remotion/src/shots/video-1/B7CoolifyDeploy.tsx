import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Plus, GitBranch, Lock, FileText, Boxes, Package, ChevronDown, Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, Ring } from '../../lib/browser';
import { BOX, PW, PH, CF, CoolifyMark, CoolifyShell, CursorLayer, Chip, Key } from './B7kit';

// =============================================================================
// B7 (5/16) — the Coolify resource. Master span 449.196967 -> 459.896967
// (v3 clock: the V2 splice removed master 3.787117-4.954950, delta2 1.167833s. The span/formula above are the CURRENT clock; other cue seconds in this header may be older clocks. Local frame numbers are unchanged.)
// (local frame = round((t - 449.196967) * 30)).
//   "New Project,"      452.92 -> f22   click result lands ON the word
//   "New Resource."     454.87 -> f80   navigation, URL path changes
//   "Public Repo,"      456.63 -> f133  the type is picked
//   "URL,"              457.82 -> f169  the repo URL PASTES in whole
//   "buildpack"         459.51 -> f219  the Build Pack select opens
//   "Docker Compose."   460.25 -> f242  the option is chosen (in-page, no nav)
//   "That's it."        461.29 -> f273  teal check chip
//   "Save."             462.03 -> f295  save click + toast
// Every page change is a hard cut with a new URL path; the build-pack change is
// in-page and does NOT change the path. Mixing those two up is the fake tell.
// v2 retime (R7 splice): 1.835167s was removed at master 352.085, so the span above is
// the CURRENT master time. Cue seconds further down are pre-splice v1 values; subtract
// 1.835167 for current master time. LOCAL FRAME numbers are unchanged and still correct.
// =============================================================================
export const compositionConfig = { id: 'B7CoolifyDeploy', durationInSeconds: 10.7, fps: 30, width: 1920, height: 1080 };

const F_P2 = 22;
const F_P3 = 80;
const F_P4 = 133;
const F_URL = 169;
const F_OPEN = 219;
const F_PACK = 242;
const F_THAT = 273;
const F_SAVE = 295;

const REPO = 'https://github.com/hassancs91/brainoutside';
const PACKS = ['Nixpacks', 'Static', 'Dockerfile', 'Docker Compose'];

const TYPES: { label: string; sub: string; Icon: React.FC<any> }[] = [
  { label: 'Public Repository', sub: 'Deploy any public git repository', Icon: GitBranch },
  { label: 'Private Repository (GitHub App)', sub: 'Deploy a private repo via a GitHub App', Icon: Lock },
  { label: 'Private Repository (Deploy Key)', sub: 'Deploy a private repo via an SSH key', Icon: Lock },
  { label: 'Dockerfile', sub: 'Build from a Dockerfile you paste', Icon: FileText },
  { label: 'Docker Compose Empty', sub: 'Paste a compose file, pull existing images', Icon: Boxes },
  { label: 'Docker Image', sub: 'Deploy an image from a registry', Icon: Package },
];

const KEYS: Key[] = [
  { frame: 0, x: 1420, y: 780 },
  { frame: 16, x: 1615, y: 246 },
  { frame: 34, x: 1615, y: 246 },
  { frame: 70, x: 315, y: 388 },
  { frame: 92, x: 315, y: 388 },
  { frame: 125, x: 435, y: 407 },
  { frame: 152, x: 435, y: 407 },
  { frame: 212, x: 400, y: 592 },
  { frame: 228, x: 400, y: 592 },
  { frame: 240, x: 400, y: 794 },
  { frame: 262, x: 400, y: 794 },
  { frame: 288, x: 1585, y: 790 },
];
const CLICKS = [F_P2, F_P3, F_P4, F_OPEN, F_PACK, F_SAVE];

const Label: React.FC<{ t: string; x: number; y: number }> = ({ t, x, y }) => (
  <div style={{ position: 'absolute', left: x, top: y, fontSize: 20, color: CF.dim }}>{t}</div>
);

const B7CoolifyDeploy: React.FC = () => {
  const frame = useCurrentFrame();
  const r = (a: number, b: number, from = 0, to = 1, easing = EASINGS.easeOut) =>
    interpolate(frame, [a, b], [from, to], { ...CLAMP, easing });

  const page = frame >= F_P4 ? 4 : frame >= F_P3 ? 3 : frame >= F_P2 ? 2 : 1;
  const url = page === 1 ? '203.0.113.42:8000/projects'
    : page === 2 ? '203.0.113.42:8000/project/brainoutside/production'
      : page === 3 ? '203.0.113.42:8000/project/brainoutside/production/new'
        : '203.0.113.42:8000/project/brainoutside/production/new?type=public';
  const tab = page === 1 ? 'Projects | Coolify' : page === 3 ? 'New Resource | Coolify' : 'brainoutside | Coolify';

  const open = frame >= F_OPEN && frame < F_PACK;
  const packLabel = frame >= F_PACK ? 'Docker Compose' : 'Nixpacks';

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={CF.purple} />
      <WebBrowserFrame url={url} tabTitle={tab} favicon={<CoolifyMark size={20} />} box={BOX} appearAt={0}>
        <CoolifyShell crumb={page >= 2 ? 'brainoutside / production' : undefined}>

          {/* ---------- page 1: projects ---------- */}
          {page === 1 && (
            <>
              <div style={{ position: 'absolute', left: 40, top: 90, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: CF.text }}>Projects</div>
              <div style={{ position: 'absolute', left: 1350, top: 88, width: 230, height: 52, background: CF.purple, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 20, fontWeight: 600, color: '#fff' }}>
                <Plus size={19} color="#fff" strokeWidth={2.6} />New Project
              </div>
              <div style={{ position: 'absolute', left: 40, top: 190, width: PW - 80, height: 300, border: `1px dashed ${CF.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CF.faint, fontSize: 24 }}>
                No projects yet
              </div>
            </>
          )}

          {/* ---------- page 2: the project ---------- */}
          {page === 2 && (
            <>
              <div style={{ position: 'absolute', left: 40, top: 112, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: CF.text }}>brainoutside</div>
              <div style={{ position: 'absolute', left: 40, top: 176, fontSize: 22, color: CF.dim }}>production</div>
              <div style={{ position: 'absolute', left: 40, top: 230, width: 250, height: 52, background: CF.purple, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 20, fontWeight: 600, color: '#fff' }}>
                <Plus size={19} color="#fff" strokeWidth={2.6} />New Resource
              </div>
              <div style={{ position: 'absolute', left: 40, top: 320, width: PW - 80, height: 260, border: `1px dashed ${CF.border}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CF.faint, fontSize: 24 }}>
                No resources in this environment
              </div>
            </>
          )}

          {/* ---------- page 3: the resource type picker ---------- */}
          {page === 3 && (
            <>
              <div style={{ position: 'absolute', left: 40, top: 112, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: CF.text }}>New Resource</div>
              {TYPES.map((t, i) => {
                const col = i % 3, row = Math.floor(i / 3);
                const sel = i === 0 && frame >= F_P4 - 6;
                return (
                  <div key={t.label} style={{
                    position: 'absolute', left: 40 + col * 515, top: 200 + row * 180, width: 490, height: 150,
                    background: CF.panel, border: `1px solid ${sel ? CF.purple : CF.border}`, borderRadius: 12, padding: 24,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <t.Icon size={24} color={i === 0 ? CF.purple : CF.dim} strokeWidth={1.9} />
                      <span style={{ fontSize: 24, fontWeight: 600, color: CF.text }}>{t.label}</span>
                    </div>
                    <div style={{ fontSize: 20, color: CF.faint, marginTop: 16 }}>{t.sub}</div>
                  </div>
                );
              })}
            </>
          )}

          {/* ---------- page 4: the config form ---------- */}
          {page === 4 && (
            <>
              <div style={{ position: 'absolute', left: 40, top: 112, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 40, color: CF.text }}>Public Repository</div>

              <Label t="Repository URL" x={40} y={196} />
              <div style={{ position: 'absolute', left: 40, top: 224, width: 900, height: 56, background: CF.panel2, border: `1px solid ${frame >= F_URL ? CF.purple : CF.border}`, borderRadius: 9, display: 'flex', alignItems: 'center', padding: '0 18px', fontFamily: FONT_MONO, fontSize: 22, color: CF.text }}>
                {frame >= F_URL ? REPO : <span style={{ color: CF.faint }}>https://github.com/…</span>}
              </div>

              <Label t="Branch" x={40} y={314} />
              <div style={{ position: 'absolute', left: 40, top: 342, width: 420, height: 56, background: CF.panel2, border: `1px solid ${CF.border}`, borderRadius: 9, display: 'flex', alignItems: 'center', padding: '0 18px', fontFamily: FONT_MONO, fontSize: 22, color: CF.text }}>main</div>

              <Label t="Build Pack" x={40} y={404} />
              <div style={{ position: 'absolute', left: 40, top: 432, width: 420, height: 56, background: CF.panel2, border: `1px solid ${open || frame >= F_PACK ? CF.purple : CF.border}`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', fontSize: 22, color: CF.text }}>
                {packLabel}
                <ChevronDown size={19} color={CF.dim} />
              </div>
              {open && (
                <div style={{ position: 'absolute', left: 40, top: 494, width: 420, background: CF.panel, border: `1px solid ${CF.border}`, borderRadius: 9, overflow: 'hidden', opacity: r(F_OPEN, F_OPEN + 6) }}>
                  {PACKS.map((p, i) => (
                    <div key={p} style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 18px', fontSize: 21, color: CF.text, background: i === 3 ? CF.panel2 : 'transparent' }}>{p}</div>
                  ))}
                </div>
              )}
              {frame >= F_PACK && <Ring start={F_PACK} color={COLORS.accent} style={{ left: 32, top: 424, right: 'auto', bottom: 'auto', width: 436, height: 72, borderRadius: 12 }} />}

              <Chip at={F_THAT} color={COLORS.signal} style={{ left: 520, top: 434 }}>that is the whole form</Chip>

              <div style={{
                position: 'absolute', left: 1330, top: 630, width: 210, height: 56,
                background: frame >= F_SAVE ? CF.green : CF.purple, borderRadius: 9,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 22, fontWeight: 600, color: '#fff',
              }}>
                {frame >= F_SAVE + 5 ? <><Check size={20} color="#fff" strokeWidth={3} />Saved</> : 'Save'}
              </div>
              <div style={{ position: 'absolute', left: 0, top: PH - 1, width: PW, height: 1 }} />
            </>
          )}
        </CoolifyShell>
      </WebBrowserFrame>

      <CursorLayer keys={KEYS} clicks={CLICKS} />
    </AbsoluteFill>
  );
};
export default B7CoolifyDeploy;
