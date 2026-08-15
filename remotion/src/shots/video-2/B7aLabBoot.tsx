import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame } from '../../lib/browser';
import { CursorPointer, sampleCursor, CursorKey } from '../../lib/screencast';
import { TermWindow, TermLines, SpedTag, ChipRow, FlowChip, TermLine } from './_shared/TermKit';
import { FactoryLine } from './_shared/FactoryLine';

// ============================================================================
// B7a · step 4 · LAB, part 1 — ROUND-5: terminal on the LEFT replaying the
// deploy (evidence/e1_bringup.out); a real DigitalOcean droplet-creation
// browser working on the RIGHT (region -> size -> create, cursor motion); on
// "measured everything" the RAM chart takes over the right slot. Timing pills
// are a structural ChipRow (round-4 alignment fix). Factory band: piece 3 -> 4.
// Master span 356.4 -> 387.9 (31.5s). local f = round((master_s - 356.4) * 30).
// Cues: "DigitalOcean" 361.391->f150 · "cloned...2 seconds" 369.5-370.7->f393-428 ·
// "8.9 GB" 372.3->f477 · "114 seconds" 374.8->f552 · "20 seconds later" 377.0->f618 ·
// "was up" 379.3->f687 · "11 containers" 379.7->f699 · "4 GB box" 382.2->f774 ·
// "measured...RAM" 384.0->f827
// ============================================================================
export const compositionConfig = { id: 'B7aLabBoot', durationInSeconds: 31.5, fps: 30, width: 1920, height: 1080 };

const LINES: readonly TermLine[] = [
  [40, '$ do.py create cf-self-host-supabase', 'accent'],
  [70, 'droplet created: s-2vcpu-4gb · fra1 · 164.92.174.5', 'ok'],
  [100, 'boot_time_utc: 2026-08-11 12:34:14', 'dim'],
  [385, '$ git clone --sparse supabase/supabase (docker dir)', 'accent'],
  [400, "Cloning into '/root/supabase'...", 'text'],
  [420, 'clone_seconds: 2', 'ok'],
  [450, '$ docker compose pull', 'accent'],
  [458, ' Image supabase/postgres:17.6.1.136      Pulling', 'dim'],
  [466, ' Image supabase/studio:2026.08.03        Pulling', 'dim'],
  [474, ' Image supabase/supavisor:2.9.5          Pulling', 'dim'],
  [482, ' Image envoyproxy/envoy:v1.39.0          Pulling', 'dim'],
  [490, ' Image supabase/gotrue:v2.189.0          Pulling', 'dim'],
  [500, ' Image postgrest/postgrest:v14.12        Pulled', 'text'],
  [510, ' Image supabase/realtime:v2.102.3        Pulled', 'text'],
  [520, ' Image supabase/storage-api:v1.60.4      Pulled', 'text'],
  [530, ' Image supabase/edge-runtime:v1.74.0     Pulled', 'text'],
  [540, ' Image supabase/postgres:17.6.1.136      Pulled', 'text'],
  [552, 'pull_seconds: 114  ·  Images 11  ·  8.908GB', 'ok'],
  [585, '$ docker compose up -d', 'accent'],
  [593, ' Network supabase_default        Created', 'text'],
  [601, ' Container supabase-db           Started', 'text'],
  [609, ' Container supabase-studio       Started', 'text'],
  [617, ' Container supabase-envoy        Started', 'text'],
  [625, ' Container supabase-pooler       Started', 'text'],
  [633, ' Container supabase-auth         Started', 'text'],
  [641, ' Container supabase-storage      Started', 'text'],
  [655, 'compose_up_rc: 0', 'ok'],
  [670, 'studio_serving_seconds: 20 (http 307 -> /project/default)', 'ok'],
  [700, '$ docker ps --format table', 'accent'],
  [708, ' supabase-db          Up (healthy)', 'ok'],
  [716, ' supabase-studio      Up (healthy)', 'ok'],
  [724, ' supabase-envoy       Up (healthy)', 'ok'],
  [732, ' supabase-pooler      Up (healthy)', 'ok'],
  [740, ' supabase-auth        Up (healthy)', 'ok'],
  [748, ' supabase-rest        Up (healthy)', 'ok'],
  [756, ' supabase-realtime    Up (healthy)', 'ok'],
  [764, ' supabase-storage     Up (healthy)', 'ok'],
  [772, ' supabase-meta        Up (healthy)', 'ok'],
  [780, ' supabase-edge-fns    Up (healthy)', 'ok'],
  [788, ' supabase-imgproxy    Up (healthy)', 'ok'],
];

// settled per-container RAM, MiB (evidence/e1 docker stats)
const RAM: readonly (readonly [string, number])[] = [
  ['studio', 255], ['storage', 220], ['realtime', 206], ['pooler', 187], ['meta', 124],
  ['db', 121], ['edge-fns', 100], ['imgproxy', 100], ['envoy', 84], ['auth', 35], ['rest', 32],
];
const RAM_AT = 827;

// the DO create-droplet walkthrough (right slot)
const DO_BOX = { x: 1090, y: 76, w: 770, h: 548 };
const DO_PAGE_H = DO_BOX.h - 102;
const FRA_PICK = 184;
const SIZE_PICK = 248;
const CREATE = 308;
const CREATED = 370;

const REGIONS: readonly (readonly [string, string])[] = [
  ['NYC1', 'New York'], ['LON1', 'London'], ['FRA1', 'Frankfurt'], ['SGP1', 'Singapore'],
];
const SIZES: readonly (readonly [string, string, string])[] = [
  ['s-1vcpu-2gb', '2 GB / 1 vCPU', '$0.018/hr'],
  ['s-2vcpu-4gb', '4 GB / 2 vCPUs', '$0.036/hr'],
];

// the real DigitalOcean mark (round-7): the #0080FF circle whose bottom-left
// quarter steps down into the two smaller squares — drawn as SVG, used for the
// tab favicon AND the page header, replacing the generic blue disc.
const DOMark: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }}>
    <path
      fill="#0080FF"
      d="M12.04 0C5.41-.02.01 5.37.01 11.99h4.63c0-4.92 4.88-8.73 10.06-6.85a6.95 6.95 0 0 1 4.15 4.14c1.89 5.18-1.92 10.06-6.84 10.07v-4.61H7.39v4.62h4.61V24c7.86 0 13.97-7.59 11.4-15.83a11.6 11.6 0 0 0-7.57-7.57A12.8 12.8 0 0 0 12.04 0zM7.39 19.36H3.83v3.57h3.56zm-3.56 0v-2.98H.85v2.98z"
    />
  </svg>
);

const CURSOR: CursorKey[] = [
  { frame: 120, x: 1520, y: 250 },
  { frame: 172, x: 1288, y: 352 },
  { frame: 192, x: 1288, y: 352 },
  { frame: 236, x: 1650, y: 452 },
  { frame: 256, x: 1650, y: 452 },
  { frame: 296, x: 1474, y: 515 },
  { frame: 320, x: 1474, y: 515 },
  { frame: 380, x: 1580, y: 440 },
];
const CLICKS = [FRA_PICK, SIZE_PICK, CREATE];

const B7aLabBoot: React.FC = () => {
  const frame = useCurrentFrame();
  const ramOp = (i: number) => ({
    opacity: interpolate(frame, [RAM_AT + i * 3, RAM_AT + i * 3 + 10], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
  });
  const barW = (v: number) => interpolate(frame, [RAM_AT + 8, RAM_AT + 34], [0, (v / 255) * 340], { ...CLAMP, easing: EASINGS.easeOut });
  const browserOut = interpolate(frame, [RAM_AT - 8, RAM_AT + 4], [1, 0], CLAMP);
  const ramIn = interpolate(frame, [RAM_AT, RAM_AT + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
  const cur = sampleCursor(frame, CURSOR);
  const curOp = interpolate(frame, [112, 122], [0, 1], CLAMP) * interpolate(frame, [400, 420], [1, 0], CLAMP);
  const press = CLICKS.reduce((p, cf) => (frame < cf - 4 || frame > cf + 8) ? p : interpolate(frame, [cf - 4, cf, cf + 8], [1, 0.8, 1], CLAMP), 1);
  const creating = interpolate(frame, [CREATE + 4, CREATED - 6], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.danger} />
      {/* the timing pills — one structural row, each pops on its cue */}
      <ChipRow x={60} y={10} gap={14}>
        <FlowChip at={150} color={COLORS.accent} size={24}>DigitalOcean · fra1 · 4 GB box</FlowChip>
        <FlowChip at={428} size={24}>cloned in 2s</FlowChip>
        <FlowChip at={552} size={24}>8.9 GB pulled in 114s</FlowChip>
        <FlowChip at={660} size={24}>up in 20s</FlowChip>
        <FlowChip at={699} size={24}>11 healthy</FlowChip>
      </ChipRow>
      {/* left: the real run, replayed */}
      <TermWindow title="S4 · the lab — root@cf-self-host-supabase · the real run, replayed" x={60} y={76} w={990} h={548}>
        <TermLines lines={LINES} rows={13} size={19} lineH={34} w={940} />
      </TermWindow>
      <SpedTag from={453} to={579} x={846} y={556} />
      <SpedTag from={585} to={700} x={846} y={556} />
      {/* right: the droplet actually being created */}
      {browserOut > 0 && (
        <div style={{ opacity: browserOut }}>
          <WebBrowserFrame url="cloud.digitalocean.com/droplets/new" tabTitle="Create Droplets · DigitalOcean" box={DO_BOX} appearAt={90} pageBg="#fff" favicon={<DOMark size={16} />}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: DO_BOX.w, height: DO_PAGE_H, background: '#fff', padding: '16px 22px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <DOMark size={22} />
                <span style={{ fontSize: 18, fontWeight: 600, color: '#212933' }}>Create Droplets</span>
                <span style={{ marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 13, color: '#697586' }}>cf-self-host-supabase</span>
              </div>
              <div style={{ fontSize: 14, color: '#4d5b6e', margin: '12px 0 8px', fontWeight: 600 }}>Choose a datacenter region</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {REGIONS.map(([code, city], i) => {
                  const picked = code === 'FRA1' && frame >= FRA_PICK;
                  return (
                    <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 10, border: `2px solid ${picked ? '#0080ff' : '#e2e8f0'}`, background: picked ? '#f0f7ff' : '#fff', borderRadius: 9, padding: '9px 13px', opacity: interpolate(frame, [96 + i * 4, 104 + i * 4], [0, 1], CLAMP) }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#212933' }}>{city}</div>
                        <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: '#697586' }}>{code}</div>
                      </div>
                      {picked && <span style={{ marginLeft: 'auto', color: '#0080ff', fontSize: 16, fontWeight: 700 }}>✓</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 14, color: '#4d5b6e', margin: '14px 0 8px', fontWeight: 600 }}>Choose a size</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {SIZES.map(([slug, label, price]) => {
                  const picked = slug === 's-2vcpu-4gb' && frame >= SIZE_PICK;
                  return (
                    <div key={slug} style={{ border: `2px solid ${picked ? '#0080ff' : '#e2e8f0'}`, background: picked ? '#f0f7ff' : '#fff', borderRadius: 9, padding: '9px 13px', opacity: interpolate(frame, [116, 124], [0, 1], CLAMP) }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#212933' }}>{label} {picked && <span style={{ color: '#0080ff' }}>✓</span>}</div>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: '#697586' }}>{slug} · {price}</div>
                    </div>
                  );
                })}
              </div>
              {frame < CREATED ? (
                <div style={{ marginTop: 16, position: 'relative', height: 44, borderRadius: 9, overflow: 'hidden', background: frame >= CREATE ? '#e8f1fc' : '#0069ff', opacity: interpolate(frame, [124, 132], [0, 1], CLAMP) }}>
                  {frame >= CREATE && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${creating * 100}%`, background: '#0069ff', opacity: 0.25 }} />}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: frame >= CREATE ? '#0069ff' : '#fff' }}>
                    {frame >= CREATE ? 'Creating droplet…' : 'Create Droplet'}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, background: '#0b1a2b', borderRadius: 9, padding: '11px 16px', opacity: interpolate(frame, [CREATED, CREATED + 10], [0, 1], CLAMP) }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: '#2dd4a7' }} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 13.5, color: '#dbe7f3' }}>cf-self-host-supabase · fra1 · 164.92.174.5</span>
                  <span style={{ marginLeft: 'auto', fontFamily: FONT_MONO, fontSize: 13, color: '#7ee2b8' }}>$0.036 / hr</span>
                </div>
              )}
            </div>
          </WebBrowserFrame>
        </div>
      )}
      {/* the RAM measurement takes over the right slot — "it measured everything" */}
      {ramIn > 0 && (
        <div style={{ position: 'absolute', left: DO_BOX.x, top: DO_BOX.y, width: DO_BOX.w, boxSizing: 'border-box', opacity: ramIn, transform: `translateY(${interpolate(frame, [RAM_AT, RAM_AT + 14], [18, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '20px 28px' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 1.5, color: COLORS.muted, marginBottom: 12 }}>SETTLED&nbsp;RAM&nbsp;PER&nbsp;CONTAINER&nbsp;(MiB)</div>
          {RAM.map(([name, v], i) => (
            <div key={name} style={{ ...ramOp(i), display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6.5 }}>
              <span style={{ width: 112, fontFamily: FONT_MONO, fontSize: 18, color: COLORS.ink }}>{name}</span>
              <div style={{ width: barW(v), height: 13, borderRadius: 7, background: COLORS.accent, opacity: 0.85 }} />
              <span style={{ fontFamily: FONT_MONO, fontSize: 18, color: COLORS.muted }}>{v}</span>
            </div>
          ))}
          <div style={{ ...ramOp(11), fontFamily: FONT_MONO, fontSize: 18, color: COLORS.ink, marginTop: 10 }}>stack idle ≈ <b style={{ color: COLORS.accent }}>1.5 GB</b> of 3.9 GB</div>
        </div>
      )}
      {/* pointer + click ripples over the browser */}
      {curOp > 0 && (
        <div style={{ position: 'absolute', left: cur.x, top: cur.y, zIndex: 6, opacity: curOp }}>
          <CursorPointer press={press} size={30} />
        </div>
      )}
      {CLICKS.map((cf) => {
        if (frame < cf || frame > cf + 18) return null;
        const p = sampleCursor(cf, CURSOR);
        const sc = interpolate(frame, [cf, cf + 18], [0, 2.4], { ...CLAMP, easing: EASINGS.easeOut });
        const ro = interpolate(frame, [cf, cf + 18], [0.5, 0], CLAMP);
        return <div key={cf} style={{ position: 'absolute', left: p.x, top: p.y, width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: '50%', border: '2px solid #0069ff', opacity: ro, transform: `scale(${sc})`, zIndex: 6 }} />;
      })}
      {/* the factory — piece advances to station 4, the lab */}
      <FactoryLine station={3} pieceFrom={2} advanceAt={0} />
    </AbsoluteFill>
  );
};

export default B7aLabBoot;
