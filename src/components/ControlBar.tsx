import React, { useState } from 'react';
import {
  Compass,
  Headphones,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Grid,
  CloudRain,
  Waves,
  Wind,
  Pin,
  PinOff,
  Sliders,
  Image as ImageIcon,
  Tv,
} from 'lucide-react';
import { SoundState } from '../types';

interface ControlBarProps {
  onTeleport: () => void;
  soundState: SoundState;
  onUpdateSoundState: (updater: (prev: SoundState) => SoundState) => void;
  onOpenGallery: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  bgMode?: 'video' | 'photo';
  onToggleBgMode?: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  onTeleport,
  soundState,
  onUpdateSoundState,
  onOpenGallery,
  isFullscreen,
  onToggleFullscreen,
  isPinned,
  onTogglePin,
  bgMode = 'video',
  onToggleBgMode,
}) => {
  const [showAudioPopover, setShowAudioPopover] = useState(false);

  const toggleLofi = () => {
    onUpdateSoundState((prev) => ({
      ...prev,
      lofiPlaying: !prev.lofiPlaying,
    }));
  };

  return (
    <div className="relative select-none flex flex-col items-center">
      {/* Audio Settings Glass Popover */}
      {showAudioPopover && (
        <div className="absolute bottom-full mb-4 p-5 rounded-[32px] bg-white/12 border border-white/25 backdrop-blur-[40px] text-white shadow-[0_16px_40px_rgba(0,0,0,0.4)] w-80 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3 duration-300 transition-all hover:backdrop-blur-[50px] hover:border-white/35 hover:scale-[1.01]">
          <div className="flex items-center justify-between border-b border-white/15 pb-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
            <span>Audio & Soundscape Mixer</span>
            <Sliders className="w-3.5 h-3.5 text-white/80" />
          </div>

          {/* Main Live Stream Volume */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-white/80">
              <span className="flex items-center gap-1.5 font-medium">
                {soundState.streamMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-white" />
                )}
                Stream Audio
              </span>
              <span className="font-mono text-[11px] text-white/50">
                {soundState.streamMuted ? 'Muted' : `${soundState.streamVolume}%`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={soundState.streamMuted ? 0 : soundState.streamVolume}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateSoundState((prev) => ({
                  ...prev,
                  streamVolume: val,
                  streamMuted: val === 0,
                }));
              }}
              className="w-full accent-white h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>

          {/* Lofi Audio Volume */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-white/80">
              <span className="flex items-center gap-1.5 font-medium">
                <Headphones className="w-3.5 h-3.5 text-white/80" />
                Lofi Music Stream
              </span>
              <span className="font-mono text-[11px] text-white/50">
                {soundState.lofiPlaying ? `${soundState.lofiVolume}%` : 'Off'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={soundState.lofiVolume}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateSoundState((prev) => ({
                  ...prev,
                  lofiVolume: val,
                }));
              }}
              className="w-full accent-white h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
          </div>

          {/* Ambient Sound Generators */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <span className="text-[10px] tracking-[0.15em] uppercase text-white/50 font-medium">Zen Sound Generator</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { type: 'none', label: 'Off', icon: null },
                { type: 'rain', label: 'Rain', icon: CloudRain },
                { type: 'waves', label: 'Waves', icon: Waves },
                { type: 'wind', label: 'Wind', icon: Wind },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = soundState.ambientType === item.type;
                return (
                  <button
                    key={item.type}
                    onClick={() => {
                      onUpdateSoundState((prev) => ({
                        ...prev,
                        ambientType: item.type as any,
                      }));
                    }}
                    className={`py-2 px-2 rounded-2xl text-[10px] font-medium flex flex-col items-center gap-1 transition-all border ${
                      isActive
                        ? 'bg-white/20 border-white/40 text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    {Icon ? <Icon className="w-3.5 h-3.5" /> : <span className="text-xs">✕</span>}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Immersive UI Glass Floating Control Dock */}
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-3.5 rounded-[40px] bg-white/12 border border-white/25 backdrop-blur-[40px] shadow-[0_16px_40px_rgba(0,0,0,0.5)] text-white transition-all duration-300 hover:scale-[1.015] hover:backdrop-blur-[50px] hover:border-white/35">
        {/* Stream Gallery / View Switcher Button */}
        <button
          onClick={onOpenGallery}
          title="Browse All 10 Windows"
          className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 hover:border-white/30 backdrop-blur-md hover:backdrop-blur-xl transition-all duration-300 hover:scale-110 cursor-pointer text-white/90 hover:text-white"
        >
          <Grid className="w-5 h-5" />
        </button>

        {/* Scenery & Space Photo Compilation Background Toggle */}
        {onToggleBgMode && (
          <button
            onClick={onToggleBgMode}
            title={bgMode === 'photo' ? 'Switch to Live Stream Video' : 'Switch to Sceneries & Space HD Photo Compilation'}
            className={`p-3.5 rounded-full border transition-all duration-300 hover:scale-105 cursor-pointer ${
              bgMode === 'photo'
                ? 'bg-white/25 border-white/40 text-white shadow-lg'
                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/80'
            }`}
          >
            {bgMode === 'photo' ? <ImageIcon className="w-5 h-5 text-amber-200" /> : <Tv className="w-5 h-5" />}
          </button>
        )}

        {/* Lofi Beats Toggle Button */}
        <button
          onClick={toggleLofi}
          title={soundState.lofiPlaying ? 'Pause Lofi Music' : 'Play Lofi Music'}
          className={`flex items-center gap-2 px-4 py-3 rounded-full border transition-all duration-300 hover:scale-105 cursor-pointer ${
            soundState.lofiPlaying
              ? 'bg-white/25 border-white/40 text-white shadow-lg'
              : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/80'
          }`}
        >
          <Headphones className={`w-4 h-4 ${soundState.lofiPlaying ? 'animate-bounce text-white' : ''}`} />
          <span className="text-[11px] tracking-[0.15em] uppercase font-semibold hidden sm:inline">
            {soundState.lofiPlaying ? 'Lofi On' : 'Lofi'}
          </span>
        </button>

        {/* Main Teleport Button (Hero Action in Immersive UI) */}
        <button
          onClick={onTeleport}
          className="group relative flex items-center gap-3 px-6 sm:px-8 py-3.5 rounded-full bg-white text-black font-extrabold tracking-[0.2em] uppercase text-xs transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
        >
          <Compass className="w-5 h-5 text-black group-hover:rotate-180 transition-transform duration-700" />
          <span>Teleport</span>
        </button>

        {/* Audio Mixer Popover Toggle */}
        <button
          onClick={() => setShowAudioPopover(!showAudioPopover)}
          title="Audio Mixer & Ambient Sounds"
          className={`p-3.5 rounded-full border transition-all duration-300 hover:scale-105 cursor-pointer ${
            showAudioPopover
              ? 'bg-white/25 border-white/40 text-white'
              : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/90'
          }`}
        >
          {soundState.streamMuted ? (
            <VolumeX className="w-5 h-5 text-rose-400" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        {/* Auto-Hide UI Pin Toggle */}
        <button
          onClick={onTogglePin}
          title={isPinned ? 'Unpin UI (Auto-Hide Enabled)' : 'Pin UI Always Visible'}
          className={`p-3.5 rounded-full border transition-all duration-300 hover:scale-105 cursor-pointer ${
            isPinned
              ? 'bg-white/25 border-white/40 text-white'
              : 'bg-white/10 hover:bg-white/20 border-white/15 text-white/70'
          }`}
        >
          {isPinned ? <Pin className="w-5 h-5" /> : <PinOff className="w-5 h-5" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 transition-all duration-300 hover:scale-105 cursor-pointer text-white/90"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
