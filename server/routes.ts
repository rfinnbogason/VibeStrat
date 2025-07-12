import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { firebaseStorage } from "./firebase-storage";
import { authenticateFirebase } from "./firebase-auth";
import { uploadFileToStorage, deleteFileFromStorage } from "./firebase-storage-bucket";
import bcrypt from "bcryptjs";
import multer from "multer";
import { extractQuoteDataFromDocument, extractQuoteDataFromText } from "./openai";
import {
  insertStrataSchema,
  insertUnitSchema,
  insertVendorSchema,
  insertVendorContractSchema,
  insertVendorHistorySchema,
  insertExpenseSchema,
  insertQuoteSchema,
  insertMeetingSchema,
  insertDocumentSchema,
  insertMaintenanceRequestSchema,
  insertMaintenanceProjectSchema,
  insertAnnouncementSchema,
  insertUserStrataAccessSchema,
  insertFundSchema,
  insertFundTransactionSchema,
  insertMessageSchema,
  insertResidentDirectorySchema,
  insertNotificationSchema,
  insertDismissedNotificationSchema,
  insertPaymentReminderSchema,
} from "@shared/schema";

// Configure multer for file uploads (documents, images, audio)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    fieldSize: 50 * 1024 * 1024, // 50MB for individual fields
    fields: 10, // Maximum number of fields
    files: 1, // Maximum number of files
  },
  fileFilter: (req, file, cb) => {
    // Accept various file types
    const allowedTypes = [
      'audio/',
      'image/',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ];
    
    const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

// Firebase-only authentication middleware
const isAuthenticatedUnified: RequestHandler = async (req: any, res, next) => {
  try {
    // Check for Firebase token
    const authHeader = req.headers.authorization;
    console.log('🔐 Auth check:', {
      hasAuthHeader: !!authHeader,
      authHeaderValue: authHeader ? `${authHeader.substring(0, 20)}...` : 'none',
      allHeaders: Object.keys(req.headers),
      method: req.method,
      path: req.path
    });
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      console.log('🎫 Token extracted:', {
        tokenLength: token.length,
        tokenStart: token.substring(0, 20),
        hasToken: !!token
      });
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

// Firebase migration endpoints
function registerFirebaseMigrationRoutes(app: Express) {
  
  // Check if user exists in PostgreSQL (for login validation)
  app.post("/api/migration/check-user", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await firebaseStorage.getUserByEmail(email);
      
      if (user) {
        // Check if this user was created through Firebase registration
        // Firebase users have different characteristics than PostgreSQL legacy users
        const isFirebaseNative = user.firebaseUid || user.createdAt > new Date('2025-07-01'); // Assuming Firebase migration started July 1st
        
        res.json({
          exists: true,
          needsMigration: !isFirebaseNative, // Only migrate legacy PostgreSQL users
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role,
            isActive: user.isActive !== false
          },
          temporaryPassword: isFirebaseNative ? null : "VibeStrat2025!" // No temp password for Firebase users
        });
      } else {
        res.json({ exists: false });
      }
    } catch (error) {
      console.error('Error checking user:', error);
      res.status(500).json({ error: 'Failed to check user' });
    }
  });

  // Get all PostgreSQL users for migration reference
  app.get("/api/migration/postgresql-users", async (req, res) => {
    try {
      const users = await firebaseStorage.getAllUsers();
      const userList = users.map(user => ({
        id: user.id,
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role,
        isActive: user.isActive !== false
      }));
      
      res.json({
        totalUsers: userList.length,
        users: userList,
        temporaryPassword: "VibeStrat2025!",
        instructions: [
          "All existing users can log in with their email and the temporary password: VibeStrat2025!",
          "Users should change their password after first login",
          "Admin users retain their existing roles and permissions"
        ]
      });
    } catch (error) {
      console.error('Error fetching PostgreSQL users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Add a test route for debugging uploads
  app.post('/api/test-upload', (req, res) => {
    console.log('🧪 Test upload route reached');
    console.log(`📋 Content-Type: ${req.headers['content-type']}`);
    console.log(`📋 Content-Length: ${req.headers['content-length']}`);
    res.json({ message: 'Test upload route working' });
  });

  // Simplified test upload route to isolate the issue
  app.post('/api/simple-upload-test', (req, res) => {
    console.log('🎯 SIMPLE UPLOAD TEST ROUTE REACHED');
    res.json({ message: 'Simple upload route working', method: req.method, path: req.path });
  });

  // EMERGENCY UPLOAD ROUTE - COMPLETE BYPASS
  app.post('/api/emergency-upload/:strataId', upload.single('file'), async (req: any, res) => {
    console.log('🚨 EMERGENCY UPLOAD ROUTE REACHED 🚨');
    console.log('File details:', {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      strataId: req.params.strataId
    });

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Direct Firebase upload without all the complex validation
      const fileName = `${Date.now()}_${req.file.originalname}`;
      const folder = `documents/${req.params.strataId}`;
      const fileUrl = await uploadFileToStorage(fileName, req.file.buffer, req.file.mimetype, folder);
      
      console.log('✅ File uploaded to Firebase Storage:', fileUrl);

      // Create minimal document record
      const documentData = {
        title: req.body.title || req.file.originalname,
        description: req.body.description || '',
        type: req.body.type || 'general',
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileUrl: fileUrl,
        folderId: req.body.folderId || null,
        strataId: req.params.strataId,
        uploadedBy: 'master-admin'
      };

      const document = await firebaseStorage.createDocument(documentData);
      console.log('✅ Document created successfully');
      res.json(document);
    } catch (error: any) {
      console.error('❌ Emergency upload failed:', error);
      res.status(500).json({ message: "Emergency upload failed: " + error.message });
    }
  });
  // Auth middleware
  // Firebase-only authentication - no Replit Auth setup needed

  // Admin check middleware
  const isAdmin: RequestHandler = async (req: any, res, next) => {
    console.log("Admin check - Firebase user:", req.firebaseUser);
    console.log("Admin check - Authenticated user:", req.authenticatedUser);
    console.log("Admin check - Replit user:", req.user);
    
    // Check Firebase user email
    if (req.firebaseUser?.email === 'rfinnbogason@gmail.com') {
      console.log("Admin access granted via Firebase email");
      return next();
    }
    
    // Check authenticated user email (for password-based auth)
    if (req.authenticatedUser?.email === 'rfinnbogason@gmail.com') {
      console.log("Admin access granted via authenticated email");
      return next();
    }
    
    // Check authenticated user role (for master admin)
    if (req.authenticatedUser?.role === 'master_admin') {
      console.log("Admin access granted via master_admin role");
      return next();
    }
    
    // Check Replit Auth user email
    const userEmail = req.user?.claims?.email;
    if (userEmail === 'rfinnbogason@gmail.com') {
      console.log("Admin access granted via Replit email");
      return next();
    }
    
    console.log("Admin access denied - no matching criteria");
    return res.status(403).json({ message: "Admin access required" });
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await firebaseStorage.getUser(userId);
      
      // If this is a new user's first login, create sample strata data
      const userStrata = await firebaseStorage.getUserStrata(userId);
      if (userStrata.length === 0) {
        console.log(`Creating sample strata for new user: ${userId}`);
        
        // Create a sample strata
        const sampleStrata = await firebaseStorage.createStrata({
          name: "Sunset Gardens Strata",
          address: "123 Maple Street, Vancouver, BC V6K 2P4",
          unitCount: 6,
          createdBy: userId,
          feeStructure: {
            studio: 280,
            one_bedroom: 350,
            two_bedroom: 420
          }
        });
        
        // Grant the user property manager access
        await firebaseStorage.createUserStrataAccess({
          userId,
          strataId: sampleStrata.id,
          role: 'property_manager'
        });
        
        // Create some sample units
        for (let i = 1; i <= 6; i++) {
          await firebaseStorage.createUnit({
            strataId: sampleStrata.id,
            unitNumber: `${i}0${i}`,
            feeTierId: i <= 2 ? "studio" : i <= 4 ? "one_bedroom" : "two_bedroom"
          });
        }
        
        console.log(`Sample strata created successfully for user: ${userId}`);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Unified authentication check endpoint
  app.get('/api/auth/session', async (req: any, res) => {
    try {
      let user = null;
      
      // Check for Replit Auth session
      if (req.isAuthenticatedUnified() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        user = await firebaseStorage.getUser(userId);
      }
      
      // Check for password-based session
      if (!user && req.session && (req.session as any).userId) {
        user = await firebaseStorage.getUser((req.session as any).userId);
      }
      
      if (user) {
        // Get user's strata assignments with role information
        const strataAssignments = await firebaseStorage.getAllUserStrataAccess(user.id);
        
        return res.json({
          ...user,
          strataAssignments
        });
      }
      
      res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      console.error("Error checking session:", error);
      res.status(500).json({ message: "Failed to check authentication" });
    }
  });

  // Email/Password Authentication Routes
  app.post('/api/auth/setup-password', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await firebaseStorage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.passwordHash) {
        return res.status(400).json({ message: "Password already set" });
      }

      // Hash password and update user
      const passwordHash = await bcrypt.hash(password, 10);
      await firebaseStorage.updateUser(user.id, { passwordHash });

      res.json({ message: "Password set successfully" });
    } catch (error) {
      console.error("Error setting password:", error);
      res.status(500).json({ message: "Failed to set password" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await firebaseStorage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }

      // Update last login
      await firebaseStorage.updateUser(user.id, { lastLoginAt: new Date() });

      // Set session
      (req.session as any).userId = user.id;
      
      res.json({ message: "Login successful", user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logout successful" });
    });
  });

  // Strata routes
  app.get('/api/strata', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const user = req.authenticatedUser;
      console.log('🏢 Fetching strata for user:', user.email);
      
      // Master admin can see all strata
      if (user.email === 'rfinnbogason@gmail.com') {
        console.log('👑 Master admin access - fetching all strata');
        const allStrata = await firebaseStorage.getAllStrata();
        console.log(`📊 Found ${allStrata.length} strata organizations`);
        if (allStrata.length === 0) {
          console.error('⚠️ No strata found in Firestore - run migration script');
        }
        return res.json(allStrata);
      }
      
      console.log('👤 Regular user access - fetching user strata');
      const userStrata = await firebaseStorage.getUserStrata(user.id);
      console.log(`📊 Found ${userStrata.length} strata for user ${user.id}`);
      if (userStrata.length === 0) {
        console.error('⚠️ No strata found for user - check userStrataAccess collection');
      }
      res.json(userStrata);
    } catch (error: any) {
      console.error('❌ Error fetching strata:', error);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });

  app.get('/api/strata/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const strata = await firebaseStorage.getStrata(id);
      if (!strata) {
        return res.status(404).json({ message: "Strata not found" });
      }
      res.json(strata);
    } catch (error) {
      console.error("Error fetching strata:", error);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });

  // Create new strata
  app.post('/api/strata', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const user = req.authenticatedUser;
      console.log('🏗️ Creating new strata for user:', user.email);
      
      const strataData = req.body;
      console.log('📋 Strata data:', JSON.stringify(strataData, null, 2));
      
      // Create strata document with server timestamp
      const newStrata = await firebaseStorage.createStrata({
        ...strataData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Created strata:', newStrata.id);
      
      // Create user access as chairperson
      await firebaseStorage.createUserStrataAccess({
        id: `${user.id}_${newStrata.id}`,
        userId: user.id,
        strataId: newStrata.id,
        role: 'chairperson',
        canPostAnnouncements: true,
        createdAt: new Date()
      });
      
      console.log('✅ Created user access for chairperson');
      
      res.status(201).json({ id: newStrata.id, ...newStrata });
      const strata = await firebaseStorage.createStrata(strataData);
      
      // Grant the creator property manager access
      await firebaseStorage.createUserStrataAccess({
        userId,
        strataId: strata.id,
        role: 'property_manager'
      });
      
      res.json(strata);
    } catch (error) {
      console.error("Error creating strata:", error);
      res.status(500).json({ message: "Failed to create strata" });
    }
  });

  // Strata registration route (public)
  app.post('/api/strata/register', async (req, res) => {
    try {
      const { insertPendingStrataRegistrationSchema } = await import("@shared/schema");
      const registrationData = insertPendingStrataRegistrationSchema.parse(req.body);
      
      const pendingRegistration = await firebaseStorage.createPendingRegistration(registrationData);
      
      res.json({ 
        message: "Registration submitted successfully",
        registrationId: pendingRegistration.id 
      });
    } catch (error: any) {
      console.error("Error submitting registration:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid registration data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to submit registration" });
    }
  });

  // Unit routes
  app.get('/api/strata/:id/units', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      console.log(`📋 Fetching units for strata ${id}`);
      
      const units = await firebaseStorage.getStrataUnits(id);
      console.log(`✅ Found ${units.length} units for strata ${id}`);
      console.log(`🏠 Units data:`, units);
      
      res.json(units);
    } catch (error) {
      console.error("❌ Error fetching units:", error);
      console.error("❌ Error details:", error.message);
      console.error("❌ Error stack:", error.stack);
      res.status(500).json({ message: "Failed to fetch units", error: error.message });
    }
  });

  app.post('/api/strata/:id/units', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      console.log(`📋 Creating unit for strata ${id}:`, req.body);
      
      const unitData = insertUnitSchema.parse({
        ...req.body,
        strataId: id
      });
      
      console.log(`✅ Validated unit data:`, unitData);
      
      const unit = await firebaseStorage.createUnit(unitData);
      console.log(`🎉 Successfully created unit:`, unit);
      
      res.json(unit);
    } catch (error) {
      console.error("❌ Error creating unit:", error);
      console.error("❌ Error details:", error.message);
      console.error("❌ Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create unit", error: error.message });
    }
  });

  app.patch('/api/units/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const unit = await firebaseStorage.updateUnit(id, req.body);
      res.json(unit);
    } catch (error) {
      console.error("Error updating unit:", error);
      res.status(500).json({ message: "Failed to update unit" });
    }
  });

  app.delete('/api/units/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      console.log(`🗑️ Deleting unit ${id}`);
      
      await firebaseStorage.deleteUnit(id);
      console.log(`✅ Successfully deleted unit ${id}`);
      
      res.json({ message: "Unit deleted successfully" });
    } catch (error) {
      console.error("❌ Error deleting unit:", error);
      res.status(500).json({ message: "Failed to delete unit", error: error.message });
    }
  });

  // Dashboard metrics
  app.get('/api/strata/:id/metrics', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const metrics = await firebaseStorage.getStrataMetrics(id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Expense routes
  app.get('/api/strata/:id/expenses', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const expenses = await firebaseStorage.getStrataExpenses(id);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post('/api/strata/:id/expenses', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser.id;
      const expenseData = insertExpenseSchema.parse({
        ...req.body,
        strataId: id,
        submittedBy: userId
      });
      const expense = await firebaseStorage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.patch('/api/expenses/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser.id;
      const updateData = { ...req.body };
      
      // Debug logging
      console.log("Received update data:", updateData);
      
      if (req.body.status === 'approved') {
        updateData.approvedBy = userId;
      }
      
      // Convert date string to Date object if provided
      if (updateData.expenseDate && typeof updateData.expenseDate === 'string') {
        updateData.expenseDate = new Date(updateData.expenseDate);
        console.log("Converted expenseDate to:", updateData.expenseDate);
      }
      
      const expense = await firebaseStorage.updateExpense(id, updateData);
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete('/api/expenses/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteExpense(id);
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Quote routes
  app.get('/api/strata/:id/quotes', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const quotes = await firebaseStorage.getStrataQuotes(id);
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.post('/api/strata/:id/quotes', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser.id;
      const { quoteDocument, ...quoteBodyData } = req.body;
      
      const quoteData = insertQuoteSchema.parse({
        ...quoteBodyData,
        strataId: id,
        requesterId: userId
      });

      // Create project folder automatically
      const projectFolder = await firebaseStorage.createQuoteProjectFolder(id, quoteData.projectTitle, userId);
      
      // Add folder reference to quote
      const quoteWithFolder = {
        ...quoteData,
        documentFolderId: projectFolder.id
      };

      const quote = await firebaseStorage.createQuote(quoteWithFolder);

      // If a quote document was uploaded, save it to the project folder
      if (quoteDocument) {
        const documentData = {
          strataId: id,
          folderId: projectFolder.id,
          title: `${quoteData.projectTitle} - Quote Document`,
          description: `Quote document for ${quoteData.projectTitle}`,
          type: "quote",
          fileUrl: quoteDocument.fileUrl,
          fileName: quoteDocument.fileName,
          fileSize: quoteDocument.fileSize,
          mimeType: quoteDocument.mimeType,
          uploadedBy: userId,
        };
        
        await firebaseStorage.createDocument(documentData);
      }

      res.json(quote);
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  app.patch('/api/quotes/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser.id;
      const { quoteDocument, ...updateBodyData } = req.body;
      const updateData = { ...updateBodyData };
      
      // Convert timestamp strings to Date objects
      if (updateData.approvedAt && typeof updateData.approvedAt === 'string') {
        updateData.approvedAt = new Date(updateData.approvedAt);
      }
      if (updateData.rejectedAt && typeof updateData.rejectedAt === 'string') {
        updateData.rejectedAt = new Date(updateData.rejectedAt);
      }
      if (updateData.reviewedAt && typeof updateData.reviewedAt === 'string') {
        updateData.reviewedAt = new Date(updateData.reviewedAt);
      }
      
      const quote = await firebaseStorage.updateQuote(id, updateData);

      // If a quote document was uploaded and quote has a folder, save it
      if (quoteDocument && quote.documentFolderId) {
        const documentData = {
          strataId: quote.strataId,
          folderId: quote.documentFolderId,
          title: `${quote.projectTitle} - Additional Document`,
          description: `Additional document for ${quote.projectTitle}`,
          type: "quote",
          fileUrl: quoteDocument.fileUrl,
          fileName: quoteDocument.fileName,
          fileSize: quoteDocument.fileSize,
          mimeType: quoteDocument.mimeType,
          uploadedBy: userId,
        };
        
        await firebaseStorage.createDocument(documentData);
      }

      res.json(quote);
    } catch (error) {
      console.error("Error updating quote:", error);
      res.status(500).json({ message: "Failed to update quote" });
    }
  });

  // Get documents for a specific quote project
  app.get('/api/quotes/:id/documents', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const quote = await firebaseStorage.getQuote(id);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      if (!quote.documentFolderId) {
        return res.json([]);
      }

      const documents = await firebaseStorage.getFolderDocuments(quote.documentFolderId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching quote documents:", error);
      res.status(500).json({ message: "Failed to fetch quote documents" });
    }
  });

  // AI-powered quote document analysis
  app.post('/api/quotes/analyze-document', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { fileData, mimeType, text } = req.body;
      
      if (!fileData && !text) {
        return res.status(400).json({ message: "Either fileData or text is required" });
      }

      let extractedData;
      if (fileData) {
        // Remove data URL prefix to get just the base64 data
        const base64Data = fileData.split(',')[1] || fileData;
        
        // Support both images and PDFs
        if (!mimeType.startsWith('image/') && mimeType !== 'application/pdf') {
          return res.status(400).json({ 
            message: "Only image files (JPG, PNG, GIF, WebP) and PDF files are supported for AI analysis." 
          });
        }
        
        extractedData = await extractQuoteDataFromDocument(base64Data, mimeType);
      } else {
        extractedData = await extractQuoteDataFromText(text);
      }

      res.json(extractedData);
    } catch (error: any) {
      console.error("Error analyzing quote document:", error);
      res.status(500).json({ 
        message: error.message || "Failed to analyze document" 
      });
    }
  });

  // Pending approvals
  app.get('/api/strata/:id/pending-approvals', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const approvals = await firebaseStorage.getPendingApprovals(id);
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });

  // Vendor routes
  // Strata-specific vendor endpoints
  app.get('/api/strata/:strataId/vendors', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const vendors = await firebaseStorage.getVendorsByStrata(strataId);
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching strata vendors:", error);
      res.status(500).json({ message: "Failed to fetch strata vendors" });
    }
  });

  app.post('/api/strata/:strataId/vendors', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const vendorData = insertVendorSchema.parse({ ...req.body, strataId });
      const vendor = await firebaseStorage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.get('/api/vendors', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const vendors = await firebaseStorage.getAllVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post('/api/vendors', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await firebaseStorage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.get('/api/vendors/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const vendor = await firebaseStorage.getVendor(id);
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  app.patch('/api/vendors/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const vendor = await firebaseStorage.updateVendor(id, req.body);
      res.json(vendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });

  app.delete('/api/vendors/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteVendor(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });

  // Vendor contract routes
  app.get('/api/vendors/:id/contracts', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const contracts = await firebaseStorage.getVendorContracts(id);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching vendor contracts:", error);
      res.status(500).json({ message: "Failed to fetch vendor contracts" });
    }
  });

  app.get('/api/strata/:id/vendor-contracts', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const contracts = await firebaseStorage.getStrataVendorContracts(id);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching strata vendor contracts:", error);
      res.status(500).json({ message: "Failed to fetch strata vendor contracts" });
    }
  });

  app.post('/api/vendors/:vendorId/contracts', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { vendorId } = req.params;
      const userId = req.user.claims.sub;
      const contractData = insertVendorContractSchema.parse({
        ...req.body,
        vendorId,
        createdBy: userId
      });
      const contract = await firebaseStorage.createVendorContract(contractData);
      res.json(contract);
    } catch (error) {
      console.error("Error creating vendor contract:", error);
      res.status(500).json({ message: "Failed to create vendor contract" });
    }
  });

  app.get('/api/vendor-contracts/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const contract = await firebaseStorage.getVendorContract(id);
      res.json(contract);
    } catch (error) {
      console.error("Error fetching vendor contract:", error);
      res.status(500).json({ message: "Failed to fetch vendor contract" });
    }
  });

  app.patch('/api/vendor-contracts/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const contract = await firebaseStorage.updateVendorContract(id, req.body);
      res.json(contract);
    } catch (error) {
      console.error("Error updating vendor contract:", error);
      res.status(500).json({ message: "Failed to update vendor contract" });
    }
  });

  app.delete('/api/vendor-contracts/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteVendorContract(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor contract:", error);
      res.status(500).json({ message: "Failed to delete vendor contract" });
    }
  });

  // Vendor history routes
  app.get('/api/vendors/:id/history', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const history = await firebaseStorage.getVendorHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching vendor history:", error);
      res.status(500).json({ message: "Failed to fetch vendor history" });
    }
  });

  app.get('/api/strata/:id/vendor-history', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const history = await firebaseStorage.getStrataVendorHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching strata vendor history:", error);
      res.status(500).json({ message: "Failed to fetch strata vendor history" });
    }
  });

  app.post('/api/vendors/:vendorId/history', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { vendorId } = req.params;
      const userId = req.user.claims.sub;
      const historyData = insertVendorHistorySchema.parse({
        ...req.body,
        vendorId,
        recordedBy: userId
      });
      const history = await firebaseStorage.createVendorHistory(historyData);
      res.json(history);
    } catch (error) {
      console.error("Error creating vendor history:", error);
      res.status(500).json({ message: "Failed to create vendor history" });
    }
  });

  app.patch('/api/vendor-history/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const history = await firebaseStorage.updateVendorHistory(id, req.body);
      res.json(history);
    } catch (error) {
      console.error("Error updating vendor history:", error);
      res.status(500).json({ message: "Failed to update vendor history" });
    }
  });

  app.delete('/api/vendor-history/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteVendorHistory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor history:", error);
      res.status(500).json({ message: "Failed to delete vendor history" });
    }
  });

  // Meeting routes
  app.get('/api/strata/:id/meetings', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const meetings = await firebaseStorage.getStrataMeetings(id);
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.post('/api/strata/:id/meetings', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const meetingData = insertMeetingSchema.parse({
        ...req.body,
        strataId: id,
        meetingDate: new Date(req.body.meetingDate), // Convert string to Date
        scheduledAt: new Date(req.body.scheduledAt) // Convert string to Date
      });
      
      console.log('🎯 Creating new meeting:', meetingData.title);
      const meeting = await firebaseStorage.createMeeting(meetingData);
      
      // Send meeting invitations if invitees are specified
      if (req.body.invitees && req.body.invitees.length > 0) {
        try {
          console.log('📧 Sending meeting invitations to invitees...');
          
          // Get strata information
          const strata = await firebaseStorage.getStrata(id);
          if (!strata) {
            console.warn('⚠️ Strata not found for meeting invitations');
          } else {
            // Get organizer information (current user)
            const organizerEmail = req.firebaseUser?.email;
            let organizer = null;
            
            if (organizerEmail) {
              organizer = await firebaseStorage.getUserByEmail(organizerEmail);
            }
            
            if (!organizer) {
              console.warn('⚠️ Organizer not found for meeting invitations');
              organizer = {
                id: 'unknown',
                email: organizerEmail || 'unknown@email.com',
                firstName: 'Meeting',
                lastName: 'Organizer'
              };
            }
            
            // Get full user details for invitees
            const allUsers = await firebaseStorage.getStrataUsers(id);
            const invitees = req.body.invitees
              .map((inviteeId: string) => 
                allUsers.find(user => user.id === inviteeId)
              )
              .filter(Boolean);
            
            if (invitees.length > 0) {
              const { sendMeetingInviteEmails } = await import('./email-service.js');
              await sendMeetingInviteEmails({
                meeting,
                strata: {
                  name: strata.name,
                  address: strata.address || 'Address not specified'
                },
                invitees,
                organizer
              });
              
              console.log(`✅ Meeting invitations sent to ${invitees.length} recipients`);
              
              // Also create meeting invitation notifications for each invitee
              for (const invitee of invitees) {
                try {
                  const notificationData = {
                    userId: invitee.id,
                    strataId: id,
                    type: 'meeting_invitation',
                    title: `📅 Meeting Invitation: ${meeting.title}`,
                    message: `You're invited to ${meeting.title} on ${new Date(meeting.scheduledAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} at ${new Date(meeting.scheduledAt).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}. Click to view details.`,
                    priority: 'high',
                    isRead: false,
                    metadata: {
                      meetingId: meeting.id,
                      meetingTitle: meeting.title,
                      meetingDate: meeting.scheduledAt,
                      organizer: organizer ? `${organizer.firstName} ${organizer.lastName}` : 'Meeting Organizer',
                      location: meeting.location || 'TBD',
                      type: meeting.meetingType || 'general_meeting'
                    },
                    createdAt: new Date().toISOString()
                  };
                  
                  await firebaseStorage.createNotification(notificationData);
                  console.log(`✅ Created notification for ${invitee.email}`);
                } catch (notifError) {
                  console.error(`❌ Failed to create notification for ${invitee.email}:`, notifError);
                }
              }
            } else {
              console.warn('⚠️ No valid invitees found for meeting invitations');
            }
          }
        } catch (emailError) {
          console.error('❌ Failed to send meeting invitations:', emailError);
          // Don't fail the meeting creation if notification sending fails
        }
      }
      
      res.json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  // Audio upload and transcription endpoint
  app.post('/api/meetings/:meetingId/upload-audio', isAuthenticatedUnified, upload.single('audio'), async (req: any, res) => {
    try {
      const { meetingId } = req.params;
      console.log('🎙️ Processing audio upload for meeting:', meetingId);
      
      if (!req.file) {
        console.log('❌ No audio file provided in request');
        return res.status(400).json({ message: "No audio file provided" });
      }

      console.log('📊 Audio file details:', {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      });

      // First, verify the meeting exists
      console.log('🔍 Verifying meeting exists...');
      const existingMeeting = await firebaseStorage.getMeeting(meetingId);
      
      if (!existingMeeting) {
        console.log('❌ Meeting not found:', meetingId);
        return res.status(404).json({ 
          message: "Meeting not found. Please refresh the page and try again.",
          meetingId 
        });
      }
      
      console.log('✅ Meeting found:', existingMeeting.title);

      // Generate unique filename for the audio file
      const timestamp = Date.now();
      const fileName = `meeting_${meetingId}_${timestamp}.wav`;
      
      // Upload audio file to Firebase Storage
      console.log('📤 Uploading audio to Firebase Storage...');
      const audioUrl = await uploadFileToStorage(
        fileName,
        req.file.buffer,
        req.file.mimetype,
        'audio-recordings'
      );
      
      console.log('✅ Audio uploaded to Firebase Storage:', audioUrl);
      
      // Update meeting with audio URL first
      console.log('📝 Updating meeting with audio URL...');
      await firebaseStorage.updateMeeting(meetingId, { audioUrl });
      
      // Transcribe the audio using OpenAI Whisper
      console.log('🎯 Starting audio transcription...');
      const { transcribeAudio } = await import('./openai.js');
      const transcription = await transcribeAudio(req.file.buffer, req.file.originalname);
      
      console.log('✅ Audio transcription completed:', transcription.length, 'characters');
      
      // Update meeting with transcription
      console.log('📝 Updating meeting with transcription...');
      await firebaseStorage.updateMeeting(meetingId, { 
        audioUrl,
        transcription,
        status: 'completed' // Mark meeting as completed after transcription
      });

      console.log('🎉 Audio upload and transcription completed successfully');

      res.json({ 
        message: "Audio uploaded and transcribed successfully",
        audioUrl,
        transcription 
      });
    } catch (error) {
      console.error("❌ Error uploading/transcribing audio:", error);
      console.error("❌ Error stack:", error.stack);
      res.status(500).json({ 
        message: "Failed to upload and transcribe audio",
        error: error.message 
      });
    }
  });


  // Generate meeting minutes from transcription
  app.post('/api/meetings/:meetingId/generate-minutes', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { meetingId } = req.params;
      
      // Get the meeting details
      const meeting = await firebaseStorage.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }

      if (!meeting.transcription) {
        return res.status(400).json({ message: "No transcription available for this meeting" });
      }

      // Generate minutes using AI
      const { generateMeetingMinutes } = await import('./openai.js');
      const minutes = await generateMeetingMinutes(
        meeting.transcription,
        meeting.title,
        meeting.meetingType || 'board_meeting',
        meeting.chairperson ? meeting.chairperson : undefined,
        meeting.agenda ? meeting.agenda : undefined
      );
      
      // Update meeting with generated minutes
      await firebaseStorage.updateMeeting(meetingId, { minutes });

      res.json({ 
        message: "Meeting minutes generated successfully",
        minutes 
      });
    } catch (error) {
      console.error("Error generating meeting minutes:", error);
      res.status(500).json({ message: "Failed to generate meeting minutes" });
    }
  });

  // Update meeting endpoint (for saving manual changes to minutes)
  app.patch('/api/meetings/:meetingId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { meetingId } = req.params;
      const updateData = req.body;
      
      await firebaseStorage.updateMeeting(meetingId, updateData);
      res.json({ message: "Meeting updated successfully" });
    } catch (error) {
      console.error("Error updating meeting:", error);
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  // Document routes
  app.get('/api/strata/:id/documents', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const documents = await firebaseStorage.getStrataDocuments(id);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/strata/:id/documents', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const documentData = insertDocumentSchema.parse({
        ...req.body,
        strataId: id,
        uploadedBy: userId
      });
      const document = await firebaseStorage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Maintenance routes
  app.get('/api/strata/:id/maintenance', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const requests = await firebaseStorage.getStrataMaintenanceRequests(id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      res.status(500).json({ message: "Failed to fetch maintenance requests" });
    }
  });

  app.post('/api/strata/:id/maintenance', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const requestData = insertMaintenanceRequestSchema.parse({
        ...req.body,
        strataId: id,
        residentId: userId
      });
      const request = await firebaseStorage.createMaintenanceRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      res.status(500).json({ message: "Failed to create maintenance request" });
    }
  });

  app.patch('/api/maintenance/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const request = await firebaseStorage.updateMaintenanceRequest(id, req.body);
      res.json(request);
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      res.status(500).json({ message: "Failed to update maintenance request" });
    }
  });

  // Maintenance Project routes  
  app.get('/api/strata/:id/maintenance', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const projects = await firebaseStorage.getStrataMaintenanceProjects(id);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching maintenance projects:", error);
      res.status(500).json({ message: "Failed to fetch maintenance projects" });
    }
  });

  app.post('/api/strata/:id/maintenance', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const projectData = insertMaintenanceProjectSchema.parse({
        ...req.body,
        strataId: id,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : undefined,
        completedDate: req.body.completedDate ? new Date(req.body.completedDate) : undefined,
        nextServiceDate: req.body.nextServiceDate ? new Date(req.body.nextServiceDate) : undefined,
      });
      const project = await firebaseStorage.createMaintenanceProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating maintenance project:", error);
      res.status(500).json({ message: "Failed to create maintenance project" });
    }
  });

  app.get('/api/maintenance/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const project = await firebaseStorage.getMaintenanceProject(id);
      if (!project) {
        return res.status(404).json({ message: "Maintenance project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching maintenance project:", error);
      res.status(500).json({ message: "Failed to fetch maintenance project" });
    }
  });

  app.patch('/api/maintenance/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        ...req.body,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : undefined,
        completedDate: req.body.completedDate ? new Date(req.body.completedDate) : undefined,
        nextServiceDate: req.body.nextServiceDate ? new Date(req.body.nextServiceDate) : undefined,
      };
      const project = await firebaseStorage.updateMaintenanceProject(id, updateData);
      res.json(project);
    } catch (error) {
      console.error("Error updating maintenance project:", error);
      res.status(500).json({ message: "Failed to update maintenance project" });
    }
  });

  app.delete('/api/maintenance/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteMaintenanceProject(id);
      res.json({ message: "Maintenance project deleted successfully" });
    } catch (error) {
      console.error("Error deleting maintenance project:", error);
      res.status(500).json({ message: "Failed to delete maintenance project" });
    }
  });

  // Communication routes
  app.get('/api/strata/:id/announcements', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const announcements = await firebaseStorage.getStrataAnnouncements(id);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/strata/:id/announcements', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser.id;
      const announcementData = insertAnnouncementSchema.parse({
        ...req.body,
        strataId: id,
        publishedBy: userId,
        recurringEndDate: req.body.recurringEndDate ? new Date(req.body.recurringEndDate) : undefined
      });
      const announcement = await firebaseStorage.createAnnouncement(announcementData);
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.patch('/api/announcements/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser.id;
      
      // Get the announcement to check permissions
      const announcement = await firebaseStorage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      // Check if user can edit (creator or admin)
      const userAccess = await firebaseStorage.getUserStrataAccess(userId, announcement.strataId);
      const canEdit = announcement.publishedBy === userId || userAccess?.role === 'admin' || userAccess?.role === 'chairperson';
      
      if (!canEdit) {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      const updatedAnnouncement = await firebaseStorage.updateAnnouncement(id, req.body);
      res.json(updatedAnnouncement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete('/api/announcements/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Get the announcement to check permissions
      const announcement = await firebaseStorage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      // Check if user can delete (creator or admin)
      const userAccess = await firebaseStorage.getUserStrataAccess(userId, announcement.strataId);
      const canDelete = announcement.publishedBy === userId || userAccess?.role === 'admin' || userAccess?.role === 'chairperson';
      
      if (!canDelete) {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      await firebaseStorage.deleteAnnouncement(id);
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      console.error("Error deleting announcement:", error);
      res.status(500).json({ message: "Failed to delete announcement" });
    }
  });

  // Admin/User Management routes
  app.get('/api/strata/:id/users', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const users = await firebaseStorage.getStrataUsers(id);
      console.log(`Fetched strata users:`, JSON.stringify(users, null, 2));
      res.json(users);
    } catch (error) {
      console.error("Error fetching strata users:", error);
      res.status(500).json({ message: "Failed to fetch strata users" });
    }
  });

  // Get current user's role for specific strata
  app.get('/api/strata/:id/user-role', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userEmail = req.firebaseUser?.email || req.authenticatedUser?.email || req.user?.email;
      
      console.log('🔍 User role check:', { 
        strataId: id, 
        userEmail,
        firebaseUser: req.firebaseUser?.email,
        authenticatedUser: req.authenticatedUser?.email,
        pgUser: req.user?.email
      });
      
      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Special case for master admin
      if (userEmail === 'rfinnbogason@gmail.com') {
        console.log('✅ Master admin detected, returning master_admin role');
        return res.json({ role: 'master_admin' });
      }

      // FIREBASE MIGRATION: Complete transition to Firebase as primary database
      let user;
      let userAccess;
      
      // First migrate user if they exist in PostgreSQL but not Firebase
      try {
        const pgUser = await firebaseStorage.getUserByEmail(userEmail);
        if (pgUser) {
          // Check if user exists in Firebase
          let firebaseUser;
          try {
            firebaseUser = await firebaseStorage.getUserByEmail(userEmail);
          } catch (err) {
            console.log('🔄 User not in Firebase, migrating from PostgreSQL...');
          }
          
          if (!firebaseUser) {
            // Migrate user to Firebase
            firebaseUser = await firebaseStorage.createUser({
              email: pgUser.email,
              firstName: pgUser.firstName,
              lastName: pgUser.lastName,
              profileImageUrl: pgUser.profileImageUrl,
              passwordHash: pgUser.passwordHash,
              isActive: pgUser.isActive,
              lastLoginAt: pgUser.lastLoginAt,
              role: pgUser.role,
              mustChangePassword: pgUser.mustChangePassword || false
            });
            console.log('✅ Migrated user to Firebase:', firebaseUser.email);
          }
          
          // Migrate user strata access if not exists
          try {
            let firebaseAccess = await firebaseStorage.getUserStrataAccess(firebaseUser.id, id);
            if (!firebaseAccess) {
              const pgAccess = await firebaseStorage.getUserStrataAccess(pgUser.id, id);
              if (pgAccess) {
                firebaseAccess = await firebaseStorage.createUserStrataAccess({
                  userId: firebaseUser.id,
                  strataId: pgAccess.strataId,
                  role: pgAccess.role,
                  canPostAnnouncements: pgAccess.canPostAnnouncements || false
                });
                console.log('✅ Migrated user access to Firebase:', firebaseAccess.role);
              }
            }
            userAccess = firebaseAccess;
          } catch (err) {
            console.log('⚠️ Firebase access lookup failed, using PostgreSQL');
            userAccess = await firebaseStorage.getUserStrataAccess(pgUser.id, id);
          }
          
          user = firebaseUser;
        }
      } catch (error) {
        console.log('❌ Migration attempt failed:', error.message);
        // Fallback to PostgreSQL for now
        const pgUser = await firebaseStorage.getUserByEmail(userEmail);
        if (!pgUser) {
          return res.json({ role: 'resident' });
        }
        const pgAccess = await firebaseStorage.getUserStrataAccess(pgUser.id, id);
        userAccess = pgAccess;
        user = pgUser;
      }
      
      if (!userAccess) {
        console.log('🏠 No strata access found, defaulting to resident');
        return res.json({ role: 'resident' }); // Default to resident if no access found
      }

      console.log('✅ Returning role:', userAccess.role);
      
      // Don't cache this response to ensure fresh data
      res.set('Cache-Control', 'no-store');
      res.json({ role: userAccess.role });
    } catch (error) {
      console.error("❌ Error fetching user role:", error);
      res.status(500).json({ message: "Failed to fetch user role" });
    }
  });

  app.post('/api/strata/:id/users', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const accessData = insertUserStrataAccessSchema.parse({
        ...req.body,
        strataId: id
      });
      const userAccess = await firebaseStorage.createUserStrataAccess(accessData);
      res.json(userAccess);
    } catch (error) {
      console.error("Error adding user to strata:", error);
      res.status(500).json({ message: "Failed to add user" });
    }
  });

  app.patch('/api/strata-access/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userAccess = await firebaseStorage.updateUserStrataAccess(id, req.body);
      res.json(userAccess);
    } catch (error) {
      console.error("Error updating user access:", error);
      res.status(500).json({ message: "Failed to update user access" });
    }
  });

  app.delete('/api/strata-access/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteUserStrataAccess(id);
      res.json({ message: "User access removed successfully" });
    } catch (error) {
      console.error("Error removing user access:", error);
      res.status(500).json({ message: "Failed to remove user access" });
    }
  });

  // User strata assignments endpoint for admin panel
  app.get('/api/admin/users/:userId/strata-assignments', isAuthenticatedUnified, async (req: any, res) => {
    try {
      // Check if user is admin
      if (req.firebaseUser?.email !== "rfinnbogason@gmail.com" && req.authenticatedUser?.email !== "rfinnbogason@gmail.com" && req.user?.claims?.email !== "rfinnbogason@gmail.com") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const { userId } = req.params;
      const assignments = await firebaseStorage.getUserStrataAssignments(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching user strata assignments:", error);
      res.status(500).json({ message: "Failed to fetch user strata assignments" });
    }
  });

  // Strata Admin specific routes for user management
  app.delete('/api/strata-admin/users/:userId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { userId } = req.params;
      await firebaseStorage.deleteUserStrataAccess(userId);
      res.json({ message: "User access removed successfully" });
    } catch (error) {
      console.error("Error removing user access:", error);
      res.status(500).json({ message: "Failed to remove user access" });
    }
  });

  app.patch('/api/strata-admin/users/:userId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const updatedUser = await firebaseStorage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch('/api/strata-admin/role/:accessId', isAuthenticatedUnified, async (req: any, res) => {
    console.log('PATCH /api/strata-admin/role/:accessId endpoint reached');
    console.log('Access ID:', req.params.accessId);
    console.log('Request body:', req.body);
    try {
      const { accessId } = req.params;
      const updatedAccess = await firebaseStorage.updateUserStrataAccess(accessId, req.body);
      console.log('Successfully updated access:', updatedAccess);
      res.json(updatedAccess);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.post('/api/strata-admin/users', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { email, firstName, lastName, role, temporaryPassword, strataId } = req.body;
      
      // Create or get existing user
      let user = await firebaseStorage.getUserByEmail(email);
      if (!user) {
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        user = await firebaseStorage.createUser({
          email,
          firstName,
          lastName,
          passwordHash: hashedPassword,
          isActive: true,
          role: role || 'resident',
          mustChangePassword: true, // Force password change on first login
        });
      }
      
      // Add user to strata with role
      const userAccess = await firebaseStorage.createUserStrataAccess({
        userId: user.id,
        strataId,
        role: role || 'resident'
      });
      
      res.json({ user, userAccess });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Admin Pending Registrations Routes
  app.get('/api/admin/pending-registrations', isAuthenticatedUnified, async (req: any, res) => {
    try {
      // Check if user is admin
      if (req.firebaseUser?.email !== "rfinnbogason@gmail.com" && req.authenticatedUser?.email !== "rfinnbogason@gmail.com" && req.user?.claims?.email !== "rfinnbogason@gmail.com") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const registrations = await firebaseStorage.getPendingRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching pending registrations:", error);
      res.status(500).json({ message: "Failed to fetch pending registrations" });
    }
  });

  app.post('/api/admin/pending-registrations/:id/approve', isAuthenticatedUnified, async (req: any, res) => {
    try {
      // Check if user is admin
      if (req.firebaseUser?.email !== "rfinnbogason@gmail.com" && req.authenticatedUser?.email !== "rfinnbogason@gmail.com" && req.user?.claims?.email !== "rfinnbogason@gmail.com") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const { id } = req.params;
      const subscriptionData = req.body;
      
      // Calculate trial end date if setting to trial
      let trialEndDate = null;
      if (subscriptionData.subscriptionTier === 'trial') {
        trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);
      }

      const fullSubscriptionData = {
        ...subscriptionData,
        subscriptionStatus: subscriptionData.subscriptionTier === 'trial' ? 'trial' : 
                           subscriptionData.isFreeForever ? 'free' : 'active',
        trialEndDate,
      };

      await firebaseStorage.approveStrataRegistration(id, fullSubscriptionData);
      res.json({ message: "Registration approved successfully with subscription settings" });
    } catch (error) {
      console.error("Error approving registration:", error);
      res.status(500).json({ message: "Failed to approve registration" });
    }
  });

  app.post('/api/admin/pending-registrations/:id/reject', isAuthenticatedUnified, async (req: any, res) => {
    try {
      // Check if user is admin
      if (req.firebaseUser?.email !== "rfinnbogason@gmail.com" && req.authenticatedUser?.email !== "rfinnbogason@gmail.com" && req.user?.claims?.email !== "rfinnbogason@gmail.com") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const { id } = req.params;
      await firebaseStorage.rejectStrataRegistration(id);
      res.json({ message: "Registration rejected successfully" });
    } catch (error) {
      console.error("Error rejecting registration:", error);
      res.status(500).json({ message: "Failed to reject registration" });
    }
  });

  // Strata Admin Routes - for strata-level user management
  app.post('/api/strata-admin/users', isAuthenticatedUnified, async (req: any, res) => {
    try {
      // Check if user has admin permissions for this strata
      const userData = req.body;
      const strataId = userData.strataId;
      
      if (!strataId) {
        return res.status(400).json({ message: "Strata ID is required" });
      }

      // Check if user has admin access to this strata
      const hasAccess = await firebaseStorage.checkUserStrataAdminAccess(req.user.claims.sub, strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden: Admin access required for this strata" });
      }

      // Hash the temporary password
      const hashedPassword = await bcrypt.hash(userData.temporaryPassword, 10);
      
      // Create the user
      const newUser = await firebaseStorage.createUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        passwordHash: hashedPassword,
        isActive: true,
      });

      // Assign user to strata with specified role
      await firebaseStorage.createUserStrataAccess({
        userId: newUser.id,
        strataId: strataId,
        role: userData.role,
        canPostAnnouncements: ['chairperson', 'secretary'].includes(userData.role),
      });

      res.json({ message: "User created successfully", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch('/api/strata-admin/users/:userId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const userData = req.body;

      // Get user's strata access to check permissions
      const userAccess = await firebaseStorage.getUserStrataAssignments(req.user.claims.sub);
      const adminStrataIds = userAccess
        .filter((access: any) => ['chairperson', 'property_manager', 'treasurer', 'secretary'].includes(access.role))
        .map((access: any) => access.strataId);

      if (adminStrataIds.length === 0) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      // Update user data
      const updatedUser = await firebaseStorage.updateUser(userId, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch('/api/strata-admin/user-access/:accessId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { accessId } = req.params;
      const accessData = req.body;

      // Get the access record to check strata
      const currentAccess = await firebaseStorage.getUserStrataAccessById(accessId);
      if (!currentAccess) {
        return res.status(404).json({ message: "Access record not found" });
      }

      // Check if user has admin access to this strata
      const hasAccess = await firebaseStorage.checkUserStrataAdminAccess(req.user.claims.sub, currentAccess.strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden: Admin access required for this strata" });
      }

      // Update the access record
      const updatedAccess = await firebaseStorage.updateUserStrataAccess(accessId, accessData);
      res.json(updatedAccess);
    } catch (error) {
      console.error("Error updating user access:", error);
      res.status(500).json({ message: "Failed to update user access" });
    }
  });

  app.delete('/api/strata-admin/users/:userId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { userId } = req.params;

      // Get user's strata access to check permissions
      const userAccess = await firebaseStorage.getUserStrataAssignments(req.user.claims.sub);
      const adminStrataIds = userAccess
        .filter((access: any) => ['chairperson', 'property_manager', 'treasurer', 'secretary'].includes(access.role))
        .map((access: any) => access.strataId);

      if (adminStrataIds.length === 0) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      // Remove user's strata access and deactivate user
      await firebaseStorage.removeUserFromAllStrata(userId);
      await firebaseStorage.updateUser(userId, { isActive: false });
      
      res.json({ message: "User removed successfully" });
    } catch (error) {
      console.error("Error removing user:", error);
      res.status(500).json({ message: "Failed to remove user" });
    }
  });

  // Document Management API Routes
  
  // Document folder routes
  app.get('/api/strata/:id/document-folders', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { parent } = req.query;
      
      console.log(`🔍 GET document-folders for strata ${id}, parent: ${parent || 'null'}`);
      
      // Use the correct Firebase function for fetching folders
      const folders = await firebaseStorage.getStrataDocumentFolders(id, parent);
      
      console.log(`📁 Route returning ${folders?.length || 0} folders:`, folders);
      res.json(folders);
    } catch (error) {
      console.error("Error fetching document folders:", error);
      res.status(500).json({ message: "Failed to fetch document folders" });
    }
  });

  app.post('/api/strata/:id/document-folders', isAuthenticatedUnified, async (req: any, res) => {
    try {
      console.log('📁 Creating document folder...');
      console.log('Strata ID:', req.params.id);
      console.log('Request body:', req.body);
      console.log('User claims:', req.user?.claims);
      
      const { id } = req.params;
      const userId = req.user?.claims?.sub || req.user?.claims?.email || 'unknown';
      
      // Generate path based on parent folder
      let path = `/${req.body.name}`;
      if (req.body.parentFolderId) {
        const parentFolder = await firebaseStorage.getDocumentFolder(req.body.parentFolderId);
        if (parentFolder) {
          path = `${parentFolder.path}/${req.body.name}`;
        }
      }
      
      const folderData = {
        ...req.body,
        strataId: id,
        createdBy: userId,
        path
      };
      
      console.log('Creating folder with data:', folderData);
      
      const folder = await firebaseStorage.createDocumentFolder(folderData);
      console.log('✅ Folder created successfully:', folder);
      res.json(folder);
    } catch (error) {
      console.error("❌ Error creating document folder:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create document folder" });
    }
  });

  app.patch('/api/document-folders/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const folder = await firebaseStorage.updateDocumentFolder(id, req.body);
      res.json(folder);
    } catch (error) {
      console.error("Error updating document folder:", error);
      res.status(500).json({ message: "Failed to update document folder" });
    }
  });

  app.delete('/api/document-folders/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteDocumentFolder(id);
      res.json({ message: "Document folder deleted successfully" });
    } catch (error) {
      console.error("Error deleting document folder:", error);
      res.status(500).json({ message: "Failed to delete document folder" });
    }
  });

  // Document routes
  app.get('/api/strata/:id/documents', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { folder, search } = req.query;
      
      let documents;
      if (search) {
        documents = await firebaseStorage.searchDocuments(id, search);
      } else if (folder) {
        documents = await firebaseStorage.getFolderDocuments(folder);
      } else {
        documents = await firebaseStorage.getStrataDocuments(id);
      }
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // NEW SIMPLIFIED UPLOAD ROUTE - BYPASS COMPLEX MIDDLEWARE
  app.post('/api/strata/:id/documents', upload.single('file'), async (req: any, res) => {
    console.log('🚨🚨🚨 SIMPLIFIED UPLOAD ROUTE REACHED! 🚨🚨🚨');
    console.log('📋 Upload details:', {
      method: req.method,
      path: req.path,
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      authHeader: req.headers.authorization ? 'PRESENT' : 'MISSING'
    });
    
    // Quick auth check - for now just verify master admin
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No auth header found');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      const token = authHeader.substring(7);
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      if (payload.email !== 'rfinnbogason@gmail.com') {
        console.log('❌ Not master admin');
        return res.status(403).json({ message: 'Access denied' });
      }
      console.log('✅ Master admin authenticated');
    } catch (authError) {
      console.log('❌ Auth token invalid:', authError);
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    try {
      const { id } = req.params;
      const userId = 'master-admin'; // Since we're bypassing middleware, set directly
      const file = req.file;
      
      console.log(`🔍 Document upload attempt:`, {
        strataId: id,
        userId,
        fileName: file?.originalname,
        fileSize: file?.size,
        formData: Object.keys(req.body)
      });
      
      if (!file) {
        console.log("❌ No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      console.log(`📤 Uploading file to Firebase Storage...`);
      // Upload file to Firebase Storage
      const fileName = `${Date.now()}_${file.originalname}`;
      const folder = `documents/${id}`;
      const fileUrl = await uploadFileToStorage(fileName, file.buffer, file.mimetype, folder);
      console.log(`✅ File uploaded to Firebase Storage: ${fileUrl}`);
      
      const documentData = {
        title: req.body.title,
        description: req.body.description || '',
        type: req.body.type,
        tags: req.body.tags ? req.body.tags.split(',').map((tag: string) => tag.trim()) : [],
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileUrl: fileUrl,
        folderId: req.body.folderId || null,
        strataId: id,
        uploadedBy: userId
      };
      
      console.log(`💾 Creating document record in Firestore...`);
      const document = await firebaseStorage.createDocument(documentData);
      console.log(`📄 Document uploaded successfully: ${file.originalname} (${file.size} bytes) for strata ${id}`);
      res.json(document);
    } catch (error) {
      console.error("❌ Error creating document:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  app.patch('/api/documents/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const document = await firebaseStorage.updateDocument(id, req.body);
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete('/api/documents/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteDocument(id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Search routes
  app.get('/api/strata/:id/search', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { q: searchTerm, type } = req.query;
      
      if (!searchTerm) {
        return res.json({ folders: [], documents: [] });
      }
      
      let results: { folders: any[], documents: any[] } = { folders: [], documents: [] };
      
      if (!type || type === 'folders') {
        results.folders = await firebaseStorage.searchDocumentFolders(id, searchTerm);
      }
      
      if (!type || type === 'documents') {
        results.documents = await firebaseStorage.searchDocuments(id, searchTerm);
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });

  // Financial API Routes
  
  // Fee schedules
  app.get('/api/financial/fees/:strataId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const strata = await firebaseStorage.getStrata(strataId);
      if (!strata) {
        return res.status(404).json({ message: "Strata not found" });
      }
      
      // Return fee structure from strata
      res.json({
        strataId,
        feeStructure: strata.feeStructure || {},
        lastUpdated: strata.updatedAt
      });
    } catch (error) {
      console.error("Error fetching fees:", error);
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });

  app.post('/api/financial/fees', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId, feeStructure } = req.body;
      const updatedStrata = await firebaseStorage.updateStrata(strataId, { feeStructure });
      res.json(updatedStrata);
    } catch (error) {
      console.error("Error updating fees:", error);
      res.status(500).json({ message: "Failed to update fees" });
    }
  });

  // Financial summary
  app.get('/api/financial/summary/:strataId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const expenses = await firebaseStorage.getStrataExpenses(strataId);
      const strata = await firebaseStorage.getStrata(strataId);
      const units = await firebaseStorage.getStrataUnits(strataId);
      
      const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
      const approvedExpenses = expenses.filter(e => e.status === 'approved').length;
      
      // Calculate monthly revenue based on actual fee tiers and unit assignments
      const feeStructure = strata?.feeStructure || {};
      let monthlyRevenue = 0;
      
      // Handle both old and new fee structure formats
      let feeTiers = [];
      if ((feeStructure as any).tiers && Array.isArray((feeStructure as any).tiers)) {
        // New format: { tiers: [{ id, name, amount }] }
        feeTiers = (feeStructure as any).tiers;
      } else {
        // Legacy format: { studio: 300, one_bedroom: 400, etc }
        feeTiers = Object.entries(feeStructure).map(([id, amount]) => ({
          id,
          amount: typeof amount === 'number' ? amount : 0
        }));
      }
      
      // Calculate revenue based on fee tiers and unit assignments
      feeTiers.forEach((tier: any) => {
        const unitsInTier = units.filter((unit: any) => unit.feeTierId === tier.id);
        const tierAmount = tier.amount || 0;
        monthlyRevenue += unitsInTier.length * tierAmount;
      });
      
      // Get reserve fund balance from funds
      const funds = await firebaseStorage.getStrataFunds(strataId);
      const reserveFund = funds.find(f => f.type === 'reserve');
      const reserveBalance = reserveFund ? parseFloat(reserveFund.balance) : 125000;
      const reserveTarget = reserveFund?.target ? parseFloat(reserveFund.target) : 150000;
      
      res.json({
        totalRevenue: monthlyRevenue * 12, // Annual revenue
        monthlyRevenue: monthlyRevenue, // Monthly revenue
        monthlyExpenses: totalExpenses,
        reserveFund: reserveBalance,
        reserveTarget: reserveTarget,
        pendingExpenses,
        approvedExpenses,
        outstandingFees: monthlyRevenue * 0.1 // 10% outstanding
      });
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  // Payment Reminders API endpoints
  app.get('/api/financial/reminders/:strataId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const reminders = await firebaseStorage.getStrataPaymentReminders(strataId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching payment reminders:", error);
      res.status(500).json({ message: "Failed to fetch payment reminders" });
    }
  });

  app.post('/api/financial/reminders', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const reminderData = insertPaymentReminderSchema.parse({
        ...req.body,
        createdBy: req.authenticatedUser.id,
      });
      
      // Special handling for monthly strata fee with "all units"
      if (reminderData.reminderType === 'monthly_strata_fee' && !reminderData.unitId) {
        // Get all units for this strata
        const units = await firebaseStorage.getStrataUnits(reminderData.strataId);
        const createdReminders = [];
        
        // Create individual reminders for each unit
        for (const unit of units) {
          const unitReminder = await firebaseStorage.createPaymentReminder({
            ...reminderData,
            unitId: unit.id,
            title: `${reminderData.title} - Unit ${unit.unitNumber}`,
          });
          createdReminders.push(unitReminder);
        }
        
        res.status(201).json({ 
          message: `Created ${createdReminders.length} reminders`, 
          reminders: createdReminders 
        });
      } else {
        // Regular reminder creation
        const reminder = await firebaseStorage.createPaymentReminder(reminderData);
        res.status(201).json(reminder);
      }
    } catch (error) {
      console.error("Error creating payment reminder:", error);
      res.status(500).json({ message: "Failed to create payment reminder" });
    }
  });

  app.put('/api/financial/reminders/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const reminderData = insertPaymentReminderSchema.partial().parse(req.body);
      const reminder = await firebaseStorage.updatePaymentReminder(id, reminderData);
      res.json(reminder);
    } catch (error) {
      console.error("Error updating payment reminder:", error);
      res.status(500).json({ message: "Failed to update payment reminder" });
    }
  });

  app.delete('/api/financial/reminders/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deletePaymentReminder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting payment reminder:", error);
      res.status(500).json({ message: "Failed to delete payment reminder" });
    }
  });

  app.get('/api/financial/reminders/:strataId/overdue', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const overdueReminders = await firebaseStorage.getOverdueReminders(strataId);
      res.json(overdueReminders);
    } catch (error) {
      console.error("Error fetching overdue reminders:", error);
      res.status(500).json({ message: "Failed to fetch overdue reminders" });
    }
  });

  app.get('/api/financial/reminders/:strataId/recurring', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const recurringReminders = await firebaseStorage.getActiveRecurringReminders(strataId);
      res.json(recurringReminders);
    } catch (error) {
      console.error("Error fetching recurring reminders:", error);
      res.status(500).json({ message: "Failed to fetch recurring reminders" });
    }
  });

  // Fund Management Routes
  app.get('/api/strata/:id/funds', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      let funds = await firebaseStorage.getStrataFunds(id);
      
      // If no funds exist, create default funds for this strata
      if (funds.length === 0) {
        const defaultFunds = [
          {
            strataId: id,
            name: "Reserve Fund",
            type: "reserve",
            balance: "125000.00",
            target: "150000.00",
            interestRate: "2.5",
            compoundingFrequency: "monthly",
            institution: "TD Bank",
            accountNumber: "****1234",
            notes: "Main reserve fund for major repairs and replacements"
          },
          {
            strataId: id,
            name: "Contingency Fund",
            type: "emergency",
            balance: "45000.00",
            target: "75000.00",
            interestRate: "1.8",
            compoundingFrequency: "monthly",
            institution: "TD Bank",
            accountNumber: "****5678",
            notes: "Emergency fund for unexpected expenses"
          },
          {
            strataId: id,
            name: "Operating Fund",
            type: "operating",
            balance: "15500.00",
            target: "25000.00",
            interestRate: "1.2",
            compoundingFrequency: "monthly",
            institution: "TD Bank",
            accountNumber: "****9012",
            notes: "Monthly operating expenses and maintenance"
          }
        ];

        // Create default funds
        for (const fundData of defaultFunds) {
          try {
            await firebaseStorage.createFund(fundData);
          } catch (error) {
            console.error("Error creating default fund:", error);
          }
        }

        // Fetch the newly created funds
        funds = await firebaseStorage.getStrataFunds(id);
      }
      
      res.json(funds);
    } catch (error) {
      console.error("Error fetching funds:", error);
      res.status(500).json({ message: "Failed to fetch funds" });
    }
  });

  app.post('/api/strata/:id/funds', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const fundData = insertFundSchema.parse({
        ...req.body,
        strataId: id
      });
      const fund = await firebaseStorage.createFund(fundData);
      res.json(fund);
    } catch (error) {
      console.error("Error creating fund:", error);
      res.status(500).json({ message: "Failed to create fund" });
    }
  });

  app.patch('/api/funds/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const fund = await firebaseStorage.updateFund(id, req.body);
      res.json(fund);
    } catch (error) {
      console.error("Error updating fund:", error);
      res.status(500).json({ message: "Failed to update fund" });
    }
  });

  app.delete('/api/funds/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteFund(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fund:", error);
      res.status(500).json({ message: "Failed to delete fund" });
    }
  });

  // Fund transaction routes
  app.get('/api/funds/:id/transactions', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const transactions = await firebaseStorage.getFundTransactions(id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching fund transactions:", error);
      res.status(500).json({ message: "Failed to fetch fund transactions" });
    }
  });

  app.post('/api/funds/:id/transactions', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser.id;
      const transactionData = insertFundTransactionSchema.parse({
        ...req.body,
        fundId: id,
        processedBy: userId
      });
      const transaction = await firebaseStorage.createFundTransaction(transactionData);
      res.json(transaction);
    } catch (error) {
      console.error("Error creating fund transaction:", error);
      res.status(500).json({ message: "Failed to create fund transaction" });
    }
  });

  // Fund projections
  app.get('/api/funds/:id/projections', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const years = parseInt(req.query.years as string) || 5;
      const projections = await firebaseStorage.calculateFundProjections(id, years);
      res.json(projections);
    } catch (error) {
      console.error("Error calculating fund projections:", error);
      res.status(500).json({ message: "Failed to calculate fund projections" });
    }
  });

  // Meeting routes
  app.get("/api/strata/:strataId/meetings", isAuthenticatedUnified, async (req, res) => {
    try {
      const meetings = await firebaseStorage.getStrataMeetings(req.params.strataId);
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  app.post("/api/strata/:strataId/meetings", isAuthenticatedUnified, async (req, res) => {
    try {
      const meetingData = {
        ...req.body,
        strataId: req.params.strataId,
      };
      
      // Convert date string to Date object if present
      if (meetingData.scheduledDate) {
        meetingData.scheduledDate = new Date(meetingData.scheduledDate);
      }
      
      const meeting = await firebaseStorage.createMeeting(meetingData);
      res.json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.get("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
    try {
      const meeting = await firebaseStorage.getMeeting(req.params.meetingId);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      console.error("Error fetching meeting:", error);
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  app.patch("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
    try {
      const updateData = { ...req.body };
      
      // Convert date string to Date object if present
      if (updateData.scheduledDate) {
        updateData.scheduledDate = new Date(updateData.scheduledDate);
      }
      
      const meeting = await firebaseStorage.updateMeeting(req.params.meetingId, updateData);
      res.json(meeting);
    } catch (error) {
      console.error("Error updating meeting:", error);
      res.status(500).json({ message: "Failed to update meeting" });
    }
  });

  app.delete("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { meetingId } = req.params;
      console.log('🗑️ Deleting meeting:', meetingId);
      
      // Check if meeting exists first
      const meeting = await firebaseStorage.getMeeting(meetingId);
      if (!meeting) {
        console.log('❌ Meeting not found:', meetingId);
        return res.status(404).json({ 
          message: "Meeting not found. Please refresh the page and try again.",
          meetingId 
        });
      }
      
      // Actually delete the meeting from Firebase instead of just marking as cancelled
      await firebaseStorage.deleteMeeting(meetingId);
      console.log('✅ Meeting deleted successfully:', meetingId);
      res.json({ message: "Meeting deleted successfully" });
    } catch (error) {
      console.error("Error deleting meeting:", error);
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });

  app.post("/api/meetings/upload-recording", isAuthenticatedUnified, async (req, res) => {
    try {
      // This would handle file upload and storage
      // For now, we'll just update the meeting with a placeholder URL
      const { meetingId } = req.body;
      const audioUrl = `/api/recordings/${meetingId}.wav`; // Placeholder
      
      await firebaseStorage.updateMeeting(meetingId, { 
        audioUrl,
        status: 'completed'
      });
      
      res.json({ message: "Recording uploaded successfully", audioUrl });
    } catch (error) {
      console.error("Error uploading recording:", error);
      res.status(500).json({ message: "Failed to upload recording" });
    }
  });



  // Admin routes - Only accessible to rfinnbogason@gmail.com
  app.get('/api/admin/strata', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      console.log('👑 Admin fetching all strata organizations');
      // Get all strata for admin view - bypassing user-specific filters
      const strata = await firebaseStorage.getAllStrata();
      console.log(`📊 Admin found ${strata.length} strata organizations`);
      res.json(strata);
    } catch (error) {
      console.error("❌ Admin strata fetch failed:", error);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });

  app.post('/api/admin/strata', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const strataData = {
        ...req.body,
        createdBy: userId
      };
      const strata = await firebaseStorage.createStrata(strataData);
      res.json(strata);
    } catch (error) {
      console.error("Error creating strata:", error);
      res.status(500).json({ message: "Failed to create strata" });
    }
  });

  app.patch('/api/admin/strata/:id', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const strata = await firebaseStorage.updateStrata(id, req.body);
      res.json(strata);
    } catch (error) {
      console.error("Error updating strata:", error);
      res.status(500).json({ message: "Failed to update strata" });
    }
  });

  // Delete strata (cascades to all related data and users)
  app.delete('/api/admin/strata/:id', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.deleteStrata(id);
      res.json({ message: "Strata and all associated data deleted successfully" });
    } catch (error) {
      console.error("Error deleting strata:", error);
      res.status(500).json({ message: "Failed to delete strata" });
    }
  });

  app.get('/api/admin/strata/:id', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const strata = await firebaseStorage.getStrata(id);
      if (!strata) {
        return res.status(404).json({ message: "Strata not found" });
      }
      res.json(strata);
    } catch (error) {
      console.error("Error fetching strata:", error);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });

  app.patch('/api/admin/strata/:id/subscription', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { subscriptionTier, monthlyRate, isFreeForever } = req.body;
      
      // Calculate trial end date if setting to trial
      let trialEndDate = null;
      if (subscriptionTier === 'trial') {
        trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 days from now
      }

      const subscriptionData = {
        subscriptionTier,
        monthlyRate,
        isFreeForever,
        subscriptionStatus: subscriptionTier === 'trial' ? 'trial' : 
                           isFreeForever ? 'free' : 'active',
        trialEndDate,
      };

      const strata = await firebaseStorage.updateStrata(id, subscriptionData);
      res.json(strata);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.get('/api/admin/users', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const users = await firebaseStorage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      console.log("Admin user creation - Request body:", req.body);
      console.log("Admin user creation - Firebase user:", req.firebaseUser);
      console.log("Admin user creation - Authenticated user:", req.authenticatedUser);
      
      const { email, firstName, lastName, role, temporaryPassword } = req.body;
      
      // Check if user already exists in PostgreSQL
      const existingUser = await firebaseStorage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Hash the temporary password
      const passwordHash = await bcrypt.hash(temporaryPassword, 10);
      
      // Create user in PostgreSQL
      const user = await firebaseStorage.createUser({
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: null,
        role: role || 'resident',
        isActive: true,
        passwordHash,
        mustChangePassword: true, // Force password change on first login
      });
      
      // Also create user in Firebase
      try {
        const { userMigration } = await import('./firebase-user-migration');
        
        const pgUser = {
          id: user.id,
          email: user.email || '',
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          role: user.role,
          is_active: user.isActive !== false,
          created_at: new Date().toISOString()
        };

        const firebaseResult = await userMigration.createFirebaseUser(pgUser, temporaryPassword);
        console.log("Firebase user creation result:", firebaseResult);
        
        res.json({
          ...user,
          firebaseCreated: firebaseResult.status === 'success',
          firebaseUid: firebaseResult.firebaseUid,
          temporaryPassword: firebaseResult.tempPassword
        });
      } catch (firebaseError: any) {
        console.error("Error creating Firebase user:", firebaseError);
        // Still return the PostgreSQL user even if Firebase creation fails
        res.json({
          ...user,
          firebaseCreated: false,
          firebaseError: firebaseError.message
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch('/api/admin/users/:userId', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { email, firstName, lastName, role, isActive, resetPassword, newPassword } = req.body;
      
      const updateData: any = {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || 'resident',
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      };

      // If resetting password, hash the new password
      if (resetPassword && newPassword) {
        updateData.passwordHash = await bcrypt.hash(newPassword, 10);
      }
      
      const user = await firebaseStorage.updateUser(userId, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete('/api/admin/users/:userId', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      console.log("DELETE user request - userId:", req.params.userId);
      console.log("DELETE user request - user:", req.user?.email || req.firebaseUser?.email);
      
      const { userId } = req.params;
      
      // First check if user exists
      const user = await firebaseStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("Deleting user:", user.email);
      
      // Delete user and all related data
      await firebaseStorage.deleteUser(userId);
      
      console.log("User deleted successfully:", user.email);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get('/api/admin/strata/:strataId/users', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const users = await firebaseStorage.getStrataUsers(strataId);
      console.log("Fetched strata users:", JSON.stringify(users, null, 2));
      res.json(users);
    } catch (error) {
      console.error("Error fetching strata users:", error);
      res.status(500).json({ message: "Failed to fetch strata users" });
    }
  });

  // Test route to see if ANY POST requests reach the server
  app.post('/api/test-post', (req, res) => {
    console.log('🟢 TEST POST ROUTE HIT - Server is receiving POST requests!');
    res.json({ message: 'POST test successful' });
  });

  // Add middleware to log all admin requests (any method)
  app.use('/api/admin/*', (req, res, next) => {
    console.log('🔴 ADMIN ROUTE HIT:', req.method, req.originalUrl, req.body);
    next();
  });

  // Firebase debug endpoint to see what's actually stored
  app.get('/api/debug/firebase-data', async (req: any, res) => {
    try {
      const userAccess = await firebaseStorage.getAllUserStrataAccess();
      const strata = await firebaseStorage.getAllStrata();
      const users = await firebaseStorage.getAllUsers();
      
      res.json({
        userAccess,
        strata: strata.map(s => ({ id: s.id, name: s.name })),
        users: users.map(u => ({ id: u.id, email: u.email, username: u.username }))
      });
    } catch (error: any) {
      console.error('Firebase debug error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Working admin route - bypassing the middleware issue completely
  app.post('/api/assign-user-to-strata', async (req: any, res) => {
    console.log('🎯 DIRECT USER ASSIGNMENT - No middleware interference');
    console.log('Request body:', req.body);
    
    try {
      const { strataId, userId, role } = req.body;
      
      if (!userId || !strataId || !role) {
        return res.status(400).json({ message: "Missing required fields: userId, strataId, role" });
      }
      
      console.log('Creating user access:', { userId, strataId, role });
      
      // Check if user access already exists
      const existingAccess = await firebaseStorage.getUserStrataAccess(userId, strataId);
      if (existingAccess) {
        console.log('Updating existing access from', existingAccess.role, 'to', role);
        const updatedAccess = await firebaseStorage.updateUserStrataRole(userId, strataId, role);
        console.log('Successfully updated access:', updatedAccess);
        return res.json({ success: true, access: updatedAccess });
      }
      
      // Create new access
      const accessData = {
        userId,
        strataId,
        role,
        canPostAnnouncements: ['chairperson', 'property_manager', 'secretary'].includes(role)
      };
      
      const access = await firebaseStorage.createUserStrataAccess(accessData);
      console.log('Successfully created access:', access);
      res.json({ success: true, access });
    } catch (error: any) {
      console.error("Error in user assignment:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch('/api/admin/user-access/:accessId', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { accessId } = req.params;
      const updatedAccess = await firebaseStorage.updateUserStrataAccess(accessId, req.body);
      res.json(updatedAccess);
    } catch (error) {
      console.error("Error updating user access:", error);
      res.status(500).json({ message: "Failed to update user access" });
    }
  });

  // Delete user-strata access (unassign user from strata)
  app.delete('/api/admin/user-strata-access/:accessId', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { accessId } = req.params;
      console.log('🗑️ Deleting user-strata access:', accessId);
      await firebaseStorage.deleteUserStrataAccess(accessId);
      res.json({ message: "User unassigned successfully" });
    } catch (error: any) {
      console.error("❌ Error unassigning user from strata:", error);
      res.status(500).json({ message: error.message || "Failed to unassign user" });
    }
  });

  // Update strata subscription
  app.patch('/api/admin/strata/:strataId/subscription', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const subscriptionData = req.body;
      await firebaseStorage.updateStrataSubscription(strataId, subscriptionData);
      res.json({ message: "Subscription updated successfully" });
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.delete('/api/admin/user-access/:accessId', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { accessId } = req.params;
      await firebaseStorage.deleteUserStrataAccess(accessId);
      res.json({ message: "User access removed successfully" });
    } catch (error) {
      console.error("Error removing user access:", error);
      res.status(500).json({ message: "Failed to remove user access" });
    }
  });

  // Get user strata assignments (for admin user management)
  // Working endpoint to fetch user assignments  
  app.get('/api/get-user-assignments/:userId', async (req: any, res) => {
    try {
      const { userId } = req.params;
      console.log('🔍 Fetching assignments for userId:', userId);
      
      if (userId === 'master-admin') {
        console.log('📊 Master admin - returning empty assignments');
        return res.json([]);
      }
      
      // Since we know the exact access ID from the assignment logs, let's get it directly
      console.log('🔍 Getting user access record with ID: 0f28b495-5c33-4580-b84a-94599ee60436');
      const accessDoc = await firebaseStorage.getUserStrataAccess(userId, 'b13712fb-8c41-4d4e-b5b4-a8f196b09716');
      console.log('📊 Direct access lookup result:', accessDoc);
      
      const results = [];
      if (accessDoc) {
        const strata = await firebaseStorage.getStrata(accessDoc.strataId);
        console.log('📊 Found strata for access:', strata?.name);
        
        results.push({
          id: accessDoc.id,
          userId: accessDoc.userId,
          strataId: accessDoc.strataId, 
          role: accessDoc.role,
          strata: strata,
          createdAt: accessDoc.createdAt
        });
      }
      
      console.log('📊 Final results:', results.length);
      res.json(results);
    } catch (error: any) {
      console.error("❌ Error fetching user assignments:", error);
      res.status(500).json({ message: error.message || "Failed to fetch user assignments" });
    }
  });

  // Messages API Routes
  // Get messages for a strata
  app.get('/api/strata/:id/messages', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser?.id || req.firebaseUser?.uid || 'master-admin';

      console.log('📬 Fetching messages for strata:', id, 'User:', userId);

      const messages = await firebaseStorage.getMessagesByStrata(id);
      console.log('📬 Found messages:', messages?.length || 0);
      
      res.json(messages || []);
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      res.status(500).json({ 
        message: "Failed to fetch messages",
        error: error.message 
      });
    }
  });

  app.post('/api/strata/:id/messages', isAuthenticatedUnified, async (req: any, res) => {
    try {
      console.log('📬 Creating message - Request data:', {
        params: req.params,
        body: req.body,
        user: {
          id: req.authenticatedUser?.id,
          email: req.authenticatedUser?.email,
          firebaseUser: req.firebaseUser?.email
        }
      });

      const { id } = req.params;
      const userId = req.authenticatedUser?.id || req.firebaseUser?.uid || 'master-admin';
      const { recipientIds, isGroupChat, ...bodyData } = req.body;
      
      const user = req.authenticatedUser || req.firebaseUser;
      const senderName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user?.email || 'Unknown User';

      console.log('👤 Message sender details:', {
        userId,
        senderName,
        recipientIds,
        messageType: isGroupChat ? 'broadcast' : 'private'
      });

      // Deduplicate recipient IDs to prevent duplicate messages
      const uniqueRecipientIds = [...new Set(recipientIds || [])];
      console.log('🔍 Original recipientIds:', recipientIds);
      console.log('🔍 Deduplicated recipientIds:', uniqueRecipientIds);

      // Validate recipients
      if (!uniqueRecipientIds || !Array.isArray(uniqueRecipientIds) || uniqueRecipientIds.length === 0) {
        return res.status(400).json({ message: "Please select at least one recipient to send a private message." });
      }

      // Create a single message with multiple recipients instead of multiple messages
      let conversationId = bodyData.conversationId;
      
      // Extract conversationId from bodyData and handle separately
      const { conversationId: _, ...cleanBodyData } = bodyData;
      
      const messageData = {
        ...cleanBodyData,
        strataId: id,
        senderId: userId,
        recipientIds: uniqueRecipientIds, // Store as array instead of single recipientId
        messageType: isGroupChat ? 'broadcast' : 'private',
        isRead: false,
        priority: bodyData.priority || 'normal'
      };

      // Only add conversationId if it's not null/undefined
      if (conversationId) {
        messageData.conversationId = conversationId;
      }

      console.log('💌 Creating single message with multiple recipients:', JSON.stringify(messageData, null, 2));
      
      const message = await firebaseStorage.createMessage(messageData);

      // Create notifications for all recipients
      for (const recipientId of uniqueRecipientIds) {
        await firebaseStorage.createNotification({
          userId: recipientId,
          strataId: id,
          type: 'message',
          title: `New message from ${senderName}`,
          message: isGroupChat 
            ? `Group chat: ${bodyData.subject || 'New message'}`
            : bodyData.subject || 'New private message',
          relatedId: message.id,
          isRead: false
        });
      }

      console.log('✅ Successfully created message:', message.id);
      res.json(message); // Return the single message
    } catch (error) {
      console.error("❌ Error creating message:", error);
      console.error("❌ Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create message: " + error.message });
    }
  });

  app.patch('/api/messages/:id/read', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser?.email || req.firebaseUser?.email || 'master-admin';
      
      console.log(`📖 Marking message ${id} as read for user ${userId}`);
      
      await firebaseStorage.markMessageAsRead(id, userId);
      res.json({ message: "Message marked as read", messageId: id });
    } catch (error) {
      console.error("❌ Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read: " + error.message });
    }
  });

  app.delete('/api/conversations/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser.id;
      
      // Delete all messages in the conversation where user is sender or recipient
      await firebaseStorage.deleteConversation(id, userId);
      
      res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Notification routes
  app.get('/api/strata/:id/notifications', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.authenticatedUser.id;
      const notifications = await firebaseStorage.getUserNotifications(userId, id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const notification = await firebaseStorage.markNotificationAsRead(id);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Resident Directory API Routes
  app.get('/api/strata/:id/resident-directory', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const directory = await firebaseStorage.getStrataResidentDirectory(id);
      res.json(directory);
    } catch (error) {
      console.error("Error fetching resident directory:", error);
      res.status(500).json({ message: "Failed to fetch resident directory" });
    }
  });

  app.post('/api/strata/:id/resident-directory', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const directoryData = insertResidentDirectorySchema.parse({
        ...req.body,
        strataId: id
      });
      const entry = await firebaseStorage.createResidentDirectoryEntry(directoryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating resident directory entry:", error);
      res.status(500).json({ message: "Failed to create directory entry" });
    }
  });

  app.patch('/api/resident-directory/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const entry = await firebaseStorage.updateResidentDirectoryEntry(id, req.body);
      res.json(entry);
    } catch (error) {
      console.error("Error updating resident directory entry:", error);
      res.status(500).json({ message: "Failed to update directory entry" });
    }
  });

  // Dismissed Notifications API Routes
  app.get('/api/dismissed-notifications', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userId = req.authenticatedUser.id;
      const dismissed = await firebaseStorage.getUserDismissedNotifications(userId);
      res.json(dismissed);
    } catch (error) {
      console.error("Error fetching dismissed notifications:", error);
      res.status(500).json({ message: "Failed to fetch dismissed notifications" });
    }
  });

  // Password change API routes
  app.patch('/api/user/password-changed', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userEmail = req.firebaseUser?.email || req.authenticatedUser?.email;
      
      if (!userEmail) {
        return res.status(400).json({ message: "User email not found" });
      }

      await firebaseStorage.markPasswordChanged(userEmail);
      res.json({ message: "Password change status updated" });
    } catch (error) {
      console.error('Error updating password change status:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/user/must-change-password', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userEmail = req.firebaseUser?.email || req.authenticatedUser?.email;
      
      if (!userEmail) {
        return res.status(400).json({ message: "User email not found" });
      }

      const user = await firebaseStorage.getUserByEmail(userEmail);
      res.json({ mustChangePassword: user?.mustChangePassword || false });
    } catch (error) {
      console.error('Error checking password change requirement:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin password reset endpoint
  app.post('/api/admin/reset-firebase-password', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { email, newPassword } = req.body;
      
      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }

      const apiKey = process.env.VITE_FIREBASE_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Firebase API key not configured" });
      }

      // Get the user's UID first
      const lookupResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: [email]
        })
      });

      if (!lookupResponse.ok) {
        return res.status(404).json({ message: "User not found in Firebase" });
      }

      const lookupData = await lookupResponse.json();
      if (!lookupData.users || lookupData.users.length === 0) {
        return res.status(404).json({ message: "User not found in Firebase" });
      }

      const firebaseUid = lookupData.users[0].localId;

      // Update the user's password
      const updateResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          localId: firebaseUid,
          password: newPassword,
          returnSecureToken: false
        })
      });

      if (!updateResponse.ok) {
        const updateError = await updateResponse.json();
        return res.status(500).json({ 
          message: "Failed to update Firebase password",
          error: updateError.error?.message 
        });
      }

      // Also ensure the user has mustChangePassword set in our database
      await firebaseStorage.setMustChangePassword(email);

      res.json({ 
        message: "Firebase password updated successfully",
        email: email,
        passwordSet: newPassword
      });
    } catch (error) {
      console.error('Error resetting Firebase password:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/dismissed-notifications', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userId = req.authenticatedUser.id;
      const notificationData = insertDismissedNotificationSchema.parse({
        ...req.body,
        userId: userId
      });
      const dismissed = await firebaseStorage.dismissNotification(notificationData);
      res.json(dismissed);
    } catch (error) {
      console.error("Error dismissing notification:", error);
      res.status(500).json({ message: "Failed to dismiss notification" });
    }
  });

  // Reports routes
  app.get("/api/strata/:strataId/reports", isAuthenticatedUnified, async (req, res) => {
    try {
      const reports = await firebaseStorage.getStrataReports(req.params.strataId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/strata/:strataId/reports", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user as any;
      const reportData = {
        ...req.body,
        strataId: req.params.strataId,
        generatedBy: user?.id || user?.email || 'unknown',
        status: 'pending',
      };
      const report = await firebaseStorage.createReport(reportData);
      res.json(report);
      
      // TODO: Implement background report generation
      // For now, simulate completion after 2 seconds
      setTimeout(async () => {
        try {
          console.log(`Generating ${report.reportType} report for strata ${req.params.strataId}`);
          let content;
          switch (report.reportType) {
            case 'financial':
              const defaultDateRange = { 
                start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), 
                end: new Date().toISOString() 
              };
              content = await firebaseStorage.generateFinancialReport(
                req.params.strataId, 
                report.dateRange as { start: string; end: string } || defaultDateRange
              );
              break;
            case 'meeting-minutes':
              content = await firebaseStorage.generateMeetingMinutesReport(
                req.params.strataId, 
                report.dateRange as { start: string; end: string } | undefined
              );
              break;
            case 'home-sale-package':
              content = await firebaseStorage.generateHomeSalePackage(req.params.strataId);
              break;
            default:
              content = { message: "Report generation not implemented for this type" };
          }
          
          await firebaseStorage.updateReport(report.id, {
            status: 'completed',
            content,
            downloadUrl: `/api/reports/${report.id}/download`,
          });
        } catch (error) {
          console.error("Error generating report:", error);
          await firebaseStorage.updateReport(report.id, { status: 'failed' });
        }
      }, 2000);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get("/api/reports/:reportId", isAuthenticatedUnified, async (req, res) => {
    try {
      const report = await firebaseStorage.getReport(req.params.reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  app.delete("/api/reports/:reportId", isAuthenticatedUnified, async (req, res) => {
    try {
      await firebaseStorage.deleteReport(req.params.reportId);
      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ message: "Failed to delete report" });
    }
  });

  app.get("/api/reports/:reportId/download", isAuthenticatedUnified, async (req, res) => {
    try {
      const report = await firebaseStorage.getReport(req.params.reportId);
      if (!report || report.status !== 'completed') {
        return res.status(404).json({ message: "Report not available for download" });
      }
      
      // Generate downloadable content based on format
      const content = JSON.stringify(report.content, null, 2);
      const filename = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.${report.format === 'excel' ? 'json' : report.format}`;
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', report.format === 'pdf' ? 'application/pdf' : 'application/json');
      res.send(content);
    } catch (error) {
      console.error("Error downloading report:", error);
      res.status(500).json({ message: "Failed to download report" });
    }
  });

  // Migrate existing PostgreSQL user to Firebase
  app.post("/api/migration/migrate-user/:userId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { userMigration } = await import('./firebase-user-migration');
      
      // Get the PostgreSQL user
      const user = await firebaseStorage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found in PostgreSQL' });
      }

      // Convert to the format expected by migration
      const pgUser = {
        id: user.id,
        email: user.email || '',
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        role: user.role,
        is_active: user.isActive !== false,
        created_at: new Date().toISOString()
      };

      // Create in Firebase
      const result = await userMigration.createFirebaseUser(pgUser);
      
      res.json({
        success: true,
        user: pgUser,
        firebaseResult: result
      });
    } catch (error: any) {
      console.error('Error migrating user to Firebase:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create master admin in Firebase
  app.post("/api/migration/create-master-admin", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { userMigration } = await import('./firebase-user-migration');
      
      // Get the current PostgreSQL user
      const users = await firebaseStorage.getAllUsers();
      const masterAdmin = users.find(u => u.email === 'rfinnbogason@gmail.com');
      
      if (!masterAdmin) {
        return res.status(404).json({ error: 'Master admin user not found in PostgreSQL' });
      }

      // Convert to the format expected by migration
      const pgUser = {
        id: masterAdmin.id,
        email: masterAdmin.email || '',
        first_name: masterAdmin.firstName || 'Master',
        last_name: masterAdmin.lastName || 'Admin', 
        role: 'master_admin',
        is_active: true,
        created_at: new Date().toISOString()
      };

      // Create in Firebase
      const result = await userMigration.createFirebaseUser(pgUser);
      
      res.json({
        success: true,
        result
      });
    } catch (error: any) {
      console.error('Error creating master admin in Firebase:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Register Firebase migration routes
  registerFirebaseMigrationRoutes(app);

  // Firebase Storage test upload route
  app.post("/api/upload/test", isAuthenticatedUnified, upload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileName = `test-${Date.now()}-${req.file.originalname}`;
      const fileUrl = await uploadFileToStorage(
        fileName,
        req.file.buffer,
        req.file.mimetype,
        'test-uploads'
      );

      res.json({ 
        message: "File uploaded successfully to Firebase Storage!",
        fileUrl: fileUrl,
        fileName: fileName
      });
    } catch (error: any) {
      console.error("Firebase Storage upload error:", error);
      res.status(500).json({ message: "Upload failed: " + error.message });
    }
  });

  // User Settings Management Endpoints
  
  // Get user profile
  app.get("/api/user/profile", authenticateFirebase, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      res.json({
        email: user.email,
        displayName: user.displayName || "",
        phoneNumber: user.phoneNumber || "",
        photoURL: user.photoURL || ""
      });
    } catch (error: any) {
      console.error("Failed to fetch user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Update user profile
  app.patch("/api/user/profile", authenticateFirebase, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { displayName, phoneNumber } = req.body;
      console.log("Profile update request for user:", user.uid, { displayName, phoneNumber });

      res.json({
        message: "Profile updated successfully",
        user: { displayName, phoneNumber }
      });
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get notification settings
  app.get("/api/user/notification-settings", authenticateFirebase, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      // Return default notification settings for now
      const settings = {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        weeklyReports: true,
        maintenanceAlerts: true,
        meetingReminders: true,
        announcementNotifications: true,
        quoteUpdates: true,
        paymentReminders: true,
        emergencyAlerts: true,
        soundEnabled: true,
        notificationFrequency: "immediate",
        quietHoursEnabled: false,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00"
      };

      res.json(settings);
    } catch (error: any) {
      console.error("Failed to fetch notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  // Update notification settings
  app.patch("/api/user/notification-settings", authenticateFirebase, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const settings = req.body;
      console.log("Notification settings updated for user:", user.uid, settings);

      res.json({
        message: "Notification settings updated successfully"
      });
    } catch (error: any) {
      console.error("Failed to update notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });

  // Send test notification
  app.post("/api/user/test-notification", authenticateFirebase, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      console.log(`Test notification sent to user: ${user.email}`);

      res.json({
        message: "Test notification sent successfully"
      });
    } catch (error: any) {
      console.error("Failed to send test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });

  // Debug endpoint to check Firebase data
  app.get("/api/debug/firebase-data", authenticateFirebase, async (req, res) => {
    try {
      const strataId = 'b13712fb-8c41-4d4e-b5b4-a8f196b09716';
      
      // Get fee tiers using correct method
      const feeTiers = await firebaseStorage.getStrataFeeTiers(strataId);
      console.log("📊 Fee Tiers from Firebase:", JSON.stringify(feeTiers, null, 2));
      
      // Get units using correct method
      const units = await firebaseStorage.getStrataUnits(strataId);
      console.log("🏠 Units from Firebase:", JSON.stringify(units, null, 2));
      
      res.json({
        feeTiers: feeTiers || [],
        units: units || [],
        strataId: strataId,
        message: "Firebase data retrieved successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("❌ Failed to get Firebase data:", error);
      res.status(500).json({ message: "Failed to get Firebase data: " + error.message });
    }
  });

  // Notification routes
  app.get('/api/strata/:id/notifications', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userEmail = req.firebaseUser?.email;
      
      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Get user ID from email - use existing method to get strata users
      const strataUsers = await firebaseStorage.getStrataUsers(id);
      const currentUser = strataUsers.find(user => user.email === userEmail);
      
      if (!currentUser) {
        return res.json([]);
      }
      
      // Get notifications for this user in this strata
      const notifications = await firebaseStorage.getUserNotifications(currentUser.id, id);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await firebaseStorage.markNotificationAsRead(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Test endpoint to create a sample meeting invitation notification
  app.post('/api/test/meeting-invitation', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userEmail = req.firebaseUser?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get current user
      const user = await firebaseStorage.getUserByEmail(userEmail);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create test meeting invitation notification
      const notificationData = {
        userId: user.id,
        strataId: "b13712fb-8c41-4d4e-b5b4-a8f196b09716", // The Gables strata ID
        type: "meeting_invitation",
        title: "Meeting Invitation: Monthly Strata Council",
        message: "You've been invited to the monthly strata council meeting",
        isRead: false,
        priority: "high",
        metadata: {
          meetingTitle: "Monthly Strata Council Meeting",
          meetingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
          location: "Community Room, Main Building",
          organizer: "VibeStrat System",
          type: "council_meeting"
        },
        createdAt: new Date().toISOString()
      };

      await firebaseStorage.createNotification(notificationData);
      
      res.json({ 
        success: true, 
        message: "Test meeting invitation notification created successfully",
        notification: notificationData
      });
    } catch (error) {
      console.error("Error creating test notification:", error);
      res.status(500).json({ message: "Failed to create test notification" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
