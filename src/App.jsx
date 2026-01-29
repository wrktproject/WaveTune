import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import BackgroundDots from './components/BackgroundDots';
import WaveAnimation from './components/WaveAnimation';
import Header from './components/Header';
import Timer from './components/Timer';
import PlayerControls from './components/PlayerControls';
import TrackInfo from './components/TrackInfo';
import useYouTubePlayer from './hooks/useYouTubePlayer';

// Track data with YouTube video IDs
// To add your own tracks, find ambient/focus music on YouTube and copy the video ID
// The video ID is the part after "v=" in the URL, e.g., https://youtube.com/watch?v=VIDEO_ID
const tracksByMode = {
  'Liminal': [
    {
      id: 1,
      title: 'February, 22, 2001 - Liminal (42 min)',
      neuralEffect: 'Medium Neural Effect',
      tags: ['AMBIENT', 'FOCUS'],
      youtubeId: 'hR5Km4qktok', // lofi hip hop radio - beats to relax/study to
      artwork: null,
    },
    {
      id: 2,
      title: 'Alone in such an empty world (1 hr)',
      neuralEffect: 'High Neural Effect',
      tags: ['ATMOSPHERIC'],
      youtubeId: 'mu1dVlu9KIo', // synthwave radio
      artwork: null,
    },
    {
      id: 3,
      title: 'pov: you fall asleep inside another dream (1 hr)',
      neuralEffect: 'Low Neural Effect',
      tags: ['ELECTRONIC' , 'DREAM'],
      youtubeId: '2kNovbTwrr4', // dark ambient
      artwork: null,
    },
  ],
  'Games': [
    {
      id: 4,
      title: 'Minecraft on a friday night (3 hr)',
      neuralEffect: 'Low Neural Effect',
      tags: ['CALM', 'NATURE'],
      youtubeId: '_Y00YWhwtAI', // relaxing music
      artwork: null,
    },
    {
      id: 4,
      title: 'Super Mario Odyssey Music (1 hr)',
      neuralEffect: 'Low Neural Effect',
      tags: ['CALM', 'NOSTALGIA'],
      youtubeId: 'MqWSWYyFAic', // relaxing music
      artwork: null,
    },
    {
      id: 4,
      title: 'Tostarena: Night',
      neuralEffect: 'Low Neural Effect',
      tags: ['CALM', 'NOSTALGIA'],
      youtubeId: 'BdphGjFITLs', // relaxing music
      artwork: null,
    },

  ],
  'Focus': [
    {
      id: 1,
      title: 'escape reality.',
      neuralEffect: 'Medium Neural Effect',
      tags: ['AMBIENT', 'FOCUS'],
      youtubeId: 'D4pGB3ijptw', // lofi hip hop radio - beats to relax/study to
      artwork: null,
    },
    {
      id: 2,
      title: 'you need to sleep.',
      neuralEffect: 'High Neural Effect',
      tags: ['DOWN'],
      youtubeId: '2AH5t_o7lmg', // synthwave radio
      artwork: null,
    },
    {
      id: 4,
      title: 'if life was a video game, this would be the menu music',
      neuralEffect: 'Low Neural Effect',
      tags: ['PEACE'],
      youtubeId: 'cScPVRLM-50', // dark ambient
      artwork: null,
    },
    {
      id: 5,
      title: 'Ambient music for places you shouldnt be',
      neuralEffect: 'Low Neural Effect',
      tags: ['ALONE'],
      youtubeId: 'i7lkCvPPO1o', // dark ambient
      artwork: null,
    },
    {
      id: 6,
      title: 'Magic - Medasin (slowed)',
      neuralEffect: 'Low Neural Effect',
      tags: ['CALM', 'BLUE'],
      youtubeId: 'lnIOHXLdniM', // ocean waves
      artwork: null,
    },
    {
      id: 7,
      title: 'Everyone is asleep except you.',
      neuralEffect: 'Low Neural Effect',
      tags: ['NATURE', 'SOFT'],
      youtubeId: 'If_RqCOtWZ8', // ocean waves
      artwork: null,
    },
    {
      id: 7,
      title: 'Calm your stress',
      neuralEffect: 'Low Neural Effect',
      tags: ['SOFT', 'WATER'],
      youtubeId: 'l_nZO3JVaq8', // ocean waves
      artwork: null,
    },
  ],
};

// Module-level cache for transition data (survives React Strict Mode remounts)
let cachedTransitionData = null;

// Main Player Component
const PlayerPage = () => {
  // YouTube player hook
  const youtube = useYouTubePlayer();
  
  // No auth transition needed - always start fresh
  const [transitionData] = useState(() => {
    cachedTransitionData = { isFromAuth: false, timeOffset: 0 };
    return cachedTransitionData;
  });
  
  const isFromAuthTransition = false;
  
  // Animation state for entrance - staggered phases (all start hidden)
  const [headerVisible, setHeaderVisible] = useState(false);
  const [timerVisible, setTimerVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [transitionComplete, setTransitionComplete] = useState(!isFromAuthTransition);
  
  // Wave animation state for transition
  const [waveSpeedMultiplier, setWaveSpeedMultiplier] = useState(isFromAuthTransition ? 2.5 : 1);
  const [wavesPlaying, setWavesPlaying] = useState(isFromAuthTransition);
  
  // Trigger staggered entrance animation on mount
  useEffect(() => {
    if (isFromAuthTransition) {
      // Coming from auth - stagger elements while waves are moving fast
      // Elements animate in with nice delays
      const headerTimer = setTimeout(() => setHeaderVisible(true), 100);
      const timerTimer = setTimeout(() => setTimerVisible(true), 400);
      const footerTimer = setTimeout(() => setFooterVisible(true), 700);
      
      // Start slowing down waves AFTER elements are in
      const slowDown1 = setTimeout(() => setWaveSpeedMultiplier(2), 1000);
      const slowDown2 = setTimeout(() => setWaveSpeedMultiplier(1.5), 1300);
      const slowDown3 = setTimeout(() => setWaveSpeedMultiplier(1), 1600);
      const slowDown4 = setTimeout(() => setWaveSpeedMultiplier(0.5), 1900);
      
      // Stop waves (paused state) and mark transition complete
      const stopWaves = setTimeout(() => {
        setWavesPlaying(false);
        setTransitionComplete(true);
      }, 2200);
      
      return () => {
        clearTimeout(headerTimer);
        clearTimeout(timerTimer);
        clearTimeout(footerTimer);
        clearTimeout(slowDown1);
        clearTimeout(slowDown2);
        clearTimeout(slowDown3);
        clearTimeout(slowDown4);
        clearTimeout(stopWaves);
      };
    } else {
      // Direct load - quick staggered animation
      const headerTimer = setTimeout(() => setHeaderVisible(true), 50);
      const timerTimer = setTimeout(() => setTimerVisible(true), 150);
      const footerTimer = setTimeout(() => setFooterVisible(true), 250);
      return () => {
        clearTimeout(headerTimer);
        clearTimeout(timerTimer);
        clearTimeout(footerTimer);
      };
    }
  }, [isFromAuthTransition]);
  
  // Player state
  const [currentMode, setCurrentMode] = useState('Focus');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(true);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [loopRegion, setLoopRegion] = useState(null); // { start, end } for custom loop

  // Get tracks for current mode
  const currentTracks = tracksByMode[currentMode] || tracksByMode.Focus;
  const currentTrack = currentTracks[currentTrackIndex] || currentTracks[0];

  // Sync with YouTube player state
  const isPlaying = youtube.isPlaying;

  // Track if we were playing before track change (for auto-play on skip)
  const wasPlayingRef = useRef(false);
  const previousTrackIdRef = useRef(null);

  // Load video when track or mode changes
  useEffect(() => {
    console.log('Load video effect - isReady:', youtube.isReady, 'videoId:', currentTrack?.youtubeId);
    if (youtube.isReady && currentTrack?.youtubeId) {
      // Check if this is a track change (not initial load)
      const isTrackChange = previousTrackIdRef.current !== null && 
                           previousTrackIdRef.current !== currentTrack.youtubeId;
      
      console.log('Loading video:', currentTrack.youtubeId, 'wasPlaying:', wasPlayingRef.current);
      previousTrackIdRef.current = currentTrack.youtubeId;
      youtube.loadVideo(currentTrack.youtubeId);
      
      // Auto-play if we were playing before (and this is a track change)
      if (isTrackChange && wasPlayingRef.current) {
        // Small delay to ensure video is loaded
        setTimeout(() => {
          console.log('Auto-playing next track');
          youtube.play();
        }, 300);
      }
    }
  }, [youtube.isReady, currentTrack?.youtubeId, youtube.loadVideo, youtube.play]);

  // Sync volume with YouTube
  useEffect(() => {
    if (youtube.isReady) {
      if (isMuted) {
        youtube.mute();
      } else {
        youtube.unmute();
        youtube.setVolume(volume);
      }
    }
  }, [youtube.isReady, volume, isMuted, youtube.setVolume, youtube.mute, youtube.unmute]);

  // Sync waves with player state (only after transition is complete)
  useEffect(() => {
    if (transitionComplete) {
      setWavesPlaying(isPlaying);
      setWaveSpeedMultiplier(1);
    }
  }, [isPlaying, transitionComplete]);

  // Reset track index when mode changes
  useEffect(() => {
    setCurrentTrackIndex(0);
    setLoopRegion(null); // Clear loop when changing modes
  }, [currentMode]);

  // Handle loop region - loop back to start when reaching end
  useEffect(() => {
    if (!loopRegion || !isPlaying) return;
    
    const checkLoop = setInterval(() => {
      if (youtube.currentTime >= loopRegion.end) {
        youtube.seekTo(loopRegion.start);
      }
    }, 100);
    
    return () => clearInterval(checkLoop);
  }, [loopRegion, isPlaying, youtube.currentTime, youtube.seekTo]);

  // Timeline handlers
  const handleSeek = useCallback((time) => {
    youtube.seekTo(time);
  }, [youtube.seekTo]);

  const handleLoopChange = useCallback((region) => {
    setLoopRegion(region);
  }, []);

  // Playback controls
  const handlePlayPause = useCallback(() => {
    console.log('handlePlayPause called, current isPlaying:', youtube.isPlaying);
    youtube.togglePlay();
  }, [youtube]);

  const handleNext = useCallback(() => {
    // Remember if we were playing before skipping
    wasPlayingRef.current = youtube.isPlaying;
    const tracks = tracksByMode[currentMode] || tracksByMode.Liminal;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  }, [currentMode, youtube.isPlaying]);

  const handlePrevious = useCallback(() => {
    // Remember if we were playing before skipping
    wasPlayingRef.current = youtube.isPlaying;
    const tracks = tracksByMode[currentMode] || tracksByMode.Focus;
    setCurrentTrackIndex((prev) => 
      prev === 0 ? tracks.length - 1 : prev - 1
    );
  }, [currentMode, youtube.isPlaying]);

  const handleToggleLoop = useCallback(() => {
    setIsLooping((prev) => !prev);
  }, []);

  const handleVolumeChange = useCallback((newVolume) => {
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const handleLike = useCallback(() => {
    setIsLiked((prev) => !prev);
  }, []);

  const handleDislike = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const handleModeChange = useCallback((mode) => {
    setCurrentMode(mode);
  }, []);

  const handleBack = useCallback(() => {
    console.log('Navigate back');
  }, []);


  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-wave-darker">
      {/* Animated background */}
      <BackgroundDots />
      
      {/* Wave animation */}
      <WaveAnimation 
        isPlaying={wavesPlaying} 
        speedMultiplier={waveSpeedMultiplier}
        initialTimeOffset={transitionData.timeOffset}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className={`relative z-50 transition-all duration-700 ease-out ${
          headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
        }`}>
          <Header 
            currentMode={currentMode}
            onModeChange={handleModeChange}
            onBack={handleBack}
            currentTime={youtube.currentTime}
            duration={youtube.duration}
            onSeek={handleSeek}
            onLoopChange={handleLoopChange}
            isPlaying={isPlaying}
          />
        </div>

        {/* Main player area */}
        <main className={`flex-1 flex flex-col items-center justify-center px-4 transition-all duration-700 ease-out ${
          timerVisible ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-90 blur-sm'
        }`}>
          <Timer isPlaying={isPlaying} mode={currentMode} />
        </main>

        {/* Bottom section */}
        <footer className={`pb-6 sm:pb-8 transition-all duration-700 ease-out ${
          footerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Three column layout: Track info | Player controls | Actions */}
          <div className="grid grid-cols-3 items-center w-full px-4 sm:px-6">
            {/* Track info - left */}
            <TrackInfo
              track={currentTrack}
              position="left"
            />

            {/* Player controls - center */}
            <div className="flex justify-center">
              <PlayerControls
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrevious={handlePrevious}
                isLooping={isLooping}
                onToggleLoop={handleToggleLoop}
                volume={volume}
                onVolumeChange={handleVolumeChange}
                isMuted={isMuted}
                onToggleMute={handleToggleMute}
              />
            </div>

            {/* Actions - right */}
            <TrackInfo
              track={currentTrack}
              isLiked={isLiked}
              onLike={handleLike}
              onDislike={handleDislike}
              position="right"
            />
          </div>
        </footer>
      </div>
    </div>
  );
};

function App() {
  const Router = window?.location?.protocol === 'file:' ? HashRouter : BrowserRouter;

  return (
    <Router>
      <PlayerPage />
    </Router>
  );
}

export default App;
