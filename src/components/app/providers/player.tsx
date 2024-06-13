"use client";
import { useEffect, useRef } from "react";
import { LoopProvider, useLoop } from "./loop";
import { PlayingProvider } from "./playing";
import { PositionProvider, usePosition } from "./position";
import { TrackProvider, useTrack } from "./track";
import { VolumeProvider, useVolume } from "./volume";
import { QueueProvider, useQueue } from "./queue";
function ContextRichAudio({
  audioRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement>;
}) {
  const { setMaxPosition, reactPosition } = usePosition()!;
  const { trackComplete } = useQueue()!;
  return (
    <audio
      ref={audioRef}
      onTimeUpdate={() => {
        reactPosition();
      }}
      onCanPlay={() => {
        if (!audioRef.current) return;
        setMaxPosition(audioRef.current.duration);
      }}
      onEnded={() => {
        trackComplete();
      }}
      className="hidden"
    />
  );
}

function ContextRichOverlay() {
  const { track } = useTrack()!;
  return (
    <div
      className="z-10000 pointer-events-none fixed left-0 top-0 h-full w-full overflow-hidden bg-cover bg-center bg-no-repeat opacity-10 blur-xl"
      style={{
        backgroundImage: `url('/api/covers/?id=${track?.id})`,
      }}
    ></div>
  );
}
function ContextRichLocalStorageLoader() {
  const { changeTrack } = useTrack()!;
  const { changePosition } = usePosition()!;
  const { changeVolume } = useVolume()!;
  const { changeLoop } = useLoop()!;

  useEffect(() => {
    const track = localStorage.getItem("track")
      ? JSON.parse(localStorage.getItem("track")!)
      : null;
    const position = localStorage.getItem("position")
      ? parseInt(localStorage.getItem("position")!)
      : null;
    const volume = localStorage.getItem("volume")
      ? parseInt(localStorage.getItem("volume")!)
      : null;
    const loop = localStorage.getItem("loop");
    if (track) {
      changeTrack(track, false);
    }
    if (position) {
      changePosition([position]);
    }
    if (volume) {
      changeVolume(volume);
    }
    if (loop) {
      changeLoop(loop === "true");
    }
  }, []);
  return null;
}

export default function PlayerContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  return (
    <PlayingProvider audioRef={audioRef}>
      <LoopProvider>
        <VolumeProvider audioRef={audioRef}>
          <PositionProvider audioRef={audioRef}>
            <TrackProvider audioRef={audioRef}>
              <QueueProvider>
                <ContextRichAudio audioRef={audioRef} />
                <ContextRichOverlay />
                <ContextRichLocalStorageLoader />
                {children}
              </QueueProvider>
            </TrackProvider>
          </PositionProvider>
        </VolumeProvider>
      </LoopProvider>
    </PlayingProvider>
  );
}
