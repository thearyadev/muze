import type React from 'react'
import { useContext, createContext, useState } from 'react'

const AutoplayContext = createContext<{
  autoplay: boolean
  changeAutoplay: (autoplay: boolean) => void
} | null>(null)

const useAutoplay = () => useContext(AutoplayContext)
const AutoplayProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [autoplay, setAutoplay] = useState(false)
  const changeAutoplay = (newAutoplay: boolean) => {
    setAutoplay(newAutoplay)
    localStorage.setItem('autoplay', newAutoplay.toString())
  }
  return (
    <AutoplayContext.Provider
      value={{
        autoplay,
        changeAutoplay,
      }}
    >
      {children}
    </AutoplayContext.Provider>
  )
}

export { useAutoplay, AutoplayProvider }
