import admin from 'firebase-admin';

// Initialize Firebase Admin SDK with minimal config
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'vibestrat',
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export default admin;