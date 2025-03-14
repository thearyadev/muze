'use client'
import type React from 'react'
import Sidebar from './sidebar'
import { useSidebar } from './providers/sidebar'
import { Suspense, useEffect } from 'react'
import { getUsername } from '~/lib/actions/user'
export default function PageWrapper({
  username,
  children,
}: {
  username: string
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
    <div className="grid grid-cols-12 h-full">
      <div
        className={open ? 'hidden' : 'col-span-4 lg:col-span-3 xl:col-span-2'}
      >
        <Sidebar username={username} />
      </div>
      <div
        className={`${open ? 'col-span-12' : 'col-span-8 lg:col-span-9 xl:col-span-10'} overflow-y-hidden
`}
      >
        <div className="h-full w-full text-white">{children}</div>
      </div>
    </div>
  )
}
