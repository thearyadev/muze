import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import PageHeading from "~/components/app/page_heading";
import { TrackTable } from "~/components/app/track_table";
import { getAlbum, getAlbumTracks } from "~/lib/actions/library";

// export default async function AblumPage() {
//   return (
//     <>
//       <PageHeading>
//         <div className="flex flex-row items-center">
//           <Image
//             // alt={albumQuery?.album?.name || 'Album Cover'}
//             // src={`/api/covers?id=${tracks[0]?.id}&size=xl`}
//             className="mr-5 h-24 w-24 rounded-md"
//             loading="eager"
//             width={40}
//             height={40}
//           />
//           {albumQuery?.album?.name}
//         </div>
//       </PageHeading>
//       <TrackTableScroll tracks={tracks} />
//     </>
//   )
// }
//
export default async function AlbumPage({params}: {params: Promise<{albumId: string}>}) {
  const album = await getAlbum(
    (await params).albumId
  )
  if (!album.content) {
    return notFound()
  }

  const tracks = await getAlbumTracks(album.content.id)
  if (!tracks.content) {
    return notFound()
  }
  if (!tracks.content.length) {
    return notFound()
  }
  return (
    <>
      <PageHeading>
        <div className="flex flex-row items-center">
          {album.content.name}
        </div>
      </PageHeading>
      <TrackTable tracks={tracks.content} pageSize={50} page={1} toolbar/>
    </>
  )
}
