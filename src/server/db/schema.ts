// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `lyzard_${name}`);

export const users = createTable("user", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username", { length: 256 }).notNull(),
  password: text("password", { length: 256 }).notNull(),
});

export const playlists = createTable("playlist", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { length: 256 }),
  userId: int("user_id", { mode: "number" }).notNull(),
});

export const tracks = createTable("track", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { length: 256 }),
  albumId: int("album_id", { mode: "number" }).references(() => albums.id),
  duration: int("duration", { mode: "number" }),
  trackNumber: int("track_number", { mode: "number" }),
  discNumber: int("disc_number", { mode: "number" }),
  genre: text("genre", { length: 256 }),
  year: int("year", { mode: "number" }),
  
});

export const albums = createTable("album", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { length: 256 }),
});

export const artists = createTable("artist", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name", { length: 256 }),
});



export const artistTracks = createTable("artist_track", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  artistId: int("artist_id", { mode: "number" })
    .references(() => artists.id)
    .notNull(),
  trackId: int("track_id", { mode: "number" })
    .references(() => tracks.id)
    .notNull(),
});

export const playlistTracks = createTable("playlist_track", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  playlistId: int("playlist_id", { mode: "number" })
    .references(() => playlists.id)
    .notNull(),
  trackId: int("track_id", { mode: "number" })
    .references(() => tracks.id)
    .notNull(),
});

export const userListens = createTable("user_listen", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: int("user_id", { mode: "number" })
    .references(() => users.id)
    .notNull(),
  trackId: int("track_id", { mode: "number" })
    .references(() => tracks.id)
    .notNull(),
  listens: int("listens", { mode: "number" }).notNull(),
});

export const userPlaylists = createTable("user_playlist", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  userId: int("user_id", { mode: "number" })
    .references(() => users.id)
    .notNull(),
  playlistId: int("playlist_id", { mode: "number" })
    .references(() => playlists.id)
    .notNull(),
});
