ALTER TABLE "muze_artist_track" DROP CONSTRAINT "muze_artist_track_track_id_muze_track_id_fk";
--> statement-breakpoint
ALTER TABLE "muze_genre_track" DROP CONSTRAINT "muze_genre_track_track_id_muze_track_id_fk";
--> statement-breakpoint
ALTER TABLE "muze_playlist_track" DROP CONSTRAINT "muze_playlist_track_track_id_muze_track_id_fk";
--> statement-breakpoint
ALTER TABLE "muze_user_listen" DROP CONSTRAINT "muze_user_listen_track_id_muze_track_id_fk";
--> statement-breakpoint
ALTER TABLE "muze_user" DROP CONSTRAINT "muze_user_current_track_id_muze_track_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_artist_track" ADD CONSTRAINT "muze_artist_track_track_id_muze_track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."muze_track"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_genre_track" ADD CONSTRAINT "muze_genre_track_track_id_muze_track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."muze_track"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_playlist_track" ADD CONSTRAINT "muze_playlist_track_track_id_muze_track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."muze_track"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_user_listen" ADD CONSTRAINT "muze_user_listen_track_id_muze_track_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."muze_track"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_user" ADD CONSTRAINT "muze_user_current_track_id_muze_track_id_fk" FOREIGN KEY ("current_track_id") REFERENCES "public"."muze_track"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
