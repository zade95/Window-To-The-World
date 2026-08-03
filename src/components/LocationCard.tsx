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
      <div className="flex flex-col gap-1 p-4 sm:p-5 rounded-[28px] bg-white/12 backdrop-blur-[40px] border border-white/25 shadow-[0_16px_40px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-[1.02] hover:backdrop-blur-[50px] hover:bg-white/18 hover:border-white/35 cursor-pointer">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-[0.3em] text-white/70 uppercase font-mono font-medium">
            Live Stream • Window {streamIndex + 1} of {totalStreams}
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white italic drop-shadow-md flex items-center gap-2">
          <span>{stream.flag}</span>
          <span>{stream.title}, {stream.location}</span>
        </h1>
        <div className="flex items-center gap-3 text-xs text-white/80 font-sans mt-0.5">
          <span className="flex items-center gap-1.5 text-white">
            <MapPin className="w-3.5 h-3.5 text-white/80 shrink-0" />
            {stream.country}
          </span>
          <span>•</span>
          <span className="italic text-white/90 font-sans text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-200 shrink-0" />
            {stream.atmosphere}
          </span>
        </div>
      </div>

      {/* Top Right Atmosphere & Clock Badge */}
      <div className="flex items-center gap-2 self-start sm:self-center">
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white/12 backdrop-blur-[40px] rounded-full border border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 hover:scale-105 hover:backdrop-blur-[50px] hover:bg-white/20 hover:border-white/35 cursor-default">
          <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
          <span className="text-[11px] tracking-[0.2em] text-white uppercase font-semibold">
            Live
          </span>
        </div>

        {localTime && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white/12 backdrop-blur-[40px] rounded-full border border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.3)] font-mono text-xs text-white transition-all duration-300 hover:scale-105 hover:backdrop-blur-[50px] hover:bg-white/20 hover:border-white/35 cursor-default">
            <Clock className="w-3.5 h-3.5 text-white/80" />
            <span>{localTime}</span>
          </div>
        )}
      </div>
    </div>
  );
};
