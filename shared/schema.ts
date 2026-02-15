import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  numeric,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"),
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  role: varchar("role").notNull().default("resident"),
  mustChangePassword: boolean("must_change_password").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Strata communities
export const strata = pgTable("strata", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }),
  province: varchar("province", { length: 50 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 50 }).default("Canada"),
  phoneNumber: varchar("phone_number", { length: 20 }),
  email: varchar("email", { length: 255 }),
  unitCount: integer("unit_count").notNull(),
  corporationNumber: varchar("corporation_number", { length: 100 }),
  incorporationDate: timestamp("incorporation_date"),
  managementCompany: varchar("management_company", { length: 255 }),
  managementContactName: varchar("management_contact_name", { length: 255 }),
  managementContactEmail: varchar("management_contact_email", { length: 255 }),
  managementContactPhone: varchar("management_contact_phone", { length: 20 }),
  bylawsUrl: varchar("bylaws_url"),
  feeStructure: jsonb("fee_structure"),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, inactive, archived
  notes: text("notes"),
  
  // Subscription fields
  subscriptionStatus: varchar("subscription_status", { length: 50 }).notNull().default("trial"), // trial, active, cancelled, expired, free
  subscriptionTier: varchar("subscription_tier", { length: 50 }).notNull().default("standard"), // standard, premium, free
  monthlyRate: decimal("monthly_rate", { precision: 10, scale: 2 }).default("79.95"),
  trialStartDate: timestamp("trial_start_date"),
  trialEndDate: timestamp("trial_end_date"),
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  lastPaymentDate: timestamp("last_payment_date"),
  nextPaymentDate: timestamp("next_payment_date"),
  isFreeForever: boolean("is_free_forever").default(false),
  
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Units within strata
export const units = pgTable("units", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  unitNumber: varchar("unit_number", { length: 50 }).notNull(),
  unitType: varchar("unit_type", { length: 50 }), // Studio, One Bedroom, Two Bedroom, etc.
  feeTierId: varchar("fee_tier_id", { length: 255 }), // Reference to fee tier ID
  ownerId: varchar("owner_id").references(() => users.id),
  ownerName: varchar("owner_name", { length: 255 }),
  ownerEmail: varchar("owner_email", { length: 255 }),
  ownerPhone: varchar("owner_phone", { length: 50 }),
  squareFootage: integer("square_footage"),
  balconySize: integer("balcony_size"),
  parkingSpaces: integer("parking_spaces").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User-Strata associations for multi-tenant access
export const userStrataAccess = pgTable("user_strata_access", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  role: varchar("role").notNull(), // chairperson, treasurer, secretary, council_member, property_manager, resident
  canPostAnnouncements: boolean("can_post_announcements").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Vendors/Contractors
export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  name: varchar("name", { length: 255 }).notNull(),
  contactInfo: jsonb("contact_info"), // {email, phone, address, website}
  serviceCategories: text("service_categories").array(),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  businessLicense: varchar("business_license"),
  insurance: jsonb("insurance"), // {provider, policyNumber, expiryDate, coverageAmount}
  emergencyContact: varchar("emergency_contact"),
  isPreferred: boolean("is_preferred").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor Contracts
export const vendorContracts = pgTable("vendor_contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id").notNull().references(() => vendors.id),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  contractName: varchar("contract_name", { length: 255 }).notNull(),
  description: text("description"),
  contractDocument: varchar("contract_document"), // file path/URL to uploaded contract
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  autoRenew: boolean("auto_renew").default(false),
  renewalTerms: text("renewal_terms"),
  costAmount: decimal("cost_amount", { precision: 10, scale: 2 }).notNull(),
  costFrequency: varchar("cost_frequency", { length: 20 }).notNull(), // 'monthly', 'quarterly', 'annually', 'one-time'
  paymentTerms: varchar("payment_terms", { length: 100 }),
  serviceScope: text("service_scope"),
  status: varchar("status", { length: 50 }).notNull().default("active"), // 'active', 'expired', 'cancelled', 'pending'
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vendor History/Notes
export const vendorHistory = pgTable("vendor_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id").notNull().references(() => vendors.id),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'service_completed', 'issue_reported', 'contract_signed', 'payment_made', 'note_added'
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  rating: integer("rating"), // 1-5 stars for service quality
  cost: decimal("cost", { precision: 10, scale: 2 }),
  attachments: text("attachments").array(), // photos, documents related to the event
  recordedBy: varchar("recorded_by").notNull().references(() => users.id),
  eventDate: timestamp("event_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expenses
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  vendorId: uuid("vendor_id").references(() => vendors.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }),
  isRecurring: boolean("is_recurring").notNull().default(false),
  expenseDate: timestamp("expense_date").defaultNow().notNull(),
  recurringFrequency: varchar("recurring_frequency", { length: 20 }), // 'weekly', 'monthly', 'annually'
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  attachedReceipts: text("attached_receipts").array(),
  submittedBy: varchar("submitted_by").notNull().references(() => users.id),
  approvedBy: varchar("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Quotes
export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  vendorId: uuid("vendor_id").references(() => vendors.id), // Made optional for new vendor quotes
  expenseId: uuid("expense_id").references(() => expenses.id),
  requesterId: varchar("requester_id").notNull().references(() => users.id),
  
  // Quote details
  projectTitle: varchar("project_title", { length: 255 }).notNull(),
  projectType: varchar("project_type", { length: 100 }).notNull(), // maintenance, renovation, emergency, inspection, etc.
  description: text("description").notNull(),
  scope: text("scope"), // Detailed scope of work
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  
  // Vendor information (for new vendors not yet in our vendor database)
  vendorName: varchar("vendor_name", { length: 255 }),
  vendorEmail: varchar("vendor_email", { length: 255 }),
  vendorPhone: varchar("vendor_phone", { length: 50 }),
  vendorAddress: text("vendor_address"),
  vendorWebsite: varchar("vendor_website", { length: 255 }),
  vendorLicense: varchar("vendor_license", { length: 100 }),
  vendorInsurance: boolean("vendor_insurance").default(false),
  
  // Quote lifecycle
  status: varchar("status", { length: 50 }).notNull().default("submitted"), // submitted, under_review, approved, rejected, expired
  priority: varchar("priority", { length: 20 }).notNull().default("normal"), // low, normal, high, urgent
  submittedAt: timestamp("submitted_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  rejectedBy: varchar("rejected_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  
  // Quote validity
  validUntil: timestamp("valid_until"),
  startDate: timestamp("start_date"),
  estimatedCompletion: timestamp("estimated_completion"),
  
  // Additional details
  warranty: varchar("warranty", { length: 255 }),
  paymentTerms: text("payment_terms"),
  notes: text("notes"),
  internalNotes: text("internal_notes"), // Private notes for strata management
  
  // Files and attachments
  attachments: text("attachments").array(),
  contractDocument: varchar("contract_document"), // Contract file if approved
  documentFolderId: uuid("document_folder_id").references(() => documentFolders.id), // Auto-created project folder
  
  // Conversion tracking
  convertedToVendor: boolean("converted_to_vendor").default(false),
  createdVendorId: uuid("created_vendor_id").references(() => vendors.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meetings
export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  meetingType: varchar("meeting_type", { length: 50 }).notNull().default("board_meeting"),
  meetingDate: timestamp("meeting_date").notNull(),
  location: varchar("location", { length: 255 }),
  chairperson: varchar("chairperson", { length: 255 }),
  agenda: text("agenda"),
  scheduledAt: timestamp("scheduled_at").notNull(),
  audioUrl: varchar("audio_url"),
  transcriptUrl: varchar("transcript_url"),
  minutesUrl: varchar("minutes_url"),
  minutes: text("minutes"),
  transcription: text("transcription"),
  reviewerId: varchar("reviewer_id").references(() => users.id),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meeting Invitees
export const meetingInvitees = pgTable("meeting_invitees", {
  id: uuid("id").primaryKey().defaultRandom(),
  meetingId: uuid("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  invitedBy: varchar("invited_by").notNull().references(() => users.id),
  responseStatus: varchar("response_status", { length: 20 }).notNull().default("pending"), // pending, accepted, declined
  respondedAt: timestamp("responded_at"),
  notificationSent: boolean("notification_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Document Folders
export const documentFolders = pgTable("document_folders", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  parentFolderId: uuid("parent_folder_id"),
  path: varchar("path", { length: 500 }).notNull(), // e.g., "/Financial/2024/Budgets"
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  folderId: uuid("folder_id").references(() => documentFolders.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 100 }).notNull(),
  fileUrl: varchar("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type", { length: 100 }),
  version: varchar("version", { length: 50 }).default("1.0"),
  tags: text("tags").array(),
  eSignatureStatus: varchar("e_signature_status", { length: 50 }),
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Maintenance Requests
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  residentId: varchar("resident_id").notNull().references(() => users.id),
  unitId: uuid("unit_id").references(() => units.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 50 }).notNull().default("medium"),
  status: varchar("status", { length: 50 }).notNull().default("submitted"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  photos: text("photos").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Maintenance Projects (for large maintenance tracking)
export const maintenanceProjects = pgTable("maintenance_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  priority: varchar("priority", { length: 50 }).notNull().default("medium"),
  status: varchar("status", { length: 50 }).notNull().default("planned"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }).notNull().default("0.00"),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  nextServiceDate: timestamp("next_service_date"),
  contractor: varchar("contractor", { length: 255 }),
  warranty: varchar("warranty", { length: 255 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Communications/Announcements
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  priority: varchar("priority", { length: 50 }).notNull().default("normal"),
  publishedBy: varchar("published_by").notNull().references(() => users.id),
  published: boolean("published").notNull().default(false),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recurringPattern: varchar("recurring_pattern", { length: 50 }), // daily, weekly, monthly, yearly
  recurringInterval: integer("recurring_interval").default(1), // every X days/weeks/months
  recurringEndDate: timestamp("recurring_end_date"),
  parentAnnouncementId: uuid("parent_announcement_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fund Management
export const funds = pgTable("funds", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // reserve, operating, special_levy, investment
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  target: decimal("target", { precision: 10, scale: 2 }),
  interestRate: decimal("interest_rate", { precision: 5, scale: 4 }), // Annual interest rate as decimal
  compoundingFrequency: varchar("compounding_frequency", { length: 20 }).default("monthly"), // monthly, quarterly, annually
  institution: varchar("institution", { length: 255 }),
  accountNumber: varchar("account_number", { length: 100 }),
  maturityDate: timestamp("maturity_date"),
  autoRenewal: boolean("auto_renewal").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const fundTransactions = pgTable("fund_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  fundId: uuid("fund_id").notNull().references(() => funds.id),
  type: varchar("type", { length: 50 }).notNull(), // deposit, withdrawal, interest, transfer_in, transfer_out
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: varchar("description", { length: 500 }),
  relatedExpenseId: uuid("related_expense_id").references(() => expenses.id),
  processedBy: varchar("processed_by").notNull().references(() => users.id),
  transactionDate: timestamp("transaction_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pending Strata Registrations
export const pendingStrataRegistrations = pgTable("pending_strata_registrations", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataName: varchar("strata_name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  province: varchar("province", { length: 50 }).notNull(),
  postalCode: varchar("postal_code", { length: 20 }).notNull(),
  unitCount: integer("unit_count").notNull(),
  adminFirstName: varchar("admin_first_name", { length: 100 }).notNull(),
  adminLastName: varchar("admin_last_name", { length: 100 }).notNull(),
  adminEmail: varchar("admin_email", { length: 255 }).notNull(),
  adminPhone: varchar("admin_phone", { length: 20 }).notNull(),
  managementType: varchar("management_type", { length: 50 }).notNull(), // self_managed, professional_managed
  managementCompany: varchar("management_company", { length: 255 }),
  description: text("description").notNull(),
  specialRequirements: text("special_requirements"),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, approved, rejected
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdStrataId: uuid("created_strata_id").references(() => strata.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  recipientId: varchar("recipient_id").references(() => users.id), // null for broadcast messages
  subject: varchar("subject", { length: 255 }),
  content: text("content").notNull(),
  messageType: varchar("message_type", { length: 50 }).notNull().default("private"), // private, broadcast, announcement
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  parentMessageId: uuid("parent_message_id"), // for replies - self-reference handled in relations
  conversationId: uuid("conversation_id"), // for grouping messages into conversations
  priority: varchar("priority", { length: 20 }).default("normal"), // low, normal, high, urgent
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Resident Directory
export const residentDirectory = pgTable("resident_directory", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  dwellingId: uuid("dwelling_id").references(() => units.id),
  
  // Contact Information
  primaryPhone: varchar("primary_phone", { length: 20 }),
  secondaryPhone: varchar("secondary_phone", { length: 20 }),
  workPhone: varchar("work_phone", { length: 20 }),
  alternateEmail: varchar("alternate_email", { length: 255 }),
  
  // Emergency Contact
  emergencyContactName: varchar("emergency_contact_name", { length: 255 }),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 20 }),
  emergencyContactRelationship: varchar("emergency_contact_relationship", { length: 100 }),
  emergencyContactEmail: varchar("emergency_contact_email", { length: 255 }),
  
  // Additional Details
  moveInDate: timestamp("move_in_date"),
  occupancyType: varchar("occupancy_type", { length: 50 }).default("owner"), // owner, tenant, authorized_occupant
  vehicleInfo: text("vehicle_info"), // JSON string for multiple vehicles
  petInfo: text("pet_info"), // JSON string for pet details
  specialNotes: text("special_notes"), // Accessibility needs, delivery instructions, etc.
  
  // Privacy Settings
  showInDirectory: boolean("show_in_directory").default(true),
  showContactInfo: boolean("show_contact_info").default(true),
  showEmergencyContact: boolean("show_emergency_contact").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications - tracks notifications for users
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  type: varchar("type", { length: 50 }).notNull(), // message, announcement, meeting, quote, maintenance
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedId: varchar("related_id"), // ID of the related entity (message, announcement, etc.)
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Dismissed Notifications - tracks which notifications a user has dismissed
export const dismissedNotifications = pgTable("dismissed_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  notificationId: varchar("notification_id").notNull(), // The ID of the notification (e.g., "announcement-123", "meeting-456")
  notificationType: varchar("notification_type", { length: 50 }).notNull(), // announcement, meeting, quote
  dismissedAt: timestamp("dismissed_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  strataAccess: many(userStrataAccess),
  expenses: many(expenses),
  quotes: many(quotes),
  maintenanceRequests: many(maintenanceRequests),
  announcements: many(announcements),
  sentMessages: many(messages, { relationName: "MessageSender" }),
  receivedMessages: many(messages, { relationName: "MessageRecipient" }),
  residentDirectory: many(residentDirectory),
  notifications: many(notifications),
  dismissedNotifications: many(dismissedNotifications),
}));

export const strataRelations = relations(strata, ({ many }) => ({
  units: many(units),
  userAccess: many(userStrataAccess),
  expenses: many(expenses),
  quotes: many(quotes),
  meetings: many(meetings),
  documents: many(documents),
  documentFolders: many(documentFolders),
  maintenanceRequests: many(maintenanceRequests),
  announcements: many(announcements),
  funds: many(funds),
  messages: many(messages),
  residentDirectory: many(residentDirectory),
}));

export const meetingsRelations = relations(meetings, ({ one, many }) => ({
  strata: one(strata, {
    fields: [meetings.strataId],
    references: [strata.id],
  }),
  reviewer: one(users, {
    fields: [meetings.reviewerId],
    references: [users.id],
  }),
  invitees: many(meetingInvitees),
}));

export const meetingInviteesRelations = relations(meetingInvitees, ({ one }) => ({
  meeting: one(meetings, {
    fields: [meetingInvitees.meetingId],
    references: [meetings.id],
  }),
  invitee: one(users, {
    fields: [meetingInvitees.userId],
    references: [users.id],
    relationName: "MeetingInvitee",
  }),
  inviter: one(users, {
    fields: [meetingInvitees.invitedBy],
    references: [users.id],
    relationName: "MeetingInviter",
  }),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  strata: one(strata, {
    fields: [units.strataId],
    references: [strata.id],
  }),
  owner: one(users, {
    fields: [units.ownerId],
    references: [users.id],
  }),
  maintenanceRequests: many(maintenanceRequests),
}));

export const userStrataAccessRelations = relations(userStrataAccess, ({ one }) => ({
  user: one(users, {
    fields: [userStrataAccess.userId],
    references: [users.id],
  }),
  strata: one(strata, {
    fields: [userStrataAccess.strataId],
    references: [strata.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  expenses: many(expenses),
  quotes: many(quotes),
  contracts: many(vendorContracts),
  history: many(vendorHistory),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  strata: one(strata, {
    fields: [expenses.strataId],
    references: [strata.id],
  }),
  vendor: one(vendors, {
    fields: [expenses.vendorId],
    references: [vendors.id],
  }),
  submitter: one(users, {
    fields: [expenses.submittedBy],
    references: [users.id],
  }),
  approver: one(users, {
    fields: [expenses.approvedBy],
    references: [users.id],
  }),
  quotes: many(quotes),
}));

export const quotesRelations = relations(quotes, ({ one }) => ({
  strata: one(strata, {
    fields: [quotes.strataId],
    references: [strata.id],
  }),
  vendor: one(vendors, {
    fields: [quotes.vendorId],
    references: [vendors.id],
  }),
  expense: one(expenses, {
    fields: [quotes.expenseId],
    references: [expenses.id],
  }),
  requester: one(users, {
    fields: [quotes.requesterId],
    references: [users.id],
  }),
}));





export const maintenanceRequestsRelations = relations(maintenanceRequests, ({ one }) => ({
  strata: one(strata, {
    fields: [maintenanceRequests.strataId],
    references: [strata.id],
  }),
  resident: one(users, {
    fields: [maintenanceRequests.residentId],
    references: [users.id],
  }),
  unit: one(units, {
    fields: [maintenanceRequests.unitId],
    references: [units.id],
  }),
  assignee: one(users, {
    fields: [maintenanceRequests.assignedTo],
    references: [users.id],
  }),
}));

export const maintenanceProjectsRelations = relations(maintenanceProjects, ({ one }) => ({
  strata: one(strata, {
    fields: [maintenanceProjects.strataId],
    references: [strata.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  strata: one(strata, {
    fields: [announcements.strataId],
    references: [strata.id],
  }),
  publisher: one(users, {
    fields: [announcements.publishedBy],
    references: [users.id],
  }),
}));

export const fundsRelations = relations(funds, ({ one, many }) => ({
  strata: one(strata, {
    fields: [funds.strataId],
    references: [strata.id],
  }),
  transactions: many(fundTransactions),
}));

export const fundTransactionsRelations = relations(fundTransactions, ({ one }) => ({
  fund: one(funds, {
    fields: [fundTransactions.fundId],
    references: [funds.id],
  }),
  processor: one(users, {
    fields: [fundTransactions.processedBy],
    references: [users.id],
  }),
  relatedExpense: one(expenses, {
    fields: [fundTransactions.relatedExpenseId],
    references: [expenses.id],
  }),
}));

export const vendorContractsRelations = relations(vendorContracts, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorContracts.vendorId],
    references: [vendors.id],
  }),
  strata: one(strata, {
    fields: [vendorContracts.strataId],
    references: [strata.id],
  }),
  creator: one(users, {
    fields: [vendorContracts.createdBy],
    references: [users.id],
  }),
}));

export const vendorHistoryRelations = relations(vendorHistory, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorHistory.vendorId],
    references: [vendors.id],
  }),
  strata: one(strata, {
    fields: [vendorHistory.strataId],
    references: [strata.id],
  }),
  recorder: one(users, {
    fields: [vendorHistory.recordedBy],
    references: [users.id],
  }),
}));

export const documentFoldersRelations = relations(documentFolders, ({ one, many }) => ({
  strata: one(strata, {
    fields: [documentFolders.strataId],
    references: [strata.id],
  }),
  creator: one(users, {
    fields: [documentFolders.createdBy],
    references: [users.id],
  }),
  parentFolder: one(documentFolders, {
    fields: [documentFolders.parentFolderId],
    references: [documentFolders.id],
    relationName: "FolderParent",
  }),
  subFolders: many(documentFolders, {
    relationName: "FolderParent",
  }),
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  strata: one(strata, {
    fields: [documents.strataId],
    references: [strata.id],
  }),
  folder: one(documentFolders, {
    fields: [documents.folderId],
    references: [documentFolders.id],
  }),
  uploader: one(users, {
    fields: [documents.uploadedBy],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  strata: one(strata, {
    fields: [messages.strataId],
    references: [strata.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "MessageSender",
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "MessageRecipient",
  }),
  parentMessage: one(messages, {
    fields: [messages.parentMessageId],
    references: [messages.id],
    relationName: "MessageThread",
  }),
  replies: many(messages, {
    relationName: "MessageThread",
  }),
}));

export const residentDirectoryRelations = relations(residentDirectory, ({ one }) => ({
  strata: one(strata, {
    fields: [residentDirectory.strataId],
    references: [strata.id],
  }),
  user: one(users, {
    fields: [residentDirectory.userId],
    references: [users.id],
  }),
  dwelling: one(units, {
    fields: [residentDirectory.dwellingId],
    references: [units.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  strata: one(strata, {
    fields: [notifications.strataId],
    references: [strata.id],
  }),
}));

export const dismissedNotificationsRelations = relations(dismissedNotifications, ({ one }) => ({
  user: one(users, {
    fields: [dismissedNotifications.userId],
    references: [users.id],
  }),
}));

// Fee Tiers
export const feeTiers = pgTable("fee_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  monthlyAmount: decimal("monthly_amount", { precision: 10, scale: 2 }).notNull(),
  annualAmount: decimal("annual_amount", { precision: 10, scale: 2 }),
  unitType: varchar("unit_type", { length: 50 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const feeTiersRelations = relations(feeTiers, ({ one }) => ({
  strata: one(strata, {
    fields: [feeTiers.strataId],
    references: [strata.id],
  }),
}));

// Repair Requests
export const repairRequests = pgTable("repair_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull().references(() => strata.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  area: varchar("area", { length: 100 }),
  location: varchar("location", { length: 255 }),
  severity: varchar("severity", { length: 50 }).notNull().default("medium"),
  status: varchar("status", { length: 50 }).notNull().default("suggested"),
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  photos: text("photos").array(),
  submittedBy: jsonb("submitted_by"), // { userId, name, email }
  assignedTo: jsonb("assigned_to"),
  statusHistory: jsonb("status_history"), // Array of { status, changedBy, changedAt }
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const repairRequestsRelations = relations(repairRequests, ({ one }) => ({
  strata: one(strata, {
    fields: [repairRequests.strataId],
    references: [strata.id],
  }),
}));

// Payment Reminders table
export const paymentReminders = pgTable("payment_reminders", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull(),
  unitId: uuid("unit_id"), // Optional - for unit-specific reminders
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  reminderType: varchar("reminder_type").notNull(), // 'fee_overdue', 'monthly_fee', 'special_assessment', 'maintenance_fee', 'custom'
  amount: decimal("amount", { precision: 10, scale: 2 }),
  dueDate: timestamp("due_date"),
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: varchar("recurring_pattern"), // 'daily', 'weekly', 'monthly', 'yearly'
  recurringInterval: integer("recurring_interval").default(1), // every X days/weeks/months
  
  // Advanced recurring options (Outlook-style)
  monthlyType: varchar("monthly_type"), // 'date' (specific date), 'day' (e.g., first Monday), 'last_day' (last day of month)
  monthlyDate: integer("monthly_date"), // Day of month (1-31) when monthlyType is 'date'
  monthlyWeekday: varchar("monthly_weekday"), // Day of week (monday, tuesday, etc.) when monthlyType is 'day'
  monthlyWeekPosition: varchar("monthly_week_position"), // 'first', 'second', 'third', 'fourth', 'last' when monthlyType is 'day'
  weeklyDays: text("weekly_days"), // JSON array of weekdays for weekly patterns
  yearlyMonth: integer("yearly_month"), // Month (1-12) for yearly patterns
  
  recurringEndDate: timestamp("recurring_end_date"),
  nextReminderDate: timestamp("next_reminder_date"),
  lastSentDate: timestamp("last_sent_date"),
  remindersSentCount: integer("reminders_sent_count").default(0),
  status: varchar("status").default("active"), // 'active', 'paused', 'completed', 'cancelled'
  priority: varchar("priority").default("normal"), // 'low', 'normal', 'high', 'urgent'
  autoSend: boolean("auto_send").default(false),
  reminderTime: varchar("reminder_time").default("09:00"), // Time to send reminder (HH:MM format)
  emailTemplate: text("email_template"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentRemindersRelations = relations(paymentReminders, ({ one }) => ({
  strata: one(strata, {
    fields: [paymentReminders.strataId],
    references: [strata.id],
  }),
  unit: one(units, {
    fields: [paymentReminders.unitId],
    references: [units.id],
  }),
  creator: one(users, {
    fields: [paymentReminders.createdBy],
    references: [users.id],
  }),
}));

// Reports table
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  strataId: uuid("strata_id").notNull(),
  reportType: varchar("report_type").notNull(), // 'financial', 'meeting-minutes', 'communications', 'maintenance', 'home-sale-package'
  title: varchar("title").notNull(),
  dateRange: jsonb("date_range"), // { start: string, end: string }
  filters: jsonb("filters"), // Additional filters specific to report type
  content: jsonb("content"), // Generated report content
  format: varchar("format").default("pdf"), // 'pdf', 'excel', 'html'
  status: varchar("status").default("pending"), // 'pending', 'generating', 'completed', 'failed'
  generatedBy: varchar("generated_by").notNull(),
  generatedAt: timestamp("generated_at").defaultNow(),
  downloadUrl: varchar("download_url"),
  emailedTo: text("emailed_to").array(), // Array of email addresses
  createdAt: timestamp("created_at").defaultNow(),
});

export const reportsRelations = relations(reports, ({ one }) => ({
  strata: one(strata, {
    fields: [reports.strataId],
    references: [strata.id],
  }),
  generator: one(users, {
    fields: [reports.generatedBy],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertStrataSchema = createInsertSchema(strata).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  amount: z.union([z.string(), z.number()]).optional().transform((val) => val !== undefined && val !== null ? String(val) : undefined),
  expenseDate: z.union([z.string(), z.date()]).optional().transform((val) => {
    if (!val) return undefined;
    if (val instanceof Date) return val;
    return new Date(val);
  }),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  submittedAt: true,
  reviewedAt: true,
  approvedAt: true,
  rejectedAt: true,
  convertedToVendor: true,
  createdVendorId: true,
  documentFolderId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  validUntil: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  startDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  estimatedCompletion: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMaintenanceProjectSchema = createInsertSchema(maintenanceProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserStrataAccessSchema = createInsertSchema(userStrataAccess).omit({
  id: true,
  createdAt: true,
});

export const insertVendorContractSchema = createInsertSchema(vendorContracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorHistorySchema = createInsertSchema(vendorHistory).omit({
  id: true,
  createdAt: true,
});

export const insertFundSchema = createInsertSchema(funds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFundTransactionSchema = createInsertSchema(fundTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertPendingStrataRegistrationSchema = createInsertSchema(pendingStrataRegistrations).omit({
  id: true,
  status: true,
  approvedBy: true,
  approvedAt: true,
  rejectionReason: true,
  createdStrataId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentFolderSchema = createInsertSchema(documentFolders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResidentDirectorySchema = createInsertSchema(residentDirectory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentReminderSchema = createInsertSchema(paymentReminders).omit({
  id: true,
  remindersSentCount: true,
  lastSentDate: true,
  nextReminderDate: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  unitId: z.string().optional().transform((val) => {
    // Handle empty strings, "all", or undefined
    if (!val || val === '' || val === 'all') return undefined;
    return val;
  }),
  amount: z.union([z.string(), z.number()]).optional().transform((val) => val !== undefined && val !== null ? String(val) : undefined),
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  recurringEndDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  weeklyDays: z.array(z.string()).optional(),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
  generatedAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertDismissedNotificationSchema = createInsertSchema(dismissedNotifications).omit({
  id: true,
  dismissedAt: true,
});

export const insertMeetingInviteeSchema = createInsertSchema(meetingInvitees).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserWithAssignments = User & {
  strataAssignments: UserStrataAccess[];
};
export type Strata = typeof strata.$inferSelect;
export type Unit = typeof units.$inferSelect;
export type UserStrataAccess = typeof userStrataAccess.$inferSelect;
export type Vendor = typeof vendors.$inferSelect;
export type VendorContract = typeof vendorContracts.$inferSelect;
export type VendorHistory = typeof vendorHistory.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type Quote = typeof quotes.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type MeetingInvitee = typeof meetingInvitees.$inferSelect;
export type DocumentFolder = typeof documentFolders.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type MaintenanceProject = typeof maintenanceProjects.$inferSelect;
export type Announcement = typeof announcements.$inferSelect;
export type Fund = typeof funds.$inferSelect;
export type FundTransaction = typeof fundTransactions.$inferSelect;
export type PendingStrataRegistration = typeof pendingStrataRegistrations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ResidentDirectory = typeof residentDirectory.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type DismissedNotification = typeof dismissedNotifications.$inferSelect;
export type PaymentReminder = typeof paymentReminders.$inferSelect;
export type Report = typeof reports.$inferSelect;

export type InsertStrata = z.infer<typeof insertStrataSchema>;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type InsertVendorContract = z.infer<typeof insertVendorContractSchema>;
export type InsertVendorHistory = z.infer<typeof insertVendorHistorySchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type InsertDocumentFolder = z.infer<typeof insertDocumentFolderSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertMaintenanceRequest = z.infer<typeof insertMaintenanceRequestSchema>;
export type InsertMaintenanceProject = z.infer<typeof insertMaintenanceProjectSchema>;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type InsertUserStrataAccess = z.infer<typeof insertUserStrataAccessSchema>;
export type InsertFund = z.infer<typeof insertFundSchema>;
export type InsertFundTransaction = z.infer<typeof insertFundTransactionSchema>;
export type InsertPendingStrataRegistration = z.infer<typeof insertPendingStrataRegistrationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertResidentDirectory = z.infer<typeof insertResidentDirectorySchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertDismissedNotification = z.infer<typeof insertDismissedNotificationSchema>;
export type InsertPaymentReminder = z.infer<typeof insertPaymentReminderSchema>;
export type InsertMeetingInvitee = z.infer<typeof insertMeetingInviteeSchema>;
export type InsertReport = z.infer<typeof insertReportSchema>;

export const insertFeeTierSchema = createInsertSchema(feeTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRepairRequestSchema = createInsertSchema(repairRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FeeTier = typeof feeTiers.$inferSelect;
export type RepairRequest = typeof repairRequests.$inferSelect;
export type InsertFeeTier = z.infer<typeof insertFeeTierSchema>;
export type InsertRepairRequest = z.infer<typeof insertRepairRequestSchema>;

// Enhanced types for joined queries
export type UserStrataAccessWithUser = UserStrataAccess & {
  user: User | null;
};
