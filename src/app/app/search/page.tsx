'use client'
import { useDebouncedCallback } from '@mantine/hooks'
import { useState } from 'react'
import PageHeading from '~/components/app/page_heading'
import { TrackTable } from '~/components/app/track_table'
import { Input } from '~/components/ui/input'
import { type allTracks, search } from '~/lib/actions/library'

type TrackQuery = NonNullable<
  Awaited<ReturnType<typeof allTracks>>['content']
>[0]

export default function Search() {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<TrackQuery[]>([])
  const handleSearchInput = useDebouncedCallback((query: string) => {
    search(query).then(({ content }) => {
      setTracks(content ?? [])
    })
  }, 500)

  return (
    <>
      <PageHeading>
        <Input
          autoFocus={true}
          className="h-10 bg-zinc-800 border-zinc-700"
          placeholder="Enter a Search Query"
          type="text"
          value={query}
          onChange={(e) => {
            handleSearchInput(e.target.value)
            setQuery(e.target.value)
          }}
        />
      </PageHeading>
      <TrackTable tracks={tracks} pageSize={50} page={1} toolbar />
    </>
  )
}
