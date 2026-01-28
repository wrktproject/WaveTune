import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat,
  Volume2,
  VolumeX
} from 'lucide-react';

const PlayerControls = ({ 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  isLooping,
  onToggleLoop,
  volume,
  onVolumeChange,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6">
      {/* Loop button */}
      <button
        onClick={onToggleLoop}
        className={`p-2 rounded-full transition-all ${
          isLooping 
            ? 'text-wave-accent bg-wave-accent/20' 
            : 'text-white/50 hover:text-white/80 hover:bg-white/10'
        }`}
        aria-label={isLooping ? 'Disable loop' : 'Enable loop'}
      >
        <Repeat className="w-5 h-5" />
      </button>

      {/* Previous button */}
      <button
        onClick={onPrevious}
        className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Previous track"
      >
        <SkipBack className="w-6 h-6" fill="currentColor" />
      </button>

      {/* Play/Pause button */}
      <button
        onClick={onPlayPause}
        className="p-4 sm:p-5 rounded-full bg-white text-wave-dark hover:scale-105 hover:shadow-lg hover:shadow-white/20 transition-all duration-200"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" />
        ) : (
          <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-1" fill="currentColor" />
        )}
      </button>

      {/* Next button */}
      <button
        onClick={onNext}
        className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
        aria-label="Next track"
      >
        <SkipForward className="w-6 h-6" fill="currentColor" />
      </button>

      {/* Volume control */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={onToggleMute}
          className="p-2 rounded-full text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={(e) => onVolumeChange(parseInt(e.target.value))}
          className="w-20 accent-wave-accent"
          aria-label="Volume"
        />
      </div>
    </div>
  );
};

export default PlayerControls;
