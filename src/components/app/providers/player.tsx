"use client";
import { useRef } from "react";
import { LoopProvider } from "./loop";
import { PlayingProvider } from "./playing";
import { PositionProvider, usePosition } from "./position";
import { TrackProvider, useTrack } from "./track";
import { VolumeProvider } from "./volume";
function ContextRichAudio({
  audioRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement>;
}) {
  const { position, maxposition, setMaxPosition, changePosition } =
    usePosition()!;
  return (
    <audio
      ref={audioRef}
      onTimeUpdate={() => {
        if (!audioRef.current) return;

        changePosition([audioRef.current.currentTime]);
      }}
      onCanPlay={() => {
        if (!audioRef.current) return;
        setMaxPosition(audioRef.current.duration);
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
              <ContextRichAudio audioRef={audioRef} />
              <ContextRichOverlay />
              {children}
            </TrackProvider>
          </PositionProvider>
        </VolumeProvider>
      </LoopProvider>
    </PlayingProvider>
  );
}
