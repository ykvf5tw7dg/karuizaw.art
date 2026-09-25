CREATE TABLE `application_notifications` (
	`application_id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`lock_until` text,
	`sent_at` text,
	`last_error` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_notifications_status_created` ON `application_notifications` (`status`,`created_at`);