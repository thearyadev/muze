import { Separator } from '../ui/separator'

export default function PageHeading({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <h1 className="p-3 pl-5 text-4xl font-bold text-white">{children}</h1>
      <Separator decorative={false} className="h-[2px]" />
    </>
  )
}
