import { notFound } from 'next/navigation'
import PageHeading from '~/components/app/page_heading'
import { TrackTable } from '~/components/app/track_table'
import { getArtist, getArtistTracks } from '~/lib/actions/library'

export default async function ArtistPage({
  params,
}: { params: Promise<{ artistId: string }> }) {
  const artist = await getArtist((await params).artistId)
  if (!artist.content) {
    return notFound()
  }

  const tracks = await getArtistTracks(artist.content.id)
  if (!tracks.content) {
    return notFound()
  }
  if (!tracks.content.length) {
    return notFound()
  }
  return (
    <>
      <PageHeading>
        <div className="flex flex-row items-center">{artist.content.name}</div>
      </PageHeading>
      <TrackTable tracks={tracks.content} pageSize={50} page={1} toolbar />
    </>
  )
}
