"use client";
import { useContext, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";
import { api } from "~/trpc/react";
import { PlayerContext } from "./player_context";
import { Button } from "../ui/button";
import { SearchContext } from "./searchContext";
import { useHotkeys } from "@mantine/hooks";
export default function Command() {
  const { open, setOpen } = useContext(SearchContext);
  const { data } = api.library.allSongs.useQuery({ pageSize: 5000, page: 1 });
  const { changeTrack } = useContext(PlayerContext);
  useHotkeys(
    [
      [
        "ctrl+K",
        () => {
          setOpen(true);
        },
      ],
    ],
    ["INPUT", "TEXTAREA"],
  );
  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search your library..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Tracks">
            {data?.map((track) => {
              return (
                <CommandItem
                  onSelect={() => {
                    changeTrack(track, true);
                    setOpen(false);
                  }}
                >
                  {track.name} - {track.artistNames}
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandSeparator />
        </CommandList>
      </CommandDialog>
    </>
  );
}
