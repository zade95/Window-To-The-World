import React from 'react';
import { STREAM_LOCATIONS } from '../data/streams';
import { StreamLocation } from '../types';
import { Compass, Sparkles, MapPin, Play, Globe } from 'lucide-react';

interface LandingOverlayProps {
  onStart: (stream?: StreamLocation) => void;
}

export const LandingOverlay: React.FC<LandingOverlayProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-[40px] text-white shadow-2xl p-6 sm:p-10 flex flex-col items-center text-center gap-8">
        {/* Top Hero Branding */}
        <div className="flex flex-col items-center gap-3 max-w-2xl">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-mono tracking-widest uppercase text-white/80 shadow-inner">
            <Globe className="w-3.5 h-3.5 text-white animate-spin" />
            <span>Interactive Live Windows</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extralight tracking-tight text-white/95 italic leading-tight">
            Window to the World
          </h1>

          <p className="text-sm sm:text-base font-light text-white/70 max-w-lg leading-relaxed">
            Step through continuous live stream portals into quiet moments around planet Earth. Ambient soundscapes, local time clocks, and lofi audio.
          </p>
        </div>

        {/* Hero Teleport Start Button */}
        <button
          onClick={() => onStart()}
          className="group relative flex items-center gap-3 px-8 sm:px-10 py-4 rounded-full bg-white text-black font-extrabold tracking-[0.25em] uppercase text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_70px_rgba(255,255,255,0.5)]"
        >
          <Compass className="w-5 h-5 text-black group-hover:rotate-180 transition-transform duration-700" />
          <span>Teleport into Live View</span>
          <Play className="w-4 h-4 text-black fill-black ml-1" />
        </button>

        {/* Destination Catalog Quick Jump Grid */}
        <div className="w-full flex flex-col gap-4 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/50">
              Select Starting Destination
            </span>
            <span className="text-xs font-mono text-white/40">
              {STREAM_LOCATIONS.length} Portals Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left">
            {STREAM_LOCATIONS.slice(0, 6).map((stream) => (
              <button
                key={stream.id}
                onClick={() => onStart(stream)}
                className="p-4 rounded-[24px] bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stream.flag}</span>
                    <div>
                      <h3 className="font-light italic text-sm text-white group-hover:text-white/100">
                        {stream.title}
                      </h3>
                      <p className="text-[11px] text-white/60 flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-white/50 shrink-0" />
                        {stream.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50 font-sans">
                  <span className="truncate italic flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-200 shrink-0" />
                    {stream.atmosphere}
                  </span>
                  <Play className="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
