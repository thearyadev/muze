'use client'
import { useEffect, useRef } from 'react'
import { LoopProvider, useLoop } from './loop'
import { PlayingProvider, usePlaying } from './playing'
import { PositionProvider, usePosition } from './position'
import { TrackProvider, useTrack } from './track'
import { VolumeProvider, useVolume } from './volume'
import { QueueProvider, useQueue } from './queue'
import type { getTrack } from '~/lib/actions/library'
import { AutoplayProvider } from './autoplay'

type TrackQuery = NonNullable<Awaited<ReturnType<typeof getTrack>>['content']>

function ContextRichAudio({
  audioRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement>
}) {
  // biome-ignore lint/style/noNonNullAssertion :
  const { setMaxPosition, reactPosition, maxposition, position, changePosition } = usePosition()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { trackComplete, nextTrack } = useQueue()!
  const {playing} = usePlaying()!
  return (
    // biome-ignore lint/a11y/useMediaCaption :
    <audio
      id='audo'
      ref={audioRef}
      onTimeUpdate={() => {
        reactPosition()
      }}
      onCanPlay={() => {
        if (!audioRef.current) return
        setMaxPosition(audioRef.current.duration)
      }}
      onEnded={() => {
        trackComplete()
      }}
      className="hidden"
      onError={() => {
        if (!audioRef.current) return
        if (audioRef.current.src === '') return
        nextTrack()
      }}
    />
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
      style={{
        backgroundImage: `url('/api/library/covers/?id=${track.id}&size=xl')`,
      }}
    />
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
  // biome-ignore lint/correctness/useExhaustiveDependencies : causes infinite loop
  useEffect(() => {
    const volume = localStorage.getItem('volume')
      ? Number.parseInt(localStorage.getItem('volume') as string)
      : null
    const loop = localStorage.getItem('loop')
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
  // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
  const audioRef = useRef<HTMLAudioElement>(null!)
  return (
    <PlayingProvider audioRef={audioRef}>
      <LoopProvider>
        <AutoplayProvider>
          <VolumeProvider audioRef={audioRef}>
            <PositionProvider audioRef={audioRef}>
              <TrackProvider audioRef={audioRef}>
                <QueueProvider>
                  <ContextRichAudio audioRef={audioRef} />
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
