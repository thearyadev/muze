"use client";
import React from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "~/server/api/root";

type TrackQuery = RouterOutput["library"]["getTrack"]


type PlayerContextType = {
  track: TrackQuery,
  setTrack: (trackData: TrackQuery) => void
}


export const PlayerContext = React.createContext<PlayerContextType>({
  track: null, 
  setTrack: (trackData: TrackQuery) => {}
});

type RouterOutput = inferRouterOutputs<AppRouter>;



export default function PlayerContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [trackData, setTrackData] = React.useState<TrackQuery>(null);
  return (
    <PlayerContext.Provider
      value={{
        track: trackData,
        setTrack: setTrackData
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
