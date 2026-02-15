import { auth, db } from './firebase-db';

/**
 * Complete user deletion script that handles both Firebase Auth and Firestore data
 * Usage: npx tsx server/delete-user-complete.ts <email>
 */
async function deleteUserComplete(email: string) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    // Step 1: Get user from Firebase Auth
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log(`✅ Found user in Firebase Auth: ${userRecord.uid}`);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        console.log(`ℹ️  No user found in Firebase Auth with email: ${email}`);
        console.log(`🔍 Checking Firestore for orphaned data...`);

        // Try to find orphaned Firestore data by email
        const userSnapshot = await db.collection('users')
          .where('email', '==', email)
          .get();

        if (!userSnapshot.empty) {
          const userId = userSnapshot.docs[0].id;
          console.log(`⚠️  Found orphaned Firestore data for user: ${userId}`);
          await cleanupFirestoreData(userId, email);
          console.log(`✅ Cleanup complete!`);
          process.exit(0);
        } else {
          console.log(`❌ No user found with email: ${email} (neither in Auth nor Firestore)`);
          process.exit(1);
        }
      }
      throw error;
    }

    const userId = userRecord.uid;

    // Step 2: Clean up Firestore data
    await cleanupFirestoreData(userId, email);

    // Step 3: Delete from Firebase Auth
    await auth.deleteUser(userId);
    console.log(`✅ Deleted user from Firebase Auth: ${email}`);

    console.log(`\n🎉 User deletion complete!`);
    process.exit(0);
  } catch (error: any) {
    console.error(`❌ Error deleting user:`, error);
    process.exit(1);
  }
}

async function cleanupFirestoreData(userId: string, email: string) {
  console.log(`\n🧹 Cleaning up Firestore data for user: ${userId}`);

  // Delete user profile
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    await userRef.delete();
    console.log(`✅ Deleted user profile from Firestore`);
  } else {
    console.log(`ℹ️  No user profile found in Firestore`);
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

  // Delete notifications for this user
  const notificationsSnapshot = await db.collection('notifications')
    .where('userId', '==', userId)
    .get();

  if (!notificationsSnapshot.empty) {
    const batch = db.batch();
    notificationsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`✅ Deleted ${notificationsSnapshot.size} notification(s)`);
  }

  // Delete dismissed notifications for this user
  const dismissedSnapshot = await db.collection('dismissedNotifications')
    .where('userId', '==', userId)
    .get();

  if (!dismissedSnapshot.empty) {
    const batch = db.batch();
    dismissedSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`✅ Deleted ${dismissedSnapshot.size} dismissed notification(s)`);
  }

  console.log(`✅ Firestore cleanup complete!`);
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npx tsx server/delete-user-complete.ts <email>');
  console.log('Example: npx tsx server/delete-user-complete.ts user@example.com');
  process.exit(1);
}

deleteUserComplete(email);
