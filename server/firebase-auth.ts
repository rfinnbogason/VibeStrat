import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

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

// Firebase authentication middleware
export const authenticateFirebase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // For now, we'll use a simpler approach - verify the token by checking if user exists in our system
    // In production, you would verify the token with Firebase Admin SDK
    
    // Extract email from the token payload (this is a simplified approach)
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const email = payload.email;
      
      if (!email) {
        return res.status(401).json({ message: "Invalid token format" });
      }

      // Check if user exists in our PostgreSQL database
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Set user data for compatibility with existing code
      req.firebaseUser = {
        uid: payload.user_id || payload.sub,
        email: email
      };
      req.user = user; // For compatibility with existing code
      
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
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