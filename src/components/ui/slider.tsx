"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "~/lib/utils";

const VolumeSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-zinc-900/20 dark:bg-zinc-50/20">
      <SliderPrimitive.Range className="absolute h-full bg-zinc-400 dark:bg-zinc-200" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-3 w-3 rounded-full border border-zinc-200 border-zinc-900/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300" />
  </SliderPrimitive.Root>
));
VolumeSlider.displayName = SliderPrimitive.Root.displayName;

const TrackSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative -mb-1 flex h-2.5 w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-0.5 w-full grow overflow-hidden rounded-full dark:bg-zinc-50/20">
      <SliderPrimitive.Range className="absolute h-full bg-orange-400 dark:bg-zinc-200" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="hidden h-2 w-2 rounded-full border border-zinc-200 border-zinc-900/50 bg-white shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:border-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300" />
  </SliderPrimitive.Root>
));
TrackSlider.displayName = SliderPrimitive.Root.displayName;

export { VolumeSlider, TrackSlider };
