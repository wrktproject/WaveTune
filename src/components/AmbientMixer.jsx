import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { CloudRain, Waves, Trees, Coffee, Flame, Droplets } from 'lucide-react';

// Elemental colors for each sound
const elementalColors = {
  rain: { primary: '#2563EB', secondary: '#3B82F6', glow: 'rgba(37, 99, 235, 0.35)' }, // Deep water blue
  waves: { primary: '#0891B2', secondary: '#06B6D4', glow: 'rgba(8, 145, 178, 0.35)' }, // Deep ocean cyan
  forest: { primary: '#16A34A', secondary: '#22C55E', glow: 'rgba(22, 163, 74, 0.35)' }, // Deep forest green
  lake: { primary: '#0E7490', secondary: '#14B8A6', glow: 'rgba(14, 116, 144, 0.35)' }, // Calm lake teal
  cafe: { primary: '#D97706', secondary: '#F59E0B', glow: 'rgba(217, 119, 6, 0.35)' }, // Deep amber
  fireplace: { primary: '#DC2626', secondary: '#EF4444', glow: 'rgba(220, 38, 38, 0.35)' }, // Deep fire red
};

// Ambient sound definitions with YouTube video IDs
const ambientSounds = [
  { id: 'rain', name: 'Rain', icon: CloudRain, youtubeId: 'OHPQTbIh4qc' },
  { id: 'waves', name: 'Waves', icon: Waves, youtubeId: 'yvd8PObLWsg' },
  { id: 'forest', name: 'Forest', icon: Trees, youtubeId: 'FxAgAyZYXJ8' },
  { id: 'lake', name: 'Lake', icon: Droplets, youtubeId: 'Q-sZipetAEc' },
  { id: 'cafe', name: 'Café', icon: Coffee, youtubeId: 'h2zkV-l_TbY' },
  { id: 'fireplace', name: 'Fire', icon: Flame, youtubeId: 'XcyX-1J4P1Q' },
];

// Global state for ambient players (persists across component mounts)
let ambientPlayers = {};
let ambientVolumes = {};
let ytApiReady = false;
let ytApiLoading = false;

// Load YouTube IFrame API once
const loadYouTubeAPI = () => {
  if (ytApiReady || ytApiLoading) return Promise.resolve();
  
  ytApiLoading = true;
  
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      ytApiReady = true;
      ytApiLoading = false;
      resolve();
      return;
    }
    
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      ytApiReady = true;
      ytApiLoading = false;
      if (existingCallback) existingCallback();
      resolve();
    };
    
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });
};

// Create or get ambient player
const getOrCreatePlayer = (soundId, youtubeId, onReady) => {
  // Check if API is ready
  if (!window.YT || !window.YT.Player) {
    console.log('YouTube API not ready yet for ambient player:', soundId);
    return null;
  }
  
  if (ambientPlayers[soundId]) {
    onReady?.(ambientPlayers[soundId]);
    return ambientPlayers[soundId];
  }
  
  // Create container if doesn't exist
  let container = document.getElementById(`ambient-player-${soundId}`);
  if (!container) {
    container = document.createElement('div');
    container.id = `ambient-player-${soundId}`;
    container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;pointer-events:none;';
    document.body.appendChild(container);
  }
  
  try {
    const player = new window.YT.Player(container.id, {
      videoId: youtubeId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        loop: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        playlist: youtubeId, // Required for looping
      },
      events: {
        onReady: (event) => {
          ambientPlayers[soundId] = event.target;
          event.target.setVolume(0);
          onReady?.(event.target);
        },
        onStateChange: (event) => {
          // Loop the video when it ends
          if (event.data === window.YT?.PlayerState?.ENDED) {
            event.target.seekTo(0);
            event.target.playVideo();
          }
        },
      },
    });
    
    return player;
  } catch (e) {
    console.error('Error creating ambient player:', e);
    return null;
  }
};

// Simple vertical slider component
const VerticalSlider = ({ value, onChange, colors }) => {
  const sliderRef = useRef(null);

  const handleInteraction = useCallback((e) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, 100 - (y / rect.height) * 100));
    onChange(Math.round(percentage));
  }, [onChange]);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    handleInteraction(e);
    
    const handleMouseMove = (e) => handleInteraction(e);
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [handleInteraction]);

  const isActive = value > 0;

  return (
    <div
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      className="relative w-1.5 h-24 rounded-full cursor-pointer"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
    >
      {/* Filled portion */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-full"
        style={{
          height: `${value}%`,
          background: isActive 
            ? `linear-gradient(to top, ${colors.primary}, ${colors.secondary})`
            : 'transparent',
          boxShadow: isActive ? `0 0 8px ${colors.glow}` : 'none',
        }}
      />
      {/* Circle indicator - always visible */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full"
        style={{
          bottom: `calc(${value}% - 5px)`,
          backgroundColor: isActive ? colors.secondary : 'rgba(255, 255, 255, 0.3)',
          boxShadow: isActive ? `0 0 6px ${colors.glow}` : 'none',
        }}
      />
    </div>
  );
};

const AmbientMixer = ({ isOpen, onClose, anchorRef }) => {
  const [volumes, setVolumes] = useState(() => {
    // Restore volumes from global state
    const initial = {};
    ambientSounds.forEach(sound => {
      initial[sound.id] = ambientVolumes[sound.id] || 0;
    });
    return initial;
  });
  const [apiReady, setApiReady] = useState(ytApiReady);
  const playersInitialized = useRef(false);

  // Load YouTube API on mount
  useEffect(() => {
    loadYouTubeAPI().then(() => {
      // Add a small delay to ensure API is fully initialized
      setTimeout(() => {
        if (window.YT && window.YT.Player) {
          setApiReady(true);
        }
      }, 100);
    });
  }, []);

  // Initialize players when API is ready (only if there are active volumes)
  useEffect(() => {
    if (!apiReady || playersInitialized.current) return;
    if (!window.YT || !window.YT.Player) return;
    
    playersInitialized.current = true;
    
    // Only create players for sounds that have volume > 0
    ambientSounds.forEach(sound => {
      const vol = ambientVolumes[sound.id] || 0;
      if (vol > 0) {
        getOrCreatePlayer(sound.id, sound.youtubeId, (player) => {
          player.setVolume(vol);
          player.playVideo();
        });
      }
    });
  }, [apiReady]);

  // Update player when volume changes
  const handleVolumeChange = useCallback((soundId, value) => {
    setVolumes(prev => ({
      ...prev,
      [soundId]: value
    }));
    
    // Store in global state
    ambientVolumes[soundId] = value;
    
    // Update the player
    const player = ambientPlayers[soundId];
    if (player && typeof player.setVolume === 'function') {
      player.setVolume(value);
      
      try {
        const state = player.getPlayerState();
        if (value > 0 && state !== 1) { // Not playing
          player.playVideo();
        } else if (value === 0 && state === 1) { // Playing
          player.pauseVideo();
        }
      } catch (e) {
        // Player not ready yet
      }
    } else if (value > 0 && apiReady) {
      // Player not created yet, create it
      const sound = ambientSounds.find(s => s.id === soundId);
      if (sound) {
        getOrCreatePlayer(soundId, sound.youtubeId, (newPlayer) => {
          newPlayer.setVolume(value);
          newPlayer.playVideo();
        });
      }
    }
  }, [apiReady]);

  // Close on escape key or click outside (but not on the anchor button)
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e) => {
      // Don't close if clicking inside the popup or on the anchor button
      if (isOpen && 
          !e.target.closest('.ambient-mixer-popup') && 
          !anchorRef?.current?.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="ambient-mixer-popup fixed z-[9999] rounded-xl overflow-hidden"
      style={{
        top: anchorRef?.current ? anchorRef.current.getBoundingClientRect().bottom + 12 : '64px',
        right: '16px',
        animation: 'mixer-slide-in 0.2s ease-out forwards',
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-wave-dark/95 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
      <div className="absolute inset-0 border border-white/10 rounded-xl" />
      
      {/* Content */}
      <div className="relative p-4 pb-3">
        {/* Vertical Sliders */}
        <div className="flex items-end justify-center gap-5">
          {ambientSounds.map((sound) => {
            const IconComponent = sound.icon;
            const isActive = volumes[sound.id] > 0;
            const colors = elementalColors[sound.id];
            
            return (
              <div key={sound.id} className="flex flex-col items-center gap-2.5">
                {/* Custom Vertical Slider */}
                <VerticalSlider
                  value={volumes[sound.id]}
                  onChange={(value) => handleVolumeChange(sound.id, value)}
                  colors={colors}
                />
                
                {/* Icon */}
                <div 
                  className="p-1.5 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: isActive ? `${colors.primary}20` : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? colors.primary : 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                
                {/* Name */}
                <span 
                  className="text-[9px] transition-colors duration-200"
                  style={{ color: isActive ? colors.primary : 'rgba(255, 255, 255, 0.4)' }}
                >
                  {sound.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* CSS for animation */}
      <style>{`
        @keyframes mixer-slide-in {
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

export default AmbientMixer;
