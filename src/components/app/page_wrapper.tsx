'use client'
import { Sidebar, SidebarBody, SidebarLink } from '../ui/sidebar'
import {
  IconLogout,
  IconHome,
  IconDisc,
  IconAlbum,
  IconSortAscendingShapes,
  IconUsers,
  IconRefreshAlert,
} from '@tabler/icons-react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import { useSidebar } from '~/components/ui/sidebar'
import { cn } from '~/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { authClient } from '~/lib/auth-client'
import { sync } from '~/lib/actions/library'
import { useHotkeys } from '@mantine/hooks'
import { env } from '~/env'
import { usePathname } from 'next/navigation'

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useHotkeys([
    [
      'mod+K',
      () => {
        router.push('/app/search')
      },
    ],
  ])

  const links = [
    {
      label: 'Home',
      href: '/app/home',
      icon: (
        <IconHome className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: 'Queue',
      href: '/app/queue',
      icon: (
        <IconSortAscendingShapes className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: 'All Tracks',
      href: '/app/all_tracks',
      icon: (
        <IconDisc className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: 'Albums',
      href: '/app/albums',
      icon: (
        <IconAlbum className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
    {
      label: 'Artists',
      href: '/app/artists',
      icon: (
        <IconUsers className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0" />
      ),
    },
  ]
  const { open, setOpen } = useSidebar()
  return (
    <div
      className={cn(
        'rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1  mx-auto dark:border-neutral-700 overflow-hidden',
        'h-full',
      )}
    >
      <Sidebar open={open} setOpen={setOpen} animate={true}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo />
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link) => (
                <SidebarLink key={link.label} link={link} />
              ))}
            </div>
          </div>
          <div>
            <div className="grid grid-rows-2 gap-2">
              <IconRefreshAlert
                className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0"
                onClick={() => {
                  toast.promise(
                    sync().then(() => {
                      window.location.reload()
                    }),
                    {
                      loading: 'Syncing...',
                      success: 'Synced!',
                      error: 'Sync failed!',
                    },
                  )
                }}
              />

              <IconLogout
                className="text-neutral-700 dark:text-neutral-200 h-5 w-5 shrink-0"
                onClick={() => {
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        toast.success('Logged out')
                        router.push('/login')
                      },
                    },
                  })
                }}
              />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <AnimatePresence mode="wait" initial={true}>
        <motion.div
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'tween',
            duration: 0.3,
            bounce: 0,
          }}
          key={pathname}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20 group"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        <span className="text-white pr-2">muze</span>
        <span className="text-zinc-600 text-xs hidden group-hover:inline-block ">
          {env.NEXT_PUBLIC_TAG}
        </span>
      </motion.span>
    </Link>
  )
}
export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm shrink-0" />
    </Link>
  )
}
