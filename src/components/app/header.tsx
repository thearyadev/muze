import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
  SheetDescription,
} from "~/components/ui/sheet";
import Sidebar from "./sidebar";
import {
  HamburgerMenuIcon
} from "@radix-ui/react-icons";

function Header() {
  return (
    <div className="bg-zinc-800 w-screen h-14 shadow-2xl grid grid-cols-2 pl-4 pr-4 text-white hover:text-orange-400 transition duration-100">
      <Sheet>
        <SheetTrigger>
          <HamburgerMenuIcon className="w-5 h-5" />
        </SheetTrigger>
        <SheetContent side="left" className="bg-zinc-800">
          <SheetHeader>
            <SheetDescription>
              <Sidebar className="w-full p-2" />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default Header;
