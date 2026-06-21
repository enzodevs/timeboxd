CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`current_period_end` integer,
	`cancel_at_period_end` integer DEFAULT false NOT NULL,
	`ls_customer_id` text,
	`ls_variant_id` text,
	`ls_product_name` text,
	`customer_portal_url` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `subscriptions_user_idx` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_integrations` (
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`expires_at` integer,
	`scope` text,
	`email` text,
	`calendar_id` text DEFAULT 'primary',
	`task_list_id` text DEFAULT '@default',
	`sync_enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`user_id`, `provider`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_integrations`("user_id", "provider", "access_token", "refresh_token", "expires_at", "scope", "email", "calendar_id", "task_list_id", "sync_enabled", "created_at", "updated_at") SELECT NULL, "id", "access_token", "refresh_token", "expires_at", "scope", "email", "calendar_id", "task_list_id", "sync_enabled", "created_at", "updated_at" FROM `integrations` WHERE 0;--> statement-breakpoint
DROP TABLE `integrations`;--> statement-breakpoint
ALTER TABLE `__new_integrations` RENAME TO `integrations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_notes` (
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`content` text,
	`text` text,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	PRIMARY KEY(`user_id`, `date`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_notes`("user_id", "date", "content", "text", "updated_at") SELECT NULL, "date", "content", "text", "updated_at" FROM `notes` WHERE 0;--> statement-breakpoint
DROP TABLE `notes`;--> statement-breakpoint
ALTER TABLE `__new_notes` RENAME TO `notes`;--> statement-breakpoint
CREATE TABLE `__new_settings` (
	`user_id` text PRIMARY KEY NOT NULL,
	`theme` text DEFAULT 'light' NOT NULL,
	`timezone` text,
	`day_start_hour` integer DEFAULT 0 NOT NULL,
	`week_start` integer DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_settings`("user_id", "theme", "timezone", "day_start_hour", "week_start", "updated_at") SELECT NULL, "theme", "timezone", "day_start_hour", "week_start", "updated_at" FROM `settings` WHERE 0;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint
ALTER TABLE `tasks` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `tasks_user_list_date_idx` ON `tasks` (`user_id`,`list`,`date`);--> statement-breakpoint
ALTER TABLE `timeboxes` ADD `user_id` text NOT NULL REFERENCES user(id);--> statement-breakpoint
CREATE INDEX `timeboxes_user_date_idx` ON `timeboxes` (`user_id`,`date`);
