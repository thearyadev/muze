"use client";
import { FormEventHandler, useContext, useEffect, useState } from "react";

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
import { useDebouncedState, useHotkeys } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { ApiFilled } from "@ant-design/icons";
import type { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "~/server/api/root";
import { CommandLoading } from "cmdk";
type RouterOutput = inferRouterOutputs<AppRouter>;
type TrackQuery = RouterOutput["library"]["searchTrack"];
export default function Command() {
  const { open, setOpen } = useContext(SearchContext);
  const [searchQuery, setSearchQuery] = useDebouncedState("", 500);
  const [trackResults, setTrackResults] = useState<TrackQuery>([]);
  const [loading, setLoading] = useState(false);
  const { changeTrack } = useContext(PlayerContext);
  const utils = api.useUtils();
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

  const handleInput: FormEventHandler<HTMLInputElement> = async (event) => {
    setLoading(true)
    setSearchQuery(event.currentTarget.value);
  };

  useEffect(() => {
    if (searchQuery.length) {
      utils.library.searchTrack.fetch(searchQuery).then((data) => {
        setTrackResults(data);
        setLoading(false)
      });
    }
  }, [searchQuery]);
  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search your library..."
          onInput={handleInput}
        />
        <CommandList>
          {loading && <CommandLoading>Hang on…</CommandLoading>}
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Tracks">
            {trackResults?.map((track) => {
              return (
                <CommandItem
                  onSelect={() => {
                    changeTrack(track, true);
                    setOpen(false);
                  }}
                  className="text-lg dark:data-[selected=true]:font-extrabold"
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
