'use server'

import { db } from '~/server/db'
import { protectedAction } from './helper'
import {
  albums,
  artists,
  artistTracks,
  genres,
  genreTrack,
  tracks,
  userListens,
  users,
} from '~/server/db/schema'
import { and, asc, eq, getTableColumns, ilike, sql, or } from 'drizzle-orm'
import { env } from '~/env'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import * as mm from 'music-metadata'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { getUsername } from './user'
export const getAlbumTracks = protectedAction(async (albumId: string) => {
  const username = await getUsername()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.content ?? ''))
  if (!user) {
    return {
      status_code: 401,
      error: 'Unable to find user.',
    }
  }

  const query = await db
    .selectDistinct({
      ...getTableColumns(tracks),
      albumName: albums.name,
      listens: userListens.listens,
      artistNames: sql<string>`string_agg(${artists.name}, ';')`,
      artistIds: sql<string>`string_agg(cast(${artists.id} AS TEXT), ';')`,
    })
    .from(tracks)
    .innerJoin(albums, eq(tracks.albumId, albums.id))
    .innerJoin(artistTracks, eq(tracks.id, artistTracks.trackId))
    .innerJoin(artists, eq(artistTracks.artistId, artists.id))
    .leftJoin(
      userListens,
      and(eq(userListens.userId, user.id), eq(userListens.trackId, tracks.id)),
    ) // include tracks with no listens. will be null
    .groupBy(tracks.id, albums.name, userListens.listens) // Include all non-aggregated columns
    .orderBy(asc(tracks.trackNumber))
    .where(eq(albums.id, albumId))
    .execute()

  return {
    status_code: 200,
    content: query,
  }
})

export const allTracks = protectedAction(
  async (page: number, pageSize: number) => {
    const username = await getUsername()
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username.content ?? ''))
    if (!user) {
      return {
        status_code: 401,
        error: 'Unable to find user.',
      }
    }

    const query = await db
      .selectDistinct({
        ...getTableColumns(tracks),
        albumName: albums.name,
        listens: userListens.listens,
        artistNames: sql<string>`string_agg(${artists.name}, ';')`,
        artistIds: sql<string>`string_agg(cast(${artists.id} AS TEXT), ';')`,
      })
      .from(tracks)
      .innerJoin(albums, eq(tracks.albumId, albums.id))
      .innerJoin(artistTracks, eq(tracks.id, artistTracks.trackId))
      .innerJoin(artists, eq(artistTracks.artistId, artists.id))
      .leftJoin(
        userListens,
        and(
          eq(userListens.userId, user.id),
          eq(userListens.trackId, tracks.id),
        ),
      ) // include tracks with no listens. will be null
      .groupBy(tracks.id, albums.name, userListens.listens) // Include all non-aggregated columns
      .orderBy(asc(tracks.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .execute()

    return {
      status_code: 200,
      content: query,
    }
  },
)

export const search = protectedAction(async (query: string) => {
  const username = await getUsername()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.content ?? ''))
  if (!user) {
    return {
      status_code: 401,
      error: 'Unable to find user.',
    }
  }

  const searchResult = await db
    .selectDistinct({
      ...getTableColumns(tracks),
      albumName: albums.name,
      artistNames: sql<string>`string_agg(${artists.name}, ';')`,
      listens: userListens.listens,
      artistIds: sql<string>`string_agg(cast(${artists.id} AS TEXT), ';')`,
    })
    .from(tracks)
    .innerJoin(albums, eq(tracks.albumId, albums.id))
    .innerJoin(artistTracks, eq(tracks.id, artistTracks.trackId))
    .innerJoin(artists, eq(artistTracks.artistId, artists.id))
    .leftJoin(
      userListens,
      and(eq(userListens.userId, user.id), eq(userListens.trackId, tracks.id)),
    ) // include tracks with no listens. will be null

    .where(
      or(
        sql`${tracks.name} % ${query} OR similarity(${tracks.name}, ${query}) > 0.3`,
        sql`${artists.name} % ${query} OR similarity(${artists.name}, ${query}) > 0.3`,
        sql`${albums.name} % ${query} OR similarity(${albums.name}, ${query}) > 0.3`,
      ),
    )
    .groupBy(tracks.id, albums.name, userListens.listens)
    .execute()
  return {
    status_code: 200,
    content: searchResult,
  }
})

export const getTrack = protectedAction(async (trackId: string) => {
  const username = await getUsername()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.content ?? ''))
  if (!user) {
    return {
      status_code: 401,
      error: 'Unable to find user.',
    }
  }
  const trackFound =
    (
      await db
        .select({
          ...getTableColumns(tracks),
          albumName: albums.name,
          listens: userListens.listens,
          artistNames: sql<string>`string_agg(${artists.name}, ';') AS artistNames`,
          artistIds:
            sql<string>`string_agg(cast(${artists.id} AS TEXT), ';')`.as(
              'artistIds',
            ),
        })
        .from(tracks)
        .where(eq(tracks.id, trackId))
        .innerJoin(albums, eq(tracks.albumId, albums.id))
        .innerJoin(artistTracks, eq(artistTracks.trackId, tracks.id))
        .innerJoin(artists, eq(artists.id, artistTracks.artistId))
        .leftJoin(
          userListens,
          and(
            eq(userListens.userId, user.id),
            eq(userListens.trackId, tracks.id),
          ),
        ) // include tracks with no listens. will be null
        .groupBy(tracks.id, albums.name, userListens.listens)
        .execute()
    )[0] || null
  if (!trackFound) {
    return {
      status_code: 404,
      error: 'Track not found',
    }
  }
  return {
    status_code: 200,
    content: trackFound,
  }
})

export const getAlbum = protectedAction(async (albumId: string) => {
  const username = await getUsername()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.content ?? ''))
  if (!user) {
    return {
      status_code: 401,
      error: 'Unable to find user.',
    }
  }
  const albumFound =
    (
      await db
        .select({
          ...getTableColumns(albums),
        })
        .from(albums)
        .where(eq(albums.id, albumId))
        .execute()
    )[0] || null
  if (!albumFound) {
    return {
      status_code: 404,
      error: 'Album not found',
    }
  }
  return {
    status_code: 200,
    content: albumFound,
  }
})

export const getRandomTrack = protectedAction(async () => {
  const username = await getUsername()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username.content ?? ''))
  if (!user) {
    return {
      status_code: 401,
      error: 'Unable to find user.',
    }
  }
  const query = await db
    .select({
      ...getTableColumns(tracks),
      albumName: albums.name,
      artistNames: sql<string>`string_agg(${artists.name}, ';') AS artistNames`,
      listens: userListens.listens,
      artistIds: sql<string>`string_agg(cast(${artists.id} AS TEXT), ';')`.as(
        'artistIds',
      ),
    })
    .from(tracks)
    .innerJoin(albums, eq(tracks.albumId, albums.id))
    .innerJoin(artistTracks, eq(tracks.id, artistTracks.trackId))
    .innerJoin(artists, eq(artistTracks.artistId, artists.id))
    .leftJoin(
      userListens,
      and(eq(userListens.userId, user.id), eq(userListens.trackId, tracks.id)),
    ) // include tracks with no listens. will be null
    .groupBy(tracks.id, albums.name, userListens.listens)
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .execute()
  if (!query.length) {
    return {
      status_code: 404,
      error: 'No tracks found',
    }
  }
  return {
    status_code: 200,
    content: query[0],
  }
})

export const sync = protectedAction(async () => {
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
      `${metadata.MB_TRACK_ID}.${label}.jpg`,
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
    MB_RELEASE_GROUP_ID?: string
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
      await db.insert(genreTrack).values({
        genreId: genreId,
        trackId: trackId,
      })
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
      const genreExisting = genre_query.find(() => true)
      if (genreExisting) {
        return upsert_genre_track(db, genreExisting.id, trackId)
      }

      const newRecord = await db
        .insert(genres)
        .values({ name: genre_name })
        .returning({ newRecordId: genres.id })
        .execute()
      const genreNew = newRecord.find(() => true)
      if (genreNew) {
        return upsert_genre_track(db, genreNew.newRecordId, trackId)
      }
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
      .where(eq(tracks.mbid, metadata.MB_TRACK_ID || ''))
      .execute()

    const trackExisting = track_data.find(() => true)
    if (trackExisting) {
      // track exists in db

      try {
        fs.accessSync(path, fs.constants.F_OK)
      } catch {
        console.log('Track file is missing. Removing from db')
        await db.delete(tracks).where(eq(tracks.id, trackExisting.id)).execute()
      }

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
        .where(eq(tracks.id, trackExisting.id))
        .execute()
      return trackExisting.id
    }
    // couldnt find in db, create a new one
    const newRecord = await db
      .insert(tracks)
      .values({
        name: metadata.TRACK_NAME,
        albumId: albumId,
        duration: metadata.DURATION,
        trackNumber: metadata.TRACK_NUMBER,
        discNumber: metadata.DISC_NUMBER,
        year: metadata.YEAR,
        path: path,
        mbid: metadata.MB_TRACK_ID || crypto.randomUUID(),
      })
      .returning({ newRecordId: tracks.id })
      .execute()
    const trackNew = newRecord.find(() => true)
    if (trackNew) {
      return trackNew.newRecordId
    }
    throw Error('Failed to create track')
  }

  async function upsert_albums(
    db: PostgresJsDatabase<typeof import('~/server/db/schema')>,
    metadata: Metadata,
    albumArtistId: string,
  ): Promise<string | null> {
    if (
      metadata.ALBUM_NAME === undefined ||
      metadata.MB_RELEASE_GROUP_ID === undefined
    ) {
      return null
    }

    if (
      metadata.ALBUM_NAME !== undefined &&
      metadata.MB_RELEASE_GROUP_ID === undefined
    ) {
      // no mbid, but album name exists. match by name
      const albums_found = await db
        .select()
        .from(albums)
        .where(eq(albums.name, metadata.ALBUM_NAME))
        .execute()
      const albumExistingName = albums_found.find(() => true)
      if (albumExistingName) {
        return albumExistingName.id
      }
    }

    // track has an MBID
    if (metadata.MB_ALBUM_ID !== undefined) {
      const albumRecord = await db // look for it in the database
        .select()
        .from(albums)
        .where(eq(albums.mbid, metadata.MB_RELEASE_GROUP_ID))
        .execute()
      const albumExistingMbid = albumRecord.find(() => true)
      if (albumExistingMbid) {
        return albumExistingMbid.id
      }
    }

    // if it doesnt exist, create then return
    const newRecord = await db
      .insert(albums)
      .values({
        name: metadata.ALBUM_NAME,
        artistId: albumArtistId,
        mbid: metadata.MB_RELEASE_GROUP_ID,
      })
      .returning({ newRecordId: albums.id })
      .execute()
    return newRecord.find(() => true)?.newRecordId || null
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
    const artistIds = []

    for (const [index, artistId] of metadata.MB_ARTIST_ID.entries()) {
      const artistName = metadata.ARTIST_NAME[index]

      if (artistName === undefined) {
        console.warn(
          'Artist MBID array has more elements than artist name array. Skipping artist. Mapping is ambiguous.',
        )
        continue
      }

      const artistQuery = await db
        .select()
        .from(artists)
        .where(eq(artists.mbid, artistId))
        .execute()
      const artistExisting = artistQuery.find(() => true)
      if (artistExisting) {
        if (artistName !== artistExisting.name) {
          await db
            .update(artists)
            .set({
              name: artistName,
            })
            .where(eq(artists.id, artistExisting.id))
            .execute()
        }
        artistIds.push(artistExisting.id)
        continue
      }
      const newRecord = await db
        .insert(artists)
        .values({
          name: artistName,
          mbid: artistId,
        })
        .returning({ newRecordId: artists.id })
        .execute()
      const artistNew = newRecord.find(() => true)
      if (artistNew) {
        artistIds.push(artistNew.newRecordId)
      }
    }

    if (artistIds.length === 0) {
      throw Error('Failed to create artists, none were found')
    }
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
      MB_RELEASE_GROUP_ID: metadata.common.musicbrainz_releasegroupid,
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
      DISC_NUMBER: metadata.common.disk.no
        ? metadata.common.disk.no
        : undefined,
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

  const targetDirectory = env.MUSIC_PATH
  const tracks_fs = await getTracks(targetDirectory)
  for (const track_i of tracks_fs) {
    try {
      const metadata = await extractMetadata(track_i)
      const artist_ids = await upsert_artists(db, metadata)
      const album_id = await upsert_albums(
        db,
        metadata,
        // biome-ignore lint/style/noNonNullAssertion : the length of artist_ids is guaranteed to be > 0
        artist_ids.find(() => true)!,
      ) // todo: determine album artist
      const track_id = await upsert_track(db, metadata, album_id, track_i)
      await upsert_genre_and_track_relation(db, metadata, track_id)
      await upsert_artist_track_relation(db, artist_ids, track_id)
      await create_cover_files(metadata)
    } catch (e) {
      console.log('Failed to process track', track_i)
      console.error(e)
    }
  }
  return {
    status_code: 200,
  }
})
