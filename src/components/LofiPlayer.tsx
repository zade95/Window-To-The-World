import React, { useEffect, useRef, useState } from 'react';
import { DEFAULT_LOFI_STREAM_ID } from '../data/streams';

interface LofiPlayerProps {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
}

export const LofiPlayer: React.FC<LofiPlayerProps> = ({ isPlaying, volume, isMuted }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Web Audio Synth Fallback for Lofi Chords & Vinyl Crackle
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<any[]>([]);

  useEffect(() => {
    let checkInterval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        setIsReady(true);
        clearInterval(checkInterval);
      }
    }, 300);

    return () => clearInterval(checkInterval);
  }, []);

  // Initialize YouTube Lofi Player in visually hidden container
  useEffect(() => {
    if (!isReady || !containerRef.current || playerRef.current) return;

    const elementId = 'lofi-youtube-player';
    let el = document.getElementById(elementId);
    if (!el) {
      el = document.createElement('div');
      el.id = elementId;
      containerRef.current.appendChild(el);
    }

    try {
      playerRef.current = new window.YT.Player(elementId, {
        videoId: DEFAULT_LOFI_STREAM_ID,
        height: '200',
        width: '300',
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          enablejsapi: 1,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            if (isMuted) event.target.mute();
            else event.target.unMute();
            event.target.setVolume(volume);

            if (isPlaying) {
              event.target.playVideo();
            } else {
              event.target.pauseVideo();
            }
          },
          onError: (e: any) => {
            console.warn('YouTube Lofi Player error:', e);
          },
        },
      });
    } catch (err) {
      console.warn('Failed to construct YT player for Lofi:', err);
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [isReady]);

  // Handle YouTube play / pause / volume
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      if (isPlaying) {
        if (isMuted) playerRef.current.mute();
        else {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
        }
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch (e) {
      console.warn('Lofi player play/pause state change failed:', e);
    }
  }, [isPlaying, isMuted, volume]);

  // Web Audio Lofi Synth Chords + Vinyl Crackle generator
  useEffect(() => {
    if (!isPlaying || isMuted) {
      stopSynth();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      startLofiSynth();
    } catch (err) {
      console.warn('Web Audio Synth failed:', err);
    }

    return () => {
      stopSynth();
    };
  }, [isPlaying, isMuted, volume]);

  const stopSynth = () => {
    synthNodesRef.current.forEach((n) => {
      try {
        if (n.stop) n.stop();
        if (n.disconnect) n.disconnect();
      } catch (e) {}
    });
    synthNodesRef.current = [];
  };

  const startLofiSynth = () => {
    stopSynth();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const masterGain = ctx.createGain();
    const targetVol = (volume / 100) * 0.15;
    masterGain.gain.setValueAtTime(targetVol, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Warm Lofi Jazzy Chord progression (Fmaj7 -> Cmaj7 -> Dm7 -> Am7)
    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [110.0, 130.81, 164.81, 196.0],  // Am7
    ];

    let chordIdx = 0;
    const playChord = () => {
      if (!ctx || ctx.state === 'closed') return;
      const freqs = chords[chordIdx % chords.length];
      chordIdx++;

      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        const now = ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 4.0);
        synthNodesRef.current.push(osc, gain, filter);
      });
    };

    playChord();
    const interval = setInterval(playChord, 4000);
    synthNodesRef.current.push({ stop: () => clearInterval(interval) });

    // Vinyl crackle generator
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() < 0.002 ? (Math.random() * 2 - 1) * 0.15 : 0;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const vinylFilter = ctx.createBiquadFilter();
    vinylFilter.type = 'highpass';
    vinylFilter.frequency.setValueAtTime(1000, ctx.currentTime);
    noise.connect(vinylFilter);
    vinylFilter.connect(masterGain);
    noise.start();
    synthNodesRef.current.push(noise, vinylFilter);
  };

  return (
    <div className="fixed -top-[9999px] left-0 w-[300px] h-[200px] overflow-hidden opacity-0 pointer-events-none -z-50">
      <div ref={containerRef} />
    </div>
  );
};
