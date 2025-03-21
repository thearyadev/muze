import React from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { cn } from '~/lib/utils'
type ImageProps = React.ComponentProps<typeof Image>

export default function BufferedImage(props: ImageProps) {
  const [loaded, setLoaded] = React.useState(false)
  return (
    <div className={cn(props.className, !loaded ? 'animate-pulse' : null)}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
      >
        <Image {...props} onLoad={() => setLoaded(true)} />
      </motion.div>
    </div>
  )
}
