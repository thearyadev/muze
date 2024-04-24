import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import Player from "~/components/app/player";
import Sidebar from "~/components/app/sidebar";
import PlayerContextProvider from "~/components/app/player_context";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Lyzard",
  description: "Lyzard",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable}`}>
        <TRPCReactProvider>
          <PlayerContextProvider>
            <div className="flex">
              <div className="hidden flex-none sm:block">
                <Sidebar />
              </div>
              <div className="grow">{children}</div>
            </div>

            <Player />
          </PlayerContextProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
