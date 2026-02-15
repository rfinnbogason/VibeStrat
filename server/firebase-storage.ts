import { db, collections, convertTimestamp, convertTimestamps, createDocumentId } from './firebase-db';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { sendNotificationEmail, type NotificationEmailData } from './email-service.js';
import type {
  User, InsertUser,
  Strata, InsertStrata,
  UserStrataAccess, InsertUserStrataAccess,
  Unit, InsertUnit,
  Expense, InsertExpense,
  Vendor, InsertVendor,
  Quote, InsertQuote,
  Meeting, InsertMeeting,
  Document, InsertDocument,
  MaintenanceRequest, InsertMaintenanceRequest,
  Announcement, InsertAnnouncement,
  Message, InsertMessage,
  Notification, InsertNotification,
  Fund, InsertFund,
  PaymentReminder, InsertPaymentReminder,
  PendingStrataRegistration, InsertPendingStrataRegistration
} from '@shared/schema';

export class FirebaseStorage {

  async getStrataExpenses(strataId: string): Promise<any[]> {
    try {
      const snapshot = await db.collection('expenses')
        .where('strataId', '==', strataId)
        .get();

      // Sort client-side to avoid Firestore composite index requirement
      const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      expenses.sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime; // Descending order
      });

      return expenses;
    } catch (error) {
      console.error('Error getting strata expenses:', error);
      throw error;
    }
  }

  async createExpense(expenseData: any): Promise<any> {
    try {
      const docRef = await db.collection('expenses').add(expenseData);
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  async updateExpense(expenseId: string, updateData: any): Promise<any> {
    try {
      const docRef = db.collection('expenses').doc(expenseId);

      await docRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      if (!updated.exists) {
        throw new Error('Expense not found after update');
      }

      return { id: updated.id, ...convertTimestamps(updated.data()) };
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async deleteExpense(expenseId: string): Promise<void> {
    try {
      await db.collection('expenses').doc(expenseId).delete();
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const doc = await db.collection(collections.users).doc(id).get();
    if (!doc.exists) return undefined;
    
    const data = doc.data()!;
    return {
      ...data,
      id: doc.id,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      lastLoginAt: data.lastLoginAt ? convertTimestamp(data.lastLoginAt) : null,
    } as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const query = await db.collection(collections.users)
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (query.empty) return undefined;
    
    const doc = query.docs[0];
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      lastLoginAt: data.lastLoginAt ? convertTimestamp(data.lastLoginAt) : null,
    } as User;
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Use the provided id (Firebase UID) or create a new one
    const id = userData.id || createDocumentId();
    const now = FieldValue.serverTimestamp();

    const docData = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    // Write the user document to Firestore
    await db.collection(collections.users).doc(id).set(docData);

    // Wait for Firestore to commit and then read back the document
    // This ensures the user is actually retrievable before we return
    const createdDoc = await db.collection(collections.users).doc(id).get();

    if (!createdDoc.exists) {
      throw new Error('Failed to create user document');
    }

    const createdData = createdDoc.data()!;
    return {
      ...createdData,
      id,
      createdAt: convertTimestamp(createdData.createdAt),
      updatedAt: convertTimestamp(createdData.updatedAt),
    } as User;
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const updateData = {
      ...userData,
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    await db.collection(collections.users).doc(id).update(updateData);
    
    const updated = await this.getUser(id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    await db.collection(collections.users).doc(id).delete();
  }

  async getAllUsers(): Promise<User[]> {
    const query = await db.collection(collections.users).get();
    return query.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        lastLoginAt: data.lastLoginAt ? convertTimestamp(data.lastLoginAt) : null,
      } as User;
    });
  }

  // Strata operations
  async getStrata(id: string): Promise<Strata | undefined> {
    const doc = await db.collection(collections.strata).doc(id).get();
    if (!doc.exists) return undefined;
    
    const data = doc.data()!;
    return {
      ...data,
      id: doc.id,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as Strata;
  }

  async getAllStrata(): Promise<Strata[]> {
    try {
      const query = await db.collection(collections.strata).get();
      return query.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Strata;
      });
    } catch (error) {
      console.error('Firebase connection failed:', error.message);
      throw error;
    }
  }

  async createStrata(strataData: InsertStrata): Promise<Strata> {
    // Use the provided id or create a new one
    const id = (strataData as any).id || createDocumentId();
    const now = FieldValue.serverTimestamp();

    const docData = {
      ...strataData,
      createdAt: now,
      updatedAt: now,
    };

    // Write the strata document to Firestore
    await db.collection(collections.strata).doc(id).set(docData);

    // Wait for Firestore to commit and then read back the document
    // This ensures the strata is actually retrievable before we return
    const createdDoc = await db.collection(collections.strata).doc(id).get();

    if (!createdDoc.exists) {
      throw new Error('Failed to create strata document');
    }

    const createdData = createdDoc.data()!;
    return {
      ...createdData,
      id,
      createdAt: convertTimestamp(createdData.createdAt),
      updatedAt: convertTimestamp(createdData.updatedAt),
    } as Strata;
  }

  async updateStrata(id: string, strataData: Partial<InsertStrata>): Promise<Strata> {
    const updateData = {
      ...strataData,
      updatedAt: FieldValue.serverTimestamp(),
    };
    
    await db.collection(collections.strata).doc(id).update(updateData);
    
    const updated = await this.getStrata(id);
    if (!updated) throw new Error('Strata not found after update');
    return updated;
  }

  async deleteStrata(id: string): Promise<void> {
    // Delete all related documents in a batch
    const batch = db.batch();
    
    // Delete strata document
    batch.delete(db.collection(collections.strata).doc(id));
    
    // Delete all user access records
    const userAccess = await db.collection(collections.userStrataAccess)
      .where('strataId', '==', id)
      .get();
    userAccess.docs.forEach(doc => batch.delete(doc.ref));
    
    // Delete all related data
    const relatedCollections = [
      collections.units,
      collections.expenses,
      collections.vendors,
      collections.quotes,
      collections.meetings,
      collections.documents,
      collections.maintenanceRequests,
      collections.announcements,
      collections.messages,
      collections.notifications,
      collections.funds,
      collections.paymentReminders
    ];
    
    for (const collection of relatedCollections) {
      const docs = await db.collection(collection)
        .where('strataId', '==', id)
        .get();
      docs.docs.forEach(doc => batch.delete(doc.ref));
    }
    
    await batch.commit();
  }

  // User Strata Access operations
  async getUserStrataAccess(userId: string, strataId: string): Promise<UserStrataAccess | undefined> {
    try {
      const query = await db.collection(collections.userStrataAccess)
        .where('userId', '==', userId)
        .where('strataId', '==', strataId)
        .limit(1)
        .get();
      
      if (query.empty) return undefined;
      
      const doc = query.docs[0];
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
      } as UserStrataAccess;
    } catch (error) {
      console.error('Firebase connection failed:', error.message);
      throw error;
    }
  }

  async createUserStrataAccess(accessData: InsertUserStrataAccess): Promise<UserStrataAccess> {
    // Use the provided id or create a new one
    const id = (accessData as any).id || createDocumentId();
    const now = FieldValue.serverTimestamp();

    const docData = {
      ...accessData,
      createdAt: now,
    };

    // Write the user strata access document to Firestore
    await db.collection(collections.userStrataAccess).doc(id).set(docData);

    // Wait for Firestore to commit and then read back the document
    // This ensures the access record is actually retrievable before we return
    const createdDoc = await db.collection(collections.userStrataAccess).doc(id).get();

    if (!createdDoc.exists) {
      throw new Error('Failed to create user strata access document');
    }

    const createdData = createdDoc.data()!;
    return {
      ...createdData,
      id,
      createdAt: convertTimestamp(createdData.createdAt),
    } as UserStrataAccess;
  }

  async deleteUserStrataAccess(accessId: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting user strata access record: ${accessId}`);
      await db.collection(collections.userStrataAccess).doc(accessId).delete();
      console.log(`✅ Successfully deleted access record: ${accessId}`);
    } catch (error) {
      console.error(`❌ Error deleting access record: ${accessId}`, error);
      throw error;
    }
  }

  async updateUserStrataRole(userId: string, strataId: string, role: string): Promise<UserStrataAccess | undefined> {
    const query = await db.collection(collections.userStrataAccess)
      .where('userId', '==', userId)
      .where('strataId', '==', strataId)
      .limit(1)
      .get();
    
    if (query.empty) return undefined;
    
    const doc = query.docs[0];
    await doc.ref.update({ role });
    
    return await this.getUserStrataAccess(userId, strataId);
  }

  async getStrataUsers(strataId: string): Promise<any[]> {
    const accessQuery = await db.collection(collections.userStrataAccess)
      .where('strataId', '==', strataId)
      .get();
    
    const users = [];
    for (const accessDoc of accessQuery.docs) {
      const accessData = accessDoc.data();
      const user = await this.getUser(accessData.userId);
      if (user) {
        users.push({
          ...accessData,
          id: accessDoc.id,
          createdAt: convertTimestamp(accessData.createdAt),
          user
        });
      }
    }
    
    return users;
  }

  // Set must change password
  async setMustChangePassword(email: string): Promise<void> {
    const query = await db.collection(collections.users)
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (!query.empty) {
      const doc = query.docs[0];
      await doc.ref.update({ 
        mustChangePassword: true,
        updatedAt: FieldValue.serverTimestamp()
      });
    }
  }

  // Additional helper methods for existing functionality
  async getUsersByStrata(strataId: string): Promise<User[]> {
    const accessQuery = await db.collection(collections.userStrataAccess)
      .where('strataId', '==', strataId)
      .get();
    
    const users = [];
    for (const accessDoc of accessQuery.docs) {
      const accessData = accessDoc.data();
      const user = await this.getUser(accessData.userId);
      if (user) {
        users.push(user);
      }
    }
    
    return users;
  }

  async getUserStrata(userId: string): Promise<Strata[]> {
    const accessQuery = await db.collection(collections.userStrataAccess)
      .where('userId', '==', userId)
      .get();

    const strata = [];
    for (const accessDoc of accessQuery.docs) {
      const accessData = accessDoc.data();
      const strataDoc = await this.getStrata(accessData.strataId);
      if (strataDoc) {
        strata.push(strataDoc);
      }
    }

    return strata;
  }

  // Get all user strata assignments with full details (for admin page)
  async getUserStrataAssignments(userId: string): Promise<any[]> {
    const accessQuery = await db.collection(collections.userStrataAccess)
      .where('userId', '==', userId)
      .get();

    const assignments = [];
    for (const accessDoc of accessQuery.docs) {
      const accessData = accessDoc.data();
      const strataDoc = await this.getStrata(accessData.strataId);
      if (strataDoc) {
        assignments.push({
          id: accessDoc.id,
          userId: accessData.userId,
          strataId: accessData.strataId,
          role: accessData.role,
          canPostAnnouncements: accessData.canPostAnnouncements,
          strata: strataDoc,
          createdAt: convertTimestamp(accessData.createdAt),
        });
      }
    }

    return assignments;
  }

  // Check admin access
  async checkUserStrataAdminAccess(userId: string, strataId: string): Promise<boolean> {
    const userAccess = await this.getUserStrataAccess(userId, strataId);
    if (!userAccess) return false;
    
    const adminRoles = ['chairperson', 'property_manager', 'treasurer', 'secretary'];
    return adminRoles.includes(userAccess.role);
  }

  // Unit operations
  async createUnit(unitData: InsertUnit): Promise<Unit> {
    try {
      const id = createDocumentId();
      const newUnit = {
        ...unitData,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection(collections.units).doc(id).set(newUnit);
      console.log(`📋 Created unit ${unitData.unitNumber} in strata ${unitData.strataId}`);
      
      return newUnit as Unit;
    } catch (error) {
      console.error('❌ Error creating unit:', error);
      throw error;
    }
  }

  async getStrataUnits(strataId: string): Promise<Unit[]> {
    try {
      console.log(`🔍 Getting units for strataId: ${strataId}`);
      
      // First try without any where clause to test basic connectivity
      const allSnapshot = await db.collection(collections.units).limit(1).get();
      console.log(`📊 Total units in collection: ${allSnapshot.size}`);
      
      // Now try with where clause but no ordering to avoid index issues
      const snapshot = await db.collection(collections.units)
        .where('strataId', '==', strataId)
        .get();
      
      console.log(`📊 Found ${snapshot.docs.length} units for strata ${strataId}`);
      
      if (snapshot.empty) {
        console.log(`📋 No units found for strata ${strataId}`);
        return [];
      }
      
      const units = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log(`📋 Unit found:`, { id: doc.id, unitNumber: data.unitNumber, unitType: data.unitType });
        return { 
          id: doc.id, 
          ...convertTimestamp(data) 
        };
      }) as Unit[];
      
      // Sort by unit number in memory
      const sortedUnits = units.sort((a, b) => {
        const aNum = parseInt(a.unitNumber) || 0;
        const bNum = parseInt(b.unitNumber) || 0;
        return aNum - bNum;
      });
      
      console.log(`✅ Returning ${sortedUnits.length} units for strata ${strataId}`);
      return sortedUnits;
    } catch (error) {
      console.error('❌ Error getting strata units:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error code:', error.code);
      
      // If there's an index error, return empty array for now
      if (error.code === 9) {
        console.log('📋 Index error - returning empty array for now');
        return [];
      }
      
      throw error;
    }
  }

  async updateUnit(unitId: string, updates: Partial<Unit>): Promise<Unit> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await db.collection(collections.units).doc(unitId).update(updateData);
      
      const updatedDoc = await db.collection(collections.units).doc(unitId).get();
      if (!updatedDoc.exists) {
        throw new Error('Unit not found');
      }
      
      return { id: updatedDoc.id, ...convertTimestamp(updatedDoc.data()) } as Unit;
    } catch (error) {
      console.error('❌ Error updating unit:', error);
      throw error;
    }
  }

  async deleteUnit(unitId: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting unit ${unitId}`);

      // Check if unit exists first
      const unitDoc = await db.collection(collections.units).doc(unitId).get();
      if (!unitDoc.exists) {
        throw new Error('Unit not found');
      }

      // Delete the unit document
      await db.collection(collections.units).doc(unitId).delete();

      console.log(`✅ Successfully deleted unit ${unitId}`);
    } catch (error) {
      console.error('❌ Error deleting unit:', error);
      throw error;
    }
  }

  // Vendor operations
  async getVendor(id: string): Promise<Vendor | undefined> {
    try {
      const doc = await db.collection(collections.vendors).doc(id).get();
      if (!doc.exists) return undefined;

      const data = doc.data()!;
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as Vendor;
    } catch (error) {
      console.error('❌ Error getting vendor:', error);
      throw error;
    }
  }

  async getVendorsByStrata(strataId: string): Promise<Vendor[]> {
    try {
      const snapshot = await db.collection(collections.vendors)
        .where('strataId', '==', strataId)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Vendor;
      });
    } catch (error) {
      console.error('❌ Error getting vendors by strata:', error);
      return [];
    }
  }

  async getAllVendors(): Promise<Vendor[]> {
    try {
      const snapshot = await db.collection(collections.vendors).get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Vendor;
      });
    } catch (error) {
      console.error('❌ Error getting all vendors:', error);
      return [];
    }
  }

  async createVendor(vendorData: InsertVendor): Promise<Vendor> {
    try {
      const id = createDocumentId();
      const now = FieldValue.serverTimestamp();

      const docData = {
        ...vendorData,
        createdAt: now,
        updatedAt: now,
      };

      await db.collection(collections.vendors).doc(id).set(docData);

      console.log(`✅ Created vendor ${vendorData.name} for strata ${vendorData.strataId}`);

      return {
        ...vendorData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Vendor;
    } catch (error) {
      console.error('❌ Error creating vendor:', error);
      throw error;
    }
  }

  async updateVendor(id: string, vendorData: Partial<InsertVendor>): Promise<Vendor> {
    try {
      const updateData = {
        ...vendorData,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await db.collection(collections.vendors).doc(id).update(updateData);

      const updated = await this.getVendor(id);
      if (!updated) throw new Error('Vendor not found after update');

      console.log(`✅ Updated vendor ${id}`);
      return updated;
    } catch (error) {
      console.error('❌ Error updating vendor:', error);
      throw error;
    }
  }

  async deleteVendor(id: string): Promise<void> {
    try {
      await db.collection(collections.vendors).doc(id).delete();
      console.log(`🗑️ Deleted vendor ${id}`);
    } catch (error) {
      console.error('❌ Error deleting vendor:', error);
      throw error;
    }
  }

  // Fee Tier operations
  async getStrataFeeTiers(strataId: string): Promise<any[]> {
    try {
      const snapshot = await db.collection('feeTiers')
        .where('strataId', '==', strataId)
        .orderBy('monthlyAmount', 'asc')
        .get();
      
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamp(doc.data()) 
      }));
    } catch (error) {
      console.error('❌ Error getting strata fee tiers:', error);
      // Return empty array if no fee tiers exist yet
      return [];
    }
  }

  async createFeeTier(feeTierData: any): Promise<any> {
    try {
      const id = createDocumentId();
      const newFeeTier = {
        ...feeTierData,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('feeTiers').doc(id).set(newFeeTier);
      console.log(`💰 Created fee tier ${feeTierData.name} for strata ${feeTierData.strataId}`);
      
      return newFeeTier;
    } catch (error) {
      console.error('❌ Error creating fee tier:', error);
      throw error;
    }
  }

  async updateFeeTier(feeTierId: string, updates: any): Promise<any> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await db.collection('feeTiers').doc(feeTierId).update(updateData);
      
      const updatedDoc = await db.collection('feeTiers').doc(feeTierId).get();
      if (!updatedDoc.exists) {
        throw new Error('Fee tier not found');
      }
      
      return { id: updatedDoc.id, ...convertTimestamp(updatedDoc.data()) };
    } catch (error) {
      console.error('❌ Error updating fee tier:', error);
      throw error;
    }
  }

  async deleteFeeTier(feeTierId: string): Promise<void> {
    try {
      await db.collection('feeTiers').doc(feeTierId).delete();
      console.log(`🗑️ Deleted fee tier ${feeTierId}`);
    } catch (error) {
      console.error('❌ Error deleting fee tier:', error);
      throw error;
    }
  }

  // Document Folder operations
  async getStrataDocumentFolders(strataId: string, parentFolderId?: string): Promise<any[]> {
    try {
      let query = db.collection('documentFolders')
        .where('strataId', '==', strataId);
      
      if (parentFolderId) {
        query = query.where('parentFolderId', '==', parentFolderId);
      } else {
        // Get root folders (where parentFolderId is null or undefined)
        query = query.where('parentFolderId', '==', null);
      }
      
      const snapshot = await query.get();
      
      const folders = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamps(doc.data()) 
      }));
      
      // Sort by name client-side to avoid index requirements
      folders.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      
      console.log(`📁 Found ${folders.length} folders for strata ${strataId}${parentFolderId ? ` in parent ${parentFolderId}` : ' (root level)'}`);
      return folders;
    } catch (error) {
      console.error('❌ Error getting document folders:', error);
      return [];
    }
  }

  async createDocumentFolder(folderData: any): Promise<any> {
    try {
      const id = createDocumentId();
      const newFolder = {
        ...folderData,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('documentFolders').doc(id).set(newFolder);
      console.log(`📁 Created folder ${folderData.name} for strata ${folderData.strataId}`);
      
      return newFolder;
    } catch (error) {
      console.error('❌ Error creating document folder:', error);
      throw error;
    }
  }

  async updateDocumentFolder(folderId: string, updates: any): Promise<any> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await db.collection('documentFolders').doc(folderId).update(updateData);
      
      const updatedDoc = await db.collection('documentFolders').doc(folderId).get();
      if (!updatedDoc.exists) {
        throw new Error('Document folder not found');
      }
      
      return { id: updatedDoc.id, ...convertTimestamp(updatedDoc.data()) };
    } catch (error) {
      console.error('❌ Error updating document folder:', error);
      throw error;
    }
  }

  async deleteDocumentFolder(folderId: string): Promise<void> {
    try {
      await db.collection('documentFolders').doc(folderId).delete();
      console.log(`🗑️ Deleted document folder ${folderId}`);
    } catch (error) {
      console.error('❌ Error deleting document folder:', error);
      throw error;
    }
  }

  async getDocumentFolder(folderId: string): Promise<any> {
    try {
      const doc = await db.collection('documentFolders').doc(folderId).get();
      if (!doc.exists) {
        throw new Error('Document folder not found');
      }
      return { id: doc.id, ...convertTimestamp(doc.data()) };
    } catch (error) {
      console.error('❌ Error getting document folder:', error);
      throw error;
    }
  }

  async searchDocumentFolders(strataId: string, searchTerm: string): Promise<any[]> {
    try {
      const snapshot = await db.collection('documentFolders')
        .where('strataId', '==', strataId)
        .get();
      
      const searchLower = searchTerm.toLowerCase();
      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...convertTimestamp(doc.data()) }))
        .filter(folder => 
          folder.name?.toLowerCase().includes(searchLower) ||
          folder.description?.toLowerCase().includes(searchLower)
        );
      
      return results;
    } catch (error) {
      console.error('❌ Error searching document folders:', error);
      return [];
    }
  }

  // Document operations
  async getStrataDocuments(strataId: string): Promise<any[]> {
    try {
      const snapshot = await db.collection('documents')
        .where('strataId', '==', strataId)
        .get();
      
      const documents = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamp(doc.data()) 
      }));
      
      // Sort by createdAt client-side to avoid index requirements
      documents.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });
      
      return documents;
    } catch (error) {
      console.error('❌ Error getting documents:', error);
      return [];
    }
  }

  async getFolderDocuments(folderId: string): Promise<any[]> {
    try {
      const snapshot = await db.collection('documents')
        .where('folderId', '==', folderId)
        .get();
      
      const documents = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamp(doc.data()) 
      }));
      
      // Sort by createdAt client-side to avoid index requirements
      documents.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });
      
      return documents;
    } catch (error) {
      console.error('❌ Error getting folder documents:', error);
      return [];
    }
  }

  async searchDocuments(strataId: string, searchTerm: string): Promise<any[]> {
    try {
      const snapshot = await db.collection('documents')
        .where('strataId', '==', strataId)
        .get();
      
      const searchLower = searchTerm.toLowerCase();
      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...convertTimestamp(doc.data()) }))
        .filter(doc => 
          doc.title?.toLowerCase().includes(searchLower) ||
          doc.description?.toLowerCase().includes(searchLower) ||
          doc.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      
      return results;
    } catch (error) {
      console.error('❌ Error searching documents:', error);
      return [];
    }
  }

  async createDocument(documentData: any): Promise<any> {
    try {
      const id = createDocumentId();
      const newDocument = {
        ...documentData,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.collection('documents').doc(id).set(newDocument);
      console.log(`📄 Created document ${documentData.title} for strata ${documentData.strataId}`);
      
      return newDocument;
    } catch (error) {
      console.error('❌ Error creating document:', error);
      throw error;
    }
  }

  async updateDocument(documentId: string, updates: any): Promise<any> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };
      
      await db.collection('documents').doc(documentId).update(updateData);
      
      const updatedDoc = await db.collection('documents').doc(documentId).get();
      if (!updatedDoc.exists) {
        throw new Error('Document not found');
      }
      
      return { id: updatedDoc.id, ...convertTimestamp(updatedDoc.data()) };
    } catch (error) {
      console.error('❌ Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      await db.collection('documents').doc(documentId).delete();
      console.log(`🗑️ Deleted document ${documentId}`);
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      throw error;
    }
  }

  // Message operations
  async getStrataMessages(strataId: string, userId: string): Promise<Message[]> {
    try {
      const snapshot = await db.collection('messages')
        .where('strataId', '==', strataId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      return [];
    }
  }

  async getMessagesByStrata(strataId: string): Promise<Message[]> {
    try {
      console.log('🔍 Firebase getMessagesByStrata - strataId:', strataId);

      // Use proper Firestore query with strataId filter for performance and data isolation
      // Note: Removed .orderBy() to avoid composite index requirement
      const snapshot = await db.collection('messages')
        .where('strataId', '==', strataId)
        .get();

      console.log(`✅ Found ${snapshot.docs.length} messages for strata ${strataId}`);

      // Sort client-side to avoid Firestore composite index requirement
      const messages = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
      messages.sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime; // Descending order (newest first)
      });

      return messages;
    } catch (error) {
      console.error('❌ Error fetching messages by strata:', error);
      return [];
    }
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    try {
      console.log('🔍 Firebase createMessage - Input data:', JSON.stringify(messageData, null, 2));

      // Filter out undefined values to prevent Firestore errors
      const cleanedData = Object.fromEntries(
        Object.entries(messageData).filter(([_, value]) => value !== undefined)
      );

      console.log('🔍 Firebase createMessage - Cleaned data:', JSON.stringify(cleanedData, null, 2));

      const finalData = {
        ...cleanedData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      console.log('🔍 Firebase createMessage - Final data before save:', JSON.stringify(finalData, null, 2));

      const messageRef = await db.collection('messages').add(finalData);

      const doc = await messageRef.get();
      return convertTimestamps({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('❌ Error creating message:', error);
      throw error;
    }
  }

  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    try {
      console.log(`🗑️ Attempting to delete conversation ${conversationId} for user ${userId}`);
      
      // Get all messages that match the conversation ID or are part of the same conversation thread
      const snapshot = await db.collection('messages').get();
      
      const batch = db.batch();
      let deletedCount = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`🔍 Checking message ${doc.id}:`, {
          id: doc.id,
          conversationId: data.conversationId,
          parentMessageId: data.parentMessageId,
          senderId: data.senderId,
          recipientId: data.recipientId,
          subject: data.subject
        });
        
        // Delete message if:
        // 1. It's the original message (doc.id === conversationId)
        // 2. It has conversationId matching the target
        // 3. It has parentMessageId matching the target
        // AND the user is involved (sender or recipient)
        const isPartOfConversation = 
          doc.id === conversationId || 
          data.conversationId === conversationId || 
          data.parentMessageId === conversationId;
          
        const userIsInvolved = data.senderId === userId || data.recipientId === userId;
        
        if (isPartOfConversation && userIsInvolved) {
          console.log(`🗑️ Marking message ${doc.id} for deletion`);
          batch.delete(doc.ref);
          deletedCount++;
        }
      });
      
      if (deletedCount > 0) {
        await batch.commit();
        console.log(`🗑️ Successfully deleted ${deletedCount} messages from conversation ${conversationId} for user ${userId}`);
      } else {
        console.log(`ℹ️ No messages found to delete for conversation ${conversationId} and user ${userId}`);
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      throw error;
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      console.log(`📖 Marking message ${messageId} as read for user ${userId}`);
      
      const messageRef = db.collection('messages').doc(messageId);
      const messageDoc = await messageRef.get();
      
      if (!messageDoc.exists) {
        throw new Error(`Message ${messageId} not found`);
      }
      
      const messageData = messageDoc.data();
      
      // Only allow the recipient to mark the message as read
      if (messageData.recipientId !== userId) {
        throw new Error(`User ${userId} is not authorized to mark this message as read`);
      }
      
      await messageRef.update({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`✅ Message ${messageId} marked as read for user ${userId}`);
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
      throw error;
    }
  }

  // Meeting operations
  async getStrataMeetings(strataId: string): Promise<Meeting[]> {
    try {
      console.log('🔍 Fetching meetings for strata:', strataId);
      
      // Remove ordering to avoid Firestore composite index requirement for now
      const snapshot = await db.collection('meetings')
        .where('strataId', '==', strataId)
        .get();
      
      const meetings = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
      
      console.log('📊 Found meetings:', meetings.length);
      console.log('🎯 Meetings data:', meetings);
      
      // Sort in JavaScript instead to avoid Firestore index issues
      return meetings.sort((a, b) => {
        const dateA = new Date(a.scheduledAt || a.meetingDate || 0);
        const dateB = new Date(b.scheduledAt || b.meetingDate || 0);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('❌ Error fetching meetings:', error);
      return [];
    }
  }

  async createMeeting(meetingData: InsertMeeting): Promise<Meeting> {
    try {
      console.log('🎯 Creating meeting with data:', meetingData);
      
      const meetingRef = await db.collection('meetings').add({
        ...meetingData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      const doc = await meetingRef.get();
      const meeting = convertTimestamps({ id: doc.id, ...doc.data() });
      
      console.log('✅ Meeting created successfully:', meeting.id);
      
      return meeting;
    } catch (error) {
      console.error('❌ Error creating meeting:', error);
      throw error;
    }
  }

  async getMeeting(meetingId: string): Promise<Meeting | undefined> {
    try {
      const doc = await db.collection('meetings').doc(meetingId).get();
      if (!doc.exists) {
        return undefined;
      }
      
      return convertTimestamps({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('❌ Error fetching meeting:', error);
      return undefined;
    }
  }

  async updateMeeting(meetingId: string, updates: any): Promise<Meeting> {
    try {
      const updateData = {
        ...updates,
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await db.collection('meetings').doc(meetingId).update(updateData);
      
      const updatedDoc = await db.collection('meetings').doc(meetingId).get();
      if (!updatedDoc.exists) {
        throw new Error('Meeting not found');
      }
      
      return convertTimestamps({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('❌ Error updating meeting:', error);
      throw error;
    }
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      console.log('🗑️ Firebase: Deleting meeting document:', meetingId);
      await db.collection('meetings').doc(meetingId).delete();
      console.log('✅ Firebase: Meeting document deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting meeting from Firebase:', error);
      throw error;
    }
  }

  // Notification operations
  async getDismissedNotifications(strataId: string, userId: string): Promise<Notification[]> {
    try {
      const snapshot = await db.collection('notifications')
        .where('strataId', '==', strataId)
        .where('userId', '==', userId)
        .where('dismissed', '==', true)
        .get();
      
      return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('❌ Error fetching dismissed notifications:', error);
      return [];
    }
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    try {
      const notificationRef = await db.collection('notifications').add({
        ...notificationData,
        dismissed: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      const doc = await notificationRef.get();
      const notification = convertTimestamps({ id: doc.id, ...doc.data() });

      // Send email notification asynchronously (don't block notification creation)
      this.sendEmailForNotification(notification).catch(error => {
        console.error('❌ Failed to send email notification, but notification was created:', error);
      });

      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification for a created notification
   * This respects user preferences and notification settings
   */
  private async sendEmailForNotification(notification: Notification): Promise<void> {
    try {
      // Get user email
      const userSnapshot = await db
        .collection('users')
        .where('id', '==', notification.userId)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        console.log(`⏭️  User not found for notification email: ${notification.userId}`);
        return;
      }

      const userData = userSnapshot.docs[0].data();
      if (!userData.email) {
        console.log(`⏭️  No email for user: ${notification.userId}`);
        return;
      }

      // Get strata name
      const strataSnapshot = await db
        .collection('strata')
        .where('id', '==', notification.strataId)
        .limit(1)
        .get();

      if (strataSnapshot.empty) {
        console.log(`⏭️  Strata not found for notification email: ${notification.strataId}`);
        return;
      }

      const strataData = strataSnapshot.docs[0].data();
      const strataName = strataData.name || 'Your Strata';

      // Prepare email data
      const emailData: NotificationEmailData = {
        userId: notification.userId,
        userEmail: userData.email,
        strataId: notification.strataId,
        strataName,
        notificationType: notification.type,
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata || {}
      };

      // Send email (this function handles all preference checking)
      await sendNotificationEmail(emailData);
    } catch (error) {
      console.error('❌ Error sending email for notification:', error);
      // Don't throw - we don't want to fail notification creation
    }
  }

  async getUserNotifications(userId: string, strataId?: string): Promise<any[]> {
    try {
      // Get all notifications (without ordering to avoid index requirement)
      const snapshot = await db.collection('notifications')
        .where('userId', '==', userId)
        .get();
      
      let notifications = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamp(doc.data()) 
      }));
      
      // Filter by strataId in memory if provided
      if (strataId) {
        notifications = notifications.filter(notification => 
          notification.strataId === strataId
        );
      }
      
      // Sort by createdAt in memory
      notifications.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order
      });
      
      console.log(`✅ Fetched ${notifications.length} notifications for user ${userId}${strataId ? ` in strata ${strataId}` : ''}`);
      return notifications.slice(0, 20);
    } catch (error) {
      console.error('❌ Error fetching user notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<any> {
    try {
      await db.collection('notifications').doc(notificationId).update({
        isRead: true,
        readAt: FieldValue.serverTimestamp()
      });
      
      console.log(`✅ Marked notification ${notificationId} as read`);
      return { success: true, message: 'Notification marked as read' };
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  // Report operations
  async getStrataReports(strataId: string): Promise<any[]> {
    try {
      const snapshot = await db.collection('reports')
        .where('strataId', '==', strataId)
        .get();
      
      const reports = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamp(doc.data()) 
      }));
      
      // Sort by createdAt in memory
      reports.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });
      
      console.log(`✅ Fetched ${reports.length} reports for strata ${strataId}`);
      return reports;
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      return [];
    }
  }

  async createReport(reportData: any): Promise<any> {
    try {
      const reportRef = await db.collection('reports').add({
        ...reportData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      const doc = await reportRef.get();
      const report = convertTimestamps({ id: doc.id, ...doc.data() });
      
      console.log(`📊 Created report ${reportData.title} for strata ${reportData.strataId}`);
      return report;
    } catch (error) {
      console.error('❌ Error creating report:', error);
      throw error;
    }
  }

  async getReport(reportId: string): Promise<any> {
    try {
      const doc = await db.collection('reports').doc(reportId).get();
      if (!doc.exists) {
        return null;
      }
      
      return convertTimestamps({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('❌ Error fetching report:', error);
      throw error;
    }
  }

  async updateReport(reportId: string, updates: any): Promise<any> {
    try {
      const updateData = {
        ...updates,
        updatedAt: FieldValue.serverTimestamp()
      };
      
      await db.collection('reports').doc(reportId).update(updateData);
      
      const updatedDoc = await db.collection('reports').doc(reportId).get();
      if (!updatedDoc.exists) {
        throw new Error('Report not found');
      }
      
      return convertTimestamps({ id: updatedDoc.id, ...updatedDoc.data() });
    } catch (error) {
      console.error('❌ Error updating report:', error);
      throw error;
    }
  }

  async deleteReport(reportId: string): Promise<void> {
    try {
      await db.collection('reports').doc(reportId).delete();
      console.log(`🗑️ Deleted report ${reportId}`);
    } catch (error) {
      console.error('❌ Error deleting report:', error);
      throw error;
    }
  }

  async generateFinancialReport(strataId: string, dateRange: { start: string; end: string }): Promise<any> {
    try {
      console.log(`📊 Generating financial report for strata ${strataId} from ${dateRange.start} to ${dateRange.end}`);
      
      // Get expenses within date range
      const expenseSnapshot = await db.collection('expenses')
        .where('strataId', '==', strataId)
        .get();
      
      const expenses = expenseSnapshot.docs
        .map(doc => convertTimestamps({ id: doc.id, ...doc.data() }))
        .filter(expense => {
          const expenseDate = new Date(expense.createdAt || expense.date || 0);
          const startDate = new Date(dateRange.start);
          const endDate = new Date(dateRange.end);
          return expenseDate >= startDate && expenseDate <= endDate;
        });

      // Get funds data
      const fundSnapshot = await db.collection('funds')
        .where('strataId', '==', strataId)
        .get();
      
      const funds = fundSnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));

      // Calculate totals
      const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || '0'), 0);
      const totalFunds = funds.reduce((sum, fund) => sum + parseFloat(fund.currentBalance || '0'), 0);

      const reportContent = {
        dateRange,
        summary: {
          totalExpenses,
          totalFunds,
          numberOfExpenses: expenses.length,
          numberOfFunds: funds.length
        },
        expenses: expenses.map(expense => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.createdAt || expense.date,
          vendor: expense.vendor
        })),
        funds: funds.map(fund => ({
          id: fund.id,
          name: fund.name,
          type: fund.type,
          currentBalance: fund.currentBalance,
          targetAmount: fund.targetAmount
        }))
      };

      console.log(`✅ Generated financial report with ${expenses.length} expenses and ${funds.length} funds`);
      return reportContent;
    } catch (error) {
      console.error('❌ Error generating financial report:', error);
      throw error;
    }
  }

  async generateMeetingMinutesReport(strataId: string, dateRange?: { start: string; end: string }): Promise<any> {
    try {
      console.log(`📊 Generating meeting minutes report for strata ${strataId}`);
      
      const snapshot = await db.collection('meetings')
        .where('strataId', '==', strataId)
        .get();
      
      let meetings = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
      
      // Filter by date range if provided
      if (dateRange) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        meetings = meetings.filter(meeting => {
          const meetingDate = new Date(meeting.scheduledAt || meeting.meetingDate || 0);
          return meetingDate >= startDate && meetingDate <= endDate;
        });
      }

      const reportContent = {
        dateRange: dateRange || { start: 'All time', end: 'All time' },
        summary: {
          totalMeetings: meetings.length,
          meetingTypes: meetings.reduce((acc, meeting) => {
            const type = meeting.type || 'general_meeting';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        meetings: meetings.map(meeting => ({
          id: meeting.id,
          title: meeting.title,
          type: meeting.type,
          date: meeting.scheduledAt || meeting.meetingDate,
          location: meeting.location,
          agenda: meeting.agenda,
          minutes: meeting.minutes,
          attendees: meeting.invitees || [],
          transcription: meeting.transcription
        }))
      };

      console.log(`✅ Generated meeting minutes report with ${meetings.length} meetings`);
      return reportContent;
    } catch (error) {
      console.error('❌ Error generating meeting minutes report:', error);
      throw error;
    }
  }

  async generateCommunicationsReport(strataId: string, dateRange?: { start: string; end: string }): Promise<any> {
    try {
      console.log(`📊 Generating communications report for strata ${strataId}`);

      // Get announcements
      const announcementsSnapshot = await db.collection('announcements')
        .where('strataId', '==', strataId)
        .get();

      let announcements = announcementsSnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));

      // Get messages
      const messagesSnapshot = await db.collection('messages')
        .where('strataId', '==', strataId)
        .get();

      let messages = messagesSnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));

      // Filter by date range if provided
      if (dateRange) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        announcements = announcements.filter(item => {
          const itemDate = new Date(item.createdAt || 0);
          return itemDate >= startDate && itemDate <= endDate;
        });

        messages = messages.filter(item => {
          const itemDate = new Date(item.createdAt || 0);
          return itemDate >= startDate && itemDate <= endDate;
        });
      }

      const reportContent = {
        dateRange: dateRange || { start: 'All time', end: 'All time' },
        summary: {
          totalAnnouncements: announcements.length,
          totalMessages: messages.length,
          totalCommunications: announcements.length + messages.length
        },
        announcements: announcements.map(a => ({
          id: a.id,
          title: a.title,
          message: a.message,
          priority: a.priority,
          createdAt: a.createdAt,
          expiresAt: a.expiresAt
        })),
        messages: messages.map(m => ({
          id: m.id,
          subject: m.subject,
          message: m.message,
          sender: m.senderName,
          createdAt: m.createdAt
        }))
      };

      console.log(`✅ Generated communications report with ${announcements.length} announcements and ${messages.length} messages`);
      return reportContent;
    } catch (error) {
      console.error('❌ Error generating communications report:', error);
      throw error;
    }
  }

  async generateMaintenanceReport(strataId: string, dateRange?: { start: string; end: string }): Promise<any> {
    try {
      console.log(`📊 Generating maintenance report for strata ${strataId}`);

      // Get maintenance requests
      const requestsSnapshot = await db.collection('maintenanceRequests')
        .where('strataId', '==', strataId)
        .get();

      let requests = requestsSnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));

      // Filter by date range if provided
      if (dateRange) {
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);

        requests = requests.filter(request => {
          const requestDate = new Date(request.createdAt || 0);
          return requestDate >= startDate && requestDate <= endDate;
        });
      }

      // Group by status
      const statusGroups = requests.reduce((acc, request) => {
        const status = request.status || 'pending';
        if (!acc[status]) acc[status] = [];
        acc[status].push(request);
        return acc;
      }, {} as Record<string, any[]>);

      // Group by priority
      const priorityGroups = requests.reduce((acc, request) => {
        const priority = request.priority || 'medium';
        if (!acc[priority]) acc[priority] = [];
        acc[priority].push(request);
        return acc;
      }, {} as Record<string, any[]>);

      const reportContent = {
        dateRange: dateRange || { start: 'All time', end: 'All time' },
        summary: {
          totalRequests: requests.length,
          byStatus: Object.keys(statusGroups).reduce((acc, status) => {
            acc[status] = statusGroups[status].length;
            return acc;
          }, {} as Record<string, number>),
          byPriority: Object.keys(priorityGroups).reduce((acc, priority) => {
            acc[priority] = priorityGroups[priority].length;
            return acc;
          }, {} as Record<string, number>)
        },
        requests: requests.map(request => ({
          id: request.id,
          title: request.title,
          description: request.description,
          category: request.category,
          priority: request.priority,
          status: request.status,
          unitNumber: request.unitNumber,
          createdAt: request.createdAt,
          completedAt: request.completedAt
        }))
      };

      console.log(`✅ Generated maintenance report with ${requests.length} requests`);
      return reportContent;
    } catch (error) {
      console.error('❌ Error generating maintenance report:', error);
      throw error;
    }
  }

  async generateHomeSalePackage(strataId: string): Promise<any> {
    try {
      console.log(`📊 Generating home sale package for strata ${strataId}`);
      
      // Get recent financial data
      const expenseSnapshot = await db.collection('expenses')
        .where('strataId', '==', strataId)
        .get();
      
      const expenses = expenseSnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
      
      // Get recent meetings
      const meetingSnapshot = await db.collection('meetings')
        .where('strataId', '==', strataId)
        .get();
      
      const meetings = meetingSnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
      
      // Get documents
      const documentSnapshot = await db.collection('documents')
        .where('strataId', '==', strataId)
        .get();
      
      const documents = documentSnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));

      const reportContent = {
        generatedDate: new Date().toISOString(),
        summary: {
          totalDocuments: documents.length,
          recentMeetings: meetings.slice(0, 5),
          recentExpenses: expenses.slice(0, 10)
        },
        documents: documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          type: doc.type,
          category: doc.category,
          uploadDate: doc.createdAt
        })),
        financialSummary: {
          recentExpenses: expenses.slice(0, 20).map(expense => ({
            description: expense.description,
            amount: expense.amount,
            date: expense.createdAt || expense.date,
            category: expense.category
          }))
        },
        meetingSummary: {
          recentMeetings: meetings.slice(0, 10).map(meeting => ({
            title: meeting.title,
            date: meeting.scheduledAt || meeting.meetingDate,
            type: meeting.type
          }))
        }
      };

      console.log(`✅ Generated home sale package with ${documents.length} documents`);
      return reportContent;
    } catch (error) {
      console.error('❌ Error generating home sale package:', error);
      throw error;
    }
  }

  // Additional missing methods for dashboard
  async getUserDismissedNotifications(userId: string): Promise<any[]> {
    try {
      const snapshot = await db.collection('dismissedNotifications')
        .where('userId', '==', userId)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamp(doc.data())
      }));
    } catch (error) {
      console.error('❌ Error getting user dismissed notifications:', error);
      return [];
    }
  }

  async dismissNotification(notificationData: any): Promise<any> {
    try {
      const docRef = await db.collection('dismissedNotifications').add({
        userId: notificationData.userId,
        notificationId: notificationData.notificationId,
        notificationType: notificationData.notificationType,
        dismissedAt: FieldValue.serverTimestamp(),
      });

      const doc = await docRef.get();
      return {
        id: doc.id,
        ...convertTimestamp(doc.data())
      };
    } catch (error) {
      console.error('❌ Error dismissing notification:', error);
      throw error;
    }
  }

  async getStrataMetrics(strataId: string): Promise<any> {
    try {
      // Get counts for various entities
      const [unitsSnapshot, pendingExpenses, pendingMaintenanceSnapshot, pendingQuotesSnapshot, paymentReminders] = await Promise.all([
        db.collection('units').where('strataId', '==', strataId).get(),
        db.collection('expenses').where('strataId', '==', strataId).where('status', '==', 'pending').get(),
        db.collection('maintenanceRequests').where('strataId', '==', strataId).where('status', 'in', ['open', 'in_progress']).get(),
        db.collection('quotes').where('strataId', '==', strataId).where('status', '==', 'pending').get(),
        this.getStrataPaymentReminders(strataId)
      ]);

      // Calculate outstanding fees based on overdue payment reminders
      const now = new Date();
      let outstandingTotal = 0;

      paymentReminders.forEach((reminder: any) => {
        if (reminder.dueDate && reminder.status !== 'paid' && reminder.status !== 'cancelled') {
          const dueDate = new Date(reminder.dueDate);
          if (dueDate < now) {
            outstandingTotal += reminder.amount || 0;
          }
        }
      });

      // Total pending approvals = pending expenses + pending quotes
      const totalPendingApprovals = pendingExpenses.size + pendingQuotesSnapshot.size;

      return {
        totalProperties: unitsSnapshot.size,
        outstandingFees: `$${outstandingTotal.toFixed(2)}`,
        pendingApprovals: totalPendingApprovals,
        openMaintenance: pendingMaintenanceSnapshot.size
      };
    } catch (error) {
      console.error('❌ Error getting strata metrics:', error);
      return {
        totalProperties: 0,
        outstandingFees: '$0.00',
        pendingApprovals: 0,
        openMaintenance: 0
      };
    }
  }

  async getStrataQuotes(strataId: string): Promise<Quote[]> {
    try {
      const snapshot = await db.collection('quotes')
        .where('strataId', '==', strataId)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as Quote;
      });
    } catch (error) {
      console.error('❌ Error getting strata quotes:', error);
      return [];
    }
  }

  async createQuote(quoteData: any): Promise<any> {
    try {
      const docRef = await db.collection(collections.quotes).add({
        ...quoteData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      const doc = await docRef.get();
      return { id: doc.id, ...convertTimestamps(doc.data()) };
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  }

  async updateQuote(quoteId: string, updateData: any): Promise<any> {
    try {
      const docRef = db.collection(collections.quotes).doc(quoteId);

      await docRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      if (!updated.exists) {
        throw new Error('Quote not found after update');
      }

      return { id: updated.id, ...convertTimestamps(updated.data()) };
    } catch (error) {
      console.error('Error updating quote:', error);
      throw error;
    }
  }

  async createQuoteProjectFolder(strataId: string, projectTitle: string, createdBy: string): Promise<any> {
    try {
      const folderData = {
        strataId,
        name: projectTitle,
        description: `Project folder for: ${projectTitle}`,
        parentFolderId: null,
        createdBy,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      const docRef = await db.collection(collections.documentFolders).add(folderData);
      const doc = await docRef.get();
      return { id: doc.id, ...convertTimestamps(doc.data()) };
    } catch (error) {
      console.error('Error creating quote project folder:', error);
      throw error;
    }
  }

  async getStrataMaintenanceRequests(strataId: string): Promise<MaintenanceRequest[]> {
    try {
      const snapshot = await db.collection('maintenanceRequests')
        .where('strataId', '==', strataId)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
        } as MaintenanceRequest;
      });
    } catch (error) {
      console.error('❌ Error getting strata maintenance requests:', error);
      return [];
    }
  }

  async createMaintenanceRequest(requestData: any): Promise<any> {
    try {
      const docRef = await db.collection('maintenanceRequests').add({
        ...requestData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      const doc = await docRef.get();
      return { id: doc.id, ...convertTimestamps(doc.data()) };
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      throw error;
    }
  }

  async updateMaintenanceRequest(requestId: string, updateData: any): Promise<any> {
    try {
      const docRef = db.collection('maintenanceRequests').doc(requestId);

      await docRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      if (!updated.exists) {
        throw new Error('Maintenance request not found after update');
      }

      return { id: updated.id, ...convertTimestamps(updated.data()) };
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      throw error;
    }
  }

  async createMaintenanceProject(projectData: any): Promise<any> {
    try {
      const docRef = await db.collection('maintenanceProjects').add({
        ...projectData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      const doc = await docRef.get();
      return { id: doc.id, ...convertTimestamps(doc.data()) };
    } catch (error) {
      console.error('Error creating maintenance project:', error);
      throw error;
    }
  }

  async updateMaintenanceProject(projectId: string, updateData: any): Promise<any> {
    try {
      const docRef = db.collection('maintenanceProjects').doc(projectId);

      await docRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      if (!updated.exists) {
        throw new Error('Maintenance project not found after update');
      }

      return { id: updated.id, ...convertTimestamps(updated.data()) };
    } catch (error) {
      console.error('Error updating maintenance project:', error);
      throw error;
    }
  }

  async deleteMaintenanceProject(projectId: string): Promise<void> {
    try {
      await db.collection('maintenanceProjects').doc(projectId).delete();
    } catch (error) {
      console.error('Error deleting maintenance project:', error);
      throw error;
    }
  }

  async getPendingApprovals(strataId: string): Promise<any[]> {
    try {
      // Get pending expenses, maintenance requests, and quotes
      const [expensesSnapshot, maintenanceSnapshot, quotesSnapshot] = await Promise.all([
        db.collection('expenses')
          .where('strataId', '==', strataId)
          .where('status', '==', 'pending')
          .get(),
        db.collection('maintenanceRequests')
          .where('strataId', '==', strataId)
          .where('status', '==', 'pending')
          .get(),
        db.collection('quotes')
          .where('strataId', '==', strataId)
          .where('status', '==', 'pending')
          .get()
      ]);

      const pendingExpenses = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'expense',
        ...convertTimestamp(doc.data())
      }));

      const pendingMaintenance = maintenanceSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'maintenance',
        ...convertTimestamp(doc.data())
      }));

      const pendingQuotes = quotesSnapshot.docs.map(doc => ({
        id: doc.id,
        type: 'quote',
        ...convertTimestamp(doc.data())
      }));

      return [...pendingExpenses, ...pendingMaintenance, ...pendingQuotes];
    } catch (error) {
      console.error('❌ Error getting pending approvals:', error);
      return [];
    }
  }

  // ===== ANNOUNCEMENT METHODS =====

  async getStrataAnnouncements(strataId: string) {
    try {
      console.log('📢 Getting announcements for strata:', strataId);

      const snapshot = await db
        .collection(collections.announcements)
        .where('strataId', '==', strataId)
        .get();

      const announcements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      }))
      // Sort in JavaScript to avoid needing Firestore composite index
      .sort((a: any, b: any) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return bTime - aTime; // Descending order (newest first)
      });

      console.log(`✅ Found ${announcements.length} announcements`);
      return announcements;
    } catch (error) {
      console.error('❌ Error getting strata announcements:', error);
      throw error;
    }
  }

  async getAnnouncement(announcementId: string) {
    try {
      console.log('📢 Getting announcement:', announcementId);

      const doc = await db
        .collection(collections.announcements)
        .doc(announcementId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return {
        id: doc.id,
        ...convertTimestamps(doc.data())
      };
    } catch (error) {
      console.error('❌ Error getting announcement:', error);
      throw error;
    }
  }

  async createAnnouncement(data: any) {
    try {
      console.log('📢 Creating announcement:', data);

      const now = FieldValue.serverTimestamp();
      const announcementData = {
        ...data,
        publishDate: data.publishDate ? Timestamp.fromDate(new Date(data.publishDate)) : now,
        expiryDate: data.expiryDate ? Timestamp.fromDate(new Date(data.expiryDate)) : null,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db
        .collection(collections.announcements)
        .add(announcementData);

      console.log('✅ Announcement created:', docRef.id);

      const createdDoc = await docRef.get();
      return {
        id: docRef.id,
        ...convertTimestamps(createdDoc.data())
      };
    } catch (error) {
      console.error('❌ Error creating announcement:', error);
      throw error;
    }
  }

  async updateAnnouncement(announcementId: string, data: any) {
    try {
      console.log('📢 Updating announcement:', announcementId);

      const updateData = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      };

      // Convert date fields if present
      if (data.publishDate) {
        updateData.publishDate = Timestamp.fromDate(new Date(data.publishDate));
      }
      if (data.expiryDate) {
        updateData.expiryDate = Timestamp.fromDate(new Date(data.expiryDate));
      }

      await db
        .collection(collections.announcements)
        .doc(announcementId)
        .update(updateData);

      console.log('✅ Announcement updated:', announcementId);

      const updatedDoc = await db
        .collection(collections.announcements)
        .doc(announcementId)
        .get();

      return {
        id: announcementId,
        ...convertTimestamps(updatedDoc.data())
      };
    } catch (error) {
      console.error('❌ Error updating announcement:', error);
      throw error;
    }
  }

  async deleteAnnouncement(announcementId: string) {
    try {
      console.log('📢 Deleting announcement:', announcementId);

      await db
        .collection(collections.announcements)
        .doc(announcementId)
        .delete();

      console.log('✅ Announcement deleted:', announcementId);
    } catch (error) {
      console.error('❌ Error deleting announcement:', error);
      throw error;
    }
  }

  async markAnnouncementAsRead(announcementId: string, userId: string) {
    try {
      console.log('📢 Marking announcement as read:', announcementId, 'by user:', userId);

      const docRef = db.collection(collections.announcements).doc(announcementId);

      // Use arrayUnion to add userId to readBy array (if not already present)
      await docRef.update({
        readBy: FieldValue.arrayUnion(userId),
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log('✅ Announcement marked as read');

      const updatedDoc = await docRef.get();
      return {
        id: announcementId,
        ...convertTimestamps(updatedDoc.data())
      };
    } catch (error) {
      console.error('❌ Error marking announcement as read:', error);
      throw error;
    }
  }

  // ===== FUND METHODS =====

  async getStrataFunds(strataId: string) {
    try {
      console.log('💰 Getting funds for strata:', strataId);

      // Note: Removed .orderBy() to avoid composite index requirement
      const snapshot = await db
        .collection(collections.funds)
        .where('strataId', '==', strataId)
        .get();

      // Sort client-side to avoid Firestore composite index requirement
      const funds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      }));

      funds.sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime; // Descending order (newest first)
      });

      console.log(`✅ Found ${funds.length} funds`);
      return funds;
    } catch (error) {
      console.error('❌ Error getting strata funds:', error);
      throw error;
    }
  }

  async createFund(data: any) {
    try {
      console.log('💰 Creating fund:', data);

      const now = FieldValue.serverTimestamp();
      const fundData = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await db
        .collection(collections.funds)
        .add(fundData);

      console.log('✅ Fund created:', docRef.id);

      const createdDoc = await docRef.get();
      return {
        id: docRef.id,
        ...convertTimestamps(createdDoc.data())
      };
    } catch (error) {
      console.error('❌ Error creating fund:', error);
      throw error;
    }
  }

  async updateFund(fundId: string, data: any) {
    try {
      console.log('💰 Updating fund:', fundId);

      const updateData = {
        ...data,
        updatedAt: FieldValue.serverTimestamp(),
      };

      await db
        .collection(collections.funds)
        .doc(fundId)
        .update(updateData);

      console.log('✅ Fund updated:', fundId);

      const updatedDoc = await db
        .collection(collections.funds)
        .doc(fundId)
        .get();

      return {
        id: fundId,
        ...convertTimestamps(updatedDoc.data())
      };
    } catch (error) {
      console.error('❌ Error updating fund:', error);
      throw error;
    }
  }

  async deleteFund(fundId: string) {
    try {
      console.log('💰 Deleting fund:', fundId);

      await db
        .collection(collections.funds)
        .doc(fundId)
        .delete();

      console.log('✅ Fund deleted:', fundId);
    } catch (error) {
      console.error('❌ Error deleting fund:', error);
      throw error;
    }
  }

  async createFundTransaction(data: any) {
    try {
      console.log('💰 Creating fund transaction:', data);

      const now = FieldValue.serverTimestamp();
      const transactionData = {
        ...data,
        createdAt: now,
      };

      // Create the transaction document in a subcollection
      const fundRef = db.collection(collections.funds).doc(data.fundId);
      const transactionRef = await fundRef.collection('transactions').add(transactionData);

      console.log('✅ Fund transaction created:', transactionRef.id);

      const createdDoc = await transactionRef.get();
      return {
        id: transactionRef.id,
        ...convertTimestamps(createdDoc.data())
      };
    } catch (error) {
      console.error('❌ Error creating fund transaction:', error);
      throw error;
    }
  }
  // ===== PAYMENT REMINDER METHODS =====

  async getStrataPaymentReminders(strataId: string): Promise<any[]> {
    try {
      // Note: Removed .orderBy() to avoid composite index requirement
      const snapshot = await db
        .collection('paymentReminders')
        .where('strataId', '==', strataId)
        .get();

      // Sort client-side to avoid Firestore composite index requirement
      const reminders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      }));

      reminders.sort((a: any, b: any) => {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime; // Descending order (newest first)
      });

      return reminders;
    } catch (error) {
      console.error('Error fetching payment reminders:', error);
      return [];
    }
  }

  async createPaymentReminder(reminderData: any): Promise<any> {
    try {
      const docRef = await db.collection('paymentReminders').add({
        ...reminderData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      const doc = await docRef.get();
      return { id: doc.id, ...convertTimestamps(doc.data()) };
    } catch (error) {
      console.error('Error creating payment reminder:', error);
      throw error;
    }
  }

  async updatePaymentReminder(reminderId: string, updateData: any): Promise<any> {
    try {
      const docRef = db.collection('paymentReminders').doc(reminderId);

      await docRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      if (!updated.exists) {
        throw new Error('Payment reminder not found after update');
      }

      return { id: updated.id, ...convertTimestamps(updated.data()) };
    } catch (error) {
      console.error('Error updating payment reminder:', error);
      throw error;
    }
  }

  async deletePaymentReminder(reminderId: string): Promise<void> {
    try {
      await db.collection('paymentReminders').doc(reminderId).delete();
    } catch (error) {
      console.error('Error deleting payment reminder:', error);
      throw error;
    }
  }

  // ===== VENDOR CONTRACT METHODS =====

  async getVendorContracts(vendorId: string): Promise<any[]> {
    try {
      const snapshot = await db
        .collection('vendorContracts')
        .where('vendorId', '==', vendorId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching vendor contracts:', error);
      return [];
    }
  }

  async createVendorContract(contractData: any): Promise<any> {
    try {
      const docRef = await db.collection('vendorContracts').add({
        ...contractData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      const doc = await docRef.get();
      return { id: doc.id, ...convertTimestamps(doc.data()) };
    } catch (error) {
      console.error('Error creating vendor contract:', error);
      throw error;
    }
  }

  async updateVendorContract(contractId: string, updateData: any): Promise<any> {
    try {
      const docRef = db.collection('vendorContracts').doc(contractId);

      await docRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      if (!updated.exists) {
        throw new Error('Vendor contract not found after update');
      }

      return { id: updated.id, ...convertTimestamps(updated.data()) };
    } catch (error) {
      console.error('Error updating vendor contract:', error);
      throw error;
    }
  }

  async deleteVendorContract(contractId: string): Promise<void> {
    try {
      await db.collection('vendorContracts').doc(contractId).delete();
    } catch (error) {
      console.error('Error deleting vendor contract:', error);
      throw error;
    }
  }

  // ===== VENDOR HISTORY METHODS =====

  async getVendorHistory(vendorId: string): Promise<any[]> {
    try {
      const snapshot = await db
        .collection('vendorHistory')
        .where('vendorId', '==', vendorId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching vendor history:', error);
      return [];
    }
  }

  async createVendorHistory(historyData: any): Promise<any> {
    try {
      const docRef = await db.collection('vendorHistory').add({
        ...historyData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      const doc = await docRef.get();
      return { id: doc.id, ...convertTimestamps(doc.data()) };
    } catch (error) {
      console.error('Error creating vendor history:', error);
      throw error;
    }
  }

  async updateVendorHistory(historyId: string, updateData: any): Promise<any> {
    try {
      const docRef = db.collection('vendorHistory').doc(historyId);

      await docRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      if (!updated.exists) {
        throw new Error('Vendor history not found after update');
      }

      return { id: updated.id, ...convertTimestamps(updated.data()) };
    } catch (error) {
      console.error('Error updating vendor history:', error);
      throw error;
    }
  }

  async deleteVendorHistory(historyId: string): Promise<void> {
    try {
      await db.collection('vendorHistory').doc(historyId).delete();
    } catch (error) {
      console.error('Error deleting vendor history:', error);
      throw error;
    }
  }

  // ===== USER STRATA ACCESS METHODS =====

  async updateUserStrataAccess(accessId: string, updateData: any): Promise<any> {
    try {
      const docRef = db.collection('userStrataAccess').doc(accessId);

      await docRef.update({
        ...updateData,
        updatedAt: FieldValue.serverTimestamp()
      });

      const updated = await docRef.get();
      if (!updated.exists) {
        throw new Error('User strata access not found after update');
      }

      return { id: updated.id, ...convertTimestamps(updated.data()) };
    } catch (error) {
      console.error('Error updating user strata access:', error);
      throw error;
    }
  }

  // ===== PENDING REGISTRATION METHODS =====

  async createPendingRegistration(registrationData: any): Promise<any> {
    try {
      const docRef = await db.collection('pendingRegistrations').add({
        ...registrationData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      const doc = await docRef.get();
      return { id: doc.id, ...convertTimestamps(doc.data()) };
    } catch (error) {
      console.error('Error creating pending registration:', error);
      throw error;
    }
  }

  // ===== RESIDENT DIRECTORY METHODS =====

  async getStrataResidentDirectory(strataId: string): Promise<any[]> {
    try {
      console.log(`📋 Getting resident directory for strata ${strataId}`);

      const snapshot = await db
        .collection('residentDirectory')
        .where('strataId', '==', strataId)
        .where('showInDirectory', '==', true)
        .get();

      const directory = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));

      console.log(`✅ Found ${directory.length} resident directory entries`);
      return directory;
    } catch (error) {
      console.error('❌ Error getting resident directory:', error);
      throw error;
    }
  }

  async createResidentDirectoryEntry(entryData: any): Promise<any> {
    try {
      const docRef = await db.collection('residentDirectory').add({
        ...entryData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      const doc = await docRef.get();
      console.log(`📋 Created resident directory entry for user ${entryData.userId}`);
      return { id: doc.id, ...convertTimestamps(doc.data()) };
    } catch (error) {
      console.error('❌ Error creating resident directory entry:', error);
      throw error;
    }
  }

  async updateResidentDirectoryEntry(id: string, updates: any): Promise<any> {
    try {
      const updateData = {
        ...updates,
        updatedAt: FieldValue.serverTimestamp()
      };

      await db.collection('residentDirectory').doc(id).update(updateData);

      const updatedDoc = await db.collection('residentDirectory').doc(id).get();
      if (!updatedDoc.exists) {
        throw new Error('Resident directory entry not found');
      }

      console.log(`📋 Updated resident directory entry ${id}`);
      return { id: updatedDoc.id, ...convertTimestamps(updatedDoc.data()) };
    } catch (error) {
      console.error('❌ Error updating resident directory entry:', error);
      throw error;
    }
  }

  // ========================================
  // Repair Requests
  // ========================================

  async getRepairRequests(strataId: string, filters?: {
    status?: string;
    severity?: string;
    area?: string;
    submittedBy?: string;
  }): Promise<any[]> {
    try {
      console.log(`🔧 Fetching repair requests for strata ${strataId}`);

      let query: any = db.collection('repairRequests').where('strataId', '==', strataId);

      if (filters?.status) {
        query = query.where('status', '==', filters.status);
      }
      if (filters?.severity) {
        query = query.where('severity', '==', filters.severity);
      }
      if (filters?.area) {
        query = query.where('area', '==', filters.area);
      }
      if (filters?.submittedBy) {
        query = query.where('submittedBy.userId', '==', filters.submittedBy);
      }

      const snapshot = await query.get();
      const requests = snapshot.docs.map((doc: any) => convertTimestamps({ id: doc.id, ...doc.data() }));

      // Sort by createdAt descending (most recent first) in memory to avoid index requirement
      requests.sort((a, b) => {
        const aTime = a.createdAt?._seconds || a.createdAt?.seconds || 0;
        const bTime = b.createdAt?._seconds || b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      console.log(`✅ Found ${requests.length} repair requests`);
      return requests;
    } catch (error) {
      console.error('❌ Error fetching repair requests:', error);
      throw error;
    }
  }

  async getRepairRequest(id: string): Promise<any | null> {
    try {
      const doc = await db.collection('repairRequests').doc(id).get();

      if (!doc.exists) {
        return null;
      }

      return convertTimestamps({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error(`❌ Error fetching repair request ${id}:`, error);
      throw error;
    }
  }

  async createRepairRequest(requestData: any): Promise<any> {
    try {
      console.log(`🔧 Creating repair request for strata ${requestData.strataId}`);

      const now = Timestamp.now();

      const docRef = await db.collection('repairRequests').add({
        ...requestData,
        status: 'suggested',
        statusHistory: [{
          status: 'suggested',
          changedBy: requestData.submittedBy.userId,
          changedAt: now,
        }],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const doc = await docRef.get();
      const newRequest = { id: doc.id, ...convertTimestamps(doc.data()) };

      console.log(`✅ Created repair request ${doc.id}`);
      return newRequest;
    } catch (error) {
      console.error('❌ Error creating repair request:', error);
      throw error;
    }
  }

  async updateRepairRequest(id: string, updates: any, userId: string): Promise<any> {
    try {
      console.log(`🔧 Updating repair request ${id}`);

      const updateData: any = {
        ...updates,
        updatedAt: FieldValue.serverTimestamp()
      };

      // If status is changing, add to status history
      if (updates.status) {
        const currentDoc = await db.collection('repairRequests').doc(id).get();
        const currentData = currentDoc.data();

        if (currentData && currentData.status !== updates.status) {
          const now = Timestamp.now();
          updateData.statusHistory = FieldValue.arrayUnion({
            status: updates.status,
            changedBy: userId,
            changedAt: now,
            reason: updates.statusChangeReason || undefined
          });

          // Add timestamp fields for specific statuses
          if (updates.status === 'approved') {
            updateData.approvedBy = userId;
            updateData.approvedAt = FieldValue.serverTimestamp();
          } else if (updates.status === 'rejected') {
            updateData.rejectedBy = userId;
            updateData.rejectedAt = FieldValue.serverTimestamp();
          } else if (updates.status === 'completed') {
            updateData.completedDate = FieldValue.serverTimestamp();
          }
        }

        // Remove the temporary field
        delete updateData.statusChangeReason;
      }

      await db.collection('repairRequests').doc(id).update(updateData);

      const updatedDoc = await db.collection('repairRequests').doc(id).get();
      if (!updatedDoc.exists) {
        throw new Error('Repair request not found');
      }

      const updatedRequest = { id: updatedDoc.id, ...convertTimestamps(updatedDoc.data()) };
      console.log(`✅ Updated repair request ${id}`);

      return updatedRequest;
    } catch (error) {
      console.error(`❌ Error updating repair request ${id}:`, error);
      throw error;
    }
  }

  async deleteRepairRequest(id: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting repair request ${id}`);
      await db.collection('repairRequests').doc(id).delete();
      console.log(`✅ Deleted repair request ${id}`);
    } catch (error) {
      console.error(`❌ Error deleting repair request ${id}:`, error);
      throw error;
    }
  }

  async getRepairRequestStats(strataId: string): Promise<any> {
    try {
      console.log(`📊 Getting repair request stats for strata ${strataId}`);

      const snapshot = await db.collection('repairRequests')
        .where('strataId', '==', strataId)
        .get();

      const requests = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

      const stats = {
        total: requests.length,
        suggested: requests.filter((r: any) => r.status === 'suggested').length,
        approved: requests.filter((r: any) => r.status === 'approved').length,
        planned: requests.filter((r: any) => r.status === 'planned').length,
        scheduled: requests.filter((r: any) => r.status === 'scheduled').length,
        inProgress: requests.filter((r: any) => r.status === 'in-progress').length,
        completed: requests.filter((r: any) => r.status === 'completed').length,
        rejected: requests.filter((r: any) => r.status === 'rejected').length,
        emergency: requests.filter((r: any) => r.severity === 'emergency').length,
        high: requests.filter((r: any) => r.severity === 'high').length,
        totalEstimatedCost: requests.reduce((sum: number, r: any) => sum + (r.estimatedCost || 0), 0),
        totalActualCost: requests.reduce((sum: number, r: any) => sum + (r.actualCost || 0), 0),
      };

      console.log(`✅ Generated repair request stats`);
      return stats;
    } catch (error) {
      console.error('❌ Error getting repair request stats:', error);
      throw error;
    }
  }
}

export const firebaseStorage = new FirebaseStorage();