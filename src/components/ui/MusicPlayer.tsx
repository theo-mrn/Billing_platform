"use client"

import { useMusic } from "@/contexts/MusicContext";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "./button";
import { Slider } from "@/components/ui/slider";
import { useState, useEffect } from "react";

const TRACKS = [
  { name: "Zen", path: "/sounds/zen.mp3" },
  { name: "Pluie", path: "/sounds/rain.mp3" },
  { name: "Océan", path: "/sounds/ocean.mp3" },
  { name: "Nature", path: "/sounds/nature.mp3" },
  { name: "Forêt", path: "/sounds/forest.mp3" },
  { name: "Baleines", path: "/sounds/baleines.mp3" },
];

export function MusicPlayer() {
  const { isPlaying, currentTrack, volume, togglePlay, setCurrentTrack, setVolume } = useMusic();
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  useEffect(() => {
    if (!isMuted) {
      setPreviousVolume(volume);
    }
  }, [volume, isMuted]);

  const handleVolumeToggle = () => {
    if (isMuted) {
      setVolume(previousVolume);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col gap-2 p-2 rounded-lg bg-secondary/50">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={togglePlay}
          disabled={!currentTrack}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleVolumeToggle}
          disabled={!currentTrack}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Slider
          className="w-20"
          value={[volume * 100]}
          max={100}
          step={1}
          onValueChange={(value: number[]) => setVolume(value[0] / 100)}
          disabled={!currentTrack}
        />
      </div>
      <select
        className="w-full bg-transparent text-sm p-1 rounded border border-border"
        value={currentTrack || ""}
        onChange={(e) => setCurrentTrack(e.target.value)}
      >
        <option value="">Choisir une ambiance</option>
        {TRACKS.map((track) => (
          <option key={track.path} value={track.path}>
            {track.name}
          </option>
        ))}
      </select>
    </div>
  );
} 