import PageHeading from "~/components/app/page_heading";
import { TrackTableScrollPaginated } from "~/components/app/track_table";
import { api } from "~/trpc/server";

export const revalidate = 900;

export default async function AllSongsPage() {
  const querySettings = {
    page: 1,
    pageSize: 40,
  };
  const tracks = await api.library.allSongs({
    page: querySettings.page,
    pageSize: querySettings.pageSize,
  });
  return (
    <>
      <PageHeading>All Tracks</PageHeading>
      <TrackTableScrollPaginated
        initialTracks={tracks}
        page={querySettings.page}
        pageSize={querySettings.pageSize}
      />
    </>
  );
}
