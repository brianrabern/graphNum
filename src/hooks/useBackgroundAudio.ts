import { useEffect, useRef, useState } from 'react';

interface UseBackgroundAudioOptions {
  src?: string;
  volume?: number;
  loop?: boolean;
  autoplay?: boolean;
}

/**
 * Hook to manage background audio that plays on load
 *
 * To use:
 * 1. Add an audio file to the public/ folder (e.g., public/ambient.mp3)
 * 2. Call: useBackgroundAudio({ src: '/ambient.mp3', volume: 0.3, loop: true })
 *
 * Free audio sources:
 * - freesound.org (requires account, CC0/public domain)
 * - pixabay.com/music (free, no attribution needed)
 * - incompetech.com (Kevin MacLeod, attribution required)
 * - zapsplat.com (free with account)
 */
export function useBackgroundAudio(options: UseBackgroundAudioOptions = {}) {
  const {
    src,
    volume = 0.3,
    loop = true,
    autoplay = true,
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    if (!src) return;

    // Create audio element
    const audio = new Audio(src);
    audio.volume = volume;
    audio.loop = loop;
    audioRef.current = audio;

    // Handle user interaction requirement (browser autoplay policy)
    const handleUserInteraction = () => {
      if (!hasUserInteracted && autoplay) {
        audio.play().catch(() => {
          // Autoplay prevented - user interaction required
        });
        setHasUserInteracted(true);
      }
    };

    // Try to play on load if autoplay is enabled
    if (autoplay) {
      // Try immediate play (may fail due to browser policy)
      audio.play().catch(() => {
        // If it fails, wait for user interaction
        document.addEventListener('click', handleUserInteraction, { once: true });
        document.addEventListener('keydown', handleUserInteraction, { once: true });
      });
    }

    // Update playing state
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', () => setIsPlaying(false));

    // Cleanup
    return () => {
      audio.pause();
      audio.src = '';
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [src, volume, loop, autoplay, hasUserInteracted]);

  const play = () => {
    audioRef.current?.play().catch(console.error);
  };

  const pause = () => {
    audioRef.current?.pause();
  };

  const setVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  };

  return {
    isPlaying,
    play,
    pause,
    setVolume,
  };
}
