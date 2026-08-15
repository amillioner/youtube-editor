// video-2 shared kit — the published guide page, cloned faithfully from the
// real site captures (v6_desktop_light_top.png / v6_stack_section.png). One
// source of truth for every beat that shows the page (ColdOpenOutput's full
// scroll, ColdOpenLines' in-place line highlights). All copy is verbatim from
// the published guide or composed strictly from the run's measured evidence.
import React from 'react';
import { Img } from 'remotion';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../../fonts';
import { lib } from '../../../lib/kit';
import { Marker } from '../../../lib/browser';

export const SITE = {
  bg: '#fdfcf7', ink: '#181733', body: '#3f3e56', muted: '#6d6c85',
  purple: '#6e62f5', green: '#10b981', line: '#eceaf4', card: '#fffefb',
} as const;
const S = SITE;

const STACK: readonly (readonly [name: string, mb: string, desc: string])[] = [
  ['Gateway', '84 MB', 'Envoy. The one door in: /auth, /rest, /storage.'],
  ['Postgres', '121 MB', 'Postgres 17. The actual database.'],
  ['Studio', '255 MB', 'The dashboard. Heaviest single piece.'],
  ['Auth (GoTrue)', '35 MB', 'Signups, logins, JWTs, magic links.'],
  ['Storage', '220 MB', 'File uploads on top of Postgres + disk.'],
  ['Pooler (Supavisor)', '187 MB', 'Connection pooler. Owns both DB ports.'],
  ['REST (PostgREST)', '32 MB', 'Your tables as a REST API, automatically.'],
  ['Realtime', '206 MB', 'Live subscriptions over websockets.'],
  ['Meta + Edge', '324 MB', 'Schema API, image transforms, edge runtime.'],
];

const CHECKS = [
  'Self-hosted Supabase running on your own server, HTTPS included',
  'Auth emails that actually send, proven with a real confirmation email',
  "Secrets set the right way, so the pooler and dashboard don't fight you later",
  'A backup you have actually restored, not one you hope works',
  'The raw database and gateway ports closed to the internet',
];

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 36, color: S.ink, margin: '54px 0 18px' }}>{children}</div>
);
const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 20, lineHeight: 1.65, color: S.body, marginBottom: 16 }}>{children}</div>
);

// Optional Marker starts (frames): mbStart sweeps the measured MB values,
// line1Start sweeps the TL;DR closing sentence (round-7: "I ran the whole
// thing on one 4 GB server…"), line2Start the verbatim pooler sentence.
export const GuidePageBody: React.FC<{
  mbStart?: number;
  line1Start?: number;
  line2Start?: number;
}> = ({ mbStart, line1Start, line2Start }) => {
  const mark = (start: number | undefined, text: string) =>
    start === undefined ? <>{text}</> : <Marker start={start} color="#ffd766bb">{text}</Marker>;
  return (
    <div style={{ background: S.bg, fontFamily: FONT_BODY }}>
      {/* ---- site header (the real one) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 34, padding: '26px 70px', borderBottom: `1px solid ${S.line}`, background: '#fffefc' }}>
        <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 27, color: S.ink }}>Learn<span style={{ color: S.purple }}>With</span>Hasan</span>
        <div style={{ display: 'flex', gap: 30, marginLeft: 30, fontSize: 18.5, color: S.body }}>
          <span>Courses</span><span>Resources ⌄</span><span>Guides ⌄</span><span>Tools</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 18, color: S.body, border: `1.5px solid ${S.line}`, borderRadius: 999, padding: '10px 22px' }}>Community</span>
          <span style={{ fontSize: 18, color: '#fff', fontWeight: 600, background: S.purple, borderRadius: 999, padding: '11px 24px' }}>⚡ Solo Builder Bundle</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 44, padding: '30px 60px 80px 118px' }}>
        {/* ---- article column */}
        <div style={{ width: 1030 }}>
          <div style={{ fontSize: 17, color: S.muted }}>Home&nbsp;&nbsp;/&nbsp;&nbsp;Self-Hosting Hub&nbsp;&nbsp;/&nbsp;&nbsp;Free Guide: How to Self-Host Supabase</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 56, color: S.ink, lineHeight: 1.14, marginTop: 18 }}>
            How to Self-Host Supabase: The Parts the Docker Compose Skips
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 22 }}>
            <Img src={lib('projects/video-2/yt-2022/avatar.png')} style={{ width: 46, height: 46, borderRadius: 999, objectFit: 'cover' }} />
            <span style={{ fontSize: 20, fontWeight: 700, color: S.ink }}>Hasan Aboul Hasan</span>
            <span style={{ fontSize: 19, color: S.muted }}>· Published 2026-08-12</span>
          </div>

          {/* TL;DR — green rail, verbatim */}
          <div style={{ marginTop: 34, background: S.card, border: `1.5px solid ${S.line}`, borderLeft: `5px solid ${S.green}`, borderRadius: 16, padding: '28px 36px' }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 16, letterSpacing: 3, color: S.muted, marginBottom: 14 }}>≡&nbsp;&nbsp;TL;DR</div>
            <div style={{ fontSize: 21.5, lineHeight: 1.6, color: S.body }}>
              The official Docker Compose gets you a Supabase login screen in about 20 seconds. Everything that makes it
              a real backend is undocumented: the secrets you must set before the first boot, auth email that fails
              silently, a connection pooler that hangs if you rotate keys late, HTTPS, and a backup that restores.{' '}
              {mark(line1Start, 'I ran the whole thing on one 4 GB server and measured every part. This is that run, written down.')}
            </div>
          </div>

          {/* checklist — purple rail, verbatim */}
          <div style={{ marginTop: 26, background: S.card, border: `1.5px solid ${S.line}`, borderLeft: `5px solid ${S.purple}`, borderRadius: 16, padding: '28px 36px' }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 16, letterSpacing: 3, color: S.muted, marginBottom: 16 }}>✓&nbsp;&nbsp;WHAT YOU&rsquo;LL HAVE AT THE END</div>
            {CHECKS.map((c) => (
              <div key={c} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '8px 0' }}>
                <span style={{ color: S.purple, fontSize: 20, fontWeight: 700, lineHeight: 1.5 }}>✓</span>
                <span style={{ fontSize: 20.5, lineHeight: 1.5, color: S.body }}>{c}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 34 }}>
            <P>Supabase is the open-source Firebase alternative: a Postgres database with Auth, file Storage, instant
              REST and Realtime APIs, and a dashboard called Studio, all in one stack. The company sells a hosted
              version. The same product also ships as a Docker Compose you can run on your own server, for free.</P>
            <P>So I did. Fresh DigitalOcean droplet, the official supabase/docker compose, no shortcuts.{' '}
              Getting to the login screen was easy. Then I spent the rest of the run on the parts every other guide
              skips: the secrets, the email, the pooler, the upgrade, and the backup. I broke a few things on purpose
              and measured what it took to fix them.</P>
          </div>

          <H2>What you actually get</H2>
          <P>The word &ldquo;Supabase&rdquo; is one product, but the compose starts <b>eleven containers</b>. Here is
            the stack I got, with the real idle memory of each piece measured after ten minutes of settling.</P>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginTop: 10 }}>
            {STACK.map(([name, mb, desc], i) => (
              <div key={name} style={{ background: S.card, border: `1.5px solid ${i === 0 ? S.purple : S.line}`, borderRadius: 14, padding: '18px 20px' }}>
                <div style={{ fontSize: 19.5, fontWeight: 700, color: S.ink }}>{name}</div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: S.purple, margin: '8px 0' }}>
                  {mbStart === undefined ? mb : <Marker start={mbStart + i * 3} color="#ffd76688">{mb}</Marker>}
                </div>
                <div style={{ fontSize: 16.5, lineHeight: 1.45, color: S.muted }}>{desc}</div>
              </div>
            ))}
          </div>

          <P><span style={{ display: 'block', marginTop: 22 }}>Two things surprised me here, and both matter because they make older tutorials wrong:
            <b> the gateway is Envoy now, not Kong</b>, and <b>there is no analytics/Logflare container</b> in the
            current default compose. One less thing to break.</span></P>

          <H2>What it needs to run</H2>
          <P>Supabase&rsquo;s official minimum is <b>4 GB RAM, 2 CPU cores, and 40 GB of disk</b>. Those numbers are
            honest. On my 4 GB droplet the whole stack idled at about <b>1.5 GB RAM used</b>, leaving roughly 2.3 GB
            free before any real traffic. The images take <b>8.9 GB of disk</b> on their own.</P>

          <H2>Set every secret before the first boot</H2>
          <P>The compose ships with published demo keys. Every guide says &ldquo;change them later.&rdquo; Later is a
            trap: rotate the keys after first boot and the connection pooler hangs, silently, with no errors in any
            log. Set all of them before the stack ever starts.</P>
          <div style={{ background: '#14141c', borderRadius: 12, padding: '20px 26px', fontFamily: FONT_MONO, fontSize: 17.5, lineHeight: 1.7, color: '#9ae6c3' }}>
            POSTGRES_PASSWORD=&lt;yours&gt;<br />JWT_SECRET=&lt;yours, 40+ chars&gt;<br />ANON_KEY=&lt;signed with YOUR secret&gt;<br />SERVICE_ROLE_KEY=&lt;signed with YOUR secret&gt;
          </div>

          <H2>Auth email: the 500 that fails silently</H2>
          <P>Signups return <b>500 &ldquo;Error sending confirmation email&rdquo;</b> out of the box, because there is
            no SMTP server in the stack. I proved the fix with a real confirmation email through a local Mailpit,
            then real credentials.</P>

          <H2>The pooler trap</H2>
          <P>Every guide says to rotate the demo keys eventually.{' '}
            {mark(line2Start, 'I ignored it once and watched the connection pooler hang forever with no error.')}{' '}
            The fix that proved out: re-seed the pooler tenants, then <b>25/25 connections OK</b>. It cost me 8 hours
            to find. It costs you this paragraph.</P>

          <H2>A backup that restores</H2>
          <P>A backup you have not restored is a hope, not a backup. The nightly dump restored onto a clean box in
            under two minutes, and the longest outage during a timed upgrade probe was <b>5 seconds</b>.</P>

          <H2>What the lab cost</H2>
          <P>The droplet is billed by the hour. The whole measured run — deploy, break, fix, measure, tear down —
            cost <b>$0.35</b>. The box no longer exists. The numbers in this guide do.</P>
        </div>

        {/* ---- sidebar (the real ebook card) */}
        <div style={{ width: 380 }}>
          <div style={{ position: 'relative', background: S.card, border: `1.5px solid ${S.line}`, borderRadius: 18, padding: '26px 26px 28px', textAlign: 'center', boxShadow: '0 14px 40px rgba(24,23,51,0.07)' }}>
            <div style={{ width: 150, height: 190, margin: '0 auto', borderRadius: 10, background: '#fff', border: `1px solid ${S.line}`, boxShadow: '0 10px 26px rgba(24,23,51,0.12)', padding: '16px 12px' }}>
              <div style={{ width: 26, height: 5, background: S.purple, borderRadius: 3, margin: '0 auto 10px' }} />
              <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 17, color: S.ink, lineHeight: 1.25 }}>Vibe Engineering Blocks</div>
              <div style={{ fontSize: 11.5, color: S.muted, marginTop: 8 }}>47 building blocks for shipping real, scalable apps with AI</div>
            </div>
            <div style={{ display: 'inline-block', background: '#eef0ff', color: S.purple, fontSize: 15.5, fontWeight: 700, borderRadius: 999, padding: '6px 16px', marginTop: 16 }}>Free guide</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: 22, color: S.ink, marginTop: 10 }}>Vibe Engineering Blocks</div>
            <div style={{ fontSize: 16.5, color: S.muted, marginTop: 6 }}>The building blocks I use to ship with AI — free PDF.</div>
            <div style={{ border: `1.5px solid ${S.line}`, borderRadius: 10, padding: '13px 16px', fontSize: 17, color: S.muted, textAlign: 'left', marginTop: 16 }}>Your email</div>
            <div style={{ background: S.purple, color: '#fff', fontSize: 17.5, fontWeight: 700, borderRadius: 10, padding: '14px 16px', marginTop: 10 }}>Get the free book</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// the fixed share rail (X / in / copy), same as the live page
export const GuideShareRail: React.FC = () => (
  <div style={{ position: 'absolute', left: 26, top: 320, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
    {['𝕏', 'in', '⧉'].map((s) => (
      <div key={s} style={{ width: 52, height: 52, borderRadius: 999, background: '#fff', border: `1.5px solid ${S.line}`, boxShadow: '0 8px 22px rgba(24,23,51,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, color: S.ink, fontWeight: 700 }}>{s}</div>
    ))}
    <div style={{ fontSize: 12.5, letterSpacing: 1.5, color: S.muted, marginTop: 4 }}>SHARE</div>
  </div>
);
