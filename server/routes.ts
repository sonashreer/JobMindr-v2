import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertJobApplicationSchema, updateJobApplicationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all job applications
  app.get("/api/job-applications", async (req, res) => {
    try {
      const {
        companyName,
        status,
        dateApplied,
        sortBy,
        sortOrder
      } = req.query as {
        companyName?: string;
        status?: string;
        dateApplied?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      };

      const applications = await storage.getFilteredJobApplications({
        companyName,
        status,
        dateApplied,
        sortBy,
        sortOrder
      });

      res.json(applications);
    } catch (error) {
      console.error("Error fetching job applications:", error);
      res.status(500).json({ message: "Failed to fetch job applications" });
    }
  });

  // Create new job application
  app.post("/api/job-applications", async (req, res) => {
    try {
      const validatedData = insertJobApplicationSchema.parse(req.body);
      const newApplication = await storage.createJobApplication(validatedData);
      res.status(201).json(newApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        console.error("Error creating job application:", error);
        res.status(500).json({ message: "Failed to create job application" });
      }
    }
  });

  // Update job application
  app.put("/api/job-applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const validatedData = updateJobApplicationSchema.parse({ ...req.body, id });
      const updatedApplication = await storage.updateJobApplication(id, validatedData);
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Job application not found" });
      }

      res.json(updatedApplication);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        console.error("Error updating job application:", error);
        res.status(500).json({ message: "Failed to update job application" });
      }
    }
  });

  // Delete job applications (bulk delete)
  app.delete("/api/job-applications", async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.some(id => typeof id !== 'number')) {
        return res.status(400).json({ message: "Invalid IDs array" });
      }

      await storage.deleteJobApplications(ids);
      res.json({ message: `${ids.length} job application(s) deleted successfully` });
    } catch (error) {
      console.error("Error deleting job applications:", error);
      res.status(500).json({ message: "Failed to delete job applications" });
    }
  });

  // Simple login endpoint (no actual authentication, just validation)
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Basic validation
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Always return success for any valid email/password combination
      res.json({ 
        message: "Login successful",
        user: { email }
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
