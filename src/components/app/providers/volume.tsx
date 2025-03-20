
import type React from 'react'
import { useContext, createContext, useState } from 'react'
import type { MultiRef } from './player'

const VolumeContext = createContext<{
  volume: number
  changeVolume: (volume: number) => void
  toggleMute: () => void
  muted: boolean
} | null>(null)

const useVolume = () => useContext(VolumeContext)
const VolumeProvider: React.FC<{
  playerRef: MultiRef
  children: React.ReactNode
}> = ({ playerRef, children }) => {
  const [volume, setVolume] = useState(50)
  const [muted, setMuted] = useState(false)

  const changeVolume = (newVolume: number) => {
    if (!playerRef.audioRef.current) return
    playerRef.audioRef.current.volume = newVolume / 100
    setVolume(newVolume)
    localStorage.setItem('volume', newVolume.toString())
  }
  const toggleMute = () => {
    if (!playerRef.audioRef.current) return
    playerRef.audioRef.current.muted = !playerRef.audioRef.current.muted
    setMuted(!muted)
  }
  return (
    <VolumeContext.Provider
      value={{
        volume,
        changeVolume,
        toggleMute,
        muted,
      }}
    >
      {children}
    </VolumeContext.Provider>
  )
}

export { useVolume, VolumeProvider }
