import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import http from "http"; // Import http module
import cors from "cors"; // CORS middleware import
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
// FIXED: Local imports mein .js extension add karna zaroori hai
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite.js";

const app = express();

// CORS middleware setup
const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  app.use(cors({
    origin: corsOrigin,
    credentials: true,
  }));
  log(`CORS enabled for origin: ${corsOrigin}`);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// SECURITY HEADERS: Essential for clearing Google Safe Browsing flags
app.use((_req, res, next) => {
  // Prevent XSS, Clickjacking, and ensure MIME types are respected
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // CSP: Only allow content from trusted sources
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://replit.com; " + // Removed unsafe-eval for production safety
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com data:; " +
    "img-src 'self' data: https: blob:; " +
    "media-src 'self' https: blob:; " +
    "connect-src 'self' https: wss:;" // Added wss for websocket safety
  );

  // HSTS (Only if using HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});

// Logging middleware: Safai ke liye accha hai
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // HEALTH CHECK: Render needs this to see the server is alive
    app.get("/health", (_req, res) => res.status(200).send("OK"));

    // ==============================================================
    // SEO FILES: Must be registered FIRST before any catch-all
    // These must NOT go in /api router - they must be at root level
    // ==============================================================
    const __dirname_server = path.dirname(fileURLToPath(import.meta.url));
    const findFile = (filename: string): string | null => {
      const candidates = [
        path.resolve(process.cwd(), "dist", "public", filename),
        path.resolve(process.cwd(), "client", "public", filename),
        path.resolve(__dirname_server, "..", "dist", "public", filename),
        path.resolve(__dirname_server, "..", "client", "public", filename),
      ];
      return candidates.find(p => fs.existsSync(p)) || null;
    };

    app.get("/sitemap.xml", (_req, res) => {
      const filePath = findFile("sitemap.xml");
      if (filePath) {
        res.setHeader("Content-Type", "application/xml; charset=utf-8");
        return res.sendFile(filePath);
      }
      log("sitemap.xml not found in any path");
      res.status(404).type("text").send("sitemap.xml not found");
    });

    app.get("/robots.txt", (_req, res) => {
      const filePath = findFile("robots.txt");
      if (filePath) {
        res.setHeader("Content-Type", "text/plain; charset=utf-8");
        return res.sendFile(filePath);
      }
      res.type("text").send("User-agent: *\nAllow: /\nSitemap: https://vid-downloader-pro.com/sitemap.xml");
    });

    // Yahan aapki saari routes load hoti hain (routes.ts se)
    registerRoutes(app);

    // Explicit API 404 Handler: Prevents /api/* requests from falling through to frontend index.html
    app.use("/api/*", (req, res) => {
      log(`404 Not Found on API: ${req.method} ${req.originalUrl}`);
      res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
    });

    // CRITICAL: Static serving (catch-all) MUST be AFTER API routes
    if (app.get("env") !== "development") {
      serveStatic(app);
    }

    // Global Error Handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      // Console mein error print karein takay debugging aasan ho
      console.error(`🚨 Unhandled API Error (${status}):`, err);

      // Agar production hai to detailed error leak na karein
      res.status(status).json({ 
        message,
        ...(app.get("env") === "development" ? { stack: err.stack } : {})
      });
    });

    if (app.get("env") === "development") {
      // Create HTTP server for Vite ONLY in development
      const server = http.createServer(app);
      await setupVite(app, server);
      
      const port = parseInt(process.env.PORT || '5000', 10);
      server.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port} (Vite Dev)`);
      });
    } else {
      // PRODUCTION: Use direct app.listen for better port binding on Render
      const port = parseInt(process.env.PORT || '10000', 10);
      app.listen(port, "0.0.0.0", () => {
        log(`serving on port ${port} (Production)`);
      });
    }

    // Periodic Cleanup: Runs every hour to delete jobs older than 12 hours
    setInterval(async () => {
      try {
        const { storage } = await import("./storage.js");
        const fs = await import("fs/promises");
        
        const expiredJobs = await storage.getExpiredJobs();
        for (const job of expiredJobs) {
          if (job.outputPath) {
            await fs.unlink(job.outputPath).catch(() => {});
          }
          await storage.deleteJob(job.id);
          log(`Cleaned up expired job: ${job.id}`);
        }
      } catch (error) {
        log(`Cleanup error: ${error}`);
      }
    }, 1000 * 60 * 60);

  } catch (error) {
    console.error("❌ CRITICAL: Server failed to start:", error);
    process.exit(1);
  }
})();
