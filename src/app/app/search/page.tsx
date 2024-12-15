'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PageHeading from '~/components/app/page_heading'
import { TrackTableScroll } from '~/components/app/track_table'
import { type allTracks, search } from '~/lib/actions/library'

type TrackQuery = NonNullable<Awaited<ReturnType<typeof allTracks>>['content']>

export default function Search() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const [tracks, setTracks] = useState<TrackQuery>([])

  useEffect(() => {
    if (query) {
      search(query).then((res) => {
        setTracks(res.content ?? [])
      })
    }
  }, [query])
  return (
    <>
      <PageHeading>Search</PageHeading>
      <TrackTableScroll tracks={tracks} />
    </>
  )
}
