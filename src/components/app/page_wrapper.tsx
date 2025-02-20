'use client'
import type React from 'react'
import Sidebar from './sidebar'
import { useSidebar } from './providers/sidebar'
import { Suspense, useEffect } from 'react'
export default function PageWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
  const { open, setOpen } = useSidebar()!
  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth <= 768)
    }
    window.addEventListener('resize', handleResize)
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [setOpen])
  return (
    <div className="grid grid-cols-12 overflow-hidden">
      <div
        className={open ? 'hidden' : 'col-span-4 lg:col-span-3 xl:col-span-2'}
      >
        <Sidebar username="error" />
      </div>
      <div
        className={`${open ? 'col-span-12' : 'col-span-8 lg:col-span-9 xl:col-span-10'} overflow-y-hidden`}
      >
        <div className="h-screen w-full text-white">{children}</div>
      </div>
    </div>
  )
}
