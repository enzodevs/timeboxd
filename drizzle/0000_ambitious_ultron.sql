CREATE TABLE `integrations` (
	`id` text PRIMARY KEY NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`expires_at` integer,
	`scope` text,
	`email` text,
	`calendar_id` text DEFAULT 'primary',
	`task_list_id` text DEFAULT '@default',
	`sync_enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`date` text PRIMARY KEY NOT NULL,
	`content` text,
	`text` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`theme` text DEFAULT 'light' NOT NULL,
	`timezone` text,
	`day_start_hour` integer DEFAULT 0 NOT NULL,
	`week_start` integer DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`deep_work` integer DEFAULT false NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`list` text DEFAULT 'today' NOT NULL,
	`date` text,
	`scheduled_time` text,
	`estimate_min` integer,
	`sort_order` real DEFAULT 0 NOT NULL,
	`google_task_id` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `timeboxes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`start` text NOT NULL,
	`end` text NOT NULL,
	`date` text NOT NULL,
	`deep_work` integer DEFAULT false NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`completed_at` text,
	`color` text,
	`tags` text DEFAULT '[]' NOT NULL,
	`task_id` text,
	`google_event_id` text,
	`source` text DEFAULT 'local' NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
