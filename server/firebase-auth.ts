import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage-factory";
import { adminAuth } from "./firebase-admin";

// Extend Express Request interface to include Firebase user
declare global {
  namespace Express {
    interface Request {
      firebaseUser?: {
        uid: string;
        email: string;
      };
      user?: any; // Keep compatibility with existing code
    }
  }
}

// Master admin email from environment variable
const MASTER_ADMIN_EMAIL = process.env.MASTER_ADMIN_EMAIL || 'rfinnbogason@gmail.com';

// Firebase authentication middleware with PROPER token verification
export const authenticateFirebase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // ✅ SECURITY FIX: Use Firebase Admin SDK to verify token signature
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      const email = decodedToken.email;
      const uid = decodedToken.uid;

      if (!email) {
        return res.status(401).json({ message: "Invalid token: no email" });
      }

      // Check if user exists in our database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Set user data for compatibility with existing code
      req.firebaseUser = {
        uid: uid,
        email: email
      };
      req.user = user; // For compatibility with existing code

      next();
    } catch (error: any) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Helper function to check if request is authenticated
export const isAuthenticatedFirebase = (req: Request): boolean => {
  return !!req.firebaseUser && !!req.user;
};

/**
 * Subscription validation middleware
 * Checks if user's trial has expired and blocks access if needed
 * Master admin bypasses all checks
 */
export const validateSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Bypass for master admin (using environment variable)
    const userEmail = req.firebaseUser?.email || req.user?.email;
    if (userEmail === MASTER_ADMIN_EMAIL) {
      console.log('🔑 Master admin detected - bypassing subscription check');
      return next();
    }

    // Get user's strataId from query, params, or body
    const strataId = req.params.strataId || req.query.strataId || req.body.strataId;

    if (!strataId) {
      // If no strataId in request, allow (some routes don't need it)
      return next();
    }

    // Get strata subscription info
    const strata = await storage.getStrata(strataId as string);

    if (!strata) {
      return res.status(404).json({ message: "Strata not found" });
    }

    const subscription = strata.subscription;

    // Check subscription status
    if (!subscription) {
      return res.status(403).json({
        message: "No subscription found",
        requiresUpgrade: true,
        trialExpired: true
      });
    }

    // isFreeForever bypass
    if (subscription.isFreeForever) {
      return next();
    }

    // Active paid subscription
    if (subscription.status === 'active') {
      return next();
    }

    // Check trial status
    if (subscription.status === 'trial') {
      const now = new Date();
      const trialEnd = subscription.trialEndDate;

      if (!trialEnd) {
        // No trial end date set - block access
        return res.status(403).json({
          message: "Trial period not configured",
          requiresUpgrade: true,
          trialExpired: true
        });
      }

      // Convert Firestore Timestamp to Date if needed
      const trialEndDate = (trialEnd as any).toDate ? (trialEnd as any).toDate() : new Date(trialEnd);

      if (now > trialEndDate) {
        // Trial expired - HARD BLOCK
        return res.status(403).json({
          message: "Your 30-day trial has ended. Please upgrade to continue using the application.",
          requiresUpgrade: true,
          trialExpired: true,
          trialEndDate: trialEndDate
        });
      }

      // Trial still active
      return next();
    }

    // Cancelled or expired subscription
    if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      return res.status(403).json({
        message: "Your subscription has been cancelled. Please reactivate to continue.",
        requiresUpgrade: true,
        subscriptionCancelled: true
      });
    }

    // Default: allow access for 'free' status
    if (subscription.status === 'free') {
      return next();
    }

    // Unknown status - block as safety measure
    return res.status(403).json({
      message: "Unable to verify subscription status",
      requiresUpgrade: true
    });

  } catch (error) {
    console.error("Subscription validation error:", error);
    return res.status(500).json({ message: "Failed to validate subscription" });
  }
};