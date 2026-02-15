import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-factory";
import { authenticateJwt } from "./jwt-auth";
import { registerAuthRoutes } from "./auth-routes";
import { uploadFile as uploadToBlob, deleteFile as deleteFromBlob } from "./vercel-blob-storage";
import { pushNotificationService } from "./push-notification-service";
import bcrypt from "bcryptjs";
import multer from "multer";
import { extractQuoteDataFromDocument, extractQuoteDataFromText } from "./openai";
import stripeRouter from "./stripe-routes";
import rateLimit from "express-rate-limit";
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
} from "../shared/schema";

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

// Master admin email from environment variable
const MASTER_ADMIN_EMAIL = process.env.MASTER_ADMIN_EMAIL || 'rfinnbogason@gmail.com';

// ✅ SECURITY: Rate limiting to prevent abuse
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 API requests per minute
  message: "Too many API requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT authentication middleware (replaces Firebase token verification)
const isAuthenticatedUnified: RequestHandler = authenticateJwt as RequestHandler;

// Migration routes removed - Firebase migration no longer needed

export async function registerRoutes(app: Express): Promise<Server> {

  // Mount Stripe routes (webhooks need to be early for raw body parsing)
  app.use('/api/stripe', stripeRouter);
  console.log('✅ Stripe payment routes registered at /api/stripe');

  // ✅ SECURITY: Apply rate limiting to all API routes
  app.use('/api/', apiLimiter);
  console.log('✅ Rate limiting enabled for API routes');

  // ✅ SECURITY: Add security headers to all responses
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

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

      const fileName = `documents/${req.params.strataId}/${Date.now()}_${req.file.originalname}`;
      const fileUrl = await uploadToBlob(req.file.buffer, fileName, req.file.mimetype);

      console.log('File uploaded:', fileUrl);

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

      const document = await storage.createDocument(documentData);
      console.log('✅ Document created successfully');
      res.json(document);
    } catch (error: any) {
      console.error('❌ Emergency upload failed:', error);
      res.status(500).json({ message: "Emergency upload failed: " + error.message });
    }
  });
  // Register auth routes (login, signup, forgot-password, etc.)
  registerAuthRoutes(app);

  // Admin check middleware
  const isAdmin: RequestHandler = async (req: any, res, next) => {
    if (req.user?.email === MASTER_ADMIN_EMAIL) {
      return next();
    }

    // Check authenticated user role (for master admin)
    if (req.user?.role === 'master_admin') {
      return next();
    }

    // Check user email from claims
    const userEmail = req.user?.claims?.email;
    if (userEmail === MASTER_ADMIN_EMAIL) {
      return next();
    }

    return res.status(403).json({ message: "Admin access required" });
  };

  // Auth routes
  // Diagnostic endpoint to debug authentication issues
  app.get('/api/debug/auth-status', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const user = req.user;

      // Check strata access for this user
      const userStrata = user ? await storage.getUserStrata(user.id) : [];

      // Get all strata assignments with details
      const assignments = user ? await storage.getUserStrataAssignments(user.id) : [];

      const debugInfo = {
        authenticated: !!user,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : null,
        strataCount: userStrata.length,
        strata: userStrata.map(s => ({ id: s.id, name: s.name })),
        assignmentsCount: assignments.length,
        assignments: assignments.map(a => ({
          strataId: a.strataId,
          strataName: a.strata?.name,
          role: a.role
        })),
        timestamp: new Date().toISOString()
      };

      console.log('📊 DEBUG Info:', JSON.stringify(debugInfo, null, 2));

      res.json(debugInfo);
    } catch (error: any) {
      console.error('❌ Error in debug endpoint:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/auth/user', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // If this is a new user's first login, create sample strata data
      const userStrata = await storage.getUserStrata(userId);
      if (userStrata.length === 0) {
        console.log(`Creating sample strata for new user: ${userId}`);
        
        // Create a sample strata
        const sampleStrata = await storage.createStrata({
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
        await storage.createUserStrataAccess({
          userId,
          strataId: sampleStrata.id,
          role: 'property_manager'
        });
        
        // Create some sample units
        for (let i = 1; i <= 6; i++) {
          await storage.createUnit({
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
        user = await storage.getUser(userId);
      }
      
      // Check for password-based session
      if (!user && req.session && (req.session as any).userId) {
        user = await storage.getUser((req.session as any).userId);
      }
      
      if (user) {
        // Get user's strata assignments with role information
        const strataAssignments = await storage.getAllUserStrataAccess(user.id);
        
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

  // FCM Token endpoint for push notifications
  app.post('/api/user/fcm-token', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { token } = req.body;
      const user = req.user;

      if (!token) {
        return res.status(400).json({ message: "FCM token is required" });
      }

      console.log(`📱 Saving FCM token for user ${user.email}`);

      // Update user's FCM token in Firestore
      await storage.updateUser(user.id, { fcmToken: token });

      console.log(`✅ FCM token saved successfully for user ${user.id}`);
      res.json({ message: "FCM token saved successfully" });
    } catch (error: any) {
      console.error("❌ Error saving FCM token:", error);
      res.status(500).json({ message: "Failed to save FCM token" });
    }
  });

  // Email/Password Authentication Routes
  app.post('/api/auth/setup-password', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.passwordHash) {
        return res.status(400).json({ message: "Password already set" });
      }

      // Hash password and update user
      const passwordHash = await bcrypt.hash(password, 10);
      await storage.updateUser(user.id, { passwordHash });

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

      const user = await storage.getUserByEmail(email);
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
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

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
      const user = req.user;

      if (!user) {
        console.error('❌ No authenticated user found!');
        return res.status(401).json({ message: "Authentication required" });
      }

      // Master admin can see all strata
      if (user.email === 'rfinnbogason@gmail.com') {
        console.log('👑 Master admin access - fetching all strata');
        const allStrata = await storage.getAllStrata();
        console.log(`📊 Found ${allStrata.length} strata organizations`);
        if (allStrata.length === 0) {
          console.error('⚠️ No strata found in Firestore - run migration script');
        }
        console.log('✅ Returning', allStrata.length, 'strata to master admin');
        return res.json(allStrata);
      }

      console.log('👤 Regular user access - fetching user strata');
      console.log('🔎 Querying getUserStrata with userId:', user.id);

      const userStrata = await storage.getUserStrata(user.id);

      console.log(`📊 Found ${userStrata.length} strata for user ${user.id}`);

      if (userStrata.length === 0) {
        console.error('⚠️ WARNING: No strata found for user!');
        console.error('🔍 Checking userStrataAccess collection...');

        // Get detailed info for debugging
        const assignments = await storage.getUserStrataAssignments(user.id);
        console.error('📋 User assignments:', JSON.stringify(assignments, null, 2));
      } else {
        console.log('✅ Successfully found strata:', userStrata.map(s => `${s.name} (${s.id})`).join(', '));
      }

      console.log('🏁 ===== END FETCHING STRATA =====');
      res.json(userStrata);
    } catch (error: any) {
      console.error('❌ Error fetching strata:', error);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });

  app.get('/api/strata/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const strata = await storage.getStrata(id);
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
      const user = req.user;
      console.log('🏗️ Creating new strata for user:', user.email);

      const strataData = req.body;
      console.log('📋 Strata data:', JSON.stringify(strataData, null, 2));

      // Initialize 30-day trial for new stratas
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);

      // Create strata document with trial subscription
      const newStrata = await storage.createStrata({
        ...strataData,
        subscription: {
          status: 'trial',
          tier: 'standard',
          monthlyRate: 0,
          trialStartDate: trialStartDate,
          trialEndDate: trialEndDate,
          isFreeForever: false
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('✅ Created strata with trial:', newStrata.id);

      // Create user access as chairperson
      await storage.createUserStrataAccess({
        id: `${user.id}_${newStrata.id}`,
        userId: user.id,
        strataId: newStrata.id,
        role: 'chairperson',
        canPostAnnouncements: true,
        createdAt: new Date()
      });

      console.log('✅ Created user access for chairperson');

      res.status(201).json({ id: newStrata.id, ...newStrata });
    } catch (error) {
      console.error("Error creating strata:", error);
      res.status(500).json({ message: "Failed to create strata" });
    }
  });

  // Strata registration route (public)
  app.post('/api/strata/register', async (req, res) => {
    try {
      const { insertPendingStrataRegistrationSchema } = await import("../shared/schema");
      const registrationData = insertPendingStrataRegistrationSchema.parse(req.body);
      
      const pendingRegistration = await storage.createPendingRegistration(registrationData);
      
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
      
      const units = await storage.getStrataUnits(id);
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
      
      const unit = await storage.createUnit(unitData);
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
      const unit = await storage.updateUnit(id, req.body);
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
      
      await storage.deleteUnit(id);
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
      const metrics = await storage.getStrataMetrics(id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Recent activity feed - aggregates all activity types
  app.get('/api/strata/:id/recent-activity', isAuthenticatedUnified, async (req: any, res) => {
    // Set JSON content type explicitly
    res.setHeader('Content-Type', 'application/json');

    try {
      const { id } = req.params;
      console.log('📊 Fetching recent activity for strata:', id);
      console.log('📊 Request headers:', req.headers.authorization ? 'Has auth token' : 'No auth token');

      // Fetch all activity sources in parallel
      const [announcements, messages, maintenanceRequests, quotes, expenses, meetings, paymentReminders] = await Promise.all([
        storage.getStrataAnnouncements(id).catch(err => { console.error('Error fetching announcements:', err); return []; }),
        storage.getMessagesByStrata(id).catch(err => { console.error('Error fetching messages:', err); return []; }),
        storage.getStrataMaintenanceRequests(id).catch(err => { console.error('Error fetching maintenance:', err); return []; }),
        storage.getStrataQuotes(id).catch(err => { console.error('Error fetching quotes:', err); return []; }),
        storage.getStrataExpenses(id).catch(err => { console.error('Error fetching expenses:', err); return []; }),
        storage.getStrataMeetings(id).catch(err => { console.error('Error fetching meetings:', err); return []; }),
        storage.getStrataPaymentReminders(id).catch(err => { console.error('Error fetching payment reminders:', err); return []; })
      ]);

      // Transform each activity type into a common format
      const activities = [];

      // Announcements
      (announcements as any[] || []).slice(0, 5).forEach((item: any) => {
        activities.push({
          id: `announcement_${item.id}`,
          type: 'announcement',
          title: item.title || 'Community Announcement',
          description: item.content?.substring(0, 100) + (item.content?.length > 100 ? '...' : ''),
          createdAt: item.createdAt,
          icon: 'megaphone',
          link: '/communications?tab=announcements',
          metadata: {
            category: item.category || 'general',
            priority: item.priority || 'normal',
            authorName: item.authorName
          }
        });
      });

      // Messages (only showing sent messages, not received)
      (messages as any[] || []).slice(0, 3).forEach((item: any) => {
        activities.push({
          id: `message_${item.id}`,
          type: 'message',
          title: item.subject || 'New Message',
          description: item.content?.substring(0, 100) + (item.content?.length > 100 ? '...' : ''),
          createdAt: item.createdAt,
          icon: 'message',
          link: '/communications?tab=messages',
          metadata: {
            messageType: item.messageType,
            isRead: item.isRead
          }
        });
      });

      // Maintenance Requests
      (maintenanceRequests as any[] || []).slice(0, 5).forEach((item: any) => {
        activities.push({
          id: `maintenance_${item.id}`,
          type: 'maintenance',
          title: item.title || 'Maintenance Request',
          description: item.description?.substring(0, 100) + (item.description?.length > 100 ? '...' : ''),
          createdAt: item.createdAt || item.requestDate,
          icon: 'wrench',
          link: '/maintenance',
          metadata: {
            status: item.status,
            priority: item.priority,
            unitNumber: item.unitNumber
          }
        });
      });

      // Quotes
      (quotes as any[] || []).slice(0, 3).forEach((item: any) => {
        activities.push({
          id: `quote_${item.id}`,
          type: 'quote',
          title: `Quote: ${item.description || 'Service Quote'}`,
          description: `Amount: $${item.amount || 0} - ${item.vendorName || 'Vendor'}`,
          createdAt: item.createdAt,
          icon: 'file-text',
          link: '/quotes',
          metadata: {
            status: item.status,
            amount: item.amount,
            vendorName: item.vendorName
          }
        });
      });

      // Expenses
      (expenses as any[] || []).slice(0, 3).forEach((item: any) => {
        activities.push({
          id: `expense_${item.id}`,
          type: 'expense',
          title: `Expense: ${item.description || 'Payment'}`,
          description: `Amount: $${item.amount || 0} - ${item.category || 'General'}`,
          createdAt: item.createdAt,
          icon: 'dollar-sign',
          link: '/financial',
          metadata: {
            status: item.status,
            amount: item.amount,
            category: item.category
          }
        });
      });

      // Meetings
      (meetings as any[] || []).slice(0, 5).forEach((item: any) => {
        const meetingDate = item.meetingDate || item.scheduledAt;
        const formattedDate = meetingDate ? new Date(meetingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'TBD';

        activities.push({
          id: `meeting_${item.id}`,
          type: 'meeting',
          title: item.title || 'Strata Meeting',
          description: `${item.meetingType || 'Meeting'} - ${formattedDate}${item.location ? ` at ${item.location}` : ''}`,
          createdAt: item.createdAt,
          icon: 'calendar',
          link: '/meetings',
          metadata: {
            status: item.status,
            meetingType: item.meetingType,
            meetingDate: meetingDate,
            chairperson: item.chairperson
          }
        });
      });

      // Payment Reminders
      (paymentReminders as any[] || []).slice(0, 5).forEach((item: any) => {
        const dueDate = item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
        const amount = item.amount ? `$${item.amount}` : '';

        activities.push({
          id: `payment_reminder_${item.id}`,
          type: 'payment_reminder',
          title: item.title || 'Payment Reminder',
          description: `${amount ? `${amount} - ` : ''}Due: ${dueDate}${item.status === 'active' ? '' : ` (${item.status})`}`,
          createdAt: item.createdAt,
          icon: 'bell',
          link: '/financial',
          metadata: {
            amount: item.amount,
            dueDate: item.dueDate,
            reminderType: item.reminderType,
            status: item.status,
            priority: item.priority
          }
        });
      });

      // Sort all activities by createdAt descending
      activities.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Most recent first
      });

      // Return top 15 activities
      const recentActivities = activities.slice(0, 15);

      console.log(`✅ Returning ${recentActivities.length} recent activities`);
      res.json(recentActivities);
    } catch (error) {
      console.error("❌ Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Expense routes
  app.get('/api/strata/:id/expenses', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const expenses = await storage.getStrataExpenses(id);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post('/api/strata/:id/expenses', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const expenseData = insertExpenseSchema.parse({
        ...req.body,
        strataId: id,
        submittedBy: userId
      });
      const expense = await storage.createExpense(expenseData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  app.patch('/api/expenses/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
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
      
      const expense = await storage.updateExpense(id, updateData);
      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  app.delete('/api/expenses/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExpense(id);
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
      const quotes = await storage.getStrataQuotes(id);
      res.json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.post('/api/strata/:id/quotes', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { quoteDocument, ...quoteBodyData } = req.body;
      
      const quoteData = insertQuoteSchema.parse({
        ...quoteBodyData,
        strataId: id,
        requesterId: userId
      });

      // Create project folder automatically
      const projectFolder = await storage.createQuoteProjectFolder(id, quoteData.projectTitle, userId);
      
      // Add folder reference to quote
      const quoteWithFolder = {
        ...quoteData,
        documentFolderId: projectFolder.id
      };

      const quote = await storage.createQuote(quoteWithFolder);

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
        
        await storage.createDocument(documentData);
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
      const userId = req.user.id;
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
      
      const quote = await storage.updateQuote(id, updateData);

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
        
        await storage.createDocument(documentData);
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
      const quote = await storage.getQuote(id);
      
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      if (!quote.documentFolderId) {
        return res.json([]);
      }

      const documents = await storage.getFolderDocuments(quote.documentFolderId);
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
      const approvals = await storage.getPendingApprovals(id);
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
      const vendors = await storage.getVendorsByStrata(strataId);
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
      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.get('/api/vendors', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post('/api/vendors', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  app.get('/api/vendors/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const vendor = await storage.getVendor(id);
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });

  app.patch('/api/vendors/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const vendor = await storage.updateVendor(id, req.body);
      res.json(vendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });

  app.delete('/api/vendors/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVendor(id);
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
      const contracts = await storage.getVendorContracts(id);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching vendor contracts:", error);
      res.status(500).json({ message: "Failed to fetch vendor contracts" });
    }
  });

  app.get('/api/strata/:id/vendor-contracts', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const contracts = await storage.getStrataVendorContracts(id);
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
      const contract = await storage.createVendorContract(contractData);
      res.json(contract);
    } catch (error) {
      console.error("Error creating vendor contract:", error);
      res.status(500).json({ message: "Failed to create vendor contract" });
    }
  });

  app.get('/api/vendor-contracts/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const contract = await storage.getVendorContract(id);
      res.json(contract);
    } catch (error) {
      console.error("Error fetching vendor contract:", error);
      res.status(500).json({ message: "Failed to fetch vendor contract" });
    }
  });

  app.patch('/api/vendor-contracts/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const contract = await storage.updateVendorContract(id, req.body);
      res.json(contract);
    } catch (error) {
      console.error("Error updating vendor contract:", error);
      res.status(500).json({ message: "Failed to update vendor contract" });
    }
  });

  app.delete('/api/vendor-contracts/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVendorContract(id);
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
      const history = await storage.getVendorHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching vendor history:", error);
      res.status(500).json({ message: "Failed to fetch vendor history" });
    }
  });

  app.get('/api/strata/:id/vendor-history', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const history = await storage.getStrataVendorHistory(id);
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
      const history = await storage.createVendorHistory(historyData);
      res.json(history);
    } catch (error) {
      console.error("Error creating vendor history:", error);
      res.status(500).json({ message: "Failed to create vendor history" });
    }
  });

  app.patch('/api/vendor-history/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const history = await storage.updateVendorHistory(id, req.body);
      res.json(history);
    } catch (error) {
      console.error("Error updating vendor history:", error);
      res.status(500).json({ message: "Failed to update vendor history" });
    }
  });

  app.delete('/api/vendor-history/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVendorHistory(id);
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
      const meetings = await storage.getStrataMeetings(id);
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
      const meeting = await storage.createMeeting(meetingData);
      
      // Send meeting invitations if invitees are specified
      if (req.body.invitees && req.body.invitees.length > 0) {
        try {
          console.log('📧 Sending meeting invitations to invitees...');
          
          // Get strata information
          const strata = await storage.getStrata(id);
          if (!strata) {
            console.warn('⚠️ Strata not found for meeting invitations');
          } else {
            // Get organizer information (current user)
            const organizerEmail = req.user?.email;
            let organizer = null;
            
            if (organizerEmail) {
              organizer = await storage.getUserByEmail(organizerEmail);
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
            const allUsers = await storage.getStrataUsers(id);
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
                  
                  await storage.createNotification(notificationData);
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
      const existingMeeting = await storage.getMeeting(meetingId);
      
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
      
      // Upload audio file to Vercel Blob
      const audioUrl = await uploadToBlob(
        req.file.buffer,
        `audio-recordings/${fileName}`,
        req.file.mimetype
      );
      
      // Update meeting with audio URL first
      console.log('📝 Updating meeting with audio URL...');
      await storage.updateMeeting(meetingId, { audioUrl });
      
      // Transcribe the audio using OpenAI Whisper
      console.log('🎯 Starting audio transcription...');
      const { transcribeAudio } = await import('./openai.js');
      const transcription = await transcribeAudio(req.file.buffer, req.file.originalname);
      
      console.log('✅ Audio transcription completed:', transcription.length, 'characters');
      
      // Update meeting with transcription
      console.log('📝 Updating meeting with transcription...');
      await storage.updateMeeting(meetingId, { 
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
      const meeting = await storage.getMeeting(meetingId);
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
      await storage.updateMeeting(meetingId, { minutes });

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
      
      await storage.updateMeeting(meetingId, updateData);
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
      const documents = await storage.getStrataDocuments(id);
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
      const document = await storage.createDocument(documentData);
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
      const requests = await storage.getStrataMaintenanceRequests(id);
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
      const request = await storage.createMaintenanceRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      res.status(500).json({ message: "Failed to create maintenance request" });
    }
  });

  app.patch('/api/maintenance/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const request = await storage.updateMaintenanceRequest(id, req.body);
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
      const projects = await storage.getStrataMaintenanceProjects(id);
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

      // Auto-update status based on dates
      if (req.body.completedDate) {
        projectData.status = 'completed';
      } else if (req.body.scheduledDate && projectData.status !== 'in-progress') {
        projectData.status = 'scheduled';
      }

      const project = await storage.createMaintenanceProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating maintenance project:", error);
      res.status(500).json({ message: "Failed to create maintenance project" });
    }
  });

  app.get('/api/maintenance/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getMaintenanceProject(id);
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

      // Get current project to check current status
      const currentProject = await storage.getMaintenanceProject(id);

      const updateData = {
        ...req.body,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : undefined,
        completedDate: req.body.completedDate ? new Date(req.body.completedDate) : undefined,
        nextServiceDate: req.body.nextServiceDate ? new Date(req.body.nextServiceDate) : undefined,
      };

      // Auto-update status based on dates (only if status isn't explicitly being changed)
      if (!req.body.status) {
        if (req.body.completedDate) {
          updateData.status = 'completed';
        } else if (req.body.scheduledDate && currentProject?.status !== 'in-progress' && currentProject?.status !== 'completed') {
          updateData.status = 'scheduled';
        }
      }

      const project = await storage.updateMaintenanceProject(id, updateData);
      res.json(project);
    } catch (error) {
      console.error("Error updating maintenance project:", error);
      res.status(500).json({ message: "Failed to update maintenance project" });
    }
  });

  app.patch('/api/maintenance/:id/archive', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const project = await storage.updateMaintenanceProject(id, { archived: true });
      res.json(project);
    } catch (error) {
      console.error("Error archiving maintenance project:", error);
      res.status(500).json({ message: "Failed to archive maintenance project" });
    }
  });

  app.patch('/api/maintenance/:id/unarchive', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const project = await storage.updateMaintenanceProject(id, { archived: false });
      res.json(project);
    } catch (error) {
      console.error("Error unarchiving maintenance project:", error);
      res.status(500).json({ message: "Failed to unarchive maintenance project" });
    }
  });

  app.delete('/api/maintenance/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMaintenanceProject(id);
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
      const announcements = await storage.getStrataAnnouncements(id);
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });

  app.post('/api/strata/:id/announcements', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const announcementData = insertAnnouncementSchema.parse({
        ...req.body,
        strataId: id,
        publishedBy: userId,
        recurringEndDate: req.body.recurringEndDate ? new Date(req.body.recurringEndDate) : undefined
      });
      const announcement = await storage.createAnnouncement(announcementData);

      // Send push notifications to all users in the strata
      try {
        const announcementPreview = announcement.content
          ? announcement.content.substring(0, 100)
          : 'New announcement';

        await pushNotificationService.sendToStrata(id, {
          title: 'New Announcement',
          body: `${announcement.title}: ${announcementPreview}`,
          data: {
            type: 'announcement',
            strataId: id,
            resourceId: announcement.id
          }
        });
        console.log('📱 Push notification sent for new announcement');
      } catch (pushError) {
        console.error('⚠️ Failed to send push notifications for announcement:', pushError);
        // Don't fail the request if push notifications fail
      }

      // Create in-app notifications and send emails for all users in the strata
      try {
        const userAccess = await storage.getStrataUsers(id);
        const strata = await storage.getStrata(id);
        const strataName = strata?.name || 'Your Strata';
        console.log(`📬 Creating announcement notifications for ${userAccess.length} users`);

        // Dynamically import email service
        const { sendNotificationEmail } = await import('./email-service.js');

        for (const userAccessRecord of userAccess) {
          // Don't notify the author of their own announcement
          if (userAccessRecord.userId === userId) continue;

          // Create in-app notification
          await storage.createNotification({
            userId: userAccessRecord.userId,
            strataId: id,
            type: 'announcement',
            relatedId: announcement.id,
            title: 'New Announcement',
            message: `${announcement.title}`,
          });

          // Get user details for email
          try {
            const user = await storage.getUser(userAccessRecord.userId);
            if (user && user.email) {
              // Send email notification
              await sendNotificationEmail({
                userId: userAccessRecord.userId,
                userEmail: user.email,
                strataId: id,
                strataName: strataName,
                notificationType: 'announcement',
                title: announcement.title,
                message: announcement.content || 'A new announcement has been posted.',
                metadata: {
                  announcement_type: announcement.announcementType || 'general',
                  priority: announcement.priority || 'normal',
                  posted_by: announcement.publishedBy
                }
              });
              console.log(`📧 Announcement email sent to ${user.email}`);
            }
          } catch (emailError) {
            console.error(`❌ Failed to send email to user ${userAccessRecord.userId}:`, emailError);
            // Continue with other users even if one email fails
          }
        }
        console.log('✅ Announcement notifications and emails sent');
      } catch (notifError) {
        console.error('❌ Error creating announcement notifications:', notifError);
        // Don't fail the request if notification fails
      }

      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });

  app.patch('/api/announcements/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Get the announcement to check permissions
      const announcement = await storage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      // Check if user can edit (creator or admin)
      const userAccess = await storage.getUserStrataAccess(userId, announcement.strataId);
      const canEdit = announcement.publishedBy === userId || userAccess?.role === 'admin' || userAccess?.role === 'chairperson';
      
      if (!canEdit) {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      const updatedAnnouncement = await storage.updateAnnouncement(id, req.body);
      res.json(updatedAnnouncement);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Failed to update announcement" });
    }
  });

  app.delete('/api/announcements/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id; // Fixed: use req.user instead of req.user

      // Get the announcement to check permissions
      const announcement = await storage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      // Check if user can delete (creator or admin)
      const userAccess = await storage.getUserStrataAccess(userId, announcement.strataId);
      const canDelete = announcement.publishedBy === userId || userAccess?.role === 'admin' || userAccess?.role === 'chairperson';
      
      if (!canDelete) {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      await storage.deleteAnnouncement(id);
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
      const users = await storage.getStrataUsers(id);
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
      const userEmail = req.user?.email || req.user?.email || req.user?.email;
      
      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Special case for master admin
      if (userEmail === 'rfinnbogason@gmail.com') {
        return res.json({ role: 'master_admin' });
      }

      let user;
      let userAccess;

      const dbUser = await storage.getUserByEmail(userEmail);
      if (!dbUser) {
        return res.json({ role: 'resident' });
      }
      user = dbUser;
      userAccess = await storage.getUserStrataAccess(dbUser.id, id);
      
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
      const userAccess = await storage.createUserStrataAccess(accessData);
      res.json(userAccess);
    } catch (error) {
      console.error("Error adding user to strata:", error);
      res.status(500).json({ message: "Failed to add user" });
    }
  });

  app.patch('/api/strata-access/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userAccess = await storage.updateUserStrataAccess(id, req.body);
      res.json(userAccess);
    } catch (error) {
      console.error("Error updating user access:", error);
      res.status(500).json({ message: "Failed to update user access" });
    }
  });

  app.delete('/api/strata-access/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUserStrataAccess(id);
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
      if (!req.user?.email === 'rfinnbogason@gmail.com' && !req.user?.email === 'rfinnbogason@gmail.com' && !req.user?.claims?.email === 'rfinnbogason@gmail.com') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const { userId } = req.params;
      const assignments = await storage.getUserStrataAssignments(userId);
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
      await storage.deleteUserStrataAccess(userId);
      res.json({ message: "User access removed successfully" });
    } catch (error) {
      console.error("Error removing user access:", error);
      res.status(500).json({ message: "Failed to remove user access" });
    }
  });

  app.patch('/api/strata-admin/users/:userId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const updatedUser = await storage.updateUser(userId, req.body);
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
      const updatedAccess = await storage.updateUserStrataAccess(accessId, req.body);
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
      let user = await storage.getUserByEmail(email);
      if (!user) {
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        user = await storage.createUser({
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
      const userAccess = await storage.createUserStrataAccess({
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
      if (!req.user?.email === 'rfinnbogason@gmail.com' && !req.user?.email === 'rfinnbogason@gmail.com' && !req.user?.claims?.email === 'rfinnbogason@gmail.com') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const registrations = await storage.getPendingRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching pending registrations:", error);
      res.status(500).json({ message: "Failed to fetch pending registrations" });
    }
  });

  app.post('/api/admin/pending-registrations/:id/approve', isAuthenticatedUnified, async (req: any, res) => {
    try {
      // Check if user is admin
      if (!req.user?.email === 'rfinnbogason@gmail.com' && !req.user?.email === 'rfinnbogason@gmail.com' && !req.user?.claims?.email === 'rfinnbogason@gmail.com') {
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

      await storage.approveStrataRegistration(id, fullSubscriptionData);
      res.json({ message: "Registration approved successfully with subscription settings" });
    } catch (error) {
      console.error("Error approving registration:", error);
      res.status(500).json({ message: "Failed to approve registration" });
    }
  });

  app.post('/api/admin/pending-registrations/:id/reject', isAuthenticatedUnified, async (req: any, res) => {
    try {
      // Check if user is admin
      if (!req.user?.email === 'rfinnbogason@gmail.com' && !req.user?.email === 'rfinnbogason@gmail.com' && !req.user?.claims?.email === 'rfinnbogason@gmail.com') {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const { id } = req.params;
      await storage.rejectStrataRegistration(id);
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
      const hasAccess = await storage.checkUserStrataAdminAccess(req.user.claims.sub, strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden: Admin access required for this strata" });
      }

      // Hash the temporary password
      const hashedPassword = await bcrypt.hash(userData.temporaryPassword, 10);
      
      // Create the user
      const newUser = await storage.createUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        passwordHash: hashedPassword,
        isActive: true,
      });

      // Assign user to strata with specified role
      await storage.createUserStrataAccess({
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
      const userAccess = await storage.getUserStrataAssignments(req.user.claims.sub);
      const adminStrataIds = userAccess
        .filter((access: any) => ['chairperson', 'property_manager', 'treasurer', 'secretary'].includes(access.role))
        .map((access: any) => access.strataId);

      if (adminStrataIds.length === 0) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      // Update user data
      const updatedUser = await storage.updateUser(userId, userData);
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
      const currentAccess = await storage.getUserStrataAccessById(accessId);
      if (!currentAccess) {
        return res.status(404).json({ message: "Access record not found" });
      }

      // Check if user has admin access to this strata
      const hasAccess = await storage.checkUserStrataAdminAccess(req.user.claims.sub, currentAccess.strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden: Admin access required for this strata" });
      }

      // Update the access record
      const updatedAccess = await storage.updateUserStrataAccess(accessId, accessData);
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
      const userAccess = await storage.getUserStrataAssignments(req.user.claims.sub);
      const adminStrataIds = userAccess
        .filter((access: any) => ['chairperson', 'property_manager', 'treasurer', 'secretary'].includes(access.role))
        .map((access: any) => access.strataId);

      if (adminStrataIds.length === 0) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }

      // Remove user's strata access and deactivate user
      await storage.removeUserFromAllStrata(userId);
      await storage.updateUser(userId, { isActive: false });
      
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
      
      // Fetch folders
      const folders = await storage.getStrataDocumentFolders(id, parent);
      
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
        const parentFolder = await storage.getDocumentFolder(req.body.parentFolderId);
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
      
      const folder = await storage.createDocumentFolder(folderData);
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
      const folder = await storage.updateDocumentFolder(id, req.body);
      res.json(folder);
    } catch (error) {
      console.error("Error updating document folder:", error);
      res.status(500).json({ message: "Failed to update document folder" });
    }
  });

  app.delete('/api/document-folders/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDocumentFolder(id);
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
        documents = await storage.searchDocuments(id, search);
      } else if (folder) {
        documents = await storage.getFolderDocuments(folder);
      } else {
        documents = await storage.getStrataDocuments(id);
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
      if (!payload.email === 'rfinnbogason@gmail.com') {
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
      
      // Upload file to Vercel Blob
      const fileName = `documents/${id}/${Date.now()}_${file.originalname}`;
      const fileUrl = await uploadToBlob(file.buffer, fileName, file.mimetype);
      
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
      const document = await storage.createDocument(documentData);
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
      const document = await storage.updateDocument(id, req.body);
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  app.delete('/api/documents/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDocument(id);
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
        results.folders = await storage.searchDocumentFolders(id, searchTerm);
      }
      
      if (!type || type === 'documents') {
        results.documents = await storage.searchDocuments(id, searchTerm);
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
      const strata = await storage.getStrata(strataId);
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
      const updatedStrata = await storage.updateStrata(strataId, { feeStructure });
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
      console.log('💰 Fetching financial summary for strata:', strataId);

      const expenses = await storage.getStrataExpenses(strataId);
      const strata = await storage.getStrata(strataId);
      const units = await storage.getStrataUnits(strataId);

      console.log('📊 Units found:', units.length);
      console.log('📊 Expenses found:', expenses.length);

      // Debug: Log each expense's recurring details
      expenses.forEach((expense: any, index: number) => {
        console.log(`📋 Expense ${index + 1}: ${expense.description || expense.category} - Amount: $${expense.amount}, isRecurring: ${expense.isRecurring}, frequency: ${expense.recurringFrequency}`);
      });

      // Calculate total expenses (all time)
      const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + parseFloat(expense.amount || '0'), 0);

      // Calculate monthly expenses (current month only)
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Separate recurring expenses from one-time expenses
      const recurringExpenses = expenses.filter((expense: any) => expense.isRecurring === true);
      const oneTimeExpenses = expenses.filter((expense: any) => !expense.isRecurring);

      // Filter one-time expenses to current month only
      const currentMonthOneTimeExpenses = oneTimeExpenses.filter((expense: any) => {
        const expenseDate = expense.date ? new Date(expense.date) :
                          expense.createdAt?._seconds ? new Date(expense.createdAt._seconds * 1000) :
                          expense.createdAt ? new Date(expense.createdAt) : null;
        if (!expenseDate) return false;
        return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd;
      });

      // Calculate monthly contribution from recurring expenses (prorated based on frequency)
      const recurringMonthlyTotal = recurringExpenses.reduce((sum: number, expense: any) => {
        const amount = parseFloat(expense.amount || '0');
        const frequency = expense.recurringFrequency?.toLowerCase();

        if (frequency === 'annually' || frequency === 'yearly' || frequency === 'annual') {
          // Annual expenses: divide by 12 to get monthly amount
          return sum + (amount / 12);
        } else if (frequency === 'quarterly') {
          // Quarterly expenses: divide by 3 to get monthly amount
          return sum + (amount / 3);
        } else if (frequency === 'weekly') {
          // Weekly expenses: multiply by ~4.33 weeks per month
          return sum + (amount * 4.33);
        }
        // Monthly or unspecified frequency: use full amount
        return sum + amount;
      }, 0);

      // Calculate one-time expenses from current month
      const oneTimeMonthlyTotal = currentMonthOneTimeExpenses.reduce((sum: number, expense: any) => {
        return sum + parseFloat(expense.amount || '0');
      }, 0);

      // Total monthly expenses = recurring (prorated) + one-time (current month)
      const monthlyExpensesTotal = recurringMonthlyTotal + oneTimeMonthlyTotal;

      console.log('📊 Recurring expenses:', recurringExpenses.length, 'Monthly prorated:', recurringMonthlyTotal);
      console.log('📊 One-time expenses this month:', currentMonthOneTimeExpenses.length, 'Total:', oneTimeMonthlyTotal);
      console.log('📊 Total monthly expenses:', monthlyExpensesTotal);

      const pendingExpenses = expenses.filter((e: any) => e.status === 'pending').length;
      const approvedExpenses = expenses.filter((e: any) => e.status === 'approved').length;
      
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
      const funds = await storage.getStrataFunds(strataId);
      const reserveFund = funds.find(f => f.type === 'reserve');
      const reserveBalance = reserveFund ? parseFloat(reserveFund.balance) : 125000;
      const reserveTarget = reserveFund?.target ? parseFloat(reserveFund.target) : 150000;
      
      // TODO: Implement proper payment tracking system
      // For now, calculate outstanding fees based on overdue payment reminders
      const paymentReminders = await storage.getStrataPaymentReminders(strataId);
      const overdueReminders = paymentReminders.filter((reminder: any) => {
        if (!reminder.dueDate) return false;
        const dueDate = new Date(reminder.dueDate);
        return dueDate < new Date() && reminder.status !== 'paid' && reminder.status !== 'cancelled';
      });

      const outstandingFees = overdueReminders.reduce((sum: number, reminder: any) => {
        return sum + (reminder.amount || 0);
      }, 0);

      const summary = {
        totalRevenue: monthlyRevenue * 12, // Annual revenue
        monthlyRevenue: monthlyRevenue, // Monthly revenue
        monthlyExpenses: monthlyExpensesTotal, // Current month's expenses only
        totalExpenses: totalExpenses, // All-time expenses for reference
        reserveFund: reserveBalance,
        reserveTarget: reserveTarget,
        pendingExpenses,
        approvedExpenses,
        outstandingFees: outstandingFees // Actual overdue payments
      };

      console.log('💰 Financial summary calculated:', JSON.stringify(summary, null, 2));

      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });

  // Payment Reminders API endpoints
  app.get('/api/financial/reminders/:strataId', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const reminders = await storage.getStrataPaymentReminders(strataId);
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
        createdBy: req.user.id,
      });

      // Special handling for monthly strata fee with "all units"
      if (reminderData.reminderType === 'monthly_strata_fee' && !reminderData.unitId) {
        // Get all units for this strata
        const units = await storage.getStrataUnits(reminderData.strataId);
        const createdReminders = [];

        // Create individual reminders for each unit
        for (const unit of units) {
          const unitReminder = await storage.createPaymentReminder({
            ...reminderData,
            unitId: unit.id,
            title: `${reminderData.title} - Unit ${unit.unitNumber}`,
          });
          createdReminders.push(unitReminder);

          // Create notification for unit owner
          if (unit.ownerEmail) {
            // Get user by email to find userId
            const strataUsers = await storage.getStrataUsers(reminderData.strataId);
            const unitOwner = strataUsers.find((su: any) => su.user?.email === unit.ownerEmail);

            if (unitOwner) {
              const dueDate = reminderData.dueDate ? new Date(reminderData.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
              await storage.createNotification({
                userId: unitOwner.userId || unitOwner.id,
                strataId: reminderData.strataId,
                type: 'payment_reminder',
                title: 'Payment Reminder',
                message: `${reminderData.title}${reminderData.amount ? ` - $${reminderData.amount}` : ''}${reminderData.dueDate ? ` - Due: ${dueDate}` : ''}`,
                relatedId: unitReminder.id,
                isRead: false,
                metadata: {
                  reminderId: unitReminder.id,
                  amount: reminderData.amount,
                  dueDate: reminderData.dueDate,
                  reminderType: reminderData.reminderType,
                  unitNumber: unit.unitNumber
                }
              });
            }
          }
        }

        res.status(201).json({
          message: `Created ${createdReminders.length} reminders`,
          reminders: createdReminders
        });
      } else {
        // Regular reminder creation
        const reminder = await storage.createPaymentReminder(reminderData);

        // Create notification for unit owner if applicable
        if (reminderData.unitId) {
          const units = await storage.getStrataUnits(reminderData.strataId);
          const unit = units.find((u: any) => u.id === reminderData.unitId);

          if (unit && unit.ownerEmail) {
            // Get user by email to find userId
            const strataUsers = await storage.getStrataUsers(reminderData.strataId);
            const unitOwner = strataUsers.find((su: any) => su.user?.email === unit.ownerEmail);

            if (unitOwner) {
              const dueDate = reminderData.dueDate ? new Date(reminderData.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD';
              await storage.createNotification({
                userId: unitOwner.userId || unitOwner.id,
                strataId: reminderData.strataId,
                type: 'payment_reminder',
                title: 'Payment Reminder',
                message: `${reminderData.title}${reminderData.amount ? ` - $${reminderData.amount}` : ''}${reminderData.dueDate ? ` - Due: ${dueDate}` : ''}`,
                relatedId: reminder.id,
                isRead: false,
                metadata: {
                  reminderId: reminder.id,
                  amount: reminderData.amount,
                  dueDate: reminderData.dueDate,
                  reminderType: reminderData.reminderType,
                  unitNumber: unit.unitNumber
                }
              });
            }
          }
        }

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
      const reminder = await storage.updatePaymentReminder(id, reminderData);
      res.json(reminder);
    } catch (error) {
      console.error("Error updating payment reminder:", error);
      res.status(500).json({ message: "Failed to update payment reminder" });
    }
  });

  app.delete('/api/financial/reminders/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deletePaymentReminder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting payment reminder:", error);
      res.status(500).json({ message: "Failed to delete payment reminder" });
    }
  });

  app.get('/api/financial/reminders/:strataId/overdue', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const overdueReminders = await storage.getOverdueReminders(strataId);
      res.json(overdueReminders);
    } catch (error) {
      console.error("Error fetching overdue reminders:", error);
      res.status(500).json({ message: "Failed to fetch overdue reminders" });
    }
  });

  app.get('/api/financial/reminders/:strataId/recurring', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { strataId } = req.params;
      const recurringReminders = await storage.getActiveRecurringReminders(strataId);
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
      let funds = await storage.getStrataFunds(id);
      
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
            await storage.createFund(fundData);
          } catch (error) {
            console.error("Error creating default fund:", error);
          }
        }

        // Fetch the newly created funds
        funds = await storage.getStrataFunds(id);
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
      const fund = await storage.createFund(fundData);
      res.json(fund);
    } catch (error) {
      console.error("Error creating fund:", error);
      res.status(500).json({ message: "Failed to create fund" });
    }
  });

  app.patch('/api/funds/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const fund = await storage.updateFund(id, req.body);
      res.json(fund);
    } catch (error) {
      console.error("Error updating fund:", error);
      res.status(500).json({ message: "Failed to update fund" });
    }
  });

  app.delete('/api/funds/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFund(id);
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
      const transactions = await storage.getFundTransactions(id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching fund transactions:", error);
      res.status(500).json({ message: "Failed to fetch fund transactions" });
    }
  });

  app.post('/api/funds/:id/transactions', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const transactionData = insertFundTransactionSchema.parse({
        ...req.body,
        fundId: id,
        processedBy: userId
      });
      const transaction = await storage.createFundTransaction(transactionData);
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
      const projections = await storage.calculateFundProjections(id, years);
      res.json(projections);
    } catch (error) {
      console.error("Error calculating fund projections:", error);
      res.status(500).json({ message: "Failed to calculate fund projections" });
    }
  });

  // Meeting routes
  app.get("/api/strata/:strataId/meetings", isAuthenticatedUnified, async (req, res) => {
    try {
      const meetings = await storage.getStrataMeetings(req.params.strataId);
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
      
      const meeting = await storage.createMeeting(meetingData);
      res.json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.get("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
    try {
      const meeting = await storage.getMeeting(req.params.meetingId);
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
      
      const meeting = await storage.updateMeeting(req.params.meetingId, updateData);
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
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        console.log('❌ Meeting not found:', meetingId);
        return res.status(404).json({ 
          message: "Meeting not found. Please refresh the page and try again.",
          meetingId 
        });
      }
      
      // Actually delete the meeting from database
      await storage.deleteMeeting(meetingId);
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
      
      await storage.updateMeeting(meetingId, { 
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
      const strata = await storage.getAllStrata();
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
      const strata = await storage.createStrata(strataData);
      res.json(strata);
    } catch (error) {
      console.error("Error creating strata:", error);
      res.status(500).json({ message: "Failed to create strata" });
    }
  });

  app.patch('/api/admin/strata/:id', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const strata = await storage.updateStrata(id, req.body);
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
      await storage.deleteStrata(id);
      res.json({ message: "Strata and all associated data deleted successfully" });
    } catch (error) {
      console.error("Error deleting strata:", error);
      res.status(500).json({ message: "Failed to delete strata" });
    }
  });

  app.get('/api/admin/strata/:id', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { id } = req.params;
      const strata = await storage.getStrata(id);
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
      const { subscriptionTier, monthlyRate, isFreeForever, extendDays, subscriptionStatus } = req.body;

      // ✅ INPUT VALIDATION: Validate extendDays
      if (extendDays !== undefined) {
        const days = parseInt(extendDays);
        if (isNaN(days) || days < 1 || days > 365) {
          return res.status(400).json({
            message: "Invalid input: Days to extend must be between 1 and 365"
          });
        }
      }

      // ✅ INPUT VALIDATION: Validate monthlyRate
      if (monthlyRate !== undefined) {
        const rate = parseFloat(monthlyRate);
        if (isNaN(rate) || rate < 0) {
          return res.status(400).json({
            message: "Invalid input: Monthly rate must be a positive number"
          });
        }
      }

      // Get current strata to access current subscription
      const currentStrata = await storage.getStrata(id);
      const currentSubscription = (currentStrata as any)?.subscription || {};

      // Calculate trial end date
      let trialEndDate = null;
      let trialStartDate = null;

      if (subscriptionTier === 'trial') {
        if (extendDays) {
          // Extending existing trial - add days to current trial end date
          const currentTrialEnd = currentSubscription.trialEndDate;
          if (currentTrialEnd) {
            // Convert Firestore timestamp to Date
            const currentEndDate = currentTrialEnd.toDate ? currentTrialEnd.toDate() : new Date(currentTrialEnd);
            trialEndDate = new Date(currentEndDate);
            trialEndDate.setDate(trialEndDate.getDate() + extendDays);
          } else {
            // No current trial end date, set new one
            trialEndDate = new Date();
            trialEndDate.setDate(trialEndDate.getDate() + (extendDays || 30));
          }
          trialStartDate = currentSubscription.trialStartDate || new Date();
        } else {
          // Resetting to new trial - 30 days from now
          trialStartDate = new Date();
          trialEndDate = new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 30);
        }
      }

      // Build subscription update data
      const subscriptionData: any = {
        'subscription.tier': subscriptionTier || currentSubscription.tier,
        'subscription.monthlyRate': monthlyRate !== undefined ? monthlyRate : currentSubscription.monthlyRate,
        'subscription.isFreeForever': isFreeForever !== undefined ? isFreeForever : currentSubscription.isFreeForever,
        'subscription.status': subscriptionStatus || (subscriptionTier === 'trial' ? 'trial' :
                           subscriptionTier === 'cancelled' ? 'cancelled' :
                           isFreeForever ? 'free' : 'active'),
      };

      if (trialEndDate) {
        subscriptionData['subscription.trialEndDate'] = trialEndDate;
      }
      if (trialStartDate) {
        subscriptionData['subscription.trialStartDate'] = trialStartDate;
      }

      // Update strata with new subscription data
      await storage.updateStrata(id, subscriptionData);

      // Fetch updated strata to return
      const updatedStrata = await storage.getStrata(id);
      res.json(updatedStrata);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.get('/api/admin/users', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      console.log("Admin user creation - Request body:", req.body);
      const { email, firstName, lastName, role, temporaryPassword } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash the temporary password
      const passwordHash = await bcrypt.hash(temporaryPassword, 12);

      // Create user in PostgreSQL
      const user = await storage.createUser({
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: null,
        role: role || 'resident',
        isActive: true,
        passwordHash,
        mustChangePassword: true,
      });

      res.json({
        ...user,
        temporaryPassword,
      });
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
      
      const user = await storage.updateUser(userId, updateData);
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
      console.log("DELETE user request - user:", req.user?.email || req.user?.email);
      
      const { userId } = req.params;
      
      // First check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("Deleting user:", user.email);
      
      // Delete user and all related data
      await storage.deleteUser(userId);
      
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
      const users = await storage.getStrataUsers(strataId);
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

  // Debug endpoint to see what's stored
  app.get('/api/debug/db-data-summary', async (req: any, res) => {
    try {
      const userAccess = await storage.getAllUserStrataAccess();
      const strata = await storage.getAllStrata();
      const users = await storage.getAllUsers();

      res.json({
        userAccess,
        strata: strata.map(s => ({ id: s.id, name: s.name })),
        users: users.map(u => ({ id: u.id, email: u.email }))
      });
    } catch (error: any) {
      console.error('Debug error:', error);
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
      const existingAccess = await storage.getUserStrataAccess(userId, strataId);
      if (existingAccess) {
        console.log('Updating existing access from', existingAccess.role, 'to', role);
        const updatedAccess = await storage.updateUserStrataRole(userId, strataId, role);
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
      
      const access = await storage.createUserStrataAccess(accessData);
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
      const updatedAccess = await storage.updateUserStrataAccess(accessId, req.body);
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
      await storage.deleteUserStrataAccess(accessId);
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
      await storage.updateStrataSubscription(strataId, subscriptionData);
      res.json({ message: "Subscription updated successfully" });
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.delete('/api/admin/user-access/:accessId', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { accessId } = req.params;
      await storage.deleteUserStrataAccess(accessId);
      res.json({ message: "User access removed successfully" });
    } catch (error) {
      console.error("Error removing user access:", error);
      res.status(500).json({ message: "Failed to remove user access" });
    }
  });

  // Get user strata assignments (for admin user management)
  app.get('/api/get-user-assignments/:userId', async (req: any, res) => {
    try {
      const { userId } = req.params;
      console.log('🔍 Fetching all assignments for userId:', userId);

      if (userId === 'master-admin') {
        console.log('📊 Master admin - returning empty assignments');
        return res.json([]);
      }

      // Get all user strata assignments
      const assignments = await storage.getUserStrataAssignments(userId);
      console.log(`📊 Found ${assignments.length} assignment(s) for user ${userId}`);

      res.json(assignments);
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
      const userId = req.user?.id || req.user?.id || 'master-admin';

      console.log('📬 Fetching messages for strata:', id, 'User:', userId);

      const messages = await storage.getMessagesByStrata(id);
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
          id: req.user?.id,
          email: req.user?.email,
        }
      });

      const { id } = req.params;
      const userId = req.user?.id || 'master-admin';
      const { recipientIds, isGroupChat, ...bodyData } = req.body;
      
      const user = req.user;
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
      
      const message = await storage.createMessage(messageData);

      // Create notifications for all recipients
      console.log('📬 Creating notifications for recipients:', uniqueRecipientIds);
      for (const recipientId of uniqueRecipientIds) {
        const notificationData = {
          userId: recipientId,
          strataId: id,
          type: 'message',
          title: `New message from ${senderName}`,
          message: isGroupChat
            ? `Group chat: ${bodyData.subject || 'New message'}`
            : bodyData.subject || 'New private message',
          relatedId: message.id,
          isRead: false,
          metadata: {
            messageId: message.id,
            senderId: userIdToUse,
            senderName: senderName,
            subject: bodyData.subject || 'New message',
            isGroupChat: isGroupChat
          }
        };
        console.log('📬 Creating notification:', notificationData);
        await storage.createNotification(notificationData);
      }
      console.log(`✅ Created ${uniqueRecipientIds.length} notifications`);

      // Send push notifications to all recipients
      try {
        const messagePreview = bodyData.content
          ? bodyData.content.substring(0, 100)
          : (bodyData.subject || 'New message');

        await pushNotificationService.sendToUsers(uniqueRecipientIds, {
          title: `New message from ${senderName}`,
          body: messagePreview,
          data: {
            type: 'message',
            strataId: id,
            resourceId: message.id
          }
        });
        console.log('📱 Push notifications sent to', uniqueRecipientIds.length, 'recipients');
      } catch (pushError) {
        console.error('⚠️ Failed to send push notifications:', pushError);
        // Don't fail the request if push notifications fail
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
      const userId = req.user?.email || req.user?.email || 'master-admin';
      
      console.log(`📖 Marking message ${id} as read for user ${userId}`);
      
      await storage.markMessageAsRead(id, userId);
      res.json({ message: "Message marked as read", messageId: id });
    } catch (error) {
      console.error("❌ Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read: " + error.message });
    }
  });

  app.delete('/api/conversations/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Delete all messages in the conversation where user is sender or recipient
      await storage.deleteConversation(id, userId);
      
      res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });

  // Announcement routes
  app.get('/api/strata/:id/announcements', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      console.log('📢 Fetching announcements for strata:', id);

      // Verify user has access to this strata
      const hasAccess = await storage.verifyUserStrataAccess(userId, id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Unauthorized access to this strata" });
      }

      const announcements = await storage.getStrataAnnouncements(id);
      console.log('📢 Found announcements:', announcements?.length || 0);

      res.json(announcements || []);
    } catch (error) {
      console.error('❌ Error fetching announcements:', error);
      res.status(500).json({
        message: "Failed to fetch announcements",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.post('/api/strata/:id/announcements', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id: strataId } = req.params;
      const userId = req.user.id;
      const userName = req.user.name || req.user.email;

      console.log('📢 Creating announcement for strata:', strataId);

      // Verify user has access and permission to post announcements
      const hasAccess = await storage.verifyUserStrataAccess(userId, strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Unauthorized access to this strata" });
      }

      // Validate announcement data
      const announcementData = {
        ...req.body,
        strataId,
        authorId: userId,
        authorName: userName,
        views: 0,
        readBy: [],
        isPinned: req.body.isPinned || false,
        isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
        isRecurring: req.body.isRecurring || false,
        priority: req.body.priority || 'normal',
        category: req.body.category || 'general',
        publishDate: req.body.publishDate || new Date(),
      };

      const announcement = await storage.createAnnouncement(announcementData);
      console.log('✅ Announcement created:', announcement.id);

      // Create notifications for all users in the strata
      try {
        const userAccess = await storage.getStrataUsers(strataId);
        console.log(`📬 Creating announcement notifications for ${userAccess.length} users`);

        for (const userAccessRecord of userAccess) {
          // Don't notify the author of their own announcement
          if (userAccessRecord.userId === userId) continue;

          await storage.createNotification({
            userId: userAccessRecord.userId,
            strataId,
            type: 'announcement',
            relatedId: announcement.id,
            title: 'New Announcement',
            message: `${userName} posted: ${announcement.title}`,
          });
        }
        console.log('✅ Announcement notifications created');
      } catch (notifError) {
        console.error('❌ Error creating announcement notifications:', notifError);
        // Don't fail the request if notification fails
      }

      res.status(201).json(announcement);
    } catch (error) {
      console.error('❌ Error creating announcement:', error);
      res.status(500).json({
        message: "Failed to create announcement",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.patch('/api/announcements/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      console.log('📢 Updating announcement:', id);

      // Get the announcement to verify ownership/access
      const announcement = await storage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      // Verify user has access to the strata
      const hasAccess = await storage.verifyUserStrataAccess(userId, announcement.strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const updatedAnnouncement = await storage.updateAnnouncement(id, req.body);
      console.log('✅ Announcement updated:', id);

      res.json(updatedAnnouncement);
    } catch (error) {
      console.error('❌ Error updating announcement:', error);
      res.status(500).json({
        message: "Failed to update announcement",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.delete('/api/announcements/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      console.log('📢 Deleting announcement:', id);

      // Get the announcement to verify ownership/access
      const announcement = await storage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }

      // Verify user has access to the strata
      const hasAccess = await storage.verifyUserStrataAccess(userId, announcement.strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteAnnouncement(id);
      console.log('✅ Announcement deleted:', id);

      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      console.error('❌ Error deleting announcement:', error);
      res.status(500).json({
        message: "Failed to delete announcement",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Mark announcement as read by user
  app.patch('/api/announcements/:id/read', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      console.log('📢 Marking announcement as read:', id, 'by user:', userId);

      const announcement = await storage.markAnnouncementAsRead(id, userId);
      console.log('✅ Announcement marked as read');

      res.json(announcement);
    } catch (error) {
      console.error('❌ Error marking announcement as read:', error);
      res.status(500).json({
        message: "Failed to mark announcement as read",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Notification mark as read endpoint (duplicate removed - see line 4389)

  // Resident Directory API Routes
  app.get('/api/strata/:id/resident-directory', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const directory = await storage.getStrataResidentDirectory(id);
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
      const entry = await storage.createResidentDirectoryEntry(directoryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating resident directory entry:", error);
      res.status(500).json({ message: "Failed to create directory entry" });
    }
  });

  app.patch('/api/resident-directory/:id', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const entry = await storage.updateResidentDirectoryEntry(id, req.body);
      res.json(entry);
    } catch (error) {
      console.error("Error updating resident directory entry:", error);
      res.status(500).json({ message: "Failed to update directory entry" });
    }
  });

  // Dismissed Notifications API Routes
  app.get('/api/dismissed-notifications', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const dismissed = await storage.getUserDismissedNotifications(userId);
      res.json(dismissed);
    } catch (error) {
      console.error("Error fetching dismissed notifications:", error);
      res.status(500).json({ message: "Failed to fetch dismissed notifications" });
    }
  });

  // Password change API routes
  app.patch('/api/user/password-changed', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userEmail = req.user?.email || req.user?.email;
      
      if (!userEmail) {
        return res.status(400).json({ message: "User email not found" });
      }

      await storage.markPasswordChanged(userEmail);
      res.json({ message: "Password change status updated" });
    } catch (error) {
      console.error('Error updating password change status:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get('/api/user/must-change-password', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userEmail = req.user?.email || req.user?.email;
      
      if (!userEmail) {
        return res.status(400).json({ message: "User email not found" });
      }

      const user = await storage.getUserByEmail(userEmail);
      res.json({ mustChangePassword: user?.mustChangePassword || false });
    } catch (error) {
      console.error('Error checking password change requirement:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin password reset endpoint
  // Admin password reset endpoint
  app.post('/api/admin/reset-password', isAuthenticatedUnified, isAdmin, async (req: any, res) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await storage.updateUser(user.id, { passwordHash, mustChangePassword: true });

      res.json({ message: "Password reset successfully", email });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post('/api/dismissed-notifications', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notificationData = insertDismissedNotificationSchema.parse({
        ...req.body,
        userId: userId
      });
      const dismissed = await storage.dismissNotification(notificationData);
      res.json(dismissed);
    } catch (error) {
      console.error("Error dismissing notification:", error);
      res.status(500).json({ message: "Failed to dismiss notification" });
    }
  });

  // Reports routes
  app.get("/api/strata/:strataId/reports", isAuthenticatedUnified, async (req, res) => {
    try {
      const reports = await storage.getStrataReports(req.params.strataId);
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
      const report = await storage.createReport(reportData);
      res.json(report);
      
      // TODO: Implement background report generation
      // For now, simulate completion after 2 seconds
      const strataId = req.params.strataId;
      const reportId = report.id;
      const reportType = report.reportType;
      const dateRange = report.dateRange;

      setTimeout(async () => {
        try {
          console.log(`📊 Starting ${reportType} report generation for strata ${strataId}, report ID: ${reportId}`);

          // Update status to generating
          await storage.updateReport(reportId, { status: 'generating' });

          let content;
          switch (reportType) {
            case 'financial':
              const defaultDateRange = {
                start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
                end: new Date().toISOString()
              };
              content = await storage.generateFinancialReport(
                strataId,
                dateRange as { start: string; end: string } || defaultDateRange
              );
              break;
            case 'meeting-minutes':
              content = await storage.generateMeetingMinutesReport(
                strataId,
                dateRange as { start: string; end: string } | undefined
              );
              break;
            case 'home-sale-package':
              content = await storage.generateHomeSalePackage(strataId);
              break;
            case 'communications':
              console.log(`🔄 Generating communications report...`);
              content = await storage.generateCommunicationsReport(
                strataId,
                dateRange as { start: string; end: string } | undefined
              );
              console.log(`✅ Communications report content generated:`, {
                announcements: content?.announcements?.length || 0,
                messages: content?.messages?.length || 0
              });
              break;
            case 'maintenance':
              content = await storage.generateMaintenanceReport(
                strataId,
                dateRange as { start: string; end: string } | undefined
              );
              break;
            default:
              console.warn(`⚠️ Unknown report type: ${reportType}`);
              content = { message: "Report generation not implemented for this type" };
          }

          console.log(`✅ ${reportType} report generated successfully, updating status to completed`);
          await storage.updateReport(reportId, {
            status: 'completed',
            content,
            downloadUrl: `/api/reports/${reportId}/download`,
            generatedAt: new Date(),
          });
          console.log(`✅ Report ${reportId} marked as completed`);
        } catch (error: any) {
          console.error(`❌ Error generating ${reportType} report (ID: ${reportId}):`, error);
          console.error(`Error details:`, {
            message: error.message,
            stack: error.stack,
            reportType,
            strataId,
            reportId
          });
          try {
            await storage.updateReport(reportId, {
              status: 'failed',
              error: error.message
            });
            console.log(`❌ Report ${reportId} marked as failed`);
          } catch (updateError) {
            console.error(`❌ Failed to update report status to failed:`, updateError);
          }
        }
      }, 2000);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.get("/api/reports/:reportId", isAuthenticatedUnified, async (req, res) => {
    try {
      const report = await storage.getReport(req.params.reportId);
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
      await storage.deleteReport(req.params.reportId);
      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ message: "Failed to delete report" });
    }
  });

  app.get("/api/reports/:reportId/download", isAuthenticatedUnified, async (req: any, res) => {
    try {
      console.log(`📥 Download request for report: ${req.params.reportId}`);
      console.log(`👤 User: ${req.user?.email || 'unknown'}`);

      const report = await storage.getReport(req.params.reportId);

      if (!report) {
        console.log(`❌ Report not found: ${req.params.reportId}`);
        return res.status(404).json({ message: "Report not found" });
      }

      if (report.status !== 'completed') {
        console.log(`❌ Report not completed: ${req.params.reportId}, status: ${report.status}`);
        return res.status(404).json({ message: "Report not available for download" });
      }

      console.log(`✅ Report found, generating PDF download...`);
      console.log('Report details:', {
        id: report.id,
        title: report.title,
        type: report.reportType,
        status: report.status,
        hasContent: !!report.content
      });

      // Fetch strata information for the header
      let strataInfo = null;
      if (report.strataId) {
        try {
          const strata = await storage.getStrataById(report.strataId);
          if (strata) {
            strataInfo = {
              strataName: strata.name,
              strataUnits: strata.units?.length || strata.numUnits || 0,
              strataAddress: strata.address
            };
          }
        } catch (error) {
          console.warn('Could not fetch strata info for report:', error);
        }
      }

      // Generate PDF
      const { generateReportPDF } = await import('./pdf-generator');

      console.log('🔨 Calling enhanced PDF generator...');
      const pdfBuffer = await generateReportPDF({
        title: report.title,
        reportType: report.reportType,
        content: report.content,
        generatedAt: report.generatedAt,
        dateRange: report.dateRange,
        ...strataInfo
      });

      if (!pdfBuffer || pdfBuffer.length === 0) {
        console.error('❌ Generated PDF buffer is empty');
        return res.status(500).json({ message: "Generated PDF is empty" });
      }

      const filename = `${report.title.replace(/[^a-zA-Z0-9 ]/g, '_')}.pdf`;

      console.log(`📄 Sending PDF: ${filename}, size: ${pdfBuffer.length} bytes`);

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length.toString());
      res.send(pdfBuffer);

      console.log(`✅ PDF download sent successfully`);
    } catch (error: any) {
      console.error("❌ Error downloading report:", error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        message: "Failed to download report",
        error: error.message
      });
    }
  });

  // ========================================
  // Repair Requests
  // ========================================

  // Get all repair requests for a strata
  app.get("/api/strata/:strataId/repair-requests", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const { status, severity, area, submittedBy } = req.query;

      const filters: any = {};
      if (status) filters.status = status;
      if (severity) filters.severity = severity;
      if (area) filters.area = area;
      if (submittedBy) filters.submittedBy = submittedBy;

      const requests = await storage.getRepairRequests(strataId, filters);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching repair requests:", error);
      res.status(500).json({ message: "Failed to fetch repair requests" });
    }
  });

  // Get repair request statistics
  app.get("/api/strata/:strataId/repair-requests/stats", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const stats = await storage.getRepairRequestStats(strataId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching repair request stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get a single repair request
  app.get("/api/repair-requests/:requestId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { requestId } = req.params;
      const request = await storage.getRepairRequest(requestId);

      if (!request) {
        return res.status(404).json({ message: "Repair request not found" });
      }

      res.json(request);
    } catch (error) {
      console.error("Error fetching repair request:", error);
      res.status(500).json({ message: "Failed to fetch repair request" });
    }
  });

  // Create a new repair request
  app.post("/api/strata/:strataId/repair-requests", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user as any;
      const { strataId } = req.params;

      const requestData = {
        ...req.body,
        strataId,
        submittedBy: {
          userId: user.id || user.uid,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          email: user.email,
          phone: req.body.submittedBy?.phone || user.phone,
          unitNumber: req.body.submittedBy?.unitNumber,
          userRole: user.role || 'resident'
        }
      };

      const newRequest = await storage.createRepairRequest(requestData);

      // Create notification for admins
      try {
        const userAccess = await storage.getStrataUsers(strataId);
        console.log(`📬 Found ${userAccess.length} users in strata for repair request notification`);

        const admins = userAccess.filter((u: any) =>
          ['chairperson', 'property_manager', 'master_admin'].includes(u.role)
        );
        console.log(`📬 Found ${admins.length} admins to notify:`, admins.map((a: any) => ({ userId: a.userId, role: a.role })));

        for (const admin of admins) {
          console.log(`📬 Creating notification for admin: ${admin.userId}`);
          await storage.createNotification({
            userId: admin.userId,
            strataId,
            type: 'repair-request',
            relatedId: newRequest.id,
            title: `New ${newRequest.severity} repair request`,
            message: `${requestData.submittedBy.name} submitted: ${newRequest.title}`,
          });
          console.log(`✅ Notification created for admin: ${admin.userId}`);
        }
      } catch (notifError) {
        console.error('❌ Error creating repair request notification:', notifError);
        // Don't fail the request if notification fails
      }

      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error creating repair request:", error);
      res.status(500).json({ message: "Failed to create repair request" });
    }
  });

  // Update a repair request
  app.patch("/api/repair-requests/:requestId", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user as any;
      const { requestId } = req.params;

      const updatedRequest = await storage.updateRepairRequest(
        requestId,
        req.body,
        user.id || user.uid
      );

      // Notify the submitter if status changed
      if (req.body.status && updatedRequest.submittedBy?.userId) {
        try {
          await storage.createNotification({
            userId: updatedRequest.submittedBy.userId,
            strataId: updatedRequest.strataId,
            type: 'repair-request-update',
            relatedId: requestId,
            title: `Repair request ${req.body.status}`,
            message: `Your repair request "${updatedRequest.title}" is now ${req.body.status}`,
          });
        } catch (notifError) {
          console.error('Error creating notification:', notifError);
        }
      }

      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating repair request:", error);
      res.status(500).json({ message: "Failed to update repair request" });
    }
  });

  // Delete a repair request
  app.delete("/api/repair-requests/:requestId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { requestId } = req.params;
      await storage.deleteRepairRequest(requestId);
      res.json({ message: "Repair request deleted successfully" });
    } catch (error) {
      console.error("Error deleting repair request:", error);
      res.status(500).json({ message: "Failed to delete repair request" });
    }
  });

  // Convert repair request to maintenance project
  app.post("/api/repair-requests/:requestId/convert-to-maintenance", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user as any;
      const { requestId } = req.params;

      console.log(`🔄 Converting repair request ${requestId} to maintenance project`);

      // Get the repair request
      const repairRequest = await storage.getRepairRequest(requestId);
      if (!repairRequest) {
        return res.status(404).json({ message: "Repair request not found" });
      }

      // Map repair request area to maintenance category
      const areaToCategory: Record<string, string> = {
        'common-areas': 'other',
        'exterior': 'concrete',
        'unit-specific': 'other',
        'parking': 'parking',
        'landscaping': 'landscaping',
        'utilities-hvac': 'hvac',
        'roof-structure': 'roofing',
        'other': 'other'
      };

      // Map severity to priority
      const severityToPriority: Record<string, string> = {
        'emergency': 'critical',
        'high': 'high',
        'medium': 'medium',
        'low': 'low'
      };

      // Create maintenance project from repair request
      const maintenanceProject = {
        title: repairRequest.title,
        description: repairRequest.description,
        category: areaToCategory[repairRequest.area] || 'other',
        priority: severityToPriority[repairRequest.severity] || 'medium',
        status: 'planned',
        estimatedCost: repairRequest.estimatedCost || 0,
        notes: `Converted from repair request. Submitted by: ${repairRequest.submittedBy.name}` +
               (repairRequest.submittedBy.unitNumber ? ` (Unit ${repairRequest.submittedBy.unitNumber})` : '') +
               (repairRequest.additionalNotes ? `\n\nOriginal notes: ${repairRequest.additionalNotes}` : ''),
        strataId: repairRequest.strataId
      };

      // Create the maintenance project
      const newProject = await storage.createMaintenanceRequest(maintenanceProject);
      console.log(`✅ Created maintenance project ${newProject.id}`);

      // Update repair request status to 'planned'
      await storage.updateRepairRequest(
        requestId,
        { status: 'planned' },
        user.id || user.uid
      );
      console.log(`✅ Updated repair request ${requestId} status to 'planned'`);

      // Create notification for the person who submitted the request
      try {
        await storage.createNotification({
          userId: repairRequest.submittedBy.userId,
          strataId: repairRequest.strataId,
          type: 'repair-request',
          relatedId: newProject.id,
          title: 'Repair request approved',
          message: `Your repair request "${repairRequest.title}" has been converted to a maintenance project and is now in planning.`,
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
      }

      res.json({
        message: "Repair request converted to maintenance project successfully",
        maintenanceProject: newProject
      });
    } catch (error) {
      console.error("❌ Error converting repair request to maintenance:", error);
      res.status(500).json({ message: "Failed to convert repair request to maintenance project" });
    }
  });

  // Migration routes removed - Firebase no longer used

  // User Settings Management Endpoints
  
  // Create user profile (handled by /api/auth/signup now, kept for compatibility)
  app.post("/api/user/profile", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const user = req.user;
      const { firstName, lastName, phoneNumber } = req.body;

      await storage.updateUser(user.id, {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
      });

      res.json({
        message: "Profile created successfully",
        user: { email: user.email, firstName, lastName, phoneNumber },
      });
    } catch (error: any) {
      console.error("Failed to create profile:", error);
      res.status(500).json({ message: "Failed to create profile", error: error.message });
    }
  });

  // Get user profile
  app.get("/api/user/profile", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      res.json({
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profileImageUrl: user.profileImageUrl || "",
      });
    } catch (error: any) {
      console.error("Failed to fetch user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Update user profile
  app.patch("/api/user/profile", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { firstName, lastName } = req.body;
      await storage.updateUser(user.id, { firstName, lastName });

      res.json({
        message: "Profile updated successfully",
      });
    } catch (error: any) {
      console.error("Failed to update profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get notification settings
  app.get("/api/user/notification-settings", isAuthenticatedUnified, async (req, res) => {
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
  app.patch("/api/user/notification-settings", isAuthenticatedUnified, async (req, res) => {
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
  app.post("/api/user/test-notification", isAuthenticatedUnified, async (req, res) => {
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

  // Change user password (now handled by /api/auth/change-password, kept for compatibility)
  app.post("/api/user/change-password", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { currentPassword, newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      if (user.passwordHash && currentPassword) {
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);
      await storage.updateUser(user.id, { passwordHash, mustChangePassword: false });

      res.json({ message: "Password changed successfully" });
    } catch (error: any) {
      console.error("Failed to change password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Debug endpoint to check database data
  app.get("/api/debug/db-data", isAuthenticatedUnified, async (req: any, res) => {
    try {
      const strataId = 'b13712fb-8c41-4d4e-b5b4-a8f196b09716';

      const feeTiers = await storage.getStrataFeeTiers(strataId);

      const units = await storage.getStrataUnits(strataId);
      
      res.json({
        feeTiers: feeTiers || [],
        units: units || [],
        strataId: strataId,
        message: "Data retrieved successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("❌ Failed to get data:", error);
      res.status(500).json({ message: "Failed to get data: " + error.message });
    }
  });

  // Notification routes
  app.get('/api/strata/:id/notifications', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userEmail = req.user?.email;

      console.log('🔔 Fetching notifications for:', { strataId: id, userEmail });

      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get user ID from email - use existing method to get strata users
      const strataUsers = await storage.getStrataUsers(id);
      const currentUser = strataUsers.find((su: any) => su.user?.email === userEmail || su.userId === req.user?.id);

      console.log('👤 Current user lookup:', {
        email: userEmail,
        userId: req.user?.id,
        foundUser: currentUser?.userId || currentUser?.id,
        totalUsers: strataUsers.length
      });

      if (!currentUser) {
        console.log('⚠️ User not found in strata, returning empty notifications');
        return res.json([]);
      }

      // Get notifications for this user in this strata
      const userId = currentUser.userId || currentUser.id;
      const notifications = await storage.getUserNotifications(userId, id);
      console.log(`✅ Fetched ${notifications.length} notifications for user ${userId} in strata ${id}`);

      // Debug: Log notification details
      if (notifications.length > 0) {
        console.log('📬 Sample notification data:', JSON.stringify(notifications[0], null, 2));
      }

      res.json(notifications);
    } catch (error) {
      console.error("❌ Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const { id } = req.params;
      console.log('📝 Marking notification as read:', id);
      await storage.markNotificationAsRead(id);
      console.log('✅ Notification marked as read successfully');
      res.json({ success: true });
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Test endpoint to create a sample meeting invitation notification
  app.post('/api/test/meeting-invitation', isAuthenticatedUnified, async (req: any, res) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get current user
      const user = await storage.getUserByEmail(userEmail);
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

      await storage.createNotification(notificationData);
      
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
