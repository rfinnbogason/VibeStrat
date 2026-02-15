import {
  users,
  strata,
  units,
  vendors,
  vendorContracts,
  vendorHistory,
  expenses,
  quotes,
  meetings,
  documents,
  documentFolders,
  maintenanceRequests,
  maintenanceProjects,
  announcements,
  userStrataAccess,
  funds,
  fundTransactions,
  pendingStrataRegistrations,
  messages,
  residentDirectory,
  notifications,
  dismissedNotifications,
  paymentReminders,
  reports,
  type User,
  type UpsertUser,
  type Strata,
  type Unit,
  type Vendor,
  type VendorContract,
  type VendorHistory,
  type Expense,
  type Quote,
  type Meeting,
  type Document,
  type DocumentFolder,
  type MaintenanceRequest,
  type MaintenanceProject,
  type Announcement,
  type UserStrataAccess,
  type UserStrataAccessWithUser,
  type Fund,
  type FundTransaction,
  type Message,
  type ResidentDirectory,
  type Notification,
  type DismissedNotification,
  type PaymentReminder,
  type Report,
  type InsertStrata,
  type InsertUnit,
  type InsertVendor,
  type InsertVendorContract,
  type InsertVendorHistory,
  type InsertExpense,
  type InsertQuote,
  type InsertMeeting,
  type InsertDocument,
  type InsertDocumentFolder,
  type InsertMaintenanceRequest,
  type InsertMaintenanceProject,
  type InsertAnnouncement,
  type InsertUserStrataAccess,
  type InsertFund,
  type InsertFundTransaction,
  type InsertMessage,
  type InsertResidentDirectory,
  type InsertNotification,
  type InsertDismissedNotification,
  type InsertPaymentReminder,
  type InsertReport,
  type PendingStrataRegistration,
  type InsertPendingStrataRegistration,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql, or, lt, ne, isNull, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUser(user: Omit<UpsertUser, 'id'>): Promise<User>;
  updateUser(id: string, userData: Partial<Omit<UpsertUser, 'id'>>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  getAllStrata(): Promise<Strata[]>;
  
  // Strata operations
  getUserStrata(userId: string): Promise<Strata[]>;
  getStrata(id: string): Promise<Strata | undefined>;
  createStrata(strata: InsertStrata): Promise<Strata>;
  updateStrata(id: string, strata: Partial<InsertStrata>): Promise<Strata>;
  
  // Unit operations
  getStrataUnits(strataId: string): Promise<Unit[]>;
  createUnit(unit: InsertUnit): Promise<Unit>;
  updateUnit(id: string, unit: Partial<InsertUnit>): Promise<Unit>;
  
  // User access management
  getUserStrataAccess(userId: string, strataId: string): Promise<UserStrataAccess | undefined>;
  getAllUserStrataAccess(userId: string): Promise<UserStrataAccess[]>;
  createUserStrataAccess(access: InsertUserStrataAccess): Promise<UserStrataAccess>;
  getStrataUsers(strataId: string): Promise<any[]>;
  updateUserStrataAccess(id: string, access: Partial<InsertUserStrataAccess>): Promise<UserStrataAccess>;
  deleteUserStrataAccess(id: string): Promise<void>;
  
  // Vendor operations
  getAllVendors(): Promise<Vendor[]>;
  getVendorsByStrata(strataId: string): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, vendor: Partial<InsertVendor>): Promise<Vendor>;
  deleteVendor(id: string): Promise<void>;
  
  // Vendor contract operations
  getVendorContracts(vendorId: string): Promise<VendorContract[]>;
  getStrataVendorContracts(strataId: string): Promise<VendorContract[]>;
  getVendorContract(id: string): Promise<VendorContract | undefined>;
  createVendorContract(contract: InsertVendorContract): Promise<VendorContract>;
  updateVendorContract(id: string, contract: Partial<InsertVendorContract>): Promise<VendorContract>;
  deleteVendorContract(id: string): Promise<void>;
  
  // Vendor history operations
  getVendorHistory(vendorId: string): Promise<VendorHistory[]>;
  getStrataVendorHistory(strataId: string): Promise<VendorHistory[]>;
  createVendorHistory(history: InsertVendorHistory): Promise<VendorHistory>;
  updateVendorHistory(id: string, history: Partial<InsertVendorHistory>): Promise<VendorHistory>;
  deleteVendorHistory(id: string): Promise<void>;
  
  // Expense operations
  getStrataExpenses(strataId: string): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  
  // Quote operations
  getStrataQuotes(strataId: string): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote>;
  getPendingApprovals(strataId: string): Promise<(Quote & Expense)[]>;
  
  // Meeting operations
  getStrataMeetings(strataId: string): Promise<Meeting[]>;
  getMeeting(id: string): Promise<Meeting | undefined>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: string, meeting: Partial<InsertMeeting>): Promise<Meeting>;
  
  // Document operations
  getStrataDocuments(strataId: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, document: Partial<InsertDocument>): Promise<Document>;
  
  // Maintenance operations
  getStrataMaintenanceRequests(strataId: string): Promise<MaintenanceRequest[]>;
  getMaintenanceRequest(id: string): Promise<MaintenanceRequest | undefined>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: string, request: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest>;
  
  // Maintenance Project operations
  getStrataMaintenanceProjects(strataId: string): Promise<MaintenanceProject[]>;
  getMaintenanceProject(id: string): Promise<MaintenanceProject | undefined>;
  createMaintenanceProject(project: InsertMaintenanceProject): Promise<MaintenanceProject>;
  updateMaintenanceProject(id: string, project: Partial<InsertMaintenanceProject>): Promise<MaintenanceProject>;
  deleteMaintenanceProject(id: string): Promise<void>;
  
  // Communication operations
  getStrataAnnouncements(strataId: string): Promise<Announcement[]>;
  getAnnouncement(id: string): Promise<Announcement | undefined>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  updateAnnouncement(id: string, announcement: Partial<InsertAnnouncement>): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;
  
  // Dashboard metrics
  getStrataMetrics(strataId: string): Promise<{
    totalProperties: number;
    outstandingFees: string;
    pendingApprovals: number;
    openMaintenance: number;
  }>;
  
  // Fund operations
  getStrataFunds(strataId: string): Promise<Fund[]>;
  getFund(id: string): Promise<Fund | undefined>;
  createFund(fund: InsertFund): Promise<Fund>;
  updateFund(id: string, fund: Partial<InsertFund>): Promise<Fund>;
  deleteFund(id: string): Promise<void>;
  
  // Fund transaction operations
  getFundTransactions(fundId: string): Promise<FundTransaction[]>;
  createFundTransaction(transaction: InsertFundTransaction): Promise<FundTransaction>;
  updateFundTransaction(id: string, transaction: Partial<InsertFundTransaction>): Promise<FundTransaction>;
  deleteFundTransaction(id: string): Promise<void>;
  
  // Pending strata registration operations
  getAllPendingRegistrations(): Promise<PendingStrataRegistration[]>;
  getPendingRegistrations(): Promise<PendingStrataRegistration[]>;
  getPendingRegistration(id: string): Promise<PendingStrataRegistration | undefined>;
  createPendingRegistration(registration: InsertPendingStrataRegistration): Promise<PendingStrataRegistration>;
  updatePendingRegistration(id: string, updates: Partial<PendingStrataRegistration>): Promise<PendingStrataRegistration>;
  approvePendingRegistration(id: string, approvedBy: string): Promise<{ strata: Strata; user: User }>;
  rejectPendingRegistration(id: string, rejectedBy: string, reason: string): Promise<PendingStrataRegistration>;
  approveStrataRegistration(id: string, subscriptionData?: any): Promise<{ strata: Strata; user: User }>;
  rejectStrataRegistration(id: string): Promise<PendingStrataRegistration>;
  
  // Strata admin helper methods
  checkUserStrataAdminAccess(userId: string, strataId: string): Promise<boolean>;
  getUserStrataAccessById(accessId: string): Promise<UserStrataAccess | undefined>;
  getUserStrataAssignments(userId: string): Promise<UserStrataAccess[]>;
  removeUserFromAllStrata(userId: string): Promise<void>;
  updateUserStrataRole(userId: string, strataId: string, role: string): Promise<UserStrataAccess | undefined>;
  removeUserStrataAccess(accessId: string): Promise<void>;
  
  // Subscription management
  updateStrataSubscription(strataId: string, subscriptionData: Partial<Pick<Strata, 'subscriptionStatus' | 'subscriptionTier' | 'monthlyRate' | 'isFreeForever' | 'trialStartDate' | 'trialEndDate' | 'subscriptionStartDate' | 'subscriptionEndDate'>>): Promise<void>;
  
  // Fund calculations
  calculateFundProjections(fundId: string, years: number): Promise<{
    currentBalance: number;
    projectedBalance: number;
    totalInterest: number;
    monthlyProjections: Array<{
      month: number;
      balance: number;
      interest: number;
    }>;
  }>;

  // Quote operations
  getStrataQuotes(strataId: string): Promise<Quote[]>;
  getQuote(id: string): Promise<Quote | undefined>;
  createQuote(quoteData: InsertQuote): Promise<Quote>;
  updateQuote(id: string, updates: Partial<Quote>): Promise<Quote>;
  deleteQuote(id: string): Promise<void>;
  
  // Message operations
  getStrataMessages(strataId: string, userId: string): Promise<Message[]>;
  createMessage(messageData: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: string): Promise<Message>;
  deleteConversation(conversationId: string, userId: string): Promise<void>;
  
  // Resident Directory operations
  getStrataResidentDirectory(strataId: string): Promise<ResidentDirectory[]>;
  createResidentDirectoryEntry(entryData: InsertResidentDirectory): Promise<ResidentDirectory>;
  updateResidentDirectoryEntry(id: string, updates: Partial<InsertResidentDirectory>): Promise<ResidentDirectory>;
  
  // Notification operations
  getUserNotifications(userId: string, strataId: string): Promise<Notification[]>;
  createNotification(notificationData: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: string): Promise<Notification>;
  
  // Dismissed Notifications operations
  getUserDismissedNotifications(userId: string): Promise<DismissedNotification[]>;
  dismissNotification(notificationData: InsertDismissedNotification): Promise<DismissedNotification>;
  
  // Reports operations
  getStrataReports(strataId: string): Promise<Report[]>;
  getReport(id: string): Promise<Report | undefined>;
  createReport(reportData: InsertReport): Promise<Report>;
  updateReport(id: string, updates: Partial<Report>): Promise<Report>;
  deleteReport(id: string): Promise<void>;
  generateFinancialReport(strataId: string, dateRange: { start: string, end: string }): Promise<any>;
  generateMeetingMinutesReport(strataId: string, dateRange?: { start: string, end: string }): Promise<any>;
  generateHomeSalePackage(strataId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: Omit<UpsertUser, 'id'>): Promise<User> {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const [user] = await db
      .insert(users)
      .values({
        id,
        ...userData,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<Omit<UpsertUser, 'id'>>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // Delete user strata access first (due to foreign key constraints)
    await db.delete(userStrataAccess).where(eq(userStrataAccess.userId, id));
    
    // Delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users);
    return allUsers;
  }

  async getAllStrata(): Promise<Strata[]> {
    const allStrata = await db.select().from(strata);
    return allStrata;
  }

  // Strata operations
  async getUserStrata(userId: string): Promise<Strata[]> {
    const result = await db
      .select({ strata })
      .from(strata)
      .innerJoin(userStrataAccess, eq(strata.id, userStrataAccess.strataId))
      .where(eq(userStrataAccess.userId, userId));
    
    return result.map(r => r.strata);
  }

  async getStrata(id: string): Promise<Strata | undefined> {
    const [result] = await db.select().from(strata).where(eq(strata.id, id));
    return result;
  }

  async createStrata(strataData: InsertStrata): Promise<Strata> {
    const [result] = await db.insert(strata).values(strataData).returning();
    return result;
  }

  async updateStrata(id: string, strataData: Partial<InsertStrata>): Promise<Strata> {
    const [result] = await db
      .update(strata)
      .set({ ...strataData, updatedAt: new Date() })
      .where(eq(strata.id, id))
      .returning();
    return result;
  }

  async deleteStrata(id: string): Promise<void> {
    // Delete all strata-related data in correct order to handle foreign key constraints
    
    // Get notification IDs for this strata first, then delete dismissed notifications
    const strataNotifications = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(eq(notifications.strataId, id));
    
    if (strataNotifications.length > 0) {
      const notificationIds = strataNotifications.map(n => n.id);
      await db.delete(dismissedNotifications).where(inArray(dismissedNotifications.notificationId, notificationIds));
    }
    
    // 1. Delete all notifications related to this strata
    await db.delete(notifications).where(eq(notifications.strataId, id));
    
    // 2. Delete all messages
    await db.delete(messages).where(eq(messages.strataId, id));
    
    // 3. Delete all payment reminders
    await db.delete(paymentReminders).where(eq(paymentReminders.strataId, id));
    
    // 4. Delete all reports
    await db.delete(reports).where(eq(reports.strataId, id));
    
    // 5. Delete all resident directory entries
    await db.delete(residentDirectory).where(eq(residentDirectory.strataId, id));
    
    // 6. Delete all fund transactions (get fund IDs first)
    const strataFunds = await db
      .select({ id: funds.id })
      .from(funds)
      .where(eq(funds.strataId, id));
    
    if (strataFunds.length > 0) {
      const fundIds = strataFunds.map(f => f.id);
      await db.delete(fundTransactions).where(inArray(fundTransactions.fundId, fundIds));
    }
    
    // 7. Delete all funds
    await db.delete(funds).where(eq(funds.strataId, id));
    
    // 8. Delete all announcements
    await db.delete(announcements).where(eq(announcements.strataId, id));
    
    // 9. Delete all maintenance requests and projects
    await db.delete(maintenanceRequests).where(eq(maintenanceRequests.strataId, id));
    await db.delete(maintenanceProjects).where(eq(maintenanceProjects.strataId, id));
    
    // 10. Delete all documents
    await db.delete(documents).where(eq(documents.strataId, id));
    await db.delete(documentFolders).where(eq(documentFolders.strataId, id));
    
    // 11. Delete all meetings
    await db.delete(meetings).where(eq(meetings.strataId, id));
    
    // 12. Delete all quotes
    await db.delete(quotes).where(eq(quotes.strataId, id));
    
    // 13. Delete all expenses
    await db.delete(expenses).where(eq(expenses.strataId, id));
    
    // 14. Delete all vendor related data
    await db.delete(vendorHistory).where(eq(vendorHistory.strataId, id));
    await db.delete(vendorContracts).where(eq(vendorContracts.strataId, id));
    
    // Note: Vendors table doesn't have strataId directly, vendors are shared across strata
    // We don't delete vendors themselves as they might be used by other strata
    
    // 15. Delete all units
    await db.delete(units).where(eq(units.strataId, id));
    
    // 16. Get all users that are associated with this strata
    const usersInStrata = await db
      .select({ userId: userStrataAccess.userId })
      .from(userStrataAccess)
      .where(eq(userStrataAccess.strataId, id));
    
    // 17. Delete user-strata access relationships
    await db.delete(userStrataAccess).where(eq(userStrataAccess.strataId, id));
    
    // 18. For each user, check if they have other strata associations
    // If not, delete the user (only delete users who are only in this strata)
    for (const user of usersInStrata) {
      const otherAssociations = await db
        .select()
        .from(userStrataAccess)
        .where(eq(userStrataAccess.userId, user.userId));
      
      // If user has no other strata associations, delete them
      if (otherAssociations.length === 0) {
        await db.delete(users).where(eq(users.id, user.userId));
      }
    }
    
    // 19. Finally delete the strata itself
    await db.delete(strata).where(eq(strata.id, id));
  }

  // Unit operations
  async getStrataUnits(strataId: string): Promise<Unit[]> {
    return await db.select().from(units).where(eq(units.strataId, strataId));
  }

  async createUnit(unitData: InsertUnit): Promise<Unit> {
    const [result] = await db.insert(units).values(unitData).returning();
    return result;
  }

  async updateUnit(id: string, unitData: Partial<InsertUnit>): Promise<Unit> {
    const [result] = await db
      .update(units)
      .set({ ...unitData, updatedAt: new Date() })
      .where(eq(units.id, id))
      .returning();
    return result;
  }

  // User access management
  async getUserStrataAccess(userId: string, strataId: string): Promise<UserStrataAccess | undefined> {
    const [result] = await db
      .select()
      .from(userStrataAccess)
      .where(and(eq(userStrataAccess.userId, userId), eq(userStrataAccess.strataId, strataId)));
    return result;
  }

  async getAllUserStrataAccess(userId: string): Promise<UserStrataAccess[]> {
    const results = await db
      .select()
      .from(userStrataAccess)
      .where(eq(userStrataAccess.userId, userId));
    return results;
  }

  async createUserStrataAccess(accessData: InsertUserStrataAccess): Promise<UserStrataAccess> {
    const [result] = await db.insert(userStrataAccess).values(accessData).returning();
    return result;
  }

  async getStrataUsers(strataId: string): Promise<any[]> {
    const results = await db
      .select()
      .from(userStrataAccess)
      .leftJoin(users, eq(userStrataAccess.userId, users.id))
      .where(eq(userStrataAccess.strataId, strataId))
      .orderBy(desc(userStrataAccess.createdAt));
    
    return results.map(result => ({
      ...result.user_strata_access,
      user: result.users
    }));
  }

  async updateUserStrataAccess(id: string, accessData: Partial<InsertUserStrataAccess>): Promise<UserStrataAccess> {
    const [result] = await db
      .update(userStrataAccess)
      .set(accessData)
      .where(eq(userStrataAccess.id, id))
      .returning();
    return result;
  }

  async deleteUserStrataAccess(id: string): Promise<void> {
    await db.delete(userStrataAccess).where(eq(userStrataAccess.id, id));
  }

  // Vendor operations
  async getAllVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).orderBy(desc(vendors.createdAt));
  }

  async getVendorsByStrata(strataId: string): Promise<Vendor[]> {
    return await db.select().from(vendors).where(eq(vendors.strataId, strataId)).orderBy(desc(vendors.createdAt));
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const [result] = await db.select().from(vendors).where(eq(vendors.id, id));
    return result;
  }

  async createVendor(vendorData: InsertVendor): Promise<Vendor> {
    const [result] = await db.insert(vendors).values(vendorData).returning();
    return result;
  }

  async updateVendor(id: string, vendorData: Partial<InsertVendor>): Promise<Vendor> {
    const [result] = await db
      .update(vendors)
      .set({ ...vendorData, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return result;
  }

  async deleteVendor(id: string): Promise<void> {
    await db.delete(vendors).where(eq(vendors.id, id));
  }

  // Vendor contract operations
  async getVendorContracts(vendorId: string): Promise<VendorContract[]> {
    return await db
      .select()
      .from(vendorContracts)
      .where(eq(vendorContracts.vendorId, vendorId))
      .orderBy(desc(vendorContracts.createdAt));
  }

  async getStrataVendorContracts(strataId: string): Promise<VendorContract[]> {
    return await db
      .select()
      .from(vendorContracts)
      .where(eq(vendorContracts.strataId, strataId))
      .orderBy(desc(vendorContracts.createdAt));
  }

  async getVendorContract(id: string): Promise<VendorContract | undefined> {
    const [result] = await db
      .select()
      .from(vendorContracts)
      .where(eq(vendorContracts.id, id));
    return result;
  }

  async createVendorContract(contractData: InsertVendorContract): Promise<VendorContract> {
    const [result] = await db
      .insert(vendorContracts)
      .values(contractData)
      .returning();
    return result;
  }

  async updateVendorContract(id: string, contractData: Partial<InsertVendorContract>): Promise<VendorContract> {
    const [result] = await db
      .update(vendorContracts)
      .set({ ...contractData, updatedAt: new Date() })
      .where(eq(vendorContracts.id, id))
      .returning();
    return result;
  }

  async deleteVendorContract(id: string): Promise<void> {
    await db.delete(vendorContracts).where(eq(vendorContracts.id, id));
  }

  // Vendor history operations
  async getVendorHistory(vendorId: string): Promise<VendorHistory[]> {
    return await db
      .select()
      .from(vendorHistory)
      .where(eq(vendorHistory.vendorId, vendorId))
      .orderBy(desc(vendorHistory.eventDate));
  }

  async getStrataVendorHistory(strataId: string): Promise<VendorHistory[]> {
    return await db
      .select()
      .from(vendorHistory)
      .where(eq(vendorHistory.strataId, strataId))
      .orderBy(desc(vendorHistory.eventDate));
  }

  async createVendorHistory(historyData: InsertVendorHistory): Promise<VendorHistory> {
    const [result] = await db
      .insert(vendorHistory)
      .values(historyData)
      .returning();
    return result;
  }

  async updateVendorHistory(id: string, historyData: Partial<InsertVendorHistory>): Promise<VendorHistory> {
    const [result] = await db
      .update(vendorHistory)
      .set(historyData)
      .where(eq(vendorHistory.id, id))
      .returning();
    return result;
  }

  async deleteVendorHistory(id: string): Promise<void> {
    await db.delete(vendorHistory).where(eq(vendorHistory.id, id));
  }

  // Expense operations
  async getStrataExpenses(strataId: string): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.strataId, strataId))
      .orderBy(desc(expenses.createdAt));
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    const [result] = await db.select().from(expenses).where(eq(expenses.id, id));
    return result;
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const [result] = await db.insert(expenses).values(expenseData).returning();
    return result;
  }

  async updateExpense(id: string, expenseData: Partial<InsertExpense>): Promise<Expense> {
    const [result] = await db
      .update(expenses)
      .set({ ...expenseData, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return result;
  }

  async deleteExpense(id: string): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }



  async getPendingApprovals(strataId: string): Promise<(Quote & Expense)[]> {
    const pendingQuotes = await db
      .select()
      .from(quotes)
      .where(and(eq(quotes.strataId, strataId), eq(quotes.status, "pending")))
      .orderBy(desc(quotes.createdAt));

    const pendingExpenses = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.strataId, strataId), eq(expenses.status, "pending")))
      .orderBy(desc(expenses.createdAt));

    return [...pendingQuotes, ...pendingExpenses] as (Quote & Expense)[];
  }

  // Meeting operations
  async getStrataMeetings(strataId: string): Promise<Meeting[]> {
    return await db
      .select()
      .from(meetings)
      .where(eq(meetings.strataId, strataId))
      .orderBy(desc(meetings.scheduledAt));
  }

  async getMeeting(id: string): Promise<Meeting | undefined> {
    const [result] = await db.select().from(meetings).where(eq(meetings.id, id));
    return result;
  }

  async createMeeting(meetingData: InsertMeeting): Promise<Meeting> {
    const [result] = await db.insert(meetings).values(meetingData).returning();
    return result;
  }

  async updateMeeting(id: string, meetingData: Partial<InsertMeeting>): Promise<Meeting> {
    const [result] = await db
      .update(meetings)
      .set({ ...meetingData, updatedAt: new Date() })
      .where(eq(meetings.id, id))
      .returning();
    return result;
  }

  // Document folder operations
  async getStrataDocumentFolders(strataId: string): Promise<DocumentFolder[]> {
    return await db
      .select()
      .from(documentFolders)
      .where(eq(documentFolders.strataId, strataId))
      .orderBy(documentFolders.path);
  }

  async getRootDocumentFolders(strataId: string): Promise<DocumentFolder[]> {
    return await db
      .select()
      .from(documentFolders)
      .where(and(
        eq(documentFolders.strataId, strataId),
        sql`${documentFolders.parentFolderId} IS NULL`
      ))
      .orderBy(documentFolders.name);
  }

  async getSubFolders(parentFolderId: string): Promise<DocumentFolder[]> {
    return await db
      .select()
      .from(documentFolders)
      .where(eq(documentFolders.parentFolderId, parentFolderId))
      .orderBy(documentFolders.name);
  }

  async getDocumentFolder(id: string): Promise<DocumentFolder | undefined> {
    const [result] = await db.select().from(documentFolders).where(eq(documentFolders.id, id));
    return result;
  }

  async createDocumentFolder(folderData: InsertDocumentFolder): Promise<DocumentFolder> {
    const [result] = await db.insert(documentFolders).values(folderData).returning();
    return result;
  }

  async updateDocumentFolder(id: string, folderData: Partial<InsertDocumentFolder>): Promise<DocumentFolder> {
    const [result] = await db
      .update(documentFolders)
      .set({ ...folderData, updatedAt: new Date() })
      .where(eq(documentFolders.id, id))
      .returning();
    return result;
  }

  async deleteDocumentFolder(id: string): Promise<void> {
    await db.delete(documentFolders).where(eq(documentFolders.id, id));
  }

  async searchDocumentFolders(strataId: string, searchTerm: string): Promise<DocumentFolder[]> {
    return await db
      .select()
      .from(documentFolders)
      .where(and(
        eq(documentFolders.strataId, strataId),
        sql`${documentFolders.name} ILIKE ${`%${searchTerm}%`}`
      ))
      .orderBy(documentFolders.path);
  }

  async createQuoteProjectFolder(strataId: string, projectTitle: string, createdBy: string): Promise<DocumentFolder> {
    // First, ensure "Quotes" parent folder exists
    let quotesFolder = await db
      .select()
      .from(documentFolders)
      .where(and(
        eq(documentFolders.strataId, strataId),
        eq(documentFolders.name, "Quotes"),
        sql`${documentFolders.parentFolderId} IS NULL`
      ));

    if (quotesFolder.length === 0) {
      const [newQuotesFolder] = await db
        .insert(documentFolders)
        .values({
          strataId,
          name: "Quotes",
          description: "Quote documents and related files",
          path: "/Quotes",
          createdBy,
        })
        .returning();
      quotesFolder = [newQuotesFolder];
    }

    // Create project-specific folder under Quotes
    const projectFolderName = projectTitle.replace(/[^\w\s-]/g, '').replace(/\s+/g, ' ').trim();
    const timestamp = new Date().getFullYear();
    const folderName = `${projectFolderName} (${timestamp})`;
    
    const [projectFolder] = await db
      .insert(documentFolders)
      .values({
        strataId,
        parentFolderId: quotesFolder[0].id,
        name: folderName,
        description: `Documents for ${projectTitle} quote project`,
        path: `/Quotes/${folderName}`,
        createdBy,
      })
      .returning();

    return projectFolder;
  }

  // Document operations
  async getStrataDocuments(strataId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.strataId, strataId))
      .orderBy(desc(documents.createdAt));
  }

  async getFolderDocuments(folderId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.folderId, folderId))
      .orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [result] = await db.select().from(documents).where(eq(documents.id, id));
    return result;
  }

  async createDocument(documentData: InsertDocument): Promise<Document> {
    const [result] = await db.insert(documents).values(documentData).returning();
    return result;
  }

  async updateDocument(id: string, documentData: Partial<InsertDocument>): Promise<Document> {
    const [result] = await db
      .update(documents)
      .set({ ...documentData, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return result;
  }

  async deleteDocument(id: string): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }

  async searchDocuments(strataId: string, searchTerm: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(and(
        eq(documents.strataId, strataId),
        sql`(${documents.title} ILIKE ${`%${searchTerm}%`} OR ${documents.description} ILIKE ${`%${searchTerm}%`} OR ${documents.fileName} ILIKE ${`%${searchTerm}%`})`
      ))
      .orderBy(desc(documents.createdAt));
  }

  // Maintenance operations
  async getStrataMaintenanceRequests(strataId: string): Promise<MaintenanceRequest[]> {
    return await db
      .select()
      .from(maintenanceRequests)
      .where(eq(maintenanceRequests.strataId, strataId))
      .orderBy(desc(maintenanceRequests.createdAt));
  }

  async getMaintenanceRequest(id: string): Promise<MaintenanceRequest | undefined> {
    const [result] = await db.select().from(maintenanceRequests).where(eq(maintenanceRequests.id, id));
    return result;
  }

  async createMaintenanceRequest(requestData: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const [result] = await db.insert(maintenanceRequests).values(requestData).returning();
    return result;
  }

  async updateMaintenanceRequest(id: string, requestData: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest> {
    const [result] = await db
      .update(maintenanceRequests)
      .set({ ...requestData, updatedAt: new Date() })
      .where(eq(maintenanceRequests.id, id))
      .returning();
    return result;
  }

  // Maintenance Project operations
  async getStrataMaintenanceProjects(strataId: string): Promise<MaintenanceProject[]> {
    return await db
      .select()
      .from(maintenanceProjects)
      .where(eq(maintenanceProjects.strataId, strataId))
      .orderBy(desc(maintenanceProjects.createdAt));
  }

  async getMaintenanceProject(id: string): Promise<MaintenanceProject | undefined> {
    const [result] = await db.select().from(maintenanceProjects).where(eq(maintenanceProjects.id, id));
    return result;
  }

  async createMaintenanceProject(projectData: InsertMaintenanceProject): Promise<MaintenanceProject> {
    const [result] = await db.insert(maintenanceProjects).values(projectData).returning();
    return result;
  }

  async updateMaintenanceProject(id: string, projectData: Partial<InsertMaintenanceProject>): Promise<MaintenanceProject> {
    const [result] = await db
      .update(maintenanceProjects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(maintenanceProjects.id, id))
      .returning();
    return result;
  }

  async deleteMaintenanceProject(id: string): Promise<void> {
    await db.delete(maintenanceProjects).where(eq(maintenanceProjects.id, id));
  }

  // Communication operations
  async getStrataAnnouncements(strataId: string): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(and(eq(announcements.strataId, strataId), eq(announcements.published, true)))
      .orderBy(desc(announcements.createdAt));
  }

  async getAnnouncement(id: string): Promise<Announcement | undefined> {
    const [result] = await db.select().from(announcements).where(eq(announcements.id, id));
    return result;
  }

  async createAnnouncement(announcementData: InsertAnnouncement): Promise<Announcement> {
    const [result] = await db.insert(announcements).values(announcementData).returning();
    return result;
  }

  async updateAnnouncement(id: string, announcementData: Partial<InsertAnnouncement>): Promise<Announcement> {
    const [result] = await db
      .update(announcements)
      .set({ ...announcementData, updatedAt: new Date() })
      .where(eq(announcements.id, id))
      .returning();
    return result;
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await db.delete(announcements).where(eq(announcements.id, id));
  }

  // Dashboard metrics
  async getStrataMetrics(strataId: string): Promise<{
    totalProperties: number;
    outstandingFees: string;
    pendingApprovals: number;
    openMaintenance: number;
  }> {
    // Get total unit count for this strata
    const unitCountResult = await db
      .select({ count: count() })
      .from(units)
      .where(eq(units.strataId, strataId));
    
    const totalProperties = unitCountResult[0]?.count || 0;

    // Get strata and units to calculate outstanding fees based on actual fee tiers
    const [strataData] = await db.select().from(strata).where(eq(strata.id, strataId));
    const strataUnits = await db.select().from(units).where(eq(units.strataId, strataId));
    
    // Calculate monthly revenue based on actual fee tiers and unit assignments
    const feeStructure = strataData?.feeStructure || {};
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
      const unitsInTier = strataUnits.filter((unit: any) => unit.feeTierId === tier.id);
      const tierAmount = tier.amount || 0;
      monthlyRevenue += unitsInTier.length * tierAmount;
    });
    
    // Outstanding fees = 10% of monthly revenue (can be made configurable later)
    const outstandingAmount = monthlyRevenue * 0.1;
    const outstandingFees = `$${outstandingAmount.toLocaleString()}`;

    // Get pending approvals count
    const pendingQuotesResult = await db
      .select({ count: count() })
      .from(quotes)
      .where(and(eq(quotes.strataId, strataId), eq(quotes.status, "pending")));
    
    const pendingExpensesResult = await db
      .select({ count: count() })
      .from(expenses)
      .where(and(eq(expenses.strataId, strataId), eq(expenses.status, "pending")));

    const pendingApprovals = (pendingQuotesResult[0]?.count || 0) + (pendingExpensesResult[0]?.count || 0);

    // Get open maintenance requests count
    const maintenanceResult = await db
      .select({ count: count() })
      .from(maintenanceRequests)
      .where(and(
        eq(maintenanceRequests.strataId, strataId),
        sql`${maintenanceRequests.status} != 'completed'`
      ));

    const openMaintenance = maintenanceResult[0]?.count || 0;

    return {
      totalProperties,
      outstandingFees,
      pendingApprovals,
      openMaintenance,
    };
  }
  
  // Payment Reminder operations
  async getStrataPaymentReminders(strataId: string): Promise<PaymentReminder[]> {
    const reminders = await db
      .select()
      .from(paymentReminders)
      .where(eq(paymentReminders.strataId, strataId))
      .orderBy(desc(paymentReminders.createdAt));
      
    // Parse weeklyDays JSON string back to array
    return reminders.map(reminder => ({
      ...reminder,
      weeklyDays: reminder.weeklyDays ? JSON.parse(reminder.weeklyDays) : null,
    }));
  }

  async getPaymentReminder(id: string): Promise<PaymentReminder | undefined> {
    const [result] = await db.select().from(paymentReminders).where(eq(paymentReminders.id, id));
    return result;
  }

  async createPaymentReminder(reminderData: InsertPaymentReminder): Promise<PaymentReminder> {
    // Convert weeklyDays array to JSON string for storage
    const dataToInsert = {
      ...reminderData,
      weeklyDays: reminderData.weeklyDays ? JSON.stringify(reminderData.weeklyDays) : null,
    } as any;
    const [result] = await db.insert(paymentReminders).values(dataToInsert).returning();
    return result;
  }

  async updatePaymentReminder(id: string, reminderData: Partial<InsertPaymentReminder>): Promise<PaymentReminder> {
    // Convert weeklyDays array to JSON string for storage
    const dataToUpdate = {
      ...reminderData,
      weeklyDays: reminderData.weeklyDays ? JSON.stringify(reminderData.weeklyDays) : undefined,
      updatedAt: new Date(),
    } as any;
    const [result] = await db
      .update(paymentReminders)
      .set(dataToUpdate)
      .where(eq(paymentReminders.id, id))
      .returning();
    return result;
  }

  async deletePaymentReminder(id: string): Promise<void> {
    await db.delete(paymentReminders).where(eq(paymentReminders.id, id));
  }

  async getActiveRecurringReminders(strataId: string): Promise<PaymentReminder[]> {
    return await db
      .select()
      .from(paymentReminders)
      .where(
        and(
          eq(paymentReminders.strataId, strataId),
          eq(paymentReminders.isRecurring, true),
          eq(paymentReminders.status, 'active')
        )
      )
      .orderBy(desc(paymentReminders.nextReminderDate));
  }

  async getOverdueReminders(strataId: string): Promise<PaymentReminder[]> {
    return await db
      .select()
      .from(paymentReminders)
      .where(
        and(
          eq(paymentReminders.strataId, strataId),
          eq(paymentReminders.status, 'active'),
          lt(paymentReminders.dueDate, new Date())
        )
      )
      .orderBy(desc(paymentReminders.dueDate));
  }

  // Fund operations
  async getStrataFunds(strataId: string): Promise<Fund[]> {
    return await db
      .select()
      .from(funds)
      .where(eq(funds.strataId, strataId))
      .orderBy(desc(funds.createdAt));
  }

  async getFund(id: string): Promise<Fund | undefined> {
    const [result] = await db.select().from(funds).where(eq(funds.id, id));
    return result;
  }

  async createFund(fundData: InsertFund): Promise<Fund> {
    const [result] = await db.insert(funds).values(fundData).returning();
    return result;
  }

  async updateFund(id: string, fundData: Partial<InsertFund>): Promise<Fund> {
    const [result] = await db
      .update(funds)
      .set({ ...fundData, updatedAt: new Date() })
      .where(eq(funds.id, id))
      .returning();
    return result;
  }

  async deleteFund(id: string): Promise<void> {
    await db.delete(funds).where(eq(funds.id, id));
  }

  // Fund transaction operations
  async getFundTransactions(fundId: string): Promise<FundTransaction[]> {
    return await db
      .select()
      .from(fundTransactions)
      .where(eq(fundTransactions.fundId, fundId))
      .orderBy(desc(fundTransactions.transactionDate));
  }

  async createFundTransaction(transactionData: InsertFundTransaction): Promise<FundTransaction> {
    const [result] = await db.insert(fundTransactions).values(transactionData).returning();
    return result;
  }

  async updateFundTransaction(id: string, transactionData: Partial<InsertFundTransaction>): Promise<FundTransaction> {
    const [result] = await db
      .update(fundTransactions)
      .set(transactionData)
      .where(eq(fundTransactions.id, id))
      .returning();
    return result;
  }

  async deleteFundTransaction(id: string): Promise<void> {
    await db.delete(fundTransactions).where(eq(fundTransactions.id, id));
  }

  // Fund calculations
  async calculateFundProjections(fundId: string, years: number): Promise<{
    currentBalance: number;
    projectedBalance: number;
    totalInterest: number;
    monthlyProjections: Array<{
      month: number;
      balance: number;
      interest: number;
    }>;
  }> {
    const fund = await this.getFund(fundId);
    if (!fund) {
      throw new Error("Fund not found");
    }

    const currentBalance = parseFloat(fund.balance);
    const annualRate = fund.interestRate ? parseFloat(fund.interestRate) : 0;
    const monthlyRate = annualRate / 12;
    const totalMonths = years * 12;
    
    const monthlyProjections = [];
    let balance = currentBalance;
    let totalInterest = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const interestEarned = balance * monthlyRate;
      balance += interestEarned;
      totalInterest += interestEarned;
      
      monthlyProjections.push({
        month,
        balance: Math.round(balance * 100) / 100,
        interest: Math.round(interestEarned * 100) / 100,
      });
    }

    return {
      currentBalance,
      projectedBalance: Math.round(balance * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      monthlyProjections,
    };
  }

  // Pending strata registration operations
  async getAllPendingRegistrations(): Promise<PendingStrataRegistration[]> {
    return await db.select().from(pendingStrataRegistrations).orderBy(desc(pendingStrataRegistrations.createdAt));
  }

  async getPendingRegistration(id: string): Promise<PendingStrataRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(pendingStrataRegistrations)
      .where(eq(pendingStrataRegistrations.id, id));
    return registration;
  }

  async createPendingRegistration(registration: InsertPendingStrataRegistration): Promise<PendingStrataRegistration> {
    const [created] = await db
      .insert(pendingStrataRegistrations)
      .values(registration)
      .returning();
    return created;
  }

  async getPendingRegistrations(): Promise<PendingStrataRegistration[]> {
    return await db
      .select()
      .from(pendingStrataRegistrations)
      .where(eq(pendingStrataRegistrations.status, "pending"))
      .orderBy(desc(pendingStrataRegistrations.createdAt));
  }

  async approveStrataRegistration(id: string, subscriptionData?: any): Promise<{ strata: Strata; user: User }> {
    const result = await this.approvePendingRegistration(id, "admin");
    
    // If subscription data is provided, update the created strata with subscription info
    if (subscriptionData && result.strata) {
      await this.updateStrata(result.strata.id, subscriptionData);
    }
    
    return result;
  }

  async rejectStrataRegistration(id: string): Promise<PendingStrataRegistration> {
    return await this.rejectPendingRegistration(id, "admin", "Rejected by administrator");
  }

  // Strata admin helper methods
  async checkUserStrataAdminAccess(userId: string, strataId: string): Promise<boolean> {
    const userAccess = await db
      .select()
      .from(userStrataAccess)
      .where(
        and(
          eq(userStrataAccess.userId, userId),
          eq(userStrataAccess.strataId, strataId)
        )
      );

    if (userAccess.length === 0) return false;

    const adminRoles = ['chairperson', 'property_manager', 'treasurer', 'secretary'];
    return adminRoles.includes(userAccess[0].role);
  }

  async getUserStrataAccessById(accessId: string): Promise<UserStrataAccess | undefined> {
    const [access] = await db
      .select()
      .from(userStrataAccess)
      .where(eq(userStrataAccess.id, accessId));
    return access;
  }

  async getUserStrataAssignments(userId: string): Promise<UserStrataAccess[]> {
    const assignments = await db
      .select({
        id: userStrataAccess.id,
        userId: userStrataAccess.userId,
        strataId: userStrataAccess.strataId,
        role: userStrataAccess.role,
        canPostAnnouncements: userStrataAccess.canPostAnnouncements,
        createdAt: userStrataAccess.createdAt,
        strata: {
          id: strata.id,
          name: strata.name
        }
      })
      .from(userStrataAccess)
      .leftJoin(strata, eq(userStrataAccess.strataId, strata.id))
      .where(eq(userStrataAccess.userId, userId));
    
    return assignments as any; // TypeScript workaround for extended object
  }

  async removeUserFromAllStrata(userId: string): Promise<void> {
    await db
      .delete(userStrataAccess)
      .where(eq(userStrataAccess.userId, userId));
  }

  async updateUserStrataRole(userId: string, strataId: string, role: string): Promise<UserStrataAccess | undefined> {
    const updated = await db
      .update(userStrataAccess)
      .set({ role })
      .where(and(eq(userStrataAccess.userId, userId), eq(userStrataAccess.strataId, strataId)))
      .returning();
    return updated[0];
  }

  async removeUserStrataAccess(accessId: string): Promise<void> {
    await db
      .delete(userStrataAccess)
      .where(eq(userStrataAccess.id, accessId));
  }

  async updateStrataSubscription(strataId: string, subscriptionData: Partial<Pick<Strata, 'subscriptionStatus' | 'subscriptionTier' | 'monthlyRate' | 'isFreeForever' | 'trialStartDate' | 'trialEndDate' | 'subscriptionStartDate' | 'subscriptionEndDate'>>): Promise<void> {
    await db
      .update(strata)
      .set(subscriptionData)
      .where(eq(strata.id, strataId));
  }

  async updatePendingRegistration(id: string, updates: Partial<PendingStrataRegistration>): Promise<PendingStrataRegistration> {
    const [updated] = await db
      .update(pendingStrataRegistrations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pendingStrataRegistrations.id, id))
      .returning();
    return updated;
  }

  async approvePendingRegistration(id: string, approvedBy: string): Promise<{ strata: Strata; user: User }> {
    const registration = await this.getPendingRegistration(id);
    if (!registration) {
      throw new Error("Registration not found");
    }

    // Calculate subscription details based on unit count
    const subscriptionTier = registration.unitCount <= 100 ? "standard" : "premium";
    const monthlyRate = registration.unitCount <= 100 ? "49" : "79";
    const trialStartDate = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialStartDate.getDate() + 30); // 30-day trial

    // Create the strata with subscription details
    const strataData: InsertStrata = {
      name: registration.strataName,
      address: registration.address,
      city: registration.city,
      province: registration.province,
      postalCode: registration.postalCode,
      unitCount: registration.unitCount,
      managementCompany: registration.managementCompany,
      notes: registration.description,
      status: "active",
      subscriptionStatus: "trial",
      subscriptionTier,
      monthlyRate,
      trialStartDate,
      trialEndDate,
      isFreeForever: false,
      createdBy: approvedBy,
    };

    const strata = await this.createStrata(strataData);

    // Create the admin user
    const userData = {
      email: registration.adminEmail,
      firstName: registration.adminFirstName,
      lastName: registration.adminLastName,
      role: "chairperson" as const,
      isActive: true,
    };

    const user = await this.createUser(userData);

    // Grant chairperson access to the strata
    await this.createUserStrataAccess({
      userId: user.id,
      strataId: strata.id,
      role: "chairperson",
      canPostAnnouncements: true,
    });

    // Update the registration status
    await this.updatePendingRegistration(id, {
      status: "approved",
      approvedBy,
      approvedAt: new Date(),
      createdStrataId: strata.id,
    });

    return { strata, user };
  }

  async rejectPendingRegistration(id: string, rejectedBy: string, reason: string): Promise<PendingStrataRegistration> {
    return await this.updatePendingRegistration(id, {
      status: "rejected",
      approvedBy: rejectedBy,
      approvedAt: new Date(),
      rejectionReason: reason,
    });
  }

  // Quote operations
  async getStrataQuotes(strataId: string): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.strataId, strataId))
      .orderBy(desc(quotes.createdAt));
  }

  async getQuote(id: string): Promise<Quote | undefined> {
    const [result] = await db.select().from(quotes).where(eq(quotes.id, id));
    return result;
  }

  async createQuote(quoteData: InsertQuote): Promise<Quote> {
    const [result] = await db.insert(quotes).values({
      ...quoteData,
      submittedAt: new Date(),
      status: 'submitted'
    }).returning();
    return result;
  }

  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
    const [result] = await db
      .update(quotes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return result;
  }

  async deleteQuote(id: string): Promise<void> {
    await db.delete(quotes).where(eq(quotes.id, id));
  }

  // Message operations
  async getStrataMessages(strataId: string, userId: string): Promise<Message[]> {
    const messageList = await db
      .select({
        id: messages.id,
        strataId: messages.strataId,
        senderId: messages.senderId,
        recipientId: messages.recipientId,
        subject: messages.subject,
        content: messages.content,
        messageType: messages.messageType,
        isRead: messages.isRead,
        readAt: messages.readAt,
        parentMessageId: messages.parentMessageId,
        conversationId: messages.conversationId,
        priority: messages.priority,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        senderName: users.firstName,
        senderEmail: users.email,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        and(
          eq(messages.strataId, strataId),
          // Show messages where user is sender, recipient, or it's a broadcast
          sql`(${messages.senderId} = ${userId} OR ${messages.recipientId} = ${userId} OR ${messages.recipientId} IS NULL)`
        )
      )
      .orderBy(desc(messages.createdAt));
    
    return messageList;
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }

  async markMessageAsRead(messageId: string): Promise<Message> {
    const [message] = await db
      .update(messages)
      .set({ 
        isRead: true, 
        readAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(messages.id, messageId))
      .returning();
    return message;
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    // Delete all messages in the conversation where user is involved
    await db
      .delete(messages)
      .where(
        and(
          or(
            eq(messages.conversationId, conversationId),
            eq(messages.id, conversationId) // In case conversationId is the original message ID
          ),
          or(
            eq(messages.senderId, userId),
            eq(messages.recipientId, userId)
          )
        )
      );
  }

  // Notification operations
  async getUserNotifications(userId: string, strataId: string): Promise<Notification[]> {
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.strataId, strataId)
      ))
      .orderBy(desc(notifications.createdAt));
    return userNotifications;
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(notificationData)
      .returning();
    return notification;
  }

  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId))
      .returning();
    return notification;
  }

  // Resident Directory operations
  async getStrataResidentDirectory(strataId: string): Promise<ResidentDirectory[]> {
    const directory = await db
      .select({
        id: residentDirectory.id,
        strataId: residentDirectory.strataId,
        userId: residentDirectory.userId,
        dwellingId: residentDirectory.dwellingId,
        primaryPhone: residentDirectory.primaryPhone,
        secondaryPhone: residentDirectory.secondaryPhone,
        workPhone: residentDirectory.workPhone,
        alternateEmail: residentDirectory.alternateEmail,
        emergencyContactName: residentDirectory.emergencyContactName,
        emergencyContactPhone: residentDirectory.emergencyContactPhone,
        emergencyContactRelationship: residentDirectory.emergencyContactRelationship,
        emergencyContactEmail: residentDirectory.emergencyContactEmail,
        moveInDate: residentDirectory.moveInDate,
        occupancyType: residentDirectory.occupancyType,
        vehicleInfo: residentDirectory.vehicleInfo,
        petInfo: residentDirectory.petInfo,
        specialNotes: residentDirectory.specialNotes,
        showInDirectory: residentDirectory.showInDirectory,
        showContactInfo: residentDirectory.showContactInfo,
        showEmergencyContact: residentDirectory.showEmergencyContact,
        createdAt: residentDirectory.createdAt,
        updatedAt: residentDirectory.updatedAt,
        userName: users.firstName,
        userEmail: users.email,
        unitNumber: units.unitNumber,
      })
      .from(residentDirectory)
      .leftJoin(users, eq(residentDirectory.userId, users.id))
      .leftJoin(units, eq(residentDirectory.dwellingId, units.id))
      .where(
        and(
          eq(residentDirectory.strataId, strataId),
          eq(residentDirectory.showInDirectory, true)
        )
      )
      .orderBy(units.unitNumber);
    
    return directory;
  }

  async createResidentDirectoryEntry(entryData: InsertResidentDirectory): Promise<ResidentDirectory> {
    const [entry] = await db
      .insert(residentDirectory)
      .values(entryData)
      .returning();
    return entry;
  }

  async updateResidentDirectoryEntry(id: string, updates: Partial<InsertResidentDirectory>): Promise<ResidentDirectory> {
    const [entry] = await db
      .update(residentDirectory)
      .set({ 
        ...updates, 
        updatedAt: new Date() 
      })
      .where(eq(residentDirectory.id, id))
      .returning();
    return entry;
  }

  // Dismissed Notifications operations
  async getUserDismissedNotifications(userId: string): Promise<DismissedNotification[]> {
    const dismissed = await db
      .select()
      .from(dismissedNotifications)
      .where(eq(dismissedNotifications.userId, userId));
    return dismissed;
  }

  async dismissNotification(notificationData: InsertDismissedNotification): Promise<DismissedNotification> {
    const [dismissed] = await db
      .insert(dismissedNotifications)
      .values(notificationData)
      .returning();
    return dismissed;
  }

  // Reports operations
  async getStrataReports(strataId: string): Promise<Report[]> {
    const reportsList = await db
      .select()
      .from(reports)
      .where(eq(reports.strataId, strataId))
      .orderBy(desc(reports.createdAt));
    return reportsList;
  }

  async getReport(id: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async createReport(reportData: InsertReport): Promise<Report> {
    const [report] = await db.insert(reports).values(reportData).returning();
    return report;
  }

  async updateReport(id: string, updates: Partial<Report>): Promise<Report> {
    const [report] = await db
      .update(reports)
      .set(updates)
      .where(eq(reports.id, id))
      .returning();
    return report;
  }

  async deleteReport(id: string): Promise<void> {
    await db.delete(reports).where(eq(reports.id, id));
  }

  async generateFinancialReport(strataId: string, dateRange: { start: string, end: string }): Promise<any> {
    // Get expenses within date range
    const expensesList = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.strataId, strataId),
          sql`${expenses.createdAt} >= ${dateRange.start}`,
          sql`${expenses.createdAt} <= ${dateRange.end}`
        )
      );

    // Get fund transactions within date range through funds
    const strataFunds = await db
      .select()
      .from(funds)
      .where(eq(funds.strataId, strataId));
    
    // Get all fund transactions for this strata within date range
    const transactions: FundTransaction[] = [];
    for (const fund of strataFunds) {
      const fundTransactions_results = await db
        .select()
        .from(fundTransactions)
        .where(
          and(
            eq(fundTransactions.fundId, fund.id),
            sql`${fundTransactions.transactionDate} >= ${dateRange.start}`,
            sql`${fundTransactions.transactionDate} <= ${dateRange.end}`
          )
        );
      transactions.push(...fundTransactions_results);
    }
    
    // Calculate income from fee tiers
    const unitsList = await db
      .select()
      .from(units)
      .where(eq(units.strataId, strataId));

    // Get strata to get fee structure
    const [strataData] = await db.select().from(strata).where(eq(strata.id, strataId));
    const feeStructure = strataData?.feeStructure || {};
    
    let monthlyIncome = 0;
    let feeTiers = [];
    if ((feeStructure as any).tiers && Array.isArray((feeStructure as any).tiers)) {
      feeTiers = (feeStructure as any).tiers;
    } else {
      feeTiers = Object.entries(feeStructure).map(([id, amount]) => ({
        id,
        amount: typeof amount === 'number' ? amount : 0
      }));
    }
    
    feeTiers.forEach((tier: any) => {
      const unitsInTier = unitsList.filter((unit: any) => unit.feeTierId === tier.id);
      const tierAmount = tier.amount || 0;
      monthlyIncome += unitsInTier.length * tierAmount;
    });

    return {
      dateRange,
      expenses: expensesList,
      transactions,
      funds: strataFunds,
      monthlyIncome,
      totalExpenses: expensesList.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
      totalTransactions: transactions.reduce((sum, trans) => sum + parseFloat(trans.amount), 0),
    };
  }

  async generateMeetingMinutesReport(strataId: string, dateRange?: { start: string, end: string }): Promise<any> {
    let meetingsList;

    if (dateRange) {
      meetingsList = await db
        .select()
        .from(meetings)
        .where(
          and(
            eq(meetings.strataId, strataId),
            sql`${meetings.scheduledAt} >= ${dateRange.start}`,
            sql`${meetings.scheduledAt} <= ${dateRange.end}`
          )
        )
        .orderBy(desc(meetings.scheduledAt));
    } else {
      meetingsList = await db
        .select()
        .from(meetings)
        .where(eq(meetings.strataId, strataId))
        .orderBy(desc(meetings.scheduledAt));
    }

    return {
      dateRange,
      meetings: meetingsList,
      totalMeetings: meetingsList.length,
    };
  }

  async generateHomeSalePackage(strataId: string): Promise<any> {
    // Get all meeting minutes
    const meetingsList = await db
      .select()
      .from(meetings)
      .where(eq(meetings.strataId, strataId))
      .orderBy(desc(meetings.scheduledAt));

    // Get financial summary for last 12 months
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const recentExpenses = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.strataId, strataId),
          sql`${expenses.createdAt} >= ${oneYearAgo.toISOString()}`
        )
      );

    // Get fund balances
    const currentFunds = await db
      .select()
      .from(funds)
      .where(eq(funds.strataId, strataId));

    // Get strata documents
    const documentsList = await db
      .select()
      .from(documents)
      .where(eq(documents.strataId, strataId));

    return {
      meetings: meetingsList,
      recentExpenses,
      funds: currentFunds,
      documents: documentsList,
      generatedAt: new Date().toISOString(),
    };
  }

  // Password management operations
  async markPasswordChanged(email: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        mustChangePassword: false,
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
  }

  async setMustChangePassword(email: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        mustChangePassword: true,
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
}

export const storage = new DatabaseStorage();
