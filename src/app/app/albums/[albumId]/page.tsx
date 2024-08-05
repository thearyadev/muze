import Image from 'next/image'
import PageHeading from '~/components/app/page_heading'
import { TrackTableScroll } from '~/components/app/track_table'
import { api } from '~/trpc/server'

export default async function Home({
  params,
}: {
  params: { albumId: string }
}) {
  const albumQuery = await api.library.albumDetail(params.albumId)
  const tracks = albumQuery!.tracks
  console.log(tracks)
  return (
    <>
      <PageHeading>
        <div className="flex flex-row items-center">
          <Image
            alt={albumQuery!.album.name}
            src={`/api/covers?id=${tracks[0]!.id}&size=xl`}
            className="mr-5 h-24 w-24 rounded-md"
            loading="eager"
            width={40}
            height={40}
          />
          {albumQuery?.album.name}
        </div>
      </PageHeading>
      <TrackTableScroll tracks={tracks} />
    </>
  )
}
