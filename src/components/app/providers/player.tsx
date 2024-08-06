'use client'
import { useEffect, useRef } from 'react'
import { LoopProvider, useLoop } from './loop'
import { PlayingProvider } from './playing'
import { PositionProvider, usePosition } from './position'
import { TrackProvider, useTrack } from './track'
import { VolumeProvider, useVolume } from './volume'
import { QueueProvider, useQueue } from './queue'
function ContextRichAudio({
  audioRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement>
}) {
  // biome-ignore lint/style/noNonNullAssertion :
  const { setMaxPosition, reactPosition } = usePosition()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { trackComplete, nextTrack } = useQueue()!
  return (
    // biome-ignore lint/a11y/useMediaCaption :
    <audio
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
        backgroundImage: `url('/api/covers/?id=${track.id}&size=xl')`,
      }}
    />
  )
}
function ContextRichLocalStorageLoader() {
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
    const track = localStorage.getItem('track')
      ? JSON.parse(localStorage.getItem('track') as string)
      : null
    const position = localStorage.getItem('position')
      ? Number.parseInt(localStorage.getItem('position') as string)
      : null
    const volume = localStorage.getItem('volume')
      ? Number.parseInt(localStorage.getItem('volume') as string)
      : null
    const loop = localStorage.getItem('loop')
    if (track) {
      changeTrack(track, false)
    }
    if (position) {
      changePosition([position])
    }
    if (volume) {
      changeVolume(volume)
    }
    if (loop) {
      changeLoop(loop === 'true')
    }
  }, [])
  return null
}

export default function PlayerContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
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
  )
}
