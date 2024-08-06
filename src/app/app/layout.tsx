import '~/styles/globals.css'

import Player from '~/components/app/player'
import Sidebar from '~/components/app/sidebar'
import PlayerContextProvider from '~/components/app/providers/player'

import { redirect } from 'next/navigation'
import { getServerAuthSession } from '~/server/auth'
import PageWrapper from '~/components/app/page_wrapper'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerAuthSession()
  if (!session) {
    redirect('/login')
  }

  return (
    <PlayerContextProvider>
      <div className="flex">
        <div className="hidden flex-none sm:block">
          <Sidebar username={session.user.name || 'error'} />
        </div>

        <div className="grow">
          <PageWrapper>{children}</PageWrapper>
        </div>
      </div>
      <div className="fixed bottom-0">
        <Player />
      </div>
    </PlayerContextProvider>
  )
}
