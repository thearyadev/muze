import React, { useContext, createContext, useEffect } from 'react'
import { useTrack } from './track'
import { usePlaying } from './playing'
import { useLoop } from './loop'
import { getRandomTrack, type getTrack } from '~/lib/actions/library'
import { useAutoplay } from './autoplay'

type TrackQuery = NonNullable<
  NonNullable<Awaited<ReturnType<typeof getTrack>>>['content']
>
const QueueContext = createContext<{
  queue: TrackQuery[]
  queuePlayed: TrackQuery[]
  nextTrack: () => void
  previousTrack: () => void
  addTrack: (track: TrackQuery) => void
  trackComplete: () => void
  addTrackPrevious: (track: TrackQuery) => void
} | null>(null)

const useQueue = () => useContext(QueueContext)
const QueueProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [queue, setQueue] = React.useState<TrackQuery[]>([])
  const [queuePlayed, setQueuePlayed] = React.useState<TrackQuery[]>([])
  // biome-ignore lint/style/noNonNullAssertion :
  const { changeTrack, track } = useTrack()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { setPlayingFalse } = usePlaying()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { loop } = useLoop()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { autoplay } = useAutoplay()!

  const nextTrack = () => {
    if (queue.length === 0) {
      return
    }
    const nextTrack = queue.shift()
    if (nextTrack && track) {
      setQueuePlayed([...queuePlayed, track])
      changeTrack(nextTrack, true)
    }
  }

  const previousTrack = () => {
    if (queuePlayed.length === 0) return
    const prevTrack = queuePlayed.pop()
    if (prevTrack && track) {
      setQueue([track, ...queue])
      changeTrack(prevTrack, true)
    }
  }

  const addTrack = (track: TrackQuery) => {
    setQueue([...queue, track])
  }

  const addTrackPrevious = (track: TrackQuery) => {
    setQueuePlayed([...queuePlayed, track])
  }

  const trackComplete = () => {
    if (loop && track) {
      changeTrack(track, true)
      return
    } // no need to add this to queue



    // biome-ignore lint/style/noNonNullAssertion : track is probably not null
    setQueuePlayed([...queuePlayed, track!])
    if (queue.length === 0) {
      if (autoplay) {
        // queue is empty, autoplay is on, get a random track from the library
        getRandomTrack().then((res) => {
          if (res.content != undefined) {
            changeTrack(res.content, true)
          }
        })
      } else {
        setPlayingFalse()
      }

    }
    nextTrack()
  }
  // biome-ignore lint/correctness/useExhaustiveDependencies : causes infinite loop
  useEffect(() => {
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      nextTrack()
    })
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      previousTrack()
    })
    return () => {
      navigator.mediaSession.setActionHandler('nexttrack', null)
      navigator.mediaSession.setActionHandler('previoustrack', null)
    }
  }, [])

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
  )
}

export { useQueue, QueueProvider }
