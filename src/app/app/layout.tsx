import '~/styles/globals.css'

import Player from '~/components/app/player'
import Sidebar from '~/components/app/sidebar'
import PlayerContextProvider from '~/components/app/providers/player'

import { redirect } from 'next/navigation'
import PageWrapper from '~/components/app/page_wrapper'
import { getCurrentTrack, getUsername } from '~/lib/actions/user'
import { getTrack } from '~/lib/actions/library'

type TrackQuery = NonNullable<Awaited<ReturnType<typeof getTrack>>['content']>

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { content: username } = await getUsername()
  const { content: currentTrackInfo } = await getCurrentTrack()
  let currentTrack: TrackQuery | null = null
  let currentTrackPosition = 0
  if (
    currentTrackInfo !== undefined &&
    currentTrackInfo?.setCurrentTrackId !== null
  ) {
    const { content: track } = await getTrack(
      currentTrackInfo.setCurrentTrackId,
    )
    currentTrack = track ?? null
    currentTrackPosition = currentTrackInfo.setCurrentTrackPosition ?? 0
  }

  return (
    <PlayerContextProvider
      currentTrack={currentTrack}
      currentTrackPosition={currentTrackPosition}
    >
      <div className="grid grid-rows-[1fr_auto] h-screen">
        <div className="grid grid-cols-12 overflow-hidden">
          <div className="hidden lg:block col-span-3 2xl:col-span-2">
            <Sidebar username={username || 'error'} />
          </div>

          <div className="col-span-9 2xl:col-span-10 overflow-hidden">
            <PageWrapper>{children}</PageWrapper>
          </div>
        </div>

        <div className="">
          <Player />
        </div>
      </div>


    </PlayerContextProvider>
  )
}

