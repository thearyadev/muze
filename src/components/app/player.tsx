'use client'

import type React from 'react'
import Link from 'next/link'

import { VolumeSlider, TrackSlider } from '../ui/slider'

import {
  LoopIcon,
  SpeakerLoudIcon as SpeakerIconOn,
  SpeakerOffIcon as SpeakerIconOff,
} from '@radix-ui/react-icons'

import {
  PlayCircleOutlined as PlayIcon,
  PauseCircleOutlined as PauseIcon,
  StepBackwardFilled as StepBackwardIcon,
  StepForwardFilled as StepForwardIcon,
  SwapOutlined as AutoplayIcon,
} from '@ant-design/icons'

import { useTrack } from './providers/track'
import { useVolume } from './providers/volume'
import { useLoop } from './providers/loop'
import { usePlaying } from './providers/playing'
import { usePosition } from './providers/position'
import { useQueue } from './providers/queue'
import Image from 'next/image'
import { useAutoplay } from './providers/autoplay'

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
            src={`/api/library/covers?id=${track.id}&size=xl`}
            className="h-16 w-16 rounded-md"
            loading="eager"
            width={40}
            height={40}
            placeholder="blur"
            blurDataURL="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCABkAGQBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAj/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAA/AIkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9k="
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
          <div className="flex flex-row items-center space-x-5 ">
            <AutoplayIcon
              className={`text-xs text-gray-400 hover:text-orange-400 ${autoplay ? 'text-orange-400' : null}`}
              onClick={() => {
                autoplay ? changeAutoplay(false) : changeAutoplay(true)
                // loop ? changeLoop(false) : null
              }}
            />
            <StepBackwardIcon
              className="text-xl text-white transition duration-100 hover:text-orange-400"
              onClick={previousTrack}
            />
          </div>
          <PauseIcon
            className={`text-4xl text-white transition duration-100 hover:text-orange-400 ${!playing ? 'hidden' : null}`}
            onClick={setPlayingFalse}
          />
          <PlayIcon
            className={`text-4xl text-white transition duration-100 hover:text-orange-400 ${!playing ? null : 'hidden'}`}
            onClick={setPlayingTrue}
          />
          <div className="flex flex-row items-center space-x-5 ">
            <StepForwardIcon
              className="text-xl text-white transition duration-100 hover:text-orange-400"
              onClick={() => {
                if (queue.length === 0 && autoplay === false) {
                  changeAutoplay(true)
                }
                nextTrack()
              }}
            />
            <LoopIcon
              className={`text-xs text-gray-400 hover:text-orange-400 ${loop ? 'text-orange-400' : null}`}
              onClick={() => {
                loop ? changeLoop(false) : changeLoop(true)
                // autoplay ? changeAutoplay(false) : null
              }}
            />
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
