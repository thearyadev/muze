CREATE TABLE IF NOT EXISTS "muze_album" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"artist_id" varchar(256) NOT NULL,
	"mbid" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "muze_artist_track" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"artist_id" varchar(256) NOT NULL,
	"track_id" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "muze_artist" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"mbid" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "muze_genre" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "muze_playlist_track" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"playlist_id" varchar(256) NOT NULL,
	"track_id" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "muze_playlist" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "muze_track" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"album_id" varchar(256),
	"duration" integer,
	"track_number" integer,
	"disc_number" integer,
	"year" integer,
	"path" varchar NOT NULL,
	"mbid" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "muze_user_listen" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"track_id" varchar(256) NOT NULL,
	"listens" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "muze_user_playlist" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"playlist_id" varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "muze_user" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"username" varchar(256) NOT NULL,
	"password" varchar(256) NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_album" ADD CONSTRAINT "muze_album_artist_id_muze_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."muze_artist"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_artist_track" ADD CONSTRAINT "muze_artist_track_artist_id_muze_artist_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."muze_artist"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_artist_track" ADD CONSTRAINT "muze_artist_track_track_id_muze_track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."muze_track"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_playlist_track" ADD CONSTRAINT "muze_playlist_track_playlist_id_muze_playlist_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."muze_playlist"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_playlist_track" ADD CONSTRAINT "muze_playlist_track_track_id_muze_track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."muze_track"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_track" ADD CONSTRAINT "muze_track_album_id_muze_album_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."muze_album"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_user_listen" ADD CONSTRAINT "muze_user_listen_user_id_muze_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."muze_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_user_listen" ADD CONSTRAINT "muze_user_listen_track_id_muze_track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."muze_track"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_user_playlist" ADD CONSTRAINT "muze_user_playlist_user_id_muze_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."muze_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_user_playlist" ADD CONSTRAINT "muze_user_playlist_playlist_id_muze_playlist_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."muze_playlist"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
