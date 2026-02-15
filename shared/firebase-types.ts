import { Timestamp } from "firebase/firestore";

// Base types for Firebase collections
export interface BaseFirebaseDocument {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// User document structure for Firebase
export interface FirebaseUser extends BaseFirebaseDocument {
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isActive: boolean;
  lastLoginAt?: Timestamp;
  role: "admin" | "chairperson" | "treasurer" | "secretary" | "council_member" | "property_manager" | "resident";
  
  // User preferences and settings
  preferences?: {
    notifications: boolean;
    emailAlerts: boolean;
    theme: "light" | "dark" | "system";
  };
}

// Strata document structure for Firebase
export interface FirebaseStrata extends BaseFirebaseDocument {
  name: string;
  address: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country: string;
  phoneNumber?: string;
  email?: string;
  unitCount: number;
  corporationNumber?: string;
  incorporationDate?: Timestamp;
  managementCompany?: string;
  managementContactName?: string;
  managementContactEmail?: string;
  managementContactPhone?: string;
  bylawsUrl?: string;
  feeStructure?: {
    tiers: Array<{
      id: string;
      name: string;
      monthlyFee: number;
      description?: string;
    }>;
  };
  status: "active" | "inactive" | "archived";
  notes?: string;
  
  // Subscription fields
  subscription: {
    status: "trial" | "active" | "cancelled" | "expired" | "free";
    tier: "standard" | "premium" | "free";
    monthlyRate: number;
    trialStartDate?: Timestamp;
    trialEndDate?: Timestamp;
    subscriptionStartDate?: Timestamp;
    subscriptionEndDate?: Timestamp;
    lastPaymentDate?: Timestamp;
    nextPaymentDate?: Timestamp;
    isFreeForever: boolean;
  };
  
  createdBy: string;
}

// User-Strata access subcollection
export interface FirebaseUserStrataAccess extends BaseFirebaseDocument {
  userId: string;
  role: "chairperson" | "treasurer" | "secretary" | "council_member" | "property_manager" | "resident";
  canPostAnnouncements: boolean;
  permissions?: {
    canViewFinancials: boolean;
    canApproveExpenses: boolean;
    canManageUsers: boolean;
    canScheduleMeetings: boolean;
  };
}

// Unit subcollection under Strata
export interface FirebaseUnit extends BaseFirebaseDocument {
  unitNumber: string;
  unitType?: string;
  feeTierId?: string;
  owner?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  squareFootage?: number;
  balconySize?: number;
  parkingSpaces: number;
}

// Vendor document structure
export interface FirebaseVendor extends BaseFirebaseDocument {
  name: string;
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  serviceCategories: string[];
  rating?: number;
  businessLicense?: string;
  insurance?: {
    provider?: string;
    policyNumber?: string;
    expiryDate?: Timestamp;
    coverageAmount?: number;
  };
  emergencyContact?: string;
  isPreferred: boolean;
  notes?: string;
}

// Vendor Contract subcollection under Strata
export interface FirebaseVendorContract extends BaseFirebaseDocument {
  vendorId: string;
  vendorName: string; // Denormalized for performance
  contractName: string;
  description?: string;
  contractDocument?: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  autoRenew: boolean;
  renewalTerms?: string;
  cost: {
    amount: number;
    frequency: "monthly" | "quarterly" | "annually" | "one-time";
  };
  paymentTerms?: string;
  serviceScope?: string;
  status: "active" | "expired" | "cancelled" | "pending";
  createdBy: string;
}

// Expense subcollection under Strata
export interface FirebaseExpense extends BaseFirebaseDocument {
  vendorId?: string;
  vendorName?: string; // Denormalized
  amount: number;
  description: string;
  category?: string;
  isRecurring: boolean;
  expenseDate: Timestamp;
  recurringFrequency?: "weekly" | "monthly" | "annually";
  status: "pending" | "approved" | "rejected" | "paid";
  attachedReceipts?: string[];
  submittedBy: string;
  submittedByName?: string; // Denormalized
  approvedBy?: string;
  approvedByName?: string; // Denormalized
  approvalDate?: Timestamp;
}

// Quote subcollection under Strata
export interface FirebaseQuote extends BaseFirebaseDocument {
  vendorId?: string;
  vendorName?: string; // Denormalized
  expenseId?: string;
  requesterId: string;
  requesterName?: string; // Denormalized
  
  // Quote details
  projectTitle: string;
  projectType: string;
  description: string;
  scope?: string;
  amount: number;
  
  // Vendor details (for new vendors)
  vendorDetails?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    licenseNumber?: string;
    hasLiabilityInsurance: boolean;
  };
  
  // Timeline
  startDate?: Timestamp;
  estimatedCompletion?: Timestamp;
  validUntil?: Timestamp;
  
  // Terms
  warranty?: string;
  paymentTerms?: string;
  notes?: string;
  
  // Quote status and workflow
  status: "pending" | "approved" | "rejected" | "expired";
  approvedBy?: string;
  approvedByName?: string; // Denormalized
  rejectionReason?: string;
  attachments?: string[];
}

// Meeting subcollection under Strata
export interface FirebaseMeeting extends BaseFirebaseDocument {
  title: string;
  description?: string;
  meetingType: "AGM" | "council" | "emergency" | "general" | "committee";
  scheduledAt: Timestamp;
  duration?: number; // in minutes
  location?: string;
  isVirtual: boolean;
  meetingLink?: string;
  
  agenda?: Array<{
    id: string;
    title: string;
    description?: string;
    duration?: number;
    presenter?: string;
  }>;
  
  invitees: Array<{
    userId: string;
    userName: string; // Denormalized
    email: string;
    status: "pending" | "accepted" | "declined" | "maybe";
    respondedAt?: Timestamp;
  }>;
  
  // Meeting outcomes
  minutes?: string;
  audioRecording?: string;
  transcription?: string;
  decisions?: Array<{
    title: string;
    description: string;
    votesFor: number;
    votesAgainst: number;
    abstentions: number;
    passed: boolean;
  }>;
  
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  organizedBy: string;
  organizerName?: string; // Denormalized
}

// Document subcollection under Strata
export interface FirebaseDocumentFile extends BaseFirebaseDocument {
  name: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  folderId?: string;
  folderPath?: string; // Denormalized for easy querying
  isPublic: boolean;
  tags?: string[];
  uploadedBy: string;
  uploaderName?: string; // Denormalized
}

// Document Folder subcollection under Strata
export interface FirebaseDocumentFolder extends BaseFirebaseDocument {
  name: string;
  description?: string;
  parentFolderId?: string;
  path: string; // Full path for easy navigation
  isPublic: boolean;
  createdBy: string;
  creatorName?: string; // Denormalized
}

// Announcement subcollection under Strata
export interface FirebaseAnnouncement extends BaseFirebaseDocument {
  title: string;
  content: string;
  category: "general" | "financial" | "maintenance" | "emergency" | "social" | "governance";
  priority: "low" | "normal" | "high" | "urgent";
  isPublic: boolean;
  isPinned: boolean;
  
  // Scheduling
  publishDate: Timestamp;
  expiryDate?: Timestamp;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: Timestamp;
  };
  
  attachments?: string[];
  authorId: string;
  authorName?: string; // Denormalized
  
  // Engagement tracking
  views: number;
  readBy?: string[]; // Array of user IDs who have read
}

// Message subcollection under Strata
export interface FirebaseMessage extends BaseFirebaseDocument {
  senderId: string;
  senderName: string; // Denormalized
  recipientIds: string[];
  recipientNames: string[]; // Denormalized
  subject?: string;
  content: string;
  isGroupChat: boolean;
  attachments?: string[];
  
  // Message status
  readBy: Array<{
    userId: string;
    readAt: Timestamp;
  }>;
  
  // Thread information
  threadId?: string;
  replyToId?: string;
}

// Notification subcollection under Strata
export interface FirebaseNotification extends BaseFirebaseDocument {
  userId: string;
  title: string;
  message: string;
  type: "message" | "announcement" | "expense" | "quote" | "meeting" | "system";
  isRead: boolean;
  readAt?: Timestamp;
  
  // Related document references
  relatedDocument?: {
    collection: string;
    id: string;
  };
  
  // Action buttons
  actions?: Array<{
    label: string;
    action: string;
    url?: string;
  }>;
}

// Fund subcollection under Strata
export interface FirebaseFund extends BaseFirebaseDocument {
  name: string;
  description?: string;
  fundType: "reserve" | "contingency" | "operating" | "special";
  currentBalance: number;
  targetAmount?: number;
  interestRate?: number;
  
  // Fund rules
  minimumBalance?: number;
  allowWithdrawals: boolean;
  requiresApproval: boolean;
  
  // Financial institution details
  accountNumber?: string;
  institutionName?: string;
  accountType?: string;
}

// Fund Transaction subcollection under Fund
export interface FirebaseFundTransaction extends BaseFirebaseDocument {
  fundId: string;
  fundName: string; // Denormalized
  transactionType: "deposit" | "withdrawal" | "transfer" | "interest";
  amount: number;
  description: string;
  referenceNumber?: string;
  
  // Related documents
  relatedExpenseId?: string;
  relatedQuoteId?: string;
  
  // Approval workflow
  requestedBy: string;
  requesterName?: string; // Denormalized
  approvedBy?: string;
  approverName?: string; // Denormalized
  status: "pending" | "approved" | "rejected" | "completed";
  
  transactionDate: Timestamp;
  balanceAfter: number;
}

// Payment Reminder subcollection under Strata
export interface FirebasePaymentReminder extends BaseFirebaseDocument {
  title: string;
  description?: string;
  amount?: number;
  dueDate: Timestamp;
  reminderType: "Monthly Strata Fee" | "Special Assessment" | "Other";
  
  // Targeting
  unitIds?: string[]; // Specific units, if empty then all units
  unitNumbers?: string[]; // Denormalized for display
  
  // Recurring settings
  isRecurring: boolean;
  recurringPattern?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: Timestamp;
  };
  
  priority: "low" | "normal" | "high";
  isAutoSend: boolean;
  
  // Tracking
  sentCount: number;
  lastSentDate?: Timestamp;
  nextSendDate?: Timestamp;
  
  createdBy: string;
  creatorName?: string; // Denormalized
}

// Report subcollection under Strata
export interface FirebaseReport extends BaseFirebaseDocument {
  title: string;
  reportType: "financial" | "meeting_minutes" | "communications" | "maintenance" | "home_sale_package";
  description?: string;
  
  // Report parameters
  dateRange: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  
  filters?: {
    includeExpenses?: boolean;
    includeIncome?: boolean;
    includeMeetings?: boolean;
    includeAnnouncements?: boolean;
    includeDocuments?: boolean;
    specificMeetingIds?: string[];
    specificCategories?: string[];
  };
  
  // Generated report data
  fileUrl?: string;
  fileName?: string;
  fileFormat: "pdf" | "excel" | "html";
  fileSize?: number;
  
  status: "generating" | "completed" | "failed";
  generatedBy: string;
  generatorName?: string; // Denormalized
  
  // Distribution
  emailedTo?: string[];
  downloadCount: number;
}

// Pending Strata Registration collection (root level)
export interface FirebasePendingRegistration extends BaseFirebaseDocument {
  // Organization details
  strataName: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  unitCount: number;
  managementType: "self_managed" | "professionally_managed";
  managementCompany?: string;
  description: string;
  specialRequirements?: string;
  
  // Admin contact details
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPhone: string;
  
  // Registration status
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  approvalNotes?: string;
  rejectionReason?: string;
}

// Real-time presence tracking
export interface FirebasePresence {
  userId: string;
  userName: string;
  isOnline: boolean;
  lastSeen: Timestamp;
  currentPage?: string;
  strataId?: string;
}

// Repair Request Enums
export type RepairRequestArea =
  | 'common-areas'
  | 'exterior'
  | 'unit-specific'
  | 'parking'
  | 'landscaping'
  | 'utilities-hvac'
  | 'roof-structure'
  | 'other';

export type RepairRequestSeverity = 'low' | 'medium' | 'high' | 'emergency';

export type RepairRequestStatus =
  | 'suggested'
  | 'approved'
  | 'planned'
  | 'scheduled'
  | 'in-progress'
  | 'completed'
  | 'rejected';

// Repair Request document structure
export interface FirebaseRepairRequest extends BaseFirebaseDocument {
  strataId: string;

  // Submitter information
  submittedBy: {
    userId: string;
    name: string;
    email: string;
    phone?: string;
    unitNumber?: string;
    userRole: string;
  };

  // Submission details
  title: string;
  description: string;
  area: RepairRequestArea;
  severity: RepairRequestSeverity;
  estimatedCost: number;
  costJustification?: string;
  photos?: string[]; // Array of file URLs
  additionalNotes?: string;

  // Workflow
  status: RepairRequestStatus;
  statusHistory: Array<{
    status: RepairRequestStatus;
    changedBy: string;
    changedAt: Timestamp;
    reason?: string;
  }>;

  // Admin fields
  internalNotes?: string;
  approvedBy?: string;
  approvedAt?: Timestamp;
  rejectedBy?: string;
  rejectedAt?: Timestamp;
  rejectionReason?: string;
  assignedContractor?: string; // Vendor ID
  contractorNotes?: string;

  // Financial tracking
  actualCost?: number;
  costTrackingNotes?: string;
  invoiceReference?: string;

  // Timeline
  scheduledDate?: Timestamp;
  completedDate?: Timestamp;

  // Contact preferences
  bestTimeToContact?: string;
}

// Firebase collection paths
export const COLLECTIONS = {
  USERS: 'users',
  STRATA: 'strata',
  VENDORS: 'vendors',
  PENDING_REGISTRATIONS: 'pendingRegistrations',
  PRESENCE: 'presence',

  // Subcollections (under strata)
  UNITS: 'units',
  USER_ACCESS: 'userAccess',
  VENDOR_CONTRACTS: 'vendorContracts',
  EXPENSES: 'expenses',
  QUOTES: 'quotes',
  MEETINGS: 'meetings',
  DOCUMENTS: 'documents',
  DOCUMENT_FOLDERS: 'documentFolders',
  ANNOUNCEMENTS: 'announcements',
  MESSAGES: 'messages',
  NOTIFICATIONS: 'notifications',
  FUNDS: 'funds',
  PAYMENT_REMINDERS: 'paymentReminders',
  REPORTS: 'reports',
  REPAIR_REQUESTS: 'repairRequests',

  // Subcollections under funds
  FUND_TRANSACTIONS: 'transactions',
} as const;