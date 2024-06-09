"use client";

import { Input } from "../ui/searchInput";
import Link from "next/link";
import {
  HomeIcon,
  ListBulletIcon,
  ArchiveIcon,
  CardStackIcon,
  PersonIcon,
  TableIcon,
  CalendarIcon,
} from "@radix-ui/react-icons";
import { usePathname, useRouter } from "next/navigation";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import CommandLabel from "./command_label";
import { useContext, useEffect, useState } from "react";
import { AccountButton } from "./accountButton";

import { api } from "~/trpc/react";
import { PlayerContext } from "./player_context";
import { SearchContext } from "./searchContext";

function SidebarButton({
  href,
  label,
  children,
  commandKey,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  commandKey: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

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

export default function Sidebar({
  className,
  username,
}: {
  className?: string;
  username: string;
}) {
  const { setOpen } = useContext(SearchContext);
  return (
    <>
      <div
        className={`flex h-screen w-64 flex-col justify-between bg-zinc-800 p-5 pb-24 ${className}`}
      >
        <div>
          <div className="pb-4">
            <Button
              variant="outline"
              size="sm"
              className="flex w-full flex-row justify-between border-gray-600 bg-transparent text-gray-400 hover:bg-gray-400 hover:bg-opacity-20 hover:text-white"
              onMouseDown={() => {
                setOpen(true);
              }}
            >
              Search...
              <CommandLabel commandKeyChain="K" />
            </Button>
          </div>
          <SidebarButton href="/app/home" label="Home" commandKey="1">
            <HomeIcon />
          </SidebarButton>
          <SidebarButton href="/app/queue" label="Queue" commandKey="2">
            <ListBulletIcon />
          </SidebarButton>
          <SidebarButton href="/app/all_songs" label="All Songs" commandKey="3">
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
        <AccountButton username={username} />
      </div>
    </>
  );
}
