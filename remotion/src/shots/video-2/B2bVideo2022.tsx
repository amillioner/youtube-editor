import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate, Img, OffthreadVideo, Sequence } from 'remotion';
import {
  ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Pause, SkipForward,
  VolumeX, Settings, Maximize, PenLine, ClipboardX,
} from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_MONO, FONT_BODY } from '../../fonts';
import { CLAMP, lib } from '../../lib/kit';
import { Marker } from '../../lib/browser';
import { Screencast, CursorKey } from '../../lib/screencast';

// ============================================================================
// B2b · the 2022 video — ROUND-4: one continuous camera move through YouTube.
// Full-screen "2022" statement -> the REAL channel page (@hasanaboulhasan,
// real banner/avatar/tiles) -> fast scroll to the 2022 tile -> click -> the
// watch page opens and the REAL video PLAYS muted (yt-dlp clips in
// media/projects/video-2/yt-2022/) -> zoom modal on the real view count ->
// player seeks to 9:33 where he ACTUALLY says the two lines (captions:
// "writing assistant" 575.9s / "copy and paste" 579.9s) -> quote pills land
// over the dimmed player in sync with the source moment -> grey + AI SLOP.
// NOTE: the 2022 video is watch-by-link only today (channel tab lists 78
// public videos, oldest ~2023), so the grid seats the real tile among the
// oldest real-era tiles.
// ROUND-7: a REAL PAUSE at master 109.7 (local f534) — bake.py's "insert"
// type freezes this cutaway + the narration there while B2bQuoteInsert plays
// the source WITH AUDIO (8.7s), then this shot resumes at f534 (player sits
// at source ~575.3s both sides of the insert, so the freeze is seamless).
// Master span 91.9 -> 123.2 (31.3s). local f = round((master_s - 91.9) * 30).
// Cues: "2022" 92.431->f16 · "published a video" 95.415->f105 (channel page) ·
// "here on my channel" 96.06 (scroll f148-198) · click f196 -> watch f200 ·
// "300,000" 102.858->f329 (views zoom+modal, release f415-438) ·
// "warned you then" 107.670->f473 (seek to 9:33) · quote pills f552 / f661 ·
// "generic content" 116.571->f740 (grey) · "AI slop" 120.740->f865 (stamp)
// ============================================================================
export const compositionConfig = { id: 'B2bVideo2022', durationInSeconds: 31.3, fps: 30, width: 1920, height: 1080 };

const PAGE = 105;
const SCROLL: [number, number] = [148, 198];
const CLICK = 196;
const WATCH = 200;
const VIEWS = 329;
const SEEK = 473;
const Q1 = 552;
const Q2 = 661;
const FADE = 740;
const STAMP = 865;

// clip-quotes.mp4 = source 568.0-596.0s. startFrom 159f (5.3s) => source 573.3s
// at the seek, so the "writing assistant" line (575.9s) lands exactly on Q1.
const QUOTES_STARTFROM = 159;
const SEEK_TO_S = 573.3; // player time at the seek
const VIDEO_DUR_S = 693; // 11:33

const BOX = { x: 80, y: 60, w: 1760, h: 960 };
const CHROME_H = 102;
const VP = { w: BOX.w, h: BOX.h - CHROME_H }; // 1760x858 page viewport

// ---- real channel data (yt-dlp, 2026-08-14) --------------------------------
type Tile = { id: string; title: string; meta: string; dur: string };
const ROWS: Tile[][] = [
  [
    { id: 'SDJD85dLWwk', title: 'The Only Free AI Tool Everyone Should Use, and it is Open Source', meta: '18K views · 2 weeks ago', dur: '15:10' },
    { id: '1JZKKAg3UX8', title: 'Claude Can Now Make Any Video You Want in Minutes!', meta: '50K views · 3 weeks ago', dur: '9:13' },
    { id: 'KuXM3mRgRNA', title: 'Stop paying for video editors — do this instead', meta: '69K views · 1 month ago', dur: '6:28' },
  ],
  [
    { id: 'DTGPI0VVr7Y', title: 'Generate UNLIMITED AI Images for FREE with Claude Code', meta: '26K views · 1 month ago', dur: '5:30' },
    { id: 'Ei5QnJlGVxc', title: 'I Replaced n8n, Zapier and Make With One Free Tool', meta: '86K views · 2 months ago', dur: '4:38' },
    { id: 'Aj2LoQ8hcSQ', title: 'Build Unlimited AI Games for FREE (Guide Included)', meta: '56K views · 2 months ago', dur: '5:54' },
  ],
  [
    { id: 'e2KDn0VHoK8', title: '7 ChatGPT Prompts No One Is Talking About 🤯', meta: '192K views · 3 years ago', dur: '13:42' },
    { id: '-C4FCxP-QqE', title: 'This is How Professionals Use ChatGPT (Advanced Course)', meta: '284K views · 3 years ago', dur: '39:45' },
    { id: 'SdhMv6ZHHSU', title: 'Use ChatGPT Chains To Get Maximum Results!', meta: '72K views · 3 years ago', dur: '6:25' },
  ],
  [
    { id: 'TARGET', title: 'Write A Blog Post In 10 Minutes With AI 100% Free', meta: '295K views · 4 years ago', dur: '11:33' },
    { id: 'mBYu5NoXBcs', title: 'ChatGPT Prompt Engineering Course', meta: '1M views · 3 years ago', dur: '30:36' },
    { id: 'qrlZ5ow764M', title: 'How To Create 100% Free Business Email 🔥', meta: '671K views · 4 years ago', dur: '16:50' },
  ],
];
const SIDEBAR: Tile[] = [
  { id: 'HB5jBut9L8c', title: 'How I Make Money With APIs (Revealing My Secrets!)', meta: '251K views · 3 years ago', dur: '12:15' },
  { id: 'SDJD85dLWwk', title: 'The Only Free AI Tool Everyone Should Use, and it is Open Source', meta: '18K views · 2 weeks ago', dur: '15:10' },
  { id: '1JZKKAg3UX8', title: 'Claude Can Now Make Any Video You Want in Minutes!', meta: '50K views · 3 weeks ago', dur: '9:13' },
  { id: 'KuXM3mRgRNA', title: 'Stop paying for video editors — do this instead', meta: '69K views · 1 month ago', dur: '6:28' },
  { id: 'Ei5QnJlGVxc', title: 'I Replaced n8n, Zapier and Make With One Free Tool', meta: '86K views · 2 months ago', dur: '4:38' },
  { id: 'DTGPI0VVr7Y', title: 'Generate UNLIMITED AI Images for FREE with Claude Code', meta: '26K views · 1 month ago', dur: '5:30' },
];

// grid geometry (page px): header 508, rows pitch 429
const GRID_TOP = 520;
const ROW_PITCH = 429;
const COL_W = 560;
const TILE_H = 315;
// page height 2276 - viewport 858: land at the page's REAL bottom (a browser
// can't overscroll past the last row) — target row sits lower-middle
const LAND = 1418;

const tileSrc = (t: Tile) =>
  t.id === 'TARGET' ? lib('projects/video-2/yt-2022/thumb.jpg') : lib(`projects/video-2/yt-2022/channel/${t.id}.jpg`);

const YTFavicon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 24 17" style={{ display: 'block' }}>
    <rect width="24" height="17" rx="4" fill="#FF0000" />
    <path d="M9.6 4.6 L16.2 8.5 L9.6 12.4 Z" fill="#fff" />
  </svg>
);

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const ss = Math.max(0, Math.floor(s % 60));
  return `${m}:${String(ss).padStart(2, '0')}`;
};

// ---- channel page (live DOM) ----------------------------------------------
const ChannelPage: React.FC = () => (
  <div style={{ width: VP.w, background: '#fff', fontFamily: FONT_BODY }}>
    <div style={{ width: VP.w, height: 200, overflow: 'hidden' }}>
      <Img src={lib('projects/video-2/yt-2022/channel/banner.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 26, padding: '24px 60px 18px' }}>
      <Img src={lib('projects/video-2/yt-2022/channel/avatar-hq.jpg')} style={{ width: 150, height: 150, borderRadius: 999, objectFit: 'cover' }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 38, color: '#0f0f0f' }}>Hasan Aboul Hasan</div>
        <div style={{ fontSize: 17, color: '#606060', marginTop: 8 }}>
          <span style={{ fontWeight: 600, color: '#0f0f0f' }}>@hasanaboulhasan</span>
          &nbsp;·&nbsp;1.01M subscribers&nbsp;·&nbsp;78 videos
        </div>
        <div style={{ fontSize: 16, color: '#606060', marginTop: 8 }}>I share what I actually build: APIs, AI tools, and real online business. &nbsp;...more</div>
      </div>
      <div style={{ background: '#0f0f0f', color: '#fff', fontSize: 17, fontWeight: 600, padding: '11px 22px', borderRadius: 999 }}>Subscribe</div>
    </div>
    <div style={{ display: 'flex', gap: 34, padding: '0 60px', borderBottom: '1px solid #e5e5e5', fontSize: 17, fontWeight: 600, color: '#606060' }}>
      {['Home', 'Videos', 'Shorts', 'Live', 'Playlists', 'Posts'].map((t) => (
        <div key={t} style={{ padding: '12px 4px 14px', color: t === 'Videos' ? '#0f0f0f' : '#606060', borderBottom: t === 'Videos' ? '3px solid #0f0f0f' : '3px solid transparent' }}>{t}</div>
      ))}
    </div>
    <div style={{ display: 'flex', gap: 12, padding: '14px 24px' }}>
      {['Latest', 'Popular', 'Oldest'].map((c, i) => (
        <span key={c} style={{ fontSize: 15, fontWeight: 600, padding: '8px 14px', borderRadius: 8, background: i === 0 ? '#0f0f0f' : '#f2f2f2', color: i === 0 ? '#fff' : '#0f0f0f' }}>{c}</span>
      ))}
    </div>
    <div style={{ padding: '0 24px 40px' }}>
      {ROWS.map((row, r) => (
        <div key={r} style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
          {row.map((t) => (
            <div key={t.id} style={{ width: COL_W }}>
              <div style={{ position: 'relative', width: COL_W, height: TILE_H, borderRadius: 12, overflow: 'hidden', background: '#e9e9e9' }}>
                <Img src={tileSrc(t)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span style={{ position: 'absolute', right: 8, bottom: 8, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 13.5, fontWeight: 600, padding: '3px 6px', borderRadius: 5 }}>{t.dur}</span>
              </div>
              <div style={{ fontSize: 18.5, fontWeight: 600, color: '#0f0f0f', lineHeight: 1.3, marginTop: 12, height: 48, overflow: 'hidden' }}>{t.title}</div>
              <div style={{ fontSize: 15.5, color: '#606060', marginTop: 6 }}>{t.meta}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ---- watch page (live DOM; the player really plays the yt-dlp clips) -------
const PLAYER = { x: 34, y: 24, w: 1064, h: 598 } as const;

const PlayerControls: React.FC = () => {
  const frame = useCurrentFrame();
  // visible after load and around the seek, hidden otherwise (YouTube behavior)
  const vis = Math.max(
    interpolate(frame, [WATCH + 4, WATCH + 12, WATCH + 66, WATCH + 80], [0, 1, 1, 0], CLAMP),
    interpolate(frame, [SEEK - 8, SEEK - 2, SEEK + 78, SEEK + 92], [0, 1, 1, 0], CLAMP),
  );
  const played = frame < SEEK
    ? Math.max(0, (frame - WATCH) / 30)
    : SEEK_TO_S + (frame - SEEK) / 30;
  // the red bar snaps forward across the seek (6-frame catch-up)
  const seekSnap = interpolate(frame, [SEEK - 1, SEEK + 5], [(SEEK - 1 - WATCH) / 30, SEEK_TO_S], { ...CLAMP, easing: EASINGS.easeOut });
  const shown = frame < SEEK - 1 ? played : frame < SEEK + 5 ? seekSnap : played;
  const frac = Math.min(1, shown / VIDEO_DUR_S);
  if (vis <= 0.01) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, opacity: vis, background: 'linear-gradient(0deg, rgba(0,0,0,0.72), rgba(0,0,0,0))', paddingTop: 40 }}>
      <div style={{ position: 'relative', height: 4, margin: '0 12px', background: 'rgba(255,255,255,0.3)' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, frac * 100 + 6)}%`, background: 'rgba(255,255,255,0.45)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${frac * 100}%`, background: '#f03' }} />
        <div style={{ position: 'absolute', left: `${frac * 100}%`, top: -4.5, width: 13, height: 13, marginLeft: -6.5, borderRadius: 999, background: '#f03' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '10px 16px 12px' }}>
        <Pause size={22} color="#fff" fill="#fff" />
        <SkipForward size={20} color="#fff" fill="#fff" />
        <VolumeX size={21} color="#fff" />
        <span style={{ fontSize: 14.5, color: '#fff', fontFamily: FONT_BODY }}>{fmt(shown)} / 11:33</span>
        <div style={{ flex: 1 }} />
        <Settings size={20} color="#fff" />
        <Maximize size={20} color="#fff" />
      </div>
    </div>
  );
};

const WatchPage: React.FC = () => (
  <div style={{ width: VP.w, height: VP.h, background: '#fff', fontFamily: FONT_BODY, position: 'relative' }}>
    <div style={{ position: 'absolute', left: PLAYER.x, top: PLAYER.y, width: PLAYER.w, height: PLAYER.h, borderRadius: 12, overflow: 'hidden', background: '#000' }}>
      <Sequence from={WATCH} layout="none">
        <OffthreadVideo muted src={lib('projects/video-2/yt-2022/clip-open.mp4')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </Sequence>
      <Sequence from={SEEK} layout="none">
        <OffthreadVideo muted src={lib('projects/video-2/yt-2022/clip-quotes.mp4')} startFrom={QUOTES_STARTFROM} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      </Sequence>
      <PlayerControls />
    </div>
    <div style={{ position: 'absolute', left: PLAYER.x, top: PLAYER.y + PLAYER.h + 16, width: PLAYER.w }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 26, color: '#0f0f0f' }}>
        Write A Blog Post In 10 Minutes With AI 100% Free
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
        <Img src={lib('projects/video-2/yt-2022/avatar.png')} style={{ width: 46, height: 46, borderRadius: 999, objectFit: 'cover' }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 18, color: '#0f0f0f' }}>Hasan Aboul Hasan</div>
          <div style={{ fontSize: 14.5, color: '#606060' }}>1.01M subscribers</div>
        </div>
        <div style={{ marginLeft: 14, background: '#0f0f0f', color: '#fff', fontSize: 16, fontWeight: 600, padding: '9px 18px', borderRadius: 999 }}>Subscribe</div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f2f2f2', borderRadius: 999, padding: '9px 16px' }}>
          <ThumbsUp size={18} color="#0f0f0f" />
          <span style={{ fontSize: 15.5, fontWeight: 600, color: '#0f0f0f' }}>10K</span>
          <div style={{ width: 1, height: 20, background: '#d9d9d9' }} />
          <ThumbsDown size={18} color="#0f0f0f" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f2f2f2', borderRadius: 999, padding: '9px 16px', fontSize: 15.5, fontWeight: 600, color: '#0f0f0f' }}>
          <Share2 size={17} color="#0f0f0f" /> Share
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f2f2f2', borderRadius: 999, padding: '9px 16px', fontSize: 15.5, fontWeight: 600, color: '#0f0f0f' }}>
          <Download size={17} color="#0f0f0f" /> Download
        </div>
        <div style={{ background: '#f2f2f2', borderRadius: 999, padding: 9 }}><MoreHorizontal size={18} color="#0f0f0f" /></div>
      </div>
      <div style={{ marginTop: 14, background: '#f2f2f2', borderRadius: 12, padding: '12px 16px', fontSize: 16, color: '#0f0f0f' }}>
        <span style={{ fontWeight: 600 }}>295K views&nbsp;&nbsp;4 years ago&nbsp;&nbsp;</span>
        <span style={{ color: '#065fd4' }}>#AI&nbsp;#blogging</span>
        <span style={{ color: '#606060' }}>&nbsp;&nbsp;Write a full blog post with AI in 10 minutes, 100% free &nbsp;...more</span>
      </div>
    </div>
    <div style={{ position: 'absolute', left: 1124, top: PLAYER.y, width: 608 }}>
      {SIDEBAR.map((t) => (
        <div key={t.id} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ position: 'relative', width: 256, height: 144, borderRadius: 10, overflow: 'hidden', background: '#e9e9e9', flexShrink: 0 }}>
            <Img src={tileSrc(t)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <span style={{ position: 'absolute', right: 6, bottom: 6, background: 'rgba(0,0,0,0.8)', color: '#fff', fontSize: 12.5, fontWeight: 600, padding: '2px 5px', borderRadius: 4 }}>{t.dur}</span>
          </div>
          <div style={{ paddingTop: 2 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0f0f0f', lineHeight: 1.3, maxHeight: 42, overflow: 'hidden' }}>{t.title}</div>
            <div style={{ fontSize: 13.5, color: '#606060', marginTop: 6 }}>Hasan Aboul Hasan</div>
            <div style={{ fontSize: 13.5, color: '#606060', marginTop: 2 }}>{t.meta}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ---- the shot ---------------------------------------------------------------
const CURSOR: CursorKey[] = [
  { frame: 108, x: 0.55, y: 1.15 },
  { frame: 128, x: 0.58, y: 0.55 },
  { frame: 150, x: 0.6, y: 0.45 },
  { frame: 172, x: 0.32, y: 0.6 },
  { frame: 188, x: 0.173, y: 0.685 },
  { frame: 204, x: 0.173, y: 0.685 },
  { frame: 240, x: 0.6, y: 1.15 },
];

const B2bVideo2022: React.FC = () => {
  const frame = useCurrentFrame();
  const grey = interpolate(frame, [FADE, FADE + 24], [0, 0.85], CLAMP);
  const stampIn = interpolate(frame, [STAMP, STAMP + 9], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });

  // camera push onto the view count (release before the seek)
  const zoom = interpolate(frame, [VIEWS, VIEWS + 18, 415, 438], [1, 1.45, 1.45, 1], { ...CLAMP, easing: EASINGS.easeInOut });
  const dim = interpolate(frame, [VIEWS + 2, VIEWS + 14, 412, 432], [0, 0.55, 0.55, 0], CLAMP);
  const modal = {
    opacity: interpolate(frame, [VIEWS + 6, VIEWS + 16, 408, 420], [0, 1, 1, 0], CLAMP),
    scale: interpolate(frame, [VIEWS + 6, VIEWS + 18], [0.86, 1], { ...CLAMP, easing: EASINGS.overshoot }),
  };

  // quote pills over the dimmed player
  const playerDim = interpolate(frame, [Q1 - 8, Q1 + 4], [0, 0.6], CLAMP);
  const pill = (s: number) => ({
    opacity: interpolate(frame, [s, s + 11], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }),
    transform: `translateY(${interpolate(frame, [s, s + 12], [22, 0], { ...CLAMP, easing: EASINGS.overshoot })}px)`,
  });

  // canvas rect of the player (zoom is back to 1 whenever these overlays show)
  const P = { x: BOX.x + PLAYER.x, y: BOX.y + CHROME_H + PLAYER.y, w: PLAYER.w, h: PLAYER.h };

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      {/* the browser journey (statement covers it until PAGE) */}
      <div style={{ position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '12% 84%', filter: grey > 0 ? `grayscale(${grey}) brightness(${1 - grey * 0.12})` : undefined }}>
        <Screencast
          box={BOX}
          appearAt={PAGE}
          glow={COLORS.accent}
          favicon={<YTFavicon />}
          cursor={CURSOR}
          clicks={[CLICK]}
          pages={[
            {
              node: <ChannelPage />,
              url: 'youtube.com/@hasanaboulhasan/videos',
              tabTitle: 'Hasan Aboul Hasan - YouTube',
              enterAt: PAGE,
              scroll: { from: 0, to: LAND, range: SCROLL },
              drift: 0,
            },
            {
              node: <WatchPage />,
              url: 'youtube.com/watch?v=4ycXC80ZSTg',
              tabTitle: 'Write A Blog Post In 10 Minutes With AI 100% Free - YouTube',
              enterAt: WATCH,
              transition: 'cut',
              drift: 0,
            },
          ]}
        />
      </div>

      {/* full-screen statement — hides me completely on "2022" (P2: page waits for "published") */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: interpolate(frame, [PAGE - 12, PAGE + 2], [1, 0], CLAMP), background: COLORS.paper }}>
        <div style={{ opacity: interpolate(frame, [16, 26], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }), transform: `translateY(${interpolate(frame, [16, 30], [24, 0], { ...CLAMP, easing: EASINGS.easeOut })}px)`, fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 190, color: COLORS.ink }}>2022</div>
        <div style={{ opacity: interpolate(frame, [30, 42], [0, 1], { ...CLAMP, easing: EASINGS.easeOut }), fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 44, color: COLORS.muted, marginTop: 6 }}>one year later</div>
      </AbsoluteFill>

      {/* the view-count moment: dim + zoom modal (round-3 modal spirit) */}
      {dim > 0 && <AbsoluteFill style={{ background: `rgba(12,12,18,${dim})` }} />}
      {modal.opacity > 0 && (
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: modal.opacity }}>
          <div style={{ transform: `scale(${modal.scale})`, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderRadius: RADIUS.panel, boxShadow: SHADOW.card, padding: '44px 76px', textAlign: 'center' }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, letterSpacing: 3, color: COLORS.muted }}>APR&nbsp;20,&nbsp;2022</div>
            <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 96, color: COLORS.ink, marginTop: 16 }}>
              <Marker start={VIEWS + 14} color={`${COLORS.warn}cc`} pad={10} radius={10}>295,604 views</Marker>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* the two lines I said back then — ON TOP of the playing video, dimmed behind */}
      {playerDim > 0 && (
        <div style={{ position: 'absolute', left: P.x, top: P.y, width: P.w, height: P.h, borderRadius: 12, background: `rgba(8,8,14,${playerDim})` }} />
      )}
      <div style={{ position: 'absolute', left: P.x + 72, top: P.y + 128, width: P.w - 144 }}>
        <div style={{ ...pill(Q1), display: 'flex', alignItems: 'center', gap: 22, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderLeft: `7px solid ${COLORS.accent}`, borderRadius: RADIUS.panel, boxShadow: SHADOW.card, padding: '24px 32px' }}>
          <div style={{ width: 62, height: 62, borderRadius: 999, background: `${COLORS.accent}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PenLine size={32} color={COLORS.accent} strokeWidth={2.1} />
          </div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 42, color: COLORS.ink }}>use AI as a writing assistant</span>
        </div>
        <div style={{ ...pill(Q2), display: 'flex', alignItems: 'center', gap: 22, background: COLORS.paper, border: `1px solid ${COLORS.line}`, borderLeft: `7px solid ${COLORS.danger}`, borderRadius: RADIUS.panel, boxShadow: SHADOW.card, padding: '24px 32px', marginTop: 22 }}>
          <div style={{ width: 62, height: 62, borderRadius: 999, background: `${COLORS.danger}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ClipboardX size={32} color={COLORS.danger} strokeWidth={2.1} />
          </div>
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 42, color: COLORS.ink }}>don't just copy and paste</span>
        </div>
      </div>

      {/* AI SLOP — the name we have for it today. Stamps the CONTENT (the player),
          below the two warning pills so the advice stays readable. */}
      <div style={{ position: 'absolute', left: 520, top: 578, opacity: stampIn, transform: `rotate(-8deg) scale(${0.7 + 0.3 * stampIn})` }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 110, letterSpacing: 6, color: COLORS.danger, border: `7px solid ${COLORS.danger}`, borderRadius: 18, padding: '10px 38px', background: `${COLORS.paper}e6` }}>
          AI SLOP
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default B2bVideo2022;
