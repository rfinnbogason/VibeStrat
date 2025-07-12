import { db, collections, convertTimestamp, convertTimestamps, createDocumentId } from './firebase-db';
import { FieldValue } from 'firebase-admin/firestore';
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
  
  async getAllStrata(): Promise<any[]> {
    try {
      // Try Firebase first
      const snapshot = await db.collection('strata').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Firebase connection failed:', error.message);
      throw error;
    }
  }

  async getUserStrata(userId: string): Promise<any[]> {
    try {
      // Try Firebase first
      const accessSnapshot = await db.collection('userStrataAccess')
        .where('userId', '==', userId)
        .get();
      
      const strataIds = accessSnapshot.docs.map(doc => doc.data().strataId);
      
      if (strataIds.length === 0) {
        return [];
      }
      
      const strataPromises = strataIds.map(id => 
        db.collection('strata').doc(id).get()
      );
      
      const strataSnapshots = await Promise.all(strataPromises);
      return strataSnapshots
        .filter(snap => snap.exists)
        .map(snap => ({ id: snap.id, ...snap.data() }));
    } catch (error) {
      console.error('Firebase connection failed:', error.message);
      throw error;
    }
  }

  async getStrataExpenses(strataId: string): Promise<any[]> {
    try {
      const snapshot = await db.collection('expenses')
        .where('strataId', '==', strataId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  async updateUser(userId: string, updates: any): Promise<void> {
    try {
      await db.collection('users').doc(userId).update({
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user:', error);
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
    const id = createDocumentId();
    const now = FieldValue.serverTimestamp();
    
    const docData = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.collection(collections.users).doc(id).set(docData);
    
    return {
      ...userData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    const id = createDocumentId();
    const now = FieldValue.serverTimestamp();
    
    const docData = {
      ...strataData,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.collection(collections.strata).doc(id).set(docData);
    
    return {
      ...strataData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
    const id = createDocumentId();
    const now = FieldValue.serverTimestamp();
    
    const docData = {
      ...accessData,
      createdAt: now,
    };
    
    await db.collection(collections.userStrataAccess).doc(id).set(docData);
    
    return {
      ...accessData,
      id,
      createdAt: new Date().toISOString(),
    } as UserStrataAccess;
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

  async deleteUnit(unitId: string): Promise<void> {
    try {
      await db.collection(collections.units).doc(unitId).delete();
      console.log(`🗑️ Deleted unit ${unitId}`);
    } catch (error) {
      console.error('❌ Error deleting unit:', error);
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
      
      // Get ALL messages first to test
      const snapshot = await db.collection('messages').get();
      
      console.log('🔍 Firebase getMessagesByStrata - found ALL docs:', snapshot.docs.length);
      
      const allMessages = snapshot.docs.map(doc => {
        const data = convertTimestamps({ id: doc.id, ...doc.data() });
        console.log('🔍 Firebase message data:', JSON.stringify(data, null, 2));
        return data;
      });
      
      // Filter by strata in memory
      const strataMessages = allMessages.filter(msg => msg.strataId === strataId);
      console.log('🔍 Firebase filtered messages for strata:', strataMessages.length);
      
      // Sort in memory
      return strataMessages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

  async markMessageAsRead(messageId: string): Promise<Message> {
    try {
      await db.collection('messages').doc(messageId).update({
        isRead: true,
        readAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });
      
      const doc = await db.collection('messages').doc(messageId).get();
      if (!doc.exists) {
        throw new Error('Message not found');
      }
      
      return convertTimestamps({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
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
      return convertTimestamps({ id: doc.id, ...doc.data() });
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
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
}

export const firebaseStorage = new FirebaseStorage();