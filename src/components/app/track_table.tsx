"use client";
import type { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "~/server/api/root";
import { useContext, useEffect, useRef, useState, memo } from "react";
import { api } from "~/trpc/react";
import { ScrollArea } from "~/components/ui/scroll-area";

import { Separator } from "~/components/ui/separator";
import Link from "next/link";
import { PlayerContext } from "./player_context";
import { useTrack } from "./providers/track";
import { useQueue } from "./providers/queue";
type RouterOutput = inferRouterOutputs<AppRouter>;

type TrackQuery = RouterOutput["library"]["getTrack"];

type TrackTableScrollPaginatedProps = {
  initialTracks: TrackQuery[];
  pageSize: number;
  page: number;
};
type TrackTableScroll = {
  tracks: TrackQuery[];
};

function TrackCell({
  track,
  clickFn,
  index,
}: {
  track: TrackQuery;
  clickFn: (track: TrackQuery) => void;
  index: number;
}) {
  return (
    <div
      className="grid grid-cols-12 grid-rows-1 gap-4 p-3 hover:bg-zinc-700 "
      onMouseDown={() => clickFn(track)}
    >
      <div className="col-span-6 flex flex-row space-x-3 text-sm">
        <div>
          <img
            src={`/api/covers?id=${track!.id}]`}
            className="h-10 w-10 rounded-md"
            loading={index <= 20 ? "eager" : "lazy"}
          />
        </div>
        <div>
          <div>{track!.name}</div>
          <div className="">
            {track!.artistIds.split(";").map((artistId, index) => (
              <Link
                href={`/artist/${artistId}`}
                className="text-xs text-gray-500 transition-all fade-in-100 fade-out-100 hover:text-orange-400 "
              >
                {track!.artistNames.split(";")[index]}
                {index < track!.artistIds.split(";").length - 1 ? ", " : ""}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-3 content-center">
        <Link
          href={`/app/albums/${track!.albumId}`}
          className="text-xs text-gray-500 transition-all fade-in-100 fade-out-100 hover:text-orange-400"
        >
          {track!.albumName}
        </Link>
      </div>
      <div className="col-span-2 content-center text-xs text-gray-500">
        {secondsToTimeString(track!.duration as number)}
      </div>
    </div>
  );
}

function secondsToTimeString(seconds: number) {
  var minutes = Math.floor(seconds / 60);
  var remainingSeconds = Math.floor(seconds % 60);

  var timeString =
    minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;
  return timeString;
}
export function TrackTableScrollPaginated(
  props: TrackTableScrollPaginatedProps,
) {
  const heightRef = useRef<number>(0);
  const [tracks, setTracks] = useState<TrackQuery[]>(props.initialTracks);
  const [page, setPage] = useState(props.page + 1);
  const { changeTrack } = useTrack()!;
  const { addTrackPrevious, addTrack } = useQueue()!;
  const { track: currentTrack } = useTrack()!;
  const { data } = api.library.allSongs.useQuery({
    page: page,
    pageSize: props.pageSize,
  });
  const handleTrackSwitch = (track: TrackQuery) => {
    if (currentTrack) addTrackPrevious(currentTrack);
    changeTrack(track, true);
  };

  const handleScroll = (currentPosition: number, maxPosition: number) => {
    const percentageScrolled = maxPosition - currentPosition;
    if (percentageScrolled <= 200 && heightRef.current < maxPosition) {
      setPage((prevPage) => prevPage + 1);
      heightRef.current = maxPosition;
    }
  };

  useEffect(() => {
    if (data) setTracks((prevTracks) => [...prevTracks, ...data]);
  }, [data]);

  return (
    <>
      <div className="grid grid-cols-12 grid-rows-1 gap-4 p-3  text-gray-500">
        <div className="col-span-6 text-xs">TRACK</div>
        <div className="col-span-3 text-xs">ALBUM</div>
        <div className="col-span-2 text-xs">TIME</div>
      </div>
      <Separator />
      <ScrollArea
        className="h-full w-full rounded-md"
        onScrollCapture={(e) => {
          // @ts-ignore
          const maxScroll = e.target.scrollHeight - e.target.clientHeight;
          // @ts-ignore
          const cur = e.target.scrollTop;
          handleScroll(cur, maxScroll);
        }}
      >
        {tracks.map((track, index) => {
          return (
            <TrackCell
              track={track}
              clickFn={handleTrackSwitch}
              index={index}
            />
          );
        })}

        <div className="pb-52" />
      </ScrollArea>
    </>
  );
}
export function TrackTableScroll(props: TrackTableScroll) {
  const { changeTrack } = useTrack()!;
  const { addTrackPrevious } = useQueue()!;
  const { track: currentTrack } = useTrack()!;
  const handleTrackSwitch = (track: TrackQuery) => {
    if (currentTrack) addTrackPrevious(currentTrack);
    changeTrack(track, true);
  };

  return (
    <>
      <div className="grid grid-cols-12 grid-rows-1 gap-4 p-3  text-gray-500">
        <div className="col-span-6 text-xs">TRACK</div>
        <div className="col-span-3 text-xs">ALBUM</div>
        <div className="col-span-2 text-xs">TIME</div>
      </div>
      <Separator />
      <ScrollArea className="h-full w-full rounded-md">
        {props.tracks.map((track, index) => {
          return (
            <TrackCell
              track={track}
              clickFn={handleTrackSwitch}
              index={index}
            />
          );
        })}

        <div className="pb-52" />
      </ScrollArea>
    </>
  );
}
