CREATE TABLE IF NOT EXISTS "muze_genre_track" (
	"track_id" varchar(256),
	"genre_id" varchar(265),
	CONSTRAINT "muze_genre_track_track_id_genre_id_pk" PRIMARY KEY("track_id","genre_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_genre_track" ADD CONSTRAINT "muze_genre_track_track_id_muze_track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."muze_track"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_genre_track" ADD CONSTRAINT "muze_genre_track_genre_id_muze_genre_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."muze_genre"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
