'use client'
import type React from 'react'
import { useContext, createContext, useState } from 'react'

const SidebarContext = createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

const useSidebar = () => useContext(SidebarContext)
const SidebarProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [open, setOpen] = useState(false)
  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export { useSidebar, SidebarProvider }
