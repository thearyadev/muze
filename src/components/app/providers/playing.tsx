import type React from 'react'
import { useState, useContext, createContext, useEffect } from 'react'
import { MultiRef } from './player'

const PlayingContext = createContext<{
  playing: boolean
  togglePlayPause: () => void
  setPlayingTrue: () => void
  setPlayingFalse: () => void
} | null>(null)
const usePlaying = () => useContext(PlayingContext)

const PlayingProvider: React.FC<{
  playerRef: MultiRef
  children: React.ReactNode
}> = ({ playerRef, children }) => {
  const [playing, setPlaying] = useState(false)
  const togglePlayPause = () => {
    setPlaying((prevPlaying) => !prevPlaying)

    if (!playerRef.audioRef.current) return
    if (playerRef.audioRef.current.paused) {
      playerRef.audioRef.current.play().catch(() => {
        return
      })
      return
    }
    playerRef.audioRef.current.pause()
  }

  const setPlayingTrue = () => {
    if (!playerRef.audioRef.current) return
    setPlaying(true)
    playerRef.audioRef.current.play().catch(() => {
      return
    })
  }

  const setPlayingFalse = () => {
    if (!playerRef.audioRef.current) return
    setPlaying(false)
    playerRef.audioRef.current.pause()
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies : causes infinite loop
  useEffect(() => {
    navigator.mediaSession.setActionHandler('play', () => {
      setPlayingTrue()
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      setPlayingFalse()
    })

    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
    }
  }, [])

  return (
    <PlayingContext.Provider
      value={{
        playing: playing,
        togglePlayPause: togglePlayPause,
        setPlayingTrue: setPlayingTrue,
        setPlayingFalse: setPlayingFalse,
      }}
    >
      {children}
    </PlayingContext.Provider>
  )
}

export { usePlaying, PlayingProvider }
