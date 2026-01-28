import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { ZoomIn, ZoomOut, Repeat, X, SkipBack } from 'lucide-react';

const Timeline = ({ 
  isOpen, 
  onClose, 
  anchorRef,
  currentTime = 0,
  duration = 0,
  onSeek,
  onLoopChange,
  isPlaying = false,
}) => {
  const [zoom, setZoom] = useState(1); // 1x to 10x zoom
  const [loopStart, setLoopStart] = useState(null);
  const [loopEnd, setLoopEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSelectingLoop, setIsSelectingLoop] = useState(false);
  const [viewOffset, setViewOffset] = useState(0); // For panning when zoomed
  const timelineRef = useRef(null);
  const containerRef = useRef(null);

  // Format time as MM:SS or HH:MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate visible time range based on zoom and offset
  const getVisibleRange = useCallback(() => {
    const visibleDuration = duration / zoom;
    const start = Math.max(0, viewOffset);
    const end = Math.min(duration, start + visibleDuration);
    return { start, end, visibleDuration };
  }, [duration, zoom, viewOffset]);

  // Convert position to time
  const positionToTime = useCallback((clientX) => {
    if (!timelineRef.current || !duration) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const { start, visibleDuration } = getVisibleRange();
    return start + (percentage * visibleDuration);
  }, [duration, getVisibleRange]);

  // Convert time to percentage position
  const timeToPosition = useCallback((time) => {
    const { start, visibleDuration } = getVisibleRange();
    if (visibleDuration === 0) return 0;
    return ((time - start) / visibleDuration) * 100;
  }, [getVisibleRange]);

  // Handle seeking
  const handleTimelineClick = useCallback((e) => {
    if (isSelectingLoop) return;
    if (!timelineRef.current || !duration) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const { start, visibleDuration } = getVisibleRange();
    const time = start + (percentage * visibleDuration);
    
    console.log('Seeking to:', time);
    onSeek?.(time);
  }, [isSelectingLoop, duration, getVisibleRange, onSeek]);

  // Handle loop selection
  const handleLoopMouseDown = useCallback((e) => {
    if (!isSelectingLoop) return;
    e.preventDefault();
    const time = positionToTime(e.clientX);
    setLoopStart(time);
    setLoopEnd(null);
    setIsDragging(true);
  }, [isSelectingLoop, positionToTime]);

  const handleLoopMouseMove = useCallback((e) => {
    if (!isDragging || !isSelectingLoop) return;
    const time = positionToTime(e.clientX);
    setLoopEnd(time);
  }, [isDragging, isSelectingLoop, positionToTime]);

  const handleLoopMouseUp = useCallback(() => {
    if (isDragging && loopStart !== null && loopEnd !== null) {
      const start = Math.min(loopStart, loopEnd);
      const end = Math.max(loopStart, loopEnd);
      setLoopStart(start);
      setLoopEnd(end);
      onLoopChange?.({ start, end });
    }
    setIsDragging(false);
  }, [isDragging, loopStart, loopEnd, onLoopChange]);

  // Clear loop
  const clearLoop = useCallback(() => {
    setLoopStart(null);
    setLoopEnd(null);
    setIsSelectingLoop(false);
    onLoopChange?.(null);
  }, [onLoopChange]);

  // Calculate max zoom based on duration (longer clips = more zoom levels)
  const getMaxZoom = useCallback(() => {
    if (!duration) return 5;
    if (duration < 300) return 5;      // < 5 min: max 5x
    if (duration < 900) return 10;     // < 15 min: max 10x
    if (duration < 1800) return 15;    // < 30 min: max 15x
    if (duration < 3600) return 20;    // < 1 hour: max 20x
    return 30;                          // > 1 hour: max 30x
  }, [duration]);

  // Calculate zoom step based on duration
  const getZoomStep = useCallback(() => {
    if (!duration) return 1;
    if (duration < 300) return 1;
    if (duration < 1800) return 2;
    return 3;
  }, [duration]);

  // Zoom controls - zoom centered around current playhead
  const handleZoomIn = useCallback(() => {
    const maxZoom = getMaxZoom();
    const step = getZoomStep();
    
    setZoom(prev => {
      const newZoom = Math.min(maxZoom, prev + step);
      
      // Calculate new view offset to keep playhead centered
      if (newZoom > prev && duration) {
        const newVisibleDuration = duration / newZoom;
        // Center around current time
        const newOffset = Math.max(0, Math.min(
          duration - newVisibleDuration,
          currentTime - (newVisibleDuration / 2)
        ));
        setViewOffset(newOffset);
      }
      
      return newZoom;
    });
  }, [duration, currentTime, getMaxZoom, getZoomStep]);

  const handleZoomOut = useCallback(() => {
    const step = getZoomStep();
    
    setZoom(prev => {
      const newZoom = Math.max(1, prev - step);
      
      if (newZoom === 1) {
        setViewOffset(0);
      } else if (newZoom < prev && duration) {
        // Recenter around current time when zooming out
        const newVisibleDuration = duration / newZoom;
        const newOffset = Math.max(0, Math.min(
          duration - newVisibleDuration,
          currentTime - (newVisibleDuration / 2)
        ));
        setViewOffset(newOffset);
      }
      
      return newZoom;
    });
  }, [duration, currentTime, getZoomStep]);

  // Keep current time in view when zoomed and playing
  useEffect(() => {
    if (zoom > 1 && isPlaying && duration) {
      const visibleDuration = duration / zoom;
      const start = viewOffset;
      const end = start + visibleDuration;
      
      // If playhead is getting close to edges, pan to keep it visible
      const buffer = visibleDuration * 0.1; // 10% buffer
      if (currentTime < start + buffer || currentTime > end - buffer) {
        const newOffset = Math.max(0, Math.min(
          duration - visibleDuration,
          currentTime - (visibleDuration / 2)
        ));
        setViewOffset(newOffset);
      }
    }
  }, [currentTime, zoom, isPlaying, duration, viewOffset]);

  // Pan with mouse wheel when zoomed
  const handleWheel = useCallback((e) => {
    if (zoom <= 1) return;
    e.preventDefault();
    const delta = e.deltaX || e.deltaY;
    const panAmount = (duration / zoom) * 0.1 * Math.sign(delta);
    setViewOffset(prev => {
      const maxOffset = duration - (duration / zoom);
      return Math.max(0, Math.min(maxOffset, prev + panAmount));
    });
  }, [zoom, duration]);

  // Mouse event listeners for loop selection
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleLoopMouseMove);
      document.addEventListener('mouseup', handleLoopMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleLoopMouseMove);
      document.removeEventListener('mouseup', handleLoopMouseUp);
    };
  }, [isDragging, handleLoopMouseMove, handleLoopMouseUp]);

  // Close on escape or click outside
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e) => {
      if (isOpen && 
          containerRef.current &&
          !containerRef.current.contains(e.target) && 
          !anchorRef?.current?.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  // Generate timestamp markers - always show start, end, and evenly spaced markers
  const getTimeMarkers = useCallback(() => {
    if (!duration) return [];
    
    const { start, end, visibleDuration } = getVisibleRange();
    const markers = [];
    const addedTimes = new Set();
    
    // Always add start marker (0:00)
    if (start <= 0 && 0 <= end) {
      markers.push({ time: 0, position: timeToPosition(0), isEdge: true });
      addedTimes.add(0);
    }
    
    // Always add end marker
    if (start <= duration && duration <= end) {
      markers.push({ time: duration, position: timeToPosition(duration), isEdge: true });
      addedTimes.add(Math.floor(duration));
    }
    
    // Determine interval based on visible duration
    let interval;
    if (visibleDuration <= 60) interval = 15;
    else if (visibleDuration <= 180) interval = 30;
    else if (visibleDuration <= 600) interval = 60;
    else if (visibleDuration <= 1800) interval = 300;
    else interval = 600;
    
    // Add middle marker
    const middleTime = duration / 2;
    if (!addedTimes.has(Math.floor(middleTime)) && start <= middleTime && middleTime <= end) {
      markers.push({ time: middleTime, position: timeToPosition(middleTime), isMiddle: true });
      addedTimes.add(Math.floor(middleTime));
    }
    
    // Add evenly spaced markers
    const firstMarker = Math.ceil(start / interval) * interval;
    for (let time = firstMarker; time <= end; time += interval) {
      if (!addedTimes.has(Math.floor(time))) {
        const position = timeToPosition(time);
        if (position >= 0 && position <= 100) {
          markers.push({ time, position });
          addedTimes.add(Math.floor(time));
        }
      }
    }
    
    // Sort by position
    return markers.sort((a, b) => a.position - b.position);
  }, [duration, getVisibleRange, timeToPosition]);

  if (!isOpen) return null;

  const { start: visibleStart, end: visibleEnd } = getVisibleRange();
  const playheadPosition = timeToPosition(currentTime);
  const loopStartPos = loopStart !== null ? timeToPosition(loopStart) : null;
  const loopEndPos = loopEnd !== null ? timeToPosition(loopEnd) : null;

  return ReactDOM.createPortal(
    <div 
      ref={containerRef}
      className="fixed z-[9999] rounded-xl overflow-hidden"
      style={{
        top: anchorRef?.current ? anchorRef.current.getBoundingClientRect().bottom + 12 : '64px',
        right: '16px',
        width: '400px',
        animation: 'timeline-slide-in 0.2s ease-out forwards',
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-wave-dark/95 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
      <div className="absolute inset-0 border border-white/10 rounded-xl" />
      
      {/* Content */}
      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80 font-medium">Timeline</span>
            <span className="text-xs text-white/40">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {/* Zoom controls */}
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <ZoomOut className="w-4 h-4 text-white/60" />
            </button>
            <span className="text-xs text-white/40 w-10 text-center">{zoom}x</span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= getMaxZoom()}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-30"
            >
              <ZoomIn className="w-4 h-4 text-white/60" />
            </button>
            
            {/* Loop select toggle */}
            <button
              onClick={() => setIsSelectingLoop(!isSelectingLoop)}
              className={`p-1.5 rounded-lg transition-colors ml-2 ${
                isSelectingLoop ? 'bg-wave-accent/20 text-wave-accent' : 'hover:bg-white/10 text-white/60'
              }`}
              title="Select loop region"
            >
              <Repeat className="w-4 h-4" />
            </button>
            
            {/* Clear loop */}
            {loopStart !== null && (
              <button
                onClick={clearLoop}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/60"
                title="Clear loop"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Timestamps above track */}
        <div className="relative h-4 mb-1">
          <span className="absolute left-0 text-[10px] text-white/50">
            {formatTime(getVisibleRange().start)}
          </span>
          <span className="absolute left-1/2 -translate-x-1/2 text-[10px] text-white/50">
            {formatTime((getVisibleRange().start + getVisibleRange().end) / 2)}
          </span>
          <span className="absolute right-0 text-[10px] text-white/50">
            {formatTime(getVisibleRange().end)}
          </span>
        </div>

        {/* Timeline track */}
        <div 
          ref={timelineRef}
          onMouseDown={(e) => {
            if (isSelectingLoop) {
              handleLoopMouseDown(e);
            } else {
              handleTimelineClick(e);
            }
          }}
          onWheel={handleWheel}
          className={`relative h-14 rounded-lg overflow-hidden ${
            isSelectingLoop ? 'cursor-crosshair' : 'cursor-pointer'
          }`}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
        >
          {/* Waveform visual (consistent pattern) */}
          <div className="absolute inset-0 flex items-center pointer-events-none">
            {Array.from({ length: 80 }).map((_, i) => {
              // Use a deterministic pattern based on index
              const height = 25 + Math.sin(i * 0.4) * 20 + Math.sin(i * 0.15) * 15;
              return (
                <div
                  key={i}
                  className="flex-1 mx-px rounded-full bg-white/15"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>

          {/* Progress fill */}
          <div 
            className="absolute inset-y-0 left-0 bg-wave-accent/20 pointer-events-none"
            style={{ width: `${Math.max(0, Math.min(100, playheadPosition))}%` }}
          />

          {/* Loop region */}
          {loopStart !== null && loopEnd !== null && (
            <div
              className="absolute inset-y-0 bg-wave-accent/30 border-x-2 border-wave-accent pointer-events-none"
              style={{
                left: `${Math.min(loopStartPos, loopEndPos)}%`,
                width: `${Math.abs(loopEndPos - loopStartPos)}%`,
              }}
            />
          )}

          {/* Tick marks */}
          {getTimeMarkers().map(({ time, position, isEdge, isMiddle }) => (
            <div
              key={time}
              className={`absolute top-0 bottom-0 pointer-events-none ${
                isEdge || isMiddle ? 'border-l border-white/20' : 'border-l border-white/10'
              }`}
              style={{ left: `${position}%` }}
            />
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
            style={{ 
              left: `${Math.max(0, Math.min(100, playheadPosition))}%`,
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.6)',
            }}
          >
            {/* Playhead handle */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
          </div>
        </div>
        
        {/* Timestamps below track */}
        <div className="relative h-4 mt-1">
          <span className="absolute left-0 text-[10px] text-white/40">0:00</span>
          <span className="absolute left-1/2 -translate-x-1/2 text-[10px] text-white/40">
            {formatTime(duration / 2)}
          </span>
          <span className="absolute right-0 text-[10px] text-white/40">
            {formatTime(duration)}
          </span>
        </div>

        {/* Loop info */}
        {loopStart !== null && loopEnd !== null && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-white/50">
              <Repeat className="w-3 h-3 text-wave-accent" />
              <span>Loop: {formatTime(Math.min(loopStart, loopEnd))} - {formatTime(Math.max(loopStart, loopEnd))}</span>
            </div>
            <button
              onClick={() => onSeek?.(Math.min(loopStart, loopEnd))}
              className="flex items-center gap-1 text-white/50 hover:text-white/80 transition-colors"
            >
              <SkipBack className="w-3 h-3" />
              Go to start
            </button>
          </div>
        )}

        {/* Instructions */}
        <p className="mt-2 text-[10px] text-white/30 text-center">
          {isSelectingLoop 
            ? 'Click and drag to select loop region' 
            : 'Click to seek • Scroll to pan when zoomed'}
        </p>
      </div>
      
      {/* CSS for animation */}
      <style>{`
        @keyframes timeline-slide-in {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default Timeline;
