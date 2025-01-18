import '~/styles/globals.css'

import Player from '~/components/app/player'
import Sidebar from '~/components/app/sidebar'
import PlayerContextProvider from '~/components/app/providers/player'

import { redirect } from 'next/navigation'
import PageWrapper from '~/components/app/page_wrapper'
import { getCurrentTrack, getUsername } from '~/lib/actions/user'
import { getTrack } from '~/lib/actions/library'
import StateViewer from '~/components/app/state_viewer'
import ScreenSizeIndicator from '~/components/app/ssi'
import { SidebarProvider } from '~/components/app/providers/sidebar'

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
      <SidebarProvider>
        {process.env.NODE_ENV !== 'production' && <ScreenSizeIndicator />}
        {process.env.NODE_ENV !== 'production' && <StateViewer />}

        <div className=" h-screen">
          <div className="overflow-hidden">
            <PageWrapper>{children}</PageWrapper>
          </div>

          <div className="absolute bottom-0 left-0">
            <Player />
          </div>
        </div>
      </SidebarProvider>
    </PlayerContextProvider>
  )
}
