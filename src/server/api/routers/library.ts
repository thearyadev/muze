import { createTRPCClient } from "@trpc/client";
import { z } from "zod";
import { env } from "~/env";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import fs from "fs";
import path from "path";
import * as mm from "music-metadata";
import { tracks, artists, albums } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { metadata } from "~/app/layout";

async function getTracks(dir: string): Promise<string[]> {
  let files: string[] = [];
  const contents = fs.readdirSync(dir);

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

type Metadata = {
  MB_ALBUM_ID?: string;
  MB_TRACK_ID?: string;
  MB_RELEASE_ID?: string;
  MB_ARTIST_ID?: string[];
  ARTIST_NAME?: string[];
  ALBUM_NAME?: string;
  ALBUM_ARTIST_NAME?: string;
  TRACK_NAME?: string;
  DURATION?: number;
  TRACK_NUMBER?: number;
  DISC_NUMBER?: number;
  GENRE?: string;
  YEAR?: number;

  COVER?: Buffer;
};

const METADATA_BLANK: Metadata = {
  MB_ALBUM_ID: undefined,
  MB_TRACK_ID: undefined,
  MB_RELEASE_ID: undefined,
  MB_ARTIST_ID: undefined,
  ARTIST_NAME: undefined,
  ALBUM_NAME: undefined,
  ALBUM_ARTIST_NAME: undefined,
  DURATION: undefined,
  TRACK_NUMBER: undefined,
  DISC_NUMBER: undefined,
  GENRE: undefined,
  TRACK_NAME: undefined,
  YEAR: undefined,
  COVER: undefined,
};

async function extractMetadata(file_path: string): Promise<Metadata> {
  let metadata: undefined | mm.IAudioMetadata;
  try {
    metadata = await mm.parseFile(file_path);
  } catch (e) {
    return METADATA_BLANK;
  }
  if (metadata === undefined) {
    return METADATA_BLANK;
  }
  return {
    MB_ALBUM_ID: metadata.common.musicbrainz_albumid,
    MB_TRACK_ID: metadata.common.musicbrainz_trackid,
    MB_RELEASE_ID: metadata.common.musicbrainz_releasegroupid,
    MB_ARTIST_ID: metadata.common.musicbrainz_artistid,
    ARTIST_NAME: metadata.common.artists,
    ALBUM_NAME: metadata.common.album,
    ALBUM_ARTIST_NAME: metadata.common.albumartist,
    TRACK_NAME: metadata.common.title,
    TRACK_NUMBER: metadata.common.track.no
      ? metadata.common.track.no
      : undefined,
    DISC_NUMBER: metadata.common.disk.no ? metadata.common.disk.no : undefined,
    DURATION: metadata.format.duration,
    YEAR: metadata.common.year,
    COVER: metadata.common.picture
      ? metadata.common.picture[0]?.data
      : undefined,
  };
}
export const libraryRouter = createTRPCRouter({
  sync: publicProcedure.mutation(async ({ ctx }) => {
    const targetDirectory = env.MUSIC_PATH;
    const tracks_fs = await getTracks(targetDirectory);
    tracks_fs.forEach(async (track_i) => {
      const metadata = await extractMetadata(track_i); // get metadata for a track
      if (
        !metadata.MB_TRACK_ID ||
        !metadata.MB_ARTIST_ID?.length ||
        !(metadata.ARTIST_NAME?.length === metadata.MB_ARTIST_ID?.length)
      ) {
        console.log(
          "The metadata in this track appears to be invalid. Please run tagging with MusicBrainz Picard",
        );
        return;
      }

      const artistIds = await Promise.all(
        // get all referenced artists
        metadata.MB_ARTIST_ID.map(async (artistId, index) => {
          // @ts-ignore
          const artistName = metadata.ARTIST_NAME[index] as string;
          const artistQuery = await ctx.db
            .select()
            .from(artists)
            .where(eq(artists.mbid, artistId))
            .execute();
          if (artistQuery.length > 0) {
            // artist already exists
            const artistData = artistQuery[0]!;
            if (artistName !== artistData.name) {
              // update the data
              await ctx.db
                .update(artists)
                .set({
                  name: artistName,
                })
                .where(eq(artists.id, artistData.id))
                .execute();
            }
            return artistData.id;
          }

          const newRecord = await ctx.db
            .insert(artists)
            .values({
              name: artistName,
              mbid: artistId,
            })
            .returning({ newRecordId: artists.id })
            .execute();
          return newRecord[0]?.newRecordId!;
        }),
      );

      var album_id = -1;
      if (metadata.ALBUM_NAME !== undefined) {
        if (metadata.MB_ALBUM_ID === undefined) {
          console.log(
            "Album exists but MusicBrainz Album ID is missing. Matching by name",
          );
          const albums_found = await ctx.db
            .select()
            .from(albums)
            .where(eq(albums.name, metadata.ALBUM_NAME))
            .execute();
          if (albums_found.length > 0) {
            album_id = albums_found[0]!.id as number;
          }
        } else {
          // track has an MBID
          const albumRecord = await ctx.db
            .select()
            .from(albums)
            .where(eq(albums.mbid, metadata.MB_ALBUM_ID))
            .execute();
          if (albumRecord.length > 0) {
            album_id = albumRecord[0]!.id;
          } else {
            const newRecord = await ctx.db
              .insert(albums)
              .values({
                name: metadata.ALBUM_NAME,
                mbid: metadata.MB_ALBUM_ID,
              })
              .returning({ newRecordId: albums.id })
              .execute();
            album_id = newRecord[0]?.newRecordId!;
          }
        }
      }

      var track_id = -1;
      const track_data = await ctx.db
        .select()
        .from(tracks)
        .where(eq(tracks.mbid, metadata.MB_TRACK_ID))
        .execute();
      if (track_data.length > 0) {
        // track exists in db
        //
        track_id = track_data[0]!.id;
        await ctx.db
          .update(tracks)
          .set({
            name: metadata.TRACK_NAME,
            albumId: album_id,
            duration: metadata.DURATION,
            trackNumber: metadata.TRACK_NUMBER,
            discNumber: metadata.DISC_NUMBER,
            genre: metadata.GENRE,
            year: metadata.YEAR,
            path: track_i,
            mbid: metadata.MB_TRACK_ID,
          })
          .where(eq(tracks.id, track_id))
          .execute();
      } else {
        const newRecord = await ctx.db
          .insert(tracks)
          .values({
            name: metadata.TRACK_NAME,
            albumId: album_id,
            duration: metadata.DURATION,
            trackNumber: metadata.TRACK_NUMBER,
            discNumber: metadata.DISC_NUMBER,
            genre: metadata.GENRE,
            year: metadata.YEAR,
            path: track_i,
            mbid: metadata.MB_TRACK_ID,
          })
          .returning({ newRecordId: tracks.id })
          .execute();
        track_id = newRecord[0]!.newRecordId;
      }

      // album artist
      // track artist

      //   );
      //   if (metadata.COVER && !fs.existsSync(coverPath)) {
      //     fs.writeFile(coverPath, metadata.COVER, (err) => {
      //       if (err) {
      //         console.error(err);
      //         return;
      //       }
      //       console.log("Wrote cover to file system");
      //     });
      //   }
      // }
    });
  }),
});
