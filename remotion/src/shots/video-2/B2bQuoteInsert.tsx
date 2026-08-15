import React from 'react';
import { useCurrentFrame, AbsoluteFill, interpolate, OffthreadVideo } from 'remotion';
import { Pause, Volume2, Settings, Maximize, SkipForward } from 'lucide-react';
import { FONT_BODY, FONT_MONO } from '../../fonts';
import { CLAMP, lib } from '../../lib/kit';

// ============================================================================
// B2b INSERT · the real pause (round-7). bake.py type "insert" at master
// 109.7s: the master clock (and the B2bVideo2022 cutaway) FREEZES while the
// actual 2022 video plays full-attention WITH ITS ORIGINAL AUDIO — the two
// verbatim lines at source 575.9s ("must be used as a writing assistant") and
// 579.9s ("not just generate copy and paste"). clip-quotes-audio.mp4 = source
// 568-596s WITH the original audio (round-7 yt-dlp pull; the round-4
// clip-quotes.mp4 was video-only); startFrom 219f -> source 575.3s; 8.7s ->
// source 584.0s. Then the cut resumes and the quote pills land as the recap.
// This shot renders WITH AUDIO (the only one in the project that does).
// ============================================================================
export const compositionConfig = { id: 'B2bQuoteInsert', durationInSeconds: 8.7, fps: 30, width: 1920, height: 1080 };

const SRC_START_S = 575.3; // source time at insert frame 0
const VIDEO_DUR_S = 693; // 11:33

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, '0')}`;

const B2bQuoteInsert: React.FC = () => {
  const frame = useCurrentFrame();
  // slow cinematic push while the source speaks
  const push = interpolate(frame, [0, 261], [1, 1.045]);
  // YouTube-style controls: visible at the cut-in, fade, return for the cut-out
  const vis = Math.max(
    interpolate(frame, [46, 62], [1, 0], CLAMP),
    interpolate(frame, [218, 232], [0, 1], CLAMP),
  );
  const t = SRC_START_S + frame / 30;
  const frac = Math.min(1, t / VIDEO_DUR_S);
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY, background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <OffthreadVideo
          src={lib('projects/video-2/yt-2022/clip-quotes-audio.mp4')}
          startFrom={219}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>
      {vis > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, opacity: vis, background: 'linear-gradient(0deg, rgba(0,0,0,0.72), rgba(0,0,0,0))', paddingTop: 56 }}>
          <div style={{ position: 'relative', height: 5, margin: '0 22px', background: 'rgba(255,255,255,0.3)' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${Math.min(100, frac * 100 + 5)}%`, background: 'rgba(255,255,255,0.45)' }} />
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${frac * 100}%`, background: '#f03' }} />
            <div style={{ position: 'absolute', left: `${frac * 100}%`, top: -5, width: 15, height: 15, marginLeft: -7.5, borderRadius: 999, background: '#f03' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '14px 26px 16px' }}>
            <Pause size={26} color="#fff" fill="#fff" />
            <SkipForward size={24} color="#fff" fill="#fff" />
            {/* sound is ON for this moment — the whole point of the insert */}
            <Volume2 size={25} color="#fff" />
            <span style={{ fontSize: 17, color: '#fff', fontFamily: FONT_MONO }}>{fmt(t)} / 11:33</span>
            <div style={{ flex: 1 }} />
            <Settings size={24} color="#fff" />
            <Maximize size={24} color="#fff" />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export default B2bQuoteInsert;
