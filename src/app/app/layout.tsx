import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import Player from "~/components/app/player";
import Sidebar from "~/components/app/sidebar";
import PlayerContextProvider from "~/components/app/player_context";

import Header from "~/components/app/header";
import KeybindContextProvider from "~/components/app/keybind_context";
import { SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Muze",
  description: "Muze",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
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
      <div className="flex">
        <div className="hidden flex-none sm:block">
          <Sidebar />
        </div>

        <div className="sm:hidden">
          <Header />
        </div>

        <div className="grow">{children}</div>
      </div>
      <div className="fixed bottom-0">

        <Player />
      </div>
    </PlayerContextProvider>
  );
}
