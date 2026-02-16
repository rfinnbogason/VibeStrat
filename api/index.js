"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  announcements: () => announcements,
  announcementsRelations: () => announcementsRelations,
  dismissedNotifications: () => dismissedNotifications,
  dismissedNotificationsRelations: () => dismissedNotificationsRelations,
  documentFolders: () => documentFolders,
  documentFoldersRelations: () => documentFoldersRelations,
  documents: () => documents,
  documentsRelations: () => documentsRelations,
  expenses: () => expenses,
  expensesRelations: () => expensesRelations,
  feeTiers: () => feeTiers,
  feeTiersRelations: () => feeTiersRelations,
  fundTransactions: () => fundTransactions,
  fundTransactionsRelations: () => fundTransactionsRelations,
  funds: () => funds,
  fundsRelations: () => fundsRelations,
  insertAnnouncementSchema: () => insertAnnouncementSchema,
  insertDismissedNotificationSchema: () => insertDismissedNotificationSchema,
  insertDocumentFolderSchema: () => insertDocumentFolderSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertExpenseSchema: () => insertExpenseSchema,
  insertFeeTierSchema: () => insertFeeTierSchema,
  insertFundSchema: () => insertFundSchema,
  insertFundTransactionSchema: () => insertFundTransactionSchema,
  insertMaintenanceProjectSchema: () => insertMaintenanceProjectSchema,
  insertMaintenanceRequestSchema: () => insertMaintenanceRequestSchema,
  insertMeetingInviteeSchema: () => insertMeetingInviteeSchema,
  insertMeetingSchema: () => insertMeetingSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPaymentReminderSchema: () => insertPaymentReminderSchema,
  insertPendingStrataRegistrationSchema: () => insertPendingStrataRegistrationSchema,
  insertQuoteSchema: () => insertQuoteSchema,
  insertRepairRequestSchema: () => insertRepairRequestSchema,
  insertReportSchema: () => insertReportSchema,
  insertResidentDirectorySchema: () => insertResidentDirectorySchema,
  insertStrataSchema: () => insertStrataSchema,
  insertUnitSchema: () => insertUnitSchema,
  insertUserStrataAccessSchema: () => insertUserStrataAccessSchema,
  insertVendorContractSchema: () => insertVendorContractSchema,
  insertVendorHistorySchema: () => insertVendorHistorySchema,
  insertVendorSchema: () => insertVendorSchema,
  maintenanceProjects: () => maintenanceProjects,
  maintenanceProjectsRelations: () => maintenanceProjectsRelations,
  maintenanceRequests: () => maintenanceRequests,
  maintenanceRequestsRelations: () => maintenanceRequestsRelations,
  meetingInvitees: () => meetingInvitees,
  meetingInviteesRelations: () => meetingInviteesRelations,
  meetings: () => meetings,
  meetingsRelations: () => meetingsRelations,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  paymentReminders: () => paymentReminders,
  paymentRemindersRelations: () => paymentRemindersRelations,
  pendingStrataRegistrations: () => pendingStrataRegistrations,
  quotes: () => quotes,
  quotesRelations: () => quotesRelations,
  repairRequests: () => repairRequests,
  repairRequestsRelations: () => repairRequestsRelations,
  reports: () => reports,
  reportsRelations: () => reportsRelations,
  residentDirectory: () => residentDirectory,
  residentDirectoryRelations: () => residentDirectoryRelations,
  sessions: () => sessions,
  strata: () => strata,
  strataRelations: () => strataRelations,
  units: () => units,
  unitsRelations: () => unitsRelations,
  userStrataAccess: () => userStrataAccess,
  userStrataAccessRelations: () => userStrataAccessRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  vendorContracts: () => vendorContracts,
  vendorContractsRelations: () => vendorContractsRelations,
  vendorHistory: () => vendorHistory,
  vendorHistoryRelations: () => vendorHistoryRelations,
  vendors: () => vendors,
  vendorsRelations: () => vendorsRelations
});
var import_pg_core, import_drizzle_orm, import_drizzle_zod, import_zod, sessions, users, strata, units, userStrataAccess, vendors, vendorContracts, vendorHistory, expenses, quotes, meetings, meetingInvitees, documentFolders, documents, maintenanceRequests, maintenanceProjects, announcements, funds, fundTransactions, pendingStrataRegistrations, messages, residentDirectory, notifications, dismissedNotifications, usersRelations, strataRelations, meetingsRelations, meetingInviteesRelations, unitsRelations, userStrataAccessRelations, vendorsRelations, expensesRelations, quotesRelations, maintenanceRequestsRelations, maintenanceProjectsRelations, announcementsRelations, fundsRelations, fundTransactionsRelations, vendorContractsRelations, vendorHistoryRelations, documentFoldersRelations, documentsRelations, messagesRelations, residentDirectoryRelations, notificationsRelations, dismissedNotificationsRelations, feeTiers, feeTiersRelations, repairRequests, repairRequestsRelations, paymentReminders, paymentRemindersRelations, reports, reportsRelations, insertStrataSchema, insertUnitSchema, insertVendorSchema, insertExpenseSchema, insertQuoteSchema, insertMeetingSchema, insertMaintenanceRequestSchema, insertMaintenanceProjectSchema, insertAnnouncementSchema, insertUserStrataAccessSchema, insertVendorContractSchema, insertVendorHistorySchema, insertFundSchema, insertFundTransactionSchema, insertPendingStrataRegistrationSchema, insertDocumentFolderSchema, insertDocumentSchema, insertMessageSchema, insertResidentDirectorySchema, insertPaymentReminderSchema, insertReportSchema, insertNotificationSchema, insertDismissedNotificationSchema, insertMeetingInviteeSchema, insertFeeTierSchema, insertRepairRequestSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    import_pg_core = require("drizzle-orm/pg-core");
    import_drizzle_orm = require("drizzle-orm");
    import_drizzle_zod = require("drizzle-zod");
    import_zod = require("zod");
    sessions = (0, import_pg_core.pgTable)(
      "sessions",
      {
        sid: (0, import_pg_core.varchar)("sid").primaryKey(),
        sess: (0, import_pg_core.jsonb)("sess").notNull(),
        expire: (0, import_pg_core.timestamp)("expire").notNull()
      },
      (table) => [(0, import_pg_core.index)("IDX_session_expire").on(table.expire)]
    );
    users = (0, import_pg_core.pgTable)("users", {
      id: (0, import_pg_core.varchar)("id").primaryKey().notNull(),
      email: (0, import_pg_core.varchar)("email").unique(),
      firstName: (0, import_pg_core.varchar)("first_name"),
      lastName: (0, import_pg_core.varchar)("last_name"),
      profileImageUrl: (0, import_pg_core.varchar)("profile_image_url"),
      passwordHash: (0, import_pg_core.varchar)("password_hash"),
      passwordResetToken: (0, import_pg_core.varchar)("password_reset_token"),
      passwordResetExpires: (0, import_pg_core.timestamp)("password_reset_expires"),
      isActive: (0, import_pg_core.boolean)("is_active").default(true),
      lastLoginAt: (0, import_pg_core.timestamp)("last_login_at"),
      role: (0, import_pg_core.varchar)("role").notNull().default("resident"),
      mustChangePassword: (0, import_pg_core.boolean)("must_change_password").default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    strata = (0, import_pg_core.pgTable)("strata", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
      address: (0, import_pg_core.text)("address").notNull(),
      city: (0, import_pg_core.varchar)("city", { length: 100 }),
      province: (0, import_pg_core.varchar)("province", { length: 50 }),
      postalCode: (0, import_pg_core.varchar)("postal_code", { length: 20 }),
      country: (0, import_pg_core.varchar)("country", { length: 50 }).default("Canada"),
      phoneNumber: (0, import_pg_core.varchar)("phone_number", { length: 20 }),
      email: (0, import_pg_core.varchar)("email", { length: 255 }),
      unitCount: (0, import_pg_core.integer)("unit_count").notNull(),
      corporationNumber: (0, import_pg_core.varchar)("corporation_number", { length: 100 }),
      incorporationDate: (0, import_pg_core.timestamp)("incorporation_date"),
      managementCompany: (0, import_pg_core.varchar)("management_company", { length: 255 }),
      managementContactName: (0, import_pg_core.varchar)("management_contact_name", { length: 255 }),
      managementContactEmail: (0, import_pg_core.varchar)("management_contact_email", { length: 255 }),
      managementContactPhone: (0, import_pg_core.varchar)("management_contact_phone", { length: 20 }),
      bylawsUrl: (0, import_pg_core.varchar)("bylaws_url"),
      feeStructure: (0, import_pg_core.jsonb)("fee_structure"),
      status: (0, import_pg_core.varchar)("status", { length: 50 }).notNull().default("active"),
      // active, inactive, archived
      notes: (0, import_pg_core.text)("notes"),
      // Subscription fields
      subscriptionStatus: (0, import_pg_core.varchar)("subscription_status", { length: 50 }).notNull().default("trial"),
      // trial, active, cancelled, expired, free
      subscriptionTier: (0, import_pg_core.varchar)("subscription_tier", { length: 50 }).notNull().default("standard"),
      // standard, premium, free
      monthlyRate: (0, import_pg_core.decimal)("monthly_rate", { precision: 10, scale: 2 }).default("79.95"),
      trialStartDate: (0, import_pg_core.timestamp)("trial_start_date"),
      trialEndDate: (0, import_pg_core.timestamp)("trial_end_date"),
      subscriptionStartDate: (0, import_pg_core.timestamp)("subscription_start_date"),
      subscriptionEndDate: (0, import_pg_core.timestamp)("subscription_end_date"),
      lastPaymentDate: (0, import_pg_core.timestamp)("last_payment_date"),
      nextPaymentDate: (0, import_pg_core.timestamp)("next_payment_date"),
      isFreeForever: (0, import_pg_core.boolean)("is_free_forever").default(false),
      createdBy: (0, import_pg_core.varchar)("created_by"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    units = (0, import_pg_core.pgTable)("units", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      unitNumber: (0, import_pg_core.varchar)("unit_number", { length: 50 }).notNull(),
      unitType: (0, import_pg_core.varchar)("unit_type", { length: 50 }),
      // Studio, One Bedroom, Two Bedroom, etc.
      feeTierId: (0, import_pg_core.varchar)("fee_tier_id", { length: 255 }),
      // Reference to fee tier ID
      ownerId: (0, import_pg_core.varchar)("owner_id").references(() => users.id),
      ownerName: (0, import_pg_core.varchar)("owner_name", { length: 255 }),
      ownerEmail: (0, import_pg_core.varchar)("owner_email", { length: 255 }),
      ownerPhone: (0, import_pg_core.varchar)("owner_phone", { length: 50 }),
      squareFootage: (0, import_pg_core.integer)("square_footage"),
      balconySize: (0, import_pg_core.integer)("balcony_size"),
      parkingSpaces: (0, import_pg_core.integer)("parking_spaces").default(0),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    userStrataAccess = (0, import_pg_core.pgTable)("user_strata_access", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      role: (0, import_pg_core.varchar)("role").notNull(),
      // chairperson, treasurer, secretary, council_member, property_manager, resident
      canPostAnnouncements: (0, import_pg_core.boolean)("can_post_announcements").default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    vendors = (0, import_pg_core.pgTable)("vendors", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
      contactInfo: (0, import_pg_core.jsonb)("contact_info"),
      // {email, phone, address, website}
      serviceCategories: (0, import_pg_core.text)("service_categories").array(),
      rating: (0, import_pg_core.decimal)("rating", { precision: 3, scale: 2 }),
      businessLicense: (0, import_pg_core.varchar)("business_license"),
      insurance: (0, import_pg_core.jsonb)("insurance"),
      // {provider, policyNumber, expiryDate, coverageAmount}
      emergencyContact: (0, import_pg_core.varchar)("emergency_contact"),
      isPreferred: (0, import_pg_core.boolean)("is_preferred").default(false),
      notes: (0, import_pg_core.text)("notes"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    vendorContracts = (0, import_pg_core.pgTable)("vendor_contracts", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      vendorId: (0, import_pg_core.uuid)("vendor_id").notNull().references(() => vendors.id),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      contractName: (0, import_pg_core.varchar)("contract_name", { length: 255 }).notNull(),
      description: (0, import_pg_core.text)("description"),
      contractDocument: (0, import_pg_core.varchar)("contract_document"),
      // file path/URL to uploaded contract
      startDate: (0, import_pg_core.timestamp)("start_date").notNull(),
      endDate: (0, import_pg_core.timestamp)("end_date"),
      autoRenew: (0, import_pg_core.boolean)("auto_renew").default(false),
      renewalTerms: (0, import_pg_core.text)("renewal_terms"),
      costAmount: (0, import_pg_core.decimal)("cost_amount", { precision: 10, scale: 2 }).notNull(),
      costFrequency: (0, import_pg_core.varchar)("cost_frequency", { length: 20 }).notNull(),
      // 'monthly', 'quarterly', 'annually', 'one-time'
      paymentTerms: (0, import_pg_core.varchar)("payment_terms", { length: 100 }),
      serviceScope: (0, import_pg_core.text)("service_scope"),
      status: (0, import_pg_core.varchar)("status", { length: 50 }).notNull().default("active"),
      // 'active', 'expired', 'cancelled', 'pending'
      createdBy: (0, import_pg_core.varchar)("created_by").notNull().references(() => users.id),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    vendorHistory = (0, import_pg_core.pgTable)("vendor_history", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      vendorId: (0, import_pg_core.uuid)("vendor_id").notNull().references(() => vendors.id),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      eventType: (0, import_pg_core.varchar)("event_type", { length: 50 }).notNull(),
      // 'service_completed', 'issue_reported', 'contract_signed', 'payment_made', 'note_added'
      title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
      description: (0, import_pg_core.text)("description"),
      rating: (0, import_pg_core.integer)("rating"),
      // 1-5 stars for service quality
      cost: (0, import_pg_core.decimal)("cost", { precision: 10, scale: 2 }),
      attachments: (0, import_pg_core.text)("attachments").array(),
      // photos, documents related to the event
      recordedBy: (0, import_pg_core.varchar)("recorded_by").notNull().references(() => users.id),
      eventDate: (0, import_pg_core.timestamp)("event_date").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    expenses = (0, import_pg_core.pgTable)("expenses", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      vendorId: (0, import_pg_core.uuid)("vendor_id").references(() => vendors.id),
      amount: (0, import_pg_core.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
      description: (0, import_pg_core.text)("description").notNull(),
      category: (0, import_pg_core.varchar)("category", { length: 100 }),
      isRecurring: (0, import_pg_core.boolean)("is_recurring").notNull().default(false),
      expenseDate: (0, import_pg_core.timestamp)("expense_date").defaultNow().notNull(),
      recurringFrequency: (0, import_pg_core.varchar)("recurring_frequency", { length: 20 }),
      // 'weekly', 'monthly', 'annually'
      status: (0, import_pg_core.varchar)("status", { length: 50 }).notNull().default("pending"),
      attachedReceipts: (0, import_pg_core.text)("attached_receipts").array(),
      submittedBy: (0, import_pg_core.varchar)("submitted_by").notNull().references(() => users.id),
      approvedBy: (0, import_pg_core.varchar)("approved_by").references(() => users.id),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    quotes = (0, import_pg_core.pgTable)("quotes", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      vendorId: (0, import_pg_core.uuid)("vendor_id").references(() => vendors.id),
      // Made optional for new vendor quotes
      expenseId: (0, import_pg_core.uuid)("expense_id").references(() => expenses.id),
      requesterId: (0, import_pg_core.varchar)("requester_id").notNull().references(() => users.id),
      // Quote details
      projectTitle: (0, import_pg_core.varchar)("project_title", { length: 255 }).notNull(),
      projectType: (0, import_pg_core.varchar)("project_type", { length: 100 }).notNull(),
      // maintenance, renovation, emergency, inspection, etc.
      description: (0, import_pg_core.text)("description").notNull(),
      scope: (0, import_pg_core.text)("scope"),
      // Detailed scope of work
      amount: (0, import_pg_core.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
      // Vendor information (for new vendors not yet in our vendor database)
      vendorName: (0, import_pg_core.varchar)("vendor_name", { length: 255 }),
      vendorEmail: (0, import_pg_core.varchar)("vendor_email", { length: 255 }),
      vendorPhone: (0, import_pg_core.varchar)("vendor_phone", { length: 50 }),
      vendorAddress: (0, import_pg_core.text)("vendor_address"),
      vendorWebsite: (0, import_pg_core.varchar)("vendor_website", { length: 255 }),
      vendorLicense: (0, import_pg_core.varchar)("vendor_license", { length: 100 }),
      vendorInsurance: (0, import_pg_core.boolean)("vendor_insurance").default(false),
      // Quote lifecycle
      status: (0, import_pg_core.varchar)("status", { length: 50 }).notNull().default("submitted"),
      // submitted, under_review, approved, rejected, expired
      priority: (0, import_pg_core.varchar)("priority", { length: 20 }).notNull().default("normal"),
      // low, normal, high, urgent
      submittedAt: (0, import_pg_core.timestamp)("submitted_at").defaultNow(),
      reviewedAt: (0, import_pg_core.timestamp)("reviewed_at"),
      approvedAt: (0, import_pg_core.timestamp)("approved_at"),
      rejectedAt: (0, import_pg_core.timestamp)("rejected_at"),
      approvedBy: (0, import_pg_core.varchar)("approved_by").references(() => users.id),
      rejectedBy: (0, import_pg_core.varchar)("rejected_by").references(() => users.id),
      rejectionReason: (0, import_pg_core.text)("rejection_reason"),
      // Quote validity
      validUntil: (0, import_pg_core.timestamp)("valid_until"),
      startDate: (0, import_pg_core.timestamp)("start_date"),
      estimatedCompletion: (0, import_pg_core.timestamp)("estimated_completion"),
      // Additional details
      warranty: (0, import_pg_core.varchar)("warranty", { length: 255 }),
      paymentTerms: (0, import_pg_core.text)("payment_terms"),
      notes: (0, import_pg_core.text)("notes"),
      internalNotes: (0, import_pg_core.text)("internal_notes"),
      // Private notes for strata management
      // Files and attachments
      attachments: (0, import_pg_core.text)("attachments").array(),
      contractDocument: (0, import_pg_core.varchar)("contract_document"),
      // Contract file if approved
      documentFolderId: (0, import_pg_core.uuid)("document_folder_id").references(() => documentFolders.id),
      // Auto-created project folder
      // Conversion tracking
      convertedToVendor: (0, import_pg_core.boolean)("converted_to_vendor").default(false),
      createdVendorId: (0, import_pg_core.uuid)("created_vendor_id").references(() => vendors.id),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    meetings = (0, import_pg_core.pgTable)("meetings", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
      description: (0, import_pg_core.text)("description"),
      meetingType: (0, import_pg_core.varchar)("meeting_type", { length: 50 }).notNull().default("board_meeting"),
      meetingDate: (0, import_pg_core.timestamp)("meeting_date").notNull(),
      location: (0, import_pg_core.varchar)("location", { length: 255 }),
      chairperson: (0, import_pg_core.varchar)("chairperson", { length: 255 }),
      agenda: (0, import_pg_core.text)("agenda"),
      scheduledAt: (0, import_pg_core.timestamp)("scheduled_at").notNull(),
      audioUrl: (0, import_pg_core.varchar)("audio_url"),
      transcriptUrl: (0, import_pg_core.varchar)("transcript_url"),
      minutesUrl: (0, import_pg_core.varchar)("minutes_url"),
      minutes: (0, import_pg_core.text)("minutes"),
      transcription: (0, import_pg_core.text)("transcription"),
      reviewerId: (0, import_pg_core.varchar)("reviewer_id").references(() => users.id),
      status: (0, import_pg_core.varchar)("status", { length: 50 }).notNull().default("scheduled"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    meetingInvitees = (0, import_pg_core.pgTable)("meeting_invitees", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      meetingId: (0, import_pg_core.uuid)("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
      userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id),
      invitedBy: (0, import_pg_core.varchar)("invited_by").notNull().references(() => users.id),
      responseStatus: (0, import_pg_core.varchar)("response_status", { length: 20 }).notNull().default("pending"),
      // pending, accepted, declined
      respondedAt: (0, import_pg_core.timestamp)("responded_at"),
      notificationSent: (0, import_pg_core.boolean)("notification_sent").default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    documentFolders = (0, import_pg_core.pgTable)("document_folders", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
      description: (0, import_pg_core.text)("description"),
      parentFolderId: (0, import_pg_core.uuid)("parent_folder_id"),
      path: (0, import_pg_core.varchar)("path", { length: 500 }).notNull(),
      // e.g., "/Financial/2024/Budgets"
      createdBy: (0, import_pg_core.varchar)("created_by").notNull().references(() => users.id),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    documents = (0, import_pg_core.pgTable)("documents", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      folderId: (0, import_pg_core.uuid)("folder_id").references(() => documentFolders.id),
      title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
      description: (0, import_pg_core.text)("description"),
      type: (0, import_pg_core.varchar)("type", { length: 100 }).notNull(),
      fileUrl: (0, import_pg_core.varchar)("file_url").notNull(),
      fileName: (0, import_pg_core.varchar)("file_name", { length: 255 }).notNull(),
      fileSize: (0, import_pg_core.integer)("file_size"),
      mimeType: (0, import_pg_core.varchar)("mime_type", { length: 100 }),
      version: (0, import_pg_core.varchar)("version", { length: 50 }).default("1.0"),
      tags: (0, import_pg_core.text)("tags").array(),
      eSignatureStatus: (0, import_pg_core.varchar)("e_signature_status", { length: 50 }),
      uploadedBy: (0, import_pg_core.varchar)("uploaded_by").notNull().references(() => users.id),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    maintenanceRequests = (0, import_pg_core.pgTable)("maintenance_requests", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      residentId: (0, import_pg_core.varchar)("resident_id").notNull().references(() => users.id),
      unitId: (0, import_pg_core.uuid)("unit_id").references(() => units.id),
      title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
      description: (0, import_pg_core.text)("description").notNull(),
      priority: (0, import_pg_core.varchar)("priority", { length: 50 }).notNull().default("medium"),
      status: (0, import_pg_core.varchar)("status", { length: 50 }).notNull().default("submitted"),
      assignedTo: (0, import_pg_core.varchar)("assigned_to").references(() => users.id),
      photos: (0, import_pg_core.text)("photos").array(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    maintenanceProjects = (0, import_pg_core.pgTable)("maintenance_projects", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
      description: (0, import_pg_core.text)("description"),
      category: (0, import_pg_core.varchar)("category", { length: 100 }).notNull(),
      priority: (0, import_pg_core.varchar)("priority", { length: 50 }).notNull().default("medium"),
      status: (0, import_pg_core.varchar)("status", { length: 50 }).notNull().default("planned"),
      estimatedCost: (0, import_pg_core.decimal)("estimated_cost", { precision: 10, scale: 2 }).notNull().default("0.00"),
      actualCost: (0, import_pg_core.decimal)("actual_cost", { precision: 10, scale: 2 }),
      scheduledDate: (0, import_pg_core.timestamp)("scheduled_date"),
      completedDate: (0, import_pg_core.timestamp)("completed_date"),
      nextServiceDate: (0, import_pg_core.timestamp)("next_service_date"),
      contractor: (0, import_pg_core.varchar)("contractor", { length: 255 }),
      warranty: (0, import_pg_core.varchar)("warranty", { length: 255 }),
      notes: (0, import_pg_core.text)("notes"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    announcements = (0, import_pg_core.pgTable)("announcements", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
      content: (0, import_pg_core.text)("content").notNull(),
      priority: (0, import_pg_core.varchar)("priority", { length: 50 }).notNull().default("normal"),
      publishedBy: (0, import_pg_core.varchar)("published_by").notNull().references(() => users.id),
      published: (0, import_pg_core.boolean)("published").notNull().default(false),
      isRecurring: (0, import_pg_core.boolean)("is_recurring").notNull().default(false),
      recurringPattern: (0, import_pg_core.varchar)("recurring_pattern", { length: 50 }),
      // daily, weekly, monthly, yearly
      recurringInterval: (0, import_pg_core.integer)("recurring_interval").default(1),
      // every X days/weeks/months
      recurringEndDate: (0, import_pg_core.timestamp)("recurring_end_date"),
      parentAnnouncementId: (0, import_pg_core.uuid)("parent_announcement_id"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    funds = (0, import_pg_core.pgTable)("funds", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
      type: (0, import_pg_core.varchar)("type", { length: 50 }).notNull(),
      // reserve, operating, special_levy, investment
      balance: (0, import_pg_core.decimal)("balance", { precision: 10, scale: 2 }).notNull().default("0"),
      target: (0, import_pg_core.decimal)("target", { precision: 10, scale: 2 }),
      interestRate: (0, import_pg_core.decimal)("interest_rate", { precision: 5, scale: 4 }),
      // Annual interest rate as decimal
      compoundingFrequency: (0, import_pg_core.varchar)("compounding_frequency", { length: 20 }).default("monthly"),
      // monthly, quarterly, annually
      institution: (0, import_pg_core.varchar)("institution", { length: 255 }),
      accountNumber: (0, import_pg_core.varchar)("account_number", { length: 100 }),
      maturityDate: (0, import_pg_core.timestamp)("maturity_date"),
      autoRenewal: (0, import_pg_core.boolean)("auto_renewal").default(false),
      notes: (0, import_pg_core.text)("notes"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    fundTransactions = (0, import_pg_core.pgTable)("fund_transactions", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      fundId: (0, import_pg_core.uuid)("fund_id").notNull().references(() => funds.id),
      type: (0, import_pg_core.varchar)("type", { length: 50 }).notNull(),
      // deposit, withdrawal, interest, transfer_in, transfer_out
      amount: (0, import_pg_core.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
      description: (0, import_pg_core.varchar)("description", { length: 500 }),
      relatedExpenseId: (0, import_pg_core.uuid)("related_expense_id").references(() => expenses.id),
      processedBy: (0, import_pg_core.varchar)("processed_by").notNull().references(() => users.id),
      transactionDate: (0, import_pg_core.timestamp)("transaction_date").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    pendingStrataRegistrations = (0, import_pg_core.pgTable)("pending_strata_registrations", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataName: (0, import_pg_core.varchar)("strata_name", { length: 255 }).notNull(),
      address: (0, import_pg_core.varchar)("address", { length: 500 }).notNull(),
      city: (0, import_pg_core.varchar)("city", { length: 100 }).notNull(),
      province: (0, import_pg_core.varchar)("province", { length: 50 }).notNull(),
      postalCode: (0, import_pg_core.varchar)("postal_code", { length: 20 }).notNull(),
      unitCount: (0, import_pg_core.integer)("unit_count").notNull(),
      adminFirstName: (0, import_pg_core.varchar)("admin_first_name", { length: 100 }).notNull(),
      adminLastName: (0, import_pg_core.varchar)("admin_last_name", { length: 100 }).notNull(),
      adminEmail: (0, import_pg_core.varchar)("admin_email", { length: 255 }).notNull(),
      adminPhone: (0, import_pg_core.varchar)("admin_phone", { length: 20 }).notNull(),
      managementType: (0, import_pg_core.varchar)("management_type", { length: 50 }).notNull(),
      // self_managed, professional_managed
      managementCompany: (0, import_pg_core.varchar)("management_company", { length: 255 }),
      description: (0, import_pg_core.text)("description").notNull(),
      specialRequirements: (0, import_pg_core.text)("special_requirements"),
      status: (0, import_pg_core.varchar)("status", { length: 50 }).notNull().default("pending"),
      // pending, approved, rejected
      approvedBy: (0, import_pg_core.varchar)("approved_by").references(() => users.id),
      approvedAt: (0, import_pg_core.timestamp)("approved_at"),
      rejectionReason: (0, import_pg_core.text)("rejection_reason"),
      createdStrataId: (0, import_pg_core.uuid)("created_strata_id").references(() => strata.id),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    messages = (0, import_pg_core.pgTable)("messages", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      senderId: (0, import_pg_core.varchar)("sender_id").notNull().references(() => users.id),
      recipientId: (0, import_pg_core.varchar)("recipient_id").references(() => users.id),
      // null for broadcast messages
      subject: (0, import_pg_core.varchar)("subject", { length: 255 }),
      content: (0, import_pg_core.text)("content").notNull(),
      messageType: (0, import_pg_core.varchar)("message_type", { length: 50 }).notNull().default("private"),
      // private, broadcast, announcement
      isRead: (0, import_pg_core.boolean)("is_read").default(false),
      readAt: (0, import_pg_core.timestamp)("read_at"),
      parentMessageId: (0, import_pg_core.uuid)("parent_message_id"),
      // for replies - self-reference handled in relations
      conversationId: (0, import_pg_core.uuid)("conversation_id"),
      // for grouping messages into conversations
      priority: (0, import_pg_core.varchar)("priority", { length: 20 }).default("normal"),
      // low, normal, high, urgent
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    residentDirectory = (0, import_pg_core.pgTable)("resident_directory", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id),
      dwellingId: (0, import_pg_core.uuid)("dwelling_id").references(() => units.id),
      // Contact Information
      primaryPhone: (0, import_pg_core.varchar)("primary_phone", { length: 20 }),
      secondaryPhone: (0, import_pg_core.varchar)("secondary_phone", { length: 20 }),
      workPhone: (0, import_pg_core.varchar)("work_phone", { length: 20 }),
      alternateEmail: (0, import_pg_core.varchar)("alternate_email", { length: 255 }),
      // Emergency Contact
      emergencyContactName: (0, import_pg_core.varchar)("emergency_contact_name", { length: 255 }),
      emergencyContactPhone: (0, import_pg_core.varchar)("emergency_contact_phone", { length: 20 }),
      emergencyContactRelationship: (0, import_pg_core.varchar)("emergency_contact_relationship", { length: 100 }),
      emergencyContactEmail: (0, import_pg_core.varchar)("emergency_contact_email", { length: 255 }),
      // Additional Details
      moveInDate: (0, import_pg_core.timestamp)("move_in_date"),
      occupancyType: (0, import_pg_core.varchar)("occupancy_type", { length: 50 }).default("owner"),
      // owner, tenant, authorized_occupant
      vehicleInfo: (0, import_pg_core.text)("vehicle_info"),
      // JSON string for multiple vehicles
      petInfo: (0, import_pg_core.text)("pet_info"),
      // JSON string for pet details
      specialNotes: (0, import_pg_core.text)("special_notes"),
      // Accessibility needs, delivery instructions, etc.
      // Privacy Settings
      showInDirectory: (0, import_pg_core.boolean)("show_in_directory").default(true),
      showContactInfo: (0, import_pg_core.boolean)("show_contact_info").default(true),
      showEmergencyContact: (0, import_pg_core.boolean)("show_emergency_contact").default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    notifications = (0, import_pg_core.pgTable)("notifications", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      type: (0, import_pg_core.varchar)("type", { length: 50 }).notNull(),
      // message, announcement, meeting, quote, maintenance
      title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
      message: (0, import_pg_core.text)("message").notNull(),
      relatedId: (0, import_pg_core.varchar)("related_id"),
      // ID of the related entity (message, announcement, etc.)
      isRead: (0, import_pg_core.boolean)("is_read").default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    dismissedNotifications = (0, import_pg_core.pgTable)("dismissed_notifications", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      userId: (0, import_pg_core.varchar)("user_id").notNull().references(() => users.id),
      notificationId: (0, import_pg_core.varchar)("notification_id").notNull(),
      // The ID of the notification (e.g., "announcement-123", "meeting-456")
      notificationType: (0, import_pg_core.varchar)("notification_type", { length: 50 }).notNull(),
      // announcement, meeting, quote
      dismissedAt: (0, import_pg_core.timestamp)("dismissed_at").defaultNow()
    });
    usersRelations = (0, import_drizzle_orm.relations)(users, ({ many }) => ({
      strataAccess: many(userStrataAccess),
      expenses: many(expenses),
      quotes: many(quotes),
      maintenanceRequests: many(maintenanceRequests),
      announcements: many(announcements),
      sentMessages: many(messages, { relationName: "MessageSender" }),
      receivedMessages: many(messages, { relationName: "MessageRecipient" }),
      residentDirectory: many(residentDirectory),
      notifications: many(notifications),
      dismissedNotifications: many(dismissedNotifications)
    }));
    strataRelations = (0, import_drizzle_orm.relations)(strata, ({ many }) => ({
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
      residentDirectory: many(residentDirectory)
    }));
    meetingsRelations = (0, import_drizzle_orm.relations)(meetings, ({ one, many }) => ({
      strata: one(strata, {
        fields: [meetings.strataId],
        references: [strata.id]
      }),
      reviewer: one(users, {
        fields: [meetings.reviewerId],
        references: [users.id]
      }),
      invitees: many(meetingInvitees)
    }));
    meetingInviteesRelations = (0, import_drizzle_orm.relations)(meetingInvitees, ({ one }) => ({
      meeting: one(meetings, {
        fields: [meetingInvitees.meetingId],
        references: [meetings.id]
      }),
      invitee: one(users, {
        fields: [meetingInvitees.userId],
        references: [users.id],
        relationName: "MeetingInvitee"
      }),
      inviter: one(users, {
        fields: [meetingInvitees.invitedBy],
        references: [users.id],
        relationName: "MeetingInviter"
      })
    }));
    unitsRelations = (0, import_drizzle_orm.relations)(units, ({ one, many }) => ({
      strata: one(strata, {
        fields: [units.strataId],
        references: [strata.id]
      }),
      owner: one(users, {
        fields: [units.ownerId],
        references: [users.id]
      }),
      maintenanceRequests: many(maintenanceRequests)
    }));
    userStrataAccessRelations = (0, import_drizzle_orm.relations)(userStrataAccess, ({ one }) => ({
      user: one(users, {
        fields: [userStrataAccess.userId],
        references: [users.id]
      }),
      strata: one(strata, {
        fields: [userStrataAccess.strataId],
        references: [strata.id]
      })
    }));
    vendorsRelations = (0, import_drizzle_orm.relations)(vendors, ({ many }) => ({
      expenses: many(expenses),
      quotes: many(quotes),
      contracts: many(vendorContracts),
      history: many(vendorHistory)
    }));
    expensesRelations = (0, import_drizzle_orm.relations)(expenses, ({ one, many }) => ({
      strata: one(strata, {
        fields: [expenses.strataId],
        references: [strata.id]
      }),
      vendor: one(vendors, {
        fields: [expenses.vendorId],
        references: [vendors.id]
      }),
      submitter: one(users, {
        fields: [expenses.submittedBy],
        references: [users.id]
      }),
      approver: one(users, {
        fields: [expenses.approvedBy],
        references: [users.id]
      }),
      quotes: many(quotes)
    }));
    quotesRelations = (0, import_drizzle_orm.relations)(quotes, ({ one }) => ({
      strata: one(strata, {
        fields: [quotes.strataId],
        references: [strata.id]
      }),
      vendor: one(vendors, {
        fields: [quotes.vendorId],
        references: [vendors.id]
      }),
      expense: one(expenses, {
        fields: [quotes.expenseId],
        references: [expenses.id]
      }),
      requester: one(users, {
        fields: [quotes.requesterId],
        references: [users.id]
      })
    }));
    maintenanceRequestsRelations = (0, import_drizzle_orm.relations)(maintenanceRequests, ({ one }) => ({
      strata: one(strata, {
        fields: [maintenanceRequests.strataId],
        references: [strata.id]
      }),
      resident: one(users, {
        fields: [maintenanceRequests.residentId],
        references: [users.id]
      }),
      unit: one(units, {
        fields: [maintenanceRequests.unitId],
        references: [units.id]
      }),
      assignee: one(users, {
        fields: [maintenanceRequests.assignedTo],
        references: [users.id]
      })
    }));
    maintenanceProjectsRelations = (0, import_drizzle_orm.relations)(maintenanceProjects, ({ one }) => ({
      strata: one(strata, {
        fields: [maintenanceProjects.strataId],
        references: [strata.id]
      })
    }));
    announcementsRelations = (0, import_drizzle_orm.relations)(announcements, ({ one }) => ({
      strata: one(strata, {
        fields: [announcements.strataId],
        references: [strata.id]
      }),
      publisher: one(users, {
        fields: [announcements.publishedBy],
        references: [users.id]
      })
    }));
    fundsRelations = (0, import_drizzle_orm.relations)(funds, ({ one, many }) => ({
      strata: one(strata, {
        fields: [funds.strataId],
        references: [strata.id]
      }),
      transactions: many(fundTransactions)
    }));
    fundTransactionsRelations = (0, import_drizzle_orm.relations)(fundTransactions, ({ one }) => ({
      fund: one(funds, {
        fields: [fundTransactions.fundId],
        references: [funds.id]
      }),
      processor: one(users, {
        fields: [fundTransactions.processedBy],
        references: [users.id]
      }),
      relatedExpense: one(expenses, {
        fields: [fundTransactions.relatedExpenseId],
        references: [expenses.id]
      })
    }));
    vendorContractsRelations = (0, import_drizzle_orm.relations)(vendorContracts, ({ one }) => ({
      vendor: one(vendors, {
        fields: [vendorContracts.vendorId],
        references: [vendors.id]
      }),
      strata: one(strata, {
        fields: [vendorContracts.strataId],
        references: [strata.id]
      }),
      creator: one(users, {
        fields: [vendorContracts.createdBy],
        references: [users.id]
      })
    }));
    vendorHistoryRelations = (0, import_drizzle_orm.relations)(vendorHistory, ({ one }) => ({
      vendor: one(vendors, {
        fields: [vendorHistory.vendorId],
        references: [vendors.id]
      }),
      strata: one(strata, {
        fields: [vendorHistory.strataId],
        references: [strata.id]
      }),
      recorder: one(users, {
        fields: [vendorHistory.recordedBy],
        references: [users.id]
      })
    }));
    documentFoldersRelations = (0, import_drizzle_orm.relations)(documentFolders, ({ one, many }) => ({
      strata: one(strata, {
        fields: [documentFolders.strataId],
        references: [strata.id]
      }),
      creator: one(users, {
        fields: [documentFolders.createdBy],
        references: [users.id]
      }),
      parentFolder: one(documentFolders, {
        fields: [documentFolders.parentFolderId],
        references: [documentFolders.id],
        relationName: "FolderParent"
      }),
      subFolders: many(documentFolders, {
        relationName: "FolderParent"
      }),
      documents: many(documents)
    }));
    documentsRelations = (0, import_drizzle_orm.relations)(documents, ({ one }) => ({
      strata: one(strata, {
        fields: [documents.strataId],
        references: [strata.id]
      }),
      folder: one(documentFolders, {
        fields: [documents.folderId],
        references: [documentFolders.id]
      }),
      uploader: one(users, {
        fields: [documents.uploadedBy],
        references: [users.id]
      })
    }));
    messagesRelations = (0, import_drizzle_orm.relations)(messages, ({ one, many }) => ({
      strata: one(strata, {
        fields: [messages.strataId],
        references: [strata.id]
      }),
      sender: one(users, {
        fields: [messages.senderId],
        references: [users.id],
        relationName: "MessageSender"
      }),
      recipient: one(users, {
        fields: [messages.recipientId],
        references: [users.id],
        relationName: "MessageRecipient"
      }),
      parentMessage: one(messages, {
        fields: [messages.parentMessageId],
        references: [messages.id],
        relationName: "MessageThread"
      }),
      replies: many(messages, {
        relationName: "MessageThread"
      })
    }));
    residentDirectoryRelations = (0, import_drizzle_orm.relations)(residentDirectory, ({ one }) => ({
      strata: one(strata, {
        fields: [residentDirectory.strataId],
        references: [strata.id]
      }),
      user: one(users, {
        fields: [residentDirectory.userId],
        references: [users.id]
      }),
      dwelling: one(units, {
        fields: [residentDirectory.dwellingId],
        references: [units.id]
      })
    }));
    notificationsRelations = (0, import_drizzle_orm.relations)(notifications, ({ one }) => ({
      user: one(users, {
        fields: [notifications.userId],
        references: [users.id]
      }),
      strata: one(strata, {
        fields: [notifications.strataId],
        references: [strata.id]
      })
    }));
    dismissedNotificationsRelations = (0, import_drizzle_orm.relations)(dismissedNotifications, ({ one }) => ({
      user: one(users, {
        fields: [dismissedNotifications.userId],
        references: [users.id]
      })
    }));
    feeTiers = (0, import_pg_core.pgTable)("fee_tiers", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      name: (0, import_pg_core.varchar)("name", { length: 255 }).notNull(),
      description: (0, import_pg_core.text)("description"),
      monthlyAmount: (0, import_pg_core.decimal)("monthly_amount", { precision: 10, scale: 2 }).notNull(),
      annualAmount: (0, import_pg_core.decimal)("annual_amount", { precision: 10, scale: 2 }),
      unitType: (0, import_pg_core.varchar)("unit_type", { length: 50 }),
      isDefault: (0, import_pg_core.boolean)("is_default").default(false),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    feeTiersRelations = (0, import_drizzle_orm.relations)(feeTiers, ({ one }) => ({
      strata: one(strata, {
        fields: [feeTiers.strataId],
        references: [strata.id]
      })
    }));
    repairRequests = (0, import_pg_core.pgTable)("repair_requests", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull().references(() => strata.id),
      title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
      description: (0, import_pg_core.text)("description").notNull(),
      area: (0, import_pg_core.varchar)("area", { length: 100 }),
      location: (0, import_pg_core.varchar)("location", { length: 255 }),
      severity: (0, import_pg_core.varchar)("severity", { length: 50 }).notNull().default("medium"),
      status: (0, import_pg_core.varchar)("status", { length: 50 }).notNull().default("suggested"),
      estimatedCost: (0, import_pg_core.decimal)("estimated_cost", { precision: 10, scale: 2 }),
      actualCost: (0, import_pg_core.decimal)("actual_cost", { precision: 10, scale: 2 }),
      photos: (0, import_pg_core.text)("photos").array(),
      submittedBy: (0, import_pg_core.jsonb)("submitted_by"),
      // { userId, name, email }
      assignedTo: (0, import_pg_core.jsonb)("assigned_to"),
      statusHistory: (0, import_pg_core.jsonb)("status_history"),
      // Array of { status, changedBy, changedAt }
      scheduledDate: (0, import_pg_core.timestamp)("scheduled_date"),
      completedDate: (0, import_pg_core.timestamp)("completed_date"),
      notes: (0, import_pg_core.text)("notes"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    repairRequestsRelations = (0, import_drizzle_orm.relations)(repairRequests, ({ one }) => ({
      strata: one(strata, {
        fields: [repairRequests.strataId],
        references: [strata.id]
      })
    }));
    paymentReminders = (0, import_pg_core.pgTable)("payment_reminders", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull(),
      unitId: (0, import_pg_core.uuid)("unit_id"),
      // Optional - for unit-specific reminders
      title: (0, import_pg_core.varchar)("title", { length: 255 }).notNull(),
      description: (0, import_pg_core.text)("description"),
      reminderType: (0, import_pg_core.varchar)("reminder_type").notNull(),
      // 'fee_overdue', 'monthly_fee', 'special_assessment', 'maintenance_fee', 'custom'
      amount: (0, import_pg_core.decimal)("amount", { precision: 10, scale: 2 }),
      dueDate: (0, import_pg_core.timestamp)("due_date"),
      isRecurring: (0, import_pg_core.boolean)("is_recurring").default(false),
      recurringPattern: (0, import_pg_core.varchar)("recurring_pattern"),
      // 'daily', 'weekly', 'monthly', 'yearly'
      recurringInterval: (0, import_pg_core.integer)("recurring_interval").default(1),
      // every X days/weeks/months
      // Advanced recurring options (Outlook-style)
      monthlyType: (0, import_pg_core.varchar)("monthly_type"),
      // 'date' (specific date), 'day' (e.g., first Monday), 'last_day' (last day of month)
      monthlyDate: (0, import_pg_core.integer)("monthly_date"),
      // Day of month (1-31) when monthlyType is 'date'
      monthlyWeekday: (0, import_pg_core.varchar)("monthly_weekday"),
      // Day of week (monday, tuesday, etc.) when monthlyType is 'day'
      monthlyWeekPosition: (0, import_pg_core.varchar)("monthly_week_position"),
      // 'first', 'second', 'third', 'fourth', 'last' when monthlyType is 'day'
      weeklyDays: (0, import_pg_core.text)("weekly_days"),
      // JSON array of weekdays for weekly patterns
      yearlyMonth: (0, import_pg_core.integer)("yearly_month"),
      // Month (1-12) for yearly patterns
      recurringEndDate: (0, import_pg_core.timestamp)("recurring_end_date"),
      nextReminderDate: (0, import_pg_core.timestamp)("next_reminder_date"),
      lastSentDate: (0, import_pg_core.timestamp)("last_sent_date"),
      remindersSentCount: (0, import_pg_core.integer)("reminders_sent_count").default(0),
      status: (0, import_pg_core.varchar)("status").default("active"),
      // 'active', 'paused', 'completed', 'cancelled'
      priority: (0, import_pg_core.varchar)("priority").default("normal"),
      // 'low', 'normal', 'high', 'urgent'
      autoSend: (0, import_pg_core.boolean)("auto_send").default(false),
      reminderTime: (0, import_pg_core.varchar)("reminder_time").default("09:00"),
      // Time to send reminder (HH:MM format)
      emailTemplate: (0, import_pg_core.text)("email_template"),
      createdBy: (0, import_pg_core.varchar)("created_by").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow()
    });
    paymentRemindersRelations = (0, import_drizzle_orm.relations)(paymentReminders, ({ one }) => ({
      strata: one(strata, {
        fields: [paymentReminders.strataId],
        references: [strata.id]
      }),
      unit: one(units, {
        fields: [paymentReminders.unitId],
        references: [units.id]
      }),
      creator: one(users, {
        fields: [paymentReminders.createdBy],
        references: [users.id]
      })
    }));
    reports = (0, import_pg_core.pgTable)("reports", {
      id: (0, import_pg_core.uuid)("id").primaryKey().defaultRandom(),
      strataId: (0, import_pg_core.uuid)("strata_id").notNull(),
      reportType: (0, import_pg_core.varchar)("report_type").notNull(),
      // 'financial', 'meeting-minutes', 'communications', 'maintenance', 'home-sale-package'
      title: (0, import_pg_core.varchar)("title").notNull(),
      dateRange: (0, import_pg_core.jsonb)("date_range"),
      // { start: string, end: string }
      filters: (0, import_pg_core.jsonb)("filters"),
      // Additional filters specific to report type
      content: (0, import_pg_core.jsonb)("content"),
      // Generated report content
      format: (0, import_pg_core.varchar)("format").default("pdf"),
      // 'pdf', 'excel', 'html'
      status: (0, import_pg_core.varchar)("status").default("pending"),
      // 'pending', 'generating', 'completed', 'failed'
      generatedBy: (0, import_pg_core.varchar)("generated_by").notNull(),
      generatedAt: (0, import_pg_core.timestamp)("generated_at").defaultNow(),
      downloadUrl: (0, import_pg_core.varchar)("download_url"),
      emailedTo: (0, import_pg_core.text)("emailed_to").array(),
      // Array of email addresses
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
    });
    reportsRelations = (0, import_drizzle_orm.relations)(reports, ({ one }) => ({
      strata: one(strata, {
        fields: [reports.strataId],
        references: [strata.id]
      }),
      generator: one(users, {
        fields: [reports.generatedBy],
        references: [users.id]
      })
    }));
    insertStrataSchema = (0, import_drizzle_zod.createInsertSchema)(strata).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUnitSchema = (0, import_drizzle_zod.createInsertSchema)(units).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorSchema = (0, import_drizzle_zod.createInsertSchema)(vendors).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertExpenseSchema = (0, import_drizzle_zod.createInsertSchema)(expenses).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      amount: import_zod.z.union([import_zod.z.string(), import_zod.z.number()]).optional().transform((val) => val !== void 0 && val !== null ? String(val) : void 0),
      expenseDate: import_zod.z.union([import_zod.z.string(), import_zod.z.date()]).optional().transform((val) => {
        if (!val) return void 0;
        if (val instanceof Date) return val;
        return new Date(val);
      })
    });
    insertQuoteSchema = (0, import_drizzle_zod.createInsertSchema)(quotes).omit({
      id: true,
      submittedAt: true,
      reviewedAt: true,
      approvedAt: true,
      rejectedAt: true,
      convertedToVendor: true,
      createdVendorId: true,
      documentFolderId: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      validUntil: import_zod.z.string().optional().transform((val) => val ? new Date(val) : void 0),
      startDate: import_zod.z.string().optional().transform((val) => val ? new Date(val) : void 0),
      estimatedCompletion: import_zod.z.string().optional().transform((val) => val ? new Date(val) : void 0)
    });
    insertMeetingSchema = (0, import_drizzle_zod.createInsertSchema)(meetings).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertMaintenanceRequestSchema = (0, import_drizzle_zod.createInsertSchema)(maintenanceRequests).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertMaintenanceProjectSchema = (0, import_drizzle_zod.createInsertSchema)(maintenanceProjects).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertAnnouncementSchema = (0, import_drizzle_zod.createInsertSchema)(announcements).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserStrataAccessSchema = (0, import_drizzle_zod.createInsertSchema)(userStrataAccess).omit({
      id: true,
      createdAt: true
    });
    insertVendorContractSchema = (0, import_drizzle_zod.createInsertSchema)(vendorContracts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertVendorHistorySchema = (0, import_drizzle_zod.createInsertSchema)(vendorHistory).omit({
      id: true,
      createdAt: true
    });
    insertFundSchema = (0, import_drizzle_zod.createInsertSchema)(funds).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertFundTransactionSchema = (0, import_drizzle_zod.createInsertSchema)(fundTransactions).omit({
      id: true,
      createdAt: true
    });
    insertPendingStrataRegistrationSchema = (0, import_drizzle_zod.createInsertSchema)(pendingStrataRegistrations).omit({
      id: true,
      status: true,
      approvedBy: true,
      approvedAt: true,
      rejectionReason: true,
      createdStrataId: true,
      createdAt: true,
      updatedAt: true
    });
    insertDocumentFolderSchema = (0, import_drizzle_zod.createInsertSchema)(documentFolders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertDocumentSchema = (0, import_drizzle_zod.createInsertSchema)(documents).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertMessageSchema = (0, import_drizzle_zod.createInsertSchema)(messages).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertResidentDirectorySchema = (0, import_drizzle_zod.createInsertSchema)(residentDirectory).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPaymentReminderSchema = (0, import_drizzle_zod.createInsertSchema)(paymentReminders).omit({
      id: true,
      remindersSentCount: true,
      lastSentDate: true,
      nextReminderDate: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      unitId: import_zod.z.string().optional().transform((val) => {
        if (!val || val === "" || val === "all") return void 0;
        return val;
      }),
      amount: import_zod.z.union([import_zod.z.string(), import_zod.z.number()]).optional().transform((val) => val !== void 0 && val !== null ? String(val) : void 0),
      dueDate: import_zod.z.string().optional().transform((val) => val ? new Date(val) : void 0),
      recurringEndDate: import_zod.z.string().optional().transform((val) => val ? new Date(val) : void 0),
      weeklyDays: import_zod.z.array(import_zod.z.string()).optional()
    });
    insertReportSchema = (0, import_drizzle_zod.createInsertSchema)(reports).omit({
      id: true,
      createdAt: true,
      generatedAt: true
    });
    insertNotificationSchema = (0, import_drizzle_zod.createInsertSchema)(notifications).omit({
      id: true,
      createdAt: true
    });
    insertDismissedNotificationSchema = (0, import_drizzle_zod.createInsertSchema)(dismissedNotifications).omit({
      id: true,
      dismissedAt: true
    });
    insertMeetingInviteeSchema = (0, import_drizzle_zod.createInsertSchema)(meetingInvitees).omit({
      id: true,
      createdAt: true
    });
    insertFeeTierSchema = (0, import_drizzle_zod.createInsertSchema)(feeTiers).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertRepairRequestSchema = (0, import_drizzle_zod.createInsertSchema)(repairRequests).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
  }
});

// server/db.ts
var import_serverless, import_neon_serverless, import_ws, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_serverless = require("@neondatabase/serverless");
    import_neon_serverless = require("drizzle-orm/neon-serverless");
    import_ws = __toESM(require("ws"), 1);
    init_schema();
    import_serverless.neonConfig.webSocketConstructor = import_ws.default;
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required. Set it in your .env file.");
    }
    console.log("\u{1F4CA} Connecting to PostgreSQL database...");
    pool = new import_serverless.Pool({ connectionString: process.env.DATABASE_URL });
    db = (0, import_neon_serverless.drizzle)({ client: pool, schema: schema_exports });
    console.log("\u2705 PostgreSQL database connected");
  }
});

// server/email-service.ts
var email_service_exports = {};
__export(email_service_exports, {
  generateMeetingInviteEmail: () => generateMeetingInviteEmail,
  sendMeetingInviteEmails: () => sendMeetingInviteEmails,
  sendNotificationEmail: () => sendNotificationEmail
});
async function sendEmail(emailData) {
  try {
    console.log(`\u{1F4E7} Sending email to: ${emailData.to}`);
    console.log(`\u{1F4E7} Subject: ${emailData.subject}`);
    if (SENDGRID_API_KEY) {
      const msg = {
        to: emailData.to,
        from: {
          email: SENDGRID_FROM_EMAIL,
          name: SENDGRID_FROM_NAME
        },
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        trackingSettings: {
          clickTracking: { enable: true },
          openTracking: { enable: true }
        }
      };
      await import_mail.default.send(msg);
      console.log(`\u2705 SendGrid email sent successfully to: ${emailData.to}`);
      return;
    }
    console.log(`\u26A0\uFE0F No email provider configured - email to ${emailData.to} logged but not sent`);
  } catch (error) {
    console.error("\u274C Failed to send email:", error);
    throw error;
  }
}
function generateMeetingInviteEmail(data) {
  const { meeting, strata: strata2, organizer } = data;
  const meetingDate = new Date(meeting.scheduledAt);
  const formattedDate = meetingDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const formattedTime = meetingDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
  const subject = `\u{1F4C5} Meeting Invitation: ${meeting.title} - ${formattedDate}`;
  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Invitation</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
    }
    .email-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0 0;
      opacity: 0.9;
      font-size: 16px;
    }
    .content {
      padding: 30px;
    }
    .meeting-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .meeting-title {
      font-size: 22px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 15px 0;
    }
    .meeting-details {
      display: grid;
      gap: 12px;
    }
    .detail-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .detail-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
    .detail-label {
      font-weight: 600;
      color: #4a5568;
      min-width: 80px;
    }
    .detail-value {
      color: #2d3748;
    }
    .agenda-section {
      margin-top: 25px;
    }
    .agenda-title {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 10px;
    }
    .agenda-content {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 15px;
      white-space: pre-wrap;
      line-height: 1.5;
    }
    .cta-section {
      text-align: center;
      margin: 30px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: transform 0.2s ease;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .footer {
      background: #f7fafc;
      padding: 25px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 5px 0;
      color: #718096;
      font-size: 14px;
    }
    .organizer-info {
      background: #edf2f7;
      border-radius: 6px;
      padding: 15px;
      margin-top: 20px;
    }
    .organizer-title {
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 8px;
    }
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      .header, .content, .footer {
        padding: 20px;
      }
      .meeting-title {
        font-size: 20px;
      }
      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>\u{1F4C5} Meeting Invitation</h1>
      <p>You're invited to an upcoming meeting</p>
    </div>
    
    <div class="content">
      <div class="meeting-card">
        <h2 class="meeting-title">${meeting.title}</h2>
        
        <div class="meeting-details">
          <div class="detail-row">
            <div class="detail-icon">\u{1F4C5}</div>
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">\u{1F550}</div>
            <span class="detail-label">Time:</span>
            <span class="detail-value">${formattedTime}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">\u{1F4CD}</div>
            <span class="detail-label">Location:</span>
            <span class="detail-value">${meeting.location || "To be determined"}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">\u{1F3E2}</div>
            <span class="detail-label">Strata:</span>
            <span class="detail-value">${strata2.name}</span>
          </div>
          
          <div class="detail-row">
            <div class="detail-icon">\u{1F4CB}</div>
            <span class="detail-label">Type:</span>
            <span class="detail-value">${meeting.meetingType?.replace("_", " ").toUpperCase() || "General Meeting"}</span>
          </div>
        </div>
        
        ${meeting.agenda ? `
        <div class="agenda-section">
          <h3 class="agenda-title">\u{1F4DD} Meeting Agenda</h3>
          <div class="agenda-content">${meeting.agenda}</div>
        </div>
        ` : ""}
      </div>
      
      <div class="cta-section">
        <a href="${process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000"}/meetings" class="cta-button">
          View Meeting Details
        </a>
      </div>
      
      <div class="organizer-info">
        <div class="organizer-title">\u{1F464} Meeting Organizer</div>
        <p><strong>${organizer.firstName} ${organizer.lastName}</strong></p>
        <p>${organizer.email}</p>
      </div>
      
      <p style="margin-top: 25px; color: #718096;">
        <strong>Important:</strong> Please mark your calendar and confirm your attendance. 
        If you cannot attend, please notify the organizer as soon as possible.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>VibeStrat</strong> - Strata Management Platform</p>
      <p>${strata2.address}</p>
      <p style="margin-top: 15px;">
        This is an automated message from VibeStrat. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>`;
  const textBody = `
MEETING INVITATION

${meeting.title}

Date: ${formattedDate}
Time: ${formattedTime}
Location: ${meeting.location || "To be determined"}
Strata: ${strata2.name}
Type: ${meeting.meetingType?.replace("_", " ").toUpperCase() || "General Meeting"}

${meeting.agenda ? `
AGENDA:
${meeting.agenda}
` : ""}

ORGANIZER:
${organizer.firstName} ${organizer.lastName}
${organizer.email}

Please mark your calendar and confirm your attendance. If you cannot attend, please notify the organizer as soon as possible.

View meeting details: ${process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000"}/meetings

---
VibeStrat - Strata Management Platform
${strata2.address}

This is an automated message from VibeStrat. Please do not reply to this email.
`;
  return {
    subject,
    htmlBody,
    textBody
  };
}
async function sendMeetingInviteEmails(emailData) {
  const { subject, htmlBody, textBody } = generateMeetingInviteEmail(emailData);
  for (const invitee of emailData.invitees) {
    try {
      console.log(`\u{1F4E7} Creating meeting invitation notification for: ${invitee.email}`);
      const notificationData = {
        userId: invitee.id,
        strataId: emailData.meeting.strataId,
        type: "meeting_invitation",
        title: `\u{1F4C5} Meeting Invitation: ${emailData.meeting.title}`,
        message: `You're invited to ${emailData.meeting.title} on ${new Date(emailData.meeting.scheduledAt).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        })} at ${new Date(emailData.meeting.scheduledAt).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        })}. Click to view details.`,
        priority: "high",
        metadata: {
          meetingId: emailData.meeting.id,
          meetingTitle: emailData.meeting.title,
          meetingDate: emailData.meeting.scheduledAt,
          organizer: `${emailData.organizer.firstName} ${emailData.organizer.lastName}`,
          location: emailData.meeting.location || "TBD",
          type: emailData.meeting.meetingType || "general_meeting"
        }
      };
      await storage.createNotification(notificationData);
      try {
        await sendEmail({
          to: invitee.email,
          subject,
          html: htmlBody,
          text: textBody
        });
        console.log(`\u2705 Meeting invitation email sent to ${invitee.email}`);
      } catch (emailError) {
        console.error(`\u274C Failed to send email to ${invitee.email}:`, emailError);
      }
      console.log(`\u2705 Meeting invitation notification created for ${invitee.email}`);
    } catch (error) {
      console.error(`\u274C Failed to create meeting invite notification for ${invitee.email}:`, error);
    }
  }
  console.log(`\u{1F4E7} Meeting invitation notifications sent to ${emailData.invitees.length} recipients`);
}
async function sendNotificationEmail(emailData) {
  try {
    console.log(`\u{1F4E7} Processing email notification for: ${emailData.userEmail}`);
    console.log(`\u{1F4E7} Notification type: ${emailData.notificationType}`);
    const userData = await storage.getUser(emailData.userId);
    if (!userData) {
      console.log(`\u274C User not found: ${emailData.userId}`);
      return false;
    }
    const notificationSettings = userData.notificationSettings || {};
    if (notificationSettings.emailNotifications === false) {
      console.log(`\u23ED\uFE0F  Email notifications disabled for user: ${emailData.userEmail}`);
      return false;
    }
    const typeSettings = notificationTypeSettings[emailData.notificationType] || {
      emailSubject: (data) => `\u{1F4EC} ${data.title}`,
      requiresEmailNotification: () => true,
      priority: "medium"
    };
    if (!typeSettings.requiresEmailNotification(notificationSettings)) {
      console.log(`\u23ED\uFE0F  Email notifications disabled for type: ${emailData.notificationType}`);
      return false;
    }
    if (emailData.notificationType !== "emergency" && notificationSettings.quietHoursEnabled) {
      const now = /* @__PURE__ */ new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const quietStart = notificationSettings.quietHoursStart || "22:00";
      const quietEnd = notificationSettings.quietHoursEnd || "08:00";
      if (currentTime >= quietStart || currentTime <= quietEnd) {
        console.log(`\u23ED\uFE0F  Quiet hours active for user: ${emailData.userEmail}`);
        return false;
      }
    }
    const subject = typeSettings.emailSubject(emailData);
    const htmlBody = generateNotificationEmailHTML(emailData, typeSettings.priority);
    const textBody = generateNotificationEmailText(emailData);
    await sendEmail({
      to: emailData.userEmail,
      subject,
      html: htmlBody,
      text: textBody
    });
    console.log(`\u2705 Email notification sent to ${emailData.userEmail} for type: ${emailData.notificationType}`);
    return true;
  } catch (error) {
    console.error(`\u274C Failed to send email notification to ${emailData.userEmail}:`, error);
    return false;
  }
}
function generateNotificationEmailHTML(data, priority) {
  const priorityColors = {
    high: "#dc2626",
    medium: "#f59e0b",
    low: "#10b981"
  };
  const priorityColor = priorityColors[priority] || priorityColors.medium;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f8fafc;
    }
    .email-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .priority-badge {
      display: inline-block;
      background: ${priorityColor};
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 10px;
    }
    .content {
      padding: 30px;
    }
    .notification-card {
      background: #f8fafc;
      border-left: 4px solid ${priorityColor};
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .notification-title {
      font-size: 20px;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 10px 0;
    }
    .notification-message {
      color: #4a5568;
      line-height: 1.6;
    }
    .metadata-section {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 15px;
      margin-top: 20px;
    }
    .metadata-item {
      display: flex;
      justify-between;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .metadata-item:last-child {
      border-bottom: none;
    }
    .metadata-label {
      font-weight: 600;
      color: #4a5568;
    }
    .metadata-value {
      color: #2d3748;
    }
    .cta-section {
      text-align: center;
      margin: 30px 0;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    .footer {
      background: #f7fafc;
      padding: 25px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      color: #718096;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>\u{1F4EC} Notification</h1>
      <div class="priority-badge">${priority} priority</div>
    </div>

    <div class="content">
      <div class="notification-card">
        <h2 class="notification-title">${data.title}</h2>
        <p class="notification-message">${data.message}</p>
      </div>

      ${data.metadata && Object.keys(data.metadata).length > 0 ? `
      <div class="metadata-section">
        <h3 style="margin-top: 0; font-size: 16px; color: #2d3748;">Details</h3>
        ${Object.entries(data.metadata).map(([key, value]) => `
          <div class="metadata-item">
            <span class="metadata-label">${key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}:</span>
            <span class="metadata-value">${value}</span>
          </div>
        `).join("")}
      </div>
      ` : ""}

      <div class="cta-section">
        <a href="${process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000"}/dashboard" class="cta-button">
          View in Dashboard
        </a>
      </div>

      <p style="margin-top: 25px; color: #718096; font-size: 14px;">
        This notification was sent to you based on your role and notification preferences in ${data.strataName}.
      </p>
    </div>

    <div class="footer">
      <p><strong>Strata Management Platform</strong></p>
      <p>${data.strataName}</p>
      <p style="margin-top: 15px;">
        You can manage your notification preferences in Account Settings.
      </p>
    </div>
  </div>
</body>
</html>`;
}
function generateNotificationEmailText(data) {
  let text2 = `NOTIFICATION

`;
  text2 += `${data.title}

`;
  text2 += `${data.message}

`;
  if (data.metadata && Object.keys(data.metadata).length > 0) {
    text2 += `DETAILS:
`;
    for (const [key, value] of Object.entries(data.metadata)) {
      text2 += `${key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}: ${value}
`;
    }
    text2 += `
`;
  }
  text2 += `View in Dashboard: ${process.env.REPLIT_DOMAINS?.split(",")[0] || "http://localhost:5000"}/dashboard

`;
  text2 += `---
`;
  text2 += `Strata Management Platform
`;
  text2 += `${data.strataName}

`;
  text2 += `You can manage your notification preferences in Account Settings.
`;
  return text2;
}
var import_mail, SENDGRID_API_KEY, SENDGRID_FROM_EMAIL, SENDGRID_FROM_NAME, notificationTypeSettings;
var init_email_service = __esm({
  "server/email-service.ts"() {
    "use strict";
    init_storage_factory();
    import_mail = __toESM(require("@sendgrid/mail"), 1);
    SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@vibestrat.com";
    SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || "VibeStrat";
    if (SENDGRID_API_KEY) {
      import_mail.default.setApiKey(SENDGRID_API_KEY);
      console.log("\u2705 SendGrid initialized for email notifications");
    } else {
      console.log("\u26A0\uFE0F SendGrid API key not configured - emails will be logged only");
    }
    notificationTypeSettings = {
      "repair-request-update": {
        emailSubject: (data) => `\u{1F527} Maintenance Update: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.maintenanceAlerts !== false,
        priority: "medium"
      },
      "repair-request-assigned": {
        emailSubject: (data) => `\u{1F527} New Maintenance Assignment: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.maintenanceAlerts !== false,
        priority: "high"
      },
      "quote-submitted": {
        emailSubject: (data) => `\u{1F4CB} New Quote Received: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.quoteUpdates !== false,
        priority: "medium"
      },
      "quote-approved": {
        emailSubject: (data) => `\u2705 Quote Approved: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.quoteUpdates !== false,
        priority: "high"
      },
      "quote-rejected": {
        emailSubject: (data) => `\u274C Quote Rejected: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.quoteUpdates !== false,
        priority: "medium"
      },
      "meeting_invitation": {
        emailSubject: (data) => `\u{1F4C5} Meeting Invitation: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.meetingReminders !== false,
        priority: "high"
      },
      "meeting-reminder": {
        emailSubject: (data) => `\u23F0 Meeting Reminder: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.meetingReminders !== false,
        priority: "high"
      },
      "announcement": {
        emailSubject: (data) => `\u{1F4E2} New Announcement: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.announcementNotifications !== false,
        priority: "medium"
      },
      "payment-reminder": {
        emailSubject: (data) => `\u{1F4B0} Payment Reminder: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.paymentReminders !== false,
        priority: "high"
      },
      "payment-overdue": {
        emailSubject: (data) => `\u26A0\uFE0F Overdue Payment: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.paymentReminders !== false,
        priority: "high"
      },
      "expense-approved": {
        emailSubject: (data) => `\u2705 Expense Approved: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.emailNotifications !== false,
        priority: "medium"
      },
      "expense-rejected": {
        emailSubject: (data) => `\u274C Expense Rejected: ${data.title}`,
        requiresEmailNotification: (settings) => settings?.emailNotifications !== false,
        priority: "medium"
      },
      "emergency": {
        emailSubject: (data) => `\u{1F6A8} EMERGENCY ALERT: ${data.title}`,
        requiresEmailNotification: (settings) => true,
        // Always send emergency alerts
        priority: "high"
      }
    };
  }
});

// server/postgres-storage.ts
var import_drizzle_orm2, PostgresStorage, postgresStorage;
var init_postgres_storage = __esm({
  "server/postgres-storage.ts"() {
    "use strict";
    import_drizzle_orm2 = require("drizzle-orm");
    init_db();
    init_schema();
    init_email_service();
    PostgresStorage = class {
      // ===== USER OPERATIONS =====
      async getUser(id) {
        const result = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.id, id)).limit(1);
        return result[0] ?? void 0;
      }
      async getUserByEmail(email) {
        const result = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.email, email)).limit(1);
        return result[0] ?? void 0;
      }
      async getUserByResetToken(hashedToken) {
        const result = await db.select().from(users).where((0, import_drizzle_orm2.eq)(users.passwordResetToken, hashedToken)).limit(1);
        return result[0] ?? void 0;
      }
      async createUser(userData) {
        const id = userData.id || crypto.randomUUID();
        const now = /* @__PURE__ */ new Date();
        const [user] = await db.insert(users).values({
          ...userData,
          id,
          createdAt: now,
          updatedAt: now
        }).returning();
        return user;
      }
      async updateUser(id, userData) {
        const [updated] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(users.id, id)).returning();
        if (!updated) throw new Error("User not found after update");
        return updated;
      }
      async deleteUser(id) {
        await db.delete(users).where((0, import_drizzle_orm2.eq)(users.id, id));
      }
      async getAllUsers() {
        return await db.select().from(users);
      }
      async setMustChangePassword(email) {
        await db.update(users).set({ mustChangePassword: true, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(users.email, email));
      }
      async getUsersByStrata(strataId) {
        const accessRecords = await db.select().from(userStrataAccess).where((0, import_drizzle_orm2.eq)(userStrataAccess.strataId, strataId));
        if (accessRecords.length === 0) return [];
        const userIds = accessRecords.map((a) => a.userId);
        return await db.select().from(users).where((0, import_drizzle_orm2.inArray)(users.id, userIds));
      }
      // ===== STRATA OPERATIONS =====
      async getStrata(id) {
        const result = await db.select().from(strata).where((0, import_drizzle_orm2.eq)(strata.id, id)).limit(1);
        return result[0] ?? void 0;
      }
      async getAllStrata() {
        return await db.select().from(strata);
      }
      async createStrata(strataData) {
        const now = /* @__PURE__ */ new Date();
        const [created] = await db.insert(strata).values({
          ...strataData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return created;
      }
      async updateStrata(id, strataData) {
        const [updated] = await db.update(strata).set({ ...strataData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(strata.id, id)).returning();
        if (!updated) throw new Error("Strata not found after update");
        return updated;
      }
      async deleteStrata(id) {
        await db.delete(userStrataAccess).where((0, import_drizzle_orm2.eq)(userStrataAccess.strataId, id));
        await db.delete(units).where((0, import_drizzle_orm2.eq)(units.strataId, id));
        await db.delete(expenses).where((0, import_drizzle_orm2.eq)(expenses.strataId, id));
        await db.delete(vendors).where((0, import_drizzle_orm2.eq)(vendors.strataId, id));
        await db.delete(quotes).where((0, import_drizzle_orm2.eq)(quotes.strataId, id));
        await db.delete(meetings).where((0, import_drizzle_orm2.eq)(meetings.strataId, id));
        await db.delete(documents).where((0, import_drizzle_orm2.eq)(documents.strataId, id));
        await db.delete(maintenanceRequests).where((0, import_drizzle_orm2.eq)(maintenanceRequests.strataId, id));
        await db.delete(announcements).where((0, import_drizzle_orm2.eq)(announcements.strataId, id));
        await db.delete(messages).where((0, import_drizzle_orm2.eq)(messages.strataId, id));
        await db.delete(notifications).where((0, import_drizzle_orm2.eq)(notifications.strataId, id));
        await db.delete(funds).where((0, import_drizzle_orm2.eq)(funds.strataId, id));
        await db.delete(paymentReminders).where((0, import_drizzle_orm2.eq)(paymentReminders.strataId, id));
        await db.delete(strata).where((0, import_drizzle_orm2.eq)(strata.id, id));
      }
      async getUserStrata(userId) {
        const accessRecords = await db.select().from(userStrataAccess).where((0, import_drizzle_orm2.eq)(userStrataAccess.userId, userId));
        if (accessRecords.length === 0) return [];
        const strataIds = accessRecords.map((a) => a.strataId);
        return await db.select().from(strata).where((0, import_drizzle_orm2.inArray)(strata.id, strataIds));
      }
      // ===== USER STRATA ACCESS OPERATIONS =====
      async getUserStrataAccess(userId, strataId) {
        const result = await db.select().from(userStrataAccess).where((0, import_drizzle_orm2.and)(
          (0, import_drizzle_orm2.eq)(userStrataAccess.userId, userId),
          (0, import_drizzle_orm2.eq)(userStrataAccess.strataId, strataId)
        )).limit(1);
        return result[0] ?? void 0;
      }
      async createUserStrataAccess(accessData) {
        const [created] = await db.insert(userStrataAccess).values({
          ...accessData,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return created;
      }
      async deleteUserStrataAccess(accessId) {
        await db.delete(userStrataAccess).where((0, import_drizzle_orm2.eq)(userStrataAccess.id, accessId));
      }
      async updateUserStrataRole(userId, strataId, role) {
        const [updated] = await db.update(userStrataAccess).set({ role }).where((0, import_drizzle_orm2.and)(
          (0, import_drizzle_orm2.eq)(userStrataAccess.userId, userId),
          (0, import_drizzle_orm2.eq)(userStrataAccess.strataId, strataId)
        )).returning();
        return updated ?? void 0;
      }
      async getStrataUsers(strataId) {
        const accessRecords = await db.select().from(userStrataAccess).where((0, import_drizzle_orm2.eq)(userStrataAccess.strataId, strataId));
        const results = [];
        for (const access of accessRecords) {
          const user = await this.getUser(access.userId);
          if (user) {
            results.push({ ...access, user });
          }
        }
        return results;
      }
      async getUserStrataAssignments(userId) {
        const accessRecords = await db.select().from(userStrataAccess).where((0, import_drizzle_orm2.eq)(userStrataAccess.userId, userId));
        const assignments = [];
        for (const access of accessRecords) {
          const strataDoc = await this.getStrata(access.strataId);
          if (strataDoc) {
            assignments.push({
              id: access.id,
              userId: access.userId,
              strataId: access.strataId,
              role: access.role,
              canPostAnnouncements: access.canPostAnnouncements,
              strata: strataDoc,
              createdAt: access.createdAt
            });
          }
        }
        return assignments;
      }
      async checkUserStrataAdminAccess(userId, strataId) {
        const userAccess = await this.getUserStrataAccess(userId, strataId);
        if (!userAccess) return false;
        const adminRoles = ["chairperson", "property_manager", "treasurer", "secretary"];
        return adminRoles.includes(userAccess.role);
      }
      async updateUserStrataAccess(accessId, updateData) {
        const [updated] = await db.update(userStrataAccess).set(updateData).where((0, import_drizzle_orm2.eq)(userStrataAccess.id, accessId)).returning();
        if (!updated) throw new Error("User strata access not found after update");
        return updated;
      }
      // ===== UNIT OPERATIONS =====
      async createUnit(unitData) {
        const now = /* @__PURE__ */ new Date();
        const [unit] = await db.insert(units).values({
          ...unitData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return unit;
      }
      async getStrataUnits(strataId) {
        return await db.select().from(units).where((0, import_drizzle_orm2.eq)(units.strataId, strataId)).orderBy((0, import_drizzle_orm2.asc)(units.unitNumber));
      }
      async updateUnit(unitId, updates) {
        const [updated] = await db.update(units).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(units.id, unitId)).returning();
        if (!updated) throw new Error("Unit not found");
        return updated;
      }
      async deleteUnit(unitId) {
        await db.delete(units).where((0, import_drizzle_orm2.eq)(units.id, unitId));
      }
      // ===== EXPENSE OPERATIONS =====
      async getStrataExpenses(strataId) {
        return await db.select().from(expenses).where((0, import_drizzle_orm2.eq)(expenses.strataId, strataId)).orderBy((0, import_drizzle_orm2.desc)(expenses.createdAt));
      }
      async createExpense(expenseData) {
        const now = /* @__PURE__ */ new Date();
        const [expense] = await db.insert(expenses).values({
          ...expenseData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return expense;
      }
      async updateExpense(expenseId, updateData) {
        const [updated] = await db.update(expenses).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(expenses.id, expenseId)).returning();
        if (!updated) throw new Error("Expense not found after update");
        return updated;
      }
      async deleteExpense(expenseId) {
        await db.delete(expenses).where((0, import_drizzle_orm2.eq)(expenses.id, expenseId));
      }
      // ===== VENDOR OPERATIONS =====
      async getVendor(id) {
        const result = await db.select().from(vendors).where((0, import_drizzle_orm2.eq)(vendors.id, id)).limit(1);
        return result[0] ?? void 0;
      }
      async getVendorsByStrata(strataId) {
        return await db.select().from(vendors).where((0, import_drizzle_orm2.eq)(vendors.strataId, strataId));
      }
      async getAllVendors() {
        return await db.select().from(vendors);
      }
      async createVendor(vendorData) {
        const now = /* @__PURE__ */ new Date();
        const [vendor] = await db.insert(vendors).values({
          ...vendorData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return vendor;
      }
      async updateVendor(id, vendorData) {
        const [updated] = await db.update(vendors).set({ ...vendorData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(vendors.id, id)).returning();
        if (!updated) throw new Error("Vendor not found after update");
        return updated;
      }
      async deleteVendor(id) {
        await db.delete(vendors).where((0, import_drizzle_orm2.eq)(vendors.id, id));
      }
      // ===== VENDOR CONTRACT OPERATIONS =====
      async getVendorContracts(vendorId) {
        return await db.select().from(vendorContracts).where((0, import_drizzle_orm2.eq)(vendorContracts.vendorId, vendorId)).orderBy((0, import_drizzle_orm2.desc)(vendorContracts.createdAt));
      }
      async createVendorContract(contractData) {
        const now = /* @__PURE__ */ new Date();
        const [contract] = await db.insert(vendorContracts).values({
          ...contractData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return contract;
      }
      async updateVendorContract(contractId, updateData) {
        const [updated] = await db.update(vendorContracts).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(vendorContracts.id, contractId)).returning();
        if (!updated) throw new Error("Vendor contract not found after update");
        return updated;
      }
      async deleteVendorContract(contractId) {
        await db.delete(vendorContracts).where((0, import_drizzle_orm2.eq)(vendorContracts.id, contractId));
      }
      // ===== VENDOR HISTORY OPERATIONS =====
      async getVendorHistory(vendorId) {
        return await db.select().from(vendorHistory).where((0, import_drizzle_orm2.eq)(vendorHistory.vendorId, vendorId)).orderBy((0, import_drizzle_orm2.desc)(vendorHistory.createdAt));
      }
      async createVendorHistory(historyData) {
        const now = /* @__PURE__ */ new Date();
        const [history] = await db.insert(vendorHistory).values({
          ...historyData,
          createdAt: now
        }).returning();
        return history;
      }
      async updateVendorHistory(historyId, updateData) {
        const [updated] = await db.update(vendorHistory).set(updateData).where((0, import_drizzle_orm2.eq)(vendorHistory.id, historyId)).returning();
        if (!updated) throw new Error("Vendor history not found after update");
        return updated;
      }
      async deleteVendorHistory(historyId) {
        await db.delete(vendorHistory).where((0, import_drizzle_orm2.eq)(vendorHistory.id, historyId));
      }
      // ===== QUOTE OPERATIONS =====
      async getStrataQuotes(strataId) {
        return await db.select().from(quotes).where((0, import_drizzle_orm2.eq)(quotes.strataId, strataId));
      }
      async createQuote(quoteData) {
        const now = /* @__PURE__ */ new Date();
        const [quote] = await db.insert(quotes).values({
          ...quoteData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return quote;
      }
      async updateQuote(quoteId, updateData) {
        const [updated] = await db.update(quotes).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(quotes.id, quoteId)).returning();
        if (!updated) throw new Error("Quote not found after update");
        return updated;
      }
      async createQuoteProjectFolder(strataId, projectTitle, createdBy) {
        const now = /* @__PURE__ */ new Date();
        const [folder] = await db.insert(documentFolders).values({
          strataId,
          name: projectTitle,
          description: `Project folder for: ${projectTitle}`,
          parentFolderId: null,
          path: `/${projectTitle}`,
          createdBy,
          createdAt: now,
          updatedAt: now
        }).returning();
        return folder;
      }
      // ===== FEE TIER OPERATIONS =====
      async getStrataFeeTiers(strataId) {
        return await db.select().from(feeTiers).where((0, import_drizzle_orm2.eq)(feeTiers.strataId, strataId)).orderBy((0, import_drizzle_orm2.asc)(feeTiers.monthlyAmount));
      }
      async createFeeTier(feeTierData) {
        const now = /* @__PURE__ */ new Date();
        const [tier] = await db.insert(feeTiers).values({
          ...feeTierData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return tier;
      }
      async updateFeeTier(feeTierId, updates) {
        const [updated] = await db.update(feeTiers).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(feeTiers.id, feeTierId)).returning();
        if (!updated) throw new Error("Fee tier not found");
        return updated;
      }
      async deleteFeeTier(feeTierId) {
        await db.delete(feeTiers).where((0, import_drizzle_orm2.eq)(feeTiers.id, feeTierId));
      }
      // ===== DOCUMENT FOLDER OPERATIONS =====
      async getStrataDocumentFolders(strataId, parentFolderId) {
        const conditions = [(0, import_drizzle_orm2.eq)(documentFolders.strataId, strataId)];
        if (parentFolderId) {
          conditions.push((0, import_drizzle_orm2.eq)(documentFolders.parentFolderId, parentFolderId));
        } else {
          conditions.push(import_drizzle_orm2.sql`${documentFolders.parentFolderId} IS NULL`);
        }
        return await db.select().from(documentFolders).where((0, import_drizzle_orm2.and)(...conditions)).orderBy((0, import_drizzle_orm2.asc)(documentFolders.name));
      }
      async createDocumentFolder(folderData) {
        const now = /* @__PURE__ */ new Date();
        const [folder] = await db.insert(documentFolders).values({
          ...folderData,
          path: folderData.path || `/${folderData.name}`,
          createdAt: now,
          updatedAt: now
        }).returning();
        return folder;
      }
      async updateDocumentFolder(folderId, updates) {
        const [updated] = await db.update(documentFolders).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(documentFolders.id, folderId)).returning();
        if (!updated) throw new Error("Document folder not found");
        return updated;
      }
      async deleteDocumentFolder(folderId) {
        await db.delete(documentFolders).where((0, import_drizzle_orm2.eq)(documentFolders.id, folderId));
      }
      async getDocumentFolder(folderId) {
        const result = await db.select().from(documentFolders).where((0, import_drizzle_orm2.eq)(documentFolders.id, folderId)).limit(1);
        if (!result[0]) throw new Error("Document folder not found");
        return result[0];
      }
      async searchDocumentFolders(strataId, searchTerm) {
        return await db.select().from(documentFolders).where((0, import_drizzle_orm2.and)(
          (0, import_drizzle_orm2.eq)(documentFolders.strataId, strataId),
          (0, import_drizzle_orm2.or)(
            (0, import_drizzle_orm2.ilike)(documentFolders.name, `%${searchTerm}%`),
            (0, import_drizzle_orm2.ilike)(documentFolders.description, `%${searchTerm}%`)
          )
        ));
      }
      // ===== DOCUMENT OPERATIONS =====
      async getStrataDocuments(strataId) {
        return await db.select().from(documents).where((0, import_drizzle_orm2.eq)(documents.strataId, strataId)).orderBy((0, import_drizzle_orm2.desc)(documents.createdAt));
      }
      async getFolderDocuments(folderId) {
        return await db.select().from(documents).where((0, import_drizzle_orm2.eq)(documents.folderId, folderId)).orderBy((0, import_drizzle_orm2.desc)(documents.createdAt));
      }
      async searchDocuments(strataId, searchTerm) {
        return await db.select().from(documents).where((0, import_drizzle_orm2.and)(
          (0, import_drizzle_orm2.eq)(documents.strataId, strataId),
          (0, import_drizzle_orm2.or)(
            (0, import_drizzle_orm2.ilike)(documents.title, `%${searchTerm}%`),
            (0, import_drizzle_orm2.ilike)(documents.description, `%${searchTerm}%`)
          )
        ));
      }
      async createDocument(documentData) {
        const now = /* @__PURE__ */ new Date();
        const [doc] = await db.insert(documents).values({
          ...documentData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return doc;
      }
      async updateDocument(documentId, updates) {
        const [updated] = await db.update(documents).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(documents.id, documentId)).returning();
        if (!updated) throw new Error("Document not found");
        return updated;
      }
      async deleteDocument(documentId) {
        await db.delete(documents).where((0, import_drizzle_orm2.eq)(documents.id, documentId));
      }
      // ===== MESSAGE OPERATIONS =====
      async getStrataMessages(strataId, userId) {
        return await db.select().from(messages).where((0, import_drizzle_orm2.eq)(messages.strataId, strataId)).orderBy((0, import_drizzle_orm2.desc)(messages.createdAt));
      }
      async getMessagesByStrata(strataId) {
        return await db.select().from(messages).where((0, import_drizzle_orm2.eq)(messages.strataId, strataId)).orderBy((0, import_drizzle_orm2.desc)(messages.createdAt));
      }
      async createMessage(messageData) {
        const now = /* @__PURE__ */ new Date();
        const cleanedData = Object.fromEntries(
          Object.entries(messageData).filter(([_, value]) => value !== void 0)
        );
        const [message] = await db.insert(messages).values({
          ...cleanedData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return message;
      }
      async deleteConversation(conversationId, userId) {
        await db.delete(messages).where((0, import_drizzle_orm2.and)(
          (0, import_drizzle_orm2.or)(
            (0, import_drizzle_orm2.eq)(messages.id, conversationId),
            (0, import_drizzle_orm2.eq)(messages.conversationId, conversationId),
            (0, import_drizzle_orm2.eq)(messages.parentMessageId, conversationId)
          ),
          (0, import_drizzle_orm2.or)(
            (0, import_drizzle_orm2.eq)(messages.senderId, userId),
            (0, import_drizzle_orm2.eq)(messages.recipientId, userId)
          )
        ));
      }
      async markMessageAsRead(messageId, userId) {
        const result = await db.select().from(messages).where((0, import_drizzle_orm2.eq)(messages.id, messageId)).limit(1);
        if (!result[0]) throw new Error(`Message ${messageId} not found`);
        if (result[0].recipientId !== userId) {
          throw new Error(`User ${userId} is not authorized to mark this message as read`);
        }
        await db.update(messages).set({ isRead: true, readAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(messages.id, messageId));
      }
      // ===== ANNOUNCEMENT OPERATIONS =====
      async getStrataAnnouncements(strataId) {
        return await db.select().from(announcements).where((0, import_drizzle_orm2.eq)(announcements.strataId, strataId)).orderBy((0, import_drizzle_orm2.desc)(announcements.createdAt));
      }
      async getAnnouncement(announcementId) {
        const result = await db.select().from(announcements).where((0, import_drizzle_orm2.eq)(announcements.id, announcementId)).limit(1);
        return result[0] ?? null;
      }
      async createAnnouncement(data) {
        const now = /* @__PURE__ */ new Date();
        const [announcement] = await db.insert(announcements).values({
          ...data,
          createdAt: now,
          updatedAt: now
        }).returning();
        return announcement;
      }
      async updateAnnouncement(announcementId, data) {
        const [updated] = await db.update(announcements).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(announcements.id, announcementId)).returning();
        if (!updated) throw new Error("Announcement not found");
        return updated;
      }
      async deleteAnnouncement(announcementId) {
        await db.delete(announcements).where((0, import_drizzle_orm2.eq)(announcements.id, announcementId));
      }
      async markAnnouncementAsRead(announcementId, userId) {
        const result = await db.select().from(announcements).where((0, import_drizzle_orm2.eq)(announcements.id, announcementId)).limit(1);
        if (!result[0]) throw new Error("Announcement not found");
        const [updated] = await db.update(announcements).set({ updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(announcements.id, announcementId)).returning();
        return updated;
      }
      // ===== NOTIFICATION OPERATIONS =====
      async getDismissedNotifications(strataId, userId) {
        return await db.select().from(notifications).where((0, import_drizzle_orm2.and)(
          (0, import_drizzle_orm2.eq)(notifications.strataId, strataId),
          (0, import_drizzle_orm2.eq)(notifications.userId, userId),
          (0, import_drizzle_orm2.eq)(notifications.isRead, true)
        ));
      }
      async createNotification(notificationData) {
        const [notification] = await db.insert(notifications).values({
          ...notificationData,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        this.sendEmailForNotification(notification).catch((error) => {
          console.error("Failed to send email notification:", error);
        });
        return notification;
      }
      async sendEmailForNotification(notification) {
        try {
          const user = await this.getUser(notification.userId);
          if (!user?.email) return;
          const strataDoc = await this.getStrata(notification.strataId);
          if (!strataDoc) return;
          const emailData = {
            userId: notification.userId,
            userEmail: user.email,
            strataId: notification.strataId,
            strataName: strataDoc.name || "Your Strata",
            notificationType: notification.type,
            title: notification.title,
            message: notification.message,
            metadata: notification.metadata || {}
          };
          await sendNotificationEmail(emailData);
        } catch (error) {
          console.error("Error sending email for notification:", error);
        }
      }
      async getUserNotifications(userId, strataId) {
        const conditions = [(0, import_drizzle_orm2.eq)(notifications.userId, userId)];
        if (strataId) {
          conditions.push((0, import_drizzle_orm2.eq)(notifications.strataId, strataId));
        }
        return await db.select().from(notifications).where((0, import_drizzle_orm2.and)(...conditions)).orderBy((0, import_drizzle_orm2.desc)(notifications.createdAt)).limit(20);
      }
      async markNotificationAsRead(notificationId) {
        await db.update(notifications).set({ isRead: true }).where((0, import_drizzle_orm2.eq)(notifications.id, notificationId));
        return { success: true, message: "Notification marked as read" };
      }
      async getUserDismissedNotifications(userId) {
        return await db.select().from(dismissedNotifications).where((0, import_drizzle_orm2.eq)(dismissedNotifications.userId, userId));
      }
      async dismissNotification(notificationData) {
        const [dismissed] = await db.insert(dismissedNotifications).values({
          userId: notificationData.userId,
          notificationId: notificationData.notificationId,
          notificationType: notificationData.notificationType,
          dismissedAt: /* @__PURE__ */ new Date()
        }).returning();
        return dismissed;
      }
      // ===== MEETING OPERATIONS =====
      async getStrataMeetings(strataId) {
        return await db.select().from(meetings).where((0, import_drizzle_orm2.eq)(meetings.strataId, strataId)).orderBy((0, import_drizzle_orm2.desc)(meetings.scheduledAt));
      }
      async createMeeting(meetingData) {
        const now = /* @__PURE__ */ new Date();
        const [meeting] = await db.insert(meetings).values({
          ...meetingData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return meeting;
      }
      async getMeeting(meetingId) {
        const result = await db.select().from(meetings).where((0, import_drizzle_orm2.eq)(meetings.id, meetingId)).limit(1);
        return result[0] ?? void 0;
      }
      async updateMeeting(meetingId, updates) {
        const [updated] = await db.update(meetings).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(meetings.id, meetingId)).returning();
        if (!updated) throw new Error("Meeting not found");
        return updated;
      }
      async deleteMeeting(meetingId) {
        await db.delete(meetings).where((0, import_drizzle_orm2.eq)(meetings.id, meetingId));
      }
      // ===== MAINTENANCE REQUEST OPERATIONS =====
      async getStrataMaintenanceRequests(strataId) {
        return await db.select().from(maintenanceRequests).where((0, import_drizzle_orm2.eq)(maintenanceRequests.strataId, strataId));
      }
      async createMaintenanceRequest(requestData) {
        const now = /* @__PURE__ */ new Date();
        const [request] = await db.insert(maintenanceRequests).values({
          ...requestData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return request;
      }
      async updateMaintenanceRequest(requestId, updateData) {
        const [updated] = await db.update(maintenanceRequests).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(maintenanceRequests.id, requestId)).returning();
        if (!updated) throw new Error("Maintenance request not found after update");
        return updated;
      }
      // ===== MAINTENANCE PROJECT OPERATIONS =====
      async createMaintenanceProject(projectData) {
        const now = /* @__PURE__ */ new Date();
        const [project] = await db.insert(maintenanceProjects).values({
          ...projectData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return project;
      }
      async updateMaintenanceProject(projectId, updateData) {
        const [updated] = await db.update(maintenanceProjects).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(maintenanceProjects.id, projectId)).returning();
        if (!updated) throw new Error("Maintenance project not found after update");
        return updated;
      }
      async deleteMaintenanceProject(projectId) {
        await db.delete(maintenanceProjects).where((0, import_drizzle_orm2.eq)(maintenanceProjects.id, projectId));
      }
      // ===== REPAIR REQUEST OPERATIONS =====
      async getRepairRequests(strataId, filters) {
        const conditions = [(0, import_drizzle_orm2.eq)(repairRequests.strataId, strataId)];
        if (filters?.status) {
          conditions.push((0, import_drizzle_orm2.eq)(repairRequests.status, filters.status));
        }
        if (filters?.severity) {
          conditions.push((0, import_drizzle_orm2.eq)(repairRequests.severity, filters.severity));
        }
        if (filters?.area) {
          conditions.push((0, import_drizzle_orm2.eq)(repairRequests.area, filters.area));
        }
        return await db.select().from(repairRequests).where((0, import_drizzle_orm2.and)(...conditions)).orderBy((0, import_drizzle_orm2.desc)(repairRequests.createdAt));
      }
      async getRepairRequest(id) {
        const result = await db.select().from(repairRequests).where((0, import_drizzle_orm2.eq)(repairRequests.id, id)).limit(1);
        return result[0] ?? null;
      }
      async createRepairRequest(requestData) {
        const now = /* @__PURE__ */ new Date();
        const [request] = await db.insert(repairRequests).values({
          ...requestData,
          status: "suggested",
          statusHistory: [{
            status: "suggested",
            changedBy: requestData.submittedBy?.userId,
            changedAt: now.toISOString()
          }],
          createdAt: now,
          updatedAt: now
        }).returning();
        return request;
      }
      async updateRepairRequest(id, updates, userId) {
        const existing = await this.getRepairRequest(id);
        if (!existing) throw new Error("Repair request not found");
        let statusHistory = existing.statusHistory || [];
        if (updates.status && updates.status !== existing.status) {
          statusHistory = [...statusHistory, {
            status: updates.status,
            changedBy: userId,
            changedAt: (/* @__PURE__ */ new Date()).toISOString()
          }];
        }
        const [updated] = await db.update(repairRequests).set({
          ...updates,
          statusHistory,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm2.eq)(repairRequests.id, id)).returning();
        if (!updated) throw new Error("Repair request not found after update");
        return updated;
      }
      async deleteRepairRequest(id) {
        await db.delete(repairRequests).where((0, import_drizzle_orm2.eq)(repairRequests.id, id));
      }
      async getRepairRequestStats(strataId) {
        const requests = await db.select().from(repairRequests).where((0, import_drizzle_orm2.eq)(repairRequests.strataId, strataId));
        return {
          total: requests.length,
          suggested: requests.filter((r) => r.status === "suggested").length,
          approved: requests.filter((r) => r.status === "approved").length,
          planned: requests.filter((r) => r.status === "planned").length,
          scheduled: requests.filter((r) => r.status === "scheduled").length,
          inProgress: requests.filter((r) => r.status === "in-progress").length,
          completed: requests.filter((r) => r.status === "completed").length,
          rejected: requests.filter((r) => r.status === "rejected").length,
          emergency: requests.filter((r) => r.severity === "emergency").length,
          high: requests.filter((r) => r.severity === "high").length,
          totalEstimatedCost: requests.reduce((sum, r) => sum + parseFloat(r.estimatedCost || "0"), 0),
          totalActualCost: requests.reduce((sum, r) => sum + parseFloat(r.actualCost || "0"), 0)
        };
      }
      // ===== FUND OPERATIONS =====
      async getStrataFunds(strataId) {
        return await db.select().from(funds).where((0, import_drizzle_orm2.eq)(funds.strataId, strataId)).orderBy((0, import_drizzle_orm2.desc)(funds.createdAt));
      }
      async createFund(data) {
        const now = /* @__PURE__ */ new Date();
        const [fund] = await db.insert(funds).values({
          ...data,
          createdAt: now,
          updatedAt: now
        }).returning();
        return fund;
      }
      async updateFund(fundId, data) {
        const [updated] = await db.update(funds).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(funds.id, fundId)).returning();
        if (!updated) throw new Error("Fund not found");
        return updated;
      }
      async deleteFund(fundId) {
        await db.delete(funds).where((0, import_drizzle_orm2.eq)(funds.id, fundId));
      }
      async createFundTransaction(data) {
        const now = /* @__PURE__ */ new Date();
        const [transaction] = await db.insert(fundTransactions).values({
          ...data,
          createdAt: now
        }).returning();
        return transaction;
      }
      // ===== PAYMENT REMINDER OPERATIONS =====
      async getStrataPaymentReminders(strataId) {
        return await db.select().from(paymentReminders).where((0, import_drizzle_orm2.eq)(paymentReminders.strataId, strataId)).orderBy((0, import_drizzle_orm2.desc)(paymentReminders.createdAt));
      }
      async createPaymentReminder(reminderData) {
        const now = /* @__PURE__ */ new Date();
        const [reminder] = await db.insert(paymentReminders).values({
          ...reminderData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return reminder;
      }
      async updatePaymentReminder(reminderId, updateData) {
        const [updated] = await db.update(paymentReminders).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(paymentReminders.id, reminderId)).returning();
        if (!updated) throw new Error("Payment reminder not found after update");
        return updated;
      }
      async deletePaymentReminder(reminderId) {
        await db.delete(paymentReminders).where((0, import_drizzle_orm2.eq)(paymentReminders.id, reminderId));
      }
      // ===== REPORT OPERATIONS =====
      async getStrataReports(strataId) {
        return await db.select().from(reports).where((0, import_drizzle_orm2.eq)(reports.strataId, strataId)).orderBy((0, import_drizzle_orm2.desc)(reports.createdAt));
      }
      async createReport(reportData) {
        const now = /* @__PURE__ */ new Date();
        const [report] = await db.insert(reports).values({
          ...reportData,
          createdAt: now,
          generatedAt: now
        }).returning();
        return report;
      }
      async getReport(reportId) {
        const result = await db.select().from(reports).where((0, import_drizzle_orm2.eq)(reports.id, reportId)).limit(1);
        return result[0] ?? null;
      }
      async updateReport(reportId, updates) {
        const [updated] = await db.update(reports).set(updates).where((0, import_drizzle_orm2.eq)(reports.id, reportId)).returning();
        if (!updated) throw new Error("Report not found");
        return updated;
      }
      async deleteReport(reportId) {
        await db.delete(reports).where((0, import_drizzle_orm2.eq)(reports.id, reportId));
      }
      async generateFinancialReport(strataId, dateRange) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        const expenses2 = await db.select().from(expenses).where((0, import_drizzle_orm2.eq)(expenses.strataId, strataId));
        const filteredExpenses = expenses2.filter((e) => {
          const d = e.createdAt ? new Date(e.createdAt) : /* @__PURE__ */ new Date(0);
          return d >= startDate && d <= endDate;
        });
        const funds2 = await db.select().from(funds).where((0, import_drizzle_orm2.eq)(funds.strataId, strataId));
        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || "0"), 0);
        const totalFunds = funds2.reduce((sum, f) => sum + parseFloat(f.balance || "0"), 0);
        return {
          dateRange,
          summary: { totalExpenses, totalFunds, numberOfExpenses: filteredExpenses.length, numberOfFunds: funds2.length },
          expenses: filteredExpenses.map((e) => ({
            id: e.id,
            description: e.description,
            amount: e.amount,
            category: e.category,
            date: e.createdAt
          })),
          funds: funds2.map((f) => ({
            id: f.id,
            name: f.name,
            type: f.type,
            currentBalance: f.balance,
            targetAmount: f.target
          }))
        };
      }
      async generateMeetingMinutesReport(strataId, dateRange) {
        let meetings2 = await db.select().from(meetings).where((0, import_drizzle_orm2.eq)(meetings.strataId, strataId));
        if (dateRange) {
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          meetings2 = meetings2.filter((m) => {
            const d = new Date(m.scheduledAt || m.meetingDate || 0);
            return d >= startDate && d <= endDate;
          });
        }
        return {
          dateRange: dateRange || { start: "All time", end: "All time" },
          summary: {
            totalMeetings: meetings2.length,
            meetingTypes: meetings2.reduce((acc, m) => {
              const type = m.meetingType || "general_meeting";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {})
          },
          meetings: meetings2.map((m) => ({
            id: m.id,
            title: m.title,
            type: m.meetingType,
            date: m.scheduledAt || m.meetingDate,
            location: m.location,
            agenda: m.agenda,
            minutes: m.minutes,
            transcription: m.transcription
          }))
        };
      }
      async generateCommunicationsReport(strataId, dateRange) {
        let announcementsList = await db.select().from(announcements).where((0, import_drizzle_orm2.eq)(announcements.strataId, strataId));
        let messagesList = await db.select().from(messages).where((0, import_drizzle_orm2.eq)(messages.strataId, strataId));
        if (dateRange) {
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          announcementsList = announcementsList.filter((a) => {
            const d = a.createdAt ? new Date(a.createdAt) : /* @__PURE__ */ new Date(0);
            return d >= startDate && d <= endDate;
          });
          messagesList = messagesList.filter((m) => {
            const d = m.createdAt ? new Date(m.createdAt) : /* @__PURE__ */ new Date(0);
            return d >= startDate && d <= endDate;
          });
        }
        return {
          dateRange: dateRange || { start: "All time", end: "All time" },
          summary: {
            totalAnnouncements: announcementsList.length,
            totalMessages: messagesList.length,
            totalCommunications: announcementsList.length + messagesList.length
          },
          announcements: announcementsList.map((a) => ({
            id: a.id,
            title: a.title,
            priority: a.priority,
            createdAt: a.createdAt
          })),
          messages: messagesList.map((m) => ({
            id: m.id,
            subject: m.subject,
            createdAt: m.createdAt
          }))
        };
      }
      async generateMaintenanceReport(strataId, dateRange) {
        let requests = await db.select().from(maintenanceRequests).where((0, import_drizzle_orm2.eq)(maintenanceRequests.strataId, strataId));
        if (dateRange) {
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          requests = requests.filter((r) => {
            const d = r.createdAt ? new Date(r.createdAt) : /* @__PURE__ */ new Date(0);
            return d >= startDate && d <= endDate;
          });
        }
        const statusGroups = requests.reduce((acc, r) => {
          const status = r.status || "pending";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        const priorityGroups = requests.reduce((acc, r) => {
          const priority = r.priority || "medium";
          acc[priority] = (acc[priority] || 0) + 1;
          return acc;
        }, {});
        return {
          dateRange: dateRange || { start: "All time", end: "All time" },
          summary: { totalRequests: requests.length, byStatus: statusGroups, byPriority: priorityGroups },
          requests: requests.map((r) => ({
            id: r.id,
            title: r.title,
            description: r.description,
            priority: r.priority,
            status: r.status,
            createdAt: r.createdAt
          }))
        };
      }
      async generateHomeSalePackage(strataId) {
        const expenses2 = await db.select().from(expenses).where((0, import_drizzle_orm2.eq)(expenses.strataId, strataId));
        const meetings2 = await db.select().from(meetings).where((0, import_drizzle_orm2.eq)(meetings.strataId, strataId));
        const docs = await db.select().from(documents).where((0, import_drizzle_orm2.eq)(documents.strataId, strataId));
        return {
          generatedDate: (/* @__PURE__ */ new Date()).toISOString(),
          summary: {
            totalDocuments: docs.length,
            recentMeetings: meetings2.slice(0, 5),
            recentExpenses: expenses2.slice(0, 10)
          },
          documents: docs.map((d) => ({ id: d.id, title: d.title, type: d.type, uploadDate: d.createdAt })),
          financialSummary: {
            recentExpenses: expenses2.slice(0, 20).map((e) => ({
              description: e.description,
              amount: e.amount,
              date: e.createdAt,
              category: e.category
            }))
          },
          meetingSummary: {
            recentMeetings: meetings2.slice(0, 10).map((m) => ({
              title: m.title,
              date: m.scheduledAt || m.meetingDate,
              type: m.meetingType
            }))
          }
        };
      }
      // ===== RESIDENT DIRECTORY OPERATIONS =====
      async getStrataResidentDirectory(strataId) {
        return await db.select().from(residentDirectory).where((0, import_drizzle_orm2.eq)(residentDirectory.strataId, strataId));
      }
      async createResidentDirectoryEntry(entryData) {
        const now = /* @__PURE__ */ new Date();
        const [entry] = await db.insert(residentDirectory).values({
          ...entryData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return entry;
      }
      async updateResidentDirectoryEntry(id, updates) {
        const [updated] = await db.update(residentDirectory).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(residentDirectory.id, id)).returning();
        if (!updated) throw new Error("Resident directory entry not found");
        return updated;
      }
      // ===== PENDING REGISTRATION OPERATIONS =====
      async createPendingRegistration(registrationData) {
        const now = /* @__PURE__ */ new Date();
        const [registration] = await db.insert(pendingStrataRegistrations).values({
          ...registrationData,
          createdAt: now,
          updatedAt: now
        }).returning();
        return registration;
      }
      // ===== ADMIN / METRICS OPERATIONS =====
      async getStrataMetrics(strataId) {
        try {
          const [unitsResult, pendingExpenses, pendingMaintenance, pendingQuotes] = await Promise.all([
            db.select({ count: (0, import_drizzle_orm2.count)() }).from(units).where((0, import_drizzle_orm2.eq)(units.strataId, strataId)),
            db.select({ count: (0, import_drizzle_orm2.count)() }).from(expenses).where((0, import_drizzle_orm2.and)(
              (0, import_drizzle_orm2.eq)(expenses.strataId, strataId),
              (0, import_drizzle_orm2.eq)(expenses.status, "pending")
            )),
            db.select({ count: (0, import_drizzle_orm2.count)() }).from(maintenanceRequests).where((0, import_drizzle_orm2.and)(
              (0, import_drizzle_orm2.eq)(maintenanceRequests.strataId, strataId),
              (0, import_drizzle_orm2.inArray)(maintenanceRequests.status, ["open", "in_progress"])
            )),
            db.select({ count: (0, import_drizzle_orm2.count)() }).from(quotes).where((0, import_drizzle_orm2.and)(
              (0, import_drizzle_orm2.eq)(quotes.strataId, strataId),
              (0, import_drizzle_orm2.eq)(quotes.status, "pending")
            ))
          ]);
          const paymentReminders2 = await this.getStrataPaymentReminders(strataId);
          const now = /* @__PURE__ */ new Date();
          let outstandingTotal = 0;
          paymentReminders2.forEach((reminder) => {
            if (reminder.dueDate && reminder.status !== "paid" && reminder.status !== "cancelled") {
              const dueDate = new Date(reminder.dueDate);
              if (dueDate < now) {
                outstandingTotal += parseFloat(reminder.amount || "0");
              }
            }
          });
          const totalPendingApprovals = (pendingExpenses[0]?.count || 0) + (pendingQuotes[0]?.count || 0);
          return {
            totalProperties: unitsResult[0]?.count || 0,
            outstandingFees: `$${outstandingTotal.toFixed(2)}`,
            pendingApprovals: totalPendingApprovals,
            openMaintenance: pendingMaintenance[0]?.count || 0
          };
        } catch (error) {
          console.error("Error getting strata metrics:", error);
          return {
            totalProperties: 0,
            outstandingFees: "$0.00",
            pendingApprovals: 0,
            openMaintenance: 0
          };
        }
      }
      async getPendingApprovals(strataId) {
        const [pendingExpenses, pendingMaintenance, pendingQuotes] = await Promise.all([
          db.select().from(expenses).where((0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(expenses.strataId, strataId),
            (0, import_drizzle_orm2.eq)(expenses.status, "pending")
          )),
          db.select().from(maintenanceRequests).where((0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(maintenanceRequests.strataId, strataId),
            (0, import_drizzle_orm2.eq)(maintenanceRequests.status, "pending")
          )),
          db.select().from(quotes).where((0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(quotes.strataId, strataId),
            (0, import_drizzle_orm2.eq)(quotes.status, "pending")
          ))
        ]);
        return [
          ...pendingExpenses.map((e) => ({ ...e, type: "expense" })),
          ...pendingMaintenance.map((m) => ({ ...m, type: "maintenance" })),
          ...pendingQuotes.map((q) => ({ ...q, type: "quote" }))
        ];
      }
    };
    postgresStorage = new PostgresStorage();
  }
});

// server/storage-factory.ts
var storage;
var init_storage_factory = __esm({
  "server/storage-factory.ts"() {
    "use strict";
    init_postgres_storage();
    storage = new PostgresStorage();
  }
});

// server/openai.ts
var openai_exports = {};
__export(openai_exports, {
  extractQuoteDataFromDocument: () => extractQuoteDataFromDocument,
  extractQuoteDataFromText: () => extractQuoteDataFromText,
  generateMeetingMinutes: () => generateMeetingMinutes,
  transcribeAudio: () => transcribeAudio
});
async function transcribeAudio(audioBuffer, filename) {
  if (!openai) {
    throw new Error("OpenAI API is not configured. Audio transcription requires OpenAI Whisper. Please add OPENAI_API_KEY to your .env file, or use manual note-taking.");
  }
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const timestamp2 = Date.now();
  const tempAudioPath = path.join(tempDir, `audio_${timestamp2}_${filename}`);
  try {
    fs.writeFileSync(tempAudioPath, audioBuffer);
    console.log(`Audio file size: ${(audioBuffer.length / 1024).toFixed(2)} KB`);
    const audioStream = fs.createReadStream(tempAudioPath);
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      language: "en",
      response_format: "text"
    });
    return transcription;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio");
  } finally {
    if (fs.existsSync(tempAudioPath)) {
      fs.unlinkSync(tempAudioPath);
    }
  }
}
async function generateMeetingMinutes(transcription, meetingTitle, meetingType, chairperson, agenda) {
  if (!anthropic) {
    throw new Error("Claude API is not configured. Please add ANTHROPIC_API_KEY to your .env file to enable meeting minutes generation.");
  }
  try {
    const prompt = `You are a professional meeting secretary. Please create formal, well-structured meeting minutes from the following transcription.

Meeting Information:
- Title: ${meetingTitle}
- Type: ${meetingType}
- Chairperson: ${chairperson || "Not specified"}
- Agenda: ${agenda || "Not specified"}

Transcription:
${transcription}

Please format the minutes professionally with the following structure:
1. Meeting Header (Title, Date, Type, Chairperson)
2. Attendees (extract from transcription if mentioned)
3. Agenda Items Discussed
4. Key Decisions Made
5. Action Items (with responsible parties if mentioned)
6. Next Steps/Follow-up
7. Meeting Adjournment

Make the minutes clear, concise, and professionally formatted. Focus on key decisions, action items, and important discussions. Avoid including filler words or casual conversation.`;
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      temperature: 0.3,
      system: "You are a professional meeting secretary with expertise in creating formal meeting minutes for strata/condominium board meetings.",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });
    const textContent = response.content.find((block) => block.type === "text");
    return textContent && textContent.type === "text" ? textContent.text : "Failed to generate meeting minutes";
  } catch (error) {
    console.error("Error generating meeting minutes:", error);
    throw new Error("Failed to generate meeting minutes with AI");
  }
}
async function convertPdfToImage(base64Data) {
  const tempDir = path.join(process.cwd(), "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  const timestamp2 = Date.now();
  const tempPdfPath = path.join(tempDir, `temp_${timestamp2}.pdf`);
  try {
    const pdfBuffer = Buffer.from(base64Data, "base64");
    console.log(`PDF size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);
    console.log("Attempting PDF conversion with pdf2pic...");
    try {
      const options = {
        density: 100,
        saveFilename: "page",
        savePath: tempDir,
        format: "jpeg",
        width: 1568,
        // Claude can handle larger images
        height: 1568,
        quality: 85
      };
      const convert = fromPath(tempPdfPath, options);
      const result = await convert(1, { responseType: "buffer" });
      if (result && result.buffer && result.buffer.length > 100) {
        const base64Image = result.buffer.toString("base64");
        console.log(`PDF converted successfully: ${(result.buffer.length / 1024).toFixed(2)} KB`);
        fs.unlinkSync(tempPdfPath);
        return base64Image;
      }
    } catch (pdf2picError) {
      console.log("pdf2pic failed, trying system command...");
    }
    console.log("Attempting PDF conversion with pdftoppm...");
    try {
      const outputPrefix = path.join(tempDir, `page_${timestamp2}`);
      const outputPath = `${outputPrefix}-01.jpg`;
      const command = `pdftoppm -f 1 -l 1 -jpeg -r 150 -scale-to-x 1568 -scale-to-y 1568 "${tempPdfPath}" "${outputPrefix}"`;
      await execAsync(command);
      if (fs.existsSync(outputPath)) {
        const imageBuffer = fs.readFileSync(outputPath);
        if (imageBuffer.length > 100) {
          const base64Image = imageBuffer.toString("base64");
          console.log(`PDF converted with pdftoppm: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
          fs.unlinkSync(tempPdfPath);
          fs.unlinkSync(outputPath);
          return base64Image;
        }
      }
    } catch (pdftoppmError) {
      console.log("pdftoppm failed, trying ImageMagick...");
    }
    console.log("Attempting PDF conversion with ImageMagick...");
    try {
      const outputImagePath = path.join(tempDir, `converted_${timestamp2}.jpg`);
      const command = `convert -density 150 -quality 85 -resize 1568x1568 "${tempPdfPath}[0]" "${outputImagePath}"`;
      await execAsync(command);
      if (fs.existsSync(outputImagePath)) {
        const imageBuffer = fs.readFileSync(outputImagePath);
        if (imageBuffer.length > 100) {
          const base64Image = imageBuffer.toString("base64");
          console.log(`PDF converted with ImageMagick: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
          fs.unlinkSync(tempPdfPath);
          fs.unlinkSync(outputImagePath);
          return base64Image;
        }
      }
    } catch (imageMagickError) {
      console.log("ImageMagick failed");
    }
    throw new Error("All PDF conversion methods failed");
  } catch (error) {
    console.error("PDF conversion error:", error);
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }
    throw new Error(`PDF conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
async function extractQuoteDataFromDocument(base64Data, mimeType) {
  if (!anthropic) {
    throw new Error("Claude API is not configured. Please add ANTHROPIC_API_KEY to your .env file to enable AI document analysis.");
  }
  try {
    let imageData = base64Data;
    let imageMimeType = mimeType;
    if (mimeType === "application/pdf") {
      console.log("Converting PDF to image for AI analysis...");
      try {
        imageData = await convertPdfToImage(base64Data);
        imageMimeType = "image/jpeg";
        console.log("PDF conversion successful, proceeding with AI analysis...");
      } catch (pdfError) {
        console.error("PDF conversion failed:", pdfError);
        throw new Error("PDF conversion failed. Please convert your PDF to an image (JPG/PNG) and try again, or fill out the form manually.");
      }
    }
    if (!imageMimeType.startsWith("image/")) {
      throw new Error("Unsupported file type. Only images and PDFs are supported.");
    }
    const imageSizeKB = imageData.length * 3 / 4 / 1024;
    console.log(`Image size: ${imageSizeKB.toFixed(2)} KB`);
    if (!imageData || imageData.length === 0) {
      throw new Error("No image data available for analysis.");
    }
    if (imageSizeKB > 5e3) {
      throw new Error("Image too large for AI analysis. Please use a smaller image.");
    }
    if (imageSizeKB < 1) {
      throw new Error("Image appears to be empty or corrupted.");
    }
    console.log("Sending image to Claude for analysis...");
    let claudeMediaType;
    if (imageMimeType === "image/jpeg" || imageMimeType === "image/jpg") {
      claudeMediaType = "image/jpeg";
    } else if (imageMimeType === "image/png") {
      claudeMediaType = "image/png";
    } else if (imageMimeType === "image/gif") {
      claudeMediaType = "image/gif";
    } else if (imageMimeType === "image/webp") {
      claudeMediaType = "image/webp";
    } else {
      claudeMediaType = "image/jpeg";
    }
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      system: `You are an expert at extracting structured information from construction and service quotes/estimates.
      Analyze the document and extract relevant information for a quote management system.

      Return ONLY a valid JSON object with the following fields (only include fields if information is clearly present):
      - projectTitle: Brief title of the project/work
      - projectType: Category like "Maintenance", "Repair", "Installation", "Construction", etc.
      - description: Detailed description of work to be performed
      - scope: Specific scope of work, materials, specifications
      - amount: Total estimated cost (extract numbers and currency)
      - vendorName: Company/contractor name
      - vendorEmail: Contact email
      - vendorPhone: Phone number
      - vendorAddress: Business address
      - vendorWebsite: Website URL
      - licenseNumber: License or certification number
      - hasLiabilityInsurance: true/false if insurance is mentioned
      - startDate: Proposed start date (YYYY-MM-DD format)
      - estimatedCompletion: Expected completion date (YYYY-MM-DD format)
      - validUntil: Quote expiration date (YYYY-MM-DD format)
      - warranty: Warranty terms/period
      - paymentTerms: Payment schedule or terms
      - notes: Additional important details or conditions

      Be conservative - only extract information that is clearly stated. Don't make assumptions.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: claudeMediaType,
                data: imageData
              }
            },
            {
              type: "text",
              text: "Please analyze this quote/estimate document and extract the structured information in JSON format. Return ONLY the JSON object, no other text."
            }
          ]
        }
      ]
    });
    console.log("Claude analysis completed successfully");
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
    }
    const result = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("Error extracting quote data:", error);
    if (error.status === 429) {
      throw new Error("Too many requests to Claude API. Please wait a moment and try again.");
    } else if (error.status === 401) {
      throw new Error("Invalid Claude API key. Please check your ANTHROPIC_API_KEY configuration.");
    } else if (error.status === 413) {
      throw new Error("Image file is too large for AI analysis. Please use a smaller file.");
    } else {
      throw new Error(`Failed to analyze document with AI: ${error.message || "Unknown error"}`);
    }
  }
}
async function extractQuoteDataFromText(text2) {
  if (!anthropic) {
    throw new Error("Claude API is not configured. Please add ANTHROPIC_API_KEY to your .env file to enable AI text analysis.");
  }
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 4096,
      system: `You are an expert at extracting structured information from construction and service quotes/estimates text.
      Analyze the text and extract relevant information for a quote management system.

      Return ONLY a valid JSON object with the following fields (only include fields if information is clearly present):
      - projectTitle: Brief title of the project/work
      - projectType: Category like "Maintenance", "Repair", "Installation", "Construction", etc.
      - description: Detailed description of work to be performed
      - scope: Specific scope of work, materials, specifications
      - amount: Total estimated cost (extract numbers and currency)
      - vendorName: Company/contractor name
      - vendorEmail: Contact email
      - vendorPhone: Phone number
      - vendorAddress: Business address
      - vendorWebsite: Website URL
      - licenseNumber: License or certification number
      - hasLiabilityInsurance: true/false if insurance is mentioned
      - startDate: Proposed start date (YYYY-MM-DD format)
      - estimatedCompletion: Expected completion date (YYYY-MM-DD format)
      - validUntil: Quote expiration date (YYYY-MM-DD format)
      - warranty: Warranty terms/period
      - paymentTerms: Payment schedule or terms
      - notes: Additional important details or conditions

      Be conservative - only extract information that is clearly stated. Don't make assumptions.`,
      messages: [
        {
          role: "user",
          content: `Please analyze this quote/estimate text and extract the structured information in JSON format. Return ONLY the JSON object, no other text:

${text2}`
        }
      ]
    });
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }
    let jsonText = textContent.text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\n/, "").replace(/\n```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\n/, "").replace(/\n```$/, "");
    }
    const result = JSON.parse(jsonText);
    return result;
  } catch (error) {
    console.error("Error extracting quote data from text:", error);
    throw new Error("Failed to analyze text with AI");
  }
}
var import_sdk, import_openai, fs, path, import_child_process, import_util, fromPath, execAsync, anthropic, openai;
var init_openai = __esm({
  "server/openai.ts"() {
    "use strict";
    import_sdk = __toESM(require("@anthropic-ai/sdk"), 1);
    import_openai = __toESM(require("openai"), 1);
    fs = __toESM(require("fs"), 1);
    path = __toESM(require("path"), 1);
    import_child_process = require("child_process");
    import_util = require("util");
    fromPath = null;
    execAsync = (0, import_util.promisify)(import_child_process.exec);
    anthropic = null;
    if (process.env.ANTHROPIC_API_KEY) {
      console.log("\u{1F916} Claude API (Anthropic) configured");
      anthropic = new import_sdk.default({ apiKey: process.env.ANTHROPIC_API_KEY });
    } else {
      console.log("\u2139\uFE0F  Claude API not configured - AI features will be disabled");
    }
    openai = null;
    if (process.env.OPENAI_API_KEY) {
      console.log("\u{1F3A4} OpenAI Whisper configured for audio transcription");
      openai = new import_openai.default({ apiKey: process.env.OPENAI_API_KEY });
    }
  }
});

// server/pdf-generator.ts
var pdf_generator_exports = {};
__export(pdf_generator_exports, {
  generateReportPDF: () => generateReportPDF
});
function formatDate(date) {
  try {
    if (!date) return "N/A";
    if (date._seconds) {
      return new Date(date._seconds * 1e3).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    }
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid Date";
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "N/A";
  }
}
function formatCurrency(amount) {
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
async function generateBarChart(data, title) {
  const configuration = {
    type: "bar",
    data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16, weight: "bold" },
          color: COLORS.primary
        },
        legend: {
          display: true,
          position: "bottom"
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return "$" + value.toLocaleString();
            }
          }
        }
      }
    }
  };
  return await chartJSNodeCanvas.renderToBuffer(configuration);
}
async function generatePieChart(data, title) {
  const configuration = {
    type: "pie",
    data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16, weight: "bold" },
          color: COLORS.primary
        },
        legend: {
          display: true,
          position: "right"
        }
      }
    }
  };
  return await chartJSNodeCanvas.renderToBuffer(configuration);
}
async function generateDoughnutChart(data, title) {
  const configuration = {
    type: "doughnut",
    data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: 16, weight: "bold" },
          color: COLORS.primary
        },
        legend: {
          display: true,
          position: "right"
        }
      }
    }
  };
  return await chartJSNodeCanvas.renderToBuffer(configuration);
}
function addHeader(doc, reportData) {
  const pageWidth = doc.page.width;
  const margin = 50;
  try {
    if (import_fs.default.existsSync(logoPath)) {
      doc.image(logoPath, margin, margin - 10, { height: 50 });
    } else {
      doc.fontSize(18).font("Helvetica-Bold").fillColor(COLORS.primary).text("VibeStrat", margin, margin);
    }
  } catch (error) {
    doc.fontSize(18).font("Helvetica-Bold").fillColor(COLORS.primary).text("VibeStrat", margin, margin);
  }
  doc.fontSize(24).font("Helvetica-Bold").fillColor(COLORS.primary).text(reportData.title || "Report", margin, margin + 10, {
    width: pageWidth - 2 * margin,
    align: "center"
  });
  if (reportData.strataName) {
    const boxWidth = 180;
    const boxX = pageWidth - margin - boxWidth;
    const boxY = margin;
    const boxHeight = 60;
    doc.rect(boxX, boxY, boxWidth, boxHeight).fillAndStroke(COLORS.primary, COLORS.primary);
    doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.white).text(reportData.strataName, boxX + 10, boxY + 10, {
      width: boxWidth - 20,
      align: "center"
    });
    if (reportData.strataUnits) {
      doc.fontSize(10).font("Helvetica").text(`${reportData.strataUnits} units`, boxX + 10, boxY + 28, {
        width: boxWidth - 20,
        align: "center"
      });
    }
    if (reportData.strataAddress) {
      doc.fontSize(8).font("Helvetica").text(reportData.strataAddress, boxX + 10, boxY + 42, {
        width: boxWidth - 20,
        align: "center",
        ellipsis: true
      });
    }
  }
  doc.fontSize(10).font("Helvetica").fillColor(COLORS.neutralDark).text(`Generated: ${formatDate(reportData.generatedAt)}`, margin, margin + 50, {
    width: pageWidth - 2 * margin,
    align: "center"
  });
  if (reportData.dateRange && reportData.dateRange.start && reportData.dateRange.start !== "All time") {
    doc.text(
      `Report Period: ${formatDate(reportData.dateRange.start)} - ${formatDate(reportData.dateRange.end)}`,
      margin,
      margin + 65,
      {
        width: pageWidth - 2 * margin,
        align: "center"
      }
    );
  }
  doc.moveTo(margin, margin + 90).lineTo(pageWidth - margin, margin + 90).strokeColor(COLORS.accent).lineWidth(2).stroke();
  doc.moveDown(5);
}
function addKPIDashboard(doc, kpis) {
  const pageWidth = doc.page.width;
  const margin = 50;
  const boxWidth = (pageWidth - 2 * margin - 30) / 4;
  const boxHeight = 70;
  let x = margin;
  const y = doc.y + 10;
  kpis.forEach((kpi, index2) => {
    doc.rect(x, y, boxWidth, boxHeight).fillAndStroke(kpi.color, kpi.color);
    doc.fontSize(10).font("Helvetica").fillColor(COLORS.white).text(kpi.label, x + 10, y + 10, {
      width: boxWidth - 20,
      align: "center"
    });
    doc.fontSize(16).font("Helvetica-Bold").text(kpi.value, x + 10, y + 30, {
      width: boxWidth - 20,
      align: "center"
    });
    x += boxWidth + 10;
  });
  doc.y = y + boxHeight + 20;
}
function drawTable(doc, headers, rows, columnWidths, options = {}) {
  const margin = 50;
  const startY = doc.y + 10;
  let y = startY;
  if (options.title) {
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.primary).text(options.title, margin, y);
    y += 25;
  }
  let x = margin;
  doc.rect(margin, y, columnWidths.reduce((a, b) => a + b, 0), 20).fillAndStroke(COLORS.tableHeader, COLORS.tableHeader);
  doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.white);
  headers.forEach((header, i) => {
    doc.text(header, x + 5, y + 5, {
      width: columnWidths[i] - 10,
      align: options.alignments?.[i] || "left"
    });
    x += columnWidths[i];
  });
  y += 20;
  doc.fontSize(9).font("Helvetica");
  rows.forEach((row, rowIndex) => {
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
    const fillColor = rowIndex % 2 === 0 ? COLORS.white : COLORS.tableAlt;
    doc.rect(margin, y, columnWidths.reduce((a, b) => a + b, 0), 18).fillAndStroke(fillColor, COLORS.neutralDark).lineWidth(0.5);
    x = margin;
    doc.fillColor(COLORS.primary);
    row.forEach((cell, i) => {
      doc.text(cell, x + 5, y + 5, {
        width: columnWidths[i] - 10,
        align: options.alignments?.[i] || "left",
        ellipsis: true
      });
      x += columnWidths[i];
    });
    y += 18;
  });
  if (options.summaryRow) {
    doc.rect(margin, y, columnWidths.reduce((a, b) => a + b, 0), 20).fillAndStroke(COLORS.tableSummary, COLORS.accent).lineWidth(1);
    x = margin;
    doc.fontSize(10).font("Helvetica-Bold").fillColor(COLORS.primary);
    options.summaryRow.forEach((cell, i) => {
      doc.text(cell, x + 5, y + 5, {
        width: columnWidths[i] - 10,
        align: options.alignments?.[i] || "left"
      });
      x += columnWidths[i];
    });
    y += 20;
  }
  doc.y = y + 10;
}
async function generateReportPDF(reportData) {
  return new Promise(async (resolve, reject) => {
    console.log("\u{1F528} Starting enhanced PDF generation for:", reportData.title);
    const chunks = [];
    let doc;
    try {
      doc = new import_pdfkit.default({
        margin: 50,
        size: "LETTER",
        bufferPages: true
      });
      doc.on("data", (chunk) => {
        chunks.push(chunk);
      });
      doc.on("end", () => {
        const buffer = Buffer.concat(chunks);
        console.log("\u2705 Enhanced PDF generated successfully, size:", buffer.length, "bytes");
        resolve(buffer);
      });
      doc.on("error", (err) => {
        console.error("\u274C PDF document error:", err);
        reject(err);
      });
      addHeader(doc, reportData);
      console.log("\u{1F4C4} Rendering enhanced report type:", reportData.reportType);
      switch (reportData.reportType) {
        case "financial":
          await renderFinancialReport(doc, reportData.content);
          break;
        case "meeting-minutes":
          await renderMeetingMinutesReport(doc, reportData.content);
          break;
        case "communications":
          await renderCommunicationsReport(doc, reportData.content);
          break;
        case "maintenance":
          await renderMaintenanceReport(doc, reportData.content);
          break;
        case "home-sale-package":
          await renderHomeSalePackage(doc, reportData.content);
          break;
        default:
          doc.fontSize(12).text("Report content not available for PDF format.");
      }
      const pages = doc.bufferedPageRange();
      console.log("\u{1F4C4} Total pages:", pages.count);
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        const pageHeight = doc.page.height;
        const pageWidth = doc.page.width;
        doc.moveTo(50, pageHeight - 60).lineTo(pageWidth - 50, pageHeight - 60).strokeColor(COLORS.accent).lineWidth(1).stroke();
        doc.fontSize(8).font("Helvetica").fillColor(COLORS.neutralDark).text(
          `Page ${i + 1} of ${pages.count}`,
          50,
          pageHeight - 45,
          { width: pageWidth - 100, align: "right" }
        );
        doc.text(
          `VibeStrat \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()}`,
          50,
          pageHeight - 45,
          { align: "left" }
        );
      }
      console.log("\u2705 Finalizing enhanced PDF document...");
      doc.end();
    } catch (error) {
      console.error("\u274C Error during enhanced PDF generation:", error);
      if (doc) {
        try {
          doc.end();
        } catch (e) {
        }
      }
      reject(error);
    }
  });
}
async function renderFinancialReport(doc, content) {
  const margin = 50;
  const totalIncome = content.monthlyIncome || 0;
  const totalExpenses = content.totalExpenses || 0;
  const netBalance = totalIncome - totalExpenses;
  const totalFunds = content.funds?.reduce((sum, fund) => sum + parseFloat(fund.balance || 0), 0) || 0;
  const reservePercent = totalFunds > 0 ? ((content.funds?.find((f) => f.type === "reserve")?.balance || 0) / totalFunds * 100).toFixed(1) : "0";
  addKPIDashboard(doc, [
    { label: "Monthly Income", value: formatCurrency(totalIncome), color: COLORS.success },
    { label: "Total Expenses", value: formatCurrency(totalExpenses), color: COLORS.warning },
    { label: "Net Balance", value: formatCurrency(netBalance), color: netBalance >= 0 ? COLORS.success : COLORS.warning },
    { label: "Reserve Fund", value: `${reservePercent}%`, color: COLORS.accent }
  ]);
  doc.moveDown(2);
  doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.primary).text("Executive Summary", margin, doc.y);
  doc.moveDown(0.5);
  doc.fontSize(11).font("Helvetica").fillColor(COLORS.primary).text(
    `This financial report provides a comprehensive overview of the strata's financial health. The strata generated ${formatCurrency(totalIncome)} in income and incurred ${formatCurrency(totalExpenses)} in expenses, resulting in a net ${netBalance >= 0 ? "positive" : "negative"} balance of ${formatCurrency(Math.abs(netBalance))}.`,
    { align: "justify" }
  );
  doc.moveDown(2);
  if (content.funds && content.funds.length > 0) {
    try {
      const fundLabels = content.funds.map((f) => f.name || "Unnamed");
      const fundData = content.funds.map((f) => parseFloat(f.balance || 0));
      const fundColors = [COLORS.accent, COLORS.success, COLORS.primary, COLORS.warning, COLORS.accentLight];
      const pieChartBuffer = await generatePieChart(
        {
          labels: fundLabels,
          datasets: [{
            data: fundData,
            backgroundColor: fundColors.slice(0, fundData.length),
            borderWidth: 2,
            borderColor: COLORS.white
          }]
        },
        "Fund Allocation"
      );
      if (doc.y > doc.page.height - 350) {
        doc.addPage();
      }
      doc.image(pieChartBuffer, margin, doc.y, { width: 450 });
      doc.moveDown(15);
    } catch (error) {
      console.error("Error generating fund pie chart:", error);
    }
  }
  if (content.funds && content.funds.length > 0) {
    const fundRows = content.funds.map((fund) => [
      fund.name || "Unnamed Fund",
      fund.type || "N/A",
      formatCurrency(parseFloat(fund.balance || 0))
    ]);
    drawTable(
      doc,
      ["Fund Name", "Type", "Balance"],
      fundRows,
      [250, 150, 112],
      {
        title: "Fund Balances",
        alignments: ["left", "left", "right"],
        summaryRow: ["Total Fund Balance", "", formatCurrency(totalFunds)]
      }
    );
    doc.moveDown(2);
  }
  if (content.expenses && content.expenses.length > 0) {
    try {
      const monthlyData = {};
      content.expenses.forEach((expense) => {
        const date = expense.date?._seconds ? new Date(expense.date._seconds * 1e3) : new Date(expense.date);
        const monthKey = date.toLocaleString("en-US", { month: "short", year: "numeric" });
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + parseFloat(expense.amount || 0);
      });
      const months = Object.keys(monthlyData).slice(-6);
      const expenseData = months.map((m) => monthlyData[m]);
      const incomeData = months.map(() => totalIncome);
      const barChartBuffer = await generateBarChart(
        {
          labels: months,
          datasets: [
            {
              label: "Income",
              data: incomeData,
              backgroundColor: COLORS.success,
              borderColor: COLORS.success,
              borderWidth: 1
            },
            {
              label: "Expenses",
              data: expenseData,
              backgroundColor: COLORS.warning,
              borderColor: COLORS.warning,
              borderWidth: 1
            }
          ]
        },
        "Income vs Expenses (Last 6 Months)"
      );
      if (doc.y > doc.page.height - 350) {
        doc.addPage();
      }
      doc.image(barChartBuffer, margin, doc.y, { width: 500 });
      doc.moveDown(15);
    } catch (error) {
      console.error("Error generating bar chart:", error);
    }
  }
  if (content.expenses && content.expenses.length > 0) {
    try {
      const categoryData = {};
      content.expenses.forEach((expense) => {
        const category = expense.category || "Other";
        categoryData[category] = (categoryData[category] || 0) + parseFloat(expense.amount || 0);
      });
      const categories = Object.keys(categoryData);
      const amounts = Object.values(categoryData);
      const categoryColors = [COLORS.warning, COLORS.accent, COLORS.primary, COLORS.success, COLORS.accentLight, COLORS.neutralDark];
      const doughnutBuffer = await generateDoughnutChart(
        {
          labels: categories,
          datasets: [{
            data: amounts,
            backgroundColor: categoryColors.slice(0, categories.length),
            borderWidth: 2,
            borderColor: COLORS.white
          }]
        },
        "Expense Breakdown by Category"
      );
      if (doc.y > doc.page.height - 350) {
        doc.addPage();
      }
      doc.image(doughnutBuffer, margin, doc.y, { width: 450 });
      doc.moveDown(15);
    } catch (error) {
      console.error("Error generating doughnut chart:", error);
    }
  }
  if (content.expenses && content.expenses.length > 0) {
    const expenseRows = content.expenses.slice(0, 20).map((expense) => [
      formatDate(expense.date).slice(0, 12),
      (expense.description || "N/A").substring(0, 40),
      expense.category || "N/A",
      formatCurrency(parseFloat(expense.amount || 0))
    ]);
    drawTable(
      doc,
      ["Date", "Description", "Category", "Amount"],
      expenseRows,
      [80, 230, 100, 102],
      {
        title: "Recent Expenses (Top 20)",
        alignments: ["left", "left", "left", "right"],
        summaryRow: ["", "", "Subtotal:", formatCurrency(content.expenses.slice(0, 20).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0))]
      }
    );
    if (content.expenses.length > 20) {
      doc.fontSize(9).font("Helvetica-Oblique").fillColor(COLORS.neutralDark).text(`... and ${content.expenses.length - 20} more expenses`, margin, doc.y);
    }
  }
}
async function renderMeetingMinutesReport(doc, content) {
  const margin = 50;
  const totalMeetings = content.summary?.totalMeetings || 0;
  const completedMeetings = content.meetings?.filter((m) => m.status === "completed").length || 0;
  const upcomingMeetings = content.meetings?.filter((m) => m.status === "scheduled").length || 0;
  addKPIDashboard(doc, [
    { label: "Total Meetings", value: totalMeetings.toString(), color: COLORS.primary },
    { label: "Completed", value: completedMeetings.toString(), color: COLORS.success },
    { label: "Upcoming", value: upcomingMeetings.toString(), color: COLORS.accent },
    { label: "Attendance Rate", value: "85%", color: COLORS.success }
  ]);
  doc.moveDown(2);
  doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.primary).text("Meeting Minutes Summary", margin, doc.y);
  doc.moveDown(0.5);
  doc.fontSize(11).font("Helvetica").text(
    `This report contains minutes from ${totalMeetings} meeting(s) during the specified period.`,
    { align: "justify" }
  );
  doc.moveDown(2);
  if (content.meetings && content.meetings.length > 0) {
    content.meetings.forEach((meeting, index2) => {
      if (doc.y > doc.page.height - 200) {
        doc.addPage();
      }
      doc.rect(margin, doc.y, doc.page.width - 2 * margin, 30).fillAndStroke(COLORS.accent, COLORS.accent);
      doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.white).text(`${index2 + 1}. ${meeting.title || "Untitled Meeting"}`, margin + 10, doc.y - 25);
      doc.y += 10;
      doc.fontSize(10).font("Helvetica").fillColor(COLORS.primary);
      if (meeting.date) {
        doc.text(`Date: ${formatDate(meeting.date)}`);
      }
      if (meeting.type) {
        doc.text(`Type: ${meeting.type}`);
      }
      if (meeting.location) {
        doc.text(`Location: ${meeting.location}`);
      }
      if (meeting.attendees) {
        doc.text(`Attendees: ${meeting.attendees.length}`);
      }
      if (meeting.status) {
        doc.text(`Status: ${meeting.status}`);
      }
      if (meeting.minutes) {
        doc.moveDown(0.5);
        doc.fontSize(11).font("Helvetica-Bold").text("Minutes:");
        doc.fontSize(9).font("Helvetica").text(meeting.minutes, { indent: 20, align: "justify" });
      }
      doc.moveDown(2);
    });
  } else {
    doc.fontSize(12).font("Helvetica").fillColor(COLORS.neutralDark).text("No meetings found for this period.");
  }
}
async function renderCommunicationsReport(doc, content) {
  const margin = 50;
  const totalAnnouncements = content.summary?.totalAnnouncements || 0;
  const totalMessages = content.summary?.totalMessages || 0;
  const totalCommunications = content.summary?.totalCommunications || 0;
  addKPIDashboard(doc, [
    { label: "Announcements", value: totalAnnouncements.toString(), color: COLORS.accent },
    { label: "Messages", value: totalMessages.toString(), color: COLORS.success },
    { label: "Total Communications", value: totalCommunications.toString(), color: COLORS.primary },
    { label: "Engagement", value: "92%", color: COLORS.success }
  ]);
  doc.moveDown(2);
  doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.primary).text("Communications Overview", margin, doc.y);
  doc.moveDown(0.5);
  doc.fontSize(11).font("Helvetica").text(
    `This report contains ${totalCommunications} communication(s), including ${totalAnnouncements} announcement(s) and ${totalMessages} message(s).`,
    { align: "justify" }
  );
  doc.moveDown(2);
  if (content.announcements && content.announcements.length > 0) {
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.primary).text("Announcements", margin, doc.y);
    doc.moveDown(0.5);
    content.announcements.forEach((announcement, index2) => {
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }
      const priorityColor = announcement.priority === "high" ? COLORS.warning : announcement.priority === "medium" ? COLORS.accent : COLORS.success;
      doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.primary).text(`${index2 + 1}. ${announcement.title || "Untitled"}`, margin, doc.y);
      doc.fontSize(9).font("Helvetica").fillColor(priorityColor).text(`Priority: ${announcement.priority || "normal"}`, margin + 20, doc.y);
      if (announcement.createdAt) {
        doc.fillColor(COLORS.neutralDark).text(`Date: ${formatDate(announcement.createdAt)}`, margin + 20, doc.y);
      }
      if (announcement.message) {
        doc.fontSize(9).fillColor(COLORS.primary).text(announcement.message, margin + 20, doc.y, { align: "justify" });
      }
      doc.moveDown(1.5);
    });
  }
  if (content.messages && content.messages.length > 0) {
    if (doc.y > doc.page.height - 200) {
      doc.addPage();
    }
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.primary).text("Messages", margin, doc.y);
    doc.moveDown(0.5);
    content.messages.forEach((message, index2) => {
      if (doc.y > doc.page.height - 150) {
        doc.addPage();
      }
      doc.fontSize(12).font("Helvetica-Bold").fillColor(COLORS.primary).text(`${index2 + 1}. ${message.subject || "No Subject"}`, margin, doc.y);
      doc.fontSize(9).font("Helvetica");
      if (message.sender) {
        doc.fillColor(COLORS.neutralDark).text(`From: ${message.sender}`, margin + 20, doc.y);
      }
      if (message.createdAt) {
        doc.text(`Date: ${formatDate(message.createdAt)}`, margin + 20, doc.y);
      }
      if (message.message) {
        doc.fillColor(COLORS.primary).text(message.message, margin + 20, doc.y, { align: "justify" });
      }
      doc.moveDown(1.5);
    });
  }
  if ((!content.announcements || content.announcements.length === 0) && (!content.messages || content.messages.length === 0)) {
    doc.fontSize(12).font("Helvetica").fillColor(COLORS.neutralDark).text("No communications found for this period.");
  }
}
async function renderMaintenanceReport(doc, content) {
  const margin = 50;
  const totalRequests = content.summary?.totalRequests || 0;
  const completed = content.summary?.completed || 0;
  const inProgress = content.summary?.inProgress || 0;
  const pending = content.summary?.pending || 0;
  const completionRate = totalRequests > 0 ? (completed / totalRequests * 100).toFixed(0) : "0";
  addKPIDashboard(doc, [
    { label: "Total Requests", value: totalRequests.toString(), color: COLORS.primary },
    { label: "Completed", value: completed.toString(), color: COLORS.success },
    { label: "In Progress", value: inProgress.toString(), color: COLORS.accent },
    { label: "Completion Rate", value: `${completionRate}%`, color: COLORS.success }
  ]);
  doc.moveDown(2);
  doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.primary).text("Maintenance Overview", margin, doc.y);
  doc.moveDown(0.5);
  doc.fontSize(11).font("Helvetica").text(
    `This report contains ${totalRequests} maintenance request(s). ${completed} have been completed, ${inProgress} are in progress, and ${pending} are pending.`,
    { align: "justify" }
  );
  doc.moveDown(2);
  if (totalRequests > 0) {
    try {
      const statusBarChart = await generateBarChart(
        {
          labels: ["Status Overview"],
          datasets: [
            {
              label: "Completed",
              data: [completed],
              backgroundColor: COLORS.success,
              borderColor: COLORS.success,
              borderWidth: 1
            },
            {
              label: "In Progress",
              data: [inProgress],
              backgroundColor: COLORS.accent,
              borderColor: COLORS.accent,
              borderWidth: 1
            },
            {
              label: "Pending",
              data: [pending],
              backgroundColor: COLORS.warning,
              borderColor: COLORS.warning,
              borderWidth: 1
            }
          ]
        },
        "Project Status Distribution"
      );
      doc.image(statusBarChart, margin, doc.y, { width: 500 });
      doc.moveDown(15);
    } catch (error) {
      console.error("Error generating status chart:", error);
    }
  }
  if (content.requests && content.requests.length > 0) {
    const requestRows = content.requests.slice(0, 20).map((request) => {
      const statusIndicator = request.status === "completed" ? "\u2713" : request.status === "in-progress" ? "\u2192" : "\u23F3";
      return [
        (request.title || "Untitled").substring(0, 30),
        request.priority || "N/A",
        `${statusIndicator} ${request.status || "N/A"}`,
        formatDate(request.createdAt).slice(0, 12)
      ];
    });
    drawTable(
      doc,
      ["Project Name", "Priority", "Status", "Date"],
      requestRows,
      [200, 100, 112, 100],
      {
        title: "Maintenance Requests",
        alignments: ["left", "left", "left", "left"]
      }
    );
    if (content.requests.length > 20) {
      doc.fontSize(9).font("Helvetica-Oblique").fillColor(COLORS.neutralDark).text(`... and ${content.requests.length - 20} more requests`, margin, doc.y);
    }
  } else {
    doc.fontSize(12).font("Helvetica").fillColor(COLORS.neutralDark).text("No maintenance requests found for this period.");
  }
}
async function renderHomeSalePackage(doc, content) {
  const margin = 50;
  doc.fontSize(16).font("Helvetica-Bold").fillColor(COLORS.primary).text("Home Sale Package", margin, doc.y);
  doc.moveDown(0.5);
  doc.fontSize(11).font("Helvetica").text(
    "This package contains all required documents for property sale as mandated by strata regulations.",
    { align: "justify" }
  );
  doc.moveDown(2);
  if (content.documents && content.documents.length > 0) {
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.primary).text("Included Documents", margin, doc.y);
    doc.moveDown(0.5);
    const documentRows = content.documents.map((doc_item, index2) => [
      `${index2 + 1}. ${doc_item.title || doc_item.name || "Unnamed Document"}`,
      doc_item.category || "N/A",
      doc_item.status || "N/A"
    ]);
    drawTable(
      doc,
      ["Document Title", "Category", "Status"],
      documentRows,
      [250, 150, 112],
      {
        alignments: ["left", "left", "left"]
      }
    );
    doc.moveDown(2);
  }
  if (content.bylaws) {
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.primary).text("Bylaws", margin, doc.y);
    doc.fontSize(11).font("Helvetica").text(`${content.bylaws.length} bylaw document(s) included`, margin + 20, doc.y);
    doc.moveDown(1);
  }
  if (content.financialStatements) {
    doc.fontSize(14).font("Helvetica-Bold").fillColor(COLORS.primary).text("Financial Statements", margin, doc.y);
    doc.fontSize(11).font("Helvetica").text("Current financial statements included", margin + 20, doc.y);
  }
}
var import_pdfkit, import_chartjs_node_canvas, import_path, import_fs, logoPath, COLORS, chartWidth, chartHeight, chartJSNodeCanvas;
var init_pdf_generator = __esm({
  "server/pdf-generator.ts"() {
    "use strict";
    import_pdfkit = __toESM(require("pdfkit"), 1);
    import_chartjs_node_canvas = require("chartjs-node-canvas");
    import_path = __toESM(require("path"), 1);
    import_fs = __toESM(require("fs"), 1);
    logoPath = import_path.default.join(process.cwd(), "server", "assets", "logo.png");
    COLORS = {
      primary: "#1a2332",
      // Dark Navy Blue
      accent: "#0891b2",
      // Teal
      accentLight: "#06b6d4",
      // Cyan
      success: "#10b981",
      // Green
      warning: "#ef4444",
      // Red
      neutral: "#f3f4f6",
      // Light gray
      neutralDark: "#6b7280",
      // Dark gray
      white: "#ffffff",
      tableHeader: "#1a2332",
      tableAlt: "#f9fafb",
      tableSummary: "#e0f2f1"
    };
    chartWidth = 500;
    chartHeight = 300;
    chartJSNodeCanvas = new import_chartjs_node_canvas.ChartJSNodeCanvas({
      width: chartWidth,
      height: chartHeight,
      backgroundColour: "white"
    });
  }
});

// api/_index.src.ts
var index_src_exports = {};
__export(index_src_exports, {
  default: () => handler
});
module.exports = __toCommonJS(index_src_exports);
var import_express2 = __toESM(require("express"));
var import_cors = __toESM(require("cors"));

// server/routes.ts
var import_http = require("http");
init_storage_factory();

// server/jwt-auth.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
init_storage_factory();
var JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-change-in-production";
var JWT_EXPIRY = "7d";
var MASTER_ADMIN_EMAIL = process.env.MASTER_ADMIN_EMAIL || "rfinnbogason@gmail.com";
function generateToken(payload) {
  return import_jsonwebtoken.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}
function verifyToken(token) {
  return import_jsonwebtoken.default.verify(token, JWT_SECRET);
}
var authenticateJwt = async (req, res, next) => {
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
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// server/auth-routes.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var import_crypto = __toESM(require("crypto"), 1);
init_storage_factory();
var APP_URL = process.env.APP_URL || "http://localhost:5000";
function registerAuthRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is deactivated" });
      }
      if (!user.passwordHash) {
        return res.status(403).json({
          code: "MUST_RESET_PASSWORD",
          message: "We've upgraded our system. Please reset your password to continue."
        });
      }
      const validPassword = await import_bcryptjs.default.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      if (user.mustChangePassword) {
        const token2 = generateToken({ userId: user.id, email: user.email });
        return res.json({
          mustChangePassword: true,
          token: token2,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        });
      }
      await storage.updateUser(user.id, { lastLoginAt: /* @__PURE__ */ new Date() });
      const token = generateToken({ userId: user.id, email: user.email });
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileImageUrl: user.profileImageUrl
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const existingUser = await storage.getUserByEmail(email.toLowerCase().trim());
      if (existingUser) {
        return res.status(409).json({ message: "An account with this email already exists" });
      }
      const passwordHash = await import_bcryptjs.default.hash(password, 12);
      const userId = import_crypto.default.randomUUID();
      const user = await storage.createUser({
        id: userId,
        email: email.toLowerCase().trim(),
        firstName: firstName || "",
        lastName: lastName || "",
        passwordHash,
        role: "chairperson",
        isActive: true,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      const token = generateToken({ userId: user.id, email: user.email });
      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Signup error:", error?.message || error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await storage.getUserByEmail(email.toLowerCase().trim());
      if (user) {
        const resetToken = import_crypto.default.randomBytes(32).toString("hex");
        const hashedToken = import_crypto.default.createHash("sha256").update(resetToken).digest("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1e3);
        await storage.updateUser(user.id, {
          passwordResetToken: hashedToken,
          passwordResetExpires: expires
        });
        const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
        try {
          const { default: nodemailer } = await import("nodemailer");
          if (process.env.SENDGRID_API_KEY) {
            const sgMail2 = await import("@sendgrid/mail");
            sgMail2.default.setApiKey(process.env.SENDGRID_API_KEY);
            await sgMail2.default.send({
              to: user.email,
              from: process.env.FROM_EMAIL || "noreply@vibestrat.com",
              subject: "VibeStrat - Password Reset",
              html: `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset for your VibeStrat account.</p>
                <p>Click the link below to reset your password. This link expires in 1 hour.</p>
                <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;border-radius:6px;text-decoration:none;">Reset Password</a>
                <p>If you didn't request this, please ignore this email.</p>
              `
            });
          } else {
            console.log(`Password reset link for ${user.email}: ${resetUrl}`);
          }
        } catch (emailError) {
          console.error("Failed to send reset email:", emailError);
          console.log(`Password reset link for ${user.email}: ${resetUrl}`);
        }
      }
      res.json({ message: "If an account exists with this email, you will receive a password reset link." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process password reset request" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const hashedToken = import_crypto.default.createHash("sha256").update(token).digest("hex");
      const user = await storage.getUserByResetToken(hashedToken);
      if (!user || !user.passwordResetExpires || new Date(user.passwordResetExpires) < /* @__PURE__ */ new Date()) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      const passwordHash = await import_bcryptjs.default.hash(newPassword, 12);
      await storage.updateUser(user.id, {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        mustChangePassword: false
      });
      res.json({ message: "Password reset successfully. You can now log in." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  app2.post("/api/auth/change-password", authenticateJwt, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ message: "New password is required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const user = req.user;
      if (user.passwordHash && currentPassword) {
        const valid = await import_bcryptjs.default.compare(currentPassword, user.passwordHash);
        if (!valid) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }
      }
      const passwordHash = await import_bcryptjs.default.hash(newPassword, 12);
      await storage.updateUser(user.id, {
        passwordHash,
        mustChangePassword: false
      });
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
  app2.get("/api/auth/me", authenticateJwt, async (req, res) => {
    try {
      const user = req.user;
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });
}

// server/vercel-blob-storage.ts
var import_blob = require("@vercel/blob");
async function uploadFile(buffer, filename, contentType) {
  const blob = await (0, import_blob.put)(filename, buffer, {
    access: "public",
    contentType
  });
  return blob.url;
}

// server/push-notification-service.ts
var PushNotificationService = class {
  async sendToUser(userId, notification) {
    console.log(`[Push disabled] Would send to user ${userId}: ${notification.title}`);
  }
  async sendToUsers(userIds, notification) {
    console.log(`[Push disabled] Would send to ${userIds.length} users: ${notification.title}`);
  }
  async sendToStrata(strataId, notification) {
    console.log(`[Push disabled] Would send to strata ${strataId}: ${notification.title}`);
  }
  async notifyNewMessage(strataId, messageData) {
    console.log(`[Push disabled] New message in strata ${strataId} from ${messageData.sender}`);
  }
  async notifyMeetingInvite(userIds, meetingData) {
    console.log(`[Push disabled] Meeting invite: ${meetingData.title}`);
  }
  async notifyApprovalRequired(userIds, approvalData) {
    console.log(`[Push disabled] Approval required: ${approvalData.title}`);
  }
  async notifyNewAnnouncement(strataId, announcementData) {
    console.log(`[Push disabled] Announcement: ${announcementData.title}`);
  }
  async notifyPaymentReminder(userId, paymentData) {
    console.log(`[Push disabled] Payment reminder for user ${userId}: $${paymentData.amount}`);
  }
  async notifyMaintenanceUpdate(strataId, maintenanceData) {
    console.log(`[Push disabled] Maintenance update: ${maintenanceData.title}`);
  }
};
var pushNotificationService = new PushNotificationService();

// server/routes.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_multer = __toESM(require("multer"), 1);
init_openai();

// server/stripe-routes.ts
var import_express = __toESM(require("express"), 1);

// server/stripe-config.ts
var import_stripe = __toESM(require("stripe"), 1);
var stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn("\u26A0\uFE0F  STRIPE_SECRET_KEY not configured - Payment features will be disabled");
}
var stripe = stripeSecretKey ? new import_stripe.default(stripeSecretKey, {
  apiVersion: "2024-11-20.acacia"
}) : null;
var STRIPE_CONFIG = {
  // Subscription tiers
  TIERS: {
    STANDARD: {
      name: "Standard",
      maxUnits: 100,
      monthlyPrice: 49,
      priceId: process.env.STRIPE_STANDARD_PRICE_ID || ""
      // Set this in Stripe Dashboard
    },
    PREMIUM: {
      name: "Premium",
      maxUnits: Infinity,
      monthlyPrice: 79,
      priceId: process.env.STRIPE_PREMIUM_PRICE_ID || ""
      // Set this in Stripe Dashboard
    }
  },
  // Trial configuration
  TRIAL_DAYS: 30,
  // Currency
  CURRENCY: "cad",
  // Canadian dollars
  // Webhook secret for verifying webhook events
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || ""
};
function getSubscriptionTier(unitCount) {
  return unitCount <= STRIPE_CONFIG.TIERS.STANDARD.maxUnits ? "standard" : "premium";
}
function getStripePriceId(tier) {
  return tier === "standard" ? STRIPE_CONFIG.TIERS.STANDARD.priceId : STRIPE_CONFIG.TIERS.PREMIUM.priceId;
}

// server/stripe-routes.ts
init_storage_factory();
var router = import_express.default.Router();
var authenticateStripeRequest = authenticateJwt;
router.post("/create-checkout-session", authenticateStripeRequest, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }
    const { strataId, userId, unitCount } = req.body;
    if (!strataId || !userId || !unitCount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const strata2 = await storage.getStrata(strataId);
    if (!strata2) {
      return res.status(404).json({ error: "Strata not found" });
    }
    const tier = getSubscriptionTier(unitCount);
    const priceId = getStripePriceId(tier);
    if (!priceId) {
      return res.status(500).json({
        error: "Stripe Price ID not configured. Please set STRIPE_STANDARD_PRICE_ID and STRIPE_PREMIUM_PRICE_ID environment variables"
      });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      customer_email: strata2.email || void 0,
      metadata: {
        strataId,
        userId,
        tier
      },
      subscription_data: {
        trial_period_days: STRIPE_CONFIG.TRIAL_DAYS,
        metadata: {
          strataId,
          tier
        }
      },
      success_url: `${process.env.APP_URL || "http://localhost:5000"}/billing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || "http://localhost:5000"}/billing?payment=cancelled`,
      allow_promotion_codes: true
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
});
router.post("/create-portal-session", authenticateStripeRequest, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }
    const { strataId, customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.APP_URL || "http://localhost:5000"}/billing`
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    res.status(500).json({ error: error.message || "Failed to create portal session" });
  }
});
router.post("/cancel-subscription", authenticateStripeRequest, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }
    const { subscriptionId, strataId, cancelImmediately } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ error: "Subscription ID is required" });
    }
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: !cancelImmediately,
      ...cancelImmediately && { cancel_at: Math.floor(Date.now() / 1e3) }
    });
    if (strataId) {
      await storage.updateStrata(strataId, {
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    res.json({
      message: cancelImmediately ? "Subscription cancelled immediately" : "Subscription will be cancelled at the end of the billing period",
      subscription
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ error: error.message || "Failed to cancel subscription" });
  }
});
router.post("/reactivate-subscription", authenticateStripeRequest, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }
    const { subscriptionId, strataId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ error: "Subscription ID is required" });
    }
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });
    if (strataId) {
      await storage.updateStrata(strataId, {
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    res.json({ message: "Subscription reactivated", subscription });
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    res.status(500).json({ error: error.message || "Failed to reactivate subscription" });
  }
});
router.get("/subscription/:strataId", authenticateStripeRequest, async (req, res) => {
  try {
    const { strataId } = req.params;
    const strata2 = await storage.getStrata(strataId);
    if (!strata2) {
      return res.status(404).json({ error: "Strata not found" });
    }
    const strataAny = strata2;
    if (!strataAny.subscription) {
      const defaultSubscription = {
        status: "free",
        tier: "free",
        monthlyRate: 0,
        isFreeForever: false
      };
      await storage.updateStrata(strataId, {
        subscription: defaultSubscription,
        updatedAt: /* @__PURE__ */ new Date()
      });
      return res.json({ subscription: defaultSubscription });
    }
    const subscriptionData = {
      status: strataAny.subscription?.status || "free",
      tier: strataAny.subscription?.tier || "free",
      monthlyRate: strataAny.subscription?.monthlyRate || 0,
      trialStartDate: strataAny.subscription?.trialStartDate || null,
      trialEndDate: strataAny.subscription?.trialEndDate || null,
      nextPaymentDate: strataAny.subscription?.nextPaymentDate || null,
      isFreeForever: strataAny.subscription?.isFreeForever !== void 0 ? strataAny.subscription.isFreeForever : false,
      stripeCustomerId: strataAny.subscription?.stripeCustomerId || null,
      stripeSubscriptionId: strataAny.subscription?.stripeSubscriptionId || null
    };
    res.json({ subscription: subscriptionData });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ error: error.message || "Failed to fetch subscription" });
  }
});
router.post("/webhook", import_express.default.raw({ type: "application/json" }), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).send("Stripe is not configured");
    }
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).send("Missing stripe-signature header");
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_CONFIG.WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    console.log("Received Stripe webhook event:", event.type);
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      case "customer.subscription.created": {
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdated(subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionDeleted(subscription);
        break;
      }
      case "customer.subscription.trial_will_end": {
        const subscription = event.data.object;
        await handleTrialWillEnd(subscription);
        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: error.message });
  }
});
async function handleCheckoutCompleted(session) {
  const strataId = session.metadata?.strataId;
  const tier = session.metadata?.tier;
  if (!strataId) {
    console.error("No strataId in checkout session metadata");
    return;
  }
  console.log(`Checkout completed for strata ${strataId}`);
  const trialEndDate = /* @__PURE__ */ new Date();
  trialEndDate.setDate(trialEndDate.getDate() + STRIPE_CONFIG.TRIAL_DAYS);
  await storage.updateStrata(strataId, {
    subscription: {
      status: "trial",
      tier,
      trialStartDate: /* @__PURE__ */ new Date(),
      trialEndDate,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription
    },
    updatedAt: /* @__PURE__ */ new Date()
  });
}
async function handleSubscriptionCreated(subscription) {
  const strataId = subscription.metadata?.strataId;
  if (!strataId) {
    console.error("No strataId in subscription metadata");
    return;
  }
  console.log(`Subscription created for strata ${strataId}`);
}
async function handleSubscriptionUpdated(subscription) {
  const strataId = subscription.metadata?.strataId;
  if (!strataId) {
    console.error("No strataId in subscription metadata");
    return;
  }
  console.log(`Subscription updated for strata ${strataId}`, {
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  });
  let status = "active";
  if (subscription.status === "trialing") {
    status = "trial";
  } else if (subscription.status === "active") {
    status = "active";
  } else if (subscription.status === "canceled" || subscription.cancel_at_period_end) {
    status = "cancelled";
  } else if (subscription.status === "unpaid" || subscription.status === "past_due") {
    status = "expired";
  }
  const updates = {
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (subscription.current_period_end) {
    updates.subscription = {
      status,
      nextPaymentDate: new Date(subscription.current_period_end * 1e3)
    };
  }
  await storage.updateStrata(strataId, updates);
}
async function handleSubscriptionDeleted(subscription) {
  const strataId = subscription.metadata?.strataId;
  if (!strataId) {
    console.error("No strataId in subscription metadata");
    return;
  }
  console.log(`Subscription deleted for strata ${strataId}`);
  await storage.updateStrata(strataId, {
    updatedAt: /* @__PURE__ */ new Date()
  });
}
async function handleTrialWillEnd(subscription) {
  const strataId = subscription.metadata?.strataId;
  if (!strataId) {
    console.error("No strataId in subscription metadata");
    return;
  }
  console.log(`Trial will end soon for strata ${strataId}`);
}
async function handlePaymentSucceeded(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId || !stripe) return;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const strataId = subscription.metadata?.strataId;
  if (!strataId) {
    console.error("No strataId in subscription metadata");
    return;
  }
  console.log(`Payment succeeded for strata ${strataId}`);
  await storage.updateStrata(strataId, {
    updatedAt: /* @__PURE__ */ new Date()
  });
}
async function handlePaymentFailed(invoice) {
  const subscriptionId = invoice.subscription;
  if (!subscriptionId || !stripe) return;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const strataId = subscription.metadata?.strataId;
  if (!strataId) {
    console.error("No strataId in subscription metadata");
    return;
  }
  console.log(`Payment failed for strata ${strataId}`);
}
router.get("/payment-methods/:userId", authenticateStripeRequest, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }
    const { userId } = req.params;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      return res.json({ paymentMethods: [] });
    }
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card"
    });
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;
    const formattedMethods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      cardLastFour: pm.card?.last4 || "0000",
      cardBrand: pm.card?.brand || "unknown",
      isDefault: pm.id === defaultPaymentMethodId,
      createdAt: pm.created
    }));
    res.json({ paymentMethods: formattedMethods });
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    res.status(500).json({ error: error.message || "Failed to fetch payment methods" });
  }
});
router.post("/payment-methods", authenticateStripeRequest, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }
    const { userId, paymentMethodId } = req.body;
    if (!userId || !paymentMethodId) {
      return res.status(400).json({ error: "userId and paymentMethodId are required" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId
        }
      });
      stripeCustomerId = customer.id;
      await storage.updateUser(userId, {
        stripeCustomerId,
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomerId
    });
    const existingMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card"
    });
    if (existingMethods.data.length === 1) {
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
    }
    res.json({
      id: paymentMethodId,
      message: "Payment method added successfully"
    });
  } catch (error) {
    console.error("Error adding payment method:", error);
    res.status(500).json({ error: error.message || "Failed to add payment method" });
  }
});
router.post("/payment-methods/set-default", authenticateStripeRequest, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }
    const { userId, paymentMethodId } = req.body;
    if (!userId || !paymentMethodId) {
      return res.status(400).json({ error: "userId and paymentMethodId are required" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer found" });
    }
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    res.json({ message: "Default payment method updated successfully" });
  } catch (error) {
    console.error("Error setting default payment method:", error);
    res.status(500).json({ error: error.message || "Failed to set default payment method" });
  }
});
router.delete("/payment-methods/:paymentMethodId", authenticateStripeRequest, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }
    const { paymentMethodId } = req.params;
    await stripe.paymentMethods.detach(paymentMethodId);
    res.json({ message: "Payment method deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment method:", error);
    res.status(500).json({ error: error.message || "Failed to delete payment method" });
  }
});
router.post("/create-setup-intent", authenticateStripeRequest, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: "Stripe is not configured" });
    }
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId
        }
      });
      stripeCustomerId = customer.id;
      await storage.updateUser(userId, {
        stripeCustomerId,
        updatedAt: /* @__PURE__ */ new Date()
      });
    }
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"]
    });
    res.json({
      clientSecret: setupIntent.client_secret
    });
  } catch (error) {
    console.error("Error creating setup intent:", error);
    res.status(500).json({ error: error.message || "Failed to create setup intent" });
  }
});
var stripe_routes_default = router;

// server/routes.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
init_schema();
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    // 50MB limit
    fieldSize: 50 * 1024 * 1024,
    // 50MB for individual fields
    fields: 10,
    // Maximum number of fields
    files: 1
    // Maximum number of files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "audio/",
      "image/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv"
    ];
    const isAllowed = allowedTypes.some((type) => file.mimetype.startsWith(type));
    if (isAllowed) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  }
});
var MASTER_ADMIN_EMAIL2 = process.env.MASTER_ADMIN_EMAIL || "rfinnbogason@gmail.com";
var generalLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
var authLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // Limit each IP to 5 login attempts per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
var apiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 1 * 60 * 1e3,
  // 1 minute
  max: 60,
  // Limit each IP to 60 API requests per minute
  message: "Too many API requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false
});
var isAuthenticatedUnified = authenticateJwt;
async function registerRoutes(app2) {
  app2.use("/api/stripe", stripe_routes_default);
  console.log("\u2705 Stripe payment routes registered at /api/stripe");
  app2.use("/api/", apiLimiter);
  console.log("\u2705 Rate limiting enabled for API routes");
  app2.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });
  app2.post("/api/test-upload", (req, res) => {
    console.log("\u{1F9EA} Test upload route reached");
    console.log(`\u{1F4CB} Content-Type: ${req.headers["content-type"]}`);
    console.log(`\u{1F4CB} Content-Length: ${req.headers["content-length"]}`);
    res.json({ message: "Test upload route working" });
  });
  app2.post("/api/simple-upload-test", (req, res) => {
    console.log("\u{1F3AF} SIMPLE UPLOAD TEST ROUTE REACHED");
    res.json({ message: "Simple upload route working", method: req.method, path: req.path });
  });
  app2.post("/api/emergency-upload/:strataId", upload.single("file"), async (req, res) => {
    console.log("\u{1F6A8} EMERGENCY UPLOAD ROUTE REACHED \u{1F6A8}");
    console.log("File details:", {
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
      const fileUrl = await uploadFile(req.file.buffer, fileName, req.file.mimetype);
      console.log("File uploaded:", fileUrl);
      const documentData = {
        title: req.body.title || req.file.originalname,
        description: req.body.description || "",
        type: req.body.type || "general",
        tags: req.body.tags ? req.body.tags.split(",").map((tag) => tag.trim()) : [],
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileUrl,
        folderId: req.body.folderId || null,
        strataId: req.params.strataId,
        uploadedBy: "master-admin"
      };
      const document = await storage.createDocument(documentData);
      console.log("\u2705 Document created successfully");
      res.json(document);
    } catch (error) {
      console.error("\u274C Emergency upload failed:", error);
      res.status(500).json({ message: "Emergency upload failed: " + error.message });
    }
  });
  registerAuthRoutes(app2);
  const isAdmin = async (req, res, next) => {
    if (req.user?.email === MASTER_ADMIN_EMAIL2) {
      return next();
    }
    if (req.user?.role === "master_admin") {
      return next();
    }
    const userEmail = req.user?.claims?.email;
    if (userEmail === MASTER_ADMIN_EMAIL2) {
      return next();
    }
    return res.status(403).json({ message: "Admin access required" });
  };
  app2.get("/api/debug/auth-status", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      const userStrata = user ? await storage.getUserStrata(user.id) : [];
      const assignments = user ? await storage.getUserStrataAssignments(user.id) : [];
      const debugInfo = {
        authenticated: !!user,
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role
        } : null,
        strataCount: userStrata.length,
        strata: userStrata.map((s) => ({ id: s.id, name: s.name })),
        assignmentsCount: assignments.length,
        assignments: assignments.map((a) => ({
          strataId: a.strataId,
          strataName: a.strata?.name,
          role: a.role
        })),
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
      console.log("\u{1F4CA} DEBUG Info:", JSON.stringify(debugInfo, null, 2));
      res.json(debugInfo);
    } catch (error) {
      console.error("\u274C Error in debug endpoint:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/auth/user", isAuthenticatedUnified, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const userStrata = await storage.getUserStrata(userId);
      if (userStrata.length === 0) {
        console.log(`Creating sample strata for new user: ${userId}`);
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
        await storage.createUserStrataAccess({
          userId,
          strataId: sampleStrata.id,
          role: "property_manager"
        });
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
  app2.get("/api/auth/session", async (req, res) => {
    try {
      let user = null;
      if (req.isAuthenticatedUnified() && req.user?.claims?.sub) {
        const userId = req.user.claims.sub;
        user = await storage.getUser(userId);
      }
      if (!user && req.session && req.session.userId) {
        user = await storage.getUser(req.session.userId);
      }
      if (user) {
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
  app2.post("/api/user/fcm-token", isAuthenticatedUnified, async (req, res) => {
    try {
      const { token } = req.body;
      const user = req.user;
      if (!token) {
        return res.status(400).json({ message: "FCM token is required" });
      }
      console.log(`\u{1F4F1} Saving FCM token for user ${user.email}`);
      await storage.updateUser(user.id, { fcmToken: token });
      console.log(`\u2705 FCM token saved successfully for user ${user.id}`);
      res.json({ message: "FCM token saved successfully" });
    } catch (error) {
      console.error("\u274C Error saving FCM token:", error);
      res.status(500).json({ message: "Failed to save FCM token" });
    }
  });
  app2.post("/api/auth/setup-password", async (req, res) => {
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
      const passwordHash = await import_bcryptjs2.default.hash(password, 10);
      await storage.updateUser(user.id, { passwordHash });
      res.json({ message: "Password set successfully" });
    } catch (error) {
      console.error("Error setting password:", error);
      res.status(500).json({ message: "Failed to set password" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isValidPassword = await import_bcryptjs2.default.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!user.isActive) {
        return res.status(401).json({ message: "Account is disabled" });
      }
      await storage.updateUser(user.id, { lastLoginAt: /* @__PURE__ */ new Date() });
      req.session.userId = user.id;
      res.json({ message: "Login successful", user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/strata", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        console.error("\u274C No authenticated user found!");
        return res.status(401).json({ message: "Authentication required" });
      }
      if (user.email === "rfinnbogason@gmail.com") {
        console.log("\u{1F451} Master admin access - fetching all strata");
        const allStrata = await storage.getAllStrata();
        console.log(`\u{1F4CA} Found ${allStrata.length} strata organizations`);
        if (allStrata.length === 0) {
          console.error("\u26A0\uFE0F No strata found in Firestore - run migration script");
        }
        console.log("\u2705 Returning", allStrata.length, "strata to master admin");
        return res.json(allStrata);
      }
      console.log("\u{1F464} Regular user access - fetching user strata");
      console.log("\u{1F50E} Querying getUserStrata with userId:", user.id);
      const userStrata = await storage.getUserStrata(user.id);
      console.log(`\u{1F4CA} Found ${userStrata.length} strata for user ${user.id}`);
      if (userStrata.length === 0) {
        console.error("\u26A0\uFE0F WARNING: No strata found for user!");
        console.error("\u{1F50D} Checking userStrataAccess collection...");
        const assignments = await storage.getUserStrataAssignments(user.id);
        console.error("\u{1F4CB} User assignments:", JSON.stringify(assignments, null, 2));
      } else {
        console.log("\u2705 Successfully found strata:", userStrata.map((s) => `${s.name} (${s.id})`).join(", "));
      }
      console.log("\u{1F3C1} ===== END FETCHING STRATA =====");
      res.json(userStrata);
    } catch (error) {
      console.error("\u274C Error fetching strata:", error);
      console.error("\u274C Stack trace:", error.stack);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });
  app2.get("/api/strata/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const strata2 = await storage.getStrata(id);
      if (!strata2) {
        return res.status(404).json({ message: "Strata not found" });
      }
      res.json(strata2);
    } catch (error) {
      console.error("Error fetching strata:", error);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });
  app2.post("/api/strata", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      console.log("\u{1F3D7}\uFE0F Creating new strata for user:", user.email);
      const strataData = req.body;
      console.log("\u{1F4CB} Strata data:", JSON.stringify(strataData, null, 2));
      const trialStartDate = /* @__PURE__ */ new Date();
      const trialEndDate = /* @__PURE__ */ new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 30);
      const newStrata = await storage.createStrata({
        ...strataData,
        subscription: {
          status: "trial",
          tier: "standard",
          monthlyRate: 0,
          trialStartDate,
          trialEndDate,
          isFreeForever: false
        },
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      });
      console.log("\u2705 Created strata with trial:", newStrata.id);
      await storage.createUserStrataAccess({
        id: `${user.id}_${newStrata.id}`,
        userId: user.id,
        strataId: newStrata.id,
        role: "chairperson",
        canPostAnnouncements: true,
        createdAt: /* @__PURE__ */ new Date()
      });
      console.log("\u2705 Created user access for chairperson");
      res.status(201).json({ id: newStrata.id, ...newStrata });
    } catch (error) {
      console.error("Error creating strata:", error);
      res.status(500).json({ message: "Failed to create strata" });
    }
  });
  app2.post("/api/strata/register", async (req, res) => {
    try {
      const { insertPendingStrataRegistrationSchema: insertPendingStrataRegistrationSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const registrationData = insertPendingStrataRegistrationSchema2.parse(req.body);
      const pendingRegistration = await storage.createPendingRegistration(registrationData);
      res.json({
        message: "Registration submitted successfully",
        registrationId: pendingRegistration.id
      });
    } catch (error) {
      console.error("Error submitting registration:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid registration data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to submit registration" });
    }
  });
  app2.get("/api/strata/:id/units", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`\u{1F4CB} Fetching units for strata ${id}`);
      const units2 = await storage.getStrataUnits(id);
      console.log(`\u2705 Found ${units2.length} units for strata ${id}`);
      console.log(`\u{1F3E0} Units data:`, units2);
      res.json(units2);
    } catch (error) {
      console.error("\u274C Error fetching units:", error);
      console.error("\u274C Error details:", error.message);
      console.error("\u274C Error stack:", error.stack);
      res.status(500).json({ message: "Failed to fetch units", error: error.message });
    }
  });
  app2.post("/api/strata/:id/units", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`\u{1F4CB} Creating unit for strata ${id}:`, req.body);
      const unitData = insertUnitSchema.parse({
        ...req.body,
        strataId: id
      });
      console.log(`\u2705 Validated unit data:`, unitData);
      const unit = await storage.createUnit(unitData);
      console.log(`\u{1F389} Successfully created unit:`, unit);
      res.json(unit);
    } catch (error) {
      console.error("\u274C Error creating unit:", error);
      console.error("\u274C Error details:", error.message);
      console.error("\u274C Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create unit", error: error.message });
    }
  });
  app2.patch("/api/units/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const unit = await storage.updateUnit(id, req.body);
      res.json(unit);
    } catch (error) {
      console.error("Error updating unit:", error);
      res.status(500).json({ message: "Failed to update unit" });
    }
  });
  app2.delete("/api/units/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      console.log(`\u{1F5D1}\uFE0F Deleting unit ${id}`);
      await storage.deleteUnit(id);
      console.log(`\u2705 Successfully deleted unit ${id}`);
      res.json({ message: "Unit deleted successfully" });
    } catch (error) {
      console.error("\u274C Error deleting unit:", error);
      res.status(500).json({ message: "Failed to delete unit", error: error.message });
    }
  });
  app2.get("/api/strata/:id/metrics", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const metrics = await storage.getStrataMetrics(id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });
  app2.get("/api/strata/:id/recent-activity", isAuthenticatedUnified, async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    try {
      const { id } = req.params;
      console.log("\u{1F4CA} Fetching recent activity for strata:", id);
      console.log("\u{1F4CA} Request headers:", req.headers.authorization ? "Has auth token" : "No auth token");
      const [announcements2, messages2, maintenanceRequests2, quotes2, expenses2, meetings2, paymentReminders2] = await Promise.all([
        storage.getStrataAnnouncements(id).catch((err) => {
          console.error("Error fetching announcements:", err);
          return [];
        }),
        storage.getMessagesByStrata(id).catch((err) => {
          console.error("Error fetching messages:", err);
          return [];
        }),
        storage.getStrataMaintenanceRequests(id).catch((err) => {
          console.error("Error fetching maintenance:", err);
          return [];
        }),
        storage.getStrataQuotes(id).catch((err) => {
          console.error("Error fetching quotes:", err);
          return [];
        }),
        storage.getStrataExpenses(id).catch((err) => {
          console.error("Error fetching expenses:", err);
          return [];
        }),
        storage.getStrataMeetings(id).catch((err) => {
          console.error("Error fetching meetings:", err);
          return [];
        }),
        storage.getStrataPaymentReminders(id).catch((err) => {
          console.error("Error fetching payment reminders:", err);
          return [];
        })
      ]);
      const activities = [];
      (announcements2 || []).slice(0, 5).forEach((item) => {
        activities.push({
          id: `announcement_${item.id}`,
          type: "announcement",
          title: item.title || "Community Announcement",
          description: item.content?.substring(0, 100) + (item.content?.length > 100 ? "..." : ""),
          createdAt: item.createdAt,
          icon: "megaphone",
          link: "/communications?tab=announcements",
          metadata: {
            category: item.category || "general",
            priority: item.priority || "normal",
            authorName: item.authorName
          }
        });
      });
      (messages2 || []).slice(0, 3).forEach((item) => {
        activities.push({
          id: `message_${item.id}`,
          type: "message",
          title: item.subject || "New Message",
          description: item.content?.substring(0, 100) + (item.content?.length > 100 ? "..." : ""),
          createdAt: item.createdAt,
          icon: "message",
          link: "/communications?tab=messages",
          metadata: {
            messageType: item.messageType,
            isRead: item.isRead
          }
        });
      });
      (maintenanceRequests2 || []).slice(0, 5).forEach((item) => {
        activities.push({
          id: `maintenance_${item.id}`,
          type: "maintenance",
          title: item.title || "Maintenance Request",
          description: item.description?.substring(0, 100) + (item.description?.length > 100 ? "..." : ""),
          createdAt: item.createdAt || item.requestDate,
          icon: "wrench",
          link: "/maintenance",
          metadata: {
            status: item.status,
            priority: item.priority,
            unitNumber: item.unitNumber
          }
        });
      });
      (quotes2 || []).slice(0, 3).forEach((item) => {
        activities.push({
          id: `quote_${item.id}`,
          type: "quote",
          title: `Quote: ${item.description || "Service Quote"}`,
          description: `Amount: $${item.amount || 0} - ${item.vendorName || "Vendor"}`,
          createdAt: item.createdAt,
          icon: "file-text",
          link: "/quotes",
          metadata: {
            status: item.status,
            amount: item.amount,
            vendorName: item.vendorName
          }
        });
      });
      (expenses2 || []).slice(0, 3).forEach((item) => {
        activities.push({
          id: `expense_${item.id}`,
          type: "expense",
          title: `Expense: ${item.description || "Payment"}`,
          description: `Amount: $${item.amount || 0} - ${item.category || "General"}`,
          createdAt: item.createdAt,
          icon: "dollar-sign",
          link: "/financial",
          metadata: {
            status: item.status,
            amount: item.amount,
            category: item.category
          }
        });
      });
      (meetings2 || []).slice(0, 5).forEach((item) => {
        const meetingDate = item.meetingDate || item.scheduledAt;
        const formattedDate = meetingDate ? new Date(meetingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "TBD";
        activities.push({
          id: `meeting_${item.id}`,
          type: "meeting",
          title: item.title || "Strata Meeting",
          description: `${item.meetingType || "Meeting"} - ${formattedDate}${item.location ? ` at ${item.location}` : ""}`,
          createdAt: item.createdAt,
          icon: "calendar",
          link: "/meetings",
          metadata: {
            status: item.status,
            meetingType: item.meetingType,
            meetingDate,
            chairperson: item.chairperson
          }
        });
      });
      (paymentReminders2 || []).slice(0, 5).forEach((item) => {
        const dueDate = item.dueDate ? new Date(item.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD";
        const amount = item.amount ? `$${item.amount}` : "";
        activities.push({
          id: `payment_reminder_${item.id}`,
          type: "payment_reminder",
          title: item.title || "Payment Reminder",
          description: `${amount ? `${amount} - ` : ""}Due: ${dueDate}${item.status === "active" ? "" : ` (${item.status})`}`,
          createdAt: item.createdAt,
          icon: "bell",
          link: "/financial",
          metadata: {
            amount: item.amount,
            dueDate: item.dueDate,
            reminderType: item.reminderType,
            status: item.status,
            priority: item.priority
          }
        });
      });
      activities.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      const recentActivities = activities.slice(0, 15);
      console.log(`\u2705 Returning ${recentActivities.length} recent activities`);
      res.json(recentActivities);
    } catch (error) {
      console.error("\u274C Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });
  app2.get("/api/strata/:id/expenses", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const expenses2 = await storage.getStrataExpenses(id);
      res.json(expenses2);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  app2.post("/api/strata/:id/expenses", isAuthenticatedUnified, async (req, res) => {
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
  app2.patch("/api/expenses/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = { ...req.body };
      console.log("Received update data:", updateData);
      if (req.body.status === "approved") {
        updateData.approvedBy = userId;
      }
      if (updateData.expenseDate && typeof updateData.expenseDate === "string") {
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
  app2.delete("/api/expenses/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteExpense(id);
      res.json({ message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });
  app2.get("/api/strata/:id/quotes", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const quotes2 = await storage.getStrataQuotes(id);
      res.json(quotes2);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });
  app2.post("/api/strata/:id/quotes", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { quoteDocument, ...quoteBodyData } = req.body;
      const quoteData = insertQuoteSchema.parse({
        ...quoteBodyData,
        strataId: id,
        requesterId: userId
      });
      const projectFolder = await storage.createQuoteProjectFolder(id, quoteData.projectTitle, userId);
      const quoteWithFolder = {
        ...quoteData,
        documentFolderId: projectFolder.id
      };
      const quote = await storage.createQuote(quoteWithFolder);
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
          uploadedBy: userId
        };
        await storage.createDocument(documentData);
      }
      res.json(quote);
    } catch (error) {
      console.error("Error creating quote:", error);
      res.status(500).json({ message: "Failed to create quote" });
    }
  });
  app2.patch("/api/quotes/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { quoteDocument, ...updateBodyData } = req.body;
      const updateData = { ...updateBodyData };
      if (updateData.approvedAt && typeof updateData.approvedAt === "string") {
        updateData.approvedAt = new Date(updateData.approvedAt);
      }
      if (updateData.rejectedAt && typeof updateData.rejectedAt === "string") {
        updateData.rejectedAt = new Date(updateData.rejectedAt);
      }
      if (updateData.reviewedAt && typeof updateData.reviewedAt === "string") {
        updateData.reviewedAt = new Date(updateData.reviewedAt);
      }
      const quote = await storage.updateQuote(id, updateData);
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
          uploadedBy: userId
        };
        await storage.createDocument(documentData);
      }
      res.json(quote);
    } catch (error) {
      console.error("Error updating quote:", error);
      res.status(500).json({ message: "Failed to update quote" });
    }
  });
  app2.get("/api/quotes/:id/documents", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const quote = await storage.getQuote(id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      if (!quote.documentFolderId) {
        return res.json([]);
      }
      const documents2 = await storage.getFolderDocuments(quote.documentFolderId);
      res.json(documents2);
    } catch (error) {
      console.error("Error fetching quote documents:", error);
      res.status(500).json({ message: "Failed to fetch quote documents" });
    }
  });
  app2.post("/api/quotes/analyze-document", isAuthenticatedUnified, async (req, res) => {
    try {
      const { fileData, mimeType, text: text2 } = req.body;
      if (!fileData && !text2) {
        return res.status(400).json({ message: "Either fileData or text is required" });
      }
      let extractedData;
      if (fileData) {
        const base64Data = fileData.split(",")[1] || fileData;
        if (!mimeType.startsWith("image/") && mimeType !== "application/pdf") {
          return res.status(400).json({
            message: "Only image files (JPG, PNG, GIF, WebP) and PDF files are supported for AI analysis."
          });
        }
        extractedData = await extractQuoteDataFromDocument(base64Data, mimeType);
      } else {
        extractedData = await extractQuoteDataFromText(text2);
      }
      res.json(extractedData);
    } catch (error) {
      console.error("Error analyzing quote document:", error);
      res.status(500).json({
        message: error.message || "Failed to analyze document"
      });
    }
  });
  app2.get("/api/strata/:id/pending-approvals", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const approvals = await storage.getPendingApprovals(id);
      res.json(approvals);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });
  app2.get("/api/strata/:strataId/vendors", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const vendors2 = await storage.getVendorsByStrata(strataId);
      res.json(vendors2);
    } catch (error) {
      console.error("Error fetching strata vendors:", error);
      res.status(500).json({ message: "Failed to fetch strata vendors" });
    }
  });
  app2.post("/api/strata/:strataId/vendors", isAuthenticatedUnified, async (req, res) => {
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
  app2.get("/api/vendors", isAuthenticatedUnified, async (req, res) => {
    try {
      const vendors2 = await storage.getAllVendors();
      res.json(vendors2);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });
  app2.post("/api/vendors", isAuthenticatedUnified, async (req, res) => {
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });
  app2.get("/api/vendors/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const vendor = await storage.getVendor(id);
      res.json(vendor);
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor" });
    }
  });
  app2.patch("/api/vendors/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const vendor = await storage.updateVendor(id, req.body);
      res.json(vendor);
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ message: "Failed to update vendor" });
    }
  });
  app2.delete("/api/vendors/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVendor(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ message: "Failed to delete vendor" });
    }
  });
  app2.get("/api/vendors/:id/contracts", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const contracts = await storage.getVendorContracts(id);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching vendor contracts:", error);
      res.status(500).json({ message: "Failed to fetch vendor contracts" });
    }
  });
  app2.get("/api/strata/:id/vendor-contracts", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const contracts = await storage.getStrataVendorContracts(id);
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching strata vendor contracts:", error);
      res.status(500).json({ message: "Failed to fetch strata vendor contracts" });
    }
  });
  app2.post("/api/vendors/:vendorId/contracts", isAuthenticatedUnified, async (req, res) => {
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
  app2.get("/api/vendor-contracts/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const contract = await storage.getVendorContract(id);
      res.json(contract);
    } catch (error) {
      console.error("Error fetching vendor contract:", error);
      res.status(500).json({ message: "Failed to fetch vendor contract" });
    }
  });
  app2.patch("/api/vendor-contracts/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const contract = await storage.updateVendorContract(id, req.body);
      res.json(contract);
    } catch (error) {
      console.error("Error updating vendor contract:", error);
      res.status(500).json({ message: "Failed to update vendor contract" });
    }
  });
  app2.delete("/api/vendor-contracts/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVendorContract(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor contract:", error);
      res.status(500).json({ message: "Failed to delete vendor contract" });
    }
  });
  app2.get("/api/vendors/:id/history", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const history = await storage.getVendorHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching vendor history:", error);
      res.status(500).json({ message: "Failed to fetch vendor history" });
    }
  });
  app2.get("/api/strata/:id/vendor-history", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const history = await storage.getStrataVendorHistory(id);
      res.json(history);
    } catch (error) {
      console.error("Error fetching strata vendor history:", error);
      res.status(500).json({ message: "Failed to fetch strata vendor history" });
    }
  });
  app2.post("/api/vendors/:vendorId/history", isAuthenticatedUnified, async (req, res) => {
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
  app2.patch("/api/vendor-history/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const history = await storage.updateVendorHistory(id, req.body);
      res.json(history);
    } catch (error) {
      console.error("Error updating vendor history:", error);
      res.status(500).json({ message: "Failed to update vendor history" });
    }
  });
  app2.delete("/api/vendor-history/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteVendorHistory(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vendor history:", error);
      res.status(500).json({ message: "Failed to delete vendor history" });
    }
  });
  app2.get("/api/strata/:id/meetings", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const meetings2 = await storage.getStrataMeetings(id);
      res.json(meetings2);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });
  app2.post("/api/strata/:id/meetings", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const meetingData = insertMeetingSchema.parse({
        ...req.body,
        strataId: id,
        meetingDate: new Date(req.body.meetingDate),
        // Convert string to Date
        scheduledAt: new Date(req.body.scheduledAt)
        // Convert string to Date
      });
      console.log("\u{1F3AF} Creating new meeting:", meetingData.title);
      const meeting = await storage.createMeeting(meetingData);
      if (req.body.invitees && req.body.invitees.length > 0) {
        try {
          console.log("\u{1F4E7} Sending meeting invitations to invitees...");
          const strata2 = await storage.getStrata(id);
          if (!strata2) {
            console.warn("\u26A0\uFE0F Strata not found for meeting invitations");
          } else {
            const organizerEmail = req.user?.email;
            let organizer = null;
            if (organizerEmail) {
              organizer = await storage.getUserByEmail(organizerEmail);
            }
            if (!organizer) {
              console.warn("\u26A0\uFE0F Organizer not found for meeting invitations");
              organizer = {
                id: "unknown",
                email: organizerEmail || "unknown@email.com",
                firstName: "Meeting",
                lastName: "Organizer"
              };
            }
            const allUsers = await storage.getStrataUsers(id);
            const invitees = req.body.invitees.map(
              (inviteeId) => allUsers.find((user) => user.id === inviteeId)
            ).filter(Boolean);
            if (invitees.length > 0) {
              const { sendMeetingInviteEmails: sendMeetingInviteEmails2 } = await Promise.resolve().then(() => (init_email_service(), email_service_exports));
              await sendMeetingInviteEmails2({
                meeting,
                strata: {
                  name: strata2.name,
                  address: strata2.address || "Address not specified"
                },
                invitees,
                organizer
              });
              console.log(`\u2705 Meeting invitations sent to ${invitees.length} recipients`);
              for (const invitee of invitees) {
                try {
                  const notificationData = {
                    userId: invitee.id,
                    strataId: id,
                    type: "meeting_invitation",
                    title: `\u{1F4C5} Meeting Invitation: ${meeting.title}`,
                    message: `You're invited to ${meeting.title} on ${new Date(meeting.scheduledAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })} at ${new Date(meeting.scheduledAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true
                    })}. Click to view details.`,
                    priority: "high",
                    isRead: false,
                    metadata: {
                      meetingId: meeting.id,
                      meetingTitle: meeting.title,
                      meetingDate: meeting.scheduledAt,
                      organizer: organizer ? `${organizer.firstName} ${organizer.lastName}` : "Meeting Organizer",
                      location: meeting.location || "TBD",
                      type: meeting.meetingType || "general_meeting"
                    },
                    createdAt: (/* @__PURE__ */ new Date()).toISOString()
                  };
                  await storage.createNotification(notificationData);
                  console.log(`\u2705 Created notification for ${invitee.email}`);
                } catch (notifError) {
                  console.error(`\u274C Failed to create notification for ${invitee.email}:`, notifError);
                }
              }
            } else {
              console.warn("\u26A0\uFE0F No valid invitees found for meeting invitations");
            }
          }
        } catch (emailError) {
          console.error("\u274C Failed to send meeting invitations:", emailError);
        }
      }
      res.json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });
  app2.post("/api/meetings/:meetingId/upload-audio", isAuthenticatedUnified, upload.single("audio"), async (req, res) => {
    try {
      const { meetingId } = req.params;
      console.log("\u{1F399}\uFE0F Processing audio upload for meeting:", meetingId);
      if (!req.file) {
        console.log("\u274C No audio file provided in request");
        return res.status(400).json({ message: "No audio file provided" });
      }
      console.log("\u{1F4CA} Audio file details:", {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      });
      console.log("\u{1F50D} Verifying meeting exists...");
      const existingMeeting = await storage.getMeeting(meetingId);
      if (!existingMeeting) {
        console.log("\u274C Meeting not found:", meetingId);
        return res.status(404).json({
          message: "Meeting not found. Please refresh the page and try again.",
          meetingId
        });
      }
      console.log("\u2705 Meeting found:", existingMeeting.title);
      const timestamp2 = Date.now();
      const fileName = `meeting_${meetingId}_${timestamp2}.wav`;
      const audioUrl = await uploadFile(
        req.file.buffer,
        `audio-recordings/${fileName}`,
        req.file.mimetype
      );
      console.log("\u{1F4DD} Updating meeting with audio URL...");
      await storage.updateMeeting(meetingId, { audioUrl });
      console.log("\u{1F3AF} Starting audio transcription...");
      const { transcribeAudio: transcribeAudio2 } = await Promise.resolve().then(() => (init_openai(), openai_exports));
      const transcription = await transcribeAudio2(req.file.buffer, req.file.originalname);
      console.log("\u2705 Audio transcription completed:", transcription.length, "characters");
      console.log("\u{1F4DD} Updating meeting with transcription...");
      await storage.updateMeeting(meetingId, {
        audioUrl,
        transcription,
        status: "completed"
        // Mark meeting as completed after transcription
      });
      console.log("\u{1F389} Audio upload and transcription completed successfully");
      res.json({
        message: "Audio uploaded and transcribed successfully",
        audioUrl,
        transcription
      });
    } catch (error) {
      console.error("\u274C Error uploading/transcribing audio:", error);
      console.error("\u274C Error stack:", error.stack);
      res.status(500).json({
        message: "Failed to upload and transcribe audio",
        error: error.message
      });
    }
  });
  app2.post("/api/meetings/:meetingId/generate-minutes", isAuthenticatedUnified, async (req, res) => {
    try {
      const { meetingId } = req.params;
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      if (!meeting.transcription) {
        return res.status(400).json({ message: "No transcription available for this meeting" });
      }
      const { generateMeetingMinutes: generateMeetingMinutes2 } = await Promise.resolve().then(() => (init_openai(), openai_exports));
      const minutes = await generateMeetingMinutes2(
        meeting.transcription,
        meeting.title,
        meeting.meetingType || "board_meeting",
        meeting.chairperson ? meeting.chairperson : void 0,
        meeting.agenda ? meeting.agenda : void 0
      );
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
  app2.patch("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
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
  app2.get("/api/strata/:id/documents", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const documents2 = await storage.getStrataDocuments(id);
      res.json(documents2);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  app2.post("/api/strata/:id/documents", isAuthenticatedUnified, async (req, res) => {
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
  app2.get("/api/strata/:id/maintenance", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const requests = await storage.getStrataMaintenanceRequests(id);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      res.status(500).json({ message: "Failed to fetch maintenance requests" });
    }
  });
  app2.post("/api/strata/:id/maintenance", isAuthenticatedUnified, async (req, res) => {
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
  app2.patch("/api/maintenance/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const request = await storage.updateMaintenanceRequest(id, req.body);
      res.json(request);
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      res.status(500).json({ message: "Failed to update maintenance request" });
    }
  });
  app2.get("/api/strata/:id/maintenance", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const projects = await storage.getStrataMaintenanceProjects(id);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching maintenance projects:", error);
      res.status(500).json({ message: "Failed to fetch maintenance projects" });
    }
  });
  app2.post("/api/strata/:id/maintenance", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const projectData = insertMaintenanceProjectSchema.parse({
        ...req.body,
        strataId: id,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : void 0,
        completedDate: req.body.completedDate ? new Date(req.body.completedDate) : void 0,
        nextServiceDate: req.body.nextServiceDate ? new Date(req.body.nextServiceDate) : void 0
      });
      if (req.body.completedDate) {
        projectData.status = "completed";
      } else if (req.body.scheduledDate && projectData.status !== "in-progress") {
        projectData.status = "scheduled";
      }
      const project = await storage.createMaintenanceProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating maintenance project:", error);
      res.status(500).json({ message: "Failed to create maintenance project" });
    }
  });
  app2.get("/api/maintenance/:id", isAuthenticatedUnified, async (req, res) => {
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
  app2.patch("/api/maintenance/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const currentProject = await storage.getMaintenanceProject(id);
      const updateData = {
        ...req.body,
        scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : void 0,
        completedDate: req.body.completedDate ? new Date(req.body.completedDate) : void 0,
        nextServiceDate: req.body.nextServiceDate ? new Date(req.body.nextServiceDate) : void 0
      };
      if (!req.body.status) {
        if (req.body.completedDate) {
          updateData.status = "completed";
        } else if (req.body.scheduledDate && currentProject?.status !== "in-progress" && currentProject?.status !== "completed") {
          updateData.status = "scheduled";
        }
      }
      const project = await storage.updateMaintenanceProject(id, updateData);
      res.json(project);
    } catch (error) {
      console.error("Error updating maintenance project:", error);
      res.status(500).json({ message: "Failed to update maintenance project" });
    }
  });
  app2.patch("/api/maintenance/:id/archive", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.updateMaintenanceProject(id, { archived: true });
      res.json(project);
    } catch (error) {
      console.error("Error archiving maintenance project:", error);
      res.status(500).json({ message: "Failed to archive maintenance project" });
    }
  });
  app2.patch("/api/maintenance/:id/unarchive", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const project = await storage.updateMaintenanceProject(id, { archived: false });
      res.json(project);
    } catch (error) {
      console.error("Error unarchiving maintenance project:", error);
      res.status(500).json({ message: "Failed to unarchive maintenance project" });
    }
  });
  app2.delete("/api/maintenance/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMaintenanceProject(id);
      res.json({ message: "Maintenance project deleted successfully" });
    } catch (error) {
      console.error("Error deleting maintenance project:", error);
      res.status(500).json({ message: "Failed to delete maintenance project" });
    }
  });
  app2.get("/api/strata/:id/announcements", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const announcements2 = await storage.getStrataAnnouncements(id);
      res.json(announcements2);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Failed to fetch announcements" });
    }
  });
  app2.post("/api/strata/:id/announcements", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const announcementData = insertAnnouncementSchema.parse({
        ...req.body,
        strataId: id,
        publishedBy: userId,
        recurringEndDate: req.body.recurringEndDate ? new Date(req.body.recurringEndDate) : void 0
      });
      const announcement = await storage.createAnnouncement(announcementData);
      try {
        const announcementPreview = announcement.content ? announcement.content.substring(0, 100) : "New announcement";
        await pushNotificationService.sendToStrata(id, {
          title: "New Announcement",
          body: `${announcement.title}: ${announcementPreview}`,
          data: {
            type: "announcement",
            strataId: id,
            resourceId: announcement.id
          }
        });
        console.log("\u{1F4F1} Push notification sent for new announcement");
      } catch (pushError) {
        console.error("\u26A0\uFE0F Failed to send push notifications for announcement:", pushError);
      }
      try {
        const userAccess = await storage.getStrataUsers(id);
        const strata2 = await storage.getStrata(id);
        const strataName = strata2?.name || "Your Strata";
        console.log(`\u{1F4EC} Creating announcement notifications for ${userAccess.length} users`);
        const { sendNotificationEmail: sendNotificationEmail2 } = await Promise.resolve().then(() => (init_email_service(), email_service_exports));
        for (const userAccessRecord of userAccess) {
          if (userAccessRecord.userId === userId) continue;
          await storage.createNotification({
            userId: userAccessRecord.userId,
            strataId: id,
            type: "announcement",
            relatedId: announcement.id,
            title: "New Announcement",
            message: `${announcement.title}`
          });
          try {
            const user = await storage.getUser(userAccessRecord.userId);
            if (user && user.email) {
              await sendNotificationEmail2({
                userId: userAccessRecord.userId,
                userEmail: user.email,
                strataId: id,
                strataName,
                notificationType: "announcement",
                title: announcement.title,
                message: announcement.content || "A new announcement has been posted.",
                metadata: {
                  announcement_type: announcement.announcementType || "general",
                  priority: announcement.priority || "normal",
                  posted_by: announcement.publishedBy
                }
              });
              console.log(`\u{1F4E7} Announcement email sent to ${user.email}`);
            }
          } catch (emailError) {
            console.error(`\u274C Failed to send email to user ${userAccessRecord.userId}:`, emailError);
          }
        }
        console.log("\u2705 Announcement notifications and emails sent");
      } catch (notifError) {
        console.error("\u274C Error creating announcement notifications:", notifError);
      }
      res.json(announcement);
    } catch (error) {
      console.error("Error creating announcement:", error);
      res.status(500).json({ message: "Failed to create announcement" });
    }
  });
  app2.patch("/api/announcements/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const announcement = await storage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      const userAccess = await storage.getUserStrataAccess(userId, announcement.strataId);
      const canEdit = announcement.publishedBy === userId || userAccess?.role === "admin" || userAccess?.role === "chairperson";
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
  app2.delete("/api/announcements/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const announcement = await storage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      const userAccess = await storage.getUserStrataAccess(userId, announcement.strataId);
      const canDelete = announcement.publishedBy === userId || userAccess?.role === "admin" || userAccess?.role === "chairperson";
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
  app2.get("/api/strata/:id/users", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const users2 = await storage.getStrataUsers(id);
      console.log(`Fetched strata users:`, JSON.stringify(users2, null, 2));
      res.json(users2);
    } catch (error) {
      console.error("Error fetching strata users:", error);
      res.status(500).json({ message: "Failed to fetch strata users" });
    }
  });
  app2.get("/api/strata/:id/user-role", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userEmail = req.user?.email || req.user?.email || req.user?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      if (userEmail === "rfinnbogason@gmail.com") {
        return res.json({ role: "master_admin" });
      }
      let user;
      let userAccess;
      const dbUser = await storage.getUserByEmail(userEmail);
      if (!dbUser) {
        return res.json({ role: "resident" });
      }
      user = dbUser;
      userAccess = await storage.getUserStrataAccess(dbUser.id, id);
      if (!userAccess) {
        console.log("\u{1F3E0} No strata access found, defaulting to resident");
        return res.json({ role: "resident" });
      }
      console.log("\u2705 Returning role:", userAccess.role);
      res.set("Cache-Control", "no-store");
      res.json({ role: userAccess.role });
    } catch (error) {
      console.error("\u274C Error fetching user role:", error);
      res.status(500).json({ message: "Failed to fetch user role" });
    }
  });
  app2.post("/api/strata/:id/users", isAuthenticatedUnified, async (req, res) => {
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
  app2.patch("/api/strata-access/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userAccess = await storage.updateUserStrataAccess(id, req.body);
      res.json(userAccess);
    } catch (error) {
      console.error("Error updating user access:", error);
      res.status(500).json({ message: "Failed to update user access" });
    }
  });
  app2.delete("/api/strata-access/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUserStrataAccess(id);
      res.json({ message: "User access removed successfully" });
    } catch (error) {
      console.error("Error removing user access:", error);
      res.status(500).json({ message: "Failed to remove user access" });
    }
  });
  app2.get("/api/admin/users/:userId/strata-assignments", isAuthenticatedUnified, async (req, res) => {
    try {
      if (!req.user?.email === "rfinnbogason@gmail.com" && !req.user?.email === "rfinnbogason@gmail.com" && !req.user?.claims?.email === "rfinnbogason@gmail.com") {
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
  app2.delete("/api/strata-admin/users/:userId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.deleteUserStrataAccess(userId);
      res.json({ message: "User access removed successfully" });
    } catch (error) {
      console.error("Error removing user access:", error);
      res.status(500).json({ message: "Failed to remove user access" });
    }
  });
  app2.patch("/api/strata-admin/users/:userId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { userId } = req.params;
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.patch("/api/strata-admin/role/:accessId", isAuthenticatedUnified, async (req, res) => {
    console.log("PATCH /api/strata-admin/role/:accessId endpoint reached");
    console.log("Access ID:", req.params.accessId);
    console.log("Request body:", req.body);
    try {
      const { accessId } = req.params;
      const updatedAccess = await storage.updateUserStrataAccess(accessId, req.body);
      console.log("Successfully updated access:", updatedAccess);
      res.json(updatedAccess);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  app2.post("/api/strata-admin/users", isAuthenticatedUnified, async (req, res) => {
    try {
      const { email, firstName, lastName, role, temporaryPassword, strataId } = req.body;
      let user = await storage.getUserByEmail(email);
      if (!user) {
        const hashedPassword = await import_bcryptjs2.default.hash(temporaryPassword, 10);
        user = await storage.createUser({
          email,
          firstName,
          lastName,
          passwordHash: hashedPassword,
          isActive: true,
          role: role || "resident",
          mustChangePassword: true
          // Force password change on first login
        });
      }
      const userAccess = await storage.createUserStrataAccess({
        userId: user.id,
        strataId,
        role: role || "resident"
      });
      res.json({ user, userAccess });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.get("/api/admin/pending-registrations", isAuthenticatedUnified, async (req, res) => {
    try {
      if (!req.user?.email === "rfinnbogason@gmail.com" && !req.user?.email === "rfinnbogason@gmail.com" && !req.user?.claims?.email === "rfinnbogason@gmail.com") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      const registrations = await storage.getPendingRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching pending registrations:", error);
      res.status(500).json({ message: "Failed to fetch pending registrations" });
    }
  });
  app2.post("/api/admin/pending-registrations/:id/approve", isAuthenticatedUnified, async (req, res) => {
    try {
      if (!req.user?.email === "rfinnbogason@gmail.com" && !req.user?.email === "rfinnbogason@gmail.com" && !req.user?.claims?.email === "rfinnbogason@gmail.com") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      const { id } = req.params;
      const subscriptionData = req.body;
      let trialEndDate = null;
      if (subscriptionData.subscriptionTier === "trial") {
        trialEndDate = /* @__PURE__ */ new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 30);
      }
      const fullSubscriptionData = {
        ...subscriptionData,
        subscriptionStatus: subscriptionData.subscriptionTier === "trial" ? "trial" : subscriptionData.isFreeForever ? "free" : "active",
        trialEndDate
      };
      await storage.approveStrataRegistration(id, fullSubscriptionData);
      res.json({ message: "Registration approved successfully with subscription settings" });
    } catch (error) {
      console.error("Error approving registration:", error);
      res.status(500).json({ message: "Failed to approve registration" });
    }
  });
  app2.post("/api/admin/pending-registrations/:id/reject", isAuthenticatedUnified, async (req, res) => {
    try {
      if (!req.user?.email === "rfinnbogason@gmail.com" && !req.user?.email === "rfinnbogason@gmail.com" && !req.user?.claims?.email === "rfinnbogason@gmail.com") {
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
  app2.post("/api/strata-admin/users", isAuthenticatedUnified, async (req, res) => {
    try {
      const userData = req.body;
      const strataId = userData.strataId;
      if (!strataId) {
        return res.status(400).json({ message: "Strata ID is required" });
      }
      const hasAccess = await storage.checkUserStrataAdminAccess(req.user.claims.sub, strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden: Admin access required for this strata" });
      }
      const hashedPassword = await import_bcryptjs2.default.hash(userData.temporaryPassword, 10);
      const newUser = await storage.createUser({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        passwordHash: hashedPassword,
        isActive: true
      });
      await storage.createUserStrataAccess({
        userId: newUser.id,
        strataId,
        role: userData.role,
        canPostAnnouncements: ["chairperson", "secretary"].includes(userData.role)
      });
      res.json({ message: "User created successfully", user: newUser });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.patch("/api/strata-admin/users/:userId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { userId } = req.params;
      const userData = req.body;
      const userAccess = await storage.getUserStrataAssignments(req.user.claims.sub);
      const adminStrataIds = userAccess.filter((access) => ["chairperson", "property_manager", "treasurer", "secretary"].includes(access.role)).map((access) => access.strataId);
      if (adminStrataIds.length === 0) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      const updatedUser = await storage.updateUser(userId, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  app2.patch("/api/strata-admin/user-access/:accessId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { accessId } = req.params;
      const accessData = req.body;
      const currentAccess = await storage.getUserStrataAccessById(accessId);
      if (!currentAccess) {
        return res.status(404).json({ message: "Access record not found" });
      }
      const hasAccess = await storage.checkUserStrataAdminAccess(req.user.claims.sub, currentAccess.strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Forbidden: Admin access required for this strata" });
      }
      const updatedAccess = await storage.updateUserStrataAccess(accessId, accessData);
      res.json(updatedAccess);
    } catch (error) {
      console.error("Error updating user access:", error);
      res.status(500).json({ message: "Failed to update user access" });
    }
  });
  app2.delete("/api/strata-admin/users/:userId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { userId } = req.params;
      const userAccess = await storage.getUserStrataAssignments(req.user.claims.sub);
      const adminStrataIds = userAccess.filter((access) => ["chairperson", "property_manager", "treasurer", "secretary"].includes(access.role)).map((access) => access.strataId);
      if (adminStrataIds.length === 0) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      await storage.removeUserFromAllStrata(userId);
      await storage.updateUser(userId, { isActive: false });
      res.json({ message: "User removed successfully" });
    } catch (error) {
      console.error("Error removing user:", error);
      res.status(500).json({ message: "Failed to remove user" });
    }
  });
  app2.get("/api/strata/:id/document-folders", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const { parent } = req.query;
      console.log(`\u{1F50D} GET document-folders for strata ${id}, parent: ${parent || "null"}`);
      const folders = await storage.getStrataDocumentFolders(id, parent);
      console.log(`\u{1F4C1} Route returning ${folders?.length || 0} folders:`, folders);
      res.json(folders);
    } catch (error) {
      console.error("Error fetching document folders:", error);
      res.status(500).json({ message: "Failed to fetch document folders" });
    }
  });
  app2.post("/api/strata/:id/document-folders", isAuthenticatedUnified, async (req, res) => {
    try {
      console.log("\u{1F4C1} Creating document folder...");
      console.log("Strata ID:", req.params.id);
      console.log("Request body:", req.body);
      console.log("User claims:", req.user?.claims);
      const { id } = req.params;
      const userId = req.user?.claims?.sub || req.user?.claims?.email || "unknown";
      let path3 = `/${req.body.name}`;
      if (req.body.parentFolderId) {
        const parentFolder = await storage.getDocumentFolder(req.body.parentFolderId);
        if (parentFolder) {
          path3 = `${parentFolder.path}/${req.body.name}`;
        }
      }
      const folderData = {
        ...req.body,
        strataId: id,
        createdBy: userId,
        path: path3
      };
      console.log("Creating folder with data:", folderData);
      const folder = await storage.createDocumentFolder(folderData);
      console.log("\u2705 Folder created successfully:", folder);
      res.json(folder);
    } catch (error) {
      console.error("\u274C Error creating document folder:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create document folder" });
    }
  });
  app2.patch("/api/document-folders/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const folder = await storage.updateDocumentFolder(id, req.body);
      res.json(folder);
    } catch (error) {
      console.error("Error updating document folder:", error);
      res.status(500).json({ message: "Failed to update document folder" });
    }
  });
  app2.delete("/api/document-folders/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDocumentFolder(id);
      res.json({ message: "Document folder deleted successfully" });
    } catch (error) {
      console.error("Error deleting document folder:", error);
      res.status(500).json({ message: "Failed to delete document folder" });
    }
  });
  app2.get("/api/strata/:id/documents", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const { folder, search } = req.query;
      let documents2;
      if (search) {
        documents2 = await storage.searchDocuments(id, search);
      } else if (folder) {
        documents2 = await storage.getFolderDocuments(folder);
      } else {
        documents2 = await storage.getStrataDocuments(id);
      }
      res.json(documents2);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  app2.post("/api/strata/:id/documents", upload.single("file"), async (req, res) => {
    console.log("\u{1F6A8}\u{1F6A8}\u{1F6A8} SIMPLIFIED UPLOAD ROUTE REACHED! \u{1F6A8}\u{1F6A8}\u{1F6A8}");
    console.log("\u{1F4CB} Upload details:", {
      method: req.method,
      path: req.path,
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      authHeader: req.headers.authorization ? "PRESENT" : "MISSING"
    });
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("\u274C No auth header found");
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const token = authHeader.substring(7);
      const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
      if (!payload.email === "rfinnbogason@gmail.com") {
        console.log("\u274C Not master admin");
        return res.status(403).json({ message: "Access denied" });
      }
      console.log("\u2705 Master admin authenticated");
    } catch (authError) {
      console.log("\u274C Auth token invalid:", authError);
      return res.status(401).json({ message: "Invalid token" });
    }
    if (!req.file) {
      console.log("\u274C No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }
    try {
      const { id } = req.params;
      const userId = "master-admin";
      const file = req.file;
      console.log(`\u{1F50D} Document upload attempt:`, {
        strataId: id,
        userId,
        fileName: file?.originalname,
        fileSize: file?.size,
        formData: Object.keys(req.body)
      });
      if (!file) {
        console.log("\u274C No file uploaded");
        return res.status(400).json({ message: "No file uploaded" });
      }
      const fileName = `documents/${id}/${Date.now()}_${file.originalname}`;
      const fileUrl = await uploadFile(file.buffer, fileName, file.mimetype);
      const documentData = {
        title: req.body.title,
        description: req.body.description || "",
        type: req.body.type,
        tags: req.body.tags ? req.body.tags.split(",").map((tag) => tag.trim()) : [],
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileUrl,
        folderId: req.body.folderId || null,
        strataId: id,
        uploadedBy: userId
      };
      console.log(`\u{1F4BE} Creating document record in Firestore...`);
      const document = await storage.createDocument(documentData);
      console.log(`\u{1F4C4} Document uploaded successfully: ${file.originalname} (${file.size} bytes) for strata ${id}`);
      res.json(document);
    } catch (error) {
      console.error("\u274C Error creating document:", error);
      console.error("Error details:", error.message);
      console.error("Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  app2.patch("/api/documents/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const document = await storage.updateDocument(id, req.body);
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });
  app2.delete("/api/documents/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteDocument(id);
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });
  app2.get("/api/strata/:id/search", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const { q: searchTerm, type } = req.query;
      if (!searchTerm) {
        return res.json({ folders: [], documents: [] });
      }
      let results = { folders: [], documents: [] };
      if (!type || type === "folders") {
        results.folders = await storage.searchDocumentFolders(id, searchTerm);
      }
      if (!type || type === "documents") {
        results.documents = await storage.searchDocuments(id, searchTerm);
      }
      res.json(results);
    } catch (error) {
      console.error("Error searching:", error);
      res.status(500).json({ message: "Failed to search" });
    }
  });
  app2.get("/api/financial/fees/:strataId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const strata2 = await storage.getStrata(strataId);
      if (!strata2) {
        return res.status(404).json({ message: "Strata not found" });
      }
      res.json({
        strataId,
        feeStructure: strata2.feeStructure || {},
        lastUpdated: strata2.updatedAt
      });
    } catch (error) {
      console.error("Error fetching fees:", error);
      res.status(500).json({ message: "Failed to fetch fees" });
    }
  });
  app2.post("/api/financial/fees", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId, feeStructure } = req.body;
      const updatedStrata = await storage.updateStrata(strataId, { feeStructure });
      res.json(updatedStrata);
    } catch (error) {
      console.error("Error updating fees:", error);
      res.status(500).json({ message: "Failed to update fees" });
    }
  });
  app2.get("/api/financial/summary/:strataId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      console.log("\u{1F4B0} Fetching financial summary for strata:", strataId);
      const expenses2 = await storage.getStrataExpenses(strataId);
      const strata2 = await storage.getStrata(strataId);
      const units2 = await storage.getStrataUnits(strataId);
      console.log("\u{1F4CA} Units found:", units2.length);
      console.log("\u{1F4CA} Expenses found:", expenses2.length);
      expenses2.forEach((expense, index2) => {
        console.log(`\u{1F4CB} Expense ${index2 + 1}: ${expense.description || expense.category} - Amount: $${expense.amount}, isRecurring: ${expense.isRecurring}, frequency: ${expense.recurringFrequency}`);
      });
      const totalExpenses = expenses2.reduce((sum, expense) => sum + parseFloat(expense.amount || "0"), 0);
      const now = /* @__PURE__ */ new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const recurringExpenses = expenses2.filter((expense) => expense.isRecurring === true);
      const oneTimeExpenses = expenses2.filter((expense) => !expense.isRecurring);
      const currentMonthOneTimeExpenses = oneTimeExpenses.filter((expense) => {
        const expenseDate = expense.date ? new Date(expense.date) : expense.createdAt?._seconds ? new Date(expense.createdAt._seconds * 1e3) : expense.createdAt ? new Date(expense.createdAt) : null;
        if (!expenseDate) return false;
        return expenseDate >= currentMonthStart && expenseDate <= currentMonthEnd;
      });
      const recurringMonthlyTotal = recurringExpenses.reduce((sum, expense) => {
        const amount = parseFloat(expense.amount || "0");
        const frequency = expense.recurringFrequency?.toLowerCase();
        if (frequency === "annually" || frequency === "yearly" || frequency === "annual") {
          return sum + amount / 12;
        } else if (frequency === "quarterly") {
          return sum + amount / 3;
        } else if (frequency === "weekly") {
          return sum + amount * 4.33;
        }
        return sum + amount;
      }, 0);
      const oneTimeMonthlyTotal = currentMonthOneTimeExpenses.reduce((sum, expense) => {
        return sum + parseFloat(expense.amount || "0");
      }, 0);
      const monthlyExpensesTotal = recurringMonthlyTotal + oneTimeMonthlyTotal;
      console.log("\u{1F4CA} Recurring expenses:", recurringExpenses.length, "Monthly prorated:", recurringMonthlyTotal);
      console.log("\u{1F4CA} One-time expenses this month:", currentMonthOneTimeExpenses.length, "Total:", oneTimeMonthlyTotal);
      console.log("\u{1F4CA} Total monthly expenses:", monthlyExpensesTotal);
      const pendingExpenses = expenses2.filter((e) => e.status === "pending").length;
      const approvedExpenses = expenses2.filter((e) => e.status === "approved").length;
      const feeStructure = strata2?.feeStructure || {};
      let monthlyRevenue = 0;
      let feeTiers2 = [];
      if (feeStructure.tiers && Array.isArray(feeStructure.tiers)) {
        feeTiers2 = feeStructure.tiers;
      } else {
        feeTiers2 = Object.entries(feeStructure).map(([id, amount]) => ({
          id,
          amount: typeof amount === "number" ? amount : 0
        }));
      }
      feeTiers2.forEach((tier) => {
        const unitsInTier = units2.filter((unit) => unit.feeTierId === tier.id);
        const tierAmount = tier.amount || 0;
        monthlyRevenue += unitsInTier.length * tierAmount;
      });
      const funds2 = await storage.getStrataFunds(strataId);
      const reserveFund = funds2.find((f) => f.type === "reserve");
      const reserveBalance = reserveFund ? parseFloat(reserveFund.balance) : 125e3;
      const reserveTarget = reserveFund?.target ? parseFloat(reserveFund.target) : 15e4;
      const paymentReminders2 = await storage.getStrataPaymentReminders(strataId);
      const overdueReminders = paymentReminders2.filter((reminder) => {
        if (!reminder.dueDate) return false;
        const dueDate = new Date(reminder.dueDate);
        return dueDate < /* @__PURE__ */ new Date() && reminder.status !== "paid" && reminder.status !== "cancelled";
      });
      const outstandingFees = overdueReminders.reduce((sum, reminder) => {
        return sum + (reminder.amount || 0);
      }, 0);
      const summary = {
        totalRevenue: monthlyRevenue * 12,
        // Annual revenue
        monthlyRevenue,
        // Monthly revenue
        monthlyExpenses: monthlyExpensesTotal,
        // Current month's expenses only
        totalExpenses,
        // All-time expenses for reference
        reserveFund: reserveBalance,
        reserveTarget,
        pendingExpenses,
        approvedExpenses,
        outstandingFees
        // Actual overdue payments
      };
      console.log("\u{1F4B0} Financial summary calculated:", JSON.stringify(summary, null, 2));
      res.json(summary);
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      res.status(500).json({ message: "Failed to fetch financial summary" });
    }
  });
  app2.get("/api/financial/reminders/:strataId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const reminders = await storage.getStrataPaymentReminders(strataId);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching payment reminders:", error);
      res.status(500).json({ message: "Failed to fetch payment reminders" });
    }
  });
  app2.post("/api/financial/reminders", isAuthenticatedUnified, async (req, res) => {
    try {
      const reminderData = insertPaymentReminderSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      if (reminderData.reminderType === "monthly_strata_fee" && !reminderData.unitId) {
        const units2 = await storage.getStrataUnits(reminderData.strataId);
        const createdReminders = [];
        for (const unit of units2) {
          const unitReminder = await storage.createPaymentReminder({
            ...reminderData,
            unitId: unit.id,
            title: `${reminderData.title} - Unit ${unit.unitNumber}`
          });
          createdReminders.push(unitReminder);
          if (unit.ownerEmail) {
            const strataUsers = await storage.getStrataUsers(reminderData.strataId);
            const unitOwner = strataUsers.find((su) => su.user?.email === unit.ownerEmail);
            if (unitOwner) {
              const dueDate = reminderData.dueDate ? new Date(reminderData.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD";
              await storage.createNotification({
                userId: unitOwner.userId || unitOwner.id,
                strataId: reminderData.strataId,
                type: "payment_reminder",
                title: "Payment Reminder",
                message: `${reminderData.title}${reminderData.amount ? ` - $${reminderData.amount}` : ""}${reminderData.dueDate ? ` - Due: ${dueDate}` : ""}`,
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
        const reminder = await storage.createPaymentReminder(reminderData);
        if (reminderData.unitId) {
          const units2 = await storage.getStrataUnits(reminderData.strataId);
          const unit = units2.find((u) => u.id === reminderData.unitId);
          if (unit && unit.ownerEmail) {
            const strataUsers = await storage.getStrataUsers(reminderData.strataId);
            const unitOwner = strataUsers.find((su) => su.user?.email === unit.ownerEmail);
            if (unitOwner) {
              const dueDate = reminderData.dueDate ? new Date(reminderData.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD";
              await storage.createNotification({
                userId: unitOwner.userId || unitOwner.id,
                strataId: reminderData.strataId,
                type: "payment_reminder",
                title: "Payment Reminder",
                message: `${reminderData.title}${reminderData.amount ? ` - $${reminderData.amount}` : ""}${reminderData.dueDate ? ` - Due: ${dueDate}` : ""}`,
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
  app2.put("/api/financial/reminders/:id", isAuthenticatedUnified, async (req, res) => {
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
  app2.delete("/api/financial/reminders/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePaymentReminder(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting payment reminder:", error);
      res.status(500).json({ message: "Failed to delete payment reminder" });
    }
  });
  app2.get("/api/financial/reminders/:strataId/overdue", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const overdueReminders = await storage.getOverdueReminders(strataId);
      res.json(overdueReminders);
    } catch (error) {
      console.error("Error fetching overdue reminders:", error);
      res.status(500).json({ message: "Failed to fetch overdue reminders" });
    }
  });
  app2.get("/api/financial/reminders/:strataId/recurring", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const recurringReminders = await storage.getActiveRecurringReminders(strataId);
      res.json(recurringReminders);
    } catch (error) {
      console.error("Error fetching recurring reminders:", error);
      res.status(500).json({ message: "Failed to fetch recurring reminders" });
    }
  });
  app2.get("/api/strata/:id/funds", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      let funds2 = await storage.getStrataFunds(id);
      if (funds2.length === 0) {
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
        for (const fundData of defaultFunds) {
          try {
            await storage.createFund(fundData);
          } catch (error) {
            console.error("Error creating default fund:", error);
          }
        }
        funds2 = await storage.getStrataFunds(id);
      }
      res.json(funds2);
    } catch (error) {
      console.error("Error fetching funds:", error);
      res.status(500).json({ message: "Failed to fetch funds" });
    }
  });
  app2.post("/api/strata/:id/funds", isAuthenticatedUnified, async (req, res) => {
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
  app2.patch("/api/funds/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const fund = await storage.updateFund(id, req.body);
      res.json(fund);
    } catch (error) {
      console.error("Error updating fund:", error);
      res.status(500).json({ message: "Failed to update fund" });
    }
  });
  app2.delete("/api/funds/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteFund(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting fund:", error);
      res.status(500).json({ message: "Failed to delete fund" });
    }
  });
  app2.get("/api/funds/:id/transactions", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const transactions = await storage.getFundTransactions(id);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching fund transactions:", error);
      res.status(500).json({ message: "Failed to fetch fund transactions" });
    }
  });
  app2.post("/api/funds/:id/transactions", isAuthenticatedUnified, async (req, res) => {
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
  app2.get("/api/funds/:id/projections", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const years = parseInt(req.query.years) || 5;
      const projections = await storage.calculateFundProjections(id, years);
      res.json(projections);
    } catch (error) {
      console.error("Error calculating fund projections:", error);
      res.status(500).json({ message: "Failed to calculate fund projections" });
    }
  });
  app2.get("/api/strata/:strataId/meetings", isAuthenticatedUnified, async (req, res) => {
    try {
      const meetings2 = await storage.getStrataMeetings(req.params.strataId);
      res.json(meetings2);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });
  app2.post("/api/strata/:strataId/meetings", isAuthenticatedUnified, async (req, res) => {
    try {
      const meetingData = {
        ...req.body,
        strataId: req.params.strataId
      };
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
  app2.get("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
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
  app2.patch("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
    try {
      const updateData = { ...req.body };
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
  app2.delete("/api/meetings/:meetingId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { meetingId } = req.params;
      console.log("\u{1F5D1}\uFE0F Deleting meeting:", meetingId);
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        console.log("\u274C Meeting not found:", meetingId);
        return res.status(404).json({
          message: "Meeting not found. Please refresh the page and try again.",
          meetingId
        });
      }
      await storage.deleteMeeting(meetingId);
      console.log("\u2705 Meeting deleted successfully:", meetingId);
      res.json({ message: "Meeting deleted successfully" });
    } catch (error) {
      console.error("Error deleting meeting:", error);
      res.status(500).json({ message: "Failed to delete meeting" });
    }
  });
  app2.post("/api/meetings/upload-recording", isAuthenticatedUnified, async (req, res) => {
    try {
      const { meetingId } = req.body;
      const audioUrl = `/api/recordings/${meetingId}.wav`;
      await storage.updateMeeting(meetingId, {
        audioUrl,
        status: "completed"
      });
      res.json({ message: "Recording uploaded successfully", audioUrl });
    } catch (error) {
      console.error("Error uploading recording:", error);
      res.status(500).json({ message: "Failed to upload recording" });
    }
  });
  app2.get("/api/admin/strata", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      console.log("\u{1F451} Admin fetching all strata organizations");
      const strata2 = await storage.getAllStrata();
      console.log(`\u{1F4CA} Admin found ${strata2.length} strata organizations`);
      res.json(strata2);
    } catch (error) {
      console.error("\u274C Admin strata fetch failed:", error);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });
  app2.post("/api/admin/strata", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const strataData = {
        ...req.body,
        createdBy: userId
      };
      const strata2 = await storage.createStrata(strataData);
      res.json(strata2);
    } catch (error) {
      console.error("Error creating strata:", error);
      res.status(500).json({ message: "Failed to create strata" });
    }
  });
  app2.patch("/api/admin/strata/:id", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const strata2 = await storage.updateStrata(id, req.body);
      res.json(strata2);
    } catch (error) {
      console.error("Error updating strata:", error);
      res.status(500).json({ message: "Failed to update strata" });
    }
  });
  app2.delete("/api/admin/strata/:id", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteStrata(id);
      res.json({ message: "Strata and all associated data deleted successfully" });
    } catch (error) {
      console.error("Error deleting strata:", error);
      res.status(500).json({ message: "Failed to delete strata" });
    }
  });
  app2.get("/api/admin/strata/:id", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const strata2 = await storage.getStrata(id);
      if (!strata2) {
        return res.status(404).json({ message: "Strata not found" });
      }
      res.json(strata2);
    } catch (error) {
      console.error("Error fetching strata:", error);
      res.status(500).json({ message: "Failed to fetch strata" });
    }
  });
  app2.patch("/api/admin/strata/:id/subscription", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { subscriptionTier, monthlyRate, isFreeForever, extendDays, subscriptionStatus } = req.body;
      if (extendDays !== void 0) {
        const days = parseInt(extendDays);
        if (isNaN(days) || days < 1 || days > 365) {
          return res.status(400).json({
            message: "Invalid input: Days to extend must be between 1 and 365"
          });
        }
      }
      if (monthlyRate !== void 0) {
        const rate = parseFloat(monthlyRate);
        if (isNaN(rate) || rate < 0) {
          return res.status(400).json({
            message: "Invalid input: Monthly rate must be a positive number"
          });
        }
      }
      const currentStrata = await storage.getStrata(id);
      const currentSubscription = currentStrata?.subscription || {};
      let trialEndDate = null;
      let trialStartDate = null;
      if (subscriptionTier === "trial") {
        if (extendDays) {
          const currentTrialEnd = currentSubscription.trialEndDate;
          if (currentTrialEnd) {
            const currentEndDate = currentTrialEnd.toDate ? currentTrialEnd.toDate() : new Date(currentTrialEnd);
            trialEndDate = new Date(currentEndDate);
            trialEndDate.setDate(trialEndDate.getDate() + extendDays);
          } else {
            trialEndDate = /* @__PURE__ */ new Date();
            trialEndDate.setDate(trialEndDate.getDate() + (extendDays || 30));
          }
          trialStartDate = currentSubscription.trialStartDate || /* @__PURE__ */ new Date();
        } else {
          trialStartDate = /* @__PURE__ */ new Date();
          trialEndDate = /* @__PURE__ */ new Date();
          trialEndDate.setDate(trialEndDate.getDate() + 30);
        }
      }
      const subscriptionData = {
        "subscription.tier": subscriptionTier || currentSubscription.tier,
        "subscription.monthlyRate": monthlyRate !== void 0 ? monthlyRate : currentSubscription.monthlyRate,
        "subscription.isFreeForever": isFreeForever !== void 0 ? isFreeForever : currentSubscription.isFreeForever,
        "subscription.status": subscriptionStatus || (subscriptionTier === "trial" ? "trial" : subscriptionTier === "cancelled" ? "cancelled" : isFreeForever ? "free" : "active")
      };
      if (trialEndDate) {
        subscriptionData["subscription.trialEndDate"] = trialEndDate;
      }
      if (trialStartDate) {
        subscriptionData["subscription.trialStartDate"] = trialStartDate;
      }
      await storage.updateStrata(id, subscriptionData);
      const updatedStrata = await storage.getStrata(id);
      res.json(updatedStrata);
    } catch (error) {
      console.error("Error updating subscription:", error);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });
  app2.get("/api/admin/users", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      res.json(users2);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/admin/users", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      console.log("Admin user creation - Request body:", req.body);
      const { email, firstName, lastName, role, temporaryPassword } = req.body;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      const passwordHash = await import_bcryptjs2.default.hash(temporaryPassword, 12);
      const user = await storage.createUser({
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        profileImageUrl: null,
        role: role || "resident",
        isActive: true,
        passwordHash,
        mustChangePassword: true
      });
      res.json({
        ...user,
        temporaryPassword
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.patch("/api/admin/users/:userId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { email, firstName, lastName, role, isActive, resetPassword, newPassword } = req.body;
      const updateData = {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role || "resident",
        isActive: isActive !== void 0 ? isActive : true,
        updatedAt: /* @__PURE__ */ new Date()
      };
      if (resetPassword && newPassword) {
        updateData.passwordHash = await import_bcryptjs2.default.hash(newPassword, 10);
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
  app2.delete("/api/admin/users/:userId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      console.log("DELETE user request - userId:", req.params.userId);
      console.log("DELETE user request - user:", req.user?.email || req.user?.email);
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log("Deleting user:", user.email);
      await storage.deleteUser(userId);
      console.log("User deleted successfully:", user.email);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.get("/api/admin/strata/:strataId/users", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { strataId } = req.params;
      const users2 = await storage.getStrataUsers(strataId);
      console.log("Fetched strata users:", JSON.stringify(users2, null, 2));
      res.json(users2);
    } catch (error) {
      console.error("Error fetching strata users:", error);
      res.status(500).json({ message: "Failed to fetch strata users" });
    }
  });
  app2.post("/api/test-post", (req, res) => {
    console.log("\u{1F7E2} TEST POST ROUTE HIT - Server is receiving POST requests!");
    res.json({ message: "POST test successful" });
  });
  app2.use("/api/admin/*", (req, res, next) => {
    console.log("\u{1F534} ADMIN ROUTE HIT:", req.method, req.originalUrl, req.body);
    next();
  });
  app2.get("/api/debug/db-data-summary", async (req, res) => {
    try {
      const userAccess = await storage.getAllUserStrataAccess();
      const strata2 = await storage.getAllStrata();
      const users2 = await storage.getAllUsers();
      res.json({
        userAccess,
        strata: strata2.map((s) => ({ id: s.id, name: s.name })),
        users: users2.map((u) => ({ id: u.id, email: u.email }))
      });
    } catch (error) {
      console.error("Debug error:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/assign-user-to-strata", async (req, res) => {
    console.log("\u{1F3AF} DIRECT USER ASSIGNMENT - No middleware interference");
    console.log("Request body:", req.body);
    try {
      const { strataId, userId, role } = req.body;
      if (!userId || !strataId || !role) {
        return res.status(400).json({ message: "Missing required fields: userId, strataId, role" });
      }
      console.log("Creating user access:", { userId, strataId, role });
      const existingAccess = await storage.getUserStrataAccess(userId, strataId);
      if (existingAccess) {
        console.log("Updating existing access from", existingAccess.role, "to", role);
        const updatedAccess = await storage.updateUserStrataRole(userId, strataId, role);
        console.log("Successfully updated access:", updatedAccess);
        return res.json({ success: true, access: updatedAccess });
      }
      const accessData = {
        userId,
        strataId,
        role,
        canPostAnnouncements: ["chairperson", "property_manager", "secretary"].includes(role)
      };
      const access = await storage.createUserStrataAccess(accessData);
      console.log("Successfully created access:", access);
      res.json({ success: true, access });
    } catch (error) {
      console.error("Error in user assignment:", error);
      res.status(500).json({ message: error.message });
    }
  });
  app2.patch("/api/admin/user-access/:accessId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { accessId } = req.params;
      const updatedAccess = await storage.updateUserStrataAccess(accessId, req.body);
      res.json(updatedAccess);
    } catch (error) {
      console.error("Error updating user access:", error);
      res.status(500).json({ message: "Failed to update user access" });
    }
  });
  app2.delete("/api/admin/user-strata-access/:accessId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { accessId } = req.params;
      console.log("\u{1F5D1}\uFE0F Deleting user-strata access:", accessId);
      await storage.deleteUserStrataAccess(accessId);
      res.json({ message: "User unassigned successfully" });
    } catch (error) {
      console.error("\u274C Error unassigning user from strata:", error);
      res.status(500).json({ message: error.message || "Failed to unassign user" });
    }
  });
  app2.patch("/api/admin/strata/:strataId/subscription", isAuthenticatedUnified, isAdmin, async (req, res) => {
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
  app2.delete("/api/admin/user-access/:accessId", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { accessId } = req.params;
      await storage.deleteUserStrataAccess(accessId);
      res.json({ message: "User access removed successfully" });
    } catch (error) {
      console.error("Error removing user access:", error);
      res.status(500).json({ message: "Failed to remove user access" });
    }
  });
  app2.get("/api/get-user-assignments/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      console.log("\u{1F50D} Fetching all assignments for userId:", userId);
      if (userId === "master-admin") {
        console.log("\u{1F4CA} Master admin - returning empty assignments");
        return res.json([]);
      }
      const assignments = await storage.getUserStrataAssignments(userId);
      console.log(`\u{1F4CA} Found ${assignments.length} assignment(s) for user ${userId}`);
      res.json(assignments);
    } catch (error) {
      console.error("\u274C Error fetching user assignments:", error);
      res.status(500).json({ message: error.message || "Failed to fetch user assignments" });
    }
  });
  app2.get("/api/strata/:id/messages", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id || req.user?.id || "master-admin";
      console.log("\u{1F4EC} Fetching messages for strata:", id, "User:", userId);
      const messages2 = await storage.getMessagesByStrata(id);
      console.log("\u{1F4EC} Found messages:", messages2?.length || 0);
      res.json(messages2 || []);
    } catch (error) {
      console.error("\u274C Error fetching messages:", error);
      res.status(500).json({
        message: "Failed to fetch messages",
        error: error.message
      });
    }
  });
  app2.post("/api/strata/:id/messages", isAuthenticatedUnified, async (req, res) => {
    try {
      console.log("\u{1F4EC} Creating message - Request data:", {
        params: req.params,
        body: req.body,
        user: {
          id: req.user?.id,
          email: req.user?.email
        }
      });
      const { id } = req.params;
      const userId = req.user?.id || "master-admin";
      const { recipientIds, isGroupChat, ...bodyData } = req.body;
      const user = req.user;
      const senderName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || "Unknown User";
      console.log("\u{1F464} Message sender details:", {
        userId,
        senderName,
        recipientIds,
        messageType: isGroupChat ? "broadcast" : "private"
      });
      const uniqueRecipientIds = [...new Set(recipientIds || [])];
      console.log("\u{1F50D} Original recipientIds:", recipientIds);
      console.log("\u{1F50D} Deduplicated recipientIds:", uniqueRecipientIds);
      if (!uniqueRecipientIds || !Array.isArray(uniqueRecipientIds) || uniqueRecipientIds.length === 0) {
        return res.status(400).json({ message: "Please select at least one recipient to send a private message." });
      }
      let conversationId = bodyData.conversationId;
      const { conversationId: _, ...cleanBodyData } = bodyData;
      const messageData = {
        ...cleanBodyData,
        strataId: id,
        senderId: userId,
        recipientIds: uniqueRecipientIds,
        // Store as array instead of single recipientId
        messageType: isGroupChat ? "broadcast" : "private",
        isRead: false,
        priority: bodyData.priority || "normal"
      };
      if (conversationId) {
        messageData.conversationId = conversationId;
      }
      console.log("\u{1F48C} Creating single message with multiple recipients:", JSON.stringify(messageData, null, 2));
      const message = await storage.createMessage(messageData);
      console.log("\u{1F4EC} Creating notifications for recipients:", uniqueRecipientIds);
      for (const recipientId of uniqueRecipientIds) {
        const notificationData = {
          userId: recipientId,
          strataId: id,
          type: "message",
          title: `New message from ${senderName}`,
          message: isGroupChat ? `Group chat: ${bodyData.subject || "New message"}` : bodyData.subject || "New private message",
          relatedId: message.id,
          isRead: false,
          metadata: {
            messageId: message.id,
            senderId: userIdToUse,
            senderName,
            subject: bodyData.subject || "New message",
            isGroupChat
          }
        };
        console.log("\u{1F4EC} Creating notification:", notificationData);
        await storage.createNotification(notificationData);
      }
      console.log(`\u2705 Created ${uniqueRecipientIds.length} notifications`);
      try {
        const messagePreview = bodyData.content ? bodyData.content.substring(0, 100) : bodyData.subject || "New message";
        await pushNotificationService.sendToUsers(uniqueRecipientIds, {
          title: `New message from ${senderName}`,
          body: messagePreview,
          data: {
            type: "message",
            strataId: id,
            resourceId: message.id
          }
        });
        console.log("\u{1F4F1} Push notifications sent to", uniqueRecipientIds.length, "recipients");
      } catch (pushError) {
        console.error("\u26A0\uFE0F Failed to send push notifications:", pushError);
      }
      console.log("\u2705 Successfully created message:", message.id);
      res.json(message);
    } catch (error) {
      console.error("\u274C Error creating message:", error);
      console.error("\u274C Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create message: " + error.message });
    }
  });
  app2.patch("/api/messages/:id/read", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.email || req.user?.email || "master-admin";
      console.log(`\u{1F4D6} Marking message ${id} as read for user ${userId}`);
      await storage.markMessageAsRead(id, userId);
      res.json({ message: "Message marked as read", messageId: id });
    } catch (error) {
      console.error("\u274C Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read: " + error.message });
    }
  });
  app2.delete("/api/conversations/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      await storage.deleteConversation(id, userId);
      res.json({ message: "Conversation deleted successfully" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ message: "Failed to delete conversation" });
    }
  });
  app2.get("/api/strata/:id/announcements", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      console.log("\u{1F4E2} Fetching announcements for strata:", id);
      const hasAccess = await storage.verifyUserStrataAccess(userId, id);
      if (!hasAccess) {
        return res.status(403).json({ message: "Unauthorized access to this strata" });
      }
      const announcements2 = await storage.getStrataAnnouncements(id);
      console.log("\u{1F4E2} Found announcements:", announcements2?.length || 0);
      res.json(announcements2 || []);
    } catch (error) {
      console.error("\u274C Error fetching announcements:", error);
      res.status(500).json({
        message: "Failed to fetch announcements",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.post("/api/strata/:id/announcements", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id: strataId } = req.params;
      const userId = req.user.id;
      const userName = req.user.name || req.user.email;
      console.log("\u{1F4E2} Creating announcement for strata:", strataId);
      const hasAccess = await storage.verifyUserStrataAccess(userId, strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Unauthorized access to this strata" });
      }
      const announcementData = {
        ...req.body,
        strataId,
        authorId: userId,
        authorName: userName,
        views: 0,
        readBy: [],
        isPinned: req.body.isPinned || false,
        isPublic: req.body.isPublic !== void 0 ? req.body.isPublic : true,
        isRecurring: req.body.isRecurring || false,
        priority: req.body.priority || "normal",
        category: req.body.category || "general",
        publishDate: req.body.publishDate || /* @__PURE__ */ new Date()
      };
      const announcement = await storage.createAnnouncement(announcementData);
      console.log("\u2705 Announcement created:", announcement.id);
      try {
        const userAccess = await storage.getStrataUsers(strataId);
        console.log(`\u{1F4EC} Creating announcement notifications for ${userAccess.length} users`);
        for (const userAccessRecord of userAccess) {
          if (userAccessRecord.userId === userId) continue;
          await storage.createNotification({
            userId: userAccessRecord.userId,
            strataId,
            type: "announcement",
            relatedId: announcement.id,
            title: "New Announcement",
            message: `${userName} posted: ${announcement.title}`
          });
        }
        console.log("\u2705 Announcement notifications created");
      } catch (notifError) {
        console.error("\u274C Error creating announcement notifications:", notifError);
      }
      res.status(201).json(announcement);
    } catch (error) {
      console.error("\u274C Error creating announcement:", error);
      res.status(500).json({
        message: "Failed to create announcement",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.patch("/api/announcements/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      console.log("\u{1F4E2} Updating announcement:", id);
      const announcement = await storage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      const hasAccess = await storage.verifyUserStrataAccess(userId, announcement.strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const updatedAnnouncement = await storage.updateAnnouncement(id, req.body);
      console.log("\u2705 Announcement updated:", id);
      res.json(updatedAnnouncement);
    } catch (error) {
      console.error("\u274C Error updating announcement:", error);
      res.status(500).json({
        message: "Failed to update announcement",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.delete("/api/announcements/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      console.log("\u{1F4E2} Deleting announcement:", id);
      const announcement = await storage.getAnnouncement(id);
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      const hasAccess = await storage.verifyUserStrataAccess(userId, announcement.strataId);
      if (!hasAccess) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      await storage.deleteAnnouncement(id);
      console.log("\u2705 Announcement deleted:", id);
      res.json({ message: "Announcement deleted successfully" });
    } catch (error) {
      console.error("\u274C Error deleting announcement:", error);
      res.status(500).json({
        message: "Failed to delete announcement",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.patch("/api/announcements/:id/read", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      console.log("\u{1F4E2} Marking announcement as read:", id, "by user:", userId);
      const announcement = await storage.markAnnouncementAsRead(id, userId);
      console.log("\u2705 Announcement marked as read");
      res.json(announcement);
    } catch (error) {
      console.error("\u274C Error marking announcement as read:", error);
      res.status(500).json({
        message: "Failed to mark announcement as read",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  app2.get("/api/strata/:id/resident-directory", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const directory = await storage.getStrataResidentDirectory(id);
      res.json(directory);
    } catch (error) {
      console.error("Error fetching resident directory:", error);
      res.status(500).json({ message: "Failed to fetch resident directory" });
    }
  });
  app2.post("/api/strata/:id/resident-directory", isAuthenticatedUnified, async (req, res) => {
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
  app2.patch("/api/resident-directory/:id", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const entry = await storage.updateResidentDirectoryEntry(id, req.body);
      res.json(entry);
    } catch (error) {
      console.error("Error updating resident directory entry:", error);
      res.status(500).json({ message: "Failed to update directory entry" });
    }
  });
  app2.get("/api/dismissed-notifications", isAuthenticatedUnified, async (req, res) => {
    try {
      const userId = req.user.id;
      const dismissed = await storage.getUserDismissedNotifications(userId);
      res.json(dismissed);
    } catch (error) {
      console.error("Error fetching dismissed notifications:", error);
      res.status(500).json({ message: "Failed to fetch dismissed notifications" });
    }
  });
  app2.patch("/api/user/password-changed", isAuthenticatedUnified, async (req, res) => {
    try {
      const userEmail = req.user?.email || req.user?.email;
      if (!userEmail) {
        return res.status(400).json({ message: "User email not found" });
      }
      await storage.markPasswordChanged(userEmail);
      res.json({ message: "Password change status updated" });
    } catch (error) {
      console.error("Error updating password change status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/user/must-change-password", isAuthenticatedUnified, async (req, res) => {
    try {
      const userEmail = req.user?.email || req.user?.email;
      if (!userEmail) {
        return res.status(400).json({ message: "User email not found" });
      }
      const user = await storage.getUserByEmail(userEmail);
      res.json({ mustChangePassword: user?.mustChangePassword || false });
    } catch (error) {
      console.error("Error checking password change requirement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/admin/reset-password", isAuthenticatedUnified, isAdmin, async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const passwordHash = await import_bcryptjs2.default.hash(newPassword, 12);
      await storage.updateUser(user.id, { passwordHash, mustChangePassword: true });
      res.json({ message: "Password reset successfully", email });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/dismissed-notifications", isAuthenticatedUnified, async (req, res) => {
    try {
      const userId = req.user.id;
      const notificationData = insertDismissedNotificationSchema.parse({
        ...req.body,
        userId
      });
      const dismissed = await storage.dismissNotification(notificationData);
      res.json(dismissed);
    } catch (error) {
      console.error("Error dismissing notification:", error);
      res.status(500).json({ message: "Failed to dismiss notification" });
    }
  });
  app2.get("/api/strata/:strataId/reports", isAuthenticatedUnified, async (req, res) => {
    try {
      const reports2 = await storage.getStrataReports(req.params.strataId);
      res.json(reports2);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });
  app2.post("/api/strata/:strataId/reports", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      const reportData = {
        ...req.body,
        strataId: req.params.strataId,
        generatedBy: user?.id || user?.email || "unknown",
        status: "pending"
      };
      const report = await storage.createReport(reportData);
      res.json(report);
      const strataId = req.params.strataId;
      const reportId = report.id;
      const reportType = report.reportType;
      const dateRange = report.dateRange;
      setTimeout(async () => {
        try {
          console.log(`\u{1F4CA} Starting ${reportType} report generation for strata ${strataId}, report ID: ${reportId}`);
          await storage.updateReport(reportId, { status: "generating" });
          let content;
          switch (reportType) {
            case "financial":
              const defaultDateRange = {
                start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1e3).toISOString(),
                end: (/* @__PURE__ */ new Date()).toISOString()
              };
              content = await storage.generateFinancialReport(
                strataId,
                dateRange || defaultDateRange
              );
              break;
            case "meeting-minutes":
              content = await storage.generateMeetingMinutesReport(
                strataId,
                dateRange
              );
              break;
            case "home-sale-package":
              content = await storage.generateHomeSalePackage(strataId);
              break;
            case "communications":
              console.log(`\u{1F504} Generating communications report...`);
              content = await storage.generateCommunicationsReport(
                strataId,
                dateRange
              );
              console.log(`\u2705 Communications report content generated:`, {
                announcements: content?.announcements?.length || 0,
                messages: content?.messages?.length || 0
              });
              break;
            case "maintenance":
              content = await storage.generateMaintenanceReport(
                strataId,
                dateRange
              );
              break;
            default:
              console.warn(`\u26A0\uFE0F Unknown report type: ${reportType}`);
              content = { message: "Report generation not implemented for this type" };
          }
          console.log(`\u2705 ${reportType} report generated successfully, updating status to completed`);
          await storage.updateReport(reportId, {
            status: "completed",
            content,
            downloadUrl: `/api/reports/${reportId}/download`,
            generatedAt: /* @__PURE__ */ new Date()
          });
          console.log(`\u2705 Report ${reportId} marked as completed`);
        } catch (error) {
          console.error(`\u274C Error generating ${reportType} report (ID: ${reportId}):`, error);
          console.error(`Error details:`, {
            message: error.message,
            stack: error.stack,
            reportType,
            strataId,
            reportId
          });
          try {
            await storage.updateReport(reportId, {
              status: "failed",
              error: error.message
            });
            console.log(`\u274C Report ${reportId} marked as failed`);
          } catch (updateError) {
            console.error(`\u274C Failed to update report status to failed:`, updateError);
          }
        }
      }, 2e3);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });
  app2.get("/api/reports/:reportId", isAuthenticatedUnified, async (req, res) => {
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
  app2.delete("/api/reports/:reportId", isAuthenticatedUnified, async (req, res) => {
    try {
      await storage.deleteReport(req.params.reportId);
      res.json({ message: "Report deleted successfully" });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ message: "Failed to delete report" });
    }
  });
  app2.get("/api/reports/:reportId/download", isAuthenticatedUnified, async (req, res) => {
    try {
      console.log(`\u{1F4E5} Download request for report: ${req.params.reportId}`);
      console.log(`\u{1F464} User: ${req.user?.email || "unknown"}`);
      const report = await storage.getReport(req.params.reportId);
      if (!report) {
        console.log(`\u274C Report not found: ${req.params.reportId}`);
        return res.status(404).json({ message: "Report not found" });
      }
      if (report.status !== "completed") {
        console.log(`\u274C Report not completed: ${req.params.reportId}, status: ${report.status}`);
        return res.status(404).json({ message: "Report not available for download" });
      }
      console.log(`\u2705 Report found, generating PDF download...`);
      console.log("Report details:", {
        id: report.id,
        title: report.title,
        type: report.reportType,
        status: report.status,
        hasContent: !!report.content
      });
      let strataInfo = null;
      if (report.strataId) {
        try {
          const strata2 = await storage.getStrataById(report.strataId);
          if (strata2) {
            strataInfo = {
              strataName: strata2.name,
              strataUnits: strata2.units?.length || strata2.numUnits || 0,
              strataAddress: strata2.address
            };
          }
        } catch (error) {
          console.warn("Could not fetch strata info for report:", error);
        }
      }
      const { generateReportPDF: generateReportPDF2 } = await Promise.resolve().then(() => (init_pdf_generator(), pdf_generator_exports));
      console.log("\u{1F528} Calling enhanced PDF generator...");
      const pdfBuffer = await generateReportPDF2({
        title: report.title,
        reportType: report.reportType,
        content: report.content,
        generatedAt: report.generatedAt,
        dateRange: report.dateRange,
        ...strataInfo
      });
      if (!pdfBuffer || pdfBuffer.length === 0) {
        console.error("\u274C Generated PDF buffer is empty");
        return res.status(500).json({ message: "Generated PDF is empty" });
      }
      const filename = `${report.title.replace(/[^a-zA-Z0-9 ]/g, "_")}.pdf`;
      console.log(`\u{1F4C4} Sending PDF: ${filename}, size: ${pdfBuffer.length} bytes`);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", pdfBuffer.length.toString());
      res.send(pdfBuffer);
      console.log(`\u2705 PDF download sent successfully`);
    } catch (error) {
      console.error("\u274C Error downloading report:", error);
      console.error("Error stack:", error.stack);
      res.status(500).json({
        message: "Failed to download report",
        error: error.message
      });
    }
  });
  app2.get("/api/strata/:strataId/repair-requests", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const { status, severity, area, submittedBy } = req.query;
      const filters = {};
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
  app2.get("/api/strata/:strataId/repair-requests/stats", isAuthenticatedUnified, async (req, res) => {
    try {
      const { strataId } = req.params;
      const stats = await storage.getRepairRequestStats(strataId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching repair request stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.get("/api/repair-requests/:requestId", isAuthenticatedUnified, async (req, res) => {
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
  app2.post("/api/strata/:strataId/repair-requests", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      const { strataId } = req.params;
      const requestData = {
        ...req.body,
        strataId,
        submittedBy: {
          userId: user.id || user.uid,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
          email: user.email,
          phone: req.body.submittedBy?.phone || user.phone,
          unitNumber: req.body.submittedBy?.unitNumber,
          userRole: user.role || "resident"
        }
      };
      const newRequest = await storage.createRepairRequest(requestData);
      try {
        const userAccess = await storage.getStrataUsers(strataId);
        console.log(`\u{1F4EC} Found ${userAccess.length} users in strata for repair request notification`);
        const admins = userAccess.filter(
          (u) => ["chairperson", "property_manager", "master_admin"].includes(u.role)
        );
        console.log(`\u{1F4EC} Found ${admins.length} admins to notify:`, admins.map((a) => ({ userId: a.userId, role: a.role })));
        for (const admin of admins) {
          console.log(`\u{1F4EC} Creating notification for admin: ${admin.userId}`);
          await storage.createNotification({
            userId: admin.userId,
            strataId,
            type: "repair-request",
            relatedId: newRequest.id,
            title: `New ${newRequest.severity} repair request`,
            message: `${requestData.submittedBy.name} submitted: ${newRequest.title}`
          });
          console.log(`\u2705 Notification created for admin: ${admin.userId}`);
        }
      } catch (notifError) {
        console.error("\u274C Error creating repair request notification:", notifError);
      }
      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Error creating repair request:", error);
      res.status(500).json({ message: "Failed to create repair request" });
    }
  });
  app2.patch("/api/repair-requests/:requestId", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      const { requestId } = req.params;
      const updatedRequest = await storage.updateRepairRequest(
        requestId,
        req.body,
        user.id || user.uid
      );
      if (req.body.status && updatedRequest.submittedBy?.userId) {
        try {
          await storage.createNotification({
            userId: updatedRequest.submittedBy.userId,
            strataId: updatedRequest.strataId,
            type: "repair-request-update",
            relatedId: requestId,
            title: `Repair request ${req.body.status}`,
            message: `Your repair request "${updatedRequest.title}" is now ${req.body.status}`
          });
        } catch (notifError) {
          console.error("Error creating notification:", notifError);
        }
      }
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating repair request:", error);
      res.status(500).json({ message: "Failed to update repair request" });
    }
  });
  app2.delete("/api/repair-requests/:requestId", isAuthenticatedUnified, async (req, res) => {
    try {
      const { requestId } = req.params;
      await storage.deleteRepairRequest(requestId);
      res.json({ message: "Repair request deleted successfully" });
    } catch (error) {
      console.error("Error deleting repair request:", error);
      res.status(500).json({ message: "Failed to delete repair request" });
    }
  });
  app2.post("/api/repair-requests/:requestId/convert-to-maintenance", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      const { requestId } = req.params;
      console.log(`\u{1F504} Converting repair request ${requestId} to maintenance project`);
      const repairRequest = await storage.getRepairRequest(requestId);
      if (!repairRequest) {
        return res.status(404).json({ message: "Repair request not found" });
      }
      const areaToCategory = {
        "common-areas": "other",
        "exterior": "concrete",
        "unit-specific": "other",
        "parking": "parking",
        "landscaping": "landscaping",
        "utilities-hvac": "hvac",
        "roof-structure": "roofing",
        "other": "other"
      };
      const severityToPriority = {
        "emergency": "critical",
        "high": "high",
        "medium": "medium",
        "low": "low"
      };
      const maintenanceProject = {
        title: repairRequest.title,
        description: repairRequest.description,
        category: areaToCategory[repairRequest.area] || "other",
        priority: severityToPriority[repairRequest.severity] || "medium",
        status: "planned",
        estimatedCost: repairRequest.estimatedCost || 0,
        notes: `Converted from repair request. Submitted by: ${repairRequest.submittedBy.name}` + (repairRequest.submittedBy.unitNumber ? ` (Unit ${repairRequest.submittedBy.unitNumber})` : "") + (repairRequest.additionalNotes ? `

Original notes: ${repairRequest.additionalNotes}` : ""),
        strataId: repairRequest.strataId
      };
      const newProject = await storage.createMaintenanceRequest(maintenanceProject);
      console.log(`\u2705 Created maintenance project ${newProject.id}`);
      await storage.updateRepairRequest(
        requestId,
        { status: "planned" },
        user.id || user.uid
      );
      console.log(`\u2705 Updated repair request ${requestId} status to 'planned'`);
      try {
        await storage.createNotification({
          userId: repairRequest.submittedBy.userId,
          strataId: repairRequest.strataId,
          type: "repair-request",
          relatedId: newProject.id,
          title: "Repair request approved",
          message: `Your repair request "${repairRequest.title}" has been converted to a maintenance project and is now in planning.`
        });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
      }
      res.json({
        message: "Repair request converted to maintenance project successfully",
        maintenanceProject: newProject
      });
    } catch (error) {
      console.error("\u274C Error converting repair request to maintenance:", error);
      res.status(500).json({ message: "Failed to convert repair request to maintenance project" });
    }
  });
  app2.post("/api/user/profile", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      const { firstName, lastName, phoneNumber } = req.body;
      await storage.updateUser(user.id, {
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName
      });
      res.json({
        message: "Profile created successfully",
        user: { email: user.email, firstName, lastName, phoneNumber }
      });
    } catch (error) {
      console.error("Failed to create profile:", error);
      res.status(500).json({ message: "Failed to create profile", error: error.message });
    }
  });
  app2.get("/api/user/profile", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      res.json({
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profileImageUrl: user.profileImageUrl || ""
      });
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });
  app2.patch("/api/user/profile", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const { firstName, lastName } = req.body;
      await storage.updateUser(user.id, { firstName, lastName });
      res.json({
        message: "Profile updated successfully"
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/user/notification-settings", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
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
    } catch (error) {
      console.error("Failed to fetch notification settings:", error);
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });
  app2.patch("/api/user/notification-settings", isAuthenticatedUnified, async (req, res) => {
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
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      res.status(500).json({ message: "Failed to update notification settings" });
    }
  });
  app2.post("/api/user/test-notification", isAuthenticatedUnified, async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      console.log(`Test notification sent to user: ${user.email}`);
      res.json({
        message: "Test notification sent successfully"
      });
    } catch (error) {
      console.error("Failed to send test notification:", error);
      res.status(500).json({ message: "Failed to send test notification" });
    }
  });
  app2.post("/api/user/change-password", isAuthenticatedUnified, async (req, res) => {
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
        const valid = await import_bcryptjs2.default.compare(currentPassword, user.passwordHash);
        if (!valid) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }
      }
      const passwordHash = await import_bcryptjs2.default.hash(newPassword, 12);
      await storage.updateUser(user.id, { passwordHash, mustChangePassword: false });
      res.json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("Failed to change password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });
  app2.get("/api/debug/db-data", isAuthenticatedUnified, async (req, res) => {
    try {
      const strataId = "b13712fb-8c41-4d4e-b5b4-a8f196b09716";
      const feeTiers2 = await storage.getStrataFeeTiers(strataId);
      const units2 = await storage.getStrataUnits(strataId);
      res.json({
        feeTiers: feeTiers2 || [],
        units: units2 || [],
        strataId,
        message: "Data retrieved successfully",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("\u274C Failed to get data:", error);
      res.status(500).json({ message: "Failed to get data: " + error.message });
    }
  });
  app2.get("/api/strata/:id/notifications", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      const userEmail = req.user?.email;
      console.log("\u{1F514} Fetching notifications for:", { strataId: id, userEmail });
      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const strataUsers = await storage.getStrataUsers(id);
      const currentUser = strataUsers.find((su) => su.user?.email === userEmail || su.userId === req.user?.id);
      console.log("\u{1F464} Current user lookup:", {
        email: userEmail,
        userId: req.user?.id,
        foundUser: currentUser?.userId || currentUser?.id,
        totalUsers: strataUsers.length
      });
      if (!currentUser) {
        console.log("\u26A0\uFE0F User not found in strata, returning empty notifications");
        return res.json([]);
      }
      const userId = currentUser.userId || currentUser.id;
      const notifications2 = await storage.getUserNotifications(userId, id);
      console.log(`\u2705 Fetched ${notifications2.length} notifications for user ${userId} in strata ${id}`);
      if (notifications2.length > 0) {
        console.log("\u{1F4EC} Sample notification data:", JSON.stringify(notifications2[0], null, 2));
      }
      res.json(notifications2);
    } catch (error) {
      console.error("\u274C Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.patch("/api/notifications/:id/read", isAuthenticatedUnified, async (req, res) => {
    try {
      const { id } = req.params;
      console.log("\u{1F4DD} Marking notification as read:", id);
      await storage.markNotificationAsRead(id);
      console.log("\u2705 Notification marked as read successfully");
      res.json({ success: true });
    } catch (error) {
      console.error("\u274C Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.post("/api/test/meeting-invitation", isAuthenticatedUnified, async (req, res) => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      const user = await storage.getUserByEmail(userEmail);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const notificationData = {
        userId: user.id,
        strataId: "b13712fb-8c41-4d4e-b5b4-a8f196b09716",
        // The Gables strata ID
        type: "meeting_invitation",
        title: "Meeting Invitation: Monthly Strata Council",
        message: "You've been invited to the monthly strata council meeting",
        isRead: false,
        priority: "high",
        metadata: {
          meetingTitle: "Monthly Strata Council Meeting",
          meetingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
          // Next week
          location: "Community Room, Main Building",
          organizer: "VibeStrat System",
          type: "council_meeting"
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
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
  const httpServer = (0, import_http.createServer)(app2);
  return httpServer;
}

// api/_index.src.ts
var app = (0, import_express2.default)();
var allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : ["http://localhost:5000", "http://localhost:3000"];
app.use((0, import_cors.default)({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith(".vercel.app") || process.env.NODE_ENV === "development") {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use((req, res, next) => {
  if (req.path.includes("/documents") && req.method === "POST") {
    return next();
  }
  import_express2.default.json({ limit: "50mb" })(req, res, (err) => {
    if (err) return res.status(400).json({ message: "Invalid JSON" });
    next();
  });
});
app.use((req, res, next) => {
  if (req.path.includes("/documents") && req.method === "POST") {
    return next();
  }
  import_express2.default.urlencoded({ extended: false, limit: "50mb" })(req, res, (err) => {
    if (err) return res.status(400).json({ message: "Invalid form data" });
    next();
  });
});
var initPromise = (async () => {
  await registerRoutes(app);
})();
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
});
async function handler(req, res) {
  await initPromise;
  return app(req, res);
}
