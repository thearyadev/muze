"use client";
import React, { useEffect } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "~/server/api/root";
import { useHotkeys } from "@mantine/hooks";

type RouterOutput = inferRouterOutputs<AppRouter>;

type TrackQuery = RouterOutput["library"]["getTrack"];

type PlayerContextType = ReturnType<typeof usePlayerState>;

type ResumeData = {
  track: TrackQuery | null;
  position: number | null;
  volume: number | null;
};

function usePlayerState() {
  const [trackData, setTrackData] = React.useState<TrackQuery>(null);
  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState([0]);
  const [maxPosition, setMaxPosition] = React.useState(0);
  const [volume, setVolume] = React.useState(0);
  const [loop, setLoop] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const changeTrack = async (trackData: TrackQuery, play: boolean) => {
    setTrackData(trackData);
    writeTrackToLocalStorage(trackData);
    setPlaying(false);
    setPosition([0]);

    if (play) {
      setTimeout(() => {
        if (!audioRef.current) return;
        audioRef.current.play();
        setPlaying(true);
      }, 10);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] as number);
    if (!audioRef.current) return;
    audioRef.current.volume = (value[0] as number) / 100;
    localStorage.setItem("volume", (value[0] as number).toString());
  };

  const handlePlayPause = () => {
    setPlaying((prevPlaying) => !prevPlaying);
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const handleTrackComplete = () => {
    setPlaying(false);
    if (loop) {
      if (!audioRef.current) return;
      audioRef.current.play();
      setPlaying(true);
    }
    // if no repeat, check queue
    // if no queue, do nothing
  };
  const handleTimeChange = () => {
    if (!audioRef.current) return;

    setPosition([audioRef.current.currentTime]);
    writePositionToLocalStorage(audioRef.current.currentTime);
  };
  const handleLoopBtnClick = () => {
    setLoop((prevLoop) => !prevLoop);
    localStorage.setItem("loop", loop ? "false" : "true");
  };
  useHotkeys([["space", handlePlayPause]], ["INPUT", "TEXTAREA"]);

  useEffect(() => {
    const { track, position, volume } = readTrackFromLocalStorage();
    if (track) {
      changeTrack(track, false);
      setPosition([position ? position : 0]);
      if (audioRef.current) {
        audioRef.current.currentTime = position ? position : 0;
      }
      setPlaying(false);
      setVolume(volume !== null ? volume : 50); // 0 is falsey ...
    }
    if (navigator) {
      navigator.mediaSession.setActionHandler("play", handlePlayPause);
      navigator.mediaSession.setActionHandler("pause", handlePlayPause);
    }

    return () => {
      if (navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      }
    };
  }, []);
  return {
    track: trackData,
    playing: playing,
    setPlaying: setPlaying,
    changeTrack: changeTrack,
    position: position,
    setPosition: setPosition,
    maxPosition: maxPosition,
    setMaxPosition: setMaxPosition,
    volume: volume,
    setVolume: setVolume,
    loop: loop,
    setLoop: setLoop,
    writePositionToLocalStorage: writePositionToLocalStorage,
    audioRef: audioRef,
    handleVolumeChange: handleVolumeChange,
    handlePlayPause: handlePlayPause,
    handleTrackComplete: handleTrackComplete,
    handleLoopBtnClick: handleLoopBtnClick,
    handleTimeChange: handleTimeChange,
  };
}

export const PlayerContext = React.createContext<PlayerContextType>(
  {} as PlayerContextType,
);

function writeTrackToLocalStorage(track: TrackQuery) {
  localStorage.setItem("track", JSON.stringify(track));
}
function writePositionToLocalStorage(position: number) {
  localStorage.setItem("position", position.toString());
}
function readTrackFromLocalStorage(): ResumeData {
  const track = localStorage.getItem("track");
  const position = localStorage.getItem("position");
  const volume = localStorage.getItem("volume");
  return {
    track: track ? JSON.parse(track) : null,
    position: position ? parseInt(position) : null,
    volume: volume ? parseInt(volume) : null,
  };
}

export default function PlayerContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = usePlayerState();
  return (
    <>
      <audio
        id={"audo"}
        ref={value.audioRef}
        src={value.track ? `/api/track_data?id=${value.track?.id}` : undefined}
        onTimeUpdate={value.handleTimeChange}
        onCanPlay={() => {
          if (!value.audioRef.current) return;
          value.setMaxPosition(value.audioRef.current.duration);
          value.audioRef.current.volume = value.volume / 100;
        }}
        onEnded={value.handleTrackComplete}
      />
      <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
    </>
  );
}
