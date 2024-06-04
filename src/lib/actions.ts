"use server";

import { api } from "~/trpc/server";

export async function sync(): Promise<Promise<void>>{
  return api.library.sync()
}


export async function allSongs(...obj: Parameters<typeof api.library.allSongs>) {
  return api.library.allSongs(...obj)
} 

export async function getTrack(...obj: Parameters<typeof api.library.getTrack>) {
  return api.library.getTrack(...obj)
}

