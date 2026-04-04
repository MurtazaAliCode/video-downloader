import { Router, type Application } from "express";
import { type Request, Response } from "express";
import { storage } from "./storage.js";
import { addDownloadJob } from './job-queue.js';  // Simple queue ke liye
import { InsertJob } from "../shared/schema.js";
import { log } from "./vite.js";  // Log ke liye
import { sendAdminNotification, sendUserConfirmation } from "./email.js";

// Setup Express Router
export const router = Router();

// Endpoint: Start download process
router.post("/download-video", async (req: Request, res: Response) => {
  const { url, format: downloadFormat, platform, options } = req.body;  // 'format' ko 'downloadFormat' mein rename (frontend match)

  if (!url) {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    const insertJob: InsertJob = {
      url,
      downloadFormat: downloadFormat || 'mp4',
      platform: platform || 'youtube',  // Default ya frontend se lo
      options: options || {}, // Add options property
    };

    const job = await storage.createJob(insertJob);

    // Queue mein add karo (simple queue auto-process karegi, full logic wahan)
    await addDownloadJob({
      id: job.id,
      url: job.url,
      downloadFormat: job.downloadFormat,
      quality: options?.quality
    });

    // Client ko response dein
    return res.status(202).json({
      jobId: job.id,
      message: 'Download job created successfully.',
      status: job.status
    });
  } catch (error) {
    console.error("🚨 Download request initiation error:", error);  // Detailed log
    return res.status(500).json({
      message: "Failed to process download request.",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint: Check job status (Client polling)
router.get("/status/:jobId", async (req: Request, res: Response) => {
  const { jobId } = req.params;

  try {
    const job = await storage.getJob(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Security: Important fields wapas bhejen
    return res.json({
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      downloadUrl: job.downloadUrl,
      title: job.title,  // Frontend auto-download ke liye
      errorMessage: job.errorMessage,
    });
  } catch (error) {
    console.error(`Error fetching status for ${jobId}:`, error);
    return res.status(500).json({ message: "Error fetching status." });
  }
});

// Endpoint: Serve the final file
router.get("/download/:jobId", async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const job = await storage.getJob(jobId);

  if (!job || job.status !== 'completed') {
    return res.status(404).json({ message: "File not ready or job expired." });
  }

  try {
    // RapidAPI mode: downloadUrl is a direct external URL → redirect browser to it
    if (job.downloadUrl && job.downloadUrl.startsWith('http')) {
      console.log(`↗️ Redirecting job ${jobId} to direct CDN URL`);
      return res.redirect(302, job.downloadUrl);
    }

    // yt-dlp mode: serve local file
    if (!job.outputPath) {
      return res.status(404).json({ message: "File not found." });
    }

    res.download(job.outputPath, `${job.title || 'video'}.${job.downloadFormat}`, (err) => {
      if (err) {
        console.error(`Error serving file for ${jobId}:`, err);
        res.status(500).send("Could not download the file.");
      }
    });
  } catch (error) {
    console.error(`Unexpected error in download endpoint for ${jobId}:`, error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Endpoint: Submit contact message (Contact Us / Report)
router.post("/contact", async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save to database
    const contactMessage = await storage.createContactMessage({
      name,
      email,
      subject,
      message,
    });

    // Send emails in the background
    // 1. Notify Admin
    sendAdminNotification({ name, email, subject, message }).catch(err => 
      console.error("Failed to send admin email:", err)
    );

    // 2. Confirm to User (as requested by user)
    sendUserConfirmation({ name, email }).catch(err => 
      console.error("Failed to send user confirmation email:", err)
    );

    return res.status(201).json({
      message: "Message received successfully.",
      id: contactMessage.id
    });
  } catch (error) {
    console.error("🚨 Contact/Report submission error:", error);
    return res.status(500).json({
      message: "Failed to process your message.",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export const registerRoutes = (app: Application) => {
  app.use('/api', router);
  return app;
};