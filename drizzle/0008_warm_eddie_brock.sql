CREATE TABLE "muze_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "muze_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "muze_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "muze_user_data" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"username" varchar(256) NOT NULL,
	"current_track_id" varchar(256),
	"current_track_position" integer
);
--> statement-breakpoint
CREATE TABLE "muze_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "muze_user_listen" DROP CONSTRAINT "muze_user_listen_user_id_muze_user_id_fk";
--> statement-breakpoint
ALTER TABLE "muze_user_playlist" DROP CONSTRAINT "muze_user_playlist_user_id_muze_user_id_fk";
--> statement-breakpoint
ALTER TABLE "muze_user" DROP CONSTRAINT "muze_user_current_track_id_muze_track_id_fk";
--> statement-breakpoint
ALTER TABLE "muze_user" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "muze_user" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "muze_user" ADD COLUMN "email" text NOT NULL;--> statement-breakpoint
ALTER TABLE "muze_user" ADD COLUMN "email_verified" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "muze_user" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "muze_user" ADD COLUMN "created_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "muze_user" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "muze_account" ADD CONSTRAINT "muze_account_user_id_muze_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."muze_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "muze_session" ADD CONSTRAINT "muze_session_user_id_muze_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."muze_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "muze_user_data" ADD CONSTRAINT "muze_user_data_current_track_id_muze_track_id_fk" FOREIGN KEY ("current_track_id") REFERENCES "public"."muze_track"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "muze_user_listen" ADD CONSTRAINT "muze_user_listen_user_id_muze_user_data_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."muze_user_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "muze_user_playlist" ADD CONSTRAINT "muze_user_playlist_user_id_muze_user_data_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."muze_user_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "muze_user" DROP COLUMN "username";--> statement-breakpoint
ALTER TABLE "muze_user" DROP COLUMN "password";--> statement-breakpoint
ALTER TABLE "muze_user" DROP COLUMN "current_track_id";--> statement-breakpoint
ALTER TABLE "muze_user" DROP COLUMN "current_track_position";--> statement-breakpoint
ALTER TABLE "muze_user" ADD CONSTRAINT "muze_user_email_unique" UNIQUE("email");