import React, { useContext, createContext, useState } from 'react'

const LoopContext = createContext<{
  loop: boolean
  changeLoop: (loop: boolean) => void
} | null>(null)

const useLoop = () => useContext(LoopContext)
const LoopProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [loop, setLoop] = useState(false)
  const changeLoop = (newLoop: boolean) => {
    setLoop(newLoop)
    localStorage.setItem('loop', newLoop.toString())
  }
  return (
    <LoopContext.Provider
      value={{
        loop,
        changeLoop,
      }}
    >
      {children}
    </LoopContext.Provider>
  )
}

export { useLoop, LoopProvider }
