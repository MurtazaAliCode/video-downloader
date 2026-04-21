import { Router, type Application } from "express";
import { type Request, Response } from "express";
import { storage } from "./storage.js";
import { addDownloadJob } from './job-queue.js';  // Simple queue ke liye
import { InsertJob } from "../shared/schema.js";
import { log } from "./vite.js";  // Log ke liye
import { sendAdminNotification, sendUserConfirmation } from "./email.js";
import fs from 'fs';
import path from 'path';
import { getCookieHeader } from "./utils/cookieHelper.js";
import { fetchVideoMetadata } from "./utils/videoDownloader.js";

// Setup Express Router
export const router = Router();

// Endpoint: Start download process
router.get("/usage", async (_req: Request, res: Response) => {
  try {
    const usage = await storage.getApiUsage();
    return res.json({
      count: usage?.count || 0,
      visitorCount: usage?.visitorCount || 0,
      monthYear: usage?.monthYear || new Date().toISOString().substring(0, 7),
      limit: 6000
    });
  } catch (error) {
    console.error("Error fetching API usage:", error);
    return res.status(500).json({ message: "Error fetching usage data." });
  }
});

router.post("/track-visit", async (_req: Request, res: Response) => {
  try {
    await storage.incrementVisitorCount();
    return res.json({ success: true });
  } catch (error) {
    console.error("Error tracking visit:", error);
    return res.status(500).json({ message: "Error tracking visit." });
  }
});

router.get("/fetch-metadata", async (req: Request, res: Response) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ message: "URL is required" });
  }

  try {
    const metadata = await fetchVideoMetadata(url);
    return res.json(metadata);
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return res.status(500).json({ message: "Failed to fetch video details." });
  }
});

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
      platform: job.platform,
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
    // RapidAPI mode: stream from CDN with Content-Disposition: attachment (force download)
    if (job.downloadUrl && job.downloadUrl.startsWith('http')) {
      const https = await import('https');
      const http = await import('http');

      const streamCdn = async (urlToStream: string, redirectCount = 0) => {
        if (redirectCount > 5) {
          console.error(`Too many redirects for ${jobId}`);
          if (!res.headersSent) return res.redirect(302, job.downloadUrl!);
          return;
        }

        const cdnUrl = new URL(urlToStream);
        const lib: any = cdnUrl.protocol === 'https:' ? https : http;

        // Clean filename
        const safeTitle = (job.title || 'video').replace(/[^\w\s-]/g, '').trim().substring(0, 80) || 'video';
        const filename = `${safeTitle}.mp4`;

        // Better referer for bypassing blocks
        let referer = `https://${cdnUrl.hostname}/`;
        if (job?.platform === 'youtube' || job?.url?.includes('youtube')) referer = 'https://www.youtube.com/';
        else if (job?.platform === 'tiktok' || job?.url?.includes('tiktok')) referer = 'https://www.tiktok.com/';

        // --- INJECT COOKIES USING HELPER ---
        const cookieHeader = getCookieHeader(urlToStream);
        if (cookieHeader) {
            const platformLabel = job.platform?.toUpperCase() || 'CDN';
            console.log(`📡 Injected cookies into ${platformLabel} proxy request for ${jobId}`);
        }

        const proxyRequest = lib.get({
          hostname: cdnUrl.hostname,
          path: cdnUrl.pathname + cdnUrl.search,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            'Referer': referer,
            'Accept': '*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cookie': cookieHeader,
            'Connection': 'keep-alive',
            'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'cross-site',
            'Sec-Fetch-Dest': 'video'
          }
        }, (fileRes: any) => {
          const { statusCode } = fileRes;
          
          if (statusCode === 200 || statusCode === 206) {
            // Success: stream with download headers
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', fileRes.headers['content-type'] || 'video/mp4');
            const contentLength = fileRes.headers['content-length'];
            if (contentLength) {
              res.setHeader('Content-Length', contentLength);
            }
            
            console.log(`📡 Streaming job ${jobId} (${contentLength || 'unknown'} bytes) as attachment`);
            fileRes.pipe(res);

          } else if ([301, 302, 307, 308].includes(statusCode)) {
            // Follow redirect internals
            const location = fileRes.headers.location;
            fileRes.resume();
            if (location && redirectCount < 5) {
                const nextUrl = location.startsWith('http') ? location : new URL(location, urlToStream).toString();
                console.log(`↩️ Proxy redirect (${redirectCount + 1}) → ${nextUrl}`);
                streamCdn(nextUrl, redirectCount + 1);
            } else {
                if (!res.headersSent) res.status(404).send('Too many redirects or missing location header from CDN.');
            }

          } else {
            // Blocked or Error - AGGRESSIVE LOGGING
            fileRes.resume();
            console.error(`❌ PROXY ERROR: CDN returned status ${statusCode} for job ${jobId}`);
            
            if (!res.headersSent) {
                if (statusCode === 403 && job.downloadUrl) {
                    console.log(`🚀 Redirecting user directly to CDN due to 403 Block: ${jobId}`);
                    return res.redirect(302, job.downloadUrl);
                }

                const platformLabel = job.platform?.toUpperCase() || 'CDN';
                const message = (statusCode === 403) 
                    ? `Download blocked by ${platformLabel} (Access Denied). Try refreshing the page or using a different link.`
                    : `CDN returned error ${statusCode}. Could not stream video.`;
                
                res.status(statusCode).send(message);
            }
          }
        });

        proxyRequest.on('error', (err: Error) => {
          console.error(`Proxy stream error for ${jobId}:`, err.message);
          // Fallback: redirect browser to CDN directly
          if (!res.headersSent) res.redirect(302, job.downloadUrl!);
        });
      };

      await streamCdn(job.downloadUrl || '');
      return;
    }

    // yt-dlp mode: serve local file
    if (!job.outputPath) {
      return res.status(404).json({ message: "File not found." });
    }

    res.download(job.outputPath, `${job.title || 'video'}.${job.downloadFormat}`, (err) => {
      if (err) {
        console.error(`Error serving file for ${jobId}:`, err);
        if (!res.headersSent) res.status(500).send("Could not download the file.");
      }
    });

  } catch (error) {
    console.error(`Unexpected error in download endpoint for ${jobId}:`, error);
    if (!res.headersSent) res.status(500).json({ message: "Internal server error." });
  }
});

// Endpoint: Submit contact message (Contact Us / Report)
router.post("/contact", async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 1. Save to database
    const savedMessage = await storage.createContactMessage({
      name,
      email,
      subject,
      message
    });

    // 2. Send email notification to Admin
    // We do this asynchronously so the user doesn't wait for the email to send
    sendAdminNotification({ name, email, subject, message }).catch(err => {
      console.error("Failed to send admin email:", err);
    });

    // 3. Send confirmation email to User
    sendUserConfirmation({ name, email }).catch(err => {
      console.error("Failed to send user confirmation email:", err);
    });

    return res.status(201).json({
      message: "Message received! We'll get back to you soon.",
      id: savedMessage.id
    });
  } catch (error) {
    console.error("Error processing contact message:", error);
    return res.status(500).json({ message: "Failed to process message." });
  }
});

// --- USER REVIEWS & STATUS ENDPOINTS ---

// Fetch reviews (paginated, only approved by default)
router.get("/reviews", async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const reviews = await storage.getReviews(limit, offset, true);
    return res.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ message: "Error fetching reviews." });
  }
});

// Submit a new review (pending approval)
router.post("/reviews", async (req: Request, res: Response) => {
  try {
    const { name, rating, comment } = req.body;

    if (!comment || !rating) {
      return res.status(400).json({ message: "Rating and comment are required." });
    }

    const review = await storage.createReview({
      name: name || "Anonymous User",
      rating: parseInt(rating),
      comment
    });

    return res.status(201).json({
      message: "Review submitted! It will appear after a quick quality check.",
      review
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return res.status(500).json({ message: "Failed to submit review." });
  }
});

// Admin: Secret endpoint to approve or delete reviews
// Note: In a real app, use authentication. For this project, we use a simple secret query param.
router.post("/reviews/moderate", async (req: Request, res: Response) => {
  const { action, id, secret } = req.body;
  
  // Minimalist security: The user can change this secret later
  // We'll tell the user what the default secret is in the walkthrough
  if (secret !== "vid-admin-2024") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (action === "approve") {
      await storage.approveReview(id);
      return res.json({ message: "Review approved!" });
    } else if (action === "delete") {
      await storage.deleteReview(id);
      return res.json({ message: "Review deleted!" });
    }
    return res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    return res.status(500).json({ message: "Moderation failed." });
  }
});

// Admin: Get all reviews including pending ones
router.get("/reviews/admin", async (req: Request, res: Response) => {
  const { secret } = req.query;
  if (secret !== "vid-admin-2024") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const reviews = await storage.getReviews(100, 0, false);
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching admin reviews." });
  }
});

export const registerRoutes = (app: Application) => {
  app.use('/api', router);
  return app;
};
