"use client";
import React from "react";

export const PlayerContext = React.createContext({
  currentTrackId: -1,
  setCurrentTrackId: (trackId: number) => {},
});

export default function PlayerContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTrackId, setCurrentTrackId] = React.useState<number>(-1);

  return (
    <PlayerContext.Provider
      value={{
        currentTrackId: currentTrackId,
        setCurrentTrackId: setCurrentTrackId,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
