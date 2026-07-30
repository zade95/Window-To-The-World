import React, { useEffect, useState } from 'react';
import { StreamLocation } from '../types';
import { MapPin, Clock, Sparkles } from 'lucide-react';

interface LocationCardProps {
  stream: StreamLocation;
  streamIndex: number;
  totalStreams: number;
  onOpenGallery: () => void;
  onTeleport: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  stream,
  streamIndex,
  totalStreams,
  onOpenGallery,
}) => {
  const [localTime, setLocalTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: stream.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });
        setLocalTime(formatter.format(new Date()));
      } catch (e) {
        setLocalTime(new Date().toLocaleTimeString());
      }
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [stream.timezone]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-xl select-none group gap-4">
      {/* Top Left Metadata Panel */}
      <div className="flex flex-col gap-1 p-4 sm:p-5 rounded-[28px] bg-white/5 backdrop-blur-[32px] border border-white/10 shadow-2xl transition-all duration-300 hover:bg-white/10 hover:border-white/20">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.3em] text-white/50 uppercase font-mono font-medium">
            Live Stream • Window {streamIndex + 1} of {totalStreams}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white/95 italic drop-shadow-md flex items-center gap-2">
          <span>{stream.flag}</span>
          <span>{stream.title}, {stream.location}</span>
        </h1>
        <div className="flex items-center gap-3 text-xs text-white/60 font-sans mt-0.5">
          <span className="flex items-center gap-1.5 text-white/80">
            <MapPin className="w-3.5 h-3.5 text-white/60 shrink-0" />
            {stream.country}
          </span>
          <span>•</span>
          <span className="italic text-white/70 font-sans text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-white/50 shrink-0" />
            {stream.atmosphere}
          </span>
        </div>
      </div>

      {/* Top Right Atmosphere & Clock Badge */}
      <div className="flex items-center gap-2 self-start sm:self-center">
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/5 backdrop-blur-[32px] rounded-full border border-white/10 shadow-2xl">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
          <span className="text-[11px] tracking-[0.2em] text-white/80 uppercase font-semibold">
            Live
          </span>
        </div>

        {localTime && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 backdrop-blur-[32px] rounded-full border border-white/10 shadow-2xl font-mono text-xs text-white/90">
            <Clock className="w-3.5 h-3.5 text-white/60" />
            <span>{localTime}</span>
          </div>
        )}
      </div>
    </div>
  );
};
