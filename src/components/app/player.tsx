'use client'

import type React from 'react'
import Link from 'next/link'

import { VolumeSlider, TrackSlider } from '../ui/slider'

import { LoopIcon, SpeakerLoudIcon as SpeakerIcon } from '@radix-ui/react-icons'

import {
  PlayCircleOutlined as PlayIcon,
  PauseCircleOutlined as PauseIcon,
  StepBackwardFilled as StepBackwardIcon,
  StepForwardFilled as StepForwardIcon,
} from '@ant-design/icons'

import { useTrack } from './providers/track'
import { useVolume } from './providers/volume'
import { useLoop } from './providers/loop'
import { usePlaying } from './providers/playing'
import { usePosition } from './providers/position'
import { useQueue } from './providers/queue'
import Image from 'next/image'

function PlayerBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-20 w-screen grid-cols-3 bg-zinc-800 pl-4 pr-4 shadow-3xl shadow-slate-950">
      {children}
    </div>
  )
}

function TrackSliderPosition() {
  // biome-ignore lint/style/noNonNullAssertion :
  const { position, changePosition, maxposition } = usePosition()!
  return (
    <TrackSlider
      defaultValue={position}
      max={maxposition}
      value={position}
      step={0.1}
      onValueChange={(value) => {
        changePosition(value)
        // if (!audioRef.current) return;
        // audioRef.current.currentTime = value[0] as number;
      }}
      className="w-screen transition duration-75"
    />
  )
}

export default function Player() {
  // biome-ignore lint/style/noNonNullAssertion :
  const { track } = useTrack()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { volume, changeVolume } = useVolume()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { loop, changeLoop } = useLoop()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { playing, setPlayingTrue, setPlayingFalse } = usePlaying()!
  // biome-ignore lint/style/noNonNullAssertion :
  const { nextTrack, previousTrack } = useQueue()!

  if (track === null) {
    return (
      // replace with skeleton
      <div className="select-none">
        <PlayerBody>{null}</PlayerBody>
      </div>
    )
  }

  return (
    <div className="select-none">
      <div className="w-screen" />
      <TrackSliderPosition />
      <PlayerBody>
        <div
          className="flex flex-row items-center"
          // Track Info
        >
          <Image
            alt={track.name || 'Track Cover'}
            src={`/api/library/covers?id=${track.id}&size=md`}
            className="h-16 w-16 rounded-md"
            loading="eager"
            width={40}
            height={40}
          />

          <div className="hidden pl-3 sm:block">
            <p className="text-sm leading-tight text-white">{track.name}</p>
            {track.artistIds.split(';').map((artistId, index) => (
              <Link
                key={artistId}
                href={`/artist/${artistId}`}
                className="text-xs text-gray-500 transition-all fade-in-100 fade-out-100 hover:text-orange-400 "
              >
                {track.artistNames.split(';')[index]}
                {index < track.artistIds.split(';').length - 1 ? ', ' : ''}
              </Link>
            ))}
          </div>
        </div>
        <div
          className="flex flex-row items-center justify-center space-x-10 align-middle"
          // controls
        >
          <StepBackwardIcon
            className="text-xl text-white transition duration-100 hover:text-orange-400"
            onMouseDown={previousTrack}
          />
          <PauseIcon
            className={`text-4xl text-white transition duration-100 hover:text-orange-400 ${!playing ? 'hidden' : null}`}
            onMouseDown={setPlayingFalse}
          />
          <PlayIcon
            className={`text-4xl text-white transition duration-100 hover:text-orange-400 ${!playing ? null : 'hidden'}`}
            onMouseDown={setPlayingTrue}
          />
          <div className="flex flex-row items-center space-x-5 ">
            <StepForwardIcon
              className="text-xl text-white transition duration-100 hover:text-orange-400"
              onMouseDown={nextTrack}
            />
            <LoopIcon
              className={`text-xs text-gray-400 hover:text-orange-400 ${loop ? 'text-orange-400' : null}`}
              onMouseDown={() => {
                loop ? changeLoop(false) : changeLoop(true)
              }}
            />
          </div>
        </div>
        <div
          className="hidden flex-row items-center justify-end space-x-4 sm:flex"
          // volume
        >
          <SpeakerIcon className="text-white" />
          <VolumeSlider
            defaultValue={[volume]}
            value={[volume]}
            max={100}
            step={1}
            className="w-[30%]"
            onValueChange={(v) => changeVolume(v[0] || 0)}
          />
        </div>
      </PlayerBody>
    </div>
  )
}
