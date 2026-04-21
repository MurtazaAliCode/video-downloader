import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  platform: text("platform").notNull(), // 'youtube', 'facebook', 'instagram'
  title: text("title"),
  downloadFormat: text("download_format").notNull().default('mp4'),
  options: jsonb("options").notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed'
  progress: integer("progress").notNull().default(0),
  outputPath: text("output_path"),
  downloadUrl: text("download_url"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at").notNull().default(sql`now() + interval '12 hours'`),
});

export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  author: text("author").notNull().default('VidDownloader Team'),
  published: boolean("published").notNull().default(true),
  readTime: integer("read_time").notNull(), // in minutes
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const apiUsage = pgTable("api_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  count: integer("count").notNull().default(0), // Total downloads
  visitorCount: integer("visitor_count").notNull().default(0), // Total visits
  monthYear: text("month_year").notNull(), // format: "YYYY-MM"
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().default('Anonymous User'),
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  expiresAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export const insertApiUsageSchema = createInsertSchema(apiUsage);
export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  isApproved: true,
});

export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertApiUsage = z.infer<typeof insertApiUsageSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

// Download options schemas
export const downloadOptionsSchema = z.object({
  quality: z.enum(['highest', 'high', 'medium', 'low']).default('high'),
  format: z.enum(['mp4']).default('mp4'),
});

export const youtubeOptionsSchema = downloadOptionsSchema.extend({
  resolution: z.enum(['1080p', '720p', '480p', '360p']).optional(),
});

export const facebookOptionsSchema = downloadOptionsSchema;

export const instagramOptionsSchema = downloadOptionsSchema;

export type DownloadOptions = z.infer<typeof downloadOptionsSchema>;
export type YoutubeOptions = z.infer<typeof youtubeOptionsSchema>;
export type FacebookOptions = z.infer<typeof facebookOptionsSchema>;
export type InstagramOptions = z.infer<typeof instagramOptionsSchema>;
