"use client";
import React, { useEffect } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "~/server/api/root";

type TrackQuery = RouterOutput["library"]["getTrack"];

type PlayerContextType = {
  track: TrackQuery;
  playing: boolean;
  setPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  changeTrack: (trackData: TrackQuery) => void;
  position: number[];
  setPosition: React.Dispatch<React.SetStateAction<number[]>>;
  maxPosition: number;
  setMaxPosition: React.Dispatch<React.SetStateAction<number>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  loop: boolean;
  setLoop: React.Dispatch<React.SetStateAction<boolean>>;
  writePositionToLocalStorage: (position: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
};

export const PlayerContext = React.createContext<PlayerContextType>({
  track: null,
  playing: false,
  setPlaying: () => {},
  changeTrack: () => {},
  position: [0],
  setPosition: () => {},
  maxPosition: 0,
  setMaxPosition: () => {},
  volume: 50,
  setVolume: () => {},
  loop: false,
  setLoop: () => {},
  writePositionToLocalStorage: () => {},
  // @ts-ignore
  audioRef: null,
  setAudioRef: () => {},
});

type RouterOutput = inferRouterOutputs<AppRouter>;

type ResumeData = {
  track: TrackQuery | null;
  position: number | null;
};

function writeTrackToLocalStorage(track: TrackQuery) {
  localStorage.setItem("track", JSON.stringify(track));
}
function writePositionToLocalStorage(position: number) {
  localStorage.setItem("position", position.toString());
}
function readTrackFromLocalStorage(): ResumeData {
  const track = localStorage.getItem("track");
  const position = localStorage.getItem("position");
  return {
    track: track ? JSON.parse(track) : null,
    position: position ? parseInt(position) : null,
  };
}

export default function PlayerContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [trackData, setTrackData] = React.useState<TrackQuery>(null);
  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState([0]);
  const [maxPosition, setMaxPosition] = React.useState(0);
  const [volume, setVolume] = React.useState(50);
  const [loop, setLoop] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const changeTrack = async (trackData: TrackQuery) => {
    setTrackData(trackData);
    writeTrackToLocalStorage(trackData);
    setPlaying(false);
    setPosition([0]);
  };

  useEffect(() => {
    const { track, position } = readTrackFromLocalStorage();
    if (track) {
      changeTrack(track);
      setPosition([position ? position : 0]);
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{
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
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
