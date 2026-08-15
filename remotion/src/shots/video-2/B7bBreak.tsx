import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate } from 'remotion';
import { Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { TermWindow, TermLines, SpedTag, ChipRow, FlowChip, TermLine } from './_shared/TermKit';
import { FactoryLine } from './_shared/FactoryLine';

// ============================================================================
// B7b · step 4 · LAB, part 2 — ROUND-5: same layout language as B7a (terminal
// LEFT replaying the experiments, story slot RIGHT): e3/e6/e7 montage cards,
// then the E5 pooler-hang saga. Piece stays at station 4 (lab).
// Master span 387.9 -> 425.0 (37.1s). local f = round((master_s - 387.9) * 30).
// Cues: "breaking things on purpose" 388.9->f30 · "failures are evidence"
// 393.6->f171 · "couple of minutes" 405.2->f519 · "the big one" 406.4->f555 ·
// "rotated...keys" 407.7->f594 · "silently died" 410.5->f678 · "no errors...
// hang forever" 412.2->f729 · "stuck for 8 hours" 415.4->f825 · "diagnosed"
// 419.1->f936 · "fixed" 420.1->f966 · "documented" 421.0->f993
// ============================================================================
export const compositionConfig = { id: 'B7bBreak', durationInSeconds: 37.1, fps: 30, width: 1920, height: 1080 };

const BIG = 555;
const LINES: readonly TermLine[] = [
  [60, '$ ./e3_auth_smtp.sh — does signup email send?', 'accent'],
  [78, 'signup -> 500 "Error sending confirmation email"', 'err'],
  [96, 'dial tcp: lookup supabase-mail ... misbehaving', 'err'],
  [114, 'real SMTP wired: signup 200, email delivered', 'ok'],
  [200, '$ ./e6_upgrade_timed.sh — what does upgrading cost?', 'accent'],
  [218, 'downgrade -> upgrade: pull 2s · up 3s · wall 5s', 'text'],
  [236, 'probe (1s): longest contiguous outage 5s', 'ok'],
  [300, '$ ./e7_backup_restore.sh — does the backup RESTORE?', 'accent'],
  [318, 'myth busted: `down -v` does NOT wipe (bind mount)', 'text'],
  [336, 'real wipe -> restore: sentinel + 2 auth users back', 'ok'],
  [354, 'storage via plain tar -> 500 ENODATA (xattrs)', 'err'],
  [372, 'tar --xattrs -> byte-identical serve 200', 'ok'],
  [594, '$ ./e2_secrets_rotation.sh — rotate ALL keys live', 'accent'],
  [612, 'JWT_SECRET + ANON/SERVICE_ROLE + vault rotated', 'text'],
  [628, 'restart: 58s · all 11 containers healthy', 'ok'],
  [648, '$ psql via pooler :6543 (25 parallel clients)', 'accent'],
  [936, 'Postgrex ArgumentError: SCRAM auth crash', 'err'],
  [952, 'cause: Supavisor snapshots creds at FIRST BOOT', 'text'],
  [966, '$ delete from _supavisor.users, _supavisor.tenants;', 'accent'],
  [980, '$ docker compose restart supavisor', 'accent'],
  [996, 're-seeded from env: 25/25 parallel clients OK', 'ok'],
];

// the three montage experiments (right slot, popping as the terminal runs them)
const EXPS: readonly (readonly [string, string, string, number])[] = [
  ['E3 · auth email', 'signup 500s out of the box', 'proven fix: real SMTP, email delivered', 78],
  ['E6 · timed upgrade', 'what does upgrading cost you?', 'longest outage: 5 seconds', 218],
  ['E7 · backup myths', 'does the backup actually restore?', 'restored, byte-identical (tar --xattrs)', 318],
];

const B7bBreak: React.FC = () => {
  const frame = useCurrentFrame();
  const at = (s: number, dy = 14) => ({
    opacity: interpolate(frame, [s, s + 12], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 12], [dy, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`,
  });
  const montageOut = interpolate(frame, [BIG - 8, BIG + 4], [1, 0], CLAMP);
  const ticks: readonly (readonly [string, number])[] = [['diagnosed', 936], ['fixed', 966], ['documented', 993]];
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.danger} />
      {/* header pills — structural row */}
      <ChipRow x={60} y={10} gap={14}>
        <FlowChip at={30} color={COLORS.danger} size={24}>it breaks things on purpose</FlowChip>
        <FlowChip at={171} color={COLORS.danger} size={24}>failures are evidence too</FlowChip>
        <FlowChip at={519} size={24}>8 experiments, minutes each</FlowChip>
      </ChipRow>
      {/* left: the experiments, replayed */}
      <TermWindow title="root@cf-self-host-supabase — experiments E2-E8" x={60} y={76} w={990} h={548}>
        <TermLines lines={LINES} rows={13} size={19} lineH={34} w={940} cursorUntil={930} />
      </TermWindow>
      <SpedTag from={60} to={BIG - 20} x={846} y={556} />
      {/* right: the story slot */}
      {montageOut > 0 && (
        <div style={{ position: 'absolute', left: 1090, top: 76, width: 770, opacity: montageOut }}>
          {EXPS.map(([name, q, a, s]) => (
            <div key={name} style={{ ...at(s, 16), boxSizing: 'border-box', background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '18px 26px', marginBottom: 16 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 17, letterSpacing: 1.5, color: COLORS.danger }}>{name}</div>
              <div style={{ fontSize: 22, color: COLORS.muted, marginTop: 6 }}>{q}</div>
              <div style={{ fontSize: 22, color: COLORS.ink, marginTop: 4 }}>→ {a}</div>
            </div>
          ))}
        </div>
      )}
      {frame >= BIG && (
        <div style={{ ...at(BIG, 18), position: 'absolute', left: 1090, top: 76, width: 770, boxSizing: 'border-box', background: COLORS.paper, border: `2px solid ${COLORS.danger}`, borderRadius: RADIUS.card, boxShadow: SHADOW.card, padding: '22px 30px' }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 18, letterSpacing: 2, color: COLORS.danger }}>THE&nbsp;BIG&nbsp;ONE&nbsp;·&nbsp;E5</div>
          <div style={{ ...at(594), fontSize: 24, color: COLORS.ink, marginTop: 14 }}>rotate <b>all</b> the keys on a live stack</div>
          <div style={{ ...at(678), fontSize: 24, color: COLORS.danger, marginTop: 10 }}>the connection pooler silently died</div>
          <div style={{ ...at(729, 10), marginTop: 16, background: '#0d1117', border: `1px solid ${COLORS.danger}`, borderRadius: RADIUS.panel, padding: '14px 22px', fontFamily: FONT_MONO, fontSize: 22, color: COLORS.danger }}>
            no errors. clients just hang forever.
          </div>
          <div style={{ ...at(825), display: 'inline-flex', marginTop: 16, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 23, color: COLORS.ink, background: `${COLORS.warn}2e`, border: `2px solid ${COLORS.warn}`, padding: '8px 18px', borderRadius: RADIUS.pill }}>
            ⏱ this once kept me stuck for 8 hours
          </div>
          <div style={{ display: 'flex', gap: 22, marginTop: 18 }}>
            {ticks.map(([label, s]) => (
              <div key={label} style={{ ...at(s, 8), display: 'flex', alignItems: 'center', gap: 8, fontSize: 23, color: COLORS.ink }}>
                <Check size={24} color={COLORS.signal} strokeWidth={2.8} /> {label}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* the factory — piece stays at the lab */}
      <FactoryLine station={3} pieceFrom={3} />
    </AbsoluteFill>
  );
};

export default B7bBreak;
