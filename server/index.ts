import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// ✅ SECURITY: Configure CORS properly
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5000', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Configure Express to skip body parsing for file upload routes
app.use((req, res, next) => {
  // Skip all body parsing for document upload routes
  if (req.path.includes('/documents') && req.method === 'POST') {
    return next();
  }
  // Apply normal body parsing for other routes
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
    return next();
  }
  express.urlencoded({ extended: false, limit: '50mb' })(req, res, (err) => {
    if (err) {
      console.error('URL encoding error:', err);
      return res.status(400).json({ message: 'Invalid form data' });
    }
    next();
  });
});

// ✅ SECURITY: Minimal logging - only errors and critical info
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;

  res.on("finish", () => {
    const duration = Date.now() - start;
    // Only log errors (4xx, 5xx) and slow requests (>1s)
    if (path.startsWith("/api") && (res.statusCode >= 400 || duration > 1000)) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
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
  server.listen(port, () => {
    log(`serving on port ${port}`);
    log(`Local: http://localhost:${port}`);
  });
})();
