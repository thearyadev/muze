"use client";
import PageHeading from "~/components/app/page_heading";
import { useQueue } from "~/components/app/providers/queue";
import { TrackTableScroll } from "~/components/app/track_table";

export default function Queue() {
  const { queue } = useQueue()!;
  return (
    <>
      <PageHeading>Queue</PageHeading>
      <TrackTableScroll tracks={queue} />
    </>
  );
}
