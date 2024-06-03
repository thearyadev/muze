import { allSongs } from "~/lib/actions";
import { api } from "~/trpc/server";

export default async function Home() {
  const songs = await allSongs({pageSize: 1, page: 2})
  console.log(songs)
  return <p>Songs</p>;
}
