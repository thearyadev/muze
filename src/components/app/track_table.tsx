'use client'
import { useRef, useState } from 'react'
import { ScrollArea } from '~/components/ui/scroll-area'

import { Separator } from '~/components/ui/separator'
import Link from 'next/link'
import { useTrack } from './providers/track'
import { useQueue } from './providers/queue'
import BufferedImage from './bufferedImage'
import type { allTracks } from '~/lib/actions/library'

type TrackQuery = NonNullable<
  Awaited<ReturnType<typeof allTracks>>['content']
>[0]

type TrackTableProps = {
  initialTracks?: TrackQuery[]
  tracks?: TrackQuery[]
  pageSize: number
  page: number
  toolbar: boolean
  dataCallback?: (
    page: number,
    pageSize: number,
  ) => Promise<TrackQuery[] | null>
}

function TrackCell({
  track,
  clickFn,
  index,
}: {
  track: TrackQuery
  clickFn: (track: TrackQuery) => void
  index: number
}) {
  return (
    <div
      className="grid grid-cols-12 grid-rows-1 gap-4 p-3 hover:bg-zinc-700 "
      onClick={() => clickFn(track)}
    >
      <div className="col-span-6 flex flex-row space-x-3 text-sm">
        <div>
          <BufferedImage
            alt={track?.name || 'Track Cover'}
            src={`/api/library/covers?id=${track?.id}&size=xl`}
            className="h-10 w-10 rounded-md bg-zinc-800"
            loading={index <= 20 ? 'eager' : 'lazy'}
            width={40}
            height={40}
          />
        </div>
        <div>
          <div>{track?.name}</div>
          <div className="">
            {track?.artistIds.split(';').map((artistId, index) => (
              <Link
                key={artistId}
                href={`/app/artists/${artistId}`}
                className="text-xs text-gray-500 transition-all fade-in-100 fade-out-100 hover:text-orange-400 "
                onClick={(e) => e.stopPropagation()}
              >
                {track?.artistNames.split(';')[index]}
                {index < track?.artistIds.split(';').length - 1 ? ', ' : ''}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-3 content-center">
        <Link
          href={`/app/albums/${track?.albumId}`}
          className="text-xs text-gray-500 transition-all fade-in-100 fade-out-100 hover:text-orange-400"
          onClick={(e) => e.stopPropagation()}
        >
          {track?.albumName}
        </Link>
      </div>
      <div className="col-span-2 content-center text-xs text-gray-500">
        {secondsToTimeString(track?.duration || 0)}
      </div>
      <div className="col-span-1 content-center text-xs text-gray-500">
        {track?.listens ?? 0}
      </div>
    </div>
  )
}

function secondsToTimeString(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  const timeString = `${minutes}:${
    remainingSeconds < 10 ? '0' : ''
  }${remainingSeconds}`
  return timeString
}
export function TrackTable(props: TrackTableProps) {
  const heightRef = useRef<number>(0)
  const [tracks, setTracks] = useState<TrackQuery[]>(props.initialTracks || [])
  const [page, setPage] = useState(props.page + 1)
  // biome-ignore lint/style/noNonNullAssertion :
  const { changeTrack } = useTrack()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { addTrackPrevious } = useQueue()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { track: currentTrack } = useTrack()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { replaceQueue, addQueueMany } = useQueue()!
  const handleTrackSwitch = (track: TrackQuery) => {
    if (currentTrack) addTrackPrevious(currentTrack)
    changeTrack(track, true)
  }

  const handleScroll = (currentPosition: number, maxPosition: number) => {
    const percentageScrolled = maxPosition - currentPosition
    if (percentageScrolled <= 200 && heightRef.current < maxPosition) {
      setPage((prevPage) => prevPage + 1)
      heightRef.current = maxPosition
      props.dataCallback?.(page, props.pageSize).then((tracks) => {
        setTracks((prevTracks) => [...prevTracks, ...(tracks || [])])
      })
    }
  }

  return (
    <div className="h-full">
      {props.toolbar && (
        <div className="text-gray-500 py-1 w-full text-center grid grid-cols-2">
          <div
            className="text-xs hover:text-orange-400 cursor-pointer col-span-1"
            onClick={() => {
              replaceQueue(props.tracks || [])
            }}
          >
            Clear Queue and Play
          </div>

          <div
            className="text-xs hover:text-orange-400 cursor-pointer col-span-1"
            onClick={() => {
              addQueueMany(props.tracks || [])
            }}
          >
            Add to Queue
          </div>
        </div>
      )}
      <div className="grid grid-cols-12 grid-rows-1 gap-4 p-3  text-gray-500">
        <div className="col-span-6 text-xs">TRACK</div>
        <div className="col-span-3 text-xs">ALBUM</div>
        <div className="col-span-2 text-xs">TIME</div>
        <div className="col-span-1 text-xs">LISTENS</div>
      </div>
      <Separator />
      <ScrollArea
        className="h-full w-full rounded-md"
        onScrollCapture={(e) => {
          // @ts-expect-error scroll event "doent have" this property
          const maxScroll = e.target.scrollHeight - e.target.clientHeight
          // @ts-expect-error scroll event "doent have" this property
          const cur = e.target.scrollTop as number
          handleScroll(cur, maxScroll)
        }}
      >
        {tracks.map((track, index) => {
          return (
            <TrackCell
              key={track?.id}
              track={track}
              clickFn={handleTrackSwitch}
              index={index}
            />
          )
        })}

        {props.tracks?.map((track, index) => {
          return (
            <TrackCell
              key={track?.id}
              track={track}
              clickFn={handleTrackSwitch}
              index={index}
            />
          )
        })}

        <div className="pb-48" />
      </ScrollArea>
    </div>
  )
}
