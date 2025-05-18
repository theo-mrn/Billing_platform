"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: string | null;
  volume: number;
  togglePlay: () => void;
  setCurrentTrack: (track: string) => void;
  setVolume: (volume: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export function MusicProvider({ children }: { children: ReactNode }) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.5);

  // Initialize audio on client side only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAudio(new Audio());
    }
  }, []);

  // Handle volume changes
  useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
  }, [volume, audio]);

  // Handle track changes
  useEffect(() => {
    if (!audio || !currentTrack) return;
    
    // Reset the audio element
    audio.pause();
    audio.src = currentTrack;
    audio.load();
    
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrack, audio]);

  // Handle play/pause
  useEffect(() => {
    if (!audio || !currentTrack) return;
    
    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, audio, currentTrack]);

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        currentTrack,
        volume,
        togglePlay,
        setCurrentTrack,
        setVolume,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
} 