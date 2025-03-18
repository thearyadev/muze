import PageHeading from '~/components/app/page_heading'
import { env } from '~/env'

export default async function Home() {
  return (
    <>
      <PageHeading>Home</PageHeading>
      <p>{env.TAG}</p>
    </>
  )
}
