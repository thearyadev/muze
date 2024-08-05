import React, { useState, useContext, createContext } from 'react'
import type { inferRouterOutputs } from '@trpc/server'
import { type AppRouter } from '~/server/api/root'
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
  const position = usePosition()!
  const playing = usePlaying()!
  const changeTrack = (newTrack: TrackQuery, play: boolean) => {
    setTrack(newTrack)
    playing.setPlayingFalse()
    position.changePosition([0])
    if (!audioRef.current) return
    audioRef.current.src = '/api/track_data?id=' + newTrack!.id
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
  }

  return (
    <TrackContext.Provider
      value={React.useMemo(
        () => ({ track: track, changeTrack: changeTrack }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [track],
      )}
    >
      {children}
    </TrackContext.Provider>
  )
}

export { useTrack, TrackProvider }
