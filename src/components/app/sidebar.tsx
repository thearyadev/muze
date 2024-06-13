"use client";

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
import { useHotkeys } from "@mantine/hooks";

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
  router.prefetch(href);
  useHotkeys(
    [
      [
        commandKey,
        () => {
          router.push(href);
        },
      ],
    ],
    ["INPUT", "TEXTAREA"],
  );

  return (
    <div className="pb-1">
      <Link
        href={href}
        className={`flex flex-row items-center rounded-md p-2 text-sm text-white transition-all duration-100  ${pathname === href ? "bg-orange-400 bg-opacity-80" : null}`}
      >
        {children}
        <div className="ml-2 flex w-full flex-row justify-between">
          <span>{label}</span>
          <span
            className={`text-gray-500 ${pathname === href ? "hidden" : null}`}
          >
            {commandKey}
          </span>
        </div>
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
              variant="ghost"
              size="sm"
              className="flex w-full flex-row justify-between  text-gray-400  hover:text-white"
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
        <AccountButton username={username} />
      </div>
    </>
  );
}
