import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, Infinity, Clock } from 'lucide-react';

const Timer = ({ isPlaying, mode = 'Focus' }) => {
  const [seconds, setSeconds] = useState(0);
  const [timerMode, setTimerMode] = useState('infinite'); // 'infinite', '25', '50', '90', 'custom'
  const [showDropdown, setShowDropdown] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState('idle'); // 'idle', 'morphing-out', 'morphing-in'
  const [isPlayingStyle, setIsPlayingStyle] = useState(false); // Tracks style separately from isPlaying
  const [customHours, setCustomHours] = useState(1);
  const [customMinutes, setCustomMinutes] = useState(0);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const prevIsPlaying = useRef(isPlaying);

  const timerOptions = [
    { id: 'infinite', label: 'Infinite Play', icon: Infinity },
    { id: '25', label: '25 minutes' },
    { id: '50', label: '50 minutes' },
    { id: '90', label: '90 minutes' },
    { id: 'custom', label: 'Custom Timer', icon: Clock },
  ];

  // Get the target text based on mode and playing state
  const getTargetText = useCallback((playing) => {
    if (!playing) {
      return 'Ready to Focus';
    }
    
    switch (mode) {
      case 'Focus':
        return 'Focused.';
      case 'Liminal':
        return 'Exploring.';
      case 'Games':
        return 'Gaming.';
      default:
        return 'Focused.';
    }
  }, [mode]);

  // Initialize display text
  const [displayText, setDisplayText] = useState(() => getTargetText(false));

  // Handle smooth morphing text transition when isPlaying changes
  useEffect(() => {
    if (prevIsPlaying.current !== isPlaying) {
      prevIsPlaying.current = isPlaying;
      const newText = getTargetText(isPlaying);
      
      // Start morph out
      setTransitionPhase('morphing-out');
      
      // After morph out, change text AND style together, then morph in
      const morphTimeout = setTimeout(() => {
        setDisplayText(newText);
        setIsPlayingStyle(isPlaying); // Update style at same time as text
        setTransitionPhase('morphing-in');
        
        // After morph in, return to idle
        setTimeout(() => {
          setTransitionPhase('idle');
        }, 350);
      }, 200);
      
      return () => clearTimeout(morphTimeout);
    }
  }, [isPlaying, getTargetText]);

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = useCallback((totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Get selected option with custom label if needed
  const getSelectedOption = () => {
    if (timerMode === 'custom') {
      const totalMins = customHours * 60 + customMinutes;
      if (customHours > 0 && customMinutes > 0) {
        return { id: 'custom', label: `${customHours}h ${customMinutes}m`, icon: Clock };
      } else if (customHours > 0) {
        return { id: 'custom', label: `${customHours} hour${customHours > 1 ? 's' : ''}`, icon: Clock };
      } else {
        return { id: 'custom', label: `${customMinutes} minutes`, icon: Clock };
      }
    }
    return timerOptions.find(opt => opt.id === timerMode);
  };
  
  const selectedOption = getSelectedOption();

  // Handle custom timer selection
  const handleCustomTimerSet = () => {
    setTimerMode('custom');
    setShowCustomInput(false);
    setShowDropdown(false);
  };

  // Get transition styles based on phase
  const getTransitionStyles = () => {
    switch (transitionPhase) {
      case 'morphing-out':
        return {
          opacity: 0,
          transform: 'scale(0.9) translateY(6px)',
          filter: 'blur(6px)',
        };
      case 'morphing-in':
        return {
          opacity: 1,
          transform: 'scale(1) translateY(0)',
          filter: 'blur(0px)',
        };
      default: // 'idle'
        return {
          opacity: 1,
          transform: 'scale(1) translateY(0)',
          filter: 'blur(0px)',
        };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 select-none">
      {/* Status text with smooth morphing transition */}
      <div className="h-10 flex items-center justify-center">
        <p 
          className={`font-medium ${
            isPlayingStyle 
              ? 'text-xs sm:text-sm tracking-[0.25em] text-white/60 uppercase' 
              : 'text-lg sm:text-xl tracking-wide text-white/80 normal-case'
          }`}
          style={{
            ...getTransitionStyles(),
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {displayText}
        </p>
      </div>

      {/* Timer display */}
      <div className="relative">
        <h1 
          className="text-7xl sm:text-8xl md:text-9xl font-light text-white tracking-tight text-glow"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatTime(seconds)}
        </h1>
        
        {/* Subtle glow effect behind timer */}
        <div 
          className="absolute inset-0 blur-3xl opacity-30 -z-10"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Timer mode selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:bg-white/10 transition-all group"
        >
          {selectedOption?.icon && <selectedOption.icon className="w-4 h-4 text-white/70" />}
          <span className="text-sm text-white/80">{selectedOption?.label}</span>
          <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => {
                setShowDropdown(false);
                setShowCustomInput(false);
              }} 
            />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 py-2 min-w-[180px] rounded-xl glass z-20">
              {timerOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    if (option.id === 'custom') {
                      setShowCustomInput(true);
                    } else {
                      setTimerMode(option.id);
                      setShowDropdown(false);
                      setShowCustomInput(false);
                    }
                  }}
                  className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-white/10 transition-colors ${
                    timerMode === option.id ? 'text-wave-accent' : 'text-white/70'
                  }`}
                >
                  {option.icon && <option.icon className="w-4 h-4" />}
                  {option.label}
                </button>
              ))}
              
              {/* Custom timer input */}
              {showCustomInput && (
                <div className="px-4 py-3 border-t border-white/10 mt-2">
                  <p className="text-xs text-white/50 mb-2">Set custom duration</p>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        min="0"
                        max="23"
                        value={customHours}
                        onChange={(e) => setCustomHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                        className="w-12 px-2 py-1 bg-black/30 border border-white/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-wave-accent"
                      />
                      <span className="text-[10px] text-white/40 mt-1">hours</span>
                    </div>
                    <span className="text-white/50">:</span>
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        className="w-12 px-2 py-1 bg-black/30 border border-white/20 rounded-lg text-white text-center text-sm focus:outline-none focus:border-wave-accent"
                      />
                      <span className="text-[10px] text-white/40 mt-1">mins</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCustomTimerSet}
                    disabled={customHours === 0 && customMinutes === 0}
                    className="w-full mt-3 px-3 py-1.5 bg-wave-accent/20 text-wave-accent text-sm rounded-lg hover:bg-wave-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Set Timer
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;
