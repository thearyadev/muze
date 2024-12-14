ALTER TABLE "muze_user" ADD COLUMN "current_track_id" varchar(256);--> statement-breakpoint
ALTER TABLE "muze_user" ADD COLUMN "current_track_position" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "muze_user" ADD CONSTRAINT "muze_user_current_track_id_muze_track_id_fk" FOREIGN KEY ("current_track_id") REFERENCES "public"."muze_track"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
