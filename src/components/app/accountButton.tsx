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
export function AccountButton({ username }: { username: string }) {
  const handleSignout = () => {}

  const handleSync = async () => {}
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
          <DropdownMenuItem className="w-52">
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
