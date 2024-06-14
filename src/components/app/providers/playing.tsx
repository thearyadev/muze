import React, { useState, useContext, createContext } from "react";

const PlayingContext = createContext<{
  playing: boolean;
  togglePlayPause: () => void;
  setPlayingTrue: () => void;
  setPlayingFalse: () => void;
} | null>(null);
const usePlaying = () => useContext(PlayingContext);

const PlayingProvider: React.FC<{
  audioRef: React.RefObject<HTMLAudioElement>;
  children: React.ReactNode;
}> = ({ audioRef, children }) => {
  const [playing, setPlaying] = useState(false);
  const togglePlayPause = () => {
    setPlaying((prevPlaying) => !prevPlaying);

    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {
        return;
      });
      return;
    }
    audioRef.current.pause();
  };

  const setPlayingTrue = () => {
    if (!audioRef.current) return;
    setPlaying(true);
    audioRef.current.play().catch(() => {
      return;
    });
  };

  const setPlayingFalse = () => {
    if (!audioRef.current) return;
    setPlaying(false);
    audioRef.current.pause();
  };
  return (
    <PlayingContext.Provider
      value={{
        playing: playing,
        togglePlayPause: togglePlayPause,
        setPlayingTrue: setPlayingTrue,
        setPlayingFalse: setPlayingFalse,
      }}
    >
      {children}
    </PlayingContext.Provider>
  );
};

export { usePlaying, PlayingProvider };
