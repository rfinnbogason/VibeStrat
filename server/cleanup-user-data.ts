import { db } from './firebase-db';

async function cleanupUserData(userId: string) {
  try {
    console.log(`🔍 Cleaning up Firestore data for user: ${userId}`);

    // Delete user profile
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.delete();
      console.log(`✅ Deleted user profile`);
    } else {
      console.log(`ℹ️  No user profile found`);
    }

    // Delete user strata access records
    const accessSnapshot = await db.collection('userStrataAccess')
      .where('userId', '==', userId)
      .get();

    if (!accessSnapshot.empty) {
      const batch = db.batch();
      accessSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      console.log(`✅ Deleted ${accessSnapshot.size} strata access record(s)`);
    } else {
      console.log(`ℹ️  No strata access records found`);
    }

    console.log(`✅ Cleanup complete!`);
    process.exit(0);
  } catch (error: any) {
    console.error(`❌ Error cleaning up user data:`, error);
    process.exit(1);
  }
}

// Get userId from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a user ID');
  console.log('Usage: npx tsx server/cleanup-user-data.ts <userId>');
  process.exit(1);
}

cleanupUserData(userId);
