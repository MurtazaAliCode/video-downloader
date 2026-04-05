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
        const safeTitle = (job.title || 'video').replace(/[^\\w\\s-]/g, '').trim().substring(0, 80) || 'video';
        const filename = `${safeTitle}.mp4`;

        // Better referer for bypassing blocks
        let referer = `https://${cdnUrl.hostname}/`;
        if (job.platform === 'youtube' || job.url?.includes('youtube')) referer = 'https://www.youtube.com/';
        else if (job.platform === 'tiktok' || job.url?.includes('tiktok')) referer = 'https://www.tiktok.com/';

        const proxyRequest = lib.get({
          hostname: cdnUrl.hostname,
          path: cdnUrl.pathname + cdnUrl.search,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': referer,
            'Origin': referer.endsWith('/') ? referer.slice(0, -1) : referer,
            'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'identity',
            'Connection': 'keep-alive'
          }
        }, (fileRes: any) => {
          if (fileRes.statusCode === 200 || fileRes.statusCode === 206) {
            // Success: stream with download headers
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', fileRes.headers['content-type'] || 'video/mp4');
            if (fileRes.headers['content-length']) {
              res.setHeader('Content-Length', fileRes.headers['content-length']);
            }
            console.log(`📡 Streaming job ${jobId} with attachment header from ${urlToStream}`);
            fileRes.pipe(res);

          } else if ([301, 302, 307, 308].includes(fileRes.statusCode)) {
            // CDN redirected to another URL — follow it internally
            const location = fileRes.headers.location;
            fileRes.resume();
            if (location) {
                console.log(`↩️ CDN redirect → ${location}`);
                let nextUrl = location;
                if (!location.startsWith('http')) {
                    nextUrl = new URL(location, urlToStream).toString();
                }
                streamCdn(nextUrl, redirectCount + 1);
            } else {
                if (!res.headersSent) return res.redirect(302, job.downloadUrl!);
            }

          } else {
            // CDN blocked server (403 etc) — fallback: redirect browser directly
            fileRes.resume();
            console.warn(`⚠️ CDN returned ${fileRes.statusCode} for ${jobId}. Falling back to redirect.`);
            if (!res.headersSent) return res.redirect(302, job.downloadUrl!);
          }
        });

        proxyRequest.on('error', (err: Error) => {
          console.error(`Proxy stream error for ${jobId}:`, err.message);
          // Fallback: redirect browser to CDN directly
          if (!res.headersSent) res.redirect(302, job.downloadUrl!);
        });
      };

      await streamCdn(job.downloadUrl);
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