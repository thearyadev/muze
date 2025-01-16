import React from 'react'
import { useState, useContext, createContext } from 'react'
import { setCurrentTrackPosition } from '~/lib/actions/user'
import { MultiRef } from './player'

const PositionContext = createContext<{
  position: number[]
  changePosition: (position: number[]) => void
  maxposition: number
  setMaxPosition: (maxposition: number) => void
  reactPosition: () => void
} | null>(null)

const usePosition = () => useContext(PositionContext)

const PositionProvider: React.FC<{
  playerRef: MultiRef,
  children: React.ReactNode
}> = ({ playerRef, children }) => {
  const [position, setPosition] = useState([0])
  const [maxposition, setMaxPosition] = useState(0)
  const reactPosition = () => {
    if (!playerRef.audioRef.current) return
    setPosition([playerRef.audioRef.current.currentTime])
    // rate limit polling
    // this will ensure the position is only updated on the server if one second has passed.

    if (playerRef.audioRef.current.currentTime === undefined) return
    if (position[0] === undefined) return
    if (
      Math.floor(playerRef.audioRef.current.currentTime) !== Math.floor(position[0] ?? 0)
    ) {
      setCurrentTrackPosition(playerRef.audioRef.current.currentTime)
    }
  }

  const changePosition = (newPosition: number[]) => {
    if (!playerRef.audioRef.current) return
    playerRef.audioRef.current.currentTime = newPosition[0] || 0
    setCurrentTrackPosition(newPosition[0] || 0)
  }
  return (
    <PositionContext.Provider
      // biome-ignore lint/correctness/useExhaustiveDependencies : used to optmize re-render
      value={React.useMemo(
        () => ({
          position: position,
          changePosition: changePosition,
          maxposition: maxposition,
          setMaxPosition: setMaxPosition,
          reactPosition: reactPosition,
        }),
        [position, maxposition],
      )}
    >
      {children}
    </PositionContext.Provider>
  )
}

export { usePosition, PositionProvider }
