"use server";

import { api } from "~/trpc/server";

export async function sync(): Promise<Promise<void>>{
  return api.library.sync()
}
