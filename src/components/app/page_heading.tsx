'use client'
import { Separator } from '../ui/separator'
import { PanelLeft } from 'lucide-react'
import { useSidebar } from '~/components/ui/sidebar'

export default function PageHeading({
  children,
}: {
  children: React.ReactNode
}) {
  // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
  const { setOpen, open } = useSidebar()!
  return (
    <>
      <div className="flex flex-row items-center pl-4">
        <PanelLeft
          className="text-white hover:text-orange-400"
          onClick={() => {
            setOpen(!open)
          }}
        />
        <h1 className="p-3 pl-5 text-4xl font-bold text-white">{children}</h1>
      </div>
      <Separator decorative={false} className="h-[2px]" />
    </>
  )
}
