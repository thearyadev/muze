import React, { useContext, createContext } from "react";
import type { inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "~/server/api/root";
import { useTrack } from "./track";
import { usePlaying } from "./playing";

type RouterOutput = inferRouterOutputs<AppRouter>;

type TrackQuery = RouterOutput["library"]["getTrack"];

const QueueContext = createContext<{
  queue: TrackQuery[];
  queuePlayed: TrackQuery[];
  nextTrack: () => void;
  previousTrack: () => void;
  addTrack: (track: TrackQuery) => void;
  trackComplete: () => void;
  addTrackPrevious: (track: TrackQuery) => void;
} | null>(null);

const useQueue = () => useContext(QueueContext);
const QueueProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [queue, setQueue] = React.useState<TrackQuery[]>([]);
  const [queuePlayed, setQueuePlayed] = React.useState<TrackQuery[]>([]);
  const { changeTrack, track } = useTrack()!;
  const { setPlayingFalse } = usePlaying()!;

  const nextTrack = () => {
    if (queue.length === 0) return;
    const nextTrack = queue.shift();
    if (nextTrack) {
      setQueuePlayed([...queuePlayed, track]);
      changeTrack(nextTrack, true);
    }
  };

  const previousTrack = () => {
    if (queuePlayed.length === 0) return;
    const prevTrack = queuePlayed.pop();
    if (prevTrack) {
      setQueue([track, ...queue]);
      changeTrack(prevTrack, true);
    }
  };

  const addTrack = (track: TrackQuery) => {
    setQueue([...queue, track]);
  };

  const addTrackPrevious = (track: TrackQuery) => {
    setQueuePlayed([...queuePlayed, track]);
  };

  const trackComplete = () => {
    setQueuePlayed([...queuePlayed, track]);
    if (queue.length === 0) {
      setPlayingFalse();
    }
    nextTrack();
  };
  return (
    <QueueContext.Provider
      value={{
        queue,
        queuePlayed,
        nextTrack,
        previousTrack,
        addTrack,
        trackComplete,
        addTrackPrevious,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export { useQueue, QueueProvider };
