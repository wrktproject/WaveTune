import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Infinity, Clock, Play } from 'lucide-react';

const formatTime = (seconds) => {
  if (!seconds || seconds < 0 || Number.isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const clampMinutes = (value) => {
  const num = parseInt(value, 10);
  if (Number.isNaN(num)) return 0;
  return Math.max(1, Math.min(999, num));
};

const Timer = ({
  isPlaying = false,
  onTimerComplete,
  onTimerReset,
  onTimerStart,
  onTimerDoneChange,
  restartSignal = 0,
}) => {
  const [mode, setMode] = useState('infinite'); // 'infinite' | 'custom'
  const [customMinutes, setCustomMinutes] = useState('25');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isTimeBlurred, setIsTimeBlurred] = useState(false);
  const completedRef = useRef(false);

  const displayTime = useMemo(() => {
    if (mode === 'infinite') return formatTime(elapsedSeconds);
    return formatTime(remainingSeconds);
  }, [mode, elapsedSeconds, remainingSeconds]);

  // Tick up for infinite mode
  useEffect(() => {
    if (!isPlaying || mode !== 'infinite') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, mode]);

  // Tick down for custom mode
  useEffect(() => {
    if (!isPlaying || !isActive || isDone || mode !== 'custom') return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isActive, isDone, mode]);

  // Complete when reaching target
  useEffect(() => {
    if (mode !== 'custom' || isDone) return;
    if (isActive && remainingSeconds <= 0) {
      setIsDone(true);
      setIsActive(false);
      if (!completedRef.current) {
        completedRef.current = true;
        onTimerComplete?.();
      }
    }
  }, [remainingSeconds, isActive, isDone, mode, onTimerComplete]);

  const handleSetInfinite = () => {
    setMode('infinite');
    setIsActive(false);
    setIsDone(false);
    setElapsedSeconds(0);
    setRemainingSeconds(0);
    setShowControls(true);
    setIsTimeBlurred(false);
    completedRef.current = false;
    onTimerReset?.();
  };

  const handleStartCustom = useCallback(() => {
    const minutes = clampMinutes(customMinutes);
    setCustomMinutes(String(minutes));
    setMode('custom');
    setRemainingSeconds(minutes * 60);
    setIsActive(true);
    setIsDone(false);
    completedRef.current = false;
    setShowControls(false);
    onTimerStart?.();
  }, [customMinutes, onTimerStart]);

  useEffect(() => {
    onTimerDoneChange?.(isDone);
  }, [isDone, onTimerDoneChange]);

  useEffect(() => {
    if (restartSignal <= 0) return;
    if (mode !== 'custom') return;
    handleStartCustom();
  }, [restartSignal, mode, handleStartCustom]);

  useEffect(() => {
    if (mode === 'custom') {
      setIsTimeBlurred(false);
    }
  }, [mode]);

  const handleReopenControls = () => {
    if (mode !== 'custom') return;
    setShowControls((prev) => !prev);
  };

  const handleDisplayClick = () => {
    if (mode === 'infinite') {
      setIsTimeBlurred((prev) => !prev);
      return;
    }
    handleReopenControls();
  };

  return (
    <div className={`flex flex-col items-center transition-all duration-500 ease-out ${
      showControls ? 'gap-6 translate-y-0' : 'gap-2 translate-y-2'
    }`}>
      {/* Display */}
      <div className="flex flex-col items-center">
        <div
          onClick={handleDisplayClick}
          className={`text-7xl sm:text-8xl font-semibold tracking-tight text-white text-glow drop-shadow-[0_0_24px_rgba(255,255,255,0.35)] cursor-pointer select-none ${
            isDone ? 'timer-flash' : ''
          } ${
            mode === 'infinite' && isTimeBlurred ? 'blur-md opacity-40' : ''
          }`}
        >
          {displayTime}
        </div>
        <div className="mt-2 text-xs sm:text-sm text-white/50 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <button
            type="button"
            onClick={handleReopenControls}
            className="hover:text-white/80 transition-colors"
          >
            {mode === 'infinite' ? 'Infinite Play' : 'Custom Timer'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className={`w-full max-w-md rounded-2xl glass p-4 transition-all duration-500 ease-out overflow-hidden ${
        showControls ? 'max-h-80 opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-3'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={handleSetInfinite}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              mode === 'infinite'
                ? 'bg-gradient-to-r from-wave-accent to-wave-purple text-white shadow-lg shadow-wave-accent/20'
                : 'text-white/60 hover:text-white/90 hover:bg-white/10'
            }`}
          >
            <Infinity className="w-4 h-4" />
            Infinite
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              mode === 'custom'
                ? 'bg-gradient-to-r from-wave-accent to-wave-purple text-white shadow-lg shadow-wave-accent/20'
                : 'text-white/60 hover:text-white/90 hover:bg-white/10'
            }`}
          >
            <Clock className="w-4 h-4" />
            Custom
          </button>
        </div>

        {mode === 'custom' && (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="999"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-black/30 border border-white/15 text-white text-sm focus:outline-none focus:border-wave-accent/50"
                placeholder="Minutes"
                aria-label="Custom timer minutes"
              />
              <span className="text-white/50 text-sm">min</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleStartCustom}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-white text-wave-dark hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timer;