"use client";

import { useContext } from "react";
import { PlayerContext } from "~/components/app/player_context";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export default function Home() {
  const { data } = api.library.allSongs.useQuery({ page: 1, pageSize: 88888 });
  const {setTrack} = useContext(PlayerContext)
  return (
    <div className="scroll-auto">
      {data?.map((item) => {
        return (
          <div className="text-white">
            {item.name} by {item.artistNames}
            <Button onClick={() => {setTrack(item)}}>play</Button>
          </div>
        );
      })}
    </div>
  );
}
