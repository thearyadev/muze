import React, { useState, useContext, createContext } from 'react'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '~/server/api/root'
import { usePosition } from './position'
import { usePlaying } from './playing'

type RouterOutput = inferRouterOutputs<AppRouter>
type TrackQuery = RouterOutput['library']['getTrack']

const TrackContext = createContext<{
  track: TrackQuery | null
  changeTrack: (track: TrackQuery, play: boolean) => void
} | null>(null)
const useTrack = () => useContext(TrackContext)

const TrackProvider: React.FC<{
  audioRef: React.RefObject<HTMLAudioElement>
  children: React.ReactNode
}> = ({ audioRef, children }) => {
  const [track, setTrack] = useState<TrackQuery | null>(null)
  // biome-ignore lint/style/noNonNullAssertion :
  const position = usePosition()!
  // biome-ignore lint/style/noNonNullAssertion :
  const playing = usePlaying()!
  const changeTrack = (newTrack: TrackQuery, play: boolean) => {
    setTrack(newTrack)
    playing.setPlayingFalse()
    position.changePosition([0])
    if (!audioRef.current) return
    audioRef.current.src = newTrack ? `/api/track_data?id=${newTrack?.id}` : ''
    localStorage.setItem('track', JSON.stringify(newTrack))

    if (play) {
      setTimeout(() => {
        if (!audioRef.current) return
        audioRef.current.play().catch(() => {
          return
        })
        audioRef.current.currentTime = 0
        playing.setPlayingTrue()
      }, 10)
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title: newTrack?.name as string,
      artist: newTrack?.artistNames.replace(';', ', ') as string,
      album: newTrack?.albumName as string,
      artwork: [
        { src: `/api/covers?id=${newTrack?.id}&size=sm`, sizes: '96x96' },
        { src: `/api/covers?id=${newTrack?.id}&size=md`, sizes: '128x128' },
        { src: `/api/covers?id=${newTrack?.id}&size=lg`, sizes: '192x192' },
        { src: `/api/covers?id=${newTrack?.id}&size=xl`, sizes: '256x256' },
        { src: `/api/covers?id=${newTrack?.id}&size=xl`, sizes: '384x384' },
        { src: `/api/covers?id=${newTrack?.id}&size=xl`, sizes: '512x512' },
      ],
    })
  }
  return (
    <TrackContext.Provider
      // biome-ignore lint/correctness/useExhaustiveDependencies : used to optmize re-render
      value={React.useMemo(
        () => ({ track: track, changeTrack: changeTrack }),
        [track],
      )}
    >
      {children}
    </TrackContext.Provider>
  )
}

export { useTrack, TrackProvider }
