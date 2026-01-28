import { useEffect, useRef, useState, useCallback } from 'react';

// Unique ID for the YouTube player container
const PLAYER_CONTAINER_ID = 'wavetune-youtube-player';

// Load YouTube IFrame API
const loadYouTubeAPI = () => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    // Check if script is already loading
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      // Wait for it to load
      const checkReady = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkReady);
          resolve(window.YT);
        }
      }, 100);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      resolve(window.YT);
    };
  });
};

export const useYouTubePlayer = () => {
  const playerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [volume, setVolumeState] = useState(75);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const initializingRef = useRef(false);

  // Initialize YouTube player
  useEffect(() => {
    let mounted = true;

    const initPlayer = async () => {
      // Prevent double initialization
      if (initializingRef.current || playerRef.current) return;
      initializingRef.current = true;

      const YT = await loadYouTubeAPI();
      
      if (!mounted) return;

      // Ensure container exists
      let container = document.getElementById(PLAYER_CONTAINER_ID);
      if (!container) {
        container = document.createElement('div');
        container.id = PLAYER_CONTAINER_ID;
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.width = '1px';
        container.style.height = '1px';
        container.style.overflow = 'hidden';
        document.body.appendChild(container);
      }

      try {
        const isFileProtocol = window.location.protocol === 'file:';
        const playerVars = {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
        };
        // Avoid setting origin for file:// (YT rejects null origin)
        if (!isFileProtocol && window.location.origin) {
          playerVars.origin = window.location.origin;
        }

        playerRef.current = new YT.Player(PLAYER_CONTAINER_ID, {
          height: '1',
          width: '1',
          playerVars,
          events: {
            onReady: (event) => {
              if (mounted) {
                console.log('YouTube player ready');
                setIsReady(true);
                event.target.setVolume(volume);
              }
            },
            onStateChange: (event) => {
              if (!mounted) return;
              
              console.log('YouTube state changed:', event.data);
              // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering, 5: cued
              if (event.data === 1) {
                console.log('Video is now PLAYING');
                setIsPlaying(true);
                setDuration(event.target.getDuration());
              } else if (event.data === 2) {
                console.log('Video is now PAUSED');
                setIsPlaying(false);
              } else if (event.data === 0) {
                console.log('Video ENDED - looping');
                setIsPlaying(false);
                // Loop when ended
                event.target.seekTo(0);
                event.target.playVideo();
              } else if (event.data === 3) {
                console.log('Video is BUFFERING');
              } else if (event.data === 5) {
                console.log('Video is CUED and ready');
              }
            },
            onError: (event) => {
              console.error('YouTube player error:', event.data);
            },
          },
        });
      } catch (err) {
        console.error('Failed to create YouTube player:', err);
        initializingRef.current = false;
      }
    };

    initPlayer();

    return () => {
      mounted = false;
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
        playerRef.current = null;
      }
      initializingRef.current = false;
    };
  }, []);

  // Update current time periodically when playing
  useEffect(() => {
    let interval;
    if (isPlaying && playerRef.current) {
      interval = setInterval(() => {
        const time = playerRef.current.getCurrentTime();
        if (time) setCurrentTime(time);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Load a video (cue it for playback)
  const loadVideo = useCallback((videoId) => {
    if (!playerRef.current || !isReady) {
      console.log('Cannot load video - player not ready');
      return;
    }
    
    console.log('Loading video:', videoId);
    setCurrentVideoId(videoId);
    playerRef.current.cueVideoById(videoId);
  }, [isReady]);

  // Play
  const play = useCallback(() => {
    if (!playerRef.current || !isReady) {
      console.log('Cannot play - player not ready');
      return;
    }
    console.log('Playing video');
    playerRef.current.playVideo();
  }, [isReady]);

  // Pause
  const pause = useCallback(() => {
    if (!playerRef.current || !isReady) {
      console.log('Cannot pause - player not ready');
      return;
    }
    console.log('Pausing video');
    playerRef.current.pauseVideo();
  }, [isReady]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!playerRef.current || !isReady) {
      console.log('Cannot toggle - player not ready');
      return;
    }
    
    // Get current state directly from player
    const state = playerRef.current.getPlayerState();
    console.log('Toggle play - current state:', state);
    
    // 1 = playing, anything else = not playing
    if (state === 1) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, [isReady]);

  // Set volume (0-100)
  const setVolume = useCallback((vol) => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.setVolume(vol);
    setVolumeState(vol);
  }, [isReady]);

  // Mute
  const mute = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.mute();
  }, [isReady]);

  // Unmute
  const unmute = useCallback(() => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.unMute();
  }, [isReady]);

  // Seek to time (seconds)
  const seekTo = useCallback((seconds) => {
    if (!playerRef.current || !isReady) return;
    playerRef.current.seekTo(seconds, true);
  }, [isReady]);

  return {
    isReady,
    isPlaying,
    currentVideoId,
    volume,
    duration,
    currentTime,
    loadVideo,
    play,
    pause,
    togglePlay,
    setVolume,
    mute,
    unmute,
    seekTo,
  };
};

export default useYouTubePlayer;
