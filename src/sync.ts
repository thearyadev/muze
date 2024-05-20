import { env } from "./env";

import fs from "fs";
import path from "path";
import chalk from "chalk";

import { drizzle } from "drizzle-orm/bun-sqlite";
// @ts-ignore
import { Database } from "bun:sqlite";
import * as schema from "./server/db/schema";
// @ts-ignore
import * as fpcalc from "fpcalc";
import { eq } from "drizzle-orm";
import { MusicBrainzApi } from "musicbrainz-api";
import * as mm from "music-metadata";
import * as jsm from "jsmediatags"
import { inspect } from "util";

const mbApi = new MusicBrainzApi({
  appName: "lyzard",
  appVersion: "0.0.1",
  appContactInfo: "ak1174ow12@gmail.com",
});
function isValidPath(path: string): boolean {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (e) {
    return false;
  }
}

function getDbConnection() {
  const sqlite = new Database("db.sqlite");
  const db = drizzle(sqlite, { schema });
  return db;
}

function getTracks(music_path: string) {
  const allTracks: string[] = [];

  function readDirectory(media_path: string) {
    const items = fs.readdirSync(media_path);
    items.forEach((item) => {
      const sub_path = path.join(media_path, item);
      const stats = fs.statSync(sub_path);
      if (stats.isDirectory()) {
        readDirectory(sub_path);
      } else {
        allTracks.push(sub_path);
      }
    });
  }
  if (!isValidPath(music_path)) {
    console.error(
      `Error: ${env.MUSIC_PATH} may be invalid or has insufficient permissions (READ)`,
    );
    process.exit(1);
  }
  readDirectory(music_path);
  return allTracks;
}

async function main() {
  const db = getDbConnection();
  const fs_tracks = getTracks(env.MUSIC_PATH).slice(200, 300);
  // parse from stream

  fs_tracks.forEach(async (track) => {
    const parser = await mm.parseStream(fs.createReadStream(track));

    console.log(inspect(parser.native, { showHidden: false, depth: null }));
  });
}

main();
