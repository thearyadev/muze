import PageHeading from "~/components/app/page_heading";
import { api } from "~/trpc/server";

export default async function Home() {
  return (
    <>
      <PageHeading>Home</PageHeading>
    </>
  );
}
