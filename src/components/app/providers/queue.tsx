import React, { useContext, createContext, useEffect } from 'react'
import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '~/server/api/root'
import { useTrack } from './track'
import { usePlaying } from './playing'
import { useLoop } from './loop'

type RouterOutput = inferRouterOutputs<AppRouter>

type TrackQuery = RouterOutput['library']['getTrack']

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

  const nextTrack = () => {
    if (queue.length === 0) {
      changeTrack(null, false)
      return
    }
    const nextTrack = queue.shift()
    if (nextTrack) {
      setQueuePlayed([...queuePlayed, track])
      changeTrack(nextTrack, true)
    }
  }

  const previousTrack = () => {
    if (queuePlayed.length === 0) return
    const prevTrack = queuePlayed.pop()
    if (prevTrack) {
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
    if (loop) {
      changeTrack(track, true)
      return
    } // no need to add this to queue

    setQueuePlayed([...queuePlayed, track])
    if (queue.length === 0) {
      setPlayingFalse()
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
