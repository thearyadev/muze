'use client'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useHotkeys } from '@mantine/hooks'
import { toast } from 'sonner'
import { logout } from '~/lib/actions/user'
import { useRouter } from 'next/navigation'
import { sync } from '~/lib/actions/library'
export function AccountButton({ username }: { username: string }) {
  const router = useRouter()
  const handleSignout = () => {
    logout().then(() => {
      toast.success('Logged out')
      router.push('/login')
    })
  }

  const handleSync = async () => {
    toast.promise(sync(), {
      loading: 'Library sync in progress...',
      success: 'Library sync complete. Please refresh the page.',
      error: 'Library sync failed. Please check logs.',
    })
  }
  useHotkeys(
    [
      ['ctrl+shift+Q', handleSignout],
      ['ctrl+shift+S', handleSync],
    ],
    ['INPUT', 'TEXTAREA'],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full border-0">{username}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="" side="top">
        <DropdownMenuGroup>
          <DropdownMenuItem className="w-52" onClick={handleSync}>
            Sync
            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignout}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
