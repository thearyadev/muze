import { createTRPCClient } from "@trpc/client";
import { z } from "zod";
import { env } from "~/env";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fs, { readdirSync } from "fs"
import path from "path";

async function getTracks(dir: string): Promise<string[]> {
  let files: string[] = [];
  const contents = fs.readdirSync(dir)

  for (const file of contents) {
    const fullPath = path.join(dir, file);
    const stats = await fs.promises.lstat(fullPath);

    if (stats.isDirectory()) {
      const subFiles = await getTracks(fullPath);
      files = files.concat(subFiles);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

export const libraryRouter = createTRPCRouter({
  sync: publicProcedure.query(async () => {
    const targetDirectory = env.MUSIC_PATH;
    const tracks = await getTracks(targetDirectory)
    console.log(tracks.length)
  }),
});
