import { pgTable, text, date, varchar, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Job Applications table matching the specified schema
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  applicationNumber: varchar("application_number", { length: 10 }).notNull().unique(),
  jobTitle: varchar("job_title", { length: 40 }).notNull(),
  companyName: varchar("company_name", { length: 40 }).notNull(),
  dateApplied: date("date_applied").notNull(),
  applicationStatus: varchar("application_status", { length: 15 }).notNull(),
  employmentType: varchar("employment_type", { length: 15 }),
  contactEmail: varchar("contact_email", { length: 40 }),
  applicationClosingDate: date("application_closing_date"),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications, {
  jobTitle: z.string().min(1, "Job title is required").max(40),
  companyName: z.string().min(1, "Company name is required").max(40),
  dateApplied: z.string().min(1, "Date applied is required"),
  applicationStatus: z.enum(["In progress", "Applied", "Interviewing", "Offer", "Rejected", "Withdrawn"]),
  contactEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
}).omit({
  id: true,
  applicationNumber: true,
});

export const updateJobApplicationSchema = insertJobApplicationSchema.partial().extend({
  id: z.number(),
});

export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type UpdateJobApplication = z.infer<typeof updateJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;

// Simple user schema for login (no actual authentication, just form validation)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
