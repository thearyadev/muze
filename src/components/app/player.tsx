"use client";

import React from "react";
import { PlayerContext } from "./player_context";
import { Avatar } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import Link from "next/link";
import {
  PauseIcon,
  PlayIcon,
  TrackNextIcon,
  TrackPreviousIcon,
  SpeakerLoudIcon
} from "@radix-ui/react-icons";
import { Slider } from "../ui/slider";
import { cn } from "~/lib/utils";

export default function Player() {
  return (
    <div className="fixed bottom-0 grid w-screen grid-cols-3 bg-zinc-800 p-4 shadow-3xl shadow-slate-950">
      <div
        className="flex flex-row items-center"
        // Track Info
      >
        <Avatar className="">
          <AvatarImage src="https://music.aryankothari.dev/img/covers/d96271a849821b3301316c614285feec6b0d37b6.jpeg" />
        </Avatar>
        <div className="pl-3">
          <p className="text-sm leading-tight text-white">Positions</p>
          <Link
            href="/artist/3"
            className="text-xs text-gray-500 hover:text-orange-400 "
          >
            Ariana Grande
          </Link>
        </div>
      </div>

      <div
        className="flex flex-row items-center justify-center space-x-10 align-middle"
        // controls
      >
        <TrackPreviousIcon className="h-5 w-5 text-white transition duration-100 hover:text-orange-400" />
        <PauseIcon className="h-10 w-10 text-white transition duration-100 hover:text-orange-400" />
        <TrackNextIcon className="h-5 w-5 text-white transition duration-100 hover:text-orange-400" />
      </div>

      <div
        className=" flex flex-row justify-end items-center space-x-4"
        // volume
      >
        <SpeakerLoudIcon className="text-white" />
        <Slider
          defaultValue={[50]}
          max={100}
          step={1}
          className="w-[30%] "
        />
      </div>
    </div>
  );
}
