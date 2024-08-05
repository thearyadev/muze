/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/consistent-type-imports */
import { z } from 'zod'
import { env } from '~/env'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import fs from 'fs'
import path from 'path'
import * as mm from 'music-metadata'
import {
  tracks,
  artists,
  albums,
  artistTracks,
  genres,
  genreTrack,
} from '~/server/db/schema'
import { eq, and, asc, getTableColumns, sql, like } from 'drizzle-orm'

import sharp from 'sharp'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

async function getTracks(dir: string): Promise<string[]> {
  let files: string[] = []
  const contents = fs.readdirSync(dir)

  for (const file of contents) {
    const fullPath = path.join(dir, file)
    const stats = await fs.promises.lstat(fullPath)

    if (stats.isDirectory()) {
      const subFiles = await getTracks(fullPath)
      files = files.concat(subFiles)
    } else {
      files.push(fullPath)
    }
  }
  return files
}
enum CoverSize {
  SMALL = 50,
  MEDIUM = 100,
  LARGE = 250,
  XLARGE = 450,
}

async function createCoverFile(
  quality: number,
  metadata: Metadata,
  size: CoverSize,
  label: string,
) {
  const coverPath = path.join(
    path.resolve(env.COVER_ART_PATH),
    metadata.MB_TRACK_ID + `.${label}.jpg`,
  )
  if (fs.existsSync(coverPath)) {
    return
  }
  await sharp(metadata.COVER)
    .resize(size, size)
    .jpeg({ quality: quality })
    .toFile(coverPath)
    .catch()
}

type Metadata = {
  MB_ALBUM_ID?: string
  MB_TRACK_ID?: string
  MB_RELEASE_ID?: string
  MB_ARTIST_ID?: string[]
  ARTIST_NAME?: string[]
  ALBUM_NAME?: string
  ALBUM_ARTIST_NAME?: string
  TRACK_NAME?: string
  DURATION?: number
  TRACK_NUMBER?: number
  DISC_NUMBER?: number
  GENRE?: string[]
  YEAR?: number
  COVER?: Buffer
}

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
}

async function upsert_genre_track(
  db: PostgresJsDatabase<typeof import('~/server/db/schema')>,
  genreId: string,
  trackId: string,
) {
  try {
    await db.insert(genreTrack).values({ genreId: genreId, trackId: trackId })
  } catch {
    // genre already exists
  }
}

async function upsert_genre_and_track_relation(
  db: PostgresJsDatabase<typeof import('~/server/db/schema')>,
  metadata: Metadata,
  trackId: string,
) {
  for (const genre_name of metadata.GENRE || []) {
    if (genre_name.length > 20) {
      // improper tagging
      return
    }
    const genre_query = await db
      .select()
      .from(genres)
      .where(eq(genres.name, genre_name))
      .execute()
    if (genre_query.length > 0)
      return upsert_genre_track(db, genre_query[0]!.id, trackId)

    const newRecord = await db
      .insert(genres)
      .values({ name: genre_name })
      .returning({ newRecordId: genres.id })
      .execute()
    return upsert_genre_track(db, newRecord[0]!.newRecordId, trackId)
  }
}

async function upsert_track(
  db: PostgresJsDatabase<typeof import('~/server/db/schema')>,
  metadata: Metadata,
  albumId: string | null,
  path: string,
): Promise<string> {
  const track_data = await db
    .select()
    .from(tracks)
    .where(eq(tracks.mbid, metadata.MB_TRACK_ID!))
    .execute()
  if (track_data.length > 0) {
    // track exists in db
    await db
      .update(tracks)
      .set({
        name: metadata.TRACK_NAME,
        albumId: albumId,
        duration: metadata.DURATION,
        trackNumber: metadata.TRACK_NUMBER,
        discNumber: metadata.DISC_NUMBER,
        year: metadata.YEAR,
        path: path,
        mbid: metadata.MB_TRACK_ID,
      })
      .where(eq(tracks.id, track_data[0]!.id))
      .execute()
    return track_data[0]!.id
  }
  // couldnt find in db, create a new one
  const newRecord = await db
    .insert(tracks)
    .values({
      name: metadata.TRACK_NAME!,
      albumId: albumId,
      duration: metadata.DURATION!,
      trackNumber: metadata.TRACK_NUMBER!,
      discNumber: metadata.DISC_NUMBER!,
      year: metadata.YEAR!,
      path: path,
      mbid: metadata.MB_TRACK_ID!,
    })
    .returning({ newRecordId: tracks.id })
    .execute()
  return newRecord[0]!.newRecordId
}

async function upsert_albums(
  db: PostgresJsDatabase<typeof import('~/server/db/schema')>,
  metadata: Metadata,
  albumArtistId: string,
): Promise<string | null> {
  if (metadata.ALBUM_NAME !== undefined && metadata.MB_ALBUM_ID === undefined) {
    // no mbid, but album name exists. match by name
    const albums_found = await db
      .select()
      .from(albums)
      .where(eq(albums.name, metadata.ALBUM_NAME))
      .execute()
    if (albums_found.length > 0) {
      return albums_found[0]!.id
    }
  }
  // track has an MBID
  const albumRecord = await db // look for it in the database
    .select()
    .from(albums)
    .where(eq(albums.mbid, metadata.MB_ALBUM_ID!))
    .execute()
  if (albumRecord.length > 0) {
    // if it exists, return it
    return albumRecord[0]!.id
  } else {
    // if it doesnt exist, create then return
    const newRecord = await db
      .insert(albums)
      .values({
        name: metadata.ALBUM_NAME!,
        artistId: albumArtistId,
        mbid: metadata.MB_ALBUM_ID!,
      })
      .returning({ newRecordId: albums.id })
      .execute()

    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    return newRecord[0]?.newRecordId!
  }
}

async function create_cover_files(metadata: Metadata) {
  if (metadata.COVER) {
    await createCoverFile(100, metadata, CoverSize.SMALL, 'sm')
    await createCoverFile(100, metadata, CoverSize.MEDIUM, 'md')
    await createCoverFile(100, metadata, CoverSize.LARGE, 'lg')
    await createCoverFile(100, metadata, CoverSize.XLARGE, 'xl')
  }
}
async function upsert_artist_track_relation(
  db: PostgresJsDatabase<typeof import('~/server/db/schema')>,
  artistIds: string[],
  trackId: string,
) {
  // track artist

  for (const artistId of artistIds) {
    const relationQuery = await db
      .select()
      .from(artistTracks)
      .where(
        and(
          eq(artistTracks.trackId, trackId),
          eq(artistTracks.artistId, artistId),
        ),
      )
      .execute()
    if (relationQuery.length === 0) {
      // relation doesnt exist
      await db
        .insert(artistTracks)
        .values({
          artistId: artistId,
          trackId: trackId,
        })
        .execute()
    }
  }
}

async function upsert_artists(
  db: PostgresJsDatabase<typeof import('~/server/db/schema')>,
  metadata: Metadata,
): Promise<string[]> {
  if (
    metadata.MB_TRACK_ID === undefined ||
    metadata.MB_ARTIST_ID === undefined ||
    metadata.ARTIST_NAME === undefined ||
    metadata.ARTIST_NAME.length === 0 ||
    metadata.MB_ARTIST_ID.length === 0
  ) {
    throw Error(
      'Error: The metadata for track is not vaild. Please tag using MusicBrainz Picard',
    )
  }

  const artistIds = await Promise.all(
    // get all referenced artists
    metadata.MB_ARTIST_ID.map(async (artistId, index) => {
      // @ts-expect-error name exists if id exists
      const artistName = metadata.ARTIST_NAME[index]
      const artistQuery = await db
        .select()
        .from(artists)
        .where(eq(artists.mbid, artistId))
        .execute()
      if (artistQuery.length > 0) {
        // artist already exists
        const artistData = artistQuery[0]!
        if (artistName !== artistData.name) {
          // update the data
          await db
            .update(artists)
            .set({
              name: artistName,
            })
            .where(eq(artists.id, artistData.id))
            .execute()
        }
        return artistData.id
      }
      const newRecord = await db
        .insert(artists)
        .values({
          name: artistName!,
          mbid: artistId,
        })
        .returning({ newRecordId: artists.id })
        .execute()
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      return newRecord[0]?.newRecordId!
    }),
  )
  if (artistIds.length === 0) throw Error('Unable to find any artists')
  return artistIds
}

async function extractMetadata(file_path: string): Promise<Metadata> {
  let metadata: undefined | mm.IAudioMetadata
  try {
    metadata = await mm.parseFile(file_path)
  } catch (e) {
    return METADATA_BLANK
  }
  if (metadata === undefined) {
    return METADATA_BLANK
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
    DURATION: metadata.format.duration
      ? Math.round(metadata.format.duration)
      : undefined,
    YEAR: metadata.common.year,
    GENRE: metadata.common.genre,
    COVER: metadata.common.picture
      ? metadata.common.picture[0]?.data
      : undefined,
  }
}
export const libraryRouter = createTRPCRouter({
  sync: publicProcedure.mutation(async ({ ctx }) => {
    const targetDirectory = env.MUSIC_PATH
    const tracks_fs = await getTracks(targetDirectory)
    for (const track_i of tracks_fs) {
      try {
        const metadata = await extractMetadata(track_i)
        const artist_ids = await upsert_artists(ctx.db, metadata)
        const album_id = await upsert_albums(ctx.db, metadata, artist_ids[0]!) // todo: determine album artist
        const track_id = await upsert_track(ctx.db, metadata, album_id, track_i)
        await upsert_genre_and_track_relation(ctx.db, metadata, track_id)
        await upsert_artist_track_relation(ctx.db, artist_ids, track_id)
        await create_cover_files(metadata)
      } catch (e) {
        console.log('Failed to process track', track_i)
        console.error(e)
      }
    }
  }),

  allSongs: publicProcedure
    .input(
      z.object({
        pageSize: z.number(),
        page: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const subquery = ctx.db
        .select({
          trackId: artistTracks.trackId,
          artistNames: sql<string>`string_agg(${artists.name}, ';')`.as(
            'artistNames',
          ),
          artistIds:
            sql<string>`string_agg(cast(${artists.id} AS TEXT), ';')`.as(
              'artistIds',
            ),
        })
        .from(artistTracks)
        .innerJoin(artists, eq(artistTracks.artistId, artists.id))
        .groupBy(artistTracks.trackId)
        .as('artists')

      const query = await ctx.db
        .selectDistinct({
          ...getTableColumns(tracks),
          albumName: albums.name,
          artistNames: subquery.artistNames,
          artistIds: subquery.artistIds,
        })
        .from(tracks)
        .orderBy(asc(tracks.id))
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize)
        .innerJoin(albums, eq(tracks.albumId, albums.id))
        .innerJoin(artistTracks, eq(tracks.id, artistTracks.trackId))
        .innerJoin(subquery, eq(tracks.id, subquery.trackId))
        .execute()
      return query
    }),
  getTrack: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
    return (
      (
        await ctx.db
          .select({
            ...getTableColumns(tracks),
            albumName: albums.name,
            artistNames: sql<string>`string_agg(${artists.name}, ';') AS artistNames`,
            artistIds:
              sql<string>`string_agg(cast(${artists.id} AS TEXT), ';')`.as(
                'artistIds',
              ),
          })
          .from(tracks)
          .where(eq(tracks.id, input))
          .innerJoin(albums, eq(tracks.albumId, albums.id))
          .innerJoin(artistTracks, eq(artistTracks.trackId, tracks.id))
          .innerJoin(artists, eq(artists.id, artistTracks.artistId))
          .groupBy(tracks.id, albums.name)
          .execute()
      )[0] || null
    )
  }),
  searchTrack: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const subquery = ctx.db
        .select({
          trackId: artistTracks.trackId,
          artistNames: sql<string>`string_agg(${artists.name}, ';')`.as(
            'artistNames',
          ),
          artistIds:
            sql<string>`string_agg(cast(${artists.id} AS TEXT), ';')`.as(
              'artistIds',
            ),
        })
        .from(artistTracks)
        .innerJoin(artists, eq(artistTracks.artistId, artists.id))
        .groupBy(artistTracks.trackId)
        .as('artists')

      const query = await ctx.db
        .selectDistinct({
          ...getTableColumns(tracks),
          albumName: albums.name,
          artistNames: subquery.artistNames,
          artistIds: subquery.artistIds,
        })
        .from(tracks)
        .where(like(tracks.name, `%${input}%`))
        .innerJoin(albums, eq(tracks.albumId, albums.id))
        .innerJoin(artistTracks, eq(tracks.id, artistTracks.trackId))
        .innerJoin(subquery, eq(tracks.id, subquery.trackId))
        .execute()
      return query
    }),
  albumDetail: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const subquery = ctx.db
        .select({
          trackId: artistTracks.trackId,
          artistNames: sql<string>`string_agg(${artists.name}, ';')`.as(
            'artistNames',
          ),
          artistIds:
            sql<string>`string_agg(cast(${artists.id} AS TEXT), ';')`.as(
              'artistIds',
            ),
        })
        .from(artistTracks)
        .innerJoin(artists, eq(artistTracks.artistId, artists.id))
        .groupBy(artistTracks.trackId)
        .as('artists')
      const query = await ctx.db
        .selectDistinct({
          track: {
            ...getTableColumns(tracks),
          },
          album: {
            ...getTableColumns(albums),
          },
          artistNames: subquery.artistNames,
          artistIds: subquery.artistIds,
        })
        .from(albums)
        .where(eq(albums.id, input))
        .innerJoin(tracks, eq(tracks.albumId, albums.id))
        .innerJoin(artistTracks, eq(tracks.id, artistTracks.trackId))
        .innerJoin(subquery, eq(tracks.id, subquery.trackId))
        .execute()
      if (query.length === 0) {
        return null
      }
      return {
        album: query[0]!.album,
        tracks: query.map((track) => {
          return {
            ...track.track,
            albumName: track.album.name,
            albumId: track.album.id,
            artistNames: track.artistNames,
            artistIds: track.artistIds,
          }
        }),
      }
    }),
})
