import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetDescription,
} from '~/components/ui/sheet'
import Sidebar from './sidebar'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'

function Header() {
  return (
    <div className="grid h-14 w-screen grid-cols-2 bg-zinc-800 pl-4 pr-4 text-white shadow-2xl transition duration-100 hover:text-orange-400">
      <Sheet>
        <SheetTrigger>
          <HamburgerMenuIcon className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="left" className="bg-zinc-800">
          <SheetHeader>
            <SheetDescription>
              <Sidebar className="w-full p-2" username="error" />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default Header
