import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import {
  ArrowLeft, Bell, Bookmark, ChevronDown, Clock, FileText, Heart, HelpCircle, Home, Inbox,
  LayoutGrid, Mail, Menu, MessageCircle, MoreHorizontal, MoreVertical, Paperclip, Pencil,
  Repeat2, Reply, RotateCw, Search, Send, Settings, Share, Square, Star, Trash2, User, Users,
} from 'lucide-react';
import { Screencast, ScreencastPage, CursorKey } from '../../lib/screencast';

// =============================================================================
// B1 — THE REALISTIC COLD OPEN (v3 / round-2 V1). Master span
// 3.931067 -> 10.864367 (6.9333s = 208f) on the post-V2 clock.
// Replaces the retired variant-B B1ColdOpen (parked in videos/video-1/work/retired/).
//
// Hasan's note: "more like realistic 'my x account' then we zoom into a post on
// it, and open the reply box, the same for gmail." Decided in-session (2026-08-07):
// TSX clones, identity = Hasan Aboul Hasan / @hassancs91, Gmail =
// hasan@learnwithhasan.com. Avatar = the real master still l3-photo.jpg (the
// same honest photo B14L3PhotoWaves uses).
//
// STRUCTURE (variant C): he stays ON CAMERA through "I'm super excited to show
// you what I built this week." (the first "Look at this." was removed by the V2
// splice). This shot covers exactly "Let's say I want to build an AI agent that
// can reply to my X posts or maybe my emails." and ends before "this example."
// so the pivot back to his face carries "Look at this example." into
// B1ReplyCompare at 12.032167.
//
// CONTINUITY: the X pages feature THE SAME Startup Notes post (identical copy
// and metrics) that B1ReplyCompare replies to — the cold open plants the post,
// the compare beat pays it off. Real third-party UI keeps its own hex (X true
// black, Gmail palette), NOT the brand indigo (house rule).
//
// local frame = round((master - 3.931067) * 30). Cues (post-V2 clock):
//   "Let's say"        3.917  f0    X home feed up, drift
//   "an AI agent"      5.521  f48   cursor easing toward the post
//   zoom into the post        f56-84  ken-burns, focal = the post card
//   click the post            f82   -> HARD CUT to post detail f85
//   "reply"            6.981  f91   cursor heads for the reply field
//   click the field           f110  -> crossfade: reply box open + caret f111
//   "my X posts"       7.623  f111-140  the open reply box IS the payoff
//   "or"               8.955  f150  HARD CUT to Gmail inbox (new tab identity)
//   click the top mail        f166  -> HARD CUT to the opened mail f169
//   click Reply               f182  -> crossfade: compose open + caret f185
//   "emails."          9.917  f180-191  the open compose IS the payoff
//   "Look"            10.655  f202  box holds; he pivots on camera after f208
//
// Built on lib/screencast.tsx, which learned two things for this shot (both
// promoted to the lib, backward compatible): DOM `node` pages (TSX clones
// instead of screenshots) and per-page favicons (multi-site walkthroughs).
// =============================================================================
export const compositionConfig = { id: 'B1ColdOpenReal', durationInSeconds: 6.9333, fps: 30, width: 1920, height: 1080 };

const AVATAR = 'projects/video-1/l3-photo.jpg';

// ---- X (true product hex, dark) ---------------------------------------------
const XC = { bg: '#000000', line: '#2f3336', text: '#e7e9ea', dim: '#71767b', blue: '#1d9bf0', violet: '#7856ff', hover: '#080808' } as const;

const XFav: React.FC = () => (
  <div style={{ width: 18, height: 18, borderRadius: 4, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900 }}>X</div>
);

const Ava: React.FC<{ size: number }> = ({ size }) => (
  <Img src={staticFile(AVATAR)} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
);

const SnAva: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: XC.violet, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.38 }}>SN</div>
);

/** tiny views bar-chart glyph (lucide's name for it varies across versions) */
const Bars: React.FC<{ size?: number; color?: string }> = ({ size = 19, color = XC.dim }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <path d="M6 20V10M12 20V4M18 20v-6" />
  </svg>
);

const Caret: React.FC<{ h?: number; color?: string }> = ({ h = 26, color = XC.text }) => {
  const f = useCurrentFrame();
  return <span style={{ display: 'inline-block', width: 2, height: h, background: color, opacity: Math.floor(f / 14) % 2 === 0 ? 1 : 0, verticalAlign: 'middle' }} />;
};

const POST_TEXT = 'Self hosting sounds cheap until it breaks at 3am. Managed cloud costs more, but at least you sleep. Change my mind.';

const XMetric: React.FC<{ icon: React.ReactNode; n: string }> = ({ icon, n }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: XC.dim, fontSize: 15 }}>{icon}{n}</div>
);

const XShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', inset: 0, background: XC.bg, color: XC.text, display: 'flex' }}>
    <div style={{ width: 300, borderRight: `1px solid ${XC.line}`, padding: '10px 22px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: 34, fontWeight: 900, padding: '4px 10px 10px' }}>X</div>
      {([['Home', <Home key="i" size={26} strokeWidth={2.6} />, true], ['Explore', <Search key="i" size={26} />, false], ['Notifications', <Bell key="i" size={26} />, false], ['Messages', <Mail key="i" size={26} />, false], ['Communities', <Users key="i" size={26} />, false], ['Profile', <User key="i" size={26} />, false], ['More', <MoreHorizontal key="i" size={26} />, false]] as const).map(([label, icon, active]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '9px 10px', fontSize: 21, fontWeight: active ? 800 : 400 }}>
          {icon}{label}
        </div>
      ))}
      <div style={{ width: 210, height: 50, borderRadius: 999, background: '#eff3f4', color: '#0f1419', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, marginTop: 14 }}>Post</div>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px' }}>
        <Ava size={44} />
        <div style={{ flex: 1, lineHeight: 1.25 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Hasan Aboul Hasan</div>
          <div style={{ fontSize: 15, color: XC.dim }}>@hassancs91</div>
        </div>
        <MoreHorizontal size={18} color={XC.dim} />
      </div>
    </div>
    <div style={{ width: 820, borderRight: `1px solid ${XC.line}` }}>{children}</div>
    <div style={{ flex: 1, padding: '10px 28px' }}>
      <div style={{ height: 46, borderRadius: 999, background: '#202327', display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', color: XC.dim, fontSize: 16 }}>
        <Search size={17} />Search
      </div>
      <div style={{ marginTop: 18, borderRadius: 16, background: '#16181c', padding: '14px 18px' }}>
        <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 12 }}>What&#8217;s happening</div>
        {[['Technology · Trending', 'Self hosting', '18.4K posts'], ['AI · Trending', 'Claude Code', '52.1K posts'], ['Trending in DevOps', 'Coolify', '4,318 posts']].map(([k, t, n]) => (
          <div key={t} style={{ padding: '9px 0', lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, color: XC.dim }}>{k}</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{t}</div>
            <div style={{ fontSize: 13, color: XC.dim }}>{n}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const XHome: React.FC = () => (
  <XShell>
    <div style={{ display: 'flex', height: 54, borderBottom: `1px solid ${XC.line}` }}>
      {(['For you', 'Following'] as const).map((t, i) => (
        <div key={t} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 17, fontWeight: i === 0 ? 800 : 500, color: i === 0 ? XC.text : XC.dim }}>
          {t}
          {i === 0 && <div style={{ position: 'absolute', bottom: 0, width: 62, height: 4, borderRadius: 2, background: XC.blue }} />}
        </div>
      ))}
    </div>
    {/* the post the whole video replies to — same copy + metrics as B1ReplyCompare */}
    <div style={{ display: 'flex', gap: 14, padding: '16px 20px', borderBottom: `1px solid ${XC.line}`, background: XC.hover }}>
      <SnAva size={48} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 17 }}>
          <span style={{ fontWeight: 800 }}>Startup Notes</span>
          <span style={{ color: XC.dim }}>@startupnotes · 2h</span>
          <MoreHorizontal size={17} color={XC.dim} style={{ marginLeft: 'auto' }} />
        </div>
        <div style={{ fontSize: 21, lineHeight: 1.4, marginTop: 5, maxWidth: 660 }}>{POST_TEXT}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 560, marginTop: 14 }}>
          <XMetric icon={<MessageCircle size={19} color={XC.dim} />} n="412" />
          <XMetric icon={<Repeat2 size={19} color={XC.dim} />} n="96" />
          <XMetric icon={<Heart size={19} color={XC.dim} />} n="1.8K" />
          <XMetric icon={<Bars />} n="74K" />
          <Bookmark size={19} color={XC.dim} />
        </div>
      </div>
    </div>
    <div style={{ display: 'flex', gap: 14, padding: '16px 20px', opacity: 0.75 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1d3a52', color: '#8ecdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>TB</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 7, fontSize: 17 }}>
          <span style={{ fontWeight: 800 }}>TechBrief</span>
          <span style={{ color: XC.dim }}>@techbrief · 4h</span>
        </div>
        <div style={{ fontSize: 21, lineHeight: 1.4, marginTop: 5, maxWidth: 660 }}>Serverless pricing changes again next month. Thread with the numbers:</div>
      </div>
    </div>
  </XShell>
);

const XDetail: React.FC<{ replyOpen?: boolean }> = ({ replyOpen = false }) => (
  <XShell>
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: 56, padding: '0 18px', borderBottom: `1px solid ${XC.line}` }}>
      <ArrowLeft size={22} />
      <span style={{ fontSize: 21, fontWeight: 800 }}>Post</span>
    </div>
    <div style={{ padding: '16px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SnAva size={48} />
        <div style={{ lineHeight: 1.25, flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>Startup Notes</div>
          <div style={{ fontSize: 16, color: XC.dim }}>@startupnotes</div>
        </div>
        <MoreHorizontal size={18} color={XC.dim} />
      </div>
      <div style={{ fontSize: 25, lineHeight: 1.45, marginTop: 16 }}>{POST_TEXT}</div>
      <div style={{ fontSize: 16, color: XC.dim, marginTop: 16 }}>9:41 AM · Aug 6, 2026 · <span style={{ color: XC.text, fontWeight: 700 }}>74K</span> Views</div>
      <div style={{ borderTop: `1px solid ${XC.line}`, marginTop: 14, paddingTop: 12, display: 'flex', gap: 22, fontSize: 15, color: XC.dim }}>
        <span><b style={{ color: XC.text }}>96</b> Reposts</span>
        <span><b style={{ color: XC.text }}>412</b> Quotes</span>
        <span><b style={{ color: XC.text }}>1.8K</b> Likes</span>
        <span><b style={{ color: XC.text }}>231</b> Bookmarks</span>
      </div>
      <div style={{ borderTop: `1px solid ${XC.line}`, borderBottom: `1px solid ${XC.line}`, marginTop: 12, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-around', maxWidth: 720 }}>
        <MessageCircle size={21} color={XC.dim} />
        <Repeat2 size={21} color={XC.dim} />
        <Heart size={21} color={XC.dim} />
        <Bookmark size={21} color={XC.dim} />
        <Share size={21} color={XC.dim} />
      </div>
      {/* the reply row — the whole point of the beat */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, alignItems: replyOpen ? 'flex-start' : 'center' }}>
        <Ava size={44} />
        {replyOpen ? (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 23, minHeight: 74, paddingTop: 6 }}>
              <Caret h={28} /><span style={{ color: XC.dim, marginLeft: 2 }}>Post your reply</span>
            </div>
            <div style={{ borderTop: `1px solid ${XC.line}`, paddingTop: 10, display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 18, height: 18, borderRadius: 4, border: `1.6px solid ${XC.blue}66` }} />)}
              </div>
              <div style={{ marginLeft: 'auto', background: XC.blue, color: '#fff', fontWeight: 800, fontSize: 16, borderRadius: 999, padding: '9px 22px' }}>Reply</div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, fontSize: 22, color: XC.dim }}>Post your reply</div>
            <div style={{ background: XC.blue, color: '#fff', fontWeight: 800, fontSize: 16, borderRadius: 999, padding: '9px 22px', opacity: 0.5 }}>Reply</div>
          </>
        )}
      </div>
    </div>
  </XShell>
);

// ---- Gmail (true product palette, light) ------------------------------------
const GC = { bar: '#f6f8fc', sel: '#d3e3fd', comp: '#c2e7ff', text: '#1f1f1f', dim: '#5f6368', blue: '#0b57d0', search: '#eaf1fb', line: '#e8eaed' } as const;

const GmailFav: React.FC = () => (
  <svg width={18} height={14} viewBox="0 0 24 18">
    <path fill="#4285f4" d="M1.6 18h3.6V8.2L0 4v12.4C0 17.3.7 18 1.6 18z" />
    <path fill="#34a853" d="M18.8 18h3.6c.9 0 1.6-.7 1.6-1.6V4l-5.2 4.2z" />
    <path fill="#fbbc04" d="M18.8 1.8v6.4L24 4V2.6c0-2-2.3-3.1-3.9-1.9z" />
    <path fill="#ea4335" d="M5.2 8.2V1.8L12 7.3l6.8-5.5v6.4L12 13.7z" />
    <path fill="#c5221f" d="M0 2.6V4l5.2 4.2V1.8L3.9.7C2.3-.5 0 .6 0 2.6z" />
  </svg>
);

const GRow: React.FC<{ sender: string; subject: string; snippet: string; time: string; unread?: boolean; hover?: boolean }> =
  ({ sender, subject, snippet, time, unread = false, hover = false }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 46, padding: '0 16px', borderBottom: `1px solid #f1f3f4`, background: hover ? '#f2f6fc' : '#fff', boxShadow: hover ? 'inset 0 0 0 1px #dadce0' : 'none' }}>
      <Square size={16} color="#b9bdc4" />
      <Star size={16} color="#b9bdc4" />
      <div style={{ width: 190, fontSize: 15, fontWeight: unread ? 700 : 400, color: unread ? GC.text : GC.dim, whiteSpace: 'nowrap', overflow: 'hidden' }}>{sender}</div>
      <div style={{ flex: 1, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: GC.dim }}>
        <span style={{ fontWeight: unread ? 700 : 400, color: unread ? GC.text : GC.dim }}>{subject}</span>
        <span> - {snippet}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: unread ? 700 : 400, color: unread ? GC.text : GC.dim }}>{time}</div>
    </div>
  );

const GmailShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: 'absolute', inset: 0, background: GC.bar, color: GC.text }}>
    <div style={{ height: 66, display: 'flex', alignItems: 'center', gap: 20, padding: '0 20px' }}>
      <Menu size={24} color={GC.dim} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <GmailFav />
        <span style={{ fontSize: 24, color: GC.dim }}>Gmail</span>
      </div>
      <div style={{ width: 640, height: 48, borderRadius: 24, background: GC.search, display: 'flex', alignItems: 'center', gap: 14, padding: '0 20px', marginLeft: 40, color: GC.dim, fontSize: 16 }}>
        <Search size={20} />Search mail
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20, color: GC.dim }}>
        <HelpCircle size={22} />
        <Settings size={22} />
        <LayoutGrid size={22} />
        <Ava size={36} />
      </div>
    </div>
    <div style={{ display: 'flex', height: 786 }}>
      <div style={{ width: 240, padding: '8px 12px 0 16px' }}>
        <div style={{ width: 148, height: 54, borderRadius: 16, background: GC.comp, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', fontSize: 15, fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
          <Pencil size={18} />Compose
        </div>
        <div style={{ marginTop: 16 }}>
          {([['Inbox', <Inbox key="i" size={17} />, '1,024', true], ['Starred', <Star key="i" size={17} />, '', false], ['Snoozed', <Clock key="i" size={17} />, '', false], ['Sent', <Send key="i" size={17} />, '', false], ['Drafts', <FileText key="i" size={17} />, '6', false]] as const).map(([label, icon, n, sel]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, height: 34, padding: '0 12px 0 14px', borderRadius: 17, background: sel ? GC.sel : 'transparent', fontSize: 14.5, fontWeight: sel ? 700 : 400, color: GC.text }}>
              {icon}<span style={{ flex: 1 }}>{label}</span><span style={{ fontSize: 12.5 }}>{n}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, height: 34, padding: '0 14px', fontSize: 14.5, color: GC.dim }}>
            <ChevronDown size={17} />More
          </div>
        </div>
      </div>
      <div style={{ flex: 1, margin: '0 16px 16px 6px', background: '#fff', borderRadius: 16, overflow: 'hidden' }}>{children}</div>
    </div>
  </div>
);

const GmailInbox: React.FC = () => (
  <GmailShell>
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, height: 50, padding: '0 18px', color: GC.dim }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><Square size={17} /><ChevronDown size={13} /></span>
      <RotateCw size={17} />
      <MoreVertical size={17} />
      <span style={{ marginLeft: 'auto', fontSize: 13 }}>1-50 of 1,024</span>
    </div>
    <div style={{ display: 'flex', borderBottom: `1px solid ${GC.line}` }}>
      {(['Primary', 'Promotions', 'Social'] as const).map((t, i) => (
        <div key={t} style={{ width: 200, height: 48, display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 18, position: 'relative', fontSize: 14.5, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? GC.blue : GC.dim }}>
          {i === 0 ? <Inbox size={17} /> : i === 1 ? <Trash2 size={17} style={{ visibility: 'hidden' }} /> : <Users size={17} />}
          {t}
          {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 12, right: 60, height: 3, borderRadius: 2, background: GC.blue }} />}
        </div>
      ))}
    </div>
    <GRow hover unread sender="Alex Carter" subject="Podcast invite: would love to have you on" snippet="Hey Hasan, big fan of the channel. We are lining up guests for next month and your self hosting" time="9:14 AM" />
    <GRow sender="GitHub" subject="[hassancs91/brainoutside] New star" snippet="Your repository brainoutside was starred" time="8:47 AM" />
    <GRow sender="Contabo" subject="Your VPS invoice is ready" snippet="Invoice CB-2026-0807 for Cloud VPS 10 is now available in your customer panel" time="7:32 AM" />
    <GRow sender="Product Hunt Daily" subject="Today&#39;s top launches" snippet="A self hosted analytics dashboard, an AI code reviewer, and more from today" time="6:15 AM" />
    <GRow sender="YouTube Creators" subject="Your July channel report" snippet="Watch time is up 14% from last month. See what worked and what to try next" time="Aug 6" />
  </GmailShell>
);

const GmailMail: React.FC<{ composeOpen?: boolean }> = ({ composeOpen = false }) => (
  <GmailShell>
    <div style={{ padding: '26px 54px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 28 }}>Podcast invite: would love to have you on</span>
        <span style={{ fontSize: 12, color: GC.dim, background: '#f1f3f4', borderRadius: 4, padding: '3px 8px' }}>Inbox</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 26 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#673ab7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, fontWeight: 600 }}>A</div>
        <div style={{ lineHeight: 1.35, flex: 1 }}>
          <div style={{ fontSize: 15.5 }}><b>Alex Carter</b> <span style={{ color: GC.dim }}>&lt;alex@cartermedia.co&gt;</span></div>
          <div style={{ fontSize: 13, color: GC.dim, display: 'flex', alignItems: 'center', gap: 4 }}>to hasan@learnwithhasan.com <ChevronDown size={13} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: GC.dim, fontSize: 13 }}>
          9:14 AM (2 hours ago)
          <Star size={18} />
          <Reply size={18} />
          <MoreVertical size={18} />
        </div>
      </div>
      <div style={{ fontSize: 16.5, lineHeight: 1.65, marginTop: 26, maxWidth: 860, color: '#202124' }}>
        <p style={{ margin: 0 }}>Hey Hasan,</p>
        <p>Big fan of the channel. We are lining up guests for next month and your self hosting series would be a perfect fit for our audience.</p>
        <p>Would a 45 minute recording some time next week work for you?</p>
        <p style={{ margin: 0 }}>Best,<br />Alex</p>
      </div>
      {composeOpen ? (
        <div style={{ marginTop: 28, maxWidth: 860, border: `1px solid #dadce0`, borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.12)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Reply size={16} color={GC.dim} />
            <span style={{ background: '#f1f3f4', borderRadius: 999, padding: '4px 14px', fontSize: 14 }}>Alex Carter</span>
          </div>
          <div style={{ marginTop: 18, minHeight: 64, fontSize: 16 }}>
            <Caret h={22} color="#1f1f1f" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 8 }}>
            <div style={{ background: GC.blue, color: '#fff', fontWeight: 600, fontSize: 15, borderRadius: 999, padding: '10px 26px' }}>Send</div>
            <Paperclip size={18} color={GC.dim} />
            <Pencil size={18} color={GC.dim} />
            <Trash2 size={18} color={GC.dim} style={{ marginLeft: 'auto' }} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 14, marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #747775', borderRadius: 999, padding: '9px 24px', fontSize: 14.5, fontWeight: 500 }}>
            <Reply size={16} />Reply
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #747775', borderRadius: 999, padding: '9px 24px', fontSize: 14.5, fontWeight: 500 }}>
            <Share size={16} />Forward
          </div>
        </div>
      )}
    </div>
  </GmailShell>
);

// ---- the walkthrough ---------------------------------------------------------
const X_URL = 'x.com/startupnotes/status/1953117428554901';
const G_URL = 'mail.google.com/mail/u/0/#inbox';
const G_MAIL_URL = 'mail.google.com/mail/u/0/#inbox/FMfcgzQXKrRlpVjxwmCl';

const PAGES: ScreencastPage[] = [
  { node: <XHome />, url: 'x.com/home', tabTitle: 'Home / X', favicon: <XFav />, enterAt: 0,
    zoom: { from: 1.0, to: 1.32, fx: 0.345, fy: 0.21, range: [56, 84] } },
  { node: <XDetail />, url: X_URL, tabTitle: 'Startup Notes on X', favicon: <XFav />, enterAt: 85 },
  { node: <XDetail replyOpen />, url: X_URL, tabTitle: 'Startup Notes on X', favicon: <XFav />, enterAt: 111, transition: 'crossfade' },
  { node: <GmailInbox />, url: G_URL, tabTitle: 'Inbox (1,024) - hasan@learnwithhasan.com', favicon: <GmailFav />, enterAt: 150,
    zoom: { from: 1.0, to: 1.12, fx: 0.39, fy: 0.24, range: [152, 166] } },
  { node: <GmailMail />, url: G_MAIL_URL, tabTitle: 'Podcast invite: would love to have you on', favicon: <GmailFav />, enterAt: 169 },
  { node: <GmailMail composeOpen />, url: G_MAIL_URL, tabTitle: 'Podcast invite: would love to have you on', favicon: <GmailFav />, enterAt: 185, transition: 'crossfade' },
];

const CURSOR: CursorKey[] = [
  { frame: 0, x: 0.62, y: 0.55 },
  { frame: 30, x: 0.55, y: 0.40 },
  { frame: 78, x: 0.345, y: 0.21 },   // the Startup Notes post
  { frame: 94, x: 0.345, y: 0.21 },
  { frame: 108, x: 0.48, y: 0.63 },   // the reply field on the detail page
  { frame: 128, x: 0.51, y: 0.655 },
  { frame: 150, x: 0.51, y: 0.655 },
  { frame: 164, x: 0.39, y: 0.225 },  // the unread podcast mail row
  { frame: 172, x: 0.39, y: 0.225 },
  { frame: 180, x: 0.31, y: 0.80 },   // the Reply pill under the mail
  { frame: 196, x: 0.335, y: 0.70 },  // settle into the compose box
  { frame: 207, x: 0.335, y: 0.70 },
];

const CLICKS = [82, 110, 166, 182];

const B1ColdOpenReal: React.FC = () => (
  // appearAt=-30: the hard cut from the talking head must land on a browser that is
  // already fully up — an entrance animation here would read as a blank first frame.
  <Screencast pages={PAGES} cursor={CURSOR} clicks={CLICKS} favicon={<XFav />} appearAt={-30} />
);

export default B1ColdOpenReal;
