import "~/styles/globals.css";

import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import Player from "~/components/app/player";
import Sidebar from "~/components/app/sidebar";
import PlayerContextProvider from "~/components/app/player_context";

import Header from "~/components/app/header";
import KeybindContextProvider from "~/components/app/keybind_context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Muze",
  description: "Muze",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${inter.variable} opacity-10 transition-all duration-300 ease-in-out`}
      >
        <TRPCReactProvider>
          <PlayerContextProvider>
            <KeybindContextProvider>
              <div className="flex">
                <div className="hidden flex-none sm:block">
                  <Sidebar />
                </div>

                <div className="sm:hidden">
                  <Header />
                </div>

                <div className="grow">{children}</div>
              </div>

              <Player />
            </KeybindContextProvider>
          </PlayerContextProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
