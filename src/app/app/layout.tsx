import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import Player from "~/components/app/player";
import Sidebar from "~/components/app/sidebar";
import PlayerContextProvider from "~/components/app/player_context";

import Header from "~/components/app/header";
import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";
import Command from "~/components/app/command";
import SearchContextProvider, {
  SearchContext,
} from "~/components/app/searchContext";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <PlayerContextProvider>
      <SearchContextProvider>
        <Command />
        <div className="flex">
          <div className="hidden flex-none sm:block">
            <Sidebar username={session.user.name as string} />
          </div>

          <div className="sm:hidden">
            <Header />
          </div>

          <div className="grow">{children}</div>
        </div>
        <div className="fixed bottom-0">
          <Player />
        </div>
      </SearchContextProvider>
    </PlayerContextProvider>
  );
}
