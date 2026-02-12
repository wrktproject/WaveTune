import React, { useState, useRef } from 'react';
import { 
  ChevronDown, 
  LayoutGrid,
  Waves,
  SlidersHorizontal
} from 'lucide-react';
import AmbientMixer from './AmbientMixer';
import Timeline from './Timeline';

const Header = ({ 
  currentMode = 'Ambient', 
  onModeChange, 
  onBack, 
  // Timeline props
  currentTime = 0,
  duration = 0,
  onSeek,
  onLoopChange,
  isPlaying = false,
}) => {
  const modes = ['Ambient', 'Liminal', 'Games', 'Binaural', 'Motivation'];
  const [showAmbientMixer, setShowAmbientMixer] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const ambientButtonRef = useRef(null);
  const timelineButtonRef = useRef(null);

  return (
    <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        
        {/* Mode selector */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/10 transition-all">
            <Waves className="w-4 h-4 text-wave-accent" />
            <span className="text-sm font-medium text-white/90">
              Custom {currentMode} Mix
            </span>
            <ChevronDown className="w-4 h-4 text-white/60 group-hover:text-white/90 transition-colors" />
          </button>
          
          {/* Dropdown menu (hidden by default) */}
          <div className="absolute top-full left-0 mt-2 py-2 min-w-[180px] rounded-xl glass opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            {modes.map((mode) => (
              <button
                key={mode}
                onClick={() => onModeChange?.(mode)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-white/10 transition-colors ${
                  currentMode === mode ? 'text-wave-accent' : 'text-white/70'
                }`}
              >
                {mode} Mix
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <button 
          ref={ambientButtonRef}
          onClick={() => setShowAmbientMixer(!showAmbientMixer)}
          className={`p-2 rounded-full transition-colors ${showAmbientMixer ? 'bg-white/10' : 'hover:bg-white/10'}`}
          aria-label="Ambient Sounds Mixer"
        >
          <SlidersHorizontal className={`w-5 h-5 transition-colors ${showAmbientMixer ? 'text-wave-accent' : 'text-white/60 hover:text-white/90'}`} />
        </button>
        <button 
          ref={timelineButtonRef}
          onClick={() => setShowTimeline(!showTimeline)}
          className={`p-2 rounded-full transition-colors ${showTimeline ? 'bg-white/10' : 'hover:bg-white/10'}`}
          aria-label="Timeline"
        >
          <LayoutGrid className={`w-5 h-5 transition-colors ${showTimeline ? 'text-wave-accent' : 'text-white/60 hover:text-white/90'}`} />
        </button>
      </div>

      {/* Ambient Sounds Mixer */}
      <AmbientMixer 
        isOpen={showAmbientMixer}
        onClose={() => setShowAmbientMixer(false)}
        anchorRef={ambientButtonRef}
      />

      {/* Timeline */}
      <Timeline
        isOpen={showTimeline}
        onClose={() => setShowTimeline(false)}
        anchorRef={timelineButtonRef}
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
        onLoopChange={onLoopChange}
        isPlaying={isPlaying}
      />
    </header>
  );
};

export default Header;
