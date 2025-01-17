'use client'
import { BlockOutlined, CloseOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useAutoplay } from './providers/autoplay'
import { useLoop } from './providers/loop'
import { useVolume } from './providers/volume'
import { usePlaying } from './providers/playing'
import { useTrack } from './providers/track'
import { usePosition } from './providers/position'
import { useQueue } from './providers/queue'

export default function StateViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }
  // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
  const { autoplay } = useAutoplay()!
  // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
  const { loop } = useLoop()!
  // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
  const { volume } = useVolume()!
  // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
  const { playing } = usePlaying()!
  // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
  const { track } = useTrack()!
  // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
  const { position, maxposition } = usePosition()!
  // biome-ignore lint/style/noNonNullAssertion : the moment it loads, its not null.
  const { queue, queuePlayed } = useQueue()!

  return (
    <>
      <div className="fixed z-[9000] right-1 top-1 transition-all duration-300 ease-in-out">
        <div
          className="rounded-full p-4 bg-zinc-950 text-white flex justify-center items-center hover:bg-zinc-900 cursor-pointer"
          onClick={toggleMenu}
          onKeyDown={toggleMenu}
        >
          <BlockOutlined className={isOpen ? 'hidden' : ''} />
          <CloseOutlined className={isOpen ? '' : 'hidden'} />
        </div>
      </div>
      <div
        className={`fixed z-[9000] right-14 top-1 bg-zinc-900 p-6 overflow-y-auto w-96 h-[32rem] rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0 -translate-y-5'
        }`}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <div className="space-y-6">
          <div className="bg-zinc-800 p-4 rounded-lg">
            <h3 className="text-zinc-400 text-sm font-semibold mb-3">
              Player Status
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <StatusItem label="Autoplay" value={autoplay ? 'On' : 'Off'} />
              <StatusItem label="Loop" value={loop ? 'On' : 'Off'} />
              <StatusItem label="Volume" value={`${volume}%`} />
              <StatusItem
                label="Playing"
                value={playing ? 'Playing' : 'Paused'}
              />
            </div>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <h3 className="text-zinc-400 text-sm font-semibold mb-3">
              Current Track
            </h3>
            <div className="space-y-2">
              <StatusItem label="Track" value={track?.name || 'None'} />
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Position:</span>
                <span className="text-white">
                  {position} / {maxposition}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <h3 className="text-zinc-400 text-sm font-semibold mb-3">
              Queue ({queue.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {queue.map((track, index) => (
                <div
                  key={track.id}
                  className="text-white text-sm bg-zinc-700 p-2 rounded"
                >
                  {index + 1}. {track.name}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-800 p-4 rounded-lg">
            <h3 className="text-zinc-400 text-sm font-semibold mb-3">
              History ({queuePlayed.length})
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {queuePlayed.map((track, index) => (
                <div
                  key={track.id}
                  className="text-white text-sm bg-zinc-700 p-2 rounded"
                >
                  {index + 1}. {track.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-400">{label}:</span>
      <span className="text-white">{value}</span>
    </div>
  )
}
