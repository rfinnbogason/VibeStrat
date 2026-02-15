import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
  runTransaction,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./firebase";
import { COLLECTIONS, type FirebaseStrata, type FirebaseUser, type FirebaseUserStrataAccess } from "@shared/firebase-types";

// Generic Firebase service class
export class FirebaseService {
  // Get a document by ID
  async getDocument<T>(collectionPath: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionPath, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionPath}:`, error);
      throw error;
    }
  }

  // Get multiple documents with optional filtering
  async getDocuments<T>(
    collectionPath: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      const collectionRef = collection(db, collectionPath);
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    } catch (error) {
      console.error(`Error getting documents from ${collectionPath}:`, error);
      throw error;
    }
  }

  // Create a new document
  async createDocument<T>(collectionPath: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const collectionRef = collection(db, collectionPath);
      const docData = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collectionRef, docData);
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionPath}:`, error);
      throw error;
    }
  }

  // Update an existing document
  async updateDocument<T>(
    collectionPath: string,
    docId: string,
    data: Partial<Omit<T, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionPath, docId);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error(`Error updating document in ${collectionPath}:`, error);
      throw error;
    }
  }

  // Delete a document
  async deleteDocument(collectionPath: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionPath, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document from ${collectionPath}:`, error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  subscribeToDocuments<T>(
    collectionPath: string,
    callback: (documents: T[]) => void,
    constraints: QueryConstraint[] = []
  ): () => void {
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, ...constraints);
    
    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      callback(documents);
    });
  }

  // Subscribe to a single document
  subscribeToDocument<T>(
    collectionPath: string,
    docId: string,
    callback: (document: T | null) => void
  ): () => void {
    const docRef = doc(db, collectionPath, docId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const document = { id: docSnap.id, ...docSnap.data() } as T;
        callback(document);
      } else {
        callback(null);
      }
    });
  }

  // Batch operations
  async batchWrite(operations: Array<{
    type: 'create' | 'update' | 'delete';
    collectionPath: string;
    docId?: string;
    data?: any;
  }>): Promise<void> {
    const batch = writeBatch(db);
    
    for (const operation of operations) {
      if (operation.type === 'create') {
        const docRef = doc(collection(db, operation.collectionPath));
        batch.set(docRef, {
          ...operation.data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else if (operation.type === 'update' && operation.docId) {
        const docRef = doc(db, operation.collectionPath, operation.docId);
        batch.update(docRef, {
          ...operation.data,
          updatedAt: serverTimestamp(),
        });
      } else if (operation.type === 'delete' && operation.docId) {
        const docRef = doc(db, operation.collectionPath, operation.docId);
        batch.delete(docRef);
      }
    }
    
    await batch.commit();
  }

  // Transaction operations
  async runTransaction<T>(
    updateFunction: (transaction: any) => Promise<T>
  ): Promise<T> {
    return runTransaction(db, updateFunction);
  }
}

// Specialized service classes for specific collections
export class StrataService extends FirebaseService {
  // Get all strata for a user
  async getUserStrata(userId: string): Promise<FirebaseStrata[]> {
    try {
      // First get all strata where user has access
      const userAccessDocs = await this.getDocuments<{ strataId: string }>(
        `${COLLECTIONS.USERS}/${userId}/strataAccess`
      );
      
      if (userAccessDocs.length === 0) return [];
      
      // Get the strata documents
      const strataPromises = userAccessDocs.map(access => 
        this.getDocument<FirebaseStrata>(COLLECTIONS.STRATA, access.strataId)
      );
      
      const strataResults = await Promise.all(strataPromises);
      return strataResults.filter(strata => strata !== null) as FirebaseStrata[];
    } catch (error) {
      console.error('Error getting user strata:', error);
      throw error;
    }
  }

  // Get user access for a specific strata
  async getUserStrataAccess(userId: string, strataId: string): Promise<FirebaseUserStrataAccess | null> {
    return this.getDocument<FirebaseUserStrataAccess>(
      `${COLLECTIONS.STRATA}/${strataId}/${COLLECTIONS.USER_ACCESS}`,
      userId
    );
  }

  // Grant user access to strata
  async grantUserAccess(
    strataId: string,
    userId: string,
    accessData: Omit<FirebaseUserStrataAccess, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    // Use the userId as the document ID for easy lookup
    const docRef = doc(db, COLLECTIONS.STRATA, strataId, COLLECTIONS.USER_ACCESS, userId);
    const data = {
      ...accessData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(docRef, data);
  }

  // Get strata units
  async getStrataUnits(strataId: string) {
    return this.getDocuments(
      `${COLLECTIONS.STRATA}/${strataId}/${COLLECTIONS.UNITS}`,
      [orderBy('unitNumber')]
    );
  }

  // Get strata expenses
  async getStrataExpenses(strataId: string) {
    return this.getDocuments(
      `${COLLECTIONS.STRATA}/${strataId}/${COLLECTIONS.EXPENSES}`,
      [orderBy('expenseDate', 'desc')]
    );
  }

  // Get strata quotes
  async getStrataQuotes(strataId: string) {
    return this.getDocuments(
      `${COLLECTIONS.STRATA}/${strataId}/${COLLECTIONS.QUOTES}`,
      [orderBy('createdAt', 'desc')]
    );
  }

  // Get strata meetings
  async getStrataMeetings(strataId: string) {
    return this.getDocuments(
      `${COLLECTIONS.STRATA}/${strataId}/${COLLECTIONS.MEETINGS}`,
      [orderBy('scheduledAt', 'desc')]
    );
  }

  // Subscribe to strata updates
  subscribeToStrata(strataId: string, callback: (strata: FirebaseStrata | null) => void) {
    return this.subscribeToDocument<FirebaseStrata>(COLLECTIONS.STRATA, strataId, callback);
  }

  // Subscribe to strata expenses
  subscribeToStrataExpenses(strataId: string, callback: (expenses: any[]) => void) {
    return this.subscribeToDocuments(
      `${COLLECTIONS.STRATA}/${strataId}/${COLLECTIONS.EXPENSES}`,
      callback,
      [orderBy('expenseDate', 'desc')]
    );
  }
}

export class UserService extends FirebaseService {
  // Get user by ID
  async getUser(userId: string): Promise<FirebaseUser | null> {
    return this.getDocument<FirebaseUser>(COLLECTIONS.USERS, userId);
  }

  // Update user profile
  async updateUser(userId: string, userData: Partial<FirebaseUser>): Promise<void> {
    return this.updateDocument<FirebaseUser>(COLLECTIONS.USERS, userId, userData);
  }

  // Get all users for admin
  async getAllUsers(): Promise<FirebaseUser[]> {
    return this.getDocuments<FirebaseUser>(COLLECTIONS.USERS, [orderBy('email')]);
  }
}

export class NotificationService extends FirebaseService {
  // Get user notifications for a strata
  async getUserNotifications(strataId: string, userId: string) {
    return this.getDocuments(
      `${COLLECTIONS.STRATA}/${strataId}/${COLLECTIONS.NOTIFICATIONS}`,
      [
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      ]
    );
  }

  // Mark notification as read
  async markNotificationAsRead(strataId: string, notificationId: string): Promise<void> {
    return this.updateDocument(
      `${COLLECTIONS.STRATA}/${strataId}/${COLLECTIONS.NOTIFICATIONS}`,
      notificationId,
      { isRead: true, readAt: serverTimestamp() }
    );
  }

  // Subscribe to user notifications
  subscribeToUserNotifications(
    strataId: string,
    userId: string,
    callback: (notifications: any[]) => void
  ) {
    return this.subscribeToDocuments(
      `${COLLECTIONS.STRATA}/${strataId}/${COLLECTIONS.NOTIFICATIONS}`,
      callback,
      [
        where('userId', '==', userId),
        where('isRead', '==', false),
        orderBy('createdAt', 'desc')
      ]
    );
  }
}

// Export service instances
export const firebaseService = new FirebaseService();
export const strataService = new StrataService();
export const userService = new UserService();
export const notificationService = new NotificationService();