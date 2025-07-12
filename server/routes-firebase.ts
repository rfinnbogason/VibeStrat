import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { firebaseStorage } from "./firebase-storage";
import { authenticateFirebase } from "./firebase-auth";
import bcrypt from "bcryptjs";
import multer from "multer";
import OpenAI from "openai";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs for quotes
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf' || file.mimetype.startsWith('text/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and text files are allowed'));
    }
  },
});

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for audio
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// Firebase-only authentication middleware
const isAuthenticatedUnified: RequestHandler = async (req: any, res, next) => {
  try {
    // Check for Firebase token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Simple token verification - extract email from JWT payload
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const email = payload.email;
        
        if (email) {
          // Special handling for master admin
          if (email === 'rfinnbogason@gmail.com') {
            req.authenticatedUser = {
              id: 'master-admin',
              email: email,
              firstName: 'Master',
              lastName: 'Admin',
              role: 'master_admin',
              isActive: true
            };
            req.firebaseUser = {
              uid: payload.user_id || payload.sub,
              email: email
            };
            return next();
          }
          
          const user = await firebaseStorage.getUserByEmail(email);
          if (user) {
            req.authenticatedUser = user;
            req.firebaseUser = {
              uid: payload.user_id || payload.sub,
              email: email
            };
            return next();
          }
        }
      } catch (tokenError: any) {
        console.log("Firebase token verification failed:", tokenError.message);
      }
    }
    
    return res.status(401).json({ message: "Firebase authentication required" });
  } catch (error) {
    console.error("Error checking Firebase authentication:", error);
    return res.status(500).json({ message: "Firebase authentication error" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // User profile endpoint
  app.get("/api/user/profile", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const user = req.authenticatedUser;
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role
      });
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching user profile: " + error.message });
    }
  });

  // User password change check
  app.get("/api/user/must-change-password", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const user = req.authenticatedUser;
      res.json({ mustChangePassword: user.mustChangePassword || false });
    } catch (error: any) {
      res.status(500).json({ message: "Error checking password change requirement: " + error.message });
    }
  });

  // Change password endpoint
  app.post("/api/user/change-password", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { newPassword } = req.body;
      const user = req.authenticatedUser;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await firebaseStorage.updateUser(user.id, {
        passwordHash: hashedPassword,
        mustChangePassword: false
      });

      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Error changing password: " + error.message });
    }
  });

  // Get user strata organizations
  app.get("/api/strata", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const user = req.authenticatedUser;
      
      // Master admin can see all strata
      if (user.email === 'rfinnbogason@gmail.com') {
        const allStrata = await firebaseStorage.getAllStrata();
        return res.json(allStrata);
      }
      
      const userStrata = await firebaseStorage.getUserStrata(user.id);
      res.json(userStrata);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching strata: " + error.message });
    }
  });

  // Get user role for specific strata
  app.get("/api/strata/:strataId/user-role", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const userEmail = req.firebaseUser?.email || req.authenticatedUser?.email;

      console.log('🔍 User role check:', {
        strataId,
        userEmail,
        firebaseUser: req.firebaseUser?.email,
        authenticatedUser: req.authenticatedUser?.email
      });

      // Master admin check
      if (userEmail === 'rfinnbogason@gmail.com') {
        console.log('✅ Master admin detected, returning master_admin role');
        return res.json({ role: 'master_admin' });
      }

      // FIREBASE NATIVE: Get user and access from Firebase only
      try {
        const user = await firebaseStorage.getUserByEmail(userEmail);
        if (user) {
          console.log('👤 Found user in Firebase:', { id: user.id, email: user.email });
          const userAccess = await firebaseStorage.getUserStrataAccess(user.id, strataId);
          if (userAccess) {
            console.log('🎭 Firebase user access result:', userAccess);
            console.log('✅ Returning role:', userAccess.role);
            return res.json({ role: userAccess.role });
          }
        }
      } catch (firebaseError: any) {
        console.log('❌ Firebase lookup failed:', firebaseError.message);
      }

      // Default to resident if no specific role found
      res.json({ role: 'resident' });
    } catch (error: any) {
      console.error('Error getting user role:', error);
      res.status(500).json({ message: "Error getting user role: " + error.message });
    }
  });

  // Get strata expenses
  app.get("/api/strata/:strataId/expenses", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const expenses = await firebaseStorage.getStrataExpenses(strataId);
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching expenses: " + error.message });
    }
  });

  // Create expense
  app.post("/api/strata/:strataId/expenses", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const expenseData = req.body;
      const user = req.authenticatedUser;

      const expense = await firebaseStorage.createExpense({
        ...expenseData,
        strataId,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.json(expense);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating expense: " + error.message });
    }
  });

  // Admin endpoints
  const isAdmin: RequestHandler = async (req: any, res, next) => {
    if (req.authenticatedUser?.email === 'rfinnbogason@gmail.com') {
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  };

  // Get all strata (admin only)
  app.get("/api/admin/strata", isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const allStrata = await firebaseStorage.getAllStrata();
      res.json(allStrata);
    } catch (error: any) {
      res.status(500).json({ message: "Error fetching all strata: " + error.message });
    }
  });

  // Create new user (admin only)
  app.post("/api/admin/users", isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const userData = req.body;
      const hashedPassword = await bcrypt.hash(userData.tempPassword || '123456', 10);
      
      const user = await firebaseStorage.createUser({
        ...userData,
        passwordHash: hashedPassword,
        mustChangePassword: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: "Error creating user: " + error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}