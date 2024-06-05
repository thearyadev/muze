"use client";

import { useContext } from "react";
import { PlayerContext } from "~/components/app/player_context";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function Home() {
  const { data } = api.library.allSongs.useQuery({ page: 1, pageSize: 50 });
  console.log(data)
  const {changeTrack} = useContext(PlayerContext)
  return (
    <div className="overflow-y-scroll h-screen">
      {data?.map((item) => {
        return (
          <div className="text-white">
            {item.name} by {item.artistNames}
            <Button onClick={() => {changeTrack(item)}}>play</Button>
          </div>
        );
      })}
    </div>
  );
}
