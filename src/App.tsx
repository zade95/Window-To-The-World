import React, { useState, useEffect, useRef, useCallback } from 'react';
import { STREAM_LOCATIONS } from './data/streams';
import { StreamLocation, SoundState } from './types';
import { BackgroundVideo } from './components/BackgroundVideo';
import { LofiPlayer } from './components/LofiPlayer';
import { AmbientSoundscape } from './components/AmbientSoundscape';
import { LocationCard } from './components/LocationCard';
import { ControlBar } from './components/ControlBar';
import { StreamDrawer } from './components/StreamDrawer';
import { LandingOverlay } from './components/LandingOverlay';
import { Sparkles, Eye, Globe } from 'lucide-react';

export default function App() {
  const [currentStreamIndex, setCurrentStreamIndex] = useState<number>(0);
  const [isLandingOpen, setIsLandingOpen] = useState<boolean>(true);
  const [isUiVisible, setIsUiVisible] = useState<boolean>(true);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [teleportEffect, setTeleportEffect] = useState<boolean>(false);
  const [bgMode, setBgMode] = useState<'video' | 'photo'>('video');

  const [soundState, setSoundState] = useState<SoundState>({
    streamVolume: 80,
    streamMuted: true, // Started muted for compliance
    lofiVolume: 40,
    lofiMuted: false,
    lofiPlaying: false,
    ambientType: 'none',
    ambientVolume: 35,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStream = STREAM_LOCATIONS[currentStreamIndex];

  // Auto-hide UI inactivity timer (5 seconds)
  const resetInactivityTimer = useCallback(() => {
    setIsUiVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!isPinned && !isLandingOpen && !isDrawerOpen) {
      timerRef.current = setTimeout(() => {
        setIsUiVisible(false);
      }, 5000);
    }
  }, [isPinned, isLandingOpen, isDrawerOpen]);

  useEffect(() => {
    resetInactivityTimer();

    const handleActivity = () => {
      resetInactivityTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [resetInactivityTimer]);

  // Keyboard Shortcuts: Space to Teleport, M to Mute, L for Lofi, F for Fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTeleport();
      } else if (e.key.toLowerCase() === 'm') {
        setSoundState((prev) => ({ ...prev, streamMuted: !prev.streamMuted }));
      } else if (e.key.toLowerCase() === 'l') {
        setSoundState((prev) => ({ ...prev, lofiPlaying: !prev.lofiPlaying }));
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStreamIndex]);

  // Teleport Logic: Pick a random stream without repeating the current one
  const handleTeleport = () => {
    setTeleportEffect(true);
    setTimeout(() => setTeleportEffect(false), 800);

    let nextIndex = currentStreamIndex;
    if (STREAM_LOCATIONS.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * STREAM_LOCATIONS.length);
      } while (nextIndex === currentStreamIndex);
    }

    setCurrentStreamIndex(nextIndex);
  };

  const handleSelectStream = (stream: StreamLocation) => {
    const foundIndex = STREAM_LOCATIONS.findIndex((s) => s.id === stream.id);
    if (foundIndex !== -1) {
      setCurrentStreamIndex(foundIndex);
    } else {
      STREAM_LOCATIONS.unshift(stream);
      setCurrentStreamIndex(0);
    }
  };

  const handleStartLanding = (stream?: StreamLocation) => {
    if (stream) {
      handleSelectStream(stream);
    }
    // Enable audio on explicit click
    setSoundState((prev) => ({ ...prev, streamMuted: false }));
    setIsLandingOpen(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans text-white">
      {/* 1. Full-Screen YouTube Background Stream / Photo Compilation */}
      <BackgroundVideo
        currentStream={currentStream}
        volume={soundState.streamVolume}
        isMuted={soundState.streamMuted}
        onErrorFallback={handleTeleport}
        bgMode={bgMode}
      />

      {/* 2. Background Lofi Stream Player */}
      <LofiPlayer
        isPlaying={soundState.lofiPlaying}
        volume={soundState.lofiVolume}
        isMuted={soundState.lofiMuted}
      />

      {/* 3. Synthesized Zen Ambient Soundscape */}
      <AmbientSoundscape
        type={soundState.ambientType}
        volume={soundState.ambientVolume}
      />

      {/* 4. Landing / Intro Overlay Modal */}
      {isLandingOpen && (
        <LandingOverlay onStart={handleStartLanding} />
      )}

      {/* 5. Middle Interaction Shield (Clicking anywhere reveals UI if hidden) */}
      <div
        onClick={() => setIsUiVisible(true)}
        className="absolute inset-0 z-10 cursor-pointer"
        title={!isUiVisible ? 'Click anywhere to reveal interface' : undefined}
      />

      {/* 6. Teleport Flash / Warp Effect Layer */}
      {teleportEffect && (
        <div className="fixed inset-0 z-40 bg-white/10 backdrop-blur-3xl transition-opacity duration-700 pointer-events-none flex items-center justify-center">
          <div className="px-6 py-4 rounded-3xl bg-black/70 border border-white/20 backdrop-blur-2xl flex items-center gap-3 text-white font-bold tracking-widest uppercase animate-pulse">
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" />
            <span>Teleporting across the globe...</span>
          </div>
        </div>
      )}

      {/* 7. Glassmorphic UI Overlay Layer (Auto-fades after 5 seconds of inactivity) */}
      <div
        className={`fixed inset-0 z-20 p-6 sm:p-8 flex flex-col justify-between pointer-events-none transition-all duration-700 ease-in-out ${
          isUiVisible && !isLandingOpen
            ? 'opacity-100 scale-100 blur-0'
            : 'opacity-0 scale-[0.98] blur-xs'
        }`}
      >
        {/* Top Header Row: Location Card + Quick Navigation */}
        <div className="pointer-events-auto flex items-start justify-between">
          <LocationCard
            stream={currentStream}
            streamIndex={currentStreamIndex}
            totalStreams={STREAM_LOCATIONS.length}
            onOpenGallery={() => setIsDrawerOpen(true)}
            onTeleport={handleTeleport}
          />

          <div className="flex items-center gap-2">
            {/* Quick Unmute hint if muted */}
            {soundState.streamMuted && (
              <button
                onClick={() => setSoundState((prev) => ({ ...prev, streamMuted: false }))}
                className="px-3.5 py-2.5 rounded-full bg-white/12 hover:bg-white/22 border border-white/20 hover:border-white/35 backdrop-blur-xl hover:backdrop-blur-2xl text-xs font-semibold text-white transition-all duration-300 hover:scale-105 flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span>Unmute Audio</span>
              </button>
            )}

            {/* Re-open Intro Portal Button */}
            <button
              onClick={() => setIsLandingOpen(true)}
              title="Open Start Window & Catalog"
              className="px-3.5 py-2.5 rounded-full bg-white/12 hover:bg-white/22 border border-white/20 hover:border-white/35 backdrop-blur-xl hover:backdrop-blur-2xl text-xs font-semibold text-white transition-all duration-300 hover:scale-105 flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portal Screen</span>
            </button>
          </div>
        </div>

        {/* Center Minimalist Hint */}
        {!isUiVisible && !isLandingOpen && (
          <div className="self-center mb-12 pointer-events-none animate-pulse text-xs text-white/40 font-mono tracking-widest bg-black/30 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-md flex items-center gap-2">
            <Eye className="w-3.5 h-3.5" />
            <span>Move cursor to reveal window controls</span>
          </div>
        )}

        {/* Bottom Metadata & Controls Area */}
        <div className="pointer-events-auto w-full flex flex-col gap-4">
          {/* Center Control Bar */}
          <div className="w-full flex justify-center">
            <ControlBar
              onTeleport={handleTeleport}
              soundState={soundState}
              onUpdateSoundState={setSoundState}
              onOpenGallery={() => setIsDrawerOpen(true)}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              isPinned={isPinned}
              onTogglePin={() => setIsPinned(!isPinned)}
              bgMode={bgMode}
              onToggleBgMode={() => setBgMode((prev) => (prev === 'video' ? 'photo' : 'video'))}
            />
          </div>

          {/* Bottom Coordinates & Environment Details Bar */}
          <div className="w-full flex justify-between items-end text-white/40 text-[10px] tracking-widest uppercase font-mono px-2 sm:px-4 pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-ping"></span>
              <span>{currentStream.coordinates || '00.0000° N, 00.0000° E'}</span>
            </div>

            <div className="flex items-center gap-6">
              {currentStream.weather && (
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[9px] text-white/30 tracking-[0.2em]">Atmosphere</span>
                  <span className="text-xs font-light text-white/70 normal-case">{currentStream.weather}</span>
                </div>
              )}
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-white/30 tracking-[0.2em]">Portal ID</span>
                <span className="text-xs font-light text-white/70 font-mono">#{currentStream.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8. Stream Selection Gallery Drawer */}
      <StreamDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentStream={currentStream}
        onSelectStream={handleSelectStream}
      />
    </div>
  );
}
