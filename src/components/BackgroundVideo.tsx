import React, { useEffect, useRef, useState } from 'react';
import { StreamLocation } from '../types';
import { SCENERY_SPACE_COMPILATION } from '../data/streams';

interface BackgroundVideoProps {
  currentStream: StreamLocation;
  volume: number;
  isMuted: boolean;
  onErrorFallback: () => void;
  onPlayerReady?: () => void;
  bgMode?: 'video' | 'photo';
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({
  currentStream,
  volume,
  isMuted,
  onErrorFallback,
  onPlayerReady,
  bgMode = 'video',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isApiReady, setIsApiReady] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const currentVideoIdRef = useRef<string>(currentStream.id);
  const backupIndexRef = useRef<number>(0);
  const [photoIndex, setPhotoIndex] = useState<number>(0);

  // Fallback / High quality scenery image
  const bgImageUrl =
    currentStream.imageUrl ||
    SCENERY_SPACE_COMPILATION[photoIndex % SCENERY_SPACE_COMPILATION.length].url;

  // Rotate photo compilation every 12 seconds in photo mode
  useEffect(() => {
    if (bgMode !== 'photo') return;
    const interval = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % SCENERY_SPACE_COMPILATION.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [bgMode]);

  // Load YouTube Iframe API once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setIsApiReady(true);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousReady) previousReady();
      setIsApiReady(true);
    };
  }, []);

  // Initialize YouTube Player
  useEffect(() => {
    if (!isApiReady || !containerRef.current) return;

    currentVideoIdRef.current = currentStream.id;
    backupIndexRef.current = 0;
    setIsBuffering(true);

    const elementId = 'bg-youtube-player';
    let playerElement = document.getElementById(elementId);
    if (!playerElement) {
      playerElement = document.createElement('div');
      playerElement.id = elementId;
      containerRef.current.appendChild(playerElement);
    }

    playerRef.current = new window.YT.Player(elementId, {
      videoId: currentStream.id,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        mute: isMuted ? 1 : 0,
        enablejsapi: 1,
        playsinline: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event: any) => {
          if (isMuted) {
            event.target.mute();
          } else {
            event.target.unMute();
            event.target.setVolume(volume);
          }
          event.target.playVideo();
          setIsBuffering(false);
          if (onPlayerReady) onPlayerReady();
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsBuffering(false);
          } else if (event.data === window.YT.PlayerState.BUFFERING) {
            setIsBuffering(true);
          }
        },
        onError: (event: any) => {
          console.warn(`YouTube player error ${event.data} on video ID ${currentVideoIdRef.current}`);
          if (currentStream.backupIds && backupIndexRef.current < currentStream.backupIds.length) {
            const nextBackup = currentStream.backupIds[backupIndexRef.current];
            backupIndexRef.current += 1;
            currentVideoIdRef.current = nextBackup;
            if (playerRef.current && playerRef.current.loadVideoById) {
              playerRef.current.loadVideoById(nextBackup);
            }
          } else {
            onErrorFallback();
          }
        },
      },
    });

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isApiReady]);

  // Handle stream change
  useEffect(() => {
    if (!playerRef.current || !playerRef.current.loadVideoById) return;
    if (currentVideoIdRef.current === currentStream.id) return;

    currentVideoIdRef.current = currentStream.id;
    backupIndexRef.current = 0;
    setIsBuffering(true);

    try {
      playerRef.current.loadVideoById({
        videoId: currentStream.id,
        suggestedQuality: 'hd1080',
      });
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      }
      playerRef.current.playVideo();
    } catch (err) {
      console.error('Failed to load video by ID:', err);
    }
  }, [currentStream.id]);

  // Handle mute and volume changes
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
      }
    } catch (e) {
      // ignore
    }
  }, [isMuted, volume]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none select-none z-0 bg-black">
      {/* High Quality Sceneries & Spaces Backdrop Layer */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out scale-105 ${
          bgMode === 'photo' || isBuffering ? 'opacity-100 scale-110' : 'opacity-20'
        }`}
        style={{ backgroundImage: `url('${bgImageUrl}')` }}
      />

      {/* Container aspect ratio trick for Youtube Video */}
      <div
        ref={containerRef}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.77777778vh] min-w-full h-[56.25vw] min-h-full scale-[1.12] transition-opacity duration-1000 ease-in-out pointer-events-none ${
          bgMode === 'photo' ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Glass / Vignette overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />
      <div className="absolute inset-0 bg-radial-vignette pointer-events-none opacity-60" />

      {/* Buffering or Teleporting indicator */}
      {isBuffering && bgMode === 'video' && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center transition-all duration-500">
          <div className="flex flex-col items-center gap-3 px-6 py-4 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-2xl shadow-2xl">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span className="text-xs tracking-[0.2em] text-white font-mono uppercase animate-pulse">
              Connecting Live Stream...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
