import type {
  User, InsertUser,
  Strata, InsertStrata,
  UserStrataAccess, InsertUserStrataAccess,
  Unit, InsertUnit,
  Expense,
  Vendor, InsertVendor,
  Quote,
  Meeting, InsertMeeting,
  MaintenanceRequest,
  Message, InsertMessage,
  Notification, InsertNotification,
} from '@shared/schema';

export interface IStorage {
  // ===== USER OPERATIONS =====
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(userData: InsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  setMustChangePassword(email: string): Promise<void>;
  getUsersByStrata(strataId: string): Promise<User[]>;

  // ===== STRATA OPERATIONS =====
  getStrata(id: string): Promise<Strata | undefined>;
  getAllStrata(): Promise<Strata[]>;
  createStrata(strataData: InsertStrata): Promise<Strata>;
  updateStrata(id: string, strataData: Partial<InsertStrata>): Promise<Strata>;
  deleteStrata(id: string): Promise<void>;
  getUserStrata(userId: string): Promise<Strata[]>;

  // ===== USER STRATA ACCESS OPERATIONS =====
  getUserStrataAccess(userId: string, strataId: string): Promise<UserStrataAccess | undefined>;
  createUserStrataAccess(accessData: InsertUserStrataAccess): Promise<UserStrataAccess>;
  deleteUserStrataAccess(accessId: string): Promise<void>;
  updateUserStrataRole(userId: string, strataId: string, role: string): Promise<UserStrataAccess | undefined>;
  getStrataUsers(strataId: string): Promise<any[]>;
  getUserStrataAssignments(userId: string): Promise<any[]>;
  checkUserStrataAdminAccess(userId: string, strataId: string): Promise<boolean>;
  updateUserStrataAccess(accessId: string, updateData: any): Promise<any>;

  // ===== UNIT OPERATIONS =====
  createUnit(unitData: InsertUnit): Promise<Unit>;
  getStrataUnits(strataId: string): Promise<Unit[]>;
  updateUnit(unitId: string, updates: Partial<Unit>): Promise<Unit>;
  deleteUnit(unitId: string): Promise<void>;

  // ===== EXPENSE OPERATIONS =====
  getStrataExpenses(strataId: string): Promise<any[]>;
  createExpense(expenseData: any): Promise<any>;
  updateExpense(expenseId: string, updateData: any): Promise<any>;
  deleteExpense(expenseId: string): Promise<void>;

  // ===== VENDOR OPERATIONS =====
  getVendor(id: string): Promise<Vendor | undefined>;
  getVendorsByStrata(strataId: string): Promise<Vendor[]>;
  getAllVendors(): Promise<Vendor[]>;
  createVendor(vendorData: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendorData: Partial<InsertVendor>): Promise<Vendor>;
  deleteVendor(id: string): Promise<void>;

  // ===== VENDOR CONTRACT OPERATIONS =====
  getVendorContracts(vendorId: string): Promise<any[]>;
  createVendorContract(contractData: any): Promise<any>;
  updateVendorContract(contractId: string, updateData: any): Promise<any>;
  deleteVendorContract(contractId: string): Promise<void>;

  // ===== VENDOR HISTORY OPERATIONS =====
  getVendorHistory(vendorId: string): Promise<any[]>;
  createVendorHistory(historyData: any): Promise<any>;
  updateVendorHistory(historyId: string, updateData: any): Promise<any>;
  deleteVendorHistory(historyId: string): Promise<void>;

  // ===== QUOTE OPERATIONS =====
  getStrataQuotes(strataId: string): Promise<Quote[]>;
  createQuote(quoteData: any): Promise<any>;
  updateQuote(quoteId: string, updateData: any): Promise<any>;
  createQuoteProjectFolder(strataId: string, projectTitle: string, createdBy: string): Promise<any>;

  // ===== FEE TIER OPERATIONS =====
  getStrataFeeTiers(strataId: string): Promise<any[]>;
  createFeeTier(feeTierData: any): Promise<any>;
  updateFeeTier(feeTierId: string, updates: any): Promise<any>;
  deleteFeeTier(feeTierId: string): Promise<void>;

  // ===== DOCUMENT FOLDER OPERATIONS =====
  getStrataDocumentFolders(strataId: string, parentFolderId?: string): Promise<any[]>;
  createDocumentFolder(folderData: any): Promise<any>;
  updateDocumentFolder(folderId: string, updates: any): Promise<any>;
  deleteDocumentFolder(folderId: string): Promise<void>;
  getDocumentFolder(folderId: string): Promise<any>;
  searchDocumentFolders(strataId: string, searchTerm: string): Promise<any[]>;

  // ===== DOCUMENT OPERATIONS =====
  getStrataDocuments(strataId: string): Promise<any[]>;
  getFolderDocuments(folderId: string): Promise<any[]>;
  searchDocuments(strataId: string, searchTerm: string): Promise<any[]>;
  createDocument(documentData: any): Promise<any>;
  updateDocument(documentId: string, updates: any): Promise<any>;
  deleteDocument(documentId: string): Promise<void>;

  // ===== MESSAGE OPERATIONS =====
  getStrataMessages(strataId: string, userId: string): Promise<Message[]>;
  getMessagesByStrata(strataId: string): Promise<Message[]>;
  createMessage(messageData: InsertMessage): Promise<Message>;
  deleteConversation(conversationId: string, userId: string): Promise<void>;
  markMessageAsRead(messageId: string, userId: string): Promise<void>;

  // ===== ANNOUNCEMENT OPERATIONS =====
  getStrataAnnouncements(strataId: string): Promise<any[]>;
  getAnnouncement(announcementId: string): Promise<any>;
  createAnnouncement(data: any): Promise<any>;
  updateAnnouncement(announcementId: string, data: any): Promise<any>;
  deleteAnnouncement(announcementId: string): Promise<void>;
  markAnnouncementAsRead(announcementId: string, userId: string): Promise<any>;

  // ===== NOTIFICATION OPERATIONS =====
  getDismissedNotifications(strataId: string, userId: string): Promise<Notification[]>;
  createNotification(notificationData: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, strataId?: string): Promise<any[]>;
  markNotificationAsRead(notificationId: string): Promise<any>;
  getUserDismissedNotifications(userId: string): Promise<any[]>;
  dismissNotification(notificationData: any): Promise<any>;

  // ===== MEETING OPERATIONS =====
  getStrataMeetings(strataId: string): Promise<Meeting[]>;
  createMeeting(meetingData: InsertMeeting): Promise<Meeting>;
  getMeeting(meetingId: string): Promise<Meeting | undefined>;
  updateMeeting(meetingId: string, updates: any): Promise<Meeting>;
  deleteMeeting(meetingId: string): Promise<void>;

  // ===== MAINTENANCE REQUEST OPERATIONS =====
  getStrataMaintenanceRequests(strataId: string): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(requestData: any): Promise<any>;
  updateMaintenanceRequest(requestId: string, updateData: any): Promise<any>;

  // ===== MAINTENANCE PROJECT OPERATIONS =====
  createMaintenanceProject(projectData: any): Promise<any>;
  updateMaintenanceProject(projectId: string, updateData: any): Promise<any>;
  deleteMaintenanceProject(projectId: string): Promise<void>;

  // ===== REPAIR REQUEST OPERATIONS =====
  getRepairRequests(strataId: string, filters?: {
    status?: string;
    severity?: string;
    area?: string;
    submittedBy?: string;
  }): Promise<any[]>;
  getRepairRequest(id: string): Promise<any | null>;
  createRepairRequest(requestData: any): Promise<any>;
  updateRepairRequest(id: string, updates: any, userId: string): Promise<any>;
  deleteRepairRequest(id: string): Promise<void>;
  getRepairRequestStats(strataId: string): Promise<any>;

  // ===== FUND OPERATIONS =====
  getStrataFunds(strataId: string): Promise<any[]>;
  createFund(data: any): Promise<any>;
  updateFund(fundId: string, data: any): Promise<any>;
  deleteFund(fundId: string): Promise<void>;
  createFundTransaction(data: any): Promise<any>;

  // ===== PAYMENT REMINDER OPERATIONS =====
  getStrataPaymentReminders(strataId: string): Promise<any[]>;
  createPaymentReminder(reminderData: any): Promise<any>;
  updatePaymentReminder(reminderId: string, updateData: any): Promise<any>;
  deletePaymentReminder(reminderId: string): Promise<void>;

  // ===== REPORT OPERATIONS =====
  getStrataReports(strataId: string): Promise<any[]>;
  createReport(reportData: any): Promise<any>;
  getReport(reportId: string): Promise<any>;
  updateReport(reportId: string, updates: any): Promise<any>;
  deleteReport(reportId: string): Promise<void>;
  generateFinancialReport(strataId: string, dateRange: { start: string; end: string }): Promise<any>;
  generateMeetingMinutesReport(strataId: string, dateRange?: { start: string; end: string }): Promise<any>;
  generateCommunicationsReport(strataId: string, dateRange?: { start: string; end: string }): Promise<any>;
  generateMaintenanceReport(strataId: string, dateRange?: { start: string; end: string }): Promise<any>;
  generateHomeSalePackage(strataId: string): Promise<any>;

  // ===== RESIDENT DIRECTORY OPERATIONS =====
  getStrataResidentDirectory(strataId: string): Promise<any[]>;
  createResidentDirectoryEntry(entryData: any): Promise<any>;
  updateResidentDirectoryEntry(id: string, updates: any): Promise<any>;

  // ===== PENDING REGISTRATION OPERATIONS =====
  createPendingRegistration(registrationData: any): Promise<any>;

  // ===== ADMIN / METRICS OPERATIONS =====
  getStrataMetrics(strataId: string): Promise<any>;
  getPendingApprovals(strataId: string): Promise<any[]>;
}
