import express from "express";
import cors from "cors";
import { registerRoutes } from "../server/routes";
import type { Request, Response, NextFunction } from "express";

const app = express();

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5000', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
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

// Body parsing (skip for file upload routes)
app.use((req, res, next) => {
  if (req.path.includes('/documents') && req.method === 'POST') {
    return next();
  }
  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) return res.status(400).json({ message: 'Invalid JSON' });
    next();
  });
});

app.use((req, res, next) => {
  if (req.path.includes('/documents') && req.method === 'POST') {
    return next();
  }
  express.urlencoded({ extended: false, limit: '50mb' })(req, res, (err) => {
    if (err) return res.status(400).json({ message: 'Invalid form data' });
    next();
  });
});

// Register all API routes
await registerRoutes(app);

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});

export default app;
