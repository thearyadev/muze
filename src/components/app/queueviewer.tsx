"use client";

import { useAutoplay } from "./providers/autoplay";
import { useQueue } from "./providers/queue";
export default function QueueViewer() {
  // biome-ignore lint/style/noNonNullAssertion :
  const {queuePlayed, queue} = useQueue()!
  const {autoplay} = useAutoplay()!

  return <div className="absolute top-0 left-0">
    {autoplay ? <h1>Autoplay</h1> : null}
    <h1>Queue</h1>
    {queue.map((track, index) => {
      return <div key={track.id}>
        {index + 1}. {track.name}
      </div>
    })}
    <h1>Queue Played</h1>
    {queuePlayed.map((track, index) => {
      return <div key={track?.id}>
        {index + 1}. {track?.name}
      </div>
    })}
  </div>
}
