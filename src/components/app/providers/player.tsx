'use client'
import { useEffect, useRef } from 'react'
import { LoopProvider, useLoop } from './loop'
import { PlayingProvider } from './playing'
import { PositionProvider, usePosition } from './position'
import { TrackProvider, useTrack } from './track'
import { VolumeProvider, useVolume } from './volume'
import { QueueProvider, useQueue } from './queue'
import type { getTrack } from '~/lib/actions/library'
import { AutoplayProvider, useAutoplay } from './autoplay'
import Image from 'next/image'

type TrackQuery = NonNullable<Awaited<ReturnType<typeof getTrack>>['content']>

export type MultiRef = {
  audioRef: React.RefObject<HTMLAudioElement>
  sourceRef: React.RefObject<HTMLSourceElement>
}

function ContextRichAudio({
  playerRef,
}: {
  playerRef: MultiRef
}) {
  // biome-ignore lint/style/noNonNullAssertion :
  const { setMaxPosition, reactPosition, changePosition } = usePosition()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { trackComplete } = useQueue()!
  return (
    // biome-ignore lint/a11y/useMediaCaption :
    <audio
      id="audo"
      ref={playerRef.audioRef}
      onTimeUpdate={() => {
        reactPosition()
      }}
      onCanPlay={() => {
        if (!playerRef.audioRef.current) return
        setMaxPosition(playerRef.audioRef.current.duration)
      }}
      onEnded={() => {
        trackComplete()
      }}
      className="hidden"
      onError={(e) => {
        if (!playerRef.audioRef.current) return
        if (playerRef.audioRef.current.src === '') return
        // nextTrack()
      }}
    >
      <source
        id="source"
        ref={playerRef.sourceRef}
        type="audio/mpeg"
        src="/api/library/track_data?id=fe6cee76-1975-4cc3-a4a8-b234625c0e91"
      />
    </audio>
  )
}

function ContextRichOverlay() {
  // biome-ignore lint/style/noNonNullAssertion :
  const { track } = useTrack()!

  if (track === null) {
    return null
  }

  return (
    <div
      className="z-10000 pointer-events-none fixed left-0 top-0 h-full w-full overflow-hidden bg-cover bg-center bg-no-repeat opacity-10 blur-xl"
      style={
        {
          // backgroundImage: `url('/api/library/covers/?id=${track.id}&size=xl')`,
        }
      }
    >
      <Image
        alt={track.name || 'Track Cover'}
        src={`/api/library/covers?id=${track.id}&size=xl`}
        className="h-full w-full object-cover"
        loading="eager"
        fill
        placeholder="blur"
        blurDataURL="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCABkAGQBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAA/AIkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9k="
      />
    </div>
  )
}
function ContextRichLocalStorageLoader({
  startingTrack,
  startingPosition,
}: { startingTrack: TrackQuery | null; startingPosition: number }) {
  // biome-ignore lint/style/noNonNullAssertion :
  const { changeTrack } = useTrack()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { changePosition } = usePosition()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { changeVolume } = useVolume()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { changeLoop } = useLoop()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { changeAutoplay } = useAutoplay()!
  // biome-ignore lint/correctness/useExhaustiveDependencies : causes infinite loop
  useEffect(() => {
    const volume = localStorage.getItem('volume')
      ? Number.parseInt(localStorage.getItem('volume') as string)
      : null
    const loop = localStorage.getItem('loop')
    const autoplay = localStorage.getItem('autoplay')
    if (autoplay) {
      changeAutoplay(autoplay === 'true')
    }
    if (volume) {
      changeVolume(volume)
    }
    if (loop) {
      changeLoop(loop === 'true')
    }
    if (startingTrack) {
      changeTrack(startingTrack, false)
    }
    if (startingPosition) {
      changePosition([startingPosition])
    }
  }, [])
  return null
}

export default function PlayerContextProvider({
  children,
  currentTrack,
  currentTrackPosition,
}: {
  children: React.ReactNode
  currentTrack: NonNullable<
    Awaited<ReturnType<typeof getTrack>>['content']
  > | null
  currentTrackPosition: number
}) {
  const playerRef = {
    // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
    audioRef: useRef<HTMLAudioElement>(null!),
    // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
    sourceRef: useRef<HTMLSourceElement>(null!),
  }
  return (
    <PlayingProvider playerRef={playerRef}>
      <LoopProvider>
        <AutoplayProvider>
          <VolumeProvider playerRef={playerRef}>
            <PositionProvider playerRef={playerRef}>
              <TrackProvider playerRef={playerRef}>
                <QueueProvider>
                  <ContextRichAudio playerRef={playerRef} />
                  <ContextRichOverlay />
                  <ContextRichLocalStorageLoader
                    startingTrack={currentTrack}
                    startingPosition={currentTrackPosition}
                  />

                  {children}
                </QueueProvider>
              </TrackProvider>
            </PositionProvider>
          </VolumeProvider>
        </AutoplayProvider>
      </LoopProvider>
    </PlayingProvider>
  )
}
