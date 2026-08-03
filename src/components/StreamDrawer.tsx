import React, { useState } from 'react';
import { StreamLocation } from '../types';
import { STREAM_LOCATIONS } from '../data/streams';
import { X, Play, Plus, Compass, Sparkles, MapPin, Check, Code } from 'lucide-react';

interface StreamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentStream: StreamLocation;
  onSelectStream: (stream: StreamLocation) => void;
}

export const StreamDrawer: React.FC<StreamDrawerProps> = ({
  isOpen,
  onClose,
  currentStream,
  onSelectStream,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [customError, setCustomError] = useState('');
  const [showSingleHtmlModal, setShowSingleHtmlModal] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    let videoId = customInput.trim();
    if (!videoId) return;

    // Parse YouTube URLs if pasted
    if (videoId.includes('youtube.com/watch?v=')) {
      const match = videoId.match(/v=([^&]+)/);
      if (match) videoId = match[1];
    } else if (videoId.includes('youtu.be/')) {
      const match = videoId.match(/youtu\.be\/([^?]+)/);
      if (match) videoId = match[1];
    } else if (videoId.includes('youtube.com/live/')) {
      const match = videoId.match(/live\/([^?]+)/);
      if (match) videoId = match[1];
    }

    if (videoId.length < 5) {
      setCustomError('Invalid YouTube Live Video ID or URL.');
      return;
    }

    const customStream: StreamLocation = {
      id: videoId,
      title: 'Custom Stream',
      location: 'Custom Location',
      country: 'World',
      flag: '🌐',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      category: 'urban',
      atmosphere: 'User Stream View',
      description: 'Custom YouTube Live Stream input by user.',
    };

    onSelectStream(customStream);
    setCustomInput('');
    onClose();
  };

  const generateSingleHtmlContent = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Window to the World - Zen Ambient Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .bg-radial-vignette {
      background: radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.85) 100%);
    }
  </style>
</head>
<body class="bg-black text-white font-sans overflow-hidden select-none">
  <div id="bg-youtube-player" class="fixed inset-0 w-full h-full pointer-events-none"></div>
  <div class="fixed inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40 pointer-events-none"></div>

  <!-- Glass UI Overlay -->
  <div id="ui-overlay" class="fixed inset-0 p-6 flex flex-col justify-between pointer-events-auto transition-opacity duration-700">
    <div class="flex flex-col gap-2">
      <div class="p-4 rounded-2xl bg-black/40 border border-white/15 backdrop-blur-2xl max-w-sm">
        <h1 id="loc-title" class="text-xl font-bold">Shibuya Crossing</h1>
        <p id="loc-sub" class="text-xs text-white/70">Shibuya, Tokyo, Japan</p>
      </div>
    </div>

    <div class="flex justify-center pb-4">
      <button id="teleport-btn" class="px-6 py-3 rounded-full bg-white text-black font-extrabold uppercase tracking-wider backdrop-blur-xl border border-white/20 shadow-2xl transition-all hover:scale-105">
        Teleport
      </button>
    </div>
  </div>

  <script src="https://www.youtube.com/iframe_api"></script>
  <script>
    const STREAMS = ${JSON.stringify(STREAM_LOCATIONS, null, 2)};
    let player, currentIndex = 0, timer;

    function onYouTubeIframeAPIReady() {
      player = new YT.Player('bg-youtube-player', {
        videoId: STREAMS[0].id,
        playerVars: { autoplay: 1, controls: 0, mute: 1, loop: 1, playsinline: 1 }
      });
    }

    document.getElementById('teleport-btn').addEventListener('click', () => {
      let nextIndex;
      do { nextIndex = Math.floor(Math.random() * STREAMS.length); } while (nextIndex === currentIndex);
      currentIndex = nextIndex;
      const s = STREAMS[currentIndex];
      player.loadVideoById(s.id);
      document.getElementById('loc-title').innerText = s.title;
      document.getElementById('loc-sub').innerText = s.location + ', ' + s.country;
    });

    function resetTimer() {
      document.getElementById('ui-overlay').style.opacity = '1';
      clearTimeout(timer);
      timer = setTimeout(() => {
        document.getElementById('ui-overlay').style.opacity = '0';
      }, 5000);
    }
    window.addEventListener('mousemove', resetTimer);
    resetTimer();
  </script>
</body>
</html>`;
  };

  const handleCopySingleHtml = () => {
    navigator.clipboard.writeText(generateSingleHtmlContent());
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-[36px] bg-white/12 border border-white/25 backdrop-blur-[45px] text-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] p-6 sm:p-8 flex flex-col gap-6 transition-all duration-500 hover:scale-[1.008] hover:backdrop-blur-[55px] hover:border-white/35">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-white">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/50 font-medium">Global Portal Catalog</span>
              <h2 className="text-xl sm:text-2xl font-light italic tracking-tight text-white/95">
                Window Destinations
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSingleHtmlModal(!showSingleHtmlModal)}
              title="Get Standalone Single index.html File"
              className="px-3.5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all text-white/80 cursor-pointer"
            >
              <Code className="w-4 h-4 text-white/80" />
              <span className="hidden sm:inline">Single index.html</span>
            </button>

            <button
              onClick={onClose}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-colors text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Export Single HTML Code View if requested */}
        {showSingleHtmlModal && (
          <div className="p-5 rounded-3xl bg-white/10 border border-white/15 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white">
                Standalone Single `index.html` Output
              </span>
              <button
                onClick={handleCopySingleHtml}
                className="px-4 py-2 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 hover:bg-white/90 transition-colors cursor-pointer"
              >
                {copiedHtml ? <Check className="w-3.5 h-3.5 text-black" /> : null}
                <span>{copiedHtml ? 'Copied to Clipboard!' : 'Copy index.html Code'}</span>
              </button>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Copy this single-file code containing HTML, Tailwind CDN, and YouTube JavaScript logic to run "Window to the World" standalone in any browser!
            </p>
          </div>
        )}

        {/* 10 Curated Streams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STREAM_LOCATIONS.map((stream) => {
            const isActive = stream.id === currentStream.id;
            return (
              <button
                key={stream.id}
                onClick={() => {
                  onSelectStream(stream);
                  onClose();
                }}
                className={`p-5 rounded-[28px] text-left border backdrop-blur-xl transition-all duration-300 flex flex-col justify-between gap-3 group cursor-pointer relative overflow-hidden hover:scale-[1.03] hover:backdrop-blur-2xl ${
                  isActive
                    ? 'bg-white/20 border-white/40 text-white shadow-xl ring-1 ring-white/30'
                    : 'bg-white/10 border-white/15 hover:bg-white/20 hover:border-white/30 text-white'
                }`}
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-white text-black text-[9px] font-extrabold uppercase tracking-[0.2em] flex items-center gap-1 shadow-md">
                    <Check className="w-3 h-3 text-black" />
                    <span>Viewing</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stream.flag}</span>
                    <h3 className="font-light italic text-base tracking-tight group-hover:text-white transition-colors">
                      {stream.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-white/60 shrink-0" />
                    <span>{stream.location}, {stream.country}</span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
                  <span className="truncate italic flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-white/50 shrink-0" />
                    {stream.atmosphere}
                  </span>
                  <Play className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom YouTube Stream Input */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
          <label className="text-[11px] font-semibold text-white/70 uppercase tracking-[0.2em] flex items-center gap-2">
            <Plus className="w-4 h-4 text-white/80" />
            Add Custom Stream or Video
          </label>
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              placeholder="Paste YouTube Live Stream URL or Video ID (e.g. d13S5M1aZbc)"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/15 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-white/90 transition-colors cursor-pointer"
            >
              Load
            </button>
          </form>
          {customError && <span className="text-xs text-rose-400 font-medium px-2">{customError}</span>}
        </div>
      </div>
    </div>
  );
};
