import type React from 'react'
import { useContext, createContext, useState } from 'react'

const VolumeContext = createContext<{
  volume: number
  changeVolume: (volume: number) => void
} | null>(null)

const useVolume = () => useContext(VolumeContext)
const VolumeProvider: React.FC<{
  audioRef: React.RefObject<HTMLAudioElement>
  children: React.ReactNode
}> = ({ audioRef, children }) => {
  const [volume, setVolume] = useState(50)
  const changeVolume = (newVolume: number) => {
    if (!audioRef.current) return
    audioRef.current.volume = newVolume / 100
    setVolume(newVolume)
    localStorage.setItem('volume', newVolume.toString())
  }
  return (
    <VolumeContext.Provider
      value={{
        volume,
        changeVolume,
      }}
    >
      {children}
    </VolumeContext.Provider>
  )
}

export { useVolume, VolumeProvider }
