"use client";

import React, { useContext, useEffect, useState } from "react";
import { Avatar } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import Link from "next/link";

import { VolumeSlider, TrackSlider } from "../ui/slider";

import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  StepBackwardFilled,
  StepForwardFilled,
} from "@ant-design/icons";
import { LoopIcon, SpeakerLoudIcon } from "@radix-ui/react-icons";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { KeybindContext } from "./keybind_context";
import { PlayerContext } from "./player_context";

export default function Player() {
  const {
    track,
    playing,
    setPlaying,
    position,
    setPosition,
    maxPosition,
    volume,
    loop,
    setLoop,
    audioRef,
    handlePlayPause,
    handleVolumeChange,
    handleTrackComplete,
    handleLoopBtnClick,
    handleTimeChange,
    setMaxPosition
  } = useContext(PlayerContext);
  const { registerKeybind } = useContext(KeybindContext);


  useEffect(() => {
    if (audioRef.current?.error !== null) {
      console.error(audioRef.current?.error);
    }

    if (navigator) {
      navigator.mediaSession.setActionHandler("play", () => {
        setPlaying(true);
        if (!audioRef.current) return;
        audioRef.current.play();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        setPlaying(false);
        if (!audioRef.current) return;
        audioRef.current.pause();
      });
    }
    registerKeybind(" ", undefined)(handlePlayPause);
    registerKeybind(
      "Meta",
      "u",
    )(() => {
      console.log("meta u!!! callback");
    });

    registerKeybind("d", "z")(handlePlayPause);

    if (localStorage) {
      const volume = localStorage.getItem("volume");
      if (volume) {
        handleVolumeChange([parseInt(volume)]);
      }
      const loop = localStorage.getItem("loop");
      if (loop) {
        setLoop(loop === "true");
      }
    }

    return () => {
      if (navigator) {
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
      }
    };
  }, []);

  if (track === null) {
    return "error";
  }

  return (
    <div
      className="fixed bottom-0 select-none"
      onLoad={() => {
        setTimeout(() => {
          document.body.classList.remove("opacity-10");
        }, 100);
      }}
    >
      <audio
        id={"audo"}
        ref={audioRef}
        title="Billie Eilish - listen before i go"
        src={`/api/track_data?id=${track.id}`}
        onTimeUpdate={handleTimeChange}
        onCanPlay={() => {
          if (!audioRef.current) return;
          setMaxPosition(audioRef.current.duration);
        
        }}

        onEnded={handleTrackComplete}
      />
      <div className="w-screen">
        <TrackSlider
          defaultValue={position}
          max={maxPosition}
          value={position}
          step={0.1}
          onValueChange={(value) => {
            setPosition(value);
            if (!audioRef.current) return;
            audioRef.current.currentTime = value[0] as number;
          }}
          className="w-screen transition duration-75"
        />
      </div>
      <div className="grid w-screen grid-cols-3 bg-zinc-800 p-4 shadow-3xl shadow-slate-950">
        <div
          className="flex flex-row items-center"
          // Track Info
        >
          <Avatar className="">
            <AvatarImage
              src="https://music.aryankothari.dev/img/covers/d96271a849821b3301316c614285feec6b0d37b6.jpeg"
              loading="lazy"
            />
          </Avatar>
          <div className="hidden pl-3 sm:block">
            <p className="text-sm leading-tight text-white">{track.name}</p>

            <HoverCard>
              <HoverCardTrigger asChild>
                <Link
                  href="/artist/3"
                  className="text-xs text-gray-500 transition-all fade-in-100 fade-out-100 hover:text-orange-400 "
                >
                  {track.artistNames}
                </Link>
              </HoverCardTrigger>
              <HoverCardContent className="w-52">
                <div className="flex items-center justify-start space-x-4">
                  <Avatar>
                    <AvatarImage src="https://music.aryankothari.dev/img/covers/d96271a849821b3301316c614285feec6b0d37b6.jpeg" />
                  </Avatar>
                  <h4 className="text-sm font-semibold">Ariana Grande</h4>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
            <div
          className="flex flex-row items-center justify-center space-x-10 align-middle"
          // controls
        >
          <StepBackwardFilled className="text-xl text-white transition duration-100 hover:text-orange-400" />
          <PauseCircleOutlined
            className={`text-4xl text-white transition duration-100 hover:text-orange-400 ${!playing ? "hidden" : null}`}
            onMouseDown={handlePlayPause}
          />
          <PlayCircleOutlined
            className={`text-4xl text-white transition duration-100 hover:text-orange-400 ${!playing ? null : "hidden"}`}
            onMouseDown={handlePlayPause}
          />
          <div className="flex flex-row items-center space-x-5 ">
            <StepForwardFilled className="text-xl text-white transition duration-100 hover:text-orange-400" />
            <LoopIcon
              className={`text-xs text-gray-400 hover:text-orange-400 ${loop ? "text-orange-400" : null}`}
              onMouseDown={handleLoopBtnClick}
            />
          </div>
        </div>
        <div
          className="hidden flex-row items-center justify-end space-x-4 sm:flex"
          // volume
        >
          <SpeakerLoudIcon className="text-white" />
          <VolumeSlider
            defaultValue={[volume]}
            value={[volume]}
            max={100}
            step={1}
            className="w-[30%]"
            onValueChange={handleVolumeChange}
          />
        </div>
      </div>
    </div>
  );
}
