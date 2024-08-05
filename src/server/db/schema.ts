// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  integer,
  primaryKey,
  pgTableCreator,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `muze_${name}`);

export const users = createTable("user", {
  id: varchar("id", { length: 256 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: varchar("username", { length: 256 }).notNull(),
  password: varchar("password", { length: 256 }).notNull(),
});

export const playlists = createTable("playlist", {
  id: varchar("id", { length: 256 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 256 }),
  userId: integer("user_id").notNull(),
});

export const tracks = createTable("track", {
  id: varchar("id", { length: 256 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 256 }),
  albumId: varchar("album_id", { length: 256 }).references(() => albums.id),
  duration: integer("duration"),
  trackNumber: integer("track_number"),
  discNumber: integer("disc_number"),
  year: integer("year"),
  path: varchar("path").notNull(),
  mbid: varchar("mbid", { length: 256 }).notNull(),
});

export const albums = createTable("album", {
  id: varchar("id", { length: 256 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 256 }).notNull(),
  artistId: varchar("artist_id", { length: 256 })
    .references(() => artists.id)
    .notNull(),
  mbid: varchar("mbid", { length: 256 }).notNull(),
});

export const genres = createTable("genre", {
  id: varchar("id", { length: 256 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 256 }).notNull(),
});

export const genreTrack = createTable(
  "genre_track",
  {
    // TODO: convert the fks to a joined pk to avoid duplicates
    trackId: varchar("track_id", { length: 256 }).references(() => tracks.id),
    genreId: varchar("genre_id", { length: 265 }).references(() => genres.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.trackId, table.genreId] }),
    };
  },
);

export const artists = createTable("artist", {
  id: varchar("id", { length: 256 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 256 }).notNull(),
  mbid: varchar("mbid", { length: 256 }).notNull(),
});

export const artistTracks = createTable("artist_track", {
  id: varchar("id", { length: 256 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  artistId: varchar("artist_id", { length: 256 })
    .references(() => artists.id)
    .notNull(),
  trackId: varchar("track_id", { length: 256 })
    .references(() => tracks.id)
    .notNull(),
});

export const playlistTracks = createTable("playlist_track", {
  id: varchar("id", { length: 256 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  playlistId: varchar("playlist_id", { length: 256 })
    .references(() => playlists.id)
    .notNull(),
  trackId: varchar("track_id", { length: 256 })
    .references(() => tracks.id)
    .notNull(),
});
export const userListens = createTable("user_listen", {
  id: varchar("id", { length: 256 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 256 })
    .references(() => users.id)
    .notNull(),
  trackId: varchar("track_id", { length: 256 })
    .references(() => tracks.id)
    .notNull(),
  listens: integer("listens").notNull(),
});

export const userPlaylists = createTable("user_playlist", {
  id: varchar("id", { length: 256 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 256 })
    .references(() => users.id)
    .notNull(),
  playlistId: varchar("playlist_id", { length: 256 })
    .references(() => playlists.id)
    .notNull(),
});
