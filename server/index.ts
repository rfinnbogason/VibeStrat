import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Configure Express to skip body parsing for file upload routes
app.use((req, res, next) => {
  console.log(`🔍 Middleware check: ${req.method} ${req.path} - Content-Type: ${req.headers['content-type']}`);
  
  // Skip all body parsing for document upload routes
  if (req.path.includes('/documents') && req.method === 'POST') {
    console.log('✅ Skipping body parsing for document upload');
    return next();
  }
  // Apply normal body parsing for other routes
  console.log('📝 Applying JSON body parsing');
  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) {
      console.error('JSON parsing error:', err);
      return res.status(400).json({ message: 'Invalid JSON' });
    }
    next();
  });
});

app.use((req, res, next) => {
  // Skip URL encoding for document upload routes
  if (req.path.includes('/documents') && req.method === 'POST') {
    console.log('✅ Skipping URL encoding for document upload');
    return next();
  }
  console.log('🔗 Applying URL encoding');
  express.urlencoded({ extended: false, limit: '50mb' })(req, res, (err) => {
    if (err) {
      console.error('URL encoding error:', err);
      return res.status(400).json({ message: 'Invalid form data' });
    }
    next();
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Log all POST requests to admin endpoints immediately
  if (req.method === 'POST' && path.includes('/api/admin/')) {
    console.log('🔍 INCOMING POST REQUEST to admin endpoint:', {
      method: req.method,
      path: path,
      hasAuth: !!req.headers.authorization
    });
  }

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
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
