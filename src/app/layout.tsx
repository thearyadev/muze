import '~/styles/globals.css'

import { Inter } from 'next/font/google'

import { Toaster } from 'sonner'
import ScreenSizeIndicator from '~/components/app/ssi'

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
        {children}
      </body>
    </html>
  )
}
