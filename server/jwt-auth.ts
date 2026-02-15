import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "./storage-factory";

const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";
const JWT_EXPIRY = "7d";

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const MASTER_ADMIN_EMAIL = process.env.MASTER_ADMIN_EMAIL || "rfinnbogason@gmail.com";

export function generateToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): { userId: string; email: string } {
  return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
}

export const authenticateJwt = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);

      const user = await storage.getUserByEmail(decoded.email);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error: any) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

/**
 * Subscription validation middleware
 * Checks if user's trial has expired and blocks access if needed
 * Master admin bypasses all checks
 */
export const validateSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userEmail = req.user?.email;
    if (userEmail === MASTER_ADMIN_EMAIL) {
      return next();
    }

    const strataId = req.params.strataId || req.query.strataId || req.body.strataId;

    if (!strataId) {
      return next();
    }

    const strata = await storage.getStrata(strataId as string);

    if (!strata) {
      return res.status(404).json({ message: "Strata not found" });
    }

    const subscription = strata.subscription;

    if (!subscription) {
      return res.status(403).json({
        message: "No subscription found",
        requiresUpgrade: true,
        trialExpired: true,
      });
    }

    if (subscription.isFreeForever) {
      return next();
    }

    if (subscription.status === "active") {
      return next();
    }

    if (subscription.status === "trial") {
      const now = new Date();
      const trialEnd = subscription.trialEndDate;

      if (!trialEnd) {
        return res.status(403).json({
          message: "Trial period not configured",
          requiresUpgrade: true,
          trialExpired: true,
        });
      }

      const trialEndDate = trialEnd instanceof Date ? trialEnd : new Date(trialEnd);

      if (now > trialEndDate) {
        return res.status(403).json({
          message: "Your 30-day trial has ended. Please upgrade to continue using the application.",
          requiresUpgrade: true,
          trialExpired: true,
          trialEndDate: trialEndDate,
        });
      }

      return next();
    }

    if (subscription.status === "cancelled" || subscription.status === "expired") {
      return res.status(403).json({
        message: "Your subscription has been cancelled. Please reactivate to continue.",
        requiresUpgrade: true,
        subscriptionCancelled: true,
      });
    }

    if (subscription.status === "free") {
      return next();
    }

    return res.status(403).json({
      message: "Unable to verify subscription status",
      requiresUpgrade: true,
    });
  } catch (error) {
    console.error("Subscription validation error:", error);
    return res.status(500).json({ message: "Failed to validate subscription" });
  }
};
