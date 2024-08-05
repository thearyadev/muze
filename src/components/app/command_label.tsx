import { cn } from '~/lib/utils'

export default function CommandLabel({
  className,
  commandKey = '⌘',
  commandKeyChain = 'K',
}: {
  className?: string
  commandKey?: string
  commandKeyChain?: string
}) {
  return (
    <kbd
      className={cn(
        'bg-muted pointer-events-none h-5 select-none items-center gap-1 rounded px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex',
        className,
      )}
    >
      <span className="text-xs">{commandKey}</span>
      {commandKeyChain}
    </kbd>
  )
}
