import React, { useEffect, useRef } from 'react';

interface AmbientSoundscapeProps {
  type: 'none' | 'rain' | 'waves' | 'wind' | 'birds';
  volume: number;
}

export const AmbientSoundscape: React.FC<AmbientSoundscapeProps> = ({ type, volume }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const activeNodesRef = useRef<any[]>([]);

  useEffect(() => {
    if (type === 'none') {
      stopSound();
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

      startSound(type);
    } catch (err) {
      console.warn('Web Audio API not supported or blocked:', err);
    }

    return () => {
      stopSound();
    };
  }, [type]);

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      // Scale volume gently (0 - 100 to 0.0 - 0.3 master level for ambient background)
      const targetGain = (volume / 100) * 0.25;
      gainNodeRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.1);
    }
  }, [volume]);

  const stopSound = () => {
    activeNodesRef.current.forEach((node) => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // ignore
      }
    });
    activeNodesRef.current = [];
  };

  const createNoiseBuffer = (ctx: AudioContext, durationSeconds = 3) => {
    const bufferSize = ctx.sampleRate * durationSeconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const startSound = (soundType: 'rain' | 'waves' | 'wind' | 'birds') => {
    stopSound();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime((volume / 100) * 0.25, ctx.currentTime);
    masterGain.connect(ctx.destination);
    gainNodeRef.current = masterGain;

    if (soundType === 'rain') {
      // Rain: Low-passed white noise with subtle rumble
      const noiseBuffer = createNoiseBuffer(ctx, 4);
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();
      activeNodesRef.current.push(whiteNoise, filter);
    } else if (soundType === 'waves') {
      // Ocean Waves: Modulated noise using an LFO filter sweep
      const noiseBuffer = createNoiseBuffer(ctx, 5);
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec wave cycle

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(350, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      whiteNoise.connect(filter);
      filter.connect(masterGain);

      whiteNoise.start();
      lfo.start();
      activeNodesRef.current.push(whiteNoise, filter, lfo, lfoGain);
    } else if (soundType === 'wind') {
      // Night Wind: Bandpass filtered noise with frequency oscillation
      const noiseBuffer = createNoiseBuffer(ctx, 4);
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.18, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(250, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      whiteNoise.connect(filter);
      filter.connect(masterGain);

      whiteNoise.start();
      lfo.start();
      activeNodesRef.current.push(whiteNoise, filter, lfo, lfoGain);
    }
  };

  return null;
};
