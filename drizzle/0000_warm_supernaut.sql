CREATE TABLE `muze_album` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`artist_id` integer NOT NULL,
	`mbid` text NOT NULL,
	FOREIGN KEY (`artist_id`) REFERENCES `muze_artist`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `muze_artist_track` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`artist_id` integer NOT NULL,
	`track_id` integer NOT NULL,
	FOREIGN KEY (`artist_id`) REFERENCES `muze_artist`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`track_id`) REFERENCES `muze_track`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `muze_artist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL,
	`mbid` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `muze_genre_track` (
	`track_id` integer,
	`genre_id` integer,
	PRIMARY KEY(`genre_id`, `track_id`),
	FOREIGN KEY (`track_id`) REFERENCES `muze_track`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`genre_id`) REFERENCES `muze_genre`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `muze_genre` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `muze_playlist_track` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` integer NOT NULL,
	`track_id` integer NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `muze_playlist`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`track_id`) REFERENCES `muze_track`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `muze_playlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256),
	`user_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `muze_track` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(256),
	`album_id` integer,
	`duration` integer,
	`track_number` integer,
	`disc_number` integer,
	`year` integer,
	`path` text(256) NOT NULL,
	`mbid` text NOT NULL,
	FOREIGN KEY (`album_id`) REFERENCES `muze_album`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `muze_user_listen` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`track_id` integer NOT NULL,
	`listens` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `muze_user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`track_id`) REFERENCES `muze_track`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `muze_user_playlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`playlist_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `muze_user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`playlist_id`) REFERENCES `muze_playlist`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `muze_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text(256) NOT NULL,
	`password` text(256) NOT NULL
);
