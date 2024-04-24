"use client";

import { Input } from "../ui/input";
import Link from "next/link";
import {
  HomeIcon,
  ListBulletIcon,
  ArchiveIcon,
  CardStackIcon,
  PersonIcon,
  TableIcon,
} from "@radix-ui/react-icons";
import { usePathname } from "next/navigation";
import { Separator } from "../ui/separator";

function SidebarButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="pb-1">
      <Link
        href={href}
        className={`flex flex-row items-center rounded-md p-2 text-sm text-white transition-all duration-100 hover:bg-zinc-300 hover:bg-opacity-30 ${pathname === href ? "bg-zinc-300 bg-opacity-30 text-gray-100" : null}`}
      >
        {children}
        <span className="ml-2">{label}</span>
      </Link>
    </div>
  );
}

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-zinc-800 p-5">
      <div className="pb-4">
        <Input />
      </div>
      <SidebarButton href="/home" label="Home">
        <HomeIcon />
      </SidebarButton>
      <SidebarButton href="/queue" label="Queue">
        <ListBulletIcon />
      </SidebarButton>
      <SidebarButton href="/all" label="All Songs">
        <ArchiveIcon />
      </SidebarButton>
      <SidebarButton href="/albums" label="Albums">
        <CardStackIcon />
      </SidebarButton>
      <SidebarButton href="/artists" label="Artists">
        <PersonIcon />
      </SidebarButton>
      <SidebarButton href="/genres" label="Genres">
        <TableIcon />
      </SidebarButton>
    </div>
  );
}
