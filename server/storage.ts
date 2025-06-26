import { jobApplications, type JobApplication, type InsertJobApplication, type UpdateJobApplication } from "@shared/schema";
import { db } from "./db";
import { eq, like, desc, asc, and, inArray } from "drizzle-orm";

export interface IStorage {
  // Job Application CRUD operations
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getAllJobApplications(): Promise<JobApplication[]>;
  getJobApplicationById(id: number): Promise<JobApplication | undefined>;
  updateJobApplication(id: number, updates: Partial<UpdateJobApplication>): Promise<JobApplication | undefined>;
  deleteJobApplications(ids: number[]): Promise<void>;

  // Filtering and sorting
  getFilteredJobApplications(filters: {
    companyName?: string;
    status?: string;
    dateApplied?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<JobApplication[]>;
}

export class DatabaseStorage implements IStorage {
  private generateApplicationNumber(): string {
    // Generate unique 10-character alphanumeric application number
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const applicationNumber = this.generateApplicationNumber();

    const [newApplication] = await db
      .insert(jobApplications)
      .values({
        ...application,
        applicationNumber,
      })
      .returning();

    return newApplication;
  }

  async getAllJobApplications(): Promise<JobApplication[]> {
    return await db
      .select()
      .from(jobApplications)
      .orderBy(desc(jobApplications.dateApplied));
  }

  async getJobApplicationById(id: number): Promise<JobApplication | undefined> {
    const [application] = await db
      .select()
      .from(jobApplications)
      .where(eq(jobApplications.id, id));

    return application;
  }

  async updateJobApplication(id: number, updates: Partial<UpdateJobApplication>): Promise<JobApplication | undefined> {
    const [updatedApplication] = await db
      .update(jobApplications)
      .set(updates)
      .where(eq(jobApplications.id, id))
      .returning();

    return updatedApplication;
  }

  async deleteJobApplications(ids: number[]): Promise<void> {
    if (ids.length === 0) return;

    await db
      .delete(jobApplications)
      .where(inArray(jobApplications.id, ids));
  }

  async getFilteredJobApplications(filters: {
    companyName?: string;
    status?: string;
    dateApplied?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<JobApplication[]> {
    const conditions = [];

    if (filters.companyName) {
      conditions.push(like(jobApplications.companyName, `%${filters.companyName}%`));
    }

    if (filters.status) {
      conditions.push(eq(jobApplications.applicationStatus, filters.status));
    }

    if (filters.dateApplied) {
      conditions.push(eq(jobApplications.dateApplied, filters.dateApplied));
    }

    // Apply sorting
    const sortField = filters.sortBy || 'dateApplied';
    const sortDirection = filters.sortOrder || 'desc';

    let orderBy;
    switch (sortField) {
      case 'companyName':
        orderBy = sortDirection === 'asc' ? asc(jobApplications.companyName) : desc(jobApplications.companyName);
        break;
      case 'dateApplied':
        orderBy = sortDirection === 'asc' ? asc(jobApplications.dateApplied) : desc(jobApplications.dateApplied);
        break;
      case 'applicationStatus':
        orderBy = sortDirection === 'asc' ? asc(jobApplications.applicationStatus) : desc(jobApplications.applicationStatus);
        break;
      case 'jobTitle':
        orderBy = sortDirection === 'asc' ? asc(jobApplications.jobTitle) : desc(jobApplications.jobTitle);
        break;
      default:
        orderBy = desc(jobApplications.dateApplied);
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(jobApplications)
        .where(and(...conditions))
        .orderBy(orderBy);
    } else {
      return await db
        .select()
        .from(jobApplications)
        .orderBy(orderBy);
    }
  }
}

export const storage = new DatabaseStorage();