import '~/styles/globals.css'

import Player from '~/components/app/player'
import PlayerContextProvider from '~/components/app/providers/player'

import { redirect } from 'next/navigation'
import { PageWrapper } from '~/components/app/page_wrapper'
import { getUsername } from '~/lib/actions/user'
import { getTrack } from '~/lib/actions/library'
import StateViewer from '~/components/app/state_viewer'
import ScreenSizeIndicator from '~/components/app/ssi'
import { SidebarProvider } from '~/components/ui/sidebar'
import { getCurrentTrack } from '~/lib/actions/user'

type TrackQuery = NonNullable<Awaited<ReturnType<typeof getTrack>>['content']>

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { status_code } = await getUsername()

  if (status_code !== 200) {
    redirect('/login')
  }

  const { content: currentTrackInfo } = await getCurrentTrack()

  let currentTrack: TrackQuery | null = null
  let currentTrackPosition = 0
  if (
    currentTrackInfo !== null &&
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

        <div className="h-screen flex flex-col">
          <div className="overflow-hidden flex-1 ">
            <PageWrapper>{children}</PageWrapper>
          </div>

          <div className="flex-shrink-0">
            <Player />
          </div>
        </div>
      </SidebarProvider>
    </PlayerContextProvider>
  )
}
