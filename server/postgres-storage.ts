import { eq, and, desc, asc, inArray, ilike, or, sql, count } from 'drizzle-orm';
import { db } from './db';
import * as schema from '../shared/schema';
import { sendNotificationEmail, type NotificationEmailData } from './email-service.js';
import type { IStorage } from './storage-interface';
import type {
  User, InsertUser,
  Strata, InsertStrata,
  UserStrataAccess, InsertUserStrataAccess,
  Unit, InsertUnit,
  Vendor, InsertVendor,
  Quote,
  Meeting, InsertMeeting,
  MaintenanceRequest,
  Message, InsertMessage,
  Notification, InsertNotification,
} from '../shared/schema';

export class PostgresStorage implements IStorage {

  // ===== USER OPERATIONS =====

  async getUser(id: string): Promise<User | undefined> {
    const result = await db!.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0] ?? undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db!.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0] ?? undefined;
  }

  async getUserByResetToken(hashedToken: string): Promise<User | undefined> {
    const result = await db!.select().from(schema.users).where(eq(schema.users.passwordResetToken, hashedToken)).limit(1);
    return result[0] ?? undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = userData.id || crypto.randomUUID();
    const now = new Date();
    const [user] = await db!.insert(schema.users).values({
      ...userData,
      id,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [updated] = await db!.update(schema.users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db!.delete(schema.users).where(eq(schema.users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return await db!.select().from(schema.users);
  }

  async setMustChangePassword(email: string): Promise<void> {
    await db!.update(schema.users)
      .set({ mustChangePassword: true, updatedAt: new Date() })
      .where(eq(schema.users.email, email));
  }

  async getUsersByStrata(strataId: string): Promise<User[]> {
    const accessRecords = await db!.select()
      .from(schema.userStrataAccess)
      .where(eq(schema.userStrataAccess.strataId, strataId));

    if (accessRecords.length === 0) return [];

    const userIds = accessRecords.map(a => a.userId);
    return await db!.select().from(schema.users).where(inArray(schema.users.id, userIds));
  }

  // ===== STRATA OPERATIONS =====

  async getStrata(id: string): Promise<Strata | undefined> {
    const result = await db!.select().from(schema.strata).where(eq(schema.strata.id, id)).limit(1);
    return result[0] ?? undefined;
  }

  async getAllStrata(): Promise<Strata[]> {
    return await db!.select().from(schema.strata);
  }

  async createStrata(strataData: InsertStrata): Promise<Strata> {
    const now = new Date();
    const [created] = await db!.insert(schema.strata).values({
      ...strataData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return created;
  }

  async updateStrata(id: string, strataData: Partial<InsertStrata>): Promise<Strata> {
    const [updated] = await db!.update(schema.strata)
      .set({ ...strataData, updatedAt: new Date() })
      .where(eq(schema.strata.id, id))
      .returning();
    if (!updated) throw new Error('Strata not found after update');
    return updated;
  }

  async deleteStrata(id: string): Promise<void> {
    // Delete all related data first
    await db!.delete(schema.userStrataAccess).where(eq(schema.userStrataAccess.strataId, id));
    await db!.delete(schema.units).where(eq(schema.units.strataId, id));
    await db!.delete(schema.expenses).where(eq(schema.expenses.strataId, id));
    await db!.delete(schema.vendors).where(eq(schema.vendors.strataId, id));
    await db!.delete(schema.quotes).where(eq(schema.quotes.strataId, id));
    await db!.delete(schema.meetings).where(eq(schema.meetings.strataId, id));
    await db!.delete(schema.documents).where(eq(schema.documents.strataId, id));
    await db!.delete(schema.maintenanceRequests).where(eq(schema.maintenanceRequests.strataId, id));
    await db!.delete(schema.announcements).where(eq(schema.announcements.strataId, id));
    await db!.delete(schema.messages).where(eq(schema.messages.strataId, id));
    await db!.delete(schema.notifications).where(eq(schema.notifications.strataId, id));
    await db!.delete(schema.funds).where(eq(schema.funds.strataId, id));
    await db!.delete(schema.paymentReminders).where(eq(schema.paymentReminders.strataId, id));
    await db!.delete(schema.strata).where(eq(schema.strata.id, id));
  }

  async getUserStrata(userId: string): Promise<Strata[]> {
    const accessRecords = await db!.select()
      .from(schema.userStrataAccess)
      .where(eq(schema.userStrataAccess.userId, userId));

    if (accessRecords.length === 0) return [];

    const strataIds = accessRecords.map(a => a.strataId);
    return await db!.select().from(schema.strata).where(inArray(schema.strata.id, strataIds));
  }

  // ===== USER STRATA ACCESS OPERATIONS =====

  async getUserStrataAccess(userId: string, strataId: string): Promise<UserStrataAccess | undefined> {
    const result = await db!.select()
      .from(schema.userStrataAccess)
      .where(and(
        eq(schema.userStrataAccess.userId, userId),
        eq(schema.userStrataAccess.strataId, strataId)
      ))
      .limit(1);
    return result[0] ?? undefined;
  }

  async createUserStrataAccess(accessData: InsertUserStrataAccess): Promise<UserStrataAccess> {
    const [created] = await db!.insert(schema.userStrataAccess).values({
      ...accessData,
      createdAt: new Date(),
    }).returning();
    return created;
  }

  async deleteUserStrataAccess(accessId: string): Promise<void> {
    await db!.delete(schema.userStrataAccess).where(eq(schema.userStrataAccess.id, accessId));
  }

  async updateUserStrataRole(userId: string, strataId: string, role: string): Promise<UserStrataAccess | undefined> {
    const [updated] = await db!.update(schema.userStrataAccess)
      .set({ role })
      .where(and(
        eq(schema.userStrataAccess.userId, userId),
        eq(schema.userStrataAccess.strataId, strataId)
      ))
      .returning();
    return updated ?? undefined;
  }

  async getStrataUsers(strataId: string): Promise<any[]> {
    const accessRecords = await db!.select()
      .from(schema.userStrataAccess)
      .where(eq(schema.userStrataAccess.strataId, strataId));

    const results = [];
    for (const access of accessRecords) {
      const user = await this.getUser(access.userId);
      if (user) {
        results.push({ ...access, user });
      }
    }
    return results;
  }

  async getUserStrataAssignments(userId: string): Promise<any[]> {
    const accessRecords = await db!.select()
      .from(schema.userStrataAccess)
      .where(eq(schema.userStrataAccess.userId, userId));

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
          createdAt: access.createdAt,
        });
      }
    }
    return assignments;
  }

  async checkUserStrataAdminAccess(userId: string, strataId: string): Promise<boolean> {
    const userAccess = await this.getUserStrataAccess(userId, strataId);
    if (!userAccess) return false;
    const adminRoles = ['chairperson', 'property_manager', 'treasurer', 'secretary'];
    return adminRoles.includes(userAccess.role);
  }

  async updateUserStrataAccess(accessId: string, updateData: any): Promise<any> {
    const [updated] = await db!.update(schema.userStrataAccess)
      .set(updateData)
      .where(eq(schema.userStrataAccess.id, accessId))
      .returning();
    if (!updated) throw new Error('User strata access not found after update');
    return updated;
  }

  // ===== UNIT OPERATIONS =====

  async createUnit(unitData: InsertUnit): Promise<Unit> {
    const now = new Date();
    const [unit] = await db!.insert(schema.units).values({
      ...unitData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return unit;
  }

  async getStrataUnits(strataId: string): Promise<Unit[]> {
    return await db!.select()
      .from(schema.units)
      .where(eq(schema.units.strataId, strataId))
      .orderBy(asc(schema.units.unitNumber));
  }

  async updateUnit(unitId: string, updates: Partial<Unit>): Promise<Unit> {
    const [updated] = await db!.update(schema.units)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.units.id, unitId))
      .returning();
    if (!updated) throw new Error('Unit not found');
    return updated;
  }

  async deleteUnit(unitId: string): Promise<void> {
    await db!.delete(schema.units).where(eq(schema.units.id, unitId));
  }

  // ===== EXPENSE OPERATIONS =====

  async getStrataExpenses(strataId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.expenses)
      .where(eq(schema.expenses.strataId, strataId))
      .orderBy(desc(schema.expenses.createdAt));
  }

  async createExpense(expenseData: any): Promise<any> {
    const now = new Date();
    const [expense] = await db!.insert(schema.expenses).values({
      ...expenseData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return expense;
  }

  async updateExpense(expenseId: string, updateData: any): Promise<any> {
    const [updated] = await db!.update(schema.expenses)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.expenses.id, expenseId))
      .returning();
    if (!updated) throw new Error('Expense not found after update');
    return updated;
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await db!.delete(schema.expenses).where(eq(schema.expenses.id, expenseId));
  }

  // ===== VENDOR OPERATIONS =====

  async getVendor(id: string): Promise<Vendor | undefined> {
    const result = await db!.select().from(schema.vendors).where(eq(schema.vendors.id, id)).limit(1);
    return result[0] ?? undefined;
  }

  async getVendorsByStrata(strataId: string): Promise<Vendor[]> {
    return await db!.select().from(schema.vendors).where(eq(schema.vendors.strataId, strataId));
  }

  async getAllVendors(): Promise<Vendor[]> {
    return await db!.select().from(schema.vendors);
  }

  async createVendor(vendorData: InsertVendor): Promise<Vendor> {
    const now = new Date();
    const [vendor] = await db!.insert(schema.vendors).values({
      ...vendorData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return vendor;
  }

  async updateVendor(id: string, vendorData: Partial<InsertVendor>): Promise<Vendor> {
    const [updated] = await db!.update(schema.vendors)
      .set({ ...vendorData, updatedAt: new Date() })
      .where(eq(schema.vendors.id, id))
      .returning();
    if (!updated) throw new Error('Vendor not found after update');
    return updated;
  }

  async deleteVendor(id: string): Promise<void> {
    await db!.delete(schema.vendors).where(eq(schema.vendors.id, id));
  }

  // ===== VENDOR CONTRACT OPERATIONS =====

  async getVendorContracts(vendorId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.vendorContracts)
      .where(eq(schema.vendorContracts.vendorId, vendorId))
      .orderBy(desc(schema.vendorContracts.createdAt));
  }

  async createVendorContract(contractData: any): Promise<any> {
    const now = new Date();
    const [contract] = await db!.insert(schema.vendorContracts).values({
      ...contractData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return contract;
  }

  async updateVendorContract(contractId: string, updateData: any): Promise<any> {
    const [updated] = await db!.update(schema.vendorContracts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.vendorContracts.id, contractId))
      .returning();
    if (!updated) throw new Error('Vendor contract not found after update');
    return updated;
  }

  async deleteVendorContract(contractId: string): Promise<void> {
    await db!.delete(schema.vendorContracts).where(eq(schema.vendorContracts.id, contractId));
  }

  // ===== VENDOR HISTORY OPERATIONS =====

  async getVendorHistory(vendorId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.vendorHistory)
      .where(eq(schema.vendorHistory.vendorId, vendorId))
      .orderBy(desc(schema.vendorHistory.createdAt));
  }

  async createVendorHistory(historyData: any): Promise<any> {
    const now = new Date();
    const [history] = await db!.insert(schema.vendorHistory).values({
      ...historyData,
      createdAt: now,
    }).returning();
    return history;
  }

  async updateVendorHistory(historyId: string, updateData: any): Promise<any> {
    const [updated] = await db!.update(schema.vendorHistory)
      .set(updateData)
      .where(eq(schema.vendorHistory.id, historyId))
      .returning();
    if (!updated) throw new Error('Vendor history not found after update');
    return updated;
  }

  async deleteVendorHistory(historyId: string): Promise<void> {
    await db!.delete(schema.vendorHistory).where(eq(schema.vendorHistory.id, historyId));
  }

  // ===== QUOTE OPERATIONS =====

  async getStrataQuotes(strataId: string): Promise<Quote[]> {
    return await db!.select()
      .from(schema.quotes)
      .where(eq(schema.quotes.strataId, strataId));
  }

  async createQuote(quoteData: any): Promise<any> {
    const now = new Date();
    const [quote] = await db!.insert(schema.quotes).values({
      ...quoteData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return quote;
  }

  async updateQuote(quoteId: string, updateData: any): Promise<any> {
    const [updated] = await db!.update(schema.quotes)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.quotes.id, quoteId))
      .returning();
    if (!updated) throw new Error('Quote not found after update');
    return updated;
  }

  async createQuoteProjectFolder(strataId: string, projectTitle: string, createdBy: string): Promise<any> {
    const now = new Date();
    const [folder] = await db!.insert(schema.documentFolders).values({
      strataId,
      name: projectTitle,
      description: `Project folder for: ${projectTitle}`,
      parentFolderId: null,
      path: `/${projectTitle}`,
      createdBy,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return folder;
  }

  // ===== FEE TIER OPERATIONS =====

  async getStrataFeeTiers(strataId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.feeTiers)
      .where(eq(schema.feeTiers.strataId, strataId))
      .orderBy(asc(schema.feeTiers.monthlyAmount));
  }

  async createFeeTier(feeTierData: any): Promise<any> {
    const now = new Date();
    const [tier] = await db!.insert(schema.feeTiers).values({
      ...feeTierData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return tier;
  }

  async updateFeeTier(feeTierId: string, updates: any): Promise<any> {
    const [updated] = await db!.update(schema.feeTiers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.feeTiers.id, feeTierId))
      .returning();
    if (!updated) throw new Error('Fee tier not found');
    return updated;
  }

  async deleteFeeTier(feeTierId: string): Promise<void> {
    await db!.delete(schema.feeTiers).where(eq(schema.feeTiers.id, feeTierId));
  }

  // ===== DOCUMENT FOLDER OPERATIONS =====

  async getStrataDocumentFolders(strataId: string, parentFolderId?: string): Promise<any[]> {
    const conditions = [eq(schema.documentFolders.strataId, strataId)];
    if (parentFolderId) {
      conditions.push(eq(schema.documentFolders.parentFolderId, parentFolderId));
    } else {
      conditions.push(sql`${schema.documentFolders.parentFolderId} IS NULL`);
    }

    return await db!.select()
      .from(schema.documentFolders)
      .where(and(...conditions))
      .orderBy(asc(schema.documentFolders.name));
  }

  async createDocumentFolder(folderData: any): Promise<any> {
    const now = new Date();
    const [folder] = await db!.insert(schema.documentFolders).values({
      ...folderData,
      path: folderData.path || `/${folderData.name}`,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return folder;
  }

  async updateDocumentFolder(folderId: string, updates: any): Promise<any> {
    const [updated] = await db!.update(schema.documentFolders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.documentFolders.id, folderId))
      .returning();
    if (!updated) throw new Error('Document folder not found');
    return updated;
  }

  async deleteDocumentFolder(folderId: string): Promise<void> {
    await db!.delete(schema.documentFolders).where(eq(schema.documentFolders.id, folderId));
  }

  async getDocumentFolder(folderId: string): Promise<any> {
    const result = await db!.select()
      .from(schema.documentFolders)
      .where(eq(schema.documentFolders.id, folderId))
      .limit(1);
    if (!result[0]) throw new Error('Document folder not found');
    return result[0];
  }

  async searchDocumentFolders(strataId: string, searchTerm: string): Promise<any[]> {
    return await db!.select()
      .from(schema.documentFolders)
      .where(and(
        eq(schema.documentFolders.strataId, strataId),
        or(
          ilike(schema.documentFolders.name, `%${searchTerm}%`),
          ilike(schema.documentFolders.description, `%${searchTerm}%`)
        )
      ));
  }

  // ===== DOCUMENT OPERATIONS =====

  async getStrataDocuments(strataId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.documents)
      .where(eq(schema.documents.strataId, strataId))
      .orderBy(desc(schema.documents.createdAt));
  }

  async getFolderDocuments(folderId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.documents)
      .where(eq(schema.documents.folderId, folderId))
      .orderBy(desc(schema.documents.createdAt));
  }

  async searchDocuments(strataId: string, searchTerm: string): Promise<any[]> {
    return await db!.select()
      .from(schema.documents)
      .where(and(
        eq(schema.documents.strataId, strataId),
        or(
          ilike(schema.documents.title, `%${searchTerm}%`),
          ilike(schema.documents.description, `%${searchTerm}%`)
        )
      ));
  }

  async createDocument(documentData: any): Promise<any> {
    const now = new Date();
    const [doc] = await db!.insert(schema.documents).values({
      ...documentData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return doc;
  }

  async updateDocument(documentId: string, updates: any): Promise<any> {
    const [updated] = await db!.update(schema.documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.documents.id, documentId))
      .returning();
    if (!updated) throw new Error('Document not found');
    return updated;
  }

  async deleteDocument(documentId: string): Promise<void> {
    await db!.delete(schema.documents).where(eq(schema.documents.id, documentId));
  }

  // ===== MESSAGE OPERATIONS =====

  async getStrataMessages(strataId: string, userId: string): Promise<Message[]> {
    return await db!.select()
      .from(schema.messages)
      .where(eq(schema.messages.strataId, strataId))
      .orderBy(desc(schema.messages.createdAt));
  }

  async getMessagesByStrata(strataId: string): Promise<Message[]> {
    return await db!.select()
      .from(schema.messages)
      .where(eq(schema.messages.strataId, strataId))
      .orderBy(desc(schema.messages.createdAt));
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const now = new Date();
    // Filter out undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(messageData).filter(([_, value]) => value !== undefined)
    );

    const [message] = await db!.insert(schema.messages).values({
      ...cleanedData,
      createdAt: now,
      updatedAt: now,
    } as any).returning();
    return message;
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    // Delete messages that are part of the conversation and involve the user
    await db!.delete(schema.messages)
      .where(and(
        or(
          eq(schema.messages.id, conversationId),
          eq(schema.messages.conversationId, conversationId),
          eq(schema.messages.parentMessageId, conversationId)
        ),
        or(
          eq(schema.messages.senderId, userId),
          eq(schema.messages.recipientId, userId)
        )
      ));
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const result = await db!.select().from(schema.messages).where(eq(schema.messages.id, messageId)).limit(1);
    if (!result[0]) throw new Error(`Message ${messageId} not found`);
    if (result[0].recipientId !== userId) {
      throw new Error(`User ${userId} is not authorized to mark this message as read`);
    }

    await db!.update(schema.messages)
      .set({ isRead: true, readAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.messages.id, messageId));
  }

  // ===== ANNOUNCEMENT OPERATIONS =====

  async getStrataAnnouncements(strataId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.announcements)
      .where(eq(schema.announcements.strataId, strataId))
      .orderBy(desc(schema.announcements.createdAt));
  }

  async getAnnouncement(announcementId: string): Promise<any> {
    const result = await db!.select()
      .from(schema.announcements)
      .where(eq(schema.announcements.id, announcementId))
      .limit(1);
    return result[0] ?? null;
  }

  async createAnnouncement(data: any): Promise<any> {
    const now = new Date();
    const [announcement] = await db!.insert(schema.announcements).values({
      ...data,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return announcement;
  }

  async updateAnnouncement(announcementId: string, data: any): Promise<any> {
    const [updated] = await db!.update(schema.announcements)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.announcements.id, announcementId))
      .returning();
    if (!updated) throw new Error('Announcement not found');
    return updated;
  }

  async deleteAnnouncement(announcementId: string): Promise<void> {
    await db!.delete(schema.announcements).where(eq(schema.announcements.id, announcementId));
  }

  async markAnnouncementAsRead(announcementId: string, userId: string): Promise<any> {
    // PostgreSQL doesn't have arrayUnion like Firestore
    // We'll use a jsonb approach or a separate read tracking table
    // For now, we update via raw SQL to append to a readBy array stored as jsonb
    const result = await db!.select()
      .from(schema.announcements)
      .where(eq(schema.announcements.id, announcementId))
      .limit(1);

    if (!result[0]) throw new Error('Announcement not found');

    // Since announcements table doesn't have readBy column, we'll store it differently
    // For compatibility, just return the announcement
    const [updated] = await db!.update(schema.announcements)
      .set({ updatedAt: new Date() })
      .where(eq(schema.announcements.id, announcementId))
      .returning();

    return updated;
  }

  // ===== NOTIFICATION OPERATIONS =====

  async getDismissedNotifications(strataId: string, userId: string): Promise<Notification[]> {
    return await db!.select()
      .from(schema.notifications)
      .where(and(
        eq(schema.notifications.strataId, strataId),
        eq(schema.notifications.userId, userId),
        eq(schema.notifications.isRead, true)
      ));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db!.insert(schema.notifications).values({
      ...notificationData,
      createdAt: new Date(),
    }).returning();

    // Send email notification asynchronously
    this.sendEmailForNotification(notification).catch(error => {
      console.error('Failed to send email notification:', error);
    });

    return notification;
  }

  private async sendEmailForNotification(notification: Notification): Promise<void> {
    try {
      const user = await this.getUser(notification.userId);
      if (!user?.email) return;

      const strataDoc = await this.getStrata(notification.strataId);
      if (!strataDoc) return;

      const emailData: NotificationEmailData = {
        userId: notification.userId,
        userEmail: user.email,
        strataId: notification.strataId,
        strataName: strataDoc.name || 'Your Strata',
        notificationType: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: (notification as any).metadata || {}
      };

      await sendNotificationEmail(emailData);
    } catch (error) {
      console.error('Error sending email for notification:', error);
    }
  }

  async getUserNotifications(userId: string, strataId?: string): Promise<any[]> {
    const conditions = [eq(schema.notifications.userId, userId)];
    if (strataId) {
      conditions.push(eq(schema.notifications.strataId, strataId));
    }

    return await db!.select()
      .from(schema.notifications)
      .where(and(...conditions))
      .orderBy(desc(schema.notifications.createdAt))
      .limit(20);
  }

  async markNotificationAsRead(notificationId: string): Promise<any> {
    await db!.update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.id, notificationId));
    return { success: true, message: 'Notification marked as read' };
  }

  async getUserDismissedNotifications(userId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.dismissedNotifications)
      .where(eq(schema.dismissedNotifications.userId, userId));
  }

  async dismissNotification(notificationData: any): Promise<any> {
    const [dismissed] = await db!.insert(schema.dismissedNotifications).values({
      userId: notificationData.userId,
      notificationId: notificationData.notificationId,
      notificationType: notificationData.notificationType,
      dismissedAt: new Date(),
    }).returning();
    return dismissed;
  }

  // ===== MEETING OPERATIONS =====

  async getStrataMeetings(strataId: string): Promise<Meeting[]> {
    return await db!.select()
      .from(schema.meetings)
      .where(eq(schema.meetings.strataId, strataId))
      .orderBy(desc(schema.meetings.scheduledAt));
  }

  async createMeeting(meetingData: InsertMeeting): Promise<Meeting> {
    const now = new Date();
    const [meeting] = await db!.insert(schema.meetings).values({
      ...meetingData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return meeting;
  }

  async getMeeting(meetingId: string): Promise<Meeting | undefined> {
    const result = await db!.select()
      .from(schema.meetings)
      .where(eq(schema.meetings.id, meetingId))
      .limit(1);
    return result[0] ?? undefined;
  }

  async updateMeeting(meetingId: string, updates: any): Promise<Meeting> {
    const [updated] = await db!.update(schema.meetings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.meetings.id, meetingId))
      .returning();
    if (!updated) throw new Error('Meeting not found');
    return updated;
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    await db!.delete(schema.meetings).where(eq(schema.meetings.id, meetingId));
  }

  // ===== MAINTENANCE REQUEST OPERATIONS =====

  async getStrataMaintenanceRequests(strataId: string): Promise<MaintenanceRequest[]> {
    return await db!.select()
      .from(schema.maintenanceRequests)
      .where(eq(schema.maintenanceRequests.strataId, strataId));
  }

  async createMaintenanceRequest(requestData: any): Promise<any> {
    const now = new Date();
    const [request] = await db!.insert(schema.maintenanceRequests).values({
      ...requestData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return request;
  }

  async updateMaintenanceRequest(requestId: string, updateData: any): Promise<any> {
    const [updated] = await db!.update(schema.maintenanceRequests)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.maintenanceRequests.id, requestId))
      .returning();
    if (!updated) throw new Error('Maintenance request not found after update');
    return updated;
  }

  // ===== MAINTENANCE PROJECT OPERATIONS =====

  async createMaintenanceProject(projectData: any): Promise<any> {
    const now = new Date();
    const [project] = await db!.insert(schema.maintenanceProjects).values({
      ...projectData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return project;
  }

  async updateMaintenanceProject(projectId: string, updateData: any): Promise<any> {
    const [updated] = await db!.update(schema.maintenanceProjects)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.maintenanceProjects.id, projectId))
      .returning();
    if (!updated) throw new Error('Maintenance project not found after update');
    return updated;
  }

  async deleteMaintenanceProject(projectId: string): Promise<void> {
    await db!.delete(schema.maintenanceProjects).where(eq(schema.maintenanceProjects.id, projectId));
  }

  // ===== REPAIR REQUEST OPERATIONS =====

  async getRepairRequests(strataId: string, filters?: {
    status?: string;
    severity?: string;
    area?: string;
    submittedBy?: string;
  }): Promise<any[]> {
    const conditions = [eq(schema.repairRequests.strataId, strataId)];

    if (filters?.status) {
      conditions.push(eq(schema.repairRequests.status, filters.status));
    }
    if (filters?.severity) {
      conditions.push(eq(schema.repairRequests.severity, filters.severity));
    }
    if (filters?.area) {
      conditions.push(eq(schema.repairRequests.area, filters.area));
    }

    return await db!.select()
      .from(schema.repairRequests)
      .where(and(...conditions))
      .orderBy(desc(schema.repairRequests.createdAt));
  }

  async getRepairRequest(id: string): Promise<any | null> {
    const result = await db!.select()
      .from(schema.repairRequests)
      .where(eq(schema.repairRequests.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async createRepairRequest(requestData: any): Promise<any> {
    const now = new Date();
    const [request] = await db!.insert(schema.repairRequests).values({
      ...requestData,
      status: 'suggested',
      statusHistory: [{
        status: 'suggested',
        changedBy: requestData.submittedBy?.userId,
        changedAt: now.toISOString(),
      }],
      createdAt: now,
      updatedAt: now,
    }).returning();
    return request;
  }

  async updateRepairRequest(id: string, updates: any, userId: string): Promise<any> {
    const existing = await this.getRepairRequest(id);
    if (!existing) throw new Error('Repair request not found');

    // If status is changing, append to status history
    let statusHistory = (existing.statusHistory as any[]) || [];
    if (updates.status && updates.status !== existing.status) {
      statusHistory = [...statusHistory, {
        status: updates.status,
        changedBy: userId,
        changedAt: new Date().toISOString(),
      }];
    }

    const [updated] = await db!.update(schema.repairRequests)
      .set({
        ...updates,
        statusHistory,
        updatedAt: new Date(),
      })
      .where(eq(schema.repairRequests.id, id))
      .returning();

    if (!updated) throw new Error('Repair request not found after update');
    return updated;
  }

  async deleteRepairRequest(id: string): Promise<void> {
    await db!.delete(schema.repairRequests).where(eq(schema.repairRequests.id, id));
  }

  async getRepairRequestStats(strataId: string): Promise<any> {
    const requests = await db!.select()
      .from(schema.repairRequests)
      .where(eq(schema.repairRequests.strataId, strataId));

    return {
      total: requests.length,
      suggested: requests.filter(r => r.status === 'suggested').length,
      approved: requests.filter(r => r.status === 'approved').length,
      planned: requests.filter(r => r.status === 'planned').length,
      scheduled: requests.filter(r => r.status === 'scheduled').length,
      inProgress: requests.filter(r => r.status === 'in-progress').length,
      completed: requests.filter(r => r.status === 'completed').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      emergency: requests.filter(r => r.severity === 'emergency').length,
      high: requests.filter(r => r.severity === 'high').length,
      totalEstimatedCost: requests.reduce((sum, r) => sum + parseFloat(r.estimatedCost || '0'), 0),
      totalActualCost: requests.reduce((sum, r) => sum + parseFloat(r.actualCost || '0'), 0),
    };
  }

  // ===== FUND OPERATIONS =====

  async getStrataFunds(strataId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.funds)
      .where(eq(schema.funds.strataId, strataId))
      .orderBy(desc(schema.funds.createdAt));
  }

  async createFund(data: any): Promise<any> {
    const now = new Date();
    const [fund] = await db!.insert(schema.funds).values({
      ...data,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return fund;
  }

  async updateFund(fundId: string, data: any): Promise<any> {
    const [updated] = await db!.update(schema.funds)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.funds.id, fundId))
      .returning();
    if (!updated) throw new Error('Fund not found');
    return updated;
  }

  async deleteFund(fundId: string): Promise<void> {
    await db!.delete(schema.funds).where(eq(schema.funds.id, fundId));
  }

  async createFundTransaction(data: any): Promise<any> {
    const now = new Date();
    const [transaction] = await db!.insert(schema.fundTransactions).values({
      ...data,
      createdAt: now,
    }).returning();
    return transaction;
  }

  // ===== PAYMENT REMINDER OPERATIONS =====

  async getStrataPaymentReminders(strataId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.paymentReminders)
      .where(eq(schema.paymentReminders.strataId, strataId))
      .orderBy(desc(schema.paymentReminders.createdAt));
  }

  async createPaymentReminder(reminderData: any): Promise<any> {
    const now = new Date();
    const [reminder] = await db!.insert(schema.paymentReminders).values({
      ...reminderData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return reminder;
  }

  async updatePaymentReminder(reminderId: string, updateData: any): Promise<any> {
    const [updated] = await db!.update(schema.paymentReminders)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(schema.paymentReminders.id, reminderId))
      .returning();
    if (!updated) throw new Error('Payment reminder not found after update');
    return updated;
  }

  async deletePaymentReminder(reminderId: string): Promise<void> {
    await db!.delete(schema.paymentReminders).where(eq(schema.paymentReminders.id, reminderId));
  }

  // ===== REPORT OPERATIONS =====

  async getStrataReports(strataId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.reports)
      .where(eq(schema.reports.strataId, strataId))
      .orderBy(desc(schema.reports.createdAt));
  }

  async createReport(reportData: any): Promise<any> {
    const now = new Date();
    const [report] = await db!.insert(schema.reports).values({
      ...reportData,
      createdAt: now,
      generatedAt: now,
    }).returning();
    return report;
  }

  async getReport(reportId: string): Promise<any> {
    const result = await db!.select()
      .from(schema.reports)
      .where(eq(schema.reports.id, reportId))
      .limit(1);
    return result[0] ?? null;
  }

  async updateReport(reportId: string, updates: any): Promise<any> {
    const [updated] = await db!.update(schema.reports)
      .set(updates)
      .where(eq(schema.reports.id, reportId))
      .returning();
    if (!updated) throw new Error('Report not found');
    return updated;
  }

  async deleteReport(reportId: string): Promise<void> {
    await db!.delete(schema.reports).where(eq(schema.reports.id, reportId));
  }

  async generateFinancialReport(strataId: string, dateRange: { start: string; end: string }): Promise<any> {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    const expenses = await db!.select()
      .from(schema.expenses)
      .where(eq(schema.expenses.strataId, strataId));

    const filteredExpenses = expenses.filter(e => {
      const d = e.createdAt ? new Date(e.createdAt) : new Date(0);
      return d >= startDate && d <= endDate;
    });

    const funds = await db!.select()
      .from(schema.funds)
      .where(eq(schema.funds.strataId, strataId));

    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);
    const totalFunds = funds.reduce((sum, f) => sum + parseFloat(f.balance || '0'), 0);

    return {
      dateRange,
      summary: { totalExpenses, totalFunds, numberOfExpenses: filteredExpenses.length, numberOfFunds: funds.length },
      expenses: filteredExpenses.map(e => ({
        id: e.id, description: e.description, amount: e.amount,
        category: e.category, date: e.createdAt,
      })),
      funds: funds.map(f => ({
        id: f.id, name: f.name, type: f.type,
        currentBalance: f.balance, targetAmount: f.target,
      })),
    };
  }

  async generateMeetingMinutesReport(strataId: string, dateRange?: { start: string; end: string }): Promise<any> {
    let meetings = await db!.select()
      .from(schema.meetings)
      .where(eq(schema.meetings.strataId, strataId));

    if (dateRange) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      meetings = meetings.filter(m => {
        const d = new Date(m.scheduledAt || m.meetingDate || 0);
        return d >= startDate && d <= endDate;
      });
    }

    return {
      dateRange: dateRange || { start: 'All time', end: 'All time' },
      summary: {
        totalMeetings: meetings.length,
        meetingTypes: meetings.reduce((acc, m) => {
          const type = m.meetingType || 'general_meeting';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      meetings: meetings.map(m => ({
        id: m.id, title: m.title, type: m.meetingType,
        date: m.scheduledAt || m.meetingDate, location: m.location,
        agenda: m.agenda, minutes: m.minutes, transcription: m.transcription,
      })),
    };
  }

  async generateCommunicationsReport(strataId: string, dateRange?: { start: string; end: string }): Promise<any> {
    let announcementsList = await db!.select()
      .from(schema.announcements)
      .where(eq(schema.announcements.strataId, strataId));

    let messagesList = await db!.select()
      .from(schema.messages)
      .where(eq(schema.messages.strataId, strataId));

    if (dateRange) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      announcementsList = announcementsList.filter(a => {
        const d = a.createdAt ? new Date(a.createdAt) : new Date(0);
        return d >= startDate && d <= endDate;
      });
      messagesList = messagesList.filter(m => {
        const d = m.createdAt ? new Date(m.createdAt) : new Date(0);
        return d >= startDate && d <= endDate;
      });
    }

    return {
      dateRange: dateRange || { start: 'All time', end: 'All time' },
      summary: {
        totalAnnouncements: announcementsList.length,
        totalMessages: messagesList.length,
        totalCommunications: announcementsList.length + messagesList.length,
      },
      announcements: announcementsList.map(a => ({
        id: a.id, title: a.title, priority: a.priority, createdAt: a.createdAt,
      })),
      messages: messagesList.map(m => ({
        id: m.id, subject: m.subject, createdAt: m.createdAt,
      })),
    };
  }

  async generateMaintenanceReport(strataId: string, dateRange?: { start: string; end: string }): Promise<any> {
    let requests = await db!.select()
      .from(schema.maintenanceRequests)
      .where(eq(schema.maintenanceRequests.strataId, strataId));

    if (dateRange) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      requests = requests.filter(r => {
        const d = r.createdAt ? new Date(r.createdAt) : new Date(0);
        return d >= startDate && d <= endDate;
      });
    }

    const statusGroups = requests.reduce((acc, r) => {
      const status = r.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityGroups = requests.reduce((acc, r) => {
      const priority = r.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      dateRange: dateRange || { start: 'All time', end: 'All time' },
      summary: { totalRequests: requests.length, byStatus: statusGroups, byPriority: priorityGroups },
      requests: requests.map(r => ({
        id: r.id, title: r.title, description: r.description,
        priority: r.priority, status: r.status, createdAt: r.createdAt,
      })),
    };
  }

  async generateHomeSalePackage(strataId: string): Promise<any> {
    const expenses = await db!.select().from(schema.expenses).where(eq(schema.expenses.strataId, strataId));
    const meetings = await db!.select().from(schema.meetings).where(eq(schema.meetings.strataId, strataId));
    const docs = await db!.select().from(schema.documents).where(eq(schema.documents.strataId, strataId));

    return {
      generatedDate: new Date().toISOString(),
      summary: {
        totalDocuments: docs.length,
        recentMeetings: meetings.slice(0, 5),
        recentExpenses: expenses.slice(0, 10),
      },
      documents: docs.map(d => ({ id: d.id, title: d.title, type: d.type, uploadDate: d.createdAt })),
      financialSummary: {
        recentExpenses: expenses.slice(0, 20).map(e => ({
          description: e.description, amount: e.amount, date: e.createdAt, category: e.category,
        })),
      },
      meetingSummary: {
        recentMeetings: meetings.slice(0, 10).map(m => ({
          title: m.title, date: m.scheduledAt || m.meetingDate, type: m.meetingType,
        })),
      },
    };
  }

  // ===== RESIDENT DIRECTORY OPERATIONS =====

  async getStrataResidentDirectory(strataId: string): Promise<any[]> {
    return await db!.select()
      .from(schema.residentDirectory)
      .where(eq(schema.residentDirectory.strataId, strataId));
  }

  async createResidentDirectoryEntry(entryData: any): Promise<any> {
    const now = new Date();
    const [entry] = await db!.insert(schema.residentDirectory).values({
      ...entryData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return entry;
  }

  async updateResidentDirectoryEntry(id: string, updates: any): Promise<any> {
    const [updated] = await db!.update(schema.residentDirectory)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(schema.residentDirectory.id, id))
      .returning();
    if (!updated) throw new Error('Resident directory entry not found');
    return updated;
  }

  // ===== PENDING REGISTRATION OPERATIONS =====

  async createPendingRegistration(registrationData: any): Promise<any> {
    const now = new Date();
    const [registration] = await db!.insert(schema.pendingStrataRegistrations).values({
      ...registrationData,
      createdAt: now,
      updatedAt: now,
    }).returning();
    return registration;
  }

  // ===== ADMIN / METRICS OPERATIONS =====

  async getStrataMetrics(strataId: string): Promise<any> {
    try {
      const [unitsResult, pendingExpenses, pendingMaintenance, pendingQuotes] = await Promise.all([
        db!.select({ count: count() }).from(schema.units).where(eq(schema.units.strataId, strataId)),
        db!.select({ count: count() }).from(schema.expenses).where(and(
          eq(schema.expenses.strataId, strataId),
          eq(schema.expenses.status, 'pending')
        )),
        db!.select({ count: count() }).from(schema.maintenanceRequests).where(and(
          eq(schema.maintenanceRequests.strataId, strataId),
          inArray(schema.maintenanceRequests.status, ['open', 'in_progress'])
        )),
        db!.select({ count: count() }).from(schema.quotes).where(and(
          eq(schema.quotes.strataId, strataId),
          eq(schema.quotes.status, 'pending')
        )),
      ]);

      const paymentReminders = await this.getStrataPaymentReminders(strataId);
      const now = new Date();
      let outstandingTotal = 0;
      paymentReminders.forEach((reminder: any) => {
        if (reminder.dueDate && reminder.status !== 'paid' && reminder.status !== 'cancelled') {
          const dueDate = new Date(reminder.dueDate);
          if (dueDate < now) {
            outstandingTotal += parseFloat(reminder.amount || '0');
          }
        }
      });

      const totalPendingApprovals = (pendingExpenses[0]?.count || 0) + (pendingQuotes[0]?.count || 0);

      return {
        totalProperties: unitsResult[0]?.count || 0,
        outstandingFees: `$${outstandingTotal.toFixed(2)}`,
        pendingApprovals: totalPendingApprovals,
        openMaintenance: pendingMaintenance[0]?.count || 0,
      };
    } catch (error) {
      console.error('Error getting strata metrics:', error);
      return {
        totalProperties: 0,
        outstandingFees: '$0.00',
        pendingApprovals: 0,
        openMaintenance: 0,
      };
    }
  }

  async getPendingApprovals(strataId: string): Promise<any[]> {
    const [pendingExpenses, pendingMaintenance, pendingQuotes] = await Promise.all([
      db!.select().from(schema.expenses).where(and(
        eq(schema.expenses.strataId, strataId),
        eq(schema.expenses.status, 'pending')
      )),
      db!.select().from(schema.maintenanceRequests).where(and(
        eq(schema.maintenanceRequests.strataId, strataId),
        eq(schema.maintenanceRequests.status, 'pending')
      )),
      db!.select().from(schema.quotes).where(and(
        eq(schema.quotes.strataId, strataId),
        eq(schema.quotes.status, 'pending')
      )),
    ]);

    return [
      ...pendingExpenses.map(e => ({ ...e, type: 'expense' })),
      ...pendingMaintenance.map(m => ({ ...m, type: 'maintenance' })),
      ...pendingQuotes.map(q => ({ ...q, type: 'quote' })),
    ];
  }
}

export const postgresStorage = new PostgresStorage();
