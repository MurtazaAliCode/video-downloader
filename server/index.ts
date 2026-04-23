import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import http from "http"; // Import http module
import cors from "cors"; // CORS middleware import
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

    // Yahan aapki saari routes load hoti hain (routes.ts se)
    registerRoutes(app);

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
