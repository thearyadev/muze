import '~/styles/globals.css'

import { Inter } from 'next/font/google'

import { TRPCReactProvider } from '~/trpc/react'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata = {
  title: 'Muze',
  description: 'Muze',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${inter.variable}`}>
        <Toaster richColors className="bg-zinc-900 text-white" />
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
