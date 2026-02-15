import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Initialize Firebase Admin SDK
let app;
if (getApps().length === 0) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS || './firebase-service-account.json';

  try {
    let serviceAccount;

    // Check if it's a JSON string or a file path
    if (serviceAccountPath.trim().startsWith('{')) {
      // It's a JSON string
      serviceAccount = JSON.parse(serviceAccountPath);
    } else {
      // It's a file path
      const fullPath = resolve(serviceAccountPath);
      console.log('📄 Reading Firebase credentials from:', fullPath);
      const fileContent = readFileSync(fullPath, 'utf-8');
      serviceAccount = JSON.parse(fileContent);
    }

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || 'vibestrat',
      storageBucket: `${serviceAccount.project_id || 'vibestrat'}.firebasestorage.app`,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
    throw new Error('Firebase initialization failed. Check your service account credentials.');
  }
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export { app };

// Configure Firestore to ignore undefined properties
db.settings({
  ignoreUndefinedProperties: true
});

// Firestore collection references
export const collections = {
  users: 'users',
  strata: 'strata',
  userStrataAccess: 'userStrataAccess',
  units: 'units',
  expenses: 'expenses',
  vendors: 'vendors',
  quotes: 'quotes',
  meetings: 'meetings',
  documents: 'documents',
  maintenanceRequests: 'maintenanceRequests',
  announcements: 'announcements',
  messages: 'messages',
  notifications: 'notifications',
  funds: 'funds',
  paymentReminders: 'paymentReminders',
  pendingRegistrations: 'pendingRegistrations'
};

// Helper function to convert Firestore timestamp to ISO string
export function convertTimestamp(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  if (timestamp.toDate) return timestamp.toDate().toISOString();
  if (timestamp instanceof Date) return timestamp.toISOString();
  return timestamp;
}

// Helper function to recursively convert all timestamp fields in an object
export function convertTimestamps(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (obj.toDate && typeof obj.toDate === 'function') {
    // This is a Firestore Timestamp
    return obj.toDate().toISOString();
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }
  
  const converted: any = {};
  for (const [key, value] of Object.entries(obj)) {
    converted[key] = convertTimestamps(value);
  }
  
  return converted;
}

// Helper function to create Firestore document with auto-generated ID
export function createDocumentId(): string {
  return db.collection('temp').doc().id;
}

// ====================================
// STRATA CRUD OPERATIONS
// ====================================

/**
 * Get a strata document by ID
 */
export async function getStrata(strataId: string) {
  const doc = await db.collection(collections.strata).doc(strataId).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data()
  };
}

/**
 * Update a strata document
 */
export async function updateStrata(strataId: string, data: any) {
  await db.collection(collections.strata).doc(strataId).update(data);
}