import React, { useState, useContext, createContext } from 'react'
import { usePosition } from './position'
import { usePlaying } from './playing'
import type { getTrack } from '~/lib/actions/library'
import { getCurrentTrack, setCurrentTrack } from '~/lib/actions/user'

type TrackQuery = NonNullable<
  Awaited<ReturnType<typeof getTrack>>['content']
> | null
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
    audioRef.current.src = newTrack
      ? `/api/library/track_data?id=${newTrack?.id}`
      : ''

    setCurrentTrack(newTrack?.id)

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
        {
          src: `/api/libraru/covers?id=${newTrack?.id}&size=sm`,
          sizes: '96x96',
        },
        {
          src: `/api/library/covers?id=${newTrack?.id}&size=md`,
          sizes: '128x128',
        },
        {
          src: `/api/libray/covers?id=${newTrack?.id}&size=lg`,
          sizes: '192x192',
        },
        {
          src: `/api/library/covers?id=${newTrack?.id}&size=xl`,
          sizes: '256x256',
        },
        {
          src: `/api/library/covers?id=${newTrack?.id}&size=xl`,
          sizes: '384x384',
        },
        {
          src: `/api/library/covers?id=${newTrack?.id}&size=xl`,
          sizes: '512x512',
        },
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
