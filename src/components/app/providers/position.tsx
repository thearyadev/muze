import type React from 'react'
import { useState, useContext, createContext } from 'react'
import { setCurrentTrackPosition } from '~/lib/actions/user'

const PositionContext = createContext<{
  position: number[]
  changePosition: (position: number[]) => void
  maxposition: number
  setMaxPosition: (maxposition: number) => void
  reactPosition: () => void
} | null>(null)

const usePosition = () => useContext(PositionContext)

const PositionProvider: React.FC<{
  audioRef: React.RefObject<HTMLAudioElement>
  children: React.ReactNode
}> = ({ audioRef, children }) => {
  const [position, setPosition] = useState([0])
  const [maxposition, setMaxPosition] = useState(0)
  const reactPosition = () => {
    console.log('reactPosition')
    if (!audioRef.current) return
    setPosition([audioRef.current.currentTime])
    // rate limit polling
    // this will ensure the position is only updated on the server if one second has passed.

    if (audioRef.current.currentTime === undefined) return
    if (position[0] === undefined) return
    if (
      Math.floor(audioRef.current.currentTime) !== Math.floor(position[0] ?? 0)
    ) {
      setCurrentTrackPosition(audioRef.current.currentTime)
    }
  }

  const changePosition = (newPosition: number[]) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = newPosition[0] || 0
    setCurrentTrackPosition(newPosition[0] || 0)
  }
  return (
    <PositionContext.Provider
      value={{
        position: position,
        changePosition: changePosition,
        maxposition: maxposition,
        setMaxPosition: setMaxPosition,
        reactPosition: reactPosition,
      }}
    >
      {children}
    </PositionContext.Provider>
  )
}

export { usePosition, PositionProvider }
