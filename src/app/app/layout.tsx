import '~/styles/globals.css'

import Player from '~/components/app/player'
import Sidebar from '~/components/app/sidebar'
import PlayerContextProvider from '~/components/app/providers/player'

import { redirect } from 'next/navigation'
import { getServerAuthSession } from '~/server/auth'
import Command from '~/components/app/command'
import SearchContextProvider from '~/components/app/searchContext'
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
      <SearchContextProvider>
        <Command />
        <div className="flex">
          <div className="hidden flex-none sm:block">
            <Sidebar username={session.user.name!} />
          </div>

          <div className="grow">
            <PageWrapper>{children}</PageWrapper>
          </div>
        </div>
        <div className="fixed bottom-0">
          <Player />
        </div>
      </SearchContextProvider>
    </PlayerContextProvider>
  )
}
