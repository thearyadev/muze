'use client'

import React, { type RefObject } from 'react'
import Link from 'next/link'

import { VolumeSlider } from '../ui/slider'

import {
  SpeakerLoudIcon as SpeakerIconOn,
  SpeakerOffIcon as SpeakerIconOff,
} from '@radix-ui/react-icons'

import {} from '@ant-design/icons'

import {
  IconPlayerPlay as PlayIcon,
  IconPlayerSkipForward as StepForwardIcon,
  IconPlayerSkipBack as StepBackwardIcon,
  IconArrowsShuffle as AutoplayIcon,
  IconRepeat as LoopIcon,
  IconPlayerPause as PauseIcon,
} from '@tabler/icons-react'

import { useTrack } from './providers/track'
import { useVolume } from './providers/volume'
import { useLoop } from './providers/loop'
import { usePlaying } from './providers/playing'
import { usePosition } from './providers/position'
import { useQueue } from './providers/queue'
import { useAutoplay } from './providers/autoplay'

function PlayerBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-20 w-screen grid-cols-3 bg-zinc-800 pl-4 pr-4 shadow-3xl shadow-slate-950">
      {children}
    </div>
  )
}
import { frame, motion, useMotionValue } from 'motion/react'
import { cn } from '~/lib/utils'
import BufferedImage from './bufferedImage'
export function useTooltipFollowPointer(
  ref: RefObject<HTMLDivElement | null>,
  y: number,
) {
  const x = useMotionValue(0)

  React.useEffect(() => {
    if (!ref.current) return

    const handlePointerMove = ({ clientX }: MouseEvent) => {
      const element = ref.current
      if (!element) return

      frame.read(() => {
        x.set(clientX - element.offsetLeft - element.offsetWidth / 2)
      })
    }

    window.addEventListener('pointermove', handlePointerMove)

    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [x.set, ref])

  return { x, y }
}

function secondsToTimeString(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  const timeString = `${minutes}:${
    remainingSeconds < 10 ? '0' : ''
  }${remainingSeconds}`
  return timeString
}
function TrackPositionSlider() {
  // biome-ignore lint/style/noNonNullAssertion :
  const { position, changePosition, maxposition } = usePosition()!
  const currentPercentage = ((position[0] as number) / maxposition) * 100
  const [hovering, setHovering] = React.useState(false)

  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const hoverTime = useMotionValue('0:00')

  const { x, y } = useTooltipFollowPointer(tooltipRef, -45)
  return (
    <>
      <motion.div
        className={cn(
          "absolute text-sm px-3 py-2 rounded-md z-50 pointer-events-none bg-orange-400 text-white border-b-1 border-orange-400 border font-medium shadow-lg-top-12 left-1/2 -translate-x-1/2 before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:bottom-[-6px] before:border-l-[6px] before:border-l-transparent before:border-t-[6px] before:border-t-orange-400 before:border-r-[6px] before:border-r-transparent",
          !hovering ? 'hidden' : null,
        )}
        ref={tooltipRef}
        style={{
          x,
          y,
        }}
        animate={{ opacity: hovering ? 1 : 0 }}
      >
        {hoverTime}
      </motion.div>
      <motion.div
        className="relative cursor-pointer min-h-6 -mb-6"
        onMouseDown={(e) => {
          const clickX = e.clientX
          const divWidth = (e.target as HTMLDivElement).offsetWidth
          const percentage = clickX / divWidth
          const newPosition = percentage * maxposition
          changePosition([newPosition])
        }}
        onPointerMove={(e) => {
          const hoverX = e.clientX
          const divWidth = (e.target as HTMLDivElement).offsetWidth
          const percentage = hoverX / divWidth
          const hoveredPosition = percentage * maxposition
          hoverTime.set(secondsToTimeString(hoveredPosition))
        }}
        onPointerLeave={() => {
          setHovering(false)
        }}
        onPointerEnter={() => {
          setHovering(true)
        }}
      >
        <motion.div className="bg-gray-500 min-h-0.5 absolute top-0 left-0 w-full" />
        <motion.div
          className="bg-orange-400 min-h-0.5 absolute top-0 left-0 pointer-events-none"
          animate={{ width: `${currentPercentage}%` }}
          transition={{
            type: 'tween',
            ease: 'linear',
            duration: 0.18,
          }}
        />
      </motion.div>
    </>
  )
}
export default function Player() {
  // biome-ignore lint/style/noNonNullAssertion :
  const { track } = useTrack()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { volume, changeVolume, toggleMute, muted } = useVolume()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { queue } = useQueue()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { loop, changeLoop } = useLoop()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { autoplay, changeAutoplay } = useAutoplay()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { playing, setPlayingTrue, setPlayingFalse } = usePlaying()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { nextTrack, previousTrack } = useQueue()!
  return (
    <div className="select-none">
      <div className="w-screen" />
      <TrackPositionSlider />
      <PlayerBody>
        <div
          className="flex flex-row items-center"
          // Track Info
        >
          {track !== null ? (
            <>
              <BufferedImage
                alt={track.name || 'Track Cover'}
                src={`/api/library/covers?id=${track.id}&size=xl`}
                className="h-16 w-16 rounded-md bg-zinc-800"
                loading="eager"
                width={40}
                height={40}
              />
              <div className="hidden pl-3 sm:block">
                <p className="text-sm leading-tight text-white">{track.name}</p>
                {track.artistIds.split(';').map((artistId, index) => (
                  <Link
                    key={artistId}
                    href={`/app/artists/${artistId}`}
                    className="text-xs text-gray-500 transition-all fade-in-100 fade-out-100 hover:text-orange-400 "
                  >
                    {track.artistNames.split(';')[index]}
                    {index < track.artistIds.split(';').length - 1 ? ', ' : ''}
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>
        <div
          className="flex flex-row items-center justify-center  space-x-3 md:space-x-10 align-middle"
          // controls.
        >
          <div className="flex flex-row items-center space-x-5 ">
            <div
              className={cn(
                'px-4 py-2 rounded-md',
                'transition-all duration-300 ease-in-out',
                autoplay
                  ? 'bg-orange-500 text-white'
                  : 'bg-transparent hover:text-orange-500 hover:bg-orange-50',
              )}
              onClick={() => {
                changeAutoplay(!autoplay)
              }}
            >
              <AutoplayIcon
                size={15}
                className={cn('text-xs', 'transition-all duration-300')}
              />
            </div>
            <StepBackwardIcon
              size={20}
              className="text-xl text-white transition duration-100 hover:text-orange-400"
              onClick={previousTrack}
            />
          </div>
          <div>
            {playing ? (
              <PauseIcon
                className="text-4xl text-white transition duration-100 hover:text-orange-400"
                onClick={setPlayingFalse}
              />
            ) : (
              <PlayIcon
                className="text-4xl text-white transition duration-100 hover:text-orange-400"
                onClick={setPlayingTrue}
              />
            )}
          </div>

          <div className="flex flex-row items-center space-x-5 ">
            <StepForwardIcon
              size={20}
              className="text-xl text-white transition duration-100 hover:text-orange-400"
              onClick={() => {
                if (queue.length === 0 && autoplay === false) {
                  changeAutoplay(true)
                }
                nextTrack(true)
              }}
            />
            <div
              className={cn(
                'px-4 py-2 rounded-md',
                'transition-all duration-300 ease-in-out',
                loop
                  ? 'bg-orange-500 text-white'
                  : 'bg-transparent hover:text-orange-500 hover:bg-orange-50',
              )}
              onClick={() => {
                changeLoop(!loop)
              }}
            >
              <LoopIcon
                size={15}
                className={cn('text-xs', 'transition-all duration-300')}
              />
            </div>
          </div>
        </div>
        <div
          className="hidden flex-row items-center justify-end space-x-4 sm:flex"
          // volume
        >
          <SpeakerIconOn
            className={!muted ? 'text-white' : 'hidden'}
            onClick={() => {
              toggleMute()
            }}
          />
          <SpeakerIconOff
            className={muted ? 'text-white' : 'hidden'}
            onClick={() => {
              toggleMute()
            }}
          />
          <VolumeSlider
            defaultValue={[volume]}
            value={[muted ? 0 : volume]}
            max={100}
            step={1}
            disabled={muted}
            className="w-[30%]"
            onValueChange={(v) => changeVolume(v[0] || 0)}
          />
        </div>
      </PlayerBody>
    </div>
  )
}
