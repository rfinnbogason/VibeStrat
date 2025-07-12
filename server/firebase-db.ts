import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
let app;
if (getApps().length === 0) {
  const serviceAccountJson = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (!serviceAccountJson) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is required');
  }

  try {
    // Parse the JSON credentials from environment variable
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || 'vibestrat',
      storageBucket: `${serviceAccount.project_id || 'vibestrat'}.firebasestorage.app`,
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to parse Firebase credentials:', error);
    throw new Error('Invalid Firebase credentials format');
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