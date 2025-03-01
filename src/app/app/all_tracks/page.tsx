import { Suspense } from 'react'
import { Loading } from '~/components/app/loading'
import PageHeading from '~/components/app/page_heading'
import { TrackTable } from '~/components/app/track_table'
import { allTracks } from '~/lib/actions/library'

export default async function AllSongsPage() {
  return (
    <>
      <PageHeading>All Tracks</PageHeading>
      <Suspense fallback={<Loading />}>
        <AllSongsPageContent />
      </Suspense>
    </>
  )
}

async function AllSongsPageContent() {
  const querySettings = {
    page: 1,
    pageSize: 40,
  }
  const tracks = await allTracks(querySettings.page, querySettings.pageSize)
  const dataCallback = async (page: number, pageSize: number) => {
    "use server"
    return allTracks(page, pageSize).then((res) => res.content)
  }
  return <TrackTable
    initialTracks={tracks.content || []}
    page={querySettings.page}
    pageSize={querySettings.pageSize}
    dataCallback={dataCallback}
    toolbar={false}
  />


}
