import { sqliteTable,text,index } from "drizzle-orm/sqlite-core";
export const applications=sqliteTable("applications",{
 id:text("id").primaryKey(),
 type:text("type").notNull(),
 name:text("name").notNull(),
 email:text("email").notNull(),
 payload:text("payload").notNull(),
 payloadHash:text("payload_hash").notNull(),
 createdAt:text("created_at").notNull(),
 status:text("status").notNull().default("new")
},t=>[index("idx_applications_email_created").on(t.email,t.createdAt)]);

export const applicationNotifications=sqliteTable('application_notifications',{
 applicationId:text('application_id').primaryKey(),
 status:text('status').notNull().default('pending'),
 lockUntil:text('lock_until'),
 sentAt:text('sent_at'),
 lastError:text('last_error'),
 createdAt:text('created_at').notNull()
},t=>[index('idx_notifications_status_created').on(t.status,t.createdAt)]);
