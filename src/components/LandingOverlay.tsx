import React from 'react';
import { STREAM_LOCATIONS } from '../data/streams';
import { StreamLocation } from '../types';
import { Compass, Sparkles, MapPin, Play, Globe } from 'lucide-react';

interface LandingOverlayProps {
  onStart: (stream?: StreamLocation) => void;
}

export const LandingOverlay: React.FC<LandingOverlayProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/40 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] bg-white/12 border border-white/25 backdrop-blur-[45px] text-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] p-6 sm:p-10 flex flex-col items-center text-center gap-8 transition-all duration-500 hover:scale-[1.008] hover:backdrop-blur-[55px] hover:border-white/35">
        {/* Top Hero Branding */}
        <div className="flex flex-col items-center gap-3 max-w-2xl">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 text-xs font-mono tracking-widest uppercase text-white shadow-inner backdrop-blur-md transition-all duration-300 hover:scale-105 hover:backdrop-blur-xl hover:bg-white/20">
            <Globe className="w-3.5 h-3.5 text-white animate-spin" />
            <span>Interactive Live Windows</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extralight tracking-tight text-white italic leading-tight drop-shadow-lg">
            Window to the World
          </h1>

          <p className="text-sm sm:text-base font-light text-white/80 max-w-lg leading-relaxed">
            Step through continuous live stream portals into quiet moments around planet Earth. Ambient soundscapes, local time clocks, and lofi audio.
          </p>
        </div>

        {/* Hero Teleport Start Button */}
        <button
          onClick={() => onStart()}
          className="group relative flex items-center gap-3 px-8 sm:px-10 py-4 rounded-full bg-white text-black font-extrabold tracking-[0.25em] uppercase text-xs sm:text-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:shadow-[0_0_70px_rgba(255,255,255,0.6)]"
        >
          <Compass className="w-5 h-5 text-black group-hover:rotate-180 transition-transform duration-700" />
          <span>Teleport into Live View</span>
          <Play className="w-4 h-4 text-black fill-black ml-1" />
        </button>

        {/* Destination Catalog Quick Jump Grid */}
        <div className="w-full flex flex-col gap-4 pt-6 border-t border-white/15">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/60">
              Select Starting Destination
            </span>
            <span className="text-xs font-mono text-white/50">
              {STREAM_LOCATIONS.length} Portals Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left">
            {STREAM_LOCATIONS.slice(0, 6).map((stream) => (
              <button
                key={stream.id}
                onClick={() => onStart(stream)}
                className="p-4 rounded-[24px] bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/35 backdrop-blur-xl hover:backdrop-blur-2xl transition-all duration-300 hover:scale-[1.035] flex flex-col justify-between gap-3 group cursor-pointer shadow-lg hover:shadow-2xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stream.flag}</span>
                    <div>
                      <h3 className="font-light italic text-sm text-white group-hover:text-white">
                        {stream.title}
                      </h3>
                      <p className="text-[11px] text-white/70 flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-white/60 shrink-0" />
                        {stream.location}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-white/60 font-sans">
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
