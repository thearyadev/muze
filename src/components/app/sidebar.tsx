'use client'

import Link from 'next/link'
import {
  HomeIcon,
  ListBulletIcon,
  ArchiveIcon,
  CardStackIcon,
  PersonIcon,
  TableIcon,
} from '@radix-ui/react-icons'
import { usePathname, useRouter } from 'next/navigation'
import { useHotkeys } from '@mantine/hooks'
import { Input } from '../ui/input'
import { useRef, useState } from 'react'

function SidebarButton({
  href,
  label,
  children,
  commandKey,
}: {
  href: string
  label: string
  children: React.ReactNode
  commandKey: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  try {
    router.prefetch(href)
  } catch {}
  useHotkeys(
    [
      [
        commandKey,
        () => {
          router.push(href)
        },
      ],
    ],
    ['INPUT', 'TEXTAREA'],
  )

  return (
    <div className="pb-1">
      <Link
        href={href}
        className={`flex flex-row items-center rounded-md p-2 text-sm text-white transition-all duration-100  ${pathname === href ? 'bg-orange-400 bg-opacity-80' : null}`}
      >
        {children}
        <div className="ml-2 flex w-full flex-row justify-between">
          <span>{label}</span>
          <span
            className={`text-gray-500 ${pathname === href ? 'hidden' : null}`}
          >
            {commandKey}
          </span>
        </div>
      </Link>
    </div>
  )
}

export default function Sidebar({
  className,
  username,
}: {
  className?: string
  username: string
}) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const lastPage = useRef('')
  const [searchQuery, setSearchQuery] = useState('')
  router.prefetch('/app/search')

  useHotkeys([
    [
      '/',
      () => {
        searchInputRef.current?.focus()
      },
    ],
  ])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value

    if (lastPage.current === '') {
      lastPage.current = pathname
    }
    if (query === '') {
      router.push(lastPage.current)
    }
    setSearchQuery(query)
  }

  return (
    <div className={`flex flex-col h-full bg-zinc-800 ${className} p-5`}>
      <div className="flex flex-col flex-1">
        <div>
          <div className="pb-4">
            <Input
              ref={searchInputRef}
              placeholder="Search"
              onChange={handleSearchInputChange}
              value={searchQuery}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  searchInputRef.current?.blur()
                  router.push(lastPage.current)
                  setSearchQuery('')
                }
                if (e.key === 'Enter') {
                  router.push(`/app/search?q=${searchQuery}`)
                }
              }}
            />
          </div>
          <SidebarButton href="/app/home" label="Home" commandKey="1">
            <HomeIcon />
          </SidebarButton>
          <SidebarButton href="/app/queue" label="Queue" commandKey="2">
            <ListBulletIcon />
          </SidebarButton>
          <SidebarButton
            href="/app/all_tracks"
            label="All Tracks"
            commandKey="3"
          >
            <ArchiveIcon />
          </SidebarButton>
          <SidebarButton href="/app/albums" label="Albums" commandKey="4">
            <CardStackIcon />
          </SidebarButton>
          <SidebarButton href="/app/artists" label="Artists" commandKey="5">
            <PersonIcon />
          </SidebarButton>
          <SidebarButton href="/app/genres" label="Genres" commandKey="6">
            <TableIcon />
          </SidebarButton>
        </div>
        <div className="mt-auto flex-shrink-0" />
      </div>
    </div>
  )
}
