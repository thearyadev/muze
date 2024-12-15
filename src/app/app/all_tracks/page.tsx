import PageHeading from '~/components/app/page_heading'
import { TrackTableScrollPaginated } from '~/components/app/track_table'
import { allTracks } from '~/lib/actions/library'

export default async function AllSongsPage() {
  const querySettings = {
    page: 1,
    pageSize: 5000,
  }
  const tracks = await allTracks(querySettings.page, querySettings.pageSize)

  return (
    <>
      <PageHeading>All Tracks</PageHeading>
      <TrackTableScrollPaginated
        initialTracks={tracks.content || []}
        page={querySettings.page}
        pageSize={querySettings.pageSize}
      />
    </>
  )
}
