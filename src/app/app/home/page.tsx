"use client";

import { useContext, useState } from "react";
import { PlayerContext } from "~/components/app/player_context";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

import { Input } from "~/components/ui/searchInput";

export default function Home() {
  const { data } = api.library.allSongs.useQuery({ page: 1, pageSize: 900 });
  const { addToQueue } = useContext(PlayerContext);
  return (
    <>
            <div className="h-screen overflow-y-scroll">
        {data?.map((item) => {
          return (
            <div className="text-white" key={item.id}>
              {item.name} by {item.artistNames}
              <Button
                onClick={() => {
                  addToQueue(item)
                }}
              >
                add to queue
              </Button>
            </div>
          );
        })}
      </div>
    </>
  );
}
