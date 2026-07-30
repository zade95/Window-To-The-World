export interface StreamLocation {
  id: string;
  backupIds?: string[];
  title: string;
  location: string;
  country: string;
  flag: string;
  timezone: string; // e.g. "Asia/Tokyo"
  coordinates?: string; // e.g. "35.6595° N, 139.7005° E"
  weather?: string; // e.g. "18°C Clear"
  category: 'urban' | 'nature' | 'space' | 'cozy' | 'coastal' | 'wildlife';
  atmosphere: string; // e.g. "Neon Lights & Urban Rhythm"
  description: string;
  ambientSoundPreset?: 'rain' | 'waves' | 'wind' | 'birds';
  imageUrl?: string;
}

export interface SoundState {
  streamVolume: number;
  streamMuted: boolean;
  lofiVolume: number;
  lofiMuted: boolean;
  lofiPlaying: boolean;
  ambientType: 'none' | 'rain' | 'waves' | 'wind' | 'birds';
  ambientVolume: number;
}
